'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const roster=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\ninit\(\);\s*$/,'');
const ctx=vm.createContext({console,Math,Date,crypto:{getRandomValues:a=>(a[0]=1,a)},setTimeout,clearTimeout,window:{},document:{getElementById:()=>({})}});
vm.runInContext(script,ctx);
const Simulation=vm.runInContext('Simulation',ctx);
const distance=(a)=>Math.hypot(a.x-16,a.y-10);
const arenas=['WILDERNESS','CITY','RUINS','FROZEN'];
const all=roster.map(a=>a.id);
for(const arena of arenas){
 const forced=new Simulation(all.slice(0,12),roster,perks,{seed:20261023,arena});
 const a=forced.actors.get(forced.roster[0]);forced.tick=108;
 a.x=30;a.y=10;a.stamina=0;a.hp=14;a.supplies=2;
 assert(distance(a)>forced.radius());
 assert.equal(forced.plan(a)[0],'ESCAPE_ZONE',arena+': danger must outrank healing and resting');
 const d0=distance(a),plan=forced.plan(a);forced.process(a,plan);
 assert(distance(a)<d0,arena+': first move must point inward despite depleted stamina');
 for(let t=0;t<24&&distance(a)>forced.safeRadius();t++)forced.process(a,forced.plan(a));
 assert(distance(a)<=forced.safeRadius()+1e-8,arena+': escape must reach the safe zone');
 for(const n of [2,12,24,100]){
  const ids=all.slice(0,n);
  const m=new Simulation(ids,roster,perks,{seed:137+22*n,arena}).run();
  const r=new Simulation(ids,roster,perks,{seed:137+22*n,arena}).run();
  assert.equal(m.frames.at(-1).alive.length,1,'one champion');
  assert.equal(m.placements.length,n,'unique placements');
  assert.equal(new Set(m.placements).size,n,'placements unique');
  assert.equal(m.events.filter(e=>e.type==='ELIMINATION').length,n-1);
  assert.equal(m.winner,r.winner,'champion deterministic');
  assert.equal(JSON.stringify(m.events),JSON.stringify(r.events),'event sequence deterministic');
  for(const frame of m.frames){
   for(const a of Object.values(frame.actors)){
    assert(Number.isFinite(a.x)&&Number.isFinite(a.y));
    assert(a.x>=0&&a.x<=31&&a.y>=0&&a.y<=19,'valid map coordinates');
   }
  }
 }
}
console.log('V9 STORM SURVIVAL PASS: emergency escape priority, low-stamina movement, safe-zone convergence, 4 biomes × 2/12/24/100 entrants, deterministic champion/events');
