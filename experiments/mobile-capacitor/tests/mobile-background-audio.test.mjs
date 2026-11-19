import test from 'node:test';
import assert from 'node:assert/strict';
import {backgroundAudioAllowed,validBackgroundStream,createMobileBackgroundAudio} from '../src/mobile-background-audio.mjs';
import {playerSvg} from '../src/mobile-player-icons.mjs';

test('background only accepts HTTP(S) sources and saved enable preference',()=>{
 for(const value of ['http://iptv.example/stream.m3u8','https://cdn.example/live'])assert.equal(validBackgroundStream(value),true);
 for(const value of ['javascript:alert(1)','file:///tmp/test','data:audio/mp3,xx',''])assert.equal(validBackgroundStream(value),false);
 assert.equal(backgroundAudioAllowed({}),true);
 assert.equal(backgroundAudioAllowed({backgroundAudioEnabled:false}),false);
});
test('player SVG paths are vector icons, not emoji',()=>{
 for(const name of ['previous','play','pause','stop','next','volume','muted','cast','pip','fullscreen','headphones','guide']){
  const icon=playerSvg(name);
  assert.match(icon,/<svg[^>]+viewBox="0 0 24 24"/);
  assert.match(icon,/<path|<rect/);
  assert.doesNotMatch(icon,/🔊|⏮|⛶/u);
 }
});
test('Nghe nền starts on explicit activation, exposes lock-screen actions and returns inline',async()=>{
 const calls={play:0,pause:0,inline:0,handlers:{}};
 const video={paused:false,currentSrc:'https://iptv.example/live.m3u8',volume:1,pause(){calls.pause++;this.paused=true;},play(){calls.inline++;this.paused=false;return Promise.resolve();}};
 const audio={paused:true,muted:false,volume:1,style:{},canPlayType(){return 'probably';},setAttribute(){},removeAttribute(){},load(){},addEventListener(){},remove(){},
  play(){calls.play++;this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};
 const doc={visibilityState:'visible',createElement(){return audio;},body:{append(){}}};
 const navigatorRef={audioSession:{type:'auto'},mediaSession:{setActionHandler(name,fn){calls.handlers[name]=fn;},playbackState:'none'}};
 const controller=createMobileBackgroundAudio({video,getChannel:()=>({name:'TV',group:'News',url:'https://iptv.example/live.m3u8'}),
  getStreamURL:ch=>ch.url,getSettings:()=>({backgroundAudioEnabled:true}),documentRef:doc,navigatorRef});
 assert.equal(await controller.activate(),true);
 assert.equal(controller.active,true);
 assert.equal(controller.paused,false);assert.equal(video.paused,true);assert.equal(calls.play,1);
 assert.equal(typeof calls.handlers.pause,'function');
 assert.equal(typeof calls.handlers.nexttrack,'function');
 calls.handlers.pause();assert.equal(controller.paused,true);
 await controller.togglePlayback(true);assert.equal(controller.paused,false);
 controller.setMuted(true);assert.equal(controller.muted,true);
 controller.deactivate(true);assert.equal(controller.active,false);assert.equal(calls.inline,1);
 assert.equal(calls.handlers.play,null);
});
