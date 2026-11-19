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

test('large XMLTV has no 12,000-programme ceiling and resolves later channels',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const renderer=fs.readFileSync(path.join(__dirname,'../renderer/epg.js'),'utf8');
 const features=fs.readFileSync(path.join(__dirname,'../renderer/features.js'),'utf8');
 const clock=Date.now(),stamp=ms=>new Date(ms).toISOString().replace(/[-:T]/g,'').slice(0,14)+' +0000';
 const start=stamp(clock+60000),end=stamp(clock+3660000);
 const channel=id=>({getAttribute:()=>id,getElementsByTagName:()=>[{textContent:id}]});
 const programme=id=>({getAttribute:key=>key==='channel'?id:key==='start'?start:key==='stop'?end:'',
  getElementsByTagName:key=>key==='title'?[{textContent:'Phim truyện'}]:key==='desc'?[{textContent:'Kẻ mai mối xứng tầm - Tập 25'}]:[]});
 const dom={documentElement:{tagName:'tv'},querySelector:()=>null,
  getElementsByTagName:key=>key==='channel'?[channel('VTV1'),channel('VTV3')]:
  key==='programme'?[...Array(13005).fill(programme('VTV1')),programme('VTV3')]:[]};
 const context={DOMParser:class{parseFromString(){return dom;}}};
 vm.runInNewContext(renderer,context);
 const guide=context.IPTVGuide.parse('<tv/>',[{name:'VTV3',tvgId:'VTV3',id:'ch3'}]);
 assert.equal(guide.programmes.length,13006);
 const now=context.IPTVGuide.current(guide,{name:'VTV3',tvgId:'VTV3',id:'ch3'},clock);
 assert.equal(now.next.title,'Phim truyện: Kẻ mai mối xứng tầm - Tập 25');
 assert.equal(renderer.includes('out.length>=12000'),false);
 assert.equal(features.includes('programmes.slice(0,12000)'),false);
 assert.ok(features.includes('https://epg.io.vn/epg.xml.gz'));
 assert.match(features,/async function saveGuideInDatabase/);
 assert.match(features,/encodeGuideSnapshot/);
 assert.ok(features.includes('void restoreGuideCache()'));
 assert.doesNotThrow(()=>new Function(features));
});
