'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),h=fs.readFileSync('tv-web-lab.html','utf8'),s=fs.readFileSync('tv-web-lab.js','utf8');
test('Standalone HTTPS page, WGT UI and no pairing/relay module',()=>{
 a.equal(p.websiteURL,'https://trisanghy.github.io/open-iptv-pro/tv-web-lab.html');a.equal(p.packageType,'mods');a.equal(p.serviceFile,undefined);
 a.match(h,/id="channelPicker"/);a.match(h,/src="tv-web-lab.js\?v=058"/);a.match(s,/function keyHandler\(e\)/);a.match(s,/function play\(c\)/);new vm.Script(s);
 a.doesNotMatch(s,/(?:http|ws):\/\/127\.0\.0\.1/);
 let redirected='';vm.runInNewContext(s,{location:{origin:'http://127.0.0.1:8081',pathname:'/module/old',replace:u=>redirected=u}});a.equal(redirected,p.websiteURL);
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html'])a.ok(fs.readFileSync(f,'utf8').includes(p.websiteURL));
});
test('Receiver decoder stages and fullscreen',()=>{
 const start=s.indexOf('var stageAvailable=stage=>'),end=s.indexOf('/* Receiver port:',start);
 const e={URL,window:{Hls:{isSupported:()=>true},dashjs:{MediaPlayer(){}}},byId:()=>({canPlayType:()=>true})};
 vm.runInNewContext(s.slice(start,end)+';this.stages=stagesFor;',e);
 a.deepEqual(Array.from(e.stages('https://example.org/a.m3u8')),['native-hls','hlsjs']);
 a.deepEqual(Array.from(e.stages('https://example.org/a.mpd')),['dashjs','native']);
 a.match(s,/Promise\.all\(jobs\)[\s\S]*?webStages=stagesFor/);a.match(s,/MANIFEST_PARSED[\s\S]*?webEngineReady=true;webPlayReady/);a.match(s,/playbackReady\(token\);enterWebCinema\(video\)/);
});
