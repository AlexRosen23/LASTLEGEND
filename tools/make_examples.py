import csv, json, copy, math
from collections import Counter
from pathlib import Path
P=Path('/mnt/data/last_legend_preproduction')
roster = {r['id']:r for r in csv.DictReader(open(P/'roster_250_candidate_index.csv',encoding='utf-8'))}
S=['strength','acceleration','top_speed','agility','endurance','durability','reflexes','coordination','balance','recovery','striking','grappling','combat_defense','tactical_iq','awareness','composure','adaptability','resourcefulness','leadership','clutch']
defaults=dict(zip(S,[68,69,68,70,72,72,75,79,77,73,38,38,40,75,75,76,73,60,70,77]))
# Provisional fictional/gameplay ratings, never assert empirical accuracy.
featured = [
('lebron-james','The Floor General','THE_FLOOR_GENERAL',['FIELD_VISION','COMMAND_VOICE'],{'strength':92,'acceleration':80,'top_speed':77,'agility':84,'endurance':86,'durability':91,'reflexes':86,'coordination':96,'balance':84,'recovery':86,'striking':43,'grappling':42,'combat_defense':45,'tactical_iq':96,'awareness':95,'composure':93,'adaptability':94,'resourcefulness':73,'leadership':97,'clutch':91},[47,67,83,81,74]),
('michael-jordan','The Closer','THE_CLOSER',['CALM_UNDER_FIRE','QUICK_FIRST_STEP'],{'strength':78,'acceleration':90,'top_speed':85,'agility':94,'endurance':84,'durability':84,'reflexes':96,'coordination':98,'balance':94,'recovery':81,'striking':42,'grappling':40,'combat_defense':46,'tactical_iq':91,'awareness':93,'composure':97,'adaptability':88,'resourcefulness':63,'leadership':89,'clutch':100},[61,67,60,70,82]),
('kobe-bryant','Mamba Focus','MAMBA_FOCUS',['FOCUS_MODE','STAY_READY'],{'strength':74,'acceleration':85,'top_speed':79,'agility':90,'endurance':91,'durability':83,'reflexes':93,'coordination':96,'balance':92,'recovery':82,'striking':45,'grappling':38,'combat_defense':44,'tactical_iq':90,'awareness':89,'composure':96,'adaptability':89,'resourcefulness':62,'leadership':83,'clutch':97},[63,65,45,64,87]),
('tom-brady','Film Room','FILM_ROOM',['FIELD_VISION','CALM_UNDER_FIRE'],{'strength':65,'acceleration':41,'top_speed':43,'agility':48,'endurance':72,'durability':75,'reflexes':80,'coordination':88,'balance':68,'recovery':76,'striking':34,'grappling':33,'combat_defense':37,'tactical_iq':99,'awareness':95,'composure':98,'adaptability':91,'resourcefulness':65,'leadership':96,'clutch':97},[30,85,85,84,66]),
('tyreek-hill','Cheetah Burst','CHEETAH_BURST',['QUICK_FIRST_STEP','ELUSIVE'],{'strength':71,'acceleration':99,'top_speed':99,'agility':92,'endurance':80,'durability':79,'reflexes':93,'coordination':92,'balance':87,'recovery':84,'striking':34,'grappling':33,'combat_defense':38,'tactical_iq':75,'awareness':81,'composure':80,'adaptability':78,'resourcefulness':61,'leadership':67,'clutch':82},[62,69,59,58,81]),
('lionel-messi','Tight-Space Control','TIGHT_SPACE_CONTROL',['ELUSIVE','SOFT_HANDS'],{'strength':57,'acceleration':91,'top_speed':83,'agility':99,'endurance':89,'durability':78,'reflexes':94,'coordination':100,'balance':97,'recovery':86,'striking':30,'grappling':29,'combat_defense':35,'tactical_iq':95,'awareness':97,'composure':95,'adaptability':92,'resourcefulness':65,'leadership':83,'clutch':96},[48,73,69,76,87]),
('usain-bolt','Lightning Start','LIGHTNING_START',['QUICK_FIRST_STEP','STAY_READY'],{'strength':77,'acceleration':99,'top_speed':100,'agility':75,'endurance':68,'durability':76,'reflexes':88,'coordination':89,'balance':82,'recovery':77,'striking':33,'grappling':30,'combat_defense':33,'tactical_iq':76,'awareness':75,'composure':93,'adaptability':73,'resourcefulness':59,'leadership':76,'clutch':93},[34,73,59,61,77]),
('mike-tyson','Explosive Entry','EXPLOSIVE_ENTRY',['BATTLE_SENSE','ANCHOR_STANCE'],{'strength':95,'acceleration':91,'top_speed':67,'agility':86,'endurance':75,'durability':94,'reflexes':96,'coordination':91,'balance':87,'recovery':74,'striking':100,'grappling':54,'combat_defense':93,'tactical_iq':88,'awareness':92,'composure':85,'adaptability':80,'resourcefulness':57,'leadership':55,'clutch':91},[67,55,55,62,70]),
('muhammad-ali','Rope-a-Dope','ROPE_A_DOPE',['DEFENSIVE_READ','DEEP_RESERVES'],{'strength':87,'acceleration':89,'top_speed':77,'agility':92,'endurance':92,'durability':93,'reflexes':97,'coordination':95,'balance':92,'recovery':89,'striking':99,'grappling':54,'combat_defense':99,'tactical_iq':95,'awareness':93,'composure':96,'adaptability':91,'resourcefulness':63,'leadership':83,'clutch':96},[62,69,69,66,70]),
('michael-phelps','Water Mastery','WATER_MASTERY',['ENDURANCE_ENGINE','DEEP_RESERVES'],{'strength':88,'acceleration':70,'top_speed':61,'agility':71,'endurance':98,'durability':88,'reflexes':86,'coordination':98,'balance':80,'recovery':93,'striking':36,'grappling':34,'combat_defense':40,'tactical_iq':83,'awareness':82,'composure':94,'adaptability':84,'resourcefulness':61,'leadership':76,'clutch':95},[36,76,56,68,80]),
('serena-williams','Return of Serve','RETURN_OF_SERVE',['CALM_UNDER_FIRE','STAY_READY'],{'strength':89,'acceleration':83,'top_speed':78,'agility':87,'endurance':86,'durability':88,'reflexes':98,'coordination':98,'balance':91,'recovery':84,'striking':37,'grappling':34,'combat_defense':39,'tactical_iq':91,'awareness':93,'composure':97,'adaptability':89,'resourcefulness':62,'leadership':86,'clutch':97},[56,75,69,82,79]),
('simone-biles','Perfect Landing','PERFECT_LANDING',['IRON_BALANCE','AERIAL_CONTROL'],{'strength':76,'acceleration':85,'top_speed':71,'agility':98,'endurance':78,'durability':84,'reflexes':98,'coordination':100,'balance':100,'recovery':83,'striking':30,'grappling':34,'combat_defense':38,'tactical_iq':88,'awareness':94,'composure':96,'adaptability':94,'resourcefulness':61,'leadership':80,'clutch':96},[49,72,74,78,75]),
]
athletes=[]
for key, title, perk, secondary, overrides, persona in featured:
    original = roster[key]
    scores = {**defaults,**overrides}
    assert set(scores) == set(S)
    assert all(isinstance(x,int) and 1<=x<=100 for x in scores.values())
    athletes.append({
        'id':key,'display_name':original['display_name'],'sport':original['sport'],
        'appearance':{'edition_label':original['draft_uniform_context'], 'outfit_type':original['uniform_type'], 'display_number':original['jersey_number'] or None,
                       'number_kind':original['number_type'] if original['jersey_number'] else 'none',
                       'verification_status':'NEEDS_REVIEW'},
        'ratings':scores,
        'fictional_behavior':dict(zip(['aggression','caution','alliance_drive','loyalty','opportunism'],persona)),
        'signature_perk':perk,'secondary_perks':secondary,
        'data_quality':{'ratings_are_provisional':True,'historically_verified_uniform':False,'licensing_reviewed':False},
        'note':'ILLUSTRATIVE GAME RATINGS ONLY. Not empirically established. Number is draft pending appearance source review.'
    })
with open(P/'prototype_12_athletes.json','w',encoding='utf-8') as f:json.dump({'NOTICE':'Every 1–100 stat and all behavior scores are provisional game design values, NOT audited factual measurements. Appearance numbers are draft.','rating_version':'prototype_v0.1','athletes':athletes},f,indent=2,ensure_ascii=False)
conf={'game':'LAST LEGEND','ruleset_version':'v0.1-preproduction','match_size':12,'seed':20261022,'randomness':'BALANCED','arena':'WILDERNESS','selected_athlete_ids':[a['id'] for a in athletes],
      'max_ticks':500,'tick_world_minutes':15,'cosmetic_pref':{'render':'2D_MAP_AND_SVG_STICK_FIGURES','encounter_scene_for_2_or_more':True,'show_number_only_if_verified':True},
      'note':'Example setup, not a completed simulation run.'}
with open(P/'example_match_config.json','w',encoding='utf-8') as f:json.dump(conf,f,indent=2)

# portable schema outline: deliberately minimal required fields and flags
schema={'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://example.invalid/last-legend/athlete.schema.json','title':'Last Legend Athlete Draft','type':'object',
 'required':['id','display_name','sport','appearance','ratings','fictional_behavior','signature_perk'],
 'properties':{'id':{'type':'string','pattern':'^[a-z0-9-]+$'},'display_name':{'type':'string'},'sport':{'type':'string'},
 'appearance':{'type':'object','required':['outfit_type','display_number','verification_status'], 'properties':{'outfit_type':{'type':'string'},'display_number':{'type':['string','null']},'verification_status':{'enum':['NEEDS_REVIEW','VERIFIED','REJECTED']}}},
 'ratings':{'type':'object','required':S,'properties':{k:{'type':'integer','minimum':1,'maximum':100} for k in S},'additionalProperties':False},
 'fictional_behavior':{'type':'object','required':['aggression','caution','alliance_drive','loyalty','opportunism'],'properties':{k:{'type':'integer','minimum':0,'maximum':100} for k in ['aggression','caution','alliance_drive','loyalty','opportunism']}},
 'signature_perk':{'type':'string'}}}
with open(P/'athlete_draft_schema.json','w',encoding='utf-8') as f:json.dump(schema,f,indent=2)
print('prototype athletes:',len(athletes),'all profiles valid')
