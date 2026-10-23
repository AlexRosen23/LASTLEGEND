/* V18 / human athlete art director.
   A fully synthetic vector treatment for game avatars; stylized, not licensed likenesses.
   Keep original character-renderer adapter for nonhuman roster entries. */
(function(){
 'use strict';
 if(typeof window.figureSVG!=='function'||typeof window.appearanceFor!=='function')return;
 const preceding=window.figureSVG;
 const xml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=(v,fallback)=>/^#[0-9a-fA-F]{3,8}$/.test(String(v??''))?String(v):fallback;
 const sportFor=a=>{
   const t=String(a.sport||'').toLowerCase();
   if(t.includes('american football'))return 'football';
   if(t.includes('basketball'))return 'basketball';
   if(t.includes('baseball'))return 'baseball';
   if(t.includes('ice hockey'))return 'hockey';
   if(t.includes('association football')||t.includes('soccer'))return 'soccer';
   if(t.includes('tennis'))return 'tennis';
   if(t.includes('boxing')||t.includes('mma'))return 'boxing';
   if(t.includes('motorsport'))return 'motorsport';
   if(t.includes('track'))return 'track';
   if(t.includes('swimming'))return 'swimming';
   if(t.includes('cycling'))return 'cycling';
   return 'other';
 };
 const numberFor=(a,look)=>{
   const n=look.number;
   return n!=null && /^\d{1,3}$/.test(String(n))?String(n):'';
 };
 const headgear=(sport,look,kit,contrast)=>{
   if(sport==='football')return '<g class="rb-helmet"><path d="M-17 -45Q-19 -64 0 -66Q18 -65 18 -45L13 -38L-13 -38Z" fill="'+kit+'" stroke="'+contrast+'" stroke-width="2.2"/><path d="M-15 -48H16M-13 -36Q1 -31 13 -36M-17 -43L-22 -41L-17 -29H-3M17 -43L22 -41L18 -29H4" stroke="'+contrast+'" stroke-width="2" fill="none"/><path d="M-12 -55Q0 -64 12 -55" stroke="#ffffff" stroke-opacity=".32" stroke-width="3" fill="none"/></g>';
   if(sport==='baseball')return '<g><path d="M-17 -47Q-19 -63 0 -64Q18 -62 17 -47Z" fill="'+kit+'" stroke="'+contrast+'" stroke-width="1.7"/><path d="M-15 -47Q5 -52 22 -45L21 -41Q6 -40 -15 -43Z" fill="'+kit+'" stroke="'+contrast+'" stroke-width="1.4"/></g>';
   if(['hockey','motorsport','cycling'].includes(sport))return '<g class="rb-helmet"><path d="M-16 -45Q-17 -63 0 -64Q17 -63 17 -45L12 -38L-12 -38Z" fill="'+kit+'" stroke="'+contrast+'" stroke-width="2"/><path d="M-15 -43Q0 -37 15 -43" fill="none" stroke="'+contrast+'" stroke-width="2.8"/><path d="M-12 -51H12" stroke="#f4feff" stroke-opacity=".6" stroke-width="1.3"/></g>';
   const hair=safe(look.hairColor,'#241c1a');
   if(look.hair==='bald')return '<path d="M-12 -54Q0 -65 13 -54" fill="none" stroke="'+hair+'" stroke-opacity=".27" stroke-width=".9"/>';
   if(look.hair==='long'||look.hair==='tied')return '<path d="M-15 -53Q-15 -70 1 -68Q16 -70 17 -49L20 -23L13 -24L11 -53L-12 -51L-11 -25L-19 -24Z" fill="'+hair+'"/>';
   if(look.hair==='spiky')return '<path d="M-17 -49L-17 -64L-11 -59L-8 -70L-3 -63L1 -73L7 -62L13 -68L16 -54L17 -48Z" fill="'+hair+'"/>';
   if(look.hair==='curl')return '<path d="M-17 -49Q-22 -59 -13 -64Q-9 -73 -1 -67Q7 -76 12 -65Q22 -61 17 -48L11 -56L2 -53L-5 -57L-11 -51Z" fill="'+hair+'"/>';
   return '<path d="M-17 -50Q-19 -66 -3 -66Q12 -70 18 -54L14 -50L12 -59L3 -56L-4 -60L-12 -55L-15 -48Z" fill="'+hair+'"/>';
 };
 const extras=(sport,kit,contrast)=>{
   if(sport==='hockey')return '<g class="rb-game-prop"><path d="M27 0L37 46L16 47" stroke="#dbc3a0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M16 47H39" stroke="#1a1820" stroke-width="5" stroke-linecap="round"/></g>';
   if(sport==='tennis')return '<g class="rb-game-prop"><path d="M31 2L38 -9" stroke="#f3f0e6" stroke-width="4"/><ellipse cx="43" cy="-20" rx="11" ry="15" fill="#243951" fill-opacity=".65" stroke="#f5f1db" stroke-width="3"/><path d="M37 -30L47 -10M49 -30L37 -10M33 -20H53" stroke="#e5f1db" stroke-opacity=".55" stroke-width="1"/></g>';
   if(sport==='baseball')return '<g class="rb-game-prop"><path d="M31 8L52 -48" stroke="#f2ce8f" stroke-width="7" stroke-linecap="round"/><path d="M35 0L42 -20" stroke="#a57b4f" stroke-width="3" stroke-linecap="round"/></g>';
   if(sport==='boxing')return '<g><circle cx="-32" cy="16" r="10" fill="'+kit+'" stroke="'+contrast+'" stroke-width="2.2"/><circle cx="32" cy="16" r="10" fill="'+kit+'" stroke="'+contrast+'" stroke-width="2.2"/></g>';
   if(sport==='soccer')return '<g class="rb-game-prop"><circle cx="43" cy="55" r="10" fill="#f3f4ed" stroke="#182029" stroke-width="2"/><path d="M43 49L48 54L44 60L38 57L38 52Z" fill="#2d3843"/></g>';
   if(sport==='basketball')return '<g class="rb-game-prop"><circle cx="40" cy="23" r="12" fill="#da792d" stroke="#ffbe65" stroke-width="2"/><path d="M28 23H52M40 11V35M32 15Q45 23 32 31M48 15Q35 23 48 31" stroke="#4f291d" stroke-width="1.5" fill="none"/></g>';
   return '';
 };
 function athleteSVG(a,options={}){
   const look=window.appearanceFor(a),sport=sportFor(a),number=numberFor(a,look),
     jersey=safe(look.primary,'#326f81'),trim=safe(look.secondary,'#f4ead4'),
     skin=safe(look.skin,'#bd8661'),hair=safe(look.hairColor,'#271c16'),
     dark='#132231',helmet=safe(look.helmet||look.cap,jersey);
   const isCombat=sport==='boxing',bulky=sport==='football'||sport==='hockey',
     shoulders=bulky?28:21,hip=19,renderLarge=Boolean(options.large||options.victory),
     width=options.victory?171:renderLarge?118:54,
     height=options.victory?181:renderLarge?127:62;
   const beard=look.beard==='full'?'<path d="M-13 -38Q-11 -20 0 -18Q11 -20 13 -38L7 -29L0 -26L-7 -29Z" fill="'+hair+'"/>':
     look.beard==='short'?'<path d="M-9 -35Q0 -21 9 -35L5 -27H-5Z" fill="'+hair+'"/>':
     look.beard==='stubble'?'<path d="M-10 -34Q0 -21 10 -34" fill="none" stroke="'+hair+'" stroke-width="2" opacity=".5"/>':'';
   const helm=headgear(sport,look,helmet,trim);
   const eyeBlack=look.eyeBlack?'<path d="M-11 -44l7 1M4 -43l7 -1" stroke="#24262b" stroke-width="3.5"/>':'';
   const goggles=look.glasses?'<g stroke="#1b252b" stroke-width="2" fill="#b2d8e6" fill-opacity=".45"><rect x="-12" y="-47" width="10" height="7" rx="3"/><rect x="2" y="-47" width="10" height="7" rx="3"/><path d="M-2 -44H2" /></g>':'';
   const jacket='<path d="M'+(-shoulders)+' -18 L'+(shoulders)+' -18 L'+(hip+3)+' 25 Q0 30 '+(-hip-3)+' 25Z" fill="'+jersey+'" stroke="'+trim+'" stroke-width="2.1"/>'+
      '<path d="M-12 -18 L0 -12 L12 -18" fill="none" stroke="'+trim+'" stroke-width="3"/>'+
      '<path d="M'+(-shoulders)+' -17 L'+(-shoulders+6)+' -17 L'+(-hip)+' 19 M'+(shoulders)+' -17 L'+(shoulders-6)+' -17 L'+hip+' 19" stroke="'+trim+'" stroke-width="2.2" opacity=".83" fill="none"/>'+
      '<path d="M-15 -11Q0 -7 14 -11" stroke="#fff" stroke-opacity=".15" stroke-width="3" fill="none"/>'+
      (number?'<text x="0" y="13" fill="'+trim+'" stroke="#101821" stroke-width=".65" paint-order="stroke" font-family="Arial,sans-serif" font-size="'+(number.length>2?17:22)+'" font-weight="900" text-anchor="middle">'+xml(number)+'</text>':
      '<path d="M-11 1L11 1M-7 7L7 7" stroke="'+trim+'" stroke-width="2.4" opacity=".75"/>');
   const armSkin=sport==='football'||sport==='hockey'?jersey:skin;
   const jerseyShoulder=bulky?'<ellipse cx="-23" cy="-16" rx="11" ry="9" fill="'+jersey+'" stroke="'+trim+'" stroke-width="1.8"/><ellipse cx="23" cy="-16" rx="11" ry="9" fill="'+jersey+'" stroke="'+trim+'" stroke-width="1.8"/>':'';
   const leftArm='<g class="rb-athlete-arm rb-arm-left" transform-origin="-20px -16px"><path d="M'+(-shoulders+2)+' -14L-29 4L-35 17" stroke="'+armSkin+'" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M-34 13L-36 21" stroke="'+skin+'" stroke-width="7" stroke-linecap="round"/>'+(look.armband?'<path d="M-29 5L-35 6" stroke="'+trim+'" stroke-width="4"/>':'')+'</g>';
   const rightArm='<g class="rb-athlete-arm rb-arm-right" transform-origin="20px -16px"><path d="M'+(shoulders-2)+' -14L29 4L35 17" stroke="'+armSkin+'" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M34 13L36 21" stroke="'+skin+'" stroke-width="7" stroke-linecap="round"/></g>';
   const pants='<path d="M-20 23H20L19 38L4 40L0 32L-4 40L-19 38Z" fill="'+(isCombat?trim:dark)+'" stroke="'+trim+'" stroke-width="1.8"/>';
   const leftLeg='<g class="rb-athlete-leg rb-leg-left" transform-origin="-10px 34px"><path d="M-11 38L-13 53L-17 68" stroke="'+skin+'" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M-15 58L-17 67" stroke="'+trim+'" stroke-width="9" stroke-linecap="round"/><path d="M-17 65L-21 69L-31 70" fill="none" stroke="'+(bulky?'#dce7ef':'#202c3d')+'" stroke-width="10" stroke-linecap="round"/><path d="M-30 72H-18" stroke="'+trim+'" stroke-width="2"/></g>';
   const rightLeg='<g class="rb-athlete-leg rb-leg-right" transform-origin="10px 34px"><path d="M11 38L13 53L18 68" stroke="'+skin+'" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M16 58L18 67" stroke="'+trim+'" stroke-width="9" stroke-linecap="round"/><path d="M18 65L22 69L32 70" fill="none" stroke="'+(bulky?'#dce7ef':'#202c3d')+'" stroke-width="10" stroke-linecap="round"/><path d="M20 72H32" stroke="'+trim+'" stroke-width="2"/></g>';
   const hairFace='<g class="rb-athlete-head"><rect x="-5" y="-24" width="10" height="12" rx="4" fill="'+skin+'"/>'+
     '<ellipse cx="0" cy="-44" rx="16" ry="19" fill="'+skin+'" stroke="#ffffff" stroke-opacity=".28" stroke-width="1"/>'+
     '<path d="M-12 -44Q-12 -57 -4 -59" stroke="#fff" stroke-opacity=".14" fill="none" stroke-width="3"/>'+
     helm+
     '<path d="M-10 -43H-5M5 -43H10" stroke="#252022" stroke-width="1.8" stroke-linecap="round"/>'+
     '<path d="M-2 -35Q0 -33 2 -35" fill="none" stroke="#744735" stroke-width="1.2"/>'+beard+eyeBlack+goggles+'</g>';
   const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-62 -75 124 158" width="'+width+'" height="'+height+'" class="ll-rendered-sprite ll-human rb-character rb-sport-'+sport+(options.victory?' ll-victory rb-victor':'')+(options.dead?' ll-dead':'')+'" role="img" aria-label="'+xml(a.name)+' stylized '+xml(sport)+' athlete">'+
     '<ellipse class="rb-foot-shadow" cx="0" cy="72" rx="38" ry="6" fill="#030912" opacity=".38"/>'+
     '<g class="ll-sprite-body rb-figure-body">'+leftLeg+rightLeg+leftArm+rightArm+
     '<path d="M-15 -19L0 -26L15 -19" fill="'+skin+'"/>'+jacket+jerseyShoulder+pants+hairFace+extras(sport,jersey,trim)+
     (look.tattoo?'<path d="M-27 2l-4 5 5 3-3 4M29 3l-3 6 5 2" stroke="#26343e" stroke-width="1.6" fill="none"/>':'')+
     '</g></svg>';
   return svg;
 }
 window.figureSVG=function(a,options={}){
   const kind=a?.render_type||((a?.kind==='mascot')?'mascot':(a?.kind==='animal'?'horse':'human'));
   if(kind!=='human')return preceding(a,options);
   return athleteSVG(a,options);
 };
 window.LastLegendRebirthCharacters={sportFor,athleteSVG};
})();
