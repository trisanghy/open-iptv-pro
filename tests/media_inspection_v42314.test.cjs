'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {inspectMedia,rangeForVideo}=require('../src/media-inspection.cjs');
test('HLS EVENT without .m3u8 extension is detected and seekable',()=>{
 const a=inspectMedia({url:'https://example.test/stream?id=17',contentType:'application/octet-stream',sample:'#EXTM3U\n#EXT-X-TARGETDURATION:5\n#EXT-X-PLAYLIST-TYPE:EVENT\n#EXTINF:5,\nchunk001.ts'});
 assert.equal(a.hls,true);assert.equal(a.mode,'event');assert.equal(a.seekable,true);
});
test('VOD playlist has seekable duration and normal live playlist stays live',()=>{
 const vod=inspectMedia({sample:'#EXTM3U\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:10,\na.ts\n#EXTINF:11.5,\nb.ts\n#EXT-X-ENDLIST'});
 assert.equal(vod.mode,'vod');assert.equal(vod.durationSeconds,21.5);
 assert.equal(inspectMedia({sample:'#EXTM3U\n#EXT-X-TARGETDURATION:3\n#EXTINF:3,\nx.ts'}).mode,'live');
});
test('actual video seek window is bounded and live short buffer not presented as VOD',()=>{
 const v={seekable:{length:1,start:()=>100,end:()=>210}};
 assert.deepEqual(rangeForVideo(v,{mode:'event'}),{start:100,end:210,length:110});
 assert.equal(rangeForVideo({seekable:{length:1,start:()=>10,end:()=>19}},{mode:'live'}),null);
});
test('non-video HTML never becomes HLS based solely on text',()=>{
 assert.equal(inspectMedia({sample:'<!DOCTYPE html><html>no video</html>'}).hls,false);
});
