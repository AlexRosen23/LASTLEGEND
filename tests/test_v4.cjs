const fs=require('fs'),vm=require('vm'),assert=require('assert'),performance=require('perf_hooks').performance;
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const roster=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const script=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1].replace(/\ninit\(\);\s*$/,'');
const ctx=vm.createContext({console,Math,Date,crypto:{getRandomValues:a=>(a[0]=21234,a)},setTimeout,clearTimeout,window:{},document:{getElementById:()=>({})}});
vm.runInContext(script,ctx);const Sim=vm.runInContext('Simulation',ctx);const generateMap=vm.runInContext('generateMap',ctx);const catalogue=vm.runInContext('getFiltered',ctx);const opts=vm.runInContext('opts',ctx);
function match(ids,seed,arena='WILDERNESS'){const t=performance.now(),m=new Sim(ids,roster,perks,{seed,arena}).run();const sec=(performance.now()-t)/1000;assert.equal(m.roster.length,ids.length);assert.equal(m.placements.length,ids.length);assert.equal(new Set(m.placements).size,ids.length);assert.equal(m.events.filter(e=>e.type==='ELIMINATION').length,ids.length-1);assert.equal(m.frames.at(-1).alive.length,1);for(const e of m.events){if(e.type==='ALLIANCE'){let snap=m.frames.filter(f=>f.tick<=e.tick).at(-1);assert(snap.alive.length>=4,'Late alliance!')}}return{m,sec}}
const ids=roster.map(x=>x.id);const name=n=>roster.find(a=>a.name===n);
assert.equal(ids.length,1203);assert.equal(new Set(ids).size,1203);assert.equal(perks.signatures.length,1203);assert.equal(roster.filter(a=>a.collection_tags?.includes('COLLEGE_MASCOTS')).length,100);assert.equal(roster.filter(a=>a.collection_tags?.includes('BEARS_TOP_100')).length,100);
assert(name('Andrew Turvy'));assert(name('Hoosier the Bison'));assert(name('Boomer'));assert(name('Boomer Esiason (Prime)'));assert(name('Boomer Esiason (Current)'));assert(name('Secretariat'));assert(name('Ron Turcotte'));assert(name('American Pharoah'));assert(name('Victor Espinoza'));assert(name('Amari Skolnik'));assert(name('Dustin Brown'));
assert(name('Anthony Richardson').skins.length===2);
assert(html.includes('Array.from({length:99}'));assert(html.includes('Mascot Mode · Pro + College'));
opts.athletes=roster;opts.battleMode='MASCOT';opts.collection='ALL';opts.sport='';opts.search='';assert(catalogue().length===258);opts.battleMode='ALL';
let result=[];for(let n of [2,3,4,12,24,50,75,100]){const test=[...roster.filter(a=>a.collection_tags?.includes('FRIENDS_REQUESTS')).map(a=>a.id),...ids].filter((id,i,arr)=>arr.indexOf(id)===i).slice(0,n);const x=match(test,20261023);result.push({n,seconds:+x.sec.toFixed(3),events:x.m.events.length,ticks:x.m.frames.length,winner:x.m.winner});if(n===100){const y=match(test,20261023);assert.equal(y.m.winner,x.m.winner);assert.equal(JSON.stringify(y.m.events),JSON.stringify(x.m.events));}}
assert.notDeepStrictEqual(generateMap(1,'CITY').landmarks,generateMap(2,'CITY').landmarks);
console.log(JSON.stringify({pass:true,roster:roster.length,result,collection:{bears:100,college:100,mascots:258}},null,2));
