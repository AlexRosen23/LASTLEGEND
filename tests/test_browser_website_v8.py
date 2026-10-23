"""Public website-foundation acceptance tests on real desktop and mobile browsers."""
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
    root=f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
            for width,height in ((1280,900),(390,844)):
                page=browser.new_page(viewport={"width":width,"height":height},reduced_motion="reduce")
                errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(root,wait_until="domcontentloaded",timeout=60000)
                page.wait_for_function("typeof LastLegendWebsite==='object' && LastLegendWebsite.shell.ready && opts.athletes.length===1210",timeout=60000)
                assert page.locator("#site-home").is_visible()
                assert page.locator("#draft-view").is_hidden()
                assert page.locator("#site-total").inner_text()=="1,210"
                assert page.evaluate("LastLegendEncounters.catalog.length") == 500
                page.evaluate("LastLegendWebsite.goto('play')")
                page.locator('#scene-intensity').select_option('graphic')
                assert page.evaluate("LastLegendEncounters.getIntensity()") == 'graphic'
                page.locator('#scene-intensity').select_option('standard')
                assert page.evaluate("LastLegendEncounters.getIntensity()") == 'standard'
                page.evaluate("LastLegendWebsite.goto('home')")
                assert page.locator("#site-sports .site-sport-chip").count()==6
                assert page.locator("[data-site-nav]").count()==7
                # All linked sections have real content, headings and a distinct route.
                for route,selector in [('how-to-play','#site-how-to-play'),('about','#site-about'),('updates','#site-updates'),('champions','#site-champions')]:
                    page.goto(root+'#/'+route,wait_until="domcontentloaded",timeout=60000)
                    page.wait_for_function(f"LastLegendWebsite.shell.route==='{route}'",timeout=30000)
                    assert page.locator(selector).is_visible(),route
                    assert page.locator(selector+' h1').count()==1,route
                # Direct deep-link to Legends preserves its route on refresh.
                page.goto(root+'#/legends',wait_until="domcontentloaded",timeout=60000)
                page.wait_for_function("LastLegendWebsite.shell.route==='legends'",timeout=30000)
                assert page.locator("#site-legends").is_visible()
                assert page.locator(".site-legend-card").count()==36
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("LastLegendWebsite.shell.route==='legends'",timeout=30000)
                page.locator('#site-legend-sport').select_option("Basketball")
                page.locator('#site-legend-team').select_option("Philadelphia 76ers")
                page.locator("#site-legend-search").fill("LeBron")
                assert page.locator('[data-site-profile="lebron-james-sixers-2026"]').count()==1
                page.locator('[data-site-profile="lebron-james-sixers-2026"] .v11-show-stats').click()
                assert page.locator("#site-profile-dialog").evaluate("(el)=>el.open")
                assert "LeBron James" in page.locator("#site-profile-body").inner_text()
                assert "FICTIONAL" in page.locator("#site-profile-body").inner_text().upper()
                assert page.locator("#site-profile-body .v11-stat-group .v11-stat").count()==20
                assert page.locator("#site-profile-body .v11-behavior .v11-stat").count()==5
                assert page.locator("#site-profile-body .v11-ability").count()>=3
                assert "SIGNATURE & ABILITIES" in page.locator("#site-profile-body").inner_text()
                assert page.locator('[data-site-profile="lebron-james-sixers-2026"] .v11-show-stats').count()==1
                assert page.locator('[data-site-profile="lebron-james-sixers-2026"] [data-site-draft]').count()==1
                page.locator('#site-profile-body [data-site-draft="lebron-james-sixers-2026"]').click()
                page.wait_for_function("LastLegendWebsite.shell.route==='play'",timeout=20000)
                assert page.locator("#draft-view").is_visible()
                assert page.evaluate("opts.selected.length===1 && opts.selected[0]==='lebron-james-sixers-2026'")
                # Draft card and selected slot both open the same full dossier.
                page.locator('#search').fill('LeBron James')
                page.locator('[data-athlete="lebron-james-sixers-2026"] [data-profile-open]').click()
                assert page.locator("#site-profile-dialog").evaluate("(e)=>e.open")
                assert page.locator('#site-profile-body .v11-stat-group .v11-stat').count()==20
                assert 'ALREADY DRAFTED' in page.locator('#site-profile-body').inner_text()
                page.locator("#site-profile-close").click()
                page.locator('[data-slot-profile="lebron-james-sixers-2026"]').click()
                assert page.locator("#site-profile-dialog").evaluate("(e)=>e.open")
                assert page.locator('#site-profile-body .v11-ability').count()>=3
                page.locator("#site-profile-close").click()
                page.locator('#search').fill('')
                assert page.evaluate('document.documentElement.scrollWidth - window.innerWidth')<=2
                # Draft, simulate and navigate with quit confirmation. Reuse V7 controls.
                page.locator("#demo").click()
                assert page.evaluate("opts.selected.length===12 && opts.selected[0]==='lebron-james-sixers-2026'")
                page.locator("#start").click()
                page.wait_for_function("opts.match && opts.match.events.some(e => !!e.encounterId)", timeout=60000)
                page.locator("#battle-view:not(.hidden)").wait_for(timeout=60000)
                page.locator("#play").click()
                page.evaluate("LastLegendWebsite.goto('about')")
                assert page.locator("#ll-exit-dialog").evaluate("(e)=>e.open")
                page.locator("#ll-cancel-exit").click()
                assert page.locator("#battle-view").is_visible()
                assert page.evaluate("LastLegendWebsite.shell.route==='play'")
                page.locator("#timeline").evaluate("(e)=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));}")
                assert page.locator("#champion-banner").is_visible()
                page.evaluate("LastLegendWebsite.goto('champions')")
                assert page.locator("#ll-exit-dialog").evaluate("(e)=>e.open")
                page.locator("#ll-confirm-exit").click()
                page.wait_for_function("LastLegendWebsite.shell.route==='champions'")
                assert page.locator("#site-champions").is_visible()
                assert "CHAMPION HISTORY" in page.locator("#ll-match-history").inner_text()
                assert page.evaluate("LastLegendSpectator.readHistory().length")>=1
                # Mobile drawer opens and navigates to home; desktop navigation remains accessible.
                if width<880:
                    page.locator("#site-menu-toggle").click()
                    assert page.locator("#site-navigation").evaluate("(e)=>e.classList.contains('site-open')")
                page.locator('nav.site-nav [data-site-nav="home"]').click()
                page.wait_for_function("LastLegendWebsite.shell.route==='home'",timeout=20000)
                assert page.locator("#site-home").is_visible()
                assert page.locator("#site-latest-champion").inner_text().find("MOST RECENT CHAMPION")>=0
                assert page.evaluate("document.documentElement.scrollWidth-window.innerWidth")<=2
                assert not errors,errors
                print(f"V8 WEBSITE BROWSER PASS {width}px: routes, home, 36-card catalog, deep link, filters, profiles, draft, match, exit, champions, responsive navigation and no horizontal overflow.")
                page.close()
            browser.close()
    finally:
        server.shutdown();server.server_close()
if __name__=='__main__':run()
