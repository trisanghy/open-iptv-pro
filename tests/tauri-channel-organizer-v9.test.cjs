'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const organizer=require('../renderer/channel-organizer.js');
const pointer=require('../renderer/channel-pointer-dnd.js');
const code=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/channel-organizer.css'),'utf8');
function state(){return {channels:[{id:'a1',group:'A',url:'https://example.com/1.ts'},{id:'a2',group:'A'},{id:'a3',group:'A'},{id:'b1',group:'B'},{id:'b2',group:'B'}],folders:['A','B'],groupOrder:['A','B'],channelOrder:{},snapshots:{},favorites:['a1']};}
test('shift + click selects channels without checkbox, toolbar or modal',()=>{
 assert.doesNotMatch(html,/channelBulkToolbar|bulkMoveBtn|clearSelectionBtn|selectVisibleBtn|channel-select/);
 assert.match(html,/Giữ Shift \+ bấm/);
 assert.match(code,/if\(e\.shiftKey\).*?toggleShiftSelection\(c\.id\)/s);
 assert.doesNotMatch(code,/openMoveSelectionModal|channel\.draggable|row\.draggable|channel-move/);
});
test('pointer drag engine loads before app entry, works without HTML drag events',()=>{
 assert.match(html,/<script src="channel-organizer\.js"><\/script><script src="channel-pointer-dnd\.js"><\/script>/);
 assert.match(code,/window\.IPTVPointerDnD\.create/);
 assert.match(css,/channel-drop-position/);
 const source=fs.readFileSync(path.join(root,'renderer/channel-pointer-dnd.js'),'utf8');
 assert.match(source,/pointerdown/);assert.match(source,/pointermove/);assert.match(source,/pointerup/);
 assert.doesNotMatch(source,/e\.dataTransfer|setData\(/);
});
test('group reorder result persists in groupOrder',()=>{
 const s=state();s.groupOrder=['B','A'];
 // Group order and channel order are independent; organizer doesn't change user group order.
 organizer.move(s,['b2'],'B','b1');
 assert.deepEqual(s.groupOrder,['B','A']);
 assert.deepEqual(organizer.groupList(s,'B'),['b2','b1']);
});
test('single channel reorder inside its folder',()=>{
 const s=state();assert.equal(organizer.move(s,['a3'],'A','a1').changed,true);
 assert.deepEqual(organizer.groupList(s,'A'),['a3','a1','a2']);
});
test('shift-picked multiple channels move into another folder and preserve order',()=>{
 const s=state();organizer.move(s,['a3','a1'],'B','b2');
 assert.deepEqual(organizer.groupList(s,'A'),['a2']);
 assert.deepEqual(organizer.groupList(s,'B'),['b1','a1','a3','b2']);
});
test('dropping onto header appends channels',()=>{
 const s=state();organizer.move(s,['a2'],'B');
 assert.deepEqual(organizer.groupList(s,'B'),['b1','b2','a2']);
});
test('drop position before and after resolves against visual rows',()=>{
 function elt(name,attrs={},parent=null,rect={top:20,height:100}){return {dataset:attrs,previousElementSibling:parent,closest(s){if(s.includes('channel-item')&&name==='channel')return this;if(s.includes('folder-header')&&name==='folder')return this;return null;},matches(s){return name==='folder'&&s.includes('folder-header')},getBoundingClientRect(){return rect;}};}
 const folder=elt('folder',{group:'A'}),row=elt('channel',{channelId:'a2'},folder);
 const host={contains(){return true;}};
 const x=pointer.getDrop(row,'channel',['a1'],host,null,24);
 assert.equal(x.group,'A');assert.equal(x.targetId,'a2');assert.equal(x.after,false);
 const y=pointer.getDrop(row,'channel',['a1'],host,null,90);assert.equal(y.after,true);
 assert.equal(pointer.getDrop(row,'channel',['a2'],host,null,90),null);
});
test('folder drop targets support before and after, not other channel drag',()=>{
 const folder={dataset:{group:'B'},closest(s){return s.includes('folder-header')?this:null;},getBoundingClientRect(){return {top:0,height:50};}};
 const host={contains(){return true;}};
 assert.equal(pointer.getDrop(folder,'folder',[],host,null,10).after,false);
 assert.equal(pointer.getDrop(folder,'folder',[],host,null,40).after,true);
});
test('reconcile keeps order after source M3U refresh',()=>{
 const s=state();organizer.move(s,['a3'],'A','a1');s.channels.push({id:'a4',group:'A'});organizer.reconcile(s);
 assert.deepEqual(organizer.groupList(s,'A'),['a3','a1','a2','a4']);
});
test('snapshot/favorites and URLs never modified by reorder',()=>{
 const s=state(),before=[JSON.stringify(s.favorites),JSON.stringify(s.snapshots),s.channels[0].url];
 organizer.move(s,['a1','a3'],'B');
 assert.deepEqual([JSON.stringify(s.favorites),JSON.stringify(s.snapshots),s.channels[0].url],before);
});
test('UI binds pointer controller and does not install legacy dragover handler',()=>{
 assert.match(code,/installChannelPointerDnD\(\)/);
 assert.match(code,/onFolderDrop:\(\{source,target,after\}\)=>reorderGroup\(source,target,after\)/);
 assert.match(code,/onChannelDrop:\(\{ids,group,targetId,after\}\)=>/);
 assert.doesNotMatch(code,/addEventListener\('dragover'/);
});
test('1000+ channel selection can be reordered without creating duplicates',()=>{
 const s={channels:Array.from({length:1205},(_,i)=>({id:'c'+i,group:i<602?'A':'B'})),groupOrder:['A','B'],folders:['A','B'],channelOrder:{}};
 const ids=s.channels.slice(0,602).map(c=>c.id);
 const result=organizer.move(s,ids,'B');
 assert.equal(result.count,602);assert.equal(new Set(organizer.groupList(s,'B')).size,1205);
});
