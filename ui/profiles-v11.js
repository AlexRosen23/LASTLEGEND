/* Last Legend V11 — complete, sourced-from-game character profiles.
   Every value comes from the roster and perk data, not fabricated statistics. */
(function(root){
'use strict';
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=s=>String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const groups=[
 ['SPEED & MOVEMENT',['acceleration','top_speed','agility','reflexes','coordination','balance']],
 ['PHYSICAL',['strength','endurance','durability','recovery']],
 ['COMBAT',['striking','grappling','combat_defense']],
 ['TACTICS & MENTAL',['tactical_iq','awareness','composure','adaptability','resourcefulness','leadership','clutch']]
];
const tendencies=['aggression','caution','alliance_drive','loyalty','opportunism'];
const num=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(100,Number(x))):null;
function roster(){return typeof opts!=='undefined'?opts:null;}
function dataFor(a){
 const state=roster();if(!state?.perks)return {signature:null,secondary:[]};
 return {signature:state.perks.signatures.find(p=>p.athlete_id===a.id)||null,
   secondary:(a.secondary||[]).map(id=>state.perks.secondary.find(p=>p.id===id)).filter(Boolean)};
}
function bar(k,v,compact=false){
 const n=num(v),pct=n===null?0:n;
 return '<div class="v11-stat'+(compact?' v11-compact':'')+'"><div class="v11-stat-heading"><span>'+esc(label(k))+'</span><strong class="v11-stat-score">'+(n===null?'—':n)+'</strong></div><div class="v11-stat-track" role="img" aria-label="'+esc(label(k))+': '+(n===null?'not rated':n+' out of 100')+'"><span style="width:'+pct+'%"></span></div></div>';
}
function ability(p,signature){
 if(!p)return '<div class="v11-ability-empty">No verified ability definition is available for this edition.</div>';
 const effect=Number.isFinite(Number(p.bonus))?'+'+Number(p.bonus)+' TO '+label(p.target_stat):'CONTEXTUAL EFFECT';
 return '<article class="v11-ability'+(signature?' v11-signature':'')+'"><div class="v11-ability-top"><span>'+(signature?'SIGNATURE ABILITY':'SECONDARY ABILITY')+'</span><strong>'+esc(effect)+'</strong></div><h4>'+esc(p.name||label(p.id))+'</h4>'+
 '<p>'+esc(p.description||'A fictional gameplay bonus triggered by '+label(p.trigger)+'.')+'</p>'+
 '<div class="v11-ability-meta"><span>TRIGGER: '+esc(label(p.trigger||'Unknown'))+'</span>'+
 (p.stamina_cost!=null?'<span>STAMINA COST: '+esc(p.stamina_cost)+'</span>':'')+
 (p.activation_limit?'<span>LIMIT: '+esc(label(p.activation_limit))+'</span>':'')+'</div></article>';
}
function source(a){const raw=String(a.source_url||'');return /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(raw)?raw:'';}
function build(a){
 if(!a)return '';
 const state=roster(), look=typeof appearanceFor==='function'?appearanceFor(a):{}, ratings=a.ratings||{},behavior=a.behavior||{};
 const stats=Object.entries(ratings).filter(([,v])=>num(v)!==null).sort((x,y)=>Number(y[1])-Number(x[1]));
 const average=stats.length?Math.round(stats.reduce((n,[,v])=>n+Number(v),0)/stats.length):null;
 const perks=dataFor(a),picked=!!state?.selected?.includes(a.id),full=!!state&&state.selected.length>=state.matchSize;
 const showAdd=!picked&&!full,verified=a.verification_status==='VERIFIED';
 const affiliation=a.team||((root.LastLegendSpectator&&root.LastLegendSpectator.teamFor(a))||a.era)||'Independent';
 const sourceUrl=source(a);
 const notes='All ratings, behavior tendencies, perks and ability effects shown here are fictional game design. Appearance and jersey details may be provisional. No league or athlete endorsement is implied.';
 const str='<div class="site-profile-grid v11-profile-grid"><div class="v11-profile-visual"><div class="site-profile-art">'+(typeof figureSVG==='function'?figureSVG(a,{victory:true}):'')+'</div><div class="v11-profile-id"><span>'+esc(a.sport||'Competitor')+'</span><strong>'+esc(affiliation)+'</strong><small>'+esc(a.era||'Original edition')+'</small></div></div>'+
 '<div class="site-profile-copy v11-profile-main"><div class="site-eyebrow">LAST LEGEND / CHARACTER DOSSIER</div><h2 id="site-profile-title">'+esc(a.name)+'</h2>'+
 '<div class="v11-facts"><span>ROLE: '+esc(label(a.role||a.kind||'Athlete'))+'</span><span>EDITION: '+esc(a.era||'Original')+'</span><span>JERSEY: '+(look.number==null?'NOT VERIFIED':'#'+esc(look.number))+'</span>'+
 '<span>PROFILE: '+(verified?'SOURCE VERIFIED':'PROVISIONAL')+'</span></div>'+
 '<div class="v11-overview"><div><span>GAME RATING AVERAGE</span><strong>'+(average===null?'—':average)+'</strong><small>Average of '+stats.length+' fictional attributes; not a real-world rating</small></div>'+
 '<div><span>TOP ATTRIBUTES</span><p>'+stats.slice(0,3).map(([k,v])=>esc(label(k))+' '+v).join(' · ')+'</p></div>'+
 '<div><span>LOWEST ATTRIBUTES</span><p>'+stats.slice(-3).reverse().map(([k,v])=>esc(label(k))+' '+v).join(' · ')+'</p></div></div>'+
 '<h3 class="v11-section-heading">FULL STAT SPREAD <small>'+stats.length+' ATTRIBUTES / 100-POINT GAME SCALE</small></h3>'+
 '<div class="v11-stat-groups">'+groups.map(([title,keys])=>'<section class="v11-stat-group"><h4>'+esc(title)+'</h4>'+keys.filter(k=>Object.hasOwn(ratings,k)).map(k=>bar(k,ratings[k])).join('')+'</section>').join('')+'</div>'+
 '<h3 class="v11-section-heading">SIGNATURE & ABILITIES</h3><div class="v11-abilities">'+ability(perks.signature,true)+perks.secondary.map(p=>ability(p,false)).join('')+'</div>'+
 '<h3 class="v11-section-heading">BEHAVIOR TENDENCIES <small>FICTIONAL AI PARAMETERS</small></h3><div class="v11-behavior">'+tendencies.filter(k=>Object.hasOwn(behavior,k)).map(k=>bar(k,behavior[k],true)).join('')+'</div>'+
 '<p class="site-fact-check v11-accuracy">'+esc(notes)+'</p>'+
 (sourceUrl?'<p class="v11-source">Roster reference: <a href="'+esc(sourceUrl)+'" target="_blank" rel="noopener noreferrer">Open listed source ↗</a></p>':'<p class="v11-source">No external source URL provided for this game edition.</p>')+
 '<div class="v11-profile-actions"><button type="button" class="site-primary" data-site-draft="'+esc(a.id)+'"'+(showAdd?'':' disabled')+'>'+(picked?'ALREADY DRAFTED':full?'LINEUP FULL · CLEAR A SLOT':'+ ADD TO DRAFT')+'</button>'+
 '<button type="button" class="site-secondary" data-v11-profile-close>CLOSE PROFILE</button></div></div></div>';
 return str;
}
function open(id){
 const state=roster(),a=state?.profiles?.get(id),dialog=document.getElementById('site-profile-dialog'),body=document.getElementById('site-profile-body');
 if(!a||!dialog||!body)return false;
 body.innerHTML=build(a);
 if(!dialog.open)dialog.showModal();
 dialog.scrollTop=0;
 dialog.querySelector('#site-profile-title')?.setAttribute('tabindex','-1');
 dialog.querySelector('#site-profile-title')?.focus();
 return true;
}
function draftCard(a){
 const state=roster(),picked=!!state?.selected?.includes(a.id),full=!!state&&state.selected.length>=state.matchSize,look=appearanceFor(a);
 const canAdd=!picked&&!full;
 return '<article class="athlete-card ll-athlete-card v11-draft-card'+(picked?' selected':'')+'" data-athlete="'+esc(a.id)+'" tabindex="0" aria-label="Show '+esc(a.name)+' profile">'+
 '<div class="athlete-icon ll-portrait" aria-hidden="true">'+figureSVG(a)+'</div><div class="athlete-info"><div class="athlete-name">'+esc(a.name)+'</div><div class="athlete-sport">'+esc(a.sport)+(look.number!=null?' · #'+esc(look.number):'')+'</div><div class="athlete-extra">'+esc(a.team||a.era||'Prime edition')+'</div></div>'+
 '<div class="v11-draft-buttons"><button type="button" data-profile-open="'+esc(a.id)+'" aria-label="Show stats for '+esc(a.name)+'">SHOW STATS</button>'+
 '<button type="button" class="v11-add-button" data-draft-add="'+esc(a.id)+'" aria-label="Add '+esc(a.name)+' to draft"'+(canAdd?'':' disabled')+'>'+(picked?'DRAFTED':full?'FULL':'+ ADD TO DRAFT')+'</button></div></article>';
}
function setup(){document.getElementById('site-profile-body')?.addEventListener('click',e=>{if(e.target.closest('[data-v11-profile-close]'))document.getElementById('site-profile-dialog')?.close();});}
root.LastLegendProfiles=Object.freeze({build,open,draftCard,dataFor,groups,bar});
if(root.document){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();}
})(typeof window!=='undefined'?window:globalThis);
