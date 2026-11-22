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
test('Browser fallback launches the selected channel with Tizen AppControl, no proxy',()=>{
 const calls=[],notices=[],url='https://example.org/vtv2.m3u8?source=owner';
 const tizen={ApplicationControl:function(operation,address){this.operation=operation;this.uri=address;},
  application:{launchAppControl:(control,id,onSuccess)=>{calls.push({control,id});onSuccess();}}};
 const run=vm.runInNewContext('var playing={url:'+JSON.stringify(url)+'};var playbackStream=null;\n'+src+'\nopenChannelInSamsungBrowser;',{
  tizen,byId:()=>({hidden:false,textContent:''}),notify:message=>notices.push(message),window:{open(){throw Error('should not use window.open')}}
 });
 assert.equal(run(),true);
 assert.equal(calls.length,1);
 assert.equal(calls[0].control.operation,'http://tizen.org/appcontrol/operation/view');
 assert.equal(calls[0].control.uri,url);
 assert.ok(notices.some(message=>message.includes('Samsung')));
});
test('Browser fallback uses active alternate channel URL, not another channel',()=>{
 const first='https://example.org/original.m3u8',second='https://example.org/alternate.m3u8';
 const value=vm.runInNewContext('var playing={url:'+JSON.stringify(first)+'};var playbackStream={url:'+JSON.stringify(second)+'};\n'+src+'\nbrowserFallbackUrl;',{
  byId:()=>({hidden:true,textContent:''}),notify:()=>{},window:{}});
 assert.equal(value(),second);
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
