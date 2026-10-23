/* LAST LEGEND V19 — MATCH VISION
   Visual-only battle camera layer. Never mutates actor state, events, seed, or outcomes.
   Designed to solve magnified/overlapping nameplates and flat map tokens. */
(function(){
'use strict';
if(typeof window.renderMap!=='function')return;
const previousMap=window.renderMap;
const W=620,H=390;
const ns='http://www.w3.org/2000/svg';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const fmt=(n)=>Math.round(n*100)/100;
function currentView(frame){
 const spec=window.LastLegendSpectator;
 if(spec&&typeof spec.cameraBox==='function'){
   const b=spec.cameraBox(frame);
   if(Array.isArray(b)&&b.length===4&&b.every(Number.isFinite))return b;
 }
 return [0,0,W,H];
}
function abbr(s){
 const parts=String(s??'').replace(/\s+[—–-]\s+.*$/,'').split(/\s+/).filter(Boolean);
 if(parts.length===1)return parts[0].slice(0,15);
 return parts[parts.length-1].slice(0,15);
}
function hits(a,b,pad=2){return a.x<a.x+a.w&&b.x<b.x+b.w&&a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y}
function layoutLabels(input,view=[0,0,W,H],maxVisible=8){
 const [left,top,width,height]=view;
 const margin=7;
 const reserved=[],shown=[];
 const visible=input.filter(x=>x.x>=left-10&&x.x<=left+width+10&&x.y>=top-10&&x.y<=top+height+10);
 visible.sort((a,b)=>(b.priority||0)-(a.priority||0)||a.id.localeCompare(b.id));
 const limit=clamp(maxVisible,2,12);
 for(const actor of visible){
   if(shown.length>=limit)break;
   const text=abbr(actor.name);
   const bw=clamp(14+text.length*5.8,37,101),bh=17;
   const xs=[actor.x-bw/2,actor.x-bw/2,actor.x+18,actor.x-bw-18];
   const ys=[actor.y-37,actor.y+20,actor.y-8,actor.y-8];
   let box=null;
   for(let k=0;k<4;k++){
     const x=clamp(xs[k],left+margin,left+width-bw-margin);
     const y=clamp(ys[k],top+margin,top+height-bh-margin);
     const candidate={x,y,w:bw,h:bh};
     const avatar={x:actor.x-14,y:actor.y-18,w:28,h:36};
     if(hits(candidate,avatar,0))continue;
     if(reserved.some(r=>hits(candidate,r,4)))continue;
     box={...candidate,anchor:k};break;
   }
   if(!box)continue;
   shown.push({...actor,label:text,box});
   reserved.push(box);
 }
 return shown;
}
function token(actor){
 const {x,y,profile,state,look,id,focused,active}=actor;
 const main=/^#[0-9a-f]{3,8}$/i.test(look.primary)?look.primary:'#47807a';
 const trim=/^#[0-9a-f]{3,8}$/i.test(look.secondary)?look.secondary:'#e7f7dc';
 const skin=/^#[0-9a-f]{3,8}$/i.test(look.skin)?look.skin:'#c29d7e';
 const n=look.number!=null&&/^\d{1,3}$/.test(String(look.number))?String(look.number):'';
 const hp=clamp(Number(state.hp)||0,0,100);
 const ring=focused?'#d7ff4a':active?'#ffb673':'#d6edf0';
 const status=state.ally?' #aff3cd':'';
 return '<g class="v19-actor'+(focused?' v19-focused':'')+(active?' v19-in-action':'')+'" transform="translate('+fmt(x)+' '+fmt(y)+')" data-v19-actor="'+esc(id)+'" aria-label="'+esc(profile.name)+' · '+Math.round(hp)+' HP">'+
  '<ellipse cx="0" cy="10" rx="13.5" ry="5" fill="#010813" opacity=".66"/>'+
  (focused?'<circle r="21" fill="none" stroke="#d7ff4a" stroke-width="1.4" stroke-dasharray="3 5" class="v19-focus-ring"/>':'')+
  (active?'<circle r="18" fill="none" stroke="#ffc16c" stroke-width="1.2" opacity=".85" class="v19-action-ring"/>':'')+
  '<path d="M0 -14L11 -7L11 6L0 14L-11 6L-11 -7Z" fill="#0b1826" stroke="'+ring+'" stroke-width="2.2"/>'+
  '<path d="M0 -10L8 -5V4L0 10L-8 4V-5Z" fill="'+main+'" stroke="'+trim+'" stroke-width=".8"/>'+
  '<ellipse cy="-4.8" rx="3.6" ry="3.7" fill="'+skin+'" stroke="#101820" stroke-width=".6"/>'+
  '<path d="M-6 7V2Q-4 -2 0 -1Q4 -2 6 2V7Z" fill="'+main+'" stroke="'+trim+'" stroke-width=".7"/>'+
  (n?'<text x="0" y="6.8" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="6.5" paint-order="stroke" stroke="#1b2433" stroke-width="1.2" fill="'+trim+'">'+n+'</text>':'')+
  '<path d="M-11.5 14.5H11.5" stroke="#07111c" stroke-width="3" stroke-linecap="round"/>'+
  '<path d="M-11.5 14.5H'+fmt(-11.5+23*hp/100)+'" stroke="'+(hp<26?'#ff7474':hp<55?'#ffd279':'#a1f7b6')+'" stroke-width="2.1" stroke-linecap="round"/>'+
  (state.ally?'<circle cx="11" cy="-11" r="3.1" fill="#b9f8ce" stroke="#051821" stroke-width="1"/>':'')+
  '</g>';
}
function label(actor){
 const b=actor.box;
 return '<g class="v19-label'+(actor.focused?' v19-label-focus':'')+'" aria-hidden="true">'+
  '<path d="M'+fmt(actor.x)+' '+fmt(actor.y-14)+'L'+fmt(b.x+b.w/2)+' '+fmt(b.y+b.h)+'" fill="none" stroke="#d5eff1" stroke-opacity=".43" stroke-width=".75" />'+
  '<rect x="'+fmt(b.x)+'" y="'+fmt(b.y)+'" width="'+fmt(b.w)+'" height="'+b.h+'" rx="4.4" fill="'+(actor.focused?'#253c32':'#081522')+'" stroke="'+(actor.focused?'#d7ff4a':'#72959e')+'" stroke-width=".8" stroke-opacity=".89"/>'+
  '<text x="'+fmt(b.x+b.w/2)+'" y="'+fmt(b.y+11.6)+'" font-family="Arial,sans-serif" fill="#f7ffff" font-size="9.5" font-weight="700" text-anchor="middle">'+esc(actor.label)+'</text>'+
  '</g>';
}
function trails(frame,actors,activeSet){
 const previous=opts.match.frames[Math.max(0,opts.frame-1)];
 if(!previous||previous.tick===frame.tick)return '';
 const visible=actors.filter(a=>a.focused||activeSet.has(a.id)).slice(0,6),lines=[];
 for(const a of visible){
   const old=previous.actors[a.id];if(!old?.alive)continue;
   const x=old.x*W/31,y=old.y*H/19;
   if(Math.hypot(a.x-x,a.y-y)<2)continue;
   lines.push('<path class="v19-motion-trail" d="M'+fmt(x)+' '+fmt(y)+'L'+fmt(a.x)+' '+fmt(a.y)+'" stroke="'+(a.focused?'#d7ff4a':'#a2eff5')+'" fill="none" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="3 4" opacity=".6"/>');
 }
 return lines.join('');
}
function atmosphere(frame,arena){
 const colors={CITY:'#84d9f0',WILDERNESS:'#9ee8a7',RUINS:'#e9c58e',FROZEN:'#c3f2ff'};
 const col=colors[arena]||'#bdf8f4';
 const percent=clamp(Math.round((frame.radius||0)/11*100),0,100);
 return '<g class="v19-world-atmosphere" aria-hidden="true">'+
   '<path d="M0 0H620V390H0Z" stroke="'+col+'" stroke-opacity=".25" stroke-width="3" fill="none"/>'+
   '<path d="M27 27h55M27 27v15M593 27h-55M593 27v15M27 363h55M27 363v-15M593 363h-55M593 363v-15" stroke="'+col+'" stroke-opacity=".33" stroke-width="1.1" fill="none"/>'+
   '<rect x="17" y="16" width="126" height="23" rx="4" fill="#06121edc" stroke="#8aaaba" stroke-opacity=".4"/>'+
   '<text x="26" y="31" font-size="9" font-weight="800" font-family="Arial,sans-serif" letter-spacing="1" fill="#bfe3e5">SECTOR  /  '+(arena==='CITY'?'METRO':arena==='RUINS'?'CITADEL':arena==='FROZEN'?'GLACIER':'BASIN')+'</text>'+
   '<rect x="503" y="16" width="99" height="23" rx="4" fill="#06121edc" stroke="'+col+'" stroke-opacity=".44"/>'+
   '<text x="552" y="31" font-size="9" font-weight="800" text-anchor="middle" font-family="Arial,sans-serif" fill="#def6ed">ZONE  '+percent+'%</text>'+
   '</g>';
}
function apply(frame){
 if(!opts.match||!frame)return;
 const svg=document.getElementById('map');
 if(!svg)return;
 svg.querySelectorAll('.figure,.ll-map-creature').forEach(n=>n.remove());
 const spectator=window.LastLegendSpectator;
 const followed=spectator?.state?.follow||null;
 const event=typeof window.eventForFrame==='function'?window.eventForFrame(frame):null;
 const activeSet=new Set((event?.participants||[]).filter(id=>frame.actors[id]?.alive));
 const actors=opts.match.roster.reduce((arr,id)=>{
   const state=frame.actors[id],profile=opts.profiles.get(id);
   if(!state?.alive||!profile)return arr;
   const look=typeof window.appearanceFor==='function'?appearanceFor(profile):{};
   arr.push({id,profile,look,state,x:state.x*W/31,y:state.y*H/19,
     name:profile.name,focused:id===followed,active:activeSet.has(id),
     priority:(id===followed?200:0)+(activeSet.has(id)?120:0)+(state.eliminations||0)*3+state.hp/100});
   return arr;
 },[]);
 const view=currentView(frame);
 const maxLabels=actors.length>38?6:actors.length>16?8:12;
 const labels=layoutLabels(actors,view,maxLabels);
 const layer=document.createElementNS(ns,'g');
 layer.setAttribute('class','v19-match-layer');
 layer.innerHTML=atmosphere(frame,opts.match.arena)+
   '<g class="v19-motion-layer">'+trails(frame,actors,activeSet)+'</g>'+
   '<g class="v19-actor-layer">'+actors.map(token).join('')+'</g>'+
   '<g class="v19-label-layer">'+labels.map(label).join('')+'</g>';
 const targets=svg.querySelector('.ll-map-targets');
 if(targets)svg.insertBefore(layer,targets);else svg.appendChild(layer);
 const bar=document.getElementById('rb-broadcast-alive');
 if(bar)bar.textContent=frame.alive.length+' / '+opts.match.roster.length+' ALIVE · '+String(frame.phase||'OPENING').toUpperCase();
 const focus=svg.querySelector('[data-v19-actor="'+((followed||'').replace(/["\\]/g,''))+'"]');
 if(focus)focus.parentNode.appendChild(focus);
}
window.renderMap=function(frame){previousMap(frame);apply(frame);};
window.LastLegendBattleVision={layoutLabels,abbr,apply,currentView};
})();
