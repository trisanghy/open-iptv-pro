'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const api=require('../../web-background-audio.js');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const channel={id:'vtv1',name:'VTV1',group:'VTV',url:'https://live.invalid/stream.m3u8',logo:'https://images.example/brand.png'};
const photo='data:image/jpeg;base64,QUJDRA==';
test('lock-screen artwork prefers saved channel snapshot over station thumbnail/logo',()=>{
 const store={snapshots:{[channel.url]:{data:photo}}};
 const images=api.artworkCandidates(channel,store);
 assert.equal(images[0].src,photo);
 assert.equal(images[0].type,'image/jpeg');
 assert.equal(images[1].src,channel.logo);
 assert.equal(images.at(-1).src,'assets/icon.png');
 assert.equal(api.metadataFor(channel,store).artwork[0].src,photo);
 assert.doesNotMatch(JSON.stringify(api.metadataFor(channel,store)),/live\.invalid|stream\.m3u8/);
});
test('without snapshot, use thumbnail or channel logo; when both absent use app icon',()=>{
 assert.equal(api.metadataFor({...channel,thumbnail:'https://cdn.example/poster.jpg'}).artwork[0].src,'https://cdn.example/poster.jpg');
 assert.equal(api.metadataFor(channel,{snapshots:{}}).artwork[0].src,channel.logo);
 assert.equal(api.metadataFor({...channel,logo:'',thumb:''}).artwork[0].src,'assets/icon.png');
});
test('unsafe artwork URLs are ignored, and icon remains final fallback',()=>{
 for(const bad of ['javascript:alert(1)','http://insecure.example/thumb.png','https://user:pw@images.invalid/logo.png','data:image/svg+xml;base64,AA==','data:text/html,script','file:///etc/passwd']){
  assert.equal(api.imageArt(bad),null,bad);
 }
 assert.equal(api.imageArt('data:image/png;base64,AA==').type,'image/png');
 assert.equal(api.imageArt(photo).type,'image/jpeg');
 assert.equal(api.imageArt('data:image/jpeg;base64,'+'A'.repeat(3000001)),null);
});
test('Media Session updates artwork when a snapshot appears without changing channel',()=>{
 const callbacks={},state={snapshots:{}};
 const video={paused:false,addEventListener(){}};
 const setting={checked:true,addEventListener(){}};
 const button={disabled:false,classList:{toggle(){}},setAttribute(){},addEventListener(){},querySelector(){return {textContent:''}}};
 const els={video,webBackgroundAudio:setting,webBackgroundAudioToggle:button,webBackgroundAudioStatus:{textContent:''},webBackgroundAudioModeStatus:{textContent:''}};
 const doc={
  getElementById:id=>els[id]||null,
  addEventListener:(type,fn)=>{callbacks[type]=fn}
 };
 const session={metadata:null,playbackState:'none',setActionHandler(){}};
 const win={
  IPTVState:{getStore:()=>state,getCurrent:()=>channel},
  MediaMetadata:class{constructor(x){Object.assign(this,x)}},
  addEventListener(){},
  location:{href:'https://trisanghy.github.io/open-iptv-pro/'}
 };
 const c=api.install({win,doc,nav:{mediaSession:session}});
 assert.equal(session.metadata.artwork[0].src,channel.logo);
 state.snapshots[channel.url]={data:photo};
 callbacks['openiptv:media-info']();
 assert.equal(session.metadata.artwork[0].src,photo);
 c.clearSession();
 assert.equal(session.metadata,null);
});
test('missing artwork falls back on image load error, without resetting active audio',()=>{
 const state={snapshots:{[channel.url]:{data:photo}}};
 const cb={};let images=0;
 const doc={getElementById:id=>({
  video:{paused:false,addEventListener(){}},
  webBackgroundAudio:{checked:true,addEventListener(){}},
  webBackgroundAudioToggle:{disabled:false,classList:{toggle(){}},setAttribute(){},addEventListener(){},querySelector(){return null}},
  webBackgroundAudioStatus:{textContent:''},
  webBackgroundAudioModeStatus:{textContent:''}
 })[id]||null,addEventListener(t,f){cb[t]=f}};
 const session={metadata:null,playbackState:'none',setActionHandler(){}};
 const win={IPTVState:{getStore:()=>state,getCurrent:()=>channel},MediaMetadata:class{constructor(x){Object.assign(this,x)}},
  Image:class{set src(v){images++;if(v===photo)this.onerror?.();}},
  addEventListener(){},location:{href:'https://trisanghy.github.io/open-iptv-pro/'}};
 api.install({win,doc,nav:{mediaSession:session}});
 assert.equal(session.metadata.artwork[0].src,channel.logo);
 assert.equal(images,2);
});
test('compact headphone icon shares EPG control row and source/favorite remain accessible',()=>{
 const html=read('index.html'),css=read('web-background-audio.css'),build=read('web-online/prepare-web.py');
 assert.equal(html.split('id="webBackgroundAudioToggle"').length,2);
 assert.equal(html.split('id="webBackgroundAudioBar"').length,1);
 const a=html.indexOf('id="videoFit"'),b=html.indexOf('id="manualStreamSelect"');
 const c=html.indexOf('id="webBackgroundAudioToggle"'),d=html.indexOf('id="favCurrentBtn"');
 assert.ok(a<b&&b<d&&d<c);
 assert.ok(html.slice(b,c).includes('class="control-layout-bottom"')===false);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) 40px 44px!important/);
 assert.match(css,/#webBackgroundAudioToggle\.active/);
 assert.ok(html.includes('web-background-audio.css?v=lock-artwork-20261119e'));
 assert.ok(html.includes('web-background-audio.js?v=lock-artwork-20261119e'));
 assert.ok(build.includes('compact_audio=web_html['));
 assert.ok(!build.includes("audio_bar_start="));
 assert.ok(build.includes('web-background-audio.js?v=lock-artwork-20261119e'));
 assert.equal(read('web-online/web-background-audio.js'),read('web-background-audio.js'));
 assert.equal(read('web-online/web-background-audio.css'),css);
});
