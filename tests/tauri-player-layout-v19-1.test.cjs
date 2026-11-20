'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const features=fs.readFileSync(path.join(root,'renderer/features.js'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/player-layout-v19-1.css'),'utf8');
const pkg=require(path.join(root,'package.json'));
const control=html.slice(html.indexOf('<div class="player-control-card ipvp19-ui">'),html.indexOf('<section class="advanced-timebar"'));
const one=(id)=>[...html.matchAll(new RegExp('id="'+id+'"','g'))].length;

test('v19.1 uses static two-row markup; no reparenting script',()=>{
 assert.match(control,/class="ipvp-main-row"/);
 assert.match(control,/class="ipvp-second-row"/);
 assert.doesNotMatch(html,/control-bar-v16\.js/);
 assert.doesNotMatch(html,/control-bar-v16\.css/);
 assert.match(html,/player-layout-v19-1\.css/);
});
test('transport, casting and fullscreen occupy upper row',()=>{
 const upper=control.slice(control.indexOf('class="ipvp-main-row"'),control.indexOf('class="ipvp-second-row"'));
 for(const id of ['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn']) assert.match(upper,new RegExp('id="'+id+'"'));
});
test('now / next guide, fit dropdown and alternate link occupy bottom row',()=>{
 const bottom=control.slice(control.indexOf('class="ipvp-second-row"'));
 for(const id of ['epgCurrent','epgNowText','ipvpNowTitle','ipvpNowTime','ipvpNextTitle','ipvpNextTime','videoFit','manualLinkControl','manualLinkSelect','favCurrentBtn'])assert.match(bottom,new RegExp('id="'+id+'"'));
 assert.match(bottom,/option value="contain">Vừa khung/);
});
test('every original playback ID is retained exactly once',()=>{
 for(const id of ['playingIcon','playingTitle','playingSubtitle','prevBtn','playBtn','stopBtn','nextBtn','volume','shotBtn','videoFit','castBtn','pipBtn','fullscreenBtn','favCurrentBtn','manualLinkControl','manualLinkSelect','epgCurrent','epgNowText','openGuideBtn','videoSeekWrap'])assert.equal(one(id),1,id);
});
test('volume and snapshot remain accessible in Electron player toolbar while Quick Tools stay open',()=>{
 const start=html.indexOf('<section class="compact-tools always-open" id="quickTools"');
 const tools=html.slice(start,html.indexOf('</section>',start));
 assert.ok(start>0,'Quick Tools are a permanent section');
 assert.doesNotMatch(tools,/class="ipvp-player-extras"|id="volume"|id="shotBtn"/);
 for(const id of ['quickChecks','quickShots','quickExport'])assert.match(tools,new RegExp('id="'+id+'"'));
 const stage=html.slice(html.indexOf('<div id="playerToolbarControlStaging" hidden>'),start);
 assert.match(stage,/id="volume"/);
 assert.match(stage,/id="shotBtn"/);
 const moved=fs.readFileSync(path.join(root,'renderer/electron-player-parity-v23-8-21.js'),'utf8');
 assert.match(moved,/master\.append\(icon,volume\);top\.append\(master\)/);
 assert.match(moved,/shot\.textContent='Chụp ảnh';body\.append\(shot\)/);
});
test('EPG uses real guide current/next and escapes titles by textContent',()=>{
 assert.match(features,/guideLib\.current\(guide,c\)/);
 assert.match(features,/ipvpNowTitle/);
 assert.match(features,/ipvpNextTitle/);
 assert.match(features,/title\.textContent=item\?\.title/);
 assert.match(features,/ipvpNextProgram/);
});
test('responsive CSS has distinct desktop and narrow-window rules',()=>{
 assert.match(css,/ipvp-main-row/);
 assert.match(css,/ipvp-second-row/);
 assert.match(css,/@media\(max-width:1000px\)/);
 assert.match(css,/@media\(max-width:620px\)/);
});
test('Rust Lab version is 4.23.17-tauri.N with independent tag',()=>assert.match(pkg.version,/^4\.23\.17-tauri\.\d+(?:\.\d+)*$/));