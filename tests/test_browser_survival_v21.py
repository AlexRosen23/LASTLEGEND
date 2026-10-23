"""V21 tactical AI acceptance: deterministic in-browser simulation and visible strategy status."""
from __future__ import annotations
import functools,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,fmt,*args):pass
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
   for width,height in [(1440,960),(390,844)]:
    page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/#/play',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof LastLegendSurvivalAI==='object'&&opts.athletes.length===1652",timeout=60000)
    assert page.locator('#draft-view .v21-ai-indicator').is_visible()
    assert 'PREDICTIVE ZONE' in page.locator('.v21-ai-indicator').inner_text().upper()
    assert page.evaluate("Simulation.prototype.plan.toString().includes('tacticalPlan')")
    page.locator('#random-map').uncheck()
    page.locator('#seed').fill('20261023')
    page.locator('#demo').click()
    page.locator('#start').click()
    page.locator('#battle-view:not(.hidden)').wait_for(timeout=60000)
    page.locator('#play').click()
    assert page.evaluate('opts.match.frames.length>15&&!!opts.match.winner')
    assert page.locator('#map .v19-actor').count()>=1
    assert page.evaluate("new Simulation(opts.selected,opts.athletes,opts.perks,{seed:opts.match.seed,arena:opts.match.arena,mode:opts.match.mode}).run().winner===opts.match.winner")
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2
    assert not errors,errors
    print(f'V21 BROWSER PASS {width}px: enhanced AI running, same-seed champion preserved, live match intact, zero JS errors')
    page.close()
   browser.close()
 finally:
  server.shutdown();server.server_close()
if __name__=='__main__':main()
