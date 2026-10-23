"""V20 cinematic encounter playback QA on laptop and phone."""
from __future__ import annotations
import functools,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports'/'v20_visual_qa'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,fmt,*args):pass
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  OUT.mkdir(parents=True,exist_ok=True)
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
   for width,height in [(1440,960),(390,844)]:
    page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/#/play',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof LastLegendEncounterCinema==='object'&&opts.athletes.length===1652",timeout=60000)
    page.locator('#arena').select_option('CITY')
    page.locator('#demo').click()
    page.locator('#start').click()
    page.locator('#battle-view:not(.hidden)').wait_for(timeout=60000)
    page.locator('#play').click()
    page.evaluate("renderEncounter(opts.match.events.find(e=>!!e.encounterId))")
    assert page.locator('#encounter-visual .v20-director-overlay').count()==1
    assert page.locator('#encounter-visual .v20-cinema').count()==1
    assert page.locator('#encounter-visual .v12-choreography').count()==1
    assert page.locator('#encounter-visual .v20-slate').count()==1
    assert page.locator('#encounter-visual .v20-cinema-streaks>i').count()>=7
    assert 'AFTERHOURS CITY' in page.locator('#encounter-visual').inner_text()
    assert 'TICK' in page.locator('.v20-slate').inner_text()
    assert page.locator('#encounter-visual .v20-players>span').count()>0
    # Regression: the director title and action captions must paint in FRONT of athletes.
    # A high child z-index is insufficient when its overlay parent is below the actor.
    layers=page.evaluate("""() => {
      const stage=document.querySelector('#encounter-visual .v20-cinema');
      const z=selector=>Number(getComputedStyle(stage.querySelector(selector)).zIndex);
      return {
        actor:z('.scene-actor'),
        overlay:z('.v20-director-overlay'),
        title:z('.v20-slate'),
        action:z('.scene-impact'),
        status:z('.scene-status')
      };
    }""")
    assert layers['overlay']>layers['actor'],f'Group Clash title behind player: {layers}'
    assert layers['action']>layers['actor'],f'Action text behind player: {layers}'
    assert layers['status']>layers['actor'],f'Status text behind player: {layers}'
    assert layers['title']>0,f'Title not above its director overlay content: {layers}'
    page.locator('#encounter').screenshot(path=str(OUT/f'encounter_{width}.png'),animations='disabled')
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2,'horizontal scroll'
    assert not errors,errors
    print(f'V20 BROWSER PASS {width}px: recorded cinematic scene, V12 choreography retained, director slate, sport actors and no overflow')
    page.close()
   browser.close()
 finally:
  server.shutdown();server.server_close()
if __name__=='__main__':main()
