'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const controls={
 liveCaptionToggle:['checkbox'],liveTranslateToggle:['checkbox'],
 liveTranslateTarget:['select',['vi','en','ja'],'vi'],
 liveTtsToggle:['checkbox'],
 liveTtsLanguage:['select',['vi','en'],'vi'],
 liveTtsVoice:['select',['piper:25hours','vieneu:Hải Đăng'],'piper:25hours'],
 liveTtsSpeed:['select',['1.00','1.25'],'1.00'],
 liveTtsDuck:['select',['25','50'],'25']
};
function launch(storage){
 const nodes={};
 for(const [id,definition] of Object.entries(controls)){
  const e={id,events:[],dispatchEvent(event){this.events.push(event);}};
  if(definition[0]==='checkbox')e.checked=false;
  else {e.options=definition[1].map(value=>({value}));e.value=definition[2];}
  nodes[id]=e;
 }
 let onChange;
 const document={getElementById:id=>nodes[id]||null,
  addEventListener:(type,handler)=>{if(type==='change')onChange=handler;}};
 const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,value)};
 const window={};
 class Event{constructor(type,options){this.type=type;this.bubbles=options?.bubbles;}}
 vm.runInNewContext(read('renderer/rust-ai-preferences-v23-8-4.js'),{window,document,localStorage,console,Event});
 return {nodes,window,change:id=>onChange({target:nodes[id]})};
}
test('Live AI saves all switches, target languages, voice, speed and source volume',()=>{
 const store=new Map(),ui=launch(store),n=ui.nodes;
 n.liveCaptionToggle.checked=true;n.liveTranslateToggle.checked=true;
 n.liveTranslateTarget.value='ja';n.liveTtsToggle.checked=true;
 n.liveTtsLanguage.value='vi';n.liveTtsVoice.value='vieneu:Hải Đăng';
 n.liveTtsSpeed.value='1.25';n.liveTtsDuck.value='50';
 ui.change('liveTtsVoice');
 const restored=launch(store);
 const saved=JSON.parse(store.get('rustlab:live-ai-preferences-v1'));
 for(const [id,value] of Object.entries(saved)){
  assert.equal(restored.nodes[id].checked??restored.nodes[id].value,value,id);
 }
 restored.window.RustAiPreferences.activate();
 assert.equal(restored.nodes.liveTranslateToggle.events.length,1);
 assert.equal(restored.nodes.liveTtsToggle.events.length,1);
 restored.window.RustAiPreferences.activate();
 assert.equal(restored.nodes.liveTtsToggle.events.length,1);
});
test('Disabled modes remain disabled on restart',()=>{
 const store=new Map();const ui=launch(store);ui.change('liveTtsToggle');
 const fresh=launch(store);fresh.window.RustAiPreferences.activate();
 assert.equal(fresh.nodes.liveTtsToggle.events.length,0);
 assert.equal(fresh.nodes.liveCaptionToggle.events.length,0);
});
test('Legacy keys restore and invalid saved choices are rejected',()=>{
 const store=new Map([['rustlab:live-translate-target','ja'],['rustlab-tts-speed-v23-4','1.25']]);
 const ui=launch(store);
 assert.equal(ui.nodes.liveTranslateTarget.value,'ja');
 assert.equal(ui.nodes.liveTtsSpeed.value,'1.25');
 store.set('rustlab:live-ai-preferences-v1',JSON.stringify({liveTtsVoice:'removed',liveTtsDuck:'900',liveTtsToggle:'bad',liveCaptionToggle:true}));
 const ui2=launch(store);
 assert.equal(ui2.nodes.liveTtsVoice.value,'piper:25hours');
 assert.equal(ui2.nodes.liveTtsDuck.value,'25');
 assert.equal(ui2.nodes.liveTtsToggle.checked,false);
 assert.equal(ui2.nodes.liveCaptionToggle.checked,true);
});
test('Resume runs after all AI modules, version tag matches local Mac builder',()=>{
 const b=read('renderer/app-entry.js');
 assert.ok(b.indexOf('rust-ai-preferences-v23-8-4.js')<b.indexOf('live-captions-v42343.js'));
 assert.ok(b.indexOf('rust-ai-settings-v23-6.js')<b.indexOf('window.RustAiPreferences?.activate?.()'));
 const version=JSON.parse(read('package.json')).version.split('-tauri.')[1];
 assert.match(version,/^23\.8\.\d+$/);
 assert.ok(require('node:fs').readFileSync(require('node:path').join(__dirname,'../scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8').includes('SOURCE_REF="refs/heads/${BRANCH}"'));
});

test('Restore Caption + TTS without forcing Translate',()=>{
 const store=new Map();const ui=launch(store);ui.nodes.liveCaptionToggle.checked=true;ui.nodes.liveTtsToggle.checked=true;ui.change('liveTtsToggle');
 const fresh=launch(store);fresh.window.RustAiPreferences.activate();
 assert.equal(fresh.nodes.liveCaptionToggle.checked,true);assert.equal(fresh.nodes.liveTranslateToggle.checked,false);assert.equal(fresh.nodes.liveTtsToggle.checked,true);
});
