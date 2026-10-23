"""V23: desktop and mobile integration tests for expanded roster browsing, athlete dossiers and seeded battle."""
from __future__ import annotations
import functools,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,fmt,*args): pass

def run():
 server=ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
   for width,height in ((1280,900),(390,844)):
    page=browser.new_page(viewport={"width":width,"height":height},reduced_motion="reduce")
    errors=[];page.on("pageerror",lambda exc:errors.append(str(exc)))
    url=f"http://127.0.0.1:{server.server_port}/"
    page.goto(url,wait_until="domcontentloaded",timeout=60000)
    page.wait_for_function("typeof LastLegendWebsite==='object' && LastLegendWebsite.shell.ready && opts.athletes.length>=1652",timeout=60000)
    assert page.locator("#site-total").inner_text()=="1,652"
    assert page.evaluate("opts.athletes.filter(a=>a.collection_tags?.includes('EXPANSION_V23')).length")==442
    assert page.locator('#collection-filter option[value="EXPANSION_V23"]').count()==1
    page.goto(url+"#/legends",wait_until="domcontentloaded",timeout=60000)
    page.wait_for_function("LastLegendWebsite.shell.route==='legends'")
    page.locator("#site-legend-search").fill("Yao Ming")
    assert page.locator('[data-site-profile="v23-yao-ming"]').count()==1
    page.locator('[data-site-profile="v23-yao-ming"] .v11-show-stats').click()
    assert page.locator("#site-profile-dialog").evaluate("(el)=>el.open")
    assert page.locator("#site-profile-body .v11-stat-group .v11-stat").count()==20
    assert page.locator("#site-profile-body .v11-ability").count()>=3
    page.locator('#site-profile-body [data-site-draft="v23-yao-ming"]').click()
    page.wait_for_function("LastLegendWebsite.shell.route==='play'")
    assert page.evaluate("opts.selected.length===1 && opts.selected[0]==='v23-yao-ming'")
    page.locator('#collection-filter').select_option('EXPANSION_V23')
    page.locator('#search').fill("Sue Bird")
    assert page.locator('[data-athlete="v23-sue-bird"]').count()==1
    page.locator('[data-athlete="v23-sue-bird"] [data-draft-add]').click()
    assert page.evaluate("opts.selected.length===2 && opts.selected[1]==='v23-sue-bird'")
    page.locator('#search').fill('')
    page.locator('#demo').click()
    assert page.evaluate("opts.selected.length===12 && opts.selected[0]==='v23-yao-ming'")
    page.locator('#start').click()
    page.locator('#battle-view:not(.hidden)').wait_for(timeout=60000)
    page.locator('#play').click()
    assert page.evaluate("opts.match.roster.includes('v23-yao-ming') && opts.match.roster.includes('v23-sue-bird')")
    assert page.locator('#map').is_visible()
    page.locator('#timeline').evaluate("(e)=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));}")
    assert page.locator('#champion-banner').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2
    assert not errors,f'V23 {width}px errors: {errors}'
    print(f'V23 BROWSER PASS {width}px: 1,652 profiles, 442 new, searchable career catalog, full ratings and abilities, draft, seeded match, victory, no overflow')
    page.close()
   browser.close()
 finally: server.shutdown();server.server_close()
if __name__=='__main__':run()
