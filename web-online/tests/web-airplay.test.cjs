'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const castCode=fs.readFileSync(path.join(root,'cast-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const webCss=fs.readFileSync(path.join(root,'web-only.css'),'utf8');
function harness({ua='Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)',picker=true,throws=false,remote=false}={}){
 const el={},handlers={};
 for(const id of ['castBtn','castModal','castClose','castDone','castChannel','castUrl','castCopy','castStatus','castTitle','castDevices','castScan','castPlay','castAirplay','castLink','castStop','airplaySection','airplayMobileHelp','airplayScan','airplayDeviceList','video']){
  const classes=new Set(id==='castModal'?['hidden']:[]);
  el[id]={id,disabled:false,hidden:false,dataset:{},value:'',textContent:'',attributes:{},
   classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,b)=>b?classes.add(x):classes.delete(x)},
   addEventListener:(event,fn)=>{handlers[id+':'+event]=fn},
   setAttribute:function(k,v){this.attributes[k]=v}};
 }
 let calls=0,remoteCalls=0;
 if(picker)el.video.webkitShowPlaybackTargetPicker=()=>{calls++;if(throws)throw Error('blocked by webview');};
 if(remote)el.video.remote={prompt:()=>{remoteCalls++;return Promise.resolve();}};
 const document={getElementById:id=>el[id]||null};
 const navigator={userAgent:ua,platform:ua.includes('Windows')?'Win32':'iPhone',maxTouchPoints:5};
 const window={streamleaf:null,addEventListener:()=>{}};
 vm.runInNewContext(castCode,{document,navigator,window,console,Promise,Option:function(){}},{filename:'cast-ui.js'});
 return {api:window.OpenIPTVCastUI,el,calls:()=>calls,remoteCalls:()=>remoteCalls};
}
test('iPhone opens native AirPlay picker directly, without the desktop dialog',()=>{
 const h=harness();h.api.open({name:'VTV1',group:'VTV'},'https://example.com/live.m3u8');
 assert.equal(h.calls(),1);
 assert.equal(h.el.castModal.classList.contains('hidden'),true);
 assert.equal(h.el.video.disableRemotePlayback,false);
 assert.equal(h.el.video.attributes['x-webkit-airplay'],'allow');
});
test('embedded browser lacking AirPlay exposes an understandable iOS guide',()=>{
 const h=harness({picker:false});h.api.open({name:'VTV1'},'https://example.com/live.m3u8');
 assert.equal(h.el.castModal.classList.contains('hidden'),false);
 assert.equal(h.el.castModal.dataset.airplayMobile,'true');
 assert.equal(h.el.airplayMobileHelp.hidden,false);
 assert.equal(h.el.castAirplay.disabled,true);
 assert.match(h.el.castStatus.textContent,/Safari/);
});
test('blocked AirPlay picker falls back to the iOS guide safely',()=>{
 const h=harness({throws:true});h.api.open({name:'VTV1'},'https://example.com/live.m3u8');
 assert.equal(h.calls(),1);
 assert.equal(h.el.castModal.dataset.airplayMobile,'true');
});
test('desktop continues to use the existing Cast dialog',()=>{
 const h=harness({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',picker:false});
 h.api.open({name:'VTV1'},'https://example.com/live.m3u8');
 assert.equal(h.el.castModal.classList.contains('hidden'),false);
 assert.equal(h.el.castModal.dataset.airplayMobile,'false');
 assert.equal(h.el.castScan.disabled,true);
});
test('video opts into WebKit AirPlay and retains remote playback',()=>{
 assert.match(html,/<video id="video"[^>]+x-webkit-airplay="allow"/);
 assert.doesNotMatch(html,/<video id="video"[^>]+disableremoteplayback/);
 assert.match(castCode,/webkitShowPlaybackTargetPicker/);
 assert.match(castCode,/video\.remote\?\.prompt/);
});

test('Web edition keeps the original Cast button visible beside PiP',()=>{
 assert.match(html, /id="castBtn"[^>]*aria-label="Cast \/ AirPlay lên TV"/);
 assert.match(html, /id="castBtn"[^>]*>[\s\S]*?<svg[^>]*data-iptv-svg-icon="cast"/);
 assert.doesNotMatch(webCss, /#castBtn\b[^{}]*\{\s*display\s*:\s*none/i);
});
test('desktop browser invokes a supported native remote playback picker',()=>{
 const h=harness({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',picker:false,remote:true});
 h.api.open({name:'VTV2'},'https://example.com/live.m3u8');
 assert.equal(h.remoteCalls(),1);
 assert.equal(h.el.castModal.classList.contains('hidden'),true);
});
test('desktop browser without remote picker shows actionable Cast instructions',()=>{
 const h=harness({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',picker:false});
 h.api.open({name:'VTV2'},'https://example.com/live.m3u8');
 assert.equal(h.el.castModal.classList.contains('hidden'),false);
 assert.match(h.el.castStatus.textContent,/Chrome/);
 assert.equal(h.el.castScan.disabled,true);
});
