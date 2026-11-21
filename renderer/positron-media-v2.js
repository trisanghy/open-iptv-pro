'use strict';
/* Positron P5.1.54: visual-only media icon system and playback state.
 * The original buttons, click handlers, playback, EPG and IPC are untouched.
 * No playlist or URL is loaded by this module.
 */
(()=>{
 const d=document,root=d.documentElement;
 if(root.dataset.positron!=='true'||!d.getElementById('page-tv'))return;
 const ns='http://www.w3.org/2000/svg';
 function svgIcon(paths){
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('width','20');svg.setAttribute('height','20');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  svg.classList.add('po-media-svg');
  for(const shape of paths){
   const p=d.createElementNS(ns,shape.type||'path');
   for(const [key,value] of Object.entries(shape.props||{d:shape.d}))p.setAttribute(key,String(value));
   svg.append(p);
  }
  return svg;
 }
 const icons={
  prevBtn:[{d:'M7 5v14'},{d:'M19 5 9 12l10 7V5Z'}],
  stopBtn:[{type:'rect',props:{x:6,y:6,width:12,height:12,rx:2}}],
  nextBtn:[{d:'M17 5v14'},{d:'M5 5l10 7-10 7V5Z'}],
  castBtn:[{d:'M4 10V5h16v14h-5'},{d:'M4 14a6 6 0 0 1 6 6'},{d:'M4 18a2 2 0 0 1 2 2'}],
  pipBtn:[{type:'rect',props:{x:3,y:4,width:18,height:16,rx:2}},{type:'rect',props:{x:11,y:11,width:8,height:6,rx:1}}],
  fullscreenBtn:[{d:'M8 4H4v4'},{d:'M16 4h4v4'},{d:'M4 16v4h4'},{d:'M20 16v4h-4'}]
 };
 const outputs={castBtn:'Cast / AirPlay',pipBtn:'PiP',fullscreenBtn:''};
 for(const [id,paths] of Object.entries(icons)){
  const button=d.getElementById(id);if(!button)continue;
  const icon=svgIcon(paths);
  if(Object.hasOwn(outputs,id)){
   const label=outputs[id];
   if(label){
    const caption=d.createElement('span');caption.className='po-media-caption';caption.textContent=label;
    button.replaceChildren(icon,caption);
   }else button.replaceChildren(icon);
  }else button.replaceChildren(icon);
  button.dataset.poMediaV2='true';
  if(id==='fullscreenBtn')button.setAttribute('aria-label','Toàn màn hình');
  if(id==='castBtn')button.setAttribute('aria-label','Cast hoặc AirPlay lên màn hình ngoài');
  if(id==='pipBtn')button.setAttribute('aria-label','Cửa sổ nổi Picture-in-Picture');
 }
 // Native app.js writes ▶ / Ⅱ into #playBtn on pause/play. Mirror
 // that text as a CSS flag; do not overwrite it or replace its listeners.
 const play=d.getElementById('playBtn');
 if(play){
  const update=()=>{
   const glyph=(play.textContent||'').trim();
   const isPlaying=glyph.includes('Ⅱ')||glyph.includes('❚')||glyph.includes('⏸');
   play.dataset.poPlaying=isPlaying?'true':'false';
   play.setAttribute('aria-label',isPlaying?'Tạm dừng phát':'Phát kênh');
   play.title=isPlaying?'Tạm dừng':'Phát';
  };
  new MutationObserver(update).observe(play,{childList:true,characterData:true,subtree:true});
  update();
 }
 // Replace only decorative icons in the most-used navigation entries.
 // Keep button nodes, aria/page routing, counts and focus targets intact.
 const navIcons={
  tv:[{type:'rect',props:{x:3,y:5,width:18,height:14,rx:2}},{d:'M8 22h8M12 19v3'}],
  fav:[{d:'m12 3 2.9 5.85 6.45.94-4.66 4.54 1.1 6.42L12 17.6l-5.79 3.05 1.1-6.42-4.66-4.54 6.45-.94Z'}],
  epg:[{type:'rect',props:{x:3,y:5,width:18,height:16,rx:2}},{d:'M7 3v4m10-4v4M3 10h18M7 14h4m-4 3h8'}],
  sources:[{d:'M4 6h16M4 12h16M4 18h16'},{type:'circle',props:{cx:8,cy:6,r:1,fill:'currentColor'}},{type:'circle',props:{cx:15,cy:12,r:1,fill:'currentColor'}}],
  settings:[{type:'circle',props:{cx:12,cy:12,r:3}},{d:'M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'}]
 };
 for(const [page,paths] of Object.entries(navIcons)){
  const icon=d.querySelector('#appSidebar .nav[data-page="'+page+'"] > span');
  if(!icon)continue;
  icon.replaceChildren(svgIcon(paths));
  icon.setAttribute('aria-hidden','true');
 }
 root.dataset.poMediaV2='true';
})();
