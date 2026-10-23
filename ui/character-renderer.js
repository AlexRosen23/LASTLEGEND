(function(){
'use strict';
/* Last Legend V6 art adapter. Presentation-only: no simulation state writes. */
if(typeof window.figureSVG!=='function'||typeof window.appearanceFor!=='function')return;
const previousFigure=window.figureSVG, previousChampion=window.championMarkup, previousMap=window.renderMap;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const kindOf=a=>a.render_type||((a.kind==='mascot')?'mascot':(a.kind==='animal'?'horse':'human'));
const modelOf=a=>{
 const kind=kindOf(a),text=[a.name,a.team,a.era].filter(Boolean).join(' ').toLowerCase();
 if(kind!=='mascot')return kind;
 if(/owl|eagle|bird|hawk|raven|falcon|duck|rooster|cardinal|parrot|jay|pelican|penguin|buzzard|wildcat bird/.test(text))return 'bird';
 if(/bull|ram|goat|bison|buffalo|longhorn|ox|horn|minotaur/.test(text))return 'horned';
 if(/bear|bruin|panda|grizzly/.test(text))return 'bear';
 if(/lion|tiger|panther|jaguar|cat|cougar|bobcat|wildcat|pouncer|boomer/.test(text))return 'feline';
 if(/dog|hound|wolf|husky|bulldog|pup|terrier|retriever/.test(text))return 'canine';
 if(/pirate|niner|knight|sailor|warrior|trojan|viking|king|spartan|leprechaun|miner|raider/.test(text))return 'costume';
 return 'mascot';
};
const group=(className,markup)=>'<g class="'+className+'">'+markup+'</g>';
function nonhumanArt(a,options={}){
 const kind=kindOf(a),model=modelOf(a),look=window.appearanceFor(a),fill=look.primary||'#3b7a8e',trim=look.secondary||'#e8dfc9',n=hash(a.id),victory=!!options.victory;
 const size= victory?182:options.large?106:48;
 let art='';
 if(kind==='vehicle'){
   const headlight=(n%2?'#fff5ae':'#c4eeff');
   art='<ellipse cx="0" cy="28" rx="42" ry="5" fill="#061119" opacity=".5"/>'+
   '<path d="M-41 15L-34 -3L-20 -8L-8 -25L23 -25L34 -7L43 1L42 24L-42 24Z" fill="'+fill+'" stroke="'+trim+'" stroke-width="2.5"/>'+
   '<path d="M-5 -21L20 -21L29 -7L-16 -7Z" fill="#9dd4db" stroke="#273a45" stroke-width="2"/>'+
   '<path d="M-38 8L-31 8M31 8L40 8" stroke="'+headlight+'" stroke-width="5"/>'+
   '<path d="M-8 -3L5 -3" stroke="'+trim+'" stroke-width="2"/>'+
   group('ll-wheel','<circle cx="-25" cy="24" r="9" fill="#0d1620" stroke="#e4eaee" stroke-width="3"/><path d="M-30 24H-20M-25 19V29" stroke="#7895a8" stroke-width="1.5"/>')+
   group('ll-wheel','<circle cx="28" cy="24" r="9" fill="#0d1620" stroke="#e4eaee" stroke-width="3"/><path d="M23 24H33M28 19V29" stroke="#7895a8" stroke-width="1.5"/>');
 }else if(kind==='horse'){
   art='<ellipse cx="0" cy="31" rx="44" ry="4" fill="#061119" opacity=".5"/>'+
   '<path d="M-31 -7L-40 -22L-34 -27L-21 -10" stroke="'+fill+'" stroke-width="8" fill="none" stroke-linecap="round"/>'+
   group('ll-leg-a','<path d="M-22 1L-27 27L-35 30M-2 7L2 29L-4 32" stroke="'+fill+'" stroke-width="7" fill="none" stroke-linecap="round"/>')+
   group('ll-leg-b','<path d="M14 7L22 28L17 31M27 0L30 26L37 28" stroke="'+fill+'" stroke-width="7" fill="none" stroke-linecap="round"/>')+
   '<path d="M-30 -13Q3 -25 21 -9L29 -3L21 13Q-4 17 -28 6Z" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>'+
   '<path d="M15 -15L24 -32L35 -39L42 -33L35 -13L28 0Z" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>'+
   '<path d="M26 -32L28 -44L34 -39L40 -46L41 -35" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>'+
   '<path d="M20 -29Q19 -17 12 -15" stroke="#282a31" stroke-width="6" fill="none"/>'+
   '<circle cx="35" cy="-29" r="2.5" fill="#f7f1e5"/><path d="M39 -16l4 1" stroke="#201b1d" stroke-width="2"/>';
 }else if(kind==='aquatic'){
   art='<ellipse cx="0" cy="27" rx="42" ry="5" fill="#061119" opacity=".25"/>'+
   group('ll-tail','<path d="M-31 -5L-51 -25L-48 0L-51 23L-31 11Z" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>')+
   '<path d="M-38 0Q-25 -27 8 -21Q38 -19 43 0Q38 22 10 19Q-26 26 -38 0" fill="'+fill+'" stroke="'+trim+'" stroke-width="2.5"/>'+
   '<path d="M-6 -19L11 -38L18 -18M-4 19L12 34L19 18" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>'+
   '<circle cx="29" cy="-8" r="3.5" fill="#fff"/><circle cx="30" cy="-8" r="1.5" fill="#121b21"/>'+
   '<path d="M34 8Q26 16 17 9" fill="none" stroke="'+trim+'" stroke-width="2"/>';
 }else if(kind==='undead'){
   art='<ellipse cx="0" cy="29" rx="30" ry="4" fill="#061119" opacity=".4"/>'+
   '<path d="M-20 -17L0 -37L20 -17L28 29H-28Z" fill="'+fill+'" stroke="'+trim+'" stroke-width="2.5"/>'+
   '<path d="M-15 -19L0 -27L15 -19L10 11H-10Z" fill="#172b41"/>'+
   '<circle cx="-7" cy="-17" r="4" fill="#72f0ff"/><circle cx="7" cy="-17" r="4" fill="#72f0ff"/>'+
   '<path d="M-25 -6L-40 9M25 -6L40 9" stroke="'+fill+'" stroke-width="9" stroke-linecap="round"/>'+
   '<path d="M-22 -37L-13 -47L-6 -38L1 -51L9 -38L19 -46L23 -35" fill="'+trim+'" stroke="#b5d5ef" stroke-width="1.5"/>';
 }else{
   let ears='',face='',tail='',arms='';
   if(model==='bird'){
     ears='<path d="M-20 -23L-27 -40L-10 -34M10 -34L27 -40L20 -23" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>';
     face='<path d="M-6 -6L0 6L9 -6Z" fill="#ffd779" stroke="#755b31" stroke-width="1.5"/>';
     arms='<path d="M-24 -5L-42 -25L-37 11L-20 8M24 -5L42 -25L37 11L20 8" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>';
   }else if(model==='horned'){
     ears='<path d="M-20 -25L-40 -46L-29 -18M20 -25L40 -46L29 -18" fill="'+trim+'" stroke="'+fill+'" stroke-width="3"/>';
   }else if(model==='bear'){
     ears='<circle cx="-20" cy="-28" r="11" fill="'+fill+'" stroke="'+trim+'" stroke-width="3"/><circle cx="20" cy="-28" r="11" fill="'+fill+'" stroke="'+trim+'" stroke-width="3"/>';
   }else if(model==='feline'){
     ears='<path d="M-26 -19L-25 -43L-7 -29M26 -19L25 -43L7 -29" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>';
     tail='<path d="M24 16Q43 27 38 -5" stroke="'+fill+'" stroke-width="9" fill="none" stroke-linecap="round"/>';
   }else if(model==='canine'){
     ears='<path d="M-25 -20Q-47 -31 -32 -3M25 -20Q47 -31 32 -3" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>';
   }else if(model==='costume'){
     ears='<path d="M-33 -31L26 -31L21 -39L-29 -39Z" fill="'+trim+'" stroke="'+fill+'" stroke-width="2"/>';
   }else ears='<path d="M-27 -22L-31 -35L-14 -29M27 -22L31 -35L14 -29" fill="'+fill+'" stroke="'+trim+'" stroke-width="2"/>';
   if(!face)face='<ellipse cy="2" rx="12" ry="8" fill="'+trim+'"/><circle cy="-1" r="4" fill="#26303b"/>';
   art='<ellipse cx="0" cy="32" rx="36" ry="4" fill="#061119" opacity=".45"/>'+tail+
    '<path d="M-12 10L-17 30M12 10L17 30" stroke="'+fill+'" stroke-width="12" stroke-linecap="round"/>'+
    '<ellipse cy="1" rx="27" ry="31" fill="'+fill+'" stroke="'+trim+'" stroke-width="2.5"/>'+
    '<path d="M-24 12L-38 22M24 12L38 22" stroke="'+fill+'" stroke-width="12" stroke-linecap="round"/>'+arms+
    '<path d="M-21 8L21 8L18 22L-18 22Z" fill="'+trim+'" opacity=".87"/>'+
    ears+'<ellipse cy="-17" rx="27" ry="25" fill="'+fill+'" stroke="'+trim+'" stroke-width="2.5"/>'+
    '<ellipse cx="-10" cy="-20" rx="5.5" ry="7" fill="#fff"/><ellipse cx="10" cy="-20" rx="5.5" ry="7" fill="#fff"/>'+
    '<circle cx="-9" cy="-19" r="2.5" fill="#172029"/><circle cx="11" cy="-19" r="2.5" fill="#172029"/>'+face;
 }
 const cls='ll-rendered-sprite ll-'+escape(kind)+' ll-'+escape(model)+(victory?' ll-victory':'')+(options.dead?' ll-dead':'');
 const label=escape(a.name)+' '+escape(kind)+' '+(victory?'victory':'character')+' animation';
 return '<svg viewBox="-57 -58 114 105" width="'+size+'" height="'+(victory?179:options.large?101:50)+'" class="'+cls+'" role="img" aria-label="'+label+'">'+group('ll-sprite-body',art)+'</svg>';
}
window.figureSVG=function(a,options={}){
 const kind=kindOf(a);
 if(kind!=='human')return nonhumanArt(a,options);
 let html=previousFigure(a,options);
 const cls='ll-rendered-sprite ll-human'+(options.victory?' ll-victory':'')+(options.dead?' ll-dead':'');
 html=html.replace('<svg ','<svg class="'+cls+'" ');
 html=html.replace(/(<svg\b[^>]*>)/,'$1<g class="ll-sprite-body">').replace(/<\/svg>\s*$/,'</g></svg>');
 return html;
};
window.championMarkup=function(){
 let html=previousChampion();
 if(!window.opts?.match)return html;
 const match=window.opts.match,a=window.opts.profiles.get(match.winner),kind=kindOf(a);
 const final=match.frames[match.frames.length-1]?.actors[match.winner];
 const team=a.team||a.era||a.sport||'Independent contender';
 const stats=match.statistics[match.winner];
 const detail='<div class="ll-champion-details" role="group" aria-label="Winner match statistics">'+
 '<div><small>FINAL HEALTH</small><strong>'+(final?Math.round(final.hp):'—')+' HP</strong></div>'+
 '<div><small>ELIMINATIONS</small><strong>'+Number(stats.eliminations||0)+'</strong></div>'+
 '<div><small>ENCOUNTERS</small><strong>'+Number(stats.encounters||0)+'</strong></div>'+
 '<div><small>AFFILIATION</small><strong>'+escape(team)+'</strong></div></div>';
 html=html.replace('<div class="results-list">',detail+'<div class="results-list">');
 html=html.replace('strikes a triumphant raised-arms pose in sport uniform','celebrates winning with a '+escape(kind)+' victory animation');
 html=html.replace('class="victory-showcase"','class="victory-showcase ll-victory-'+escape(kind)+'"');
 return html;
};
window.renderMap=function(frame){
 previousMap(frame);
 // Draw small silhouette markers on top of the legacy initialed pips.
 if(!window.opts?.match)return;
 let markers='';
 for(const id of window.opts.match.roster){
  const a=window.opts.profiles.get(id),kind=kindOf(a),p=frame.actors[id];
  if(!p?.alive||kind==='human')continue;
  const x=(p.x*620/31).toFixed(2),y=(p.y*390/19).toFixed(2);
  const fill=window.appearanceFor(a).secondary||'#f4e4c7';
  const glyph=kind==='vehicle'?'<rect x="-6" y="-3" width="12" height="7" rx="2"/><circle cx="-4" cy="5" r="2"/><circle cx="4" cy="5" r="2"/>':
   kind==='horse'?'<path d="M-7 4V-4L1 -5L5 -8L8 -5L5 -1V5M-4 4V8M3 4V8" fill="none" stroke-width="2.2"/>':
   kind==='aquatic'?'<path d="M-7 0Q0 -7 7 0Q0 7 -7 0L-10 -5V5Z"/>':
   kind==='undead'?'<path d="M-7 6L-5 -6L0 -9L5 -6L7 6Z"/><circle cx="-2" cy="-3" r="1.5" fill="#1b3540"/><circle cx="2" cy="-3" r="1.5" fill="#1b3540"/>':
   '<path d="M-6 -2L-8 -8L-1 -5L4 -8L7 -2L7 6H-6Z"/><circle cx="-2" cy="0" r="1" fill="#18242d"/><circle cx="3" cy="0" r="1" fill="#18242d"/>';
  markers+='<g class="ll-map-creature" transform="translate('+x+','+y+')" fill="'+fill+'" stroke="'+fill+'" aria-label="'+escape(a.name)+' '+kind+'">'+glyph+'</g>';
 }
 if(markers)document.getElementById('map').insertAdjacentHTML('beforeend',markers);
};
window.LastLegendArt={kindOf,modelOf,profileCount:()=>window.opts?.athletes?.length||0};
})();