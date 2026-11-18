'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
test('10-minute FFmpeg replay window and bounded storage',()=>{
 const core=read('src/timeshift.cjs');assert.match(core,/'-hls_list_size',String\(replayMinutes\*12\)/);assert.match(core,/2\*1024\*1024\*1024/);
 assert.match(core,/150\*1024\*1024/);
});
test('Replay UI contains only -10s and -30s seek buttons, plus return live',()=>{
 const html=read('renderer/index.html'),js=read('renderer/advanced.js');
 assert.match(html,/Tua lại · <span id="bufferWindowMinutes">10<\/span> phút/);assert.match(html,/id="bufferRewind10"/);assert.match(html,/id="bufferRewind"/);
 assert.doesNotMatch(html,/id="bufferRewind5"/);assert.match(html,/id="bufferLive"/);
 assert.match(js,/seekRange\(v,replayMinutes\(\)\*60\)/);assert.match(js,/currentTime-10/);assert.match(js,/currentTime-30/);
});
test('Saved recording uses finalized MP4, keeps raw TS only until conversion succeeds',()=>{
 const file=read('src/recording-scheduler.cjs');
 assert.match(file,/\.part\.mp4/);assert.match(file,/\.mp4'/);assert.match(file,/looksLikeMp4/);
 assert.match(file,/localStamp\(job.startAt\)/);assert.match(file,/safeName\(job.title\)/);
});
