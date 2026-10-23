"""Add 100 NBA and 100 NFL current-roster members based on Oct 2026 roster reports.
Names/roster only sourced; attribute values fictional deterministic archetypes. All numbers hidden.
"""
import json,csv,re,unicodedata,hashlib,copy,collections
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
P=Path(__file__).resolve().parent
ROOT=P.parent if (P.parent/'data'/'athletes_500.json').exists() else P
DATA=P if (P/'athletes_500.json').exists() else ROOT/'data'
s=spec_from_file_location('roles',ROOT/'generate_roster.py' if (ROOT/'generate_roster.py').exists() else P/'generate_roster_orig.py');rules=module_from_spec(s);s.loader.exec_module(rules)
NBA='''Dyson Daniels|Jock Landale|Josh Giddey|Tyrese Proctor|Kyrie Irving|Johnny Furphy|Rocco Zikarsky|Ben Simmons|Josh Green|Jakob Poeltl|Buddy Hield|VJ Edgecombe|Deandre Ayton|Ajay Mitchell|Toumani Camara|Jusuf Nurkić|Gui Santos|Pascal Siakam|Yves Missi|Joel Embiid|Nickeil Alexander-Walker|Luguentz Dort|Leonard Miller|Jamal Murray|Ryan Nembhard|Andrew Nembhard|Zach Edey|Olivier-Maxence Prosper|Andrew Wiggins|Trey Lyles|Bennedict Mathurin|Shai Gilgeous-Alexander|Dillon Brooks|Shaedon Sharpe|RJ Barrett|Will Riley|Yang Hansen|Mario Hezonja|Ivica Zubac|Karlo Matković|Vít Krejčí|Oscar Tshiebwe|Jonathan Kuminga|Al Horford|David Jones Garcia|Henri Veesaar|Lauri Markkanen|Nolan Traoré|Moussa Diabaté|Tidjane Salaün|Noa Essengue|Zaccharie Risacher|Ousmane Dieng|Joan Beringer|Rudy Gobert|Pacôme Dadiet|Mohamed Diawara|Noah Penda|Rayan Rupert|Sidy Cissoko|Maxime Raynaud|Victor Wembanyama|Bilal Coulibaly|Alex Sarr|Sandro Mamukelashvili|Goga Bitadze|Moritz Wagner|Dennis Schröder|Hannes Steinbach|Isaiah Hartenstein|Tristan da Silva|Franz Wagner|Ariel Hukporti|Giannis Antetokounmpo|Moussa Cissé|Ben Saraf|Deni Avdija|Simone Fontecchio|Nick Richards|Rui Hachimura|Kristaps Porziņģis|Kasparas Jakučionis|Domantas Sabonis|Karim López|Nikola Vučević|Tristan Enaruna|Malevy Leons|Quinten Post|Steven Adams|Ugonna Onyenso|Charles Bassey|Adem Bona|Precious Achiuwa|Josh Okogie|Felix Okpara|Neemias Queta|Egor Dёmin|Vladislav Goldin|Mouhamed Gueye|Khalifa Diop|Tacko Fall|Nikola Jokić|Bogdan Bogdanović|Nikola Jović|Bogoljub Marković|Nikola Topić|Tristan Vukčević|Luka Dončić|Khaman Maluach|Duop Reath|Hugo González|Santi Aldama|Sergio De Larrea|Baba Miller|Aday Mara|Pelle Larsson|Clint Capela|Yanic Konan Niederhäuser|Kyshawn George|Tarik Biberović|Alperen Sengun|Svi Mykhailiuk|Amari Williams|Tobi Lawal|OG Anunoby'''.split('|')
NFL='''Cardinals|Jacoby Brissett|Tyler Allgeier|Michael Wilson|Trey McBride|Josh Sweat|Jack Gibbens|Denzel Burke|Roy Lopez
Falcons|Michael Penix Jr.|Bijan Robinson|Drake London|Kyle Pitts Sr.|Maason Smith|Josh Woods|Mike Hughes|Xavier Watts
Ravens|Tyler Huntley|Derrick Henry|Zay Flowers|Mark Andrews|Nnamdi Madubuike|Roquan Smith|Nate Wiggins|Travis Jones
Bills|Josh Allen|James Cook III|Khalil Shakir|Dalton Kincaid|T.J. Sanders|Greg Rousseau|Christian Benford|Deone Walker
Panthers|Bryce Young|Chuba Hubbard|Tetairoa McMillan|Tommy Tremble|Derrick Brown|Patrick Jones II|Akayleb Evans|Lee Hunter
Bears|Caleb Williams|D'Andre Swift|Rome Odunze|Colston Loveland|Austin Booker|Devin Bush|Jaylon Johnson|Grady Jarrett
Bengals|Joe Burrow|Chase Brown|Ja'Marr Chase|Mike Gesicki|Boye Mafe|Demetrius Knight Jr.|Tacario Davis|Dexter Lawrence II
Browns|Deshaun Watson|Michael Burton|Jerry Jeudy|Harold Fannin Jr.|Isaiah McGuire|Easton Mascarenas-Arnold|Denzel Ward|Maliek Collins
Cowboys|Dak Prescott|Javonte Williams|CeeDee Lamb|Jake Ferguson|Quinnen Williams|Rashan Gary|Joey Porter Jr.|Otito Ogbonnia
Broncos|Bo Nix|J.K. Dobbins|Courtland Sutton|Evan Engram|Zach Allen|Alex Singleton|Riley Moss|D.J. Jones
Lions|Jared Goff|Jahmyr Gibbs|Amon-Ra St. Brown|Sam LaPorta|Aidan Hutchinson|Derrick Barnes|D.J. Reed|Alim McNeill
Packers|Jordan Love|Josh Jacobs|J. Michael Sturdivant|Tucker Kraft|Karl Brooks|Ty'Ron Hopper|Keisean Nixon|Chris McClellan
Texans|C.J. Stroud|Woody Marks|Nico Collins|Foster Moreau|Will Anderson Jr.|Jake Hansen|Derek Stingley Jr.|Tommy Togiai
Colts|Daniel Jones|Jonathan Taylor|Josh Downs|Will Mallory|Jaylahn Tuimoloau|Jaylon Carlies|Charvarius Ward|Grover Stewart
Jaguars|Trevor Lawrence|Bhayshul Tuten|Parker Washington|Brenton Strange|Travon Walker|Foyesade Oluokun|Travis Hunter|Arik Armstead
Chiefs|Patrick Mahomes|Kenneth Walker III|Xavier Worthy|Noah Gray|George Karlaftis|Drue Tranquill|Nohl Williams|Chris Jones
Raiders|Kirk Cousins|Ashton Jeanty|Tre Tucker|Brock Bowers|Jonah Laulu|Maxx Crosby|Eric Stokes|Adam Butler
Chargers|Justin Herbert|Omarion Hampton|Quentin Johnston|Charlie Kolar|Teair Tart|Tuli Tuipulotu|Cam Hart|Jamaree Caldwell
Rams|Matthew Stafford|Kyren Williams|Konata Mumpfield|Tyler Higbee|Braden Fiske|Byron Young|Jaylen Watson|Ty Hamilton
Dolphins|Malik Willis|Ollie Gordon II|Malik Washington|Greg Dulcich|Chop Robinson|Jordyn Brooks|Jason Marshall Jr.|Zach Sieler
Vikings|Kyler Murray|Aaron Jones Sr.|Justin Jefferson|Gavin Bartholomew|Levi Drake Rodriguez|Andrew Van Ginkel|Isaiah Rodgers|Caleb Banks
Patriots|Drake Maye|Rhamondre Stevenson|A.J. Brown|Hunter Henry|Christian Barmore|Elijah Ponder|Christian Gonzalez|Cory Durden
Saints|Tyler Shough|Kendre Miller|Chris Olave|Juwan Johnson|Cameron Jordan|Carl Granderson|Kool-Aid McKinstry|Nathan Shepherd
Giants|J.J. McCarthy|Cam Skattebo|Malik Nabers|Isaiah Likely|Shelby Harris|Kayvon Thibodeaux|Deonte Banks|DJ Reader
Jets|Geno Smith|Braelon Allen|Garrett Wilson|Mason Taylor|David Bailey|Demario Davis|Azareye'h Thomas|Harrison Phillips
Eagles|Tanner McKee|Dameon Pierce|Makai Lemon|Johnny Mundt|Jalen Carter|Zack Baun|Riq Woolen|Jordan Davis
Steelers|Aaron Rodgers|Jaylen Warren|DK Metcalf|Darnell Washington|Yahya Black|Payton Wilson|Asante Samuel Jr.|Keeanu Benton
Seahawks|Sam Darnold|Emanuel Wilson|Jaxon Smith-Njigba|AJ Barner|Leonard Williams|Ernest Jones IV|Devon Witherspoon|Byron Murphy II
Buccaneers|Jalon Daniels|Kenny Gainwell|Chris Godwin Jr.|Cade Otton|Calijah Kancey|Rueben Bain Jr.|Benjamin Morrison|Vita Vea
Titans|Cam Ward|Tony Pollard|Carnell Tate|Gunnar Helm|John Franklin-Myers|Cedric Gray|Cor'Dale Flott|Jeffery Simmons
Commanders|Jayden Daniels|Rachaad White|Stefon Diggs|Tim Settle|Odafe Oweh|Rasul Douglas|Daron Payne|Jeremy Reaves'''.splitlines()
# Type by depth chart position index. Entries were reviewed against the source team sections as of Oct 23.
NFL_POSITIONS=['quarterback','running_back','wide_receiver','tight_end','defensive_tackle','linebacker','cornerback','defensive_tackle']
slug=lambda s:re.sub('-+','-',re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())).strip('-')
original=json.loads((DATA/'athletes_500.json').read_text())['athletes'];oldperks=json.loads((DATA/'signature_perks_500.json').read_text())['perks']
assert len(original)==len(oldperks)==500
seen=set(slug(x['display_name']) for x in original);a_list=copy.deepcopy(original);perks=copy.deepcopy(oldperks);selected=[]
# Order NBA recognizable current players first while confirming all are on official roster listing.
priorities=['Alperen Sengun','Jamal Murray','Pascal Siakam','Bennedict Mathurin','Andrew Wiggins','Lauri Markkanen','Rudy Gobert','Franz Wagner','Kristaps Porziņģis','Domantas Sabonis','Deni Avdija','OG Anunoby','Josh Giddey','RJ Barrett','Ivica Zubac','Jonathan Kuminga','Dyson Daniels','Zach Edey','Alex Sarr','VJ Edgecombe','Jusuf Nurkić','Luguentz Dort','Andrew Nembhard','Nickeil Alexander-Walker','Shaedon Sharpe','Deandre Ayton','Buddy Hield','Ben Simmons','Dillon Brooks','Trey Lyles','Clint Capela','Isaiah Hartenstein','Goga Bitadze','Rui Hachimura','Bogdan Bogdanović','Nikola Jović','Santi Aldama','Al Horford','Nick Richards','Tyrese Proctor']
source_nba=[' '.join(x.replace('*','').split()) for x in NBA if x and x not in ('---','Name')]
# Only choose NBA roster-confirmed names, never inferred.
unique_nba=list(dict.fromkeys(source_nba));assert len(unique_nba)>=120,len(unique_nba)
priorities=[x for x in priorities if x in unique_nba]
chosen_nba=[]
for n in priorities+unique_nba:
 if slug(n) not in seen:
  seen.add(slug(n));chosen_nba.append(n)
  if len(chosen_nba)==100:break
assert len(chosen_nba)==100,(len(chosen_nba),chosen_nba)
# NFL: representative sample across all 31 cited teams; 1st-to-4th starters then defenders.
parse=[]
for line in NFL:
 parts=line.split('|');team=parts[0]
 for idx,n in enumerate(parts[1:]):parse.append((team,n,NFL_POSITIONS[min(idx,7)]))
chosen_nfl=[]
for rank in range(8):
 for team,n,role in parse:
  if not any(n==entry[1] and team==entry[0] for entry in []):pass
  index=next((i for i,x in enumerate([p for p in NFL if p.startswith(team+'|')][0].split('|')[1:]) if x==n),-1)
  if index!=rank or slug(n) in seen:continue
  seen.add(slug(n));chosen_nfl.append((team,n,role))
  if len(chosen_nfl)==100:break
 if len(chosen_nfl)==100:break
assert len(chosen_nfl)==100,(len(chosen_nfl),chosen_nfl)

def create(sp,name,role,team,src):
 sid=slug(name);ratings=dict(zip(rules.FIELDS,rules.BASE[sp]));derived=rules.ROLES.get(role,{})
 for k,v in derived.items():ratings[k]+=v
 ratings={f:rules.clamp(v+rules.deterministic_jitter(sid,f)) for f,v in ratings.items()}
 # Default sport model but positional specialization for NFL.
 if sp=='American Football':
  adjust={
   'quarterback':{'tactical_iq':8,'composure':5,'leadership':5},
   'running_back':{'acceleration':9,'agility':8,'endurance':5},
   'wide_receiver':{'top_speed':10,'acceleration':7,'coordination':7},
   'tight_end':{'strength':10,'durability':7,'coordination':5},
   'linebacker':{'strength':8,'awareness':7,'combat_defense':7},
   'cornerback':{'agility':8,'reflexes':9,'awareness':6},
   'defensive_tackle':{'strength':10,'durability':8,'grappling':8}
  }.get(role,{})
  for f,v in adjust.items():ratings[f]=rules.clamp(ratings[f]+v)
 role_for_perk=role if role in rules.STYLE else ('quarterback' if role=='quarterback' else 'receiver' if role in ('wide_receiver','cornerback') else 'defender' if role in ('linebacker','defensive_tackle') else 'running_back')
 perk_name,trigger,bonus,stat=rules.STYLE[role_for_perk]
 key='SIGNATURE_'+sid.upper().replace('-','_')
 behaviors={k:max(0,min(100,round(v+rules.deterministic_jitter(sid,k,7)))) for k,v in {'aggression':55,'caution':58,'alliance_drive':58,'loyalty':62,'opportunism':65}.items()}
 if role=='quarterback':behaviors['alliance_drive']=min(95,behaviors['alliance_drive']+14)
 a={'id':sid,'display_name':name,'sport':sp,'sport_role':role,'appearance':{'edition_label':f'2026 active roster · {team}','outfit_type':'basketball_jersey' if sp=='Basketball' else 'football_jersey','candidate_number':None,'display_number':None,'number_kind':'jersey','verification_status':'ROSTER_CONFIRMED_JERSEY_UNVERIFIED','verification_sources':[src]},'ratings':ratings,'fictional_behavior':behaviors,'signature_perk':key,'secondary_perks':rules.SECONDARY.get(role_for_perk,[])[:], 'data_quality':{'ratings_are_provisional':True,'ratings_method':'position_archetype_deterministic_variation','ratings_historical_verification':'NOT_VERIFIED','personality_is_fictional':True,'appearance_number_verified':False,'licensing_reviewed':False,'roster_source':src,'source_links':[src]},'description':f'2026 roster-listed athlete. Fictional {role.replace("_"," ")} archetype, not a factual behavioral prediction.'}
 perk={'id':key,'athlete_id':sid,'name':f'{name.split()[-1]}: {perk_name}','trigger':trigger,'bonus':bonus,'target_stat':stat,'stamina_cost':3 if bonus<=7 else 6,'activation_limit':'once_per_encounter' if trigger in ('open_sprint','first_contact','contact_defense','contested_supply','urban_evasion','group_coordination','under_pressure') else 'once_per_match','source':'gameplay_design_provisional','description':f'Fictional sport-inspired ability: {trigger.replace("_"," ")} confers +{bonus} {stat} bonus at stamina cost.','validated_against_athlete_biography':False}
 a_list.append(a);perks.append(perk)

nba_source='https://www.nba.com/news/2026-27-international-players-opening-night'
nfl_source='https://www.profootballnetwork.com/nfl-hq/depth-charts'
for n in chosen_nba:create('Basketball',n, 'point_guard' if n in ('Jamal Murray','Josh Giddey','Andrew Nembhard','VJ Edgecombe','Dyson Daniels','Ben Simmons','Dennis Schröder') else 'center' if n in ('Rudy Gobert','Zach Edey','Alex Sarr','Ivica Zubac','Deandre Ayton','Clint Capela','Goga Bitadze','Jusuf Nurkić','Isaiah Hartenstein') else 'wing', '2026–27 NBA',nba_source)
for t,n,r in chosen_nfl:create('American Football',n,r,t,nfl_source)
assert len(a_list)==700 and len(perks)==700
assert len({x['id'] for x in a_list})==700
assert len({x['athlete_id'] for x in perks})==700
(DATA/'athletes_700.json').write_text(json.dumps({'version':'0.4.0','count':700,'verification_notice':'2026 roster-listed names from cited sources; all ratings and personalities are unverified fictional estimates. Jersey numbers unverified and hidden.','athletes':a_list},indent=2,ensure_ascii=False)+'\n')
(DATA/'signature_perks_700.json').write_text(json.dumps({'version':'0.4.0','count':700,'perks':perks},indent=2,ensure_ascii=False)+'\n')
with (DATA/'athletes_700_summary.csv').open('w',newline='',encoding='utf8') as f:
 w=csv.DictWriter(f,fieldnames=['id','name','sport','role','edition','signature_perk','source']+rules.FIELDS);w.writeheader()
 for a in a_list:w.writerow({'id':a['id'],'name':a['display_name'],'sport':a['sport'],'role':a['sport_role'],'edition':a['appearance']['edition_label'],'signature_perk':a['signature_perk'],'source':a['data_quality'].get('roster_source',''),'strength':a['ratings']['strength'],**a['ratings']})
(DATA/'current_roster_provenance.json').write_text(json.dumps({'as_of':'2026-10-23','nba_source':nba_source,'nfl_source':nfl_source,'nba_names':chosen_nba,'nfl_players':[{'name':n,'team':t,'position_archetype':r} for t,n,r in chosen_nfl],'new_nba':100,'new_nfl':100,'previous':500,'total':700,'numbers_verified':False,'ratings_provisional':True},indent=2,ensure_ascii=False)+'\n')
print('TOTAL',len(a_list),'NBA',len(chosen_nba),'NFL',len(chosen_nfl))
print('NBA',','.join(chosen_nba))
print('NFL',','.join(n for _,n,_ in chosen_nfl))
