'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const athletes=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const main=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
assert(main,'main engine intact');
const document={readyState:'loading',addEventListener(){},getElementById(){return {style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},innerHTML:'',value:'',addEventListener(){}}},querySelector(){return null}};
const ctx=vm.createContext({console,Math,Date,document,setTimeout,clearTimeout,crypto:{getRandomValues(a){a[0]=42;return a}}});ctx.window=ctx;
vm.runInContext(main[1].replace(/\ninit\(\);\s*$/,''),ctx);
const before=vm.runInContext('Simulation.prototype.plan',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/survival-ai-v21.js'),'utf8'),ctx);
assert.equal(ctx.LastLegendSurvivalAI.version,'21.0');
const after=vm.runInContext('Simulation.prototype.plan',ctx);
assert.notEqual(before,after,'policy must actually change');
const get=x=>vm.runInContext(x,ctx);
const Sample=get('Simulation');
const roster=athletes.slice(0,12).map(a=>a.id);
const create=(seed,arena='WILDERNESS')=>new Sample(roster,athletes,perks,{seed,arena,mode:'BALANCED'});
const m=create(42),a=m.actors.get(roster[0]);
a.x=30;a.y=16;a.hp=14;a.supplies=2;
assert.deepEqual(Array.from(m.plan(a)),['ESCAPE_ZONE',null],'zone survival overrides healing and pursuit');
a.x=16;a.y=10;a.hp=15;a.supplies=1;
assert.deepEqual(Array.from(m.plan(a)),['HEAL',null],'emergency healing in safety');
const allowed=new Set(['ESCAPE_ZONE','HEAL','REST','LINK','APPROACH','EVADE','OBSERVE','NEGOTIATE','GO_CACHE','TAKE_CACHE','GO_CENTER','MOVE']);
for(const arena of ['WILDERNESS','CITY','RUINS','FROZEN']){
 for(const seed of [42,20261023]){
  const sim=create(seed,arena),out=sim.run();
  assert.equal(out.winner!=null,true,arena+' champion exists');
  assert.equal(sim.alive().length,1,arena+' sole survivor');
  assert(sim.frames.length>15,arena+' full simulation');
  for(const item of sim.events){assert(item.tick>=0&&item.participants.every(x=>typeof x==='string'))}
  const twin=create(seed,arena).run();
  assert.equal(JSON.stringify(out.frames),JSON.stringify(twin.frames),arena+' deterministic frames');
  assert.equal(out.winner,twin.winner,arena+' same winner for same seed');
 }
}
assert(fs.readFileSync(path.join(root,'ui/survival-ai-v21.css'),'utf8').includes('prefers-reduced-motion'));
assert(html.includes('ui/survival-ai-v21.js'));
console.log('V21 SURVIVAL AI PASS: real plan replacement, hazard priority, emergency healing, 4 arenas, 8 seeded matches and deterministic replays');
