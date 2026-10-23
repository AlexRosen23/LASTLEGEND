const assert=require('assert'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const athletes=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\ninit\(\);\s*$/,'');
const ctx=vm.createContext({console,Math,Date,crypto:{getRandomValues:a=>(a[0]=2026,a)},setTimeout,clearTimeout,window:{},document:{getElementById:()=>({})}});
vm.runInContext(code,ctx); const get=x=>vm.runInContext(x,ctx);
const opts=get('opts'),Sim=get('Simulation'),look=get('appearanceFor'),figure=get('figureSVG'),leaders=get('leaderBoardMarkup');
opts.athletes=athletes;opts.profiles=new Map(athletes.map(a=>[a.id,a]));opts.perks=perks;
const lebron=opts.profiles.get('lebron-james'),trey=opts.profiles.get('trey-mcbride');
assert(lebron&&trey);
assert.equal(look(lebron).number,23);assert.equal(look(lebron).beard,'full');assert.equal(look(lebron).skin,'#6a3925');
assert.equal(look(trey).number,85);assert.equal(look(trey).primary,'#a71930');assert(look(trey).helmet);
assert(figure(lebron,{large:true}).includes('23'));
assert(figure(trey,{large:true}).includes('85'));
assert(figure(trey,{large:true}).includes('face') || figure(trey,{large:true}).includes('M10 -23'));
let visualVariants=new Set(athletes.filter(a=>(a.render_type||'human')==='human').slice(0,200).map(a=>{const v=look(a);return [v.skin,v.hair,v.beard,v.primary].join('|')}));
assert(visualVariants.size>160);
for(let n of [2,12,24,100]){
 const ids=athletes.slice(0,n).map(a=>a.id);const m=new Sim(ids,athletes,perks,{seed:45454,arena:'WILDERNESS'}).run();opts.match=m;
 for(let k of [0,Math.floor(m.frames.length/2),m.frames.length-1]){
   const board=leaders(m.frames[k]); assert(board.includes('TOP 3 HEALTH'));assert(board.includes('TOP 3 ELIMINATIONS'));
   assert.equal((board.match(/class="leader-entry/g)||[]).length,Math.min(3,m.frames[k].alive.length)+Math.min(3,n));
   const top= m.roster.filter(id=>m.frames[k].actors[id].alive).sort((a,b)=>m.frames[k].actors[b].hp-m.frames[k].actors[a].hp ||m.frames[k].actors[b].eliminations-m.frames[k].actors[a].eliminations ||opts.profiles.get(a).name.localeCompare(opts.profiles.get(b).name))[0];
   assert(board.includes(opts.profiles.get(top).name.replace(/'/g,'&#39;')));
 }
 assert.equal(m.placements.length,n);assert.equal(m.frames.at(-1).alive.length,1);
}
assert(html.includes('arena-leaders-mobile'));assert(html.includes('position:sticky'));
console.log('V5 appearance, dynamic leaderboards, 2/12/24/100-player tests PASSED');
