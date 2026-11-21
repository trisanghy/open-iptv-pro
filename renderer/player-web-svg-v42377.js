'use strict';
/* Electron adaptation of web/online/web-player-icons.js:
   CSS SVG masks from same Web bundle, native app handlers remain intact. */
(()=>{
 const video=document.getElementById('video');
 if(!video)return;
 const get=id=>document.getElementById(id);
 const buttons=['playBtn','fsPlay'].map(get).filter(Boolean);
 const direct=(id,label)=>{const b=get(id);if(b&&!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.title||label);};
 for(const [id,label] of [['prevBtn','Kênh trước'],['playBtn','Phát'],['stopBtn','Dừng'],['nextBtn','Kênh sau'],['fsPrev','Kênh trước'],['fsPlay','Phát'],['fsNext','Kênh sau'],['fsExit','Thoát toàn màn hình'],['fullscreenBtn','Toàn màn hình'],['openGuideBtn','Lịch phát sóng'],['favCurrentBtn','Yêu thích']])direct(id,label);
 // The legacy play handlers still replace button.textContent with ▶ or Ⅱ;
 // the vector artwork is selected by data-iptv-playing, independent of glyph.
 function sync(){
  const playing=!video.paused&&!video.ended;
  for(const b of buttons){
   b.dataset.iptvPlaying=String(playing);
   b.setAttribute('aria-label',playing?'Tạm dừng':'Phát');
   b.title=playing?'Tạm dừng':'Phát';
  }
  const expanded=!!document.fullscreenElement;
  const fullscreen=get('fullscreenBtn');
  if(fullscreen)fullscreen.setAttribute('aria-pressed',String(expanded));
  const favorite=get('fsWebFav');
  if(favorite)favorite.setAttribute('aria-pressed',get('favCurrentBtn')?.getAttribute('aria-pressed')||'false');
 }
 for(const e of ['playing','play','pause','ended','emptied','loadedmetadata','volumechange'])video.addEventListener(e,sync,{passive:true});
 document.addEventListener('fullscreenchange',sync);
 const original=get('favCurrentBtn');
 if(original&&typeof MutationObserver==='function')new MutationObserver(sync).observe(original,{attributes:true,attributeFilter:['aria-pressed']});
 // Pre-paint happens in CSS. This sync also runs on the first renderer tick.
 sync();
})();
