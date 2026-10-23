"""Portable package validation and statistical smoke suite.
Limits are deliberate; a balanced production game needs >=1,000 seeds per map+mode+roster,
not just this smoke suite.
"""
from pathlib import Path
import json,sys,time,hashlib,statistics,collections,unittest,datetime
from engine.simulation import Simulation,ROOT

ROSTER_A=['lebron-james','michael-jordan','kobe-bryant','tom-brady','tyreek-hill','lionel-messi','usain-bolt','mike-tyson','muhammad-ali','michael-phelps','serena-williams','simone-biles']
ROSTER_B=['tyrese-haliburton','aaron-judge','lebron-james','michael-jordan','tom-brady','mike-tyson','usain-bolt','kobe-bryant','simone-biles','michael-phelps','serena-williams','muhammad-ali']

def main():
    root=ROOT
    suite=unittest.TestLoader().discover(str(root/'tests'))
    results=unittest.TextTestRunner(stream=sys.stderr,verbosity=0).run(suite)
    errors=len(results.failures)+len(results.errors)
    summary={'generated_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unit_tests':{'ran':results.testsRun,'failures':len(results.failures),'errors':len(results.errors),'passed':results.wasSuccessful()},'build_version':'0.2.0'}
    combos=[];t0=time.monotonic();count=0
    for arena in ['WILDERNESS','CITY','RUINS','FROZEN']:
        for mode in ['REALISTIC','BALANCED','CHAOS']:
            winners=collections.Counter();ticks=[];events=[];bad=0;hazards=0;fights=0
            for i in range(25):
                roster=ROSTER_A if i%2==0 else ROSTER_B
                try:r=Simulation(roster,seed=100000+i+1000*(['WILDERNESS','CITY','RUINS','FROZEN'].index(arena))+100*(['REALISTIC','BALANCED','CHAOS'].index(mode)),mode=mode,arena=arena,max_ticks=110).run()
                except Exception as e:bad+=1;print('BATCH ERROR',arena,mode,i,str(e),file=sys.stderr);continue
                if not(r['winner'] in roster and len(set(r['placements']))==12 and sum(e['type']=='ELIMINATION' for e in r['events'])==11):
                    bad+=1;continue
                count+=1;winners[r['winner']]+=1;ticks.append(r['ticks']);events.append(r['event_count']);hazards+=sum(e['type']=='ZONE_EXPOSURE' for e in r['events']);fights+=sum(e['type'] in ('SKIRMISH','FINALE_ENGAGEMENT') for e in r['events'])
            combos.append({'arena':arena,'mode':mode,'matches':25,'completed':sum(winners.values()),'failed':bad,'different_winners':len(winners), 'mean_ticks':round(statistics.mean(ticks),1) if ticks else None,'mean_events':round(statistics.mean(events),1) if events else None,'hazard_events':hazards,'fight_events':fights,'winner_counts':dict(winners.most_common())})
    summary['smoke_batch']={'requested':300,'completed':count,'failed':sum(c['failed'] for c in combos),'elapsed_seconds':round(time.monotonic()-t0,2),'cohorts':'Alternating original 12 vs requested Haliburton/Judge lineup','max_ticks_for_smoke':110,'arena_mode_cells':combos,'warning':'This is a correctness/replayability smoke run, not statistical balance validation. Production gate >=1,000 per cell for several rosters.'}
    summary['data']={'profiles':len(json.loads((root/'data'/'athletes_252.json').read_text())['athletes']),'signature_perks':len(json.loads((root/'data'/'signature_perks_252.json').read_text())['perks']),'verified_appearance_numbers':2,'ratings_independently_verified':0}
    summary['pass']=results.wasSuccessful() and summary['smoke_batch']['failed']==0 and count==300
    (root/'reports'/'validation_summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps({'pass':summary['pass'],'tests':summary['unit_tests'],'batch':{k:v for k,v in summary['smoke_batch'].items() if k!='arena_mode_cells'},'athletes':summary['data']['profiles']},indent=2))
    if not summary['pass']:sys.exit(1)

if __name__=='__main__':main()
