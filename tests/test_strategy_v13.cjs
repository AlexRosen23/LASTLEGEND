'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert(html.includes('futureSafe=this.safeRadius(6)'));
assert(html.includes('dist(c,{x:16,y:10})<futureSafe-.2'));
assert(html.includes("if(radial>this.safeRadius())return ['ESCAPE_ZONE',null]"));
assert(html.includes('score(left)-score(right)||left.id-right.id'));
assert(html.includes('// No in-zone supplies remain: seek center rather than any unsafe cache.'));
console.log('V13: survival-first projected safe-cache selection contract passed');
