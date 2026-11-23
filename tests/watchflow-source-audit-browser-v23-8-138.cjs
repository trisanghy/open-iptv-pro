'use strict';
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:850},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#watchflowDemoToggle',{timeout:15000});
  await page.click('#watchflowDemoToggle');
  await page.waitForSelector('#wfAuditRun',{timeout:10000});
  // Fixture-free smoke: the installed application must refuse to invent
  // channel rows when the current playlist is empty.
  await page.click('#wfAuditRun');
  await page.waitForFunction(()=>{
   const s=document.getElementById('wfAuditStatus')||document.querySelector('#wfAuditPanel .wf-audit-status');
   return !!s&&(/Chưa có playlist|Hoàn tất|Không hoàn thành/.test(s.textContent));
  },{timeout:30000});
  const audit=await page.evaluate(()=>({
   button:!!document.getElementById('wfAuditRun'),
   report:!!document.getElementById('wfAuditPanel'),
   displayed:!document.getElementById('wfAuditPanel')?.hidden,
   header:document.querySelectorAll('#wfAuditPanel th').length,
   sortOptions:document.querySelectorAll('#wfAuditPanel .wf-audit-sort option').length
  }));
  if(!audit.button||!audit.report||!audit.displayed||audit.header!==5||audit.sortOptions!==4)
   throw Error('WatchFlow audit UI regression: '+JSON.stringify(audit));
  await page.locator('#wfAuditPanel').screenshot({path:'rust-watchflow-audit-v23-8-138.png',timeout:20000});
  console.log('PASS WatchFlow real browser audit UI: '+JSON.stringify(audit));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
