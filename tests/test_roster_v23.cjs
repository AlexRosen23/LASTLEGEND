'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const base=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
assert.equal(base.length,1203,'original library remains embedded and unchanged');
const ctx=vm.createContext({console,Math,Date,setTimeout,clearTimeout,crypto:{getRandomValues(a){a[0]=42;return a}},document:{readyState:'loading',addEventListener(){},getElementById(){return {style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},value:'',innerHTML:'',addEventListener(){}}},querySelector(){return null}}});ctx.window=ctx;
vm.runInContext(fs.readFileSync(path.join(root,'ui/roster-expansion-v23.js'),'utf8'),ctx);
const addon=ctx.LastLegendRosterV23;assert.equal(addon.version,'23.0');assert.equal(addon.candidateCount,442);
const first=addon.install(base,perks);assert.equal(first.added,442);assert.equal(first.total,1645);
const repeated=addon.install(base,perks);assert(repeated.alreadyInstalled);assert.equal(base.length,1645);
const additions=base.filter(x=>x.collection_tags?.includes('EXPANSION_V23'));
assert.equal(additions.length,442);assert.equal(new Set(additions.map(x=>x.sport)).size,16);
assert.equal(new Set(base.map(a=>a.id)).size,base.length);
assert.equal(new Set(perks.signatures.map(a=>a.athlete_id)).size,base.length);
assert.equal(perks.signatures.length,base.length);
const canonical=n=>n.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
assert.equal(new Set(base.map(a=>canonical(a.name))).size,base.length,'new names must not duplicate original names');
const ratingFields=Object.keys(base[0].ratings),behaviorFields=Object.keys(base[0].behavior);
const sig=new Map(perks.signatures.map(x=>[x.athlete_id,x]));
for(const a of additions){
 assert.equal(Object.keys(a.ratings).length,20,'complete stat spread '+a.id);
 assert.equal(Object.keys(a.behavior).length,5,'complete fictional tendencies '+a.id);
 assert(ratingFields.every(k=>Number.isInteger(a.ratings[k])&&a.ratings[k]>=20&&a.ratings[k]<=100),a.id);
 assert(behaviorFields.every(k=>Number.isInteger(a.behavior[k])&&a.behavior[k]>=0&&a.behavior[k]<=100),a.id);
 assert(a.secondary?.length===2,a.id+' secondary abilities');
 assert(sig.has(a.id)&&sig.get(a.id).id===a.perk,a.id+' signature linked');
 assert(a.verification_status==='PENDING_INDEPENDENT_REVIEW');
 assert(a.data_quality?.personality_is_fictional);
 assert(a.number==null,'do not invent jersey number');
 assert(a.kind==null||a.kind==='athlete','human athlete, not accidental animal/mascot');
}
for(const sport of Object.keys(first.bySport))assert(first.bySport[sport]>=10,sport+' reasonable coverage');
for(const name of ['Yao Ming','Sue Bird','Josh Allen','David Beckham','Juan Soto','Oleksandr Usyk','Andy Murray','Nathan MacKinnon','Léon Marchand']){
 const record=additions.find(x=>x.name===name);
 if(record)assert(sig.has(record.id),name+' playable signature');
}
const main=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
assert(main,'authoritative engine remains embedded');
vm.runInContext(main[1].replace(/\ninit\(\);\s*$/,''),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/survival-ai-v21.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/pathfinding-v22.js'),'utf8'),ctx);
const Sim=vm.runInContext('Simulation',ctx),ids=additions.slice(0,30).map(x=>x.id);
for(const arena of ['WILDERNESS','CITY','RUINS','FROZEN']){
 const match=new Sim(ids,base,perks,{seed:20261023,arena}).run();
 assert.equal(match.placements.length,30,arena+' every entrant ranked');
 assert.equal(match.frames.at(-1).alive.length,1);
 assert.equal(new Set(match.placements).size,30);
 const twin=new Sim(ids,base,perks,{seed:20261023,arena}).run();
 assert.equal(match.winner,twin.winner);
 assert.equal(JSON.stringify(match.events),JSON.stringify(twin.events));
}
console.log('V23 ROSTER PASS: 442 candidate athletes, 16 sports, 20 stats each, 5 behaviors each, linked signatures and secondaries, no duplicates; 4 deterministic 30-player matches');
