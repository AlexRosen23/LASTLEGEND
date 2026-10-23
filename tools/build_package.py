import csv, json, re
from collections import Counter
from pathlib import Path
P=Path('/mnt/data/last_legend_preproduction')
# Curated candidate index. Uniform numbers are intentionally blank pending sport/era-specific verification.
rosters = {
'Basketball': '''Michael Jordan|23|Bulls 1995-96
LeBron James|23|Cavaliers 2015-16
Kobe Bryant|24|Lakers 2007-08
Shaquille O'Neal|34|Lakers 1999-00
Stephen Curry|30|Warriors 2015-16
Magic Johnson|32|Lakers 1986-87
Larry Bird|33|Celtics 1985-86
Kareem Abdul-Jabbar|33|Lakers 1979-80
Wilt Chamberlain|13|76ers 1966-67
Bill Russell|6|Celtics 1961-62
Tim Duncan|21|Spurs 2002-03
Kevin Durant|35|Thunder 2013-14
Hakeem Olajuwon|34|Rockets 1993-94
Giannis Antetokounmpo|34|Bucks 2019-20
Nikola Jokić|15|Nuggets 2022-23
Dwyane Wade|3|Heat 2008-09
Dirk Nowitzki|41|Mavericks 2010-11
Allen Iverson|3|76ers 2000-01
Charles Barkley|34|Suns 1992-93
Kevin Garnett|5|Celtics 2007-08
David Robinson|50|Spurs 1994-95
Oscar Robertson|14|Royals 1963-64
Jerry West|44|Lakers 1969-70
Julius Erving|6|76ers 1980-81
Kawhi Leonard|2|Raptors 2018-19
James Harden|13|Rockets 2017-18
Russell Westbrook|0|Thunder 2016-17
Luka Dončić|77|Mavericks 2023-24
Chris Paul|3|Hornets 2007-08
Anthony Davis|23|Pelicans 2017-18
Lisa Leslie|9|Sparks 2001
Diana Taurasi|3|Mercury 2009
Maya Moore|23|Lynx 2014
Candace Parker|3|Sparks 2013
A'ja Wilson|22|Aces 2023''',
'American Football': '''Tom Brady|12|Patriots 2007
Patrick Mahomes|15|Chiefs 2022
Jerry Rice|80|49ers 1995
Jim Brown|32|Browns 1963
Walter Payton|34|Bears 1977
Barry Sanders|20|Lions 1997
Peyton Manning|18|Colts 2004
Joe Montana|16|49ers 1989
Aaron Rodgers|12|Packers 2011
Dan Marino|13|Dolphins 1984
Brett Favre|4|Packers 1996
Randy Moss|84|Vikings 2003
Calvin Johnson|81|Lions 2012
Terrell Owens|81|Eagles 2004
Rob Gronkowski|87|Patriots 2011
Travis Kelce|87|Chiefs 2022
Tyreek Hill|10|Dolphins 2023
Deion Sanders|21|Falcons 1992
Lawrence Taylor|56|Giants 1986
Reggie White|92|Packers 1998
Ray Lewis|52|Ravens 2000
Ed Reed|20|Ravens 2004
Troy Polamalu|43|Steelers 2010
J.J. Watt|99|Texans 2014
Aaron Donald|99|Rams 2018
Derrick Henry|22|Titans 2020
Adrian Peterson|28|Vikings 2012
Lamar Jackson|8|Ravens 2019
Michael Vick|7|Falcons 2004
Bo Jackson|34|Raiders 1990''',
'Association Football': '''Lionel Messi|10|Barcelona 2011-12
Cristiano Ronaldo|7|Real Madrid 2013-14
Pelé|10|Brazil 1970
Diego Maradona|10|Argentina 1986
Zinedine Zidane|10|France 1998
Ronaldo Nazário|9|Brazil 2002
Ronaldinho|10|Barcelona 2005-06
Kylian Mbappé|10|France 2022
Neymar|10|Brazil 2014
Thierry Henry|14|Arsenal 2003-04
Andrés Iniesta|8|Barcelona 2010-11
Xavi Hernández|6|Barcelona 2010-11
Luka Modrić|10|Croatia 2018
Kevin De Bruyne|17|Manchester City 2022-23
Erling Haaland|9|Manchester City 2022-23
Mohamed Salah|11|Liverpool 2017-18
Robert Lewandowski|9|Bayern Munich 2019-20
George Best|7|Manchester United 1967-68
Johan Cruyff|14|Netherlands 1974
Franz Beckenbauer|5|West Germany 1974
Paolo Maldini|3|AC Milan 2002-03
Sergio Ramos|4|Real Madrid 2013-14
Virgil van Dijk|4|Liverpool 2018-19
Manuel Neuer|1|Germany 2014
Gianluigi Buffon|1|Italy 2006
Marta|10|Brazil 2007
Alex Morgan|13|USA 2019
Mia Hamm|9|USA 1999
Alexia Putellas|11|Barcelona 2021-22
Aitana Bonmatí|14|Spain 2023''',
'Baseball': '''Babe Ruth|3|Yankees 1927
Willie Mays|24|Giants 1954
Hank Aaron|44|Braves 1957
Barry Bonds|25|Giants 2001
Ted Williams|9|Red Sox 1941
Jackie Robinson|42|Dodgers 1949
Mickey Mantle|7|Yankees 1956
Ken Griffey Jr.|24|Mariners 1997
Derek Jeter|2|Yankees 1999
Alex Rodriguez|13|Yankees 2007
Shohei Ohtani|17|Dodgers 2024
Mike Trout|27|Angels 2012
Albert Pujols|5|Cardinals 2009
Ichiro Suzuki|51|Mariners 2004
Rickey Henderson|24|Athletics 1982
Pedro Martínez|45|Red Sox 1999
Randy Johnson|51|Diamondbacks 2001
Nolan Ryan|34|Rangers 1991
Sandy Koufax|32|Dodgers 1965
Mariano Rivera|42|Yankees 2004''',
'Ice Hockey': '''Wayne Gretzky|99|Oilers 1983-84
Mario Lemieux|66|Penguins 1988-89
Sidney Crosby|87|Penguins 2016-17
Alex Ovechkin|8|Capitals 2007-08
Connor McDavid|97|Oilers 2022-23
Gordie Howe|9|Red Wings 1952-53
Bobby Orr|4|Bruins 1969-70
Jaromír Jágr|68|Penguins 1998-99
Patrick Kane|88|Blackhawks 2015-16
Jonathan Toews|19|Blackhawks 2012-13
Dominik Hašek|39|Sabres 1997-98
Martin Brodeur|30|Devils 2002-03
Nicklas Lidström|5|Red Wings 2007-08
Carey Price|31|Canadiens 2014-15
Hilary Knight|21|USA 2018''',
'Boxing & MMA': '''Muhammad Ali||Boxing trunks
Mike Tyson||Boxing trunks
Floyd Mayweather Jr.||Boxing trunks
Manny Pacquiao||Boxing trunks
Sugar Ray Robinson||Boxing trunks
Sugar Ray Leonard||Boxing trunks
Joe Frazier||Boxing trunks
George Foreman||Boxing trunks
Joe Louis||Boxing trunks
Rocky Marciano||Boxing trunks
Roberto Durán||Boxing trunks
Canelo Álvarez||Boxing trunks
Claressa Shields||Boxing trunks
Katie Taylor||Boxing trunks
Conor McGregor||MMA shorts
Khabib Nurmagomedov||MMA shorts
Jon Jones||MMA shorts
Georges St-Pierre||MMA shorts
Anderson Silva||MMA shorts
Amanda Nunes||MMA shorts
Ronda Rousey||MMA shorts
Valentina Shevchenko||MMA shorts''',
'Track & Field': '''Usain Bolt||Jamaica sprint singlet
Carl Lewis||USA track singlet
Florence Griffith Joyner||USA track singlet
Allyson Felix||USA track singlet
Shelly-Ann Fraser-Pryce||Jamaica sprint singlet
Elaine Thompson-Herah||Jamaica sprint singlet
Noah Lyles||USA track singlet
Michael Johnson||USA track singlet
Wayde van Niekerk||South Africa track singlet
Jesse Owens||USA track singlet
Eliud Kipchoge||Kenya distance kit
Haile Gebrselassie||Ethiopia distance kit
Kenenisa Bekele||Ethiopia distance kit
Mo Farah||Great Britain distance kit
Sydney McLaughlin-Levrone||USA track singlet
Armand Duplantis||Sweden pole vault kit
Mondo Duplantis||ALIAS: Armand Duplantis
Jackie Joyner-Kersee||USA track singlet''',
'Swimming': '''Michael Phelps||USA swim kit
Katie Ledecky||USA swim kit
Caeleb Dressel||USA swim kit
Mark Spitz||USA swim kit
Ian Thorpe||Australia swim kit
Ryan Lochte||USA swim kit
Adam Peaty||Great Britain swim kit
Sarah Sjöström||Sweden swim kit
Simone Manuel||USA swim kit
Missy Franklin||USA swim kit
Kristin Otto||East Germany swim kit
Alexander Popov||Russia swim kit''',
'Tennis': '''Serena Williams||Tennis kit
Venus Williams||Tennis kit
Roger Federer||Tennis kit
Rafael Nadal||Tennis kit
Novak Djokovic||Tennis kit
Carlos Alcaraz||Tennis kit
Jannik Sinner||Tennis kit
Steffi Graf||Tennis kit
Martina Navratilova||Tennis kit
Chris Evert||Tennis kit
Billie Jean King||Tennis kit
Pete Sampras||Tennis kit
Andre Agassi||Tennis kit
Björn Borg||Tennis kit
Naomi Osaka||Tennis kit
Iga Świątek||Tennis kit''',
'Gymnastics': '''Simone Biles||Gymnastics leotard
Nadia Comăneci||Gymnastics leotard
Suni Lee||Gymnastics leotard
Gabby Douglas||Gymnastics leotard
Aly Raisman||Gymnastics leotard
Kohei Uchimura||Gymnastics singlet
Daiki Hashimoto||Gymnastics singlet
Rebeca Andrade||Gymnastics leotard
Olga Korbut||Gymnastics leotard
Larisa Latynina||Gymnastics leotard''',
'Golf': '''Tiger Woods||Golf polo
Jack Nicklaus||Golf polo
Arnold Palmer||Golf polo
Rory McIlroy||Golf polo
Scottie Scheffler||Golf polo
Phil Mickelson||Golf polo
Brooks Koepka||Golf polo
Nelly Korda||Golf polo
Annika Sörenstam||Golf polo
Lydia Ko||Golf polo''',
'Cycling': '''Eddy Merckx||Cycling jersey
Lance Armstrong||Cycling jersey
Tadej Pogačar||Cycling jersey
Jonas Vingegaard||Cycling jersey
Marianne Vos||Cycling jersey
Chris Froome||Cycling jersey''',
'Motorsport': '''Lewis Hamilton|44|Formula One racing suit
Michael Schumacher|1|Formula One racing suit
Ayrton Senna|12|Formula One racing suit
Max Verstappen|1|Formula One racing suit
Fernando Alonso|14|Formula One racing suit
Dale Earnhardt|3|NASCAR racing suit
Richard Petty|43|NASCAR racing suit''',
'Snow Sports': '''Lindsey Vonn||Ski racing suit
Mikaela Shiffrin||Ski racing suit
Bode Miller||Ski racing suit
Ingemar Stenmark||Ski racing suit
Shaun White||Snowboarding kit
Chloe Kim||Snowboarding kit''',
'Cricket': '''Sachin Tendulkar|10|India cricket uniform
Virat Kohli|18|India cricket uniform
MS Dhoni|7|India cricket uniform
Don Bradman||Australia cricket uniform
Brian Lara||West Indies cricket uniform
Shane Warne|23|Australia cricket uniform
Ellyse Perry|8|Australia cricket uniform''',
'Other Sports': '''Bo Jackson||ALIAS: American Football
Jim Thorpe||Multi-sport retro athletic kit
Hakuho Sho||Sumo mawashi
Teddy Riner||Judo gi
Mijaín López||Wrestling singlet
Kelly Slater||Surfing wetsuit'''
}
# Swap deliberate name-alias placeholders for unique real people in their categories.
rosters['Track & Field'] = rosters['Track & Field'].replace('Mondo Duplantis||ALIAS: Armand Duplantis','Yulimar Rojas||Venezuela triple jump kit')
rosters['Other Sports'] = rosters['Other Sports'].replace('Bo Jackson||ALIAS: American Football', 'Mondo Duplantis||ALIAS: Armand Duplantis')
# Replace the alias in Other Sports with independent known competitor.
rosters['Other Sports'] = rosters['Other Sports'].replace('Mondo Duplantis||ALIAS: Armand Duplantis', 'Aleksandr Karelin||Wrestling singlet')
# Parse candidate index
rows=[]
for sport,block in rosters.items():
    lines=[l.strip() for l in block.splitlines() if l.strip()]
    for l in lines:
        name,num,appearance=l.split('|',2)
        rid=re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-')
        outfit = {'Basketball':'basketball_jersey','American Football':'football_pads_jersey','Association Football':'soccer_kit','Baseball':'baseball_jersey','Ice Hockey':'hockey_jersey','Boxing & MMA':'combat_trunks','Track & Field':'track_singlet','Swimming':'swim_kit','Tennis':'tennis_kit','Gymnastics':'gymnastics_kit','Golf':'golf_polo','Cycling':'cycling_jersey','Motorsport':'racing_suit','Snow Sports':'winter_sport_kit','Cricket':'cricket_uniform','Other Sports':'specialty_kit'}[sport]
        rows.append(dict(id=rid, display_name=name, sport=sport, draft_uniform_context=appearance, uniform_type=outfit, jersey_number=num, number_type='jersey_or_race' if num else 'none_or_event_specific', appearance_verification='NEEDS_REVIEW', rating_verification='NOT_SCORED', perks_verification='NOT_ASSIGNED', rights_review='PENDING'))
counts=Counter(r['sport'] for r in rows)
print('sport counts',counts, 'total',len(rows))
ids=Counter(r['id'] for r in rows)
print('duplicate IDs',[x for x,c in ids.items() if c>1]); print('duplicate names',[x for x,c in Counter(r['display_name'] for r in rows).items() if c>1])
assert len(rows)==250, 'Incorrect count'
assert not [x for x,c in ids.items() if c>1]
with open(P/'roster_250_candidate_index.csv','w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
with open(P/'roster_250_candidate_index.json','w',encoding='utf-8') as f: json.dump(rows,f,indent=2,ensure_ascii=False)
