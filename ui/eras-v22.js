/* V22 historically grounded career-edition catalog. Game ratings intentionally inherit originals. */
(function(){
'use strict';
const eras=[
 ['shaquille-o-neal','Orlando Magic','1994-95',32],
 ['shaquille-o-neal','Miami Heat','2005-06',32],
 ['kevin-durant','Golden State Warriors','2016-17',35],
 ['kevin-durant','Brooklyn Nets','2021-22',7],
 ['kevin-durant','Phoenix Suns','2023-24',35],
 ['cristiano-ronaldo','Manchester United','2007-08',7],
 ['cristiano-ronaldo','Juventus','2018-19',7],
 ['wayne-gretzky','Los Angeles Kings','1992-93',99],
 ['michael-jordan','Washington Wizards','2002-03',23],
 ['aaron-rodgers','New York Jets','2023',8],
 ['alex-rodriguez','Seattle Mariners','1996',3],
 ['patrick-mahomes','Kansas City Chiefs','2019',15]
];
function install(){
 if(typeof opts==='undefined'||!opts.profiles||!opts.perks)return 0;let count=0;
 for(const [parent,team,era,number] of eras){
  const base=opts.profiles.get(parent),id=parent+'-'+team.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+era.replace(/[^0-9]/g,'');
  if(!base||opts.profiles.has(id))continue;
  const sig=opts.perks.signatures.find(p=>p.athlete_id===parent);
  if(!sig)continue;
  const edition={...base,id,team,era:team+' '+era,number,edition_of:parent,verification_status:'PROVISIONAL',
    ratings:{...base.ratings},behavior:{...base.behavior},secondary:[...base.secondary],perk:sig.id+'__'+id,
    source_url:null,source_note:'Historical team/era; edition ratings cloned from base fictional game profile'};
  opts.athletes.push(edition);opts.profiles.set(id,edition);opts.perks.signatures.push({...sig,id:edition.perk,athlete_id:id});
  count++;
 }
 if(count){window.LastLegendSpectator?.refreshTeamOptions?.();renderGrid();window.LastLegendWebsite?.renderLegends?.();window.LastLegendWebsite?.renderLobby?.();}
 return count;
}
window.LastLegendErasV22=Object.freeze({eras,install});
document.addEventListener('DOMContentLoaded',()=>{if(opts?.profiles)install();else window.addEventListener('load',install,{once:true});});
})();