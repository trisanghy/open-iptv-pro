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
 assert.match(html,/web-cast-v2\.css\?v=tv-local-handoff-20261122d/);
 assert.match(html,/web-tv-pair\.js\?v=tv-local-handoff-20261122d/);
 assert.match(html,/web-cast-v2\.js\?v=cast-close-and-disconnect-20261122c/);
 assert.match(sender,/OpenIPTVWebCastV2\.open/);
});
test('all Cast UI icons come from one real SVG source, not overlapping pseudo glyphs',()=>{
 assert.match(html,/web-cast-icons\.js\?v=dual-links-20261122a/);
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
 assert.match(tv,/web-cast-icons\.js\?v=dual-links-20261122a/);
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
 client.__channels=channels;
 return {client,messages};
}
test('TV uses one-time PIN for automatic encrypted pairing and reports actual playback',async()=>{
 const {client,messages}=bus();
 const browser={document:{},crypto:webcrypto,
  supabase:{createClient:()=>client},
  navigator:{platform:'MacIntel'},
  fetch:async()=>({ok:true,json:async()=>({enabled:true,url:'https://zjbsvqryaxtafuffpifu.supabase.co',publishableKey:'sb_publishable_test'})})
 };
 vm.runInNewContext(core,{window:browser,URL,TextEncoder,TextDecoder,Uint8Array,DataView,Promise,console,setTimeout,clearTimeout,btoa,atob});
 const api=browser.OpenIPTVTVPair;
 assert.ok(api);
 const pending=[],commands=[],playback=[],state={connected:false};
 const host=api.createReceiver({
  autoApprove:true,
  onStatus:()=>{},onRequest:req=>{if(req)pending.push(req);},onConnected:()=>{state.connected=true;},
  onCommand:cmd=>commands.push(cmd)
 });
 await host.start();
 assert.match(host.code,/^\d{6}$/);
 const mobile=api.createController({onStatus:()=>{},onConnected:()=>{state.controller=true;},onPlayback:msg=>playback.push(msg)});
 await mobile.connect(host.code);
 // Supplying a valid six-digit PIN must complete pairing without any TV click.
 for(let i=0;i<100&&!mobile.connected;i++)await new Promise(r=>setTimeout(r,4));
 assert.equal(mobile.connected,true);
 assert.equal(state.connected,true);
 assert.equal(pending.length,0,'Auto-pairing must not display an approval prompt');
 await mobile.command('play',{url:'https://media.example/live.m3u8?token=temporary',name:'VTV2',mediaId:'channel-1'});
 for(let i=0;i<50&&!commands.length;i++)await new Promise(r=>setTimeout(r,3));
 assert.equal(commands[0].action,'play');
 assert.equal(commands[0].name,'VTV2');
 assert.equal(commands[0].mediaId,'channel-1');
 assert.equal(messages.some(msg=>msg.event==='sealed'),true,'commands are encrypted and acknowledged');
 assert.equal(commands[0].url,'https://media.example/live.m3u8?token=temporary');
 assert.equal(messages.some(msg=>JSON.stringify(msg).includes('media.example')),false,'URL never appears in public broadcast');
 assert.equal(messages.some(msg=>msg.event==='sealed'&&typeof msg.payload.ciphertext==='string'),true);
 await host.reportPlayback('playing','VTV2','channel-1');
 for(let i=0;i<100&&!playback.length;i++)await new Promise(r=>setTimeout(r,2));
 assert.equal(playback[0].state,'playing');
 assert.equal(playback[0].name,'VTV2');
 assert.equal(playback[0].mediaId,'channel-1');
 assert.equal(await host.reportPlayback('unknown'),false);
 // A consumed PIN stops listening on the public pairing room.
 assert.equal(client.__channels?.filter(x=>x.topic.endsWith('pin-'+host.code)&&x.joined).length||0,0);
 await mobile.command('pause');
 await mobile.command('resume');
 await mobile.command('volume',{volume:0.4,muted:false});
 await mobile.command('stop');
 for(let i=0;i<30&&commands.length<5;i++)await new Promise(r=>setTimeout(r,3));
 assert.deepEqual(commands.map(x=>x.action),['play','pause','resume','volume','stop']);
 assert.equal(commands[3].volume,0.4);
 assert.equal(commands[3].muted,false);
 await mobile.disconnect(false);await host.close();
});
test('TV receiver requests fullscreen on playback and provides viewport fallback and TV remote exit',()=>{
 assert.match(receiver,/autoApprove:true/);
 assert.match(receiver,/addEventListener\('playing'/);
 assert.match(receiver,/reportPlayback\('playing'/);
 assert.match(receiver,/requestFullscreen\(/);
 assert.match(receiver,/webkitEnterFullscreen\(/);
 assert.match(receiver,/classList\.add\('tv-cinema'\)/);
 assert.match(receiver,/keyCode===10009/);
 assert.match(tv,/id="tvExitFullscreen"/);
 assert.match(css,/\.iptv-tv-body\.tv-cinema #tvVideo/);
 assert.match(css,/width:100vw!important;height:100dvh!important/);
 assert.match(ui,/onPlayback:info/);
 assert.match(ui,/if\(localVideo&&!localVideo\.paused\)localVideo\.pause\(\)/);
});
test('remote sync routes selected channels and controls to the TV and reflects real connected state',()=>{
 const app=load('app.js'),castUI=load('cast-ui.js');
 assert.match(app,/OpenIPTVCastUI\?\.onChannelChanged\?\.\(found,playCandidates\[0\]\)/);
 assert.match(app,/OpenIPTVWebCastV2\?\.shouldUseRemotePlayer\?\.\(\)/);
 assert.match(app,/syncRemoteControls\?\.\(\)/);
 assert.match(app,/Đang điều khiển TV/);
 assert.match(ui,/function shouldUseRemotePlayer\(/);
 assert.match(ui,/volumeTimer=root\.setTimeout/);
 assert.match(core,/kind:'command-ack'/);
 assert.match(core,/pendingAcks:new Map\(\)/);
 assert.match(core,/TV không phản hồi lệnh/);
 assert.match(castUI,/OpenIPTVWebCast\?\.onChannelChanged\?\.\(ch,url\)/);
 assert.match(app,/OpenIPTVWebCastV2\.toggleRemotePlayback\(\)/);
 assert.match(app,/OpenIPTVWebCastV2\?\.onLocalStop\?\.\(\)/);
 assert.match(app,/OpenIPTVWebCastV2\?\.onLocalVolumeChanged\?\.\(player.volume,player.muted\)/);
 assert.match(ui,/function sendRemotePlay\(/);
 assert.match(ui,/playSerial/);
 assert.match(ui,/if\(info.mediaId&&info.mediaId!==lastMediaId\)return/);
 assert.match(ui,/pair\.command\('volume'|onLocalVolumeChanged/);
 assert.match(ui,/function renderConnectionStatus\(/);
 assert.match(ui,/button\.dataset\.castConnection=kind/);
 assert.match(ui,/getAirplayState/);
 assert.match(ui,/dataset\.castConnection/);
 assert.match(css,/#castBtn\[data-cast-connection\]/);
 assert.match(receiver,/case 'volume'/);
 assert.match(receiver,/command\.volume/);
});
test('remote channel handoff tears down local HLS/DASH before awaiting channel selection and never stops TV session',()=>{
 const app=load('app.js');
 const releaseStart=app.indexOf(' function releaseLocalForRemote(){');
 const releaseEnd=app.indexOf('\n document.addEventListener(\'openiptv:remote-player-attached\'',releaseStart);
 assert.ok(releaseStart>0&&releaseEnd>releaseStart,'local release helper exists');
 const release=app.slice(releaseStart,releaseEnd);
 const seen=[];
 const mock={
  playGeneration:11,playAttemptSerial:4,failoverTimer:1,stallTimer:2,startupNoteTimer:3,
  hls:{destroy(){seen.push('hls-destroy');}},dash:{reset(){seen.push('dash-reset');}},
  player:{pause(){seen.push('pause');},removeAttribute(name){seen.push('remove-'+name);},load(){seen.push('load');}},
  clearTimeout(id){seen.push('timer-'+id);},
  window:{OpenIPTVWebCastV2:{syncRemoteControls(){seen.push('sync');},onLocalStop(){throw Error('must never stop TV');}}},
 };
 vm.runInNewContext(release+'\nreleaseLocalForRemote();',mock);
 assert.deepEqual(seen.slice(0,3),['timer-1','timer-2','timer-3']);
 assert.ok(seen.indexOf('hls-destroy')<seen.indexOf('pause'),'HLS decoder is torn down before video pause');
 assert.ok(seen.includes('dash-reset'));
 assert.ok(seen.includes('remove-src'));
 assert.ok(seen.includes('load'));
 assert.equal(mock.playGeneration,12);
 assert.equal(mock.playAttemptSerial,5);
 const playStart=app.indexOf(' async function playChannel(chId,override=null,opts={}){');
 const gate=app.indexOf('await window.IPTVProAdvanced.allowChannel(found)',playStart);
 const handoff=app.indexOf('if(remoteAtSelection)releaseLocalForRemote();',playStart);
 const localTry=app.indexOf('try{await tryPlayback(playCandidates[0]',playStart);
 assert.ok(handoff>playStart&&handoff<gate,'local decoder must stop before async permission gate');
 assert.ok(gate<localTry,'local playback can begin only after remote ownership check');
 assert.match(app,/requestSerial!==channelSelectionSerial/);
 assert.match(app,/openiptv:remote-player-attached/);
 assert.match(app,/releaseLocalForRemote\(\); \/\/ Prevent a late HLS retry/);
 assert.match(ui,/new root\.CustomEvent\('openiptv:remote-player-attached'/);
 assert.match(sender,/new root\.CustomEvent\('openiptv:remote-player-attached'/);
});
test('invalid media schemes and local addresses are rejected before transmission',()=>{
 assert.match(core,/AES-GCM/);
 assert.match(core,/ECDH/);
 assert.match(core,/^[\s\S]*validateUrl/);
 assert.match(core,/127\\/);
 assert.match(core,/session-/);
});
