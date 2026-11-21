'use strict';
/* Real Web Desktop + Web Mobile Chromium UI audit. Never a generated mock.
 * Guest mode, no playlist, no source-consent acceptance, no backend assertions.
 * Captures every navigation page for all three themes plus mobile More sheet. */
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright-core');
const output=path.resolve('web-three-theme-audit');
fs.mkdirSync(output,{recursive:true});
const pages=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
const themes=['light','dark','amoled'];
const probes={
 tv:['.player-control-card','.channel-panel','#webChannelHub .web-hub-main','#webChannelHub .web-hub-side-card','.compact-tools'],
 epg:['.epg-tools-fold','.epg-summary','.epg-row'],
 sources:['.source-hub','.source-hub-section','.smart-panel','.source-repair-log-card','.collector-progress'],
 health:['.health-table','.health-overview'],
 doctor:['.doctor-v3-panel','.doctor-metrics article'],
 settings:['.settings-card','#cloudSyncCard','#cloudStatus'],
 fav:['.fav-card'],multiview:['.multi-tile'],shots:['.shot-card'],folders:['.folder-card'],profiles:['.profile-card']
};
const report={context:'Web Online real renderer in headless Chromium, guest mode with no M3U data',screenshots:[],measurements:[],issues:[],errors:[]};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function rgb(c){
 if(!c||c==='transparent'||c==='rgba(0, 0, 0, 0)')return null;
 let m=c.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/);
 if(m)return m.slice(1,4).map(Number);
 m=c.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
 return m?m.slice(1,4).map(x=>Number(x)*255):null;
}
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 try{
  for(const theme of themes)for(const mode of ['desktop','mobile']){
   const mobile=mode==='mobile';
   const context=await browser.newContext({
    viewport:mobile?{width:390,height:844}:{width:1440,height:900},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
    ...(mobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'}:{})
   });
   await context.addInitScript(theme=>{
    localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify({appearanceMode:theme}));
    localStorage.setItem('open-iptv-pro-ui-style-v1','current');
   },theme);
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/?view='+mode,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#page-tv',{timeout:15000});
   await delay(650);
   const initial=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,device:document.documentElement.dataset.iptvDevice}));
   if(initial.theme!==theme||initial.device!==mode)throw Error('Theme or viewport mismatch '+JSON.stringify({theme,mode,initial}));
   async function capture(name,selector){
    if(selector)await page.evaluate(s=>document.querySelector(s)?.scrollIntoView({block:'start',behavior:'instant'}),selector);
    await delay(95);
    const file=theme+'-'+mode+'-'+name+'.png';
    await page.screenshot({path:path.join(output,file),fullPage:false,timeout:16000});
    report.screenshots.push({theme,mode,name,file});
   }
   async function navigate(id){
    const state=await page.evaluate(id=>{
     const b=document.querySelector('.nav[data-page="'+id+'"]');
     if(!b)return 'missing nav';
     b.click();return document.querySelector('.page.active-page')?.id;
    },id);
    await delay(180);
    const active=await page.evaluate(()=>document.querySelector('.page.active-page')?.id);
    if(active!=='page-'+id)throw Error('Bad route '+theme+' '+mode+' '+id+' '+state+' '+active);
   }
   for(const id of pages){
    await navigate(id);
    const samples=await page.evaluate(({id,selectors})=>{
     return (selectors||[]).map(selector=>{
      const el=document.querySelector('#page-'+id+' '+selector)||document.querySelector(selector);
      if(!el||!el.getClientRects().length)return null;
      let node=el,bg='';
      while(node){
       bg=getComputedStyle(node).backgroundColor;
       if(bg&&!['transparent','rgba(0, 0, 0, 0)'].includes(bg))break;
       node=node.parentElement;
      }
      const rect=el.getBoundingClientRect(),css=getComputedStyle(el);
      return {selector,bg,fg:css.color,rect:{width:rect.width,height:rect.height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}};
     }).filter(Boolean);
    },{id,selectors:probes[id]||[]});
    for(const item of samples){
      const rgbv=rgb(item.bg);
      if(!rgbv)continue;
      if(theme==='light'&&Math.max(...rgbv)<170)
       report.issues.push({theme,mode,id,issue:'unexpected-dark-light-card',item});
      if(theme==='amoled'&&(Math.max(...rgbv)>85||Math.max(...rgbv)-Math.min(...rgbv)>28))
       report.issues.push({theme,mode,id,issue:'blue-cast-or-bright-amoled-card',item});
      report.measurements.push({theme,mode,id,selector:item.selector,bg:item.bg,fg:item.fg});
    }
    await capture('page-'+id);
   }
   await navigate('tv');
   for(const [name,selector] of [
    ['tv-control-card','.player-control-card'],['tv-channel-hub','#webChannelHub'],
    ['tv-quick-tools','#quickTools'],['tv-epg-summary','.epg-current-card']
   ]){
    if(await page.locator(selector).count())await capture(name,selector);
   }
   await navigate('sources');
   for(const [name,selector] of [
    ['source-smart-discovery','#smartDiscoverySection'],
    ['source-repair','#sourceRepairSection'],
    ['source-collector','#collectorSection']
   ]){
    if(await page.locator(selector).count())await capture(name,selector);
   }
   await navigate('settings');
   if(await page.locator('#cloudSyncCard').count())await capture('settings-cloud-sync','#cloudSyncCard');
   if(mobile){
    await navigate('tv');
    const more=await page.locator('.mobile-more-trigger').count();
    if(!more)report.issues.push({theme,mode,issue:'missing-mobile-more-trigger'});
    else{
     await page.locator('.mobile-more-trigger').evaluate(el=>el.click());
     await delay(250);
     const sheet=await page.evaluate(()=>{
      const el=document.querySelector('.mobile-more-panel');
      const overlay=document.querySelector('.mobile-more-overlay');
      const style=el&&getComputedStyle(el),r=el?.getBoundingClientRect();
      return {visible:!!el&&!!r&&r.width>0&&r.height>0&&!overlay?.hidden,
       bg:style?.backgroundColor||null,fg:style?.color||null,
       width:r?.width||0,height:r?.height||0};
     });
     report.measurements.push({theme,mode,id:'more-sheet',...sheet});
     const col=rgb(sheet.bg);
     if(!sheet.visible)report.issues.push({theme,mode,issue:'mobile-more-sheet-not-visible',sheet});
     if(col&&theme==='light'&&Math.min(...col)<180)report.issues.push({theme,mode,issue:'light-more-sheet-still-dark',sheet});
     if(col&&theme==='amoled'&&Math.max(...col)>42)report.issues.push({theme,mode,issue:'amoled-more-sheet-navy',sheet});
     await capture('mobile-more-open');
     await page.evaluate(()=>document.querySelector('.mobile-more-close')?.click());
    }
    await navigate('tv');
    const mobileNav=await page.evaluate(()=>{
     const r=document.querySelector('#appSidebar')?.getBoundingClientRect();
     return {width:r?.width||0,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
    });
    if(mobileNav.width>mobileNav.viewport+4||mobileNav.scrollWidth>mobileNav.viewport+24)
     report.issues.push({theme,mode,issue:'mobile-horizontal-layout-overflow',mobileNav});
   }
   const key=await page.evaluate(()=>({
    body:getComputedStyle(document.body).backgroundColor,
    sidebar:getComputedStyle(document.querySelector('#appSidebar')).backgroundColor,
    main:getComputedStyle(document.querySelector('.main')).backgroundColor,
    nav:getComputedStyle(document.querySelector('.nav.active')).backgroundColor,
    errors:[]
   }));
   report.measurements.push({theme,mode,id:'root',...key});
   if(theme==='amoled'){
    for(const field of ['body','sidebar','main']){
     const col=rgb(key[field]);
     if(col&&Math.max(...col)>4)report.issues.push({theme,mode,issue:'AMOLED-canvas-not-black',field,color:key[field]});
    }
   }
   report.errors.push({theme,mode,errors:errors.slice(0,15)});
   await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(output,'theme-audit.json'),JSON.stringify(report,null,2));
 console.log('WEB THREE THEME:',report.screenshots.length,'screenshots;',report.issues.length,'issues;',
  report.errors.reduce((n,e)=>n+e.errors.length,0),'renderer errors');
 const errors=report.issues.filter(x=>['AMOLED-canvas-not-black','amoled-more-sheet-navy','light-more-sheet-still-dark','mobile-more-sheet-not-visible','blue-cast-or-bright-amoled-card','unexpected-dark-light-card'].includes(x.issue));
 if(errors.length)throw Error('Theme audit found '+errors.length+' actionable issues');
 if(report.screenshots.length<85)throw Error('Screenshot coverage lower than expected: '+report.screenshots.length);
}
main().catch(e=>{console.error(e);fs.writeFileSync(path.join(output,'error.txt'),String(e.stack||e));process.exitCode=1});
