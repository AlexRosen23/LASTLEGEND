'use strict';
// Every on-page count of the library must match opts.athletes after each loading step.
// Before the fix the Play page kept "1,645-character library" and "1,652" while 1,664 entries were loaded.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const main=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
assert(main,'main simulator script found');
for(const id of ['site-total','ll-draft-catalog-count','size-status'])assert(html.includes(`id="${id}"`),id+' exists on the page');
const athletes=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const els=new Map(),make=()=>({innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,style:{setProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},querySelectorAll(){return []},querySelector(){return null},addEventListener(){},insertAdjacentHTML(){},insertAdjacentElement(){},appendChild(){},closest(){return null}});
const document={readyState:'complete',getElementById(id){if(!els.has(id))els.set(id,make());return els.get(id)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},createElement(){return make()}};
const store=new Map(),localStorage={getItem(k){return store.get(k)||null;},setItem(k,v){store.set(k,v)}};
const ctx=vm.createContext({console,document,localStorage,Date,Math,setTimeout,clearTimeout,crypto:{getRandomValues(a){a[0]=23;return a;}},requestAnimationFrame:null,cancelAnimationFrame:null,matchMedia:()=>({matches:false}),scrollTo(){},addEventListener(){}});
ctx.window=ctx;
vm.runInContext(main[1].replace(/\ninit\(\);\s*$/,''),ctx);
for(const f of ['ui/character-renderer.js','ui/roster-expansion-v23.js','ui/spectator-v7.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const opts=vm.runInContext('opts',ctx),text=id=>els.get(id)?.textContent;
const num=s=>Number(String(s).replace(/,/g,''));

// Page order (index.html init): V23 expansion, expose the library, size message, then the V7 editions.
assert.equal(ctx.LastLegendRosterV23.install(athletes,perks).total,1645);
opts.athletes=athletes;opts.perks=perks;opts.profiles=new Map(athletes.map(a=>[a.id,a]));
document.getElementById('size-status').textContent=`Select 12 athletes from the ${athletes.length.toLocaleString('en-US')}-character library.`;
assert.equal(ctx.LastLegendSpectator.installCareerEditions(),true);
assert.equal(athletes.length,1652);
// V22 historical editions arrive later (DOMContentLoaded) and call refreshTeamOptions().
vm.runInContext(fs.readFileSync(path.join(root,'ui/eras-v22.js'),'utf8'),ctx);
assert.equal(ctx.LastLegendErasV22.install(),12);
assert.equal(athletes.length,1664);
const editions=athletes.filter(a=>a.edition_of).length;
assert.equal(editions,19,'7 V7 + 12 V22 career editions');
assert.equal(num(text('ll-draft-catalog-count')),athletes.length,'Play heading count');
assert.equal(num(text('site-total')),athletes.length,'home stat strip');
assert.equal(text('size-status'),'Select 12 athletes from the 1,664-character library.');
assert.equal(text('ll-edition-count'),'1,645 BASE & EXPANDED ATHLETES + 19 CAREER EDITIONS');

// Any later addition (league feed, roster import, custom character) refreshes the same counters.
const extra={...athletes[0],id:'count-check-extra',name:'Count Check',edition_of:null};
athletes.push(extra);opts.profiles.set(extra.id,extra);
ctx.LastLegendSpectator.refreshTeamOptions();
assert.equal(num(text('ll-draft-catalog-count')),1665);
assert.equal(num(text('site-total')),1665);
assert.equal(text('size-status'),'Select 12 athletes from the 1,665-character library.');
assert.equal(text('ll-edition-count'),'1,646 BASE & EXPANDED ATHLETES + 19 CAREER EDITIONS');

// A different status message (e.g. after shrinking the lineup) is left alone.
document.getElementById('size-status').textContent='Kept your first 8 selected athletes; removed 4.';
ctx.LastLegendSpectator.refreshCatalogCounts();
assert.equal(text('size-status'),'Kept your first 8 selected athletes; removed 4.');
console.log('CATALOG COUNTS PASS: 1,203 inline + 442 expansion + 19 career editions = 1,664 shown on every counter; later additions refresh them');
