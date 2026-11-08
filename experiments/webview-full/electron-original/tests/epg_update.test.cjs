'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{gzipSync}=require('node:zlib');
const {fetchGuide,validateGuideURL}=require('../src/epg.cjs');
const {compareVersions,validateRepo,checkUpdate}=require('../src/update-check.cjs');
test('XMLTV gzip: download, bounded decompression, XML validation',async()=>{
 const raw='<?xml version="1.0"?><tv><channel id="vtv1"><display-name>VTV1</display-name></channel></tv>',gz=gzipSync(raw);
 const fetched=await fetchGuide('https://example.org/guide.xml.gz',async()=>({ok:true,body:[gz]}));
 assert.equal(fetched.xml,raw);assert.ok(fetched.bytes>40);
});
test('EPG rejects unsafe URL schemes and credentials',()=>{
 for(const u of ['file:///private/passwd','ftp://example.com/foo','http://example.org/guide.xml','https://user:pass@example.org/guide.xml'])assert.throws(()=>validateGuideURL(u));
 assert.match(validateGuideURL('https://example.org/guide.xml'),/^https:/);
});
test('EPG rejects non XMLTV data',async()=>{
 await assert.rejects(()=>fetchGuide('https://example.org/file',async()=>({ok:true,body:[Buffer.from('<html>not a guide</html>')]})),/XMLTV/);
});
test('compare update versions and validate repository',()=>{
 assert.equal(compareVersions('v4.2.0','4.1.0'),1);
 assert.equal(compareVersions('4.0.9','v4.1.0'),-1);
 assert.equal(compareVersions('4.1.0','4.1.0'),0);
 assert.equal(validateRepo('account/open-iptv-pro'),'account/open-iptv-pro');
 assert.throws(()=>validateRepo('https://evil.test/a'));
});
test('GitHub releases: newer version or missing releases',async()=>{
 const good=await checkUpdate('owner/open-iptv-pro','4.1.0',async()=>({ok:true,json:async()=>({tag_name:'v4.3.0',published_at:'2026-11-08T00:00:00Z'})}));
 assert.equal(good.newer,true);assert.equal(good.latest,'v4.3.0');
 const noRelease=await checkUpdate('owner/open-iptv-pro','4.15.0',async(url)=>url.endsWith('/releases/latest')?{ok:false,status:404}:{ok:true,status:200});
 assert.equal(noRelease.noRelease,true);
 assert.equal(noRelease.newer,false);
 await assert.rejects(()=>checkUpdate('owner/missing','4.15.0',async()=>({ok:false,status:404})),/không tồn tại/);
});
