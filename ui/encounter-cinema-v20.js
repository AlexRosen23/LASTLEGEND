/* LAST LEGEND V20 — ENCOUNTER CINEMA
   Recorded-match choreography only; no fabricated events, results, or actor actions. */
(function(){
'use strict';
if(typeof window.renderEncounter!=='function')return;
const previous=window.renderEncounter;
const encType={
 SKIRMISH:['CLASH','IMPACT','CONTACT'],GROUP_SKIRMISH:['GROUP CLASH','IMPACT','TEAM FIGHT'],
 FINALE_ENGAGEMENT:['FINAL DUEL','FINISH','LAST STAND'],AMBUSH:['AMBUSH','IMPACT','SURPRISE'],
 CHASE:['PURSUIT','MOTION','HIGH SPEED'],CONTACT:['CLOSE CONTACT','MOTION','SIGHTED'],
 ELIMINATION:['ELIMINATED','IMPACT','OUT'],TRAP:['TRAP SPRUNG','HAZARD','WATCH OUT'],
 STORM:['STORM WARNING','HAZARD','ATMOSPHERE'],ZONE_EXPOSURE:['DANGER ZONE','HAZARD','STORM'],
 ZONE_RETREAT:['RUN FOR SAFETY','MOTION','EVACUATE'],CONTEST_RESOURCE:['SUPPLY CONTEST','RESOURCE','CONTESTED'],
 SUPPLY:['SUPPLIES','RESOURCE','RECOVERED'],LUCKY_FIND:['LUCKY FIND','RESOURCE','BONUS'],
 HEAL:['RECOVERY','RECOVERY','HEALING'],REST:['REST STOP','RECOVERY','REGROUP'],
 SHELTER:['SHELTER','RECOVERY','COVER'],ALLIANCE:['NEW ALLIANCE','ALLIANCE','COOPERATE'],
 NEGOTIATION:['NEGOTIATION','ALLIANCE','DIPLOMACY'],FINAL_BETRAYAL:['BETRAYAL','IMPACT','NO ALLIANCES'],
 ALLY_TRAVEL:['ALLIED MOVEMENT','MOTION','TEAMWORK']
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const seed=(n,i)=>{let v=Math.imul(Number(n)||0,2654435761)^Math.imul(i+7,2246822519);v=Math.imul(v^(v>>>16),3266489917);return(v>>>0)/4294967296};
const duration=()=>Math.max(700,Math.round(3200/(Number(document.getElementById('speed')?.value)||1)));
const escapedName=id=>esc(opts.profiles.get(id)?.name||id);
const unit=(x)=>Math.round(x*10)/10;
function sceneFor(event){
 const stage=document.querySelector('#encounter-visual .scene-stage');
 if(!stage)return null;
 const a=opts.match?.arena||'WILDERNESS';
 const parts=encType[event.type]||['ENCOUNTER','MOTION','IN PLAY'];
 const family=parts[1].toLowerCase();
 stage.classList.add('v20-cinema','v20-'+family,'v20-arena-'+a.toLowerCase());
 stage.style.setProperty('--v20-duration',duration()+'ms');
 stage.dataset.v20Scene=event.type;
 stage.dataset.v20Tick=String(event.tick);
 stage.style.setProperty('--v20-axis',seed(event.id,2)>.5?'1':'-1');
 const seedPhase=Math.floor(seed(event.id,3)*4);
 stage.classList.add('v20-layout-'+seedPhase);
 return {stage,arena:a,label:parts[0],family,slug:parts[2]};
}
function render(event){
 if(!event||!opts?.match)return;
 const info=sceneFor(event);if(!info)return;
 const {stage,arena,label,family,slug}=info;
 const legend={CITY:'AFTERHOURS CITY',WILDERNESS:'WILDERNESS',RUINS:'THE GAUNTLET',FROZEN:'FROZEN FRONTIER'}[arena]||'THE ARENA';
 const props=window.LastLegendEncounters?.byId?.(event.encounterId)||null;
 const cards=event.participants.filter(id=>opts.profiles.has(id)).slice(0,5);
 const lens=Math.min(12,7+cards.length*2);
 const fx=document.createElement('div');
 fx.className='v20-director-overlay';
 fx.setAttribute('aria-hidden','true');
 fx.innerHTML='<div class="v20-luma"></div><div class="v20-scene-rays"></div>'+
   '<div class="v20-scanline"></div><div class="v20-cinema-streaks">'+
   Array.from({length:lens},(_,i)=>{
     const x=unit(5+seed(event.id,i*7+1)*91),y=unit(12+seed(event.id,i*11+4)*75),
     length=unit(14+seed(event.id,i*13+7)*43),delay=unit(seed(event.id,i*17+9)*2);
     return '<i style="--fx-x:'+x+'%;--fx-y:'+y+'%;--fx-l:'+length+'px;--fx-delay:'+delay+'s"></i>';
   }).join('')+'</div>'+
   '<div class="v20-slate"><span class="v20-slate-live"><b></b> LIVE REPLAY · '+esc(legend)+'</span><strong>'+esc(label)+'</strong><small>TICK '+String(event.tick).padStart(3,'0')+' / EVENT '+String(event.id).padStart(4,'0')+'</small></div>'+
   '<div class="v20-lens-flare"></div><div class="v20-cinema-impact"><span>'+esc(slug)+'</span></div>'+
   '<div class="v20-players">'+cards.map((id,i)=>'<span><b>'+(i+1).toString().padStart(2,'0')+'</b> '+escapedName(id)+'</span>').join('')+'</div>'+
   '<div class="v20-letterbox top"></div><div class="v20-letterbox bottom"></div>';
 stage.prepend(fx);
 const story=document.querySelector('#encounter-text .scene-story');
 if(story&&props?.cue){
   const tag=document.createElement('div');tag.className='v20-cue-pill';
   tag.textContent='DIRECTOR CUE  /  '+String(props.cue).toUpperCase();
   story.prepend(tag);
 }
 const root=document.getElementById('encounter');
 if(root){root.dataset.v20Type=family;root.classList.toggle('v20-active',true);}
}
window.renderEncounter=function(event){previous(event);render(event);};
window.LastLegendEncounterCinema={encType,seed,sceneFor,render};
})();
