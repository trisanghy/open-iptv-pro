'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const at=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=at('renderer/index.html'),css=at('renderer/player-two-row-v42335.css'),features=at('renderer/features.js');
test('v4.23.35 two-row control toolbar links real transport and output controls',()=>{
 const top=html.match(/<div class="control-layout-top">([\s\S]*?)<div class="control-layout-bottom">/)?.[1];
 assert.ok(top,'top row not found');
 for(const id of ['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn'])assert.ok(top.includes(`id="${id}"`),id);
 for(const id of ['manualStreamSelect','epgCurrent','videoFit','favCurrentBtn'])assert.ok(!top.includes(`id="${id}"`),id+' should be second row');
});
test('v4.23.35 EPG, aspect ratio, backup URL, favorite live on second row',()=>{
 const bottom=html.match(/<div class="control-layout-bottom">([\s\S]*?)<details class="playback-extra"/)?.[1];
 assert.ok(bottom,'second row not found');
 for(const id of ['epgCurrent','epgNowName','epgNowTime','epgNextName','epgNextTime','openGuideBtn','videoFit','manualStreamSelect','favCurrentBtn'])assert.ok(bottom.includes(`id="${id}"`),id);
 assert.ok(bottom.indexOf('id="epgCurrent"')<bottom.indexOf('id="manualStreamSelect"'));
 assert.ok(bottom.indexOf('id="manualStreamSelect"')<bottom.indexOf('id="favCurrentBtn"'));
});
test('v4.23.35 audio, snapshot, ffmpeg remain accessible without covering player',()=>{
 const extra=html.match(/<details class="playback-extra"([\s\S]*?)<div class="video-seekbar"/)?.[1];
 assert.ok(extra,'secondary controls not found');
 for(const id of ['shotBtn','tryFfmpegBtn'])assert.ok(extra.includes(`id="${id}"`),id);
 assert.ok(html.indexOf('id="playerBox"')<html.indexOf('class="player-control-card"'));
 assert.match(css,/#page-tv \.control-layout-top/);
 assert.match(css,/#page-tv \.control-layout-bottom/);
});
test('v4.23.35 programme slots use current actual EPG info with missing-data fallback',()=>{
 assert.match(features,/guideLib\.current\(guide,c\)/);
 assert.match(features,/nowName\.textContent=now\?\.title\|\|'Chưa có EPG'/);
 assert.match(features,/nextName\.textContent=next\?\.title\|\|'Chưa có lịch tiếp theo'/);
 assert.match(html,/player-two-row-v42335\.css/);
});
