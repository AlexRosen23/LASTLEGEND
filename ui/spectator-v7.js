/* LAST LEGEND V7 — non-invasive spectator & presentation layer.
   Uses only the authoritative displayed frame and committed events.
   Never writes to Simulation, actor state, perks, placements, or rolls. */
(function(){
'use strict';
if(typeof opts==='undefined'||typeof window.renderFrame!=='function')return;
var byId=function(id){return document.getElementById(id);};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var state={mode:'AUTO',follow:null,draftLimit:96,exitWasPlaying:false,lastHistoryKey:null,camera:null,cameraRAF:0,history:[],written:new Set(),rendering:false};
var storageKey='lastlegend.history.v7';
function currentFrame(){return opts.match&&opts.match.frames[opts.frame]||null;}
function seenStats(id,frame){
 if(!opts.match||!frame)return {damage:0,healing:0,survival:0};
 var match=opts.match, damage=0,healing=0,last=null;
 for(var i=0;i<=opts.frame;i++){
   var actor=match.frames[i].actors[id];
   if(!actor)continue;
   if(last!==null&&actor.hp>last)healing+=actor.hp-last;
   last=actor.hp;
 }
 var events=match.events.slice(0,frame.eventCursor);
 for(var j=0;j<events.length;j++){
   var e=events[j],d=e.detail||{};
   if(d.winner===id&&Number.isFinite(Number(d.damage))&&['SKIRMISH','GROUP_SKIRMISH','FINALE_ENGAGEMENT','AMBUSH'].includes(e.type))damage+=Number(d.damage);
 }
 var lastAlive=0;
 for(var k=0;k<=opts.frame;k++){if(match.frames[k].actors[id]&&match.frames[k].actors[id].alive)lastAlive=match.frames[k].tick;}
 return {damage:Math.round(damage),healing:Math.round(healing),survival:lastAlive};
}
function leaderboard(frame){
 if(!opts.match)return '';
 var rows=opts.match.roster.map(function(id){return {id:id,a:opts.profiles.get(id),s:frame.actors[id]};}).filter(function(x){return !!x.s&&!!x.a;});
 var hp=rows.filter(function(x){return x.s.alive;}).sort(function(x,y){return y.s.hp-x.s.hp||y.s.eliminations-x.s.eliminations||x.a.name.localeCompare(y.a.name);}).slice(0,10);
 var kos=rows.slice().sort(function(x,y){return y.s.eliminations-x.s.eliminations||Number(y.s.alive)-Number(x.s.alive)||y.s.hp-x.s.hp||x.a.name.localeCompare(y.a.name);}).slice(0,10);
 function group(label,list,metric){
   var cards=list.map(function(x,i){
     var v=metric==='hp'?Math.round(x.s.hp)+' HP':x.s.eliminations+' KOs',look=appearanceFor(x.a);
     return '<button type="button" data-ll-track="'+esc(x.id)+'" class="ll-leader-row'+(x.s.alive?'':' ll-out')+(state.follow===x.id?' ll-selected':'')+'" title="Follow '+esc(x.a.name)+'"><span class="ll-rank">'+String(i+1).padStart(2,'0')+'</span><span class="ll-leader-portrait">'+figureSVG(x.a)+'</span><span class="ll-leader-name">'+esc(x.a.name)+(look.number!=null?' <small>#'+esc(look.number)+'</small>':'')+(x.s.alive?'':' <em>OUT</em>')+'</span><strong>'+v+'</strong></button>';
   }).join('');
   return '<section class="ll-board-col"><div class="ll-board-heading">'+label+'</div><div class="ll-board-scroll" tabindex="0" aria-label="'+label+' scrollable rankings">'+(cards||'<div class="ll-board-empty">No survivors</div>')+'</div></section>';
 }
 return '<div class="leaders-title">ARENA LEADERS <span class="leaders-live">LIVE · '+frame.alive.length+' LEFT</span></div><div class="ll-board-note">TOP 10 · CLICK A LEGEND TO FOLLOW</div><div class="ll-board-grid">'+group('♥ TOP 10 HEALTH',hp,'hp')+group('✦ TOP 10 ELIMINATIONS',kos,'kills')+'</div>';
}
window.leaderBoardMarkup=leaderboard;
window.renderLeaders=function(frame){
 var markup=leaderboard(frame);
 ['arena-leaders-desktop','arena-leaders-mobile'].forEach(function(id){
   var el=byId(id);if(!el)return;
   var scroll=Array.from(el.querySelectorAll('.ll-board-scroll')).map(function(e){return e.scrollTop;});
   el.innerHTML=markup;
   el.querySelectorAll('.ll-board-scroll').forEach(function(e,i){e.scrollTop=scroll[i]||0;});
 });
};
var originalGrid=window.renderGrid;
window.renderGrid=function(){
 if(!opts.profiles||!opts.athletes.length){originalGrid();return;}
 var list=getFiltered();
 byId('filtered-count').textContent=list.length+' available · '+opts.selected.length+' drafted';
 var visible=list.slice(0,state.draftLimit);
 byId('athlete-grid').innerHTML=visible.map(function(a){
  var selected=opts.selected.includes(a.id),look=appearanceFor(a);
  if(window.LastLegendProfiles)return window.LastLegendProfiles.draftCard(a);
  return '<button class="athlete-card ll-athlete-card'+(selected?' selected':'')+'" data-athlete="'+esc(a.id)+'" aria-pressed="'+selected+'" title="'+esc(a.name)+'"><div class="athlete-icon ll-portrait">'+figureSVG(a)+'</div><div class="athlete-info"><div class="athlete-name">'+esc(a.name)+'</div><div class="athlete-sport">'+esc(a.sport)+(look.number!=null?' · #'+esc(look.number):'')+'</div><div class="athlete-extra">'+esc(a.team||a.era||'Prime edition')+'</div></div><div class="athlete-add">'+(selected?'✓':'+')+'</div></button>';
 }).join('')||'<p>No matching competitors. Try another search.</p>';
 var load=byId('ll-more-athletes');
 if(load){load.hidden=visible.length===list.length;load.textContent='SHOW MORE LEGENDS · '+visible.length+' / '+list.length;}
};
function jumpTo(id){
 if(!opts.match||!opts.profiles.has(id))return;
 state.follow=id;state.mode='FOLLOW';
 var choose=byId('ll-camera-mode');if(choose)choose.value='FOLLOW';
 var selector=byId('ll-follow-select');if(selector)selector.value=id;
 var frame=currentFrame();if(frame){renderMap(frame);window.renderLeaders(frame);updateSpotlight(frame);}
 var caption=byId('ll-camera-caption');if(caption)caption.textContent='TRACKING '+name(id).toUpperCase();
}
function setMode(mode){
 state.mode=mode;if(mode!=='FOLLOW')state.follow=null;
 var sel=byId('ll-camera-mode');if(sel)sel.value=mode;
 var follow=byId('ll-follow-select');if(follow)follow.value=state.follow||'';
 var f=currentFrame();if(f){renderMap(f);window.renderLeaders(f);updateSpotlight(f);}
 var label=byId('ll-camera-caption');
 if(label)label.textContent=mode==='OVERVIEW'?'WIDE ARENA VIEW':mode==='FOLLOW'?(state.follow?'TRACKING '+name(state.follow).toUpperCase():'SELECT A LEGEND'):'AUTO DIRECTOR · EVENT FOCUS';
}
function updateSpotlight(frame){
 var box=byId('ll-spotlight');if(!box||!opts.match)return;
 var id=state.follow;
 if(!id||!frame.actors[id]){
  box.innerHTML='<div class="ll-spot-empty"><strong>AUTO DIRECTOR</strong><span>Select a player from the map, leaders or tracking list to follow their run.</span></div>';
  return;
 }
 var a=opts.profiles.get(id),s=frame.actors[id],extra=seenStats(id,frame),look=appearanceFor(a);
 box.innerHTML='<div class="ll-spot-head">'+figureSVG(a,{large:true})+'<div><div class="ll-eyebrow">FOLLOWING · '+(s.alive?'IN THE ARENA':'ELIMINATED')+'</div><strong>'+esc(a.name)+'</strong><small>'+esc(a.team||a.era||a.sport)+(look.number!=null?' · #'+esc(look.number):'')+'</small></div></div>'+
 '<div class="ll-spot-hp"><span>HEALTH</span><strong>'+Math.round(s.hp)+' / 100</strong></div><div class="ll-spot-bar"><span style="width:'+Math.max(0,Math.min(100,s.hp))+'%"></span></div>'+
 '<div class="ll-spot-stats"><div><small>ELIMS</small><b>'+s.eliminations+'</b></div><div><small>DMG DEALT</small><b>'+extra.damage+'</b></div><div><small>HP RESTORED</small><b>'+extra.healing+'</b></div><div><small>TIME SURVIVED</small><b>'+extra.survival+' T</b></div></div>'+
 '<div class="ll-signature-card"><span>SIGNATURE PROFILE</span><strong>'+esc(String(a.perk||'No assigned perk').replace(/^SIGNATURE(_V\\d+)?_/,'').replaceAll('_',' '))+'</strong><small>Illustrative ability label; activation depends on the actual match engine.</small></div>'+
 (s.alive?'':'<div class="ll-eliminated-follow">ELIMINATED · SELECT ANOTHER COMPETITOR</div>')+
 '<button type="button" id="ll-clear-follow" class="btn btn-secondary">RETURN TO AUTO DIRECTOR</button>';
}
function cameraBox(frame){
 var target=[];
 if(state.mode==='FOLLOW'&&state.follow){
  var s=frame.actors[state.follow];if(s&&s.alive)target=[s];
  else return null;
 }else if(state.mode==='AUTO'){
  var e=eventForFrame(frame);
  if(e&&e.participants&&e.participants.length){
   target=e.participants.map(function(id){return frame.actors[id];}).filter(function(a){return a&&a.alive;}).slice(0,4);
  }
  if(!target.length&&frame.alive.length<=2&&frame.alive.length>0)target=frame.alive.map(function(id){return frame.actors[id];});
 }
 if(!target.length)return null;
 var xs=target.map(function(x){return x.x*620/31;}),ys=target.map(function(x){return x.y*390/19;});
 var minX=Math.min.apply(null,xs),maxX=Math.max.apply(null,xs),minY=Math.min.apply(null,ys),maxY=Math.max.apply(null,ys);
 var w=Math.min(620,Math.max(350,maxX-minX+205)),h=Math.min(390,Math.max(220,maxY-minY+128));
 // Preserve source map's 620:390 aspect ratio while tracking a selected subject.
 var aspect=620/390;
 if(w/h>aspect)h=w/aspect;else w=h*aspect;
 w=Math.min(620,w);h=Math.min(390,h);
 var cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 return [Math.max(0,Math.min(620-w,cx-w/2)),Math.max(0,Math.min(390-h,cy-h/2)),w,h];
}
function applyCamera(frame){
 var map=byId('map');if(!map)return;
 var box=cameraBox(frame)||[0,0,620,390];
 if(!state.camera||window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  state.camera=box;map.setAttribute('viewBox',box.join(' '));return;
 }
 if(state.cameraRAF&&window.cancelAnimationFrame)window.cancelAnimationFrame(state.cameraRAF);
 var from=state.camera.slice(),start=null;
 function tick(now){
  if(start===null)start=now;
  var t=Math.min(1,(now-start)/380),ease=1-Math.pow(1-t,3);
  var vals=from.map(function(v,i){return +(v+(box[i]-v)*ease).toFixed(2);});
  if(!map.isConnected)return;
  map.setAttribute('viewBox',vals.join(' '));
  if(t<1&&window.requestAnimationFrame)state.cameraRAF=window.requestAnimationFrame(tick);
  else{state.camera=box;state.cameraRAF=0;}
 }
 if(window.requestAnimationFrame)state.cameraRAF=window.requestAnimationFrame(tick);
 else{state.camera=box;map.setAttribute('viewBox',box.join(' '));}
}
var underlyingMap=window.renderMap;
window.renderMap=function(frame){
 underlyingMap(frame);
 if(!opts.match)return;
 var map=byId('map'),env=opts.match.arena,landmarks=opts.match.map.landmarks||[],visual='';
 // Reuse seeded terrain locations. These SVG decorations are visual only, not collision objects.
 landmarks.slice(0,28).forEach(function(l,i){
  var x=(l.x*620/31).toFixed(1),y=(l.y*390/19).toFixed(1);
  if(env==='WILDERNESS'&&['forest','ridge'].includes(l.type))
    visual+='<g transform="translate('+x+','+y+')"><path d="M0 -16L-10 4L-4 4L-13 12H13L4 4H10Z" fill="#38765b" stroke="#7bb68a" stroke-width="1"/><path d="M0 8V16" stroke="#74614e" stroke-width="3"/></g>';
  if(env==='CITY'&&l.type==='building')
    visual+='<g transform="translate('+x+','+y+')"><rect x="-13" y="-13" width="26" height="25" fill="#293d53" stroke="#9e9f96" stroke-width="1"/><path d="M-7 -9h4M3 -9h4M-7 -2h4M3 -2h4M-7 5h4M3 5h4" stroke="#ffd990" stroke-width="2"/></g>';
  if(env==='RUINS'&&['rubble','pillar'].includes(l.type))
    visual+='<g transform="translate('+x+','+y+')"><path d="M-9 11L-8 -8L-4 -13L2 -11L5 10ZM8 12L7 -3L12 -7L16 0L16 12Z" fill="#827a64" stroke="#c8b797" stroke-width="1"/></g>';
  if(env==='FROZEN'&&['snowdrift','ice'].includes(l.type))
    visual+='<g transform="translate('+x+','+y+')"><path d="M-15 6Q-8 -13 0 -9Q9 -14 15 6Z" fill="#b2dce5" stroke="#f1f6f8" stroke-width="1"/><path d="M-6 2L-3 -5L0 -2" stroke="#f5fbff" stroke-width="2" fill="none"/></g>';
 });
 if(visual)map.insertAdjacentHTML('afterbegin','<g class="ll-biome-overlay" aria-hidden="true">'+visual+'</g>');
 var hits='';
 opts.match.roster.forEach(function(id){
  var p=frame.actors[id];if(!p||!p.alive)return;
  hits+='<circle data-ll-track="'+esc(id)+'" role="button" tabindex="-1" aria-label="Follow '+esc(opts.profiles.get(id).name)+'" cx="'+(p.x*620/31).toFixed(1)+'" cy="'+(p.y*390/19).toFixed(1)+'" r="14" class="ll-map-hit'+(state.follow===id?' ll-map-follow':'')+'"/>';
 });
 map.insertAdjacentHTML('beforeend','<g class="ll-map-targets">'+hits+'</g>');
 applyCamera(frame);
};
var underlyingEncounter=window.renderEncounter;
window.renderEncounter=function(e){
 underlyingEncounter(e);
 if(!e)return;
 var id=e.detail&&(e.detail.winner||e.detail.hunter),a=id&&opts.profiles.get(id);
 var text=byId('encounter-text'),active=['SKIRMISH','GROUP_SKIRMISH','FINALE_ENGAGEMENT','AMBUSH'].includes(e.type);
 if(text&&a&&active){
   var perk=String(a.perk||'').replace(/^SIGNATURE(_V\d+)?_/,'').replaceAll('_',' ');
   text.insertAdjacentHTML('beforeend','<div class="ll-ability-callout">✦ '+esc(a.name)+' · SIGNATURE PROFILE: '+esc(perk)+'<small>Displayed trait, not a claim that it activated in this event.</small></div>');
 }
 if(text&&(e.eliminated||e.type==='ELIMINATION')){
   var victim=e.eliminated||(e.detail&&e.detail.id)||e.participants[0];
   text.insertAdjacentHTML('beforeend','<div class="ll-elimination-flash" role="status">✕ '+esc(name(victim))+' ELIMINATED</div>');
 }
 var stage=byId('encounter-visual');
 if(stage)stage.classList.toggle('ll-special-hit',active);
};
var previousChampion=window.championMarkup;
window.championMarkup=function(){
 var out=previousChampion();if(!opts.match)return out;
 var match=opts.match,stats=match.statistics[match.winner],events=match.events;
 var highlighted=events.filter(function(e){return e.type==='ELIMINATION'||e.type==='FINALE_ENGAGEMENT'||e.type==='GROUP_SKIRMISH';}).slice(-4).reverse();
 var records='<div class="ll-champ-highlight"><h3>CHAMPIONSHIP MOMENTS</h3>'+(highlighted.map(function(e){return '<p><span>TICK '+e.tick+'</span> '+esc(e.type.replaceAll('_',' '))+' · '+esc(e.participants.map(name).join(' / '))+'</p>';}).join('')||'<p>No dramatic encounters recorded</p>')+'</div>';
 return out.replace('<div class="champion-actions">',records+'<div class="champion-actions">');
};
var historyMemory=[];
function readHistory(){
 try{var arr=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(arr)?arr.filter(function(x){return x&&x.key&&x.winner;}).slice(0,30):[];}
 catch(e){return historyMemory.slice();}
}
function writeHistory(arr){
 historyMemory=arr.slice(0,30);
 try{localStorage.setItem(storageKey,JSON.stringify(historyMemory));}catch(e){}
}
function saveFinished(){
 var m=opts.match;if(!m)return;
 var key=[m.seed,m.arena,m.mode,m.roster.join('|')].join('::');
 if(state.written.has(key))return;
 var existing=readHistory();
 if(existing.some(function(x){return x.key===key})){state.written.add(key);return;}
 var s=m.statistics[m.winner],moments=m.events.filter(function(e){return e.type==='ELIMINATION'||e.type==='FINALE_ENGAGEMENT';}).slice(-3).map(function(e){return {tick:e.tick,type:e.type,participants:e.participants.slice(0,4)};});
 existing.unshift({key:key,winner:m.winner,champion:name(m.winner),count:m.roster.length,seed:m.seed,arena:m.arena,eliminations:s.eliminations||0,encounters:s.encounters||0,moments:moments,date:new Date().toISOString()});
 writeHistory(existing);state.written.add(key);renderHistory();
}
function renderHistory(){
 var root=byId('ll-match-history');if(!root)return;
 var hist=readHistory(),winners=new Set(hist.map(function(x){return x.winner;})),max=hist.reduce(function(m,x){return Math.max(m,x.eliminations||0);},0);
 root.innerHTML='<div class="ll-history-heading"><div><div class="ll-eyebrow">THE ARCHIVES</div><h2>CHAMPION HISTORY</h2></div><span>'+hist.length+' FINISHED MATCHES</span></div>'+
 '<div class="ll-history-stats"><span>'+winners.size+' UNIQUE CHAMPIONS</span><span>'+max+' RECORD ELIMS</span><span>STORED ON THIS DEVICE</span></div>'+
 (hist.length?'<div class="ll-history-list">'+hist.slice(0,12).map(function(item,i){return '<article><span class="ll-history-num">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+esc(item.champion)+'</strong><small>'+esc(item.arena)+' · '+item.count+' competitors · seed '+item.seed+'</small><small>'+item.eliminations+' eliminations · '+item.encounters+' encounters</small></div><div class="ll-history-date">'+esc(item.date.slice(0,10))+'</div></article>';}).join('')+'</div>':'<p class="ll-history-none">Your champions will appear here after a completed battle. No replays are stored.</p>');
}
var previousFrame=window.renderFrame;
window.renderFrame=function(){
 previousFrame();
 var frame=currentFrame();if(!frame)return;
 var duel=byId('ll-final-duel'),battle=byId('battle-view');
 if(battle)battle.classList.toggle('ll-final-showdown',frame.alive.length===2);
 if(duel){
  duel.hidden=frame.alive.length!==2;
  if(frame.alive.length===2)duel.innerHTML='<span>THE FINAL TWO</span>'+frame.alive.map(function(id){return '<strong>'+esc(name(id))+' <em>'+Math.round(frame.actors[id].hp)+' HP</em></strong>';}).join('<b>VS</b>');
 }
 updateSpotlight(frame);
 if(opts.frame===opts.match.frames.length-1)saveFinished();
 var cameraLabel=byId('ll-camera-caption');
 if(cameraLabel)cameraLabel.textContent=state.mode==='FOLLOW'?(state.follow?'TRACKING '+name(state.follow).toUpperCase():'SELECT A LEGEND'):state.mode==='OVERVIEW'?'WIDE ARENA VIEW':'AUTO DIRECTOR · EVENT FOCUS';
};
var previousStart=window.startMatch;
window.startMatch=function(){
 state.follow=null;state.mode='AUTO';state.camera=null;
 previousStart();
 if(!opts.match)return;
 var list=byId('ll-follow-select');
 if(list)list.innerHTML='<option value="">SELECT A COMPETITOR TO TRACK</option>'+opts.match.roster.map(function(id){return '<option value="'+esc(id)+'">'+esc(name(id))+'</option>';}).join('');
 var mode=byId('ll-camera-mode');if(mode)mode.value='AUTO';
};
function home(){
 stop();opts.match=null;opts.frame=0;opts.lastEncounterId=null;
 state.follow=null;state.camera=null;state.mode='AUTO';
 byId('battle-view').classList.add('hidden');
 byId('draft-view').classList.remove('hidden');
 var dialog=byId('ll-exit-dialog');if(dialog.open)dialog.close();
 renderHistory();
 window.scrollTo(0,0);
}
function exitPrompt(){
 if(!opts.match||byId('battle-view').classList.contains('hidden')){home();return;}
 state.exitWasPlaying=!!opts.playing;stop();
 var d=byId('ll-exit-dialog');if(typeof d.showModal==='function')d.showModal();
 else if(window.confirm('Are you sure you want to end the battle and return to the home page?'))home();
 else if(state.exitWasPlaying)startPlayback();
}
function cancelExit(){
 var d=byId('ll-exit-dialog');if(d.open)d.close();
 if(state.exitWasPlaying&&opts.match&&opts.frame<opts.match.frames.length-1)startPlayback();
 state.exitWasPlaying=false;
}
/* Career editions are independent selectable fighters, with cloned EXISTING gameplay perk
   definitions. They do not overwrite the parent, manufacture ratings or alter outcomes. */
var llEditionDefinitions=[
 {parent:'lebron-james',id:'lebron-james-heat-2013',team:'Miami Heat',era:'Miami Heat 2012-13',short:'Heat',number:6,primary:'#98002e',secondary:'#f9a01b',url:'https://www.nba.com/news/lebron-james-free-agency-sixers-2026'},
 {parent:'lebron-james',id:'lebron-james-lakers-2020',team:'Los Angeles Lakers',era:'Lakers 2019-20',short:'Lakers',number:23,primary:'#552583',secondary:'#fdb927',url:'https://www.nba.com/news/lebron-james-free-agency-sixers-2026'},
 {parent:'lebron-james',id:'lebron-james-sixers-2026',team:'Philadelphia 76ers',era:'76ers 2026-27',short:'76ers',number:23,primary:'#006bb6',secondary:'#ed174c',url:'https://www.nba.com/sixers/76ers-players/lebron-james'},
 {parent:'lionel-messi',id:'lionel-messi-argentina-2022',team:'Argentina national team',era:'Argentina 2022',short:'Argentina',number:10,primary:'#75b7e9',secondary:'#ffffff',url:'https://www.fifa.com/en/articles/lionel-messi-argentina-world-cup-2022'},
 {parent:'lionel-messi',id:'lionel-messi-psg-2022',team:'Paris Saint-Germain',era:'Paris Saint-Germain 2022-23',short:'PSG',number:30,primary:'#004170',secondary:'#da291c',url:'https://en.psg.fr/teams/first-team/content/number-30-for-leo-messi'},
 {parent:'lionel-messi',id:'lionel-messi-miami-2024',team:'Inter Miami CF',era:'Inter Miami 2024',short:'Inter Miami',number:10,primary:'#f7b5cd',secondary:'#1c2023',url:'https://www.intermiamicf.com/news/inter-miami-cf-announces-squad-numbers-for-2024-season'},
 {parent:'tom-brady',id:'tom-brady-buccaneers-2020',team:'Tampa Bay Buccaneers',era:'Buccaneers 2020',short:'Buccaneers',number:12,primary:'#d50a0a',secondary:'#f3f3f3',helmet:'#4a4c53',url:'https://www.buccaneers.com/team/players-roster/tom-brady/'}
];
var llTeamAliases=[
 ['Philadelphia 76ers','Philadelphia 76ers'],['76ers','Philadelphia 76ers'],['Sixers','Philadelphia 76ers'],
 ['Cavaliers','Cleveland Cavaliers'],['Cleveland','Cleveland Cavaliers'],['Miami Heat','Miami Heat'],['Heat','Miami Heat'],['Lakers','Los Angeles Lakers'],['Bulls','Chicago Bulls'],
 ['Barcelona','FC Barcelona'],['Paris Saint-Germain','Paris Saint-Germain'],['PSG','Paris Saint-Germain'],['Inter Miami','Inter Miami CF'],['Argentina','Argentina national team'],
 ['Patriots','New England Patriots'],['Buccaneers','Tampa Bay Buccaneers'],
 ['Warriors','Golden State Warriors'],['Celtics','Boston Celtics'],['Knicks','New York Knicks'],['Pacers','Indiana Pacers'],
 ['Hoosiers','Indiana Hoosiers'],['Indiana University','Indiana Hoosiers'],['Yankees','New York Yankees'],['Cubs','Chicago Cubs'],
 ['Chiefs','Kansas City Chiefs'],['Cardinals','Arizona Cardinals'],['Bears','Chicago Bears'],
 ['Colts','Indianapolis Colts'],['Packers','Green Bay Packers'],['Broncos','Denver Broncos'],
 ['Seahawks','Seattle Seahawks'],['Eagles','Philadelphia Eagles'],['Cowboys','Dallas Cowboys']
];
function llTeamFor(a){
 if(a.team)return String(a.team);
 var era=String(a.era||a.edition||'').trim();
 if(!era)return 'Independent / Other';
 // Longest specific names take priority over broad nicknames.
 for(var i=0;i<llTeamAliases.length;i++){
  var alias=llTeamAliases[i][0].toLowerCase();
  if(era.toLowerCase().includes(alias))return llTeamAliases[i][1];
 }
 var cleaned=era.replace(/\b(?:19|20)\d\d(?:[-–/]\d\d(?:\d\d)?)?.*$/,'').replace(/^active roster[ ·—:-]*/i,'').replace(/[ ·—-]+$/,'').trim();
 if(!cleaned||/^(modern|prime|world|all time|historic|unknown)$/i.test(cleaned))return 'Independent / Other';
 return cleaned.length>45?'Independent / Other':cleaned;
}
function installCareerEditions(){
 if(!opts.athletes||!opts.profiles||!opts.perks||!Array.isArray(opts.perks.signatures))return false;
 if(opts.athletes.some(function(a){return llEditionDefinitions.some(function(e){return e.id===a.id;});}))return true;
 var originalTeams={'lebron-james':'Cleveland Cavaliers','lionel-messi':'FC Barcelona','tom-brady':'New England Patriots'};
 Object.keys(originalTeams).forEach(function(id){
  var base=opts.profiles.get(id);if(!base)return;
  base.team=originalTeams[id];
  base.edition_short=originalTeams[id];
  if(CURATED_LOOK[id]&&CURATED_LOOK[id].number!=null)base.number=CURATED_LOOK[id].number;
 });
 llEditionDefinitions.forEach(function(edition){
  var parent=opts.profiles.get(edition.parent);
  if(!parent||opts.profiles.has(edition.id))return;
  var perk=opts.perks.signatures.find(function(x){return x.athlete_id===parent.id;});
  if(!perk)return;
  var child=Object.assign({},parent,{id:edition.id,name:parent.name+' — '+edition.short,team:edition.team,era:edition.era,number:edition.number,edition_of:parent.id,edition_short:edition.short,source_url:edition.url});
  opts.athletes.push(child);opts.profiles.set(child.id,child);
  opts.perks.signatures.push(Object.assign({},perk,{athlete_id:child.id}));
  var look=CURATED_LOOK[parent.id]||{};
  CURATED_LOOK[child.id]=Object.assign({},look,{primary:edition.primary,secondary:edition.secondary,number:edition.number,helmet:edition.helmet||(look.helmet||null)});
 });
 var meta=byId('ll-edition-count');
 if(meta){const editions=opts.athletes.filter(a=>!!a.edition_of).length;meta.textContent=(opts.athletes.length-editions).toLocaleString('en-US')+' BASE & EXPANDED ATHLETES + '+editions+' CAREER EDITIONS';}
 var title=byId('ll-draft-catalog-count');
 if(title)title.textContent=opts.athletes.length.toLocaleString('en-US');
 return true;
}
var llOriginalGetFiltered=getFiltered;
getFiltered=function(){
 var matches=llOriginalGetFiltered();
 var teamSelect=byId('ll-team-filter'),team=teamSelect&&teamSelect.value;
 return team?matches.filter(function(a){return llTeamFor(a)===team;}):matches;
};
function refreshTeamOptions(){
 var el=byId('ll-team-filter');if(!el)return;
 var sport=byId('sport-filter')?.value||'';
 if(!sport){el.disabled=true;el.innerHTML='<option value="">CHOOSE A SPORT FIRST</option>';return;}
 var selected=el.value;
 var teams=[...new Set(opts.athletes.filter(function(a){return a.sport===sport;}).map(llTeamFor))].sort(function(a,b){return a.localeCompare(b);});
 el.innerHTML='<option value="">ALL TEAMS / AFFILIATIONS ('+teams.length+')</option>'+
  teams.map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+'</option>';}).join('');
 el.disabled=false;
 el.value=teams.includes(selected)?selected:'';
}
function wireTeamFilter(){
 var sport=byId('sport-filter'),team=byId('ll-team-filter');if(!sport||!team)return;
 sport.addEventListener('change',function(){team.value='';refreshTeamOptions();window.renderGrid();});
 team.addEventListener('change',function(){state.draftLimit=96;window.renderGrid();});
 refreshTeamOptions();
}

function setup(){
 installCareerEditions();wireTeamFilter();
 var logo=byId('ll-home');if(logo)logo.addEventListener('click',exitPrompt);
 var yes=byId('ll-confirm-exit');if(yes)yes.addEventListener('click',function(){state.exitWasPlaying=false;home();});
 var no=byId('ll-cancel-exit');if(no)no.addEventListener('click',cancelExit);
 var exit=byId('ll-exit-dialog');if(exit){exit.addEventListener('cancel',function(e){e.preventDefault();cancelExit();});exit.addEventListener('click',function(e){if(e.target===exit)cancelExit();});}
 var back=byId('back');if(back)back.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exitPrompt();},true);
 var mode=byId('ll-camera-mode');if(mode)mode.addEventListener('change',function(e){setMode(e.target.value);});
 var choose=byId('ll-follow-select');if(choose)choose.addEventListener('change',function(e){if(e.target.value)jumpTo(e.target.value);else setMode('AUTO');});
 var more=byId('ll-more-athletes');if(more)more.addEventListener('click',function(){state.draftLimit+=72;renderGrid();});
 var search=byId('search');if(search)search.addEventListener('input',function(){state.draftLimit=96;},true);
 document.addEventListener('click',function(e){
   var tracking=e.target.closest('[data-ll-track]');if(tracking){e.preventDefault();jumpTo(tracking.dataset.llTrack);return;}
   if(e.target.closest('#ll-clear-follow'))setMode('AUTO');
 });
 if(opts.profiles&&opts.athletes&&opts.athletes.length)renderGrid();
 renderHistory();
}
window.LastLegendSpectator={state:state,leaderboard:leaderboard,saveFinished:saveFinished,readHistory:readHistory,home:home,exitPrompt:exitPrompt,seenStats:seenStats,cameraBox:cameraBox,installCareerEditions:installCareerEditions,teamFor:llTeamFor,refreshTeamOptions:refreshTeamOptions,editionDefinitions:llEditionDefinitions};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
else setup();
})();