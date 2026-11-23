'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../web-playback-libs.js'),'utf8');
function harness(fail=false){
 const requests=[],w={document:{head:{appendChild(script){requests.push(script);}},createElement(){return {remove(){this.removed=true}};}}};
 const ctx={window:w,module:{exports:{}}};vm.runInNewContext(source,ctx,{filename:'web-playback-libs.js'});
 return {w,requests,api:ctx.module.exports};
}
test('two simultaneous HLS requests share one same-origin decoder download',async()=>{
 const {w,requests,api}=harness();
 const first=api.load('hls'),second=api.load('hls');
 assert.equal(first,second);assert.equal(requests.length,1);
 assert.equal(requests[0].src,'hls.min.js');assert.equal(requests[0].async,true);
 w.Hls={isSupported:()=>true};requests[0].onload();
 assert.equal(await first,w.Hls);assert.equal(await api.load('hls'),w.Hls);assert.equal(requests.length,1);
});
test('DASH loads only when explicitly requested, never on startup',async()=>{
 const {w,requests,api}=harness();
 assert.equal(requests.length,0);
 const loading=api.load('dash');assert.equal(requests.length,1);assert.equal(requests[0].src,'dash.all.min.js');
 w.dashjs={MediaPlayer:()=>({})};requests[0].onload();assert.equal(await loading,w.dashjs);
});
test('a failed library download can be retried without stale pending promises',async()=>{
 const {requests,api}=harness();
 const first=api.load('hls');requests[0].onerror();
 await assert.rejects(first,/hls.min.js/);
 const again=api.load('hls');assert.equal(requests.length,2);
 requests[1].onerror();await assert.rejects(again,/hls.min.js/);
});
test('unsupported decoder types reject without injecting third-party scripts',async()=>{
 const {requests,api}=harness();
 await assert.rejects(api.load('foreign'),/Unsupported/);assert.equal(requests.length,0);
});

test('MPEG-TS loads from same-origin bundle only when requested',async()=>{
 const {w,requests,api}=harness();
 const first=api.load('mpegts'),second=api.load('mpegts');
 assert.equal(first,second);assert.equal(requests.length,1);
 assert.equal(requests[0].src,'mpegts.min.js');
 w.mpegts={createPlayer(){}};
 requests[0].onload();
 assert.equal(await first,w.mpegts);
});
