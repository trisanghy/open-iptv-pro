'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('tizenbrew/index.html','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
test('WGT TV UI, web-only manifest and isolated storage',()=>{
 assert.equal(pkg.packageType,'app');assert.equal(pkg.appPath,'tizenbrew/bootstrap.html');assert.equal(pkg.serviceFile,undefined);
 assert.match(html,/TV Web Lab · v0\.1\.54/);assert.match(html,/id="channelPicker"/);assert.match(html,/function keyHandler\(e\)/);
 assert.match(html,/openiptv-tizenbrew-tv-v1-hybrid-lab/);
 assert.doesNotMatch(html,/\$WEBAPIS\/webapis\/webapis\.js|location\.replace\("https:\/\/trisanghy\.github\.io/);
 assert.match(fs.readFileSync('tizenbrew/bootstrap.html','utf8'),/branch='tizen-hybrid-experiment'/);
});
test('Web routes only: relay and AVPlay cannot start even if API exists',()=>{
 const extract=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)+a.length));
 const env={webapis:{avplay:{open(){throw Error('must not call');}}},playbackActive:()=>true,TV_PLAYBACK_CORE:{engines:{native:{start:()=>true},relay:{start:()=>{throw Error('must not call');}},avplay:{start:()=>{throw Error('must not call');}}}}};
 vm.createContext(env);
 vm.runInContext(extract('function nativeAvplay(){','function hlsAddress(')+extract('function startRelayHlsPlayback(','function startHlsPlayback(')+extract('function launchPlaybackRoute(','function recoverStalledPlayback(')+extract('function startAvplay(','function play(c)'),env);
 assert.equal(env.nativeAvplay(),null);assert.equal(env.startRelayHlsPlayback({},1),false);assert.equal(env.startAvplay({},1),false);
 assert.equal(env.launchPlaybackRoute({},1,'relay'),false);assert.equal(env.launchPlaybackRoute({},1,'avplay'),false);assert.equal(env.launchPlaybackRoute({},1,'native'),true);
});
test('Remote code remains valid; preview uses original URL, not a relay session',()=>{
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
 const start=html.indexOf('function startWebHlsPreview('),end=html.indexOf('function startMpegtsPreview(',start);
 const preview=html.slice(start,end);assert.match(preview,/url:channel\.url/);assert.doesNotMatch(preview,/requestLocalHlsSession|X-Open-IPTV-Relay/);
});
