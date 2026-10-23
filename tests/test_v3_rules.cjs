const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const inline=(id)=>JSON.parse(html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)<\\/script>`))[1]);
const athletes=inline('INLINE_ATHLETES'),perks=inline('INLINE_PERKS');
let src=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1].replace(/init\(\);\s*$/,'');
let ctx=vm.createContext({document:{getElementById(){return{}},querySelector(){return{}},querySelectorAll(){return[]}},console,Math,Set,Map,Date});
vm.runInContext(src+'\nglobalThis.API={Simulation,generateMap,narrate}',ctx,{timeout:10000});
const {Simulation,generateMap,narrate}=ctx.API;
let allianceFails=[],mapFails=[],badEvents=[],sample,series=0,types=new Set(),champions=new Set(),previews=[];
const roster=athletes.slice(0,24).map(x=>x.id);
for(let size of [2,3,4,8,12,18,24])for(let seed=1;seed<=20;seed++){
 let ids=roster.slice(0,size);let opt={seed,arena:['CITY','RUINS','FROZEN','WILDERNESS'][seed%4],mode:'BALANCED'};
 let sim=new Simulation(ids,athletes,perks,opt).run();series++;sample??=sim;
 assert.equal(sim.roster.length,size);assert.equal(sim.placements.length,size);
 assert.equal(sim.events.filter(e=>e.type==='ELIMINATION').length,size-1);
 assert.equal(sim.frames.at(-1).alive.length,1);
 assert.equal(sim.events.filter(e=>e.type==='CHAMPION').length,1);
 assert.equal(sim.map.seed,seed);assert.equal(sim.map.caches.length,10);assert.equal(sim.map.landmarks.length,48);
 if(sim.events.some(e=>e.type==='ALLIANCE'&&e.aliveAtEvent<4))allianceFails.push([size,seed]);
 if(sim.events.filter(e=>e.type==='FINAL_BETRAYAL').length>1)badEvents.push([size,seed]);
 if(size===24){champions.add(sim.winner);previews.push(JSON.stringify(sim.map.landmarks.slice(0,5)));}
 for(let e of sim.events){types.add(e.type);let story=narrate(e,new Map(athletes.map(a=>[a.id,a])));if(!story||typeof story!=='string')throw Error('bad narration');}
 if(seed===1){const again=new Simulation(ids,athletes,perks,opt).run();assert.equal(JSON.stringify(sim),JSON.stringify(again),'not seeded reproducible');}
}
assert.equal(allianceFails.length,0,JSON.stringify(allianceFails));assert.equal(badEvents.length,0,JSON.stringify(badEvents));
assert(new Set(previews).size>10,'fixed maps or too little variation');
for(const type of ['STORM','TRAP','LUCKY_FIND','SHELTER','AMBUSH','GROUP_SKIRMISH','ELIMINATION','CHAMPION','FINAL_BETRAYAL'])assert(types.has(type),`Missing ${type}`);
assert(html.includes('victory-showcase')&&html.includes('figureSVG(a,{victory:true})'));
assert(html.includes('type-recovery')&&html.includes('type-betrayal'));
assert(athletes.length===700&&perks.signatures.length===700);
assert(athletes.filter(a=>a.sport==='Basketball').length>=152);
assert(athletes.filter(a=>a.sport==='American Football').length>=146);
console.log(JSON.stringify({passed:true,matches:series,champions:champions.size,unique24MapLayouts:new Set(previews).size,types:[...types],allianceViolations:0,roster:athletes.length},null,2));
