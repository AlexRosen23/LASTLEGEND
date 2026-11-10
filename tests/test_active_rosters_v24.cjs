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
const gamePositions={NBA:['Guard','point_guard'],NFL:['Quarterback','quarterback'],MLB:['Starting Pitcher','baseball_pitcher'],NHL:['Goaltender','hockey_goalie']};
for(const [league,[name,role]] of Object.entries(gamePositions))assert.equal(api.roleFor(league,name),role);
for(const [league,position,role] of [
 ['NBA','Center','center'],['NBA','Forward','wing'],
 ['NFL','Defensive Tackle','defender'],['NFL','Offensive Tackle','lineman'],
 ['NFL','Linebacker','defender'],['NFL','Wide Receiver','receiver'],
 ['NFL','Running Back','running_back'],['NFL','Guard','lineman'],
 ['MLB','Relief Pitcher','baseball_pitcher'],['MLB','First Baseman','baseball_power'],
 ['MLB','Third Baseman','baseball_power'],['MLB','Shortstop','baseball_speed'],
 ['NHL','Defense','hockey_defender'],['NHL','Left Wing','hockey_forward']
])assert.equal(api.roleFor(league,position),role,`${league} ${position} expected ${role}`);
const snapshot={version:24,generatedAt:'2026-10-23T23:00:00Z',leagues:{}};
for(const [league,[teams,playersPerTeam]] of Object.entries(expected)){
 const allTeams=[],people=[];
 for(let i=0;i<teams;i++){
  const teamId=String(i+1),team=league+' Club '+i;
  allTeams.push({id:teamId,name:team,abbr:league+String(i),rosterCount:playersPerTeam});
  for(let j=0;j<playersPerTeam;j++){
   const id=String(i*playersPerTeam+j+1);
   people.push({id,name:'Fixture '+league+' Player '+id,memberships:[{
    teamId,team,abbr:league+String(i),position:gamePositions[league][0],status:j===0?'injured':'active',jersey:String(j+1),heightInches:72,weightLbs:215,season:'2026-27',url:'https://www.espn.com/'+league.toLowerCase()+'/player/'+id
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
  assert.equal(a.role,gamePositions[league][1]);
  assert.equal(a.roster_position_role,gamePositions[league][1]);
  assert.equal(a.heightInches,72);
  assert.equal(a.weightLbs,215);
  assert(a.source_url&&a.provider_player_id&&a.verification_status.includes('NOT_OFFICIAL'));
  assert(a.data_quality.personality_is_fictional);
 }
}

const impossibleHeight=structuredClone(snapshot);
impossibleHeight.leagues.NBA.players[0].memberships[0].heightInches=999;
assert.throws(()=>api.validate(impossibleHeight),/NBA invalid physical measurement/);
const impossibleWeight=structuredClone(snapshot);
impossibleWeight.leagues.NHL.players[0].memberships[0].weightLbs=-10;
assert.throws(()=>api.validate(impossibleWeight),/NHL invalid physical measurement/);
const missingPhysicals=structuredClone(snapshot);
missingPhysicals.leagues.MLB.players[0].memberships[0].heightInches=null;
missingPhysicals.leagues.MLB.players[0].memberships[0].weightLbs=null;
assert.equal(api.validate(missingPhysicals),true);

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

// MLB off-season rosters (regression: every snapshot was rejected from 2026-11-04 because the
// browser kept the in-season 26-player floor after the sync started publishing off-season lists).
// Mirrors tools/sync_active_rosters_v24.py: Oct 20 - Feb 18, team floor 15, at most 4 clubs under 26,
// league median >= 26. Other leagues and in-season MLB keep the strict floor.
function withTeamSizes(base,league,sizes,generatedAt){
 const copy=structuredClone(base);copy.generatedAt=generatedAt;
 const source=copy.leagues[league],players=[];
 source.teams.forEach((team,i)=>{
  const size=sizes[i]??team.rosterCount;
  const members=source.players.filter(p=>p.memberships[0].teamId===team.id);
  while(members.length<size){
   const id=league+'-extra-'+team.id+'-'+members.length;
   members.push({...structuredClone(members[0]),id,name:'Fixture '+id});
  }
  team.rosterCount=size;players.push(...members.slice(0,size));
 });
 source.players=players;source.playerCount=players.length;
 return copy;
}
const mlbSizes=(short)=>Array.from({length:30},(_,i)=>i<short.length?short[i]:38);
const offseasonDay='2026-11-09T21:27:02Z',inSeasonDay='2026-07-15T11:19:00Z';
// The live 2026-11-09 shape: Milwaukee at 20 (World Series 26-man list minus six free agents).
assert.equal(api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([20]),offseasonDay)),true);
assert.equal(api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([20,15,25,22]),offseasonDay)),true);
for(const day of ['2026-10-20T00:00:00Z','2026-12-31T23:59:59Z','2027-01-15T12:00:00Z','2027-02-18T23:59:59Z'])
 assert.equal(api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([20]),day)),true,day);
// The same list is still malformed in season, including either side of the window.
for(const day of [inSeasonDay,'2026-10-19T23:59:59Z','2027-02-19T00:00:00Z','2026-04-01T12:00:00Z'])
 assert.throws(()=>api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([20]),day)),/MLB invalid team roster declaration/,day);
assert.equal(api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([26]),inSeasonDay)),true);
// Off-season still rejects a collapsed club feed, a widespread shrink and a league-wide short list.
for(const size of [0,3,14])
 assert.throws(()=>api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([size]),offseasonDay)),/MLB invalid team roster declaration/,String(size));
assert.throws(()=>api.validate(withTeamSizes(snapshot,'MLB',mlbSizes([20,20,20,20,20]),offseasonDay)),/MLB too many short off-season team rosters/);
assert.throws(()=>api.validate(withTeamSizes(snapshot,'MLB',Array.from({length:30},(_,i)=>i<12?40:22),offseasonDay)),/MLB too many short off-season team rosters/);
const lowMedian=withTeamSizes(snapshot,'MLB',Array.from({length:30},(_,i)=>i<4?20:26),offseasonDay);
assert.equal(api.validate(lowMedian),true,'median exactly 26 is fine');
assert.equal(api.offseasonRules('MLB','2026-11-09T21:27:02Z')?.teamFloor,15);
assert.equal(api.offseasonRules('MLB','2026-07-15T00:00:00Z'),null);
// A malformed or missing timestamp never unlocks the off-season floor.
assert.equal(api.offseasonRules('MLB','not a date'),null);
// No relaxation for the other leagues, even inside the MLB window.
for(const [league,shortSize] of [['NBA',11],['NFL',25],['NHL',11]]){
 assert.equal(api.offseasonRules(league,offseasonDay),null,league);
 assert.throws(()=>api.validate(withTeamSizes(snapshot,league,[shortSize],offseasonDay)),new RegExp(league+' invalid team roster declaration'),league);
}
// Declared counts must still match the listed players for a short off-season club.
const shortMismatch=withTeamSizes(snapshot,'MLB',mlbSizes([20]),offseasonDay);
shortMismatch.leagues.MLB.teams[0].rosterCount=21;
assert.throws(()=>api.validate(shortMismatch),/MLB roster count mismatch/);
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
