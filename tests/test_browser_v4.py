from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time
root=Path(__file__).parent
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((root/'index.html').read_text(),wait_until='domcontentloaded',timeout=45000)
 page.wait_for_selector('.athlete-card',timeout=30000)
 assert page.evaluate('opts.athletes.length')==1203
 assert page.locator('.athlete-card').count()==1203
 page.select_option('#battle-mode','MASCOT')
 assert page.locator('.athlete-card').count()==258
 page.select_option('#collection-filter','COLLEGE_MASCOTS')
 assert page.locator('.athlete-card').count()==100
 page.select_option('#match-size','2');page.click('#demo')
 assert page.locator('#draft-count').inner_text().startswith('2 / 2')
 assert page.evaluate('opts.selected.every(id=>opts.profiles.get(id).kind==="mascot")')
 page.click('#start');page.wait_for_selector('#battle-view:not(.hidden)',timeout=40000)
 assert page.evaluate('opts.match.roster.length')==2
 page.locator('#timeline').evaluate('(e)=>{e.value=e.max;e.dispatchEvent(new Event("input",{bubbles:true}))}')
 assert page.locator('.victory-showcase').count()==1
 assert page.locator('.victory-figure svg').count()==1
 assert page.evaluate('opts.match.frames.at(-1).alive.length')==1
 print('2-mascot fight complete:',page.evaluate('opts.match.winner'))
 page.locator('#back').click()
 page.select_option('#battle-mode','ALL');page.select_option('#collection-filter','ALL')
 page.select_option('#match-size','100');page.click('#demo')
 assert page.locator('#draft-count').inner_text().startswith('100 / 100')
 t=time.time();page.click('#start');page.wait_for_selector('#battle-view:not(.hidden)',timeout=60000)
 print('100-actor browser simulation seconds:',round(time.time()-t,2))
 assert page.evaluate('opts.match.roster.length')==100
 page.locator('#timeline').evaluate('(e)=>{e.value=e.max;e.dispatchEvent(new Event("input",{bubbles:true}))}')
 assert page.locator('.results-list > div').count()==100
 assert page.locator('.victory-showcase').count()==1
 assert page.evaluate('opts.match.frames.at(-1).alive.length')==1
 m=page.evaluate('''()=>({count:opts.athletes.length,roster:opts.match.roster.length,champion:opts.match.winner,events:opts.match.events.length,width:document.documentElement.scrollWidth,viewport:window.innerWidth,mascots:opts.athletes.filter(a=>a.kind==='mascot').length})''')
 assert m['width']<=m['viewport']+1,m
 assert not errors,errors
 page.screenshot(path=str(root/'preview_phone.png'),full_page=False)
 print(json.dumps(m,indent=2))
 b.close()
