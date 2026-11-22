'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../tizen/hosted-player.html'),'utf8');
const code=html.match(/<script>([\s\S]+?)<\/script>/);
assert.ok(code,'Cast hosted player must have a script');
function run(hash,standalone=true){
 const events={},messages=[],historyPaths=[],playCalls=[],status={textContent:''},panel={hidden:true};
 const video={
  src:'',controls:false,paused:true,ended:false,
  canPlayType:()=> 'probably',
  addEventListener:(type,fn)=>events[type]=fn,
  play(){this.paused=false;playCalls.push(this.src);return Promise.resolve();},
  pause(){this.paused=true;},removeAttribute(k){if(k==='src')this.src='';},load(){}
 };
 const browserPlay={onclick:null};
 const elements={castVideo:video,browserPanel:panel,browserStatus:status,browserPlay};
 const win={addEventListener:(type,fn)=>events[type]=fn,Hls:null};
 win.top=standalone?win:{};
 const context={
  window:win,
  location:{hash,pathname:'/open-iptv-pro/tizen/hosted-player.html',search:'?v=20261122c'},
  history:{replaceState:(s,t,url)=>historyPaths.push(url)},
  document:{getElementById:id=>elements[id]},
  parent:{postMessage:(data,target)=>messages.push({data,target})},
  Promise,Error,decodeURIComponent
 };
 vm.runInNewContext(code[1],context);
 return {events,messages,historyPaths,playCalls,video,elements,win,context};
}
test('Samsung Internet standalone Cast page accepts URL in fragment and immediately erases it',()=>{
 const raw='https://cdn.example.org/vtv2/index.m3u8?token=sensitive&quality=hd';
 const s=run('#stream='+encodeURIComponent(raw));
 assert.deepEqual(s.playCalls,[raw]);
 assert.equal(s.video.controls,true);
 assert.equal(s.historyPaths.length,1);
 assert.equal(s.historyPaths[0],'/open-iptv-pro/tizen/hosted-player.html?v=20261122c');
 assert.ok(!s.historyPaths[0].includes('sensitive'));
 assert.equal(s.elements.browserPanel.hidden,false);
 assert.match(s.elements.browserStatus.textContent,/Cast Samsung Browser/);
});
test('Invalid / non-HTTPS stream never plays in Cast standalone page',()=>{
 for(const url of ['javascript:alert(1)','http://example.org/a.m3u8','file:///etc/passwd']){
  const s=run('#stream='+encodeURIComponent(url));
  assert.equal(s.playCalls.length,0);
  assert.match(s.elements.browserStatus.textContent,/không hợp lệ|HTTPS/);
 }
});
test('Retry button replays same channel, not another playlist URL',()=>{
 const raw='https://cdn.example.org/vtv3.m3u8';
 const s=run('#stream='+encodeURIComponent(raw));
 s.elements.browserPlay.onclick();
 assert.deepEqual(s.playCalls,[raw,raw]);
});
test('Embedded iframe uses parent messaging only; it never parses a standalone URL fragment',()=>{
 const s=run('#stream='+encodeURIComponent('https://should-not-play.example/video.m3u8'),false);
 assert.equal(s.playCalls.length,0);
 assert.equal(s.elements.browserPanel.hidden,true);
 assert.equal(s.messages.length,1);
 assert.equal(s.messages[0].data.type,'ready');
});
test('Web deployment publishes the Cast HTML page alongside HLS.js and DASH.js',()=>{
 const deploy=fs.readFileSync(path.join(__dirname,'../.github/workflows/deploy-openiptv-web.yml'),'utf8');
 assert.match(deploy,/cp -p tizen\/hosted-player\.html _site\/tizen\/hosted-player\.html/);
 assert.match(deploy,/hls\.min\.js/);
 assert.match(deploy,/dash\.all\.min\.js/);
});
