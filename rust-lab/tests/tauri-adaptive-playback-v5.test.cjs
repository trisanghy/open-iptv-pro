'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','renderer');
const adaptive=require(path.join(root,'adaptive-playback.js'));
const sourceEdit=require(path.join(root,'source-edit.js'));
const advanced=require(path.join(root,'advanced-core.js'));
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const ch={id:'ch1',sourceId:'src1',name:'VTV3',url:'https://iptv.test/master.m3u8',group:'TV'};
const backup='https://iptv-backup.test/vtv3/index.m3u8';
test('Original M3U URL stays first until a backup really proves stable',()=>{
 const a={...ch},b={...a};
 const channels=[a,b];b.id='b';b.url=backup;
 assert.deepEqual(adaptive.candidates(a,channels,{},advanced.alternatives),[ch.url,backup]);
 assert.equal(adaptive.promote(a,backup,channels,{},advanced.alternatives),true);
 assert.equal(a.url,ch.url,'never rewrite canonical playlist URL');
 assert.deepEqual(adaptive.candidates(a,channels,{},advanced.alternatives),[backup,ch.url]);
});
test('Only valid, currently available HTTP(S) alternate can be promoted',()=>{
 const a={...ch};
 assert.equal(adaptive.promote(a,'file:///tmp/movie.ts',[a],{},advanced.alternatives),false);
 assert.equal(adaptive.promote(a,'https://someone.test/unknown.m3u8',[a],{},advanced.alternatives),false);
 assert.equal(adaptive.promote(a,ch.url,[a],{},advanced.alternatives),false);
 assert.equal(adaptive.promote(a,backup,[a],{[a.id]:[backup]},advanced.alternatives),true);
 assert.equal(adaptive.promote(a,backup,[a],{[a.id]:[backup]},advanced.alternatives),false);
});
test('Expired preference never prevents fallback when refreshed playlist changes URL',()=>{
 const a={...ch,preferredStreamUrl:backup};
 assert.deepEqual(adaptive.candidates(a,[a],{},advanced.alternatives),[ch.url]);
});
test('Per-channel stable preference does not spread to unrelated channels',()=>{
 const a={...ch},x={id:'ch2',sourceId:'other',name:'VTV1',url:'https://iptv.test/vtv1.m3u8'};
 assert.equal(adaptive.promote(a,backup,[a,x],{[a.id]:[backup]},advanced.alternatives),true);
 assert.deepEqual(adaptive.candidates(x,[a,x],{},advanced.alternatives),[x.url]);
});
test('Playlist refresh preserves matched channel identity and playback preference',()=>{
 const previous={...ch,tvgId:'vtv3',preferredStreamUrl:backup,preferredStreamAt:'2026-11-11T00:00:00.000Z',group:'Favorites'};
 const newer={...ch,id:'temp-9',url:'https://iptv.test/signed?token=abc',tvgId:'vtv3',group:'General'};
 const planned=sourceEdit.planReplacement([previous],[newer],ch.sourceId);
 assert.equal(planned.channels[0].id,previous.id);
 assert.equal(planned.channels[0].group,'Favorites');
 assert.equal(planned.channels[0].preferredStreamUrl,backup);
 assert.equal(planned.channels[0].url,newer.url);
 assert.equal(adaptive.candidates(planned.channels[0],planned.channels,{},advanced.alternatives)[0],newer.url,'obsolete preferred URL not automatically reused');
});
test('Startup refresh is opt-out and skips local M3U sources',()=>{
 const app=file('app.js'),html=file('index.html');
 assert.match(html,/id="autoRefreshM3UStart"/);
 assert.match(html,/src="adaptive-playback\.js"/);
 assert.ok(html.indexOf('adaptive-playback.js')<html.indexOf('app-entry.js'));
 assert.match(app,/store\.autoRefreshM3UOnStart!==false/);
 assert.match(app,/store\.sources\.filter\(s=>s\.type==='url'&&s\.enabled!==false\)/);
 assert.match(app,/fresh\.length<Math\.ceil\(oldCount\*\.65\)/);
 assert.match(app,/if\(!silent&&current\?\.url!==replacement\.url\)await playChannel/);
});
test('Backup cannot be promoted by initial play event alone',()=>{
 const app=file('app.js');
 assert.match(app,/Date\.now\(\)-stablePlayback\.startedAt>=12000/);
 assert.match(app,/player\.currentTime-stablePlayback\.mediaAt>=4/);
 assert.match(app,/if\(playMode==='live'/);
 assert.match(app,/stablePlayback\.startedAt=0/);
});
test('Repeated fallback toast messages are suppressed',()=>{
 const app=file('app.js');
 assert.match(app,/lastToastByMessage/);
 assert.match(app,/Date\.now\(\)/);
 assert.match(app,/textStatus\('Auto Failover: thử link '/);
});

test('Failed preferred backup can be reset safely after canonical stream recovers',()=>{
 const a={...ch,preferredStreamUrl:backup,preferredStreamAt:'2026-11-12T12:00:00.000Z'};
 assert.equal(adaptive.clearPreferred(a),true);
 assert.equal(a.preferredStreamUrl,undefined);
 assert.equal(adaptive.candidates(a,[a],{[a.id]:[backup]},advanced.alternatives)[0],a.url);
 assert.equal(adaptive.clearPreferred(a),false);
});
test('Transient retry is once per candidate and avoids HTTP denial or invalid codec',()=>{
 const app=file('app.js');
 assert.match(app,/transientRetryKeys\.has\(retryKey\)/);
 assert.match(app,/transientRetryKeys\.add\(retryKey\)/);
 assert.match(app,/transientRetryKeys\.clear\(\)/);
 assert.match(app,/MediaError\\s\*\[34\]/);
});
