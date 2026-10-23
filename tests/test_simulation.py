"""Run: python -m unittest discover -s tests -v (stdlib only)."""
import json, unittest, collections
from pathlib import Path
from engine.simulation import Simulation,PRESETS,FIELD_WEIGHTS,logistic,draw,narrative,ROOT

DATA=json.loads((ROOT/'data'/'athletes_252.json').read_text())['athletes']
PERKS=json.loads((ROOT/'data'/'signature_perks_252.json').read_text())['perks']
SECOND=json.loads((ROOT/'data'/'secondary_perks.json').read_text())['perks']
ORIGINAL=['lebron-james','michael-jordan','kobe-bryant','tom-brady','tyreek-hill','lionel-messi','usain-bolt','mike-tyson','muhammad-ali','michael-phelps','serena-williams','simone-biles']
ADDED=['tyrese-haliburton','aaron-judge']

class DataContract(unittest.TestCase):
    def test_roster_size_and_new_athletes(self):
        ids=[a['id'] for a in DATA]
        self.assertEqual(len(DATA),252);self.assertEqual(len(ids),len(set(ids)))
        self.assertTrue(all(i in ids for i in ADDED))
    def test_complete_stats_and_behaviors(self):
        self.assertEqual(len(FIELD_WEIGHTS),8)
        for a in DATA:
            self.assertEqual(len(a['ratings']),20,a['id']);self.assertEqual(len(a['fictional_behavior']),5,a['id'])
            self.assertTrue(all(isinstance(x,int) and 1<=x<=100 for x in a['ratings'].values()),a['id'])
            self.assertTrue(all(isinstance(x,int) and 0<=x<=100 for x in a['fictional_behavior'].values()),a['id'])
            self.assertTrue(a['data_quality']['ratings_are_provisional'])
            self.assertTrue(a['data_quality']['personality_is_fictional'])
    def test_perk_catalog_complete_and_bounded(self):
        keys={p['id'] for p in PERKS};self.assertEqual(len(keys),252)
        secondary={p['id'] for p in SECOND};self.assertEqual(len(secondary),25)
        triggers={'group_coordination','late_finale','under_pressure','after_observe','open_sprint','first_contact','contact_defense','water_crossing','urban_evasion','contested_supply','obstacle','long_trek','recover_when_low'}
        for a in DATA:
            self.assertIn(a['signature_perk'],keys)
            self.assertEqual(len(a['secondary_perks']),2)
            self.assertTrue(set(a['secondary_perks']).issubset(secondary))
        for p in PERKS:
            self.assertIn(p['trigger'],triggers);self.assertTrue(1<=p['bonus']<=10)
            self.assertTrue(0<=p['stamina_cost']<=10)
    def test_verified_numbers_only(self):
        verified={a['id']:a['appearance']['display_number'] for a in DATA if a['appearance']['verification_status']=='VERIFIED'}
        self.assertEqual(verified,{'tyrese-haliburton':'0','aaron-judge':'99'})
        for a in DATA:
            if a['appearance']['verification_status']!='VERIFIED':self.assertIsNone(a['appearance']['display_number'])
            else:self.assertTrue(a['appearance']['verification_sources'])
    def test_weights_add_to_one(self):
        for k,w in FIELD_WEIGHTS.items():self.assertAlmostEqual(sum(w.values()),1,places=8,msg=k)
    def test_probabilities_monotone_and_chaos(self):
        for mode in PRESETS:
            self.assertAlmostEqual(logistic(60,60,PRESETS[mode]),.5)
            self.assertGreater(logistic(80,60,PRESETS[mode]),.5)
            self.assertLess(logistic(60,80,PRESETS[mode]),.5)
        self.assertGreater(logistic(80,60,PRESETS['REALISTIC']),logistic(80,60,PRESETS['BALANCED']))
        self.assertGreater(logistic(80,60,PRESETS['BALANCED']),logistic(80,60,PRESETS['CHAOS']))

class SimulationContract(unittest.TestCase):
    def test_seeded_draw(self):
        self.assertEqual(draw(5,'a',22),draw(5,'a',22));self.assertNotEqual(draw(5,'a',22),draw(6,'a',22))
    def test_deterministic_same_seed_and_roster_order(self):
        a=Simulation(ORIGINAL,seed=214,arena='CITY',max_ticks=90).run()
        b=Simulation(list(reversed(ORIGINAL)),seed=214,arena='CITY',max_ticks=90).run()
        self.assertEqual(a['winner'],b['winner']);self.assertEqual(a['state_hash'],b['state_hash']);self.assertEqual(a['events'],b['events'])
    def test_bad_roster_rejected(self):
        with self.assertRaises(ValueError):Simulation(ORIGINAL[:-1])
        with self.assertRaises(ValueError):Simulation(ORIGINAL[:-1]+[ORIGINAL[0]])
        with self.assertRaises(ValueError):Simulation(ORIGINAL[:-1]+['missing-athlete'])
    def test_arenas_modes_and_252_participation(self):
        alt=ORIGINAL[:-2]+ADDED
        for arena in ['WILDERNESS','CITY','RUINS','FROZEN']:
            for mode in ['REALISTIC','BALANCED','CHAOS']:
                sim=Simulation(alt,seed=70+len(arena),arena=arena,mode=mode,max_ticks=70)
                r=sim.run()
                self.assertIn(r['winner'],alt)
                self.assertEqual(len(r['placements']),12)
                self.assertEqual(len(set(r['placements'])),12)
                self.assertEqual(sum(e['type']=='ELIMINATION' for e in r['events']),11)
                self.assertEqual(r['events'][-1]['type'],'CHAMPION')
                self.assertEqual(sum(e['type']=='CHAMPION' for e in r['events']),1)
                self.assertTrue(all(e['participants'] for e in r['events']))
                # No nonverified jersey number leaks into SVG encounter scene metadata.
                for e in r['events']:
                    for fig in e.get('encounter_scene',{}).get('figures',[]):
                        self.assertTrue(fig['number'] is None or fig['number_verified'])
                self.assertTrue(any(e['type']=='FINALE_ENGAGEMENT' for e in r['events']) or r['ticks']<=70)
    def test_seed_variation_has_diverse_champions(self):
        winners={Simulation(ORIGINAL,seed=i,max_ticks=55).run()['winner'] for i in range(20)}
        self.assertGreaterEqual(len(winners),3)
    def test_event_stories_are_templates_not_invented(self):
        sim=Simulation(ORIGINAL,seed=72,max_ticks=65)
        result=sim.run()
        for e in result['events']:
            story=narrative(e,sim.profiles)
            self.assertIsInstance(story,str);self.assertTrue(story)
            if e['type']=='CHAMPION':self.assertIn(sim.profiles[result['winner']]['display_name'],story)
            if e['type']=='ELIMINATION':self.assertIn(sim.profiles[e['details']['eliminated']]['display_name'],story)
    def test_eliminations_all_have_causes_and_no_return_to_alive(self):
        sim=Simulation(ORIGINAL,seed=105,max_ticks=90)
        result=sim.run()
        dead=set()
        for e in result['events']:
            if e['type']=='ELIMINATION':
                aid=e['details']['eliminated'];self.assertNotIn(aid,dead)
                self.assertTrue(e['details']['source']);dead.add(aid)
            if e['type'] in {'SKIRMISH','CHASE','CONTACT','ALLIANCE','FINALE_ENGAGEMENT'}:
                self.assertTrue(set(e['participants']).isdisjoint(dead))
        self.assertEqual(len(dead),11)
    def test_preview_replay_and_stick_kit_artifacts(self):
        import re
        from xml.etree import ElementTree
        preview=(ROOT/'preview'/'index.html').read_text()
        game=json.loads(re.search(r'<script id="replay-data" type="application/json">(.*?)</script>',preview,re.S).group(1))
        self.assertIn('tyrese-haliburton',game['profiles'])
        self.assertIn('aaron-judge',game['profiles'])
        self.assertEqual(game['profiles']['tyrese-haliburton']['number'],'0')
        self.assertEqual(game['profiles']['aaron-judge']['number'],'99')
        self.assertIsNone(game['profiles']['mike-tyson']['number'])
        self.assertEqual(len(game['roster']),12)
        ElementTree.parse(ROOT/'preview'/'verified_kit_encounter.svg')
    def test_perk_activation_only_with_correct_trigger(self):
        sim=Simulation(ORIGINAL,seed=44)
        a=sim.actors['usain-bolt']
        before=a.stamina
        bonus,perks=sim.signature_bonus('usain-bolt','water_crossing','test')
        self.assertEqual(bonus,0);self.assertEqual(perks,[]);self.assertEqual(a.stamina,before)
        bonus,perks=sim.signature_bonus('usain-bolt','open_sprint','test')
        self.assertEqual(bonus,9);self.assertEqual(a.stamina,before-6)
        bonus2,_=sim.signature_bonus('usain-bolt','open_sprint','test')
        self.assertEqual(bonus2,0)

if __name__=='__main__':unittest.main()
