/* V24: reproducible UTC daily challenge, no fake worldwide ranking. */
(function(){'use strict';
const $=id=>document.getElementById(id);
function hash(s){let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0;}
function daily(date){
 if(!/^\d{4}-\d\d-\d\d$/.test(date))throw Error('Invalid date');
 const pool=opts.athletes.filter(x=>!x.edition_of&&!x.source_roster&&['Basketball','American Football','Baseball','Ice Hockey'].includes(x.sport));
 const ids=pool.map(x=>x.id).sort((a,b)=>hash(date+'|'+a)-hash(date+'|'+b)||a.localeCompare(b)).slice(0,12);
 return {date,ids,seed:hash('LL-DAY-'+date)%2147483647,arena:['WILDERNESS','CITY','RUINS','FROZEN'][hash(date)%4]};
}
function apply(info){
 $('match-size').value=String(info.ids.length);$('match-size').dispatchEvent(new Event('change',{bubbles:true}));
 $('random-map').checked=false;$('seed').value=info.seed;$('arena').value=info.arena;$('mode').value='BALANCED';
 opts.selected=info.ids.slice();renderSlots();renderGrid();
 window.LastLegendWebsite.goto('play');
 $('size-status').textContent='Daily challenge '+info.date+' · identical seed and roster across devices running this version. No worldwide leaderboard.';
}
function init(){const home=$('site-home');if(!home||$('v24-panel'))return;const card=document.createElement('section');card.id='v24-panel';card.className='ll-future-panel';
 card.innerHTML='<div class="site-eyebrow">V24 / A NEW CHALLENGE EVERY UTC DAY</div><h3>THE DAILY DRAW</h3><p id="v24-description"></p><button type="button" class="site-primary" id="v24-load">DRAFT TODAY’S CHALLENGE ↗</button>';
 home.appendChild(card);
 const d=new Date().toISOString().slice(0,10),o=daily(d);
 $('v24-description').textContent=d+' · 12 legends · '+o.arena+' · Same seeded configuration for everyone on this roster version.';
 $('v24-load').addEventListener('click',()=>apply(daily(new Date().toISOString().slice(0,10))));
}
window.LastLegendDaily=Object.freeze({hash,daily,apply});
document.addEventListener('DOMContentLoaded',init);
})();