from playwright.sync_api import sync_playwright
from pathlib import Path
import json
url=(Path(__file__).resolve().parent.parent if (Path(__file__).resolve().parent.parent/'index.html').exists() else Path(__file__).resolve().parent).joinpath('index.html').as_uri()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((Path(__file__).resolve().parent.parent if (Path(__file__).resolve().parent.parent/'index.html').exists() else Path(__file__).resolve().parent).joinpath('index.html').read_text(),wait_until='domcontentloaded')
 page.wait_for_selector('.athlete-card')
 assert page.locator('.athlete-card').count()==700,page.locator('.athlete-card').count()
 assert page.locator('#random-map').is_checked()
 page.select_option('#match-size','2');page.click('#demo')
 assert page.locator('#draft-count').inner_text().startswith('2 / 2')
 page.click('#start');page.wait_for_selector('#battle-view:not(.hidden)')
 page.locator('#timeline').evaluate('(x)=>{x.value=x.max;x.dispatchEvent(new Event("input",{bubbles:true}))}')
 assert page.locator('.victory-showcase').count()==1
 assert page.locator('.victory-figure svg').count()==1
 winner=page.evaluate('opts.match.winner')
 print('2 PLAYER CHAMPION',winner,'MAP',page.evaluate('opts.match.map.mapId'))
 page.locator('#back').click();page.select_option('#match-size','24');page.click('#demo');page.click('#start');page.wait_for_selector('#battle-view:not(.hidden)')
 assert page.evaluate('opts.match.roster.length')==24
 page.locator('#timeline').evaluate('(x)=>{x.value=x.max;x.dispatchEvent(new Event("input",{bubbles:true}))}')
 assert page.locator('.results-list > div').count()==24
 assert page.locator('.victory-showcase').count()==1
 data=page.evaluate('''()=>({count:opts.athletes.length,map:opts.match.map.mapId,events:[...new Set(opts.match.events.map(e=>e.type))],alive:opts.match.frames.at(-1).alive.length,placements:opts.match.placements.length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth})''')
 assert data['scrollWidth']<=data['viewport']+1,data
 assert data['alive']==1
 assert not errors,errors
 print('24 PLAYER RESULT',json.dumps(data,indent=2));print('PAGE_ERRORS',errors)
 # Visual output is optional; no screenshot written during CI.
 browser.close()
