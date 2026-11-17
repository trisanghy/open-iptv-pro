'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const {createController}=require('../renderer/auto-pip-v42363.js');
function simulate(){
 const calls=[],video={readyState:4,paused:false,ended:false,volume:.8,muted:false,currentTime:0,
  requestPictureInPicture:()=>Promise.reject(Error('NotAllowedError')),
  addEventListener(){},pause(){this.paused=true;calls.push('pause');},play(){this.paused=false;calls.push('resume');return Promise.resolve()}};
 const storage=new Map(),bridge={
  pipOpen:async()=>{calls.push('open');return {opened:true,id:'pip1'};},
  pipClose:async()=>{calls.push('close');return {closed:true};}
 };
 const control=createController({video,doc:{pictureInPictureEnabled:true,visibilityState:'visible'},
  storage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  getPage:()=> 'tv',bridge,getStream:()=>({url:'https://cdn.example/live.m3u8',title:'Live'})});
 return {control,video,calls,storage};
}
test('Fallback opens when HTML PiP is denied, pauses the main player only after mini plays',async()=>{
 const s=simulate();assert.equal(await s.control.manual(),true);assert.equal(s.video.paused,false);
 assert.ok(s.calls.includes('open'));s.control.onMiniEvent({type:'playing',id:'pip1'});
 assert.equal(s.video.paused,true);s.control.onMiniEvent({type:'closed'});
 assert.equal(s.video.paused,false);
});
test('PiP options retain three independent preferences',()=>{
 const s=simulate();
 assert.equal(s.control.getOption('navigate'),true);
 assert.equal(s.control.getOption('minimize'),false);assert.equal(s.control.getOption('blur'),false);
 s.control.setOption('minimize',true);s.control.setOption('blur',true);
 assert.equal(s.storage.get('openiptv-pip-on-minimize-v1'),'true');
 assert.equal(s.storage.get('openiptv-pip-on-blur-v1'),'true');
});
test('Backend creates private native window, checks caller and relays ready event',()=>{
 const native=read('src-tauri/src/pip.rs'),ipc=read('src-tauri/src/bridge.rs');
 assert.ok(native.includes('WebviewWindowBuilder::new(app,"pip",WebviewUrl::App("pip.html".into()))'));
 assert.ok(native.includes('.always_on_top(true)'));assert.ok(native.includes('stream::valid_http_url(url)?'));
 for(const op of ['pip:open','pip:session','pip:playing','pip:failed','pip:close'])assert.ok(ipc.includes('"'+op+'"'));
 assert.ok(ipc.includes('window.label()!="pip"'));
 const client=read('renderer/pip-player.js');
 assert.ok(client.includes("invoke('pip:session')"));assert.ok(client.includes("invoke('media:proxy',session.url)"));
 assert.ok(client.includes("invoke('pip:playing',{id:session.id})"));
 assert.ok(read('renderer/features.js').includes('OpenIPTVAutoPiP.manual()'));
});
test('Correct version and single-app Mac builder',()=>{
 const p=JSON.parse(read('package.json'));
 assert.equal(p.version,'4.23.17-tauri.23.8.13');
 const sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(sh.includes('TAG="rust-lab/v23.8.13"'));
 assert.ok(sh.includes('npm run build -- --bundles app'));
});
