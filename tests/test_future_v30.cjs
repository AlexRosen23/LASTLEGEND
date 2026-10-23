'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const modules=['rosters-v18','abilities-v19','cinema-v20','worlds-v21','eras-v22','tournaments-v23','daily-v24','replay-v25','rival-ai-v26','creator-v27','data-v28','broadcast-v29','polish-v30'];
for(const name of modules){const file=path.join(root,'ui',name+'.js'),js=fs.readFileSync(file,'utf8');
 assert(html.includes('src="ui/'+name+'.js"'),name+' not loaded');
 assert.doesNotThrow(()=>new vm.Script(js,{filename:name+'.js'}),name+' syntax');}
for(const name of ['v18-v22','v23-v25','v26-v28','v29-v30'])assert(html.includes('ui/future-'+name+'.css'));
assert(html.includes('advancedAI:!!document.getElementById'));
assert(html.includes('this.rivalries=new Map()'));
assert(html.includes('id="victory-home"'));
console.log('V18–V30: module syntax, boot references, AI opt-in and V17 continuity passed');
