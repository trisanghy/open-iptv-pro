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
