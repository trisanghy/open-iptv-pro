import test from 'node:test';import assert from 'node:assert/strict';import {stableId,dedupChannels,normalizeHTTPURL,pool,xmltvDate} from '../src/mobile-core.mjs';
test('stable IDs and URL validation',()=>{assert.equal(stableId('VTV1'),stableId('VTV1'));assert.throws(()=>normalizeHTTPURL('javascript:alert(1)'));assert.equal(normalizeHTTPURL('https://example.org/a.m3u'),'https://example.org/a.m3u');});
test('deduplicate without dropping channel metadata',()=>{const a={name:'One',url:'http://x'},b={name:'Two',url:'http://x'};assert.deepEqual(dedupChannels([a,b]),[a]);});
test('pool concurrency never exceeds 32',async()=>{let running=0,peak=0;const out=await pool(Array.from({length:96},(_,i)=>i),32,async i=>{running++;peak=Math.max(peak,running);await new Promise(r=>setTimeout(r,8));running--;return i*2;});assert.equal(peak,32);assert.equal(out[95],190);});
test('XMLTV datetime timezone',()=>{assert.equal(xmltvDate('20261108060000 +0700')?.toISOString(),'2026-11-07T23:00:00.000Z');});
