/* LAST LEGEND V24 — ALL FOUR PROFESSIONAL LEAGUE TEAM ROSTERS
   Reads a validated, locally hosted snapshot. Never claims official league registration:
   ESPN team-roster statuses and labels can lag transactions, IR, callups and season turns. */
(function(){
'use strict';
const required={NBA:30,NFL:32,MLB:30,NHL:32};
const sports={NBA:'Basketball',NFL:'American Football',MLB:'Baseball',NHL:'Ice Hockey'};
const minPlayers={NBA:400,NFL:1400,MLB:700,NHL:600};
const minTeamPlayers={NBA:12,NFL:26,MLB:26,NHL:12};
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const hash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status={snapshot:null,lastReport:null,lastError:null};
// ESPN roster positions are informative; use matching game archetypes rather than
// assigning a random goalkeeper, pitcher or quarterback build to unrelated roles.
function roleFor(code,position){
 const pos=String(position||'').toLowerCase();
 if(code==='NBA'){
  if(pos.includes('center'))return 'center';
  if(pos.includes('guard'))return 'point_guard';
  if(pos.includes('forward'))return 'wing';
 }
 if(code==='NFL'){
  if(pos.includes('quarterback'))return 'quarterback';
  if(pos.includes('wide receiver')||pos.includes('tight end'))return 'receiver';
  if(pos.includes('running back')||pos.includes('fullback'))return 'running_back';
  if(/linebacker|cornerback|safety|defensive|defense/.test(pos))return 'defender';
  if(/offensive|tackle|guard|center|long snapper/.test(pos))return 'lineman';
  if(/kicker|punter/.test(pos))return 'other';
 }
 if(code==='MLB'){
  if(pos.includes('pitcher'))return 'baseball_pitcher';
  if(/first baseman|third baseman|catcher|designated hitter/.test(pos))return 'baseball_power';
  if(/fielder|baseman|shortstop|outfielder/.test(pos))return 'baseball_speed';
 }
 if(code==='NHL'){
  if(pos.includes('goaltender')||pos.includes('goalie'))return 'hockey_goalie';
  if(pos.includes('defense'))return 'hockey_defender';
  if(/wing|center|forward/.test(pos))return 'hockey_forward';
 }
 return null;
}
function validate(data){
 if(!data||data.version!==24||typeof data.generatedAt!=='string'||!data.leagues)throw Error('Invalid V24 source schema');
 if(!Number.isFinite(Date.parse(data.generatedAt)))throw Error('Snapshot timestamp missing');
 for(const [code,count] of Object.entries(required)){
  const league=data.leagues[code];
  if(!league||league.teamCount!==count||!Array.isArray(league.teams)||league.teams.length!==count||
    !Array.isArray(league.players)||league.players.length<minPlayers[code]||
    league.playerCount!==league.players.length)throw Error(code+' incomplete league source');
  const teams=new Map(),counts=new Map(),ids=new Set();
  for(const t of league.teams){
   const id=String(t?.id||'');
   if(!id||!t.name||teams.has(id)||!Number.isInteger(t.rosterCount)||
      t.rosterCount<minTeamPlayers[code])throw Error(code+' invalid team roster declaration');
   teams.set(id,t);counts.set(id,0);
  }
  for(const p of league.players){
   if(!p?.id||!p.name||!Array.isArray(p.memberships)||!p.memberships.length)throw Error(code+' invalid player entry');
   if(ids.has(String(p.id)))throw Error(code+' duplicated player id '+p.id);
   ids.add(String(p.id));
   const memberships=new Set();
   for(const m of p.memberships){
    const id=String(m?.teamId||''),team=teams.get(id);
    if(!team)throw Error(code+' unrecognized player team');
    if(memberships.has(id))throw Error(code+' duplicated team membership for '+p.id);
    if(!m.team||m.team!==team.name||!m.position||!m.status)throw Error(code+' invalid membership details');
    if(team.abbr && m.abbr!==team.abbr)throw Error(code+' team abbreviation mismatch');
    memberships.add(id);counts.set(id,counts.get(id)+1);
   }
  }
  for(const [id,team] of teams){
   if(counts.get(id)!==team.rosterCount)throw Error(code+' roster count mismatch: '+team.name);
  }
 }
 return true;
}
async function load(){
 if(typeof fetch!=='function')return null;
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 const limit=controller?setTimeout(()=>controller.abort(),12000):null;
 try{
  const result=await fetch('data/active_rosters_v24.json',{cache:'no-store',signal:controller?.signal});
  if(!result.ok)throw Error('Roster feed HTTP '+result.status);
  const data=await result.json();validate(data);status.snapshot=data;status.lastError=null;return data;
 }catch(e){status.snapshot=null;status.lastError=String(e?.message||e);console.warn('V24 active league team roster snapshot unavailable; retaining existing playable library:',status.lastError);if(typeof document!=='undefined')renderCoverage();return null}
 finally{if(limit!==null)clearTimeout(limit)}
}
function install(athletes,perks,data){
 validate(data);
 if(!Array.isArray(athletes)||!perks||!Array.isArray(perks.signatures))throw Error('Missing game roster or perk database');
 if(athletes.some(a=>a.collection_tags?.includes('ACTIVE_LEAGUES_V24')))return status.lastReport;
 const templates=athletes.filter(a=>(!a.kind||a.kind==='athlete')&&a.ratings&&a.behavior&&!a.edition_of&&sports&&Object.values(sports).includes(a.sport));
 const lookups=new Map(athletes.filter(a=>!a.edition_of).map(a=>[normalize(a.name),a]));
 const originalPerks=new Map(perks.signatures.map(p=>[p.athlete_id,p]));
 const used=new Set(athletes.map(a=>a.id));
 const added={NBA:0,NFL:0,MLB:0,NHL:0};const inclusion={};
 const pendingAthletes=[],pendingPerks=[];
 for(const code of Object.keys(required)){
  const league=data.leagues[code];
  const sport=sports[code],pool=templates.filter(a=>a.sport===sport);
  if(!pool.length)throw Error('Missing playable archetype '+code);
  for(const person of league.players){
   const selected=person.memberships.find(m=>String(m.status).toLowerCase()==='active')||person.memberships[0];
   const id='active-'+code.toLowerCase()+'-'+person.id,canonical=normalize(person.name);
   if(used.has(id))throw Error('Duplicate external roster ID '+id);
   const parent=lookups.get(canonical),desiredRole=roleFor(code,selected.position),
     rolePool=desiredRole?pool.filter(a=>a.role===desiredRole):[],
     candidates=rolePool.length?rolePool:pool,
     template=parent?.ratings&&parent.sport===sport&&(!desiredRole||parent.role===desiredRole)?
      parent:candidates[hash(code+person.id)%candidates.length];
   const signature=originalPerks.get(template.id);if(!signature)throw Error('Missing archetype signature for '+template.id);
   const vals={},traits={};
   for(const [key,value] of Object.entries(template.ratings))vals[key]=clamp(Math.round(value)+(hash(id+key)%11-5),20,98);
   for(const [key,value] of Object.entries(template.behavior))traits[key]=clamp(Math.round(value)+(hash(id+key)%21-10),20,95);
   const suffix=league.season||selected.season||'Current',
     name=parent?person.name+' — '+selected.team+' ('+suffix+')':person.name;
   const perkId='V24_'+code+'_'+person.id,
    team=String(selected.team||'Unassigned team'),pos=selected.position||template.role;
   const entry={
    ...template,id,name,sport,team,era:suffix+' · '+(selected.position||'')+' · '+String(selected.status||'').toUpperCase(),
    source_url:selected.url||null,number:selected.jersey||null,
    ratings:vals,behavior:traits,
    perk:perkId,
    edition_of:parent?.id||null,edition_short:parent?team+' '+suffix:null,
    role:desiredRole||template.role,roster_position_role:desiredRole||null,
    collection_tags:['ACTIVE_LEAGUES_V24','ACTIVE_'+code+'_V24'],
    league:code,provider_player_id:String(person.id),source_status:selected.status,
    roster_memberships:person.memberships.map(m=>({teamId:m.teamId,team:m.team,status:m.status})),
    verification_status:'ESPN_REPORTED_ROSTER_NOT_OFFICIAL_VERIFIED',
    data_quality:{ratings_are_provisional:true,personality_is_fictional:true,
      source:'ESPN public site-v2 team roster',verified_as_official:false,
      position_mapped_from_provider:!!desiredRole,
      snapshot_date:data.generatedAt,source_team:team,league:code,number_from_provider:true,
      licensing_reviewed:false},
    description:'ESPN-reported '+code+' team-roster entry as of '+data.generatedAt+'. Attributes and behavior are fictional game balance.'
   };
   pendingAthletes.push(entry);pendingPerks.push({
    ...signature,id:perkId,athlete_id:id,name:'Roster Edition · '+String(signature.name||'Signature'),
    source:'gameplay_design_provisional',validated_against_athlete_biography:false,
    description:'Fictional, sport-inspired game ability; not a statement about the real player.'
   });
   used.add(id);added[code]++;
  }
  if(added[code]!==league.players.length)throw Error(code+' coverage mismatch');
  inclusion[code]={teams:league.teamCount,players:added[code]};
 }
 if(new Set([...athletes,...pendingAthletes].map(a=>a.id)).size!==athletes.length+pendingAthletes.length||
    perks.signatures.length+pendingPerks.length!==athletes.length+pendingAthletes.length)
    throw Error('V24 game mapping corrupted');
 athletes.push(...pendingAthletes);perks.signatures.push(...pendingPerks);
 status.lastReport={version:24,sourceDate:data.generatedAt,added,total:athletes.length,inclusion,provider:'ESPN-reported team rosters'};
 return status.lastReport;
}
function renderCoverage(){
 const r=status.lastReport;
 const ageHours=r?(Date.now()-Date.parse(r.sourceDate))/3600000:Infinity;
 const stale=r&&ageHours>48;
 const message=r?'NBA '+r.added.NBA+' · NFL '+r.added.NFL+' · MLB '+r.added.MLB+' · NHL '+r.added.NHL:'Full-league roster feed unavailable';
 const heading=!r?'ROSTER SOURCE UNAVAILABLE':stale?'ROSTER SNAPSHOT NEEDS REFRESH':'BIG FOUR TEAM ROSTERS LOADED';
 const detail=r?'Snapshot '+r.sourceDate.split('T')[0]+' · ESPN-reported membership, including injured/inactive · NOT official certification'+(stale?' · older than 48 hours':''):
   'Only the built-in player library is available. Complete current rosters have not loaded.';
 for(const target of ['#site-legends .site-page-head','#draft-view .mode-controls']){
  const el=document.querySelector(target);if(!el)continue;
  let card=el.querySelector('.v24-roster-freshness');
  if(!card){card=document.createElement('div');el.appendChild(card)}
  card.className='v24-roster-freshness'+(!r||stale?' v24-roster-warning':'');
  card.setAttribute('role','status');
  card.innerHTML='<strong>'+esc(heading)+'</strong><span>'+esc(message)+'</span><small>'+esc(detail)+'</small>';
 }
}
window.LastLegendActiveRostersV24=Object.freeze({version:'24.0',load,validate,install,renderCoverage,roleFor,status,required});
})();
