'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {routeLiveSegment,CODES}=require('../src/live-translate-router.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v4.23.53: 15 language choices share the same functional Whisper-English fallback',async()=>{
 assert.equal(CODES.size,15);
 for(const target of CODES){
  const calls=[];let whisperCount=0;
  const result=await routeLiveSegment({
   text:'原始中文',source:'zh',target,
   translateText:async(text,dest,src,opt)=>{
    calls.push([src,dest,!!opt?.directOnly]);
    if(opt?.directOnly)throw Error('Argos zh->'+dest+' direct is unavailable');
    assert.equal(src,'en');
    return 'TRANSLATED '+dest+': '+text;
   },
   whisperToEnglish:async()=>{whisperCount++;return 'What are you doing?';}
  });
  assert.equal(result.language,target);
  assert.equal(result.translated,true);
  if(target==='zh'){
   assert.equal(result.text,'原始中文');assert.equal(whisperCount,0);assert.equal(calls.length,0);
  }else if(target==='en'){
   assert.equal(result.text,'What are you doing?');assert.equal(whisperCount,1);
   assert.equal(calls.length,0,'English uses working Whisper, no Argos Chinese-English model');
  }else{
   assert.equal(result.text,'TRANSLATED '+target+': What are you doing?');
   assert.deepEqual(calls,[['zh',target,true],['en',target,false]],
     'Other target must try direct then fall back via Whisper English only');
   assert.equal(whisperCount,1);
   assert.equal(result.englishText,'What are you doing?');
   assert.equal(result.route,'whisper-en-target');
  }
 }
});
test('v4.23.53: installed direct translation wins over English intermediary',async()=>{
 let whisperCount=0;
 const res=await routeLiveSegment({text:'你好',source:'zh',target:'vi',
  translateText:async(input,target,source,opts)=>{
   assert.equal(input,'你好');assert.equal(source,'zh');assert.equal(target,'vi');
   assert.equal(opts.directOnly,true);return 'Xin chào';
  },whisperToEnglish:async()=>{whisperCount++;return 'Hello';}});
 assert.equal(res.text,'Xin chào');assert.equal(res.route,'direct');
 assert.equal(res.englishText,'');assert.equal(whisperCount,0);
});
test('v4.23.53: no extra model calls when input and output languages match',async()=>{
 for(const target of CODES){
  const result=await routeLiveSegment({text:'same',source:target,target,
   translateText:()=>{throw Error('Argos should never be called');},
   whisperToEnglish:()=>{throw Error('Whisper translation should never be called');}});
  assert.equal(result.text,'same');assert.equal(result.route,'same');
 }
});
test('v4.23.53: Whisper output also routes to English-origin target directly',async()=>{
 const result=await routeLiveSegment({text:'Hello there',source:'en',target:'vi',
  translateText:async(input,target,from,opts)=>{
   assert.equal(input,'Hello there');assert.equal(from,'en');assert.equal(target,'vi');
   assert.equal(opts,undefined);return 'Xin chào';
  },whisperToEnglish:()=>{throw Error('must not request Whisper twice');}});
 assert.equal(result.text,'Xin chào');
 assert.equal(result.englishText,'Hello there');
});
test('v4.23.53: unsupported translation engine yields error and does not pretend success',async()=>{
 await assert.rejects(()=>routeLiveSegment({text:'你好',source:'zh',target:'vi',
  translateText:async()=>{throw Error('Argos en-vi model missing');},
  whisperToEnglish:async()=> 'Hello'}),/Argos en-vi model missing/);
 const service=read('src/live-caption-service.cjs');
 assert.match(service,/type:'translation-error'/);
 assert.match(service,/finalText=words;translated=false/);
 assert.match(service,/routeLiveSegment/);
 assert.match(service,/translateText:\(input,target,source,options\)/);
});
test('v4.23.53: direct-only installer never marks pivot as a verified direct model',()=>{
 const model=read('src/local-ai-autoinstall.cjs'),bridge=read('src/argos-bridge.py');
 assert.match(model,/async function installDirect\(from,to\)/);
 assert.match(model,/\.direct/);
 assert.match(model,/NO_DIRECT|OK direct/);
 assert.match(bridge,/if command == "install-direct":/);
 assert.match(bridge,/print\("NO_DIRECT", flush=True\)/);
 assert.match(read('src/caption-translator.cjs'),/directOnly/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.53');
});
