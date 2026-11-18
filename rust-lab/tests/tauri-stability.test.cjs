'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const source=read('renderer/advanced.js');
function healthRunner(state){
  // Execute the exact compactHealth function from the shipped renderer, not a test copy.
  const start=source.indexOf(' const HEALTH_CHANNEL_LIMIT=');
  const end=source.indexOf(' compactHealth();',start);
  assert.ok(start>0&&end>start,'Health compactor must be present');
  const context=vm.createContext({state});
  vm.runInContext(source.slice(start,end)+'\ncompactHealth();',context);
  return context;
}
test('1,205 channel checks are bounded to a small health history, not saved as unlimited WebView data',()=>{
  const health={};for(let i=0;i<1205;i++){
    health['https://example.org/'+i+'.m3u8']=Array.from({length:12},(_,j)=>({date:new Date(1762900000000+i*10000+j*100).toISOString(),type:'probe',status:'uncertain',reason:'x'.repeat(800),url:'https://example.org/auth?secret='+i}));
  }
  const state={health,alternates:{keep:['https://example.org/backup.m3u8']},profiles:[{id:'admin'}]};healthRunner(state);
  assert.ok(Object.keys(state.health).length<=320);
  assert.ok(Object.values(state.health).every(x=>x.length<=3));
  assert.ok(Object.values(state.health).flat().every(x=>!('url' in x)&&x.reason.length<=120));
  assert.ok(JSON.stringify(state.health).length<300_000);
  assert.equal(state.alternates.keep.length,1);
  assert.equal(state.profiles[0].id,'admin');
});
test('quota recovery saves profiles/alternates even if transient health history must be discarded',()=>{
  const start=source.indexOf(' let lastQuotaWarning=');
  const end=source.indexOf(' let pendingHealthSave=',start);
  assert.ok(start>0&&end>start);
  const seen=[];const toasts=[];
  const state={health:{'https://x/a':[ {date:'2026-11-12',type:'probe',status:'alive'}]},alternates:{foo:['https://x/backup']},profiles:[{id:'p1'}],pin:{hash:'hash-value'}};
  const code="const key='open-iptv-pro-advanced-v1';\n"+source.slice(source.indexOf(' const HEALTH_CHANNEL_LIMIT='),source.indexOf(' compactHealth();'))+'\n'+source.slice(start,end)+'\n save();';
  const ctx={getStore:()=>({alternates:{}}),toast:x=>toasts.push(x)};
  const localStorage={setItem:(_k,value)=>{const data=JSON.parse(value);if(Object.keys(data.health).length)throw Error('QuotaExceededError');seen.push(data);}};
  vm.runInNewContext(code,{state,ctx,localStorage,window:{},Date,console});
  assert.equal(seen.length,1);
  assert.deepEqual(seen[0].profiles,[{id:'p1'}]);
  assert.equal(seen[0].pin.hash,'hash-value');
  assert.equal(seen[0].alternates.foo[0],'https://x/backup');
  assert.equal(toasts.length,1);
});
test('Mac WebView keeps one visible decoder active when TV already plays',()=>{
  assert.match(source,/dataset\.desktopRuntime==='tauri2-rust'&&!ctx\.player\.paused/);
  assert.match(source,/Ảnh đã lưu \(xem trước tĩnh\)/);
  assert.match(source,/maxBufferSize:tauri\?10\*1000\*1000/);
});
test('FFmpeg uses bounded stderr for source diagnostics and capped software encoding',()=>{
  const compat=read('src-tauri/src/compat.rs');
  assert.match(compat,/stderr_tail: Arc<tokio::sync::Mutex<Vec<u8>>>/);
  assert.match(compat,/if tail\.len\(\) > 12_288/);
  assert.match(compat,/\[URL đã ẩn\]/);
  assert.match(compat,/"-threads", "2"/);
  assert.match(compat,/diagnosis\(&captured,&status\)/);
});
test('player prevents repeated FFmpeg attempts for broken and HTTP-denied streams',()=>{
  const js=read('renderer/app.js');
  assert.match(js,/compatFailureCooldown\.set\(original,Date\.now\(\)\+5\*60\*1000\)/);
  assert.match(js,/!upstreamDenied&&Date\.now\(\)>=cooldownUntil/);
  assert.match(js,/await window\.streamleaf\?\.compatStop\?\.\(\)\.catch/);
});
