'use strict';
/* Captures the actual Web renderer in headless Chromium, never a mock screenshot.
 * Uses guest mode with empty playlist, and does not change remote account data. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const dir=path.resolve('light-audit-web');
fs.mkdirSync(dir,{recursive:true});
const route=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
const probes={
 tv:['.player-control-card','.web-hub-main','.web-hub-side-card'],
 epg:['.epg-tools-fold','.epg-summary','.epg-row'],
 sources:['.source-hub','.smart-panel','.source-repair-log-card','.collector-progress'],
 health:['.health-table','.health-overview'],
 doctor:['.doctor-v3-panel','.doctor-metrics article'],
 settings:['.settings-card','#cloudSyncCard','#cloudStatus'],
 fav:['.fav-card'],multiview:['.multi-tile'],shots:['.shot-card'],
 folders:['.folder-card'],profiles:['.profile-card']
};
function idColor(color){
 const nums=String(color||'').match(/(?:rgba?\(\s*|color\(srgb\s+)([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
 if(!nums)return null;
 const scale=color.startsWith('color(')?255:1;
 return nums.slice(1,4).map(v=>Number(v)*scale);
}
(async()=>{
 const executablePath=process.env.CHROME||'/usr/bin/google-chrome';
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-gpu']});
 const report=[];
 for(const mode of ['desktop','mobile']){
  const mobile=mode==='mobile';
  const context=await browser.newContext({
    viewport:mobile?{width:390,height:844}:{width:1440,height:900},
    isMobile:mobile,hasTouch:mobile,
    ...(mobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'}:{})
  });
  await context.addInitScript(()=>{
   localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify({appearanceMode:'light'}));
   localStorage.setItem('open-iptv-pro-ui-style-v1','current');
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/?view='+mode,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#page-tv',{timeout:16000});
  await page.waitForTimeout(750);
  const names=mobile?['tv','fav','epg','sources','settings']:route;
  for(const id of names){
   const output=await page.evaluate(({id,probes})=>{
    const button=document.querySelector('.nav[data-page="'+id+'"]');
    if(!button)return {id,error:'missing nav'};
    button.click();
    const active=document.querySelector('.page.active-page')?.id||'';
    const all=probes[id]||[];
    const samples=[];
    for(const selector of all){
     const el=document.querySelector('#page-'+id+' '+selector)||document.querySelector(selector);
     if(!el||!el.getClientRects().length)continue;
     let cur=el;let c='';
     while(cur){
      c=getComputedStyle(cur).backgroundColor;
      if(c&&!(/rgba?\(0,\s*0,\s*0,\s*0\)/.test(c)||c==='transparent'))break;
      cur=cur.parentElement;
     }
     samples.push({selector,bg:c||'',color:getComputedStyle(el).color});
    }
    return {id,active,theme:document.documentElement.dataset.theme,device:document.documentElement.dataset.iptvDevice||'',samples};
   },{id,probes});
   if(output.error||output.active!=='page-'+id||output.theme!=='light')throw Error(mode+' navigation/theme '+JSON.stringify(output));
   for(const item of output.samples){
    const rgb=idColor(item.bg);
    if(rgb&&Math.max(...rgb)<175)throw Error(mode+' dark surface: '+JSON.stringify({id,item}));
   }
   await page.waitForTimeout(140);
   await page.screenshot({path:path.join(dir,mode+'-'+id+'.png'),fullPage:false});
   report.push({mode,...output});
  }
  if(!mobile){
   await page.evaluate(()=>document.querySelector('.nav[data-page="sources"]')?.click());
   for(const selector of ['#smartDiscoverySection','#sourceRepairSection']){
    const found=await page.evaluate(selector=>{const e=document.querySelector(selector);if(!e)return false;e.scrollIntoView({block:'start'});return true},selector);
    if(found){await page.waitForTimeout(220);await page.screenshot({path:path.join(dir,'desktop-'+selector.slice(1)+'.png'),fullPage:false});}
   }
   await page.evaluate(()=>document.querySelector('.nav[data-page="settings"]')?.click());
   const cloud=await page.evaluate(()=>{const e=document.querySelector('#cloudSyncCard');if(!e)return false;e.scrollIntoView({block:'center'});return true});
   if(cloud){await page.waitForTimeout(220);await page.screenshot({path:path.join(dir,'desktop-cloud-auth.png'),fullPage:false});}
  }
  report.push({mode,rendererErrors:errors.slice(0,12)});
  await context.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(report,null,2));
 console.log('Web Light navigation and surface audit passed; screenshots:',report.filter(x=>x.id).length);
})().catch(e=>{console.error(e);process.exitCode=1});
