'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('<script src="ui/survival-ai-v21.js"></script>'));
assert(html.includes('<script src="ui/pathfinding-v22.js"></script>'));
const roster=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const main=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
assert(main,'original engine preserved');
const document={readyState:'loading',addEventListener(){},getElementById(){return {style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},innerHTML:'',value:'',addEventListener(){}}},querySelector(){return null}};
const ctx=vm.createContext({console,Math,Date,document,setTimeout,clearTimeout,crypto:{getRandomValues(a){a[0]=42;return a}}});ctx.window=ctx;
vm.runInContext(main[1].replace(/\ninit\(\);\s*$/,''),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/survival-ai-v21.js'),'utf8'),ctx);
const engine=vm.runInContext('Simulation',ctx),baselineMove=engine.prototype.move;
vm.runInContext(fs.readFileSync(path.join(root,'ui/pathfinding-v22.js'),'utf8'),ctx);
const api=ctx.LastLegendPathfinding;
assert.equal(api.version,'22.0');
assert.notEqual(engine.prototype.move,baselineMove);
const ids=roster.slice(0,14).map(a=>a.id),sim=new engine(ids,roster,perks,{seed:921,arena:'CITY'});
const a=sim.actors.get(ids[0]),obstacle={x:16,y:10,radius:.95,type:'building'};
sim.map.landmarks=[{x:16,y:10,size:1.7,type:'building'}];
a.x=11;a.y=10;a.intent='GO_CENTER';
const dest={x:21,y:10},route=api.waypoint(sim,a,dest);
assert(route.avoided,'route must avoid a blocking city building');
assert(Math.abs(route.y-10)>.4,'steer past the building');
const direct=Math.hypot(a.x-dest.x,a.y-dest.y);
engine.prototype.move.call(sim,a,dest.x,dest.y);
assert(Math.abs(a.y-10)>.01,'position must actually change direction, not merely a presentation arrow');
assert(Math.hypot(a.x-11,a.y-10)<direct);
a.x=29;a.y=16;a.intent='ESCAPE_ZONE';
const urgent=api.waypoint(sim,a,{x:16,y:10});
assert.equal(urgent.avoided,false,'storm evacuation must bypass scenic detours');
const before=Math.hypot(a.x-16,a.y-10);
sim.move(a,16,10,true);
assert(Math.hypot(a.x-16,a.y-10)<before,'storm escape makes progress');
for(const arena of ['WILDERNESS','CITY','RUINS','FROZEN']){
 for(const seed of [222,923]){
  const run=()=>new engine(ids,roster,perks,{seed,arena}).run();
  const first=run(),second=run();
  assert.equal(first.winner,second.winner,arena+' seeded winner');
  assert.equal(JSON.stringify(first.frames),JSON.stringify(second.frames),arena+' replay determinism');
  assert.equal(first.frames.at(-1).alive.length,1,'single champion');
  for(const frame of first.frames){
    for(const actor of Object.values(frame.actors)){
      assert(actor.x>=0&&actor.x<=31&&actor.y>=0&&actor.y<=19,'world bounds');
      assert(Number.isFinite(actor.x)&&Number.isFinite(actor.y),'coordinates remain finite');
    }
  }
 }
}
console.log('V22 PATHFINDING PASS: true steered coordinates, storm-escape priority, deterministic matches across four biomes');
