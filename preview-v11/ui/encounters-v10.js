/* Last Legend V10: 500 scenario definitions. Fictional gameplay, never real-world allegations.
   Generated from authored action/terrain/prop choreography matrices. */
(function(root){
'use strict';
const catalog=[];
const real=[
 ['Supply interception','intercepts a contested route',['CONTEST_RESOURCE','CHASE','AMBUSH']],
 ['Cover-to-cover sprint','cuts between protective cover',['CHASE','CONTACT']],
 ['Silent flank','circles toward an unguarded angle',['AMBUSH','CONTACT','SKIRMISH']],
 ['Defensive stand','plants their feet and protects a narrow approach',['SKIRMISH','GROUP_SKIRMISH','FINALE_ENGAGEMENT']],
 ['Resource diversion','draws attention away from a supply cache',['CONTEST_RESOURCE','SUPPLY','CONTACT']],
 ['Negotiated crossing','signals for a brief, tense passage',['NEGOTIATION','ALLIANCE','CONTACT']],
 ['Emergency extraction','breaks contact and seeks a safer route',['CHASE','ZONE_RETREAT','SHELTER']],
 ['Counterattack','changes direction to answer an opening',['SKIRMISH','AMBUSH','FINALE_ENGAGEMENT']],
 ['Terrain read','studies the landscape for an advantage',['CONTACT','TRAP','LUCKY_FIND']],
 ['Alliance screen','covers another competitor during a reposition',['ALLY_TRAVEL','ALLIANCE','GROUP_SKIRMISH']],
 ['Last-stand feint','sells a retreat before turning sharply',['FINALE_ENGAGEMENT','SKIRMISH','CHASE']]
];
const places=[
 ['WILDERNESS','river crossing','wet stones','sliding dodge'],
 ['WILDERNESS','fallen timber','broken branches','low vault'],
 ['WILDERNESS','thick pines','pine needles','zigzag'],
 ['CITY','train platform','loose barrier','side step'],
 ['CITY','parking deck','concrete column','hard pivot'],
 ['CITY','narrow alley','stacked crates','wall turn'],
 ['RUINS','collapsed arch','stone rubble','duck and roll'],
 ['RUINS','broken stairway','fallen masonry','uphill feint'],
 ['FROZEN','snow berm','powder drift','snow slide'],
 ['FROZEN','icy ridge','slick shelf','balance correction']
];
const comic=[
 ['Mascot mix-up','mistakes a silhouette for a friendly teammate',['CONTACT','NEGOTIATION','ALLIANCE']],
 ['Slapstick stumble','loses footing during a frantic reposition',['CHASE','CONTACT','TRAP']],
 ['Equipment scramble','tries to gather runaway equipment',['SUPPLY','CONTEST_RESOURCE','LUCKY_FIND']],
 ['Victory dance interruption','starts celebrating a moment too early',['CONTACT','SKIRMISH','AMBUSH']],
 ['Overconfident decoy','sets up an absurd distraction',['AMBUSH','CONTACT','CHASE']],
 ['Unwanted encore','accidentally draws an audience of rivals',['GROUP_SKIRMISH','NEGOTIATION','CONTACT']],
 ['Silent-film pursuit','runs through a chain of ridiculous turns',['CHASE','CONTACT']],
 ['Comical truce','attempts a handshake at a terrible moment',['ALLIANCE','NEGOTIATION','CONTACT']],
 ['Prop confusion','reaches for the wrong object',['CONTEST_RESOURCE','SUPPLY','LUCKY_FIND']],
 ['Unplanned hide-and-seek','disappears behind insufficient cover',['CHASE','SHELTER','CONTACT']]
];
const props=[
 ['WILDERNESS','loose pinecone','under a tree','hop'],
 ['WILDERNESS','mossy log','beside a river','vault'],
 ['CITY','rolling traffic cone','by a closed lane','sidestep'],
 ['CITY','tipped cart','near a service door','spin'],
 ['CITY','flapping banner','along a balcony','duck'],
 ['RUINS','crumbling pedestal','inside a ruin','retreat'],
 ['RUINS','misplaced helmet','among rubble','shuffle'],
 ['FROZEN','oversized snowball','beside a drift','slide'],
 ['FROZEN','slick ice patch','at an icy crossing','skate'],
 ['FROZEN','stubborn winter scarf','near a shelter','twist']
];
const sports=[
 ['Basketball',['crossover cut','baseline pivot','pump-fake feint','box-out stand','no-look diversion','full-court burst','spin move','defensive slide','jab-step bait','fast-break lane']],
 ['American Football',['route break','pocket escape','goal-line drive','cutback lane','open-field juke','pass-rush sidestep','tight-end shield','play-action feint','sideline sprint','red-zone pivot']],
 ['Baseball',['basepath slide','pickoff feint','outfield tracking step','batting stance bluff','first-base stretch','double-play turn','warning-track sprint','catcher-block stance','steal break','relay throw motion']],
 ['Ice Hockey',['edge-control cut','forecheck press','board-side shield','blue-line pivot','breakaway burst','crease defense','deke feint','skate-stop deceleration','reverse turn','body-angle check']],
 ['Association Football',['step-over feint','shoulder-drop cut','first-touch escape','pressing angle','counterattack sprint','shielding turn','overlap run','nutmeg fake','defensive recovery','touchline pivot']],
 ['Boxing & MMA',['slip-and-counter','guard reset','angle step','level-change feint','clinch break','footwork circle','body-shot bluff','check hook motion','distance trap','pivot exit']],
 ['Track & Field',['starting-block burst','hurdle clearance','relay exchange step','inside-lane surge','lean-at-line move','curve-running balance','middle-distance surge','sprint cadence shift','high-jump arch','triple-jump rhythm']],
 ['Swimming',['streamline glide','turn timing','kick rhythm','surface sprint','breathing pattern','relay launch','backstroke rotation','dive-angle correction','waterline tracking','stroke-rate increase']],
 ['Tennis',['split-step response','baseline recovery','serve-motion bluff','crosscourt chase','drop-shot disguise','net-rush burst','backhand pivot','volley interception','lob tracking','forehand follow-through']],
 ['Motorsport',['racing-line read','apex turn','late-braking feint','pit-lane dodge','traction recovery','drafting move','overtake setup','steering correction','corner exit','defensive line']]
];
const nonhuman={
 horse:['hoofbeat acceleration','sideways canter','rearing warning','tight turn','low obstacle jump','mud recovery','flank break','saddle-free sprint','scent-led detour','herd feint','ridge gallop','bridle-free weave','hoof skid','water crossing','hill climb','clearing dash','last-stride surge'],
 vehicle:['engine rev','controlled drift','traction test','reverse escape','headlight signal','wheelspin feint','hard brake','corner apex','gravel spray','gear-change surge','narrow-lane turn','wide arc','bump avoidance','suspension hop','pitstop decoy','roadblock pivot','finish-line push'],
 aquatic:['surface scan','tail-powered burst','waterline circle','dive feint','shoreline turn','splash barrier','current ride','wake diversion','deepwater retreat','surface breach','underwater concealment','wake chase','foam-screen retreat','shallow-water turn','fin sweep','waterborne standoff','final breach'],
 undead:['silent advance','frost aura feint','unblinking stare','stiff pivot','cloak sweep','slow pursuit','shadow retreat','eerie halt','icebound step','echoed footfall','patient ambush','ruin crossing','cold-pressure bluff','rising posture','grave-still wait','spectral sidestep','last confrontation'],
 mascot:['oversized head tilt','tail-first sidestep','costume shuffle','foam-paw feint','big-foot stomp','team-flag flutter','goofy spin','wide-arm block','mascot leap','costume belly flop','sideline prance','giant-shoe sprint','padded shoulder check','dance-off challenge','foam-hand wave','cartwheel attempt','theatrical bow']
};
const brutal=[
 ['Heavy collision','takes a punishing body impact'],
 ['Hard landing','hits the ground after losing balance'],
 ['Cornered struggle','absorbs a forceful struggle near cover'],
 ['Momentum reversal','is knocked off their attacking line'],
 ['Hazard impact','takes a blow from shifting terrain'],
 ['Desperate grapple','fights to keep their footing'],
 ['Blindside impact','is caught by a sudden physical blow'],
 ['Staggering counter','is rocked by a counterattack'],
 ['Entrapment','is pinned briefly against dangerous debris'],
 ['Final-ring crash','collides during a high-pressure finish'],
 ['Repeated body contact','weathers consecutive heavy impacts'],
 ['Close-quarter collision','has almost no room to evade a hit'],
 ['Emergency breakaway','forces free from a painful hold']
];
const hardPlaces=[
 ['WILDERNESS','rocky bank','stone scatter','impact'],
 ['CITY','concrete barrier','loose gravel','impact'],
 ['RUINS','fractured wall','fallen blocks','clash'],
 ['FROZEN','ice shelf','hard-packed snow','slide'],
 ['WILDERNESS','root-covered slope','mud','tumble']
];
const mature=[
 ['Bloodied escape','A blood-streaked costume shows the cost of a narrow escape'],
 ['Open wound','A visible wound makes the impact impossible to mistake'],
 ['Brutal finishing clash','A graphic collision leaves the combatants bloodied'],
 ['Bleeding recovery','A survivor presses a bleeding injury before stumbling onward'],
 ['Violent debris strike','Flying debris tears fabric and leaves a bloody scrape'],
 ['Gory ground impact','The collision leaves a gruesome trail of blood on the ground'],
 ['Savage close quarters','The struggle ends with a brutal, bloody impact'],
 ['Graphic arena hazard','A vicious hazard leaves visible blood and torn gear']
];
const maturePlaces=[
 ['WILDERNESS','muddy embankment','roots'],
 ['CITY','service tunnel','concrete'],
 ['RUINS','collapsed courtyard','rubble'],
 ['FROZEN','frozen slope','ice'],
 ['CITY','abandoned platform','railings']
];
function add(d){
 d.id='LL-'+String(catalog.length+1).padStart(3,'0');
 d.categories=d.category;
 catalog.push(Object.freeze(d));
}
for(const a of real)for(const p of places)add({
 category:'realistic',name:a[0]+' / '+p[1],action:a[0],actionText:a[1],arena:p[0],location:p[1],prop:p[2],
 cue:p[3],types:a[2],intensity:'standard',body:'human',sport:null
});
for(const a of comic)for(const p of props)add({
 category:'comic',name:a[0]+' / '+p[2],action:a[0],actionText:a[1],arena:p[0],location:p[2],prop:p[1],
 cue:p[3],types:a[2],intensity:'standard',body:'human',sport:null
});
for(const [sport,moves] of sports)for(const move of moves)add({
 category:'identity',name:sport+' / '+move,action:move,actionText:'translates '+move+' into a survival maneuver',
 arena:null,location:null,prop:'sport-inspired footwork',cue:'sport',types:['CHASE','CONTACT','SKIRMISH','AMBUSH','FINALE_ENGAGEMENT'],
 intensity:'standard',body:'human',sport
});
for(const [body,moves] of Object.entries(nonhuman))for(const move of moves)add({
 category:'nonhuman',name:body.toUpperCase()+' / '+move,action:move,actionText:'executes '+move,arena:body==='aquatic'?'WILDERNESS':null,
 location:body==='aquatic'?'river shallows':null,prop:body==='vehicle'?'wheels and steering':body==='horse'?'hoofwork':body==='aquatic'?'water':body==='mascot'?'padded costume':'eerie poise',
 cue:body,types:['CHASE','CONTACT','SKIRMISH','AMBUSH','FINALE_ENGAGEMENT','ALLY_TRAVEL','TRAP','SHELTER'],intensity:'standard',body,sport:null
});
for(const a of brutal)for(const p of hardPlaces)add({
 category:'brutal',name:a[0]+' / '+p[1],action:a[0],actionText:a[1],arena:p[0],location:p[1],prop:p[2],
 cue:p[3],types:['SKIRMISH','GROUP_SKIRMISH','FINALE_ENGAGEMENT','AMBUSH','TRAP','STORM'],
 intensity:'intense',body:'human',sport:null
});
for(const a of mature)for(const p of maturePlaces)add({
 category:'mature',name:a[0]+' / '+p[1],action:a[0],actionText:a[1],arena:p[0],location:p[1],prop:p[2],
 cue:'graphic',types:['SKIRMISH','GROUP_SKIRMISH','FINALE_ENGAGEMENT','AMBUSH','TRAP','STORM','ELIMINATION'],
 intensity:'graphic',body:'human',sport:null
});
if(catalog.length!==500)throw Error('Expected exactly 500 authored scene specifications, found '+catalog.length);
const byId=new Map(catalog.map(x=>[x.id,x]));
const bands={standard:0,intense:1,graphic:2};
let intensity='standard';
function bodyOf(profile){
 if(!profile)return 'unknown';
 if(profile.render_type&&profile.render_type!=='human')return profile.render_type;
 if(profile.kind==='mascot'||String(profile.sport||'').includes('Mascot'))return 'mascot';
 return 'human';
}
function eligible(e,sim){
 if(!e||!sim||!e.participants||e.participants.length>4)return [];
 const actors=e.participants.map(id=>sim.db.get(id)).filter(Boolean);
 if(!actors.length)return [];
 return catalog.filter(s=>bands[s.intensity]<=bands[intensity]&&s.types.includes(e.type)
  &&(!s.arena||s.arena===sim.arena)
  &&(!s.body||actors.some(a=>bodyOf(a)===s.body))
  &&(!s.sport||actors.some(a=>a.sport===s.sport)));
}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
function select(e,sim){
 const pool=eligible(e,sim);
 if(!pool.length)return null;
 const h=hash('scene-v10|'+sim.seed+'|'+e.id+'|'+e.tick+'|'+e.type+'|'+e.participants.join(',')+'|'+intensity);
 return pool[h%pool.length];
}
function getActor(e,profiles,scene){
 const ids=e.participants||[];
 const a=ids.map(id=>profiles.get(id)).filter(Boolean);
 return a.find(p=>(!scene.body||bodyOf(p)===scene.body)&&(!scene.sport||p.sport===scene.sport))||a[0]||null;
}
function describe(e,profiles){
 const scene=byId.get(e.encounterId);
 if(!scene||!profiles)return '';
 const actor=getActor(e,profiles,scene);
 if(!actor)return '';
 const prefix=scene.location?'By the '+scene.location+', ':'';
 const person=actor.name||'A competitor';
 const result=scene.category==='mature'?
  (prefix+person+': '+scene.actionText+'.'):
  (prefix+person+' '+scene.actionText+(scene.prop?' around '+scene.prop:'')+'.');
 return result.replace(/\s+/g,' ').trim();
}
function setIntensity(next){if(!Object.hasOwn(bands,next))throw Error('Unsupported content intensity');intensity=next;return intensity;}
function getIntensity(){return intensity;}
function byIdFn(id){return byId.get(id)||null;}
const api=Object.freeze({catalog:Object.freeze(catalog),byId:byIdFn,eligible,select,describe,setIntensity,getIntensity,bodyOf});
root.LastLegendEncounters=api;
if(root.document){
 const install=()=>{
  const input=document.getElementById('scene-intensity');
  if(input){input.value=intensity;input.addEventListener('change',()=>{setIntensity(input.value);});}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}
})(typeof window!=='undefined'?window:globalThis);
