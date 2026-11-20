'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pack,unpack,FORMAT}=require('../web-advanced-health-codec.js');
test('advanced diagnostic health is compacted without dropping events or metadata',()=>{
 const url='https://example.invalid/very/long/stream/name.m3u8';
 const events=Array.from({length:12},(_,i)=>({date:'2026-11-20T02:03:41.000Z',type:i%2?'playback':'live',status:'alive',width:1920,height:1080,stalls:i,startupMs:1230,reason:null,extra:{note:'health'}}));
 const input={[url]:events,'https://example.invalid/backup.m3u8':[{type:'probe',reason:'CORS',latencyMs:42}],legacy:{enabled:true}};
 const encoded=pack(input);
 assert.equal(encoded.__format,FORMAT);
 assert.deepEqual(JSON.parse(JSON.stringify(unpack(encoded))),input);
 assert.ok(JSON.stringify(encoded).length<JSON.stringify(input).length*.80);
});
test('older health format stays readable and blank health stays valid',()=>{
 const plain={'https://example.invalid/live.m3u8':[{status:'uncertain',date:'2026-11-20T02:03:41.000Z'}]};
 assert.deepEqual(unpack(plain),plain);
 assert.deepEqual(JSON.parse(JSON.stringify(unpack(pack({})))),{});
 assert.equal(pack(pack(plain)).__format,FORMAT);
});
test('null and missing fields survive encoding distinctly',()=>{
 const input={a:[{status:null},{status:'alive',width:0},{type:'quality',droppedFrames:null}]};
 assert.deepEqual(JSON.parse(JSON.stringify(unpack(pack(input)))),input);
});
