'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {createLiveCaptionService}=require('../src/live-caption-service.cjs');
const {createCaptionTranslator}=require('../src/caption-translator.cjs');
function fakeProcess(callback){
 const child=new EventEmitter();
 child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};
 setImmediate(()=>{try{callback(child);}catch(e){child.emit('error',e);}});
 return child;
}
test('runtime: ffmpeg audio -> Whisper visible text -> offline Vietnamese translated segment',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-caption-runtime-'));
 try{
  const binary=path.join(root,'whisper-cli'),model=path.join(root,'ggml-base.bin');
  fs.writeFileSync(binary,'fake-whisper-executable');
  fs.writeFileSync(model,Buffer.alloc(1100000));
  let translated=0,argsSeen=[];
  let service;
  const received=new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Timed out waiting for recognized subtitle')),5000);
   service=createLiveCaptionService({
    dataDir:root,
    getFFmpeg:()=>'/tmp/ffmpeg',
    env:{PATH:''},
    translateText:async(txt,target)=>{
     translated++;
     assert.equal(target,'vi');
     assert.equal(txt,'This is a news report');
     return 'Đây là bản tin';
    },
    notify:event=>{
     if(event.type==='segment'){
      clearTimeout(timeout);
      service.stop();
      resolve(event);
     }
     if(event.type==='error'){clearTimeout(timeout);reject(Error(event.message));}
    },
    spawnProc:(exe,args)=>{
     argsSeen.push({exe,args});
     return fakeProcess(child=>{
      if(exe==='/tmp/ffmpeg'){
       fs.writeFileSync(args[args.length-1],Buffer.alloc(26000,42));
      }else{
       child.stdout.emit('data',Buffer.from('This is a news report\n','utf8'));
      }
      child.emit('close',0);
     });
    }
   });
   service.setFile('binary',binary);
   service.setFile('model',model);
   assert.equal(service.status().available,true);
   service.start({url:'https://video.example/stream.m3u8',translate:true,target:'vi'});
  });
  const event=await received;
  assert.equal(event.text,'Đây là bản tin');
  assert.equal(event.englishText,'This is a news report');
  assert.equal(event.translated,true);
  assert.equal(event.language,'vi');
  assert.equal(translated,1);
  const whisper=argsSeen.find(x=>x.exe===binary);
  assert.ok(whisper,'Whisper must be invoked');
  assert.equal(whisper.args.includes('-np'),false,'No prints option must not suppress speech');
  assert.ok(whisper.args.includes('-tr'),'Whisper should translate into English');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('runtime: Argos offline subprocess performs actual target translation',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-argos-test-'));
 try{
  const exe=path.join(root,'argos-translate');
  fs.writeFileSync(exe,'fake-argos');
  let seen;
  const installer={
   paths:()=>({argos:exe,argosDir:root,pairReady:lang=>lang==='vi'}),
   installTranslation:async target=>({ready:target==='vi'})
  };
  const engine=createCaptionTranslator({
   installer,
   spawnProcess:(binary,args,opts)=>fakeProcess(child=>{
    seen={binary,args,opts};
    child.stdout.emit('data',Buffer.from('Xin chào thế giới\n'));
    child.emit('close',0);
   })
  });
  assert.equal(engine.status('vi').ready,true);
  const text=await engine.translateEnglish('Hello world','vi');
  assert.equal(text,'Xin chào thế giới');
  assert.equal(seen.binary,exe);
  assert.deepEqual(seen.args,['--from-lang','en','--to-lang','vi','Hello world']);
  assert.equal(seen.opts.shell,false);
  assert.equal(seen.opts.env.ARGOS_PACKAGES_DIR,root);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
