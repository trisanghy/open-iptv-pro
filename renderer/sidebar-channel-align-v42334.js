'use strict';
/* Keep the channel-list reopen button aligned with the sidebar hamburger.
   The measurement is screen-aware, so Mac title bars, navigation presets,
   scroll and window resizing do not require hard-coded y offsets. */
(() => {
  const root=document.documentElement;
  const listLayout=document.querySelector('#page-tv .tv-layout');
  const openButton=document.getElementById('channelPanelShowBtn');
  const sidebarToggle=document.getElementById('sidebarToggleBtn');
  if(!listLayout || !openButton || !sidebarToggle)return;
  let pending=false;
  function measure(){
    pending=false;
    const sideRect=sidebarToggle.getBoundingClientRect();
    const layoutRect=listLayout.getBoundingClientRect();
    if(sideRect.height>0 && layoutRect.height>0){
      const height=Math.round(sideRect.height);
      const size=Math.max(22,Math.round(height/2));
      const y=Math.round(sideRect.top-layoutRect.top+(height-size)/2);
      listLayout.style.setProperty('--channel-tab-y',`${y}px`);
      listLayout.style.setProperty('--channel-button-size',`${height}px`);
      listLayout.style.setProperty('--channel-reopen-size',size+'px');
    }
  }
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(measure);
  }
  const observer=new MutationObserver(schedule);
  observer.observe(root,{attributes:true,attributeFilter:['data-sidebar-visible','data-channel-panel-visible','data-ui-style','data-nav-layout']});
  window.addEventListener('resize',schedule,{passive:true});
  document.querySelector('.content')?.addEventListener('scroll',schedule,{passive:true});
  if(window.ResizeObserver){
    const resize=new ResizeObserver(schedule);
    resize.observe(sidebarToggle);
    resize.observe(listLayout);
  }
  schedule();
})();
