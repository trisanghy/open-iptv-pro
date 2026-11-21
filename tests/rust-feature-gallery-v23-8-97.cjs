'use strict';
/* Review actual Rust Lab renderer in Chromium. Never label these Tauri-native images.
 * No playlists, models or account data are imported. Controls that require a
 * native bridge are photographed but their backend execution is NOT inferred. */
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright-core');
const out=path.resolve('rust-feature-gallery');
fs.mkdirSync(out,{recursive:true});
const steps=[],issues=[],runtimeErrors=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const safe=s=>String(s).replace(/[^a-z0-9-]/gi,'-');
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1540,height:960},deviceScaleFactor:1});
 await context.addInitScript(()=>{
  localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify({appearanceMode:'light'}));
  localStorage.setItem('open-iptv-pro-ui-style-v1','current');
 });
 const page=await context.newPage();
 page.on('pageerror',e=>runtimeErrors.push(e.message));
 await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#page-tv .player-control-card',{timeout:20000});
 await page.waitForTimeout(700);
 async function nav(id){
  await page.evaluate(id=>document.querySelector('.nav[data-page="'+id+'"]')?.click(),id);
  await page.waitForTimeout(170);
  const active=await page.evaluate(()=>document.querySelector('.page.active-page')?.id);
  if(active!=='page-'+id)throw Error('Navigation did not switch to '+id+': '+active);
 }
 async function click(selector){
  const response=await page.evaluate(selector=>{
   const el=document.querySelector(selector);
   if(!el||!el.getClientRects().length||el.disabled)return 'unavailable';
   el.click();return 'clicked';
  },selector);
  await page.waitForTimeout(240);
  return response;
 }
 async function shot(name,selector){
  const element=selector?await page.evaluate(selector=>{
   const el=document.querySelector(selector);
   if(!el||!el.getClientRects().length)return false;
   el.scrollIntoView({block:'start',behavior:'instant'});
   return true;
  },selector):true;
  await page.waitForTimeout(180);
  const audit=await page.evaluate(selector=>{
   const el=selector?document.querySelector(selector):document.querySelector('.page.active-page');
   const active=document.querySelector('.page.active-page')?.id;
   let elrect=null,styles=null;
   if(el){const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    elrect={x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
    styles={background:s.backgroundColor,color:s.color,display:s.display,overflow:s.overflowX};
   }
   const app=document.querySelector('.content'),r=app?.getBoundingClientRect();
   return {active,theme:document.documentElement.dataset.theme,style:document.documentElement.dataset.uiStyle,selector,elrect,styles,contentWidth:Math.round(r?.width||0),viewport:innerWidth};
  },selector);
  if(selector&&!element)issues.push({type:'missing-visible-section',name,selector});
  if(audit.elrect&&audit.elrect.width>audit.viewport+16)issues.push({type:'too-wide',name,selector,rect:audit.elrect});
  if(audit.elrect&&audit.elrect.scrollWidth>audit.elrect.clientWidth+24
    && audit.styles?.overflow!=='auto'&&audit.styles?.overflow!=='scroll')
    issues.push({type:'horizontal-overflow',name,selector,rect:audit.elrect});
  const filename=safe(name)+'.png';
  await page.screenshot({path:path.join(out,filename),timeout:16000});
  steps.push({name,filename,shot:true,...audit});
 }
 async function sectionShot(name,selector){
  if(await page.evaluate(s=>!!document.querySelector(s),selector))await shot(name,selector);
  else issues.push({type:'missing-section',name,selector});
 }
 const navTabs=['tv','fav','epg','multiview','shots','folders','sources','health','doctor','profiles','settings'];
 for(const id of navTabs){await nav(id);await shot('01-page-'+id,null);}
 await nav('tv');
 await sectionShot('02-tv-player','#playerBox');
 await sectionShot('03-tv-playback-controls','.player-control-card');
 await sectionShot('04-tv-timeshift-dvr','.advanced-timebar');
 const dvr=await click('#dvrQuickToggle');
 if(dvr==='clicked'&&!await page.evaluate(()=>document.getElementById('dvrQuickForm')?.classList.contains('hidden')))
  await sectionShot('05-tv-dvr-schedule-open','#dvrQuickForm');
 else issues.push({type:'unavailable-feature',name:'dvrQuickForm',reason:dvr});
 await sectionShot('06-tv-quick-tools','#quickTools');
 await sectionShot('07-tv-channel-browser','#rustChannelBrowser');
 await click('#rustBrowserList');
 await sectionShot('08-tv-channel-list-layout','#rustChannelBrowser');
 await click('#rustBrowserGrid');
 await click('#rustBrowserAllFavorites');
 await sectionShot('09-tv-browser-favorites','#rustChannelBrowser');
 await click('#rustBrowserAllRecent');
 await sectionShot('10-tv-browser-recent','#rustChannelBrowser');
 const caption=await click('#unifiedAiToggle');
 const captionOpen=await page.evaluate(()=>document.getElementById('unifiedAiContent')?.hidden===false);
 if(caption==='clicked'&&captionOpen){
  await sectionShot('11-tv-ai-caption-translate-tts','#unifiedAiContent');
  await click('#liveCaptionSetup');
  const setupVisible=await page.evaluate(()=>!document.getElementById('liveCaptionSetupPanel')?.hidden);
  if(setupVisible)await sectionShot('12-tv-ai-whisper-model-settings','#liveCaptionSetupPanel');
  else issues.push({type:'unavailable-feature',name:'caption-setup-browser-native-bridge'});
 }
 else issues.push({type:'unavailable-feature',name:'unified-ai-toggle'});
 if(captionOpen)await click('#unifiedAiToggle');
 const enhance=await click('#videoEnhanceToggle');
 if(enhance==='clicked'&&await page.evaluate(()=>document.getElementById('videoEnhancePanel')?.hidden===false)){
  await sectionShot('13-tv-video-enhancement-open','#videoEnhancePanel');
  await click('[data-target="veh-upscale"]');
  await sectionShot('14-tv-video-enhance-upscaling','#veh-upscale');
  await sectionShot('15-tv-video-enhance-benchmark','#veh-bench');
  await sectionShot('16-tv-video-enhance-hardware','#veh-ai-probe');
 }else issues.push({type:'unavailable-feature',name:'video-enhancement-panel'});
 await click('#videoEnhanceToggle');
 await nav('epg');
 await sectionShot('17-epg-guide','#epgGuide');
 await sectionShot('18-epg-scheduler','#dvrForm');
 await click('#epgSettingsBtn');
 await sectionShot('19-epg-source-configuration','#epgSettingsCard');
 await nav('sources');
 await sectionShot('20-sources-discovery','#smartDiscoverySection');
 await sectionShot('21-sources-collector','#collectorSection');
 await sectionShot('22-sources-merge','#sourceMergePanel');
 await sectionShot('23-sources-repair','#sourceRepairSection');
 const sourceModal=await click('#sourcesUrlBtn');
 const consentVisible=await page.evaluate(()=>!!document.querySelector('dialog.iptv-legal-consent[open]'));
 if(sourceModal==='clicked'&&consentVisible){
  await sectionShot('24-sources-legal-usage-confirmation','dialog.iptv-legal-consent');
  // Inspect the rights notice without checking the legal attestation.
  // The gallery must cancel; never silently accept rights or import a source.
  await click('dialog.iptv-legal-consent .iptv-legal-actions button:first-child');
  const stillOpen=await page.evaluate(()=>!!document.querySelector('dialog.iptv-legal-consent[open]'));
  if(stillOpen)throw Error('Legal consent remained open after pressing Hủy');
 }else if(sourceModal==='clicked'&&await page.evaluate(()=>!document.getElementById('modal')?.classList.contains('hidden'))){
  await sectionShot('24-sources-add-url-modal','#modal');
  await click('#modalCancel');
 }else issues.push({type:'unavailable-feature',name:'sourcesUrlLegalNotice'});
 await nav('health');
 await sectionShot('25-health-failover','#page-health');
 await nav('doctor');
 await sectionShot('26-doctor-smart','#page-doctor');
 await nav('profiles');
 await sectionShot('27-profiles-parental','#page-profiles');
 await nav('multiview');
 await sectionShot('28-multiview-four-tiles','#multiGrid');
 await nav('shots');
 await sectionShot('29-snapshots','#page-shots');
 await nav('folders');
 await sectionShot('30-folders','#page-folders');
 await nav('settings');
 for(const [id,selector] of [
  ['31-settings-style','#uiStyleSettings'],['32-settings-appearance','#appearanceSettings'],
  ['33-settings-backup','#backupSettings'],['34-settings-language','#languageSettings'],
  ['35-settings-freeze-monitor','#freezeMonitorSettings'],
  ['36-settings-performance','#fullFeatureTools'],['37-settings-epg','#epgSettingsCard'],
  ['38-settings-pip','#pipAutoSettings'],['39-settings-ai-hardware','#rustAIHardwareSettings'],
  ['40-settings-updates','.update-settings']]){
  await sectionShot(id,selector);
 }
 await page.evaluate(()=>{document.documentElement.dataset.theme='dark';});
 await nav('tv');await shot('41-dark-tv-controls','.player-control-card');
 await nav('settings');await shot('42-dark-settings','#appearanceSettings');
 await page.evaluate(()=>{document.documentElement.dataset.theme='amoled';});
 await nav('tv');await shot('43-amoled-tv-controls','.player-control-card');
 await nav('settings');await shot('44-amoled-settings','#appearanceSettings');
 fs.writeFileSync(path.join(out,'gallery-audit.json'),JSON.stringify({
  runtime:'Rust Lab renderer loaded in Chromium without native Tauri bridge',
  commit:process.env.GITHUB_SHA||null,shots:steps.length,
  entries:steps,issues,rendererErrors:runtimeErrors.slice(0,30)
 },null,2));
 console.log('RUST FEATURE GALLERY',steps.length,'screenshots;',issues.length,'review notes');
 await browser.close();
 if(steps.length<32)throw Error('Incomplete feature screenshot coverage: '+steps.length);
}
main().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'fatal-error.txt'),String(e.stack||e));process.exitCode=1;});
