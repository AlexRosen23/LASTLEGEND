/* V28 portable device-owned data. Authenticated online accounts need a separate backend. */
(function(){'use strict';const $=id=>document.getElementById(id);
function exportData(){
const raw=localStorage.getItem('lastlegend.history.v7'),custom=localStorage.getItem('lastlegend.custom.v27');
const value={format:'lastlegend-portable-v1',exported_at:new Date().toISOString(),history:raw?JSON.parse(raw):[],custom:custom?JSON.parse(custom):[]};
const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
const a=document.createElement('a');a.href=url;a.download='lastlegend-local-data.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function init(){const host=$('site-champions');if(!host||$('v28-data'))return;const box=document.createElement('section');box.id='v28-data';box.className='ll-future-panel';
box.innerHTML='<div class="site-eyebrow">V28 / DATA PORTABILITY</div><h3>OWN YOUR LOCAL RESULTS</h3><p>Export your device-only champion records and custom fictional legends. Global leaderboards, cross-device accounts and online tournament services require an audited and secured backend and are not currently live.</p><button type="button" class="site-secondary" id="v28-export">EXPORT LOCAL DATA ↓</button>';
host.appendChild(box);$('v28-export').addEventListener('click',exportData);}
window.LastLegendDataV28=Object.freeze({exportData});
document.addEventListener('DOMContentLoaded',init);
})();