/* V19: gameplay-bound signature/secondary activation display (actual checks only). */
(function(){
'use strict';
const prev=window.renderEncounter;
function activations(event){
 const d=event?.detail||{},checks=[d.check,d.calculation,d.attack,d.defense].filter(Boolean);
 let all=[];for(const c of checks)for(const key of ['scoreA','scoreB','a','b']){
   const r=c[key];if(r&&Array.isArray(r.used))for(const name of r.used)if(typeof name==='string')all.push(name);
 }
 return [...new Set(all)].slice(0,6);
}
window.renderEncounter=function(e){prev(e);const found=activations(e);const story=document.querySelector('#encounter-text .scene-story');
 if(story&&found.length){const div=document.createElement('div');div.className='v19-abilities';div.textContent='ABILITY ACTIVATED · '+found.join(' + ');story.appendChild(div);}
};
window.LastLegendAbilities=Object.freeze({activations});
})();