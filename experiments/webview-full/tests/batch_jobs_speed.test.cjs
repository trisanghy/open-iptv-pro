'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createBatchJobs}=require('../backend/batch-jobs.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function collect(jobs,id){let offset=0,all=[];const started=Date.now();while(Date.now()-started<5000){const s=jobs.status(id,offset);all.push(...s.results);offset=s.nextOffset;if(s.finished&&offset===s.done)return {status:s,results:all,elapsed:Date.now()-started};await wait(20)}throw Error('Batch timed out')}
test('32 true backend workers: 96 jobs completed without WebView held RPC connections',async()=>{
 let active=0,peak=0,calls=0;
 const jobs=createBatchJobs({check:async()=>{active++;peak=Math.max(active,peak);calls++;await wait(75);active--;return {status:'alive'};},snapshot:async()=>({file:'ok.jpg'})});
 const items=Array.from({length:96},(_,i)=>({url:`https://example.com/${i}.ts`,label:`TV ${i}`}));
 const b=jobs.start({kind:'check',items,concurrency:32});assert.equal(b.workers,32);
 const {status,results,elapsed}=await collect(jobs,b.id);
 assert.equal(status.done,96);assert.equal(status.finished,true);assert.equal(results.length,96);assert.equal(calls,96);assert.equal(peak,32);assert.equal(status.peak,32);
 assert.ok(elapsed<700,`Batch should be concurrent, took ${elapsed}ms`);
});
test('duplicate URL is checked once inside a batch without dropping channel results',async()=>{
 let calls=0;const jobs=createBatchJobs({check:async()=>{calls++;await wait(30);return {status:'alive'};},snapshot:async()=>({})});
 const {id}=jobs.start({kind:'check',items:Array.from({length:32},()=>({url:'https://example.com/same.m3u8',label:'One'})),concurrency:32});
 const done=await collect(jobs,id);assert.equal(done.results.length,32);assert.equal(calls,1);
});
test('cancel stops queueing new channels and keeps completed results',async()=>{
 const jobs=createBatchJobs({check:async()=>{await wait(75);return {status:'alive'};},snapshot:async()=>({})});
 const {id}=jobs.start({kind:'check',items:Array.from({length:40},(_,i)=>({url:'https://example.com/'+i})),concurrency:4});
 await wait(15);jobs.cancel(id);const done=await collect(jobs,id);
 assert.equal(done.status.cancelled,true);assert.ok(done.status.done<=4);assert.ok(done.status.finished);
});
test('repair batch tries alternatives only after main URL fails and shares duplicate check work',async()=>{
 let calls=0;
 const jobs=createBatchJobs({check:async(url)=>{calls++;await wait(5);return url.includes('backup')?{status:'alive',positiveEvidence:true}:{status:'dead',confirmedDead:true};},snapshot:async()=>({})});
 const items=Array.from({length:40},(_,i)=>({url:'https://example.com/primary',alternates:['https://example.com/backup'],label:'Test '+i}));
 const {id}=jobs.start({kind:'repair',items,concurrency:32});const result=await collect(jobs,id);
 assert.equal(result.status.done,40);assert.equal(result.results.length,40);assert.equal(calls,2);
 for(const item of result.results){assert.equal(item.ok,true);assert.equal(item.value.length,2);assert.equal(item.value[1].status,'alive');}
});
test('non-HTTP IPTV entries do not abort the entire batch',async()=>{
 const jobs=createBatchJobs({check:async url=>url.startsWith('http')?{status:'alive'}:{status:'uncertain',reason:'Unsupported stream transport'},snapshot:async()=>({})});
 const {id}=jobs.start({kind:'check',items:[{url:'rtsp://stream.example/live'},{url:'https://example.com/ts'}],concurrency:2});
 const result=await collect(jobs,id);assert.equal(result.results.length,2);assert.equal(result.results.find(x=>x.index===0).value.status,'uncertain');
});
