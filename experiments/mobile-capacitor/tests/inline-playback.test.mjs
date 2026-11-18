import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
test('regular Play uses inline video, not native fullscreen',()=>{
 const start=main.indexOf('async function play(c,requestedURL');
 const end=main.indexOf('async function playFullscreen()',start);
 assert.ok(start>0&&end>start);
 const inline=main.slice(start,end);
 assert.ok(inline.includes('showInline(true)'));
 assert.ok(inline.includes('await v.play()'));
 assert.ok(!inline.includes('VideoPlayer.initPlayer('));
 assert.ok(!inline.includes('VideoPlayer.play('));
});
test('native fullscreen is invoked only by the fullscreen button',()=>{
 const start=main.indexOf('async function playFullscreen()');
 const end=main.indexOf('async function pauseResumeCurrent()',start);
 assert.ok(start>0&&end>start);
 const fullscreen=main.slice(start,end);
 assert.ok(fullscreen.includes('VideoPlayer.initPlayer(nativePlayOptions'));
 assert.ok(main.includes("$('#fullScreenCurrent').onclick=()=>playFullscreen()"));
 assert.ok(main.includes("mode:'fullscreen'"));
});
test('video stays inside 16:9 hero using WebKit inline playback',()=>{
 assert.ok(css.includes('MOBILE_INLINE_PLAYBACK_V7'));
 assert.ok(css.includes('.hero-player>video.inline-video'));
 assert.ok(main.includes("v.setAttribute('webkit-playsinline','')"));
 assert.ok(main.includes('ph.hidden=visible'));
});
test('PiP action never opens native fullscreen',()=>{
 const start=main.indexOf("$('#pictureInPicture').onclick");
 const end=main.indexOf("$('#addURL').onclick",start);
 assert.ok(start>0&&end>start);
 const pip=main.slice(start,end);
 assert.ok(pip.includes('requestPictureInPicture'));
 assert.ok(!pip.includes('VideoPlayer.initPlayer'));
});
