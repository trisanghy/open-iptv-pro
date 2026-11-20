'use strict';
/* Positron screenshot audit: 20 REAL interaction rounds against an Electron
   renderer via CDP. No mocked channels, DOM replacement or generated images. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const out=path.resolve('positron-evidence');
fs.mkdirSync(out,{recursive:true});
const sleep=n=>new Promise(resolve=>setTimeout(resolve,n));
(async()=>{
  let browser,error;
  for(let attempt=0;attempt<45;attempt++){
    try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:1500});break;}
    catch(e){error=e;await sleep(1000);}
  }
  if(!browser)throw error;
  const context=browser.contexts()[0];
  let page;
  for(let attempt=0;attempt<30;attempt++){
    page=context.pages().find(p=>p.url().includes('index.html'));
    if(page)break;
    await sleep(1000);
  }
  if(!page)throw Error('Electron index.html renderer not found');
  await page.waitForSelector('#positronBar',{timeout:30000});
  await page.waitForFunction(()=>!!window.IPTVState,{timeout:30000});
  const jsErrors=[];
  page.on('pageerror',e=>{jsErrors.push(String(e));});
  const pages=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
  const history=[];
  async function capture(file){
    await page.screenshot({path:path.join(out,file),fullPage:false,animations:'disabled'});
  }
  const first=await page.evaluate(()=>({
    title:document.title,brand:document.querySelector('#appSidebar .brand b')?.textContent,
    isPositron:document.documentElement.dataset.positron,
    uiLoaded:!!document.querySelector('link[href="positron.css"]')
  }));
  assert.equal(first.isPositron,'true');
  assert.equal(first.brand,'Positron');
  assert.equal(first.uiLoaded,true);
  await capture('positron-01-start-real.png');
  for(let round=1;round<=20;round++){
    const target=pages[(round-1)%pages.length];
    await page.locator('.nav[data-page="'+target+'"]').click();
    const current=await page.locator('.page.active-page').first().getAttribute('id');
    assert.equal(current,'page-'+target,'navigation failed in round '+round);
    await page.keyboard.press('Control+k');
    await page.locator('#positronQuery').fill('doctor');
    const doctor=page.locator('#positronResults button').filter({hasText:'Smart Doctor'}).first();
    assert.ok(await doctor.count(),'command result missing in round '+round);
    await doctor.click();
    const opened=await page.locator('.page.active-page').first().getAttribute('id');
    assert.equal(opened,'page-doctor','palette navigation failed in round '+round);
    assert.equal(await page.locator('#positronPalette').isHidden(),true);
    await page.locator('.nav[data-page="tv"]').click();
    if(round%2===0){
      await page.locator('#positronFocus').click();
      assert.equal(await page.locator('#positronFocus').getAttribute('aria-pressed'),'true');
      await page.locator('#positronFocus').click();
      assert.equal(await page.locator('#positronFocus').getAttribute('aria-pressed'),'false');
    }
    const geometry=await page.evaluate(()=>{
      const bar=document.getElementById('positronBar').getBoundingClientRect();
      const video=document.getElementById('playerBox').getBoundingClientRect();
      return {
        width:innerWidth,height:innerHeight,
        barVisible:bar.width>80&&bar.height>=50,
        videoPresent:video.width>200&&video.height>100,
        active:document.querySelector('.page.active-page')?.id,
        focus:document.documentElement.dataset.positronFocus||'false'
      };
    });
    assert.equal(geometry.barVisible,true,'workspace toolbar hidden');
    assert.equal(geometry.videoPresent,true,'video box collapsed');
    assert.equal(geometry.active,'page-tv');
    assert.equal(geometry.focus,'false');
    history.push({round,target,navigation:'pass',commandPalette:'pass',focus:round%2===0?'pass':'not required',geometry});
    if([5,10,15].includes(round))await capture('positron-round-'+String(round).padStart(2,'0')+'-real.png');
    process.stdout.write('Positron audit '+round+'/20 PASS\n');
  }
  await page.locator('.nav[data-page="settings"]').click();
  await sleep(250);await capture('positron-final-settings-real.png');
  await page.locator('.nav[data-page="doctor"]').click();
  await sleep(250);await capture('positron-final-doctor-real.png');
  await page.locator('.nav[data-page="tv"]').click();
  await page.locator('#positronOpen').click();
  await page.locator('#positronQuery').fill('');
  await capture('positron-final-command-real.png');
  await page.keyboard.press('Escape');
  await page.locator('#positronFocus').click();
  await sleep(250);await capture('positron-final-focus-real.png');
  await page.locator('#positronFocus').click();
  await sleep(350);await capture('positron-final-main-real.png');
  // Positron P3: 20 ADDITIONAL UI iterations, all on actual running Electron.
  // Use only the app's existing state: no injected channels or simulated screenshots.
  await page.waitForSelector('#positronStudioBtn',{timeout:12000});
  const studioHistory=[];
  const paletteIds=['night','aurora','graphite'];
  for(let round=1;round<=20;round++){
    const theme=paletteIds[(round-1)%paletteIds.length];
    await page.locator('#positronStudioBtn').click();
    await page.locator('[data-po-theme="'+theme+'"]').click();
    const selectedTheme=await page.evaluate(()=>document.documentElement.dataset.positronPalette);
    assert.equal(selectedTheme,theme,'P3 theme did not apply at round '+round);
    await page.keyboard.press('Alt+p'); // close Studio panel
    assert.equal(await page.locator('#positronStudioMenu').isHidden(),true);
    await page.keyboard.press('Alt+2');
    assert.equal(await page.locator('.page.active-page').first().getAttribute('id'),'page-fav');
    await page.keyboard.press('Alt+1');
    assert.equal(await page.locator('.page.active-page').first().getAttribute('id'),'page-tv');
    await page.keyboard.press('Control+k');
    assert.equal(await page.locator('#positronPalette').isVisible(),true);
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(()=>!!document.getElementById('positronQuery')?.getAttribute('aria-activedescendant'),{timeout:2000});
    const search=await page.evaluate(()=>({
      combo:document.getElementById('positronQuery')?.getAttribute('role'),
      resultId:document.getElementById('positronQuery')?.getAttribute('aria-activedescendant')
    }));
    assert.equal(search.combo,'combobox');
    assert.ok(search.resultId);
    if(round===7){
      await page.locator('#positronQuery').focus();
      await page.keyboard.press('Shift+Tab');
      const trapped=await page.evaluate(()=>document.getElementById('positronPalette').contains(document.activeElement));
      assert.equal(trapped,true,'search focus escaped modal dialog');
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#positronPalette').isHidden(),true);
    const geometry=await page.evaluate(()=>{
      const screen=document.getElementById('playerBox').getBoundingClientRect();
      const header=document.getElementById('positronBar').getBoundingClientRect();
      return {videoWidth:Math.round(screen.width),videoHeight:Math.round(screen.height),
        barHeight:Math.round(header.height),counts:document.getElementById('positronCounts')?.textContent||''};
    });
    assert.ok(geometry.videoWidth>200&&geometry.videoHeight>100);
    assert.ok(geometry.barHeight>=50);
    assert.ok(geometry.counts.includes('kênh')&&geometry.counts.includes('nguồn'));
    studioHistory.push({round,theme,quickNavigation:'pass',keyboardSearch:'pass',geometry});
    if(round===5||round===10||round===15){
      await capture('positron-p3-round-'+String(round).padStart(2,'0')+'-real.png');
    }
    process.stdout.write('Positron Studio P3 '+round+'/20 PASS\\n');
  }
  assert.equal(studioHistory.length,20);
  // Verify persisted theme survives a real renderer reload.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#positronStudioBtn',{timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.positronPalette==='aurora',{timeout:5000});
  for(const theme of paletteIds){
    await page.locator('#positronStudioBtn').click();
    await page.locator('[data-po-theme="'+theme+'"]').click();
    await page.keyboard.press('Escape');
    if(theme==='night')await capture('positron-p3-nebula-real.png');
    if(theme==='aurora')await capture('positron-p3-aurora-real.png');
    if(theme==='graphite')await capture('positron-p3-graphite-real.png');
  }
  await page.locator('#positronStudioBtn').click();
  await capture('positron-p3-studio-menu-real.png');
  await page.keyboard.press('Escape');
  await page.locator('#positronStudioBtn').click();
  await page.locator('[data-po-theme="night"]').click();
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:850,height:800});
  await page.waitForTimeout(450);
  const narrow=await page.evaluate(()=>{
    const video=document.querySelector('#page-tv .watch-panel').getBoundingClientRect();
    const list=document.querySelector('#page-tv .channel-panel').getBoundingClientRect();
    return {width:innerWidth,videoTop:video.top,channelTop:list.top,playerWidth:video.width};
  });
  assert.ok(narrow.playerWidth>300,'narrow player is too small');
  assert.ok(narrow.videoTop<narrow.channelTop,'responsive layout must lead with the video');
  await capture('positron-p3-narrow-window-real.png');
  await page.setViewportSize({width:1360,height:823});
  await page.waitForTimeout(350);
  await capture('positron-p3-final-main-real.png');
  fs.writeFileSync(path.join(out,'audit-positron-p3-20-rounds.json'),JSON.stringify({
    source:'actual Electron application via CDP, no mocked channel data',
    extraRounds:studioHistory.length,previousRounds:history.length,
    persistedPaletteReload:'pass',responsiveVideoFirst:'pass',narrow,
    roundResults:studioHistory,rendererErrors:jsErrors
  },null,2));
  fs.writeFileSync(path.join(out,'audit-20-rounds.json'),JSON.stringify({
    source:'actual Electron renderer via Chrome DevTools Protocol',
    realRounds:history.length,
    base:first,finalUrl:page.url(),history,rendererErrors:jsErrors
  },null,2));
  assert.equal(history.length,20);
  const ownErrors=jsErrors.filter(e=>/positron\.js/i.test(e));
  assert.deepEqual(ownErrors,[],'Positron renderer error');
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
