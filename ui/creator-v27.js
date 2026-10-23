/* V27 original fictional character creator, local browser storage only. */
(function(){'use strict';
const $=id=>document.getElementById(id),KEY='lastlegend.custom.v27',MAX=20;
const slug=s=>String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45);
function valid(r){return r&&typeof r.name==='string'&&r.name.trim().length>=2&&r.name.trim().length<=48&&['Basketball','American Football','Ice Hockey','Baseball'].includes(r.sport)&&['agility','strength','endurance','awareness','clutch'].includes(r.specialty)&&Number.isSafeInteger(r.boost)&&r.boost>=0&&r.boost<=25;}
function read(){try{const r=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(r)?r.slice(0,MAX).filter(valid):[];}catch(e){return []}}
function install(r){
 if(!valid(r))throw Error('Invalid fictional character');
 const template=opts.athletes.find(a=>a.sport===r.sport&&!a.edition_of&&!a.source_roster&&a.ratings&&a.behavior);
 if(!template)throw Error('No game template available');
 const id=r.id||'custom-'+slug(r.name)+'-'+(read().length+1);
 if(!/^custom-[a-z0-9-]{1,80}$/.test(id))throw Error('Invalid custom character ID');
 if(opts.profiles.has(id))return false;
 const sig=opts.perks.signatures.find(x=>x.athlete_id===template.id);
 if(!sig)throw Error('Missing ability');
 const a={...template,id,name:r.name.trim(),sport:r.sport,team:'Custom Originals',era:'Player-created fictional edition',verification_status:'CUSTOM',edition_of:null,number:null,kind:'fictional',render_type:'human',source_url:null,collection_tags:['CUSTOM'],ratings:{...template.ratings,[r.specialty]:Math.min(100,template.ratings[r.specialty]+r.boost)},behavior:{...template.behavior},secondary:[...template.secondary],perk:'CUSTOM_'+id.toUpperCase().replace(/[^A-Z0-9]/g,'_')};
 opts.athletes.push(a);opts.profiles.set(a.id,a);
 opts.perks.signatures.push({...sig,id:a.perk,athlete_id:a.id,name:'Original '+r.specialty+' aptitude',source:'fictional creator',validated_against_athlete_biography:false});
 renderGrid();window.LastLegendSpectator?.refreshTeamOptions?.();window.LastLegendWebsite?.renderLegends?.();return true;
}
function create(r){
 if(!valid(r))throw Error('Invalid name, sport or specialty.');
 const all=read();if(all.length>=MAX)throw Error('Maximum '+MAX+' local characters.');
 const id='custom-'+slug(r.name)+'-'+(all.length+1);
 if(!install({...r,id}))throw Error('Duplicate character');
 all.push({...r,id});try{localStorage.setItem(KEY,JSON.stringify(all));}catch(e){}
 return id;
}
function init(){
 for(const r of read()){try{install(r);}catch(e){}}
 const host=$('draft-view');if(!host||$('v27-panel'))return;
 const form=document.createElement('form');form.id='v27-panel';form.className='ll-future-panel';
 form.innerHTML='<div class="site-eyebrow">V27 / ORIGINAL CREATOR</div><h3>CREATE A FICTIONAL LEGEND</h3><p>Browser-local custom characters based on provisional game archetypes. Don’t impersonate real athletes.</p><div class="v27-fields"><label>NAME <input id="v27-name" maxlength="48" minlength="2" required placeholder="Original character name"></label><label>SPORT STYLE <select id="v27-sport"><option>Basketball</option><option>American Football</option><option>Ice Hockey</option><option>Baseball</option></select></label><label>SPECIALTY <select id="v27-specialty"><option value="agility">Agility</option><option value="strength">Strength</option><option value="endurance">Endurance</option><option value="awareness">Awareness</option><option value="clutch">Clutch</option></select></label><label>GAME STAT BOOST <input type="range" id="v27-boost" min="0" max="25" value="12"></label></div><button type="submit" class="btn btn-secondary">CREATE ORIGINAL LEGEND</button><p id="v27-status" role="status"></p>';
 host.appendChild(form);
 form.addEventListener('submit',e=>{e.preventDefault();try{const id=create({name:$('v27-name').value,sport:$('v27-sport').value,specialty:$('v27-specialty').value,boost:Number($('v27-boost').value)});$('v27-status').textContent=opts.profiles.get(id).name+' is ready in the draft and Legends pages.';$('v27-name').value='';}catch(error){$('v27-status').textContent=error.message;}});
}
window.LastLegendCreator=Object.freeze({read,valid,install,create});
document.addEventListener('DOMContentLoaded',init);
})();