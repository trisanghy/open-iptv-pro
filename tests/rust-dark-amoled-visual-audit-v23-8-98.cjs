'use strict';
/* Screenshots from actual Rust renderer in Chromium, NOT native Tauri.
   No playlist, account credentials, model installation, or source consent. */
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright-core');
const dir=path.resolve('rust-night-audit');
fs.mkdirSync(dir,{recursive:true});
const report={kind:'Rust Lab real renderer in Chromium; no Tauri native backend',issues:[],shots:[],samples:[],errors:[]};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function rgb(input){
 if(!input||input==='transparent')return null;
 let m=input.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
 if(m)return m.slice(1,4).map(Number);
 m=input.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
 if(m)return m.slice(1,4).map(v=>Math.round(Number(v)*255));
 return null;
}
async function main(){
 const browser=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-gpu']});
 try{
 const page=await browser.newPage({viewport:{width:1540,height:960},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(String(e?.message||e)));
 await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#page-tv .player-control-card',{timeout:20000});
 await pause(500);
 const tabs=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
 const samples=[
  ['application','body'],['sidebar','.sidebar'],['main','.main'],['topbar','.topbar'],
  ['player-controls','#page-tv .player-control-card'],
  ['quick-tools','#quickTools'],['timebar','.advanced-timebar'],
  ['channel-picker-main','#page-tv .rust-browser-main'],
  ['channel-picker-side','#page-tv .rust-browser-side-card'],
  ['channel-card','#page-tv .rust-browser-card'],
  ['epg-form','#page-epg .dvr-panel'],['epg-row','#page-epg .epg-row'],
  ['source-card','#page-sources .source-hub-section'],
  ['source-discovery','#page-sources .smart-panel'],
  ['source-collector','#page-sources .collector-progress'],
  ['source-merge','#page-sources .source-merge-panel'],
  ['health','#page-health .health-overview'],['doctor','#page-doctor .doctor-v3-panel'],
  ['settings','#page-settings .settings-accordion-heading'],
  ['settings-content','#page-settings .settings-accordion-content'],
  ['ai-caption','#page-tv .unified-ai-content'],
  ['enhancement','#page-tv .video-enhance-panel .veh-card'],
  ['gpu','#page-tv #videoGpuManager'],
  ['gpu-modal','#veh-gpu-recommend']
 ];
 async function switchTo(tab){
  await page.evaluate(id=>document.querySelector('.nav[data-page="'+id+'"]')?.click(),tab);
  await pause(150);
  const id=await page.evaluate(()=>document.querySelector('.page.active-page')?.id);
  if(id!=='page-'+tab)throw Error('Failed route '+tab+' got '+id);
 }
 async function save(theme,slug,selector=null){
  const ready=await page.evaluate(s=>{
   const el=s?document.querySelector(s):document.querySelector('.page.active-page');
   if(!el||!el.getClientRects().length)return false;
   el.scrollIntoView({block:'start',behavior:'instant'});
   return true;
  },selector);
  if(!ready){report.issues.push({theme,type:'missing-visible-section',slug,selector});return;}
  await pause(120);
  const name=theme+'-'+slug+'.png';
  await page.screenshot({path:path.join(dir,name),fullPage:false,timeout:20000});
  report.shots.push({theme,slug,file:name,selector});
 }
 async function tap(selector){
  const ok=await page.evaluate(s=>{
   const el=document.querySelector(s);
   if(!el||!el.getClientRects().length||el.disabled)return false;
   el.click();return true;
  },selector);
  await pause(130);return ok;
 }
 async function openSettings(id){
  await page.evaluate(id=>{const e=document.getElementById(id);if(e?.matches('details'))e.open=true;},id);
  await pause(130);
 }
 for(const theme of ['dark','amoled']){
  await page.evaluate(theme=>{
   document.documentElement.dataset.theme=theme;
   document.documentElement.dataset.uiStyle='current';
  },theme);
  await pause(250);
  for(const tab of tabs){await switchTo(tab);await save(theme,'01-page-'+tab);}
  await switchTo('tv');
  await save(theme,'02-player-and-controls','#page-tv .player-control-card');
  await save(theme,'03-timeshift-and-dvr','.advanced-timebar');
  await save(theme,'04-quick-tools','#quickTools');
  await save(theme,'05-channel-browser','#rustChannelBrowser');
  await tap('#rustBrowserList');await save(theme,'06-channel-browser-list','#rustChannelBrowser');await tap('#rustBrowserGrid');
  if(await tap('#unifiedAiToggle')){
   await save(theme,'07-caption-translation-tts','#unifiedAiContent');
   if(await tap('#liveCaptionSetup'))await save(theme,'08-ai-model-settings','#liveCaptionSetupPanel');
   await tap('#unifiedAiToggle');
  }
  if(await tap('#videoEnhanceToggle')){
   await save(theme,'09-video-enhancement','#videoEnhancePanel');
   await save(theme,'10-gpu-acceleration','#videoGpuManager');
   await save(theme,'11-video-upscale','#veh-upscale');
   await tap('#videoEnhanceToggle');
  }
  await switchTo('sources');
  for(const [slug,selector] of [
    ['12-smart-discovery','#smartDiscoverySection'],['13-collector','#collectorSection'],
    ['14-source-merge','#sourceMergePanel'],['15-source-repair','#sourceRepairSection']])
   await save(theme,slug,selector);
  await switchTo('epg');await save(theme,'16-dvr-form','#dvrForm');
  await switchTo('settings');
  for(const [slug,id] of [
    ['17-settings-style','uiStyleSettings'],['18-settings-appearance','appearanceSettings'],
    ['19-settings-language','languageSettings'],['20-settings-performance','fullFeatureTools'],
    ['21-settings-epg','epgSettingsCard'],['22-settings-pip','pipAutoSettings'],
    ['23-settings-ai','rustAIHardwareSettings'],['24-settings-updates','updateResult']]){
   await openSettings(id);await save(theme,slug,'#'+id);
  }
  // Collect computed style only where content is visible, excluding inactive pages.
  for(const [label,selector] of samples){
   const s=await page.evaluate(({label,selector})=>{
    const el=document.querySelector(selector);
    if(!el)return null;
    const css=getComputedStyle(el);
    const rect=el.getBoundingClientRect();
    return {label,selector,bg:css.backgroundColor,fg:css.color,bgImage:css.backgroundImage,visible:rect.width>0&&rect.height>0};
   },{label,selector});
   if(!s)continue;
   report.samples.push({theme,...s});
   const v=rgb(s.bg);
   if(!v||s.bg==='rgba(0, 0, 0, 0)')continue;
   if(theme==='amoled'&&['application','sidebar','main','topbar'].includes(label)&&Math.max(...v)>4){
    report.issues.push({theme,type:'AMOLED_canvas_not_black',label,rgb:v});
   }
   if(theme==='amoled'&&[
     'player-controls','quick-tools','timebar','channel-picker-main','channel-picker-side',
     'epg-form','source-card','source-discovery','source-collector','source-merge','settings'
    ].includes(label)&&(Math.max(...v)>56||Math.max(...v)-Math.min(...v)>24)){
     report.issues.push({theme,type:'AMOLED_color_cast',label,rgb:v});
   }
  }
 }
 fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(report,null,2));
 console.log('DARK+AMOLED AUDIT',report.shots.length,'screenshots,',report.issues.length,'issues,',report.errors.length,'renderer errors');
 if(report.issues.some(i=>i.type==='AMOLED_canvas_not_black'||i.type==='AMOLED_color_cast'))throw Error('AMOLED palette failed; see audit.json');
 if(report.shots.length<55)throw Error('Insufficient theme screenshot coverage: '+report.shots.length);
 }finally{await browser.close();}
}
main().catch(e=>{fs.writeFileSync(path.join(dir,'failure.txt'),String(e.stack||e));console.error(e);process.exitCode=1;});
