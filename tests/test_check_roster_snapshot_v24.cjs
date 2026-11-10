'use strict';
// tools/check_roster_snapshot_v24.cjs must accept what the browser accepts and fail (exit 1) otherwise,
// so roster-sync-v24.yml can't publish a snapshot the live site would reject.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const tool=path.join(__dirname,'..','tools','check_roster_snapshot_v24.cjs');
const leagues={NBA:[30,18],NFL:[32,59],MLB:[30,30],NHL:[32,24]};
function snapshot(generatedAt,mlbShort={}){
 const data={version:24,generatedAt,leagues:{}};
 let next=1;
 for(const [code,[teamCount,perTeam]] of Object.entries(leagues)){
  const teams=[],players=[];
  for(let i=0;i<teamCount;i++){
   const size=code==='MLB'&&mlbShort[i]!=null?mlbShort[i]:perTeam,name=code+' Club '+i,id=String(i+1);
   teams.push({id,name,abbr:code+i,rosterCount:size});
   for(let j=0;j<size;j++){const pid=String(next++);players.push({id:pid,name:'Player '+pid,memberships:[{teamId:id,team:name,abbr:code+i,position:'Guard',status:'active'}]});}
  }
  data.leagues[code]={teamCount,playerCount:players.length,teams,players};
 }
 return data;
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ll-snapshot-'));
function run(data){
 const file=path.join(dir,'snapshot.json');fs.writeFileSync(file,JSON.stringify(data));
 return spawnSync(process.execPath,[tool,file],{encoding:'utf8'});
}
try{
 let r=run(snapshot('2026-07-01T12:00:00Z'));
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/browser validator accepts/);
 // Off-season (the 2026-11-04 shape: one MLB club at 20) is accepted, as on the live site after #28.
 r=run(snapshot('2026-11-09T21:27:02Z',{3:20}));
 assert.equal(r.status,0,r.stderr);
 // The same short club in season is rejected with the browser's own message.
 r=run(snapshot('2026-07-01T12:00:00Z',{3:20}));
 assert.equal(r.status,1);assert.match(r.stderr,/::error::.*MLB invalid team roster declaration/);
 // A declared count that doesn't match the listed players is rejected.
 const bad=snapshot('2026-07-01T12:00:00Z');bad.leagues.NHL.teams[0].rosterCount+=1;
 r=run(bad);assert.equal(r.status,1);assert.match(r.stderr,/NHL roster count mismatch/);
 // Unreadable input fails too.
 fs.writeFileSync(path.join(dir,'broken.json'),'{');
 r=spawnSync(process.execPath,[tool,path.join(dir,'broken.json')],{encoding:'utf8'});
 assert.equal(r.status,1);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('SNAPSHOT CHECK PASS: browser validator gate accepts in-season and off-season snapshots, rejects what the site would reject');
