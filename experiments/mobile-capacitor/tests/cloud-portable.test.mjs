import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};
vm.runInNewContext(fs.readFileSync(new URL('../public/cloud-portable.js',import.meta.url),'utf8'),ctx);
const api=ctx.OpenIPTVPortableCloud;

test('shared cloud schema excludes images and EPG while retaining M3U links',()=>{
 const raw={channels:[{id:'one',url:'https://example.test/vtv.m3u8',logo:'https://cdn.test/logo.png',thumbnail:'data:image/png;base64,aaa'}],
  sources:[{id:'a',url:'https://example.test/list.m3u?token=abc'}],favorites:['one'],snapshots:{a:'verylarge'},epgCache:'large',videoFit:'cover',volume:.5};
 const result=api.canonical(raw,'desktop');
 assert.equal(result.snapshots,undefined);assert.equal(result.epgCache,undefined);
 assert.equal(result.channels[0].thumbnail,undefined);
 assert.equal(result.channels[0].logo,'https://cdn.test/logo.png');
 assert.equal(result.channels[0].url,'https://example.test/vtv.m3u8');
 assert.equal(result.volume,.5);
});
test('mobile canonical schema converts favourites and strips embedded source channels',()=>{
 const ch={id:'src|0',sourceId:'src',name:'VTV',url:'https://example.test/stream',snapshotImage:'data:image/jpeg;base64,BBB'};
 const raw={sources:[{id:'src',name:'Local',channels:[ch]}],channels:[ch],
  favorites:['https://example.test/stream'],channelOrder:{all:['src|0']},
  epgCache:{large:'do-not-sync'},settings:{volume:.7}};
 const result=api.canonical(raw,'mobile');
 assert.equal(result.sources[0].channels,undefined);
 assert.equal(result.favorites[0],'src|0');
 assert.equal(result.channels[0].snapshotImage,undefined);
 assert.equal(result.volume,.7);
 const restored=api.applyCloud({settings:{autoRefreshEPG:true}},result,'mobile');
 assert.equal(restored.sources[0].channels[0].id,'src|0');
 assert.equal(restored.favorites[0],'https://example.test/stream');
 assert.equal(restored.settings.autoRefreshEPG,true);
});
test('unknown cloud settings do not wipe an existing platform settings object',()=>{
 const current={sources:[],channels:[],specificFeature:true,settings:{localOnly:true}};
 const cloud={sources:[{id:'a'}],channels:[{id:'tv',sourceId:'a'}],volume:.5};
 const result=api.applyCloud(current,cloud,'mobile');
 assert.equal(result.specificFeature,true);
 assert.equal(result.settings.localOnly,true);
 assert.equal(result.settings.volume,.5);
});


test('sign-out clears account playlists without deleting device appearance preferences',()=>{
 const old={sources:[{id:'secret',url:'https://private.invalid/file.m3u?token=abc'}],
  channels:[{id:'one'}],favorites:['one'],collectorBackup:{channels:[{id:'one'}]},
  snapshots:{secret:'data:image/png;base64,AAAA'},channelOrder:{all:['one']},
  current:'one',volume:.7,videoFit:'contain',theme:'dark'};
 const guest=api.guestState(old,'desktop');
 assert.equal(guest.sources.length,0);
 assert.equal(guest.channels.length,0);
 assert.equal(guest.favorites.length,0);
 assert.equal(guest.current,'');
 assert.equal(Object.keys(guest.snapshots).length,0);
 assert.equal(Object.keys(guest.collectorBackup).length,0);
 assert.equal(guest.volume,.7);
 assert.equal(guest.videoFit,'contain');
 assert.equal(guest.theme,'dark');
 assert.equal(old.sources.length,1,'never mutate the signed-in store before persistence succeeds');
});
test('Mobile logout clears account-owned sources and restores safe guest state',()=>{
 const old={sources:[{id:'my-source',channels:[{id:'a'}]}],channels:[{id:'a'}],
  favorites:['url-a'],recentlyWatched:['url-a'],selected:'url-a',
  fallbacks:{'url-a':'https://secret.invalid'},epgCache:{programs:[1]},
  epgUrl:'https://private.invalid/epg.xml',settings:{autoPiPOnBackground:true},
  otherLocalOption:'kept'};
 const guest=api.guestState(old,'mobile');
 for(const field of ['sources','channels','favorites','recentlyWatched'])
  assert.equal(guest[field].length,0);
 assert.equal(guest.selected,null);
 assert.equal(guest.resumeUrl,null);
 assert.equal(guest.epgCache,null);
 assert.equal(guest.epgUrl,'');
 assert.equal(Object.keys(guest.fallbacks).length,0);
 assert.equal(guest.settings.autoPiPOnBackground,true);
 assert.equal(guest.otherLocalOption,'kept');
 assert.equal(old.sources[0].id,'my-source');
});
