'use strict';
/* Offline audit of renderer-owned source literals, separate from playlists, EPG and user metadata. */
const fs=require('node:fs'),path=require('node:path');
const {engine}=require('./audit-rustlab-l10n.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const modules=[
 'app.js','advanced.js','features.js','collector.js','doctor-v2.js','doctor-v3.js',
 'backup-ui.js','dvr-ui.js','cast-ui.js','smart-discovery-ui.js','source-use-consent-v1.js',
 'settings-ui.js','ui-style.js','theme-stage.js','player-ux.js','fullscreen-panels.js',
 'app-entry.js','channel-organizer.js','channel-pointer-dnd.js','snapshot-freshness.js',
 'recent-channels.js','source-edit.js','manual-link-picker.js','primary-storage.js',
 'core-browser.js','adaptive-playback.js','channel-panel-toggle.js','sidebar-compact.js',
 'video-source-aspect-v17.js','auto-pip-v42363.js','rust-ai-preferences-v23-8-4.js',
 'live-captions-v42343.js','local-tts-v42344.js','whisper-auto-v42345.js',
 'ai-hardware-advice-v42365.js','rust-ai-settings-v23-6.js','rust-native-cc-v23-8-20.js',
 'rust-subtitle-controls-v23-8-5.js','electron-player-parity-v23-8-21.js',
 'rust-electron-parity-v23-4.js','tauri-bridge.js','health-evidence.js',
 'doctor-v3-core.js','doctor-v2-core.js','epg.js','collector-core.js'
];
const locales=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
function collectLiterals(){
 const literals=new Map(),templates=new Map();
 const token=/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\x60(?:\\.|[^\x60\\])*\x60/gs;
 for(const file of modules){
  const p='renderer/'+file;
  if(!fs.existsSync(path.join(root,p)))throw Error('Missing runtime module: '+p);
  const code=read(p);
  for(const m of code.matchAll(token)){
   const value=m[0].slice(1,-1).replace(/\\n/g,' ').replace(/\\t/g,' ').trim();
   if(!/[À-ỹ]/u.test(value)||value.length<3||value.length>1000)continue;
   const item={source:value,file:p};
   if(value.includes('$'+'{'))templates.set(value,item);
   else literals.set(value,item);
  }
 }
 return {phrases:[...literals.values()],templates:[...templates.values()]};
}
function audit(){
 const {phrases,templates}=collectLiterals(),t=engine().t,byLocale={};
 for(const locale of locales){
  const missing=phrases.filter(({source})=>t(source,locale)===source||(locale!=='en'&&t(source,locale)===t(source,'en')));
  byLocale[locale]={localized:phrases.length-missing.length,total:phrases.length,percent:Number((100*(phrases.length-missing.length)/phrases.length).toFixed(1)),missing};
 }
 return {scope:'App-owned JS source literals, including markup fragments; not a fully rendered UI audit',total:phrases.length,templates,byLocale};
}
if(require.main===module){
 const report=audit(),byLocale=Object.fromEntries(Object.entries(report.byLocale).map(([l,v])=>[l,{translated:v.localized,total:v.total,percent:v.percent}]));
 console.log(JSON.stringify({scope:report.scope,byLocale,dynamicTemplateCount:report.templates.length},null,2));
 if(process.argv.includes('--details'))for(const [locale,summary] of Object.entries(report.byLocale))console.log('\n'+locale+' missing:\n'+summary.missing.map(x=>x.file+' :: '+x.source).join('\n'));
 if(process.argv.includes('--strict')&&Object.values(report.byLocale).some(x=>x.missing.length))process.exitCode=1;
}
module.exports={collectLiterals,audit};
