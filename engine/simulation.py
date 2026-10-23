"""Deterministic, narrative-auditable 12-athlete simulation prototype.

Runnable reference logic and test target, NOT a production-complete AI/physics system.
All RNG is keyed/hash based to eliminate incidental iteration-order dependence.
"""
from __future__ import annotations
import hashlib, json, math
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
FIELD_WEIGHTS={
 'SPRINT_ESCAPE':{'acceleration':.30,'top_speed':.25,'agility':.20,'awareness':.15,'endurance':.10},
 'SPRINT_PURSUIT':{'acceleration':.25,'top_speed':.25,'agility':.15,'awareness':.20,'endurance':.15},
 'SKIRMISH_ATTACK':{'striking':.30,'combat_defense':.20,'reflexes':.20,'strength':.15,'agility':.10,'balance':.05},
 'SKIRMISH_DEFEND':{'combat_defense':.25,'agility':.25,'reflexes':.20,'grappling':.15,'awareness':.15},
 'CACHE':{'awareness':.25,'acceleration':.20,'agility':.15,'coordination':.15,'resourcefulness':.15,'tactical_iq':.10},
 'NEGOTIATION':{'leadership':.35,'composure':.20,'tactical_iq':.20,'awareness':.15,'adaptability':.10},
 'HAZARD':{'balance':.20,'awareness':.20,'adaptability':.20,'endurance':.20,'recovery':.20},
 'LONG_TREK':{'endurance':.45,'recovery':.20,'balance':.15,'adaptability':.10,'awareness':.10}
}
assert all(abs(sum(v.values())-1.0)<1e-8 for v in FIELD_WEIGHTS.values())
PRESETS={'REALISTIC':9.0,'BALANCED':14.0,'CHAOS':20.0}
ARENAS={
 'WILDERNESS':{'layout':'forests,river,clearing','hazard':'exposure','caches':[(4,3),(9,16),(23,5),(27,16),(16,9),(11,8),(22,14)]},
 'CITY':{'layout':'urban_blocks','hazard':'contraction','caches':[(5,4),(8,16),(25,4),(28,16),(16,10),(10,9),(22,11)]},
 'RUINS':{'layout':'walls_obstacles','hazard':'rockfall','caches':[(4,4),(7,15),(27,4),(27,15),(15,9),(11,11),(22,9)]},
 'FROZEN':{'layout':'snow_ridges','hazard':'cold_exposure','caches':[(4,5),(9,15),(24,4),(26,15),(16,9),(11,10),(22,10)]}
}

def draw(seed:int,*parts:Any)->float:
    """Versioned stable draw in [0,1). No Math.random/random.* in outcome paths."""
    val='v0.2|'+str(seed)+'|'+'|'.join(map(str,parts))
    return int.from_bytes(hashlib.sha256(val.encode('utf-8')).digest()[:8],'big')/(1<<64)

def choose(seed,tick,aid,slot,items):
    weights=[max(0.00001,float(w)) for _,w in items]
    u=draw(seed,'decision',tick,aid,slot)*sum(weights)
    for (item,w) in zip(items,weights):
        u-=w
        if u<=0:return item[0]
    return items[-1][0]

def bounded(n,lo=0,hi=100):return max(lo,min(hi,n))

def logistic(a,b,temp):
    d=bounded((a-b)/temp,-40,40)
    return max(.025,min(.975,1/(1+math.exp(-d))))

@dataclass
class Actor:
    id:str
    x:float
    y:float
    health:float=100
    stamina:float=100
    supplies:int=0
    healed:int=0
    alive:bool=True
    ally:str|None=None
    encounters:int=0
    eliminations:int=0
    survival_ticks:int=0
    moves:float=0
    last_observed:dict=field(default_factory=dict)
    effects_used:dict=field(default_factory=dict)
    last_interaction_tick:int=-999
    last_target:str|None=None
    last_intent:str='WAIT'
    elimination_tick:int|None=None
    elimination_reason:str|None=None

class Simulation:
    def __init__(self,roster_ids:list[str],seed:int=20261022,mode:str='BALANCED',arena:str='WILDERNESS',max_ticks:int=220):
        self.athletes_data=json.loads((ROOT/'data'/'athletes_252.json').read_text())['athletes']
        self.profiles={a['id']:a for a in self.athletes_data}
        self.perks={p['athlete_id']:p for p in json.loads((ROOT/'data'/'signature_perks_252.json').read_text())['perks']}
        self.secondary={p['id']:p for p in json.loads((ROOT/'data'/'secondary_perks.json').read_text())['perks']}
        if len(roster_ids)!=12 or len(set(roster_ids))!=12 or any(i not in self.profiles for i in roster_ids):
            raise ValueError('Provide 12 unique athlete IDs from the roster.')
        if mode not in PRESETS or arena not in ARENAS:raise ValueError('Unknown mode/arena')
        self.ids=sorted(roster_ids)
        self.seed=int(seed)
        self.mode=mode
        self.arena=arena
        self.max_ticks=int(max_ticks)
        if self.max_ticks<30:raise ValueError('max_ticks must be >= 30')
        self.tick=0;self.events=[];self.snapshots=[];self.serial=0;self.caches={}
        self.actors={}
        # Radial spawn slots deterministically assigned by ID + seed (not original draft ordering).
        spawnorder=sorted(self.ids,key=lambda x:draw(self.seed,'spawn',x))
        for idx,aid in enumerate(spawnorder):
            angle=idx*math.tau/12+draw(self.seed,'spawn_offset',aid)*.08
            self.actors[aid]=Actor(id=aid,x=16+8.5*math.cos(angle),y=10+7.5*math.sin(angle))
        for j,xy in enumerate(ARENAS[arena]['caches']):self.caches[j]={'xy':xy,'supplies':2,'restock_tick':0}
        self.emit('MATCH_START',self.ids,{'seed':self.seed,'arena':arena,'mode':mode,'roster_count':12},'major')
        self.snapshots.append({'tick':0,'alive':self.alive(),'hash':self.state_hash(),'positions':{a.id:[round(a.x,2),round(a.y,2)] for a in self.actors.values() if a.alive}})

    def alive(self):return sorted([a.id for a in self.actors.values() if a.alive])
    def distance(self,a,b):return math.hypot(a.x-b.x,a.y-b.y)
    def zone_radius(self):
        progress=min(1.0,self.tick/max(1,self.max_ticks))
        return max(0.5,11.0-10.5*(progress**1.2))
    def phase(self):
        p=self.tick/self.max_ticks
        return 'OPENING' if p<.18 else ('EXPLORATION' if p<.48 else ('CONVERGENCE' if p<.8 else 'FINALE'))
    def emit(self,kind,participants,details,importance='normal'):
        participants=sorted(dict.fromkeys(participants))
        if len(participants)>12 or any(i not in self.actors for i in participants):raise AssertionError('bad event participants')
        self.serial+=1
        e={'event_id':f'e-{self.serial:06d}','tick':self.tick,'type':kind,'participants':participants,
           'location':{i:[round(self.actors[i].x,2),round(self.actors[i].y,2)] for i in participants},
           'details':details,'importance':importance}
        if len(participants)>1 and kind in {'CONTACT','CHASE','SKIRMISH','ALLIANCE','NEGOTIATION','ALLY_TRAVEL','CONTEST_RESOURCE','FINALE_ENGAGEMENT'}:
            e['encounter_scene']={'figures':[
             {'id':i,'outfit':self.profiles[i]['appearance']['outfit_type'],
              'number':self.profiles[i]['appearance']['display_number'],
              'label':self.profiles[i]['display_name'],
              'number_verified':self.profiles[i]['appearance']['verification_status']=='VERIFIED'}
             for i in participants]}
        self.events.append(e)
        return e

    def signature_bonus(self,aid,trigger,encounter_key):
        actor=self.actors[aid];p=self.perks[aid]
        if p['trigger']!=trigger or actor.stamina<p['stamina_cost']:return 0,[]
        token=p['id'] if p['activation_limit']=='once_per_match' else f"{p['id']}:{encounter_key}"
        if token in actor.effects_used:return 0,[]
        actor.effects_used[token]=True;actor.stamina=bounded(actor.stamina-p['stamina_cost'])
        return p['bonus'],[{'id':p['id'],'bonus':p['bonus'],'trigger':trigger,'stamina_cost':p['stamina_cost']}]

    def score(self,aid,kind,trigger=None,encounter_key='none'):
        p=self.profiles[aid];a=self.actors[aid]
        base=sum(p['ratings'][k]*weight for k,weight in FIELD_WEIGHTS[kind].items())
        state=-max(0,65-a.stamina)*.15-max(0,60-a.health)*.12
        if self.phase()=='FINALE':base+=.05*(p['ratings']['clutch']-70)
        perk_bonus=0;effects=[]
        if trigger:
            perk_bonus,effects=self.signature_bonus(aid,trigger,encounter_key)
            for sid in p['secondary_perks']:
                sp=self.secondary[sid]
                if sp['trigger']==trigger and sp['target_stat'] in FIELD_WEIGHTS[kind]:
                    perk_bonus+=sp['bonus'];effects.append({'id':sid,'bonus':sp['bonus'],'trigger':trigger})
        # Hard cap to prevent stacking exploits.
        perks_capped=min(10,perk_bonus)
        return {'base':round(base,2),'state':round(state,2),'perk_effect':perks_capped,'perk_activations':effects,'total':round(base+state+perks_capped,2)}

    def contested_check(self,a,b,kind_a,kind_b,trigger_a,trigger_b,context):
        sa=self.score(a,kind_a,trigger_a,f'{self.tick}:{a}:{b}:{context}')
        sb=self.score(b,kind_b,trigger_b,f'{self.tick}:{a}:{b}:{context}')
        probability=logistic(sa['total'],sb['total'],PRESETS[self.mode]);roll=draw(self.seed,'encounter',self.tick,a,b,context)
        return a if roll<probability else b, {'a':a,'b':b,'a_check':kind_a,'b_check':kind_b,'a_score':sa,'b_score':sb,'probability_a':round(probability,5),'roll':round(roll,6),'winner':a if roll<probability else b,'context':context}

    def perceive(self,a):
        # Sight is localized; players may only approach foes that are physically nearby.
        p=self.profiles[a.id]
        radius=3.2+(.015*p['ratings']['awareness'])
        seen=[b for b in self.actors.values() if b.alive and b.id!=a.id and self.distance(a,b)<=radius]
        for b in seen:a.last_observed[b.id]=self.tick
        return sorted(seen,key=lambda x:(self.distance(a,x),x.id))

    def plan(self,a):
        danger=self.perceive(a)
        beh=self.profiles[a.id]['fictional_behavior']
        if a.health<=58 and a.supplies>=1 and a.healed<3:return 'HEAL',None
        if a.stamina<33:return 'REST',None
        if danger:
            tgt=danger[0];caution=beh['caution'];aggression=beh['aggression'];alliance=beh['alliance_drive']
            options=[('APPROACH',.7+aggression/65),('EVADE',.3+caution/75),('OBSERVE',.4+beh['opportunism']/150)]
            if a.ally==tgt.id:options=[('LINK',3),('MOVE',.5)]
            elif a.ally is None:options.append(('NEGOTIATE',.3+alliance/100))
            return choose(self.seed,self.tick,a.id,'encounter_intent',options),tgt.id
        # Avoid inventing perfect map knowledge of enemies: caches are discoverable fixed objective icons.
        available=[(k,c) for k,c in self.caches.items() if c['supplies']>0]
        if available and a.supplies<2:
            k,c=min(available,key=lambda kv:(math.dist((a.x,a.y),kv[1]['xy']),kv[0]))
            if math.dist((a.x,a.y),c['xy'])<1.35:return 'TAKE_CACHE',k
            return 'GO_CACHE',k
        # At later stages push toward safe zone; in earlier stages move between landmark tiles.
        if self.tick/self.max_ticks>.40 or math.dist((a.x,a.y),(16,10))>self.zone_radius()-1:
            return 'GO_CENTER',None
        # No omniscient hunter: explore deterministic landmarks in rotated order.
        k=int(draw(self.seed,'landmark',a.id)*len(self.caches))
        return 'GO_CACHE',k

    def move(self,a,tx,ty,run=False):
        dx=tx-a.x;dy=ty-a.y;dist=math.hypot(dx,dy)
        if dist<.001:return
        p=self.profiles[a.id]['ratings'];speed=(.65+p['top_speed']/110)+(0.6 if run else 0)
        if run and a.stamina<18:speed*=.6
        speed=min(dist,speed)
        a.x=bounded(a.x+dx/dist*speed,0,31)
        a.y=bounded(a.y+dy/dist*speed,0,19)
        a.moves+=speed
        a.stamina=bounded(a.stamina-(7 if run else 2.2)+p['endurance']*.014)

    def damage(self,aid,amount,source,kind):
        a=self.actors[aid]
        if not a.alive:return
        before=a.health;a.health=bounded(a.health-amount)
        self.emit('INJURY',[aid]+([source] if source in self.actors else []),{'target':aid,'source':source,'amount':round(before-a.health,2),'remaining_hp':round(a.health,2),'cause':kind},'major' if a.health<30 else 'normal')
        if a.health<=0:self.eliminate(aid,source,kind)

    def eliminate(self,aid,source,kind):
        a=self.actors[aid]
        if not a.alive:return
        # Prevent zero-survivor endings: stop terminal lethal chain when one remains.
        if len(self.alive())==1:return
        a.alive=False;a.elimination_tick=self.tick;a.elimination_reason=kind
        if source in self.actors and self.actors[source].alive:self.actors[source].eliminations+=1
        self.emit('ELIMINATION',[aid]+([source] if source in self.actors else []),{'eliminated':aid,'source':source,'reason':kind},'critical')
        for other in self.actors.values():
            if other.ally==aid:other.ally=None

    def resolve_pair(self,aa,bb):
        a,b=(aa,bb) if aa.id<bb.id else (bb,aa)
        if not a.alive or not b.alive:return
        if a.ally==b.id:
            self.emit('ALLY_TRAVEL',[a.id,b.id],{'status':'coordinated movement'},'minor');return
        a.encounters+=1;b.encounters+=1;a.last_interaction_tick=b.last_interaction_tick=self.tick
        ai,bi=a.last_intent,b.last_intent
        # Actual contested supply check, not an arbitrary grab or a fictional story embellishment.
        contested=[k for k,cache in self.caches.items() if cache['supplies']>0 and self.distance(a,Actor('cache',*cache['xy']))<1.6 and self.distance(b,Actor('cache',*cache['xy']))<1.6]
        if contested and (ai=='TAKE_CACHE' or bi=='TAKE_CACHE'):
            cache_id=min(contested)
            win,check=self.contested_check(a.id,b.id,'CACHE','CACHE','contested_supply','contested_supply','cache_contest')
            self.actors[win].supplies+=1;self.caches[cache_id]['supplies']-=1
            self.emit('CONTEST_RESOURCE',[a.id,b.id],{'cache_id':cache_id,'winner':win,'supplies_transferred':1,'check':check},'major');return
        # Social contact explicitly consented by *both* instead of fabricated alliances.
        if ai=='NEGOTIATE' and bi=='NEGOTIATE':
            a_neg=self.score(a.id,'NEGOTIATION','group_coordination',f'{self.tick}:{a.id}:{b.id}:ally')
            b_neg=self.score(b.id,'NEGOTIATION','group_coordination',f'{self.tick}:{a.id}:{b.id}:ally')
            chance=min(.85,.2+.4*(self.profiles[a.id]['fictional_behavior']['alliance_drive']+self.profiles[b.id]['fictional_behavior']['alliance_drive'])/200 + (a_neg['perk_effect']+b_neg['perk_effect'])/150)
            roll=draw(self.seed,'social',self.tick,a.id,b.id)
            if roll<chance:
                a.ally=b.id;b.ally=a.id
                self.emit('ALLIANCE',[a.id,b.id],{'roll':round(roll,5),'probability':round(chance,5),'mutual_consent':True,'checks':[a_neg,b_neg]},'major');return
            self.emit('NEGOTIATION',[a.id,b.id],{'result':'no agreement','roll':round(roll,5),'probability':round(chance,5)},'normal');return
        # Chase if any party acts evasively.
        if 'EVADE' in (ai,bi):
            fleeing=a if ai=='EVADE' else b;pursuing=b if fleeing is a else a
            flee_trigger='urban_evasion' if self.arena in ('CITY','RUINS') and self.perks[fleeing.id]['trigger']=='urban_evasion' else 'open_sprint'
            winner,calc=self.contested_check(fleeing.id,pursuing.id,'SPRINT_ESCAPE','SPRINT_PURSUIT',flee_trigger,'open_sprint','chase')
            fleeing.stamina=bounded(fleeing.stamina-6);pursuing.stamina=bounded(pursuing.stamina-5)
            if winner==fleeing.id:
                dx=fleeing.x-pursuing.x;dy=fleeing.y-pursuing.y;dist=math.hypot(dx,dy) or 1
                fleeing.x=bounded(fleeing.x+dx/dist*2.3,0,31);fleeing.y=bounded(fleeing.y+dy/dist*2.3,0,19)
            self.emit('CHASE',[a.id,b.id],{'fleeing':fleeing.id,'pursuing':pursuing.id,'escaped':winner==fleeing.id,'check':calc},'major');return
        if ai in ('OBSERVE','NEGOTIATE') or bi in ('OBSERVE','NEGOTIATE'):
            self.emit('CONTACT',[a.id,b.id],{'intents':{a.id:ai,b.id:bi},'result':'avoided confrontation'},'normal');return
        # Physical contest is non-graphic with multiple beats separated by ticks.
        initiative=draw(self.seed,'initiative',self.tick,a.id,b.id)
        attacker=a if initiative<.5 else b; defender=b if attacker is a else a
        attack_trigger='late_finale' if len(self.alive())<=4 and self.perks[attacker.id]['trigger']=='late_finale' else ('under_pressure' if attacker.health<45 and self.perks[attacker.id]['trigger']=='under_pressure' else ('after_observe' if attacker.last_observed.get(defender.id,-99)<self.tick and self.perks[attacker.id]['trigger']=='after_observe' else 'first_contact'))
        defend_trigger='under_pressure' if defender.health<45 and self.perks[defender.id]['trigger']=='under_pressure' else 'contact_defense'
        winner,calc=self.contested_check(attacker.id,defender.id,'SKIRMISH_ATTACK','SKIRMISH_DEFEND',attack_trigger,defend_trigger,'skirmish')
        if winner==attacker.id:
            target=defender;amount=11+int(12*draw(self.seed,'severity',self.tick,a.id,b.id))
        else:
            target=attacker;amount=6+int(7*draw(self.seed,'counter',self.tick,a.id,b.id))
        self.emit('SKIRMISH',[a.id,b.id],{'attacker':attacker.id,'defender':defender.id,'winning_check':winner,'check':calc,'injury_target':target.id,'damage':amount},'major')
        self.damage(target.id,amount,winner,'SKIRMISH')
        attacker.stamina=bounded(attacker.stamina-6);defender.stamina=bounded(defender.stamina-5)

    def process_actor(self,a,all_plans):
        intent,target=all_plans[a.id]
        a.last_intent=intent;a.last_target=str(target) if target is not None else None
        if intent=='HEAL':
            if a.supplies>=1:
                a.supplies-=1;a.healed+=1;before=a.health;a.health=bounded(a.health+24)
                self.emit('HEAL',[a.id],{'health_gained':round(a.health-before,2),'supplies_used':1})
            return
        if intent=='REST':
            before=a.stamina;a.stamina=bounded(a.stamina+13+self.profiles[a.id]['ratings']['recovery']*.07)
            if self.tick%4==0:self.emit('REST',[a.id],{'stamina_gained':round(a.stamina-before,2)},'minor')
            return
        if intent=='TAKE_CACHE':
            cache=self.caches[target]
            if cache['supplies']>0:
                a.supplies+=1;cache['supplies']-=1
                self.emit('SUPPLY',[a.id],{'cache_id':target,'supplies_gained':1,'remaining_at_cache':cache['supplies']})
            return
        if intent=='GO_CACHE':
            xy=self.caches[target]['xy'];self.move(a,*xy)
        elif intent=='GO_CENTER':self.move(a,16,10)
        elif intent=='EVADE' and target is not None:
            b=self.actors[target];dx=a.x-b.x;dy=a.y-b.y;self.move(a,a.x+dx*2,a.y+dy*2,True)
        elif intent in ('APPROACH','NEGOTIATE','LINK') and target is not None:
            b=self.actors[target];self.move(a,b.x,b.y,run=(intent=='APPROACH'))
        elif intent=='MOVE':self.move(a,16,10)
        elif intent=='OBSERVE':a.stamina=bounded(a.stamina+2)

    def handle_hazards(self):
        radius=self.zone_radius()
        for aid in sorted(self.alive(),key=lambda v:draw(self.seed,'hazard_order',self.tick,v)):
            if len(self.alive())==1:break
            a=self.actors[aid];dist=math.dist((a.x,a.y),(16,10))
            if dist>radius:
                # Zone pressure can force action but cannot kill without a logged cause.
                severity=3+int((dist-radius)*2.6)+int(5*self.tick/self.max_ticks)
                self.emit('ZONE_EXPOSURE',[aid],{'distance':round(dist,2),'safe_radius':round(radius,2),'amount':severity},'normal')
                self.damage(aid,severity,'SAFE_ZONE','ZONE_EXPOSURE')

    def one_tick(self):
        if len(self.alive())<=1:return
        self.tick+=1
        for cache in self.caches.values():
            if cache['supplies']==0 and self.tick>=cache['restock_tick']:
                cache['restock_tick']=self.tick+int(18+8*draw(self.seed,'cache',self.tick,tuple(cache['xy'])))
                # restocks only until convergence; avoid infinite resource generation.
                if self.tick/self.max_ticks<.5:cache['supplies']=1
        if self.tick in (int(self.max_ticks*x) for x in [.2,.5,.8]):
            self.emit('ZONE_WARNING',self.alive(),{'safe_radius':round(self.zone_radius(),1),'phase':self.phase()},'major')
        act=[self.actors[i] for i in self.alive()]
        plans={a.id:self.plan(a) for a in act}
        # Plans are simultaneous snapshots; tick apply order stable and deliberately seed-independent.
        for a in act:self.process_actor(a,plans)
        # One encounter per athlete per tick. Deterministic pairs prioritize real proximity.
        pairs=[]
        act=[self.actors[i] for i in self.alive()]
        for ix,a in enumerate(act):
            for b in act[ix+1:]:
                d=self.distance(a,b)
                if d<=2.55 and self.tick-max(a.last_interaction_tick,b.last_interaction_tick)>=2:
                    pairs.append((d,a.id,b.id))
        used=set()
        for _,aid,bid in sorted(pairs):
            if aid in used or bid in used or len(self.alive())<=1:continue
            used.add(aid);used.add(bid);self.resolve_pair(self.actors[aid],self.actors[bid])
        self.handle_hazards()
        for a in self.actors.values():
            if a.alive:a.survival_ticks+=1
        self.assert_invariants()
        digest=self.state_hash()
        if self.tick%5==0 or len(self.alive())==1:
            self.snapshots.append({'tick':self.tick,'alive':self.alive(),'hash':digest,'positions':{a.id:[round(a.x,2),round(a.y,2)] for a in self.actors.values() if a.alive}})

    def assert_invariants(self):
        for a in self.actors.values():
            assert 0<=a.health<=100 and 0<=a.stamina<=100
            assert 0<=a.x<=31 and 0<=a.y<=19
            assert a.supplies>=0
            if not a.alive:assert a.elimination_tick is not None
        assert len(self.actors)==12
        assert len({a.id for a in self.actors.values()})==12
        assert len(self.alive())>=1, 'must not have zero survivors'
        for e in self.events[-35:]:
            assert set(e['participants']).issubset(self.actors)
            if 'encounter_scene' in e:
                assert len(e['encounter_scene']['figures'])==len(e['participants'])
                assert all(fig['number'] is None or fig['number_verified'] for fig in e['encounter_scene']['figures'])

    def state_hash(self):
        state=[(i,round(a.x,4),round(a.y,4),round(a.health,4),round(a.stamina,4),a.supplies,a.alive,a.ally,a.eliminations) for i,a in sorted(self.actors.items())]
        payload=json.dumps([self.tick,state],sort_keys=True,separators=(',',':'),ensure_ascii=False)
        return hashlib.sha256(payload.encode()).hexdigest()

    def run(self):
        for i in range(self.max_ticks):
            if len(self.alive())==1:break
            self.one_tick()
        # At the declared cap, stage a converged, visible series of actual stat-based encounters.
        # No ranking sort, blind HP drain, coin flip to pick a winner, or unlogged kill.
        if len(self.alive())>1:
            self.emit('FINAL_CONVERGENCE_WARNING',self.alive(),{'reason':'max ticks reached; survivor groups are pushed into a final contest at the center'},'major')
            for extra in range(150):
                if len(self.alive())==1:break
                self.tick+=1
                surviving=self.alive()
                # Rotation prevents always prioritizing the same pair. Stable across replay.
                order=sorted(surviving,key=lambda aid:draw(self.seed,'final_pair',self.tick,aid))
                a,b=order[:2]
                attacker,defender=(a,b) if draw(self.seed,'final_initiative',self.tick,a,b)<.5 else (b,a)
                win,check=self.contested_check(attacker,defender,'SKIRMISH_ATTACK','SKIRMISH_DEFEND','first_contact','contact_defense','final_engagement')
                target=defender if win==attacker else attacker
                amount=17+int(15*draw(self.seed,'final_severity',self.tick,a,b))
                self.actors[a].encounters+=1;self.actors[b].encounters+=1
                self.emit('FINALE_ENGAGEMENT',[a,b],{'attacker':attacker,'defender':defender,'winning_check':win,'damage_to':target,'damage':amount,'check':check,'stage':'forced proximity'},'major')
                self.damage(target,amount,win,'FINAL_SKIRMISH')
                self.assert_invariants()
            if len(self.alive())!=1:raise AssertionError('final confrontation did not produce one survivor')
        winner=self.alive()[0]
        self.emit('CHAMPION',[winner],{'winner':winner,'remaining':1},'critical')
        # Elimination was event-backed, not a simple ratings sort.
        ranking=[winner]+[a.id for a in sorted(self.actors.values(),key=lambda v:(v.elimination_tick if v.elimination_tick is not None else -1,v.id),reverse=True) if a.id!=winner]
        assert len(set(ranking))==12
        result={'version':'0.2.0','seed':self.seed,'mode':self.mode,'arena':self.arena,'ruleset':'LL-REFERENCE-PY-0.2','roster':self.ids,
                'winner':winner,'placements':ranking,'ticks':self.tick,'event_count':len(self.events),
                'statistics':{i:{'eliminations':a.eliminations,'encounters':a.encounters,'distance':round(a.moves,1),'survival_ticks':a.survival_ticks,'health':round(a.health,2)} for i,a in sorted(self.actors.items())},
                'state_hash':self.state_hash(),'events':self.events,'snapshots':self.snapshots}
        return result

def narrative(event,lookup):
    """Pure deterministic templates grounded exclusively in explicit event fields."""
    get=lambda i:lookup[i]['display_name'] if i in lookup else str(i)
    t=event['type'];d=event['details'];ps=event['participants']
    if t=='MATCH_START':return f"The twelve competitors enter the {d['arena'].lower()} arena."
    if t=='ELIMINATION':return f"{get(d['eliminated'])} is eliminated by {get(d['source']) if d['source'] in lookup else 'arena pressure'} ({d['reason'].lower().replace('_',' ')})."
    if t=='CHAMPION':return f"{get(d['winner'])} is the sole survivor and LAST LEGEND champion!"
    if t=='ALLIANCE':return f"{get(ps[0])} and {get(ps[1])} agree to a temporary alliance."
    if t=='CHASE':return f"{get(d['fleeing'])} {'escapes from' if d['escaped'] else 'is caught by'} {get(d['pursuing'])}."
    if t=='SKIRMISH':return f"{get(d['attacker'])} and {get(d['defender'])} clash. {get(d['injury_target'])} takes {d['damage']} game damage."
    if t=='SUPPLY':return f"{get(ps[0])} collects a supply at cache {d['cache_id']}."
    if t=='CONTEST_RESOURCE':return f"{get(ps[0])} and {get(ps[1])} compete for cache {d['cache_id']}; {get(d['winner'])} claims one supply."
    if t=='CONTACT':return f"{get(ps[0])} and {get(ps[1])} make contact and separate without fighting."
    if t=='INJURY':return f"{get(d['target'])} loses {d['amount']} health to {d['cause'].lower().replace('_',' ')}."
    if t=='HEAL':return f"{get(ps[0])} uses supplies to recover {d['health_gained']} health."
    if t=='ZONE_WARNING':return f"The safe zone tightens: {d['phase'].lower()} phase, radius {d['safe_radius']}."
    if t=='FINAL_CONVERGENCE_WARNING':return 'The arena contracts fully, forcing surviving athletes into decisive encounters.'
    if t=='FINALE_ENGAGEMENT':return f"{get(d['attacker'])} and {get(d['defender'])} meet in the final arena. {get(d['damage_to'])} loses {d['damage']} health."
    if t=='ZONE_EXPOSURE':return f"{get(ps[0])} is caught outside the shrinking safe zone."
    if t=='NEGOTIATION':return f"{get(ps[0])} and {get(ps[1])} negotiate, but no alliance is formed."
    if t=='ALLY_TRAVEL':return f"{get(ps[0])} and {get(ps[1])} travel together."
    if t=='REST':return f"{get(ps[0])} pauses to recover stamina."
    return f"A {t.lower().replace('_',' ')} event occurs."
