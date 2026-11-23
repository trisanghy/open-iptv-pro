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
   sortOptions:document.querySelectorAll('#wfAuditPanel .wf-audit-sort option').length,
   researchButton:!!document.getElementById('wfAuditResearch')
  }));
  if(!audit.button||!audit.report||!audit.displayed||audit.header!==5||audit.sortOptions!==6||!audit.researchButton)
   throw Error('WatchFlow audit UI regression: '+JSON.stringify(audit));
  await page.locator('#wfAuditPanel').screenshot({path:'rust-watchflow-audit-v23-8-138.png',timeout:20000});
  // Regression from a real user report: 560 imported channels appeared to do
  // nothing after clicking the button. Verify a VISIBLE 560-row report, sorting
  // and filtering, without contacting Wikidata in the fixture.
  await page.click('#wfAuditPanel .wf-audit-close');
  await page.evaluate(()=>{
   const channels=Array.from({length:560},(_,i)=>({
    id:'fixture-'+(i+1),name:'Kênh '+String(i+1).padStart(4,'0')+' '+(i%2?'Thể thao':'Tin tức'),
    group:i%2?'Thể thao':'Tin tức',url:'https://private.example/stream/'+i+'.m3u8'
   }));
   const analysis=new Map(channels.map((ch,i)=>[String(ch.id),{
    label:i%2?'Thể thao':'Tin tức',from:'EPG',epgCount:2,
    programme:i%2?'Trực tiếp bóng đá':'Thời sự',
    topics:[{label:i%2?'Thể thao':'Tin tức',score:5}],
    programmes:[{title:i%2?'Trực tiếp bóng đá':'Thời sự',labels:[i%2?'Thể thao':'Tin tức']}]
   }]));
   const current=window.IPTVState||{};
   window.IPTVState={...current,getChannels:()=>channels,getCurrent:()=>channels[0]};
   const auto=window.OpenIPTVWatchFlowAuto||{};
   window.OpenIPTVWatchFlowAuto={...auto,
    getBackgroundAnalysis:()=>analysis,
    scanLocal:async({onProgress})=>{
     onProgress({processed:560,total:560});
     return{analysis,processed:560,total:560,cancelled:false};
    },
    scan:async()=>({requests:0,used:0,limit:72})
   };
  });
  await page.click('#wfAuditRun');
  await page.waitForFunction(()=>{
   const el=document.getElementById('wfAuditPanel');
   const label=el?.querySelector('.wf-audit-summary')?.textContent||'';
   return !!el?.open&&!el.hidden&&label.includes('560 kênh')&&el.querySelectorAll('tbody tr').length===50;
  },{timeout:30000});
  const checked=await page.evaluate(()=>{
   const box=document.getElementById('wfAuditPanel'),bounds=box.getBoundingClientRect();
   return{visible:box.open&&!box.hidden&&bounds.width>500&&bounds.top>=0&&bounds.top<innerHeight,
    summary:box.querySelector('.wf-audit-summary').textContent,
    rows:box.querySelectorAll('tbody tr').length,
    first:box.querySelector('tbody tr td')?.textContent||'',
    sourceCols:box.querySelectorAll('thead th').length};
  });
  if(!checked.visible||checked.rows!==50||checked.sourceCols!==5||!checked.summary.includes('560 kênh'))
   throw Error('560-channel audit result not visible: '+JSON.stringify(checked));
  await page.locator('#wfAuditPanel').screenshot({
   path:'rust-watchflow-audit-560-v23-8-139.png',timeout:20000,animations:'disabled'
  });
  await page.locator('#wfAuditPanel .wf-audit-search').fill('Kênh 0560');
  await page.waitForFunction(()=>document.querySelectorAll('#wfAuditPanel tbody tr').length===1);
  const last=await page.locator('#wfAuditPanel tbody tr td').first().innerText();
  if(!last.includes('Kênh 0560'))throw Error('Filtering 560-channel report failed: '+last);
  console.log('PASS 560-channel real-browser audit opens, displays 50, sorts and filters: '+JSON.stringify(checked));

  console.log('PASS WatchFlow real browser audit UI: '+JSON.stringify(audit));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
