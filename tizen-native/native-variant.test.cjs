'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'), vm=require('node:vm'), fs=require('node:fs');
const html=execFileSync('python3',['-c','from zipfile import ZipFile; print(ZipFile("dist-tizen-native/Open-IPTV-Pro-TV-Native-UNSIGNED.wgt").read("index.html").decode())'],{encoding:'utf8',maxBuffer:4*1024*1024});
const stable=fs.readFileSync('tizenbrew/index.html','utf8');
function extract(a,b){const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert.ok(i>=0&&j>i);return html.slice(i,j);}
function setup(verified='',ok=true){
 const calls=[];
 const env={URL,playbackStream:null,preferredCycleAt:1,playbackStreamIndex:0,playbackStreamUrls:['x'],
  playbackEngine:'avplay',playbackConfirmed:false,html5Mode:'',nativeAvplayTried:false,
  hlsAttempted:false,dashAttempted:false,mpegtsAttempted:false,
  TV_PLAYBACK_CORE:{preferredRoute:url=>url.includes('.mpd')?'dashjs':url.includes('.ts')?'mpegts':url.includes('.m3u8')?'hlsjs':''},
  playbackSafeHost:()=>'',logPlayback:()=>{},resetPreferredDecoderAttempts:()=>{},
  savedPlaybackRoute:()=>verified,nativeAvplay:()=>({}),startAvplay:()=>{calls.push('avplay');env.nativeAvplayTried=true;return ok;},
  launchPlaybackRoute:(c,t,r)=>{calls.push(r);return true;},startHtml5Playback:()=>calls.push('native'),
  playbackActive:()=>true,markPlaybackRouteBad:()=>{},stopPlaybackEngine:()=>{},setPlayerStatus:()=>{}};
 vm.createContext(env);
 vm.runInContext(extract('function startPlaybackStream(','function tryNextChannelSource(')+extract('function fallbackFromAvplay(','function nativeHtml5Play('),env);
 return {env,calls};
}
test('Native package is independent of existing module',()=>{
 assert.match(html,/Native WGT v0\.1\.52/);
 assert.match(stable,/TizenBrew v0\.1\.52/);
 assert.doesNotMatch(stable,/function registerNativeRemote\(/);
 assert.match(html,/registerNativeRemote\(\);setTimeout/);
 assert.match(html,/if\(!tizenModuleContext\(\)\|\|hlsRelayAttempted/);
 assert.match(html,/if\(nativeAvplayTried\|\|!startAvplay\(failedChannel,token\)\)startHtml5Playback/);
});
test('New HLS uses AVPlay first; a known good HLS route remains preferred',()=>{
 let s=setup();s.env.startPlaybackStream({url:'https://example.org/live.m3u8'},1);assert.deepEqual(s.calls,['avplay']);
 s=setup('hlsjs');s.env.startPlaybackStream({url:'https://example.org/live.m3u8'},1);assert.deepEqual(s.calls,['hlsjs']);
 s=setup('relay');s.env.startPlaybackStream({url:'https://example.org/live.m3u8'},1);assert.deepEqual(s.calls,['avplay']);
});
test('AVPlay startup failure falls back to packaged format decoder',()=>{
 const s=setup('',false);s.env.startPlaybackStream({url:'https://example.org/live.mpd'},1);assert.deepEqual(s.calls,['avplay','dashjs']);
 for(const [url,route] of [['https://example.org/live.m3u8','hlsjs'],['https://example.org/live.mpd','dashjs'],['https://example.org/live.ts','mpegts'],['https://example.org/movie.mp4','native']]){
  const t=setup();t.env.fallbackFromAvplay({url},1,'prepare failed');assert.deepEqual(t.calls,[route]);
 }
});
test('Remote registers supported keys without crashing on missing keys',()=>{
 const keys=[];const env={tizen:{tvinputdevice:{registerKey(k){keys.push(k);if(k==='MediaStop')throw Error('unsupported');}}}};
 vm.runInNewContext(extract('function registerNativeRemote(){','applyTvTheme(state.theme);draw();updateBottomActions();registerNativeRemote();')+'registerNativeRemote();',env);
 assert.ok(keys.includes('ChannelUp')&&keys.includes('ChannelDown')&&keys.includes('ColorF1Green'));
});
