'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'ui/encounter-cinema-v20.js'),'utf8'),css=fs.readFileSync(path.join(root,'ui/encounter-cinema-v20.css'),'utf8');
assert(html.includes('encounter-cinema-v20.js')&&html.includes('encounter-cinema-v20.css'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
let old=0;
const ctx={window:{renderEncounter:()=>{old++}},opts:{match:null}};
vm.runInNewContext(js,ctx);
assert.equal(typeof ctx.window.LastLegendEncounterCinema.seed,'function');
assert.equal(typeof ctx.window.LastLegendEncounterCinema.render,'function');
assert.equal(typeof ctx.window.LastLegendEncounterCinema.sceneFor,'function');
const catalog=ctx.window.LastLegendEncounterCinema.encType;
for(const required of ['SKIRMISH','CHASE','AMBUSH','TRAP','STORM','ALLIANCE','FINAL_BETRAYAL','ELIMINATION','FINALE_ENGAGEMENT','LUCKY_FIND','SHELTER','ZONE_RETREAT']){
 assert(catalog[required]&&catalog[required].length===3,required);
}
for(let i=0;i<50;i++) {
 const a=ctx.window.LastLegendEncounterCinema.seed(i,2);
 assert(a>=0&&a<1);
 assert.equal(a,ctx.window.LastLegendEncounterCinema.seed(i,2));
}
ctx.window.renderEncounter(null);
assert.equal(old,1,'legacy renderer preserved');
console.log('V20 ENCOUNTER CINEMA PASS: all event families, deterministic effects, reduced-motion support and existing renderer preserved');
