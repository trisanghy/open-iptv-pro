'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),h=fs.readFileSync('tv-web-lab.html','utf8'),s=fs.readFileSync('tv-web-lab.js','utf8');
test('Standalone HTTPS page, WGT UI and no pairing/relay module',()=>{
 a.equal(p.websiteURL,'https://trisanghy.github.io/open-iptv-pro/tv-web-lab.html?v=060');a.equal(p.packageType,'mods');a.equal(p.serviceFile,undefined);
 a.match(h,/id="channelPicker"/);a.match(h,/src="tv-web-lab.js\?v=060"/);a.match(s,/function keyHandler\(e\)/);a.match(s,/function play\(c\)/);new vm.Script(s);
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

test('Legacy v0.1.54 OTA validator accepts both navigation-only entry points',()=>{
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html']){
  const html=fs.readFileSync(f,'utf8');
  // Exact validator used by the installed bootstrap.
  a.ok(html.indexOf('Open IPTV Pro')>=0&&html.indexOf('function play(c)')>=0&&/<html[\s>]/i.test(html));
  let dest='',calls=0;
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{location:{replace(u){dest=u;calls++;}}});
  a.equal(dest,p.websiteURL);a.equal(calls,1);
  a.doesNotMatch(html,/<video|<iframe|fetch\(|new Hls|127\.0\.0\.1/);
 }
});

test('Video-only surface immediately enters fullscreen from play(), without old error UI',()=>{
 a.match(h,/#webLabLegacyHooks,#webLabLegacyHooks \*\{display:none!important\}/);
 a.doesNotMatch(h,/id="castPlayerFrame"|class="playerhead"|class="playerfoot"|class="playerdiag"/);
 const i=s.indexOf('function enterWebCinema('),j=s.indexOf('function leaveWebCinema(',i);
 let calls=0;const cls=new Set(),screen={hidden:false,requestFullscreen(){calls++;return Promise.resolve();}};
 const env={byId:()=>screen,document:{body:{classList:{add:x=>cls.add(x)}}},webFullscreenAttempted:false,playbackConfirmed:false};
 vm.runInNewContext(s.slice(i,j),env);env.enterWebCinema({});env.enterWebCinema({});a.equal(calls,1);a.ok(cls.has('web-tv-cinema'));
 const start=s.indexOf('function play(c)'),end=s.indexOf('function togglePlayback(',start);
 a.match(s.slice(start,end),/enterWebCinema\(byId\('video'\)\)[\s\S]*?startPlaybackStream/);
});
test('Playback failures return to list and notify, not full-screen red panel',()=>{
 let calls=[];const i=s.indexOf('function playbackFailure('),j=s.indexOf('function fallbackFromAvplay(',i);
 const env={URL,playbackActive:()=>true,playing:{name:'Test channel'},playbackEvidence:[],console:{warn(){}},closePlayer:()=>calls.push('close'),notify:t=>calls.push(t)};
 vm.runInNewContext(s.slice(i,j),env);env.playbackFailure(1,'https://example.org/path?token=secret');
 a.deepEqual(calls,['close','Không phát được Test channel. Kiểm tra nguồn hoặc thử kênh khác.']);
});

test('Visible version, JS runtime, manifest and cache-busting script stay in sync',()=>{
 const v=p.version;
 a.equal(p.tizenbrewEdition,v);
 a.ok(h.includes('id="webLabVersion">TV Web Lab · v'+v+'</p>'));
 a.ok(s.includes("version:'"+v+"'"));
 a.ok(s.includes("textContent='TV Web Lab · v'+TV_PLAYBACK_CORE.version"));
 const suffix=v.split('.')[2].padStart(3,'0');
 a.ok(h.includes('tv-web-lab.js?v='+suffix));
 a.ok(p.websiteURL.endsWith('?v='+suffix));
});
