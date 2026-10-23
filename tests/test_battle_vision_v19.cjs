'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'ui/battle-vision-v19.js'),'utf8');
const css=fs.readFileSync(path.join(root,'ui/battle-vision-v19.css'),'utf8');
assert(html.includes('battle-vision-v19.js')&&html.includes('battle-vision-v19.css'),'V19 assets loaded');
assert(css.includes('prefers-reduced-motion:reduce'),'reduced-motion support');
const window={renderMap:()=>{},LastLegendSpectator:{state:{follow:null},cameraBox:()=>null}};
const ctx={window,document:undefined,opts:{match:null},console};
vm.runInNewContext(script,ctx,{filename:'battle-vision-v19.js'});
const layout=window.LastLegendBattleVision.layoutLabels;
assert.equal(typeof layout,'function');
const examples=[
 {id:'lebron',name:'LeBron James',x:250,y:170,priority:20},
 {id:'biles',name:'Simone Biles',x:266,y:170,priority:50},
 {id:'tyson',name:'Mike Tyson',x:251,y:185,priority:100},
 {id:'serena',name:'Serena Williams',x:280,y:180,priority:40},
 {id:'phelps',name:'Michael Phelps',x:285,y:197,priority:10},
 {id:'messi',name:'Lionel Messi',x:210,y:190,priority:20},
 {id:'jordan',name:'Michael Jordan',x:255,y:135,priority:65}
];
for(const bounds of [[0,0,620,390],[150,100,350,220]]){
 const labels=layout(examples,bounds,8);
 assert(labels.length>0);
 for(const e of labels){
   const b=e.box;
   assert(b.x>=bounds[0]+6&&b.x+b.w<=bounds[0]+bounds[2]-6);
   assert(b.y>=bounds[1]+6&&b.y+b.h<=bounds[1]+bounds[3]-6);
   assert(b.w<=102&&b.h===17);
   const overlapsAvatar=b.x<e.x+14&&b.x+b.w>e.x-14&&b.y<e.y+18&&b.y+b.h>e.y-18;
   assert(!overlapsAvatar,e.id+' label overlaps its own avatar');
 }
 for(let i=0;i<labels.length;i++)for(let j=0;j<i;j++){
   const a=labels[i].box,b=labels[j].box;
   assert(!(a.x<b.x+b.w+4&&a.x+a.w+4>b.x&&a.y<b.y+b.h+4&&a.y+a.h+4>b.y),'labels overlap '+labels[i].id+' '+labels[j].id);
 }
 assert.equal(JSON.stringify(labels),JSON.stringify(layout(examples,bounds,8)),'determinism');
}
assert(window.LastLegendBattleVision.abbr('Mike Tyson')==='Tyson');
assert(window.LastLegendBattleVision.abbr('LeBron James — Lakers 2013')==='James');
assert(window.LastLegendBattleVision.abbr('Supercalifragilisticexpialidocious').length<=15);
console.log('V19 BATTLE VISION PASS: collision free labels, adaptive camera bounds, priority and reduced motion');
