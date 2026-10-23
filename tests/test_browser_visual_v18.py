"""V18 illustrated-world and visual-shell integration screenshots + functional smoke tests."""
from __future__ import annotations
import functools,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SHOT=ROOT/'reports'/'v18_visual_qa'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,fmt,*args):pass

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        SHOT.mkdir(parents=True,exist_ok=True)
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
            for width,height in ((1440,960),(390,844)):
                page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
                errors=[]
                page.on('pageerror',lambda exc:errors.append(str(exc)))
                page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='domcontentloaded',timeout=60000)
                page.wait_for_function("typeof LastLegendWebsite==='object' && LastLegendWebsite.shell.ready && document.documentElement.classList.contains('rb-v18-ready')",timeout=60000)
                assert page.locator('.rb-holo').count()==1
                assert page.locator('.rb-arena-card').count()==4
                assert page.locator('.rb-holo-grid').count()==1
                assert int(page.locator('#site-total').inner_text().replace(',', '')) >= 1652
                assert page.locator('.site-home-hero').evaluate('(el)=>getComputedStyle(el).borderRadius')!='0px'
                assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2,'homepage overflow'
                page.screenshot(path=str(SHOT/f'home_{width}.png'),full_page=True,animations='disabled')
                page.goto(f'http://127.0.0.1:{server.server_port}/#/legends',wait_until='domcontentloaded')
                page.wait_for_function("LastLegendWebsite.shell.route==='legends'")
                assert page.locator('.site-legend-card').count()==36
                page.screenshot(path=str(SHOT/f'legends_{width}.png'),full_page=False,animations='disabled')
                page.goto(f'http://127.0.0.1:{server.server_port}/#/home',wait_until='domcontentloaded')
                page.wait_for_function("LastLegendWebsite.shell.route==='home'")
                page.locator('[data-rb-arena="CITY"]').click()
                page.wait_for_function("LastLegendWebsite.shell.route==='play'")
                assert page.locator('#arena').input_value()=='CITY','arena card must configure real draft'
                assert 'NEON CITY' in page.locator('.rb-arena-preview').inner_text()
                page.screenshot(path=str(SHOT/f'draft_{width}.png'),full_page=False,animations='disabled')
                page.locator('#demo').click()
                page.locator('#random-map').uncheck()
                page.locator('#start').click()
                page.locator('#battle-view:not(.hidden)').wait_for(timeout=60000)
                page.locator('#play').click()
                assert page.locator('.rb-broadcast-bar').count()==1
                assert page.locator('.rb-broadcast-bar .rb-live').count()==1
                assert page.locator('#map #rb-roof').count()==0 or page.locator('#map [fill="url(#rb-roof)"]').count()>0
                assert page.locator('#map .rb-terrain-feature').count()>=8
                assert 'NEON CITY' in page.locator('#map-label').inner_text()
                assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2,'battle overflow'
                page.locator('#timeline').evaluate('(el)=>{el.value=Math.max(1,Math.floor(Number(el.max)*.32));el.dispatchEvent(new Event("input",{bubbles:true}));}')
                page.evaluate('window.scrollTo(0,0)')
                page.screenshot(path=str(SHOT/f'battle_{width}.png'),full_page=False,animations='disabled')
                page.locator('#map').screenshot(path=str(SHOT/f'arena_{width}.png'),animations='disabled')
                assert not errors,f'page errors at {width}: {errors}'
                print(f'V18 BROWSER PASS {width}px: hologram, cards, legends, arena selection, detailed map, broadcast strip, no overflow; four screenshots')
                page.close()
            browser.close()
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':run()
