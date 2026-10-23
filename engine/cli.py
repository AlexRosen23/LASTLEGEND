"""Usage: python -m engine.cli --seed 42 [--batch 100] [--out examples/match_42.json]."""
from __future__ import annotations
import json, argparse, hashlib
from pathlib import Path
from collections import Counter
from .simulation import Simulation,ROOT,narrative

DEFAULT=['lebron-james','michael-jordan','kobe-bryant','tom-brady','tyreek-hill','lionel-messi','usain-bolt','mike-tyson','muhammad-ali','michael-phelps','serena-williams','simone-biles']

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--seed',type=int,default=20261022)
    ap.add_argument('--arena',choices=['WILDERNESS','CITY','RUINS','FROZEN'],default='WILDERNESS')
    ap.add_argument('--mode',choices=['REALISTIC','BALANCED','CHAOS'],default='BALANCED')
    ap.add_argument('--ids',nargs=12,default=DEFAULT)
    ap.add_argument('--out')
    ap.add_argument('--batch',type=int,default=0)
    ap.add_argument('--max-ticks',type=int,default=220)
    args=ap.parse_args()
    if args.batch:
        if args.batch>10000:raise ValueError('Prototype CLI batch limit: 10000')
        wins=Counter();event_lengths=[];limit=[]
        for k in range(args.batch):
            r=Simulation(args.ids,seed=args.seed+k,mode=args.mode,arena=args.arena,max_ticks=args.max_ticks).run()
            wins[r['winner']]+=1;event_lengths.append(r['event_count']);limit.append(r['ticks'])
        summary={'matches':args.batch,'arena':args.arena,'mode':args.mode,'roster':args.ids,'wins':dict(wins),
                 'win_rates':{i:round(wins[i]/args.batch,4) for i in args.ids},
                 'mean_ticks':round(sum(limit)/len(limit),2),'mean_events':round(sum(event_lengths)/len(event_lengths),2),
                 'interpretation':'Empirical statistics for the PROTOTYPE GAME MODEL only; not real athletic probabilities.'}
        if args.out:Path(args.out).write_text(json.dumps(summary,indent=2)+'\n')
        print(json.dumps(summary,indent=2));return
    sim=Simulation(args.ids,seed=args.seed,mode=args.mode,arena=args.arena,max_ticks=args.max_ticks)
    result=sim.run()
    lookup=sim.profiles
    for e in result['events']:e['story']=narrative(e,lookup)
    if args.out:Path(args.out).write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'winner':lookup[result['winner']]['display_name'],'winner_id':result['winner'],'placements':result['placements'],'seed':args.seed,'events':result['event_count'],'ticks':result['ticks'],'hash':result['state_hash']},indent=2))

if __name__=='__main__':main()
