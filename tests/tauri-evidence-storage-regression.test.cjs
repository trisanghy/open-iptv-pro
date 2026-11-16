'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const evidence=require('../renderer/health-evidence.js');
const now=Date.UTC(2026,10,12,5,10,0);
const channel=()=>({url:'https://cdn.example/iptv.m3u8',status:'uncertain'});
test('fresh decoded playback supersedes concurrent false HTTP Die/uncertain',()=>{
 const ch=channel();evidence.noteProof(ch,'playback',ch.url,now-1_000);
 const failure=evidence.applyProbe(ch,{status:'dead',confirmedDead:true,reason:'HTTP 404 repeated'},now);
 assert.equal(ch.status,'alive');assert.equal(failure.status,'alive');
 const unknown=evidence.applyProbe(ch,{status:'uncertain',reason:'HLS manifest only'},now+2_000);
 assert.equal(ch.status,'alive');assert.equal(unknown.status,'alive');
});
test('fresh FFmpeg snapshot qualifies as positive video evidence for same URL only',()=>{
 const ch=channel();
 evidence.noteProof(ch,'snapshot',ch.url,now-1000);
 assert.equal(evidence.recentProof(ch,now),true);
 evidence.applyProbe(ch,{status:'uncertain',reason:'CDN requires cookie'},now);
 assert.equal(ch.status,'alive');
 ch.url='https://cdn.example/other.m3u8';
 assert.equal(evidence.recentProof(ch,now),false);
 evidence.applyProbe(ch,{status:'uncertain',reason:'no media'},now);
 assert.equal(ch.status,'uncertain');
});
test('old saved snapshot is not current proof; a repeated confirmed 404 may become Die',()=>{
 const ch=channel();ch.snapshot={date:'2021-01-01'};
 assert.equal(evidence.recentProof(ch,now),false);
 evidence.applyProbe(ch,{status:'dead',confirmedDead:true,reason:'GET HTTP 404 twice'},now);
 assert.equal(ch.status,'dead');
});
test('unconfirmed 404 or 403 never becomes Die, even if prior status was Die',()=>{
 const ch=channel();ch.status='dead';
 evidence.applyProbe(ch,{status:'dead',confirmedDead:false,reason:'403'},now);
 assert.equal(ch.status,'uncertain');
});
test('positive checker result requires actual evidence flag',()=>{
 const ch=channel();
 evidence.applyProbe(ch,{status:'alive',positiveEvidence:false,reason:'HTTP 200'},now);
 assert.equal(ch.status,'uncertain');
 evidence.applyProbe(ch,{status:'alive',positiveEvidence:true,reason:'TS segment'},now);
 assert.equal(ch.status,'alive');
});
test('expired proof does not mask later root failure; recent backup playback proves channel usability',()=>{
 const ch=channel();
 evidence.noteProof(ch,'playback',ch.url,now-31*60_000);
 evidence.applyProbe(ch,{status:'dead',confirmedDead:true,reason:'404'},now);
 assert.equal(ch.status,'dead');
 const alt=channel();evidence.noteProof(alt,'playback','https://backup.example/video',now);
 assert.equal(alt.status,'alive');assert.equal(evidence.recentProof(alt,now),false);
 evidence.applyProbe(alt,{status:'dead',confirmedDead:true,reason:'Primary HTTP 404'},now);
 assert.equal(alt.status,'alive');assert.match(alt.reason,/dự phòng/);
});
function makeStorage(initial){
 const values=new Map(Object.entries(initial));
 return {
  getItem:k=>values.has(k)?values.get(k):null,
  setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),
  snapshot:()=>Object.fromEntries(values)
 };
}
async function launch(nativeRaw,localRaw=null,shouldFail=false){
 const local=makeStorage(localRaw?{'open-iptv-pro-4':localRaw}:{});
 const writes=[];const listeners={};
 let stored=nativeRaw;
 const streamleaf={
  storeRead:async()=>stored,
  storeWrite:async raw=>{if(shouldFail)throw Error('disk unavailable');writes.push(raw);stored=raw;return {saved:true};}
 };
 const window={streamleaf,addEventListener:(n,fn)=>{listeners[n]=fn;}};
 const document={getElementById:()=>null,addEventListener:()=>{}};
 const context={window,document,localStorage:local,console:{error(){}},setTimeout,clearTimeout,Date};
 vm.runInNewContext(fs.readFileSync(path.join(root,'renderer/primary-storage.js'),'utf8'),context);
 await window.IPTVPrimaryPersistence.ready;
 return {p:window.IPTVPrimaryPersistence,local,writes,read:()=>stored};
}
const small=JSON.stringify({sources:[{name:'A'}],channels:[{url:'https://example.com/vtv1'}],favorites:[]});
test('primary storage migrates legacy localStorage only after native disk write succeeds',async()=>{
 const x=await launch(null,small);
 assert.equal(x.p.nativeReady,true);assert.equal(x.p.initialRaw,small);
 assert.equal(x.local.getItem('open-iptv-pro-4'),null);
 assert.deepEqual(x.writes,[small]);
});
test('migration failed disk write must not destroy existing localStorage data',async()=>{
 const x=await launch(null,small,true);
 assert.equal(x.p.nativeReady,false);assert.equal(x.local.getItem('open-iptv-pro-4'),small);
});
test('existing native file is authoritative and can flush >5MB playlists',async()=>{
 const x=await launch(small,JSON.stringify({sources:[],channels:[]}));
 assert.equal(x.p.initialRaw,small);
 const huge=JSON.stringify({sources:[],channels:Array.from({length:15000},(_,i)=>({id:i,url:'https://example.com/live/'+i+'/'.repeat(350)}))});
 assert.ok(huge.length>5*1024*1024);
 x.p.enqueue(huge);await x.p.flush();
 assert.equal(x.read(),huge);
 assert.equal(x.local.getItem('open-iptv-pro-4'),null);
});
test('runtime storage path does not fall back to localStorage in Tauri mode',()=>{
 const app=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
 assert.match(app,/IPTVPrimaryPersistence\?\.nativeReady/);
 assert.match(app,/IPTVPrimaryPersistence\.enqueue\(raw\)/);
 const bridge=fs.readFileSync(path.join(root,'src-tauri/src/bridge.rs'),'utf8');
 assert.match(bridge,/"storage:read"/);assert.match(bridge,/"storage:write"/);
});
test('bootstrap dynamically preserves app-first loading after native disk hydration',()=>{
 const entry=fs.readFileSync(path.join(root,'renderer/app-entry.js'),'utf8');
 const index=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
 assert.match(entry,/await window\.IPTVPrimaryPersistence\.ready/);
 assert.ok(entry.indexOf("'app.js'")<entry.indexOf("'backup-ui.js'"));
 assert.ok(index.indexOf('tauri-bridge.js')<index.indexOf('primary-storage.js'));
 assert.ok(index.indexOf('health-evidence.js')<index.indexOf('app-entry.js'));
});
