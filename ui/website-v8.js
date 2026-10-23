/* Last Legend Website Foundation (V8): a fully working, static multi-view
   product shell. Hash routes support deep links on GitHub Pages without
   pretending to offer accounts, multiplayer, or global results. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=['home','play','legends','champions','how-to-play','about','updates'];
const shell={route:'home',pending:null,search:'',sport:'',team:'',limit:36,ready:false};
function dataReady(){return typeof opts!=='undefined'&&opts.athletes?.length>=1203&&typeof figureSVG==='function'}
function normalize(hash){let path=String(hash||'').replace(/^#\/?/,'').split('?')[0].split('/')[0].trim().toLowerCase();return pages.includes(path)?path:'home';}
function currentBattle(){return dataReady()&&!!opts.match&&!$('battle-view').classList.contains('hidden');}
function setActivePage(page){
 shell.route=page;
 const map={home:'site-home',play:null,legends:'site-legends',champions:'site-champions','how-to-play':'site-how-to-play',about:'site-about',updates:'site-updates'};
 for(const r of pages){
  const id=map[r];if(id)$(id).classList.toggle('hidden',r!==page);
 }
 $('draft-view').classList.toggle('hidden',page!=='play'||currentBattle());
 $('battle-view').classList.toggle('hidden',page!=='play'||!currentBattle());
 document.querySelectorAll('[data-site-nav]').forEach(a=>{
  const active=a.dataset.siteNav===page;
  a.classList.toggle('site-active',active);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 const labels={home:'The Lobby',play:'Play',legends:'The Legends',champions:'Hall of Legends','how-to-play':'How to Play',about:'About & FAQ',updates:'What’s New'};
 document.title=labels[page]+' · Last Legend';
 document.querySelector('meta[name="description"]')?.setAttribute('content',{
  home:'Last Legend is a free cinematic athlete battle-royale simulator. Draft, spectate and crown a survivor.',
  play:'Draft 2–100 athletes, mascots and fictional entrants into one animated Last Legend survival match.',
  legends:'Search and compare Last Legend athletes, mascots and career editions across sports and teams.',
  champions:'Browse your Last Legend champions and battle records saved on this device.',
  'how-to-play':'Learn to draft athletes, select an arena, track your competitors and understand Last Legend results.',
  about:'About Last Legend: gameplay rules, accessibility, fictional ratings, privacy and sources.',
  updates:'Last Legend website release notes and known limitations.'
 }[page]);
 $('site-footer').classList.toggle('site-footer-hidden',page==='play'&&currentBattle());
 closeMenu();
 if(page==='home')renderLobby();
 if(page==='legends')renderLegends();
 if(page==='champions')renderChampions();
 window.scrollTo(0,0);
}
function routeTo(page){const route=pages.includes(page)?page:'home';const next='#/'+route;
 if(location.hash!==next)location.hash=next;
 else setActivePage(route);
}
function tryExit(page){
 if(!currentBattle()){routeTo(page);return;}
 shell.pending=page;
 if(typeof LastLegendSpectator!=='undefined')LastLegendSpectator.exitPrompt();
}
function goto(page){
 if(currentBattle()&&page!=='play'){tryExit(page);return;}
 routeTo(page);
}
function navigateOnHash(){
 const next=normalize(location.hash);
 if(currentBattle()&&shell.route==='play'&&next!=='play'){
  if(shell.pending!==next)shell.pending=next;
  history.replaceState(null,'','#/play');
  LastLegendSpectator.exitPrompt();return;
 }
 setActivePage(next);
}
function commitExit(){
 const target=shell.pending||'home';shell.pending=null;
 if(dataReady()&&!currentBattle()&&opts.match){
  // V7 confirm handler calls home() synchronously before this handler.
  opts.match=null;
 }
 routeTo(target);
}
function cancelExit(){shell.pending=null}
function closeMenu(){const menu=$('site-navigation'),btn=$('site-menu-toggle');menu.classList.remove('site-open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Open site menu');}
function toggleMenu(){const menu=$('site-navigation'),btn=$('site-menu-toggle');const opening=!menu.classList.contains('site-open');menu.classList.toggle('site-open',opening);btn.setAttribute('aria-expanded',String(opening));btn.setAttribute('aria-label',opening?'Close site menu':'Open site menu');}
function topSports(){
 const choice=['Basketball','American Football','Baseball','Ice Hockey','Association Football','College Mascot'];
 const labels={'Basketball':'BASKETBALL','American Football':'FOOTBALL','Baseball':'BASEBALL','Ice Hockey':'HOCKEY','Association Football':'SOCCER','College Mascot':'MASCOTS'};
 return choice.map((s,i)=>'<button type="button" class="site-sport-chip" data-site-sport="'+esc(s)+'"><span class="site-sport-index">0'+(i+1)+'</span><span>'+labels[s]+'</span><span aria-hidden="true">↗</span></button>').join('');
}
function renderLobby(){
 if(!dataReady())return;
 $('site-total').textContent=opts.athletes.length.toLocaleString('en-US');
 $('site-sports').innerHTML=topSports();
 let entries=[];try{entries=LastLegendSpectator.readHistory()}catch(e){}
 const latest=entries[0],card=$('site-latest-champion');
 if(latest&&opts.profiles.has(latest.winner)){
  const a=opts.profiles.get(latest.winner);
  card.innerHTML='<div class="site-card-topline">MOST RECENT CHAMPION <span>THIS DEVICE</span></div><div class="site-champion-portrait">'+figureSVG(a,{large:true})+'</div><strong>'+esc(latest.champion)+'</strong><small>'+esc(latest.arena)+' · '+latest.count+' COMPETITORS · '+latest.eliminations+' KOs</small><a href="#/champions" data-site-action="champions" class="site-inline-link">VIEW YOUR HALL OF LEGENDS ↗</a>';
 }else{
  card.innerHTML='<div class="site-card-topline">YOUR LEGACY <span>LOCAL RECORDS</span></div><div class="site-champion-blank">♛</div><strong>YOUR FIRST CHAMPION AWAITS.</strong><small>Finish a battle to fill your personal Hall of Legends.</small><a href="#/play" data-site-action="play" class="site-inline-link">ENTER THE ARENA ↗</a>';
 }
}
function getTeam(a){
 if(typeof LastLegendSpectator!=='undefined')return LastLegendSpectator.teamFor(a);
 return a.team||a.era||'Independent / Other';
}
function visibleLegends(){
 let list=opts.athletes.filter(a=>{
  if(shell.sport&&a.sport!==shell.sport)return false;
  if(shell.team&&getTeam(a)!==shell.team)return false;
  const value=(a.name+' '+a.sport+' '+getTeam(a)+' '+(a.era||'')).toLowerCase();
  return !shell.search||value.includes(shell.search);
 });
 return list;
}
function updateLegendTeams(){
 if(!dataReady())return;
 const el=$('site-legend-team'),teams=[...new Set(opts.athletes.filter(a=>!shell.sport||a.sport===shell.sport).map(getTeam))].sort();
 el.innerHTML='<option value="">All teams & affiliations</option>'+teams.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
 if(!teams.includes(shell.team))shell.team='';
 el.value=shell.team;
}
function renderLegends(){
 if(!dataReady())return;
 const list=visibleLegends(),page=list.slice(0,shell.limit);
 $('site-roster-total').textContent=opts.athletes.length.toLocaleString('en-US');
 $('site-legend-count').textContent=list.length+' MATCHES · '+page.length+' SHOWN';
 $('site-legend-grid').innerHTML=page.map(a=>{
  const isSelected=opts.selected.includes(a.id),look=appearanceFor(a);
  const tag=a.edition_of?'CAREER EDITION':a.render_type==='mascot'?'MASCOT':a.kind==='animal'?'WILDCARD':'COMPETITOR';
  return '<article class="site-legend-card" data-site-profile="'+esc(a.id)+'"><div class="site-legend-head"><span>'+tag+'</span><span>'+esc(a.sport)+'</span></div><button class="site-legend-view" data-site-open="'+esc(a.id)+'" type="button" aria-label="View '+esc(a.name)+' profile">'+figureSVG(a,{large:true})+'</button><h3>'+esc(a.name)+'</h3><div class="site-legend-affiliation">'+esc(getTeam(a))+'</div><div class="site-legend-tail"><small>'+(look.number!=null?'#'+esc(look.number):'NUMBER NOT VERIFIED')+'</small><div class="site-legend-actions"><button type="button" class="v11-show-stats" data-site-open="'+esc(a.id)+'" aria-label="Show stats and abilities for '+esc(a.name)+'">SHOW STATS</button><button type="button" class="site-add" data-site-draft="'+esc(a.id)+'" aria-label="Add '+esc(a.name)+' to lineup" '+(isSelected||opts.selected.length>=opts.matchSize?'disabled':'')+'>'+(isSelected?'DRAFTED':opts.selected.length>=opts.matchSize?'LINEUP FULL':'+ ADD TO DRAFT')+'</button></div></div></article>';
 }).join('')||'<p class="site-no-results">No legends match. Try another sport, team, or search.</p>';
 const more=$('site-legend-more');
 more.hidden=page.length>=list.length;
 more.textContent='SHOW MORE · '+page.length+' / '+list.length;
}
function playerDialog(id){
 if(window.LastLegendProfiles)return window.LastLegendProfiles.open(id);
 const a=opts.profiles.get(id);if(!a)return;
 const look=appearanceFor(a),ratings=a.ratings||{},ranked=Object.entries(ratings).filter(([k,v])=>Number.isFinite(v)).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const isSelected=opts.selected.includes(id);
 $('site-profile-body').innerHTML='<div class="site-profile-grid"><div class="site-profile-art">'+figureSVG(a,{victory:true})+'</div><div class="site-profile-copy"><div class="site-eyebrow">'+esc(a.sport)+(a.edition_of?' / CAREER EDITION':' / ORIGINAL PROFILE')+'</div><h2 id="site-profile-title">'+esc(a.name)+'</h2><p>'+esc(getTeam(a))+' · '+esc(a.era||'Original edition')+'</p><div class="site-profile-stats">'+ranked.map(([k,v])=>'<div><span>'+esc(k.replaceAll('_',' '))+'</span><strong>'+Number(v)+'</strong></div>').join('')+'</div><p class="site-fact-check">Fictional game ratings. Clothing/appearance may be stylized and provisional; athlete identity does not imply endorsement. '+(look.number!=null?'Displayed #'+look.number+' follows the available game profile.':'No verified jersey number in this edition.')+'</p><button class="site-primary" type="button" data-site-draft="'+esc(id)+'" '+(isSelected?'disabled':'')+'>'+(isSelected?'ALREADY IN YOUR LINEUP':'+ ADD TO LINEUP')+'</button></div></div>';
 $('site-profile-dialog').showModal();
}
function addDraft(id){
 if(!dataReady())return;
 if(opts.selected.includes(id)){routeTo('play');$('site-profile-dialog').close();return;}
 if(opts.selected.length>=opts.matchSize){
  $('site-live-region').textContent='Your lineup is full. Use Clear Lineup or increase the match size to add another competitor.';
  return;
 }
 opts.selected.push(id);
 renderSlots();renderGrid();
 $('site-profile-dialog').close();
 routeTo('play');
 $('site-live-region').textContent=opts.profiles.get(id).name+' added to your lineup.';
}
function renderChampions(){
 if(typeof LastLegendSpectator!=='undefined'&&typeof window.renderHistory==='function'){window.renderHistory();}
 $('site-device-note').textContent='These records are stored in this browser only. Clearing browser data or switching devices will not transfer them.';
}
function setupFilters(){
 const sport=$('site-legend-sport');
 sport.innerHTML='<option value="">All sports and character types</option>'+[...new Set(opts.athletes.map(a=>a.sport))].sort().map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
 updateLegendTeams();
 $('site-legend-search').addEventListener('input',e=>{shell.search=e.target.value.trim().toLowerCase();shell.limit=36;renderLegends();});
 sport.addEventListener('change',e=>{shell.sport=e.target.value;shell.team='';shell.limit=36;updateLegendTeams();renderLegends();});
 $('site-legend-team').addEventListener('change',e=>{shell.team=e.target.value;shell.limit=36;renderLegends();});
 $('site-legend-more').addEventListener('click',()=>{shell.limit+=36;renderLegends();});
 $('site-legend-grid').addEventListener('click',e=>{
  const add=e.target.closest('[data-site-draft]'),view=e.target.closest('[data-site-open]');
  if(add){addDraft(add.dataset.siteDraft);return;}
  if(view){playerDialog(view.dataset.siteOpen);return;}
  const card=e.target.closest('[data-site-profile]');if(card)playerDialog(card.dataset.siteProfile);
 });
 $('site-profile-close').addEventListener('click',()=>$('site-profile-dialog').close());
 $('site-profile-dialog').addEventListener('click',e=>{if(e.target===$('site-profile-dialog'))$('site-profile-dialog').close();});
 $('site-profile-body').addEventListener('click',e=>{const btn=e.target.closest('[data-site-draft]');if(btn)addDraft(btn.dataset.siteDraft);});
}
function setup(){
 if(shell.ready)return;
 if(!dataReady()){window.setTimeout(setup,80);return;}
 shell.ready=true;
 setupFilters();
 $('site-menu-toggle').addEventListener('click',toggleMenu);
 $('site-navigation').addEventListener('click',e=>{
  const a=e.target.closest('a[data-site-nav]');if(!a)return;
  e.preventDefault();goto(a.dataset.siteNav);
 });
 document.addEventListener('click',e=>{
  const action=e.target.closest('[data-site-action]');
  if(action){e.preventDefault();goto(action.dataset.siteAction);return;}
  const sport=e.target.closest('[data-site-sport]');
  if(sport){
   e.preventDefault();
   $('sport-filter').value=sport.dataset.siteSport;
   opts.sport=sport.dataset.siteSport;
   $('sport-filter').dispatchEvent(new Event('change',{bubbles:true}));
   goto('play');return;
  }
 });
 $('ll-home').addEventListener('click',()=>{shell.pending='home';if(!currentBattle())routeTo('home');});
 $('ll-confirm-exit').addEventListener('click',commitExit);
 $('ll-cancel-exit').addEventListener('click',cancelExit);
 $('ll-exit-dialog').addEventListener('cancel',cancelExit);
 window.addEventListener('hashchange',navigateOnHash);
 window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 $('site-first-battle').addEventListener('click',()=>goto('play'));
 $('site-champions-link').addEventListener('click',()=>goto('champions'));
 const old=$('help-btn');
 old.addEventListener('click',()=>{if(!currentBattle()){ /* Existing About dialog also remains available. */}});
 const initial=normalize(location.hash);setActivePage(initial);
}
window.LastLegendWebsite={shell,normalize,goto,setActivePage,renderLegends,renderLobby,addDraft,visibleLegends,getTeam};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
else setup();
})();