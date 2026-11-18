'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../renderer/collector-core.js');
const {listPublicPlaylists}=require('../src/repo-sources.cjs');
const one=(name,group,url,id='',status='unchecked')=>({name,group,url,tvgId:id,sourceId:'a',status});
test('merge retains input order and groups; identical name becomes alternate link',()=>{
 const a=[one('VTV1 HD','01 - VTV','https://ok.test/1','VTV1.vn'),one('VTV2','02 - VTV','https://ok.test/2','VTV2.vn')];
 const b={...one('VTV1','TV','https://alt.test/1','VTV1.vn','alive'),sourceId:'b'};
 const {channels,stats}=C.merge([...a,b]);assert.equal(channels.length,2);assert.equal(channels[0].group,'01 - VTV');assert.equal(channels[1].name,'VTV2');assert.equal(stats.alternates,1);assert.equal(channels[0].url,'https://alt.test/1');assert.deepEqual(channels[0].alternates,['https://ok.test/1']);
});
test('fake dead status never repairs without live verification',()=>{const c={...one('Test','Group','https://primary.test/x'),alternates:['https://b.test/x']};const r=C.repaired(c,[{url:c.url,status:'dead'},{url:c.alternates[0],status:'uncertain'}]);assert.equal(r.url,c.url);assert.equal(r.status,'uncertain');});
test('live alternate is promoted; old URL retained as backup',()=>{const c={...one('Test','Group','https://primary.test/x'),alternates:['https://b.test/x']};const r=C.repaired(c,[{url:c.url,status:'dead'},{url:c.alternates[0],status:'alive',latencyMs:220}]);assert.equal(r.url,'https://b.test/x');assert.deepEqual(r.alternates,[c.url]);assert.equal(r.status,'alive');});
test('repository URL parsing accepts github only',()=>{assert.deepEqual(C.repoURL('https://github.com/example/repository'),{owner:'example',repo:'repository'});assert.throws(()=>C.repoURL('https://not-github.com/e/r'));assert.throws(()=>C.repoURL('https://github.com/e'));});
test('lists bounded public .m3u files and generates raw URLs without executing repository scripts',async()=>{
 const mock=async(url)=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(url.includes('/git/trees/')?{tree:[{type:'blob',path:'playlists/tv.m3u',size:132},{type:'blob',path:'run.sh',size:40},{type:'blob',path:'x.html',size:200},{type:'blob',path:'streams/news.m3u8',size:220}]}:{default_branch:'main',private:false})});
 const got=await listPublicPlaylists('https://github.com/acme/iptv',mock);assert.equal(got.files.length,2);assert.equal(got.files[0].url,'https://raw.githubusercontent.com/acme/iptv/main/playlists/tv.m3u');
});
test('repaired channel tolerates older merged entries without alternates array',()=>{
 const old=one('Legacy','Group','https://primary.test/legacy');
 const changed=C.repaired(old,[{url:old.url,status:'alive',latencyMs:110}]);
 assert.equal(changed.status,'alive');assert.deepEqual(changed.alternates,[]);
});
