import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {identifyOrderKeys,reconcileOrder,orderedChannels,moveChannel,moveFolder} from '../src/mobile-channel-order.mjs';
const root=path.resolve(import.meta.dirname,'..');
const mk=(name,url,group='Tin tức',sourceId='s',tvgId='')=>({sourceId,name,url,group,tvgId});
const fixture=()=>[
 mk('VTV1','https://a/one','Tin tức','a','vtv1'),
 mk('VTV2','https://a/two','Tin tức','a','vtv2'),
 mk('VTV3','https://a/three','Giải trí','a','vtv3'),
 mk('HBO','https://b/hbo','Phim','b','hbo')
];
test('EPG player now/next use exactly two stacked horizontal time/title rows',()=>{
 const css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
 const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
 assert.match(css,/MOBILE_EPG_TWO_HORIZONTAL_LINES_AND_TOUCH_SORT/);
 assert.match(css,/\.epg-current-card\{display:grid;grid-template-columns:minmax\(0,1fr\) 44px;grid-template-rows:auto auto/);
 assert.match(css,/\.epg-current-item\{grid-row:1\}/);
 assert.match(css,/\.epg-next-item\{grid-row:2\}/);
 for(const id of ['epgNowTime','epgNowName','epgNextTime','epgNextName','openGuideBtn'])assert.match(layout,new RegExp('id="'+id+'"'));
});
test('order survives reload and M3U URL refresh, source list remains untouched',()=>{
 const raw=fixture();const before=structuredClone(raw),store={};
 const initial=reconcileOrder(store,raw),ids=initial.map(x=>x.orderKey);
 assert.equal(moveChannel(store,raw,ids[1],'Tin tức',{anchorKey:ids[0],after:false}),true);
 let view=orderedChannels(store,reconcileOrder(store,raw));
 assert.deepEqual(view.filter(x=>x.group==='Tin tức').map(x=>x.name),['VTV2','VTV1']);
 assert.deepEqual(raw,before,'original playlist rows must remain intact');
 const persisted=JSON.parse(JSON.stringify(store));
 const changed=structuredClone(raw);changed[1].url='https://cdn.new/stream2';
 const rebuilt=orderedChannels(persisted,reconcileOrder(persisted,changed));
 assert.deepEqual(rebuilt.filter(x=>x.group==='Tin tức').map(x=>x.name),['VTV2','VTV1']);
 assert.equal(rebuilt.find(x=>x.name==='VTV2').url,'https://cdn.new/stream2');
});
test('cross-folder channel move persists without changing original M3U group',()=>{
 const raw=fixture(),store={};const rows=reconcileOrder(store,raw),id=rows[0].orderKey,target=rows[2].orderKey;
 assert.equal(moveChannel(store,raw,id,'Giải trí',{anchorKey:target,after:true}),true);
 const rebuilt=orderedChannels(store,reconcileOrder(store,raw));
 assert.equal(rebuilt.find(c=>c.name==='VTV1').group,'Giải trí');
 assert.deepEqual(rebuilt.filter(c=>c.group==='Giải trí').map(c=>c.name),['VTV3','VTV1']);
 assert.equal(raw[0].group,'Tin tức');
});
test('group reorder and disabled-source restoration leave favourite URL metadata intact',()=>{
 const raw=fixture(),store={favorites:[raw[0].url],recentlyWatched:[raw[0].url]};
 reconcileOrder(store,raw);
 assert.equal(moveFolder(store,'Phim','Tin tức',false),true);
 const snapshot=JSON.parse(JSON.stringify(store));
 assert.deepEqual(orderedChannels(snapshot,reconcileOrder(snapshot,raw)).map(c=>c.group),['Phim','Tin tức','Tin tức','Giải trí']);
 assert.equal(snapshot.favorites[0],raw[0].url);
 assert.equal(snapshot.recentlyWatched[0],raw[0].url);
 const onlyA=raw.filter(c=>c.sourceId!=='b');
 assert.equal(orderedChannels(snapshot,onlyA).length,3);
 assert.ok(orderedChannels(snapshot,reconcileOrder(snapshot,raw)).some(c=>c.sourceId==='b'));
});
test('identical names across sources and duplicate tvg IDs remain distinct',()=>{
 const rows=[mk('VTV3','https://x/1','A','s1','vtv3'),mk('VTV3','https://x/2','A','s1','vtv3'),mk('VTV3','https://y/1','A','s2','vtv3')];
 const indexed=identifyOrderKeys(rows);
 assert.equal(new Set(indexed.map(c=>c.orderKey)).size,3);
 const store={};reconcileOrder(store,rows);
 const id=indexed[1].orderKey;
 assert.equal(moveChannel(store,rows,id,'A',{anchorKey:indexed[0].orderKey,after:false}),true);
 assert.deepEqual(orderedChannels(store,reconcileOrder(store,rows)).map(x=>x.url),['https://x/2','https://x/1','https://y/1']);
});
test('touch sorter follows Web 800ms long hold, scroll-cancel, no extra drag handles',()=>{
 const touch=fs.readFileSync(path.join(root,'src/mobile-touch-sort.mjs'),'utf8');
 const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
 assert.match(touch,/HOLD=800,SLOP=14/);
 assert.match(touch,/touchmove.*?move/);
 assert.match(touch,/if\(e.cancelable\)e.preventDefault\(\)/);
 assert.match(touch,/suppressUntil=Date.now\(\)\+1100/);
 assert.match(touch,/elementFromPoint/);
 assert.match(main,/installChannelTouchSort\(/);
 assert.match(main,/reconcileOrder\(state,allSourceChannels\(\)\)/);
 assert.match(main,/header.dataset.orderGroup=group/);
 assert.match(main,/item.dataset.orderKey=c.orderKey/);
});
