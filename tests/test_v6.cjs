'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const art=fs.readFileSync(path.join(root,'ui/character-renderer.js'),'utf8');
const css=fs.readFileSync(path.join(root,'ui/character-polish.css'),'utf8');
const athletes=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const inline=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
assert(inline,'production game must load the renderer after its inline classic script');
assert(html.includes('ui/character-polish.css'),'production stylesheet linked');
assert(html.includes('identity-lab.html'),'lab accessible from main page');
assert(css.includes('prefers-reduced-motion'),'reduce-motion accessibility');
const nodes=new Map();
const document={getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',added:'',insertAdjacentHTML(position,markup){this.added+=markup;}});return nodes.get(id);}};
const context=vm.createContext({console,document,setTimeout,clearTimeout,Math,Date,crypto:{getRandomValues(array){array[0]=2026;return array;}}});
context.window=context;
vm.runInContext(inline[1].replace(/\ninit\(\);\s*$/,''),context,{filename:'inline-lastlegend.js'});
vm.runInContext(art,context,{filename:'ui/character-renderer.js'});
const evaluate=expression=>vm.runInContext(expression,context);
const opts=evaluate('opts'),Sim=evaluate('Simulation'),legacyLook=evaluate('appearanceFor');
const figure=context.figureSVG;
opts.athletes=athletes;opts.perks=perks;opts.profiles=new Map(athletes.map(a=>[a.id,a]));
assert.equal(athletes.length,1203);
for(const entry of athletes){
 const svg=figure(entry,{large:true});
 assert(svg.includes('<svg'),entry.id+' SVG missing');
 assert(svg.includes('aria-label='),entry.id+' missing accessible label');
 assert(!svg.includes('undefined'),entry.id+' has undefined literal');
}
const by=id=>opts.profiles.get(id);
assert.equal(legacyLook(by('lebron-james')).number,23);
assert.equal(legacyLook(by('trey-mcbride')).number,85);
assert(figure(by('lebron-james'),{large:true}).includes('23'));
assert(figure(by('trey-mcbride'),{large:true}).includes('85'));
for(const [id,feature] of [['secretariat','ll-leg-a'],['lightning-mcqueen','ll-wheel'],['shamu','ll-tail'],['the-night-king','ll-undead']]){
 assert(figure(by(id),{large:true}).includes(feature),id+' missing unique anatomy');
}
assert.equal(context.LastLegendArt.modelOf(by('mascot-college-florida-atlantic-owls-owlsley-the-owl')),'bird');
assert.equal(context.LastLegendArt.modelOf(by('mascot-college-memphis-tigers-pouncer')),'feline');
for(const size of [2,12,24,100]){
 const ids=athletes.slice(0,size).map(a=>a.id);
 const match=new Sim(ids,athletes,perks,{seed:20261023,arena:'WILDERNESS'}).run();opts.match=match;
 assert.equal(match.placements.length,size);assert.equal(match.frames.at(-1).alive.length,1);
 for(const frame of [match.frames[0],match.frames[Math.floor(match.frames.length/2)],match.frames.at(-1)]){
  const leaderboard=evaluate('leaderBoardMarkup')(frame);
  assert(leaderboard.includes('TOP 3 HEALTH'));
  assert(leaderboard.includes('TOP 3 ELIMINATIONS'));
 }
 const markup=context.championMarkup();
 assert(markup.includes('FINAL HEALTH'));
 assert(markup.includes('AFFILIATION'));
}
const featured=['lebron-james','trey-mcbride','secretariat','lightning-mcqueen','shamu','the-night-king'];
const mixed=new Sim(featured,athletes,perks,{seed:20261023,arena:'WILDERNESS'}).run();opts.match=mixed;
context.renderMap(mixed.frames.at(-1));
assert(document.getElementById('map').added.includes('ll-map-creature'),'nonhuman symbols must appear on arena map');
assert(figure(by('secretariat'),{victory:true}).includes('ll-victory'));
console.log('V6 PASS: 1203 rendered profiles, distinct nonhuman silhouettes, victory, live leaderboard, map overlays, match sizes 2/12/24/100');
