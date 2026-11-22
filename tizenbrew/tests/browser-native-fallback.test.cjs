'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function code(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Expected code section: '+start);
 return html.slice(a,b);
}
const src=code('function setPlayerStatus(message){','function updateBottomActions(){');
test('TV offers browser fallback only after playback errors, without removing video list UI',()=>{
 assert.match(html,/<button id="browserFallback" type="button" hidden>/);
 assert.match(html,/browserButton\.hidden=false/);
 assert.match(html,/byId\('browserFallback'\)\.hidden=true/);
 assert.match(html,/openChannelInSamsungBrowser/);
 assert.match(html,/c===403\|\|k==='ColorF0Red'/);
});
test('Browser fallback opens the Cast player page rather than a raw M3U8 URL',()=>{
 const calls=[],notices=[],url='https://example.org/vtv2.m3u8?source=owner';
 let stopped=0;
 const tizen={ApplicationControl:function(operation,address){this.operation=operation;this.uri=address;},
  application:{launchAppControl:(control,id,onSuccess)=>{calls.push({control,id});onSuccess();}}};
 const run=vm.runInNewContext('var playing={url:'+JSON.stringify(url)+'};var playbackStream=null;\n'+src+'\nopenChannelInSamsungBrowser;',{
  tizen,byId:()=>({hidden:false,textContent:''}),notify:message=>notices.push(message),
  stopPlaybackEngine:()=>{stopped++;},
  window:{open(){throw Error('should not use window.open')}}
 });
 assert.equal(run(),true);
 assert.equal(calls.length,1);
 assert.equal(calls[0].control.operation,'http://tizen.org/appcontrol/operation/view');
 const target=calls[0].control.uri;
 assert.match(target,/^https:\/\/trisanghy\.github\.io\/open-iptv-pro\/tizen\/hosted-player\.html\?v=/);
 assert.ok(target.includes('#stream='));
 assert.equal(decodeURIComponent(target.split('#stream=')[1]),url);
 assert.ok(!target.split('#')[0].includes(url),'Private URL must stay out of the HTTPS request path/query');
 assert.equal(stopped,1,'Only one playback engine should remain after launching Samsung Browser');
 assert.ok(notices.some(message=>message.includes('Cast')));
});
test('Native Samsung Browser handoff uses active alternate URL and keeps failure state if launch is rejected',()=>{
 const active='https://example.org/alternate.m3u8',calls=[];
 const tizen={ApplicationControl:function(operation,address){this.uri=address;},
  application:{launchAppControl:(control,id,ok,fail)=>{calls.push(control.uri);fail(Error('no browser'));}}};
 let stopped=0;
 const run=vm.runInNewContext('var playing={url:"https://example.org/original.m3u8"};var playbackStream={url:'+JSON.stringify(active)+'};\n'+src+'\nopenChannelInSamsungBrowser;',{
 tizen,byId:()=>({hidden:false,textContent:''}),notify(){},stopPlaybackEngine:()=>{stopped++;},
 window:{open(){return null;}}
 });
 assert.equal(run(),true,'AppControl launch request was submitted');
 assert.equal(decodeURIComponent(calls[0].split('#stream=')[1]),active);
 assert.equal(stopped,0,'Do not stop TizenBrew if browser launch fails');
});
test('Browser fallback uses active alternate channel URL, not another channel',()=>{
 const first='https://example.org/original.m3u8',second='https://example.org/alternate.m3u8';
 const value=vm.runInNewContext('var playing={url:'+JSON.stringify(first)+'};var playbackStream={url:'+JSON.stringify(second)+'};\n'+src+'\nbrowserFallbackUrl;',{
  byId:()=>({hidden:true,textContent:''}),notify:()=>{},window:{}});
 assert.equal(value(),second);
});
test('Browser Cast handoff refuses HTTP sources to avoid mixed-content playback',()=>{
 const browser=vm.runInNewContext('var playing={url:"http://example.org/live.m3u8"};var playbackStream=null;\n'+src+'\nbrowserCastHandoffUrl;',{
  byId:()=>({hidden:true,textContent:''}),notify(){},window:{}
 });
 assert.equal(browser(),'');
});
test('Browser fallback rejects unknown or unsafe protocols',()=>{
 const browser=vm.runInNewContext('var playing={url:"javascript:alert(1)"};var playbackStream=null;\n'+src+'\nbrowserFallbackUrl;',{
  byId:()=>({hidden:true,textContent:''}),notify:()=>{},window:{}});
 assert.equal(browser(),'');
});
test('Standalone package files include native Samsung manifest and immutable packaging source',()=>{
 const root=path.join(__dirname,'../..');
 const config=fs.readFileSync(path.join(root,'tizen-native/config.xml'),'utf8');
 const build=fs.readFileSync(path.join(root,'tizen-native/build.py'),'utf8');
 assert.match(config,/<tizen:profile name="tv-samsung"\/>/);
 assert.match(config,/tizen:privilege name="http:\/\/tizen.org\/privilege\/internet"/);
 assert.match(build,/"supabase-sdk\.js"/);
 assert.match(build,/"hls\.min\.js"/);
 assert.match(build,/Sign with Samsung TV certificate/);
});
