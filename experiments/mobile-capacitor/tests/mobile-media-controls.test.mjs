import test from 'node:test';import assert from 'node:assert/strict';
import {isMuted,pipSupported,togglePiP,chooseCast} from '../src/mobile-media-controls.mjs';
test('muted state follows actual player volume and mute property',()=>{
 assert.equal(isMuted({muted:true,volume:1}),true);
 assert.equal(isMuted({muted:false,volume:0}),true);
 assert.equal(isMuted({muted:false,volume:1}),false);
});
test('PiP uses WebKit only when supportsPresentationMode and playing',async()=>{
 let mode='inline';const video={currentSrc:'https://example.org/live.m3u8',paused:false,
 webkitSupportsPresentationMode:x=>x==='picture-in-picture',
 webkitSetPresentationMode:x=>{mode=x;}};
 assert.equal(pipSupported(video,{}),true);
 assert.equal(await togglePiP(video,{}),'pip');assert.equal(mode,'picture-in-picture');
 await assert.rejects(()=>togglePiP({...video,paused:true},{}),/phát kênh/);
 await assert.rejects(()=>togglePiP({currentSrc:'a',paused:false},{}),/không hỗ trợ PiP/);
});
test('iOS Cast invokes native AirPlay picker synchronously from action',async()=>{
 let called=false;const video={currentSrc:'https://example.org/a.m3u8',setAttribute:()=>{},
 webkitShowPlaybackTargetPicker:()=>{called=true;}};
 const result=await chooseCast(video,{isIOS:true});
 assert.equal(result,'airplay');assert.equal(called,true);
});
test('Android Cast is explicit native route, not silent auto fullscreen',async()=>{
 let count=0;const video={currentSrc:'https://example.org/a.m3u8'};
 const result=await chooseCast(video,{isAndroidNative:true,openAndroidNativeCast:async()=>{count++;}});
 assert.equal(count,1);assert.equal(result,'native');
});
test('Cast unsupported path shows grounded message, never invent devices',async()=>{
 let message='';const video={currentSrc:'https://example.org/a'};
 assert.equal(await chooseCast(video,{isIOS:true,onUnavailable:t=>{message=t;}}),'unavailable');
 assert.match(message,/Safari/);
});
