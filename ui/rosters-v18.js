/* V18: authenticated-source roster import preparation; no claims of full league coverage. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const sports={NBA:'Basketball',NFL:'American Football',NHL:'Ice Hockey',MLB:'Baseball'};
const seen=new Set();
function escape(x){return String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function valid(x){return x&&sports[x.league]&&typeof x.name==='string'&&x.name.length>=2&&x.name.length<=90&&typeof x.team==='string'&&x.team.length>=2&&x.team.length<=95&&/^\d{4}-\d\d-\d\d$/.test(String(x.snapshot_date||''))&&/^https:\/\/[a-z0-9.-]+\//i.test(String(x.source_url||''))&&typeof x.source_status==='string'&&['attributed','licensed'].includes(x.source_status);}
function slug(x){return String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);}
function importRows(rows){
 if(!Array.isArray(rows)||rows.length>6000)throw Error('Roster must be an array of at most 6000 attributed entries.');
 if(rows.some(r=>!valid(r)))throw Error('One or more rows lack league, name, team, date, source URL, or source status.');
 const ids=new Set(),created=[];const templates=new Map();
 for(const league of Object.keys(sports)){templates.set(league,opts.athletes.find(a=>a.sport===sports[league]&&a.kind!=='mascot'&&a.ratings&&a.behavior&&a.perk));}
 for(const r of rows){
  const id='roster-'+r.league.toLowerCase()+'-'+slug(r.name)+'-'+slug(r.team);
  if(ids.has(id)||opts.profiles.has(id)||seen.has(id))continue;ids.add(id);
  const base=templates.get(r.league);
  if(!base)continue;
  const p=opts.perks.signatures.find(x=>x.athlete_id===base.id);
  if(!p)continue;
  const a={...base,id,name:r.name,team:r.team,era:r.snapshot_date+' '+r.league+' roster',sport:sports[r.league],source_url:r.source_url,
   verification_status:'PROVISIONAL',number:null,edition_of:null,kind:'athlete',source_roster:{league:r.league,status:r.source_status,snapshot_date:r.snapshot_date},
   ratings:{...base.ratings},behavior:{...base.behavior},secondary:[...base.secondary],perk:'IMPORT_'+slug(id).toUpperCase()};
  opts.athletes.push(a);opts.profiles.set(id,a);
  opts.perks.signatures.push({...p,id:a.perk,athlete_id:id,name:'Provisional '+r.league+' Profile',source:'imported attributed roster / fictional placeholder ratings',validated_against_athlete_biography:false});
  seen.add(id);created.push(id);
 }
 if(created.length){renderGrid();renderSlots();window.LastLegendSpectator?.refreshTeamOptions?.();window.LastLegendWebsite?.renderLegends?.();window.LastLegendWebsite?.renderLobby?.();}
 return created;
}
function init(){
 const shell=document.querySelector('#site-legends .site-page-head');if(!shell||$('v18-roster-import'))return;
 const box=document.createElement('div');box.id='v18-roster-import';box.className='ll-future-panel';
 box.innerHTML='<h3>BIG FOUR ROSTER IMPORT · V18</h3><p>Import an attributed JSON roster snapshot. New entries use <strong>clearly provisional, sport-based game ratings</strong> until independently authored. Current ESPN-reported league rosters are loaded separately; this importer is for additional attributed entries.</p><label class="ll-upload">CHOOSE ROSTER JSON <input type="file" id="v18-file" accept=".json,application/json"></label><small id="v18-status" role="status">Each entry needs league (NBA, NFL, NHL, MLB), name, team, snapshot_date, source_url and source_status.</small>';
 shell.insertAdjacentElement('afterend',box);
 $('v18-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{
  if(f.size>1500000)throw Error('JSON exceeds 1.5 MB limit.');
  const items=JSON.parse(await f.text());const ids=importRows(items);
  $('v18-status').textContent=ids.length+' attributed roster editions added to this session. Their ratings are provisional copies, not verified athlete assessments.';
 }catch(error){$('v18-status').textContent='Import declined: '+error.message;}e.target.value='';});
}
window.LastLegendRosterV18=Object.freeze({valid,importRows,sports});
document.addEventListener('DOMContentLoaded',init);
})();