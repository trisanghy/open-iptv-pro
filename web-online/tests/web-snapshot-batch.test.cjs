'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const batch=require('../../web-snapshot-batch.js');
test('all channels are queued, including batches larger than the old 80 limit',()=>{
 const channels=Array.from({length:1691},(_,i)=>({id:'id'+i,url:'https://stream.example/'+i+'.m3u8',name:'TV '+i}));
 const result=batch.plan(channels,{},true);
 assert.equal(result.pending.length,1691);
 assert.equal(result.total,1691);
 assert.equal(result.skipped,0);
 assert.equal(result.pending.at(-1),channels.at(-1));
});
test('reruns resume remaining channels without overwriting existing snapshots',()=>{
 const channels=Array.from({length:200},(_,i)=>({url:'https://example.com/'+i}));
 channels.push({...channels[1],id:'dupe'});
 const snapshots=Object.fromEntries(channels.slice(0,120).map(c=>[c.url,{data:'data:image/jpeg;base64,test'}]));
 const result=batch.plan(channels,snapshots,true);
 assert.equal(result.pending.length,80);
 assert.equal(result.skipped,121);
 assert.equal(result.total,201);
 assert.equal(batch.plan(channels,snapshots,false).pending.length,200);
});
test('quota failure stops the rest of the queue without destroying previous snapshots',()=>{
 assert.equal(batch.isStorageFull(new Error('Không đủ dung lượng lưu Snapshot trên Web')),true);
 assert.equal(batch.isStorageFull({name:'QuotaExceededError'}),true);
 assert.equal(batch.isStorageFull(new Error('CORS / mạng')),false);
});
test('Web app and build both use the same unlimited queue and keep cancellation',()=>{
 const app=read('app.js'),html=read('index.html'),builder=read('web-online/prepare-web.py');
 assert.match(app,/OpenIPTVSnapshotBatch\.plan\(all,store\.snapshots,store\.snapshotSkipExisting\)/);
 assert.match(app,/OpenIPTVSnapshotBatch\.isStorageFull\(e\)/);
 assert.match(app,/t\.abortController\?\.abort\(\)/);
 assert.doesNotMatch(app,/pending\.length\s*=\s*80/);
 assert.match(html,/web-snapshot-batch\.js\?v=snapshot-all-20261119b/);
 assert.match(builder,/web-snapshot-batch\.js/);
 assert.match(builder,/web_app\[snapshot_start:web_app\.index\(snapshot_end,snapshot_start\)\]/);
 assert.equal(read('web-online/web-snapshot-batch.js'),read('web-snapshot-batch.js'));
});
