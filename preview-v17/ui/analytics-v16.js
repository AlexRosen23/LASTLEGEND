/* V16 -- explicit Monte Carlo-style gameplay sampling, not real-world odds. */
(function(){
'use strict';
var $=id=>document.getElementById(id),running=false;
function valid(){
 if(typeof opts==='undefined'||opts.selected.length<2||opts.selected.length>12||opts.selected.length!==opts.matchSize||new Set(opts.selected).size!==opts.selected.length)return false;
 var seed=Number($('seed').value);
 return Number.isSafeInteger(seed)&&seed>=0&&seed<=2147483647;
}
function render(rows,count,seed){
 rows.sort(function(a,b){return b.wins-a.wins||a.place-b.place||a.name.localeCompare(b.name);});
 return '<div class="v16-disclaimer">FICTIONAL GAME SIMULATIONS · '+count+' SEEDS · SAME LINEUP / ARENA / MODE · NOT REAL-WORLD ODDS</div>'+
  '<div class="v16-results">'+rows.map(function(r,i){var rate=(r.wins/count*100).toFixed(0);return '<article class="v16-row"><span class="v16-rank">'+(i+1)+'</span><div><strong>'+escapeHTML(r.name)+'</strong><small>'+r.wins+' wins · '+(r.place/count).toFixed(1)+' average placement · '+(r.kos/count).toFixed(1)+' avg eliminations</small><div class="v16-meter"><span style="width:'+rate+'%"></span></div></div><b>'+rate+'%</b></article>';}).join('')+'</div><small class="v16-footnote">Samples begin at seed '+seed+'. Change the seed or lineup and rerun. Win shares reflect only these completed game simulations.</small>';
}
function escapeHTML(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function run(){
 if(running)return;
 var status=$('v16-status'),report=$('v16-output');if(!status||!report)return;
 if(!valid()){status.textContent='Select an exact lineup of 2–12 legends and a valid seed to analyze.';return;}
 var ids=opts.selected.slice(),base=Number($('seed').value),arena=$('arena').value,mode=$('mode').value,n=16;
 var rows=new Map(ids.map(function(id){return [id,{name:opts.profiles.get(id).name,wins:0,place:0,kos:0}];}));
 var i=0;running=true;$('v16-run').disabled=true;
 report.innerHTML='';status.textContent='Sampling '+n+' seeded games: 0 / '+n;
 function tick(){
  if(!running)return;
  try{
   var seed=(base+(i*104729))%2147483647;
   var match=new Simulation(ids,opts.athletes,opts.perks,{seed:seed,arena:arena,mode:mode}).run();
   rows.get(match.winner).wins++;
   match.placements.forEach(function(id,index){if(rows.has(id))rows.get(id).place+=index+1;});
   for(var id of ids)rows.get(id).kos+=match.statistics[id].eliminations;
   i++;status.textContent='Sampling '+n+' seeded games: '+i+' / '+n;
   if(i<n){setTimeout(tick,0);return;}
   report.innerHTML=render(Array.from(rows.values()),n,base);
   status.textContent='Sample complete: '+n+' deterministic matches. Different seeds may produce different results.';
  }catch(e){status.textContent='Unable to analyze this lineup: '+e.message;}
  finally{if(i>=n||status.textContent.startsWith('Unable')){running=false;$('v16-run').disabled=false;}}
 }
 setTimeout(tick,0);
}
function init(){
 var footer=document.querySelector('#draft-view .draft-footer');if(!footer||$('v16-panel'))return;
 var panel=document.createElement('section');panel.id='v16-panel';panel.className='v16-panel';
 panel.innerHTML='<div><div class="site-eyebrow">V16 / THE SIMULATION LAB</div><h3>WHO SURVIVES MOST OFTEN?</h3><p>Run 16 different seeds with the current lineup. Results are fictional gameplay samples, not predictions about real people.</p></div><button type="button" class="btn btn-secondary" id="v16-run">RUN 16-MATCH ANALYSIS</button><p id="v16-status" role="status" aria-live="polite">Draft 2–12 competitors, then run the analysis.</p><div id="v16-output"></div>';
 footer.insertAdjacentElement('afterend',panel);
 $('v16-run').addEventListener('click',run);
}
window.LastLegendAnalytics=Object.freeze({valid:valid,render:render});
window.addEventListener('load',init);
})();