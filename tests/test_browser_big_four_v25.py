"""V25 browser integration: all Big Four snapshot entries must hydrate, search, profile and draft."""
from __future__ import annotations

import datetime as dt
import functools
import json
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LEAGUES = {
    "NBA": (30, 18, "Guard"),
    "NFL": (32, 59, "Quarterback"),
    "MLB": (30, 30, "Starting Pitcher"),
    "NHL": (32, 24, "Goaltender"),
}

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def fixture():
    data = {
        "version": 24,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "leagues": {},
    }
    for code, (team_count, players_each, position) in LEAGUES.items():
        teams, players = [], []
        for n in range(team_count):
            team_id = str(n + 1)
            name = f"{code} Audit Club {n + 1}"
            abbr = f"{code}{n + 1}"
            teams.append({"id": team_id, "name": name, "abbr": abbr, "rosterCount": players_each})
            for p in range(players_each):
                player_id = str(n * players_each + p + 1)
                players.append({
                    "id": player_id,
                    "name": f"Audit {code} Player {player_id}",
                    "memberships": [{
                        "teamId": team_id, "team": name, "abbr": abbr,
                        "position": position, "status": "active",
                        "jersey": str((p % 99) + 1), "season": "2026",
                        "url": f"https://www.espn.com/{code.lower()}/player/{player_id}",
                    }],
                })
        data["leagues"][code] = {
            "season": "2026", "teamCount": team_count,
            "playerCount": len(players), "teams": teams, "players": players,
        }
    return data

def run():
    snapshot = fixture()
    injected = sum(v["playerCount"] for v in snapshot["leagues"].values())
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            for width, height in ((1280, 900), (390, 844)):
                page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
                page.route("**/data/active_rosters_v24.json",
                           lambda route: route.fulfill(status=200, content_type="application/json",
                                                       body=json.dumps(snapshot)))
                failures = []
                page.on("pageerror", lambda error: failures.append(str(error)))
                origin = f"http://127.0.0.1:{server.server_port}/"
                page.goto(origin, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_function(
                    "(expected)=>typeof opts!=='undefined' && opts.athletes.length===expected",
                    arg=1652+injected, timeout=60000,
                )
                assert page.evaluate("LastLegendActiveRostersV24.status.lastReport.added") == {
                    code: count * each for code, (count, each, _) in LEAGUES.items()
                }
                assert page.evaluate("opts.athletes.filter(a=>a.collection_tags?.includes('ACTIVE_LEAGUES_V24')).length") == injected
                assert page.locator("#collection-filter option[value='ACTIVE_NBA_V24']").count() == 1
                page.goto(origin + "#/legends", wait_until="domcontentloaded", timeout=60000)
                page.wait_for_function(
                    "(expected)=>typeof opts!=='undefined' && opts.athletes.length===expected && LastLegendWebsite.shell.route==='legends'",
                    arg=1652+injected, timeout=60000,
                )
                page.locator("#site-legend-search").fill("Audit NBA Player 1")
                profile = page.locator('[data-site-profile="active-nba-1"]')
                profile.wait_for(timeout=30000)
                profile.locator(".v11-show-stats").click()
                assert page.locator("#site-profile-dialog").evaluate("(element)=>element.open")
                assert page.locator("#site-profile-body .v11-stat-group .v11-stat").count() == 20
                assert page.locator("#site-profile-body .v11-ability").count() >= 3
                page.locator('#site-profile-body [data-site-draft="active-nba-1"]').click()
                page.wait_for_function("opts.selected.includes('active-nba-1')", timeout=30000)
                assert page.evaluate("opts.athletes.find(a=>a.id==='active-nhl-1').role") == "hockey_goalie"
                assert page.evaluate("opts.athletes.find(a=>a.id==='active-mlb-1').role") == "baseball_pitcher"
                assert page.evaluate("opts.athletes.find(a=>a.id==='active-nfl-1').role") == "quarterback"
                assert not failures, f"V25 {width}px page errors: {failures}"
                print(f"V25 BROWSER PASS {width}px: {injected} injected four-league athletes, all teams, complete dossier, draft, positional archetypes")
                page.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()

if __name__ == "__main__":
    run()
