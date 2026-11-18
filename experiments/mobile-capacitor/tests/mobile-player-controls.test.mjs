import test from 'node:test';import assert from 'node:assert/strict';
import {streamOptions,epgNowNext} from '../src/mobile-player-controls.mjs';
test('primary and fallback streams are explicit, bounded and deduplicated',()=>{
 const c={url:'https://example.org/main.m3u8'};
 const data={[c.url]:['https://example.org/main.m3u8','https://example.org/backup.m3u8']};
 assert.deepEqual(streamOptions(c,data).map(x=>x.label),['Link chính','Link dự phòng 1']);
 assert.equal(streamOptions(c,data)[1].url,data[c.url][1]);
 assert.deepEqual(streamOptions(null,data),[]);
});
test('EPG now/next follows selected tvg-id and respects time',()=>{
 const parse=s=>new Date(s);
 const data=[{channel:'a',start:'2026-11-18T12:00:00Z',stop:'2026-11-18T13:00:00Z',title:'Now'},
 {channel:'a',start:'2026-11-18T13:00:00Z',stop:'2026-11-18T14:00:00Z',title:'Next'},
 {channel:'b',start:'2026-11-18T12:00:00Z',stop:'2026-11-18T13:00:00Z',title:'Other'}];
 const r=epgNowNext(data,'a',Date.parse('2026-11-18T12:30:00Z'),parse);
 assert.equal(r.current.title,'Now');assert.equal(r.following.title,'Next');
});
