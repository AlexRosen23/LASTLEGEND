/* V30 review candidate interface polish: accessible opt-in display settings and release transparency. */
(function(){'use strict';const $=id=>document.getElementById(id),KEY='lastlegend.display.v30';
function read(){try{let p=JSON.parse(localStorage.getItem(KEY)||'{}');return {contrast:p.contrast===true,still:p.still===true};}catch(e){return {contrast:false,still:false}}}
function apply(x){
 document.documentElement.classList.toggle('v30-contrast',!!x.contrast);
 document.documentElement.classList.toggle('v30-reduced',!!x.still);
 try{localStorage.setItem(KEY,JSON.stringify(x));}catch(e){}
}
function init(){
 const home=$('site-home');if(home&&!$('v30-options')){
 const x=read();apply(x);
 const box=document.createElement('section');box.id='v30-options';box.className='ll-future-panel';
 box.innerHTML='<div class="site-eyebrow">VERSION 30 / RELEASE CANDIDATE</div><h3>YOUR VIEWING SETTINGS</h3><p>Adjust Last Legend for your screen. This is a review build; major expansions that require live licensed rosters or secure backend infrastructure are not represented as complete.</p><div class="v30-options"><label><input id="v30-contrast" type="checkbox"> HIGH-CONTRAST TEXT</label><label><input id="v30-still" type="checkbox"> REDUCE ARENA MOTION</label></div><p>Want to test every mode? Start a seeded challenge, open a character dossier, run the tournament bracket, create a fictional legend, and finish a battle to try Back to Home.</p>';
 home.appendChild(box);$('v30-contrast').checked=x.contrast;$('v30-still').checked=x.still;
 for(const [id,field] of [['v30-contrast','contrast'],['v30-still','still']])$(id).addEventListener('change',e=>apply({...read(),[field]:e.target.checked}));
 }
 const update=$('site-updates')?.querySelector('.site-updates-list');
 if(update&&!$('v30-whatsnew')){const article=document.createElement('article');article.id='v30-whatsnew';article.className='site-update';article.innerHTML='<div class="site-update-num">V18–V30 · REVIEW BUILD</div><div><h2>THE NEXT CHAPTER</h2><p>Previewing attributed roster imports, ability cues, cinematic/world effects, historical editions, tournaments, daily matches, replay tools, rivalry AI, original characters, portable data, broadcast captions and display settings. Authenticated multiplayer, full current league rosters and true rigged animation libraries are future work.</p></div>';update.prepend(article);}
}
window.LastLegendSettings=Object.freeze({read,apply});
document.addEventListener('DOMContentLoaded',init);
})();