'use strict';
// Browser inspection of the exact Rust Lab renderer CSS. Not a native Tauri screenshot.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright-core');
const dest=path.resolve('rust-light-audit');fs.mkdirSync(dest,{recursive:true});
const sections=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
const probes={
 tv:['.player-control-card','.rust-browser-main','.rust-browser-side-card','.rust-browser-filters input','.unified-ai-toggle','.video-enhance-toggle'],
 epg:['.epg-summary','.epg-row','.epg-source-card'],
 sources:['.source-hub','.collector-progress','.smart-panel'],
 doctor:['.doctor-v3-panel','.doctor-metrics article'],
 health:['.health-table','.health-overview'],
 settings:['.settings-card'],multiview:['.multi-tile'],
 fav:['.fav-card'],shots:['.shot-card'],folders:['.folder-card'],profiles:['.profile-card']
};
const components=color=>{
 const m=String(color).match(/(?:rgba?\(\s*|color\(srgb\s+)([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
 return m?m.slice(1,4).map(n=>Number(n)*(color.startsWith('color(')?255:1)):null;
};

function contrastRatio(a,b){
 const brightness=rgb=>{
  const v=rgb.map(x=>{const c=x/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
  return .2126*v[0]+.7152*v[1]+.0722*v[2];
 };
 const A=brightness(a),B=brightness(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05);
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1500,height:940}});
 await context.addInitScript(()=>{
  localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify({appearanceMode:'light'}));
  localStorage.setItem('open-iptv-pro-ui-style-v1','current');
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#page-tv',{timeout:15000});
 await page.waitForTimeout(850);
 const report=[];
 for(const id of sections){
  const row=await page.evaluate(({id,probes})=>{
   const nav=document.querySelector('.nav[data-page="'+id+'"]');
   if(!nav)return {id,error:'missing navigation'};
   nav.click();
   const current=document.querySelector('.page.active-page')?.id;
   const samples=[];
   for(const selector of probes[id]||[]){
    const el=document.querySelector('#page-'+id+' '+selector)||document.querySelector(selector);
    if(!el||!el.getClientRects().length)continue;
    let parent=el,bg='';
    while(parent){
     bg=getComputedStyle(parent).backgroundColor;
     if(bg&&bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)')break;
     parent=parent.parentElement;
    }
    samples.push({selector,bg,color:getComputedStyle(el).color});
   }
   return {id,current,theme:document.documentElement.dataset.theme,samples};
  },{id,probes});
  if(row.error||row.current!=='page-'+id||row.theme!=='light')throw Error('Rust renderer Light navigation '+JSON.stringify(row));
  for(const sample of row.samples){
   const rgb=components(sample.bg);
   if(rgb&&Math.max(...rgb)<175)throw Error('Rust Light contains dark surface: '+JSON.stringify({id,sample}));
  }
  report.push(row);
  if(id==='tv'){
   const selected=await page.evaluate(()=>{
    const el=document.querySelector('#page-tv .channel-panel .filter-tab.active');
    if(!el)return null;
    const s=getComputedStyle(el);
    return {label:el.textContent.trim(),color:s.color,bg:s.backgroundColor};
   });
   if(!selected)throw Error('Rust Light channel active filter missing');
   const fg=components(selected.color),bg=components(selected.bg);
   if(!fg||!bg||contrastRatio(fg,bg)<4.5)throw Error('Rust Light selected channel filter has insufficient contrast: '+JSON.stringify({selected,ratio:fg&&bg?contrastRatio(fg,bg):null}));
   report.push({contrastReview:selected,ratio:contrastRatio(fg,bg)});
  }
  await page.waitForTimeout(180);
  await page.screenshot({path:path.join(dest,'rust-light-'+id+'.png'),fullPage:false});
 }
 await page.evaluate(()=>document.querySelector('.nav[data-page="tv"]')?.click());
 for(const selector of ['#rustChannelBrowser','#videoEnhancePanel','#liveCaptionSetupPanel']){
  const available=await page.evaluate(selector=>{const el=document.querySelector(selector);if(!el)return false;el.scrollIntoView({block:'center'});return true},selector);
  if(available){await page.waitForTimeout(230);await page.screenshot({path:path.join(dest,'rust-'+selector.slice(1)+'.png')});}
 }
 fs.writeFileSync(path.join(dest,'audit.json'),JSON.stringify({runtime:'browser preview without Tauri native bridge',report,rendererErrors:errors.slice(0,15)},null,2));
 await browser.close();
 console.log('Rust renderer Light visual audit passed',report.length,'navigation pages');
})().catch(e=>{console.error(e);process.exitCode=1});
