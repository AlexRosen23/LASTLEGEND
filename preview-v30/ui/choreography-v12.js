/* V12 -- deterministic encounter choreography presentation. Never mutates a simulation. */
(function(){
'use strict';
if(typeof window.renderEncounter!=='function')return;
var old=window.renderEncounter;
var allowed={human:1,mascot:1,horse:1,vehicle:1,aquatic:1,undead:1};
var esc=function(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
function family(cue,category){
 var c=String(cue||'').toLowerCase();
 if(category==='nonhuman')return 'creature';
 if(/roll|tumble|vault|hop|jump/.test(c))return 'vault';
 if(/slide|skate|ice/.test(c))return 'slide';
 if(/spin|turn|pivot|twist/.test(c))return 'pivot';
 if(/dodge|zigzag|sidestep|shuffle/.test(c))return 'dodge';
 if(/impact|clash/.test(c))return 'impact';
 if(category==='identity')return 'sport';
 return 'sprint';
}
window.renderEncounter=function(e){
 old(e);
 var engine=window.LastLegendEncounters,scene=document.querySelector('#encounter-visual .scene-stage');
 if(!engine||!scene||!e||!e.encounterId)return;
 var variant=engine.byId(e.encounterId);if(!variant)return;
 var fam=family(variant.cue,variant.category);
 scene.classList.add('v12-choreography','v12-'+fam,'v12-'+variant.category);
 scene.dataset.encounterId=variant.id;
 scene.dataset.choreography=fam;
 scene.style.setProperty('--v12-beat',String((e.id%4)*.12)+'s');
 var actors=scene.querySelectorAll('.scene-actor');
 actors.forEach(function(el,i){
  var p=typeof opts!=='undefined'&&opts.profiles?opts.profiles.get(el.dataset.athleteId):null;
  var body=p&&engine.bodyOf?engine.bodyOf(p):'human';
  el.classList.add('v12-body-'+(allowed[body]?body:'human'));
  el.style.setProperty('--v12-index',String(i));
 });
 if(variant.prop){
  var prop=document.createElement('span');prop.className='v12-encounter-prop';
  prop.setAttribute('aria-hidden','true');prop.textContent=variant.prop;
  scene.appendChild(prop);
 }
 var story=document.querySelector('#encounter-text .scene-story');
 if(story){var cue=document.createElement('small');cue.className='v12-action-cue';
 cue.textContent='MOVEMENT / '+String(variant.cue||variant.action||'action').toUpperCase();
 story.appendChild(cue);}
};
window.LastLegendChoreography=Object.freeze({family:family});
})();