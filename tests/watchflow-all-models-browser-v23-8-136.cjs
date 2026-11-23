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
  for(const mode of ['standard','smart','intelligence']){
   if(mode!=='standard')await page.click('[data-wf-mode="'+mode+'"]');
   const found=await page.evaluate(m=>{
    const visible=id=>{
     const x=document.getElementById(id);
     return !!x&&!x.hidden&&getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>0;
    };
    return{standard:visible('wfStandardModels'),smart:visible('wfSmartModels'),
     intelligence:visible('wfIntelligenceModels'),options:document.querySelectorAll('#wfSmartModelSelect option').length,
     cards:document.querySelectorAll('#wfSmartModelList .wf-smart-card').length,
     active:document.querySelector('[data-wf-mode="'+m+'"]')?.getAttribute('aria-checked'),
     open:document.getElementById('wfSettings')?.open};
   },mode);
   if(!found.open||found.active!=='true'||found[mode]!==true||[found.standard,found.smart,found.intelligence].filter(Boolean).length!==1)
    throw Error('Multiple model families expanded: '+mode+' '+JSON.stringify(found));
   if(found.options!==5||found.cards!==5)throw Error('Smart model choices missing: '+JSON.stringify(found));
   await page.locator('#wfSettings').screenshot({path:'rust-watchflow-catalog-v23-8-136.png',timeout:20000,animations:'disabled'});
   await page.locator('#wf'+(mode==='intelligence'?'Intelligence':mode==='smart'?'Smart':'Standard')+'Models')
    .screenshot({path:'rust-watchflow-models-v23-8-137-'+mode+'.png',timeout:20000,animations:'disabled'});
  }
  console.log('PASS WatchFlow exclusive accordion: Standard/Smart/Intelligence, five Smart models preserved');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
