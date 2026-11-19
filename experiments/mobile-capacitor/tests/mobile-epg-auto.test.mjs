import test from 'node:test';import assert from 'node:assert/strict';
import {EPG_DEFAULT_SOURCES,guideSources,sanitizeGuideURL,matchGuideChannel,resumeChannel,epgKey,guideCoverage} from '../src/mobile-epg-auto.mjs';
test('Web/Rust equivalent Vietnam EPG defaults exist and retain enabled preferences',()=>{
 assert.equal(EPG_DEFAULT_SOURCES.length,7);
 assert.equal(EPG_DEFAULT_SOURCES[0].url,'https://epg.io.vn/epg.xml.gz');
 assert.equal(EPG_DEFAULT_SOURCES[0].enabled,true);
 assert.equal(EPG_DEFAULT_SOURCES[1].enabled,false);
 assert.equal(EPG_DEFAULT_SOURCES[2].enabled,false);
 assert.equal(EPG_DEFAULT_SOURCES.find(x=>x.id==='epgshare-vn').enabled,false);
 assert.ok(EPG_DEFAULT_SOURCES.some(x=>x.url.includes('/epg/vn.xml')));
 assert.ok(EPG_DEFAULT_SOURCES.some(x=>x.url.includes('epgshare01.online')));
 assert.ok(EPG_DEFAULT_SOURCES.some(x=>x.url.includes('xmltv.live')));
 const r=guideSources([{id:'epgshare-vn',enabled:false},{id:'my',name:'Mine',url:'https://example.org/guide.xml',enabled:true}]);
 assert.equal(r.find(x=>x.id==='epgshare-vn').enabled,false);assert.equal(r.at(-1).id,'my');
});
test('guide URL validation rejects file/javascript/password sources',()=>{
 assert.throws(()=>sanitizeGuideURL('file:///private/guide.xml'));
 assert.throws(()=>sanitizeGuideURL('https://a:b@host.test/a.xml'));
 assert.equal(sanitizeGuideURL('https://example.org/x.xml'),'https://example.org/x.xml');
});
test('EPG channel matching honors XMLTV names and user tvg-id',()=>{
 const cache={aliases:{[epgKey('VTV2 HD')]:'vtv2.vn'}};
 assert.equal(matchGuideChannel(cache,{tvgId:'',name:'VTV2'}),'vtv2.vn');
});
test('autoplay resumes last played only, not first arbitrary source',()=>{
 const c=[{url:'https://x/one.m3u8'},{url:'https://x/two.m3u8'}];
 assert.equal(resumeChannel(c,'https://x/two.m3u8')?.url,c[1].url);
 assert.equal(resumeChannel(c,'https://missing'),null);
 assert.equal(resumeChannel(c,c[0].url,false),null);
});

test('reject stale EPG despite successful HTTP/XML parsing; allow live/upcoming guide',()=>{
 const time=Date.UTC(2026,10,19,6,0);
 const parse=s=>{const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/);return m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5])):null;};
 const stale={items:[{start:'2026-11-18T07:00Z',stop:'2026-11-18T08:00Z',channel:'VTV3.vn'}]};
 const current={items:[{start:'2026-11-19T05:00Z',stop:'2026-11-19T07:00Z',channel:'VTV3.vn'}]};
 const next={items:[{start:'2026-11-19T10:00Z',stop:'2026-11-19T11:00Z',channel:'VTV3.vn'}]};
 assert.equal(guideCoverage(stale,time,parse).usable,false);
 assert.equal(guideCoverage(current,time,parse).current,1);
 assert.equal(guideCoverage(next,time,parse).upcoming,1);
});
test('EPG default tries VNEPG gzip and keeps alternate sources disabled until selected',()=>{
 assert.equal(EPG_DEFAULT_SOURCES[0].id,'vnepg-gzip');
 assert.equal(EPG_DEFAULT_SOURCES[1].id,'vnepg-standard');
 assert.equal(EPG_DEFAULT_SOURCES[2].id,'vnepg-localized');
 const list=guideSources([{id:'epgshare-vn',enabled:true},{id:'mine',url:'https://example.org/epg.xml',enabled:true}]);
 assert.equal(list.find(x=>x.id==='epgshare-vn').enabled,true);
 assert.equal(list.find(x=>x.id==='mine').enabled,true);
});

test('tvg-id mismatches fall back to clean channel name, never use unknown IDs',()=>{
 const guide={aliases:{[epgKey('VTV3')]: 'VTV3.vn'},items:[{channel:'VTV3.vn'}]};
 for(const label of ['VTV3 (Nguồn 1)','VTV3 [Source 2]','VTV3 (Nguồn 1) HD'])
  assert.equal(matchGuideChannel(guide,{tvgId:'does-not-exist',name:label}),'VTV3.vn',label);
 assert.equal(matchGuideChannel(guide,{tvgId:'does-not-exist',name:'No match'}),'');
});

test('unbounded XMLTV captures 13,050 programmes and real VTV3 film episodes',async()=>{
 const {makeEPGCache}=await import('../src/mobile-epg-auto.mjs');
 const old=globalThis.DOMParser,clock=Date.UTC(2026,10,20,0,0,0);
 const start='2026-11-20T00:00:00Z',stop='2026-11-20T01:00:00Z';
 const c={getAttribute:()=> 'VTV3.vn',getElementsByTagName:()=>[{textContent:'VTV3'}]};
 const p={getAttribute:k=>({channel:'VTV3.vn',start,stop})[k],
 getElementsByTagName:k=>k==='title'?[{textContent:'Phim truyện'}]:k==='desc'?[{textContent:'Kẻ mai mối xứng tầm - Tập 25'}]:[]};
 globalThis.DOMParser=class{parseFromString(){return {
  documentElement:{localName:'tv'},querySelector:()=>null,
  getElementsByTagName:k=>k==='channel'?[c]:k==='programme'?Array(13050).fill(p):[]
 };}};
 try{
  const parse=raw=>new Date(raw);
  const full=makeEPGCache('<tv></tv>',parse,clock);
  assert.equal(full.items.length,13050);
  assert.equal(full.items.at(-1).title,'Phim truyện: Kẻ mai mối xứng tầm - Tập 25');
  assert.equal(makeEPGCache('<tv></tv>',parse,clock,5000).items.length,5000);
 }finally{if(old===undefined)delete globalThis.DOMParser;else globalThis.DOMParser=old;}
});
