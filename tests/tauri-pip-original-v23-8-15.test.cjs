'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const controller=require('../renderer/auto-pip-v42363.js');
function setup(){
 const calls=[],memory=new Map(),video={
  paused:false,ended:false,readyState:4,currentTime:9,
  addEventListener(){},requestPictureInPicture(){calls.push('nativePiP');return Promise.reject(new Error('NotAllowedError'));},
  pause(){calls.push('pause');this.paused=true;}
 };
 const document={pictureInPictureEnabled:true,pictureInPictureElement:null};
 const ctrl=controller.createController({video,doc:document,storage:{
  getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,v)
 },getPage:()=> 'tv',notify:(message)=>calls.push(message)});
 return {ctrl,calls,memory,video};
}
test('Restored PiP calls native HTML video, never starts a second Tauri decoder',async()=>{
 const s=setup();
 assert.equal(await s.ctrl.manual(),false);
 assert.ok(s.calls.includes('nativePiP'));
 assert.equal(s.video.paused,false);
 assert.ok(!s.calls.some(value=>/Mini Player|pipOpen/.test(value)));
 assert.equal(s.ctrl.inPiP(),false);
});
test('Three original PiP options persist using the same keys',()=>{
 const s=setup();
 assert.equal(s.ctrl.getOption('navigate'),true);
 assert.equal(s.ctrl.getOption('minimize'),false);
 assert.equal(s.ctrl.getOption('blur'),false);
 s.ctrl.setOption('navigate',false);
 s.ctrl.setOption('minimize',true);
 s.ctrl.setOption('blur',true);
 assert.equal(s.memory.get('openiptv-pip-on-navigation-v1'),'false');
 assert.equal(s.memory.get('openiptv-pip-on-minimize-v1'),'true');
 assert.equal(s.memory.get('openiptv-pip-on-blur-v1'),'true');
});
test('Old manual PiP and automatic controller restored, no fallback module',()=>{
 const features=read('renderer/features.js');
 const control=read('renderer/auto-pip-v42363.js');
 const bridge=read('src-tauri/src/bridge.rs'),app=read('renderer/app.js');
 assert.ok(features.includes("$('#pipBtn').addEventListener('click',pictureInPicture)"));
 assert.ok(features.includes("video.requestPictureInPicture()"));
 assert.ok(control.includes("video.requestPictureInPicture()"));
 assert.ok(control.includes("onNativeEvent(type)"));
 assert.ok(!control.includes('pipOpen'));
 assert.ok(!bridge.includes('"pip:open"'));
 assert.ok(!app.includes('getActiveStreamURL:'));
 assert.ok(!read('src-tauri/src/lib.rs').includes('mod pip;'));
});
test('Release version matches immutable tag, Mac build creates exactly one app',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.17-tauri.23.8.15');
 const shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(shell.includes('TAG="rust-lab/v23.8.15"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
});
