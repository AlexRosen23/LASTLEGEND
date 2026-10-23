'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'ui/visual-rebirth-v18.css'),'utf8');
const js=fs.readFileSync(path.join(root,'ui/visual-rebirth-v18.js'),'utf8');
assert(html.includes('<link rel="stylesheet" href="ui/visual-rebirth-v18.css">'));
assert(html.includes('<script src="ui/visual-rebirth-v18.js"></script>'));
assert(html.includes('if(window.LastLegendRebirthMap)return window.LastLegendRebirthMap(map)'));
assert(css.includes('.site-home-hero')&&css.includes('.site-legend-card')&&css.includes('.scene-stage')&&css.includes('.rb-arena-grid'));
assert(css.includes('prefers-reduced-motion:reduce'),'motion-reduction support');
const sandbox={window:{},document:undefined};
vm.runInNewContext(js,sandbox,{filename:'visual-rebirth-v18.js'});
const paint=sandbox.window.LastLegendRebirthMap;
assert.equal(typeof paint,'function');
for(const a of ['WILDERNESS','CITY','RUINS','FROZEN']){
 const map={arena:a,seed:42817,mapId:'LL-DEMO',paths:[{offset:0,bend:0},{offset:1,bend:-.3}],landmarks:Array.from({length:48},(_,i)=>({x:2+i%10*2.8,y:2+Math.floor(i/10)*3.3,size:1,type:({
 WILDERNESS:['forest','water','ridge','clearing'],CITY:['building','street','alley','courtyard'],RUINS:['pillar','rubble','ravine','open'],FROZEN:['snowdrift','ice','cliff','shelter']
 })[a][i%4]}))};
 const one=paint(map),two=paint(map);
 assert.equal(one,two,a+' must be deterministic');
 assert(one.length>11000,a+' must include detailed SVG terrain, not placeholder rectangles');
 assert(one.includes('rb-terrain-feature'),a+' detailed map landmarks');
 assert(one.includes('rb-map-grid')&&one.includes('rb-vignette'),a+' world layers');
 assert(!/NaN|Infinity|undefined/.test(one),a+' valid generated coordinates');
 assert(!one.includes('<script'),a+' no script injection');
 const changed=paint({...map,seed:42818});
 assert.notEqual(one,changed,a+' geometry should vary by seed');
 console.log(a+': illustrated deterministic SVG '+one.length+' bytes');
}
const forest=paint({arena:'WILDERNESS',seed:7,paths:[],landmarks:[{x:12,y:10,size:1,type:'forest'}]});
const city=paint({arena:'CITY',seed:7,paths:[],landmarks:[{x:12,y:10,size:1,type:'building'}]});
const ruins=paint({arena:'RUINS',seed:7,paths:[],landmarks:[{x:12,y:10,size:1,type:'pillar'}]});
const ice=paint({arena:'FROZEN',seed:7,paths:[],landmarks:[{x:12,y:10,size:1,type:'ice'}]});
assert(forest.includes('#397d56')||forest.includes('#3e876c'));
assert(city.includes('url(#rb-roof)'));
assert(ruins.includes('#baa17a'));
assert(ice.includes('#90d4e6'));
console.log('V18 VISUAL REBIRTH PASS: all biomes, seeded rendering, source wiring and design tokens');
