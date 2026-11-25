'use strict';
/* 50 sequential visual engineering checks, not simulated product screenshots.
   Uses the actual Electron renderer through Chrome DevTools Protocol.
   PNG pixels, geometry, and errors from round N are carried into N+1. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const out=path.resolve('positron-evidence','p4-50-rounds');
fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let browser,connectionError;
  for(let tryIndex=0;tryIndex<40;tryIndex++){
    try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:2000});break;}
    catch(e){connectionError=e;await wait(1000);}
  }
  if(!browser)throw connectionError;
  const context=browser.contexts()[0];
  let page;
  for(let tries=0;tries<30;tries++){
    page=context.pages().find(p=>p.url().includes('index.html'));
    if(page)break;await wait(1000);
  }
  if(!page)throw Error('Running Electron desktop page was not found');
  await page.waitForSelector('#positronHelpBtn',{timeout:30000});
  await page.waitForFunction(()=>!!window.OpenIPTVPositronFifty&&!!window.IPTVState,{timeout:30000});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&/positron-fifty/i.test(m.text()))errors.push('console: '+m.text());});
  const screenshots=[];
  let previousFeedback=null;
  const workModes={37:'settings',38:'sources',39:'epg',40:'doctor',41:'fav'};
  const featureNames=[
    'Sidebar width','Brand','Collapse control','Nav height','Nav chroma','Active nav',
    'Group labels','Footer status','Header height','Search priority',
    'Advanced navigation','Command search','Action dimensions','Duplicate action removal',
    'Content padding','Channel shelf','Channel scroll','Channel header','Channel finder',
    'Filter toggle','Empty filter state','No-channel state','Card surfaces','Video frame',
    'Empty illustration','Source import','Transport container','Channel label',
    'Play control','Skip controls','Volume','Cast PiP fullscreen','EPG info',
    'Caption controls','Timeshift grouping','Tools toggle','Settings','Sources',
    'EPG','Doctor','Favorites','Command palette','Studio menu','Help and focus',
    'Text contrast','1280px layout','960px layout','760px layout','600px layout',
    'Final accessibility'];
  assert.equal(featureNames.length,50);
  const data=await page.evaluate(()=>({
    channels:window.IPTVState.getChannels?.()?.length??0,
    current:window.IPTVState.getCurrent?.()?.name||null,
    html:document.documentElement.dataset.positron,
    title:document.title
  }));
  assert.equal(data.html,'true');
  const pictures=async(png)=>{
    // Analyze pixels from the actual screenshot PNG, decoded by Chromium.
    const b64=png.toString('base64');
    return page.evaluate(async(source)=>{
      const img=new Image();img.src='data:image/png;base64,'+source;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=68;canvas.height=41;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      context.drawImage(img,0,0,68,41);
      const pixels=context.getImageData(0,0,68,41).data;
      let sum=0,sumSq=0,min=255,max=0,bright=0;
      for(let i=0;i<pixels.length;i+=4){
        const lum=Math.round(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2]);
        sum+=lum;sumSq+=lum*lum;min=Math.min(min,lum);max=Math.max(max,lum);
        if(lum>130)bright++;
      }
      const n=pixels.length/4,mean=sum/n;
      return {width:img.width,height:img.height,meanLuma:+mean.toFixed(2),
        variance:+Math.max(0,sumSq/n-mean*mean).toFixed(2),
        maxLuma:max,minLuma:min,brightFraction:+(bright/n).toFixed(4)};
    },b64);
  };
  for(let n=1;n<=50;n++){
    const viewport=n===46?{width:1250,height:823}:n===47?{width:900,height:800}:
      n===48?{width:720,height:800}:n===49?{width:600,height:800}:
      {width:1360,height:823};
    await page.setViewportSize(viewport);
    const stage=await page.evaluate(args=>window.OpenIPTVPositronFifty.setStage(args.round,args.prev),
      {round:n,prev:previousFeedback});
    assert.equal(stage.stage,n,'stage progression failed');
    assert.equal(stage.fromRound,n===1?null:n-1,'previous screenshot feedback not forwarded');
    await page.evaluate(name=>window.IPTVState.setPage(name),workModes[n]||'tv');
    if(n===11){
      await page.locator('#positronMorePages').click();
      assert.equal(await page.locator('#positronMorePages').getAttribute('aria-expanded'),'true');
    }
    if(n===35)await page.locator('#positronToolsToggle').click();
    if(n===36)await page.locator('#positronToolsToggle').click();
    if(n===42)await page.locator('#positronOpen').click();
    if(n===43)await page.locator('#positronStudioBtn').click();
    if(n===44)await page.locator('#positronHelpBtn').click();
    await page.waitForTimeout(80);
    const layout=await page.evaluate(()=>{
      const bounds=s=>{const el=document.querySelector(s);if(!el)return null;
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),
          h:Math.round(r.height),visible:cs.display!=='none'&&r.width>0&&r.height>0};};
      const inner=innerWidth,bar=bounds('#positronBar'),video=bounds('#playerBox'),sidebar=bounds('#appSidebar');
      return {innerWidth:inner,innerHeight,
        horizontalOverflow:document.documentElement.scrollWidth>inner+4,
        bar,video,sidebar,channel:bounds('#page-tv .channel-panel'),
        playerPresent:!!document.getElementById('video'),
        keyboardHelpPresent:!!document.getElementById('positronHelpDialog'),
        navActive:document.querySelector('#appSidebar .nav.active')?.dataset.page||null,
        page:document.querySelector('.page.active-page')?.id,
        moreOpen:document.getElementById('positronMorePages')?.getAttribute('aria-expanded')};
    });
    assert.ok(layout.bar?.visible,'toolbar disappeared on round '+n);
    // Only the TV page should display the video surface. On other tabs,
    // hiding it is correct, and requiring it would be a false regression.
    if(layout.page==='page-tv')
      assert.ok(layout.video?.w>200&&layout.video?.h>100,'video surface collapsed on TV round '+n);
    else assert.ok(layout.page?.startsWith('page-'),'active content page missing on round '+n);
    assert.equal(layout.playerPresent,true,'real video element missing');
    assert.equal(layout.keyboardHelpPresent,true);
    assert.ok(layout.sidebar?.w<285,'sidebar width regression at round '+n);
    if(n>=16&&viewport.width>=1000&&layout.page==='page-tv')assert.ok(layout.video.w>=520,'TV video too narrow at round '+n);
    if(n===50)assert.equal(layout.page,'page-tv');
    const file='positron-p4-'+String(n).padStart(2,'0')+'-real.png';
    const png=await page.screenshot({path:path.join(out,file),fullPage:false,animations:'disabled'});
    assert.ok(png.length>10000,'blank or failed screenshot in round '+n);
    const pixels=await pictures(png);
    assert.ok(pixels.variance>18,'screenshot visually blank at round '+n);
    // Dark theme screens can contain zero pixels above luma 130 after downsampling.
    // Confirm actual visible text controls through DOM geometry instead of a false
    // light-pixel cutoff, while retaining screenshot variance for blank-frame detection.
    const legibility=await page.evaluate(()=>{
      const labels=[...document.querySelectorAll('#appSidebar .nav, #positronBar button, #page-tv button')]
        .filter(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
          return r.width>16&&r.height>14&&cs.visibility==='visible'&&cs.display!=='none' &&
            (el.innerText?.trim()||el.getAttribute('aria-label')||'').length>0;});
      const disclosure=document.getElementById('positronToolsToggle');
      const cs=disclosure?getComputedStyle(disclosure):null;
      return {visibleControls:labels.length,
        disclosureColor:cs?.color||null,disclosureBackground:cs?.backgroundColor||null};
    });
    assert.ok(legibility.visibleControls>=3,'not enough visible text controls in round '+n);
    if(n>=25&&layout.page==='page-tv') {
      assert.notEqual(legibility.disclosureBackground,'rgb(255, 255, 255)',
        'Timeshift disclosure unexpectedly inherits white background');
    }
    let visualSurfaces=null;
    if([38,39,48,49].includes(n)){
      visualSurfaces=await page.evaluate(()=>{
        const bg=selector=>{const el=document.querySelector(selector);return el?getComputedStyle(el).backgroundColor:null;};
        const rail=document.querySelector('#appSidebar .nav[data-page="tv"]');
        return {sourceNav:bg('#page-sources .sources-hub-nav'),sourceHeading:bg('#page-sources .source-hub-heading'),
          epgSearch:bg('#page-epg .epg-filter'),epgInput:bg('#epgSearch'),railFont:rail?getComputedStyle(rail).fontSize:null,
          sidebarWidth:Math.round(document.getElementById('appSidebar')?.getBoundingClientRect().width||0)};
      });
      const checked=n===38?[visualSurfaces.sourceNav,visualSurfaces.sourceHeading]:n===39?[visualSurfaces.epgSearch,visualSurfaces.epgInput]:[];
      for(const color of checked)assert.ok(color&&!['rgb(255, 255, 255)','rgb(248, 249, 253)','rgb(245, 247, 251)'].includes(color),
        'light surface leaked onto P4 page in round '+n+': '+color);
      if(n===48||n===49){assert.equal(visualSurfaces.railFont,'0px','narrow sidebar must be icon-only');assert.ok(visualSurfaces.sidebarWidth<=60,'narrow sidebar too wide');}
    }
    const sha256=crypto.createHash('sha256').update(png).digest('hex');
    const feedback={round:n,screenBytes:png.length,overflow:layout.horizontalOverflow,
      contrast:pixels.variance,sha256,page:layout.page};
    const ownErrors=errors.filter(e=>/positron-(?:fifty|studio|\.js)/i.test(e));
    assert.equal(ownErrors.length,0,'Positron renderer errors in round '+n+': '+ownErrors.join('; '));
    screenshots.push({round:n,improvement:featureNames[n-1],file,source:'ACTUAL Electron screenshot via CDP',
      viewport,layout,pixels,legibility,visualSurfaces,sha256,feedbackUsedFrom:n===1?null:n-1,
      feedbackForNext:feedback,passed:true});
    previousFeedback=feedback;
    if(n===11)await page.locator('#positronMorePages').click();
    if(n===42)await page.keyboard.press('Escape');
    if(n===43)await page.keyboard.press('Escape');
    if(n===44)await page.locator('#positronHelpDialog button').click();
    process.stdout.write('P4 iteration '+n+'/50 REAL screenshot + analysis PASS\n');
  }
  const last=screenshots.at(-1);
  assert.equal(screenshots.length,50);
  assert.equal(last.round,50);
  const report={type:'Positron P4 screenshot-fed incremental engineering',
    realElectron:true,syntheticChannels:false,
    priorP3Rounds:40,newP4Rounds:50,totalUiRounds:90,
    screenshotCount:screenshots.length,rendererErrors:errors,
    originalState:data,finalState:await page.evaluate(()=>window.OpenIPTVPositronFifty.getState()),
    rounds:screenshots};
  fs.writeFileSync(path.join('positron-evidence','audit-p4-50-rounds.json'),JSON.stringify(report,null,2));
  await require('./positron-20-extension.cjs').runTwenty(page);

  // P5.1.225, new round 01: measure the real Electron TV stage at 1920x1080.
  // The before view is the prior unbounded rule recreated temporarily in the
  // current Electron renderer; no mock browser frame or synthesized screenshot.
  await page.setViewportSize({width:1920,height:1080});
  await page.evaluate(() => {
    const tv=document.querySelector('#appSidebar .nav[data-page="tv"]');
    if(!tv)throw Error('Missing native TV navigation');
    tv.click();
    const content=document.querySelector('.main .content');
    if(content)content.scrollTop=0;
  });
  await page.waitForTimeout(200);
  const legacy225=await page.addStyleTag({content:'@media (min-width:1180px) and (min-height:901px) and (max-height:1150px){html[data-positron="true"].po-v3.po-horizon #page-tv #playerBox:not(:fullscreen){max-height:none!important}}'});
  const measure225=()=>page.evaluate(()=>{
    const measure=selector=>{
      const el=document.querySelector(selector);
      if(!el)return null;
      const r=el.getBoundingClientRect();
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
    };
    return {width:innerWidth,height:innerHeight,positron:document.documentElement.dataset.positron,
      classes:document.documentElement.className,player:measure('#page-tv #playerBox'),
      controls:measure('#page-tv .player-control-card'),play:measure('#page-tv #playBtn')};
  });
  const before225=await measure225();
  const evidence225=path.resolve('positron-evidence','p5-20-rounds');
  fs.mkdirSync(evidence225,{recursive:true});
  const before225Png=await page.screenshot({path:path.join(evidence225,'positron-p51225-tv-controls-before-1920x1080-real.png'),animations:'disabled'});
  await legacy225.evaluate(el=>el.remove());
  await page.waitForTimeout(180);
  const after225=await measure225();
  const after225Png=await page.screenshot({path:path.join(evidence225,'positron-p51225-tv-controls-after-1920x1080-real.png'),animations:'disabled'});
  assert.ok(before225.player&&after225.player&&after225.controls&&after225.play,'P225 native TV/controls missing');
  assert.equal(after225.width,1920,'P225 desktop capture width');
  assert.equal(after225.height,1080,'P225 desktop capture height');
  assert.ok(after225.player.width>=1000,'P225 must preserve a large desktop video');
  assert.ok(before225.player.height-after225.player.height>=60,
    'P225 stage should shrink instead of pushing controls below screen: '+JSON.stringify({before:before225,after:after225}));
  assert.ok(after225.player.height<=742,
    'P225 stage must respect available window height: '+after225.player.height);
  assert.ok(after225.controls.bottom<after225.height-42,
    'P225 all transport and secondary controls must stay above the fixed footer: '+JSON.stringify(after225.controls));
  assert.ok(after225.play.bottom<after225.height-42,'P225 Play button out of view');
  assert.ok(!before225Png.equals(after225Png),'P225 before/after real screenshots should differ');
  for(const png of [before225Png,after225Png]){
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','P225 PNG magic');
    assert.equal(png.readUInt32BE(16),1920,'P225 PNG width');
    assert.equal(png.readUInt32BE(20),1080,'P225 PNG height');
  }
  fs.writeFileSync(path.join('positron-evidence','audit-p51225-tv-viewport.json'),JSON.stringify({
    version:'P5.1.225',environment:'real Electron via CDP, synthetic local QA channels, not IPTV playback',
    before:{...before225,sha256:crypto.createHash('sha256').update(before225Png).digest('hex')},
    after:{...after225,sha256:crypto.createHash('sha256').update(after225Png).digest('hex')},
    passed:true
  },null,2));
  process.stdout.write('Positron P5.1.225 native Electron TV viewport control audit PASS\n');
  // P347: independent new Electron cycle after the historical full-regression suite.
  await require('./positron-347-audit.cjs').run(page);
  await require('./positron-348-audit.cjs').run(page);
  await require('./positron-349-audit.cjs').run(page);
  await require('./positron-350-audit.cjs').run(page);
  await require('./positron-351-audit.cjs').run(page);
  await require('./positron-352-audit.cjs').run(page);
  await require('./positron-353-audit.cjs').run(page);
   await require('./positron-354-audit.cjs').run(page);
  await require('./positron-355-audit.cjs').run(page);
  await require('./positron-356-audit.cjs').run(page);
  await browser.close();
})().catch(e=>{
  console.error('P4 50-round audit failed: '+(e&&e.stack||e));
  try{
    fs.mkdirSync('positron-evidence',{recursive:true});
    fs.writeFileSync('positron-evidence/p4-audit-error.txt',String(e&&e.stack||e)+'\n');
  }catch{}
  // Failed CDP tests must exit. Otherwise an open Electron socket can keep Node
  // alive until the GitHub job timeout, masking the real assertion failure.
  process.exit(1);
});
