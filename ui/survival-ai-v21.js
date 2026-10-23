/* LAST LEGEND V21 — SURVIVAL INTELLIGENCE
   Deterministic tactical policy; runs inside the existing verified simulation.
   Real decisions, not visual-only action labels. */
(function(){
'use strict';
if(typeof Simulation!=='function')return;
const planOriginal=Simulation.prototype.plan;
const forecast=(sim,a)=>Math.hypot(a.x-16,a.y-10)-sim.safeRadius(6);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const utility=(a,b)=>a.reduce((t,x)=>t+(b[x]||0),0)/a.length;
const power=(p)=>p?utility(['strength','reflexes','agility','combat_defense','tactical_iq','awareness'],p.ratings):50;
function getProfile(sim,a){return sim.db.get(a.id);}
function estimate(sim,a,b){
 const self=getProfile(sim,a),other=getProfile(sim,b);
 if(!self||!other)return 0;
 const delta=(power(self)-power(other))*.7+(a.hp-b.hp)*.3+(a.stamina-b.stamina)*.12;
 return clamp(delta,-65,65);
}
function selectTarget(sim,a,observed){
 const state=sim.actors;
 const candidates=observed.filter(id=>id!==a.ally&&state.get(id)?.alive);
 if(!candidates.length)return null;
 const beh=getProfile(sim,a).behavior,desire=beh.aggression/100;
 const ranked=candidates.map(id=>{
   const b=state.get(id),distance=Math.hypot(a.x-b.x,a.y-b.y),
     confidence=estimate(sim,a,b);
   const risk=Math.max(0,65-b.hp)*.075+confidence*.09;
   const memory=Number(a.observed?.[id]||0)>=sim.tick-2?1.2:0;
   return{id,score:-distance*2.1+risk*desire+memory};
 }).sort((x,y)=>y.score-x.score||x.id.localeCompare(y.id));
 return ranked[0].id;
}
function tacticalPlan(actor){
 const profile=getProfile(this,actor);
 if(!profile||!profile.behavior)return planOriginal.call(this,actor);
 const beh=profile.behavior,center={x:16,y:10},radial=Math.hypot(actor.x-center.x,actor.y-center.y);
 // First protect the projected zone rather than waiting for present damage.
 const projected=this.safeRadius(6),margin=projected-radial;
 if(margin<.9)return ['ESCAPE_ZONE',null];
 const near=this.observe(actor);
 // Healing is a decision with opportunity cost; reserve an emergency buffer.
 const imminent=actor.hp<36,canHeal=actor.supplies>0&&actor.healed<3;
 if(canHeal&&(imminent||actor.hp<=63&&margin>1.4&&near.length<2))return ['HEAL',null];
 if(actor.stamina<27&&margin>1.75&&near.length===0)return ['REST',null];
 // Teammates stay a priority only while partnerships are permitted.
 if(this.alive().length>=4&&actor.ally&&this.actors.get(actor.ally)?.alive){
   const ally=this.actors.get(actor.ally);
   const separation=Math.hypot(actor.x-ally.x,actor.y-ally.y);
   const allySafe=Math.hypot(ally.x-16,ally.y-10)<projected-.2;
   if(allySafe&&separation<6.3&&near.includes(actor.ally))return ['LINK',actor.ally];
 }
 const id=selectTarget(this,actor,near);
 if(id){
   const b=this.actors.get(id);
   const confidence=estimate(this,actor,b);
   const risk=(100-actor.hp)*.33+(100-actor.stamina)*.12-confidence*.53+
     Math.max(0,1.8-margin)*15;
   const opportunity=Math.max(0,100-b.hp)*.17+confidence*.43+(beh.aggression-50)*.16;
   const allyNeed=this.alive().length>=4&&!actor.ally?beh.alliance_drive/100:0;
   const options=[
     ['APPROACH',clamp(.65+opportunity/36-risk/90,.08,3.3)],
     ['EVADE',clamp(.24+risk/40+(beh.caution-50)/140,.10,3.7)],
     ['OBSERVE',clamp(.62+beh.opportunism/155+Math.abs(confidence)/180,.15,2.7)]
   ];
   if(allyNeed>0&&b.ally==null&&actor.hp>43)
     options.push(['NEGOTIATE',clamp(.24+allyNeed*1.35-risk/180,.05,2.2)]);
   const choice=weighted(this.seed,this.tick,actor.id,'v21-tactical-decision',options);
   return [choice,id];
 }
 // No visible enemies: reuse verified resource/circle policy. Extend stamina
 // recovery to safe open terrain, but never at the edge of a shrinking zone.
 if(actor.stamina<31&&margin>2.7)return ['REST',null];
 const baseline=planOriginal.call(this,actor);
 if(baseline[0]==='GO_CACHE'){
   const cache=this.caches[baseline[1]];
   // Do not chase a cache that becomes unsafe by the time we arrive.
   if(cache){
     const dist=Math.hypot(actor.x-cache.x,actor.y-cache.y),
       speed=.65+profile.ratings.top_speed/110,
       travelTicks=Math.ceil(dist/Math.max(.5,speed)),
       future=this.safeRadius(Math.min(18,travelTicks+6)),
       cacheRadius=Math.hypot(cache.x-16,cache.y-10);
     if(cacheRadius>future-.35)return ['GO_CENTER',null];
   }
 }
 return baseline;
}
Simulation.prototype.plan=tacticalPlan;
const api=Object.freeze({version:'21.0',estimate,selectTarget,forecast,planOriginal});
window.LastLegendSurvivalAI=api;
function install(){
 const host=document.querySelector('#draft-view .rules');
 if(!host||host.querySelector('.v21-ai-indicator'))return;
 const card=document.createElement('div');
 card.className='v21-ai-indicator';
 card.setAttribute('role','note');
 card.innerHTML='<span class="v21-ai-pulse" aria-hidden="true"></span><div><strong>SURVIVAL INTELLIGENCE / V21</strong><small>Predictive zone awareness · tactical threat evaluation · ally priorities · smarter resource routes. Seed-deterministic.</small></div>';
 host.appendChild(card);
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
}
})();
