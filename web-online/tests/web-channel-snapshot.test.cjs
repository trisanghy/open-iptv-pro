'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const shot=require('../../web-channel-snapshot.js');
function fixture({cors=false,ready=true}={}){
 const video={videoWidth:1280,videoHeight:720,readyState:ready?3:0};
 const canvas={getContext:()=>({drawImage:()=>{
  if(cors){const e=new Error('Tainted by cross-origin data');e.name='SecurityError';throw e;}
 }}),toDataURL:()=> 'data:image/jpeg;base64,'+'A'.repeat(180)};
 return {document:{createElement:n=>n==='canvas'?canvas:video},video};
}
test('decoded video produces a real jpeg, sized for browser storage',()=>{
 const f=fixture(),r=shot.frame(f.video,f.document);
 assert.equal(r.method,'Web Video');assert.equal(r.width,360);assert.equal(r.height,203);
});
test('no decoded frame is not counted as a snapshot',()=>{
 const f=fixture({ready:false});
 assert.throws(()=>shot.frame(f.video,f.document),/Chưa có khung hình/);
});
test('CORS-protected canvas does not produce a fake snapshot',()=>{
 const f=fixture({cors:true});
 assert.throws(()=>shot.frame(f.video,f.document),/CORS\/DRM/);
});
test('current playback is captured without opening another stream',async()=>{
 const f=fixture();const r=await shot.capture({url:'https://tv.test/a.m3u8'},{
  currentVideo:f.video,document:f.document
 });assert.equal(r.method,'Web Video');
});
test('abort before capture prevents all playback attempts',async()=>{
 const f=fixture(),c=new AbortController();c.abort();
 await assert.rejects(shot.capture({url:'https://tv.test/a.m3u8'},{
  signal:c.signal,document:f.document
 }),e=>e.name==='AbortError');
});
test('unsafe or non-web protocols rejected',()=>{
 assert.equal(shot.isSafeURL('https://tv.test/a.m3u8'),true);
 assert.equal(shot.isSafeURL('file:///private/a.mp4'),false);
 assert.equal(shot.isSafeURL('https://u:p@tv.test/a.mp4'),false);
});
test('both quick actions run in browser without native FFmpeg',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const app=fs.readFileSync(path.resolve(__dirname,'../../app.js'),'utf8');
 const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
 assert.match(app,/bind\(\['sourceCheckAllBtn','quickChecks'\],checkAll\)/);
 assert.match(app,/bind\(\['quickShots','shotsAllBtn'\],snapshotAll\)/);
 assert.match(app,/OpenIPTVWebSnapshot\.capture\(c,/);
 assert.doesNotMatch(app,/Chụp hàng loạt chỉ hỗ trợ trong ứng dụng đã đóng gói/);
 assert.match(html,/web-channel-snapshot\.js\?v=websnapshot-20261118b/);
});

test('one-tap current channel screenshot is present and requires real storage success',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
 const app=fs.readFileSync(path.resolve(__dirname,'../../app.js'),'utf8');
 assert.match(html,/id="quickShotCurrent"/);
 assert.match(app,/bind\(\['shotBtn','quickShotCurrent'\]/);
 assert.match(app,/if\(!native&&!save\(\)\)/);
 assert.match(app,/Không đủ dung lượng lưu Snapshot trên Web/);
});
