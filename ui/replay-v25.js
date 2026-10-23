/* V25: replay bookmarks, significant-event navigation and faithful match JSON export. */
(function(){'use strict';const $=id=>document.getElementById(id);let signature='',marks=[];
function key(){return opts.match?opts.match.seed+'|'+opts.match.arena+'|'+opts.match.mode+'|'+opts.match.roster.join('|'):'';}
function reconcile(){const k=key();if(signature!==k){signature=k;marks=[];}update();}
function update(){
 const status=$('v25-bookmark-status');if(status)status.textContent=opts.match?'FRAME '+opts.frame+' · '+marks.length+' BOOKMARK(S)':'Start a match to use replay tools.';
 const sel=$('v25-bookmarks');if(sel){const value=sel.value;sel.innerHTML='<option value="">GO TO BOOKMARK</option>'+marks.map((m,i)=>'<option value="'+m+'">#'+(i+1)+' · FRAME '+m+'</option>').join('');sel.value=marks.includes(Number(value))?value:'';}
}
function bookmark(){if(!opts.match)return;reconcile();if(!marks.includes(opts.frame))marks.push(opts.frame);marks.sort((a,b)=>a-b);update();}
function jump(frame){if(!opts.match)return;opts.frame=Math.max(0,Math.min(opts.match.frames.length-1,frame));stop();opts.lastEncounterId=null;renderFrame();}
function nextHighlight(){
 if(!opts.match)return;
 const e=opts.match.events.find(e=>e.tick>opts.match.frames[opts.frame].tick&&['major','critical'].includes(e.importance));
 if(!e)return;const target=opts.match.frames.findIndex(f=>f.tick>=e.tick);if(target>=0)jump(target);
}
function exportMatch(){
 if(!opts.match)return;
 const m=opts.match;
 const artifact={format:'lastlegend-replay-v1',seed:m.seed,arena:m.arena,mode:m.mode,roster:m.roster,winner:m.winner,placements:m.placements,statistics:m.statistics,
   events:m.events,frames:m.frames,bookmarks:marks};
 const file=new Blob([JSON.stringify(artifact,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download='lastlegend-'+m.seed+'-replay.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function init(){const main=document.querySelector('#battle-view .battle-main');if(!main||$('v25-panel'))return;
 let section=document.createElement('section');section.id='v25-panel';section.className='ll-future-panel v25-panel';
 section.innerHTML='<div class="site-eyebrow">V25 / REPLAY STUDIO</div><h3>BOOKMARK THE BATTLE</h3><div class="v25-actions"><button type="button" id="v25-mark" class="btn btn-secondary">BOOKMARK FRAME</button><button type="button" id="v25-next" class="btn btn-secondary">NEXT MAJOR MOMENT →</button><button type="button" id="v25-export" class="btn btn-secondary">EXPORT MATCH JSON ↓</button><select id="v25-bookmarks" aria-label="Replay bookmarks"><option value="">GO TO BOOKMARK</option></select></div><small id="v25-bookmark-status" role="status"></small>';
 main.appendChild(section);
 $('v25-mark').addEventListener('click',bookmark);$('v25-next').addEventListener('click',nextHighlight);
 $('v25-export').addEventListener('click',exportMatch);$('v25-bookmarks').addEventListener('change',e=>{if(e.target.value)jump(Number(e.target.value));});
}
const old=window.renderFrame;window.renderFrame=function(){old();reconcile();};
window.LastLegendReplayV25=Object.freeze({bookmark,jump,nextHighlight,exportMatch});
document.addEventListener('DOMContentLoaded',init);
})();