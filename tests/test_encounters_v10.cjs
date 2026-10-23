'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const roster=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const main=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\ninit\(\);\s*$/,'');
const document={readyState:'loading',getElementById:()=>null,addEventListener(){}};
const ctx=vm.createContext({console,Math,Date,document,setTimeout,clearTimeout,crypto:{getRandomValues:a=>(a[0]=1,a)}});ctx.window=ctx;
vm.runInContext(main,ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/encounters-v10.js'),'utf8'),ctx);
const catalog=ctx.LastLegendEncounters.catalog,api=ctx.LastLegendEncounters,Sim=vm.runInContext('Simulation',ctx);
const groups={};for(const s of catalog)groups[s.category]=(groups[s.category]||0)+1;
assert.deepEqual(groups,{realistic:110,comic:100,identity:100,nonhuman:85,brutal:65,mature:40});
assert.equal(catalog.length,500);
assert.equal(new Set(catalog.map(s=>s.id)).size,500,'scenario IDs must be stable and distinct');
assert.equal(new Set(catalog.map(s=>[s.category,s.action,s.arena,s.location,s.prop,s.sport,s.body].join('|'))).size,500,'500 distinct choreography contexts');
assert(catalog.every(s=>s.name&&s.actionText&&s.types.length&&s.intensity));
assert(html.includes('id="scene-intensity"')&&html.includes('ui/encounters-v10.js'));
const ids=roster.map(a=>a.id);
const sim=new Sim(ids.slice(0,24),roster,perks,{seed:20261023,arena:'WILDERNESS'});
const synthetic={id:4,tick:3,type:'SKIRMISH',participants:sim.roster.slice(0,2),detail:{}};
assert.equal(api.getIntensity(),'standard');
assert(api.eligible(synthetic,sim).length>0);
assert(api.eligible(synthetic,sim).every(s=>!['brutal','mature'].includes(s.category)));
const a=api.select(synthetic,sim);assert.equal(api.select(synthetic,sim).id,a.id);
assert(api.describe({...synthetic,encounterId:a.id},sim.db).length>10);
api.setIntensity('intense');
assert(api.eligible(synthetic,sim).some(s=>s.category==='brutal'));
assert(!api.eligible(synthetic,sim).some(s=>s.category==='mature'));
api.setIntensity('graphic');assert(api.eligible(synthetic,sim).some(s=>s.category==='mature'));
api.setIntensity('standard');
const horse=roster.find(a=>a.render_type==='horse'),car=roster.find(a=>a.render_type==='vehicle'),aquatic=roster.find(a=>a.render_type==='aquatic'),mascot=roster.find(a=>a.render_type==='mascot'),undead=roster.find(a=>a.render_type==='undead');
for(const p of [horse,car,aquatic,mascot,undead])assert(p,'all nonhuman archetypes represented');
const types=[horse,car,aquatic,mascot,undead].map(x=>x.id);
const zoo=new Sim(types,roster,perks,{seed:44,arena:'WILDERNESS'});
for(const p of [horse,car,aquatic,mascot,undead]){
 const e={id:32,tick:2,type:'CONTACT',participants:[p.id],detail:{}};
 assert(api.eligible(e,zoo).some(s=>s.category==='nonhuman'&&s.body===p.render_type),p.name);
}
for(const arena of ['WILDERNESS','CITY','RUINS','FROZEN']){
 const players=ids.slice(0,24);
 const m=new Sim(players,roster,perks,{seed:20261023,arena}).run();
 assert(m.events.some(e=>e.encounterId),'scenarios must be attached to actual logged events');
 for(const e of m.events.filter(e=>e.encounterId)){
  const scene=api.byId(e.encounterId);assert(scene);
  assert(api.eligible(e,{db:new Map(roster.map(a=>[a.id,a])),arena}).some(s=>s.id===scene.id),'event type, arena, body and sport must match scene');
  assert(scene.intensity==='standard','non-graphic default');
  for(const id of e.participants)assert(players.includes(id),'no fabricated participants');
 }
 const originalApi=ctx.LastLegendEncounters;ctx.LastLegendEncounters=null;
 const base=new Sim(players,roster,perks,{seed:20261023,arena}).run();
 ctx.LastLegendEncounters=originalApi;
 assert.equal(m.winner,base.winner,'scenes must not affect the champion');
 assert.equal(JSON.stringify(m.frames),JSON.stringify(base.frames),'scenes must not affect positions, HP or eliminations');
 const plain=m.events.map(e=>{let x={...e};delete x.encounterId;return x});
 assert.equal(JSON.stringify(plain),JSON.stringify(base.events),'scenes must not change recorded outcomes');
}
console.log('V10 ENCOUNTERS PASS: exactly 500 distinct contextual scenarios, body/sport gating, 18+ explicit opt-in, deterministic IDs, unchanged outcomes, 4 arena runtime integration');
