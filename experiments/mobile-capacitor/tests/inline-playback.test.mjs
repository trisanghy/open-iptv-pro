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
 assert.ok(pip.includes('togglePiP'));
 assert.ok(pip.includes('androidPiP.enter'));
 assert.ok(pip.includes('chooseCast'));
 assert.ok(!pip.includes('VideoPlayer.initPlayer'));
});

test('unmute never renders a large overlay in front of inline video',()=>{
 const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
 assert.doesNotMatch(layout,/unmuteAutoplay/);
 assert.doesNotMatch(css,/\.unmute-autoplay/);
 assert.doesNotMatch(main,/unmuteAutoplay/);
 assert.ok(main.includes("glyph.innerHTML=playerSvg(silent?'muted':'volume')"));
});
test('background audio is user initiated and does not invoke native fullscreen',()=>{
 const background=fs.readFileSync(path.join(root,'src/mobile-background-audio.mjs'),'utf8');
 assert.ok(background.includes('navigatorRef?.mediaSession'));
 assert.ok(background.includes("documentRef.visibilityState==='hidden'"));
 assert.ok(background.includes('getStreamURL'));
 assert.doesNotMatch(background,/VideoPlayer\.initPlayer|requestFullscreen|webkitEnterFullscreen/);
 assert.match(main,/backgroundAudio=createMobileBackgroundAudio/);
});
