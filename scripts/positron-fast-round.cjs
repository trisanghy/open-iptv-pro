'use strict';
// Current-round evidence from an actual Electron renderer through CDP.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'..'),delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser,lastError;
 for(let i=0;i<35;i++){
  try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:1700});break;}
  catch(e){lastError=e;await delay(900);}
 }
 if(!browser)throw lastError||Error('Electron CDP port unavailable');
 try{
  const ctx=browser.contexts()[0];let page;
  for(let i=0;i<30;i++){
   page=ctx.pages().find(p=>p.url().includes('index.html'));
   if(page)break;await delay(800);
  }
  assert.ok(page,'real Electron index.html renderer not found');
  await page.waitForSelector('#positronBar',{timeout:30000});
  await page.waitForFunction(()=>!!window.IPTVState&&!!window.PositronWatchFlow,null,{timeout:30000});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.positron),'true');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const m=/Positron P5\.1\.(\d+)/.exec(pkg.description||'');
  assert.ok(m,'missing P5.1.N label');
  const round=Number(m[1]),prefix='positron-p51'+round+'-';
  assert.ok(round>=331,'use independent latest-round audit');
  const source=path.join(__dirname,'positron-'+round+'-audit.cjs');
  assert.ok(fs.existsSync(source),'missing latest native Electron audit '+source);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await require(source).run(page);
  assert.equal(errors.length,0,'Electron uncaught page errors: '+errors.join('; '));
  const dir=path.join(root,'positron-evidence','p5-20-rounds');
  const names=fs.readdirSync(dir).filter(x=>x.startsWith(prefix)&&x.endsWith('.png'));
  assert.ok(names.some(x=>x.includes('-before-'))&&names.some(x=>x.includes('-after-')),
   'latest round requires before and after screenshots: '+JSON.stringify(names));
  for(const name of names){
   const png=fs.readFileSync(path.join(dir,name));
   assert.ok(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'not a PNG '+name);
   assert.ok(png.readUInt32BE(16)>=600&&png.readUInt32BE(20)>=720,'bad viewport PNG '+name);
  }
  console.log('Positron real Electron latest-round PASS',JSON.stringify({round,app:pkg.version,screenshots:names.length,names,errors:0}));
 }finally{await browser?.close().catch(()=>{});}
})().catch(e=>{console.error('Positron latest-round Electron FAIL',e.stack||e);process.exitCode=1;});
