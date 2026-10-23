"""Generate a zero-dependency, offline spectator replay prototype + SVG athlete encounter art.
From an immutable game log; never recalculates or alters the simulation outcome.
"""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[1]
ATHLETES={a['id']:a for a in json.loads((ROOT/'data'/'athletes_252.json').read_text())['athletes']}
GAME=json.loads((ROOT/'examples'/'haliburton_judge_match.json').read_text())
KITS={'Basketball':('#EFC153','#F8E9C0'),'Baseball':('#A4D4EF','#E8F3F9'),'American Football':('#B5A4E8','#D9CBF2'),'Association Football':('#B4E7B9','#D4F5D5'), 'Boxing & MMA':('#DF8B85','#F4D2C7')}

def stick(x,name,number,outfit,color,bg):
    # SVG semantic vector limbs / head with garment silhouettes, no team logos.
    x=float(x);shirt=html.escape(color);number=html.escape(number or '')
    short=html.escape(name)
    cap=('cap' in outfit or 'baseball' in outfit)
    boxing='boxing' in outfit or 'mma' in outfit or 'trunks' in outfit
    shorts=('swim' in outfit or boxing)
    cap_svg=f'<path d="M{x-22} 57 Q{x} 31 {x+22} 57 L{x+28} 60 L{x+4} 62" stroke="#E4ECF9" stroke-width="8" fill="#49657A"/>' if cap else ''
    shirt_svg=(f'<path d="M{x-13} 112 L{x-24} 156 L{x+24} 156 L{x+13} 112" fill="{shirt}" stroke="#E2E9EF" stroke-width="2"/>' if not boxing else f'<rect x="{x-19}" y="137" width="38" height="19" rx="3" fill="{shirt}"/>')
    n_svg=f'<text x="{x}" y="140" font-size="19" fill="#111725" text-anchor="middle" font-weight="900">{number}</text>' if number and not boxing else ''
    return f'''<g role="img" aria-label="{short}, {html.escape(outfit)}">
  <ellipse cx="{x}" cy="223" rx="37" ry="7" fill="#0B1522" opacity=".35"/>
  <path d="M{x} 158 L{x-24} 214 M{x} 158 L{x+24} 214" stroke="#E9F1F4" stroke-width="8" stroke-linecap="round"/>
  <path d="M{x-7} 110 L{x-29} 143 M{x+7} 110 L{x+29} 143" stroke="#E9F1F4" stroke-width="7" stroke-linecap="round"/>
  <path d="M{x} 98 L{x} 161" stroke="#E9F1F4" stroke-width="8" stroke-linecap="round"/>
  <circle cx="{x}" cy="78" r="23" fill="#F2CCAE" stroke="#132536" stroke-width="2"/>{cap_svg}
  {shirt_svg}{n_svg}
  <rect x="{x-93}" y="231" width="186" height="32" rx="9" fill="#162431" stroke="#657A8B" stroke-width="1"/>
  <text x="{x}" y="251" font-size="13" font-weight="700" fill="#F5F7FC" text-anchor="middle">{short}</text>
  </g>'''

items=[ATHLETES[i] for i in ['tyrese-haliburton','aaron-judge','mike-tyson']]
parts=[]
for i,a in enumerate(items):
    color=KITS.get(a['sport'],('#DBAEEC','#F2DEFA'))[0]
    parts.append(stick(132+228*i,a['display_name'],a['appearance']['display_number'],a['appearance']['outfit_type'],color,''))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 310" role="img" aria-label="Last Legend stick-figure encounter showing Haliburton, Judge and Tyson">
<rect width="720" height="310" rx="18" fill="#1B2E27"/><path d="M0 195 Q190 155 365 192 T720 190" stroke="#294F3D" stroke-width="56" fill="none"/>
<text x="27" y="34" font-size="15" font-weight="800" fill="#EBF5EE">LAST LEGEND / ENCOUNTER SPRITES</text>{''.join(parts)}
<text x="360" y="293" font-size="11" text-anchor="middle" fill="#A8C6B5">Illustrative unbranded kits · sourced #0 and #99 · boxing has no invented jersey number</text></svg>'''
(ROOT/'preview'/'verified_kit_encounter.svg').write_text(svg)
# Offline replay subset only; initial screen is a RECORDED match, not simulated live.
events=[{'id':e['event_id'],'tick':e['tick'],'type':e['type'],'story':e.get('story') or '', 'ids':e['participants'],'scene':e.get('encounter_scene'),'details':e['details'],'importance':e['importance']} for e in GAME['events'] if e['type'] in {'MATCH_START','ALLIANCE','NEGOTIATION','CONTACT','CHASE','SKIRMISH','CONTEST_RESOURCE','ELIMINATION','FINALE_ENGAGEMENT','CHAMPION','ZONE_WARNING','FINAL_CONVERGENCE_WARNING'}]
# remove repetitive contacts by visible highlights only, preserve decisive events.
events=[e for e in events if e['type']!='CONTACT' or e['tick']%7==0]
profile={i:{'name':ATHLETES[i]['display_name'],'sport':ATHLETES[i]['sport'],'outfit':ATHLETES[i]['appearance']['outfit_type'],'number':ATHLETES[i]['appearance']['display_number'],'signature':ATHLETES[i]['signature_perk']} for i in GAME['roster']}
data={'seed':GAME['seed'],'winner':GAME['winner'],'placements':GAME['placements'],'roster':GAME['roster'],'events':events,'snapshots':GAME['snapshots'],'profiles':profile,'arena':GAME['arena']}
# protect embedded JSON from accidental HTML parser termination.
emb=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
page=r'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>LAST LEGEND — Offline Replay Concept</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,Arial,sans-serif;background:#0c1312;color:#eef4eb}*{box-sizing:border-box}body{margin:0}header{padding:18px 26px;border-bottom:1px solid #2d3f38;display:flex;justify-content:space-between;align-items:center;background:#111e1a;gap:12px;flex-wrap:wrap}h1{letter-spacing:.13em;font-weight:900;font-size:19px;margin:0}.label{font-size:11px;letter-spacing:.13em;color:#a9bca9;text-transform:uppercase}.stat{font-weight:900;font-size:23px}.layout{display:grid;grid-template-columns:245px minmax(390px,1fr) 310px;min-height:80vh}.rail{border-right:1px solid #2b3d34;background:#111d18;padding:18px;overflow:auto}.feed{border-left:1px solid #2b3d34;background:#101b17;padding:18px;max-height:calc(100vh - 90px);overflow:auto}.stage{padding:20px;display:flex;flex-direction:column;gap:14px;min-width:0}.athlete{padding:10px 8px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #263a2e;line-height:1.25}.athlete .n{flex:1;font-size:13px;font-weight:650}.athlete small{font-size:10px;color:#b0bfbd;display:block}.dot{border-radius:50%;height:10px;width:10px;background:#8fd7a6;flex-shrink:0}.dead{opacity:.38;text-decoration:line-through}.dead .dot{background:#9d6f79}.tag{background:#21372e;border:1px solid #385347;font-size:10px;padding:3px 5px;border-radius:4px}.mapbox{background:#1d3328;border:1px solid #47604c;border-radius:14px;overflow:hidden;position:relative}.map{width:100%;height:auto;display:block}.hud{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.hud>div{min-width:92px}.controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}button,select{background:#223a2e;border:1px solid #44674f;color:#f4fff0;padding:9px 13px;border-radius:8px;cursor:pointer;font-weight:700}button:hover{background:#31543b}input[type=range]{flex:1;min-width:120px;accent-color:#a2dc9e}.event{border-left:3px solid #567e5c;margin:10px 0;padding:8px 11px;background:#19281f;border-radius:0 8px 8px 0;cursor:pointer;font-size:12px;line-height:1.48}.event.active{border-left-color:#e8c17e;background:#2c342a}.event strong{display:block;color:#e3cb94;font-size:10px;margin-bottom:5px}.encounter{background:#131f1e;border:1px solid #465b4c;padding:13px;border-radius:12px}.figures{display:flex;align-items:center;justify-content:space-evenly;gap:8px;flex-wrap:wrap;min-height:174px}.figure{flex:1;min-width:80px;max-width:145px;text-align:center}.figure svg{width:100%;max-height:125px}.figure .name{font-size:11px;font-weight:800}.figure .sport{font-size:10px;color:#afc1b4}.story{font-size:14px;line-height:1.6;margin:10px 0}.note{font-size:11px;color:#a8bdb3}.winner{color:#eac37c}.box{background:#1c3026;padding:10px 12px;border-radius:9px}footer{padding:16px 26px;border-top:1px solid #2c4034;color:#acc0b3;font-size:11px}@media(max-width:1120px){.layout{grid-template-columns:200px minmax(350px,1fr)}.feed{grid-column:1/-1;border-left:0;border-top:1px solid #2b3d34;max-height:330px}.rail{max-height:720px}}@media(max-width:650px){.layout{display:flex;flex-direction:column}.rail{order:3;max-height:290px}.stage{order:1;padding:12px}.feed{order:2}.stat{font-size:18px}header{padding:12px}.encounter{padding:7px}}
</style></head><body>
<header><div><div class="label">The greatest survive / Design preview</div><h1>LAST LEGEND</h1></div><div style="text-align:right"><div class="label">Recorded match · seed <span id="seed"></span></div><div>12 ATHLETES. ONE WINNER.</div></div></header>
<div class="layout">
<aside class="rail"><div class="label">Athlete roster · remaining <strong id="remaining">12</strong>/12</div><div id="roster"></div></aside>
<main class="stage"><div class="hud"><div><div class="label">Virtual time</div><div class="stat" id="clock">Day 1</div></div><div><div class="label">Current event</div><div class="stat" id="eventNumber">1</div></div><div><div class="label">Arena</div><div class="stat" id="arena">WILDERNESS</div></div></div>
<div class="mapbox"><svg id="map" class="map" viewBox="0 0 640 400" role="img" aria-label="Top-down survivor map with stick figure athlete tokens"></svg></div>
<div class="controls"><button id="back" aria-label="Previous event">◀ Back</button><button id="play" aria-label="Play or pause">▶ Play</button><button id="next" aria-label="Next event">Next ▶</button><select id="speed"><option value="1200">1×</option><option value="650">2×</option><option value="260">4×</option></select><input id="seek" type="range" min="0" max="100" value="0" aria-label="Replay timeline"/></div>
<section class="encounter"><div class="label">Interaction scene / Sport-accurate outfit types / only verified numbers</div><div id="figures" class="figures"></div><div id="story" class="story"></div><div id="reason" class="note"></div></section>
</main><aside class="feed"><div class="label">Committed event timeline</div><div id="feed"></div></aside></div>
<footer>OFFLINE REPLAY PROTOTYPE · Recorded outcomes are fixed; the headless simulator runs separately. Ratings and most uniform numbers remain provisional. No team logos or licensed imagery.</footer>
<script id="replay-data" type="application/json">__DATA__</script><script>
const G=JSON.parse(document.getElementById('replay-data').textContent);let cursor=0,timer=null;
const $=(id)=>document.getElementById(id);$('seed').textContent=G.seed;$('arena').textContent=G.arena;$('seek').max=G.events.length-1;
const sportColor={Basketball:'#EAC56B',Baseball:'#A6CAE8','American Football':'#BEA2E9','Boxing & MMA':'#ECA18C','Track & Field':'#D7D8D0','Association Football':'#9CDE9B',Swimming:'#86C7EB',Gymnastics:'#E1A3CB',Tennis:'#C1DE93'};
const ESC=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function figure(id){const p=G.profiles[id],kit=p.outfit,col=sportColor[p.sport]||'#d0d5ce';let cap=kit.includes('baseball'),fight=kit.includes('boxing')||kit.includes('trunks')||kit.includes('mma');let jersey=fight?'':`<path d="M47 48 L33 76 L67 76 L53 48" fill="${col}" stroke="#e0e8e2" stroke-width="2"/>`;let num=p.number&&!fight?`<text x="50" y="69" text-anchor="middle" font-weight="900" font-size="15" fill="#142020">${ESC(p.number)}</text>`:'';
return `<div class="figure" aria-label="${ESC(p.name)}, ${ESC(p.sport)}, number ${ESC(p.number||'none')}"><svg viewBox="0 0 100 120" role="img"><ellipse cx="50" cy="114" rx="21" ry="4" fill="#3d4b48"/><path d="M50 76L30 109M50 76L70 109M49 42L23 72M51 42L77 72" stroke="#ecf5f1" stroke-width="5" stroke-linecap="round"/><path d="M50 35V79" stroke="#e0f0e9" stroke-width="6"/><circle cx="50" cy="24" r="15" fill="#e9bf99" stroke="#172a2b" stroke-width="2"/>${cap?'<path d="M34 18 Q50 3 67 18 L75 19" stroke="#f3eee3" stroke-width="6" fill="none"/>':''}${fight?`<rect x="38" y="64" width="24" height="14" rx="2" fill="${col}"/><circle cx="23" cy="70" r="6" fill="${col}"/><circle cx="77" cy="70" r="6" fill="${col}"/>`:jersey}${num}</svg><div class="name">${ESC(p.name)}</div><div class="sport">${ESC(p.sport)}${p.number?' · #'+ESC(p.number):''}</div></div>`}
function getSnapshot(tick){let best=G.snapshots[0];for(const s of G.snapshots){if(s.tick<=tick)best=s;else break;}return best;}
function aliveAtEvent(index){const alive=new Set(G.roster);for(let j=0;j<=index;j++){const e=G.events[j];if(e.type==='ELIMINATION'&&e.details.eliminated)alive.delete(e.details.eliminated)}return alive;}
function ePosition(id,tick){for(let k=cursor;k>=0;k--){let e=G.events[k];if(e.tick<=tick&&e.details?.location?.[id])return e.details.location[id];}return null;}
function drawMap(tick,participants){const snap=getSnapshot(tick),alive=aliveAtEvent(cursor),focus=new Set(participants),radius=Math.max(.5,11-10.5*Math.pow(tick/220,1.2));let markup=`<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#52715c" opacity=".32"/></pattern></defs><rect width="640" height="400" fill="#24442f"/><rect width="640" height="400" fill="url(#grid)"/><path d="M0 218Q150 150 280 220 T640 215" stroke="#618f9c" stroke-width="26" fill="none"/><rect x="390" y="65" width="90" height="80" rx="3" fill="#777f6b" opacity=".66"/><rect x="99" y="240" width="65" height="51" fill="#696e5c" opacity=".6"/><circle cx="320" cy="200" r="${radius*20}" fill="none" stroke="#e6cf90" stroke-width="3" stroke-dasharray="8 6"/>`;
for(const id of G.roster){if(!alive.has(id))continue;const pos=snap.positions[id]||ePosition(id,tick);if(!pos)continue;const x=20*pos[0],y=20*pos[1],p=G.profiles[id],col=sportColor[p.sport]||'#f5d2a6';markup+=`<g transform="translate(${x},${y})" aria-label="${ESC(p.name)}"><circle r="${focus.has(id)?17:13}" fill="${focus.has(id)?'#f0dd99':'#112b1f'}"/><circle r="10" fill="${col}"/><path d="M0-4V4M-5 0H5M0 4L-4 8M0 4L4 8" stroke="#132c24" stroke-width="2"/>${p.number?`<text y="3" font-size="8" font-weight="900" text-anchor="middle" fill="#101e19">${ESC(p.number)}</text>`:''}<text y="-18" font-size="9" text-anchor="middle" fill="#f8fcef" stroke="#213429" stroke-width=".35" paint-order="stroke">${ESC(p.name.split(' ').slice(-1)[0])}</text></g>`}
$('map').innerHTML=markup;}
function explain(event){if(event.details?.check){const c=event.details.check;return `Check: ${ESC(c.a_check)} vs ${ESC(c.b_check)} · predicted A success: ${Math.round(c.probability_a*100)}% · seeded roll: ${ESC(c.roll)} · resolved: ${ESC(G.profiles[c.winner]?.name||'event')} (prototype odds)`;}return `Event ${ESC(event.id)} · virtual tick ${event.tick} · engine-committed event`;}
function show(i){cursor=Math.max(0,Math.min(G.events.length-1,i));let e=G.events[cursor];$('seek').value=cursor;$('eventNumber').textContent=(cursor+1)+' / '+G.events.length;const day=Math.floor(e.tick*15/(60*24))+1;const hh=Math.floor((e.tick*15)%(60*24)/60);$('clock').textContent=`Day ${day} · ${String(hh).padStart(2,'0')}:00`;$('remaining').textContent=aliveAtEvent(cursor).size;const dead=new Set(G.roster.filter(x=>!aliveAtEvent(cursor).has(x)));$('roster').innerHTML=G.roster.map(id=>`<div class="athlete ${dead.has(id)?'dead':''}"><span class="dot"></span><span class="n">${ESC(G.profiles[id].name)}<small>${ESC(G.profiles[id].sport)}</small></span>${G.profiles[id].number?`<span class="tag">#${ESC(G.profiles[id].number)}</span>`:''}</div>`).join('');drawMap(e.tick,e.ids);const parts=e.ids.filter(id=>G.profiles[id]);$('figures').innerHTML=parts.length>6?parts.slice(0,6).map(figure).join('')+'<div class="note">+ more participants in map</div>':parts.map(figure).join('');$('story').innerHTML=`<strong>${ESC(e.type.replaceAll('_',' '))}</strong> — ${ESC(e.story)}`;$('reason').textContent=explain(e);for(const el of document.querySelectorAll('.event'))el.classList.toggle('active',Number(el.dataset.idx)===cursor);const active=document.querySelector('.event.active');if(active)active.scrollIntoView({block:'nearest'});}
function play(){if(timer){clearInterval(timer);timer=null;$('play').textContent='▶ Play';return}timer=setInterval(()=>{if(cursor>=G.events.length-1){play();return}show(cursor+1)},Number($('speed').value));$('play').textContent='⏸ Pause'};
$('feed').innerHTML=G.events.map((e,i)=>`<div class="event" data-idx="${i}"><strong>${ESC(e.type.replaceAll('_',' '))} / TICK ${e.tick}</strong>${ESC(e.story)}</div>`).join('');$('feed').addEventListener('click',event=>{const el=event.target.closest('.event');if(el)show(Number(el.dataset.idx))});$('back').onclick=()=>show(cursor-1);$('next').onclick=()=>show(cursor+1);$('play').onclick=play;$('seek').oninput=e=>show(Number(e.target.value));$('speed').onchange=()=>{if(timer){play();play()}};show(0);
</script></body></html>'''
(ROOT/'preview'/'index.html').write_text(page.replace('__DATA__',emb),encoding='utf-8')
print('preview:',(ROOT/'preview'/'index.html').stat().st_size,'bytes','events',len(events),'svg:',len(svg),'bytes')
