'use strict';
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 try{
  const page=await browser.newPage({viewport:{width:1540,height:960},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#watchflowDemoToggle',{timeout:15000});
  await page.click('#watchflowDemoToggle');
  await page.evaluate(()=>document.getElementById('wfSettings').open=true);
  await page.waitForFunction(()=>document.querySelectorAll('#wfSmartModelList .wf-smart-card').length===5);
  const check=await page.evaluate(()=>{
   const visible=id=>{const x=document.getElementById(id);return!!x&&!x.hidden&&getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>0;};
   return{standard:visible('wfStandardModels'),smart:visible('wfSmartModels'),intelligence:visible('wfIntelligenceModels'),
    cards:document.querySelectorAll('#wfSmartModelList .wf-smart-card').length,
    options:document.querySelectorAll('#wfSmartModelSelect option').length,
    expanded:document.querySelector('.wf-smart-details')?.open===true,
    active:document.querySelector('[data-wf-mode="standard"]')?.getAttribute('aria-checked')};
  });
  if(!check.standard||!check.smart||!check.intelligence||check.cards!==5||check.options!==5||!check.expanded||check.active!=='true')
   throw Error('Incomplete catalog: '+JSON.stringify(check));
  await page.locator('#wfSettings').screenshot({path:'rust-watchflow-catalog-v23-8-136.png',timeout:20000,animations:'disabled'});
  // Separate real screenshots are easier to inspect than one clipped long panel.
  for(const [id,name] of [
   ['wfStandardModels','standard'],['wfSmartModels','smart'],['wfIntelligenceModels','intelligence']
  ]){
   await page.locator('#'+id).screenshot({
    path:'rust-watchflow-models-v23-8-137-'+name+'.png',timeout:20000,animations:'disabled'
   });
  }
  console.log('PASS full models visible under actual renderer CSP: '+JSON.stringify(check));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
