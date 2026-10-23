const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const inline=(id)=>JSON.parse(html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)<\\/script>`))[1]);
const athletes=inline('INLINE_ATHLETES'),perks=inline('INLINE_PERKS');
const src=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1].replace(/init\(\);\s*$/,'');
const els={};const mk=()=>({value:'12',textContent:'',innerHTML:'',disabled:false,style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},addEventListener(){}});
const document={getElementById(id){return els[id]??(els[id]=mk());},querySelector:()=>mk(),querySelectorAll:()=>[]};
const ctx=vm.createContext({document,console,Math,Set,Map,Date});
vm.runInContext(src+'\nglobalThis.API={Simulation,opts,chooseSize,renderSlots,loadDemo,toggle,buttonDisabled,renderFrame,renderEncounter,narrate}',ctx,{timeout:10000});
const {Simulation,opts}=ctx.API;
assert.equal(athletes.length,500);assert.equal(new Set(athletes.map(a=>a.id)).size,500);
opts.profiles=new Map(athletes.map(a=>[a.id,a]));opts.athletes=athletes;opts.perks=perks;
let count=0,group=0,diverse=new Set();
for(const size of [2,3,4,8,12,18,24]){
 let ids=athletes.slice(0,size).map(x=>x.id);
 for(let seed=1;seed<=10;seed++){
  const m=new Simulation(ids,athletes,perks,{seed,arena:seed%2?'WILDERNESS':'CITY',mode:seed%3===0?'CHAOS':'BALANCED'}).run();
  assert.equal(m.roster.length,size);assert.equal(m.placements.length,size);assert.equal(new Set(m.placements).size,size);
  assert.equal(m.events.filter(e=>e.type==='ELIMINATION').length,size-1);
  assert.equal(m.frames.at(-1).alive.length,1);assert.equal(m.winner,m.frames.at(-1).alive[0]);
  assert.equal(m.events.find(e=>e.type==='MATCH_START').participants.length,size);
  if(seed===1)assert.deepStrictEqual(JSON.parse(JSON.stringify(m)),JSON.parse(JSON.stringify(new Simulation(ids,athletes,perks,{seed,arena:'WILDERNESS',mode:'BALANCED'}).run())));
  group+=m.events.filter(e=>e.type==='GROUP_SKIRMISH').length;
  if(size===24)diverse.add(m.winner);
  count++;
 }
 ctx.API.chooseSize(size);
 assert.equal(opts.matchSize,size);
 assert.equal(els['draft-slots'].innerHTML.match(/class="slot(?: filled)?"/g)?.length,size);
 ctx.API.loadDemo();
 assert.equal(opts.selected.length,size);
 assert.equal(els['start'].disabled,false);
 if(size>2){ctx.API.chooseSize(size-1);assert.equal(opts.selected.length,size-1);assert.equal(els['start'].disabled,false);}
}
assert.throws(()=>new Simulation(athletes.slice(0,1).map(x=>x.id),athletes,perks),/2.*24/);
assert.throws(()=>new Simulation(athletes.slice(0,25).map(x=>x.id),athletes,perks),/2.*24/);
assert.throws(()=>new Simulation([athletes[0].id,athletes[0].id],athletes,perks),/unique/);
console.log(JSON.stringify({passed:true,matchCount:count,sizes:[2,3,4,8,12,18,24],groupEvents:group,uniqueChampionsAt24:diverse.size,roster:athletes.length},null,2));
