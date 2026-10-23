/* Last Legend site shell, accessible public-site navigation.
   Does not alter combat mechanics or ranked simulation. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=new Set(['home','play','legends','champions','how-to-play']);
let view='play',pageSize=40,search='',sport='',team='',needsResume=false;
function matchActive(){return !!(opts.match&&!$('battle-view').classList.contains('hidden'));}
function askLeave(next){
 if(!matchActive()||next==='play')return true;
 const d=$('ll-exit-dialog');
 if(!d)return false;
 needsResume=opts.playing;
 stop();
 const ok=$('ll-confirm-exit'),cancel=$('ll-cancel-exit');
 // Existing handlers process confirmation/cancellation. Navigation follows
 // the legacy home action only if the user confirms the exit.
 const one=()=>{pending=null;setTimeout(()=>show(next,true),0);};
 ok.addEventListener('click',one,{once:true});
 const cleanup=()=>{ok.removeEventListener('click',one);pending=null;};
 const no=$('ll-cancel-exit');
 no.addEventListener('click',cleanup,{once:true});
 pending={ok,cancel:no,cleanup};
 d.showModal();return false;
}
let pending=null;
function show(which,internal=false){
 if(!pages.has(which))which='home';
 if(!internal&&!askLeave(which))return;
 view=which;
 const home=$('ll-web-home'),roster=$('ll-web-legends'),guide=$('ll-web-guide');
 const isBattle=matchActive();
 const draft=$('draft-view'),battle=$('battle-view'),history=$('ll-match-history');
 home.hidden=which!=='home';
 roster.hidden=which!=='legends';
 guide.hidden=which!=='how-to-play';
 if(which==='play'){
  draft.classList.toggle('hidden',isBattle);
  battle.classList.toggle('hidden',!isBattle);
 }else{
  draft.classList.add('hidden');
  battle.classList.add('hidden');
 }
 history.hidden=which!=='champions';
 for(const button of document.querySelectorAll('[data-ll-page]')){
  const active=button.dataset.llPage===which;
  button.classList.toggle('ll-site-active',active);
  if(button.matches('nav button'))active?button.setAttribute('aria-current','page'):button.removeAttribute('aria-current');
 }
 $('ll-mobile-nav')?.classList.remove('ll-nav-open');
 $('ll-nav-toggle')?.setAttribute('aria-expanded','false');
 if(which==='legends')renderRoster();
 if(which==='champions'&&window.LastLegendSpectator?.readHistory){
  // Existing history lives on the page and is updated when matches conclude.
  const t=window.LastLegendSpectator.readHistory();$('ll-site-history-count').textContent=t.length+' FINISHED MATCHES SAVED ON THIS DEVICE';
 }
 history.removeAttribute('style');
 if(location.hash!=='#'+which&&internal!==null)historyReplace(which);
 window.scrollTo(0,0);
}
function historyReplace(which){try{history.replaceState({page:which},'',location.pathname+location.search+'#'+which)}catch(e){}}
function sports(){return [...new Set(opts.athletes.map(a=>a.sport))].sort();}
function teams(){return [...new Set(opts.athletes.filter(a=>!sport||a.sport===sport).map(a=>window.LastLegendSpectator?.teamFor(a)||a.team||a.era||'Other'))].sort();}
function rebuildFilters(){
 const sp=$('ll-legend-sport'),tm=$('ll-legend-team');
 if(!sp||!tm)return;
 sp.innerHTML='<option value="">ALL SPORTS</option>'+sports().map(s=>'<option value="'+escape(s)+'">'+escape(s)+'</option>').join('');
 sp.value=sport;
 const available=teams();
 if(!available.includes(team))team='';
 tm.innerHTML='<option value="">ALL TEAMS / AFFILIATIONS</option>'+available.map(t=>'<option value="'+escape(t)+'">'+escape(t)+'</option>').join('');
 tm.value=team;tm.disabled=!sport;
}
function renderRoster(){
 if(!opts.athletes?.length){$('ll-web-legend-list').textContent='Loading the roster…';return;}
 rebuildFilters();
 const q=search.toLowerCase(),tf=window.LastLegendSpectator?.teamFor;
 const all=opts.athletes.filter(a=>(!sport||a.sport===sport)&&(!team||(tf?tf(a):a.team||a.era)===team)&&(!q||[a.name,a.team,a.era,a.sport].some(v=>String(v||'').toLowerCase().includes(q))));
 const showing=all.slice(0,pageSize);
 $('ll-legend-count').textContent=all.length.toLocaleString('en-US')+' RESULTS · '+showing.length+' DISPLAYED';
 $('ll-web-legend-list').innerHTML=showing.map(a=>{
  const look=appearanceFor(a);
  return '<article class="ll-site-legend"><div class="ll-site-figure">'+figureSVG(a)+'</div><div class="ll-site-legend-desc"><strong>'+escape(a.name)+'</strong><span>'+escape(a.sport)+'</span><small>'+escape(tf?tf(a):(a.team||a.era||'Independent'))+(look.number!=null?' · #'+escape(look.number):'')+'</small></div><button type="button" class="ll-site-add" data-ll-draft="'+escape(a.id)+'">DRAFT +</button></article>';
 }).join('')||'<p>No matching competitors. Change the filters or search.</p>';
 const btn=$('ll-legend-more');btn.hidden=showing.length===all.length;btn.textContent='SHOW MORE · '+showing.length+'/'+all.length;
}
function draft(id){
 if(!opts.profiles.has(id))return;
 if(opts.selected.includes(id)){show('play');return;}
 if(opts.selected.length>=opts.matchSize){
  const status=$('ll-site-legend-message');status.textContent='Lineup full. Clear a slot in Play before adding another competitor.';return;
 }
 opts.selected.push(id);
 renderSlots();renderGrid();
 const status=$('ll-site-legend-message');status.textContent=opts.profiles.get(id).name+' added to your lineup.';
 show('play');
}
function init(){
 const header=$('ll-site-navigation');if(!header)return;
 $('ll-nav-toggle').addEventListener('click',()=>{
  const nav=$('ll-mobile-nav'),expanded=nav.classList.toggle('ll-nav-open');$('ll-nav-toggle').setAttribute('aria-expanded',String(expanded));
 });
 document.addEventListener('click',e=>{
  const page=e.target.closest('[data-ll-page]');
  if(page){e.preventDefault();show(page.dataset.llPage);return;}
  const draftBtn=e.target.closest('[data-ll-draft]');
  if(draftBtn){draft(draftBtn.dataset.llDraft);return;}
 });
 // LL logo retains in-battle quit confirmation and returns to the new home from the lobby.
 $('ll-home')?.addEventListener('click',e=>{
  if(matchActive()){
   // Native V7 exit handler owns the confirmation. After successful exit its
   // home() method is wrapped below to reveal the website homepage.
   return;
  }
  e.preventDefault();e.stopImmediatePropagation();show('home');
 },true);
 const spectator=window.LastLegendSpectator;
 if(spectator){
  const oldHome=spectator.home;
  spectator.home=function(){oldHome();show('home',true);};
  // V7's logo confirmation callbacks use the lexical home() instead, so
  // after a confirmed exit observe via the same button instead of rewriting
  // the simulation. This handler runs after its existing handler.
  $('ll-confirm-exit')?.addEventListener('click',()=>{
   if(!pending)setTimeout(()=>show('home',true),0);
  });
 }
 $('ll-legend-search').addEventListener('input',e=>{search=e.target.value.trim();pageSize=40;renderRoster();});
 $('ll-legend-sport').addEventListener('change',e=>{sport=e.target.value;team='';pageSize=40;renderRoster();});
 $('ll-legend-team').addEventListener('change',e=>{team=e.target.value;pageSize=40;renderRoster();});
 $('ll-legend-more').addEventListener('click',()=>{pageSize+=40;renderRoster();});
 window.addEventListener('hashchange',()=>show(location.hash.slice(1)||'home',null));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('ll-mobile-nav').classList.remove('ll-nav-open');$('ll-nav-toggle').setAttribute('aria-expanded','false');}});
 const initial=pages.has(location.hash.slice(1))?location.hash.slice(1):'home';
 show(initial,null);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.LastLegendWebsite={show,renderRoster,askLeave,getPage:()=>view};
})();