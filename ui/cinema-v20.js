/* V20 cinematic choreography + clear recorded scene identity. */
(function(){
'use strict';
const previous=window.renderEncounter;
window.renderEncounter=function(e){previous(e);if(!e)return;
 const scene=document.querySelector('#encounter-visual .scene-stage');if(!scene)return;
 scene.classList.add('v20-cinematic');
 const n=e.participants?.length||0,kind=e.importance||'normal';
 scene.dataset.importance=kind;scene.dataset.cast=n;
 let light=document.createElement('div');light.className='v20-spotlight';light.setAttribute('aria-hidden','true');scene.appendChild(light);
 if(kind==='critical'||e.type==='FINALE_ENGAGEMENT')scene.classList.add('v20-finale');
};
})();