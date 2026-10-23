/* LAST LEGEND V22 — SEEDED TERRAIN NAVIGATION
   Static obstacle-aware movement steering. Runs inside the real simulation,
   changes genuine positions, preserves seed determinism and emergency storm escape.
   Does not treat decorative objects as a perfect collision/nav mesh. */
(function(){
'use strict';
if(typeof Simulation!=='function')return;
const moveOriginal=Simulation.prototype.move;
const cache=new WeakMap();
const collidable=new Set(['building','rubble','pillar','ravine','cliff','ice','ridge']);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const round=n=>+n.toFixed(5);
function obstacles(sim){
 if(cache.has(sim))return cache.get(sim);
 const data=((sim.map&&sim.map.landmarks)||[])
  .filter(l=>collidable.has(l.type)&&Number.isFinite(l.x)&&Number.isFinite(l.y)&&Number.isFinite(l.size))
  .map((l,index)=>({
    x:clamp(l.x,0,31),y:clamp(l.y,0,19),
    radius:clamp(l.size*(l.type==='building'?.48:l.type==='ice'?.39:.35)+.09,.23,.91),
    index,type:l.type
  }));
 cache.set(sim,data);return data;
}
function intersects(a,b,o){
 const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy;
 if(length2<.0001)return false;
 // Actors may spawn within or near art props; escape from spawn, don't trap.
 if(dist(a,o)<o.radius*.88||dist(b,o)<o.radius*.72)return false;
 const t=clamp(((o.x-a.x)*dx+(o.y-a.y)*dy)/length2,0,1);
 return t>.02&&t<.98&&Math.hypot(a.x+dx*t-o.x,a.y+dy*t-o.y)<o.radius;
}
function firstBlock(a,goal,items){
 let result=null,best=Infinity;
 const dx=goal.x-a.x,dy=goal.y-a.y,length2=dx*dx+dy*dy;
 for(const o of items){
   if(!intersects(a,goal,o))continue;
   const t=length2?clamp(((o.x-a.x)*dx+(o.y-a.y)*dy)/length2,0,1):0;
   if(t<best){best=t;result=o}
 }
 return result;
}
function waypoint(sim,a,goal){
 const src={x:a.x,y:a.y},target={x:clamp(goal.x,0,31),y:clamp(goal.y,0,19)};
 const direct=dist(src,target);
 if(direct<.005)return {...target,avoided:false};
 // The storm is more dangerous than art props: make a direct run to safety.
 if(a.intent==='ESCAPE_ZONE'||Math.hypot(a.x-16,a.y-10)>sim.safeRadius(4)-.85)return {...target,avoided:false,urgent:true};
 const items=obstacles(sim),blocked=firstBlock(src,target,items);
 if(!blocked)return {...target,avoided:false};
 const dx=(target.x-src.x)/direct,dy=(target.y-src.y)/direct,
   normal={x:-dy,y:dx},reach=blocked.radius+.47,
   center={x:blocked.x-dx*blocked.radius*.24,y:blocked.y-dy*blocked.radius*.24};
 const future=sim.safeRadius(6);
 const options=[-1,1].map(sign=>{
   const q={x:clamp(center.x+normal.x*reach*sign,.23,30.77),
            y:clamp(center.y+normal.y*reach*sign,.23,18.77)};
   const radial=Math.hypot(q.x-16,q.y-10);
   const penalties=items.reduce((sum,o)=>sum+
     (o!==blocked&&intersects(src,q,o)?5:0)+
     (o!==blocked&&dist(q,o)<o.radius+.12?2:0),0);
   const hazard=Math.max(0,radial-future+.4)*13;
   return {x:q.x,y:q.y,score:dist(src,q)+dist(q,target)+penalties+hazard,sign};
 }).sort((a,b)=>a.score-b.score||a.sign-b.sign);
 const choice=options[0];
 // No avoidant choice if both detours are dangerously outside the future storm.
 if(Math.hypot(choice.x-16,choice.y-10)>future+.35)return {...target,avoided:false,urgent:true};
 return {x:round(choice.x),y:round(choice.y),avoided:true,obstacleType:blocked.type};
}
Simulation.prototype.move=function(a,x,y,run=false){
 if(!a||!Number.isFinite(x)||!Number.isFinite(y))return moveOriginal.call(this,a,x,y,run);
 const via=waypoint(this,a,{x,y});
 return moveOriginal.call(this,a,via.x,via.y,run);
};
window.LastLegendPathfinding=Object.freeze({version:'22.0',obstacles,intersects,firstBlock,waypoint,moveOriginal});
})();
