from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import threading,functools
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  for width in [1280,390]:
   page=browser.new_page(viewport={'width':width,'height':844})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{server.server_port}/')
   page.wait_for_function("typeof LastLegendWebsite==='object' && opts.athletes.length===1210")
   assert page.locator('#ll-web-home').is_visible()
   assert page.locator('#draft-view').is_hidden()
   assert page.locator('#ll-web-guide').is_hidden()
   def navigate(name):
    if width<700:
     page.locator('#ll-nav-toggle').click()
     page.locator('#ll-mobile-nav [data-ll-page="'+name+'"]').click()
    else:page.locator('#ll-mobile-nav [data-ll-page="'+name+'"]').click()
   navigate('how-to-play');assert page.locator('#ll-web-guide').is_visible()
   navigate('legends');assert page.locator('#ll-web-legends').is_visible()
   assert page.locator('.ll-site-legend').count()==40
   page.locator('#ll-legend-search').fill('LeBron')
   assert page.locator('.ll-site-legend').count()>=4
   page.locator('#ll-legend-search').fill('')
   page.locator('#ll-legend-sport').select_option('Basketball')
   page.locator('#ll-legend-team').select_option('Philadelphia 76ers')
   assert page.locator('[data-ll-draft="lebron-james-sixers-2026"]').count()==1
   page.locator('[data-ll-draft="lebron-james-sixers-2026"]').click()
   assert page.locator('#draft-view').is_visible()
   assert page.evaluate("'lebron-james-sixers-2026' in opts.selected")
   navigate('champions')
   assert page.locator('#ll-match-history').is_visible()
   navigate('home');assert page.locator('#ll-web-home').is_visible()
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2')
   assert not errors,errors
   print(f'WEBSITE BROWSER PASS {width}px: home, menu, how-to-play, roster filters, draft, champions, no errors')
   page.close()
  browser.close()
finally:
 server.shutdown();server.server_close()
