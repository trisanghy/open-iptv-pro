'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),h=fs.readFileSync('tizenbrew/index.html','utf8'),s=fs.readFileSync(p.main,'utf8');
test('HTTPS module mounts WGT UI; no redirect to pairing screen',()=>{
 a.equal(p.packageType,'mods');a.match(p.websiteURL,/^https:\/\/trisanghy\.github\.io\/open-iptv-pro\/tizen\/hosted-player\.html\?tv-lab=056$/);
 a.equal(p.serviceFile,undefined);a.match(s,/document\.body\.innerHTML=/);a.match(h,/id="channelPicker"/);a.match(h,/function keyHandler\(e\)/);a.match(s,/function play\(c\)/);new vm.Script(s);
});
test('same stage ordering as official TV receiver',()=>{
 const start=h.indexOf('var stageAvailable=stage=>'),end=h.indexOf('/* Receiver port:',start);
 const e={URL,window:{Hls:{isSupported:()=>true},dashjs:{MediaPlayer(){}}},byId:()=>({canPlayType:()=>true})};
 vm.runInNewContext(h.slice(start,end)+';this.stages=stagesFor;',e);
 const stage=u=>Array.from(e.stages(u));
 a.deepEqual(stage('https://example.org/a.m3u8'),['native-hls','hlsjs']);
 a.deepEqual(stage('https://example.org/a.mpd'),['dashjs','native']);
 a.deepEqual(stage('https://example.org/a'),['native','hlsjs','dashjs']);
 a.deepEqual(stage('https://example.org/a.mp4'),['native']);
});
test('HLS waits for media attachment and manifest, DASH waits for initialized',()=>{
 const i=h.indexOf('function webNextStage('),j=h.indexOf('function startPlaybackStream(',i),b=h.slice(i,j);
 a.match(b,/MEDIA_ATTACHED[\s\S]*?engine\.loadSource\(url\)/);
 a.match(b,/MANIFEST_PARSED[\s\S]*?webEngineReady=true;webPlayReady/);
 a.match(b,/STREAM_INITIALIZED[\s\S]*?webEngineReady=true;webPlayReady/);
 a.match(b,/engine\.initialize\(video,url,false\)/);
 a.match(b,/maxBufferLength:22/);
 a.doesNotMatch(b,/startRelay|startAvplay|postMessage/);
});
