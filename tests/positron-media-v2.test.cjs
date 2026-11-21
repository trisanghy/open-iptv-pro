'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('P5.1.55 media redesign is loaded after original Positron layers',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.indexOf('positron-media-v2.css')>html.indexOf('positron-twenty.css'));
 assert.ok(html.indexOf('positron-media-v2.js')>html.indexOf('positron-twenty.js'));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.201');
});
test('Playback retains native media handlers; new vectors replace presentation only',()=>{
 const js=read('renderer/positron-media-v2.js');
 for(const id of ['prevBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn'])assert.ok(js.includes(id));
 assert.ok(js.includes("new MutationObserver(update).observe(play"));
 assert.ok(js.includes("play.dataset.poPlaying=isPlaying?'true':'false'"));
 assert.ok(js.includes("glyph.includes('Ⅱ')"));
 assert.ok(js.includes("button.replaceChildren(icon"));
 assert.ok(!js.includes('addEventListener(\'click\''),'new layer must not intercept media action clicks');
 assert.ok(!js.includes('streamleaf.dvr'),'new layer must not modify DVR');
 const native=read('renderer/app.js');
 for(const id of ['playBtn','nextBtn','stopBtn','prevBtn'])assert.ok(native.includes(id));
});
test('Media controls are compact, keyboard accessible and free from oversized round button',()=>{
 const css=read('renderer/positron-media-v2.css');
 assert.match(css,/#playBtn\{[\s\S]*?44px!important/);
 assert.ok(css.includes('border-radius:11px!important'));
 assert.ok(css.includes('button:focus-visible'));
 assert.ok(css.includes('#channelList .channel-item.current'));
 assert.ok(css.includes('@container (max-width:890px)'));
});

test('legacy P4 selector cannot reintroduce round oversized Play',()=>{
 const css=read('renderer/positron-media-v2.css');
 assert.ok(css.includes('html[data-positron="true"].p50-29 #page-tv .player-control-card .controls.transport-controls #playBtn'));
 assert.ok(css.includes('max-width:44px!important'));
 assert.ok(css.includes('max-height:44px!important'));
});

test('P5.1.91 native Play/Pause vector derives from Web branch SVG without changing media handlers',()=>{
 const css=read('renderer/positron-media-v2.css'),qa=read('scripts/positron-20-extension.cjs');
 for(const term of ['--po-web-play-svg:url("data:image/svg+xml','--po-web-pause-svg:url("data:image/svg+xml','mask-image:var(--po-current-transport-icon)!important','clip-path:none!important','--po-current-transport-icon:var(--po-web-pause-svg)'])assert.ok(css.includes(term),term);
 for(const key of ['webPlayIconQa.webMask','webPlayIconQa.playAndPauseDistinct','webPlayIconQa.restoredPlay','webPlayIconQa.notPlaying'])assert.ok(qa.includes(key.replace('webPlayIconQa.',''))||qa.includes('webPlayIconQa[key],true'),key);
 assert.ok(qa.includes('positron-p5191-web-play-svg-552-metadata-real.png'));
 assert.ok(read('renderer/positron-media-v2.js').includes('new MutationObserver(update).observe(play'));
});
