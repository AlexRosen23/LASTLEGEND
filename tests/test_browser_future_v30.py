"""V18-V30: real browser desktop/mobile end-to-end smoke of integrated mode controls."""
from __future__ import annotations
import functools,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,fmt,*args):pass
def run():
 server=ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 url=f"http://127.0.0.1:{server.server_port}/"
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
   for width,height in ((1280,900),(390,844)):
    page=browser.new_page(viewport={"width":width,"height":height},reduced_motion="reduce")
    errors=[];page.on("pageerror",lambda error:errors.append(str(error)))
    page.goto(url+"#/home",wait_until="domcontentloaded",timeout=60000)
    page.wait_for_function("window.LastLegendSettings && window.LastLegendDaily && window.LastLegendCreator && window.LastLegendTournaments && opts.athletes.length>=1222",timeout=60000)
    assert page.locator("#v24-panel").is_visible()
    assert page.locator("#v30-options").is_visible()
    page.locator("#v30-contrast").check()
    assert page.locator("html").evaluate("(e)=>e.classList.contains('v30-contrast')")
    daily=page.evaluate("LastLegendDaily.daily('2026-10-23')")
    assert len(daily["ids"])==12 and daily["seed"]>=0
    page.locator("#v24-load").click()
    page.wait_for_function("LastLegendWebsite.shell.route==='play'",timeout=20000)
    assert page.locator("#v27-panel").is_visible()
    assert page.locator("#v23-panel").is_visible()
    assert page.locator("#v26-ai").is_checked()
    page.locator("#v27-name").fill("Blaze Circuit")
    page.locator("#v27-panel button[type=submit]").click()
    assert "Blaze Circuit" in page.locator("#v27-status").inner_text()
    assert page.evaluate("opts.profiles.has('custom-blaze-circuit-1')")
    # Complete a legitimate four-person bracket using the simulation engine.
    page.evaluate("""() => {document.querySelector('#match-size').value='4';document.querySelector('#match-size').dispatchEvent(new Event('change',{bubbles:true})); opts.selected=opts.athletes.filter(a=>a.sport==='Basketball').slice(0,4).map(a=>a.id);renderSlots();renderGrid();}""")
    page.locator("#v23-run").click()
    page.wait_for_function("document.querySelector('#v23-status').textContent.includes('Finished.')",timeout=60000)
    assert page.locator(".v23-round").count()==2
    page.locator("#random-map").uncheck()
    page.locator("#start").click()
    assert page.locator("#battle-view").is_visible()
    assert page.locator("#v25-panel").is_visible()
    assert page.locator("#v29-panel").is_visible()
    page.locator("#v25-mark").click()
    assert "1 BOOKMARK" in page.locator("#v25-bookmark-status").inner_text()
    page.locator("#timeline").evaluate("(e)=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));}")
    assert page.locator("#victory-home").is_visible()
    page.locator("#victory-home").click()
    page.wait_for_function("LastLegendWebsite.shell.route==='home'",timeout=20000)
    assert page.locator("#site-home").is_visible()
    assert page.evaluate("LastLegendSpectator.readHistory().length")>=1
    assert page.evaluate("document.documentElement.scrollWidth-innerWidth")<=2
    assert not errors,errors
    print("V18–V30 browser PASS",width)
    page.close()
   browser.close()
 finally:
  server.shutdown();server.server_close()
if __name__=='__main__':run()
