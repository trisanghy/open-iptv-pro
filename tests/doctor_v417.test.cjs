'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const lib=require('../renderer/doctor-v2-core.js');
function image(kind='pattern',shift=0){const w=90,h=80,d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const i=(y*w+x)*4;let rgb;
 if(kind==='black')rgb=[0,0,0];
 else if(kind==='pattern')rgb=[(x*17+y*11+shift)%256,(x*9+y*23+shift)%256,(x*3+y*37+shift)%256];
 else rgb=[(x*7+y*43+shift)%256,(x*33+y*7+shift)%256,(x*31+y*5+shift)%256];
 d.set([...rgb,255],i);
 }return lib.features(d,w,h);}
function ch(id,name,url,tvgId=''){return {id,name,url,tvgId,logo:'',status:'unchecked'};}
test('v4.17: feature hashes are deterministic and black frame is excluded from visual merge',()=>{
 const a=image(),b=image(),flat=image('black');assert.equal(a.hash.length,64);assert.equal(lib.distance(a.hash,b.hash),0);assert.equal(a.useful,true);assert.equal(flat.useful,false);
 const candidates=lib.visualMatches([{channel:ch('a','One','https://example.com/1'),feature:flat},{channel:ch('b','Two','https://example.com/2'),feature:flat}]);assert.equal(candidates.length,0);
});
test('v4.17: visually identical feeds only produce REVIEW proposals, not channel merges',()=>{
 const a=ch('a','VTV1 HD','https://example.com/a','VTV1.vn');const b=ch('b','VTV1','https://example.com/b','VTV1.vn');
 const matches=lib.visualMatches([{channel:a,feature:image()},{channel:b,feature:image()}]);
 assert.equal(matches.length,1);assert.equal(matches[0].reviewOnly,true);assert.equal(matches[0].metadataMatch,true);assert.ok(matches[0].score>=80);assert.equal(a.url,'https://example.com/a');
});
test('v4.17: different-name channels with same programme remain review-only',()=>{
 const matches=lib.visualMatches([{channel:ch('a','News A','https://x.test/a'),feature:image()},{channel:ch('b','Sports B','https://x.test/b'),feature:image()}]);
 assert.equal(matches.length,1);assert.equal(matches[0].metadataMatch,false);assert.equal(matches[0].reviewOnly,true);
});
test('v4.17: same URL is not a distinct backup candidate',()=>{
 assert.equal(lib.candidate({channel:ch('a','Channel','https://x.test/video'),feature:image()},{channel:ch('b','Channel','https://x.test/video'),feature:image()}),null);
});
test('v4.17: suspicious static frame is not confirmed die if media time advances',()=>{
 const d=lib.createFreezeDetector();let state;
 for(let i=0;i<6;i++){state=d.feed({now:i*3000,mediaTime:i*3,decodedFrames:i*75,frame:image(),ready:true,paused:false});}
 assert.equal(state.state,'freeze-suspected');
});
test('v4.17: stopped playback time and decoded frames + unchanged image is a confirmed freeze warning only',()=>{
 const d=lib.createFreezeDetector();let state;
 for(let i=0;i<6;i++){state=d.feed({now:i*3000,mediaTime:11,decodedFrames:100,frame:image(),ready:true,paused:false});}
 assert.equal(state.state,'freeze-confirmed');assert.ok(!('status' in state));
});
test('v4.17: black content is warning, not dead; playing paused resets the monitor',()=>{
 const d=lib.createFreezeDetector();let state;for(let i=0;i<5;i++){state=d.feed({now:i*3000,mediaTime:i*3,decodedFrames:i*50,frame:image('black'),ready:true,paused:false});}
 assert.equal(state.state,'black-warning');assert.equal(d.feed({now:15000,paused:true}).state,'idle');
});
test('v4.17: changing frames do not raise freeze alerts',()=>{
 const d=lib.createFreezeDetector();let state;
 for(let i=0;i<7;i++)state=d.feed({now:i*3000,mediaTime:i*3,decodedFrames:i*40,frame:image('pattern',i*29),ready:true,paused:false});
 assert.equal(state.state,'healthy');
});
test('v4.17: Doctor proposals use playback evidence and do not silently change channel status',()=>{
 const c={...ch('a','News','https://example.com/a'),status:'dead'};
 const history={[c.url]:[{type:'playback',date:new Date().toISOString(),status:'alive'}]};
 const issues=lib.recommendations([c],history,[]);assert.ok(issues.find(x=>x.type==='false-dead'));assert.equal(c.status,'dead');
});
