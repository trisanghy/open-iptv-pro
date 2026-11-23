'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('Cast Web Sender opens real SDK picker synchronously',async()=>{
 let calls=0;
 const ctx={getCurrentSession:()=>null,requestSession:()=>{calls++;return Promise.resolve();},setOptions(){},addEventListener(){}};
 const window={document:{getElementById:()=>null},cast:{framework:{CastContext:{getInstance:()=>ctx},CastContextEventType:{SESSION_STATE_CHANGED:'state'}}},chrome:{cast:{media:{DEFAULT_MEDIA_RECEIVER_APP_ID:'CC1AD845'},AutoJoinPolicy:{ORIGIN_SCOPED:'origin'}}},navigator:{userAgent:'Chrome/158.0'},location:{href:'https://trisanghy.github.io/open-iptv-pro/'}};
 vm.runInNewContext(read('web-cast-sender.js'),{window,URL,Promise});
 assert.equal(window.OpenIPTVWebCast.getState().initialized,true);
 const p=window.OpenIPTVWebCast.scan();assert.equal(calls,1);await p;
});
test('Main Cast prefers native SDK on desktop Chrome with 3-tab fallback',()=>{
 const ui=read('cast-ui.js'),v2=read('web-cast-v2.js'),html=read('index.html');
 assert.match(ui,/autoCast:true/);
 assert.match(v2,/const directPicker=!!autoCast&&desktopChromiumCast\(\)&&!!castState\(\)\.initialized/);
 assert.match(v2,/if\(directPicker\)launchCastPicker\(\)/);
 assert.match(v2,/if\(b\.dataset\.cxMode==='cast'\)launchCastPicker\(\)/);
 assert.match(v2,/setMode\(directPicker\?'cast':'pair'\)/);
 assert.match(html,/web-cast-v2\.js\?v=cast-native-picker-20261123c/);
});
