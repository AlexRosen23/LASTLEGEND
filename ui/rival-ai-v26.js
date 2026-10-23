/* V26 rivalry memory: optional opponent-target weighting from match history. */
(function(){'use strict';
function init(){const el=document.querySelector('#draft-view .rules');if(!el||document.getElementById('v26-ai'))return;
const label=document.createElement('label');label.className='v26-setting';label.innerHTML='<span>ADVANCED RIVALRY AI</span><span class="toggle-line"><input type="checkbox" id="v26-ai" checked> In-match opponent memory</span>';el.appendChild(label);}
window.LastLegendRivalAI={enabled:()=>!!document.getElementById('v26-ai')?.checked};
document.addEventListener('DOMContentLoaded',init);
})();