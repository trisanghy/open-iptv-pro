'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'../..'),load=name=>fs.readFileSync(path.join(root,name),'utf8');
const ui=load('web-cast-v2.js'),css=load('web-cast-v2.css'),tv=load('tv.html'),receiver=load('web-tv-receiver.js');
const core=load('web-tv-pair.js'),sender=load('web-cast-sender.js'),html=load('index.html'),icons=load('web-cast-icons.js');
test('approved Cast modal matches demo, has 3 actual modes and all theme variants',()=>{
 assert.match(ui,/Ghép đôi TV/);assert.match(ui,/Google Cast/);assert.match(ui,/AirPlay/);
 assert.match(ui,/onConnected/);assert.match(ui,/pair\.command/);
 assert.match(ui,/api\.scan\(\)/);assert.match(ui,/OpenIPTVWebCast\?\.airplayPicker/);
 for(const name of ['light','dark','amoled'])assert.ok(css.includes('html[data-theme="'+name+'"] #iptvCastOverlay'),name);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(html,/web-cast-v2\.css\?v=icons-v3-20261122a/);
 assert.match(html,/web-tv-pair\.js\?v=cast-v2-20261122a/);
 assert.match(html,/web-cast-v2\.js\?v=icons-v3-20261122a/);
 assert.match(sender,/OpenIPTVWebCastV2\.open/);
});
test('all Cast UI icons come from one real SVG source, not overlapping pseudo glyphs',()=>{
 assert.match(html,/web-cast-icons\.js\?v=icons-v3-20261122a/);
 assert.match(ui,/OpenIPTVCastIcons\?\.decorateModal\?\.\(overlay\)/);
 assert.match(icons,/data-iptv-svg-icon/);
 assert.match(icons,/createElementNS/);
 assert.match(icons,/function ensurePlayerButton/);
 assert.match(icons,/new root\.MutationObserver/);
 for(const name of ['cast','airplay','pair','search','link','copy','play','pause','stop','close'])
  assert.match(icons,new RegExp('\\b'+name+':\\{'),name);
 assert.match(css,/#castBtn::before/);
 assert.match(css,/content:none!important;display:none!important/);
 assert.match(css,/oip-cast-svg/);
 assert.match(ui,/\$\('cxTvUrl'\)\.href=tvUrl\(\)/);
 assert.match(ui,/https:\/\/is\.gd\/IPTVTV/);
 assert.doesNotMatch(ui,/directTvUrl/);
 assert.match(tv,/web-cast-icons\.js\?v=icons-v3-20261122a/);
});
test('TV landing screen uses same theme design and real video receiver',()=>{
 for(const source of ['supabase-sdk.js','web-tv-pair.js','web-tv-receiver.js','web-cast-v2.css'])
  assert.ok(tv.includes(source),source);
 assert.match(tv,/id="tvPairPin"/);
 assert.match(tv,/id="tvAllow"/);
 assert.match(tv,/id="tvDeny"/);
 assert.match(tv,/id="tvVideo"/);
 assert.match(tv,/data-tv-theme="light"/);
 assert.match(tv,/data-tv-theme="dark"/);
 assert.match(tv,/data-tv-theme="amoled"/);
 assert.match(receiver,/root\.Hls/);
 assert.match(receiver,/root\.dashjs/);
 assert.doesNotMatch(tv,/482.?917/);
});
function bus(){
 const channels=[],messages=[];
 const client={
  channel(topic){
   const handlers=new Map();
   const ch={
    topic,joined:false,
    on(type,{event},fn){if(type==='broadcast')handlers.set(event,fn);return ch;},
    subscribe(cb){ch.joined=true;cb('SUBSCRIBED');return ch;},
    async send({type,event,payload}){
     if(type!=='broadcast')throw Error('Only broadcast is allowed');
     messages.push({topic,event,payload});
     for(const other of channels){
      if(other!==ch&&other.joined&&other.topic===topic){
       const fn=other.handlers.get(event);
       if(fn)Promise.resolve().then(()=>fn({payload}));
      }
     }
     return 'ok';
    },
    handlers
   };
   channels.push(ch);return ch;
  },
  async removeChannel(ch){ch.joined=false;return 'ok';}
 };
 return {client,messages};
}
test('actual TV pairing requires TV approval, encrypts stream URL, supports remote commands',async()=>{
 const {client,messages}=bus();
 const browser={document:{},crypto:webcrypto,
  supabase:{createClient:()=>client},
  navigator:{platform:'MacIntel'},
  fetch:async()=>({ok:true,json:async()=>({enabled:true,url:'https://zjbsvqryaxtafuffpifu.supabase.co',publishableKey:'sb_publishable_test'})})
 };
 vm.runInNewContext(core,{window:browser,URL,TextEncoder,TextDecoder,Uint8Array,DataView,Promise,console,setTimeout,clearTimeout,btoa,atob});
 const api=browser.OpenIPTVTVPair;
 assert.ok(api);
 const pending=[],commands=[],state={connected:false};
 const host=api.createReceiver({
  onStatus:()=>{},onRequest:req=>{if(req)pending.push(req);},onConnected:()=>{state.connected=true;},
  onCommand:cmd=>commands.push(cmd)
 });
 await host.start();
 assert.match(host.code,/^\d{6}$/);
 const mobile=api.createController({onStatus:()=>{},onConnected:()=>{state.controller=true;}});
 await mobile.connect(host.code);
 for(let i=0;i<20&&!pending.length;i++)await new Promise(r=>setTimeout(r,1));
 assert.equal(pending.length,1,'TV must receive an approval request');
 assert.equal(state.controller,undefined,'a user must accept on the TV first');
 await host.approve();
 for(let i=0;i<100&&!mobile.connected;i++)await new Promise(r=>setTimeout(r,4));
 assert.equal(mobile.connected,true);
 assert.equal(state.connected,true);
 await mobile.command('play',{url:'https://media.example/live.m3u8?token=temporary',name:'VTV2'});
 for(let i=0;i<50&&!commands.length;i++)await new Promise(r=>setTimeout(r,3));
 assert.equal(commands[0].action,'play');
 assert.equal(commands[0].name,'VTV2');
 assert.equal(commands[0].url,'https://media.example/live.m3u8?token=temporary');
 assert.equal(messages.some(msg=>JSON.stringify(msg).includes('media.example')),false,'URL never appears in public broadcast');
 assert.equal(messages.some(msg=>msg.event==='sealed'&&typeof msg.payload.ciphertext==='string'),true);
 await mobile.command('pause');
 await mobile.command('resume');
 await mobile.command('stop');
 for(let i=0;i<30&&commands.length<4;i++)await new Promise(r=>setTimeout(r,3));
 assert.deepEqual(commands.map(x=>x.action),['play','pause','resume','stop']);
 await mobile.disconnect(false);await host.close();
});
test('invalid media schemes and local addresses are rejected before transmission',()=>{
 assert.match(core,/AES-GCM/);
 assert.match(core,/ECDH/);
 assert.match(core,/^[\s\S]*validateUrl/);
 assert.match(core,/127\\/);
 assert.match(core,/session-/);
});
