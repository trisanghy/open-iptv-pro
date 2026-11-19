import test from 'node:test';import assert from 'node:assert/strict';
import {EPG_DEFAULT_SOURCES,guideSources,sanitizeGuideURL,matchGuideChannel,resumeChannel,epgKey} from '../src/mobile-epg-auto.mjs';
test('Web/Rust equivalent Vietnam EPG defaults exist and retain enabled preferences',()=>{
 assert.equal(EPG_DEFAULT_SOURCES.length,3);
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
