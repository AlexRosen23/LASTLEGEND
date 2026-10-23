#!/usr/bin/env python3
"""Capture ESPN-reported ACTIVE TEAM ROSTER membership for every NBA/NFL/MLB/NHL franchise.
Not an assertion of official league registration, daily game eligibility or licensing.
Fail closed if a team is missing or the feed is anomalously small; never publish partial data.
Usage: python tools/sync_active_rosters_v24.py --output data/active_rosters_v24.json
"""
from __future__ import annotations
import argparse, datetime as dt, json, pathlib, random, time, urllib.error, urllib.request

API="https://site.api.espn.com/apis/site/v2/sports"
LEAGUES={
    "NBA":("basketball","nba",30,400),
    "NFL":("football","nfl",32,1400),
    "MLB":("baseball","mlb",30,700),
    "NHL":("hockey","nhl",32,600),
}
HEADERS={"User-Agent":"LastLegendRosterAuditor/24.0 (+https://github.com/AlexRosen23/LASTLEGEND)","Accept":"application/json"}
def get_json(url:str,tries:int=4):
    for attempt in range(tries):
        try:
            req=urllib.request.Request(url,headers=HEADERS)
            with urllib.request.urlopen(req,timeout=25) as response:
                if response.status!=200:raise ValueError(f"HTTP {response.status}: {url}")
                return json.load(response)
        except (urllib.error.URLError,TimeoutError,ValueError,json.JSONDecodeError) as exc:
            if attempt==tries-1:raise RuntimeError(f"Could not retrieve {url}: {exc}") from exc
            time.sleep(min(16,1.4**(attempt+1)))
def team_directory(sport,league):
    info=get_json(f"{API}/{sport}/{league}/teams?limit=100")
    sports=info.get("sports") or []
    leagues=[l for s in sports for l in s.get("leagues",[]) if l.get("slug")==league]
    if not leagues:raise ValueError(f"Missing {league} directory")
    return leagues[0]
def group_athletes(groups):
    for group in groups:
        if not isinstance(group,dict):continue
        if group.get("id") and (group.get("fullName") or group.get("displayName")):
            yield group
        for player in group.get("items") or []:
            if isinstance(player,dict) and player.get("id"):yield player
def roster_entry(player,team,league,season):
    status=player.get("status") or {}
    if isinstance(status,str):status={"type":status}
    position=player.get("position") or {}
    if isinstance(position,str):position={"name":position}
    links=player.get("links") or []
    card=next((link.get("href") for link in links if "playercard" in (link.get("rel") or []) and str(link.get("href","")).startswith("https://www.espn.com")),None)
    jersey=player.get("jersey")
    return {
        "id":str(player["id"]),
        "name":player.get("fullName") or player.get("displayName"),
        "teamId":str(team["id"]),
        "team":team.get("displayName"),
        "abbr":team.get("abbreviation"),
        "position":position.get("displayName") or position.get("name") or "Unspecified",
        "status":status.get("type") or status.get("name") or "unspecified",
        "jersey":str(jersey) if jersey not in (None,"") else None,
        "url":card,
        "season":str(season),
    }
def capture(now:str,delay:float):
    result={"version":24,"generatedAt":now,"provider":"ESPN public site-v2 team-roster feeds",
        "definition":"All named players ESPN lists on each of the 124 current NBA, NFL, MLB, NHL franchise rosters (including injured/inactive designations); not independent official league verification",
        "leagues":{}}
    for code,(sport,league,expected,min_players) in LEAGUES.items():
        directory=team_directory(sport,league)
        raw=[entry.get("team",{}) for entry in directory.get("teams",[]) if entry.get("team",{}).get("isActive",True)]
        teams={str(t["id"]):t for t in raw if t.get("id") and t.get("displayName") and not t.get("isAllStar")}
        if len(teams)!=expected:raise ValueError(f"{code}: expected {expected} teams, got {len(teams)}: {list(teams)}")
        athletes={};failures=[];counts={}
        for i,(team_id,team) in enumerate(sorted(teams.items(),key=lambda pair:pair[1]["displayName"])):
            url=f"{API}/{sport}/{league}/teams/{team_id}/roster"
            payload=get_json(url)
            grouped=list(group_athletes(payload.get("athletes") or []))
            season=(payload.get("season") or {}).get("displayName") or directory.get("season",{}).get("displayName","Unspecified")
            unique={}
            for p in grouped:
                item=roster_entry(p,team,code,season)
                if not item["name"]:continue
                unique[item["id"]]=item
            if len(unique)<(12 if code in ("NBA","NHL") else 26):
                failures.append(f"{code}:{team.get('displayName')}:only {len(unique)} athletes")
            counts[team_id]=len(unique)
            for person_id,item in unique.items():
                # ESPN IDs are league-scoped. Same person appearing twice is retained once
                # with all team entries for source reconciliation.
                record=athletes.setdefault(person_id,{"id":person_id,"name":item["name"],"memberships":[]})
                record["memberships"].append({k:v for k,v in item.items() if k not in ("id","name")})
            print(f"{code:3}  {i+1:2}/{expected} {team.get('displayName'):32} {len(unique):3}",flush=True)
            time.sleep(delay)
        if failures:raise ValueError("Failed closed on suspicious team lists: "+"; ".join(failures))
        if len(athletes)<min_players:raise ValueError(f"{code} too few unique athletes: {len(athletes)} < {min_players}")
        result["leagues"][code]={
            "season":directory.get("season",{}).get("displayName"),
            "teamCount":len(teams),
            "playerCount":len(athletes),
            "teams":[{"id":t["id"],"name":t["displayName"],"abbr":t.get("abbreviation"),"rosterCount":counts[id]} for id,t in sorted(teams.items(),key=lambda pair:pair[1]["displayName"])],
            "players":sorted(athletes.values(),key=lambda p:(p["name"].casefold(),p["id"])),
            "sourceTemplate":f"{API}/{sport}/{league}/teams/{{team_id}}/roster",
        }
    return result
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",default="data/active_rosters_v24.json")
    parser.add_argument("--delay",type=float,default=.4)
    args=parser.parse_args()
    now=dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00","Z")
    result=capture(now,max(0,args.delay))
    file=pathlib.Path(args.output);file.parent.mkdir(parents=True,exist_ok=True)
    serialized=json.dumps(result,separators=(",",":"),ensure_ascii=False)
    assert all(result["leagues"][x]["teamCount"]==e[2] for x,e in LEAGUES.items())
    assert len(serialized)>100_000
    tmp=file.with_suffix(file.suffix+".tmp");tmp.write_text(serialized,encoding="utf-8");tmp.replace(file)
    print("SUCCESS:",{k:(v["teamCount"],v["playerCount"]) for k,v in result["leagues"].items()},"bytes",len(serialized))
if __name__=="__main__":main()
