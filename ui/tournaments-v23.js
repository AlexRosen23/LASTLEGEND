/* V23: genuinely simulated seeded single-elimination bracket, no backend. */
(function(){
'use strict';const $=id=>document.getElementById(id);
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeSeed(n){return ((Number(n)||0)%2147483647+2147483647)%2147483647;}
function bracket(ids,base,arena,mode,onRound){
 if(![4,8,16,32,64].includes(ids.length)||new Set(ids).size!==ids.length||ids.some(id=>!opts.profiles.has(id)))throw Error('Choose 4, 8, 16, 32 or 64 unique legends.');
 if(!['WILDERNESS','CITY','RUINS','FROZEN'].includes(arena)||!['BALANCED','REALISTIC','CHAOS'].includes(mode))throw Error('Invalid arena or mode.');
 let rounds=[],current=ids.slice(),round=0;
 return new Promise((resolve,reject)=>{
  function next(){
   try{
    if(current.length===1)return resolve({champion:current[0],rounds,seed:base,arena,mode});
    const results=[],winners=[];
    for(let i=0;i<current.length;i+=2){
     const seed=safeSeed(base+round*100003+i*733+1);
     const simulation=new Simulation([current[i],current[i+1]],opts.athletes,opts.perks,{seed,arena,mode}).run();
     winners.push(simulation.winner);
     results.push({a:current[i],b:current[i+1],winner:simulation.winner,seed,eliminations:simulation.statistics[simulation.winner].eliminations});
    }
    rounds.push(results);current=winners;round++;if(onRound)onRound(rounds,current);setTimeout(next,0);
   }catch(err){reject(err);}
  }
  setTimeout(next,0);
 });
}
function view(result,loading){
 const box=$('v23-bracket');if(!box)return;
 box.innerHTML=result.rounds.map((pairs,i)=>'<section class="v23-round"><h4>ROUND '+(i+1)+'</h4><div class="v23-pairs">'+pairs.map(p=>'<div class="v23-pair"><span>'+esc(opts.profiles.get(p.a)?.name||p.a)+'</span><span>'+esc(opts.profiles.get(p.b)?.name||p.b)+'</span><strong>ADVANCES · '+esc(opts.profiles.get(p.winner)?.name||p.winner)+'</strong></div>').join('')+'</div></section>').join('')+
 (!loading&&result.champion?'<h3 class="v23-champion">TOURNAMENT CHAMPION · '+esc(opts.profiles.get(result.champion)?.name||result.champion)+'</h3>':'');
}
async function run(){
 const selected=opts.selected,btn=$('v23-run'),status=$('v23-status');
 if(!selected||![4,8,16,32,64].includes(selected.length)||selected.length!==opts.matchSize){status.textContent='Draft exactly 4, 8, 16, 32 or 64 legends to run a bracket.';return;}
 const seed=Number($('seed').value);if(!Number.isSafeInteger(seed)||seed<0||seed>2147483647){status.textContent='Use a valid nonnegative seed.';return;}
 btn.disabled=true;status.textContent='Simulating tournament rounds…';
 try{const result=await bracket(selected,seed,$('arena').value,$('mode').value,(rounds)=>{status.textContent='Completed '+rounds.length+' round(s).';view({rounds},true);});
 view(result,false);status.textContent='Finished. All matches were simulated from deterministic seeds. This bracket is saved on this page only.';
 }catch(err){status.textContent='Tournament failed: '+err.message;}finally{btn.disabled=false;}
}
function init(){const host=$('draft-view');if(!host||$('v23-panel'))return;let panel=document.createElement('section');
 panel.id='v23-panel';panel.className='ll-future-panel v23-panel';
 panel.innerHTML='<div class="site-eyebrow">V23 / TOURNAMENT CENTRAL</div><h3>SINGLE-ELIMINATION TOURNAMENTS</h3><p>Draft exactly 4, 8, 16, 32 or 64 competitors. Each pair fights a complete deterministic Last Legend match; winners advance.</p><button type="button" class="btn btn-secondary" id="v23-run">SIMULATE BRACKET</button><p id="v23-status" role="status">No tournament has been run.</p><div id="v23-bracket"></div>';
 host.appendChild(panel);$('v23-run').addEventListener('click',run);
}
window.LastLegendTournaments=Object.freeze({bracket,safeSeed});
document.addEventListener('DOMContentLoaded',init);
})();