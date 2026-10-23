"""V19 browser checks: map labels, tracking, camera zoom and responsive battle view."""
from __future__ import annotations
import functools,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/'reports'/'v19_visual_qa'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,fmt,*args):pass
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  SHOTS.mkdir(parents=True,exist_ok=True)
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
   for width,height in ((1440,960),(390,844)):
    page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(f'http://127.0.0.1:{server.server_port}/#/play',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof LastLegendBattleVision==='object' && typeof LastLegendSpectator==='object' && opts.athletes.length===1210",timeout=60000)
    page.locator('#arena').select_option('CITY')
    page.locator('#random-map').uncheck()
    page.locator('#demo').click()
    page.locator('#start').click()
    page.locator('#battle-view:not(.hidden)').wait_for(timeout=60000)
    page.locator('#play').click()
    assert page.locator('#map .v19-match-layer').count()==1
    assert page.locator('#map .v19-actor').count()==12
    assert 2<=page.locator('#map .v19-label').count()<=12
    assert page.locator('#map .figure').count()==0
    assert page.locator('#map .ll-map-targets .ll-map-hit').count()==12
    assert page.evaluate("Number(document.querySelector('#map').viewBox.baseVal.width)>=350")
    page.locator('#timeline').evaluate("(e)=>{e.value=Math.max(1,Math.floor(Number(e.max)*.15));e.dispatchEvent(new Event('input',{bubbles:true}));}")
    assert page.locator('#map .v19-motion-layer').count()==1
    page.locator('#ll-camera-mode').select_option('OVERVIEW')
    assert page.locator('#map').get_attribute('viewBox')=='0 0 620 390'
    assert page.locator('#map .v19-label').count()>0
    page.locator('#map').screenshot(path=str(SHOTS/f'city_map_{width}.png'),animations='disabled')
    page.locator('#ll-camera-mode').select_option('AUTO')
    page.locator('#ll-camera-mode').select_option('OVERVIEW')
    page.locator('.ll-map-hit').first.evaluate("el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))")
    assert page.locator('#ll-camera-mode').input_value()=='FOLLOW'
    assert page.locator('#map .v19-focused').count()==1
    assert page.locator('#map .v19-label-focus').count()<=1
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(SHOTS/f'battle_{width}.png'),full_page=False,animations='disabled')
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2,'horizontal overflow'
    assert not errors,f'browser errors {width}: {errors}'
    print(f'V19 BROWSER PASS {width}px: 12 miniature sprites, labels, map click tracking, overview, no overflow')
    page.close()
   browser.close()
 finally:
  server.shutdown();server.server_close()
if __name__=='__main__':main()
