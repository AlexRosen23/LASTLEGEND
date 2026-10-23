'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'ui/choreography-v12.js'),'utf8');
const css=fs.readFileSync(path.join(root,'ui/choreography-v12.css'),'utf8');
assert(html.includes('ui/choreography-v12.js'));
assert(html.includes('ui/choreography-v12.css'));
for(const mode of ['sprint','dodge','vault','pivot','slide','impact','sport','creature'])
 assert(css.includes('.v12-'+mode+' .scene-character'),mode);
for(const body of ['horse','vehicle','aquatic','mascot'])assert(css.includes('.v12-body-'+body),body);
assert(js.includes('old(e)')&&js.includes('engine.byId(e.encounterId)'));
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('V12: scenario choreography types, body variants and reduced-motion contract passed');
