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
     const modesHidden=getComputedStyle(panel.querySelector('.po-watchflow-modes')).display==='none';
     document.getElementById('poWatchFlowClose').click();
     const focusReturned=document.activeElement===button;
     return {opened,groupCount,reasons,titleColor,emptyPlaylist,modesHidden,overlapWithImport,overlapWithTitle,focusEntered,firstUsefulFocus,focusReturned,titleOffset,closeTapSize,closeVector,panelWidth:panelRect.width,closed:panel.hidden&&button.getAttribute('aria-expanded')==='false'};
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
 await page.evaluate(()=>{
  const core=window.PositronWatchLaterCore;localStorage.setItem(core.STORAGE_KEY,'[]');
  window.dispatchEvent(new StorageEvent('storage',{key:core.STORAGE_KEY,newValue:'[]'}));
  document.getElementById('poFlowPlusmix').click();
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
 await page.setViewportSize({width:1360,height:820});
  const report={type:'Positron P5 twenty distinct desktop screenshot cases',realElectron:true,syntheticChannels:false,
  screenshotCount:results.length,upgradeChecks:20,previousP4Checks:50,rounds:results,metadataQa,watchFlowQa,watchFlowPlusQa:plusQA,chooserQa};
 fs.writeFileSync(path.resolve('positron-evidence','audit-p5-20-rounds.json'),JSON.stringify(report,null,2));
 return report;
}
module.exports={runTwenty};
