'use strict';
/* Open IPTV Pro Web Cast icons — one self-contained, deterministic inline-SVG source.
 * The Cast silhouette follows the familiar Material-style screen + bottom-left arcs.
 * No icon fonts, emoji, data-URI masks or pseudo-element icons. Keep this source
 * shared by the player control, Cast modal, and the standalone TV receiver.
 */
(function(root){
 if(!root?.document)return;
 const doc=root.document, NS='http://www.w3.org/2000/svg';
 const ICONS=Object.freeze({
  cast:{fill:true,paths:[
   'M1 18v3h3c0-1.66-1.34-3-3-3z',
   'M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z',
   'M1 10v2c4.97 0 9 4.03 9 9h2C12 14.92 7.08 10 1 10z',
   'M1 3v5h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H3C1.9 3 1 3.9 1 5z'
  ]},
  airplay:{fill:false,paths:['M6 4h12a2 2 0 0 1 2 2v9','M4 15V6a2 2 0 0 1 2-2','M12 13l5.7 7.2H6.3L12 13z']},
  pair:{fill:false,paths:['M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z','M9 22h6','M12 19v3','M10.5 11l3-0.1','M9.75 8.5h-0.5a2.5 2.5 0 0 0 0 5h1.5','M13.25 8.5h1.5a2.5 2.5 0 0 1 0 5h-.5']},
  search:{fill:false,paths:['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z','M21 21l-4.35-4.35']},
  link:{fill:false,paths:['M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 1 0-7.1-7.1l-1.7 1.7','M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7']},
  copy:{fill:false,paths:['M8 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3','M10 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z']},
  play:{fill:true,paths:['M8 5.5a1 1 0 0 1 1.52-.85l10.1 6.5a1 1 0 0 1 0 1.7l-10.1 6.5A1 1 0 0 1 8 18.5z']},
  pause:{fill:true,paths:['M6 5h4v14H6z','M14 5h4v14h-4z']},
  stop:{fill:true,paths:['M6 6h12v12H6z']},
  close:{fill:false,paths:['M18 6 6 18','M6 6l12 12']},
  refresh:{fill:false,paths:['M20 11a8 8 0 0 0-14-5L4 8','M4 4v4h4','M4 13a8 8 0 0 0 14 5l2-2','M20 20v-4h-4']},
  check:{fill:false,paths:['M20 6 9 17l-5-5']}
 });
 function svg(name){
  const def=ICONS[name];
  if(!def)throw Error('Unsupported Open IPTV Cast icon: '+name);
  const el=doc.createElementNS(NS,'svg');
  el.setAttribute('data-iptv-svg-icon',name);
  el.setAttribute('class','oip-cast-svg');
  el.setAttribute('viewBox','0 0 24 24');
  el.setAttribute('width','24');el.setAttribute('height','24');
  el.setAttribute('aria-hidden','true');el.setAttribute('focusable','false');
  el.setAttribute('fill',def.fill?'currentColor':'none');
  if(!def.fill){
   el.setAttribute('stroke','currentColor');
   el.setAttribute('stroke-width','1.9');
   el.setAttribute('stroke-linecap','round');
   el.setAttribute('stroke-linejoin','round');
  }
  for(const d of def.paths){const p=doc.createElementNS(NS,'path');p.setAttribute('d',d);el.appendChild(p);}
  return el;
 }
 function replace(el,name,label){
  if(!el)return;
  if(el.firstElementChild?.getAttribute?.('data-iptv-svg-icon')===name &&
    (label===undefined || el.textContent.trim()===label))return;
  if(label===undefined)el.replaceChildren(svg(name));
  else el.replaceChildren(svg(name),doc.createTextNode(label));
 }
 function ensurePlayerButton(){
  const button=doc.getElementById('castBtn');
  if(!button)return;
  const icon=button.querySelector(':scope > svg[data-iptv-svg-icon="cast"]');
  const label=button.querySelector(':scope > .cast-label');
  if(!icon){
   // app.js can replace textContent at any time. Recreate the exact same SVG.
   const newIcon=svg('cast');
   const caption=label||doc.createElement('span');
   if(!label){caption.className='cast-label';caption.textContent='Cast / AirPlay';}
   button.replaceChildren(newIcon,caption);
  }else{
   // Old direct text glyphs are removed by web-player-icons.js, but this also
   // runs when that module is skipped or loaded after another player rewrite.
   for(const child of Array.from(button.childNodes))
    if(child.nodeType===3 && child.textContent.trim())button.removeChild(child);
  }
  button.setAttribute('aria-label','Cast / AirPlay lên TV');
  button.setAttribute('title','Cast / AirPlay lên TV');
 }
 let observer=null;
 function watchPlayerButton(){
  const button=doc.getElementById('castBtn');
  if(!button||observer)return;
  ensurePlayerButton();
  if(typeof root.MutationObserver==='function'){
   observer=new root.MutationObserver(()=>{
    if(!button.querySelector(':scope > svg[data-iptv-svg-icon="cast"]'))ensurePlayerButton();
   });
   observer.observe(button,{childList:true});
  }
 }
 function decorateModal(panel){
  if(!panel)return;
  const map=[
   ['.cx-icon','cast'],['#cxTabPair','pair','Ghép đôi TV'],
   ['#cxTabCast','cast','Google Cast'],['#cxTabAir','airplay','AirPlay'],
   ['#cxPaneCast .cx-featureicon','cast'],['#cxPaneAir .cx-featureicon','airplay'],
   ['#cxCopyTv','copy','Sao chép'],['#cxCopyTvOriginal','copy','Sao chép'],['#cxConnect','link','Kết nối'],
   ['#cxRemotePlay','play','Phát lên TV'],['#cxRemotePause','pause','Tạm dừng'],
   ['#cxRemoteResume','play','Tiếp tục'],['#cxRemoteStop','stop','Dừng'],
   ['#cxCastScan','search','Tìm thiết bị'],['#cxCastPlay','play','Phát trên TV'],
   ['#cxCastStop','stop','Dừng'],['#cxAirOpen','airplay','Chọn TV bằng AirPlay'],
   ['#cxClose','close']
  ];
  for(const [selector,name,label] of map)replace(panel.querySelector(selector),name,label);
  const brand=panel.querySelector('.cx-tvlogo');
  if(brand)replace(brand,'cast','OPEN IPTV PRO · TV');
 }
 function decorateTv(){
  const map=[
   ['.tv-pill','cast','OPEN IPTV PRO · TV'],
   ['#tvNewPin','refresh','Tạo mã mới'],['#tvAllow','check','Cho phép kết nối'],
   ['#tvDeny','close','Từ chối'],['#tvLocalPlay','play','Phát trên TV'],
   ['#tvLocalPause','pause','Tạm dừng']
  ];
  for(const [selector,name,label] of map)replace(doc.querySelector(selector),name,label);
 }
 /* Mobile player Cast button already has an SVG. Only decorate this popup. */
 if(doc.querySelector('.iptv-tv-body'))decorateTv();
 root.OpenIPTVCastIcons=Object.freeze({svg,replace,ensurePlayerButton,watchPlayerButton,decorateModal,decorateTv,names:Object.keys(ICONS)});
})(typeof window==='undefined'?null:window);
