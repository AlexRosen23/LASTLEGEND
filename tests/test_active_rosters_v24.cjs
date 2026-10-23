'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const athletes=JSON.parse(html.match(/<script type="application\/json" id="INLINE_ATHLETES">([\s\S]*?)<\/script>/)[1]);
const perks=JSON.parse(html.match(/<script type="application\/json" id="INLINE_PERKS">([\s\S]*?)<\/script>/)[1]);
const ctx=vm.createContext({console,Math,Date,setTimeout,clearTimeout,
 crypto:{getRandomValues(a){a[0]=2026;return a}},
 document:{readyState:'loading',addEventListener(){},querySelector(){return null},getElementById(){return {style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},innerHTML:'',value:'',addEventListener(){}}}}});
ctx.window=ctx;
vm.runInContext(fs.readFileSync(path.join(root,'ui/roster-expansion-v23.js'),'utf8'),ctx);
assert.equal(ctx.LastLegendRosterV23.install(athletes,perks).added,442);
vm.runInContext(fs.readFileSync(path.join(root,'ui/active-rosters-v24.js'),'utf8'),ctx);
const api=ctx.LastLegendActiveRostersV24,expected={NBA:[30,18],NFL:[32,59],MLB:[30,30],NHL:[32,24]};
const snapshot={version:24,generatedAt:'2026-10-23T23:00:00Z',leagues:{}};
for(const [league,[teams,playersPerTeam]] of Object.entries(expected)){
 const allTeams=[],people=[];
 for(let i=0;i<teams;i++){
  const teamId=String(i+1),team=league+' Club '+i;
  allTeams.push({id:teamId,name:team,abbr:league+String(i),rosterCount:playersPerTeam});
  for(let j=0;j<playersPerTeam;j++){
   const id=String(i*playersPerTeam+j+1);
   people.push({id,name:'Fixture '+league+' Player '+id,memberships:[{
    teamId,team,abbr:league+String(i),position:'Forward',status:j===0?'injured':'active',jersey:String(j+1),season:'2026-27',url:'https://www.espn.com/'+league.toLowerCase()+'/player/'+id
   }]});
  }
 }
 snapshot.leagues[league]={season:'2026-27',teamCount:teams,playerCount:people.length,teams:allTeams,players:people};
}
assert.equal(api.validate(snapshot),true);
const oldCount=athletes.length;
const result=api.install(athletes,perks,snapshot);
const expectedAdded=Object.values(expected).reduce((n,[teams,roster])=>n+teams*roster,0);
assert.equal(athletes.length,oldCount+expectedAdded);
assert.equal(perks.signatures.length,athletes.length);
assert.equal(Object.values(result.added).reduce((a,b)=>a+b,0),expectedAdded);
assert.equal(new Set(athletes.map(a=>a.id)).size,athletes.length);
assert.equal(new Set(perks.signatures.map(p=>p.athlete_id)).size,athletes.length);
const current=athletes.filter(a=>a.collection_tags?.includes('ACTIVE_LEAGUES_V24'));
assert.equal(current.length,expectedAdded);
for(const league of Object.keys(expected)){
 const l=current.filter(a=>a.league===league);
 assert.equal(l.length,result.added[league]);
 assert.equal(new Set(l.map(a=>a.team)).size,expected[league][0],'every team browsable');
 for(const a of l){
  assert.equal(Object.keys(a.ratings).length,20);
  assert.equal(Object.keys(a.behavior).length,5);
  assert.equal(a.secondary.length,2);
  assert(a.source_url&&a.provider_player_id&&a.verification_status.includes('NOT_OFFICIAL'));
  assert(a.data_quality.personality_is_fictional);
 }
}

// A league-wide minimum is not proof of full team-by-team inclusion.
const wrongCount=structuredClone(snapshot);
wrongCount.leagues.NBA.teams[0].rosterCount++;
assert.throws(()=>api.validate(wrongCount),/NBA roster count mismatch/);
const wrongMember=structuredClone(snapshot);
wrongMember.leagues.MLB.players[0].memberships[0].teamId='2';
wrongMember.leagues.MLB.players[0].memberships[0].team=wrongMember.leagues.MLB.teams[1].name;
wrongMember.leagues.MLB.players[0].memberships[0].abbr=wrongMember.leagues.MLB.teams[1].abbr;
assert.throws(()=>api.validate(wrongMember),/MLB roster count mismatch/);
const duplicatedMember=structuredClone(snapshot);
duplicatedMember.leagues.NHL.players[0].memberships.push({...duplicatedMember.leagues.NHL.players[0].memberships[0]});
assert.throws(()=>api.validate(duplicatedMember),/NHL duplicated team membership/);
const forgedTotal=structuredClone(snapshot);
forgedTotal.leagues.NFL.playerCount--;
assert.throws(()=>api.validate(forgedTotal),/NFL incomplete league source/);
const badAffiliation=structuredClone(snapshot);
badAffiliation.leagues.NBA.players[0].memberships[0].team='Another Club';
assert.throws(()=>api.validate(badAffiliation),/NBA invalid membership details/);
// Any failed game mapping must leave both arrays untouched (no partial player import).
const rollbackAthletes=athletes.slice(0,oldCount);
const rollbackPerks={signatures:[]};
assert.throws(()=>api.install(rollbackAthletes,rollbackPerks,snapshot),/Missing archetype signature/);
assert.equal(rollbackAthletes.length,oldCount);
assert.equal(rollbackPerks.signatures.length,0);

assert.throws(()=>api.validate({...snapshot,leagues:{...snapshot.leagues,NFL:{...snapshot.leagues.NFL,teamCount:31}}}),/NFL incomplete/);
assert.throws(()=>api.validate({...snapshot,leagues:{...snapshot.leagues,NBA:{...snapshot.leagues.NBA,players:[]}}}),/NBA incomplete/);
assert(html.includes('await window.LastLegendActiveRostersV24?.load()'));
assert(html.includes('window.LastLegendActiveRostersV24.install(a,p,leagueData)'));
assert(html.indexOf('<script src="ui/active-rosters-v24.js">')<html.indexOf('<script>/** LAST LEGEND'));
const main=html.match(/<script>([\s\S]*?)<\/script>\s*<script src="ui\/character-renderer.js">/);
vm.runInContext(main[1].replace(/\ninit\(\);\s*$/,''),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/survival-ai-v21.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'ui/pathfinding-v22.js'),'utf8'),ctx);
const Simulation=vm.runInContext('Simulation',ctx),ids=current.filter(a=>['NBA','NFL','MLB','NHL'].includes(a.league)).slice(0,12).map(a=>a.id);
const m=new Simulation(ids,athletes,perks,{seed:20261023,arena:'CITY'}).run();
assert.equal(m.placements.length,12);assert.equal(m.frames.at(-1).alive.length,1);
console.log('V24 ACTIVE BIG FOUR PASS: validated all 124 franchise IDs + per-team completeness + rollback; '+expectedAdded+' synthetic active/injured membership records, 20 stats, 5 traits, 1 signature + 2 secondaries, zero ID conflicts, authentic match engine');
