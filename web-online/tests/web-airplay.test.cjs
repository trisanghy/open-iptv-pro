'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const castCode=fs.readFileSync(path.join(root,'cast-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const webCss=fs.readFileSync(path.join(root,'web-only.css'),'utf8');
function harness({ua='Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)',picker=true,throws=false,remote=false,v2=true}={}){
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
 const opens=[];
 const window={streamleaf:null,addEventListener:()=>{}};
 if(v2)window.OpenIPTVWebCastV2={open:options=>opens.push(options)};
 vm.runInNewContext(castCode,{document,navigator,window,console,Promise,Option:function(){}},{filename:'cast-ui.js'});
 return {api:window.OpenIPTVCastUI,el,calls:()=>calls,remoteCalls:()=>remoteCalls,opens:()=>opens};
}
test('iPhone Safari opens Cast V2 first; AirPlay native picker stays closed',()=>{
 const h=harness();h.api.open({name:'VTV1',group:'VTV'},'https://example.com/live.m3u8');
 assert.equal(h.opens().length,1);
 assert.equal(h.opens()[0].channel.name,'VTV1');
 assert.equal(h.opens()[0].source,'https://example.com/live.m3u8');
 assert.equal(h.calls(),0);
 assert.equal(h.el.castModal.classList.contains('hidden'),true);
});
test('Chrome iPhone opens the same three tabs without auto AirPlay',()=>{
 const h=harness({ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148 Safari/604.1'});
 h.api.open({name:'VTV2'},'https://example.com/two.m3u8');
 assert.equal(h.opens().length,1);
 assert.equal(h.calls(),0);
 assert.equal(h.remoteCalls(),0);
});
test('iPad without AirPlay picker can still open the Cast UI',()=>{
 const h=harness({ua:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)',picker:false});
 h.api.open({name:'VTV3'},'https://example.com/three.m3u8');
 assert.equal(h.opens().length,1);
 assert.equal(h.el.castModal.classList.contains('hidden'),true);
});
test('no Cast V2 fallback must not open native AirPlay',()=>{
 const h=harness({v2:false,throws:true});
 h.api.open({name:'VTV1'},'https://example.com/live.m3u8');
 assert.equal(h.calls(),0);
 assert.equal(h.el.castModal.classList.contains('hidden'),false);
 assert.equal(h.el.castModal.dataset.airplayMobile,'false');
 assert.match(h.el.castStatus.textContent,/Chrome/);
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
test('desktop Chrome opens Cast V2 without auto remote playback',()=>{
 const h=harness({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',picker:false,remote:true});
 h.api.open({name:'VTV2'},'https://example.com/live.m3u8');
 assert.equal(h.opens().length,1);
 assert.equal(h.remoteCalls(),0);
 assert.equal(h.el.castModal.classList.contains('hidden'),true);
});
test('AirPlay picker only comes from explicit AirPlay-tab button',()=>{
 const ui=fs.readFileSync(path.join(root,'web-cast-v2.js'),'utf8');
 const sender=fs.readFileSync(path.join(root,'web-cast-sender.js'),'utf8');
 assert.match(ui,/cxAirOpen'\)\.addEventListener\('click'/);
 assert.match(ui,/OpenIPTVWebCast\?\.airplayPicker\?\.\(\)/);
 assert.match(sender,/function airplayPicker\(\)/);
 assert.match(ui,/iOS Chrome uses WebKit too/);
 assert.match(html,/cast-ui\.js\?v=airplay-chrome-20261123b/);
 assert.match(html,/web-cast-v2\.js\?v=airplay-chrome-20261123b/);
});
