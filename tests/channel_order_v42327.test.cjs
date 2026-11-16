'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const order=require('../renderer/channel-order.js');
const base=path.resolve(__dirname,'..');
const row=(id,group)=>({id,group,name:id,sourceId:'s'});
function fixture(){return {channels:[row('A','Tin tức'),row('B','Tin tức'),row('C','Tin tức'),row('D','Thể thao'),row('E','Thể thao')],groupOrder:['Tin tức','Thể thao'],channelOrder:{}};}
const list=(store,g)=>order.ordered(store,store.channels,store.groupOrder).filter(c=>order.groupOf(c)===g).map(c=>c.id);

test('v4.23.27 batch move keeps selected visual order, even with reversed selection',()=>{
 const s=fixture();order.reconcile(s);
 assert.equal(order.move(s,['C','A'],'Thể thao',{index:1}),2);
 assert.deepEqual(list(s,'Tin tức'),['B']);
 assert.deepEqual(list(s,'Thể thao'),['D','A','C','E']);
 const restored=JSON.parse(JSON.stringify(s));order.reconcile(restored);
 assert.deepEqual(list(restored,'Thể thao'),['D','A','C','E']);
});
test('v4.23.27 moving a batch to the first or last slot of its folder',()=>{
 const s=fixture();order.reconcile(s);
 order.move(s,['B','C'],'Tin tức',{index:0});assert.deepEqual(list(s,'Tin tức'),['B','C','A']);
 order.move(s,['B','C'],'Tin tức',{});assert.deepEqual(list(s,'Tin tức'),['A','B','C']);
});
test('v4.23.27 drag another folder and cross-folder batch without changing stream identity',()=>{
 const s=fixture();order.reconcile(s);const originalIds=s.channels.map(x=>x.id);
 assert.equal(order.moveFolder(s,'Thể thao','Tin tức'),true);
 order.move(s,['B','A'],'Thể thao',{anchorId:'E',after:false});
 assert.deepEqual(s.groupOrder,['Thể thao','Tin tức']);
 assert.deepEqual(list(s,'Thể thao'),['D','A','B','E']);
 assert.deepEqual(s.channels.map(x=>x.id),originalIds);
});
test('v4.23.29 UI uses Shift directly on channel rows without checkboxes',()=>{
 const html=fs.readFileSync(path.join(base,'renderer/index.html'),'utf8');
 const js=fs.readFileSync(path.join(base,'renderer/app.js'),'utf8');
 assert.doesNotMatch(html,/id="channelSelectVisible"|☑ Chọn đang hiện/);
 assert.doesNotMatch(js,/channel-select-wrap|type="checkbox" aria-label="Chọn/);
 assert.match(html,/Giữ Shift \+ bấm kênh để chọn nhiều/);
 assert.match(html,/id="channelBatchPosition"[^>]*min="1"[^>]*step="1"/);
 assert.match(js,/function selectChannelRange\(id,checked\)/);
 assert.match(js,/if\(e\.shiftKey\|\|e\.metaKey\|\|e\.ctrlKey\)/);
 assert.match(js,/if\(selectedChannelIds\.has\(c\.id\)\)setSelected\(c\.id,false\)/);
 assert.match(js,/lastSelectionAnchorId=c\.id;playChannel\(c\.id\)/);
 assert.match(js,/index:position===null\?null:position-1/);
 assert.match(js,/store\.channelOrder=previousOrder/);
 assert.match(js,/store\.groupOrder=originalOrder/);
});
