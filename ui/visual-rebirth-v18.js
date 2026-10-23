(function VisualRebirthV18(){
  'use strict';
  // Presentation-only extension: simulation seed, match frames, roster data and results remain authoritative.
  const arenas={
    WILDERNESS:{name:'THE WILDERNESS',sub:'Old-growth forest · rivers · exposed ridges',art:'rb-art-wilderness',code:'01 / FOREST',region:'EMERALD BASIN'},
    CITY:{name:'NEON CITY',sub:'High-rise blocks · intersections · backstreets',art:'rb-art-city',code:'02 / METROPOLIS',region:'AFTERHOURS DISTRICT'},
    RUINS:{name:'THE GAUNTLET',sub:'Ancient colonnades · collapsed walls · ravines',art:'rb-art-ruins',code:'03 / RUINS',region:'THE FALLEN CITADEL'},
    FROZEN:{name:'FROZEN FRONTIER',sub:'Ice fields · crevasses · glacial shelters',art:'rb-art-frozen',code:'04 / TUNDRA',region:'NORTH EXPANSE'}
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const fix=(v)=>Number.isFinite(v)?Number(v.toFixed(2)):0;
  const unit=(seed,index,salt=1)=>{
    let x=(Math.imul((Number(seed)||0)^0x7f4a7c15,1664525) + Math.imul(index+17,1013904223)+Math.imul(salt+7,374761393))|0;
    x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
    return (x>>>0)/4294967296;
  };
  const sp=(n)=>fix(n);
  const defs='<defs>'+
    '<linearGradient id="rb-grass" x2="1" y2="1"><stop stop-color="#294e3a"/><stop offset=".5" stop-color="#254b44"/><stop offset="1" stop-color="#142d37"/></linearGradient>'+
    '<linearGradient id="rb-city" x2="0" y2="1"><stop stop-color="#1e3549"/><stop offset="1" stop-color="#182435"/></linearGradient>'+
    '<linearGradient id="rb-sand" x2="1" y2="1"><stop stop-color="#69553d"/><stop offset="1" stop-color="#3a3934"/></linearGradient>'+
    '<linearGradient id="rb-snow" x2="1" y2="1"><stop stop-color="#789eb7"/><stop offset=".5" stop-color="#426a8a"/><stop offset="1" stop-color="#1f3f64"/></linearGradient>'+
    '<linearGradient id="rb-waterfill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68c9bf"/><stop offset="1" stop-color="#245b7b"/></linearGradient>'+
    '<linearGradient id="rb-roof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#637c8a"/><stop offset="1" stop-color="#324657"/></linearGradient>'+
    '<radialGradient id="rb-vignette"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#030912" stop-opacity=".64"/></radialGradient>'+
    '<pattern id="rb-map-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="#e7f7d7" stroke-opacity=".09" stroke-width=".55" fill="none"/></pattern>'+
    '<pattern id="rb-map-speck" width="31" height="29" patternUnits="userSpaceOnUse"><circle cx="3" cy="9" r="1.3" fill="#d1f6df" fill-opacity=".12"/><circle cx="24" cy="26" r=".6" fill="#d3f6ff" fill-opacity=".17"/></pattern>'+
    '</defs>';

  function tree(x,y,r,n){
    const t=unit(n,3,5),dark=t>.5?'#1e5f49':'#23513d',bright=t>.5?'#397d56':'#3e876c';
    return '<g class="rb-terrain-feature" opacity=".95" transform="translate('+sp(x)+' '+sp(y)+')">'+
      '<ellipse cy="'+sp(r*.28)+'" rx="'+sp(r*.92)+'" ry="'+sp(r*.52)+'" fill="#04171a" opacity=".48"/>'+
      '<path d="M0 '+sp(-r*1.15)+' L'+sp(r*.78)+' '+sp(r*.32)+' L'+sp(r*.28)+' '+sp(r*.17)+' L'+sp(r*.95)+' '+sp(r*.7)+' L'+sp(-r*.95)+' '+sp(r*.7)+' L'+sp(-r*.28)+' '+sp(r*.17)+' L'+sp(-r*.78)+' '+sp(r*.32)+'Z" fill="'+dark+'" stroke="#7cc58b" stroke-opacity=".36" stroke-width=".8"/>'+
      '<path d="M0 '+sp(-r*.98)+' L'+sp(r*.55)+' '+sp(r*.25)+' L0 '+sp(r*.02)+' L'+sp(-r*.55)+' '+sp(r*.25)+'Z" fill="'+bright+'" opacity=".78"/>'+
      '</g>';
  }
  function cliff(x,y,r,n){
    const tilt=unit(n,1,9)*36-18;
    return '<g class="rb-terrain-feature" transform="translate('+sp(x)+' '+sp(y)+') rotate('+sp(tilt)+')">'+
     '<path d="M'+sp(-r)+' '+sp(r*.1)+' L'+sp(-r*.7)+' '+sp(-r*.65)+' L'+sp(r*.45)+' '+sp(-r*.9)+' L'+sp(r)+' '+sp(-r*.1)+' L'+sp(r*.8)+' '+sp(r*.63)+' L'+sp(-r*.4)+' '+sp(r*.8)+'Z" fill="#4d6970" stroke="#a4c4ba" stroke-opacity=".48"/>'+
     '<path d="M'+sp(-r*.7)+' '+sp(-r*.65)+' L'+sp(r*.45)+' '+sp(-r*.9)+' L'+sp(r*.14)+' '+sp(-r*.15)+' L'+sp(-r*.45)+' '+sp(r*.16)+'Z" fill="#99b5a6" opacity=".51"/></g>';
  }
  function lake(x,y,r){
    return '<g class="rb-water" opacity=".83" transform="translate('+sp(x)+' '+sp(y)+')">'+
      '<ellipse rx="'+sp(r*1.25)+'" ry="'+sp(r*.76)+'" fill="#142a37" stroke="#88c8ad" stroke-width="3" stroke-opacity=".43"/>'+
      '<ellipse rx="'+sp(r*1.06)+'" ry="'+sp(r*.61)+'" fill="url(#rb-waterfill)" opacity=".74"/>'+
      '<path d="M'+sp(-r*.68)+' -2 Q0 '+sp(-r*.5)+' '+sp(r*.7)+' -3" fill="none" stroke="#d2fff1" stroke-width="1.5" opacity=".5"/></g>';
  }
  function block(x,y,r,n){
    const h=clamp(r*.98,12,32),w=clamp(r*1.25,15,39),shift=4+unit(n,12,3)*7,
    roof=(unit(n,2,4)>.54?'#566d82':'#516c75'), neon=(unit(n,13,2)>.5?'#76e4e9':'#c6b0f5');
    return '<g class="rb-terrain-feature" transform="translate('+sp(x)+' '+sp(y)+')">'+
      '<ellipse cx="3" cy="8" rx="'+sp(w*.75)+'" ry="'+sp(h*.44)+'" fill="#010815" opacity=".55"/>'+
      '<path d="M'+sp(-w/2)+' '+sp(-h/2)+' L'+sp(-w/2+shift)+' '+sp(-h/2-shift)+' L'+sp(w/2+shift)+' '+sp(-h/2-shift)+' L'+sp(w/2)+' '+sp(-h/2)+'Z" fill="'+roof+'" stroke="#c5e8e5" stroke-opacity=".4"/>'+
      '<path d="M'+sp(w/2)+' '+sp(-h/2)+' L'+sp(w/2+shift)+' '+sp(-h/2-shift)+' L'+sp(w/2+shift)+' '+sp(h/2-shift)+' L'+sp(w/2)+' '+sp(h/2)+'Z" fill="#24384f" stroke="#9dbbc5" stroke-opacity=".3"/>'+
      '<rect x="'+sp(-w/2)+'" y="'+sp(-h/2)+'" width="'+sp(w)+'" height="'+sp(h)+'" fill="url(#rb-roof)" stroke="'+neon+'" stroke-opacity=".6" stroke-width="1"/>'+
      '<path d="M'+sp(-w*.3)+' '+sp(-h*.26)+'h'+sp(w*.36)+'v'+sp(h*.28)+'h'+sp(-w*.36)+'z" fill="#223341" stroke="#aad5dc" stroke-opacity=".3"/>'+
      '<path d="M'+sp(w*.17)+' '+sp(-h*.28)+'v'+sp(h*.58)+'" stroke="'+neon+'" stroke-width="2" opacity=".85"/>'+
      '<rect x="'+sp(-w*.38)+'" y="'+sp(h*.22)+'" width="'+sp(w*.3)+'" height="2" fill="'+neon+'" opacity=".8"/></g>';
  }
  function pillar(x,y,r,n){
    const tilt=unit(n,3,8)*60-30;
    return '<g class="rb-terrain-feature" transform="translate('+sp(x)+' '+sp(y)+') rotate('+sp(tilt)+')">'+
      '<ellipse cx="4" cy="5" rx="'+sp(r*.7)+'" ry="'+sp(r*.38)+'" fill="#110d0b" opacity=".6"/>'+
      '<rect x="'+sp(-r*.48)+'" y="'+sp(-r*.53)+'" width="'+sp(r*.96)+'" height="'+sp(r*.86)+'" rx="1" fill="#baa17a" stroke="#f3dbac" stroke-opacity=".54" stroke-width="1"/>'+
      '<path d="M'+sp(-r*.48)+' '+sp(-r*.53)+' l5 -5h'+sp(r*.96)+'l-5 5Z" fill="#e9d4ad" opacity=".75"/>'+
      '<path d="M0 '+sp(-r*.5)+' v'+sp(r*.77)+'" stroke="#654d3c" stroke-width="1.2" opacity=".6"/></g>';
  }
  function icy(x,y,r,n){
    const rot=unit(n,3,6)*70-35;
    return '<g class="rb-terrain-feature" transform="translate('+sp(x)+' '+sp(y)+') rotate('+sp(rot)+')">'+
      '<ellipse cx="3" cy="5" rx="'+sp(r*.82)+'" ry="'+sp(r*.37)+'" fill="#0d253d" opacity=".55"/>'+
      '<path d="M0 '+sp(-r*1.2)+' L'+sp(r*.76)+' '+sp(r*.13)+' L0 '+sp(r*.85)+' L'+sp(-r*.83)+' '+sp(r*.16)+'Z" fill="#90d4e6" fill-opacity=".78" stroke="#e3ffff" stroke-opacity=".64" stroke-width=".9"/>'+
      '<path d="M0 '+sp(-r*1.2)+' L'+sp(r*.76)+' '+sp(r*.13)+' L0 '+sp(r*.15)+'Z" fill="#d8f4fa" opacity=".6"/>'+
      '<path d="M0 '+sp(r*.15)+'V'+sp(r*.85)+'L'+sp(-r*.83)+' '+sp(r*.16)+'Z" fill="#5b91af" opacity=".77"/></g>';
  }
  function mapSurface(map,skin){
    const a=map.arena,seed=map.seed||0,parts=[];
    const bg=a==='CITY'?'url(#rb-city)':a==='RUINS'?'url(#rb-sand)':a==='FROZEN'?'url(#rb-snow)':'url(#rb-grass)';
    parts.push('<rect width="620" height="390" fill="'+bg+'"/>');
    if(a==='WILDERNESS'){
      parts.push('<path d="M-30 116 Q110 37 180 85 T386 66 T660 125 L650 158 Q480 113 402 123 T192 153 T-30 176Z" fill="#517b4f" opacity=".25"/>');
      parts.push('<path d="M-35 320 Q132 267 210 333 T480 302 T660 349 L650 390 H-35Z" fill="#789f62" opacity=".16"/>');
      parts.push('<path d="M-25 17 C90 40 90 170 190 151 S343 170 333 230 S480 261 652 355" fill="none" stroke="#082732" stroke-width="40" opacity=".85"/>');
      parts.push('<path class="rb-water" d="M-25 17 C90 40 90 170 190 151 S343 170 333 230 S480 261 652 355" fill="none" stroke="url(#rb-waterfill)" stroke-width="30" opacity=".72"/>');
      parts.push('<path d="M-25 17 C90 40 90 170 190 151 S343 170 333 230 S480 261 652 355" fill="none" stroke="#c0efdf" stroke-width="1" stroke-dasharray="20 15" opacity=".44"/>');
    }else if(a==='CITY'){
      for(const x of [105,262,421,550]){
        parts.push('<rect x="'+(x-14)+'" width="28" height="390" fill="#101c2c" opacity=".92"/>');
        parts.push('<path d="M'+x+' 0V390" stroke="#97b9c8" stroke-width="1.5" stroke-dasharray="9 12" opacity=".56"/>');
        for(const y of [83,205,323]){parts.push('<rect x="'+(x-14)+'" y="'+(y-19)+'" width="28" height="4" fill="#bfd3da" opacity=".44"/><rect x="'+(x-14)+'" y="'+(y+15)+'" width="28" height="4" fill="#bfd3da" opacity=".44"/>')}
      }
      for(const y of [83,205,323]){
        parts.push('<rect y="'+(y-15)+'" width="620" height="30" fill="#101c2b" opacity=".94"/>');
        parts.push('<path d="M0 '+y+'H620" stroke="#95b4c0" stroke-width="1.4" stroke-dasharray="13 19" opacity=".54"/>');
      }
      parts.push('<rect x="16" y="16" width="590" height="359" rx="8" fill="none" stroke="#9ecef9" stroke-opacity=".16" stroke-width="2"/>');
    }else if(a==='RUINS'){
      parts.push('<circle cx="310" cy="194" r="160" fill="#968064" fill-opacity=".14" stroke="#d9bc8e" stroke-opacity=".35" stroke-width="26"/>');
      for(let k=0;k<4;k++)parts.push('<circle cx="310" cy="194" r="'+(55+k*37)+'" fill="none" stroke="#d9bd91" stroke-opacity="'+(.17-k*.03)+'" stroke-width="2" stroke-dasharray="16 8"/>');
      parts.push('<path d="M0 335 L135 310 L228 351 L332 301 L620 340 L620 390 H0Z" fill="#231d1f" opacity=".52"/>');
      parts.push('<path d="M55 -10L81 46L68 135L120 201L103 278L147 400" fill="none" stroke="#241e20" stroke-width="18" opacity=".66"/>');
      parts.push('<path d="M55 -10L81 46L68 135L120 201L103 278L147 400" fill="none" stroke="#b79e80" stroke-width="3" stroke-opacity=".36"/>');
    }else{
      parts.push('<path d="M-25 75 Q125 17 232 75 T430 67 T655 85 L655 148 Q438 132 337 166 T-25 155Z" fill="#c8eaf0" opacity=".17"/>');
      parts.push('<path d="M-30 285 Q105 230 226 284 T470 253 T655 270 L650 390H-20Z" fill="#caeeff" opacity=".13"/>');
      parts.push('<path d="M-30 185 C135 160 155 240 278 195 S470 115 652 163" stroke="#173a66" stroke-width="38" fill="none" opacity=".8"/>');
      parts.push('<path class="rb-water" d="M-30 185 C135 160 155 240 278 195 S470 115 652 163" stroke="#77bad7" stroke-width="29" fill="none" opacity=".6"/>');
      parts.push('<path d="M-30 185 C135 160 155 240 278 195 S470 115 652 163" stroke="#d1fcff" stroke-dasharray="31 11" stroke-width="1" fill="none" opacity=".49"/>');
    }
    if(a!=='CITY'){
      (map.paths||[]).forEach((p,i)=>{
        const shift=clamp((p.offset||0)*15,-115,115),bend=clamp((p.bend||0)*80,-85,85);
        const y=105+i*86+shift;
        parts.push('<path d="M-35 '+sp(y)+' Q'+sp(240+bend)+' '+sp(y-90)+' 660 '+sp(y+54)+'" stroke="'+(a==='FROZEN'?'#e9fbfb':a==='RUINS'?'#d2af83':'#b4b17d')+'" stroke-width="'+(a==='FROZEN'?7:10)+'" opacity=".23" fill="none" stroke-linecap="round"/>');
        parts.push('<path d="M-35 '+sp(y)+' Q'+sp(240+bend)+' '+sp(y-90)+' 660 '+sp(y+54)+'" stroke="#19272b" stroke-width="2" opacity=".3" fill="none" stroke-dasharray="12 16"/>');
      });
    }
    (map.landmarks||[]).slice(0,80).forEach((l,i)=>{
      if(!Number.isFinite(l.x)||!Number.isFinite(l.y)||!Number.isFinite(l.size))return;
      const x=clamp(l.x*20,0,620),y=clamp(l.y*390/19,0,390),r=clamp(l.size*12,6,25);
      if(a==='CITY'){
        if(['building','courtyard'].includes(l.type))parts.push(block(x,y,r,i+seed));
        else if(l.type==='alley')parts.push('<path d="M'+sp(x-r)+' '+sp(y-r*.2)+' l'+sp(r*2)+' '+sp(r*.3)+'" stroke="#58d5de" stroke-width="2" opacity=".53"/>');
        else parts.push('<rect x="'+sp(x-r)+'" y="'+sp(y-r*.26)+'" width="'+sp(r*2)+'" height="'+sp(r*.5)+'" rx="3" fill="#41505d" opacity=".35"/>');
      }else if(a==='WILDERNESS'){
        if(l.type==='forest'){parts.push(tree(x-r*.26,y,r*.7,i+seed));parts.push(tree(x+r*.42,y+r*.24,r*.5,i+seed+4));}
        else if(l.type==='water')parts.push(lake(x,y,r*.9));
        else if(l.type==='ridge')parts.push(cliff(x,y,r,i+seed));
        else parts.push('<ellipse cx="'+sp(x)+'" cy="'+sp(y)+'" rx="'+sp(r)+'" ry="'+sp(r*.5)+'" fill="#a1bb7f" opacity=".24" stroke="#d6d99d" stroke-opacity=".3"/>');
      }else if(a==='RUINS'){
        if(['pillar','rubble'].includes(l.type))parts.push(pillar(x,y,r,i+seed));
        else if(l.type==='ravine')parts.push('<path d="M'+sp(x-r)+' '+sp(y-r)+' l'+sp(r*.55)+' '+sp(r*.9)+' l'+sp(-r*.3)+' '+sp(r*.6)+' l'+sp(r)+' '+sp(r*.4)+'" stroke="#1b1d21" stroke-width="'+sp(r*.38)+'" stroke-linejoin="round" fill="none" opacity=".75"/>');
        else parts.push('<ellipse cx="'+sp(x)+'" cy="'+sp(y)+'" rx="'+sp(r*.7)+'" ry="'+sp(r*.26)+'" fill="#d9c394" opacity=".16"/>');
      }else{
        if(l.type==='ice'||l.type==='cliff')parts.push(icy(x,y,r,i+seed));
        else if(l.type==='shelter')parts.push('<g class="rb-terrain-feature" transform="translate('+sp(x)+' '+sp(y)+')"><rect x="'+sp(-r*.6)+'" y="'+sp(-r*.45)+'" width="'+sp(r*1.2)+'" height="'+sp(r*.9)+'" fill="#355b74" stroke="#ddfaff" stroke-opacity=".6"/><path d="M'+sp(-r*.6)+' '+sp(-r*.45)+'L0 '+sp(-r)+'L'+sp(r*.6)+' '+sp(-r*.45)+'Z" fill="#daeef1"/></g>');
        else parts.push('<ellipse cx="'+sp(x)+'" cy="'+sp(y)+'" rx="'+sp(r)+'" ry="'+sp(r*.4)+'" fill="#e2f6fc" opacity=".32"/>');
      }
    });
    // Map annotations and coordinates always sit below playable markers.
    parts.push('<rect width="620" height="390" fill="url(#rb-map-speck)" opacity=".7"/>');
    parts.push('<rect width="620" height="390" fill="url(#rb-map-grid)" opacity=".55"/>');
    parts.push('<rect width="620" height="390" fill="url(#rb-vignette)" pointer-events="none"/>');
    parts.push('<path d="M14 40V14H40 M580 14H606V40 M14 350V376H40 M580 376H606V350" fill="none" stroke="#defbc0" stroke-width="1.8" opacity=".55"/>');
    parts.push('<g font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#e8fbea" opacity=".68"><text x="15" y="28">N  ↑</text><text x="16" y="365">'+(skin?.region||'ARENA')+'</text><text x="605" y="365" text-anchor="end">GRID / 31×19</text></g>');
    return parts.join('');
  }
  window.LastLegendRebirthMap=function(map){
    if(!map||!arenas[map.arena])return '<rect width="620" height="390" fill="#14212d"/>';
    return defs+mapSurface(map,arenas[map.arena]);
  };
  const artMarkup=(a)=>'<span class="rb-arena-art '+a.art+'" aria-hidden="true"><span class="rb-art-code">'+a.code+'</span></span>';
  function installHome(){
    const home=document.getElementById('site-home'),side=home?.querySelector('.site-hero-side');
    if(!side||side.querySelector('.rb-holo'))return;
    const holo=document.createElement('div');holo.className='rb-holo';holo.setAttribute('aria-hidden','true');
    holo.innerHTML='<div class="rb-holo-grid"></div><div class="rb-holo-ring"></div>'+
      '<div class="rb-holo-corners">LIVE / ARENA 01<br>COMPETITOR TRACKING<br>SECTOR 7–ALPHA</div>'+
      '<div class="rb-holo-unit" style="--x:28%;--y:48%;--c:#d7ff4a;--t:3.1s;--delay:-1s">23</div>'+
      '<div class="rb-holo-unit" style="--x:49%;--y:36%;--c:#96eafd;--t:4.2s;--delay:-2s">85</div>'+
      '<div class="rb-holo-unit" style="--x:67%;--y:60%;--c:#bbaaef;--t:3.7s;--delay:-1.6s">10</div>'+
      '<div class="rb-holo-unit" style="--x:42%;--y:71%;--c:#ffd283;--t:4.6s;--delay:-.7s">07</div>'+
      '<div class="rb-holo-label">100 ENTRANTS / 1 CROWN</div>';
    side.prepend(holo);
    const metrics=home.querySelector('.site-home-metrics');
    if(metrics&&!home.querySelector('.rb-arenas')){
      const section=document.createElement('section');section.className='rb-arenas';section.setAttribute('aria-labelledby','rb-arena-heading');
      section.innerHTML='<div class="rb-arena-heading"><div><span class="site-eyebrow">THE FIELD OF PLAY / SELECT A DESTINATION</span><h2 id="rb-arena-heading">FOUR WORLDS. ONE SURVIVOR.</h2></div><p>Select a world to begin drafting for that battleground.</p></div><div class="rb-arena-grid">'+
      Object.entries(arenas).map(([id,a])=>'<button class="rb-arena-card" type="button" data-rb-arena="'+id+'" aria-label="Draft for '+a.name+'">'+artMarkup(a)+'<span class="rb-arena-body"><strong class="rb-arena-name">'+a.name+'</strong><span class="rb-arena-sub">'+a.sub+'</span></span><span class="rb-arena-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>';
      metrics.after(section);
      section.addEventListener('click',event=>{
        const btn=event.target.closest('[data-rb-arena]');if(!btn)return;
        const arena=document.getElementById('arena');if(arena){arena.value=btn.dataset.rbArena;arena.dispatchEvent(new Event('change',{bubbles:true}));}
        const go=document.getElementById('site-first-battle');if(go)go.click();
        else location.hash='#/play';
      });
    }
  }
  function installPreview(){
    const select=document.getElementById('arena'),footer=document.querySelector('#draft-view .draft-footer');
    if(!select||!footer)return;
    let preview=document.querySelector('.rb-arena-preview');
    if(!preview){preview=document.createElement('div');preview.className='rb-arena-preview';preview.setAttribute('aria-live','polite');footer.parentNode.insertBefore(preview,footer);}
    function refresh(){
      const a=arenas[select.value]||arenas.WILDERNESS;
      preview.innerHTML=artMarkup(a)+'<span class="rb-preview-copy"><em>SELECTED BATTLEGROUND / LIVE PREVIEW</em><strong>'+a.name+'</strong><small>'+a.sub+'. Terrain and landmarks change with the seed.</small></span>';
    }
    select.addEventListener('change',refresh);refresh();
  }
  function installBroadcast(){
    const holder=document.querySelector('#battle-view .map-holder');if(!holder||holder.querySelector('.rb-broadcast-bar'))return;
    const bar=document.createElement('div');bar.className='rb-broadcast-bar';
    bar.innerHTML='<span class="rb-live">MATCH FEED / LIVE SIMULATION</span><span id="rb-broadcast-arena">ARENA TRACKING</span><span id="rb-broadcast-alive">AWAITING DEPLOYMENT</span>';
    holder.prepend(bar);
    const phase=document.getElementById('phase'),remaining=document.getElementById('remaining'),mapLabel=document.getElementById('map-label');
    const refresh=()=>{
      bar.querySelector('#rb-broadcast-arena').textContent=(mapLabel?.textContent||'ARENA').split(' · ')[0];
      bar.querySelector('#rb-broadcast-alive').textContent=(remaining?.textContent||'WAITING')+' REMAINING · '+(phase?.textContent||'OPENING');
    };
    [phase,remaining,mapLabel].forEach(node=>{if(node)new MutationObserver(refresh).observe(node,{characterData:true,childList:true,subtree:true});});
    refresh();
  }
  function syncRoute(){
    const part=(location.hash||'#/home').replace(/^#\//,'').split('?')[0];
    document.body.dataset.rbRoute=part||'home';
  }
  function init(){
    installHome();installPreview();installBroadcast();syncRoute();
    addEventListener('hashchange',syncRoute);
    document.documentElement.classList.add('rb-v18-ready');
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
    else init();
  }
})();
