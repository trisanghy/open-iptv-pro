'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const recent=require('../renderer/recent-channels.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function ch(sourceId,id,name){return {sourceId,id,name,group:'TV',url:'https://example.test/'+id};}
const key=c=>c.name;
test('recent is newest-first, deduplicated and capped at 30',()=>{
 const store={channels:[],sources:[]};recent.migrate(store,key);
 recent.record(store,ch('s','a','A'),key);recent.record(store,ch('s','b','B'),key);recent.record(store,ch('s','a','A'),key);
 assert.deepEqual(store.recentChannels.map(x=>x.id),['a','b']);
 for(let i=0;i<35;i++)recent.record(store,ch('s','id'+i,'N'+i),key);
 assert.equal(store.recentChannels.length,30);
});
test('history skips disabled/deleted channels and locates renamed IDs across refresh',()=>{
 const store={channels:[],sources:[]};recent.migrate(store,key);
 recent.record(store,ch('s','a','A'),key);
 assert.deepEqual(recent.visible(store,[],key),[]);
 assert.deepEqual(recent.visible(store,[ch('s','renamed','A')],key).map(x=>x.id),['renamed']);
});
test('Rust recent UI is real, only tracks proven decoded video and disables virtual folder drag',()=>{
 const app=read('renderer/app.js'),html=read('renderer/index.html');
 assert.match(html,/data-filter="recent"/);
 assert.ok(html.indexOf('recent-channels.js')<html.indexOf('app-entry.js'));
 assert.match(app,/recentCore\.record\(store,ch,favCore\.key\)/);
 assert.ok(app.indexOf('recentCore.record(store,ch,favCore.key)')>app.indexOf("evidence.noteProof(ch,'playback',url)"));
 assert.match(app,/filter==='recent'\?recentCore\.visible/);
 assert.match(app,/enabled:\(\)=>selectionEditable\(\)&&filter!=='recent'/);
 assert.match(app,/const entries=isRecent\?/);
 assert.match(app,/IPTVPrimaryPersistence\.enqueue\(raw\)/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.17-tauri.23.8.32');
});
