"""End-to-end V7 browser behavior and responsive visual smoke test."""
from __future__ import annotations
import functools
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args): pass

def main():
    handler=functools.partial(Quiet,directory=str(ROOT))
    server=ThreadingHTTPServer(("127.0.0.1",0),handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True)
    thread.start()
    url=f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
            for width,height in [(1280,900),(390,844)]:
                page=browser.new_page(viewport={"width":width,"height":height},reduced_motion="reduce")
                errors=[]
                page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(url,wait_until="domcontentloaded",timeout=60000)
                page.wait_for_function("typeof opts!=='undefined' && opts.athletes.length===1210 && document.querySelectorAll('.athlete-card').length===96",timeout=60000)
                assert page.locator("#ll-home").count()==1
                assert page.locator(".athlete-card").count()==96
                assert page.locator("#ll-match-history").count()==1
                # Dynamic two-stage filter: only show teams within selected sport.
                page.select_option("#sport-filter","Basketball")
                page.locator("#ll-team-filter option").filter(has_text="Philadelphia 76ers").wait_for(state="attached")
                page.select_option("#ll-team-filter","Philadelphia 76ers")
                assert page.locator('[data-athlete="lebron-james-sixers-2026"]').count()==1
                page.select_option("#ll-team-filter","")
                page.select_option("#sport-filter","")
                assert page.locator("#ll-team-filter").is_disabled()
                # Confirm different career editions are independently selectable.
                page.select_option("#match-size","13")
                page.locator("#search").fill("LeBron James")
                page.locator('[data-athlete="lebron-james-sixers-2026"]').click()
                assert page.evaluate("opts.selected.includes('lebron-james-sixers-2026')")
                page.locator("#search").fill("")
                page.locator("#start").click()
                page.locator("#battle-view:not(.hidden)").wait_for(timeout=60000)
                page.locator("#play").click()  # pause already running playback
                assert page.locator("#arena-leaders-desktop .ll-board-scroll").count()==2
                assert page.locator("#arena-leaders-mobile .ll-board-scroll").count()==2
                visible="#arena-leaders-mobile" if width<950 else "#arena-leaders-desktop"
                assert page.locator(visible+" .ll-leader-row").count()==20
                assert page.locator(visible+" .ll-board-scroll").first.evaluate("(e)=>e.scrollHeight>e.clientHeight")
                page.locator(visible+" .ll-leader-row").first.click()
                assert page.locator("#ll-spotlight").inner_text().find("FOLLOWING")>=0
                page.select_option("#ll-camera-mode","OVERVIEW")
                assert page.locator("#ll-camera-caption").inner_text()=="WIDE ARENA VIEW"
                # A branded home button must ask, not destroy the game immediately.
                page.locator("#ll-home").click()
                assert page.locator("#ll-exit-dialog").evaluate("(e)=>e.open")
                assert page.locator("#battle-view").is_visible()
                page.locator("#ll-cancel-exit").click()
                assert not page.locator("#ll-exit-dialog").evaluate("(e)=>e.open")
                assert page.locator("#battle-view").is_visible()
                # Finish one match to populate result and device-local history.
                page.locator("#timeline").evaluate("(e)=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));}")
                assert page.locator("#champion-banner").is_visible()
                assert "CHAMPIONSHIP MOMENTS" in page.locator("#champion-banner").inner_text()
                assert page.evaluate("LastLegendSpectator.readHistory().length")>=1
                page.locator("#ll-home").click()
                page.locator("#ll-confirm-exit").click()
                assert page.locator("#draft-view").is_visible()
                assert not page.locator("#battle-view").is_visible()
                assert "CHAMPION HISTORY" in page.locator("#ll-match-history").inner_text()
                overflow=page.evaluate("document.documentElement.scrollWidth-window.innerWidth")
                assert overflow<=2,f"{width}px viewport horizontal overflow {overflow}px"
                assert not errors,f"JS errors at {width}px: {errors}"
                print(f"V7 BROWSER PASS: {width}px, filtering, editions, battle, scrollable leaders, camera, exit dialog, champion, history, no JS errors or horizontal overflow")
                page.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()

if __name__=="__main__":
    main()
