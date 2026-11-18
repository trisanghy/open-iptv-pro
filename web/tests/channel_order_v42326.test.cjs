'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const order=require('../renderer/channel-order.js');
const sourceEdit=require('../renderer/source-edit.js');
const root=path.join(__dirname,'..');
const channel=(id,group,name=id)=>({id,sourceId:'src',url:`https://example.org/${id}.m3u8`,group,name});
const state=()=>({channels:[channel('a','News'),channel('b','News'),channel('c','News'),channel('d','Sports'),channel('e','Sports')],groupOrder:['News','Sports'],channelOrder:{}});
const names=(s,g)=>order.ordered(s,s.channels,s.groupOrder).filter(c=>order.groupOf(c)===g).map(c=>c.id);

test('v4.23.26: reconciles old stores without wiping sources, channels, folders',()=>{
 const s=state();s.channelOrder={News:['c','c','missing','a','b','evil'],Old:['ghost']};
 order.reconcile(s);assert.deepEqual(s.channelOrder.News,['c','a','b']);assert.deepEqual(s.channelOrder.Sports,['d','e']);assert.equal(s.channelOrder.Old,undefined);
 assert.equal(s.channels.length,5);
});
test('v4.23.26: reorder channel up/down in same folder and persist via JSON',()=>{
 const s=state();order.move(s,['c'],'News',{anchorId:'a'});assert.deepEqual(names(s,'News'),['c','a','b']);
 order.move(s,['c'],'News',{anchorId:'b',after:true});assert.deepEqual(names(s,'News'),['a','b','c']);
 const restored=JSON.parse(JSON.stringify(s));order.reconcile(restored);assert.deepEqual(names(restored,'News'),['a','b','c']);
});
test('v4.23.26: moving multiple channels to another folder preserves visual relative ordering',()=>{
 const s=state();order.reconcile(s);order.move(s,['b','a'],'Sports',{anchorId:'e'});
 assert.deepEqual(names(s,'News'),['c']);assert.deepEqual(names(s,'Sports'),['d','a','b','e']);
 assert.equal(s.channels.find(c=>c.id==='a').group,'Sports');
});
test('v4.23.26: multi-selection drag into same folder before/after an anchor',()=>{
 const s=state();order.reconcile(s);order.move(s,['a','b'],'News',{anchorId:'c',after:true});
 assert.deepEqual(names(s,'News'),['c','a','b']);
 assert.equal(order.move(s,['b'],'News',{anchorId:'b'}),0);
});
test('v4.23.26: move to numeric position allows top and bottom, clamps out-of-range',()=>{
 const s=state();order.reconcile(s);order.move(s,['a'],'Sports',{index:0});assert.deepEqual(names(s,'Sports'),['a','d','e']);
 order.move(s,['a'],'Sports',{index:10000});assert.deepEqual(names(s,'Sports'),['d','e','a']);
});
test('v4.23.26: group order preserved independently from channel order',()=>{
 const s=state();order.reconcile(s);assert.equal(order.moveFolder(s,'Sports','News'),true);
 assert.deepEqual(s.groupOrder,['Sports','News']);assert.deepEqual(order.ordered(s,s.channels).map(x=>x.id),['d','e','a','b','c']);
 assert.equal(order.moveFolder(s,'News','News'),false);
});
test('v4.23.26: folder rename keeps ordered channels',()=>{
 const s=state();order.reconcile(s);order.move(s,['c'],'News',{index:0});order.renameFolder(s,'News','Bulletin');
 assert.deepEqual(names(s,'Bulletin'),['c','a','b']);assert.equal(s.channelOrder.News,undefined);
});
test('v4.23.26: source refresh preserves group and order by stable channel ID',()=>{
 const s=state();order.reconcile(s);order.move(s,['c'],'News',{index:0});order.move(s,['b'],'Sports',{index:0});
 s.channels=sourceEdit.planReplacement(s.channels,[channel('z','Default','c'),channel('x','Default','a'),channel('y','Default','b')], 'src',[]).channels;
 order.reconcile(s);assert.deepEqual(names(s,'News').filter(x=>['c','a'].includes(x)),['c','a']);
 assert.equal(s.channels.find(x=>x.id==='b').group,'Sports');
});
test('v4.23.26: invalid moves do not destroy order; selection prunes stale IDs',()=>{
 const s=state();order.reconcile(s);assert.throws(()=>order.move(s,['a'],'Other',{anchorId:'d'}),/Kênh đích/);
 assert.deepEqual(names(s,'News'),['a','b','c']);assert.deepEqual(order.pruneSelection(['a','a','missing','d'],s),['a','d']);
});
test('v4.23.26: source group aliases with check timestamp are normalized safely',()=>{
 const s=state();s.channels[0].group='News | Kiểm tra: 16/11/2026 09:30';order.reconcile(s);
 assert.deepEqual(names(s,'News'),['a','b','c']);
});
test('v4.23.26: renderer includes multi-select UI, channel drop, folder buttons and sorted M3U export',()=>{
 const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8'),js=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
 for(const id of ['channelSelectionBar','channelBatchFolder','channelBatchMove','channelClearSelection'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(html,/src="channel-order\.js"/);
 for(const part of ['channel-selected','channel-drop-before','channel-drop-after','folder-up','folder-down','channelOrderCore.move','sortedChannels(enabledChannels())'])assert.ok(js.includes(part),part);
});
