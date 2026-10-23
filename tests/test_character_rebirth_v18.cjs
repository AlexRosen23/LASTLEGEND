'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('<script src="ui/character-renderer.js"></script>\n<script src="ui/character-rebirth-v18.js"></script>'));
const roster=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const syntheticLook=a=>({primary:'#7f324e',secondary:'#e8dcb8',skin:'#b08365',hair:'curl',hairColor:'#231a18',number:a.number??23,beard:'short',tattoo:true});
const initial=()=>'<svg id="original-nonhuman"/>';
const ctx={window:{figureSVG:initial,appearanceFor:syntheticLook}};
vm.runInNewContext(fs.readFileSync(path.join(root,'ui/character-rebirth-v18.js'),'utf8'),ctx,{filename:'character-rebirth-v18.js'});
const render=ctx.window.figureSVG;
const sportCases=[
 ['Basketball','rb-sport-basketball','rb-game-prop'],
 ['American Football','rb-sport-football','rb-helmet'],
 ['Baseball','rb-sport-baseball','rb-game-prop'],
 ['Ice Hockey','rb-sport-hockey','rb-game-prop'],
 ['Association Football','rb-sport-soccer','rb-game-prop'],
 ['Boxing & MMA','rb-sport-boxing','rb-athlete-arm'],
 ['Tennis','rb-sport-tennis','rb-game-prop'],
 ['Track & Field','rb-sport-track','rb-athlete-leg'],
 ['Swimming','rb-sport-swimming','rb-athlete-head'],
 ['Motorsport','rb-sport-motorsport','rb-helmet']
];
for(const [sport,cls,cue] of sportCases){
 const svg=render({name:'Sample Athlete',id:'sample',sport},{large:true});
 assert(svg.includes(cls)&&svg.includes(cue),sport+' unique art direction');
 assert(svg.includes('rb-arm-left')&&svg.includes('rb-leg-left')&&svg.includes('rb-athlete-head'),sport+' articulated limbs');
 assert(svg.includes('width="118"')&&svg.includes('height="127"'));
 assert(!/undefined|NaN/.test(svg),sport+' valid sprite');
}
const mascot=render({id:'bird',name:'Mascot',render_type:'mascot'});
assert.equal(mascot,'<svg id="original-nonhuman"/>','nonhuman renderers must stay untouched');
let count=0;
for(const athlete of roster){
 const kind=athlete.render_type||((athlete.kind==='mascot')?'mascot':(athlete.kind==='animal'?'horse':'human'));
 if(kind!=='human')continue;
 const sprite=render(athlete);
 assert(sprite.startsWith('<svg')&&sprite.endsWith('</svg>'),athlete.id);
 assert(sprite.includes('aria-label=')&&sprite.includes('rb-character'),athlete.id);
 assert(sprite.includes('width="54"'),athlete.id);
 count++;
}
assert(count>400,'large human roster coverage');
assert(fs.readFileSync(path.join(root,'ui/visual-rebirth-v18.css'),'utf8').includes('.rb-character'));
console.log('V18 CHARACTER REBIRTH PASS: '+count+' human sports avatars, articulated rigs, equipment and intact nonhumans');
