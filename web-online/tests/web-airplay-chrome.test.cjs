'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const sender=fs.readFileSync(path.join(root,'web-cast-sender.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'web-cast-v2.js'),'utf8');
function browser(userAgent,{webkit=false,remote=false}={}){
 const elements={};for(const id of ['video','castModal','castTitle','castChannel','castGoogleHint','castScan','castPlay','castDevices','castStatus','castAirplay','airplaySection','airplayScan','airplayDeviceList','airplayMobileHelp','castLanHint','castLink','castCopy','castUrl','castStop']){
  elements[id]={disabled:false,hidden:false,dataset:{},textContent:'',value:'',addEventListener(){},
   classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},add(){}};
 }
 let airClicks=0,remoteClicks=0;
 if(webkit)elements.video.webkitShowPlaybackTargetPicker=()=>airClicks++;
 if(remote)elements.video.remote={prompt:()=>{remoteClicks++;return Promise.resolve()},addEventListener(){}};
 const document={getElementById:id=>elements[id],createElement:()=>({dataset:{}}),head:{appendChild(){}}};
 const win={document,navigator:{userAgent,maxTouchPoints:0},streamleaf:null,location:{href:'https://example.test/app'}};
 vm.runInNewContext(sender,{window:win,URL,Option:function(){},Promise,console},{filename:'web-cast-sender.js'});
 win.OpenIPTVWebCast.open({id:'vtv1',name:'VTV1',group:'VTV'},'https://example.test/live.m3u8');
 return {api:win.OpenIPTVWebCast,elements,air:()=>airClicks,remote:()=>remoteClicks};
}
test('Chrome macOS remote prompt is not Apple AirPlay and button remains enabled',()=>{
 const h=browser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/158.0 Safari/537.36',{remote:true});
 assert.equal(h.api.canAirPlay(),false);assert.equal(h.api.airplayPicker(),false);
 assert.equal(h.remote(),0);assert.equal(h.elements.castAirplay.disabled,false);
 assert.match(h.elements.castAirplay.textContent,/Chrome/);
});
test('Safari macOS still launches real Apple AirPlay picker',()=>{
 const h=browser('Mozilla/5.0 (Macintosh; Intel Mac OS X) Version/18.6 Safari/605.1.15',{webkit:true});
 assert.equal(h.api.canAirPlay(),true);assert.equal(h.api.airplayPicker(),true);assert.equal(h.air(),1);
});
test('iOS Chrome WebKit native picker is allowed where exposed',()=>{
 const h=browser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) CriOS/130.0 Mobile Safari/604.1',{webkit:true});
 assert.equal(h.api.canAirPlay(),true);assert.equal(h.api.airplayPicker(),true);assert.equal(h.air(),1);
});
test('V2 Chrome fallback is clickable and offers macOS mirroring or Google Cast',()=>{
 assert.match(ui,/button\.disabled=false/);assert.match(ui,/cxAirChromeHelp/);
 assert.match(ui,/cxAirUseCast/);assert.match(ui,/setMode\('cast'\)/);
 assert.match(ui,/Phản chiếu màn hình/);assert.match(ui,/OpenIPTVWebCast\?\.canAirPlay/);
});
