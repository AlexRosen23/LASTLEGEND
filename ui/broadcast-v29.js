/* V29 text-first opt-in stadium commentary, derived only from real recorded events. */
(function(){'use strict';const $=id=>document.getElementById(id);let last='',spoken='',enabled=false;
function announce(e){
 const p=opts.match;if(!p||!e)return '';
 const names=(e.participants||[]).map(id=>opts.profiles.get(id)?.name||id).slice(0,3);
 const types={MATCH_START:'The battle begins',ELIMINATION:'Competitor eliminated',ZONE_RETREAT:'Escaping the storm',ALLIANCE:'Alliance formed',FINAL_BETRAYAL:'No alliances remain',FINALE_ENGAGEMENT:'The final confrontation',SKIRMISH:'A fierce encounter',CHASE:'High-speed pursuit',HEAL:'A survivor recovers',CONTEST_RESOURCE:'Supplies contested'};
 return (types[e.type]||e.type.replace(/_/g,' ').toLowerCase())+(names.length?' · '+names.join(' / '):'');
}
function update(){const p=opts.match,status=$('v29-caption');if(!status)return;if(!p){status.textContent='Broadcast awaiting a match';return;}
 const f=p.frames[opts.frame];if(!f)return;
 const ev=p.events.filter(e=>e.tick<=f.tick&&(e.importance==='major'||e.importance==='critical')).at(-1);
 const text=ev?announce(ev):'Entering '+p.arena+' · '+p.roster.length+' contestants';
 status.textContent=text;
 const key=String(ev?.id||0)+'|'+p.seed;if(enabled&&opts.playing&&window.speechSynthesis&&key!==spoken){
  spoken=key;window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text.slice(0,175));utterance.rate=1.06;utterance.volume=.8;
  window.speechSynthesis.speak(utterance);
 }
}
function init(){const battle=$('battle-view');if(!battle||$('v29-panel'))return;const panel=document.createElement('section');panel.id='v29-panel';panel.className='ll-future-panel v29-panel';
 panel.innerHTML='<div class="site-eyebrow">V29 / BROADCAST MODE</div><h3>ARENA PLAY-BY-PLAY</h3><p>Live captions describe real match events. Optional browser speech is off by default.</p><div class="v29-captions"><strong id="v29-caption" role="status" aria-live="polite">Broadcast awaiting a match</strong><label><input type="checkbox" id="v29-voice"> ENABLE VOICE</label></div>';
 battle.appendChild(panel);
 $('v29-voice').addEventListener('change',e=>{enabled=e.target.checked;spoken='';if(!enabled)window.speechSynthesis?.cancel();});
}
const previous=window.renderFrame;window.renderFrame=function(){previous();update();};
window.LastLegendBroadcast=Object.freeze({announce});
document.addEventListener('DOMContentLoaded',init);
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#/play'))window.speechSynthesis?.cancel();});
})();