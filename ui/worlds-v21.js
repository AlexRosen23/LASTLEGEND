/* V21 dynamic world atmosphere; visual props follow actual generated map and current frame. */
(function(){
'use strict';const previous=window.renderMap;
function weather(arena,tick){return arena==='FROZEN'?'SNOW SQUALL':arena==='CITY'?'NEON HAZE':arena==='RUINS'?'DUST DRIFT':'FOREST WIND';}
window.renderMap=function(frame){previous(frame);const match=opts.match,host=document.querySelector('.map-holder');if(!host||!match||!frame)return;
 host.dataset.biome=match.arena;host.style.setProperty('--world-cycle',String(Math.floor(frame.tick/24)%4));
 let el=document.getElementById('v21-climate');if(!el){el=document.createElement('span');el.id='v21-climate';el.className='v21-climate';host.querySelector('.map-top')?.appendChild(el);}
 el.textContent=weather(match.arena,frame.tick)+' · ZONE '+Math.round(frame.radius);
};
window.LastLegendWorldV21=Object.freeze({weather});
})();