'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const engine=require(path.join(root,'advanced-core.js'));
const manual=require(path.join(root,'manual-stream-selection.js'));
const parser=fs.readFileSync(path.join(root,'core-browser.js'),'utf8');
function parse(text){
 const context={window:{},URL};
 vm.runInNewContext(parser,context,{filename:'core-browser.js'});
 return context.window.StreamLeafCore.parseM3U(text,'uploaded_m3u');
}
// Same metadata and 25-entry group structure as the supplied VTV two-source
// playlist. URLs are intentionally synthetic to avoid publishing auth tokens.
const ids=['vtv1hd','vtv2hd','vtv3hd','vtv4hd','vtv5hd','vtv5hdtnb','vtv5hdtn','vtv6hd','vtv7hd','vtv8hd','vtv9hd','vtv10hd'];
const names=['VTV1','VTV2','VTV3','VTV4','VTV5','VTV5 Tây Nam Bộ','VTV5 Tây Nguyên','VTV6','VTV7','VTV8','VTV9','VTV10'];
// In the uploaded playlist these four pairs have IDENTICAL URLs, so they are
// not independent fallback routes and should not produce duplicate options.
const repeatedUrls=new Set(['vtv3hd','vtv5hd','vtv6hd','vtv10hd']);
function playlist(){
 const lines=['#EXTM3U'];
 for(const source of [1,3]){
  for(let i=0;i<ids.length;i++){
   lines.push('#EXTINF:-1 tvg-id="'+ids[i]+'" group-title="'+(source===1?'01 - VTV NGUON 1':'02 - VTV NGUON 3')+'",'+names[i]+' (Nguồn '+source+')');
   const urlSource=source===3&&repeatedUrls.has(ids[i])?1:source;
   lines.push('https://stream-source-'+urlSource+'.example.test/'+ids[i]+'.m3u8');
  }
  if(source===3){
   lines.push('#EXTINF:-1 tvg-id="vietnamtoday" group-title="02 - VTV NGUON 3",Vietnam Today (Nguồn 3)');
   lines.push('https://stream-source-3.example.test/vietnamtoday.m3u8');
  }
 }
 return lines.join('\n')+'\n';
}
test('all 12 VTV pairs match, only eight have DISTINCT backup URLs',()=>{
 const channels=parse(playlist());assert.equal(channels.length,25);
 for(const id of ids){
  const main=channels.find(c=>c.tvgId===id&&c.name.endsWith('(Nguồn 1)'));
  const backup=channels.find(c=>c.tvgId===id&&c.name.endsWith('(Nguồn 3)'));
  assert.ok(main&&backup,id);
  const expectedMain=main.url===backup.url?[main.url]:[main.url,backup.url];
  const expectedBackup=main.url===backup.url?[backup.url]:[backup.url,main.url];
  assert.deepEqual(engine.alternatives(main,channels),expectedMain,id+' main');
  assert.deepEqual(engine.alternatives(backup,channels),expectedBackup,id+' backup');
 }
 const today=channels.find(c=>c.tvgId==='vietnamtoday');
 assert.deepEqual(engine.alternatives(today,channels),[today.url]);
});
test('manual selector chooses backup safely and retains auto-failover options',()=>{
 const channels=parse(playlist());
 const vtv1=channels.find(c=>c.tvgId==='vtv1hd'&&c.name.endsWith('(Nguồn 1)'));
 const links=engine.alternatives(vtv1,channels);assert.equal(links.length,2);
 assert.deepEqual(manual.prioritize(links,links[1]),[links[1],links[0]]);
 assert.equal(manual.prioritize(links,'https://unknown.example.test/invalid.m3u8'),null);
});
test('VTV5, Tây Nam Bộ and Tây Nguyên remain distinct',()=>{
 const channels=parse(playlist());
 const basic=channels.find(c=>c.name==='VTV5 (Nguồn 1)');
 const links=engine.alternatives(basic,channels);
 assert.equal(links.length,1); // Both VTV5 sources use the same URL.
 assert.ok(links.every(x=>x.endsWith('/vtv5hd.m3u8')));
 assert.equal(engine.canonicalName('VTV5 Tây Nam Bộ (Nguồn 1)'),engine.canonicalName('VTV5 Tây Nam Bộ (Nguồn 3)'));
 assert.notEqual(engine.canonicalName('VTV5 Tây Nam Bộ (Nguồn 1)'),engine.canonicalName('VTV5 (Nguồn 1)'));
});
test('name suffix fallback works when tvg-id missing, but never overrides conflicting IDs',()=>{
 const a={id:'a',name:'VTV1 (Nguồn 1)',url:'https://a.example.test/1'};
 const b={id:'b',name:'VTV1 (Nguồn 3)',url:'https://b.example.test/1'};
 assert.equal(engine.sameChannel(a,b),true);
 assert.equal(engine.sameChannel({...a,tvgId:'vtv1hd'},{...b,tvgId:'another'}),false);
 assert.equal(engine.sameChannel({...a,tvgId:'vtv1hd'},{...b,tvgId:'VTV1HD'}),true);
 assert.deepEqual(engine.alternatives({...a,tvgId:'vtv1hd'},[{...b,tvgId:'another'}]),[a.url]);
});
test('manual extra URLs remain preferred, validated, unique and limited',()=>{
 const channels=parse(playlist());const source=channels.find(c=>c.name==='VTV2 (Nguồn 1)');
 const backup=channels.find(c=>c.name==='VTV2 (Nguồn 3)');
 const extra='https://manual.example.test/vtv2.m3u8';
 assert.deepEqual(engine.alternatives(source,channels,{[source.id]:[extra,extra,backup.url,'file:///bad']}),[source.url,extra,backup.url]);
 assert.deepEqual(engine.alternatives(source,channels,{[source.id]:'incorrect'}),[source.url,backup.url]);
});

test('merged channels keep direct backups when originals are disabled',()=>{
 const merged={id:'merged|vtv1hd',sourceId:'collector_merged',name:'VTV1',
  tvgId:'vtv1hd',url:'https://one.example.test/live.m3u8',
  alternates:['https://two.example.test/live.m3u8','https://two.example.test/live.m3u8','file:///invalid']};
 const urls=engine.alternatives(merged,[merged]);
 assert.deepEqual(urls,[merged.url,'https://two.example.test/live.m3u8']);
 assert.deepEqual(manual.prioritize(urls,urls[1]),[urls[1],urls[0]]);
});
