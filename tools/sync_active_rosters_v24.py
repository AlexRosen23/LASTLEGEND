#!/usr/bin/env python3
"""Capture ESPN-reported ACTIVE TEAM ROSTER membership for every NBA/NFL/MLB/NHL franchise.
Not an assertion of official league registration, daily game eligibility or licensing.
Fail closed if a team is missing or the feed is anomalously small; never publish partial data.
Usage: python tools/sync_active_rosters_v24.py --output data/active_rosters_v24.json
"""
from __future__ import annotations
import argparse, datetime as dt, json, pathlib, re, time, urllib.error, urllib.request

API="https://site.api.espn.com/apis/site/v2/sports"
LEAGUES={
    "NBA":("basketball","nba",30,400),
    "NFL":("football","nfl",32,1400),
    "MLB":("baseball","mlb",30,700),
    "NHL":("hockey","nhl",32,600),
}
# Per-team roster floors. In season a short list means a truncated or wrong feed.
TEAM_FLOOR={"NBA":12,"NFL":26,"MLB":26,"NHL":12}
# MLB has no 26-man active roster between the World Series and spring training.
# ESPN can keep a World Series club on its postseason 26-man list and drop the
# players who file for free agency before it switches that club to the 40-man
# roster (2026: Milwaukee went 26 -> 20 the day after the Series). Off-season
# lists may be shorter, but only a few clubs at once and never a collapsed feed.
OFFSEASON={
    # league: ((start month, day), (end month, day), team floor, max clubs under the in-season floor)
    "MLB":((10,20),(2,18),15,4),
}
ESPN_OFFSEASON_TYPE=4
def is_offseason(code:str,today:dt.date,season_type=None)->bool:
    """True in the league's off-season window, or when ESPN itself says Off Season."""
    window=OFFSEASON.get(code)
    if window is None:return False
    if season_type==ESPN_OFFSEASON_TYPE:return True
    (sm,sd),(em,ed),_,_=window
    key=(today.month,today.day)
    if (sm,sd)>(em,ed):  # window wraps over New Year
        return key>=(sm,sd) or key<=(em,ed)
    return (sm,sd)<=key<=(em,ed)
def roster_size_failures(code:str,counts:dict,offseason:bool):
    """Return (failures, notices) for per-team roster sizes, keyed by team name."""
    floor=TEAM_FLOOR[code]
    short={team:n for team,n in counts.items() if n<floor}
    if not offseason:
        return [f"{code}:{team}:only {n} athletes" for team,n in short.items()],[]
    _,_,off_floor,max_short=OFFSEASON[code]
    failures=[f"{code}:{team}:only {n} athletes (off-season floor {off_floor})" for team,n in short.items() if n<off_floor]
    if len(short)>max_short:
        failures.append(f"{code}:{len(short)} clubs under {floor} athletes (off-season allows {max_short})")
    sizes=sorted(counts.values())
    median=sizes[len(sizes)//2] if sizes else 0
    if median<floor:
        failures.append(f"{code}:median roster {median} < {floor}")
    notices=[f"{code} off-season: {team} lists {n} athletes (in-season floor {floor})" for team,n in short.items() if n>=off_floor]
    return failures,notices
HEADERS={"User-Agent":"LastLegendRosterAuditor/26.0 (+https://github.com/AlexRosen23/LASTLEGEND)","Accept":"application/json"}
def get_json(url:str,tries:int=4,timeout:float=25):
    for attempt in range(tries):
        try:
            req=urllib.request.Request(url,headers=HEADERS)
            with urllib.request.urlopen(req,timeout=timeout) as response:
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
def physical_number(value,low:int,high:int):
    """Only copy plausible ESPN measurements; don't infer missing player data."""
    try:
        number=float(value)
        if number.is_integer() and low<=number<=high:
            return int(number)
    except (TypeError,ValueError,OverflowError,AttributeError):
        pass
    return None

def physical_measurements(athlete:dict):
    height=physical_number(athlete.get("height"),48,100)
    weight=physical_number(athlete.get("weight"),75,550)
    if height is None:
        # ESPN sometimes provides a display height without the numeric version.
        label=str(athlete.get("displayHeight") or "")
        match=re.fullmatch(r"\s*(\d)\s*(?:'|ft)\s*(\d{1,2})\s*(?:\"|in)?\s*",label,re.I)
        if match:
            height=physical_number(12*int(match.group(1))+int(match.group(2)),48,100)
    if weight is None:
        label=str(athlete.get("displayWeight") or "")
        match=re.fullmatch(r"\s*(\d{2,3})\s*(?:lbs?\.?|pounds?)?\s*",label,re.I)
        if match:
            weight=physical_number(match.group(1),75,550)
    return height,weight

def valid_jersey(value):
    if value is None:return None
    label=str(value).strip()
    # '0' and '00' are legitimate; unknown or non-numeric labels aren't guessed.
    if re.fullmatch(r"(?:00|0|[1-9][0-9]?)",label):return label
    return None

def enrich_missing_jersey(item:dict,sport:str,league:str,delay:float):
    """Try an ESPN athlete card for a missing number, but only if its team ID matches.
    An old-team athlete number is worse than an explicit blank.
    """
    if item["jersey"] is not None:return False
    url=f"https://site.web.api.espn.com/apis/common/v3/sports/{sport}/{league}/athletes/{item['id']}"
    try:
        source=get_json(url,tries=1,timeout=7)
    except (RuntimeError,ValueError) as exc:
        print(f"SECONDARY SOURCE UNAVAILABLE {league}:{item['id']}: {exc}",flush=True)
        return False
    person=source.get("athlete") or source.get("player") or source
    if not isinstance(person,dict):return False
    listed_team=person.get("team") or {}
    if not isinstance(listed_team,dict):return False
    if str(listed_team.get("id") or "")!=item["teamId"]:
        return False
    value=valid_jersey(person.get("jersey"))
    if value is not None:
        item["jersey"]=value
        item["jerseySource"]="ESPN matching-team athlete profile"
    h,w=physical_measurements(person)
    if item["heightInches"] is None and h is not None:item["heightInches"]=h
    if item["weightLbs"] is None and w is not None:item["weightLbs"]=w
    time.sleep(min(delay,.1))
    return value is not None

def official_number_overrides(now:str):
    """Allow narrowly verified official-team jersey numbers, expiring after 30 days.
    These cannot overwrite ESPN's directly reported current-team jersey.
    """
    path=pathlib.Path(__file__).resolve().parents[1]/"data"/"verified_jersey_v26.json"
    if not path.exists():return {}
    source=json.loads(path.read_text(encoding="utf-8"))
    if source.get("version")!=1:raise ValueError("Unknown official jersey override schema")
    as_of=dt.date.fromisoformat(source["verifiedAt"])
    age=(dt.date.fromisoformat(now[:10])-as_of).days
    max_age=int(source.get("maxAgeDays",30))
    if not (0<=age<=max_age):
        print(f"OFFICIAL JERSEY SOURCES EXPIRED: {source['verifiedAt']}",flush=True)
        return {}
    out={}
    for entry in source.get("entries",[]):
        key=(str(entry["league"]),str(entry["playerId"]),str(entry["teamId"]))
        jersey=valid_jersey(entry["jersey"])
        link=str(entry["source"])
        if not jersey or not link.startswith("https://") or key in out:
            raise ValueError("Invalid/duplicate official jersey evidence")
        out[key]=entry
    return out

def roster_entry(player,team,league,season):
    status=player.get("status") or {}
    if isinstance(status,str):status={"type":status}
    position=player.get("position") or {}
    if isinstance(position,str):position={"name":position}
    links=player.get("links") or []
    card=next((link.get("href") for link in links if "playercard" in (link.get("rel") or []) and str(link.get("href","")).startswith("https://www.espn.com")),None)
    jersey=valid_jersey(player.get("jersey"))
    height,weight=physical_measurements(player)
    return {
        "id":str(player["id"]),
        "name":player.get("fullName") or player.get("displayName"),
        "teamId":str(team["id"]),
        "team":team.get("displayName"),
        "abbr":team.get("abbreviation"),
        "position":position.get("displayName") or position.get("name") or "Unspecified",
        "status":status.get("type") or status.get("name") or "unspecified",
        "jersey":jersey,
        "jerseySource":"ESPN team roster" if jersey is not None else None,
        "heightInches":height,
        "weightLbs":weight,
        "url":card,
        "season":str(season),
    }
def capture(now:str,delay:float):
    official_jerseys=official_number_overrides(now)
    result={"version":24,"generatedAt":now,"provider":"ESPN public site-v2 team-roster feeds + dated official-team jersey exceptions",
        "measurementUnits":{"heightInches":"in","weightLbs":"lb"},
        "definition":"All named players ESPN lists on each of the 124 current NBA, NFL, MLB, NHL franchise rosters (including injured/inactive designations); not independent official league verification",
        "leagues":{}}
    for code,(sport,league,expected,min_players) in LEAGUES.items():
        directory=team_directory(sport,league)
        raw=[entry.get("team",{}) for entry in directory.get("teams",[]) if entry.get("team",{}).get("isActive",True)]
        teams={str(t["id"]):t for t in raw if t.get("id") and t.get("displayName") and not t.get("isAllStar")}
        if len(teams)!=expected:raise ValueError(f"{code}: expected {expected} teams, got {len(teams)}: {list(teams)}")
        athletes={};counts={};sizes={};season_types=set();secondary_total=0;secondary_filled=0;official_filled=0
        for i,(team_id,team) in enumerate(sorted(teams.items(),key=lambda pair:pair[1]["displayName"])):
            url=f"{API}/{sport}/{league}/teams/{team_id}/roster"
            payload=get_json(url)
            grouped=list(group_athletes(payload.get("athletes") or []))
            season=(payload.get("season") or {}).get("displayName") or directory.get("season",{}).get("displayName","Unspecified")
            season_types.add((payload.get("season") or {}).get("type"))
            unique={}
            for p in grouped:
                item=roster_entry(p,team,code,season)
                if not item["name"]:continue
                unique[item["id"]]=item
            counts[team_id]=len(unique)
            sizes[team.get("displayName")]=len(unique)
            for person_id,item in unique.items():
                if item["jersey"] is None:
                    key=(code,person_id,team_id)
                    verified=official_jerseys.get(key)
                    if verified and verified["team"]==item["team"] and verified["name"]==item["name"]:
                        item["jersey"]=valid_jersey(verified["jersey"])
                        item["jerseySource"]=str(verified["source"])
                        official_filled+=1
                if item["jersey"] is None:
                    secondary_total+=1
                    if enrich_missing_jersey(item,sport,league,delay):secondary_filled+=1
            for person_id,item in unique.items():
                # ESPN IDs are league-scoped. Same person appearing twice is retained once
                # with all team entries for source reconciliation.
                record=athletes.setdefault(person_id,{"id":person_id,"name":item["name"],"memberships":[]})
                record["memberships"].append({k:v for k,v in item.items() if k not in ("id","name")})
            print(f"{code:3}  {i+1:2}/{expected} {team.get('displayName'):32} {len(unique):3}",flush=True)
            time.sleep(delay)
        offseason=is_offseason(code,dt.date.fromisoformat(now[:10]),ESPN_OFFSEASON_TYPE if season_types=={ESPN_OFFSEASON_TYPE} else None)
        failures,notices=roster_size_failures(code,sizes,offseason)
        for notice in notices:print("NOTICE",notice,flush=True)
        if failures:raise ValueError("Failed closed on suspicious team lists: "+"; ".join(failures))
        print(f"{code}: official-team jersey exceptions {official_filled}; secondary player-card lookups {secondary_total}; team-verified numbers found {secondary_filled}",flush=True)
        if len(athletes)<min_players:raise ValueError(f"{code} too few unique athletes: {len(athletes)} < {min_players}")
        result["leagues"][code]={
            "season":directory.get("season",{}).get("displayName"),
            "measurementUnits":{"heightInches":"in","weightLbs":"lb"},
            "missingJersey":sum(m["jersey"] is None for player in athletes.values() for m in player["memberships"]),
            "missingHeight":sum(m["heightInches"] is None for player in athletes.values() for m in player["memberships"]),
            "missingWeight":sum(m["weightLbs"] is None for player in athletes.values() for m in player["memberships"]),
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
