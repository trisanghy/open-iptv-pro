'use strict';
// Apply the P356 candidate only to the isolated CI working tree. No version bump.
const fs=require('node:fs'),assert=require('node:assert/strict');
const edits=[
  [
    "renderer/positron-intelligence-core.js",
    " function cleanQuery(name){",
    " function advanceViewingSample(previous,{id,source,wall,media,rate=1,seeking=false}){\n  if(!id||typeof source!=='string'||!source||seeking||!Number.isFinite(wall)||!Number.isFinite(media)||media<0||!Number.isFinite(rate)||rate<=0)return null;\n  const sample={id:String(id),source,wall,media,rate,seconds:0,first:false,second:false};\n  if(!previous||previous.id!==sample.id||previous.source!==source)return sample;\n  const elapsed=(wall-previous.wall)/1000,delta=media-previous.media;\n  sample.seconds=previous.seconds;sample.first=previous.first;sample.second=previous.second;\n  if(rate===previous.rate&&elapsed>0&&delta>0&&delta<=elapsed*rate+1.25){\n   sample.seconds+=Math.min(5,elapsed,delta/rate);\n  }\n  return sample;\n }\n function cleanQuery(name){"
  ],
  [
    "renderer/positron-intelligence-core.js",
    "searchProgrammes,cleanQuery,readWikiSearch});",
    "searchProgrammes,advanceViewingSample,cleanQuery,readWikiSearch});"
  ],
  [
    "renderer/positron-intelligence.js",
    "  const ch=state()?.getCurrent?.(),now=Date.now();\n  if(!ch?.id)return;\n  if(!active||active.id!==String(ch.id)){\n   active={id:String(ch.id),seconds:0,last:now,first:false,second:false};return;\n  }\n  const elapsed=Math.max(0,Math.min(5,(now-active.last)/1000));active.last=now;active.seconds+=elapsed;",
    "  const ch=state()?.getCurrent?.(),now=Date.now();\n  active=core.advanceViewingSample(active,{id:ch?.id,source:player.currentSrc,\n   wall:win.performance.now(),media:player.currentTime,rate:player.playbackRate,seeking:player.seeking});\n  if(!active)return;"
  ],
  [
    "renderer/positron-intelligence.js",
    "  player.addEventListener('ended',()=>{active=null;});",
    "  player.addEventListener('ended',()=>{active=null;});\n  player.addEventListener('seeking',()=>{active=null;});\n  player.addEventListener('emptied',()=>{active=null;});"
  ],
  [
    "renderer/positron-intelligence.js",
    " // Only a real decoded/playable frame triggers tracking. Switching, pausing\n // or a stalled player does not count as a long viewing session.",
    " // Require advancing media time in addition to readyState. This is evidence\n // of timeline progress, not proof of decoded video frames."
  ],
  [
    "renderer/positron-intelligence.js",
    "học sau ≥35 giây phát có hình/tiếng",
    "học sau ≥35 giây thời gian phát media thực sự tiến"
  ]
];
for(const [file,old,next] of edits){
 const data=fs.readFileSync(file,'utf8');
 assert.equal(data.split(old).length,2,'expected exactly one anchor in '+file);
 fs.writeFileSync(file,data.replace(old,next));
}
fs.writeFileSync('tests/positron-356-preflight.test.cjs',"'use strict';\nconst test=require('node:test'),assert=require('node:assert/strict');\nconst {advanceViewingSample:advance}=require('../renderer/positron-intelligence-core.js');\nconst step=(prev,wall,media,extra={})=>advance(prev,{id:'qa',source:'blob:fixture',wall,media,...extra});\ntest('playing credits actual watched seconds',()=>{let s=step(null,0,0);for(let i=1;i<=9;i++)s=step(s,i*4000,i*4);assert.equal(s.seconds,36);});\ntest('stalled media never crosses learning thresholds',()=>{let s=step(null,0,3);for(let i=1;i<=60;i++)s=step(s,i*4000,3);assert.equal(s.seconds,0);});\ntest('partial buffering credits only progressing media',()=>{assert.equal(step(step(null,0,0),4000,1).seconds,1);});\ntest('large discontinuities cannot train AI',()=>{let s=step(null,0,30);s=step(s,4000,130);s=step(s,8000,20);assert.equal(s.seconds,0);});\ntest('2x media credits wall time, rate transition is conservative',()=>{let s=step(null,0,0,{rate:2});s=step(s,4000,8,{rate:2});assert.equal(s.seconds,4);assert.equal(step(s,8000,12,{rate:1}).seconds,4);});\ntest('channel and source changes reset session',()=>{let s=step(step(null,0,0),4000,4);assert.equal(step(s,8000,8,{source:'blob:other'}).seconds,0);assert.equal(step(s,8000,8,{id:'other'}).seconds,0);});\ntest('invalid and seeking samples reset session',()=>{let s=step(null,0,0);for(const x of [{seeking:true},{rate:0},{source:''},{media:NaN},{wall:Infinity}])assert.equal(step(s,4000,4,x),null);});\ntest('long sampling gaps are bounded',()=>{assert.equal(step(step(null,0,0),100000,100).seconds,5);});\ntest('threshold flags preserved and input not mutated',()=>{let s={...step(null,0,0),seconds:180,first:true,second:true};let n=step(s,4000,4);assert.equal(n.seconds,184);assert.equal(n.first,true);assert.equal(n.second,true);assert.equal(s.seconds,180);});\ntest('non-monotonic wall time cannot add learning',()=>{assert.equal(step(step(null,4000,0),3000,4).seconds,0);});\n");
