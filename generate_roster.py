"""Build the deliberately *provisional* 252-athlete roster for Last Legend.
Always keep generated ratings visibly labeled as designer estimates, not empirical facts.
No network, external API, or runtime randomness required.
"""
from __future__ import annotations
from pathlib import Path
import json, csv, hashlib, re, copy

ROOT=Path(__file__).parent
SOURCE=ROOT/'source_v0_1'
ORIG=json.loads((SOURCE/'roster_250_candidate_index.json').read_text())
PROTO={x['id']:x for x in json.loads((SOURCE/'prototype_12_athletes.json').read_text())['athletes']}
FIELDS=['strength','acceleration','top_speed','agility','endurance','durability','reflexes','coordination','balance','recovery','striking','grappling','combat_defense','tactical_iq','awareness','composure','adaptability','resourcefulness','leadership','clutch']
BFIELDS=['aggression','caution','alliance_drive','loyalty','opportunism']
# Explicit baselines for 16 sports; source = game design, not real-world quantified evidence.
BASE={
'Basketball':[78,79,77,82,80,78,85,88,84,79,40,36,38,82,85,83,80,60,76,83],
'American Football':[84,76,75,77,75,86,81,81,74,78,47,43,48,80,81,80,75,60,78,80],
'Association Football':[68,84,85,91,91,77,88,95,94,85,32,30,33,83,88,82,87,62,74,81],
'Baseball':[79,72,73,76,72,80,91,91,82,75,41,33,39,80,85,84,74,63,71,85],
'Ice Hockey':[82,78,76,87,87,85,84,90,91,81,45,42,45,85,88,83,82,58,78,83],
'Boxing & MMA':[89,82,77,89,89,92,91,90,91,84,91,78,91,86,88,90,86,58,72,88],
'Track & Field':[79,89,89,78,80,75,84,89,84,87,35,30,35,73,75,85,79,57,60,83],
'Swimming':[76,76,73,80,95,79,86,92,91,88,34,30,33,79,82,87,81,60,66,86],
'Tennis':[75,82,80,93,89,78,95,95,91,85,36,32,37,88,93,92,90,68,73,91],
'Gymnastics':[77,89,83,97,86,82,93,99,100,90,32,31,34,82,87,91,93,61,69,88],
'Golf':[65,65,63,74,75,77,91,97,93,78,29,28,32,91,92,98,90,78,78,94],
'Cycling':[78,78,77,78,100,86,80,88,85,96,32,33,33,82,85,90,88,64,75,84],
'Motorsport':[71,79,75,88,86,90,100,96,86,89,32,29,32,98,98,97,96,71,84,94],
'Snow Sports':[81,92,91,98,89,83,92,98,100,87,34,33,36,87,89,92,91,61,68,88],
'Cricket':[72,72,71,77,79,79,91,95,89,80,35,32,33,88,93,90,88,67,83,89],
'Other Sports':[88,75,72,84,87,90,89,90,91,84,78,72,82,83,85,90,89,67,77,87]
}
# Role adjustments to stat slots for recognizable *sports competencies*.
ROLES={
'point_guard':{'strength':-7,'acceleration':5,'agility':6,'tactical_iq':8,'awareness':7,'leadership':4,'coordination':4},
'center':{'strength':11,'acceleration':-8,'top_speed':-8,'agility':-7,'balance':3,'durability':7},
'wing':{'acceleration':4,'agility':4,'reflexes':3,'coordination':4},
'quarterback':{'strength':-10,'top_speed':-11,'agility':-5,'tactical_iq':11,'awareness':8,'leadership':11},
'receiver':{'acceleration':11,'top_speed':13,'agility':10,'coordination':9,'strength':-3},
'running_back':{'strength':5,'acceleration':10,'top_speed':7,'agility':9,'endurance':4},
'lineman':{'strength':12,'durability':9,'acceleration':-9,'top_speed':-12,'agility':-10},
'defender':{'strength':6,'combat_defense':4,'awareness':7,'reflexes':5,'agility':4},
'soccer_attacker':{'acceleration':6,'top_speed':6,'agility':8,'coordination':6},
'soccer_midfielder':{'endurance':6,'tactical_iq':7,'awareness':5,'leadership':4},
'soccer_defender':{'strength':5,'combat_defense':3,'awareness':7,'endurance':4},
'soccer_keeper':{'reflexes':9,'awareness':6,'top_speed':-9,'acceleration':-5,'coordination':4},
'baseball_power':{'strength':10,'coordination':4,'top_speed':-4},
'baseball_speed':{'acceleration':9,'top_speed':10,'agility':7,'strength':-3},
'baseball_pitcher':{'coordination':7,'reflexes':4,'top_speed':-9,'endurance':2},
'hockey_forward':{'agility':4,'acceleration':4,'awareness':4,'coordination':5},
'hockey_defender':{'strength':6,'awareness':6,'combat_defense':3},
'hockey_goalie':{'reflexes':10,'awareness':7,'top_speed':-10,'coordination':5},
'boxer':{'striking':8,'grappling':-20,'combat_defense':5,'reflexes':4},
'mma_striker':{'striking':6,'grappling':0,'combat_defense':5},
'mma_grappler':{'grappling':11,'striking':-6,'combat_defense':4},
'sprinter':{'acceleration':10,'top_speed':12,'endurance':-17},
'distance_runner':{'endurance':15,'recovery':9,'top_speed':-13,'acceleration':-10},
'field_athlete':{'strength':5,'coordination':7,'balance':6},
'swimmer':{'endurance':5,'recovery':4,'coordination':4},
'cycling_endurance':{'endurance':8,'recovery':7},
'gymnast':{'balance':0,'agility':2,'coordination':0},
'golf_precision':{'coordination':2,'composure':2},
'motorsport_driver':{'reflexes':0,'tactical_iq':2},
'snow_athlete':{'balance':0,'agility':2},
'cricket_batter':{'reflexes':3,'coordination':4},
'combat_grappler':{'grappling':13,'strength':9,'striking':-13},
'other':{}
}

SETS={
'quarterback':'Tom Brady|Patrick Mahomes|Peyton Manning|Joe Montana|Aaron Rodgers|Dan Marino|Brett Favre|Lamar Jackson|Michael Vick',
'receiver':'Jerry Rice|Randy Moss|Calvin Johnson|Terrell Owens|Rob Gronkowski|Travis Kelce|Tyreek Hill',
'running_back':'Jim Brown|Walter Payton|Barry Sanders|Derrick Henry|Adrian Peterson|Bo Jackson',
'lineman':'Reggie White|J.J. Watt|Aaron Donald',
'defender':'Deion Sanders|Lawrence Taylor|Ray Lewis|Ed Reed|Troy Polamalu',
'center':"Shaquille O'Neal|Kareem Abdul-Jabbar|Wilt Chamberlain|Bill Russell|Hakeem Olajuwon|David Robinson|Nikola Jokić|Anthony Davis|Lisa Leslie",
'point_guard':'Stephen Curry|Magic Johnson|Allen Iverson|Chris Paul|Steve Nash|Russell Westbrook|Luka Dončić|Tyrese Haliburton|Oscar Robertson|Jerry West|James Harden',
'soccer_keeper':'Manuel Neuer|Gianluigi Buffon',
'soccer_defender':'Franz Beckenbauer|Paolo Maldini|Sergio Ramos|Virgil van Dijk',
'soccer_midfielder':'Zinedine Zidane|Andrés Iniesta|Xavi Hernández|Luka Modrić|Kevin De Bruyne|Johan Cruyff|Alexia Putellas|Aitana Bonmatí',
'baseball_pitcher':'Pedro Martínez|Randy Johnson|Nolan Ryan|Sandy Koufax|Mariano Rivera',
'baseball_speed':'Jackie Robinson|Rickey Henderson|Ichiro Suzuki|Willie Mays',
'baseball_power':'Babe Ruth|Hank Aaron|Barry Bonds|Ted Williams|Mickey Mantle|Ken Griffey Jr.|Alex Rodriguez|Shohei Ohtani|Mike Trout|Albert Pujols|Aaron Judge',
'hockey_goalie':'Dominik Hašek|Martin Brodeur|Carey Price',
'hockey_defender':'Bobby Orr|Nicklas Lidström',
'mma_grappler':'Khabib Nurmagomedov|Georges St-Pierre|Ronda Rousey|Jon Jones',
'mma_striker':'Conor McGregor|Anderson Silva|Amanda Nunes|Valentina Shevchenko',
'distance_runner':'Eliud Kipchoge|Haile Gebrselassie|Kenenisa Bekele|Mo Farah',
'field_athlete':'Armand Duplantis|Yulimar Rojas|Jackie Joyner-Kersee',
'combat_grappler':'Aleksandr Karelin|Hakuho Sho|Teddy Riner|Mijaín López'
}
ROLE_BY_NAME={n.strip():role for role,names in SETS.items() for n in names.split('|')}
DEFAULT_ROLES={'Basketball':'wing','American Football':'defender','Association Football':'soccer_attacker','Baseball':'baseball_power','Ice Hockey':'hockey_forward','Boxing & MMA':'boxer','Track & Field':'sprinter','Swimming':'swimmer','Tennis':'other','Gymnastics':'gymnast','Golf':'golf_precision','Cycling':'cycling_endurance','Motorsport':'motorsport_driver','Snow Sports':'snow_athlete','Cricket':'cricket_batter','Other Sports':'other'}
# Minimal hand-curated signature blueprint (the remaining signatures use recognizable skill archetypes).
SIGNATURES={
'lebron-james':('THE_FLOOR_GENERAL','The Floor General','group_coordination',7,'leadership'),
'michael-jordan':('THE_CLOSER','The Closer','late_finale',7,'clutch'),
'kobe-bryant':('MAMBA_FOCUS','Mamba Focus','under_pressure',6,'composure'),
'tom-brady':('FILM_ROOM','Film Room','after_observe',7,'tactical_iq'),
'usain-bolt':('LIGHTNING_START','Lightning Start','open_sprint',9,'acceleration'),
'mike-tyson':('EXPLOSIVE_ENTRY','Explosive Entry','first_contact',9,'striking'),
'muhammad-ali':('ROPE_A_DOPE','Rope-a-Dope','contact_defense',8,'combat_defense'),
'michael-phelps':('WATER_MASTERY','Water Mastery','water_crossing',10,'endurance'),
'lionel-messi':('TIGHT_SPACE_CONTROL','Tight-Space Control','urban_evasion',8,'agility'),
'serena-williams':('RETURN_OF_SERVE','Return of Serve','contact_defense',7,'reflexes'),
'simone-biles':('PERFECT_LANDING','Perfect Landing','obstacle',9,'balance'),
 'tyreek-hill':('CHEETAH_BURST','Cheetah Burst','open_sprint',8,'top_speed'),
 'tyrese-haliburton':('HALIBURTON_COURT_VISION','The Passing Lane','group_coordination',8,'tactical_iq'),
 'aaron-judge':('JUDGE_STRIKE_ZONE','The Towering Read','contested_supply',8,'strength'),
 'aaron-donald':('POCKET_COLLAPSE','Pocket Collapse','first_contact',8,'strength'),
 'bo-jackson':('TWO_SPORT_ENGINE','Two-Sport Engine','open_sprint',8,'acceleration'),
 'mikaela-shiffrin':('EDGE_CONTROL','Edge Control','obstacle',9,'balance'),
 'eliud-kipchoge':('MARATHON_ENGINE','Marathon Engine','long_trek',10,'endurance'),
 'alex-ovechkin':('THE_ONE_TIMER','The One-Timer','first_contact',7,'reflexes'),
 'roger-federer':('COURT_ANTICIPATION','Court Anticipation','contact_defense',7,'reflexes')
}
# all generic signatures have mechanics; not exclusive guaranteed wins
STYLE={
'point_guard':('The Open Lane','group_coordination',6,'tactical_iq'),
'center':('The Strong Anchor','contested_supply',7,'strength'),
'wing':('The Cutting Angle','urban_evasion',6,'agility'),
'quarterback':('The Pre-Snap Read','after_observe',7,'tactical_iq'),
'receiver':('The Separation Burst','open_sprint',7,'acceleration'),
'running_back':('The Broken Tackle','first_contact',7,'strength'),
'lineman':('The Iron Wall','contact_defense',7,'durability'),
'defender':('The Interception Read','contact_defense',6,'awareness'),
'soccer_attacker':('The Tight Dribble','urban_evasion',7,'agility'),
'soccer_midfielder':('The Midfield Map','group_coordination',7,'awareness'),
'soccer_defender':('The Last Line','contact_defense',7,'awareness'),
'soccer_keeper':('The Reaction Save','contact_defense',8,'reflexes'),
'baseball_power':('The Power Read','contested_supply',7,'strength'),
'baseball_speed':('The Stolen Base','open_sprint',8,'acceleration'),
'baseball_pitcher':('The Target Lock','under_pressure',7,'coordination'),
'hockey_forward':('The Fast Break','open_sprint',7,'agility'),
'hockey_defender':('The Blue-Line Stand','contact_defense',7,'strength'),
'hockey_goalie':('The Last Save','contact_defense',8,'reflexes'),
'boxer':('The Combination','first_contact',8,'striking'),
'mma_striker':('The Angle Change','first_contact',7,'striking'),
'mma_grappler':('The Mat Control','contact_defense',8,'grappling'),
'sprinter':('The Launch','open_sprint',8,'acceleration'),
'distance_runner':('The Endless Stride','long_trek',9,'endurance'),
'field_athlete':('The Perfect Arc','obstacle',8,'balance'),
'swimmer':('The Current Reader','water_crossing',9,'endurance'),
'cycling_endurance':('The Mountain Engine','long_trek',8,'endurance'),
'gymnast':('The Landing','obstacle',8,'balance'),
'golf_precision':('The Quiet Focus','under_pressure',7,'composure'),
'motorsport_driver':('The Split-Second Read','after_observe',7,'reflexes'),
'snow_athlete':('The Edge','obstacle',8,'balance'),
'cricket_batter':('The Early Read','after_observe',7,'reflexes'),
'combat_grappler':('The Lockdown','first_contact',8,'grappling'),
'other':('The Adaptation','under_pressure',6,'adaptability')
}
SECONDARY={
'point_guard':['FIELD_VISION','COMMAND_VOICE'],'center':['ANCHOR_STANCE','STRONG_GRIP'],'wing':['QUICK_FIRST_STEP','ELUSIVE'],
'quarterback':['QUICK_CALCULATION','CALM_UNDER_FIRE'],'receiver':['QUICK_FIRST_STEP','SOFT_HANDS'],'running_back':['SECOND_WIND','STRONG_GRIP'],'lineman':['ANCHOR_STANCE','STRONG_GRIP'],'defender':['BATTLE_SENSE','DEFENSIVE_READ'],
'soccer_attacker':['ELUSIVE','EFFICIENT_MOVEMENT'],'soccer_midfielder':['FIELD_VISION','ENDURANCE_ENGINE'],'soccer_defender':['DEFENSIVE_READ','DEEP_RESERVES'],'soccer_keeper':['STAY_READY','BATTLE_SENSE'],
'baseball_power':['STRONG_GRIP','SOFT_HANDS'],'baseball_speed':['QUICK_FIRST_STEP','ELUSIVE'],'baseball_pitcher':['SOFT_HANDS','FOCUS_MODE'],
'hockey_forward':['QUICK_FIRST_STEP','FIELD_VISION'],'hockey_defender':['ANCHOR_STANCE','DEFENSIVE_READ'],'hockey_goalie':['STAY_READY','BATTLE_SENSE'],
'boxer':['DEFENSIVE_READ','CALM_UNDER_FIRE'],'mma_striker':['BATTLE_SENSE','STAY_READY'],'mma_grappler':['ANCHOR_STANCE','STRONG_GRIP'],
'sprinter':['QUICK_FIRST_STEP','SECOND_WIND'],'distance_runner':['ENDURANCE_ENGINE','FAST_RECOVERY'],'field_athlete':['AERIAL_CONTROL','IRON_BALANCE'],
'swimmer':['ENDURANCE_ENGINE','FAST_RECOVERY'],'cycling_endurance':['DEEP_RESERVES','FAST_RECOVERY'],'gymnast':['AERIAL_CONTROL','IRON_BALANCE'],'golf_precision':['FOCUS_MODE','CALM_UNDER_FIRE'],'motorsport_driver':['QUICK_CALCULATION','STAY_READY'],'snow_athlete':['IRON_BALANCE','AERIAL_CONTROL'],'cricket_batter':['STAY_READY','SOFT_HANDS'],'combat_grappler':['ANCHOR_STANCE','STRONG_GRIP'],'other':['ADAPT_ON_THE_FLY','CALM_UNDER_FIRE']
}
# 25 secondary perks from v0.1 retained with formal engine semantics; all remaining ones share generic
# structured +4/5 category effect when context is matched.
SECONDARY_RULES={
'SECOND_WIND':('recover_when_low',12,'recovery'), 'FIELD_VISION':('open_sprint',4,'awareness'),
'ENDURANCE_ENGINE':('long_trek',5,'endurance'),'QUICK_FIRST_STEP':('open_sprint',5,'acceleration'),
'IRON_BALANCE':('obstacle',5,'balance'),'SOFT_HANDS':('contested_supply',5,'coordination'),
'CALM_UNDER_FIRE':('under_pressure',5,'composure'),'COMMAND_VOICE':('group_coordination',5,'leadership'),
'BATTLE_SENSE':('contact_defense',5,'awareness'),'STAY_READY':('contact_defense',4,'reflexes'),
'DEEP_RESERVES':('long_trek',5,'endurance'),'EFFICIENT_MOVEMENT':('long_trek',4,'recovery'),
'FAST_RECOVERY':('recover_when_low',7,'recovery'),'ADAPT_ON_THE_FLY':('under_pressure',4,'adaptability'),
'ANCHOR_STANCE':('contact_defense',5,'strength'),'ELUSIVE':('urban_evasion',5,'agility'),
'NAVIGATION_EYE':('after_observe',4,'awareness'),'TRUST_BUILDER':('group_coordination',5,'leadership'),
'SUPPLY_DISCIPLINE':('contested_supply',4,'resourcefulness'),'FOCUS_MODE':('under_pressure',4,'tactical_iq'),
'LATE_SURGE':('late_finale',4,'clutch'),'DEFENSIVE_READ':('contact_defense',4,'combat_defense'),
'AERIAL_CONTROL':('obstacle',5,'coordination'),'STRONG_GRIP':('contested_supply',5,'strength'),
'QUICK_CALCULATION':('after_observe',4,'tactical_iq')
}

def deterministic_jitter(identifier, field, span=3):
    digest=hashlib.sha256(f'last-legend-stats-v1|{identifier}|{field}'.encode()).digest()
    return digest[0]%(2*span+1)-span

def clamp(n):return int(max(1,min(100,n)))

orig_ids={x['id'] for x in ORIG}
assert len(ORIG)==250 and len(orig_ids)==250
# Add rather than replace; preserves original 250 candidates.
ADDITIONS=[
 {'id':'tyrese-haliburton','display_name':'Tyrese Haliburton','sport':'Basketball','draft_uniform_context':'Indiana Pacers 2024-25','uniform_type':'basketball_jersey','jersey_number':'0','number_type':'jersey_or_race','appearance_verification':'VERIFIED','rating_verification':'PROVISIONAL','perks_verification':'PROVISIONAL','rights_review':'PENDING'},
 {'id':'aaron-judge','display_name':'Aaron Judge','sport':'Baseball','draft_uniform_context':'New York Yankees 2022','uniform_type':'baseball_uniform','jersey_number':'99','number_type':'jersey_or_race','appearance_verification':'VERIFIED','rating_verification':'PROVISIONAL','perks_verification':'PROVISIONAL','rights_review':'PENDING'}
]
SOURCES={'tyrese-haliburton':['https://www.nba.com/player/1630169/tyrese-haliburton','https://www.nba.com/pacers/roster'], 'aaron-judge':['https://www.mlb.com/player/aaron-judge-592450','https://www.usabaseball.com/player/aaron-judge']}
# Individualized deliberate overrides; others use template+role+jitter.
OVERRIDES={
 'tyrese-haliburton':{'strength':65,'acceleration':80,'top_speed':77,'agility':87,'endurance':83,'durability':74,'reflexes':89,'coordination':93,'balance':83,'recovery':81,'striking':34,'grappling':30,'combat_defense':37,'tactical_iq':96,'awareness':94,'composure':90,'adaptability':91,'resourcefulness':70,'leadership':88,'clutch':90},
 'aaron-judge':{'strength':97,'acceleration':74,'top_speed':71,'agility':73,'endurance':75,'durability':89,'reflexes':89,'coordination':94,'balance':78,'recovery':81,'striking':41,'grappling':36,'combat_defense':41,'tactical_iq':85,'awareness':88,'composure':91,'adaptability':82,'resourcefulness':66,'leadership':86,'clutch':94},
 'shaquille-o-neal':{'strength':100,'top_speed':57,'agility':65},
 'stephen-curry':{'coordination':99,'awareness':96,'strength':62},
 'nikola-joki':{'tactical_iq':96,'awareness':95,'strength':89},
 'nikola-jokic':{'tactical_iq':96,'awareness':95,'strength':89},
 'usain-bolt':{'acceleration':98,'top_speed':100,'endurance':58},
 'eliud-kipchoge':{'endurance':100,'recovery':96,'top_speed':73},
 'aaron-donald':{'strength':99,'durability':95},
 'khabib-nurmagomedov':{'grappling':100,'combat_defense':95},
 'alexsandr-karelin':{'grappling':100,'strength':98},
 'aleksandr-karelin':{'grappling':100,'strength':98},
 'mikaela-shiffrin':{'balance':100,'agility':98},
 'tyreek-hill':{'acceleration':99,'top_speed':99},
 'lionel-messi':{'agility':99,'coordination':100,'awareness':97},
 'cristiano-ronaldo':{'acceleration':93,'top_speed':94,'endurance':95},
 'serena-williams':{'reflexes':98,'composure':97,'strength':87},
 'simone-biles':{'balance':100,'coordination':100,'agility':100},
 'michael-phelps':{'endurance':98,'coordination':99},
 'tom-brady':{'tactical_iq':99,'leadership':98},
 'michael-jordan':{'clutch':100,'reflexes':96},
 'kobe-bryant':{'clutch':97,'composure':96},
 'lebron-james':{'tactical_iq':96,'leadership':97,'awareness':95}
}

athletes=[]
perks=[]
for row in ORIG+ADDITIONS:
    aid,name,sport=row['id'],row['display_name'],row['sport']
    role=ROLE_BY_NAME.get(name,DEFAULT_ROLES[sport])
    assert role in ROLES,(name,role)
    raw=dict(zip(FIELDS,BASE[sport]))
    for stat,delta in ROLES[role].items():raw[stat]+=delta
    ratings={f:clamp(raw[f]+deterministic_jitter(aid,f)) for f in FIELDS}
    ratings.update(OVERRIDES.get(aid,{}))
    if aid in PROTO:
        ratings=copy.deepcopy(PROTO[aid]['ratings'])
    if aid in SIGNATURES:
        perk_id,perk_label,trigger,bonus,stat=SIGNATURES[aid]
    else:
        label,trigger,bonus,stat=STYLE[role]
        perk_id='SIGNATURE_'+aid.upper().replace('-','_')
        perk_label=f'{name.split()[-1]}: {label}'
    # One matching engine context defines a *real* utility, no placeholder unimplemented triggers.
    # Core mapped context list available in engine: open_sprint, contact_defense, first_contact,
    # group_coordination, contested_supply, urban_evasion, after_observe, water_crossing,
    # long_trek, obstacle, under_pressure, late_finale.
    cost=3 if bonus<=7 else 6
    activation='once_per_encounter' if trigger in ('open_sprint','first_contact','contact_defense','contested_supply','urban_evasion','group_coordination','under_pressure') else 'once_per_match'
    perks.append({'id':perk_id,'athlete_id':aid,'name':perk_label,'trigger':trigger,'bonus':bonus,'target_stat':stat,
                  'stamina_cost':cost,'activation_limit':activation,'source':'gameplay_design_provisional',
                  'description':f'Fictional sport-inspired ability: when {trigger.replace("_"," ")} applies, adds +{bonus} to a {stat}-based check; incurs {cost} stamina on activation.',
                  'validated_against_athlete_biography':False})
    if aid in PROTO:secondary=PROTO[aid]['secondary_perks']
    else:secondary=SECONDARY[role]
    if aid in PROTO:behavior=copy.deepcopy(PROTO[aid]['fictional_behavior'])
    else:
        behavior={k:max(0,min(100,round(v+deterministic_jitter(aid,k,7)))) for k,v in {'aggression':55,'caution':58,'alliance_drive':58,'loyalty':62,'opportunism':65}.items()}
        if role in ('quarterback','point_guard','soccer_midfielder'):behavior['alliance_drive']=min(95,behavior['alliance_drive']+14)
        if role in ('boxer','mma_grappler','mma_striker','combat_grappler'):behavior['aggression']=min(92,behavior['aggression']+12)
    # Historical kit number exists in candidate index but is UNSCREENED except documented 2.
    verified=aid in SOURCES
    if aid in PROTO:
        base_appearance=PROTO[aid]['appearance']
        appearance={'edition_label':base_appearance.get('edition_label') or row.get('draft_uniform_context'), 'outfit_type':base_appearance['outfit_type'], 'candidate_number':base_appearance.get('display_number'), 'display_number':None,'number_kind':base_appearance.get('number_kind'), 'verification_status':'NEEDS_REVIEW','verification_sources':[]}
    else:
        appearance={'edition_label':row.get('draft_uniform_context'), 'outfit_type':row['uniform_type'], 'candidate_number':row.get('jersey_number'), 'display_number':row.get('jersey_number') if verified else None,'number_kind':row.get('number_type'),'verification_status':'VERIFIED' if verified else 'NEEDS_REVIEW','verification_sources':SOURCES.get(aid,[])}
    # Some prototype numbers are known but stay pending until review; don't fabricate displayed bibs.
    athlete={'id':aid,'display_name':name,'sport':sport,'sport_role':role,'appearance':appearance,
             'ratings':ratings,'fictional_behavior':behavior,'signature_perk':perk_id,'secondary_perks':list(secondary),
             'data_quality':{'ratings_are_provisional':True,'ratings_method':'v0.1_manual_prototype' if aid in PROTO else ('two_manual_new_profile' if aid in SOURCES else 'sport_role_archetype_with_deterministic_variation'),
                             'ratings_historical_verification':'NOT_VERIFIED','personality_is_fictional':True,
                             'appearance_number_verified':verified,'licensing_reviewed':False,'source_links':SOURCES.get(aid,[])},
             'description':f'Fantasy simulation profile: {role.replace("_"," ")} archetype; attributes are provisional game design values, not measurements or allegations.'}
    athletes.append(athlete)
assert len(athletes)==252 and len({a['id'] for a in athletes})==252
assert len(perks)==252 and len({p['id'] for p in perks})==252
assert all(len(x['ratings'])==20 and len(x['fictional_behavior'])==5 for x in athletes)
assert all(x['signature_perk'] in {p['id'] for p in perks} for x in athletes)
assert sum(x['appearance']['verification_status']=='VERIFIED' for x in athletes)==2
outfile=ROOT/'data'
outfile.mkdir(exist_ok=True)
(outfile/'athletes_252.json').write_text(json.dumps({'version':'0.2.0','count':252,'verification_notice':'All ratings are UNVALIDATED gameplay estimates, not factual athlete measurements. Exactly two appearance numbers are source-verified. Other kit numbers are hidden pending review.','athletes':athletes},indent=2,ensure_ascii=False)+'\n')
(outfile/'signature_perks_252.json').write_text(json.dumps({'version':'0.2.0','count':252,'perks':perks},indent=2,ensure_ascii=False)+'\n')
(outfile/'secondary_perks.json').write_text(json.dumps({'version':'0.2.0','perks':[dict(id=k,trigger=v[0],bonus=v[1],target_stat=v[2]) for k,v in SECONDARY_RULES.items()]},indent=2)+'\n')
with (outfile/'athletes_252_summary.csv').open('w',newline='',encoding='utf-8') as f:
    writer=csv.DictWriter(f,fieldnames=['id','name','sport','role','edition','candidate_number','display_number','number_verified','signature_perk']+FIELDS)
    writer.writeheader()
    for a in athletes:
        row=dict(id=a['id'],name=a['display_name'],sport=a['sport'],role=a['sport_role'],edition=a['appearance']['edition_label'],candidate_number=a['appearance']['candidate_number'],display_number=a['appearance']['display_number'],number_verified=a['appearance']['verification_status'],signature_perk=a['signature_perk']);row.update(a['ratings']);writer.writerow(row)
(ROOT/'data'/'appearance_verification_queue.json').write_text(json.dumps({'status':'240+ records need careful historical review before displaying candidate_number','verified_count':2,'pending':[a['id'] for a in athletes if a['appearance']['verification_status']=='NEEDS_REVIEW']},indent=2)+'\n')
print('generated',len(athletes),'athletes;',len(perks),'signature perks; 2 number verifications')
