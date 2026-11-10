#!/usr/bin/env node
'use strict';
// Run a roster snapshot through the browser's own validator (ui/active-rosters-v24.js) before it is
// published. The Python sync and the browser each have their own rules; from 2026-11-04 to 11-10 the
// sync published snapshots the browser rejected, and the live site fell back to its built-in library.
// Usage: node tools/check_roster_snapshot_v24.cjs data/active_rosters_v24.json
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const file=process.argv[2];
if(!file){console.error('usage: node tools/check_roster_snapshot_v24.cjs <snapshot.json>');process.exit(2);}
const stub={style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},innerHTML:'',value:'',addEventListener(){}};
const ctx=vm.createContext({console,Math,Date,setTimeout,clearTimeout,
 document:{readyState:'loading',addEventListener(){},querySelector(){return null},getElementById(){return stub}}});
ctx.window=ctx;
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','ui','active-rosters-v24.js'),'utf8'),ctx);
let data;
try{data=JSON.parse(fs.readFileSync(file,'utf8'));}
catch(e){console.error('::error::cannot read snapshot '+file+': '+e.message);process.exit(1);}
try{ctx.LastLegendActiveRostersV24.validate(data);}
catch(e){console.error('::error::the browser validator rejects '+file+': '+e.message);process.exit(1);}
const counts=Object.entries(data.leagues).map(([code,l])=>code+' '+l.playerCount).join(', ');
console.log('browser validator accepts '+file+' ('+data.generatedAt+'; '+counts+')');
