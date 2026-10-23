"""Build V4 game roster from V3 without fabricating missing official mascots.
The profile numbers/abilities are fictional game-balance parameters.
"""
import json,re,unicodedata,copy,hashlib,csv,random
from pathlib import Path
ROOT=Path(__file__).parent
athletes=json.loads((ROOT/'INLINE_ATHLETES.json').read_text())
perks=json.loads((ROOT/'INLINE_PERKS.json').read_text())
source_ids={a['id'] for a in athletes}
by_id={a['id']:a for a in athletes}
existing_by_name={a['name'].casefold():a for a in athletes}
records=[]; collections={}; conflicts=[]; reviews=[]

SOURCES={
 'bears':'https://www.chicagobears.com/photos/100-best-chicago-bears-of-the-last-century-100th-birthday',
 'iu':'https://collegefootballplayoff.com/sports/2026/1/27/NCG-recap',
 'college':'https://www.profootballnetwork.com/cfb/complete-list-of-college-football-mascots/',
 'nfl':'https://en.wikipedia.org/wiki/List_of_NFL_mascots',
 'nba':'https://en.wikipedia.org/wiki/List_of_NBA_mascots',
 'mlb':'https://en.wikipedia.org/wiki/List_of_Major_League_Baseball_mascots',
 'nhl':'https://en.wikipedia.org/wiki/List_of_NHL_mascots',
 'user':'User-requested fantasy entries; identity and IP checks are pending'
}

Bears="""Walter Payton|Dick Butkus|Bronko Nagurski|Sid Luckman|Gale Sayers|Mike Ditka|Bill George|Clyde Bulldog Turner|Doug Atkins|Danny Fortmann|Dan Hampton|Richard Dent|Jimbo Covert|Brian Urlacher|Mike Singletary|Bill Hewitt|Stan Jones|Jay Hilgenberg|Steve McMichael|Devin Hester|Joe Stydahar|George Connor|George McAfee|Joe Fortunato|Ed Sprinkle|Ed Healey|Olin Kreutz|Lance Briggs|Rick Casares|Gary Fencik|Charles Tillman|Paddy Driscoll|George Trafton|Matt Forte|George Musso|Red Grange|George Halas|Link Lyman|Harlon Hill|Ken Kavanaugh|Neal Anderson|Richie Petitbon|Wilber Marshall|Johnny Morris|Otis Wilson|Doug Buffone|Dave Duerson|Fred Williams|Ray Bray|Mark Bortz|Keith Van Horne|Joe Kopcha|Jim McMahon|Ed Brown|Johnny Lujack|Roosevelt Taylor|Jim Osborne|Wally Chambers|Julius Peppers|Khalil Mack|Willie Galimore|Robbie Gould|Mike Brown|James Williams|Dick Gordon|Mike Hartenstine|Ed O'Bradovich|Dick Barwegen|Bill Wade|Matt Suhey|Kevin Butler|Mark Carrier|Tommie Harris|Kyle Long|Akiem Hicks|J.C. Caroline|Bennie McRae|Donnell Woolford|Dennis McKinnon|Alshon Jeffery|Brandon Marshall|George Blanda|Willie Gault|Tom Thayer|Jay Cutler|Allan Ellis|Luke Johnsos|Joey Sternaman|Mike Pyle|Beattie Feathers|Bob Wetoska|Bill Osmanski|Herm Lee|Jim Dooley|Larry Morris|Eddie Jackson|Bobby Joe Green|Trace Armstrong|Doug Plank|Patrick Mannelly""".split('|')
assert len(Bears)==100,len(Bears)
# The starters and reserves are taken from the championship match official list; Andrew Turvy was on 2025 depth chart.
IU_STARTERS="""Roman Hemby|Elijah Sarratt|Fernando Mendoza|Omar Cooper Jr.|Riley Nowakowski|Drew Evans|Carter Smith|Kahlil Benson|Bray Lynch|Pat Coogan|Charlie Becker|Amare Ferrell|Rolijah Hardy|Jamari Sharpe|Aiden Fisher|Isaiah Jones|D'Angelo Ponds|Mikail Kamara|Louis Moore|Dominique Ratcliff|Tyrique Tucker|Mario Landino""".split('|')
IU_RESERVES="""Hosea Wheeler|Jonathan Brady|Ryland Gandy|Devan Boykin|Kaiden Turner|Nicolas Radicic|Daniel Ndukwe|Solomon Vanhorse|Holden Staes|Byron Baldwin Jr.|Jaylen Bell|Anthony Chung|Garrett Reese|Jeff Utzinger|Brendan Franke|Clay Conner|Quentin Clark|Mitch McCarthy|Mark Langston|James Bomba|E.J. Williams Jr.|Adedamola Ajani|Zen Michalski|Kaelon Black|J'mari Monnette|Quinn Warren""".split('|')
IU_EXTRA="""Andrew Turvy|Alberto Mendoza|Lee Beebe Jr.|Davion Chandler|LeBron Bond|Stephen Daley|Kellan Wyatt|Hosea Wheeler|Andrew Depaepe|Anthony Chung|Tobi Osunsanmi""".split('|')

# College list: verified school+mascot pairings; exactly 100 distinct programs.
COLLEGE_RAW="""
Mule~Army Black Knights
Norm the Niner~Charlotte 49ers
PeeDee the Pirate~East Carolina Pirates
Owlsley the Owl~Florida Atlantic Owls
Pouncer~Memphis Tigers
Bill the Goat~Navy Midshipmen
Scrappy~North Texas Mean Green
Sammy the Owl~Rice Owls
Rocky D. Bull~South Florida Bulls
Hooter the Owl~Temple Owls
Riptide the Pelican~Tulane Green Wave
Captain Cane~Tulsa Golden Hurricane
Blaze the Dragon~UAB Blazers
Rowdy the Roadrunner~UTSA Roadrunners
Baldwin the Eagle~Boston College Eagles
Oski~California Golden Bears
The Tiger~Clemson Tigers
The Blue Devil~Duke Blue Devils
Renegade~Florida State Seminoles
Buzz~Georgia Tech Yellow Jackets
Cardinal Bird~Louisville Cardinals
Sebastian the Ibis~Miami Hurricanes
Mr. Wuf~NC State Wolfpack
Rameses~North Carolina Tar Heels
Roc the Panther~Pittsburgh Panthers
Peruna~SMU Mustangs
Stanford Tree~Stanford Cardinal
Otto the Orange~Syracuse Orange
The Cavalier~Virginia Cavaliers
Hokie Bird~Virginia Tech Hokies
Demon Deacon~Wake Forest Demon Deacons
Wilbur the Wildcat~Arizona Wildcats
Sparky the Sun Devil~Arizona State Sun Devils
Bruiser~Baylor Bears
The Bearcat~Cincinnati Bearcats
Ralphie the Buffalo~Colorado Buffaloes
Shasta~Houston Cougars
Cy~Iowa State Cyclones
Big Jay~Kansas Jayhawks
Willie the Wildcat~Kansas State Wildcats
Pistol Pete~Oklahoma State Cowboys
Super Frog~TCU Horned Frogs
Raider Red~Texas Tech Red Raiders
Knightro~UCF Knights
Swoop~Utah Utes
Mountaineer~West Virginia Mountaineers
Hoosier the Bison~Indiana Hoosiers
Herky the Hawk~Iowa Hawkeyes
Testudo~Maryland Terrapins
Biff the Wolverine~Michigan Wolverines
Sparty~Michigan State Spartans
Goldy Gopher~Minnesota Gophers
Herbie Husker~Nebraska Cornhuskers
Willie the Wildcat~Northwestern Wildcats
Brutus the Buckeye~Ohio State Buckeyes
The Oregon Duck~Oregon Ducks
Nittany Lion~Penn State Nittany Lions
Boilermaker Special~Purdue Boilermakers
Scarlet Knight~Rutgers Scarlet Knights
Joe Bruin~UCLA Bruins
Traveler~USC Trojans
Harry the Husky~Washington Huskies
Bucky the Badger~Wisconsin Badgers
Roary the Panther~FIU Panthers
Cocky the Gamecock~Jacksonville State Gamecocks
Scrappy~Kennesaw State Owls
Sparky~Liberty Flames
Tech~Louisiana Tech Bulldogs
Lightning~Middle Tennessee Blue Raiders
Pistol Pete~New Mexico State Aggies
Sammy Bearkat~Sam Houston Bearkats
Paydirt Pete~UTEP Miners
Big Red~WKU Hilltoppers
YoUDee~Delaware Blue Hens
Boomer the Bear~Missouri State Bears
Leprechaun~Notre Dame Fighting Irish
Jonathan the Husky~UConn Huskies
Zippy~Akron Zips
Charlie Cardinal~Ball State Cardinals
Freddie Falcon~Bowling Green Falcons
Victor E. Bull~Buffalo Bulls
Flying C~Central Michigan Chippewas
Swoop~Eastern Michigan Eagles
The Golden Eagle~Kent State Golden Flashes
Swoop~Miami (OH) RedHawks
Mission~Northern Illinois Huskies
Rufus~Ohio Bobcats
Rocky~Toledo Rockets
Buster Bronco~Western Michigan Broncos
Sam the Minuteman~UMass Minutemen
Big Al~Alabama Crimson Tide
Aubie the Tiger~Auburn Tigers
Uga~Georgia Bulldogs
Bevo~Texas Longhorns
Boomer and Sooner~Oklahoma Sooners
Smokey~Tennessee Volunteers
Mike the Tiger~LSU Tigers
Reveille~Texas A&M Aggies
Albert the Alligator~Florida Gators
Bully~Mississippi State Bulldogs
""".strip().splitlines()
assert len(COLLEGE_RAW)==100,len(COLLEGE_RAW)

# Each current mascot is represented by its named identity and team. We do not invent characters for teams without official mascots.
PRO_RAW={
'NFL':"""Big Red~Arizona Cardinals|Freddie Falcon~Atlanta Falcons|Poe~Baltimore Ravens|Edgar~Baltimore Ravens|Allen~Baltimore Ravens|Billy Buffalo~Buffalo Bills|Sir Purr~Carolina Panthers|Staley Da Bear~Chicago Bears|Who Dey~Cincinnati Bengals|Chomps~Cleveland Browns|Brownie the Elf~Cleveland Browns|Rowdy~Dallas Cowboys|Miles~Denver Broncos|Thunder~Denver Broncos|Roary~Detroit Lions|Toro~Houston Texans|Blue~Indianapolis Colts|Jaxson de Ville~Jacksonville Jaguars|K. C. Wolf~Kansas City Chiefs|Raider Rusher~Las Vegas Raiders|Rampage~Los Angeles Rams|T. D.~Miami Dolphins|Viktor~Minnesota Vikings|Pat Patriot~New England Patriots|Gumbo~New Orleans Saints|Sir Saint~New Orleans Saints|Swoop~Philadelphia Eagles|Steely McBeam~Pittsburgh Steelers|Sourdough Sam~San Francisco 49ers|Blitz~Seattle Seahawks|Boom~Seattle Seahawks|Taima~Seattle Seahawks|Captain Fear~Tampa Bay Buccaneers|T-Rac~Tennessee Titans|Major Tuddy~Washington Commanders|Air Swoop~Philadelphia Eagles""",
'NBA':"""Harry the Hawk~Atlanta Hawks|Lucky the Leprechaun~Boston Celtics|Hugo the Hornet~Charlotte Hornets|Super Hugo~Charlotte Hornets|Benny the Bull~Chicago Bulls|Mini Benny~Chicago Bulls|Big Ben~Chicago Bulls|Moondog~Cleveland Cavaliers|Sir CC~Cleveland Cavaliers|Champ~Dallas Mavericks|Mavs Man~Dallas Mavericks|Rocky the Mountain Lion~Denver Nuggets|Hooper~Detroit Pistons|Clutch the Bear~Houston Rockets|Boomer~Indiana Pacers|Mini Boomer~Indiana Pacers|Chuck the Condor~Los Angeles Clippers|Grizz~Memphis Grizzlies|Burnie~Miami Heat|Bango~Milwaukee Bucks|Crunch the Wolf~Minnesota Timberwolves|Pierre the Pelican~New Orleans Pelicans|Rumble the Bison~Oklahoma City Thunder|Stuff the Magic Dragon~Orlando Magic|Franklin the Dog~Philadelphia 76ers|The Gorilla~Phoenix Suns|Blaze the Trail Cat~Portland Trail Blazers|Slamson the Lion~Sacramento Kings|The Coyote~San Antonio Spurs|The Raptor~Toronto Raptors|Jazz Bear~Utah Jazz|G-Wiz~Washington Wizards|Benji~Chicago Bulls|Mama Betty~Chicago Bulls|Inflatabulls~Chicago Bulls|Mini Hooper~Detroit Pistons|Mini Clutch~Houston Rockets|Bango Jr.~Milwaukee Bucks|Lil Bear~Utah Jazz|Douglas Fur~Portland Trail Blazers|G-Man~Washington Wizards""",
'MLB':"""Baxter the Bobcat~Arizona Diamondbacks|D-backs Luchador~Arizona Diamondbacks|Blooper~Atlanta Braves|The Oriole Bird~Baltimore Orioles|Wally the Green Monster~Boston Red Sox|Tessie the Green Monster~Boston Red Sox|Clark the Cub~Chicago Cubs|Southpaw~Chicago White Sox|Slider~Cleveland Guardians|Dinger~Colorado Rockies|PAWS~Detroit Tigers|Orbit~Houston Astros|Sluggerrr~Kansas City Royals|Billy the Marlin~Miami Marlins|Bernie Brewer~Milwaukee Brewers|The Racing Sausages~Milwaukee Brewers|T. C. Bear~Minnesota Twins|Mr. Met~New York Mets|Mrs. Met~New York Mets|Stomper~Athletics|Phillie Phanatic~Philadelphia Phillies|Pirate Parrot~Pittsburgh Pirates|The Pierogis~Pittsburgh Pirates|Swinging Friar~San Diego Padres|Lou Seal~San Francisco Giants|Mariner Moose~Seattle Mariners|Fredbird~St. Louis Cardinals|Raymond~Tampa Bay Rays|Rangers Captain~Texas Rangers|Ace~Toronto Blue Jays|Screech~Washington Nationals|The Racing Presidents~Washington Nationals|Mr. Red~Cincinnati Reds|Rosie Red~Cincinnati Reds|Barrelman~Milwaukee Brewers|DJ Kitty~Tampa Bay Rays|Gapper~Cincinnati Reds|Junior~Toronto Blue Jays|Mr. Redlegs~Cincinnati Reds|Phoebe Phanatic~Philadelphia Phillies|Phred~Philadelphia Phillies|Rally Squirrel~St. Louis Cardinals|The Salmon Run~Seattle Mariners|Stinger~Tampa Bay Rays|5-Borough Mascot Race~New York Mets""",
'NHL':"""Wild Wing~Anaheim Ducks|Blades~Boston Bruins|Sabretooth~Buffalo Sabres|Harvey the Hound~Calgary Flames|Stormy the Ice Hog~Carolina Hurricanes|Tommy Hawk~Chicago Blackhawks|Bernie~Colorado Avalanche|Stinger~Columbus Blue Jackets|Victor E. Green~Dallas Stars|Al the Octopus~Detroit Red Wings|Hunter~Edmonton Oilers|Stanley C. Panther~Florida Panthers|Viktor E. Rat~Florida Panthers|Bailey~Los Angeles Kings|Nordy~Minnesota Wild|Youppi!~Montreal Canadiens|Gnash~Nashville Predators|NJ Devil~New Jersey Devils|Sparky the Dragon~New York Islanders|Spartacat~Ottawa Senators|Gritty~Philadelphia Flyers|Iceburgh~Pittsburgh Penguins|S.J. Sharkie~San Jose Sharks|Buoy~Seattle Kraken|Louie~St. Louis Blues|Thunderbug~Tampa Bay Lightning|Carlton the Bear~Toronto Maple Leafs|Tusky~Utah Mammoth|Fin~Vancouver Canucks|Chance~Vegas Golden Knights|Slapshot~Washington Capitals|Mick E. Moose~Winnipeg Jets|Caroline~Carolina Hurricanes|Lil Bern~Colorado Avalanche|METAL!~Montreal Canadiens|Benny~Winnipeg Jets"""
}
# Special requests. Format: name, category, role, identity type, optional character grouping.
SPECIAL="""
Ray Rice~athlete~running_back~human
Michael Vick~athlete~quarterback~human
Ben Roethlisberger~athlete~quarterback~human
Andrew Luck~athlete~quarterback~human
O.J. Simpson~athlete~running_back~human
Secretariat~animal~racehorse~horse
Ron Turcotte~athlete~jockey~human
American Pharoah~animal~racehorse~horse
Victor Espinoza~athlete~jockey~human
Bailey Grupe~athlete~kicker~human
T.J. McConnell~athlete~guard~human
Lance Stephenson~athlete~guard~human
Bobby Knight~coach~coach~human
Ron Artest~athlete~wing~human
Chad Powers~fictional~quarterback~human
Brian Scalabrine~athlete~forward~human
Lightning McQueen~fictional~racecar~vehicle
Eddie Hall~athlete~strongman~human
Shamu~animal~orca~aquatic
Doc Hudson~fictional~racecar~vehicle
Paul Blart~fictional~mall_cop~human
Thad Castle~fictional~linebacker~human
Paul Crewe~fictional~quarterback~human
Kenny Powers~fictional~baseball_pitcher~human
Carson Walton~unverified~unknown~human
Deacon Moss~fictional~football_player~human
Ricky Vaughn~fictional~baseball_pitcher~human
Ricky Bobby~fictional~race_driver~human
Jackie Moon~fictional~basketball_player~human
Jaden Newman~athlete~guard~human
Vontae Mack~fictional~linebacker~human
Bo Callahan~fictional~quarterback~human
Joey Chestnut~athlete~competitive_eater~human
Rudy Gillespie~unverified~unknown~human
Mike Katic~athlete~lineman~human
Peyton Ramsey~athlete~quarterback~human
Zander Diamont~athlete~quarterback~human
Jordan Howard~athlete~running_back~human
Tevin Coleman~athlete~running_back~human
Nate Sudfeld~athlete~quarterback~human
Dennis Rodman~athlete~forward~human
Jack Tuttle~athlete~quarterback~human
Connor Bazelak~athlete~quarterback~human
Brendan Sorsby~athlete~quarterback~human
Micah McFadden~athlete~linebacker~human
Antwaan Randle El~athlete~receiver~human
Dan Feeney~athlete~lineman~human
Tegray Scales~athlete~linebacker~human
Whop Philyor~athlete~receiver~human
Ty Fryfogle~athlete~receiver~human
Peyton Hendershot~athlete~tight_end~human
Boomer Esiason (Prime)~athlete~quarterback~human
Boomer Esiason (Current)~athlete~quarterback~human
Damien Woody~athlete~lineman~human
Anthony Richardson~athlete~quarterback~human
Amari Skolnik~athlete~track~human
Vinny Chase~fictional~actor~human
Turtle (Entourage)~fictional~actor~human
Drama (Entourage)~fictional~actor~human
E (Entourage)~fictional~actor~human
Ari Gold~fictional~agent~human
Tony Soprano~fictional~mob_boss~human
Jon Snow~fictional~knight~human
Arya Stark~fictional~knight~human
The Night King~fictional~fantasy_magic~undead
Hodor~fictional~gentle_giant~human
Tyrion Lannister~fictional~strategist~human
Batman~fictional~superhero~human
Superman~fictional~superhero~human
Homelander~fictional~superhero~human
Billy Butcher~fictional~antihero~human
A-Train (The Boys)~fictional~super_speedster~human
Dominik Szoboszlai~athlete~soccer_midfielder~human
Dustin Brown (Tennis)~athlete~tennis~human
Learner Tien~athlete~tennis~human
Rafael Jódar~athlete~tennis~human
Emma Raducanu~athlete~tennis~human
Jakub Menšík~athlete~tennis~human
Jiří Lehečka~athlete~tennis~human
Paula Badosa~athlete~tennis~human
Taylor Fritz~athlete~tennis~human
Tommy Paul~athlete~tennis~human
Ben Shelton~athlete~tennis~human
Alex Eala~athlete~tennis~human
Iva Jovic~athlete~tennis~human
Daniil Medvedev~athlete~tennis~human
Emilio Nava~athlete~tennis~human
Alex Michelsen~athlete~tennis~human
Dominic Thiem~athlete~tennis~human
Gaël Monfils~athlete~tennis~human
Karen Khachanov~athlete~tennis~human
Nishesh Basavareddy~athlete~tennis~human
Amanda Anisimova~athlete~tennis~human
John McEnroe~athlete~tennis~human
""".strip().splitlines()

# Name reconciliation: avoid 2 profiles for a real athlete due to accent or spelling difference.
ALIASES={'Clyde Bulldog Turner':'bulldog-turner','Amare Ferrell':'amari-ferrell','Mikail Kamara':'mikal-kamara','Jamari Sharpe':'jamari-sharp','Daniil Medvedev':'daniil-medvedev','Dustin Brown (Tennis)':'dustin-brown-tennis','T.J. McConnell':'tj-mcconnell','O.J. Simpson':'oj-simpson','Ron Artest':'metta-world-peace'}
def norm(s):return ''.join(c for c in unicodedata.normalize('NFKD',s).casefold() if c.isalnum())
norm_by_name={norm(a['name']):a for a in athletes}
def slug(s):return re.sub(r'-+','-',re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())).strip('-')

def ratings_for(role,kind,name):
    seed=int(hashlib.sha256((name+':game-v4').encode()).hexdigest()[:12],16)
    rr=random.Random(seed)
    # Conservative baseline: fictional nonhumans/superpowered characters are balanced against sports legends.
    base=dict(physical=67,speed=66,technical=70)
    if role in ('racehorse','racecar','super_speedster'):base.update(physical=81,speed=95,technical=59)
    elif role in ('running_back','receiver','corner','track','tennis','soccer_midfielder'):base.update(physical=71,speed=85,technical=75)
    elif role in ('lineman','strongman','linebacker','gentle_giant'):base.update(physical=94,speed=55,technical=64)
    elif role in ('quarterback','coach','strategist','agent'):base.update(physical=64,speed=63,technical=91)
    elif kind=='mascot':base.update(physical=71,speed=69,technical=71)
    elif role in ('superhero','fantasy_magic'):base.update(physical=83,speed=81,technical=83)
    elif role=='orca':base.update(physical=93,speed=59,technical=70)
    elif role in ('guard','wing'):base.update(physical=68,speed=84,technical=87)
    elif role in ('jockey','horse'):base.update(physical=62,speed=76,technical=82)
    stats={};terms=['strength','acceleration','top_speed','agility','endurance','durability','reflexes','coordination','balance','recovery','striking','grappling','combat_defense','tactical_iq','awareness','composure','adaptability','resourcefulness','leadership','clutch']
    for t in terms:
        if t in ['strength','durability','striking','grappling','combat_defense']:v=base['physical']
        elif t in ['acceleration','top_speed','agility','endurance','reflexes','balance']:v=base['speed']
        else:v=base['technical']
        stats[t]=max(35,min(96,v+rr.randint(-9,9)))
    return stats

def add(name,sport,role,kind='athlete',tags=(),source='user',team=None,render=None,variant=None,needs_review=False,forced_id=None):
    name=name.strip();taglist=list(tags)
    n=norm(name)
    record=None if forced_id else norm_by_name.get(n)
    if not record and not forced_id and name in ALIASES:record=by_id.get(ALIASES[name]);
    if record:
       record.setdefault('collection_tags',[])
       for tag in taglist:
        if tag not in record['collection_tags']:record['collection_tags'].append(tag)
       if team:record.setdefault('teams_referenced',[]);record['teams_referenced'].append(team)
       records.append({'id':record['id'],'name':name,'reused':True,'tags':taglist});return record['id']
    id=forced_id or slug(name)
    if id in by_id:
        id=slug(name+' '+(team or sport));
        if id in by_id:raise ValueError('ID collision '+id)
    r=ratings_for(role,kind,name);h=int(hashlib.sha256(id.encode()).hexdigest()[:8],16);gen=random.Random(h)
    status='NEEDS_IDENTITY_REVIEW' if needs_review else 'NOT_VERIFIED'
    behavior={k:gen.randint(35,77) for k in ['aggression','caution','alliance_drive','loyalty','opportunism']}
    actor={'id':id,'name':name,'sport':sport,'role':role,'number':None,'uniform':'mascot' if kind=='mascot' else 'generic_costume' if kind in ('fictional','animal') else 'football_jersey' if sport=='American Football' else 'generic','era':team or 'Fantasy edition','ratings':r,'behavior':behavior,'perk':'SIGNATURE_V4_'+id.upper().replace('-','_'),'secondary':['SECOND_WIND','FOCUS_MODE'],'kind':kind,'render_type':render or ('vehicle' if role=='racecar' else 'aquatic' if role=='orca' else 'horse' if role=='racehorse' else 'mascot' if kind=='mascot' else 'human'),'team':team,'collection_tags':taglist,'source_url':SOURCES.get(source,source),'verification_status':status,'variant_of':variant,'gameplay_power_tier':'BALANCED'}
    actors_defaults={'strongman':'Heavy Carry','super_speedster':'Breakaway Sprint','superhero':'Dramatic Recovery','racehorse':'Final Stretch','racecar':'Tight Corner','orca':'Splashdown','mascot':'Crowd Surge','quarterback':'Field Read','coach':'Sideline Read','tennis':'Court Coverage','guard':'Fast Break','race_driver':'Corner Cutter','agent':'Quick Deal'}
    perkname=actors_defaults.get(role,actors_defaults.get(kind,'Last Stand'))
    p={'id':actor['perk'],'athlete_id':id,'name':perkname,'trigger':['first_contact','late_finale','open_sprint','group_coordination','under_pressure'][h%5], 'bonus':3+(h%6),'target_stat':'adaptability','stamina_cost':3,'activation_limit':'once_per_match','source':'v4_fictional_game_balance','description':'Fictional, context-aware, strictly capped ability. No canonical superpowers or real-world conduct claims.','validated_against_athlete_biography':False}
    athletes.append(actor);perks['signatures'].append(p);norm_by_name[n]=actor;by_id[id]=actor;records.append({'id':id,'name':name,'reused':False,'tags':taglist});
    if needs_review:reviews.append({'name':name,'reason':'Unverified identity or spelling; user-supplied label retained; not identified as a specific real person.'})
    return id

for rank,name in enumerate(Bears,1):add(name,'American Football','football_legend','athlete',['BEARS_TOP_100'],'bears',team='Chicago Bears',needs_review=False)
for name in IU_STARTERS:add(name,'American Football','college_football','athlete',['IU_2025_CHAMPIONS','IU_STARTERS'],'iu',team='Indiana Hoosiers 2025')
for name in IU_RESERVES:add(name,'American Football','college_football','athlete',['IU_2025_CHAMPIONS','IU_RESERVES'],'iu',team='Indiana Hoosiers 2025')
for name in IU_EXTRA:
 if name in IU_STARTERS or name in IU_RESERVES:continue
 add(name,'American Football','college_football','athlete',['IU_2025_CHAMPIONS','IU_ADDITIONAL'],'iu' if name=='Andrew Turvy' else 'user',team='Indiana Hoosiers 2025',needs_review=name!='Andrew Turvy')
for line in SPECIAL:
 name,kind,role,render=line.split('~')
 variant='anthony-richardson' if name=='Anthony Richardson with Weed' else None
 if name in ('Boomer Esiason (Prime)','Boomer Esiason (Current)'):variant='boomer-esiason'
 sport= 'Tennis' if role=='tennis' else 'Track & Field' if role=='track' else 'Motorsport' if role in ('racecar','race_driver') else 'Association Football' if role=='soccer_midfielder' else 'Basketball' if role in ('guard','forward','wing') else 'Other Sports' if kind in ('animal','fictional','unverified','coach') else 'American Football' if role not in ('strongman','competitive_eater') else 'Other Sports'
 if name=='Dustin Brown (Tennis)':name='Dustin Brown'
 add(name,sport,role,kind,['FRIENDS_REQUESTS'],source='user',render=render,variant=variant,needs_review=kind=='unverified' or name=='Amari Skolnik')
# Independently rated eras, but no ungrounded physical disadvantage implies anything factual about the athlete today.
for suffix in ('prime','current'):
    a=by_id['boomer-esiason-'+suffix]
    if suffix=='prime':
        for k in ['acceleration','top_speed','endurance']:a['ratings'][k]=min(96,a['ratings'][k]+8)
    else:
        for k in ['tactical_iq','leadership','composure']:a['ratings'][k]=min(96,a['ratings'][k]+9)
# Shamu competes with a fictional movable water tank as separate game equipment, not an actual animal welfare claim.
by_id['shamu']['required_equipment']=['fictional_portable_tank']
by_id['shamu']['tank_portable']=True
# Anthony Richardson alternate skin is NOT a separate athlete slot and carries no special gameplay perk.
ar_id='anthony-richardson';
if ar_id in by_id:by_id[ar_id]['skins']=[{'id':'default','label':'Default'},{'id':'alt-green','label':'Anthony Richardson with Weed','description':'Fictional humorous costume only; identical abilities and ratings.'}]
# Avoid giving the horses and jockeys any advantage unless they are separate draft picks.
for team_mascot in COLLEGE_RAW:
 mascot,team=team_mascot.split('~',1)
 add(mascot,'College Mascot','mascot','mascot',['COLLEGE_MASCOTS'],source='college' if mascot!='Hoosier the Bison' else 'https://iuhoosiers.com/news/2026/8/31/iu-announces-series-of-new-experiences-stadium-enhancements-for-the-2026-hoosier-football-season',team=team,render='mascot',forced_id='mascot-college-'+slug(team)+'-'+slug(mascot))
for league,raw in PRO_RAW.items():
 for entry in raw.split('|'):
  mascot,team=entry.split('~',1)
  add(mascot,league+' Mascot','mascot','mascot',['PRO_MASCOTS',league+'_MASCOTS'],league.lower(),team=team,render='mascot',forced_id='mascot-'+league.lower()+'-'+slug(team)+'-'+slug(mascot))
# Distinct variants even when real-world identity is shared. Add only if not already known as a variant.
if 'boomer-esiason-prime' not in by_id:raise ValueError('Missing prime')
if 'boomer-esiason-current' not in by_id:raise ValueError('Missing current')
# Integrity
assert len(set(a['id'] for a in athletes))==len(athletes)
assert len(perks['signatures'])==len(athletes)
assert set(a['id'] for a in athletes)==set(p['athlete_id'] for p in perks['signatures'])
assert set(a['id'] for a in athletes).issuperset(source_ids)
assert len([a for a in athletes if 'COLLEGE_MASCOTS' in a.get('collection_tags',[])])==100
assert len([a for a in athletes if 'BEARS_TOP_100' in a.get('collection_tags',[])])==100
for tag in ['BEARS_TOP_100','IU_2025_CHAMPIONS','FRIENDS_REQUESTS','COLLEGE_MASCOTS','PRO_MASCOTS']:
 collections[tag]=sum(tag in a.get('collection_tags',[]) for a in athletes)
for tag in ['NFL_MASCOTS','NBA_MASCOTS','MLB_MASCOTS','NHL_MASCOTS']:collections[tag]=sum(tag in a.get('collection_tags',[]) for a in athletes)

(ROOT/'roster_v4.json').write_text(json.dumps(athletes,ensure_ascii=False,separators=(',',':')))
(ROOT/'perks_v4.json').write_text(json.dumps(perks,ensure_ascii=False,separators=(',',':')))
manifest={'version':'v4.0-underlying-game','total_unique':len(athletes),'original_athletes':len(source_ids),'added':len(athletes)-len(source_ids),'collections':collections,'source_links':SOURCES,'review_needed':reviews,'no_official_mascot_programs':{'NFL':['Green Bay Packers','Los Angeles Chargers','New York Giants','New York Jets'],'NBA':['Brooklyn Nets','Golden State Warriors','Los Angeles Lakers','New York Knicks'],'MLB':['Los Angeles Angels','Los Angeles Dodgers','New York Yankees'],'NHL':['New York Rangers']},'selection_policy':'All 100 Bears in one collection; existing players never duplicated. College 100 unique schools. Historical teams and variants share identity via tags. Ratings fictional and standardized.'}
(ROOT/'manifest_v4.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
with (ROOT/'catalog_v4.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['id','name','category','role','team','collections','identity_review']);
 for a in athletes:w.writerow([a['id'],a['name'],a.get('kind','athlete'),a['role'],a.get('team',''),';'.join(a.get('collection_tags',[])),a.get('verification_status','original')])
print(json.dumps({'total':len(athletes),'added':len(athletes)-700,'collections':collections,'reviews':len(reviews)},indent=2))
