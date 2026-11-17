'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v4.23.60: active UI has one settings icon and one layout controller',()=>{
 const html=read('renderer/index.html');
 assert.equal((html.match(/id="liveCaptionSetup"/g)||[]).length,1);
 assert.equal((html.match(/id="liveCaptionSetupPanel"/g)||[]).length,1);
 assert.equal((html.match(/unified-ai-settings-v42356\.js/g)||[]).length,1);
 assert.equal((html.match(/unified-ai-settings-v42356\.css/g)||[]).length,1);
 assert(!html.includes('unified-ai-settings-v42354.js'));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.60');
});

test('v4.23.60: moves existing Whisper controls instead of cloning or recreating their click listeners',()=>{
 const ui=read('renderer/unified-ai-settings-v42356.js');
 for(const id of ['captionAutoInstall','captionChooseBinary','captionChooseModel','captionTestTranslate']){
  assert(ui.includes("'"+id+"'"),id);
 }
 assert.match(ui,/actions\.append\(button\)/);
 assert.match(ui,/panel\.insertBefore\(recognition,translation/);
 assert.match(ui,/panel\.dataset\.aiLayout==='v55'/);
 assert.match(ui,/panel\.classList\.add\('ai-settings-grid'\)/);
 assert.match(ui,/decorate\(translation,'02','ai-translation'\)/);
 assert.match(ui,/decorate\(voice,'03','ai-voice'\)/);
 assert.match(ui,/decorate\(storage,'04','ai-storage'\)/);
 assert.match(ui,/field\.append\(label,select\)/);
 assert.match(ui,/details\.append\(modelList\)/);
});

test('v4.23.60: responsive CSS aligns recognition buttons and pairs translation/TTS cards',()=>{
 const css=read('renderer/unified-ai-settings-v42356.css');
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.ai-recognition-actions/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.ai-translation \.ai-field/);
 assert.match(css,/\.ai-voice \.ai-settings-actions/);
 assert.match(css,/\.ai-storage-details \.ai-model-list/);
 assert.match(css,/@media \(max-width:900px\)/);
 assert.match(css,/@media \(max-width:570px\)/);
 assert.match(css,/@media \(max-width:380px\)/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.ai-alert-leaving/);
});

test('v4.23.60: the orange warning fades after 9.75 seconds and hides after 10',()=>{
 const source=read('renderer/unified-ai-settings-v42356.js');
 const i=source.indexOf(' let heatTimer=null');
 const j=source.indexOf(' for(const el of [caption,translate,tts])',i);
 assert(i>0&&j>i,'Expected temporary orange warning logic');
 const snippet=source.slice(i,j);
 const timers=new Map();let next=1,clock=0;
 const calls={timer:0};
 function setTimer(fn,delay){const id=next++;timers.set(id,{at:clock+delay,fn});return id;}
 function advance(delta){
  const end=clock+delta;
  while(true){
   const first=[...timers.entries()].filter(([,v])=>v.at<=end)
    .sort((a,b)=>a[1].at-b[1].at)[0];
   if(!first)break;
   timers.delete(first[0]);clock=first[1].at;first[1].fn();
  }
  clock=end;
 }
 function element(){
  const css=new Set();
  return {hidden:true,textContent:'',classList:{
   add:k=>css.add(k),remove:k=>css.delete(k),contains:k=>css.has(k)}};
 }
 const warning=element(),inlineWarning=element();
 const caption={checked:true},translate={checked:true},tts={checked:true};
 const context={warning,inlineWarning,caption,translate,tts,latest:null,
  getEngine:()=> 'auto',getMode:()=> 'balanced',
  setTimeout:setTimer,clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(snippet+'; globalThis.warningTest={showHeatWarning,hideHeatWarning};',context);
 const {showHeatWarning}=context.warningTest;
 showHeatWarning();
 assert.equal(warning.hidden,false);assert.equal(inlineWarning.hidden,false);
 advance(9749);
 assert.equal(warning.hidden,false);
 advance(1);
 assert.equal(warning.classList.contains('ai-alert-leaving'),true);
 advance(250);
 assert.equal(warning.hidden,true);
 assert.equal(inlineWarning.hidden,true);
 showHeatWarning(); // periodic refresh of unchanged AI combination
 assert.equal(warning.hidden,true,'Dismissal must not reappear on a routine refresh');
 assert.equal(timers.size,0);
 caption.checked=false;translate.checked=false;tts.checked=false;
 showHeatWarning();
 caption.checked=true;translate.checked=true;
 showHeatWarning();
 assert.equal(warning.hidden,false,'New workload activation should warn again');
});

test('v4.23.60: model buttons and source files remain intact; Mac output stays DMG plus source ZIP',()=>{
 const ui=read('renderer/unified-ai-settings-v42356.js');
 for(const marker of ['aiDeleteModel','aiInstallModel','Xác nhận xóa','aiStorageTotal','liveTtsPreview','aiResourceMode']){
  assert(ui.includes(marker)||read('renderer/index.html').includes(marker),marker);
 }
 const pkg=JSON.parse(read('package.json'));
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
