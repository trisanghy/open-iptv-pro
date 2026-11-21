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
    controls:document.querySelectorAll('#page-tv button').length,
    transportVectors:['prevBtn','stopBtn','nextBtn','fsPrev','fsNext','fullscreenBtn'].every(id=>!!document.getElementById(id)?.querySelector('svg')),
    brandIcon:get('#appSidebar .brand-icon'),
    heading:(()=>{const n=document.querySelector('#positronBar .p-heading strong');if(!n)return null;const b=n.getBoundingClientRect();return {shortTitle:n.dataset.shortTitle||'',clipped:n.scrollWidth>n.clientWidth+1,width:Math.round(b.width)};})(),
    badge:(()=>{const n=document.querySelector('#appSidebar .brand small');if(!n)return null;const b=n.getBoundingClientRect();return {visible:b.width>0&&b.height>0,clipped:n.scrollWidth>n.clientWidth+1,right:b.right,top:b.top,bottom:b.bottom};})(),
    toggle:(()=>{const n=document.querySelector('#appSidebar .sidebar-edge-toggle');if(!n)return null;const b=n.getBoundingClientRect();return {left:b.left,top:b.top,bottom:b.bottom};})(),
    doctorSourceAction:get('#positronDoctorSources'),
     doctorEmptyVisible:(()=>{const n=document.getElementById('positronDoctorEmptyHint');return !!n&&!n.hidden;})(),
     navCount:document.getElementById('navCount')?.textContent?.trim()||'0',
     sidebarStatus:(()=>{const n=document.getElementById('miniStatus');if(!n)return null;const s=getComputedStyle(n),r=n.getBoundingClientRect();return{visible:r.width>0&&r.height>0,whiteSpace:s.whiteSpace,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,title:n.title,text:n.textContent||''};})(),
     searchButton:(()=>{const n=document.getElementById('positronOpen'),label=n?.querySelector('.p-command-label');if(!n)return null;return{svg:!!n.querySelector('svg'),label:label?.textContent||'',labelClipped:!!(label&&label.getClientRects().length&&label.scrollWidth>label.clientWidth+1),aria:n.getAttribute('aria-label')};})(),
     epgNext:(()=>{const n=document.getElementById('epgNextName');if(!n)return null;const s=getComputedStyle(n);return {whiteSpace:s.whiteSpace,textOverflow:s.textOverflow,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth,height:Math.round(n.getBoundingClientRect().height)};})(),
     favoriteAction:get('#positronFavoritesSources'),
     favoriteGuidance:(()=>document.querySelector('#favoriteList .empty-list')?.firstChild?.textContent?.trim()||'')(),
     sourceCount:document.getElementById('sourceCount')?.textContent?.trim()||'0',
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
     smartLimit:(()=>{const n=document.getElementById('smartLimit');if(!n)return null;
       const label=n.selectedOptions?.[0]?.textContent?.trim()||'';
       const c=document.createElement('canvas').getContext('2d');
       c.font=getComputedStyle(n).font;
       return {value:n.value,label,textWidth:Math.ceil(c.measureText(label).width),controlWidth:n.clientWidth};})(),
     themeButton:(()=>{const n=document.getElementById('positronStudioBtn');if(!n)return null;const b=n.getBoundingClientRect(),s=getComputedStyle(n),p=getComputedStyle(n,'::before');return{width:Math.round(b.width),fontSize:s.fontSize,pseudoContent:p.content,ariaLabel:n.getAttribute('aria-label'),title:n.title};})(),
     searchShortcut:document.getElementById('searchBox')?.getAttribute('aria-keyshortcuts'),
    stage:document.documentElement.dataset.p20Stage};
  });
  assert.equal(metrics.page,'page-'+target);
  assert.equal(metrics.stage,String(round));
  assert.ok(metrics.sidebar&&metrics.sidebar.width<=285,'sidebar overflow: '+name);
  assert.ok(metrics.controls>=8,'native player controls missing');
  if(target==='tv'){
   assert.ok(metrics.player?.width>180&&metrics.player.height>100,'video collapsed: '+name);
   assert.equal(metrics.transportVectors,true,'non-vector transport icons: '+name);
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
    assert.ok(metrics.themeButton,'theme control missing: '+name);
    assert.equal(metrics.themeButton.fontSize,'0px','theme label visible in compact toolbar: '+name);
    assert.ok(metrics.themeButton.width<=46,'theme button exceeds compact width: '+name);
    assert.equal(metrics.themeButton.pseudoContent,'"◈"','single theme icon missing: '+name);
    assert.ok(metrics.themeButton.ariaLabel&&metrics.themeButton.title,'icon requires accessible label and tooltip: '+name);
   }
   if(width>=901&&metrics.sidebarStatus?.visible){
    assert.equal(metrics.sidebarStatus.whiteSpace,'normal','side FFmpeg status still forcibly ellipsized: '+name);
    assert.ok(metrics.sidebarStatus.scrollHeight<=metrics.sidebarStatus.clientHeight+2,'side FFmpeg status vertically clipped: '+name);
    assert.equal(metrics.sidebarStatus.title,metrics.sidebarStatus.text,'side status tooltip must update with current state: '+name);
   }
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
   if(target==='sources'&&metrics.sources)assert.notEqual(metrics.sources.background,'rgb(255, 255, 255)','white source panel');
  if(target==='sources'&&width<=720){
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
   if(target==='epg'&&metrics.epg)assert.notEqual(metrics.epg.background,'rgb(255, 255, 255)','white EPG search');
  if(target==='tv')assert.equal(metrics.searchShortcut,'/');
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
 const report={type:'Positron P5 twenty distinct desktop screenshot cases',realElectron:true,syntheticChannels:false,
  screenshotCount:results.length,upgradeChecks:20,previousP4Checks:50,rounds:results};
 fs.writeFileSync(path.resolve('positron-evidence','audit-p5-20-rounds.json'),JSON.stringify(report,null,2));
 return report;
}
module.exports={runTwenty};
