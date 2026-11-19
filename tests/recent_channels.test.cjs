'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const recent=require('../renderer/recent-channels.js');
const favorites=require('../renderer/favorites-core.js');
const app=fs.readFileSync(path.join(__dirname,'../renderer/app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const mk=(id,sourceId='s')=>({id,sourceId,name:'Channel '+id,group:'News',url:'https://test.invalid/'+id+'.m3u8'});
test('migrates only verified playback, most recent first',()=>{
 const older={...mk('a'),lastPlaybackAt:'2026-11-01T12:00:00Z'};
 const newer={...mk('b'),lastPlaybackAt:'2026-11-02T12:00:00Z'};
 const notPlayed={...mk('c'),status:'alive'};
 const store={channels:[older,notPlayed,newer]};
 recent.migrate(store,favorites.key);
 assert.deepEqual(recent.visible(store,[older,newer,notPlayed],favorites.key).map(c=>c.id),['b','a']);
 assert.equal(store.recentChannels.length,2);
});
test('records success in last-viewed order without duplicates; survives reload',()=>{
 const a=mk('a'),b=mk('b'),store={channels:[a,b]};
 recent.record(store,a,favorites.key,'2026-11-02T12:00:00Z');
 recent.record(store,b,favorites.key,'2026-11-02T12:01:00Z');
 recent.record(store,a,favorites.key,'2026-11-02T12:02:00Z');
 assert.deepEqual(recent.visible(JSON.parse(JSON.stringify(store)),[a,b],favorites.key).map(c=>c.id),['a','b']);
 assert.equal(store.recentChannels.length,2);
 assert.equal(JSON.stringify(store.recentChannels).includes('https://'),false);
});
test('tracks at most 30 items and respects disabled sources',()=>{
 const channels=Array.from({length:40},(_,i)=>mk(String(i),'s'+i));
 const store={channels};
 channels.forEach((c,i)=>recent.record(store,c,favorites.key,new Date(1762000000000+i*1000).toISOString()));
 assert.equal(store.recentChannels.length,30);
 assert.equal(store.recentChannels[0].id,'39');
 assert.equal(recent.visible(store,channels.filter(c=>c.sourceId!=='s39'),favorites.key)[0].id,'38');
});
test('resolves channel refresh by source and normalized name, not obsolete URL',()=>{
 const before=mk('old'),after={...mk('new'),name:before.name,url:'https://test.invalid/new'};
 const store={channels:[before]};
 recent.record(store,before,favorites.key);
 assert.equal(recent.visible(store,[after],favorites.key)[0],after);
 assert.deepEqual(recent.visible(store,[],favorites.key),[]);
});
test('renderer integrates recent filter and records only after real decoding',()=>{
 assert.match(html,/data-filter="recent">[^<]*Vừa xem/);
 assert.match(html,/recent-channels\.js[^]*app\.js/);
 assert.match(app,/filter==='recent'\?recentCore\.visible/);
 assert.match(app,/markPlaybackVerified\(\)[^]*recentCore\.record\(store,ch,favCore\.key\)/);
 assert.match(app,/if\(!ch\|\|!url\|\|player\.readyState<2\|\|player\.paused/);
});
