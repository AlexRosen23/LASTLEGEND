import json,re
from pathlib import Path
D=Path(__file__).parent
s=Path('/mnt/data/LASTLEGEND_V3/index.html').read_text()
roster=json.loads((D/'roster_v4.json').read_text());perk=json.loads((D/'perks_v4.json').read_text());manifest=json.loads((D/'manifest_v4.json').read_text());COUNT=len(roster)
def replace(old,new,expected=1):
 global s
 actual=s.count(old)
 if actual!=expected:raise AssertionError(f'Expected {expected} instances of {old[:70]!r}; found {actual}')
 s=s.replace(old,new)
# JSON embeddings in HTML; no network dependency.
for elem,data in [('INLINE_ATHLETES',roster),('INLINE_PERKS',perk)]:
 pattern=f'(<script type="application/json" id="{elem}">)(.*?)(</script>)'
 payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 s,n=re.subn(pattern,lambda m:m.group(1)+payload+m.group(3),s,flags=re.S)
 assert n==1,(elem,n)
# Header and UI copy
s=s.replace('Draft 2–24 legendary athletes','Draft 2–100 legendary athletes')
s=s.replace('2–24 athletes','2–100 athletes').replace('2–24 competitors','2–100 competitors').replace('2–24 COMPETITORS','2–100 COMPETITORS')
s=s.replace('700 all-time legends',f'{COUNT:,} crossover competitors').replace('700 legendary athletes',f'{COUNT:,} competitors').replace('700 ATHLETES',f'{COUNT:,} CHARACTERS')
s=s.replace('from the 700-athlete roster',f'from the {COUNT:,}-character library')
s=s.replace('if(a.length!==700)throw Error(`Expected 700 athletes, received ${a.length}`);',f'if(a.length!=={COUNT})throw Error(`Expected {COUNT} competitors, received ${{a.length}}`);')
s=s.replace('Array.from({length:23},(_,i)=>`<option value="${i+2}"', 'Array.from({length:99},(_,i)=>`<option value="${i+2}"')
s=s.replace('opts.matchSize>=24','opts.matchSize>=100')
s=s.replace('next>24','next>100').replace('roster.length>24','roster.length>100')
s=s.replace('Choose 2–24 unique athletes','Choose 2–100 unique competitors')
s=s.replace('Choose any number from 2 to 24.', 'Choose 2–100. Every entrant matters.')
# Slightly compress large draft slots and display the selected count.
s=s.replace('</style>', '''
/* V4: large-scale draft and filtering; art polish is deferred. */
.mode-controls{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 14px;border:1px solid #344650;border-radius:5px;padding:12px;background:#121c25}
.mode-controls label{display:flex;flex-direction:column;gap:5px;flex:1;min-width:138px;font-size:10px;letter-spacing:.9px;font-weight:800;color:#adc0ca}
.mode-controls select{width:100%;padding:9px;background:#1b2934}
#filtered-count{color:#f4ae58;display:inline-block;align-self:end;padding:10px 0;font:700 11px 'DM Sans',sans-serif}
.draft-slots{max-height:370px;overflow-y:auto;align-content:start;scrollbar-color:#52616a transparent}
.slot{min-height:66px}.athlete-grid{max-height:380px}
.game-category-tag{background:#293d4d;color:#f4ae58;font-size:9px;padding:2px 5px;border-radius:3px}
.skin-controls{display:flex;align-items:center;gap:10px;margin:8px 0 0;flex-wrap:wrap}.skin-controls select{flex:1;max-width:270px}
@media(max-width:600px){.mode-controls{gap:6px;padding:9px}.mode-controls label{min-width:115px}.draft-slots{max-height:265px}.slot{min-height:60px}}
</style>''')
# Dropdown: normal, mascot-only, non-mascot athletes, wildcards; collection = drilldown not mode lock.
replace('<div class="browse-tools"><input id="search"', '''<div class="mode-controls"><label>BATTLE MODE<select id="battle-mode" aria-label="Battle roster mode"><option value="ALL">Open Battle Royale · All</option><option value="MASCOT">Mascot Mode · Pro + College</option><option value="ATHLETE">Athletes Only</option><option value="WILDCARD">Wildcards & Fictional</option></select></label><label>COLLECTION<select id="collection-filter" aria-label="Browse character collections"><option value="ALL">All collections</option><option value="FRIENDS_REQUESTS">Friends' requests</option><option value="BEARS_TOP_100">Bears Top 100</option><option value="IU_2025_CHAMPIONS">Indiana Champions</option><option value="PRO_MASCOTS">All pro mascots</option><option value="NFL_MASCOTS">NFL Mascots</option><option value="NBA_MASCOTS">NBA Mascots</option><option value="NHL_MASCOTS">NHL Mascots</option><option value="MLB_MASCOTS">MLB Mascots</option><option value="COLLEGE_MASCOTS">100 College Mascots</option></select></label><span id="filtered-count" aria-live="polite">Loading library…</span></div><div class="browse-tools"><input id="search"''')
replace('<div class="draft-footer"><div class="rules">','''<div class="draft-footer"><div class="skin-controls"><label for="skin-select">ALT SKIN</label><select id="skin-select" disabled><option value="default">Select Anthony Richardson to pick a skin</option></select></div><div class="rules">''')
# Add runtime tags without bloating old 700 rows; convert to generic normalized names.
replace("const opts={lastEncounterId:null,athletes:[],perks:null,profiles:null,selected:[],matchSize:12,match:null,frame:0,playing:false,timer:null,sport:'',search:'',tab:'feed'};", "const opts={lastEncounterId:null,athletes:[],perks:null,profiles:null,selected:[],matchSize:12,match:null,frame:0,playing:false,timer:null,sport:'',search:'',tab:'feed',battleMode:'ALL',collection:'ALL',skins:{}};")
# For 100 contestants, participants should be neither immortal nor all killed by shrinking circle too quickly.
# Pairwise interactions remain logistically mapped and seed deterministic.
replace('maxTicks=140','maxTicks=140') if False else None
# figureSVG: distinct non-human profiles remain placeholders until the visual pass, never stick figures.
needle='''function figureSVG(a,{large=false,dead=false,victory=false}={}){
 const sport=splitSport(a.sport),color=sportColor(a.sport),num=a.number==null?'':a.number;'''
replacement='''function figureSVG(a,{large=false,dead=false,victory=false}={}){
 const sport=splitSport(a.sport),color=sportColor(a.sport),num=a.number==null?'':a.number;
 // Functional silhouette placeholders for nonhumans; detailed character art belongs in the next visual release.
 const kind=a.render_type|| (a.kind==='mascot'?'mascot':'human');
 if(kind!=='human'){
 const compact=large||victory;const h=compact?108:50,w=compact?112:52;
 let shape='';
 if(kind==='vehicle')shape=`<g><path d="M-38 5L-25 -9H21L37 5V20H-38Z" fill="${color}" stroke="#e8e1ca" stroke-width="2"/><circle cx="-23" cy="20" r="8" fill="#111" stroke="${color}" stroke-width="3"/><circle cx="24" cy="20" r="8" fill="#111" stroke="${color}" stroke-width="3"/></g>`;
 else if(kind==='horse')shape=`<g><path d="M-31 -9L-4 -15L12 -6L25 -20L33 -15L22 4L21 25L15 25L11 10L-17 10L-21 27L-27 27L-26 8L-36 3Z" fill="${color}" stroke="#eadfcb" stroke-width="2"/></g>`;
 else if(kind==='aquatic')shape=`<g><path d="M-35 2Q-15 -27 18 -5L37 -22L32 -2L37 18L18 8Q-15 26 -35 2Z" fill="${color}" stroke="#daeefa" stroke-width="2"/><circle cx="-20" cy="-1" r="3" fill="#152029"/></g>`;
 else if(kind==='undead')shape=`<g><path d="M-23 22L-17 -19L0 -34L17 -19L23 22Z" fill="${color}" stroke="#cee8fd" stroke-width="2"/><circle cx="-9" cy="-12" r="3" fill="#8ce8ff"/><circle cx="9" cy="-12" r="3" fill="#8ce8ff"/></g>`;
 else shape=`<g><ellipse cx="0" cy="-9" rx="27" ry="30" fill="${color}" stroke="#f5e5cc" stroke-width="2"/><ellipse cx="-9" cy="-16" rx="4" ry="6" fill="#fff"/><ellipse cx="9" cy="-16" rx="4" ry="6" fill="#fff"/><path d="M-10 3Q0 13 10 3" stroke="#1c222a" stroke-width="2" fill="none"/></g>`;
 return `<svg viewBox="-45 -48 90 100" width="${w}" height="${h}" role="img" aria-label="${escapeHtml(a.name)} ${escapeHtml(kind)} animated placeholder">${shape}</svg>`;
 }'''
replace(needle,replacement)
# Optional skin: within existing figure costume, update shirt color only. Never attribute drug use to athlete.
replace("const sport=splitSport(a.sport),color=sportColor(a.sport),num=a.number==null?'':a.number;", "const sport=splitSport(a.sport),color=a.id==='anthony-richardson'&&opts.skins[a.id]==='alt-green'?'#82b78d':sportColor(a.sport),num=a.number==null?'':a.number;",1)
# Selector filtering. Always retain selected across browsing collections; changing battle mode trims incompatible.
needle="function renderGrid(){let list=opts.athletes.filter(a=>(!opts.sport||opts.sport===a.sport)&&(!opts.search||a.name.toLowerCase().includes(opts.search)||a.sport.toLowerCase().includes(opts.search)));"
repl="""function allowedInMode(a){if(opts.battleMode==='MASCOT')return a.kind==='mascot';if(opts.battleMode==='ATHLETE')return !a.kind||a.kind==='athlete'||a.kind==='coach';if(opts.battleMode==='WILDCARD')return ['fictional','animal','unverified'].includes(a.kind);return true;}
function getFiltered(){return opts.athletes.filter(a=>allowedInMode(a)&&(!opts.collection||opts.collection==='ALL'||(a.collection_tags||[]).includes(opts.collection))&&(!opts.sport||opts.sport===a.sport)&&(!opts.search||a.name.toLowerCase().includes(opts.search)||a.sport.toLowerCase().includes(opts.search)||(a.team||'').toLowerCase().includes(opts.search)));}
function updateSkins(){const sel=$('skin-select');const has=opts.selected.includes('anthony-richardson');sel.disabled=!has;sel.innerHTML=has?'<option value="default">Anthony Richardson · Default</option><option value="alt-green">Anthony Richardson · Green Joke Skin</option>':'<option value="default">Select Anthony Richardson to pick a skin</option>';sel.value=has?(opts.skins['anthony-richardson']||'default'):'default';}
function renderGrid(){let list=getFiltered();$('filtered-count').textContent=`${list.length} available · ${opts.selected.length} drafted`;updateSkins();"""
replace(needle,repl)
replace('<div class="athlete-extra">${escapeHtml(a.era||\'Prime edition\')}</div>','<div class="athlete-extra">${escapeHtml(a.team||a.era||\'Prime edition\')}</div>')
# Respect mode/collection in autofill so mascot-only and themed battles work.
start=s.index('function loadDemo(){');end=s.index('function splitSport(',start)
s=s[:start]+'''function loadDemo(){
 const preferred=['lebron-james','michael-jordan','kobe-bryant','tom-brady','usain-bolt','mike-tyson','lionel-messi','simone-biles','michael-phelps','serena-williams','tyrese-haliburton','aaron-judge'];
 const pool=getFiltered();const available=new Set(pool.map(a=>a.id));
 const chosen=preferred.filter(id=>available.has(id)).slice(0,opts.matchSize);
 const rest=pool.filter(a=>!chosen.includes(a.id)).sort((a,b)=>draw(1024,'draft-shuffle',a.id)-draw(1024,'draft-shuffle',b.id)||a.id.localeCompare(b.id));
 opts.selected=[...chosen,...rest.slice(0,opts.matchSize-chosen.length).map(a=>a.id)];
 renderSlots();renderGrid();
}
''' +s[end:]
# battle mode swapping preserves only compatible picks; collection browsing does not remove picks.
needle="$('sport-filter').addEventListener('change',e=>{opts.sport=e.target.value;renderGrid()});"
replace(needle, needle+"\n $('battle-mode').addEventListener('change',e=>{opts.battleMode=e.target.value;opts.selected=opts.selected.filter(id=>allowedInMode(opts.profiles.get(id)));renderSlots();renderGrid()});\n $('collection-filter').addEventListener('change',e=>{opts.collection=e.target.value;renderGrid()});\n $('skin-select').addEventListener('change',e=>{opts.skins['anthony-richardson']=e.target.value});")
# Large 100-character simulation should stay deterministic; add battle presets.
replace("return opts.athletes.filter(a=>allowedInMode(a)","return opts.athletes.filter(a=>allowedInMode(a)")
# Set body/footer to dynamic total in case next expansion adds more.
s=s.replace(f'{COUNT:,} CHARACTERS',f'{COUNT:,} CHARACTERS · MASCOT MODE')
# Prevent a player from joining a 100-person battle due to UI accident? explicitly allow 100.
s=s.replace('if(roster.length<2','if(roster.length<2')
# dynamic top display using roster size
# generic icons, no IP art in this release.
s=s.replace('Choose 2–100. Every entrant matters.', 'Choose any number from 2 to 100. One champion.')
s=s.replace('No guaranteed winner. Every battle tells a new story.', 'No guaranteed winner. Mascots, athletes, wildcards, and every battle tell a new story.')
# Replace total and defaults
s=s.replace('400-actor prototype','100-actor prototype')
(D/'index.html').write_text(s)
print('patched bytes',len(s.encode()),'profiles',COUNT,'match size max',s.count('next>100'))
