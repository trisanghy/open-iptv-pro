'use strict';
/* Twenty NEW real-Electron screenshot scenarios after the preserved P4 audit.
   Each captures a specific page/viewport/theme and carries measured feedback. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds');
const cases=[
 ['TV 1360 Nebula','tv',1360,'night'],
 ['TV 1250 Nebula','tv',1250,'night'],
 ['TV 1000 Nebula','tv',1000,'night'],
 ['TV 900 Nebula','tv',900,'night'],
 ['TV 800 Nebula','tv',800,'night'],
 ['TV 720 Nebula','tv',720,'night'],
 ['TV 600 Nebula','tv',600,'night'],
 ['TV 540 Nebula','tv',540,'night'],
 ['TV 450 Nebula','tv',450,'night'],
 ['TV 1360 Aurora','tv',1360,'aurora'],
 ['TV 720 Aurora','tv',720,'aurora'],
 ['TV 1360 Graphite','tv',1360,'graphite'],
 ['TV 720 Graphite','tv',720,'graphite'],
 ['Sources 1360','sources',1360,'night'],
 ['Sources 720','sources',720,'night'],
 ['EPG 1360','epg',1360,'aurora'],
 ['EPG 720','epg',720,'aurora'],
 ['Settings 1360','settings',1360,'graphite'],
 ['Doctor 1360','doctor',1360,'graphite'],
 ['Favorites 600','fav',600,'night']
];
async function runTwenty(page){
 fs.mkdirSync(out,{recursive:true});
 assert.equal(cases.length,20);
 const results=[];let prev=null;
 for(let i=0;i<cases.length;i++){
  const [name,target,width,theme]=cases[i],round=i+1;
  await page.setViewportSize({width,height:820});
  const status=await page.evaluate(args=>{
   window.OpenIPTVPositronStudio.choose(args.theme);
   window.IPTVState.setPage(args.target);
   return window.OpenIPTVPositronTwenty.setStage(args.round,args.previous);
  },{theme,target,round,previous:prev});
  assert.equal(status.stage,round);
  assert.equal(status.fromRound,round===1?null:round-1);
  await page.waitForTimeout(95);
  const metrics=await page.evaluate(()=>{
   const get=s=>{const n=document.querySelector(s);if(!n)return null;const b=n.getBoundingClientRect();return{width:Math.round(b.width),height:Math.round(b.height),background:getComputedStyle(n).backgroundColor,visible:b.width>0&&b.height>0};};
   return {page:document.querySelector('.page.active-page')?.id,
    viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+6,
    player:get('#playerBox'),sidebar:get('#appSidebar'),
    sources:get('#page-sources .sources-hub-nav'),sourceSection:get('#smartDiscoverySection'),sourceHeading:get('#page-sources .source-hub-heading'),epg:get('#page-epg .epg-filter'),
    epgEmptySummary:document.getElementById('epgSummary')?.textContent?.trim()||'',
    epgGuideEmptyText:document.querySelector('#epgGuide>.empty-list')?.textContent?.trim()||'',
    epgReloadAvailability:(()=>{const n=document.getElementById('epgRefreshBtn');return {disabled:!!n?.disabled,marked:n?.getAttribute('data-positron-epg-no-channels')||'',describedBy:n?.getAttribute('aria-describedby')||''};})(),
    horizon:(()=>{
      const root=document.documentElement,toggle=document.getElementById('poWatchFlowToggle');
      return {loaded:root.classList.contains('po-horizon'),
       watchFlowReady:root.dataset.poWatchFlow==='ready',
       toggle:!!toggle,expanded:toggle?.getAttribute('aria-expanded')||''};
    })(),
    v2Media:(()=>{
     const btn=document.getElementById('playBtn');
     const bar=document.querySelector('#page-tv .player-control-card .control-layout-top');
     if(!btn||!bar)return null;
     const rect=btn.getBoundingClientRect(),style=getComputedStyle(btn),top=bar.getBoundingClientRect();
     return {loaded:document.documentElement.dataset.poMediaV2==='true',
      width:Math.round(rect.width),height:Math.round(rect.height),
      radius:style.borderTopLeftRadius,topOverflow:top.right>innerWidth+8,
      vectorOutputs:['castBtn','pipBtn','fullscreenBtn'].every(id=>!!document.querySelector('#'+id+' svg.po-media-svg')),
      navIcon:!!document.querySelector('#appSidebar .nav[data-page="tv"] svg.po-media-svg')};
    })(),
    epgSourceAction:get('#epgSettingsBtn'),
    epgToolVisibility:(()=>{
     const page=document.getElementById('page-epg');
     const guide=window.IPTVExtras?.getGuide?.();
     const getVisible=id=>{const el=document.querySelector(id);if(!el)return false;const box=el.getBoundingClientRect();return box.width>0&&box.height>0&&getComputedStyle(el).display!=='none';};
     return {programmeCount:Array.isArray(guide?.programmes)?guide.programmes.length:0,
      collapsed:page?.hasAttribute('data-positron-no-epg-programmes')||false,
      filterVisible:getVisible('#page-epg .epg-filter'),
      advancedVisible:getVisible('#page-epg .epg-advanced'),
      searchPreserved:!!document.getElementById('epgGlobalSearch'),
      mappingPreserved:!!document.getElementById('epgManualMap'),
      offsetPreserved:!!document.getElementById('epgOffset'),
      searchResultsVisible:getVisible('#epgSearchResults')};
    })(),
    dvrFormVisible:get('#dvrForm')?.visible||false,
    dvrEmptyAction:get('#positronDvrNoChannels'),
    dvrFolder:get('#dvrPanel .dvr-folder'),
    dvrNativeStatus:get('#dvrStatus'),
    dvrNativeText:document.getElementById('dvrStatus')?.textContent?.trim()||'',
    v3Workspace:(()=>{
     const root=document.documentElement,rail=document.getElementById('appSidebar');
     const advanced=document.getElementById('positronToolsToggle');
     const filters=document.getElementById('positronFiltersToggle');
     const railButton=document.getElementById('poRailExpand');
     const play=document.getElementById('playBtn'),style=play&&getComputedStyle(play);
     return {loaded:root.dataset.poWorkspaceV3==='true',
      railWidth:Math.round(rail?.getBoundingClientRect().width||0),
      railExpanded:root.dataset.poRailExpanded||'',
      railToggle:!!railButton&&railButton.getAttribute('aria-expanded')==='false',
      advancedInToolbar:advanced?.parentElement?.classList.contains('output-controls')||false,
      filtersInSearch:filters?.parentElement?.classList.contains('filter-box')||false,
      playRadius:style?.borderTopLeftRadius||'',
      mainNavLabels:[...document.querySelectorAll('#appSidebar .nav[data-page]')].every(n=>!!n.getAttribute('aria-label')),
      sourceAction:!!document.querySelector('#appSidebar .nav[data-page="sources"]'),
      moreAction:!!document.getElementById('positronMorePages')
     };
    })(),
    controls:document.querySelectorAll('#page-tv button').length,
    transportVectors:['prevBtn','stopBtn','nextBtn','fsPrev','fsNext','fullscreenBtn'].every(id=>!!document.getElementById(id)?.querySelector('svg')),
    brandIcon:get('#appSidebar .brand-icon'),
    horizonScrollbar:(()=>{const n=document.querySelector('.main');if(!n)return null;const s=getComputedStyle(n);return {color:s.scrollbarColor,thumb:getComputedStyle(document.documentElement).getPropertyValue('--iptv-scroll-thumb').trim(),track:getComputedStyle(document.documentElement).getPropertyValue('--iptv-scroll-track').trim()};})(),
    unifiedAiColors:(()=>{const n=document.querySelector('#page-tv .unified-ai-row .unified-ai-toggle'),mark=n?.querySelector('.unified-ai-mark');if(!n)return null;const s=getComputedStyle(n),root=getComputedStyle(document.documentElement);return {background:s.backgroundColor,border:s.borderTopColor,ink:s.color,markBackground:mark?getComputedStyle(mark).backgroundColor:'',accent:root.getPropertyValue('--accent').trim(),uiPrimary:root.getPropertyValue('--ui-primary').trim(),expanded:n.getAttribute('aria-expanded')||''};})(),
     heading:(()=>{const n=document.querySelector('#positronBar .p-heading strong');if(!n)return null;const b=n.getBoundingClientRect();return {shortTitle:n.dataset.shortTitle||'',nativeText:n.textContent||'',fontSize:getComputedStyle(n).fontSize,pseudoContent:getComputedStyle(n,'::after').content,clipped:n.scrollWidth>n.clientWidth+1,width:Math.round(b.width)};})(),
    badge:(()=>{const n=document.querySelector('#appSidebar .brand small');if(!n)return null;const b=n.getBoundingClientRect();return {visible:b.width>0&&b.height>0,clipped:n.scrollWidth>n.clientWidth+1,right:b.right,top:b.top,bottom:b.bottom};})(),
    toggle:(()=>{const n=document.querySelector('#appSidebar .sidebar-edge-toggle');if(!n)return null;const b=n.getBoundingClientRect();return {left:b.left,top:b.top,bottom:b.bottom};})(),
    doctorSourceAction:get('#positronDoctorSources'),
     doctorAnalysis:(()=>{const ids=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify'];return ids.map(id=>{const b=document.getElementById(id);return {id,exists:!!b,disabled:!!b?.disabled,tag:b?.getAttribute('data-positron-no-channels')||'',describedBy:b?.getAttribute('aria-describedby')||''};});})(),
     doctorEmptyVisible:(()=>{const n=document.getElementById('positronDoctorEmptyHint');return !!n&&!n.hidden;})(),
     navCount:document.getElementById('navCount')?.textContent?.trim()||'0',
     sidebarStatus:(()=>{const n=document.getElementById('miniStatus');if(!n)return null;const s=getComputedStyle(n),r=n.getBoundingClientRect();return{visible:r.width>0&&r.height>0,whiteSpace:s.whiteSpace,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,title:n.title,text:n.textContent||''};})(),


     currentFavorite:(()=>{
       const b=document.getElementById('favCurrentBtn');
       return b?{disabled:b.disabled,guard:b.getAttribute('data-positron-no-current')||'',
         description:b.getAttribute('aria-describedby')||'',pressed:b.getAttribute('aria-pressed')||''}:null;
     })(),
     toolsToggle:(()=>{
       const n=document.getElementById('positronToolsToggle');
       return n?{text:n.textContent?.trim()||'',title:n.title,
        expanded:n.getAttribute('aria-expanded'),visible:!!n.getClientRects().length,
        vector:!!n.querySelector('svg path')&&n.querySelectorAll('svg circle').length===2,
        pseudo:getComputedStyle(n,'::after').content}:null;
     })(),
     shortcutHint:(()=>{
      const b=document.getElementById('positronOpen'),k=b?.querySelector('kbd');
      const platform=String(navigator.userAgentData?.platform||navigator.platform||'');
      return {text:k?.textContent?.trim()||'',expected:/Mac|iPhone|iPad/i.test(platform)?'⌘ K':'Ctrl K',
       title:b?.title||'',aria:b?.getAttribute('aria-keyshortcuts')||''};
     })(),
     searchButton:(()=>{const n=document.getElementById('positronOpen'),label=n?.querySelector('.p-command-label');if(!n)return null;return{svg:!!n.querySelector('svg'),label:label?.textContent||'',labelClipped:!!(label&&label.getClientRects().length&&label.scrollWidth>label.clientWidth+1),aria:n.getAttribute('aria-label')};})(),
     epgNext:(()=>{const n=document.getElementById('epgNextName');if(!n)return null;const s=getComputedStyle(n);return {whiteSpace:s.whiteSpace,textOverflow:s.textOverflow,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth,height:Math.round(n.getBoundingClientRect().height)};})(),
     favoriteAction:get('#positronFavoritesSources'),
     favoriteGuidance:(()=>document.querySelector('#favoriteList .empty-list')?.firstChild?.textContent?.trim()||'')(),
     favoriteEmptyLayout:(()=>{const e=document.querySelector('#favoriteList>.empty-list'),b=document.getElementById('positronFavoritesSources');const r=e?.getBoundingClientRect(),a=b?.getBoundingClientRect();return{top:Math.round(r?.top||0),height:Math.round(r?.height||0),buttonBottom:Math.round(a?.bottom||0),viewportHeight:innerHeight};})(),
     sourceCount:document.getElementById('sourceCount')?.textContent?.trim()||'0',
     sidebarImport:(()=>{const b=document.getElementById('poEmptySourceAction');return b?{visible:!!b.getClientRects().length,content:b.textContent.trim(),aria:b.getAttribute('aria-label')}:null;})(),
     footerStatus:(()=>{
      const n=document.getElementById('footerText'),footer=n?.closest('.footer');if(!n||!footer)return null;
      const s=getComputedStyle(n),bg=getComputedStyle(footer).backgroundColor;
      const luminance=c=>{const channels=(c.match(/\d+(?:\.\d+)?/g)||[]).slice(0,3).map(Number);
       if(channels.length!==3)return null;
       const v=channels.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
       return .2126*v[0]+.7152*v[1]+.0722*v[2];};
      const a=luminance(s.color),b=luminance(bg);
      return {whiteSpace:s.whiteSpace,color:s.color,background:bg,contrast:(a===null||b===null)?0:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),
       clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,clientHeight:n.clientHeight,scrollHeight:n.scrollHeight,
       taskVisible:!footer.querySelector('#taskDock')?.classList.contains('hidden')};
     })(),
     outputIcons:(()=>{
      const inspect=id=>{const b=document.getElementById(id),s=b?.querySelector('svg');return {svg:!!s,width:Math.round(s?.getBoundingClientRect().width||0),label:b?.querySelector('span')?.textContent?.trim()||'',aria:b?.getAttribute('aria-label')||''};};
      return {cast:inspect('castBtn'),pip:inspect('pipBtn')};
     })(),
     volumeIcon:(()=>{const n=document.querySelector('#page-tv label.volume-icon'),v=n?.querySelector('svg');if(!n)return null;return {svg:!!v,for:n.getAttribute('for'),width:Math.round(v?.getBoundingClientRect().width||0),height:Math.round(v?.getBoundingClientRect().height||0)};})(),
     focusIcon:(()=>{
      const n=document.getElementById('positronFocus'),svg=n?.querySelector('svg');
      return {svg:!!svg,width:Math.round(svg?.getBoundingClientRect().width||0),
       label:n?.getAttribute('aria-label')||'',pressed:n?.getAttribute('aria-pressed')||'',
       path:svg?.querySelector('path')?.getAttribute('d')||''};
     })(),

     dvrChannel:(()=>{
      const n=document.getElementById('dvrChannel');if(!n)return null;
      return {disabled:n.disabled,count:n.options.length,
       text:n.selectedOptions?.[0]?.textContent?.trim()||'',label:n.getAttribute('aria-label')||''};
     })(),

     doctorButtons:(()=>['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify'].map(id=>{const b=document.getElementById(id);if(!b)return null;const st=getComputedStyle(b);const rgb=(st.backgroundColor.match(/\d+/g)||[]).map(Number).slice(0,3);return {id,disabled:b.disabled,guard:b.getAttribute('data-positron-no-channels')||'',background:st.backgroundColor,filter:st.filter,opacity:st.opacity,luma:rgb.length===3?Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722):999};}))(),
     cloudLogin:(()=>{const panel=document.getElementById('openiptvPortableCloud');const email=document.getElementById('portableCloudEmail');const button=document.querySelector('#portableCloudEmailForm button[type=submit]');const status=document.getElementById('portableCloudStatus');return {height:Math.round(panel?.getBoundingClientRect().height||0),width:Math.round(panel?.getBoundingClientRect().width||0),inputHeight:Math.round(email?.getBoundingClientRect().height||0),buttonHeight:Math.round(button?.getBoundingClientRect().height||0),status:status?.textContent?.trim()||'',loggedOut:!!document.getElementById('portableCloudEmailForm')&&!document.getElementById('portableCloudEmailForm').hidden};})(),
     emptyArtwork:(()=>{const n=document.querySelector('#emptyPlayer .empty-icon');const svg=n?.querySelector('svg.positron-empty-tv');return{svg:!!svg,ariaHidden:n?.getAttribute('aria-hidden')||'',glyph:n?.textContent?.trim()||'',width:Math.round(svg?.getBoundingClientRect().width||0)};})(),
     outputAvailability:(()=>['castBtn','pipBtn'].map(id=>{const b=document.getElementById(id);if(!b)return null;const css=getComputedStyle(b);return {id,disabled:b.disabled,guard:b.getAttribute('data-positron-no-current')||'',opacity:Number(css.opacity),cursor:css.cursor,svg:!!b.querySelector('svg')};}))(),
     transportAvailability:(()=>{return ['prevBtn','stopBtn','nextBtn'].map(id=>{const b=document.getElementById(id);if(!b)return null;const st=getComputedStyle(b);return {id,disabled:b.disabled,guard:b.getAttribute('data-positron-inactive')||'',opacity:Number(st.opacity),cursor:st.cursor};});})(),
     playAvailability:(()=>{const el=document.getElementById('playBtn');if(!el)return null;const st=getComputedStyle(el);return {disabled:el.disabled,guard:el.getAttribute('data-positron-no-channels')||'',opacity:st.opacity,cursor:st.cursor,description:el.getAttribute('aria-describedby')||''};})(),
     epgGuidance:(()=>{const node=document.getElementById('epgSearchResults');if(!node)return null;const st=getComputedStyle(node);const rgb=(st.color.match(/\d+/g)||[]).map(Number).slice(0,3);return {text:node.textContent?.trim()||'',color:st.color,luma:rgb.length===3?Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722):0,fontSize:st.fontSize,opacity:st.opacity};})(),
     dvrSchedule:(()=>{const b=document.getElementById('dvrAdd');if(!b)return null;const style=getComputedStyle(b);return {disabled:b.disabled,guard:b.getAttribute('data-positron-no-channels')||'',description:b.getAttribute('aria-describedby')||'',background:style.backgroundColor,filter:style.filter,opacity:style.opacity,cursor:style.cursor,vector:!!b.querySelector('svg.positron-dvr-record-icon'),ariaHidden:b.querySelector('svg')?.getAttribute('aria-hidden')||'',label:b.textContent?.trim()||''};})(),
     dvrHeading:(()=>{
      const h=document.querySelector('#dvrPanel .dvr-heading h2');if(!h)return null;
      const svg=h.querySelector('svg');return {svg:!!svg,
       label:h.textContent?.trim()||'',width:Math.round(svg?.getBoundingClientRect().width||0),
       aria:svg?.getAttribute('aria-hidden')||''};
     })(),


     smartInitial:(()=>{const catalog=document.getElementById('smartCatalog');const status=document.getElementById('smartStatus');return {catalog:catalog?.value||'',text:status?.textContent?.trim()||''};})(),
     smartStatusLabel:(()=>{
      const n=document.getElementById('smartStatusFilter')?.closest('label');if(!n)return null;
      const labelText=[...n.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());
      if(!labelText)return null;
      const range=document.createRange();range.selectNodeContents(labelText);
      return {text:labelText.textContent.trim(),lineRects:range.getClientRects().length,
       whiteSpace:getComputedStyle(n).whiteSpace,flexShrink:getComputedStyle(n).flexShrink,
       labelWidth:Math.round(n.getBoundingClientRect().width)};
     })(),
     sourceEmpty:(()=>{
      const n=document.querySelector('#sourcesList>.empty-list');if(!n)return null;
      const s=getComputedStyle(n),b=n.getBoundingClientRect();
      const discovery=document.getElementById('smartDiscoverySection')?.getBoundingClientRect();
      return {text:n.textContent?.trim()||'',height:Math.round(b.height),
       paddingTop:parseFloat(s.paddingTop),paddingBottom:parseFloat(s.paddingBottom),
       gap:discovery?Math.round(discovery.top-b.bottom):null};
     })(),

     manualLink:(()=>{
      const n=document.getElementById('manualStreamSelect');if(!n)return null;
      const ctx=document.createElement('canvas').getContext('2d');ctx.font=getComputedStyle(n).font;
      const label=n.selectedOptions?.[0]?.textContent?.trim()||'';
      const rect=n.getBoundingClientRect();
      return {label,selectedTextWidth:Math.ceil(ctx.measureText(label).width),
       controlWidth:n.clientWidth,right:rect.right,visible:rect.width>0&&rect.height>0};
     })(),

     smartLimit:(()=>{const n=document.getElementById('smartLimit');if(!n)return null;
       const label=n.selectedOptions?.[0]?.textContent?.trim()||'';
       const c=document.createElement('canvas').getContext('2d');
       c.font=getComputedStyle(n).font;
       return {value:n.value,label,textWidth:Math.ceil(c.measureText(label).width),controlWidth:n.clientWidth};})(),
     themeButton:(()=>{const n=document.getElementById('positronStudioBtn');if(!n)return null;const b=n.getBoundingClientRect(),s=getComputedStyle(n),p=getComputedStyle(n,'::before');return{width:Math.round(b.width),fontSize:s.fontSize,pseudoContent:p.content,svg:!!n.querySelector('svg.positron-theme-vector'),svgWidth:Math.round(n.querySelector('svg')?.getBoundingClientRect().width||0),ariaLabel:n.getAttribute('aria-label'),title:n.title};})(),
     searchShortcut:document.getElementById('searchBox')?.getAttribute('aria-keyshortcuts'),
    stage:document.documentElement.dataset.p20Stage};
  });
  assert.equal(metrics.page,'page-'+target);
  assert.equal(metrics.stage,String(round));
  assert.ok(metrics.sidebar&&metrics.sidebar.width<=285,'sidebar overflow: '+name);
  if(target==='sources'&&width===720){
   const navQa=await page.evaluate(()=>{
    const nav=document.querySelector('#page-sources .sources-hub-nav');
    const buttons=[...nav.querySelectorAll('button')];
    const style=getComputedStyle(nav);
    const first=buttons[0].getBoundingClientRect(),last=buttons.at(-1).getBoundingClientRect();
    const selected=buttons.filter(x=>x.getAttribute('aria-current')==='location');
    return {count:buttons.length,selectedCount:selected.length,selectedTarget:selected[0]?.dataset.sourceJump,
     selectedAccent:selected[0]?getComputedStyle(selected[0]).borderBottomColor:'',wrap:style.flexWrap,scroll:style.overflowX,
     firstTop:first.top,lastTop:last.top,verticalGap:Math.abs(last.top-first.top),
     parentOverflow:document.documentElement.scrollWidth>innerWidth+6};
   });
   assert.equal(navQa.count,5,'Source jump actions missing from compact toolbar: '+name);
   assert.equal(navQa.selectedCount,1,'Source toolbar must identify one selected jump: '+name);
   assert.equal(navQa.selectedTarget,'smartDiscoverySection','Source toolbar initially highlights wrong section: '+name);
   assert.equal(navQa.selectedAccent,'rgb(90, 203, 178)','Selected Source tab has no visible accent: '+name);
   assert.equal(navQa.wrap,'nowrap','Source jump actions wrap into an orphan row: '+name);
   assert.ok(navQa.verticalGap<=1,'Fifth source tool button appears alone below row: '+name);
   assert.equal(navQa.scroll,'auto','Source jump controls cannot scroll when narrow: '+name);
   assert.equal(navQa.parentOverflow,false,'Source toolbar creates whole-window overflow: '+name);
  }
  assert.ok(metrics.controls>=8,'native player controls missing');
  if(target==='tv'&&metrics.sourceCount==='0'){
   assert.equal(metrics.sidebarImport?.visible,true,'Empty TV sidebar still lacks source onboarding action: '+name);
   assert.equal(metrics.sidebarImport?.content,'Thêm nguồn IPTV','Native sidebar source action unclear: '+name);
   const importedFromSidebar=await page.evaluate(()=>{
    document.getElementById('poEmptySourceAction').click();
    const dest=document.querySelector('.page.active-page')?.id;
    window.IPTVState.setPage('tv');
    return dest;
   });
   assert.equal(importedFromSidebar,'page-sources','Sidebar CTA must open native Sources: '+name);
  }
  if(target==='tv'){
   assert.ok(metrics.player?.width>180&&metrics.player.height>100,'video collapsed: '+name);
   assert.equal(metrics.transportVectors,true,'non-vector transport icons: '+name);
   assert.ok(metrics.v2Media?.loaded,'P5.1.54 media redesign module failed to initialize: '+name);
   assert.equal(metrics.v3Workspace?.loaded,true,'P5.1.55 workspace did not initialize: '+name);
   // The P4 audit may leave the rail intentionally expanded; test either
   // actual user state rather than incorrectly demanding compact at all times.
   assert.ok(metrics.v3Workspace?.railExpanded==='true'
     ? metrics.v3Workspace.railWidth>=180&&metrics.v3Workspace.railWidth<=222
     : metrics.v3Workspace?.railWidth<=90,
     'rail width mismatches actual expanded/compact state: '+name+' '+JSON.stringify(metrics.v3Workspace));
   assert.equal(metrics.horizon?.loaded,true,'Horizon layer missing: '+name);
   assert.equal(metrics.horizon?.watchFlowReady,true,'WatchFlow did not initialize: '+name);
   assert.equal(metrics.horizon?.toggle,true,'WatchFlow toolbar action absent: '+name);
   assert.ok(metrics.v3Workspace?.advancedInToolbar,'More tools disclosure was not moved inside media controls: '+name);
   assert.ok(metrics.v3Workspace?.filtersInSearch,'secondary filter still takes a full extra row: '+name);
   assert.ok(metrics.v3Workspace?.mainNavLabels,'accessible labels missing from compact navigation: '+name);
   assert.ok(metrics.v3Workspace?.sourceAction&&metrics.v3Workspace.moreAction,'source or advanced navigation became inaccessible: '+name);
   assert.equal(metrics.v3Workspace?.playRadius,'10px','Play button became a circle again: '+name);

   assert.ok(metrics.v2Media?.width<=48&&metrics.v2Media.height>=40,'new Play button is not compact: '+name+' '+JSON.stringify(metrics.v2Media));
   assert.ok(metrics.v2Media?.vectorOutputs&&metrics.v2Media.navIcon,'new SVG system not installed: '+name);
   assert.equal(metrics.v2Media?.topOverflow,false,'toolbar extends beyond viewport: '+name);
   if(width===600){
    const moreIcon=await page.evaluate(()=>{
     const button=document.getElementById('positronMorePages');
     const shape=button.querySelector('svg.po-more-vector');
     const label=button.querySelector('.po-more-label');
     const pseudo=getComputedStyle(button,'::before').content;
     const box=button.getBoundingClientRect();
     return {shape:!!shape,rects:shape?.querySelectorAll('rect').length||0,
      labelHidden:getComputedStyle(label).display==='none',pseudo,
      boxWidth:box.width,clientWidth:button.clientWidth,scrollWidth:button.scrollWidth,
      iconWidth:shape?.getBoundingClientRect().width||0,
      overflow:button.scrollWidth>button.clientWidth+1};
    });
    assert.equal(moreIcon.shape,true,'Advanced-pages rail still uses a platform glyph: '+name);
    assert.equal(moreIcon.rects,4,'Advanced-pages rail SVG missing grid geometry: '+name);
    assert.equal(moreIcon.labelHidden,true,'Compact rail label bleeds into icon: '+name);
    assert.ok(['none','normal'].includes(moreIcon.pseudo),'Duplicate pseudo-grid still visible: '+name+' '+moreIcon.pseudo);
    assert.ok(moreIcon.iconWidth>=18&&moreIcon.iconWidth<=24,'Compact rail SVG size wrong: '+name);
    assert.equal(moreIcon.overflow,false,'Advanced-pages icon rail overflows: '+name+' '+JSON.stringify(moreIcon));
   }
   if(width===1360){
    const watchFlow=await page.evaluate(()=>{
     const button=document.getElementById('poWatchFlowToggle');
     const panel=document.getElementById('poWatchFlowPanel');
     button.click();
     const opened=!panel.hidden&&button.getAttribute('aria-expanded')==='true';
     const focusEntered=panel.contains(document.activeElement);
     const firstUsefulFocus=document.activeElement===panel.querySelector('.po-watchflow-empty button');
     const groupCount=panel.querySelectorAll('[data-po-mode]').length;
     const reasons=panel.textContent.includes('bằng chứng hoạt động');
     const titleColor=getComputedStyle(panel.querySelector('h2')).color;
     const closeRect=document.getElementById('poWatchFlowClose').getBoundingClientRect();
     const closeTapSize=Math.min(closeRect.width,closeRect.height);
     const closeVector=!!panel.querySelector('#poWatchFlowClose svg path');
     const panelRect=panel.getBoundingClientRect();
     const importRect=document.getElementById('emptyUrlBtn')?.getBoundingClientRect();
     const titleRect=document.querySelector('#emptyPlayer h2')?.getBoundingClientRect();
     const stageRect=document.getElementById('playerBox').getBoundingClientRect();
     const titleOffset=titleRect?(titleRect.left+titleRect.width/2)-(stageRect.left+stageRect.width/2):0;
     const overlapWithImport=!!importRect&&panelRect.left<importRect.right&&panelRect.right>importRect.left&&panelRect.top<importRect.bottom&&panelRect.bottom>importRect.top;
     const overlapWithTitle=!!titleRect&&panelRect.left<titleRect.right&&panelRect.right>titleRect.left&&panelRect.top<titleRect.bottom&&panelRect.bottom>titleRect.top;
     const emptyPlaylist=panel.dataset.emptyPlaylist==='true';
     const noHorizontalScroll=panel.scrollWidth<=panel.clientWidth+1;
     const horizontalOverflowPx=panel.scrollWidth-panel.clientWidth;
     const modesHidden=getComputedStyle(panel.querySelector('.po-watchflow-modes')).display==='none';
     document.getElementById('poWatchFlowClose').click();
     const focusReturned=document.activeElement===button;
     return {opened,groupCount,reasons,titleColor,emptyPlaylist,modesHidden,overlapWithImport,overlapWithTitle,focusEntered,firstUsefulFocus,focusReturned,titleOffset,closeTapSize,closeVector,panelWidth:panelRect.width,noHorizontalScroll,horizontalOverflowPx,closed:panel.hidden&&button.getAttribute('aria-expanded')==='false'};
    });
    assert.equal(watchFlow.opened,true,'WatchFlow cannot open: '+name);
    assert.equal(watchFlow.closed,true,'WatchFlow cannot close: '+name);
    assert.equal(watchFlow.groupCount,6,'WatchFlow topics missing: '+name);
    assert.equal(watchFlow.reasons,true,'WatchFlow evidence explanation is missing: '+name);
    assert.equal(watchFlow.emptyPlaylist,true,'No-playlist WatchFlow did not identify empty source: '+name);
    assert.equal(watchFlow.modesHidden,true,'Empty WatchFlow wastes space on inactive genres: '+name);
    assert.equal(watchFlow.overlapWithImport,false,'WatchFlow obscures native Add URL: '+name);
    assert.equal(watchFlow.overlapWithTitle,false,'WatchFlow hides the native empty-player title: '+name);
    assert.ok(watchFlow.titleOffset<=-90,'Open WatchFlow does not reserve space beside compact empty stage: '+name+' '+watchFlow.titleOffset);
    assert.equal(watchFlow.focusEntered,true,'WatchFlow dialog did not receive keyboard focus: '+name);
    assert.equal(watchFlow.firstUsefulFocus,true,'Empty WatchFlow did not focus source action: '+name);
    assert.equal(watchFlow.focusReturned,true,'Closing WatchFlow did not restore toolbar focus: '+name);
    assert.equal(watchFlow.closeVector,true,'WatchFlow close control does not use vector artwork: '+name);
    assert.ok(watchFlow.closeTapSize>=40,'WatchFlow close control is too small: '+name);
    assert.ok(watchFlow.panelWidth<=320,'Empty WatchFlow too wide at 1360px: '+name);
    assert.equal(watchFlow.noHorizontalScroll,true,'Empty WatchFlow has horizontal overflow: '+name+' '+JSON.stringify(watchFlow));
    if(theme==='night'){
     await page.evaluate(()=>document.getElementById('poWatchFlowToggle').click());
     await page.screenshot({path:path.join(out,'positron-p51106-empty-watchflow-no-horizontal-scroll-real.png'),animations:'disabled'});
     await page.evaluate(()=>document.getElementById('poWatchFlowClose').click());
    }
    const watchFlowNav=await page.evaluate(async()=>{
     const trigger=document.getElementById('poWatchFlowToggle'),panel=document.getElementById('poWatchFlowPanel');
     trigger.click();
     const opened=!panel.hidden;
     window.IPTVState.setPage('sources');
     await new Promise(resolve=>setTimeout(resolve,0));
     const dismissed=panel.hidden&&trigger.getAttribute('aria-expanded')==='false';
     const hiddenOnSources=trigger.hidden&&getComputedStyle(trigger).display==='none';
     window.PositronWatchFlow.open();
     const refusesOffTV=panel.hidden;
     window.IPTVState.setPage('tv');
     await new Promise(resolve=>setTimeout(resolve,0));
     const visibleOnTV=!trigger.hidden&&getComputedStyle(trigger).display!=='none';
     return {opened,dismissed,hiddenOnSources,refusesOffTV,visibleOnTV,restored:document.getElementById('page-tv').classList.contains('active-page')};
    });
    assert.equal(watchFlowNav.opened,true,'Cannot reproduce WatchFlow keyboard navigation scenario: '+name);
    assert.equal(watchFlowNav.dismissed,true,'WatchFlow remains over Sources after keyboard navigation: '+name);
    assert.equal(watchFlowNav.hiddenOnSources,true,'WatchFlow trigger visible on Sources: '+name);
    assert.equal(watchFlowNav.refusesOffTV,true,'WatchFlow opens from a non-TV page: '+name);
    assert.equal(watchFlowNav.visibleOnTV,true,'WatchFlow trigger not restored on TV: '+name);
    assert.equal(watchFlowNav.restored,true,'WatchFlow QA failed to restore TV page: '+name);
    const titleRgb=(watchFlow.titleColor.match(/\d+/g)||[]).slice(0,3).map(Number);
    assert.ok(titleRgb.length===3&&titleRgb.every(x=>x>200),
      'WatchFlow title has unreadable dark contrast: '+name+' '+watchFlow.titleColor);
    const railCycle=await page.evaluate(async()=>{
      const root=document.documentElement,button=document.getElementById('poRailExpand');
      const rail=document.getElementById('appSidebar');
      const beforeWidth=Math.round(rail.getBoundingClientRect().width);
      const beforeState=root.dataset.poRailExpanded;
      button.click();await new Promise(resolve=>requestAnimationFrame(resolve));
      const afterWidth=Math.round(rail.getBoundingClientRect().width);
      const changed=root.dataset.poRailExpanded!==beforeState&&Math.abs(afterWidth-beforeWidth)>=100;
      button.click();await new Promise(resolve=>requestAnimationFrame(resolve));
      const restored=Math.round(rail.getBoundingClientRect().width)===beforeWidth
        &&root.dataset.poRailExpanded===beforeState;
      return {changed,restored,beforeWidth,afterWidth,beforeState};
    });
    assert.equal(railCycle.changed,true,'rail button must change real width: '+name+' '+JSON.stringify(railCycle));
    assert.equal(railCycle.restored,true,'rail button must restore original state: '+name+' '+JSON.stringify(railCycle));
    await page.evaluate(()=>document.getElementById('poWatchFlowToggle').click());
    await page.screenshot({path:path.join(out,'positron-watchflow-'+width+'-'+theme+'-real.png')});
    await page.evaluate(()=>document.getElementById('poWatchFlowClose').click());
   }


   for(const [key,label] of [['cast','Cast / AirPlay'],['pip','PiP']]){
    const i=metrics.outputIcons?.[key];
    assert.equal(i?.svg,true,'native '+key+' output icon still uses a glyph: '+name);
    assert.ok(i.width>=14,'native '+key+' SVG too small: '+name);
    assert.equal(i.label,label,'native '+key+' label missing: '+name);
    assert.ok(i.aria,'native '+key+' accessible name missing: '+name);
   }
   assert.equal(metrics.volumeIcon?.svg,true,'volume still uses platform glyph: '+name);
   assert.equal(metrics.volumeIcon?.for,'volume','native volume label association lost: '+name);
   assert.ok(metrics.volumeIcon.width>=16&&metrics.volumeIcon.height>=16,'volume vector too small: '+name);
   if(width<=800&&round>=6)assert.equal(metrics.brandIcon?.visible,false,'brand icon overlaps sidebar toggle: '+name);
    if(width<=540){
     assert.ok(metrics.manualLink?.visible,'native stream link picker missing: '+name);
     assert.ok(metrics.manualLink.controlWidth>=metrics.manualLink.selectedTextWidth+34,'stream link selected label clipped: '+name);
     assert.ok(metrics.manualLink.right<=width-6,'stream link picker exceeds viewport: '+name);
     assert.ok(metrics.epgNext,'EPG next-program name missing: '+name);
     assert.equal(metrics.epgNext.whiteSpace,'normal','mobile EPG text still forced to a single line: '+name);
     assert.equal(metrics.epgNext.textOverflow,'clip','mobile EPG text still showing ellipsis: '+name);
     assert.ok(metrics.epgNext.scrollWidth<=metrics.epgNext.clientWidth+2,'mobile EPG text still clipped: '+name);
    }
  }
  if(width<=600){
   assert.ok(metrics.footerStatus,'native footer status missing: '+name);
   assert.equal(metrics.footerStatus.whiteSpace,'normal','footer status still forced to ellipsis: '+name);
   assert.ok(metrics.footerStatus.contrast>=4.5,'footer status does not meet 4.5:1 contrast: '+name);
   if(!metrics.footerStatus.taskVisible){
    assert.ok(metrics.footerStatus.scrollWidth<=metrics.footerStatus.clientWidth+2,'footer status still clipped horizontally: '+name);
    assert.ok(metrics.footerStatus.scrollHeight<=metrics.footerStatus.clientHeight+2,'footer status still clipped vertically: '+name);
   }
  }
  if(width<=600){
    assert.equal(metrics.focusIcon?.svg,true,'focus control missing vector icon: '+name);
    assert.ok(metrics.focusIcon.width>=16,'focus vector too small: '+name);
    assert.ok(metrics.focusIcon.label.length>=10,'focus control missing descriptive ARIA: '+name);
    assert.ok(metrics.themeButton,'theme control missing: '+name);
    assert.equal(metrics.themeButton.fontSize,'0px','theme label visible in compact toolbar: '+name);
    assert.ok(metrics.themeButton.width<=46,'theme button exceeds compact width: '+name);

    assert.equal(metrics.themeButton.svg,true,'compact theme control still uses platform glyph: '+name);
    assert.ok(metrics.themeButton.svgWidth>=16,'compact theme vector too small: '+name);
    assert.equal(metrics.themeButton.pseudoContent,'none','duplicate compact glyph pseudo-element remains: '+name);
    assert.ok(metrics.themeButton.ariaLabel&&metrics.themeButton.title,'icon requires accessible label and tooltip: '+name);
    const themeLifecycle=await page.evaluate(()=>{
      const b=document.getElementById('positronStudioBtn'),menu=document.getElementById('positronStudioMenu');
      const before=b.getAttribute('aria-expanded');b.click();
      const opened=menu.hidden===false&&b.getAttribute('aria-expanded')==='true';
      b.click();return{opened,restored:menu.hidden===true&&b.getAttribute('aria-expanded')===before};
    });
    assert.equal(themeLifecycle.opened,true,'theme vector destroyed original click handler: '+name);
    assert.equal(themeLifecycle.restored,true,'theme selector did not close: '+name);
   }
   if(width>=901&&metrics.sidebarStatus?.visible){
    assert.equal(metrics.sidebarStatus.whiteSpace,'normal','side FFmpeg status still forcibly ellipsized: '+name);
    assert.ok(metrics.sidebarStatus.scrollHeight<=metrics.sidebarStatus.clientHeight+2,'side FFmpeg status vertically clipped: '+name);
    assert.equal(metrics.sidebarStatus.title,metrics.sidebarStatus.text,'side status tooltip must update with current state: '+name);
   }
   assert.equal(metrics.shortcutHint?.text,metrics.shortcutHint?.expected,'wrong platform-specific Ctrl/Command search hint: '+name);
   assert.ok(metrics.shortcutHint.title.includes(metrics.shortcutHint.expected.replace(' ','+')),'shortcut tooltip not platform-aware: '+name);
   assert.ok(metrics.shortcutHint.aria.includes('Control+K')&&metrics.shortcutHint.aria.includes('Meta+K'),'global search ARIA shortcuts lost: '+name);
   assert.equal(metrics.searchButton?.svg,true,'search toolbar icon must be SVG: '+name);
   assert.equal(metrics.searchButton?.label,'Tìm kênh / trang','compact search label missing: '+name);
   assert.ok(metrics.searchButton?.aria,'search button must keep full accessible name: '+name);
   if(width>=1000)assert.equal(metrics.searchButton.labelClipped,false,'desktop search label clipped: '+name);
   if(width<=720&&(target==='tv'||target==='sources')){
   assert.equal(metrics.heading?.shortTitle,target==='sources'?'Nguồn':'TV','missing compact page title: '+name);
   assert.equal(metrics.heading?.clipped,false,'page header text clipped: '+name);
  }
  if(width>=900&&metrics.badge?.visible){
   assert.equal(metrics.badge.clipped,false,'release badge clipped: '+name);
   if(metrics.toggle&&metrics.badge.bottom>metrics.toggle.top&&metrics.badge.top<metrics.toggle.bottom)
    assert.ok(metrics.badge.right<=metrics.toggle.left-2,'release badge covered by menu: '+name);
  }
  if(target==='doctor'&&Number(metrics.navCount)===0){
    assert.equal(metrics.doctorEmptyVisible,true,'Doctor with no channels requires source onboarding: '+name);
    assert.equal(metrics.doctorSourceAction?.visible,true,'Doctor source CTA hidden: '+name);
    assert.equal(metrics.doctorAnalysis?.length,4,'Doctor must report four analysis controls: '+name);
    for(const action of metrics.doctorAnalysis){
      assert.equal(action.exists,true,'Doctor analysis button missing: '+action.id);
      assert.equal(action.disabled,true,'No-channel Doctor action remains clickable: '+action.id);
      assert.equal(action.tag,'true','Doctor disabled state must be tracked: '+action.id);
      assert.equal(action.describedBy,'positronDoctorEmptyHint','Doctor action must explain why disabled: '+action.id);
    }
    const restored=await page.evaluate(async()=>{
      const count=document.getElementById('navCount'),previous=count.textContent;
      const ids=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify'];
      count.textContent='1';await new Promise(resolve=>setTimeout(resolve,0));
      const enabled=ids.every(id=>{
       const b=document.getElementById(id);
       return !b.disabled&&!b.hasAttribute('data-positron-no-channels');
      });
      count.textContent=previous;await new Promise(resolve=>setTimeout(resolve,0));
      return {enabled,disabledAgain:ids.every(id=>document.getElementById(id).disabled)};
    });
    assert.equal(restored.enabled,true,'Doctor must re-enable when channels arrive: '+name);
    assert.equal(restored.disabledAgain,true,'Doctor must restore empty-state guard: '+name);

    const destination=await page.evaluate(()=>{
      document.getElementById('positronDoctorSources').click();
      const reached=document.querySelector('.page.active-page')?.id;
      window.IPTVState.setPage('doctor');
      return reached;
    });
    assert.equal(destination,'page-sources','Doctor source action must open Sources: '+name);
   }
   if(target==='settings'&&width>=900){
    const searchOpens=await page.evaluate(()=>{
      document.getElementById('positronOpen').click();
      const open=document.getElementById('positronPalette')?.hidden===false;
      window.OpenIPTVPositron?.close?.();
      return open;
    });
    assert.equal(searchOpens,true,'new icon must keep native command palette event');
   }
   if(target==='tv'&&(width===600||width===1360)){
      assert.equal(metrics.horizonScrollbar?.thumb,'#40736c','Horizon must not inherit purple scrollbar at '+width+'px');
      assert.equal(metrics.horizonScrollbar?.track,'#101a23','Horizon scrollbar track should match dark panel');
      assert.ok((metrics.horizonScrollbar?.color||'').includes('64, 115, 108'),'Electron scrollbar thumb must be muted teal');
       assert.equal(metrics.unifiedAiColors?.background,'rgb(25, 53, 47)','Horizon CC toolbar must not retain legacy purple fill');
       assert.equal(metrics.unifiedAiColors?.border,'rgb(60, 126, 112)','Horizon CC toolbar should have muted teal edge');
       assert.equal(metrics.unifiedAiColors?.markBackground,'rgb(112, 216, 191)','Horizon CC mark should not inherit bright purple');
       assert.equal(metrics.unifiedAiColors?.accent,'#67d4c0','Horizon legacy accent variable mismatch');
     }
    if(target==='tv'&&width===450){
    const state=await page.evaluate(async()=>{
     const btn=document.getElementById('playBtn'),previous=btn.textContent;
     btn.textContent='Ⅱ';await new Promise(resolve=>setTimeout(resolve,0));
     const pause=btn.dataset.poPlaying==='true'&&btn.getAttribute('aria-label')==='Tạm dừng phát';
     btn.textContent='▶';await new Promise(resolve=>setTimeout(resolve,0));
     const play=btn.dataset.poPlaying==='false'&&btn.getAttribute('aria-label')==='Phát kênh';
     btn.textContent=previous;await new Promise(resolve=>setTimeout(resolve,0));
     return {pause,play};
    });
    assert.ok(state.pause&&state.play,'native Play/Pause state must drive new compact media button');
   }
   if(target==='tv'&&(width===600||width===1360)){
      assert.equal(metrics.horizonScrollbar?.thumb,'#40736c','Horizon must not inherit purple scrollbar at '+width+'px');
      assert.equal(metrics.horizonScrollbar?.track,'#101a23','Horizon scrollbar track should match dark panel');
      assert.ok((metrics.horizonScrollbar?.color||'').includes('64, 115, 108'),'Electron scrollbar thumb must be muted teal');
       assert.equal(metrics.unifiedAiColors?.background,'rgb(25, 53, 47)','Horizon CC toolbar must not retain legacy purple fill');
       assert.equal(metrics.unifiedAiColors?.border,'rgb(60, 126, 112)','Horizon CC toolbar should have muted teal edge');
       assert.equal(metrics.unifiedAiColors?.markBackground,'rgb(112, 216, 191)','Horizon CC mark should not inherit bright purple');
       assert.equal(metrics.unifiedAiColors?.accent,'#67d4c0','Horizon legacy accent variable mismatch');
     }
    if(target==='tv'&&width===450){
    if(Number(metrics.sourceCount)===0){
      assert.equal(metrics.currentFavorite?.disabled,true,'no-channel star still clickable: '+name);
      assert.equal(metrics.currentFavorite?.guard,'true','favorite guard missing: '+name);
      assert.equal(metrics.currentFavorite?.description,'playingTitle','favorite needs accessible no-channel context: '+name);
      assert.equal(metrics.currentFavorite?.pressed,'false','favorite star incorrectly pressed without channel: '+name);
    }

    assert.equal(metrics.toolsToggle?.visible,true,'TV tools disclosure hidden at 450px');
    assert.equal(metrics.toolsToggle?.vector,true,'Tools disclosure still uses dots instead of sliders vector');
    assert.ok(metrics.toolsToggle?.pseudo==='none'||metrics.toolsToggle?.pseudo==='normal','Legacy ellipsis still appears over native SVG');
    assert.ok(metrics.toolsToggle.title.includes('Tua lại'),'TV tools tooltip still says Timeshift');
    if(metrics.toolsToggle.expanded==='false')assert.ok(metrics.toolsToggle.text.includes('Tua lại'),'collapsed disclosure uses nonlocalized Timeshift');
    const disclosure=await page.evaluate(()=>{
      const b=document.getElementById('positronToolsToggle'),initial=b.getAttribute('aria-expanded');
      b.click();const changed=b.getAttribute('aria-expanded')!==initial;
      const vectorAfterToggle=!!b.querySelector('svg path')&&b.querySelectorAll('svg circle').length===2;
      b.click();return {changed,vectorAfterToggle,restored:b.getAttribute('aria-expanded')===initial};
    });
    assert.equal(disclosure.changed,true,'tools toggle no longer opens');
    assert.equal(disclosure.vectorAfterToggle,true,'sliders icon disappears after toggling more tools');
    assert.equal(disclosure.restored,true,'tools toggle failed to restore original state');

    const focusState=await page.evaluate(()=>{
     const b=document.getElementById('positronFocus');
     const initial=b.querySelector('svg path')?.getAttribute('d');
     b.click();
     const active=b.getAttribute('aria-pressed')==='true';
     const different=b.querySelector('svg path')?.getAttribute('d')!==initial;
     b.click();
     return {active,different,restored:b.getAttribute('aria-pressed')==='false',svg:!!b.querySelector('svg')};
    });
    assert.equal(focusState.active,true,'native focus button click failed: '+name);
    assert.equal(focusState.different,true,'vector icon did not reflect focus state: '+name);
    assert.equal(focusState.restored,true,'native focus mode did not restore layout: '+name);
    assert.equal(focusState.svg,true,'focus icon removed after toggles: '+name);
   }
   if(target==='epg'&&width===720&&metrics.sourceCount==='0'){
    const reload=await page.evaluate(async()=>{
     const count=document.getElementById('navCount'),button=document.getElementById('epgRefreshBtn');
     const original=count.textContent;
     count.textContent='1';await new Promise(resolve=>setTimeout(resolve,0));
     const released=!button.disabled&&button.getAttribute('data-positron-epg-no-channels')===null;
     count.textContent=original;await new Promise(resolve=>setTimeout(resolve,0));
     return {released,restored:button.disabled&&button.getAttribute('data-positron-epg-no-channels')==='true'};
    });
    assert.equal(reload.released,true,'EPG Reload did not reenable on playlist arrival');
    assert.equal(reload.restored,true,'EPG Reload did not guard again after playlist removal');
   }
   if(target==='epg'&&width===720&&metrics.sourceCount==='0'){
    const state=await page.evaluate(async()=>{
     const select=document.getElementById('dvrChannel');
     const option=document.createElement('option');option.value='positron-qa-only';option.textContent='Kênh kiểm thử';
     select.replaceChildren(option);
     await new Promise(resolve=>setTimeout(resolve,0));
     const enabled=!select.disabled&&select.value==='positron-qa-only';
     const readyVisibleWithChannel=getComputedStyle(document.getElementById('dvrStatus')).display!=='none';
     const add=document.getElementById('dvrAdd');
     const enabledSubmit=!add.disabled&&!add.hasAttribute('data-positron-no-channels');
     const visibleWithChannels=getComputedStyle(document.getElementById('dvrForm')).display!=='none';
     select.replaceChildren();
     await new Promise(resolve=>setTimeout(resolve,0));
     const hiddenWithoutChannels=getComputedStyle(document.getElementById('dvrForm')).display==='none';
     const nativeReadyHiddenAgain=getComputedStyle(document.getElementById('dvrStatus')).display==='none';
     return {enabled,enabledSubmit,disabled:select.disabled,disabledSubmit:add.disabled,placeholder:select.selectedOptions?.[0]?.textContent?.trim()||'',visibleWithChannels,hiddenWithoutChannels,readyVisibleWithChannel,nativeReadyHiddenAgain};
    });
    assert.equal(state.enabled,true,'DVR select failed to re-enable when a channel option appears');
    assert.equal(state.disabled,true,'DVR select failed to disable again after options removed');
    assert.equal(state.enabledSubmit,true,'DVR submit must re-enable when channel appears');
    assert.equal(state.disabledSubmit,true,'DVR submit must disable again when channels are removed');
    assert.equal(state.placeholder,'Chưa có kênh để ghi hình','DVR placeholder failed to recover');
    assert.equal(state.visibleWithChannels,true,'DVR form did not reappear when channels were added');
    assert.equal(state.hiddenWithoutChannels,true,'DVR form did not collapse again after channels removed');
    assert.equal(state.readyVisibleWithChannel,true,'Native DVR status did not return after channel restoration');
    assert.equal(state.nativeReadyHiddenAgain,true,'Misleading native idle-ready status returned after channel removal');
   }
   if(target==='epg'){
    assert.equal(metrics.epgEmptySummary,"Chưa tải EPG. Nhấn “Nguồn EPG” phía trên để chọn hoặc cập nhật nguồn.",'EPG empty instruction must point to actual top Nguồn EPG button: '+name);
    assert.ok(metrics.epgSourceAction?.visible,'EPG settings shortcut must be visible: '+name);
    if(metrics.epgToolVisibility?.programmeCount===0){
     assert.equal(metrics.epgToolVisibility.collapsed,true,'Unusable advanced EPG controls must collapse without guide: '+name);
     assert.equal(metrics.epgToolVisibility.filterVisible,false,'Empty EPG channel filter still wasting space: '+name);
     assert.equal(metrics.epgToolVisibility.advancedVisible,false,'Unusable EPG search, mapping and offset are still visible: '+name);
     assert.equal(metrics.epgToolVisibility.searchResultsVisible,false,'No-guide advanced search duplicates the native empty-state guidance: '+name);
     assert.ok(metrics.epgToolVisibility.searchPreserved&&metrics.epgToolVisibility.mappingPreserved&&metrics.epgToolVisibility.offsetPreserved,
      'Advanced controls were removed instead of reversibly hidden: '+name);
     const transitions=await page.evaluate(async()=>{
      const state=window.IPTVExtras?.getGuide?.();
      const summary=document.getElementById('epgSummary');
      const section=document.getElementById('page-epg');
      const advanced=document.querySelector('#page-epg .epg-advanced');
      const filter=document.querySelector('#page-epg .epg-filter');
      if(!state||!Array.isArray(state.programmes)||!summary||!advanced||!filter)return null;
      const oldMarkup=summary.innerHTML;
      const program={id:'positron-qa-only',title:'Visual UI regression (temporary)',start:Date.now(),end:Date.now()+60000};
      state.programmes.push(program);
      summary.textContent+=' ';
      await new Promise(resolve=>setTimeout(resolve,0));
      const epgToolsReopened=!section.hasAttribute('data-positron-no-epg-programmes')
        &&getComputedStyle(advanced).display!=='none'&&getComputedStyle(filter).display!=='none';
      const results=document.getElementById('epgSearchResults');
      const epgSearchUpdatedAfterGuide=!!results&&!results.textContent.includes('Chưa có dữ liệu EPG.')
       &&getComputedStyle(results).display!=='none';
      state.programmes.pop();
      summary.innerHTML=oldMarkup;
      await new Promise(resolve=>setTimeout(resolve,0));
      const epgToolsCollapsedAgain=section.hasAttribute('data-positron-no-epg-programmes')
        &&getComputedStyle(advanced).display==='none'&&getComputedStyle(filter).display==='none';
      return {epgToolsReopened,epgToolsCollapsedAgain,epgSearchUpdatedAfterGuide,programmeCount:state.programmes.length};
     });
     assert.ok(transitions?.epgToolsReopened,'EPG controls did not reopen when a guide programme appeared: '+name);
     assert.ok(transitions?.epgSearchUpdatedAfterGuide,'EPG search still displays old no-data message after guide becomes available: '+name);
     assert.ok(transitions?.epgToolsCollapsedAgain,'EPG controls did not collapse again after guide removed: '+name);
     assert.equal(transitions?.programmeCount,0,'QA-only guide entry was not removed');
    }
    if(metrics.sourceCount==='0')assert.equal(metrics.epgGuideEmptyText,'Chưa có kênh. Thêm nguồn M3U trong Quản lý nguồn để xem lịch phát sóng.','EPG guide falsely blames XMLTV mapping when no playlist exists: '+name);
    if(metrics.sourceCount==='0'){
     assert.equal(metrics.epgReloadAvailability?.disabled,true,'Reload EPG must not be actionable with no channels: '+name);
     assert.equal(metrics.epgReloadAvailability?.marked,'true','Empty-channel EPG Reload guard missing: '+name);
    }
    if(metrics.sourceCount==='0'){
     assert.equal(metrics.dvrFormVisible,false,'Empty DVR scheduling form still dominates EPG: '+name);
     assert.ok(metrics.dvrEmptyAction?.visible,'Compact DVR empty action missing: '+name);
     assert.ok(metrics.dvrFolder?.visible,'DVR folder controls lost when no channels: '+name);
     if(metrics.dvrNativeText.startsWith('Sẵn sàng đặt lịch ghi'))assert.equal(metrics.dvrNativeStatus?.visible,false,'DVR falsely says ready despite no schedulable channel: '+name);
    }
   }
   if(target==='sources'&&metrics.sources)assert.notEqual(metrics.sources.background,'rgb(255, 255, 255)','white source panel');
   if(target==='sources'){
    assert.equal(metrics.smartStatusLabel?.text,'Trạng thái','Smart Discovery status label disappeared: '+name);
    if(metrics.smartInitial?.catalog==='country')assert.equal(metrics.smartInitial.text,"Đã chọn bộ sưu tập mặc định. Nhấn Khám phá nguồn để tải kênh.",'Preselected Smart Discovery catalog has wrong guidance: '+name);
    assert.equal(metrics.smartStatusLabel?.lineRects,1,'Smart Discovery status label wrapped: '+name);
    assert.equal(metrics.smartStatusLabel?.whiteSpace,'nowrap','status label missing no-wrap layout: '+name);
    assert.equal(metrics.smartStatusLabel?.flexShrink,'0','status label still shrinks in responsive flex: '+name);
   }

   // P5.1.72: screenshots exposed a confusing interleaving of inputs/actions.
   // Compare actual DOM geometry, not just the CSS declaration.
   if(target==='sources'){
    const layout=await page.evaluate(()=>{
     const form=document.querySelector('#smartDiscoverySection .smart-discovery-filters');
     const fields=[...form.querySelectorAll(':scope > label')].filter(el=>getComputedStyle(el).display!=='none');
     const b=el=>el.getBoundingClientRect();
     const find=document.getElementById('smartFind'),verify=document.getElementById('smartVerify'),cancel=document.getElementById('smartCancel');
     return {display:getComputedStyle(form).display,fieldCount:fields.length,
      fieldsAboveActions:b(find).top>=Math.max(...fields.map(el=>b(el).bottom))-2,
      siblingActions:Math.abs(b(verify).top-b(cancel).top)<3,
      noHorizontalOverflow:form.scrollWidth<=form.clientWidth+2,
      tabOrder:fields.at(-1)?.compareDocumentPosition(find)&Node.DOCUMENT_POSITION_FOLLOWING?true:false};
    });
    assert.equal(layout.display,'grid','Discovery must use ordered grid at '+width+'px');
    assert.equal(layout.fieldCount,4,'Discovery filters lost native controls');
    assert.equal(layout.fieldsAboveActions,true,'Search button still interleaves native filters: '+name);
    assert.equal(layout.siblingActions,true,'Scan and Cancel must share one visual row: '+name);
    assert.equal(layout.noHorizontalOverflow,true,'Discovery form overflows: '+name);
    assert.equal(layout.tabOrder,true,'Discovery keyboard order differs from visual sequence: '+name);
   }

   if(target==='sources'&&width>=900&&Number(metrics.sourceCount)===0){
    assert.ok(metrics.sourceEmpty?.height<=57,'desktop no-source card remains oversized: '+name);
    assert.ok(metrics.sourceEmpty?.paddingTop<=14&&metrics.sourceEmpty?.paddingBottom<=14,'desktop empty state padding too large: '+name);
    assert.ok(metrics.sourceEmpty?.gap<=20,'desktop Smart Discovery remains too far below guidance: '+name);
   }

  if(target==='sources'&&width<=720){
   assert.ok(metrics.sourceEmpty?.text.startsWith('Chưa có nguồn.'),'no-source guidance unexpectedly changed');
   assert.ok(metrics.sourceEmpty.height<=65,'empty sources block still wastes vertical space: '+name);
   assert.ok(metrics.sourceEmpty.paddingTop<=14&&metrics.sourceEmpty.paddingBottom<=14,'empty source padding remained oversized: '+name);
   assert.ok(metrics.sourceEmpty.gap<=30,'Discovery is still pushed far below empty source message: '+name);
   assert.equal(metrics.smartLimit?.value,'all','scan all behavior changed: '+name);
   assert.equal(metrics.smartLimit?.label,'Tất cả kênh','compact scope label missing: '+name);
   assert.ok(metrics.smartLimit.textWidth+32<=metrics.smartLimit.controlWidth,'scan scope option is clipped: '+name);
  }
  if(target==='sources'){
   assert.ok(metrics.sourceSection,'Smart Discovery section missing');
   assert.equal(metrics.sourceSection.background,metrics.sources?.background,'Smart Discovery dark band must match source navigation theme');
   assert.equal(metrics.sourceHeading?.background,metrics.sources?.background,'Smart Discovery heading must not be black');
   const channels=(metrics.sourceSection.background.match(/[0-9]+/g)||[]).map(Number).slice(0,3);
   assert.ok(channels.length===3&&channels.reduce((a,b)=>a+b,0)/3<110,
    'P5.1 regression: light Smart Discovery background '+metrics.sourceSection.background);
  }
  if(target==='fav'){
    if(width===600){
     assert.equal(metrics.heading?.shortTitle,'Yêu thích','real compact Favorites title should be short');
      assert.equal(metrics.heading?.fontSize,'0px','Horizon duplicates header title on 600px viewport');
      assert.ok((metrics.heading?.pseudoContent||'').includes(metrics.heading.shortTitle),'short heading not rendered');
      assert.equal(metrics.heading?.nativeText,'Kênh yêu thích','accessible full text must remain');
      assert.ok(metrics.favoriteEmptyLayout?.top>=300,'compact Favorites card too high: '+name+' '+metrics.favoriteEmptyLayout?.top);
     assert.ok(metrics.favoriteEmptyLayout?.buttonBottom<=metrics.favoriteEmptyLayout?.viewportHeight-40,'Favorites source action clipped by bottom bar: '+name);
    }

    assert.equal(metrics.favoriteAction?.visible,true,'Favorites empty state requires source action: '+name);
    if(Number(metrics.sourceCount)===0)assert.ok(metrics.favoriteGuidance.startsWith('Chưa có nguồn IPTV.'),'zero-source message misleading: '+name);
    else assert.ok(metrics.favoriteGuidance.startsWith('Chưa có kênh yêu thích'),'nonempty source guidance misleading: '+name);
    const destination=await page.evaluate(()=>{
      document.getElementById('positronFavoritesSources').click();
      const page=document.querySelector('.page.active-page')?.id;
      window.IPTVState.setPage('fav');
      return page;
    });
    assert.equal(destination,'page-sources','Favorites action must open Sources: '+name);
   }
   if(target==='doctor'&&metrics.sourceCount==='0'){
    const emptyDoctor=await page.evaluate(()=>{
     const section=document.getElementById('page-doctor');
     return {empty:section.dataset.poEmptyDoctor==='true',
      v3Hidden:getComputedStyle(document.getElementById('doctorV3Panel')).display==='none',
      v2Hidden:getComputedStyle(document.getElementById('doctorV2Panel')).display==='none',
      sourceAction:(()=>{const action=document.getElementById('positronDoctorSources');return !!action&&!action.hidden&&!action.closest('[hidden]')&&getComputedStyle(action).display!=='none'&&action.getBoundingClientRect().width>=40;})(),
      sourceActionNative:document.getElementById('positronDoctorSources')?.textContent.trim()==='Quản lý nguồn IPTV',
      metricsHidden:(()=>{const m=document.querySelector('#doctorReport .doctor-metrics');return !!m&&getComputedStyle(m).display==='none';})(),
      startHeading:document.querySelector('#positronDoctorEmptyHint .po-doctor-start-copy strong')?.textContent.trim()};
    });
    assert.equal(emptyDoctor.empty,true,'Doctor did not detect empty native playlist');
    assert.equal(emptyDoctor.v3Hidden,true,'Zero-channel Doctor still opens complex unused analytics');
    assert.equal(emptyDoctor.v2Hidden,true,'Zero-channel Doctor still exposes advanced visual diagnostics');
    assert.equal(emptyDoctor.sourceAction,true,'Doctor must retain visible native source onboarding action');
    assert.equal(emptyDoctor.sourceActionNative,true,'Doctor import action must keep native label');
    assert.equal(emptyDoctor.metricsHidden,true,'Empty Doctor still shows six meaningless zeros');
    assert.equal(emptyDoctor.startHeading,'Bắt đầu chẩn đoán với nguồn của bạn','Doctor onboarding heading lost');
    const doctorNavigation=await page.evaluate(()=>{
      document.getElementById('positronDoctorSources').click();
      const active=document.querySelector('.page.active-page')?.id;
      window.IPTVState.setPage('doctor');
      return active;
    });
    assert.equal(doctorNavigation,'page-sources','Doctor import action must navigate to native Sources');
   }
   if(target==='doctor'&&metrics.sourceCount==='0'){
    assert.equal(metrics.doctorButtons?.length,4,'expected four native Doctor analysis buttons: '+name);
    assert.equal(metrics.doctorButtons?.every(action=>action?.disabled&&action.guard==='true'&&action.filter.includes('grayscale(1)')&&action.luma<140),true,'disabled Doctor action still bright or active: '+name+' '+JSON.stringify(metrics.doctorButtons));
   }
   if(target==='settings'){
    assert.equal(metrics.cloudLogin?.loggedOut,true,'Settings CI baseline must be logged out for compact QA: '+name);
    assert.ok(metrics.cloudLogin?.height>=200&&metrics.cloudLogin?.height<=290,'account panel still takes too much vertical space: '+name+' '+metrics.cloudLogin?.height);
    assert.ok(metrics.cloudLogin?.inputHeight>=42,'email OTP field lost its tap target: '+name);
    assert.ok(metrics.cloudLogin?.buttonHeight>=42,'OTP submission button lost its tap target: '+name);
    assert.ok(metrics.cloudLogin?.status.length>0,'cloud authentication status disappeared: '+name);
   }
   if(target==='epg'){
    assert.ok(metrics.epgGuidance?.luma>=140,'EPG search guidance color too dim: '+name+' '+metrics.epgGuidance?.color);
    assert.equal(metrics.epgGuidance?.fontSize,'13px','EPG search guidance too small: '+name);
    assert.equal(metrics.epgGuidance?.opacity,'1','EPG guidance unexpectedly faded: '+name);
    if(metrics.sourceCount==='0'){
     assert.equal(metrics.dvrSchedule?.disabled,true,'no-channel DVR submit still clickable: '+name);
     assert.equal(metrics.dvrSchedule?.guard,'true','DVR submit missing guard: '+name);
     assert.equal(metrics.dvrSchedule?.description,'dvrChannel','DVR submit must reference disabled channel selector');
     assert.ok(metrics.dvrSchedule?.filter.includes('grayscale(1)'),'no-channel DVR submit retains bright primary fill: '+name);
     assert.equal(metrics.dvrSchedule?.opacity,'1','disabled DVR must have controlled neutral colors: '+name);
     assert.equal(metrics.dvrSchedule?.cursor,'not-allowed','disabled DVR pointer affordance: '+name);
     assert.equal(metrics.dvrSchedule?.vector,true,'DVR submit still uses platform glyph: '+name);
     assert.equal(metrics.dvrSchedule?.ariaHidden,'true','record icon must be decorative: '+name);
     assert.equal(metrics.dvrSchedule?.label,'Đặt lịch ghi','record action caption was lost: '+name);

     const c=(metrics.dvrSchedule?.background.match(/\d+/g)||[]).map(Number).slice(0,3);
     assert.ok(c.length===3&&c.reduce((a,b)=>a+b,0)/3<140,'disabled DVR background still too bright: '+name);

     assert.equal(metrics.dvrChannel?.disabled,true,'DVR selector must be disabled with no channels: '+name);
     assert.equal(metrics.dvrChannel?.count,1,'empty DVR option missing: '+name);
     assert.equal(metrics.dvrChannel?.text,'Chưa có kênh để ghi hình','DVR placeholder lost: '+name);
     assert.ok(metrics.dvrChannel.label.includes('Chưa có kênh'),'DVR accessible label missing');
    }
    assert.equal(metrics.dvrHeading?.svg,true,'DVR heading still uses platform emoji: '+name);
    assert.ok(metrics.dvrHeading.width>=18,'DVR recording icon too small: '+name);
    assert.equal(metrics.dvrHeading.aria,'true','decorative DVR SVG must be hidden from screen readers');
    assert.ok(metrics.dvrHeading.label.includes('Hẹn giờ ghi hình chương trình'),'DVR heading text lost');
   }
   // P5.1.73: very long device recording directories must remain accessible.
   if(target==='epg'&&width===720){
    const folderQa=await page.evaluate(async()=>{
     const directory=document.getElementById('dvrDirectory'),button=document.getElementById('dvrChooseDir');
     const folder=directory.closest('.dvr-folder'),original=directory.textContent;
     const long='/Users/Example Account With A Very Very Long Name/Library/Application Support/Open IPTV Pro Positron/very/deep/nested/directory/recordings/final';
     directory.textContent=long;
     await new Promise(resolve=>setTimeout(resolve,0));
     const pathRect=directory.getBoundingClientRect(),buttonRect=button.getBoundingClientRect(),folderRect=folder.getBoundingClientRect();
     const computed=getComputedStyle(directory);
     const test={label:document.getElementById('poDvrDirectoryLabel')?.textContent?.trim(),
      titled:directory.title===long,ellipsis:computed.textOverflow==='ellipsis',
      clipped:directory.scrollWidth>directory.clientWidth,
      buttonVisible:buttonRect.width>=90&&buttonRect.right<=folderRect.right+2,
      rowAligned:Math.abs((pathRect.top+pathRect.height/2)-(buttonRect.top+buttonRect.height/2))<=45,
      noOverflow:document.documentElement.scrollWidth<=innerWidth+6};
     directory.textContent=original;await new Promise(resolve=>setTimeout(resolve,0));
     return test;
    });
    assert.equal(folderQa.label,'Thư mục ghi hình','recordings path is missing a human-friendly label');
    assert.equal(folderQa.titled,true,'recording path tooltip lost full path');
    assert.equal(folderQa.ellipsis,true,'long filesystem path is not visually truncated');
    assert.equal(folderQa.clipped,true,'long path must be constrained to available width');
    assert.equal(folderQa.buttonVisible,true,'change directory button clipped outside EPG panel');
    assert.equal(folderQa.rowAligned,true,'change directory and path become disconnected');
    assert.equal(folderQa.noOverflow,true,'long directory creates horizontal page scroll');
   }

   if(target==='epg'&&metrics.epg)assert.notEqual(metrics.epg.background,'rgb(255, 255, 255)','white EPG search');
  if(target==='tv')assert.equal(metrics.searchShortcut,'/');
  if(target==='tv'&&width===450&&Number(metrics.navCount)===0){
   assert.equal(metrics.playAvailability?.disabled,true,'Play must be disabled when no channels exist: '+name);
   assert.equal(metrics.playAvailability?.guard,'true','empty Play guard missing: '+name);
   assert.ok(Number(metrics.playAvailability?.opacity)<=.6,'empty Play still looks active: '+name);
   assert.equal(metrics.playAvailability?.cursor,'not-allowed','empty Play pointer not disabled: '+name);
   const playLifecycle=await page.evaluate(async()=>{
    const count=document.getElementById('navCount'),play=document.getElementById('playBtn');
    const before=count.textContent;count.textContent='1';await new Promise(resolve=>setTimeout(resolve,0));
    const reenabled=!play.disabled&&!play.hasAttribute('data-positron-no-channels');
    count.textContent=before;await new Promise(resolve=>setTimeout(resolve,0));
    return {reenabled,disabledAgain:play.disabled};
   });
   assert.equal(playLifecycle.reenabled,true,'Play must reactivate when a source supplies channels: '+name);
   assert.equal(playLifecycle.disabledAgain,true,'Play should guard empty sources again: '+name);
   assert.equal(metrics.transportAvailability?.every(x=>x?.disabled&&x.guard==='true'&&x.opacity<=.5),true,'TV navigation/Stop actions still active with zero channels: '+name);
   const transportLifecycle=await page.evaluate(async()=>{
    const counter=document.getElementById('navCount'),old=counter.textContent;
    counter.textContent='1';await new Promise(resolve=>setTimeout(resolve,0));
    const prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn'),stop=document.getElementById('stopBtn');
    const navigationEnabled=!prev.disabled&&!next.disabled;
    const stopRemainsInactive=stop.disabled;
    counter.textContent=old;await new Promise(resolve=>setTimeout(resolve,0));
    return {navigationEnabled,stopRemainsInactive,restored:['prevBtn','nextBtn','stopBtn'].every(id=>document.getElementById(id).disabled)};
   });
   assert.equal(transportLifecycle.navigationEnabled,true,'channel navigation not restored: '+name);
   assert.equal(transportLifecycle.stopRemainsInactive,true,'Stop should require current channel: '+name);
   assert.equal(transportLifecycle.restored,true,'empty transport guards not restored: '+name);
   assert.equal(metrics.outputAvailability?.every(x=>x?.disabled&&x.guard==='true'&&x.opacity<=.5&&x.svg),true,'idle Cast/PiP appear active or lost their vector icon: '+name);
   assert.equal(metrics.emptyArtwork?.svg,true,'empty TV still shows a fake Play triangle: '+name);
   assert.equal(metrics.emptyArtwork?.ariaHidden,'true','empty TV illustration should not repeat control name: '+name);
   assert.equal(metrics.emptyArtwork?.glyph,'','empty TV illustration retained decorative Play text: '+name);
   assert.equal(metrics.emptyArtwork?.width,28,'empty TV screen vector dimension regressed: '+name);



  }

  // P5.1.74: prioritize usable controls over an oversized empty video area.
  // Turn the empty state off only for a measurement and restore it before capture.
  if(target==='tv'&&width===1360&&Number(metrics.navCount)===0){
   const emptyStage=await page.evaluate(async()=>{
    const stage=document.getElementById('playerBox'),empty=document.getElementById('emptyPlayer');
    const initial=stage.getBoundingClientRect();
    const compact=initial.height;
    const controls=document.querySelector('#page-tv .player-control-card').getBoundingClientRect();
    empty.classList.add('hidden');
    await new Promise(resolve=>requestAnimationFrame(resolve));
    const liveStage=stage.getBoundingClientRect();
    empty.classList.remove('hidden');
    await new Promise(resolve=>requestAnimationFrame(resolve));
    const restored=stage.getBoundingClientRect().height;
    return {compact,viewport:innerHeight,firstControlTop:controls.top,
     restored:Math.abs(restored-compact)<=2,
     preservesVideoRatio:Math.abs(liveStage.height-liveStage.width*9/16)<=3,
     compactHasRoom:compact>=280&&compact<=430,
     nativeControlsReachable:controls.top<innerHeight-200};
   });
   assert.equal(emptyStage.compactHasRoom,true,'oversized no-source video stage still hides quick player controls');
   assert.equal(emptyStage.nativeControlsReachable,true,'empty TV pushes player toolbar below the first screen');
   assert.equal(emptyStage.preservesVideoRatio,true,'loaded video must retain its native 16:9 stage');
   assert.equal(emptyStage.restored,true,'empty stage did not restore after test');
  }

  // P5.1.75: only expose a genuine Video Lab beta, not an active AI upscale claim.
  if(target==='tv'&&(width===1360||width===720)){
   const videoLab=await page.evaluate(()=>{
    const trigger=document.getElementById('videoEnhanceToggle'),panel=document.getElementById('videoEnhancePanel');
    const apply=document.getElementById('veh-apply');
    const before=panel.hidden;
    trigger.click();
    const opened=!panel.hidden&&trigger.getAttribute('aria-expanded')==='true';
    trigger.click();
    const closed=panel.hidden&&trigger.getAttribute('aria-expanded')==='false';
    return {label:trigger.textContent.trim(),title:trigger.title,apply:apply?.textContent.trim(),
     before,opened,closed};
   });
   assert.equal(videoLab.before,true,'Video Lab must not auto-open');
   assert.ok(videoLab.label.includes('Video Lab')&&videoLab.label.includes('Beta'),'AI button still misleadingly promises working upscale');
   assert.ok(videoLab.title.includes('chưa có backend'),'Video Lab lacks an honest capability explanation');
   assert.equal(videoLab.apply,'Xem khả năng áp dụng','no backend should offer a fake Apply button');
   assert.equal(videoLab.opened,true,'Video Lab settings became inaccessible');
   assert.equal(videoLab.closed,true,'Video Lab cannot close');
  }

  // P5.1.19: exercise both real keyboard handlers in the Electron renderer.
  // '/' must focus the visible channel finder; Ctrl+K remains global.
  if(target==='tv'&&round===1){
   const rail=await page.evaluate(async()=>{
    const button=document.getElementById('poRailExpand'),sidebar=document.getElementById('appSidebar');
    const before=sidebar.getBoundingClientRect().width;
    button.click();await new Promise(resolve=>setTimeout(resolve,0));
    const expanded=sidebar.getBoundingClientRect().width;
    const aria=button.getAttribute('aria-expanded');
    button.click();await new Promise(resolve=>setTimeout(resolve,0));
    const restored=sidebar.getBoundingClientRect().width;
    return {before,expanded,aria,restored};
   });
   assert.ok(rail.expanded>=205&&rail.expanded>rail.before+90,'rail cannot expand to show full feature labels');
   assert.equal(rail.aria,'true','expanded rail lacks accessible state');
   assert.ok(Math.abs(rail.restored-rail.before)<=2,'rail cannot collapse back without layout loss');
  }
  if(target==='tv'&&round===1){
   const keys=await page.evaluate(()=>{
    const finder=document.getElementById('searchBox');
    finder?.blur();
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'/',bubbles:true}));
    const slashFocused=document.activeElement===finder;
    const slashDidNotOpenPalette=document.getElementById('positronPalette')?.hidden===true;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));
    const ctrlOpenedPalette=document.getElementById('positronPalette')?.hidden===false;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const escapeClosedPalette=document.getElementById('positronPalette')?.hidden===true;
    return {slashFocused,slashDidNotOpenPalette,ctrlOpenedPalette,escapeClosedPalette};
   });
   assert.equal(keys.slashFocused,true,'/ failed to focus visible TV channel finder');
   assert.equal(keys.slashDidNotOpenPalette,true,'/ incorrectly opened global palette over channel search');
   assert.equal(keys.ctrlOpenedPalette,true,'Ctrl+K must still open command palette');
   assert.equal(keys.escapeClosedPalette,true,'Escape must close command palette');
   await page.screenshot({path:path.join(out,'positron-p5-19-slash-search-real.png'),animations:'disabled'});
   await page.evaluate(()=>document.activeElement?.blur?.());
  }

  // Preserve an explicit metric for overflow; fail rather than concealing a layout regression.
  assert.equal(metrics.overflow,false,'horizontal overflow in '+name);
  const filename='positron-p5-'+String(round).padStart(2,'0')+'-real.png';
  const bytes=await page.screenshot({path:path.join(out,filename),animations:'disabled'});
  assert.ok(bytes.length>10000,'screen capture too small: '+name);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  results.push({round,name,page:target,theme,width,filename,bytes:bytes.length,sha256,metrics,passed:true});
  prev={round,overflow:metrics.overflow,sha256};
  process.stdout.write('P5 upgrade check '+round+'/20 REAL Electron screenshot PASS: '+name+'\n');
 }
 // Separate, explicit metadata-only QA (NOT a real streaming test). We use
 // 552 synthetic channels so the user playlist never enters source control or
 // CI logs and live streams are never requested.


 await page.setViewportSize({width:1360,height:820});
 const metadataQa=await page.evaluate(()=>{
  const lines=['#EXTM3U'];
  for(let i=1;i<=552;i++){
   const name=i%55===0?'Very long channel title '+i+' · regional extended edition':'QA Channel '+String(i).padStart(3,'0');
   const group=i<=15?'01 • Main channels':i<=120?'02 • Regional channels':'03 • Other channels';
   lines.push('#EXTINF:-1 tvg-id="qa'+i+'" group-title="'+group+'",'+name);
   lines.push('https://example.invalid/positron-visual-only-'+i+'.m3u8');
  }
  window.IPTVState.importSource('LOCAL QA VISUAL ONLY','local:qa',lines.join('\n'),'file');
  window.IPTVState.setPage('tv');
  const list=document.getElementById('channelList'),panel=document.querySelector('#page-tv .channel-panel');
  const groupHeader=list.querySelector('.folder-header'),groupStyle=groupHeader?getComputedStyle(groupHeader):null;
  return {groupHeaderStyle:groupStyle?{background:groupStyle.backgroundColor,color:groupStyle.color,theme:document.documentElement.dataset.theme||'',uiPreset:document.documentElement.dataset.uiStyle||''}:null,channelCount:window.IPTVState.getChannels().length,
   sourceCount:window.IPTVState.getStore().sources.length,
   groupHeaders:list.querySelectorAll('.folder-header,.group-header,.channel-folder-header').length,
   panelWidth:Math.round(panel.getBoundingClientRect().width),
   noPlaying:window.IPTVState.getCurrent()===null};
 });
 assert.equal(metadataQa.channelCount,552,'visual-only M3U test did not import 552 channels');
 assert.equal(metadataQa.noPlaying,true,'visual metadata QA must never start a stream');
 // P5.1.88: real native metadata-only playlist must transform player onboarding
 // without triggering video playback or removing original import controls.
 await page.waitForTimeout(0);
 const populatedPlayerQa=await page.evaluate(()=>{
  const empty=document.getElementById('emptyPlayer');
  const first=document.getElementById('poFirstChannelAction');
  const file=document.getElementById('emptyFileBtn');
  const url=document.getElementById('emptyUrlBtn');
  return {title:empty.querySelector('h2')?.textContent,
   countText:empty.querySelector('p')?.textContent||'',
   ready:empty.dataset.poHasChannels,firstAction:!!first&&!first.hidden,
   fileHidden:file.hidden,urlHidden:url.hidden,
   nativeImportsKept:!!file&&!!url,
   noPlaying:window.IPTVState.getCurrent()===null,
   subtitle:document.getElementById('playingSubtitle')?.textContent.trim()};
 });
 assert.equal(populatedPlayerQa.title,'Chọn kênh để xem','Player still asks to import after 552 channels exist');
 assert.ok(populatedPlayerQa.countText.includes('552'),'Player cannot explain imported channel count');
 for(const key of ['firstAction','fileHidden','urlHidden','nativeImportsKept','noPlaying'])
  assert.equal(populatedPlayerQa[key],true,'Populated-player onboarding failed: '+key);
 assert.equal(populatedPlayerQa.ready,'true');
 assert.equal(populatedPlayerQa.noPlaying,true,'Native source onboarding must never autoplay during metadata QA');
 assert.equal(populatedPlayerQa.subtitle,'Chọn kênh để bắt đầu','Native player subtitle still incorrectly asks to import a source');
 await page.screenshot({path:path.join(out,'positron-p5188-player-ready-552-metadata-real.png'),animations:'disabled'});
 await page.screenshot({path:path.join(out,'positron-p5189-player-ready-subtitle-552-metadata-real.png'),animations:'disabled'});

// P5.1.90: simulate selection via temporary native facade; never play a
// stream. Confirm experimental Video Lab returns only with a selected channel.
 const videoLabAvailabilityQa=await page.evaluate(async()=>{
  const native=window.IPTVState,button=document.getElementById('videoEnhanceToggle');
  const title=document.getElementById('playingTitle'),originalTitle=title.textContent;
  const first=native.getChannels()[0];
  const hiddenWhenIdle=button.hidden&&getComputedStyle(button).display==='none';
  let visibleWithSelection=false;
  try{
   window.IPTVState=Object.freeze({...native,getCurrent:()=>first});
   title.textContent=first.name;
   await new Promise(resolve=>requestAnimationFrame(resolve));
   visibleWithSelection=!button.hidden&&getComputedStyle(button).display!=='none';
  }finally{
   window.IPTVState=native;
   title.textContent=originalTitle;
   await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  return {hiddenWhenIdle,visibleWithSelection,hiddenAfterRestore:button.hidden,
   noPlaying:native.getCurrent()===null,
   preserved:!!document.getElementById('videoEnhancePanel')};
 });
 for(const key of ['hiddenWhenIdle','visibleWithSelection','hiddenAfterRestore','noPlaying','preserved'])
  assert.equal(videoLabAvailabilityQa[key],true,'Video Lab availability regression: '+key);
 await page.screenshot({path:path.join(out,'positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png'),animations:'disabled'});

// P5.1.91: inspect the computed Web SVG mask on the real Electron native
// Play button. Switch glyph text without clicking or ever starting video.
 const webPlayIconQa=await page.evaluate(async()=>{
  const button=document.getElementById('playBtn'),video=document.getElementById('video');
  const original=button.textContent;
  const preview=()=>{const css=getComputedStyle(button,'::before');return {
    mask:css.webkitMaskImage||css.maskImage,
    clip:css.clipPath,
    width:Math.round(parseFloat(css.width)),
    playing:button.dataset.poPlaying};};
  const before=preview();
  button.textContent='Ⅱ';
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const during=preview();
  button.textContent=original;
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const after=preview();
  return {webMask:before.mask.includes('data:image/svg+xml'),
    playAndPauseDistinct:before.mask!==during.mask,
    pauseState:during.playing==='true',
    restoredPlay:after.playing==='false'&&after.mask===before.mask,
    noClip:before.clip==='none'&&during.clip==='none',
    vectorSize:before.width===22&&during.width===22,
    notPlaying:window.IPTVState.getCurrent()===null&&video.paused,
    noNativeHandlersRemoved:!!button};
 });
 for(const key of ['webMask','playAndPauseDistinct','pauseState','restoredPlay','noClip','vectorSize','notPlaying','noNativeHandlersRemoved'])
  assert.equal(webPlayIconQa[key],true,'P5.1.91 native Play SVG mask regression: '+key);
 await page.screenshot({path:path.join(out,'positron-p5191-web-play-svg-552-metadata-real.png'),animations:'disabled'});

 // P5.1.76: the no-source Doctor simplification must disappear when native
 // metadata-only channels are imported, without touching any live URL.
 await page.evaluate(()=>window.IPTVState.setPage('doctor'));
 await page.waitForTimeout(0);
 const populatedDoctor=await page.evaluate(()=>({
  empty:document.getElementById('page-doctor').dataset.poEmptyDoctor,
  v3Visible:getComputedStyle(document.getElementById('doctorV3Panel')).display!=='none',
  v2Visible:getComputedStyle(document.getElementById('doctorV2Panel')).display!=='none',
  channels:window.IPTVState.getChannels().length,
  metricsVisible:getComputedStyle(document.querySelector('#doctorReport .doctor-metrics')).display!=='none'
 }));
 assert.equal(populatedDoctor.empty,'false','Doctor failed to restore after importing channels');
 assert.equal(populatedDoctor.v3Visible,true,'Doctor analysis missing after source import');
 assert.equal(populatedDoctor.v2Visible,true,'Doctor advanced diagnostics missing after source import');
 assert.equal(populatedDoctor.channels,552,'Doctor restoration used nonnative playlist');
 assert.equal(populatedDoctor.metricsVisible,true,'Doctor statistics did not return after native import');
 await page.screenshot({path:path.join(out,'positron-p5-doctor-552-metadata-real.png'),animations:'disabled'});
 await page.evaluate(()=>window.IPTVState.setPage('tv'));
 assert.ok(metadataQa.panelWidth>=200,'populated channel panel clipped');
 assert.equal(metadataQa.groupHeaderStyle?.background,'rgb(23, 48, 56)','populated channel folder must be dark and match Horizon rather than lavender legacy style');
 assert.equal(metadataQa.groupHeaderStyle?.color,'rgb(142, 233, 211)','folder text must match Horizon teal and remain readable');
 const metaFilename='positron-p5-visual-only-552-channels.png';
 const metaBytes=await page.screenshot({path:path.join(out,metaFilename),animations:'disabled'});
 assert.ok(metaBytes.length>10000,'visual-only playlist screenshot too small');
 metadataQa.filename=metaFilename;
 metadataQa.sha256=crypto.createHash('sha256').update(metaBytes).digest('hex');
 // P5.1.57: visual and behavioral proof with 552 strictly metadata-only
 // local QA channels; no URL is ever requested or played.
 const watchFlowQa=await page.evaluate(()=>{
  const trigger=document.getElementById('poWatchFlowToggle');
  const panel=document.getElementById('poWatchFlowPanel');
  trigger.click();
  const first=[...panel.querySelectorAll('.po-watchflow-card')].map(el=>el.querySelector('.po-watchflow-card-body strong')?.textContent||'');
  const firstGroups=[...panel.querySelectorAll('.po-watchflow-card-body small')].map(el=>el.textContent?.trim()||'');
  const firstGroupCount=new Set(firstGroups).size;
  const playable=panel.querySelectorAll('.po-watchflow-play').length;
  const text=document.getElementById('poWatchFlowCount').textContent;
  const next=document.getElementById('poWatchFlowNext');
  next.click();
  const second=[...panel.querySelectorAll('.po-watchflow-card')].map(el=>el.querySelector('.po-watchflow-card-body strong')?.textContent||'');
  const secondGroups=[...panel.querySelectorAll('.po-watchflow-card-body small')].map(el=>el.textContent?.trim()||'');
  const secondGroupCount=new Set(secondGroups).size;
  const fresh=second.some(x=>!first.includes(x));
  const nonePlaying=window.IPTVState.getCurrent()===null;
  return {open:!panel.hidden,first,second,firstGroups,secondGroups,firstGroupCount,secondGroupCount,playable,text,fresh,nonePlaying};
 });
 assert.equal(watchFlowQa.open,true,'WatchFlow panel failed to open with real native source data');
 assert.equal(watchFlowQa.playable,3,'WatchFlow did not expose 3 native channel actions');
 assert.ok(watchFlowQa.text.includes('552'),'WatchFlow does not see the imported native playlist');
 assert.equal(watchFlowQa.fresh,true,'WatchFlow repeated the same suggestions despite available unseen channels');
 assert.equal(watchFlowQa.firstGroupCount,3,'WatchFlow first 3 picks should cover 3 equivalently ranked QA groups');
 assert.equal(watchFlowQa.secondGroupCount,3,'WatchFlow refresh should preserve 3-group variety');
 assert.equal(watchFlowQa.nonePlaying,true,'Metadata-only QA accidentally started IPTV playback');
 const watchFlowBytes=await page.screenshot({path:path.join(out,'positron-watchflow-552-metadata-qa-real.png'),animations:'disabled'});
 assert.ok(watchFlowBytes.length>10000,'WatchFlow populated real Electron screenshot invalid');
 await page.evaluate(()=>document.getElementById('poWatchFlowClose').click());
 // WatchFlow Plus Electron QA: use only synthetic metadata; do NOT click Play/Smart Zap.
 const plusQA=await page.evaluate(()=>{
  window.PositronWatchFlow.open();
  document.getElementById('poFlowPlusmix').click();
  const panel=document.getElementById('poWatchFlowPanel');
  return {
   mixCards:panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length,
   mixSelected:panel.querySelector('#poFlowPlusmix[aria-pressed="true"]')!==null,
   resumeButton:!!document.getElementById('poFlowPluscontinue'),
   similarButton:!!document.getElementById('poFlowPlussimilar'),
   zapButton:!!document.getElementById('poFlowPluszap'),
   notPlaying:window.IPTVState.getCurrent()===null,
   navOneRow:(()=>{const a=[...panel.querySelectorAll('.po-flowplus-nav button')];return a.length===5&&a.every(b=>Math.abs(b.getBoundingClientRect().top-a[0].getBoundingClientRect().top)<=1);})(),
   navNoOverflow:(()=>{const a=panel.querySelector('.po-flowplus-nav');return a.scrollWidth<=a.clientWidth+1;})(),
   navNoTruncatedLabels:[...panel.querySelectorAll('.po-flowplus-nav button span')].every(label=>label.scrollWidth<=label.clientWidth+1),
   ariaFull:[...panel.querySelectorAll('.po-flowplus-nav button')].every(b=>b.getAttribute('aria-label')?.length>=5),
   navButtonVisible:[...panel.querySelectorAll('.po-flowplus-nav button')].every(b=>b.getBoundingClientRect().width>=48),
   navOverflowPx:(()=>{const n=panel.querySelector('.po-flowplus-nav');return n.scrollWidth-n.clientWidth;})()
  };
 });
 assert.equal(plusQA.mixCards,5,'WatchFlow Plus must display five real-native metadata QA channels');
 await page.screenshot({path:path.join(out,'positron-watchflow-plus-mix-552-metadata-before-assert-real.png'),animations:'disabled'});
 for(const key of ['mixSelected','resumeButton','similarButton','zapButton','notPlaying','navOneRow','navNoOverflow','navNoTruncatedLabels','ariaFull','navButtonVisible'])
  assert.equal(plusQA[key],true,'WatchFlow Plus QA failed: '+key+' overflowPx='+plusQA.navOverflowPx);
 // Explicit assertions keep legacy regression guards discoverable while
 // ensuring each new accessibility requirement is actually evaluated.
 assert.equal(plusQA.navOneRow,true,'WatchFlow nav must remain in one row');
 assert.equal(plusQA.navNoOverflow,true,'WatchFlow navigation container overflows');
 assert.equal(plusQA.navNoTruncatedLabels,true,'WatchFlow visible mode text is clipped');
 assert.equal(plusQA.ariaFull,true,'WatchFlow requires full accessible labels');
 await page.screenshot({path:path.join(out,'positron-watchflow-plus-mix-552-metadata-qa-real.png'),animations:'disabled'});

// P5.1.92: real Electron WatchFlow Mix must follow the device's calendar
// day. No playlist change or network stream starts during this check.
 const mixLocalCalendarQa=await page.evaluate(()=>{
  const core=window.PositronWatchFlowPlusCore;
  const date=new Date(2026,10,21,0,15,0);
  const selected=document.querySelector('#poFlowPlusmix[aria-pressed="true"]');
  return {localDate:core.localDay(date),
    fiveCards:document.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length===5,
    selected:!!selected,
    noAutoPlay:window.IPTVState.getCurrent()===null,
    pureLocalDate:core.localDay(date)===[
      date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),
      String(date.getDate()).padStart(2,'0')].join('-')};
 });
 assert.equal(mixLocalCalendarQa.localDate,'2026-11-21');
 for(const key of ['fiveCards','selected','noAutoPlay','pureLocalDate'])
  assert.equal(mixLocalCalendarQa[key],true,'Local Mix calendar UI regression: '+key);
 await page.screenshot({path:path.join(out,'positron-p5192-local-calendar-mix-552-real.png'),animations:'disabled'});
 // P5.1.93: balance real 552-channel metadata suggestions among equal-evidence groups.
 const balancedMixQA=await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#poFlowPlusResults .po-flowplus-card')];
  const counts={};for(const card of cards){
   const group=(card.querySelector('small')?.textContent||'').split(' · ')[0];
   counts[group]=(counts[group]||0)+1;
  }
  return {total:cards.length,groups:Object.keys(counts).length,
   max:Math.max(...Object.values(counts)),min:Math.min(...Object.values(counts)),
   noAutoPlay:window.IPTVState.getCurrent()===null};
 });
 assert.equal(balancedMixQA.total,5);
 assert.equal(balancedMixQA.groups,3);
 assert.equal(balancedMixQA.max,2,'Daily Mix has too many cards from one equal-evidence group');
 assert.equal(balancedMixQA.min,1);
 assert.equal(balancedMixQA.noAutoPlay,true);
 await page.screenshot({path:path.join(out,'positron-p5193-group-balanced-mix-552-real.png'),animations:'disabled'});
 // P5.1.94: the desktop 390px dialog hides last Mix cards. The passive
 // cue is visible while hidden cards remain and disappears after scrolling.
 const scrollCueQA=await page.evaluate(async()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const cue=document.getElementById('poFlowPlusScrollHint');
  const settle=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  await settle();
  const desktopVisible=!!cue&&!cue.hidden&&cue.getBoundingClientRect().height>0;
  const toolbar=document.querySelector('#page-tv .player-control-card')?.getBoundingClientRect();
  const controlsClear=!!toolbar&&panel.getBoundingClientRect().bottom<=toolbar.top-12;
  panel.scrollTop=panel.scrollHeight;
  await settle();
  const bottomHidden=!!cue&&cue.hidden;
  panel.scrollTop=0;
  await settle();
  return {desktopVisible,bottomHidden,controlsClear,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['desktopVisible','bottomHidden','noAutoplay','controlsClear'])
  assert.equal(scrollCueQA[key],true,'WatchFlow scroll visibility regression: '+key);
 await page.screenshot({path:path.join(out,'positron-p5194-watchflow-scroll-cue-552-real.png'),animations:'disabled'});
 // P5.1.95: the P5.1.94 screenshot revealed that absolute scroll cue
 // covered the third recommendation's Xem button; inline cue must not.
 const fixedCueQA=await page.evaluate(async()=>{
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const panel=document.getElementById('poWatchFlowPanel');
  const cue=document.getElementById('poFlowPlusScrollHint');
  const head=panel.querySelector('#poFlowPlusResults .po-flowplus-head');
  const r=cue.getBoundingClientRect();
  const playActions=[...panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card button[aria-label^="Xem kênh "]')];
  const saveActions=[...panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card .po-flowplus-save')];
  const actions=[...playActions,...saveActions];
  const overlaps=a=>{const b=a.getBoundingClientRect();
   return r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;};
  return {cueInsideHeading:head.contains(cue),visible:!cue.hidden,
   cueClearOfActions:playActions.length===5&&saveActions.length===5&&actions.every(a=>!overlaps(a)),
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 assert.equal(fixedCueQA.visible,true,'All five cards still require scrolling at 1360px');
 assert.equal(fixedCueQA.cueInsideHeading,true,'Cue must be inline, not over the player');
 assert.equal(fixedCueQA.cueClearOfActions,true,'Cue visually occludes a clickable Xem button');
 assert.equal(fixedCueQA.noAutoplay,true);
 await page.screenshot({path:path.join(out,'positron-p5195-watchflow-inline-scroll-cue-552-real.png'),animations:'disabled'});
 // P5.1.96: actual Electron Watch Later, using 552 in-memory synthetic
 // metadata-only channels. Never contacts streams or auto-starts playback.
 const watchLaterQA=await page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const core=window.PositronWatchLaterCore;
  const first=panel.querySelector('#poFlowPlusResults .po-flowplus-card');
  const save=first?.querySelector('.po-flowplus-save');
  if(!core||!save)return {ready:false};
  const name=first.querySelector('.po-flowplus-card-info strong')?.textContent||'';
  const before=window.IPTVState.getCurrent();
  const preStore=window.localStorage.getItem(core.STORAGE_KEY);
  save.click();
  const persisted=JSON.parse(window.localStorage.getItem(core.STORAGE_KEY)||'[]');
  const localOnly=persisted.length===1&&Object.keys(persisted[0]).sort().join(',')==='key,savedAt,source'&&
   !JSON.stringify(persisted).includes('https:')&&!JSON.stringify(persisted).includes('example.invalid');
  const pressed=save.getAttribute('aria-pressed')==='true';
  panel.querySelector('#poFlowPluscontinue').click();
  const savedCard=panel.querySelector('#poFlowPlusResults .po-flowplus-card');
  const displayed=panel.querySelector('#poFlowPlusResults .po-flowplus-head strong')?.textContent.includes('Để xem sau')&&
   savedCard?.querySelector('.po-flowplus-card-info strong')?.textContent===name;
  const buttonAvailable=!!savedCard?.querySelector('.po-flowplus-save[aria-pressed="true"]');
  return {ready:true,localOnly,pressed,displayed,buttonAvailable,
   noAutoPlay:before===null&&window.IPTVState.getCurrent()===null,
   hadNoPreviousItem:!preStore||JSON.parse(preStore).length===0};
 });
 for(const key of ['ready','localOnly','pressed','displayed','buttonAvailable','noAutoPlay','hadNoPreviousItem'])
  assert.equal(watchLaterQA[key],true,'Watch Later native Electron QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p5196-watch-later-552-real.png'),animations:'disabled'});
 const watchLaterCleanup=await page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const saved=panel.querySelector('#poFlowPlusResults .po-flowplus-save[aria-pressed="true"]');
  if(!saved)return false;
  saved.click();
  const store=JSON.parse(localStorage.getItem(window.PositronWatchLaterCore.STORAGE_KEY)||'[]');
  panel.querySelector('#poFlowPlusmix').click();
  return store.length===0&&window.IPTVState.getCurrent()===null;
 });
 assert.equal(watchLaterCleanup,true,'Watch Later QA must clean up synthetic bookmark');

 // P5.1.97: prove channels 9-12 are not permanently hidden behind an 8-item cap.
 const manySavedQA=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore,panel=document.getElementById('poWatchFlowPanel');
  const original=localStorage.getItem(core.STORAGE_KEY);
  const channels=window.IPTVState.getChannels().filter(c=>core.identity(c)&&c.status!=='dead'&&c.url);
  let rows=[];
  for(const ch of channels){
   const updated=core.toggle(rows,ch);
   if(updated.ok&&updated.rows.length>rows.length)rows=updated.rows;
   if(rows.length===12)break;
  }
  if(rows.length!==12)return {seeded:false};
  localStorage.setItem(core.STORAGE_KEY,JSON.stringify(rows));
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:JSON.stringify(rows)}));
  document.getElementById('poFlowPluscontinue').click();
  const firstCount=panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length;
  const firstMore=panel.querySelector('#poWatchLaterMore');
  const initialLabel=panel.querySelector('#poFlowPlusResults .po-flowplus-head strong')?.textContent||'';
  firstMore?.click();
  const afterCount=panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length;
  const last=panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card')[11];
  const visibleLast=!!last?.querySelector('.po-flowplus-save[aria-pressed="true"]');
  const removedMore=!panel.querySelector('#poWatchLaterMore');
  const result={seeded:true,firstEight:firstCount===8,hasMore:!!firstMore,
   countTwelve:initialLabel.includes('12 kênh'),expanded:afterCount===12,
   lastReachable:visibleLast,noMore:removedMore,noAutoPlay:window.IPTVState.getCurrent()===null};
  if(original===null)localStorage.removeItem(core.STORAGE_KEY);
  else localStorage.setItem(core.STORAGE_KEY,original);
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:original}));
  panel.querySelector('#poFlowPlusmix')?.click();
  return result;
 });
 for(const key of ['seeded','firstEight','hasMore','countTwelve','expanded','lastReachable','noMore','noAutoPlay'])
  assert.equal(manySavedQA[key],true,'Watch Later 12-bookmark Electron QA failed: '+key);
 await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore,channels=window.IPTVState.getChannels();
  let rows=[];for(const ch of channels.slice(0,12))rows=core.toggle(rows,ch).rows;
  localStorage.setItem(core.STORAGE_KEY,JSON.stringify(rows));
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:JSON.stringify(rows)}));
  document.getElementById('poFlowPluscontinue').click();
  document.getElementById('poWatchLaterMore')?.click();
  const panel=document.getElementById('poWatchFlowPanel');panel.scrollTop=panel.scrollHeight;
 });
 await page.screenshot({path:path.join(out,'positron-p5197-watch-later-many-552-real.png'),animations:'disabled'});

 // P5.1.100: deep scroll 12 saved channels and prove close and mode
 // navigation are actually visible and hit-testable in real Electron.
 const stickyWatchLaterQA=await page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const header=panel.querySelector('.po-watchflow-head');
  const close=document.getElementById('poWatchFlowClose');
  const nav=panel.querySelector('.po-flowplus-nav');
  panel.scrollTop=panel.scrollHeight;
  const pr=panel.getBoundingClientRect(),hr=header.getBoundingClientRect();
  const cr=close.getBoundingClientRect(),nr=nav.getBoundingClientRect();
  const target=document.elementFromPoint(cr.left+cr.width/2,cr.top+cr.height/2);
  const player=document.querySelector('#page-tv .player-control-card')?.getBoundingClientRect();
  return {scrollable:panel.scrollHeight>panel.clientHeight+10,
   twelveCards:panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length===12,
   pinnedHeader:getComputedStyle(header).position==='sticky'&&hr.top>=pr.top-2&&hr.top<pr.top+6,
   pinnedNav:getComputedStyle(nav).position==='sticky'&&nr.top>=pr.top+35&&nr.top<pr.top+95,
   closeVisible:cr.width>30&&cr.top>=pr.top-1&&cr.bottom<=pr.bottom,
   closeHit:close===target||close.contains(target),
   navVisible:nr.bottom<=pr.bottom-10,
   playerClear:!!player&&pr.bottom<=player.top-12,
   noAutoPlay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['scrollable','twelveCards','pinnedHeader','pinnedNav','closeVisible','closeHit','navVisible','playerClear','noAutoPlay'])
  assert.equal(stickyWatchLaterQA[key],true,'Watch Later sticky header Electron QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51100-watch-later-sticky-552-real.png'),animations:'disabled'});
 const stickyWatchLaterClose=await page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel'),close=document.getElementById('poWatchFlowClose');
  close.click();
  const hidden=panel.hidden;
  window.PositronWatchFlow.open(); // restore the prior QA view for subsequent EPG scenarios
  return hidden&&!panel.hidden;
 });
 assert.equal(stickyWatchLaterClose,true,'Watch Later close/reopen must work after deep scroll');

 // P5.1.101: find the twelfth local bookmark without scrolling 80 entries.
 // Uses only native synthetic metadata; this cannot start video or fetch a URL.
 const savedSearchQA=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore,all=window.IPTVState.getChannels();
  const saved=core.visible(JSON.parse(localStorage.getItem(core.STORAGE_KEY)||'[]'),all,core.LIMIT);
  const input=document.getElementById('poWatchLaterSearch');
  const panel=document.getElementById('poWatchFlowPanel');
  if(saved.length!==12||!input)return {ready:false};
  const beforeStorage=localStorage.getItem(core.STORAGE_KEY);
  const target=saved[11];
  input.focus();input.value=target.name;
  input.dispatchEvent(new Event('input',{bubbles:true}));
  const cards=[...panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card')];
  const result={ready:true,visible:getComputedStyle(input).display!=='none'&&input.getBoundingClientRect().height>=35,
   titleMatched:cards.length===1&&cards[0]?.querySelector('.po-flowplus-card-info strong')?.textContent===target.name,
   countMatched:panel.querySelector('.po-flowplus-head strong')?.textContent.includes('1 kết quả'),
   focusHeld:document.activeElement===input,
   storeUnchanged:localStorage.getItem(core.STORAGE_KEY)===beforeStorage,
   noAutoplay:window.IPTVState.getCurrent()===null};
  return result;
 });
 for(const key of ['ready','visible','titleMatched','countMatched','focusHeld','storeUnchanged','noAutoplay'])
  assert.equal(savedSearchQA[key],true,'Watch Later local search native Electron QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51101-watch-later-search-552-real.png'),animations:'disabled'});
 // P5.1.102: real browser search must combine words from separate metadata fields.
 // This finds QA Channel 001 in the native "Main channels" group without URL access.
 const multiTermQA=await page.evaluate(()=>{
  const input=document.getElementById('poWatchLaterSearch');
  const panel=document.getElementById('poWatchFlowPanel');
  const core=window.PositronWatchLaterCore;
  const before=localStorage.getItem(core.STORAGE_KEY);
  input.focus();input.value='main 001';input.dispatchEvent(new Event('input',{bubbles:true}));
  const cards=[...panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card')];
  const matched=cards.map(c=>c.querySelector('.po-flowplus-card-info strong')?.textContent||'');
  return {
   inputActive:document.activeElement===input,
   oneSavedMatch:cards.length===1&&matched[0]==='QA Channel 001',
   countCorrect:panel.querySelector('.po-flowplus-head strong')?.textContent.includes('1 kết quả'),
   unchangedStorage:localStorage.getItem(core.STORAGE_KEY)===before,
   idlePlayer:window.IPTVState.getCurrent()===null
  };
 });
 for(const key of ['inputActive','oneSavedMatch','countCorrect','unchangedStorage','idlePlayer'])
  assert.equal(multiTermQA[key],true,'P5.1.102 native multi-term search failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51102-watch-later-multiterm-552-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  const input=document.getElementById('poWatchLaterSearch');
  input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 // P5.1.103: verify 80 private bookmarks cannot be silently displaced by #81.
 // Start with the actual native Mix panel and a real unbookmarked recommendation.
 const bookmarkCapBefore=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore,chs=window.IPTVState.getChannels();
  document.getElementById('poFlowPlusmix').click();
  const first=document.querySelector('#poFlowPlusResults .po-flowplus-card');
  const name=first?.querySelector('.po-flowplus-card-info strong')?.textContent;
  const target=chs.find(ch=>ch.name===name);
  if(!target||chs.length<81)return {ready:false};
  let rows=[];
  for(const ch of chs.filter(ch=>ch.id!==target.id).slice(0,80)){
   const change=core.toggle(rows,ch);
   if(!change.ok)return {ready:false,reason:change.reason};
   rows=change.rows;
  }
  localStorage.setItem(core.STORAGE_KEY,JSON.stringify(rows));
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:JSON.stringify(rows)}));
  const card=[...document.querySelectorAll('#poFlowPlusResults .po-flowplus-card')]
   .find(el=>el.querySelector('.po-flowplus-card-info strong')?.textContent===name);
  const save=card?.querySelector('.po-flowplus-save');
  return {ready:rows.length===80&&!!save,unbookmarked:save?.getAttribute('aria-pressed')==='false',
   targetName:name,storage:localStorage.getItem(core.STORAGE_KEY),
   idlePlayer:window.IPTVState.getCurrent()===null};
 });
 assert.equal(bookmarkCapBefore.ready,true,'80-channel native cap fixture not ready');
 assert.equal(bookmarkCapBefore.unbookmarked,true,'81st target must not already be bookmarked');
 await page.screenshot({path:path.join(out,'positron-p51103-watchlater-cap-before-real.png'),animations:'disabled'});
 const bookmarkCapAfter=await page.evaluate(targetName=>{
  const core=window.PositronWatchLaterCore;
  const before=localStorage.getItem(core.STORAGE_KEY);
  const card=[...document.querySelectorAll('#poFlowPlusResults .po-flowplus-card')]
   .find(el=>el.querySelector('.po-flowplus-card-info strong')?.textContent===targetName);
  const save=card?.querySelector('.po-flowplus-save');
  save?.click();
  const after=localStorage.getItem(core.STORAGE_KEY);
  return {still80:core.compact(JSON.parse(after||'[]')).length===80,
   storageUnchanged:after===before,notMarked:save?.getAttribute('aria-pressed')==='false',
   playerIdle:window.IPTVState.getCurrent()===null};
 },bookmarkCapBefore.targetName);
 for(const key of ['still80','storageUnchanged','notMarked','playerIdle'])
  assert.equal(bookmarkCapAfter[key],true,'P5.1.103 local bookmark capacity protection failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51103-watchlater-cap-after-real.png'),animations:'disabled'});

// P5.1.104: retain bookmarks while their source is temporarily unmounted.
// This uses one native metadata-only channel and one synthetic fingerprint,
// never a real M3U URL, credentials or background playback.
 const unavailableSavedQA=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore,chs=window.IPTVState.getChannels();
  const available=chs.find(ch=>core.identity(ch)&&ch.status!=='dead'&&ch.id&&ch.url);
  if(!available)return {ready:false};
  const old=core.toggle([],available);
  const dormant={...available,id:'unloaded-local-qa',sourceId:'unmounted-temporary-qa-source',name:'Offline QA bookmark'};
  const result=core.toggle(old.rows,dormant);
  const rows=result.rows,stored=JSON.stringify(rows);
  localStorage.setItem(core.STORAGE_KEY,stored);
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:stored}));
  document.getElementById('poFlowPluscontinue').click();
  const notice=document.getElementById('poWatchLaterUnavailable');
  const cards=[...document.querySelectorAll('#poFlowPlusResults .po-flowplus-card')];
  const name=cards[0]?.querySelector('.po-flowplus-card-info strong')?.textContent;
  const rect=notice?.getBoundingClientRect();
  return {
   ready:old.ok&&result.ok&&rows.length===2,
   oneUnavailable:core.unavailable(rows,chs)===1,
   visibleNotice:!!rect&&rect.width>100&&rect.height>15&&getComputedStyle(notice).display!=='none',
   accurateMessage:notice?.textContent.includes('1 kênh Xem sau chưa khả dụng')&&notice?.textContent.includes('không tự xóa'),
   oneAvailableCard:cards.length===1&&name===available.name,
   sourcePrivacy:!notice?.textContent.includes(dormant.sourceId)&&!notice?.textContent.includes(dormant.name),
   storageUnchanged:localStorage.getItem(core.STORAGE_KEY)===stored,
   playerIdle:window.IPTVState.getCurrent()===null
  };
 });
 for(const key of ['ready','oneUnavailable','visibleNotice','accurateMessage','oneAvailableCard','sourcePrivacy','storageUnchanged','playerIdle'])
  assert.equal(unavailableSavedQA[key],true,'P5.1.104 dormant saved-channel native QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51104-watchlater-unavailable-552-real.png'),animations:'disabled'});

// P5.1.105: user opens dormant manager and explicitly confirms removal.
// The first click must never delete; the second click removes only the
// unresolved fingerprint, leaving the accessible channel untouched.
 const dormantManageBefore=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore;
  const details=document.getElementById('poWatchLaterDormantManager');
  const summary=details?.querySelector('summary');
  if(!summary)return {ready:false};
  summary.click();
  const remove=details.querySelector('.po-watchlater-dormant-row button');
  const before=localStorage.getItem(core.STORAGE_KEY);
  remove?.scrollIntoView({block:'nearest'});
  remove?.click();
  const r=remove?.getBoundingClientRect(),p=document.getElementById('poWatchFlowPanel').getBoundingClientRect();
  return {ready:details.open&&!!remove,confirmation:remove?.textContent==='Xác nhận bỏ',
   storageUnchanged:localStorage.getItem(core.STORAGE_KEY)===before,
   stillTwo:core.compact(JSON.parse(before||'[]')).length===2,
   buttonReachable:!!r&&r.width>=80&&r.height>=30&&r.bottom<=p.bottom+2,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['ready','confirmation','storageUnchanged','stillTwo','buttonReachable','noAutoplay'])
  assert.equal(dormantManageBefore[key],true,'P5.1.105 dormant manager first-confirm native QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51105-dormant-manage-before-real.png'),animations:'disabled'});
 const dormantManageAfter=await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore;
  const btn=document.querySelector('#poWatchLaterDormantManager .po-watchlater-dormant-row button');
  btn?.click();
  const store=localStorage.getItem(core.STORAGE_KEY),rows=core.compact(JSON.parse(store||'[]'));
  const cards=document.querySelectorAll('#poFlowPlusResults .po-flowplus-card');
  return {oneSavedRemains:rows.length===1&&cards.length===1,
   noStaleNote:!document.getElementById('poWatchLaterUnavailable'),
   remainingIsValid:core.unavailable(rows,window.IPTVState.getChannels())===0,
   playerIdle:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['oneSavedRemains','noStaleNote','remainingIsValid','playerIdle'])
  assert.equal(dormantManageAfter[key],true,'P5.1.105 confirmed removal native QA failed: '+key);
 await page.screenshot({path:path.join(out,'positron-p51105-dormant-manage-after-real.png'),animations:'disabled'});





 await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore;localStorage.setItem(core.STORAGE_KEY,'[]');
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:'[]'}));
  document.getElementById('poFlowPlusmix').click();
 });


 // P5.1.98: real Electron UI, synthetic local XMLTV only. Present the
 // actual guide title in WatchFlow without stream requests or EPG downloads.
 await page.evaluate(()=>{
  const channels=window.IPTVState.getChannels();
  const first=window.PositronWatchFlowPlusCore.dailyMix(channels,{date:window.PositronWatchFlowPlusCore.localDay(),limit:5})[0];
  if(!first)throw Error('No QA recommendation to match EPG');
  const timestamp=Date.now(),epgId='positron-qa-epg';
  const guide={names:{[window.IPTVGuide.tidy(first.name)]:epgId},aliasesById:{[epgId]:[first.name]},
   programmes:[
    {id:epgId,start:timestamp-60000,end:timestamp+1800000,title:'Bản tin EPG đã xác minh trong QA'},
    {id:epgId,start:timestamp+1800000,end:timestamp+3600000,title:'Phim tiếp theo từ XMLTV QA'}
   ],
   manualMappings:{},offsetMinutes:0};
  window.__positronQaOriginalGetGuide=window.IPTVExtras.getGuide;
  window.IPTVExtras.getGuide=()=>guide;
  window.PositronWatchFlowPlus.select('mix');
 });
 const liveEPGQA=await page.evaluate(()=>{
  const root=document.getElementById('poFlowPlusResults');
  const programmes=[...root.querySelectorAll('.po-flowplus-onair')];
  return {oneRealMetadataRow:programmes.length===1,
   correctTitle:programmes[0]?.textContent==='Đang chiếu: Bản tin EPG đã xác minh trong QA',
   fiveCards:root.querySelectorAll('.po-flowplus-card').length===5,
   scrollAtTop:document.getElementById('poWatchFlowPanel').scrollTop===0,
   noAutoPlay:window.IPTVState.getCurrent()===null,
   safeText:!root.querySelector('.po-flowplus-onair script')};
 });
 for(const key of ['oneRealMetadataRow','correctTitle','fiveCards','scrollAtTop','noAutoPlay','safeText'])
  assert.equal(liveEPGQA[key],true,'On-air XMLTV WatchFlow QA: '+key);
 await page.screenshot({path:path.join(out,'positron-p5198-live-epg-watchflow-552-real.png'),animations:'disabled'});
 const nextEPGQA=await page.evaluate(()=>{
  const root=document.getElementById('poFlowPlusResults');
  const next=[...root.querySelectorAll('.po-flowplus-next-epg')];
  const sample=next[0]?.textContent||'';
  return {singleVerifiedNext:next.length===1,
   correctTitle:sample.includes('Phim tiếp theo từ XMLTV QA')&&sample.startsWith('Tiếp theo '),
   noAutoPlay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['singleVerifiedNext','correctTitle','noAutoPlay'])
  assert.equal(nextEPGQA[key],true,'XMLTV Next QA: '+key);
 await page.screenshot({path:path.join(out,'positron-p5199-next-epg-watchflow-552-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positronQaOriginalGetGuide;
  delete window.__positronQaOriginalGetGuide;
  window.PositronWatchFlowPlus.select('mix');
 });
 
 // P5.1.85: exercise the real Electron Similar panel with a temporary
 // native metadata-only current channel; no stream is opened or stored.
 const similarQA=await page.evaluate(()=>{
  const native=window.IPTVState,basis=native.getChannels().find(c=>c.group)||native.getChannels()[0];
  if(!basis)return {selected:false,count:0,notPlaying:false};
  try{
   window.IPTVState=Object.freeze({...native,getCurrent:()=>basis});
   document.getElementById('poFlowPlussimilar').click();
   const panel=document.getElementById('poWatchFlowPanel');
   return {selected:!!panel.querySelector('#poFlowPlussimilar[aria-pressed="true"]'),
    count:panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card').length,
    notPlaying:native.getCurrent()===null,
    modalNotOverPlayer:(()=>{
      const dialog=panel.getBoundingClientRect();
      const toolbar=document.querySelector('#page-tv .player-control-card')?.getBoundingClientRect();
      return !!toolbar&&dialog.bottom<=toolbar.top-12;
    })(),
    recommendationsScrollable:panel.scrollHeight>panel.clientHeight+10&&getComputedStyle(panel).overflowY==='auto',
    recommendationActions:panel.querySelectorAll('#poFlowPlusResults .po-flowplus-card button[aria-label^="Xem kênh "]').length};
  }finally{window.IPTVState=native;}
 });
 assert.equal(similarQA.selected,true,'Similar mode must react to selection');
 assert.equal(similarQA.count,5,'Similar mode must show five native metadata matches');
 assert.equal(similarQA.notPlaying,true,'Similar QA cannot trigger playback');
 assert.equal(similarQA.modalNotOverPlayer,true,'WatchFlow Similar dialog obscures native player controls at 1360x820');
 assert.equal(similarQA.recommendationsScrollable,true,'WatchFlow recommendations must remain scrollable when resized to avoid player');
 assert.equal(similarQA.recommendationActions,5,'Scrollable WatchFlow must retain all five clickable recommendations');
 await page.screenshot({path:path.join(out,'positron-watchflow-plus-similar-552-metadata-qa-real.png'),animations:'disabled'});
 await page.evaluate(()=>document.getElementById('poFlowPlusmix').click());
 await page.setViewportSize({width:450,height:820});
 const narrowFlow=await page.evaluate(()=>{const nav=document.querySelector('#poWatchFlowPanel .po-flowplus-nav');return {scrollable:nav.scrollWidth<=nav.clientWidth+1||getComputedStyle(nav).overflowX==='auto',oneRow:[...nav.querySelectorAll('button')].every(b=>Math.abs(b.getBoundingClientRect().top-nav.querySelector('button').getBoundingClientRect().top)<=1)};});
 assert.equal(narrowFlow.scrollable,true,'WatchFlow modes are inaccessible at mobile 450px');
 assert.equal(narrowFlow.oneRow,true,'WatchFlow modes wrap despite compact responsive labels');
 await page.screenshot({path:path.join(out,'positron-watchflow-plus-mix-450-metadata-qa-real.png'),animations:'disabled'});
 await page.setViewportSize({width:1360,height:820});
 await page.evaluate(()=>window.PositronWatchFlow.close());
 // P5.1.82: image-based regression on native channel chooser at 450px.
 await page.setViewportSize({width:450,height:820});
 const chooserQa=await page.evaluate(()=>{
  const root=document.getElementById('webChannelChooser');
  const tabs=[...root.querySelectorAll('.web-chooser-tabs [data-chooser-tab]')];
  const base=tabs[0]?.getBoundingClientRect();
  const modeBtns=[...root.querySelectorAll('.web-chooser-layout button')];
  return {tabCount:tabs.length,oneRow:tabs.every(b=>Math.abs(b.getBoundingClientRect().top-base.top)<=1),
   visible:tabs.every(b=>b.getBoundingClientRect().width>=49),
   noOverflow:root.querySelector('.web-chooser-heading').scrollWidth<=root.querySelector('.web-chooser-heading').clientWidth+1,
   viewSwitches:modeBtns.length===2&&modeBtns.every(b=>b.getBoundingClientRect().width>=25),
   playerRow:(()=>{const bottom=document.querySelector('#page-tv .player-control-card .control-layout-bottom');
    const fit=document.querySelector('#page-tv .control-layout-bottom .view-mode')?.getBoundingClientRect();
    const link=document.querySelector('#page-tv .control-layout-bottom .manual-link-picker')?.getBoundingClientRect();
    const fav=document.querySelector('#page-tv .control-layout-bottom #favCurrentBtn')?.getBoundingClientRect();
    const rect=bottom.getBoundingClientRect();
    return {aligned:Math.abs(fit.top-link.top)<=2&&Math.abs(fav.top-link.top)<=6,
      fitWidth:fit.width,linkWidth:link.width,starWidth:fav.width,height:rect.height,
      noOverflow:bottom.scrollWidth<=bottom.clientWidth+1};})()};
 });
 await page.screenshot({path:path.join(out,'positron-p5-chooser-450-metadata-qa-real.png'),animations:'disabled'});
 for(const key of ['oneRow','visible','noOverflow','viewSwitches'])assert.equal(chooserQa[key],true,'450px native channel chooser is broken: '+key+' '+JSON.stringify(chooserQa));
 assert.equal(chooserQa.tabCount,3,'Native TV channel filters vanished');
 assert.equal(chooserQa.playerRow.aligned,true,'Mobile fit and backup selectors are split over wasteful rows');
 assert.equal(chooserQa.playerRow.noOverflow,true,'Compact player controls overflow horizontally');
 assert.ok(chooserQa.playerRow.fitWidth>=80&&chooserQa.playerRow.linkWidth>=80,'Mobile controls no longer usable');
 assert.ok(chooserQa.playerRow.height<=145,'450px player controls remain taller than necessary: '+JSON.stringify(chooserQa.playerRow));
 // P5.1.107: assert native vector chooser buttons instead of platform font glyphs.
 const vectorChooserQA=await page.evaluate(()=>{
  const root=document.getElementById('webChannelChooser');
  const tabs=[...root.querySelectorAll('[data-chooser-tab]')];
  const layouts=[...root.querySelectorAll('[data-chooser-layout]')];
  const controls=[...tabs,...layouts];
  const heading=root.querySelector('.web-chooser-heading');
  return {
   fiveIcons:controls.length===5&&controls.every(b=>!!b.querySelector('svg[aria-hidden="true"]')),
   allVisible:controls.every(b=>{const icon=b.querySelector('svg');const r=icon?.getBoundingClientRect();return r&&r.width>=11&&r.height>=11;}),
   // Read the tab's own text nodes. A live Favorites count is a separate,
   // aria-hidden badge and must not silently change the stable tab label.
   correctLabels:tabs.map(b=>[...b.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim()).join('|')==='Chọn kênh|Yêu thích|Xem gần đây',
   favoriteCountAccessible:(()=>{
    const fav=tabs.find(b=>b.dataset.chooserTab==='fav');
    const badge=fav?.querySelector('.po-favorite-count');
    const count=Number(badge?.textContent);
    return !!badge&&badge.getAttribute('aria-hidden')==='true'&&
     Number.isInteger(count)&&count>=0&&badge.hidden===(count===0)&&
     fav.getAttribute('aria-label')==='Yêu thích, '+count+' kênh';
   })(),
   namedLayouts:layouts.map(b=>b.getAttribute('aria-label')).join('|')==='Dạng lưới|Dạng danh sách',
   oneLine:tabs.every(b=>Math.abs(b.getBoundingClientRect().top-tabs[0].getBoundingClientRect().top)<=1),
   noOverflow:heading.scrollWidth<=heading.clientWidth+1
  };
 });
 for(const key of ['fiveIcons','allVisible','correctLabels','favoriteCountAccessible','namedLayouts','oneLine','noOverflow'])
  assert.equal(vectorChooserQA[key],true,'P5.1.107 SVG chooser QA '+key+': '+JSON.stringify(vectorChooserQA));
 await page.screenshot({path:path.join(out,'positron-p51107-chooser-native-svg-450-real.png'),animations:'disabled'});
 // P5.1.108: regression for the P5.1.107 real 450px quota-toast image.
 // Exercise the actual native #toastArea style inside Electron without touching
 // playback, URLs, local playlists, saved channels or remote services.
 await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const toast=document.createElement('div');
  toast.className='toast err';toast.id='poPositronToastLayoutQA';
  toast.textContent='Xem sau đã lưu đủ 80 kênh. Bỏ lưu một kênh trước khi thêm mới.';
  tray.append(toast);
 });
 const toastLayoutQA=await page.evaluate(()=>{
  const sidebar=document.getElementById('appSidebar').getBoundingClientRect();
  const toast=document.getElementById('poPositronToastLayoutQA');
  const t=toast.getBoundingClientRect();
  const css=getComputedStyle(document.getElementById('toastArea'));
  return {sidebarRight:sidebar.right,toastLeft:t.left,toastRight:t.right,
   width:innerWidth,laneClear:t.left>=sidebar.right+8,
   rightSafe:t.right<=innerWidth-8,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   passthrough:css.pointerEvents==='none',
   readable:t.height>=42&&t.height<=110};
 });
 for(const key of ['laneClear','rightSafe','noHorizontalOverflow','passthrough','readable'])
  assert.equal(toastLayoutQA[key],true,'P5.1.108 narrow native toast regression '+key+': '+JSON.stringify(toastLayoutQA));
 await page.screenshot({path:path.join(out,'positron-p51108-toast-clear-of-sidebar-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>document.getElementById('poPositronToastLayoutQA')?.remove());
 // P5.1.109: the reviewed P5.1.108 real screenshot shows duplicated
 // quota banners. Verify the REAL native IPTVState.toast twice at 450px.
 await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  tray.replaceChildren(); // isolate the screenshot from previous QA fixtures
  window.IPTVState.toast('Xem sau đã lưu đủ 80 kênh. Bỏ lưu một kênh trước khi thêm mới.','error');
  window.IPTVState.toast('Xem sau đã lưu đủ 80 kênh. Bỏ lưu một kênh trước khi thêm mới.','error');
 });
 const nativeToastQA=await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const toasts=[...tray.querySelectorAll('.toast')];
  const r=toasts[0]?.getBoundingClientRect();
  return {singleActive:toasts.length===1,readable:toasts[0]?.textContent.includes('80 kênh')===true,
   nativeError:toasts[0]?.classList.contains('err')===true,
   clearOfSidebar:!!r&&r.left>=document.getElementById('appSidebar').getBoundingClientRect().right+8,
   withinViewport:!!r&&r.right<=innerWidth-8,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 for(const key of ['singleActive','readable','nativeError','clearOfSidebar','withinViewport','noOverflow'])
  assert.equal(nativeToastQA[key],true,'P5.1.109 native toast check '+key+': '+JSON.stringify(nativeToastQA));
 await page.screenshot({path:path.join(out,'positron-p51109-native-toast-dedupe-450-real.png'),animations:'disabled'});
 const toastSeverityQA=await page.evaluate(()=>{
  window.IPTVState.toast('Xem sau đã lưu đủ 80 kênh. Bỏ lưu một kênh trước khi thêm mới.','warn');
  const rows=[...document.querySelectorAll('#toastArea .toast')];
  const result={distinctSeverity:rows.length===2&&rows.some(n=>n.classList.contains('warn'))};
  document.getElementById('toastArea').replaceChildren();return result;
 });
 assert.equal(toastSeverityQA.distinctSeverity,true,'P5.1.109 must preserve distinct warning severity');
 // P5.1.110: A 450px native screenshot of P5.1.109 puts the channel
 // library below the fold while no video is playing. Compact only the
 // onboarding illustration and verify native live video aspect remains 16:9.
 const compactIdleQA=await page.evaluate(async()=>{
  const stage=document.getElementById('playerBox');
  const empty=document.getElementById('emptyPlayer');
  const title=empty.querySelector('h2').getBoundingClientRect();
  const info=empty.querySelector('p').getBoundingClientRect();
  const action=(document.getElementById('poFirstChannelAction')&&!document.getElementById('poFirstChannelAction').hidden)
   ?document.getElementById('poFirstChannelAction'):document.getElementById('emptyFileBtn');
  const cta=action.getBoundingClientRect();
  const before=stage.getBoundingClientRect();
  const heading=document.querySelector('#webChannelChooser .web-chooser-heading')?.getBoundingClientRect();
  empty.classList.add('hidden');
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const live=stage.getBoundingClientRect();
  empty.classList.remove('hidden');
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const restored=stage.getBoundingClientRect();
  return {
   playerHeight:Math.round(before.height),liveWidth:Math.round(live.width),liveHeight:Math.round(live.height),
   compact:before.height>=145&&before.height<=175,
   contentFits:title.top>=before.top-1&&info.bottom<cta.top&&cta.bottom<=before.bottom+1&&cta.height>=34,
   videoUnmodified:Math.abs(live.width/live.height-16/9)<.08,
   restored:Math.abs(restored.height-before.height)<2,
   channelFilterReachable:!!heading&&heading.top<innerHeight-120,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 });
 for(const key of ['compact','contentFits','videoUnmodified','restored','channelFilterReachable','noHorizontalOverflow'])
  assert.equal(compactIdleQA[key],true,'P5.1.110 compact native idle-player regression '+key+': '+JSON.stringify(compactIdleQA));
 await page.screenshot({path:path.join(out,'positron-p51110-compact-idle-player-450-real.png'),animations:'disabled'});

 // P5.1.116: the category rail tests must use ACTUAL corresponding groups.
 // Earlier 552 metadata QA channels all had generic group titles and the old
 // chooser displayed non-functional VTV/VTC/K+ chips. Import nine local-only
 // category metadata records (no playback); leave K+ absent as negative test.
 const categoryFixtureQA=await page.evaluate(()=>{
  const cats=[
   ['VTV','VTV QA 1'],['VTC','VTC QA 1'],['HTV','HTV QA 1'],
   ['TH địa phương','TH QA 1'],['Quốc tế','Quốc tế QA 1'],
   ['Phim','Phim QA 1'],['Thiếu nhi','Thiếu nhi QA 1'],
   ['Thể thao','Thể thao QA 1'],['Tin tức','Tin tức QA 1']];
  const lines=['#EXTM3U'];
  cats.forEach(([group,name],i)=>{
   lines.push('#EXTINF:-1 tvg-id="qa-category-'+i+'" group-title="'+group+'",'+name);
   lines.push('https://example.invalid/positron-category-visual-only-'+i+'.m3u8');
  });
  window.IPTVState.importSource('LOCAL QA CATEGORY META ONLY','local:qa-category',lines.join('\n'),'file');
  return {channelCount:window.IPTVState.getChannels().length,added:cats.length};
 });
 assert.equal(categoryFixtureQA.added,9);
 assert.equal(categoryFixtureQA.channelCount,561);
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGroups .web-chooser-chip').length>=10,{timeout:6000});

 // P5.1.111: the actual P5.1.110 450px screenshot had 3 stacked
 // category rows. Verify all native chips fit one accessible horizontal lane
 // and the native rerender keeps scroll position after selecting a last chip.
 const channelChipRailQA=await page.evaluate(()=>{
  const lane=document.getElementById('webChooserGroups');
  const tabs=[...lane.querySelectorAll('button.web-chooser-chip')];
  const first=tabs[0]?.getBoundingClientRect();
  const oneRow=tabs.length>=9&&tabs.every(b=>Math.abs(b.getBoundingClientRect().top-first.top)<=2);
  const horizontallyScrollable=lane.scrollWidth>lane.clientWidth+25&&getComputedStyle(lane).overflowX==='auto';
  lane.scrollLeft=lane.scrollWidth;
  const before=lane.scrollLeft;
  tabs[tabs.length-1].click();
  const after=lane.scrollLeft;
  const retainsScroll=before>50&&after>=before-3;
  lane.scrollLeft=0;
  lane.querySelector('button').click(); // restore native all-channels filter
  const search=document.getElementById('webChooserSearch').getBoundingClientRect();
  const grid=document.getElementById('webChooserGrid').getBoundingClientRect();
  return {oneRow,horizontallyScrollable,retainsScroll,
   nativeCategories:tabs.length>=9,
   searchAboveFold:search.bottom<innerHeight-25,
   channelGridEarlier:grid.top<innerHeight-45,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['oneRow','horizontallyScrollable','retainsScroll','nativeCategories','searchAboveFold','channelGridEarlier','noOverflow','noAutoplay'])
  assert.equal(channelChipRailQA[key],true,'P5.1.111 chip rail '+key+': '+JSON.stringify(channelChipRailQA));
 await page.screenshot({path:path.join(out,'positron-p51111-single-row-chips-450-real.png'),animations:'disabled'});
 // P5.1.111 corrective evidence: opening 'Bộ lọc' MUST retain native
 // group/sort selects. Collapsed, the first grid must be closer to viewport.
 const advancedFilterQA=await page.evaluate(()=>{
  const details=document.getElementById('webChooserAdvanced');
  const summary=details?.querySelector('summary');
  const group=document.getElementById('webChooserGroup');
  const sort=document.getElementById('webChooserSort');
  const closed=!!details&&!details.open&&summary.getBoundingClientRect().height>=30;
  summary.click();
  const expands=details.open&&group.getBoundingClientRect().height>25&&sort.getBoundingClientRect().height>25;
  summary.click();
  const collapses=!details.open;
  const search=document.getElementById('webChooserSearch').getBoundingClientRect();
  const grid=document.getElementById('webChooserGrid').getBoundingClientRect();
  return {closed,expands,collapses,nativeControlsPreserved:group.closest('details')===details&&sort.closest('details')===details,
   searchVisible:search.bottom<innerHeight-25,gridEarlier:grid.top<innerHeight-45,
   documentNoOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 for(const key of ['closed','expands','collapses','nativeControlsPreserved','searchVisible','gridEarlier','documentNoOverflow'])
  assert.equal(advancedFilterQA[key],true,'P5.1.111 native advanced filtering '+key+': '+JSON.stringify(advancedFilterQA));
 await page.screenshot({path:path.join(out,'positron-p51111-compact-filters-450-real.png'),animations:'disabled'});
 // P5.1.112: genuine previous 450px Electron screenshot showed three tiny
 // channel cards with ellipsized text. Verify 2-column tiles and 2-line names.
 const readableCardsQA=await page.evaluate(()=>{
  const grid=document.getElementById('webChooserGrid');
  const cards=[...grid.querySelectorAll('button.web-chooser-card')];
  const r=cards.slice(0,3).map(c=>c.getBoundingClientRect());
  const names=cards.slice(0,3).map(c=>c.querySelector('.web-chooser-name'));
  const style=names[0]?getComputedStyle(names[0]):null;
  return {twoAcross:r.length===3&&Math.abs(r[0].top-r[1].top)<=2&&r[2].top>=r[0].bottom+4,
   readableWidths:r.length>=2&&r[0].width>=145&&r[1].width>=145,
   twoLineNames:style?.whiteSpace==='normal'&&style?.webkitLineClamp==='2',
   sourceCards:cards.length>=6,
   buttonsIntact:cards.slice(0,3).every(c=>c.tagName==='BUTTON'&&!c.disabled&&c.tabIndex>=0),
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 for(const key of ['twoAcross','readableWidths','twoLineNames','sourceCards','buttonsIntact','noOverflow','noAutoplay'])
  assert.equal(readableCardsQA[key],true,'P5.1.112 450px channel-card regression '+key+': '+JSON.stringify(readableCardsQA));
 await page.evaluate(()=>document.getElementById('webChooserGrid').scrollIntoView({block:'center',behavior:'instant'}));
 await page.screenshot({path:path.join(out,'positron-p51112-readable-channel-cards-450-real.png'),animations:'disabled'});

 // P5.1.113: the real P112 450px view has a 3-button tablist.
 // Verify Arrow/Home/End focus, selection and no playback.
 await page.evaluate(()=>document.querySelector('#webChannelChooser .web-chooser-tabs')
  .scrollIntoView({block:'center',behavior:'instant'}));
 await page.focus('#webChannelChooser [data-chooser-tab="all"]');
 await page.keyboard.press('ArrowRight');
 const arrowRight=await page.evaluate(()=>{
  const fav=document.querySelector('#webChannelChooser [data-chooser-tab="fav"]');
  const tabs=[...document.querySelectorAll('#webChannelChooser [role="tab"]')];
  return document.activeElement===fav&&fav.getAttribute('aria-selected')==='true'&&
    tabs.filter(x=>x.tabIndex===0).length===1&&
    tabs.every(x=>x.getAttribute('aria-controls')==='webChooserGrid');
 });
 await page.screenshot({path:path.join(out,'positron-p51113-keyboard-favorites-tab-450-real.png'),animations:'disabled'});
 await page.keyboard.press('End');
 const end=await page.evaluate(()=>document.activeElement?.dataset.chooserTab==='recent'&&
  document.activeElement.getAttribute('aria-selected')==='true');
 await page.keyboard.press('Home');
 const home=await page.evaluate(()=>document.activeElement?.dataset.chooserTab==='all'&&
  document.activeElement.getAttribute('aria-selected')==='true');
 await page.keyboard.press('ArrowLeft');
 const wrap=await page.evaluate(()=>document.activeElement?.dataset.chooserTab==='recent'&&
  document.activeElement.getAttribute('aria-selected')==='true');
 await page.keyboard.press('Home');
 const keyboardTabQA={arrowRight,end,home,wrap,
  reset:await page.evaluate(()=>document.activeElement?.dataset.chooserTab==='all'),
  noAutoplay:await page.evaluate(()=>window.IPTVState.getCurrent()===null),
  noOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)};
 for(const [key,value] of Object.entries(keyboardTabQA))
  assert.equal(value,true,'P5.1.113 native chooser keyboard tab '+key+': '+JSON.stringify(keyboardTabQA));

 // P5.1.114: screenshot of P5.1.113 Favorites tab showed 552 imported
 // channels with wrong generic no-results text and unusable 1 / 1 pager.
 // Verify useful zero-state and a return action that does not autoplay.
 await page.focus('#webChannelChooser [data-chooser-tab="all"]');
 await page.keyboard.press('ArrowRight');
 const emptyFavoriteQA=await page.evaluate(()=>{
  const root=document.getElementById('webChannelChooser');
  const grid=document.getElementById('webChooserGrid');
  const message=grid.querySelector('.web-chooser-empty')?.textContent||'';
  const action=grid.querySelector('button.po-chooser-empty-action');
  const pager=root.querySelector('.web-chooser-pager');
  return {channelsLoaded:window.IPTVState.getChannels().length>=500,
   favoriteTabSelected:root.querySelector('[data-chooser-tab="fav"]')?.getAttribute('aria-selected')==='true',
   descriptiveMessage:message.includes('Chưa có kênh yêu thích')&&message.includes('sao'),
   returnButton:!!action&&action.textContent.includes('Xem tất cả kênh')&&action.getBoundingClientRect().height>=32,
   emptyPagerHidden:pager?.hidden===true&&getComputedStyle(pager).display==='none',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51114-favorite-empty-action-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .po-chooser-empty-action');
 const returnedAll=await page.evaluate(()=>{
  const all=document.querySelector('[data-chooser-tab="all"]');
  const cards=document.querySelectorAll('#webChooserGrid button.web-chooser-card');
  const pager=document.querySelector('#webChannelChooser .web-chooser-pager');
  return all.getAttribute('aria-selected')==='true'&&document.activeElement===all&&
   cards.length>=6&&pager.hidden===false&&
   document.getElementById('webChooserSearch').value===''&&
   window.IPTVState.getCurrent()===null;
 });
 const favoriteEmptyQA={...emptyFavoriteQA,returnedAll};
 for(const [key,value] of Object.entries(favoriteEmptyQA))
  assert.equal(value,true,'P5.1.114 actionable Favorites empty state '+key+': '+JSON.stringify(favoriteEmptyQA));

 // P5.1.115: P114 screenshot showed duplicate empty Favorites side pane.
 // Verify compact-only suppression of the duplicate, restore on All, then
 // ensure the Recent empty pane is also nonduplicative and accessible.
 await page.focus('#webChannelChooser [data-chooser-tab="all"]');
 await page.keyboard.press('ArrowRight');
 const duplicateFavoriteQA=await page.evaluate(()=>{
  const side=document.querySelector('#webChannelChooser .web-chooser-side');
  const fav=side.querySelector('section[aria-label="Kênh yêu thích"]');
  const recent=side.querySelector('section[aria-label="Kênh vừa xem"]');
  const active=side.closest('#webChannelChooser').querySelector('[data-chooser-tab="fav"]');
  return {favoriteSelected:active.getAttribute('aria-selected')==='true',
   duplicateMarked:fav.dataset.poDuplicateEmpty==='true',
   duplicateHidden:getComputedStyle(fav).display==='none',
   recentStillAvailable:getComputedStyle(recent).display!=='none',
   emptyMessageInMain:!!document.querySelector('#webChooserGrid .web-chooser-empty'),
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51115-no-duplicate-favorite-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .po-chooser-empty-action');
 const favoriteRestored=await page.evaluate(()=>{
  const fav=document.querySelector('.web-chooser-side section[aria-label="Kênh yêu thích"]');
  return fav.dataset.poDuplicateEmpty==='false'&&getComputedStyle(fav).display!=='none';
 });
 await page.focus('#webChannelChooser [data-chooser-tab="all"]');
 await page.keyboard.press('End');
 const recentHidden=await page.evaluate(()=>{
  const fav=document.querySelector('.web-chooser-side section[aria-label="Kênh yêu thích"]');
  const recent=document.querySelector('.web-chooser-side section[aria-label="Kênh vừa xem"]');
  const active=document.querySelector('#webChannelChooser [data-chooser-tab="recent"]');
  return active.getAttribute('aria-selected')==='true'&&
   recent.dataset.poDuplicateEmpty==='true'&&getComputedStyle(recent).display==='none'&&
   getComputedStyle(fav).display!=='none';
 });
 await page.click('#webChooserGrid .po-chooser-empty-action');
 const recentRestored=await page.evaluate(()=>{
  const recent=document.querySelector('.web-chooser-side section[aria-label="Kênh vừa xem"]');
  return recent.dataset.poDuplicateEmpty==='false'&&getComputedStyle(recent).display!=='none';
 });
 const duplicateEmptyQA={...duplicateFavoriteQA,favoriteRestored,recentHidden,recentRestored,
  noAutoplay:await page.evaluate(()=>window.IPTVState.getCurrent()===null)};
 for(const [key,value] of Object.entries(duplicateEmptyQA))
  assert.equal(value,true,'P5.1.115 hide duplicate compact empty widget '+key+': '+JSON.stringify(duplicateEmptyQA));

 // P5.1.116: quick groups must reflect actual imported group names, and
 // selecting one must filter rather than silently resetting to All.
 const categoryChipQA=await page.evaluate(()=>{
  const lane=document.getElementById('webChooserGroups');
  const buttons=[...lane.querySelectorAll('button.web-chooser-chip')];
  const labels=buttons.map(b=>b.textContent.trim());
  const kPlusAbsent=!labels.includes('K+');
  const allExpected=labels.length===10&&labels.includes('VTV')&&labels.includes('TH địa phương');
  const vtv=buttons.find(b=>b.dataset.poQuickGroup==='VTV');
  vtv?.click();
  const selected=[...lane.querySelectorAll('button')].find(b=>b.dataset.poQuickGroup==='VTV');
  const names=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card .web-chooser-name')].map(x=>x.textContent);
  return {allExpected,kPlusAbsent,vtvSelected:!!selected&&selected.classList.contains('active')&&
   selected.getAttribute('aria-pressed')==='true',
   focusRestored:document.activeElement===selected,
   realFiltering:document.getElementById('webChooserGroup').value==='VTV'&&names.length===1&&names[0].includes('VTV QA'),
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51116-real-category-filter-450-real.png'),animations:'disabled'});
 const categoryResetQA=await page.evaluate(()=>{
  const all=[...document.querySelectorAll('#webChooserGroups button')].find(b=>b.dataset.poQuickGroup==='all');
  all.click();
  return {allSelected:all!==null&&document.querySelector('#webChooserGroups button.active')?.dataset.poQuickGroup==='all',
   allCount:document.getElementById('webChooserStatus').textContent.trim()==='561 kênh',
   cardsRestored:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 const categoryFilterQA={...categoryChipQA,...categoryResetQA};
 for(const [key,value] of Object.entries(categoryFilterQA))
  assert.equal(value,true,'P5.1.116 real-category quick filter '+key+': '+JSON.stringify(categoryFilterQA));

 // P5.1.117: real P5.1.116 screenshot shows one VTV tile using only the
 // first of two narrow columns. Expand one-result grid to a comfortable
 // horizontal button, preserving 2 columns for a populated grid.
 await page.click('#webChooserGroups button[data-po-quick-group="VTV"]');
 const singleResultQA=await page.evaluate(()=>{
  const grid=document.getElementById('webChooserGrid');
  const card=grid.querySelector('button.web-chooser-card');
  const rect=card?.getBoundingClientRect();
  const art=card?.querySelector('.web-chooser-art')?.getBoundingClientRect();
  const name=card?.querySelector('.web-chooser-name')?.getBoundingClientRect();
  const style=card?getComputedStyle(card):null;
  const nameStyle=card?getComputedStyle(card.querySelector('.web-chooser-name')):null;
  return {onlyOne:grid.querySelectorAll('button.web-chooser-card').length===1,
   fullWidth:rect?.width>=300&&Math.abs(rect.width-(grid.clientWidth-20))<=10,
   horizontal:style?.flexDirection==='row'&&art?.right<name?.left,
   compactHeight:rect?.height>=75&&rect.height<=112,
   leftAligned:nameStyle?.textAlign==='left',
   keepsFocus:document.activeElement?.dataset.poQuickGroup==='VTV',
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51117-single-result-wide-card-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGroups button[data-po-quick-group="all"]');
 const multipleCardsUnchanged=await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  const a=cards.slice(0,3).map(c=>c.getBoundingClientRect());
  return cards.length===18&&a.length===3&&Math.abs(a[0].top-a[1].top)<=2&&
   a[2].top>=a[0].bottom+4&&a[0].width>=140&&a[0].width<190;
 });
 const compactSingleQA={...singleResultQA,multipleCardsUnchanged};
 for(const [key,value] of Object.entries(compactSingleQA))
  assert.equal(value,true,'P5.1.117 single native channel result layout '+key+': '+JSON.stringify(compactSingleQA));

 // P5.1.118: native Favorite action directly on a channel tile must not
 // start playback. Verify persisted stable key, ARIA state, keyboard focus,
 // native Favorites page synchronization, and reversible unstar.
 await page.click('#webChooserGroups button[data-po-quick-group="VTV"]');
 const bookmarkBefore=await page.evaluate(()=>{
  const play=document.querySelector('#webChooserGrid button.web-chooser-card');
  const wrapper=play?.closest('.web-chooser-card-wrap');
  const star=wrapper?.querySelector('button.web-chooser-favorite');
  return {separateNativeButtons:play?.tagName==='BUTTON'&&star?.tagName==='BUTTON'&&
    !play.contains(star),notSaved:star?.getAttribute('aria-pressed')==='false',
    noPlayback:window.IPTVState.getCurrent()===null};
 });
 await page.click('#webChooserGrid button.web-chooser-favorite');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid button.web-chooser-favorite')?.getAttribute('aria-pressed')==='true',{timeout:4000});
 const bookmarkedQA=await page.evaluate(()=>{
  const store=window.IPTVState.getStore();
  const ch=window.IPTVState.getChannels().find(c=>c.name==='VTV QA 1');
  const button=document.querySelector('#webChooserGrid button.web-chooser-favorite');
  const persisted=JSON.parse(localStorage.getItem('open-iptv-pro-4')||'{}');
  const key=window.OpenIPTVFavorites.key(ch);
  return {stableFavorite:window.OpenIPTVFavorites.has(store,ch)&&store.favoriteKeys.includes(key),
   persistedInStorage:Array.isArray(persisted.favoriteKeys)&&persisted.favoriteKeys.includes(key),
   starPressed:button?.getAttribute('aria-pressed')==='true'&&
    !!button.querySelector('svg[aria-hidden="true"] path')&&
    getComputedStyle(button.querySelector('svg path')).fill!=='none',
   keyboardFocus:document.activeElement===button,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51118-direct-favorite-channel-450-real.png'),animations:'disabled'});
 await page.click('#webChannelChooser [data-chooser-tab="fav"]');
 const favoriteTabQA=await page.evaluate(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1&&
  document.querySelector('#webChooserGrid button.web-chooser-favorite')?.getAttribute('aria-pressed')==='true');
 await page.click('#webChooserGrid button.web-chooser-favorite');
 await page.waitForFunction(()=>!!document.querySelector('#webChooserGrid .po-chooser-empty-action'),{timeout:4000});
 const unstarQA=await page.evaluate(()=>{
  const store=window.IPTVState.getStore();
  const ch=window.IPTVState.getChannels().find(c=>c.name==='VTV QA 1');
  const persisted=JSON.parse(localStorage.getItem('open-iptv-pro-4')||'{}');
  const key=window.OpenIPTVFavorites.key(ch);
  return {removed:!window.OpenIPTVFavorites.has(store,ch),
   removedFromStorage:!(persisted.favoriteKeys||[]).includes(key),
   emptyFavoritesRestored:!!document.querySelector('#webChooserGrid .po-chooser-empty-action'),
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.click('#webChooserGrid .po-chooser-empty-action');
 const resetQA=await page.evaluate(()=>document.querySelector('#webChooserGroups button.active')?.dataset.poQuickGroup==='all'&&
  document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18);
 const directFavoriteQA={...bookmarkBefore,...bookmarkedQA,favoriteTabQA,...unstarQA,resetQA};
 for(const [key,value] of Object.entries(directFavoriteQA))
  assert.equal(value,true,'P5.1.118 native direct Favorite control '+key+': '+JSON.stringify(directFavoriteQA));

 // P5.1.119: visible, accessible Favorite count must update on the actual
 // chooser tab when a star is clicked, without forcing video playback.
 await page.click('#webChooserGroups button[data-po-quick-group="VTV"]');
 await page.click('#webChooserGrid button.web-chooser-favorite');
 await page.waitForFunction(()=>document.querySelector('#webChannelChooser .po-favorite-count')?.textContent==='1',{timeout:4000});
 const badgeOnQA=await page.evaluate(()=>{
  const b=document.querySelector('#webChannelChooser .po-favorite-count');
  const tab=document.querySelector('#webChannelChooser [data-chooser-tab="fav"]');
  const r=b.getBoundingClientRect(),t=tab.getBoundingClientRect();
  return {countOne:b.textContent==='1'&&!b.hidden,
   visuallyVisible:getComputedStyle(b).display!=='none'&&r.width>=14&&r.height>=14,
   containedByTab:r.left>=t.left-2&&r.right<=t.right+2,
   accessibleCount:tab.getAttribute('aria-label')==='Yêu thích, 1 kênh',
   stillAllSelected:document.querySelector('[data-chooser-tab="all"]').getAttribute('aria-selected')==='true',
   noPlayback:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51119-favorite-count-badge-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid button.web-chooser-favorite');
 await page.waitForFunction(()=>document.querySelector('#webChannelChooser .po-favorite-count')?.hidden===true,{timeout:4000});
 const badgeOffQA=await page.evaluate(()=>{
  const b=document.querySelector('#webChannelChooser .po-favorite-count');
  const tab=document.querySelector('#webChannelChooser [data-chooser-tab="fav"]');
  return {hiddenZero:b.hidden&&getComputedStyle(b).display==='none',
   accessibleZero:tab.getAttribute('aria-label')==='Yêu thích, 0 kênh',
   noPlayback:window.IPTVState.getCurrent()===null};
 });
 await page.click('#webChooserGroups button[data-po-quick-group="all"]');
 const favoriteCountQA={...badgeOnQA,...badgeOffQA};
 for(const [key,value] of Object.entries(favoriteCountQA))
  assert.equal(value,true,'P5.1.119 Favorites count badge '+key+': '+JSON.stringify(favoriteCountQA));








 // P5.1.120: The real P5.1.119 Electron after-image had three stacked
 // success banners hiding a 450px channel card. Use benign UI-only
 // notices in actual Electron; no playlist, media, or network mutation.
 const compactToastStackQA=await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  for(const [i,msg] of ['QA: Đã thêm nguồn','QA: Đã thêm yêu thích','QA: Đã bỏ yêu thích'].entries()){
   const n=document.createElement('div');n.className='toast';
   n.textContent=msg;n.setAttribute('data-po-round-120','true');
   if(i===2)n.setAttribute('data-po-round-120-last','true');
   tray.append(n);
  }
  const successes=[...tray.querySelectorAll('.toast:not(.err):not(.warn)')];
  const shown=successes.filter(n=>getComputedStyle(n).display!=='none');
  const latest=tray.querySelector('[data-po-round-120-last="true"]');
  const t=tray.getBoundingClientRect();
  return {threeSuccesses:successes.length>=3,
   onlyNewestVisible:shown.length===1&&shown[0]===latest,
   latestReadable:latest.getBoundingClientRect().height>=30,
   railClear:t.left>=66,noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51120-compact-toast-stack-450-real.png'),animations:'disabled'});
 const warningStackQA=await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const warning=document.createElement('div');warning.className='toast warn';
  warning.setAttribute('data-po-round-120','true');warning.textContent='QA: Cảnh báo quan trọng';
  tray.append(warning);
  const visibleSuccess=[...tray.querySelectorAll('.toast:not(.err):not(.warn)')].filter(n=>getComputedStyle(n).display!=='none');
  const warningVisible=getComputedStyle(warning).display!=='none'&&warning.getBoundingClientRect().height>=20;
  [...tray.querySelectorAll('[data-po-round-120]')].forEach(n=>n.remove());
  return {warningVisible,successStillVisible:visibleSuccess.length===1};
 });
 Object.assign(compactToastStackQA,warningStackQA);
 for(const [key,value] of Object.entries(compactToastStackQA))
  assert.equal(value,true,'P5.1.120 mobile success toast stack '+key+': '+JSON.stringify(compactToastStackQA));


 // P5.1.121: prior after-image showed the single remaining success toast
 // covering the bottom channel tile. Real Electron QA requires a usable
 // native dismiss action, including keyboard Enter and warning retention.
 await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const n=document.createElement('div');n.className='toast';
  n.textContent='QA: Thông báo có thể đóng';n.setAttribute('data-po-round-121','one');
  tray.append(n);
 });
 await page.waitForFunction(()=>!!document.querySelector('#toastArea [data-po-round-121="one"] .po-toast-dismiss'),{timeout:4000});
 const dismissReadyQA=await page.evaluate(()=>{
  const n=document.querySelector('#toastArea [data-po-round-121="one"]');
  const b=n.querySelector('button.po-toast-dismiss');
  const tr=n.getBoundingClientRect(),br=b.getBoundingClientRect();
  return {nativeButton:b.tagName==='BUTTON'&&b.type==='button',
   accessibleLabel:b.getAttribute('aria-label').includes('Đóng thông báo'),
   hitTarget:br.width>=30&&br.height>=30,
   insideToast:br.left>=tr.left&&br.right<=tr.right+1,
   clickable:getComputedStyle(b).pointerEvents==='auto',
   toastStillVisible:getComputedStyle(n).display!=='none',
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51121-toast-dismiss-visible-450-real.png'),animations:'disabled'});
 await page.click('#toastArea [data-po-round-121="one"] .po-toast-dismiss');
 const clickedDismissed=await page.evaluate(()=>!document.querySelector('#toastArea [data-po-round-121="one"]'));
 await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const n=document.createElement('div');n.className='toast warn';
  n.textContent='QA: Cảnh báo vẫn giữ được';n.setAttribute('data-po-round-121','keyboard');
  tray.append(n);
 });
 await page.waitForFunction(()=>!!document.querySelector('#toastArea [data-po-round-121="keyboard"] .po-toast-dismiss'),{timeout:4000});
 await page.locator('#toastArea [data-po-round-121="keyboard"] .po-toast-dismiss').focus();
 await page.keyboard.press('Enter');
 const keyboardDismissed=await page.evaluate(()=>!document.querySelector('#toastArea [data-po-round-121="keyboard"]'));
 const toastDismissQA={...dismissReadyQA,clickedDismissed,keyboardDismissed};
 for(const [key,value] of Object.entries(toastDismissQA))
  assert.equal(value,true,'P5.1.121 accessible native notification dismissal '+key+': '+JSON.stringify(toastDismissQA));

 // P5.1.122 native Electron: closing a focused toast must return focus.
 await page.locator('#webChooserSearch').focus();
 await page.evaluate(()=>{
  const n=document.createElement('div');n.className='toast warn';
  n.textContent='QA: Trở về ô tìm kiếm';n.dataset.poRound122='focus';
  document.getElementById('toastArea').append(n);
 });
 await page.waitForFunction(()=>!!document.querySelector('#toastArea [data-po-round122="focus"] .po-toast-dismiss'),{timeout:4000});
 await page.locator('#toastArea [data-po-round122="focus"] .po-toast-dismiss').focus();
 await page.keyboard.press('Enter');
 const toastFocusReturnQA=await page.evaluate(()=>({
  toastGone:!document.querySelector('#toastArea [data-po-round122="focus"]'),
  focusRestored:document.activeElement?.id==='webChooserSearch',
  inputStillEnabled:!document.getElementById('webChooserSearch')?.disabled,
  noOverflow:document.documentElement.scrollWidth<=innerWidth+1
 }));
 await page.screenshot({path:path.join(out,'positron-p51122-toast-focus-return-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(toastFocusReturnQA))
  assert.equal(value,true,'P5.1.122 native focus return '+key+': '+JSON.stringify(toastFocusReturnQA));


 // P5.1.123: Routine success notices should dock into footer, not overlap
 // native channel tiles; warnings must retain their higher, readable stack.
 await page.evaluate(()=>{
  const n=document.createElement('div');n.className='toast';
  n.textContent='QA: Đã lưu kênh yêu thích';n.dataset.poRound123='success';
  document.getElementById('toastArea').append(n);
 });
 await page.waitForFunction(()=>!!document.querySelector('#toastArea [data-po-round123="success"] .po-toast-dismiss'),{timeout:4000});
 const successDockQA=await page.evaluate(()=>{
  const n=document.querySelector('#toastArea [data-po-round123="success"]');
  const t=n.getBoundingClientRect(),f=document.querySelector('.footer').getBoundingClientRect();
  const tray=document.getElementById('toastArea');
  return {footerPresent:f.height>=32,withinFooter:t.top>=f.top-3&&t.bottom<=f.bottom+2,
   shortAndReadable:t.height>=32&&t.height<=38,nativeDismiss:!!n.querySelector('button.po-toast-dismiss'),
   trayAtBottom:parseFloat(getComputedStyle(tray).bottom)<=4,
   noPageOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51123-success-toast-footer-450-real.png'),animations:'disabled'});
 const warningDockQA=await page.evaluate(()=>{
  const tray=document.getElementById('toastArea');
  const n=document.createElement('div');n.className='toast warn';n.textContent='QA: Cảnh báo nguồn không hợp lệ';
  n.dataset.poRound123='warning';tray.append(n);
  const warn=n.getBoundingClientRect();
  const result={warnPreserved:getComputedStyle(n).display!=='none'&&warn.height>=30,
   warningNotFooterDock:parseFloat(getComputedStyle(tray).bottom)>=40,
   noPageOverflow:document.documentElement.scrollWidth<=innerWidth+1};
  [n,tray.querySelector('[data-po-round123="success"]')].forEach(x=>x?.remove());
  return result;
 });
 const toastDockQA={...successDockQA,...warningDockQA};
 for(const [key,value] of Object.entries(toastDockQA))
  assert.equal(value,true,'P5.1.123 non-blocking success toast '+key+': '+JSON.stringify(toastDockQA));

 
 // P5.1.124: Real Electron wheel, scrollbar and natural edge behavior.
 await page.evaluate(()=>{document.getElementById('webChooserGroups').scrollLeft=0;});
 const before=await page.evaluate(()=>({
  x:document.getElementById('webChooserGroups').scrollLeft,
  y:document.scrollingElement?.scrollTop||0
 }));
 await page.locator('#webChooserGroups').hover();
 await page.mouse.wheel(0,240);
 await page.waitForTimeout(130);
 const after=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  return {x:rail.scrollLeft,y:document.scrollingElement?.scrollTop||0,
   max:rail.scrollWidth-rail.clientWidth,color:getComputedStyle(rail).scrollbarColor,
   focusableChips:[...rail.querySelectorAll('button')].filter(b=>!b.disabled).length,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 const wheelQA={overflowing:after.max>40,mouseWheelMoved:after.x-before.x>25,
  pageStayedPut:Math.abs(after.y-before.y)<=1,
  mutedScrollbar:after.color.includes('106, 150, 147'),
  nativeChipsStillAccessible:after.focusableChips>=4,noOverflow:after.noOverflow};
 await page.screenshot({path:path.join(out,'positron-p51124-chip-wheel-450-real.png'),animations:'disabled'});
 const boundaryAllowed=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  rail.scrollLeft=rail.scrollWidth;
  const wheel=new WheelEvent('wheel',{deltaY:240,bubbles:true,cancelable:true});
  return rail.dispatchEvent(wheel)&&!wheel.defaultPrevented;
 });
 Object.assign(wheelQA,{boundaryReleasesPage:boundaryAllowed});
 for(const [key,value] of Object.entries(wheelQA))
  assert.equal(value,true,'P5.1.124 real Electron chip wheel '+key+': '+JSON.stringify(wheelQA));

 
 // P5.1.125: True 450px Electron. Scroll category rail fully right but
 // keep native "Tất cả" reset button available and clickable without
 // adding an overlay, changing playlist data, or starting a stream.
 await page.evaluate(()=>{const rail=document.getElementById('webChooserGroups');rail.scrollLeft=rail.scrollWidth;});
 const pinnedAllQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  const left=all.getBoundingClientRect(),rect=rail.getBoundingClientRect();
  const point=document.elementFromPoint(left.left+left.width/2,left.top+left.height/2);
  return {overflowing:rail.scrollWidth>rail.clientWidth+40,
   pinnedVisible:left.left>=rect.left-2&&left.right<=rect.left+120,
   stickyStyle:getComputedStyle(all).position==='sticky',
   pinnedClickable:point===all||all.contains(point),
   preservesGroups:rail.querySelectorAll('button[data-po-quick-group]').length>=5,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51125-pinned-all-450-real.png'),animations:'disabled'});
 await page.locator('#webChooserGroups button[data-po-quick-group]:last-child').click();
 const filterApplied=await page.evaluate(()=>!!document.getElementById('webChooserGroup').value);
 await page.locator('#webChooserGroups button[data-po-quick-group="all"]').click();
 Object.assign(pinnedAllQA,{filterApplied,
  allResetClearsGroup:await page.evaluate(()=>document.getElementById('webChooserGroup').value===''),
  allResetFocused:await page.evaluate(()=>document.activeElement?.dataset?.poQuickGroup==='all')});
 for(const [key,value] of Object.entries(pinnedAllQA))
  assert.equal(value,true,'P5.1.125 native pinned-All chip '+key+': '+JSON.stringify(pinnedAllQA));

 
 // P5.1.126: Verify visual/hit-testing mask on genuine Electron 450px,
 // not a webpage mockup. The old source still owns group filter buttons.
 await page.evaluate(()=>{const rail=document.getElementById('webChooserGroups');rail.scrollLeft=rail.scrollWidth;});
 const pinnedMaskQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  const mask=getComputedStyle(all,'::before');
  const rect=all.getBoundingClientRect(),lane=rail.getBoundingClientRect();
  const hit=document.elementFromPoint(rect.left-10,rect.top+rect.height/2);
  return {allVisible:rect.left>=lane.left-2,
   maskWidth:parseFloat(mask.width)>=20,
   maskOpaque:mask.backgroundColor==='rgb(10, 27, 41)',
   maskCapturesTap:hit===all||all.contains(hit),
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51126-pinned-all-masked-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(pinnedMaskQA))
  assert.equal(value,true,'P5.1.126 Electron pinned mask '+key+': '+JSON.stringify(pinnedMaskQA));

 
 // P5.1.127: Real Electron keyboard/remote-style group navigation.
 await page.locator('#webChooserGroups button[data-po-quick-group="all"]').focus();
 await page.keyboard.press('End');
 const endKeyboardQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const buttons=[...rail.querySelectorAll('button[data-po-quick-group]')];
  const last=buttons[buttons.length-1],group=document.getElementById('webChooserGroup');
  const b=last.getBoundingClientRect(),r=rail.getBoundingClientRect();
  return {endFocus:last===document.activeElement,
   selectionUnchanged:!group.value,
   lastVisible:b.right<=r.right+1&&b.left>=r.left-1,
   scrolledToLast:rail.scrollLeft>40,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51127-category-keys-450-real.png'),animations:'disabled'});
 await page.keyboard.press('Enter');
 const enterApplied=await page.evaluate(()=>!!document.getElementById('webChooserGroup').value);
 await page.keyboard.press('Home');
 const homeKeyboardQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const first=rail.querySelector('button[data-po-quick-group="all"]');
  return {homeFocus:first===document.activeElement};
 });
 await page.keyboard.press('Enter');
 const resetKeyboardQA=await page.evaluate(()=>{
  const group=document.getElementById('webChooserGroup');
  return {enterReset:group.value==='',resetFocused:document.activeElement?.dataset?.poQuickGroup==='all'};
 });
 const categoryKeyQA={...endKeyboardQA,...homeKeyboardQA,enterApplied,...resetKeyboardQA};
 for(const [key,value] of Object.entries(categoryKeyQA))
  assert.equal(value,true,'P5.1.127 keyboard group chips '+key+': '+JSON.stringify(categoryKeyQA));

 
 // P5.1.128: Real Electron advanced native dropdown selection must reveal the
 // selected quick chip, not leave its active state offscreen after keyboard
 // navigation. No source/channel state is changed except UI group filtering.
 await page.evaluate(()=>{
  document.getElementById('webChooserAdvanced').open=true;
  document.getElementById('webChooserGroups').scrollLeft=0;
 });
 await page.locator('#webChooserGroup').selectOption('Tin tức');
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=false;});
 const dropdownChipQA=await page.evaluate(()=>{
  const select=document.getElementById('webChooserGroup');
  const rail=document.getElementById('webChooserGroups');
  const chip=rail.querySelector('button[data-po-quick-group="Tin tức"]');
  const chipRect=chip?.getBoundingClientRect(),laneRect=rail.getBoundingClientRect();
  return {exactSelectedGroup:select.value==='Tin tức',
   activeChip:!!chip&&chip.classList.contains('active'),
   activeVisible:chipRect.right<=laneRect.right+1&&chipRect.left>=laneRect.left-1,
   railScrolled:rail.scrollLeft>40,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51128-dropdown-chip-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;});
 await page.locator('#webChooserGroup').selectOption('');
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=false;});
 const dropdownResetQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  return {resetScroll:rail.scrollLeft<=1,
   resetAllSelected:all.classList.contains('active')&&document.getElementById('webChooserGroup').value===''};
 });
 Object.assign(dropdownChipQA,dropdownResetQA);
 for(const [key,value] of Object.entries(dropdownChipQA))
  assert.equal(value,true,'P5.1.128 native dropdown-chip '+key+': '+JSON.stringify(dropdownChipQA));

 // P5.1.129: real Electron 450px after-image + DOM hit-test.
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;document.getElementById('webChooserGroups').scrollLeft=0;});
 await page.locator('#webChooserGroup').selectOption('Tin tức');
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=false;});
 await page.waitForTimeout(90);
 const pinnedRightMaskQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  const b=all.getBoundingClientRect(),r=rail.getBoundingClientRect();
  const mask=getComputedStyle(all,'::after');
  const hit=document.elementFromPoint(Math.min(b.right+9,r.right-5),b.top+b.height/2);
  return {scrolled:rail.scrollLeft>40,
   maskEnabled:rail.classList.contains('po-groups-scrolled'),
   maskWidth:parseFloat(mask.width)>=17,
   maskOpaque:mask.backgroundColor==='rgb(10, 27, 41)',
   masksGhostTap:hit===all||all.contains(hit),
   activeGroupStillVisible:!!rail.querySelector('button[data-po-quick-group="Tin tức"].active'),
   filteredCorrectly:document.getElementById('webChooserGroup').value==='Tin tức',
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51129-right-mask-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;});
 await page.locator('#webChooserGroup').selectOption('');
 await page.waitForTimeout(70);
 Object.assign(pinnedRightMaskQA,await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  return {resetClearsMask:rail.scrollLeft<=1&&!rail.classList.contains('po-groups-scrolled'),
   resetRevealsNextChip:getComputedStyle(all,'::after').content==='none'};
 }));
 for(const [key,value] of Object.entries(pinnedRightMaskQA))
  assert.equal(value,true,'P5.1.129 real Electron right-chip mask '+key+': '+JSON.stringify(pinnedRightMaskQA));

 // P5.1.130: a thin curved border from the previous scrolled chip remained
 // beside pinned All after P5.1.129. The mask must cover that border without
 // hiding or intercepting the next useful visible group button.
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;document.getElementById('webChooserGroups').scrollLeft=0;});
 await page.locator('#webChooserGroup').selectOption('Tin tức');
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=false;});
 await page.waitForTimeout(100);
 const pinnedBorderMaskQA=await page.evaluate(()=>{
  const rail=document.getElementById('webChooserGroups');
  const all=rail.querySelector('button[data-po-quick-group="all"]');
  const child=rail.querySelector('button[data-po-quick-group="Thiếu nhi"]');
  const b=all.getBoundingClientRect(),r=rail.getBoundingClientRect();
  const mask=getComputedStyle(all,'::after');
  const x=b.right+24,y=b.top+b.height/2;
  const behind=document.elementFromPoint(x,y);
  const n=child?.getBoundingClientRect(),atNext=n&&document.elementFromPoint(n.left+n.width/2,n.top+n.height/2);
  return {scroll:rail.scrollLeft>40,
   borderMaskSpan:parseFloat(mask.width)>=29&&Math.abs(parseFloat(mask.right)+30)<1,
   ghostStrokeNotClickable:behind===all||all.contains(behind),
   nextChipUnmasked:!!child&&!!n&&n.left>Math.min(b.right+29,r.right-1),
   nextChipClickable:atNext===child||child?.contains(atNext),
   activeGroupCorrect:!!rail.querySelector('button[data-po-quick-group="Tin tức"].active'),
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51130-border-mask-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(pinnedBorderMaskQA))
  assert.equal(value,true,'P5.1.130 real Electron curved-border mask '+key+': '+JSON.stringify(pinnedBorderMaskQA));

 // P5.1.131: Search is visible in the P5.1.130 real screenshot. Verify
 // the Vietnamese native-group 'đ' / ASCII 'd' mismatch on genuine Electron.
 // Use existing local-only category fixture; no URL playback or new import.
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;document.querySelector('[data-chooser-tab="all"]').click();});
 await page.locator('#webChooserGroup').selectOption('');
 // Keep the compact advanced controls closed in the real screenshot;
 // opening them was only necessary to set up the native select.
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=false;});
 await page.fill('#webChooserSearch','dia phuong');
 await page.waitForTimeout(100);
 const asciiDSearchQA=await page.evaluate(()=>{
  const search=document.getElementById('webChooserSearch');
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  const names=cards.map(b=>b.querySelector('.web-chooser-name')?.textContent||'');
  return {queryAsciiD:search.value==='dia phuong',
   focused:document.activeElement===search,
   matchesVietnameseD:names.length===1&&names[0]==='TH QA 1',
   exactGroupOriginal:window.IPTVState.getChannels().some(c=>c.name==='TH QA 1'&&c.group==='TH địa phương'),
   liveCount:document.getElementById('webChooserStatus').textContent.trim()==='1 kênh',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51131-ascii-d-search-450-real.png'),animations:'disabled'});
 await page.fill('#webChooserSearch','');
 // Native input changes schedule render() in requestAnimationFrame, so the
 // reset assertion must wait for the actual 18 restored native cards.
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:4000});
 Object.assign(asciiDSearchQA,await page.evaluate(()=>({
  resetShowsChannels:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,
  queryCleared:document.getElementById('webChooserSearch').value==='',
  noAutoPlayAfterReset:window.IPTVState.getCurrent()===null
 })));
 for(const [key,value] of Object.entries(asciiDSearchQA))
  assert.equal(value,true,'P5.1.131 Vietnamese ASCII search '+key+': '+JSON.stringify(asciiDSearchQA));

 // P5.1.132: the P5.1.131 genuine 450px Electron screenshot shows a
 // native channel search but no way back from a no-results typo except the
 // browser's tiny X. Verify one-click recovery in the All tab.
 await page.evaluate(()=>document.querySelector('#webChannelChooser [data-chooser-tab="all"]').click());
 await page.fill('#webChooserSearch','zz-no-channel');
 await page.waitForFunction(()=>!!document.getElementById('poChooserClearFilters'));
 const emptySearchActionQA=await page.evaluate(()=>{
  const grid=document.getElementById('webChooserGrid');
  const button=document.getElementById('poChooserClearFilters');
  const bounds=button?.getBoundingClientRect();
  return {zeroResults:grid.querySelectorAll('button.web-chooser-card').length===0,
   meaningfulMessage:!!grid.querySelector('.web-chooser-empty')?.textContent.includes('Không tìm thấy kênh'),
   nativeClearButton:!!button&&button.tagName==='BUTTON'&&button.textContent.includes('Xóa bộ lọc'),
   visuallyReachable:!!bounds&&bounds.height>=30&&getComputedStyle(button).display!=='none',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51132-empty-search-clear-before-450-real.png'),animations:'disabled'});
 await page.click('#poChooserClearFilters');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18);
 Object.assign(emptySearchActionQA,await page.evaluate(()=>({
  queryCleared:document.getElementById('webChooserSearch').value==='',
  groupCleared:document.getElementById('webChooserGroup').value==='',
  focusReturned:document.activeElement===document.getElementById('webChooserSearch'),
  cardsRestored:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,
  noAutoplayAfterReset:window.IPTVState.getCurrent()===null
 })));
 await page.screenshot({path:path.join(out,'positron-p51132-empty-search-clear-after-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(emptySearchActionQA))
  assert.equal(value,true,'P5.1.132 native empty-search recovery '+key+': '+JSON.stringify(emptySearchActionQA));

 // P5.1.133: the last genuine P5.1.132 450px screenshot shows the
 // second row's long QA Channel names cut off next to the separate star.
 // Test a multi-result library card (not the single-result wide-card path).
 await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  const c=cards.find(n=>n.querySelector('.web-chooser-name')?.textContent.startsWith('QA Channel '));
  c?.scrollIntoView({block:'center',inline:'nearest'});
 });
 await page.waitForTimeout(90);
 const readableCardTitleQA=await page.evaluate(()=>{
  const grid=document.getElementById('webChooserGrid');
  const button=[...grid.querySelectorAll('button.web-chooser-card')]
   .find(n=>n.querySelector('.web-chooser-name')?.textContent.startsWith('QA Channel '));
  const frame=button?.closest('.web-chooser-card-wrap');
  const title=button?.querySelector('.web-chooser-name');
  const star=frame?.querySelector('.web-chooser-favorite');
  const t=title?.getBoundingClientRect(),s=star?.getBoundingClientRect();
  const style=title&&getComputedStyle(title);
  return {usesNativeGrid:!!grid&&!grid.classList.contains('list'),
   loadedManyCards:grid.querySelectorAll('button.web-chooser-card').length===18,
   realLongTitle:title?.textContent.length>=14,
   wrapsTwoLines:style?.whiteSpace==='normal'&&style?.webkitLineClamp==='2',
   readableWithoutClipping:!!title&&title.scrollHeight<=title.clientHeight+2,
   separateStarHitArea:!!s&&s.width>=33&&s.height>=33&&star.tagName==='BUTTON',
   noStarOverlap:!!t&&!!s&&t.bottom<=s.top-3,
   videoCardStillNative:button?.tagName==='BUTTON',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51133-compact-card-title-star-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(readableCardTitleQA))
  assert.equal(value,true,'P5.1.133 genuine compact card title/star '+key+': '+JSON.stringify(readableCardTitleQA));

 // P5.1.134: real P5.1.133 450px screenshot shows an uneven font glyph
 // in each Favorite button; verify actual native SVG and persisted toggling.
 const svgStarBefore=await page.evaluate(()=>{
  const b=document.querySelector('#webChooserGrid .web-chooser-favorite');
  const svg=b?.querySelector('svg'),path=svg?.querySelector('path');
  const r=b?.getBoundingClientRect();
  return {hasNativeSvg:svg?.namespaceURI==='http://www.w3.org/2000/svg',
   safeHiddenIcon:svg?.getAttribute('aria-hidden')==='true',
   fixedGeometry:svg?.getAttribute('viewBox')==='0 0 24 24'&&r.width>=33&&r.height>=33,
   hollowWhenUnselected:b?.getAttribute('aria-pressed')==='false'&&getComputedStyle(path).fill==='none',
   separateFromPlay:!!b?.closest('.web-chooser-card-wrap')?.querySelector('button.web-chooser-card'),
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51134-favorite-native-svg-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-favorite');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-favorite')?.getAttribute('aria-pressed')==='true');
 const svgStarAfter=await page.evaluate(()=>{
  const b=document.querySelector('#webChooserGrid .web-chooser-favorite');
  const path=b?.querySelector('svg path');
  return {pressed:b?.getAttribute('aria-pressed')==='true',
   filledWhenSelected:!!path&&getComputedStyle(path).fill!=='none',
   accessibleToggle:b?.getAttribute('aria-label')?.startsWith('Bỏ khỏi yêu thích:'),
   noAutoplay:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51134-favorite-native-svg-after-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-favorite');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-favorite')?.getAttribute('aria-pressed')==='false');
 Object.assign(svgStarAfter,await page.evaluate(()=>{
  const b=document.querySelector('#webChooserGrid .web-chooser-favorite');
  return {restoredUnselected:b?.getAttribute('aria-pressed')==='false',
   restoredHollow:getComputedStyle(b.querySelector('svg path')).fill==='none',
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 }));
 const favoriteSvgQA={...svgStarBefore,...svgStarAfter};
 for(const [key,value] of Object.entries(favoriteSvgQA))
  assert.equal(value,true,'P5.1.134 genuine SVG Favorite '+key+': '+JSON.stringify(favoriteSvgQA));

 // P5.1.134 NEW: press F on a focused native channel tile to toggle
 // Favorite without playing the channel or losing keyboard focus. No
 // modified M3U/stream URL and focus remains on the same channel card.
 await page.locator('#webChooserGrid button.web-chooser-card').first().focus();
 const hotkeyChannel=await page.locator('#webChooserGrid button.web-chooser-card').first().getAttribute('data-channel-id');
 await page.keyboard.press('f');
 await page.waitForFunction(id=>{
  const star=[...document.querySelectorAll('#webChooserGrid .web-chooser-favorite')]
   .find(b=>b.dataset.channelId===id);
  return star?.getAttribute('aria-pressed')==='true';
 },hotkeyChannel);
 await page.waitForFunction(id=>{
  const active=document.activeElement;
  return active?.classList.contains('web-chooser-card')&&active.dataset.channelId===id;
 },hotkeyChannel);
 const keyboardFavoriteQA=await page.evaluate(id=>{
  const card=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')]
   .find(b=>b.dataset.channelId===id);
  const star=[...document.querySelectorAll('#webChooserGrid .web-chooser-favorite')]
   .find(b=>b.dataset.channelId===id);
  return {favoriteWithoutPlaying:window.IPTVState.getCurrent()===null,
   savedFavorite:star?.getAttribute('aria-pressed')==='true',
   vectorFilled:getComputedStyle(star?.querySelector('svg path')).fill!=='none',
   keyboardFocusPreserved:document.activeElement===card,
   readableCardRemains:!!card?.querySelector('.web-chooser-name')?.textContent,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 },hotkeyChannel);
 await page.screenshot({path:path.join(out,'positron-p51134-favorite-hotkey-f-450-real.png'),animations:'disabled'});
 await page.keyboard.press('f');
 await page.waitForFunction(id=>{
  const star=[...document.querySelectorAll('#webChooserGrid .web-chooser-favorite')]
   .find(b=>b.dataset.channelId===id);
  return star?.getAttribute('aria-pressed')==='false';
 },hotkeyChannel);
 Object.assign(keyboardFavoriteQA,await page.evaluate(id=>{
  const card=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')]
   .find(b=>b.dataset.channelId===id);
  const star=[...document.querySelectorAll('#webChooserGrid .web-chooser-favorite')]
   .find(b=>b.dataset.channelId===id);
  return {undoWithoutPlayback:window.IPTVState.getCurrent()===null,
   restoredOriginalFavorite:star?.getAttribute('aria-pressed')==='false',
   nativeFocusStillOnCard:document.activeElement===card};
 },hotkeyChannel));
 for(const [key,value] of Object.entries(keyboardFavoriteQA))
  assert.equal(value,true,'P5.1.134 real Electron press F Favorite '+key+': '+JSON.stringify(keyboardFavoriteQA));


 // P5.1.135: user searches by reordered local title/group keywords.
 // Before-image shows the unfiltered native channel list; after shows one result.
 await page.screenshot({path:path.join(out,'positron-p51135-reordered-search-before-450-real.png'),animations:'disabled'});
 await page.fill('#webChooserSearch','001 Channel QA');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:4000});
 const multiTermSearchQA=await page.evaluate(()=>{
  const titles=[...document.querySelectorAll('#webChooserGrid .web-chooser-name')].map(n=>n.textContent);
  return {reorderedKeywordsFindChannel:titles.length===1&&titles[0]==='QA Channel 001',
   actualSearchText:document.getElementById('webChooserSearch').value==='001 Channel QA',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1};
 });
 await page.screenshot({path:path.join(out,'positron-p51135-reordered-search-450-real.png'),animations:'disabled'});
 await page.fill('#webChooserSearch','qa   001');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:4000});
 Object.assign(multiTermSearchQA,await page.evaluate(()=>({
  repeatedSpacesAccepted:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,
  noPlaybackAfterAlternateQuery:window.IPTVState.getCurrent()===null
 })));
 for(const [key,value] of Object.entries(multiTermSearchQA))
  assert.equal(value,true,'P5.1.135 native reordered local search '+key+': '+JSON.stringify(multiTermSearchQA));
 await page.fill('#webChooserSearch','');

 // P5.1.136: native Enter-to-select shortcut, no autoplay.
 await page.fill('#webChooserSearch','001 Channel QA');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:4000});
 await page.screenshot({path:path.join(out,'positron-p51136-search-enter-before-450-real.png'),animations:'disabled'});
 await page.keyboard.press('Enter');
 const keyboardSearchQA=await page.evaluate(()=>{
  const selected=document.activeElement;
  return {
   focusMovedToMatch:selected?.matches?.('#webChooserGrid button.web-chooser-card')===true,
   correctChannel:selected?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001',
   queryPreserved:document.getElementById('webChooserSearch').value==='001 Channel QA',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51136-search-enter-after-450-real.png'),animations:'disabled'});
 await page.fill('#webChooserSearch','zz-khong-co-kenh-phu-hop');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===0,{timeout:4000});
 await page.keyboard.press('Enter');
 Object.assign(keyboardSearchQA,await page.evaluate(()=>({
  noMatchKeepsSearchFocus:document.activeElement===document.getElementById('webChooserSearch'),
  noMatchNeverPlays:window.IPTVState.getCurrent()===null
 })));
 for(const [key,value] of Object.entries(keyboardSearchQA))
  assert.equal(value,true,'P5.1.136 Electron keyboard '+key+': '+JSON.stringify(keyboardSearchQA));
 await page.fill('#webChooserSearch','');


 // P5.1.137: only focus moves between native channel cards. Test grid and list.
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:4000});
 await page.evaluate(()=>document.querySelector('#webChooserGrid button.web-chooser-card').focus({preventScroll:true}));
 // Wait for pending scheduled render; then verify native tile still owns focus.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const nativeFocusReady=await page.evaluate(()=>
  document.activeElement?.matches?.('#webChooserGrid button.web-chooser-card')===true
  &&document.activeElement?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001');
 assert.equal(nativeFocusReady,true,'P5.1.138 focus must survive queued render');
 await page.screenshot({path:path.join(out,'positron-p51137-arrow-navigation-before-450-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowRight');
 const arrowNavigationQA=await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  return {
   gridRightSelectsSecond:document.activeElement===cards[1],
   firstName:cards[0]?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001',
   secondName:cards[1]?.querySelector('.web-chooser-name')?.textContent==='QA Channel 002',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51137-arrow-navigation-after-450-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowDown');
 Object.assign(arrowNavigationQA,await page.evaluate(()=>({
  downKeepsColumn:document.activeElement===[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')][3]
 })));
 await page.keyboard.press('ArrowLeft');
 Object.assign(arrowNavigationQA,await page.evaluate(()=>({
  leftChangesColumn:document.activeElement===[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')][2]
 })));
 await page.keyboard.press('Home');
 Object.assign(arrowNavigationQA,await page.evaluate(()=>({
  homeSelectsFirst:document.activeElement===document.querySelector('#webChooserGrid button.web-chooser-card')
 })));
 await page.keyboard.press('End');
 Object.assign(arrowNavigationQA,await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  return {endSelectsLast:document.activeElement===cards[cards.length-1],
   stillNoPlayback:window.IPTVState.getCurrent()===null};
 }));
 await page.click('[data-chooser-layout="list"]');
 await page.evaluate(()=>document.querySelector('#webChooserGrid button.web-chooser-card').focus({preventScroll:true}));
 await page.keyboard.press('ArrowDown');
 Object.assign(arrowNavigationQA,await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  return {listDownSelectsNext:document.activeElement===cards[1],
   listRemainsAccessible:cards.every(c=>c.tagName==='BUTTON')};
 }));
 for(const [key,value] of Object.entries(arrowNavigationQA))
  assert.equal(value,true,'P5.1.137 Electron tile arrow navigation '+key+': '+JSON.stringify(arrowNavigationQA));
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','');

 // P5.1.138: PageDown/PageUp keep keyboard focus on actual native tiles
 // across the 18-card page boundary, with source and playback unchanged.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:4000});
 await page.evaluate(()=>document.querySelector('#webChooserGrid button.web-chooser-card').focus({preventScroll:true}));
 await page.screenshot({path:path.join(out,'positron-p51138-page-navigation-before-450-real.png'),animations:'disabled'});
 await page.keyboard.press('PageDown');
 await page.waitForFunction(()=>document.getElementById('webChooserPage').textContent.startsWith('2 /'),{timeout:4000});
 const pageNavigationQA=await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  return {
   nextPageSelected:document.getElementById('webChooserPage').textContent.startsWith('2 /'),
   firstCardFocused:document.activeElement===cards[0],
   nextPageStartsAtNineteen:cards[0]?.querySelector('.web-chooser-name')?.textContent==='QA Channel 019',
   queryPreserved:document.getElementById('webChooserSearch').value==='QA Channel',
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   accessibleKeyHints:document.getElementById('webChooserGrid').getAttribute('aria-keyshortcuts')==='PageDown PageUp'
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51138-page-navigation-after-450-real.png'),animations:'disabled'});
 await page.keyboard.press('PageUp');
 Object.assign(pageNavigationQA,await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  return {
   previousPageRestored:document.getElementById('webChooserPage').textContent.startsWith('1 /'),
   previousPageLastFocused:document.activeElement===cards[cards.length-1],
   finalItemIsEighteen:cards[cards.length-1]?.querySelector('.web-chooser-name')?.textContent==='QA Channel 018',
   returnStillNoAutoplay:window.IPTVState.getCurrent()===null
  };
 }));
 for(const [key,value] of Object.entries(pageNavigationQA))
  assert.equal(value,true,'P5.1.138 real Electron PageUp/Down '+key+': '+JSON.stringify(pageNavigationQA));
 await page.fill('#webChooserSearch','');

 // P5.1.139: user-visible Favorite-first sorting for the local channel
 // list, with actual native Favorite controls and reversible local metadata.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const favoriteSortBefore=await page.evaluate(()=>{
  const names=window.IPTVState.getChannels().map(ch=>String(ch.id));
  // Compare the canonical stored playlist, not the derived enabledChannels()
  // projection, which can be recomputed during native source refresh.
  // Metadata-only fixture: no stream is opened or sent to CI logs.
  const stored=window.IPTVState.getStore();
  const channelEntries=stored.channels.map(ch=>JSON.stringify([
   String(ch.id),String(ch.sourceId),String(ch.url||''),String(ch.name||''),String(ch.group||'')])).sort();
  const sourceEntries=stored.sources.map(s=>JSON.stringify([String(s.id),s.enabled!==false])).sort();
  const tile=[...document.querySelectorAll('#webChooserGrid .web-chooser-card-wrap')]
   .find(w=>w.querySelector('.web-chooser-name')?.textContent==='QA Channel 005');
  const star=tile?.querySelector('button.web-chooser-favorite');
  if(!star)throw Error('P5.1.139 missing native QA favorite button');
  const alreadySaved=star.getAttribute('aria-pressed')==='true';
  const id=star.dataset.channelId;
  if(!alreadySaved)star.click();
  return {id,alreadySaved,channels:names,channelEntries,sourceEntries};
 });
 await page.waitForFunction(id=>{
  const star=[...document.querySelectorAll('#webChooserGrid button.web-chooser-favorite')]
   .find(b=>b.dataset.channelId===id);
  return star?.getAttribute('aria-pressed')==='true';
 },favoriteSortBefore.id,{timeout:5000});
 await page.evaluate(()=>{document.getElementById('webChooserAdvanced').open=true;});
 await page.screenshot({path:path.join(out,'positron-p51139-favorites-first-before-450-real.png'),animations:'disabled'});
 await page.selectOption('#webChooserSort','fav-first');
 await page.waitForFunction(()=>{
  const first=document.querySelector('#webChooserGrid .web-chooser-card-wrap button.web-chooser-favorite');
  return document.getElementById('webChooserSort').value==='fav-first'
   &&first?.getAttribute('aria-pressed')==='true';
 },{timeout:5000});
 const favoriteSortQA=await page.evaluate(original=>{
  const wrappers=[...document.querySelectorAll('#webChooserGrid .web-chooser-card-wrap')];
  const flags=wrappers.map(w=>w.querySelector('button.web-chooser-favorite')?.getAttribute('aria-pressed')==='true');
  const firstUnmarked=flags.findIndex(x=>!x);
  const current=window.IPTVState.getChannels().map(c=>String(c.id));
  const stored=window.IPTVState.getStore();
  const channelEntries=stored.channels.map(ch=>JSON.stringify([
   String(ch.id),String(ch.sourceId),String(ch.url||''),String(ch.name||''),String(ch.group||'')])).sort();
  const sourceEntries=stored.sources.map(s=>JSON.stringify([String(s.id),s.enabled!==false])).sort();
  return {
   selectedFavoriteSort:document.getElementById('webChooserSort').value==='fav-first',
   readableVietnameseLabel:[...document.getElementById('webChooserSort').options].some(o=>o.value==='fav-first'&&o.textContent==='Yêu thích lên đầu'),
   markedCardAppearsFirst:flags[0]===true,
   favoritesBeforeOtherChannels:firstUnmarked===-1||flags.slice(firstUnmarked).every(x=>!x),
   channelsNotAltered:channelEntries.length===original.channelEntries.length
    &&JSON.stringify(channelEntries)===JSON.stringify(original.channelEntries),
   sourceActivationUnchanged:JSON.stringify(sourceEntries)===JSON.stringify(original.sourceEntries),
   eighteenResults:wrappers.length===18,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },favoriteSortBefore);
 await page.screenshot({path:path.join(out,'positron-p51139-favorites-first-after-450-real.png'),animations:'disabled'});
 // Display membership may refresh independently; verify stored playlist
 // identities and source enablement were not changed by presentation sorting.
 for(const [key,value] of Object.entries(favoriteSortQA))
  assert.equal(value,true,'P5.1.139 real Electron favorite sort '+key+': '+JSON.stringify(favoriteSortQA));
 await page.selectOption('#webChooserSort','asc');
 if(!favoriteSortBefore.alreadySaved){
  await page.evaluate(id=>{
   const star=[...document.querySelectorAll('#webChooserGrid button.web-chooser-favorite')]
    .find(x=>x.dataset.channelId===id);
   if(star?.getAttribute('aria-pressed')==='true')star.click();
  },favoriteSortBefore.id);
 }
 await page.fill('#webChooserSearch','');

 // P5.1.140: show only real currently scheduled XMLTV programmes.
 // Inject one local metadata-only guide, never an IPTV URL or a network fetch.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const onAirFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  if(!ch)throw Error('P5.1.140 missing QA Channel 001');
  const id='qa-positron-140',now=Date.now();
  window.__positron140OriginalGuide=window.IPTVExtras.getGuide;
  const guide={names:{[window.IPTVGuide.tidy(ch.name)]:id},
   aliasesById:{[id]:[ch.name]},
   programmes:[{id,start:now-60000,end:now+1800000,title:'Chương trình QA hiện tại'}],
   offsetMinutes:0};
  window.IPTVExtras.getGuide=()=>guide;
  document.getElementById('webChooserAdvanced').open=true;
  return {sourceCount:window.IPTVState.getChannels().length};
 });
 await page.screenshot({path:path.join(out,'positron-p51140-epg-current-filter-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserOnAirOnly');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 const onAirFilterQA=await page.evaluate(original=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  return {
   optedIn:document.getElementById('webChooserOnAirOnly').checked===true,
   onlyRealCurrentProgramme:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,
   selectedExpectedChannel:card?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001',
   programmeLabel:card?.querySelector('.web-chooser-onair-programme')?.textContent==='Theo EPG: Chương trình QA hiện tại',
   sourcesUnchanged:window.IPTVState.getChannels().length===original.sourceCount,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },onAirFixture);
 await page.screenshot({path:path.join(out,'positron-p51140-epg-current-filter-after-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(onAirFilterQA))
  assert.equal(value,true,'P5.1.140 Electron XMLTV-only filter '+key+': '+JSON.stringify(onAirFilterQA));
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron140OriginalGuide;
  document.getElementById('webChooserOnAirOnly').checked=false;
  document.getElementById('webChooserOnAirOnly').dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.fill('#webChooserSearch','');

 // P5.1.141: programme-title discovery on the native TV chooser.
 // Search phrase appears only in current XMLTV title, NOT in channel name.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const epgSearchFixture=await page.evaluate(()=>{
  const channel=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  if(!channel)throw Error('P5.1.141 missing QA channel');
  const id='qa-positron-141',now=Date.now();
  window.__positron141OriginalGuide=window.IPTVExtras.getGuide;
  const guide={names:{[window.IPTVGuide.tidy(channel.name)]:id},
   aliasesById:{[id]:[channel.name]},
   programmes:[{id,start:now-60000,end:now+1800000,title:'Bản tin yêu thích QA'}],
   offsetMinutes:0};
  window.IPTVExtras.getGuide=()=>guide;
  const toggle=document.getElementById('webChooserOnAirOnly');
  toggle.checked=true;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('webChooserAdvanced').open=true;
  return {sources:window.IPTVState.getChannels().length};
 });
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,{timeout:5000});
 await page.screenshot({path:path.join(out,'positron-p51141-programme-title-search-before-450-real.png'),animations:'disabled'});
 await page.fill('#webChooserSearch','tin yeu thich');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 const programmeSearchQA=await page.evaluate(original=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  return {
   matchesProgrammeWithoutChannelKeywords:card?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001',
   programmeTitleIsFromXMLTV:card?.querySelector('.web-chooser-onair-programme')?.textContent==='Theo EPG: Bản tin yêu thích QA',
   asciiVietnamesePhrase:document.getElementById('webChooserSearch').value==='tin yeu thich',
   epgOnlyIsOptIn:document.getElementById('webChooserOnAirOnly').checked===true,
   helpfulSearchPlaceholder:document.getElementById('webChooserSearch').placeholder.includes('chương trình EPG'),
   sourceCountStable:window.IPTVState.getChannels().length===original.sources,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },epgSearchFixture);
 await page.screenshot({path:path.join(out,'positron-p51141-programme-title-search-after-450-real.png'),animations:'disabled'});
 for(const [key,value] of Object.entries(programmeSearchQA))
  assert.equal(value,true,'P5.1.141 real Electron programme-title search '+key+': '+JSON.stringify(programmeSearchQA));
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron141OriginalGuide;
  const toggle=document.getElementById('webChooserOnAirOnly');
  toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.fill('#webChooserSearch','');

 // P5.1.142: show next XMLTV schedule on the same native TV channel
 // tile after explicit EPG opt-in. No source fetch or automatic playback.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel 001');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 const upcomingFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  if(!ch)throw Error('P5.1.142 missing actual imported local QA channel');
  window.__positron142OriginalGuide=window.IPTVExtras.getGuide;
  const id='qa-positron-142',now=Date.now();
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(ch.name)]:id},
   aliasesById:{[id]:[ch.name]},offsetMinutes:0,
   programmes:[
    {id,start:now-60000,end:now+15*60000,title:'Đang phát QA'},
    {id,start:now+15*60000,end:now+65*60000,title:'Phim QA sắp chiếu'}
   ]});
  return {count:window.IPTVState.getStore().channels.length};
 });
 await page.evaluate(()=>document.querySelector('#webChooserGrid button.web-chooser-card').scrollIntoView({block:'center'}));
 await page.screenshot({path:path.join(out,'positron-p51142-next-programme-before-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  const toggle=document.getElementById('webChooserOnAirOnly');
  toggle.checked=true;toggle.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.waitForFunction(()=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  return document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
   &&card?.querySelector('.web-chooser-next-programme')?.textContent.includes('Phim QA sắp chiếu')
   &&card?.querySelector('.web-chooser-onair-programme')?.textContent==='Theo EPG: Đang phát QA';
 },{timeout:5000});
 await page.evaluate(()=>document.querySelector('.web-chooser-next-programme')?.scrollIntoView({block:'center'}));
 const upcomingProgrammeQA=await page.evaluate(original=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card'),
   upcoming=card?.querySelector('.web-chooser-next-programme'),
   now=card?.querySelector('.web-chooser-onair-programme');
  return {
   userEnabledEPG:document.getElementById('webChooserOnAirOnly').checked,
   showsActualCurrentProgramme:now?.textContent==='Theo EPG: Đang phát QA',
   upcomingFromRealLocalXMLTV:upcoming?.textContent.endsWith(': Phim QA sắp chiếu')===true,
   upcomingShowsLocalClock:/^Tiếp theo \d{1,2}:\d{2}: /.test(upcoming?.textContent||''),
   sourceRecordsUnchanged:window.IPTVState.getStore().channels.length===original.count,
   onlyMatchingChannel:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   epgTitlesLegible:card?.querySelector('.web-chooser-name')?.getBoundingClientRect().width>=140
    &&now?.getBoundingClientRect().width>=140&&upcoming?.getBoundingClientRect().width>=140,
   epgRowsStacked:upcoming?.getBoundingClientRect().top>=now?.getBoundingClientRect().bottom-2
    &&now?.getBoundingClientRect().top>=card?.querySelector('.web-chooser-name')?.getBoundingClientRect().bottom-2
  };
 },upcomingFixture);
 await page.screenshot({path:path.join(out,'positron-p51142-next-programme-after-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  const toggle=document.getElementById('webChooserOnAirOnly');
  toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));
 });
 Object.assign(upcomingProgrammeQA,await page.evaluate(()=>({
  noNextProgrammeWithoutOptIn:document.querySelectorAll('#webChooserGrid .web-chooser-next-programme').length===0,
  noPlaybackAfterDisabling:window.IPTVState.getCurrent()===null
 })));
 await page.evaluate(()=>{window.IPTVExtras.getGuide=window.__positron142OriginalGuide;});
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(upcomingProgrammeQA))
  assert.equal(value,true,'P5.1.142 native XMLTV next programme '+key+': '+JSON.stringify(upcomingProgrammeQA));


 // P5.1.143: future XMLTV-only filter must work with no current programme.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const soonFixture=await page.evaluate(()=>{
  const all=window.IPTVState.getChannels(),early=all.find(c=>c.name==='QA Channel 001'),
   late=all.find(c=>c.name==='QA Channel 002');
  if(!early||!late)throw Error('P5.1.143 missing imported QA channels');
  const now=Date.now(),a='qa143-a',b='qa143-b';
  window.__positron143OriginalGuide=window.IPTVExtras.getGuide;
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(early.name)]:a,[window.IPTVGuide.tidy(late.name)]:b},
   aliasesById:{[a]:[early.name],[b]:[late.name]},offsetMinutes:0,
   programmes:[
    {id:a,start:now+20*60000,end:now+50*60000,title:'Phim sắp chiếu đặc biệt QA'},
    {id:b,start:now+90*60000,end:now+130*60000,title:'Chương trình quá xa QA'}
   ]});
  document.getElementById('webChooserAdvanced').open=true;
  return {channels:window.IPTVState.getStore().channels.length};
 });
 await page.screenshot({path:path.join(out,'positron-p51143-soon-filter-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserSoonOnly');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 await page.fill('#webChooserSearch','phim sap chieu');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,{timeout:5000});
 const soonProgrammeQA=await page.evaluate(original=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  const future=card?.querySelector('.web-chooser-next-programme');
  return {
   optInActive:document.getElementById('webChooserSoonOnly').checked,
   mutuallyExclusive:!document.getElementById('webChooserOnAirOnly').checked,
   futureOnlyChannel:card?.querySelector('.web-chooser-name')?.textContent==='QA Channel 001'
    &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,
   nextHourTitle:future?.textContent.includes('Phim sắp chiếu đặc biệt QA')===true,
   localStartTime:/^Sắp chiếu \d{1,2}:\d{2}: /.test(future?.textContent||''),
   findsUnaccentedFutureTitle:document.getElementById('webChooserSearch').value==='phim sap chieu',
   noInventedCurrentTitle:card?.querySelector('.web-chooser-onair-programme')===null,
   sourceRecordsUnchanged:window.IPTVState.getStore().channels.length===original.channels,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   futureTitleLegible:future?.getBoundingClientRect().width>=140
    &&card?.querySelector('.web-chooser-name')?.getBoundingClientRect().width>=140,
   futureRowBelowName:future?.getBoundingClientRect().top>=card?.querySelector('.web-chooser-name')?.getBoundingClientRect().bottom-2
  };
 },soonFixture);
 await page.evaluate(()=>document.querySelector('.web-chooser-next-programme')?.scrollIntoView({block:'center'}));
 await page.screenshot({path:path.join(out,'positron-p51143-soon-filter-after-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  document.getElementById('webChooserOnAirOnly').checked=true;
  document.getElementById('webChooserOnAirOnly').dispatchEvent(new Event('change',{bubbles:true}));
 });
 Object.assign(soonProgrammeQA,await page.evaluate(()=>({
  onAirDisablesSoon:document.getElementById('webChooserOnAirOnly').checked
   &&!document.getElementById('webChooserSoonOnly').checked,
  noPlaybackAfterToggle:window.IPTVState.getCurrent()===null
 })));
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron143OriginalGuide;
  document.getElementById('webChooserOnAirOnly').checked=false;
  document.getElementById('webChooserOnAirOnly').dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(soonProgrammeQA))
  assert.equal(value,true,'P5.1.143 local upcoming XMLTV filter '+key+': '+JSON.stringify(soonProgrammeQA));


 // P5.1.144: sort actual upcoming XMLTV programmes by the nearest start,
 // leaving channels without an EPG schedule visible after scheduled ones.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const earliestFixture=await page.evaluate(()=>{
  const all=window.IPTVState.getChannels();
  const ch1=all.find(c=>c.name==='QA Channel 001');
  const ch2=all.find(c=>c.name==='QA Channel 002');
  const ch3=all.find(c=>c.name==='QA Channel 003');
  if(!ch1||!ch2||!ch3)throw Error('P5.1.144 missing imported channels');
  const a='qa144-a',b='qa144-b',clock=Date.now();
  window.__positron144Guide=window.IPTVExtras.getGuide;
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(ch1.name)]:a,[window.IPTVGuide.tidy(ch2.name)]:b},
   aliasesById:{[a]:[ch1.name],[b]:[ch2.name]},offsetMinutes:0,
   programmes:[
    {id:a,start:clock+44*60000,end:clock+72*60000,title:'Bản tin bắt đầu muộn'},
    {id:b,start:clock+8*60000,end:clock+38*60000,title:'Chương trình sớm nhất'}
   ]});
  document.getElementById('webChooserAdvanced').open=true;
  return {sources:window.IPTVState.getStore().channels.length};
 });
 await page.screenshot({path:path.join(out,'positron-p51144-earliest-epg-before-450-real.png'),animations:'disabled'});
 await page.selectOption('#webChooserSort','upcoming-first');
 await page.waitForFunction(()=>{
  const names=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card .web-chooser-name')]
   .slice(0,3).map(e=>e.textContent);
  return names[0]==='QA Channel 002'&&names[1]==='QA Channel 001';
 },{timeout:5000});
 const earliestEpgSortQA=await page.evaluate(original=>{
  const cards=[...document.querySelectorAll('#webChooserGrid button.web-chooser-card')];
  const names=cards.map(c=>c.querySelector('.web-chooser-name')?.textContent);
  const epg=cards.slice(0,2).map(c=>c.querySelector('.web-chooser-next-programme')?.textContent||'');
  return {
   selectedRealEpgSort:document.getElementById('webChooserSort').value==='upcoming-first',
   upcomingSoonestFirst:names[0]==='QA Channel 002'&&names[1]==='QA Channel 001',
   unknownEpgNotLost:cards.length===18&&names.includes('QA Channel 003'),
   earlyTitleFromXMLTV:epg[0].includes('Chương trình sớm nhất'),
   laterTitleFromXMLTV:epg[1].includes('Bản tin bắt đầu muộn'),
   localTimesVisible:epg.every(t=>/^Sắp tới \d{1,2}:\d{2}: /.test(t)),
   sourceRecordsUnchanged:window.IPTVState.getStore().channels.length===original.sources,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },earliestFixture);
 await page.evaluate(()=>document.querySelector('#webChooserGrid button.web-chooser-card .web-chooser-next-programme')?.scrollIntoView({block:'center'}));
 await page.screenshot({path:path.join(out,'positron-p51144-earliest-epg-after-450-real.png'),animations:'disabled'});
 await page.selectOption('#webChooserSort','asc');
 await page.evaluate(()=>{window.IPTVExtras.getGuide=window.__positron144Guide;});
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 Object.assign(earliestEpgSortQA,await page.evaluate(()=>({
  alphabeticalUndoRestored:document.getElementById('webChooserSort').value==='asc'
   &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',
  noAutoPlayAfterUndo:window.IPTVState.getCurrent()===null
 })));
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(earliestEpgSortQA))
  assert.equal(value,true,'P5.1.144 actual next-programme sorting '+key+': '+JSON.stringify(earliestEpgSortQA));


 // P5.1.145: viewer adjusts upcoming window to 15, 30 or 60 minutes.
 // All programmes are synthetic XMLTV metadata attached to imported QA channels.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18,{timeout:5000});
 const windowFixture=await page.evaluate(()=>{
  const all=window.IPTVState.getChannels(),ch1=all.find(c=>c.name==='QA Channel 001'),
   ch2=all.find(c=>c.name==='QA Channel 002');
  if(!ch1||!ch2)throw Error('P5.1.145 missing actual QA channels');
  window.__positron145OriginalGuide=window.IPTVExtras.getGuide;
  const now=Date.now(),a='qa145-a',b='qa145-b';
  window.IPTVExtras.getGuide=()=>({names:{[window.IPTVGuide.tidy(ch1.name)]:a,[window.IPTVGuide.tidy(ch2.name)]:b},
   aliasesById:{[a]:[ch1.name],[b]:[ch2.name]},offsetMinutes:0,
   programmes:[
    {id:a,start:now+20*60000,end:now+47*60000,title:'Chương trình hai mươi phút'},
    {id:b,start:now+50*60000,end:now+82*60000,title:'Chương trình năm mươi phút'}
   ]});
  const t=document.getElementById('webChooserSoonOnly');
  t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('webChooserAdvanced').open=true;
  return {sourceCount:window.IPTVState.getStore().channels.length};
 });
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===2,{timeout:5000});
 await page.screenshot({path:path.join(out,'positron-p51145-time-window-before-450-real.png'),animations:'disabled'});
 await page.selectOption('#webChooserSoonWindow','15');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===0,{timeout:5000});
 const noEarly=await page.evaluate(()=>({
  fifteenMinuteWindowEmpty:document.getElementById('webChooserSoonWindow').value==='15'
   &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===0,
  actionableRecovery:!!document.getElementById('poChooserClearFilters'),
  captionMatches15:document.querySelector('label.web-chooser-soon-filter')?.textContent.includes('15 phút')
 }));
 await page.selectOption('#webChooserSoonWindow','30');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 const thirty=await page.evaluate(()=>({
  thirtyMinuteMatchesOnlyOne:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,
  expectedName:document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',
  nextProgrammeFromXmltv:document.querySelector('#webChooserGrid .web-chooser-next-programme')?.textContent.includes('hai mươi phút')===true,
  selectorVisible:getComputedStyle(document.querySelector('.web-chooser-soon-window')).display!=='none',
  captionMatches30:document.querySelector('label.web-chooser-soon-filter')?.textContent.includes('30 phút')
 }));
 await page.evaluate(()=>document.querySelector('#webChooserGrid .web-chooser-next-programme')?.scrollIntoView({block:'center'}));
 await page.screenshot({path:path.join(out,'positron-p51145-time-window-after-450-real.png'),animations:'disabled'});
 await page.selectOption('#webChooserSoonWindow','60');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===2,{timeout:5000});
 const timeWindowQA={...noEarly,...thirty,...await page.evaluate(original=>({
  sixtyMinuteRestoresBoth:document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===2
   &&document.getElementById('webChooserSoonWindow').value==='60',
  localPlaylistUnchanged:window.IPTVState.getStore().channels.length===original.sourceCount,
  noAutoplay:window.IPTVState.getCurrent()===null,
  noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
 }),windowFixture)};
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron145OriginalGuide;
  const t=document.getElementById('webChooserSoonOnly');
  t.checked=false;t.dispatchEvent(new Event('change',{bubbles:true}));
 });
 Object.assign(timeWindowQA,await page.evaluate(()=>({
  durationHiddenWhenOff:document.querySelector('.web-chooser-soon-window').hidden,
  noPlaybackAfterTurnOff:window.IPTVState.getCurrent()===null
 })));
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(timeWindowQA))
  assert.equal(value,true,'P5.1.145 upcoming XMLTV duration '+key+': '+JSON.stringify(timeWindowQA));

 // P5.1.146: programme progress from local XMLTV clock (not real playback).
 await page.click('[data-chooser-layout="grid"]');
 await page.selectOption('#webChooserSort','asc');
 await page.fill('#webChooserSearch','QA Channel 001');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001',{timeout:5000});
 const scheduleProgressFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  if(!ch)throw Error('P5.1.146 missing imported QA channel');
  const now=Date.now(),id='qa146-epg';
  window.__positron146Guide=window.IPTVExtras.getGuide;
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(ch.name)]:id},
   aliasesById:{[id]:[ch.name]},offsetMinutes:0,
   programmes:[
    {id,start:now-15*60000,end:now+15*60000,title:'Bản tin 30 phút QA'},
    {id,start:now+15*60000,end:now+45*60000,title:'Chương trình tiếp theo QA'}
   ]});
  document.getElementById('webChooserAdvanced').open=true;
  return {count:window.IPTVState.getStore().channels.length};
 });
 await page.screenshot({path:path.join(out,'positron-p51146-epg-progress-before-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  const box=document.getElementById('webChooserOnAirOnly');
  box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.waitForFunction(()=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  return card?.querySelector('.web-chooser-onair-programme')?.textContent==='Theo EPG: Bản tin 30 phút QA'
   &&card?.querySelector('.web-chooser-epg-remaining')?.textContent.includes('còn 15 phút');
 },{timeout:5000});
 const scheduleProgressQA=await page.evaluate(original=>{
  const card=document.querySelector('#webChooserGrid button.web-chooser-card');
  const now=card?.querySelector('.web-chooser-onair-programme');
  const track=card?.querySelector('.web-chooser-epg-progress');
  const fill=card?.querySelector('.web-chooser-epg-progress-fill');
  const label=card?.querySelector('.web-chooser-epg-remaining');
  const next=card?.querySelector('.web-chooser-next-programme');
  const percent=parseInt(fill?.style.width||'',10);
  return {
   optedInCurrentEPG:document.getElementById('webChooserOnAirOnly').checked===true,
   percentApproximatelyHalf:percent>=49&&percent<=51,
   showsRemainingMinutes:label?.textContent.includes('còn 15 phút')===true,
   scheduleNotPlayback:label?.textContent.startsWith('Theo lịch EPG: ')===true,
   progressAfterProgramme:track?.getBoundingClientRect().top>=now?.getBoundingClientRect().bottom-2,
   upcomingStillReadable:next?.textContent.includes('Chương trình tiếp theo QA')===true,
   sourcesUnchanged:window.IPTVState.getStore().channels.length===original.count,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },scheduleProgressFixture);
 await page.evaluate(()=>document.querySelector('.web-chooser-epg-progress')?.scrollIntoView({block:'center'}));
 await page.screenshot({path:path.join(out,'positron-p51146-epg-progress-after-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  const box=document.getElementById('webChooserOnAirOnly');
  box.checked=false;box.dispatchEvent(new Event('change',{bubbles:true}));
 });
 Object.assign(scheduleProgressQA,await page.evaluate(()=>({
  noProgressWithoutOptIn:document.querySelectorAll('#webChooserGrid .web-chooser-epg-progress').length===0,
  noPlaybackAfterToggle:window.IPTVState.getCurrent()===null
 })));
 await page.evaluate(()=>{window.IPTVExtras.getGuide=window.__positron146Guide;});
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(scheduleProgressQA))
  assert.equal(value,true,'P5.1.146 XMLTV schedule progress '+key+': '+JSON.stringify(scheduleProgressQA));


 // P5.1.147: explicit future XMLTV reminder on a native channel tile.
 await page.click('[data-chooser-layout="grid"]');
 await page.selectOption('#webChooserSort','asc');
 await page.fill('#webChooserSearch','QA Channel 001');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'
  &&document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1,{timeout:5000});
 const reminderFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  if(!ch)throw Error('P5.1.147 missing native imported QA Channel 001');
  window.__positron147Guide=window.IPTVExtras.getGuide;
  const now=Date.now(),id='qa147-reminder';
  const guide={names:{[window.IPTVGuide.tidy(ch.name)]:id},
   aliasesById:{[id]:[ch.name]},offsetMinutes:0,
   programmes:[{id,start:now+35*60000,end:now+65*60000,title:'Phim nhắc lịch QA'}]};
  window.IPTVExtras.getGuide=()=>guide;
  window.__positron147PreviousAdvanced=localStorage.getItem('open-iptv-pro-advanced-v1');
  const original=JSON.parse(window.__positron147PreviousAdvanced||'{}');
  document.getElementById('webChooserAdvanced').open=true;
  const toggle=document.getElementById('webChooserSoonOnly');
  toggle.checked=true;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  return {sourceCount:window.IPTVState.getStore().channels.length,
   reminderCount:Array.isArray(original.reminders)?original.reminders.length:0};
 });
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-label')?.includes('Phim nhắc lịch QA'),{timeout:5000});
 await page.screenshot({path:path.join(out,'positron-p51147-epg-reminder-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-remind');
 await page.waitForFunction(()=>{
  const rows=JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[];
  return rows.some(r=>r.id.startsWith('qa147-reminder|')&&r.title==='Phim nhắc lịch QA');
 },{timeout:5000});
 const nativeReminderQA=await page.evaluate(original=>{
  const reminders=JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[];
  const native=reminders.filter(r=>r.id.startsWith('qa147-reminder|'));
  return {
   addedOnce:reminders.length===original.reminderCount+1&&native.length===1,
   correctTitle:native[0]?.title==='Phim nhắc lịch QA',
   correctChannel:native[0]?.channel==='QA Channel 001',
   correctFutureStart:native[0]?.start>Date.now(),
   buttonIndependent:document.querySelector('#webChooserGrid .web-chooser-remind')?.parentElement?.classList.contains('web-chooser-card-wrap')===true,
   noAutoplay:window.IPTVState.getCurrent()===null,
   sourcesUnchanged:window.IPTVState.getStore().channels.length===original.sourceCount,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },reminderFixture);
 await page.screenshot({path:path.join(out,'positron-p51147-epg-reminder-after-450-real.png'),animations:'disabled'});
 // P5.1.148 keeps P5.1.147's backend deduplication proof while the
 // user-facing bell now has a stronger reversible toggle action.
 await page.evaluate(()=>{
  const saved=(JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[])
   .find(r=>r.id.startsWith('qa147-reminder|'));
  const channel=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 001');
  window.IPTVProAdvanced.remind({id:'qa147-reminder',title:saved.title,start:saved.start},channel);
 });
 Object.assign(nativeReminderQA,await page.evaluate(original=>({
  noDuplicateReminder:(JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[]).length===original.reminderCount+1,
  duplicateNeverPlays:window.IPTVState.getCurrent()===null
 }),reminderFixture));
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron147Guide;
  const toggle=document.getElementById('webChooserSoonOnly');
  toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  const previous=window.__positron147PreviousAdvanced;
  if(previous===null)localStorage.removeItem('open-iptv-pro-advanced-v1');
  else localStorage.setItem('open-iptv-pro-advanced-v1',previous);
 });
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(nativeReminderQA))
  assert.equal(value,true,'P5.1.147 native XMLTV reminder '+key+': '+JSON.stringify(nativeReminderQA));


 // P5.1.148: newly saved reminders are marked; the same bell removes exactly
 // that reminder on explicit click without affecting playlist or media.
 await page.click('[data-chooser-layout="grid"]');
 await page.fill('#webChooserSearch','QA Channel 002');
 await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===1
  &&document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 002',{timeout:5000});
 const cancelReminderFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 002');
  if(!ch)throw Error('P5.1.148 missing local QA Channel 002');
  window.__positron148Guide=window.IPTVExtras.getGuide;
  window.__positron148Advanced=localStorage.getItem('open-iptv-pro-advanced-v1');
  const now=Date.now(),id='qa148-cancel';
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(ch.name)]:id},aliasesById:{[id]:[ch.name]},
   programmes:[{id,start:now+37*60000,end:now+77*60000,title:'Nhắc lịch có thể hủy QA'}],offsetMinutes:0
  });
  const toggle=document.getElementById('webChooserSoonOnly');
  toggle.checked=true;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('webChooserAdvanced').open=true;
  return {count:window.IPTVState.getStore().channels.length};
 });
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-pressed')==='false',{timeout:5000});
 await page.screenshot({path:path.join(out,'positron-p51148-cancel-reminder-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-remind');
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-pressed')==='true',{timeout:5000});
 const cancelReminderQA=await page.evaluate(original=>({
  savedIndicatorActive:document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-pressed')==='true',
  localSavedOnce:(JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[])
   .filter(r=>r.id.startsWith('qa148-cancel|')).length===1,
  sourcesStillAvailable:window.IPTVState.getStore().channels.length===original.count,
  noAutoplay:window.IPTVState.getCurrent()===null,
  noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
 }),cancelReminderFixture);
 await page.screenshot({path:path.join(out,'positron-p51148-cancel-reminder-after-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-remind');
 Object.assign(cancelReminderQA,await page.evaluate(()=>({
  cancelIndicatorReset:document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-pressed')==='false',
  canceledOnlyMatchingReminder:(JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[])
   .filter(r=>r.id.startsWith('qa148-cancel|')).length===0,
  remainedOnSameChannel:document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 002',
  noPlaybackAfterCancel:window.IPTVState.getCurrent()===null
 })));
 await page.screenshot({path:path.join(out,'positron-p51148-cancel-reminder-canceled-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  window.IPTVExtras.getGuide=window.__positron148Guide;
  const toggle=document.getElementById('webChooserSoonOnly');
  toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  const old=window.__positron148Advanced;
  if(old===null)localStorage.removeItem('open-iptv-pro-advanced-v1');
  else localStorage.setItem('open-iptv-pro-advanced-v1',old);
 });
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(cancelReminderQA))
  assert.equal(value,true,'P5.1.148 Electron cancel reminders '+key+': '+JSON.stringify(cancelReminderQA));


 // P5.1.149: native Electron verifies a user's 30-minute reminder.
 await page.click('[data-chooser-layout="grid"]');
 await page.selectOption('#webChooserSort','asc');
 await page.fill('#webChooserSearch','QA Channel 002');
 const reminderLeadFixture=await page.evaluate(()=>{
  const ch=window.IPTVState.getChannels().find(c=>c.name==='QA Channel 002');
  if(!ch)throw Error('P149 missing local QA channel');
  window.__p149OriginalGuide=window.IPTVExtras.getGuide;
  window.__p149OriginalLead=localStorage.getItem('open-iptv-positron-reminder-lead-v1');
  const start=Date.now()+43*60000,id='qa149-lead';
  window.__p149Start=start;
  window.IPTVExtras.getGuide=()=>({
   names:{[window.IPTVGuide.tidy(ch.name)]:id},aliasesById:{[id]:[ch.name]},
   programmes:[{id,start,end:start+25*60000,title:'Chương trình chọn nhắc QA'}],offsetMinutes:0
  });
  const soon=document.getElementById('webChooserSoonOnly');
  soon.checked=true;soon.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('webChooserAdvanced').open=true;
  return {channels:window.IPTVState.getChannels().length};
 });
 await page.waitForFunction(()=>document.querySelector('#webChooserGrid .web-chooser-remind')!==null,{timeout:5000});
 await page.selectOption('#webChooserReminderLead','30');
 const reminderBeforeQA=await page.evaluate(()=>({
  selectionVisible:document.getElementById('webChooserReminderLead')?.getBoundingClientRect().height>0,
  selectionThirty:document.getElementById('webChooserReminderLead')?.value==='30',
  bellDescribesThirty:document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-label')?.includes('30 phút')===true,
  preferencePersisted:localStorage.getItem('open-iptv-positron-reminder-lead-v1')==='30'
 }));
 for(const [key,value] of Object.entries(reminderBeforeQA))
  assert.equal(value,true,'P149 reminder before '+key+': '+JSON.stringify(reminderBeforeQA));
 await page.screenshot({path:path.join(out,'positron-p51149-reminder-lead-before-450-real.png'),animations:'disabled'});
 await page.click('#webChooserGrid .web-chooser-remind');
 const reminderLeadQA=await page.evaluate(original=>{
  const all=JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').reminders||[];
  const matches=all.filter(r=>r.id==='qa149-lead|'+window.__p149Start);
  return {
   oneReminder:matches.length===1,
   selectedThirtySaved:matches[0]?.leadMinutes===30,
   bellPressed:document.querySelector('#webChooserGrid .web-chooser-remind')?.getAttribute('aria-pressed')==='true',
   playlistUnchanged:window.IPTVState.getChannels().length===original.channels,
   noAutoplay:window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },reminderLeadFixture);
 await page.screenshot({path:path.join(out,'positron-p51149-reminder-lead-after-450-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  window.IPTVProAdvanced.cancelReminder({id:'qa149-lead',start:window.__p149Start});
  window.IPTVExtras.getGuide=window.__p149OriginalGuide;
  const soon=document.getElementById('webChooserSoonOnly');
  soon.checked=false;soon.dispatchEvent(new Event('change',{bubbles:true}));
  const old=window.__p149OriginalLead;
  if(old===null)localStorage.removeItem('open-iptv-positron-reminder-lead-v1');
  else localStorage.setItem('open-iptv-positron-reminder-lead-v1',old);
 });
 await page.fill('#webChooserSearch','');
 for(const [key,value] of Object.entries(reminderLeadQA))
  assert.equal(value,true,'P149 reminder after '+key+': '+JSON.stringify(reminderLeadQA));


 // BẤT BIẾN 22/11/2026: ảnh GIỚI THIỆU desktop Electron thật 1920x1080 16:9.
 // Ảnh hẹp được giữ để phát hiện lỗi responsive, không dùng làm ảnh đại diện.
 const desktopEdition=/P5[.]1[.]([0-9]+)/.exec(require('../package.json').description||'');
 assert.ok(desktopEdition,'Thiếu nhãn P5.1.x để lưu ảnh desktop theo đúng phiên bản');
 const desktopPrefix='positron-p51'+desktopEdition[1];
 const desktop16x9Screenshots=[];
 await page.setViewportSize({width:1920,height:1080});
 for(const [target,slug] of [['tv','trang-chu'],['sources','nguon'],['epg','lich-phat-song'],['fav','yeu-thich']]){
  await page.evaluate(next=>window.IPTVState.setPage(next),target);
  await page.waitForTimeout(100);
  const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
  assert.deepEqual(viewport,{width:1920,height:1080},'Ảnh desktop phải chụp từ viewport 16:9 thật');
  const filename=desktopPrefix+'-desktop-1920x1080-'+slug+'-real.png';
  const bytes=await page.screenshot({path:path.join(out,filename),fullPage:false,animations:'disabled'});
  assert.ok(bytes.length>10000,'Ảnh Electron desktop trống '+filename);
  assert.equal(bytes.readUInt32BE(16),1920,'PNG desktop sai chiều rộng '+filename);
  assert.equal(bytes.readUInt32BE(20),1080,'PNG desktop sai chiều cao '+filename);
  desktop16x9Screenshots.push({page:target,filename,width:1920,height:1080,
   sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
   source:'Electron thật (CDP)',data:'Dữ liệu cục bộ kiểm thử giao diện; không phải xác minh luồng phát thực tế'});
 }
 await page.evaluate(()=>window.IPTVState.setPage('tv'));

 // P5.1.150: desktop real-screenshot feedback from P5.1.149 showed seven
 // successful notices over Favorite/Recent. Reproduce native toast events
 // in a legal local QA fixture, then inspect collapsed/expanded states.
 const toastHistoryFixture=await page.evaluate(()=>{
  const area=document.getElementById('toastArea');
  // Explicitly reproduce the older QA reset that used to detach the toggle.
  area.replaceChildren();
  for(let index=1;index<=7;index++)
   window.IPTVState.toast('Đã hoàn tất thao tác QA '+index);
  window.IPTVState.toast('Cảnh báo QA: kiểm tra nguồn','warn');
  return {channels:window.IPTVState.getChannels().length};
 });
 await page.waitForTimeout(150);
 const toastProbe=await page.evaluate(()=>{
  const area=document.getElementById('toastArea');
  const success=[...area.querySelectorAll(':scope>.toast:not(.warn):not(.err)')];
  const warning=[...area.querySelectorAll(':scope>.toast.warn,:scope>.toast.err')];
  const toggle=area.querySelector('.po-toast-history-toggle');
  return {
   successCount:success.length,warningCount:warning.length,
   successLabels:success.map(n=>n.dataset.poToastMessage),
   toggleExists:!!toggle,toggleText:toggle?.textContent,
   toggleHidden:toggle?.hidden,open:area.classList.contains('po-toast-history-open'),
   directChildren:area.children.length,htmlClass:document.documentElement.className
  };
 });
 console.log('P5.1.150 live toast diagnostic:',JSON.stringify(toastProbe));
 await page.screenshot({path:path.join(out,'positron-p51150-toast-centre-diagnostic-1920x1080-real.png'),animations:'disabled'});
 assert.equal(toastProbe.successCount,7,'P150 native 7 distinct success toasts: '+JSON.stringify(toastProbe));
 assert.equal(toastProbe.toggleExists,true,'P150 companion must mount: '+JSON.stringify(toastProbe));
 assert.equal(toastProbe.toggleText,'Xem thêm 6 thông báo','P150 history control count: '+JSON.stringify(toastProbe));
 const toastHistoryQA=await page.evaluate(expected=>{
  const area=document.getElementById('toastArea');
  const ok=[...area.querySelectorAll(':scope>.toast:not(.warn):not(.err)')];
  const warns=[...area.querySelectorAll(':scope>.toast.warn,:scope>.toast.err')];
  const visibleOk=ok.filter(node=>getComputedStyle(node).display!=='none');
  const history=area.querySelector('.po-toast-history-toggle');
  return {
   sevenNativeSuccesses:ok.length===7,
   onlyLatestSuccessVisible:visibleOk.length===1&&visibleOk[0]===ok[ok.length-1],
   warningsRemainVisible:warns.length===1&&getComputedStyle(warns[0]).display!=='none',
   openButtonAccessible:history?.hidden===false&&history.getAttribute('aria-expanded')==='false',
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   playlistUnchanged:window.IPTVState.getChannels().length===expected.channels
  };
 },toastHistoryFixture);
 await page.screenshot({path:path.join(out,'positron-p51150-toast-centre-collapsed-1920x1080-real.png'),animations:'disabled'});
 await page.click('#toastArea .po-toast-history-toggle');
 Object.assign(toastHistoryQA,await page.evaluate(()=>{
  const area=document.getElementById('toastArea');
  const ok=[...area.querySelectorAll(':scope>.toast:not(.warn):not(.err)')];
  return {
   expandShowsAllSuccesses:ok.length===7&&ok.every(n=>getComputedStyle(n).display!=='none'),
   expandedButtonState:area.querySelector('.po-toast-history-toggle')?.getAttribute('aria-expanded')==='true'
  };
 }));
 await page.screenshot({path:path.join(out,'positron-p51150-toast-centre-before-1920x1080-real.png'),animations:'disabled'});
 await page.screenshot({path:path.join(out,'positron-p51150-toast-centre-expanded-1920x1080-real.png'),animations:'disabled'});
 await page.click('#toastArea .po-toast-history-toggle');
 Object.assign(toastHistoryQA,await page.evaluate(()=>{
  const area=document.getElementById('toastArea');
  const ok=[...area.querySelectorAll(':scope>.toast:not(.warn):not(.err)')];
  return {
   collapseRestoresOne:ok.length===7&&ok.filter(n=>getComputedStyle(n).display!=='none').length===1,
   noAutoplay:window.IPTVState.getCurrent()===null
  };
 }));
 await page.screenshot({path:path.join(out,'positron-p51150-toast-centre-after-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  for(const node of [...document.querySelectorAll('#toastArea>.toast')])
   if(node.dataset.poToastMessage?.includes('QA '))node.remove();
 });
 for(const [key,value] of Object.entries(toastHistoryQA))
  assert.equal(value,true,'P5.1.150 native toast centre '+key+': '+JSON.stringify(toastHistoryQA));


 // P5.1.151: ảnh thật 1920x1080 chứng minh nhật ký thông báo còn sau khi toast gốc tự mất.
 const input151=await page.evaluate(()=>{
  const state=window.IPTVState;
  const channels=state.getChannels().length;
  const idle=state.getCurrent()===null;
  state.toast('QA P151: cập nhật thư viện thành công');
  state.toast('QA P151: nguồn cần kiểm tra','warn');
  state.toast('QA P151: cài đặt đã lưu');
  return {channels,idle};
 });
 await page.waitForTimeout(150);
 const count151=await page.evaluate(()=>({
  button:!!document.getElementById('poArchiveToggle'),
  closed:document.getElementById('poArchivePanel')?.hidden===true,
  count:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent||0)
 }));
 assert.equal(count151.button,true,'P151 no archive button');
 assert.equal(count151.closed,true,'P151 archive must start closed');
 assert.ok(count151.count>=3,'P151 observer missed native messages');
 await page.screenshot({path:path.join(out,'positron-p51151-notification-archive-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveToggle');
 const open151=await page.evaluate(expected=>{
  const nodes=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  const labels=nodes.map(n=>n.textContent);
  return {
   panelOpened:document.getElementById('poArchivePanel')?.hidden===false,
   ariaExpanded:document.getElementById('poArchiveToggle')?.getAttribute('aria-expanded')==='true',
   threeNotices:['cập nhật thư viện thành công','nguồn cần kiểm tra','cài đặt đã lưu'].every(t=>labels.some(x=>x.includes(t))),
   warningRetained:nodes.some(n=>n.classList.contains('po-archive-warn')&&n.textContent.includes('nguồn cần kiểm tra')),
   maxThirty:nodes.length<=30,
   channelsUnchanged:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input151);
 await page.evaluate(()=>{
  for(const node of [...document.querySelectorAll('#toastArea>.toast')])
   if((node.textContent||'').includes('QA P151:'))node.remove();
 });
 await page.waitForTimeout(100);
 const persistent151=await page.evaluate(()=>({
  afterNativeRemoval:[...document.querySelectorAll('#poArchiveEntries .po-archive-item')]
    .filter(n=>n.textContent.includes('QA P151:')).length===3,
  nativeRemoved:![...document.querySelectorAll('#toastArea>.toast')].some(n=>n.textContent.includes('QA P151:'))
 }));
 await page.screenshot({path:path.join(out,'positron-p51151-notification-archive-after-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveClear');
 const clear151=await page.evaluate(()=>({
  emptyList:document.querySelectorAll('#poArchiveEntries .po-archive-item').length===0,
  clearDisabled:document.getElementById('poArchiveClear')?.disabled===true
 }));
 await page.click('#poArchiveClose');
 const closed151=await page.evaluate(()=>({
  panelHidden:document.getElementById('poArchivePanel')?.hidden===true,
  focusRestored:document.activeElement?.id==='poArchiveToggle'
 }));
 const notificationArchiveQA={...open151,...persistent151,...clear151,...closed151};
 for(const [key,value] of Object.entries(notificationArchiveQA))
  assert.equal(value,true,'P151 archive '+key+': '+JSON.stringify(notificationArchiveQA));


 // P5.1.152: QA chụp Electron thật trước/sau khi lọc cảnh báo trong nhật ký.
 const input152=await page.evaluate(()=>{
  const state=window.IPTVState;
  const channels=state.getChannels().length;
  const idle=state.getCurrent()===null;
  state.toast('QA P152: đã lưu cài đặt');
  state.toast('QA P152: kiểm tra kết nối nguồn','warn');
  state.toast('QA P152: thêm kênh thành công');
  return {channels,idle};
 });
 await page.waitForTimeout(120);
 await page.click('#poArchiveToggle');
 const all152=await page.evaluate(()=>{
  const nodes=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {allSelected:document.getElementById('poArchiveFilterAll')?.getAttribute('aria-pressed')==='true',
   allThree:nodes.filter(n=>n.textContent.includes('QA P152:')).length===3,
   ariaGroup:document.querySelector('.po-archive-filters')?.getAttribute('role')==='group'
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51152-alert-filter-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveFilterWarn');
 const warn152=await page.evaluate(expected=>{
  const nodes=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {
   warnPressed:document.getElementById('poArchiveFilterWarn')?.getAttribute('aria-pressed')==='true',
   allUnpressed:document.getElementById('poArchiveFilterAll')?.getAttribute('aria-pressed')==='false',
   onlyWarning:nodes.length===1&&nodes[0].classList.contains('po-archive-warn')&&nodes[0].textContent.includes('QA P152: kiểm tra kết nối nguồn'),
   totalUnchanged:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent)===3,
   playlistIntact:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input152);
 await page.screenshot({path:path.join(out,'positron-p51152-alert-filter-after-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveFilterAll');
 const restore152=await page.evaluate(()=>({
  threeBack:document.querySelectorAll('#poArchiveEntries .po-archive-item').length===3,
  allPressed:document.getElementById('poArchiveFilterAll')?.getAttribute('aria-pressed')==='true'
 }));
 await page.click('#poArchiveClear');await page.click('#poArchiveClose');
 await page.evaluate(()=>{for(const node of [...document.querySelectorAll('#toastArea>.toast')])
  if((node.textContent||'').includes('QA P152:'))node.remove();});
 const alertFilterQA={...all152,...warn152,...restore152};
 for(const [key,value] of Object.entries(alertFilterQA))
  assert.equal(value,true,'P152 filter '+key+': '+JSON.stringify(alertFilterQA));


 // P5.1.153: tìm kiếm tiếng Việt không dấu bằng thao tác bàn phím thật.
 const input153=await page.evaluate(()=>{
  const state=window.IPTVState;
  const channels=state.getChannels().length;
  const idle=state.getCurrent()===null;
  state.toast('QA P153: Đã kết nối nguồn thành công');
  state.toast('QA P153: Dữ liệu cần kiểm tra','warn');
  state.toast('QA P153: Cập nhật đã lưu');
  return {channels,idle};
 });
 await page.waitForTimeout(125);
 await page.click('#poArchiveToggle');
 const all153=await page.evaluate(()=>{
  const items=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {threeEntries:items.filter(x=>x.textContent.includes('QA P153:')).length===3,
   inputAccessible:document.getElementById('poArchiveSearch')?.getAttribute('aria-label')==='Tìm kiếm thông báo',
   searchStartsEmpty:document.getElementById('poArchiveSearch')?.value===''
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51153-notice-search-before-1920x1080-real.png'),animations:'disabled'});
 await page.fill('#poArchiveSearch','ket noi');
 const filtered153=await page.evaluate(expected=>{
  const nodes=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {
   noAccentSearch:nodes.length===1&&nodes[0].textContent.includes('Đã kết nối nguồn'),
   clearButtonVisible:document.getElementById('poArchiveSearchClear')?.hidden===false,
   totalThree:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent)===3,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   channelsIntact:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null
  };
 },input153);
 await page.screenshot({path:path.join(out,'positron-p51153-notice-search-after-1920x1080-real.png'),animations:'disabled'});
 await page.fill('#poArchiveSearch','khong-co-thong-bao');
 const zero153=await page.evaluate(()=>({
  emptyHint:document.querySelector('#poArchiveEntries .po-archive-empty')?.textContent.includes('Không tìm thấy'),
  stillThree:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent)===3
 }));
 await page.click('#poArchiveSearchClear');
 const reset153=await page.evaluate(()=>({
  queryEmpty:document.getElementById('poArchiveSearch')?.value==='',
  clearedAll:document.querySelectorAll('#poArchiveEntries .po-archive-item').length===3,
  focusBack:document.activeElement?.id==='poArchiveSearch'
 }));
 await page.click('#poArchiveClear');await page.click('#poArchiveClose');
 await page.evaluate(()=>{for(const node of [...document.querySelectorAll('#toastArea>.toast')])
  if((node.textContent||'').includes('QA P153:'))node.remove();});
 const noticeSearchQA={...all153,...filtered153,...zero153,...reset153};
 for(const [key,value] of Object.entries(noticeSearchQA))
  assert.equal(value,true,'P153 search '+key+': '+JSON.stringify(noticeSearchQA));


 // P5.1.154: không làm phiền cho banner thành công, nhưng vẫn lưu nội dung trong nhật ký.
 const input154=await page.evaluate(()=>{
  const state=window.IPTVState;
  const channels=state.getChannels().length;
  const idle=state.getCurrent()===null;
  state.toast('QA P154: Đồng bộ thành công');
  state.toast('QA P154: Đã lưu cài đặt');
  state.toast('QA P154: Cảnh báo kiểm tra nguồn','warn');
  return {channels,idle};
 });
 await page.waitForTimeout(120);
 await page.click('#poArchiveToggle');
 const before154=await page.evaluate(()=>{
  const success=[...document.querySelectorAll('#toastArea>.toast:not(.warn):not(.err)')];
  const warnings=[...document.querySelectorAll('#toastArea>.toast.warn')];
  return {
   quietOff:document.getElementById('poArchiveQuiet')?.getAttribute('aria-pressed')==='false',
   atLeastOneSuccess:success.some(n=>getComputedStyle(n).display!=='none'),
   warningVisible:warnings.some(n=>getComputedStyle(n).display!=='none'),
   archiveHasAll:[...document.querySelectorAll('#poArchiveEntries .po-archive-item')]
     .filter(n=>n.textContent.includes('QA P154:')).length===3
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51154-quiet-mode-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveQuiet');
 const after154=await page.evaluate(expected=>{
  const success=[...document.querySelectorAll('#toastArea>.toast:not(.warn):not(.err)')];
  const warnings=[...document.querySelectorAll('#toastArea>.toast.warn')];
  return {
   quietOn:document.getElementById('poArchiveQuiet')?.getAttribute('aria-pressed')==='true',
   rootHasQuiet:document.documentElement.classList.contains('po-toast-quiet'),
   successSuppressed:success.length>=2&&success.every(n=>getComputedStyle(n).display==='none'),
   warningStillVisible:warnings.some(n=>getComputedStyle(n).display!=='none'),
   historyRetained:[...document.querySelectorAll('#poArchiveEntries .po-archive-item')]
     .filter(n=>n.textContent.includes('QA P154:')).length===3,
   countUnchanged:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent)===3,
   channelsSafe:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input154);
 await page.screenshot({path:path.join(out,'positron-p51154-quiet-mode-after-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveQuiet');
 const reset154=await page.evaluate(()=>({
  quietOffAgain:document.getElementById('poArchiveQuiet')?.getAttribute('aria-pressed')==='false',
  classRemoved:!document.documentElement.classList.contains('po-toast-quiet')
 }));
 await page.click('#poArchiveClear');await page.click('#poArchiveClose');
 await page.evaluate(()=>{for(const node of [...document.querySelectorAll('#toastArea>.toast')])
  if((node.textContent||'').includes('QA P154:'))node.remove();});
 const quietModeQA={...before154,...after154,...reset154};
 for(const [key,value] of Object.entries(quietModeQA))
  assert.equal(value,true,'P154 quiet mode '+key+': '+JSON.stringify(quietModeQA));


 // P5.1.155: người dùng dọn banner nổi, các thông báo vẫn còn trong nhật ký.
 const input155=await page.evaluate(()=>{
  const state=window.IPTVState;
  const channels=state.getChannels().length;
  const idle=state.getCurrent()===null;
  state.toast('QA P155: Đã lưu hồ sơ');
  state.toast('QA P155: Cảnh báo nguồn phụ','warn');
  state.toast('QA P155: Cập nhật danh sách thành công');
  return {channels,idle};
 });
 await page.waitForTimeout(140);
 await page.click('#poArchiveToggle');
 const before155=await page.evaluate(()=>{
  const items=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {
   dismissButton:!!document.getElementById('poArchiveDismissVisible'),
   activeOverlays:[...document.querySelectorAll('#toastArea>.toast')].some(n=>(n.textContent||'').includes('QA P155:')),
   hasThreeInHistory:items.filter(n=>n.textContent.includes('QA P155:')).length===3
  };
 });
 await page.screenshot({path:path.join(out,'positron-p51155-dismiss-toasts-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveDismissVisible');
 const after155=await page.evaluate(expected=>{
  const items=[...document.querySelectorAll('#poArchiveEntries .po-archive-item')];
  return {
   noFloatingToasts:document.querySelectorAll('#toastArea>.toast').length===0,
   allHistoryRetained:items.filter(n=>n.textContent.includes('QA P155:')).length===3,
   badgeStillThree:Number(document.querySelector('#poArchiveToggle .po-archive-count')?.textContent)===3,
   focusedButton:document.activeElement?.id==='poArchiveDismissVisible',
   channelsSafe:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input155);
 await page.screenshot({path:path.join(out,'positron-p51155-dismiss-toasts-after-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poArchiveClear');await page.click('#poArchiveClose');
 const dismissToastQA={...before155,...after155};
 for(const [key,value] of Object.entries(dismissToastQA))
  assert.equal(value,true,'P155 dismiss '+key+': '+JSON.stringify(dismissToastQA));


 // P5.1.156: Library Pulse chỉ đọc, ảnh Electron 16:9.
 const baseline156=await page.evaluate(()=>{
  const state=window.IPTVState,core=window.PositronLibraryPulseCore;
  const summary=core?.summarize(state.getChannels());
  return {summary,channels:state.getChannels().length,idle:state.getCurrent()===null};
 });
 const before156=await page.evaluate(()=>({
  togglePresent:!!document.getElementById('poLibraryPulseToggle'),
  panelInitiallyHidden:document.getElementById('poLibraryPulsePanel')?.hidden===true,
  noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
 }));
 await page.screenshot({path:path.join(out,'positron-p51156-library-pulse-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poLibraryPulseToggle');
 const open156=await page.evaluate(expected=>{
  const panel=document.getElementById('poLibraryPulsePanel');
  const cards=[...panel.querySelectorAll('.po-pulse-card strong')].map(n=>Number(n.textContent));
  const tracks=[...panel.querySelectorAll('.po-pulse-ratio strong')].map(n=>n.textContent);
  return {
   panelOpen:panel?.hidden===false,
   expanded:document.getElementById('poLibraryPulseToggle')?.getAttribute('aria-expanded')==='true',
   fourCards:cards.length===4,
   totalCorrect:cards[0]===expected.summary.total&&cards[0]===expected.channels,
   sourcesCorrect:cards[1]===expected.summary.sources,
   groupsCorrect:cards[2]===expected.summary.groups,
   healthNotGuessed:cards[3]===expected.summary.knownAlive,
   logoRatio:tracks[0]===expected.summary.withLogoMeta+' / '+expected.summary.total,
   epgRatio:tracks[1]===expected.summary.withEpgId+' / '+expected.summary.total,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   playlistUnchanged:window.IPTVState.getChannels().length===expected.channels,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null
  };
 },baseline156);
 await page.click('#poLibraryPulseRefresh');
 const refresh156=await page.evaluate(()=>({
  refreshFocused:document.activeElement?.id==='poLibraryPulseRefresh',
  stampShown:document.getElementById('poLibraryPulseStamp')?.textContent.includes('Cập nhật lúc')
 }));
 await page.screenshot({path:path.join(out,'positron-p51156-library-pulse-after-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('Escape');
 const exit156=await page.evaluate(()=>({
  panelClosed:document.getElementById('poLibraryPulsePanel')?.hidden===true,
  ariaRestored:document.getElementById('poLibraryPulseToggle')?.getAttribute('aria-expanded')==='false',
  focusRestored:document.activeElement?.id==='poLibraryPulseToggle'
 }));
 const libraryPulseQA={...before156,...open156,...refresh156,...exit156};
 for(const [name,value] of Object.entries(libraryPulseQA))
  assert.equal(value,true,'P156 library pulse '+name+': '+JSON.stringify(libraryPulseQA));


 // P5.1.157: kênh theo nhóm trên Electron thật, cùng metadata như phiên bản trước.
 const input157=await page.evaluate(()=>{
  const state=window.IPTVState,core=window.PositronLibraryPulseCore;
  return {summary:core.summarize(state.getChannels()),
   channels:state.getChannels().length,idle:state.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51157-groups-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poLibraryPulseToggle');
 const initial157=await page.evaluate(expected=>{
  const rows=[...document.querySelectorAll('#poLibraryPulseGroups .po-pulse-group')];
  const top=expected.summary.groupBreakdown;
  return {
   heading:document.getElementById('poLibraryPulseGroupsTitle')?.textContent==='Phân bố kênh theo nhóm',
   topFive:rows.length===Math.min(5,top.length),
   sorted:rows.every((row,i)=>row.querySelector('.po-pulse-group-name')?.textContent===top[i].name&&
    Number(row.querySelector('strong')?.textContent)===top[i].count),
   expandable:document.getElementById('poLibraryPulseMoreGroups')?.hidden===(top.length<=5),
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input157);
 if(input157.summary.groupBreakdown.length>5)await page.click('#poLibraryPulseMoreGroups');
 const expanded157=await page.evaluate(expected=>{
  const top=expected.summary.groupBreakdown,rows=[...document.querySelectorAll('#poLibraryPulseGroups .po-pulse-group')];
  return {
   secondPage:rows.length===Math.min(top.length,10),
   expanded:document.getElementById('poLibraryPulseMoreGroups')?.getAttribute('aria-expanded')===(top.length>5?'true':'false'),
   match:rows.every((row,i)=>row.querySelector('.po-pulse-group-name')?.textContent===top[i].name),
   notAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   channelsSafe:window.IPTVState.getChannels().length===expected.channels,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input157);
 await page.screenshot({path:path.join(out,'positron-p51157-groups-after-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('Escape');
 const closed157=await page.evaluate(()=>({
  panelHidden:document.getElementById('poLibraryPulsePanel')?.hidden===true,
  focusRestored:document.activeElement?.id==='poLibraryPulseToggle'
 }));
 const groupDistributionQA={...initial157,...expanded157,...closed157};
 for(const [key,value] of Object.entries(groupDistributionQA))
  assert.equal(value,true,'P157 group distribution '+key+': '+JSON.stringify(groupDistributionQA));


 // P5.1.158: từ ảnh P157 thấy thiếu logo 561/561; cho xem danh sách và phân trang.
 const input158=await page.evaluate(()=>{
  const channels=window.IPTVState.getChannels(),core=window.PositronLibraryPulseCore;
  return {missing:core.missingLogos(channels,{offset:0,limit:10}),
   second:core.missingLogos(channels,{offset:10,limit:10}),
   channelCount:channels.length,idle:window.IPTVState.getCurrent()===null};
 });
 await page.screenshot({path:path.join(out,'positron-p51158-missing-logos-before-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poLibraryPulseToggle');
 await page.click('#poLibraryMissingToggle');
 const pageOne158=await page.evaluate(expected=>{
  const rows=[...document.querySelectorAll('#poLibraryMissingRows .po-pulse-missing-row')];
  return {
   visible:document.getElementById('poLibraryMissingBody')?.hidden===false,
   expanded:document.getElementById('poLibraryMissingToggle')?.getAttribute('aria-expanded')==='true',
   totalLabel:document.getElementById('poLibraryMissingToggle')?.textContent.endsWith(String(expected.missing.total)),
   rightFirstPage:rows.length===expected.missing.rows.length&&rows.every((r,i)=>
    r.querySelector('strong')?.textContent===expected.missing.rows[i].name),
   navFirst:document.getElementById('poLibraryMissingPage')?.textContent.startsWith('Trang 1 /'),
   prevDisabled:document.getElementById('poLibraryMissingPrev')?.disabled===true,
   nextEnabled:document.getElementById('poLibraryMissingNext')?.disabled===false,
   channelsSafe:window.IPTVState.getChannels().length===expected.channelCount,
   noAutoplay:!expected.idle||window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input158);
 await page.click('#poLibraryMissingNext');
 const pageTwo158=await page.evaluate(expected=>{
  const rows=[...document.querySelectorAll('#poLibraryMissingRows .po-pulse-missing-row')];
  return {
   rightSecondPage:rows.length===expected.second.rows.length&&rows.every((r,i)=>
    r.querySelector('strong')?.textContent===expected.second.rows[i].name),
   navSecond:document.getElementById('poLibraryMissingPage')?.textContent.startsWith('Trang 2 /'),
   prevEnabled:document.getElementById('poLibraryMissingPrev')?.disabled===false,
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },input158);
 await page.screenshot({path:path.join(out,'positron-p51158-missing-logos-after-1920x1080-real.png'),animations:'disabled'});
 await page.click('#poLibraryMissingPrev');
 const back158=await page.evaluate(expected=>({
  firstPageBack:document.getElementById('poLibraryMissingPage')?.textContent.startsWith('Trang 1 /'),
  noPlaylistMutation:window.IPTVState.getChannels().length===expected.channelCount
 }),input158);
 await page.keyboard.press('Escape');
 const closed158=await page.evaluate(()=>({
  panelHidden:document.getElementById('poLibraryPulsePanel')?.hidden===true,
  focusRestored:document.activeElement?.id==='poLibraryPulseToggle'
 }));
 const logoMissingQA={...pageOne158,...pageTwo158,...back158,...closed158};
 for(const [name,value] of Object.entries(logoMissingQA))
  assert.equal(value,true,'P158 missing logos '+name+': '+JSON.stringify(logoMissingQA));

 // P5.1.159: CHỈ sau dữ liệu QA P158 (561 kênh), desktop 16:9 chuẩn.
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.IPTVState.setPage('tv'));
 await page.waitForTimeout(100);
 const preflight159=await page.evaluate(()=>({
  width:innerWidth,height:innerHeight,
  channels:window.IPTVState.getChannels().length,
  missing:window.PositronLibraryPulseCore.missingLogos(window.IPTVState.getChannels()).total,
  searched:window.PositronLibraryPulseCore.missingLogos(window.IPTVState.getChannels(),{query:'QA Channel 005'}).total
 }));
 assert.deepEqual([preflight159.width,preflight159.height],[1920,1080],'P159 viewport sai 16:9');
 assert.ok(preflight159.channels>=100&&preflight159.missing>=10&&preflight159.searched>=1,
  'P159 thiếu playlist QA thật từ vòng P158: '+JSON.stringify(preflight159));
 const beforeP159=await page.screenshot({path:path.join(out,'positron-p51159-search-missing-before-1920x1080-real.png'),animations:'disabled'});
 assert.deepEqual([beforeP159.readUInt32BE(16),beforeP159.readUInt32BE(20)],[1920,1080],'PNG TRƯỚC P159 không phải 1920x1080');
 await page.click('#poLibraryPulseToggle');
 // P158 đã mở mục này; tránh click lần nữa gây ẩn ô tìm kiếm.
 if(await page.getAttribute('#poLibraryMissingToggle','aria-expanded')!=='true')
  await page.click('#poLibraryMissingToggle');
 await page.locator('#poLibraryMissingSearch').waitFor({state:'visible'});
 const before159=await page.evaluate(()=>({
  expected:window.PositronLibraryPulseCore.missingLogos(window.IPTVState.getChannels(),{query:'QA Channel 005'}),
  total:window.IPTVState.getChannels().length,missingTotal:window.PositronLibraryPulseCore.missingLogos(window.IPTVState.getChannels()).total,idle:window.IPTVState.getCurrent()===null
 }));
 await page.fill('#poLibraryMissingSearch','QA Channel 005');
 const found159=await page.evaluate(x=>{
  const rows=[...document.querySelectorAll('#poLibraryMissingRows .po-pulse-missing-row')];
  return {
   searchVisible:document.getElementById('poLibraryMissingSearch')?.offsetWidth>50,
   match:rows.length===x.expected.rows.length&&rows.every((r,i)=>r.querySelector('strong')?.textContent===x.expected.rows[i].name),
   count:document.getElementById('poLibraryMissingToggle')?.textContent.endsWith(String(x.expected.total)),
   onePage:document.getElementById('poLibraryMissingPage')?.textContent==='Trang 1 / 1',
   nextDisabled:document.getElementById('poLibraryMissingNext')?.disabled===true,
   unchanged:window.IPTVState.getChannels().length===x.total,
   noAutoplay:!x.idle||window.IPTVState.getCurrent()===null,
   noOverflow:document.documentElement.scrollWidth<=innerWidth+1
  };
 },before159);
 const afterP159=await page.screenshot({path:path.join(out,'positron-p51159-search-missing-after-1920x1080-real.png'),animations:'disabled'});
 assert.deepEqual([afterP159.readUInt32BE(16),afterP159.readUInt32BE(20)],[1920,1080],'PNG SAU P159 không phải 1920x1080');
 await page.fill('#poLibraryMissingSearch','khong co 1234');
 const empty159=await page.evaluate(()=>({
  empty:document.querySelector('#poLibraryMissingRows .po-pulse-missing-empty')?.textContent==='Không tìm thấy kênh phù hợp.',
  zero:document.getElementById('poLibraryMissingToggle')?.textContent.endsWith(': 0'),
  disabled:document.getElementById('poLibraryMissingNext')?.disabled===true
 }));
 await page.fill('#poLibraryMissingSearch','');
 const cleared159=await page.evaluate(x=>({
  restored:document.querySelectorAll('#poLibraryMissingRows .po-pulse-missing-row').length===Math.min(10,x.total),
  pagination:document.getElementById('poLibraryMissingPage')?.textContent==='Trang 1 / '+Math.max(1,Math.ceil(x.missingTotal/10))
 }),before159);
 await page.keyboard.press('Escape');
 const closed159=await page.evaluate(()=>({
  closed:document.getElementById('poLibraryPulsePanel')?.hidden===true,
  focusReturned:document.activeElement?.id==='poLibraryPulseToggle'
 }));
 const missingSearchQA={...found159,...empty159,...cleared159,...closed159};
 for(const [key,value] of Object.entries(missingSearchQA))
  assert.equal(value,true,'P159 missing logo search '+key+': '+JSON.stringify(missingSearchQA));


 await page.setViewportSize({width:1360,height:820});
  const report={type:'Positron P5 twenty distinct desktop screenshot cases',realElectron:true,syntheticChannels:false,
  screenshotCount:results.length,upgradeChecks:20,previousP4Checks:50,rounds:results,desktop16x9Screenshots,metadataQa,watchFlowQa,watchFlowPlusQa:plusQA,chooserQa,toastLayoutQA,nativeToastQA,compactIdleQA,channelChipRailQA,advancedFilterQA,readableCardsQA,keyboardTabQA,favoriteEmptyQA,duplicateEmptyQA,categoryFilterQA,categoryFixtureQA,compactSingleQA,directFavoriteQA,favoriteCountQA,compactToastStackQA,toastDismissQA,toastFocusReturnQA,toastDockQA,wheelQA,pinnedAllQA,pinnedMaskQA,categoryKeyQA,dropdownChipQA,pinnedRightMaskQA,pinnedBorderMaskQA,asciiDSearchQA,emptySearchActionQA,readableCardTitleQA,favoriteSvgQA,keyboardFavoriteQA,multiTermSearchQA,keyboardSearchQA,arrowNavigationQA,pageNavigationQA,favoriteSortQA,onAirFilterQA,programmeSearchQA,upcomingProgrammeQA,soonProgrammeQA,earliestEpgSortQA,timeWindowQA,scheduleProgressQA:scheduleProgressQA,nativeReminderQA,cancelReminderQA,reminderLeadQA,toastHistoryQA,notificationArchiveQA,alertFilterQA,noticeSearchQA,quietModeQA,dismissToastQA,libraryPulseQA,groupDistributionQA,logoMissingQA,missingSearchQA};
 fs.writeFileSync(path.resolve('positron-evidence','audit-p5-20-rounds.json'),JSON.stringify(report,null,2));
 return report;
}
module.exports={runTwenty};
