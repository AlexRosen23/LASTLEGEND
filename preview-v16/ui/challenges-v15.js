/* V15 public seeded challenges without fake accounts, backend or global leaderboards. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const validSeed=n=>Number.isSafeInteger(n)&&n>=0&&n<=2147483647;
function make(override){
 const selected=override||opts.selected;
 if(selected.length<2||selected.length>12||new Set(selected).size!==selected.length)return null;
 if(selected.some(id=>!opts.profiles.has(id)))return null;
 const seed=Number($('seed').value);
 if(!validSeed(seed))return null;
 const payload={v:1,s:seed,a:$('arena').value,m:$('mode').value,r:selected};
 return payload;
}
function encode(p){return encodeURIComponent(JSON.stringify(p));}
function decode(str){
 if(!str||str.length>2500)return null;
 try{
  const p=JSON.parse(decodeURIComponent(str));
  if(!p||p.v!==1||!validSeed(p.s)||!['WILDERNESS','CITY','RUINS','FROZEN'].includes(p.a)||!['BALANCED','REALISTIC','CHAOS'].includes(p.m))return null;
  if(!Array.isArray(p.r)||p.r.length<2||p.r.length>12||new Set(p.r).size!==p.r.length||p.r.some(id=>typeof id!=='string'||!opts.profiles.has(id)))return null;
  return p;
 }catch(e){return null;}
}
function challengeURL(p){
 const url=new URL(location.href);url.hash='/play?llchallenge='+encode(p);url.search='';return url.toString();
}
function apply(p){
 if(!p||!window.LastLegendWebsite)return false;
 $('random-map').checked=false;$('seed').value=String(p.s);$('arena').value=p.a;$('mode').value=p.m;
 $('match-size').value=String(p.r.length);$('match-size').dispatchEvent(new Event('change',{bubbles:true}));
 opts.selected=p.r.slice();
 renderSlots();renderGrid();
 window.LastLegendWebsite.goto('play');
 const s=$('size-status');if(s)s.textContent='Shared seeded challenge loaded. This exact lineup, arena, mode and seed can be replayed.';
 return true;
}
function announce(t){const r=$('site-live-region');if(r)r.textContent=t;}
async function copy(text){
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}}catch(e){}
 const input=document.createElement('textarea');input.value=text;input.setAttribute('readonly','');
 input.style.cssText='position:fixed;left:8px;top:8px;z-index:9999';document.body.appendChild(input);input.select();
 let ok=false;try{ok=document.execCommand('copy');}catch(e){}input.remove();return ok;
}
async function share(fromWinner){
 const p=make(fromWinner&&opts.match?opts.match.roster.slice():undefined);
 if(!p){announce('Share challenges require 2–12 selected legends and a valid seed.');return;}
 if(fromWinner&&opts.match){p.s=opts.match.seed;p.a=opts.match.arena;p.m=opts.match.mode;}
 const link=challengeURL(p),ok=await copy(link);
 announce(ok?'Challenge link copied.':'Copy unavailable. Link: '+link);
}
function init(){
 const action=document.querySelector('#draft-view .draft-actions');
 if(action&&!$('v15-share'))action.insertAdjacentHTML('beforeend','<button type="button" id="v15-share" class="btn btn-secondary" title="Copy a link containing the draft, arena, mode, and seed">SHARE SEEDED CHALLENGE ↗</button>');
 const query=location.hash.match(/[?&]llchallenge=([^&]+)/);
 if(query){const p=decode(query[1]);if(p){apply(p);}else announce('Challenge link was invalid or referred to unavailable competitors.');}
 document.addEventListener('click',function(e){
  if(e.target.closest('#v15-share')){e.preventDefault();share(false);}
  if(e.target.closest('#v15-share-finished')){e.preventDefault();share(true);}
 });
}
window.LastLegendChallenges=Object.freeze({make,encode,decode,apply,challengeURL});
window.addEventListener('load',init);
})();