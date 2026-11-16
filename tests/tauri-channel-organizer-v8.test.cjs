'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const organizer=require('../renderer/channel-organizer.js');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const makeStore=()=>({
 channels:[{id:'a1',name:'Alpha1',group:'A',sourceId:'src'},{id:'a2',group:'A',sourceId:'src'},
 {id:'a3',group:'A',sourceId:'src'},{id:'b1',group:'B',sourceId:'src'},{id:'b2',group:'B',sourceId:'src'}],
 groupOrder:['A','B'],folders:['A','B'],channelOrder:{},favorites:['a1'],snapshots:{'a-url':{file:'snapshot.jpg'}}
});
test('Channel organizer attaches before application starts and stylesheet is bundled',()=>{
 assert.match(html, /<script src="channel-organizer\.js"><\/script>(?:<script src="sidebar-compact\.js"><\/script>)?<script src="app-entry\.js"><\/script>/);
 assert.match(html, /channel-organizer\.css/);
 assert.match(code, /const organizer=window\.IPTVChannelOrganizer/);
});
test('Bulk action controls are accessible, visible, and wired',()=>{
 for(const id of ['selectVisibleBtn','bulkMoveBtn','clearSelectionBtn','channelBulkToolbar','channelSelectionCount'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(code,/\.channel-select'\)\.addEventListener\('click'/);
 assert.match(code,/lastSelectionAnchor/);
});
test('Reorder one channel within the same folder',()=>{
 const store=makeStore();const result=organizer.move(store,['a3'],'A','a1');
 assert.deepEqual(organizer.groupList(store,'A'),['a3','a1','a2']);
 assert.equal(result.count,1);assert.equal(store.channels.find(c=>c.id==='a3').group,'A');
});
test('Reorder selected channels with input selection order reversed',()=>{
 const store=makeStore();organizer.move(store,['a3','a2'],'A','a1');
 assert.deepEqual(organizer.groupList(store,'A'),['a2','a3','a1']);
});
test('Bulk move across folders preserves display order',()=>{
 const store=makeStore();const result=organizer.move(store,['a2','a1'],'B','b2');
 assert.equal(result.count,2);
 assert.deepEqual(organizer.groupList(store,'A'),['a3']);
 assert.deepEqual(organizer.groupList(store,'B'),['b1','a1','a2','b2']);
 assert.equal(store.channels.find(c=>c.id==='a2').group,'B');
});
test('Move across folders appends when dropped onto a folder header',()=>{
 const store=makeStore();organizer.move(store,['a1'],'B');
 assert.deepEqual(organizer.groupList(store,'B'),['b1','b2','a1']);
});
test('Multiple groups can be selected in one bulk move',()=>{
 const store=makeStore();organizer.move(store,['b2','a3'],'B','b1');
 assert.deepEqual(organizer.groupList(store,'B'),['a3','b2','b1']);
 assert.deepEqual(organizer.groupList(store,'A'),['a1','a2']);
});
test('Dragging a selection on one of its own channels does not reorder',()=>{
 const store=makeStore(),before=JSON.stringify(store);
 assert.equal(organizer.move(store,['a1','a2'],'A','a2').changed,false);
 assert.equal(JSON.stringify(store),before);
});
test('Non-existing before target is rejected atomically',()=>{
 const store=makeStore(),before=JSON.stringify(store);
 assert.equal(organizer.move(store,['a1'],'B','missing').changed,false);
 assert.equal(JSON.stringify(store),before);
});
test('Unknown channels cannot be inserted or moved',()=>{
 const store=makeStore();assert.equal(organizer.move(store,['bad'],'B').changed,false);
 assert.equal(store.channels.length,5);
});
test('Reconcile after automatic M3U refresh retains sorted stable IDs',()=>{
 const store=makeStore();organizer.move(store,['a3'],'A','a1');
 store.channels=store.channels.filter(c=>c.id!=='a2');store.channels.push({id:'a4',group:'A',sourceId:'src'});
 organizer.reconcile(store);
 assert.deepEqual(organizer.groupList(store,'A'),['a3','a1','a4']);
 assert.deepEqual(store.channelOrder.A,['a3','a1','a4']);
});
test('Persistent channel ordering survives JSON save/reload',()=>{
 const store=makeStore();organizer.move(store,['a3'],'A','a1');
 const restored=JSON.parse(JSON.stringify(store));
 assert.deepEqual(organizer.groupList(restored,'A'),['a3','a1','a2']);
});
test('Renaming a folder retains channel positions',()=>{
 const store=makeStore();organizer.move(store,['a3'],'A','a1');
 organizer.renameGroup(store,'A','News');
 assert.deepEqual(organizer.groupList(store,'News'),['a3','a1','a2']);
 assert.ok(!('A' in store.channelOrder));
});
test('Deleting a folder moves channels to Khác without deleting data',()=>{
 const store=makeStore();organizer.deleteGroup(store,'A');
 assert.deepEqual(organizer.groupList(store,'Khác'),['a1','a2','a3']);
 assert.equal(store.channels.length,5);
});
test('Favorites and snapshots stay unchanged on move',()=>{
 const store=makeStore(),fav=JSON.stringify(store.favorites),shots=JSON.stringify(store.snapshots);
 organizer.move(store,['a1','b2'],'B','b1');
 assert.equal(JSON.stringify(store.favorites),fav);
 assert.equal(JSON.stringify(store.snapshots),shots);
});
test('A large channel list can be bulk moved with bounded order storage',()=>{
 const store={channels:Array.from({length:1205},(_,i)=>({id:`x${i}`,group:i<600?'A':'B',sourceId:'s'})),folders:['A','B'],groupOrder:['A','B'],channelOrder:{}};
 const moveIds=store.channels.slice(0,600).map(c=>c.id);
 assert.equal(organizer.move(store,moveIds,'B').count,600);
 assert.equal(organizer.groupList(store,'B').length,1205);
 assert.equal(organizer.groupList(store,'A').length,0);
 assert.equal(new Set(store.channelOrder.B).size,1205);
});
test('Prototype-looking group names cannot pollute Object prototype',()=>{
 const store=makeStore();store.channels[0].group='__proto__';
 organizer.move(store,['a1'],'B');
 assert.equal(Object.getPrototypeOf(store.channelOrder),null);
 assert.equal(Object.prototype.polluted,undefined);
});
test('App preserves organization after M3U source refresh and through export',()=>{
 assert.match(code,/sourceEdit\.replaceSourceInStore[\s\S]{0,210}organizer\.reconcile/);
 assert.match(code,/organizer\.sorted\(store,g,active\.filter/);
 assert.match(code,/organizer\.sorted\(store,group,groups\.get\(group\)\|\|\[\]\)/);
});
test('Drop zones permit inside-folder reorder and cross-folder bulk move',()=>{
 assert.match(code,/channel-drop-after/);
 assert.match(code,/moveDroppedChannel\(e,dest,beforeId\)/);
 assert.match(code,/moveDroppedChannel\(e,group\)/);
 assert.match(code,/selectedChannelIds\.has\(c\.id\)\?\[\.\.\.selectedChannelIds\]/);
});
test('Channel reorganization does not change player URL or source config',()=>{
 const store=makeStore();store.channels[0].url='https://example.org/live.m3u8';
 organizer.move(store,['a1'],'B');
 assert.equal(store.channels[0].url,'https://example.org/live.m3u8');
});
