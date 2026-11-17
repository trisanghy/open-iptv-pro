'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {Readable}=require('node:stream');
const {createGoogleOllamaService,GOOGLE_MODELS,googlePrompt}=require('../src/google-ollama.cjs');
const {MODELS:MLX_MODELS}=require('../src/hymt-service.cjs');
const {VOICES,createVietnameseVoices}=require('../src/vietnamese-voices.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Google catalog contains fixed Ollama model tags and hardware requirements',()=>{
 const expected=['translategemma:4b','translategemma:12b','translategemma:27b',
 'gemma3:1b','gemma3:4b','gemma4:e2b','gemma4:e4b','gemma4:12b','gemma4:26b'];
 assert.deepEqual(Object.values(GOOGLE_MODELS).map(x=>x.tag),expected);
 for(const m of Object.values(GOOGLE_MODELS)){
  assert.ok(m.approxBytes>500000000);
  assert.ok(m.minRamGB>=4&&m.recRamGB>=m.minRamGB);
  assert.equal(m.license,m.family==='gemma4'?'apache-2.0':'gemma-terms');
 }
 for(const m of Object.values(MLX_MODELS)){
  assert.ok(m.minRamGB>=4&&m.recRamGB>=m.minRamGB);
  assert.equal(m.device,'Mac Apple Silicon');
 }
});
test('TranslateGemma prompts include Chinese to Vietnamese without English pivot',()=>{
 const p=googlePrompt('zh','vi','你好世界',GOOGLE_MODELS.tg4);
 assert.match(p,/Chinese \(zh\) to Vietnamese \(vi\)/);
 assert.ok(p.endsWith('\n\n你好世界'));
 assert.doesNotMatch(p,/translate to English first/i);
 assert.throws(()=>googlePrompt('xx','vi','hello',GOOGLE_MODELS.tg4));
});
test('Ollama calls are local, unknown models cannot be installed or deleted',async()=>{
 const urls=[];
 const service=createGoogleOllamaService({fetcher:async(url)=>{
  urls.push(url);return {ok:true,json:async()=>({models:[{name:'translategemma:4b',size:3300000000}]})};
 }});
 const state=await service.states();
 assert.equal(state.models.tg4.installed,true);
 assert.equal(state.models.tg12.installed,false);
 assert.equal(state.models.tg4.bytes,3300000000);
 assert.ok(urls.every(u=>u.startsWith('http://127.0.0.1:11434/')));
 await assert.rejects(service.install('../other'),/không hợp lệ/);
 await assert.rejects(service.remove('fake'),/không hợp lệ/);
});
test('Ollama model installer pulls exact allowlisted tags and validates success',async()=>{
 let installed=false;
 const endpoints=[];
 const fetcher=async(url,options)=>{
  const endpoint=new URL(url).pathname;
  endpoints.push(endpoint);
  if(endpoint==='/api/tags')return {ok:true,json:async()=>({models:installed?[{name:'translategemma:4b',size:3300000000}]:[]})};
  if(endpoint==='/api/pull'){
   assert.equal(JSON.parse(options.body).model,'translategemma:4b');
   installed=true;
   return {ok:true,body:Readable.from(['{"status":"downloading","total":1000,"completed":500}\n',
    '{"status":"success"}\n'])};
  }
  throw Error('Unexpected endpoint '+endpoint);
 };
 const service=createGoogleOllamaService({fetcher});
 const state=await service.install('tg4');
 assert.equal(state.installed,true);
 assert.equal(endpoints.filter(x=>x==='/api/pull').length,1);
});
test('Ollama translates with a pinned local model, no remote API',async()=>{
 const requests=[];
 const fetcher=async(url,options)=>{
  const endpoint=new URL(url).pathname;
  if(endpoint==='/api/tags')return {ok:true,json:async()=>({models:[{name:'gemma3:4b',size:3400000000}]})};
  if(endpoint==='/api/chat'){
   requests.push(JSON.parse(options.body));
   return {ok:true,json:async()=>({message:{content:'Xin chào thế giới'}})};
  }
  throw Error('Unexpected endpoint '+endpoint);
 };
 const service=createGoogleOllamaService({fetcher});
 const output=await service.translate('Hello world','vi','en','gem3_4');
 assert.equal(output,'Xin chào thế giới');
 assert.equal(requests[0].model,'gemma3:4b');
 assert.equal(requests[0].stream,false);
 assert.equal(requests[0].options.temperature,0.1);
});
test('Vietnamese TTS voice IDs permit regions/styles but reject arbitrary IDs',()=>{
 assert.equal(Object.keys(VOICES).length,7);
 const mgr=createVietnameseVoices({dataDir:'/tmp/openiptv-mocked-test',installer:{prepareUv:async()=>'/tmp/uv'}});
 for(const id of Object.keys(VOICES)){
  assert.equal(mgr.validVoice(id),true);
  assert.ok(mgr.state(id).minRamGB>=8);
 }
 assert.equal(mgr.validVoice('vietvoice:../bad'),false);
 assert.throws(()=>mgr.state('bad'),/không hợp lệ/);
});
test('Real UI connects all Google + Vietnamese TTS options and F5 consent picker',()=>{
 const index=read('renderer/index.html'),voice=read('renderer/local-tts-v42344.js');
 const settings=read('renderer/unified-ai-settings-v42356.js');
 const main=read('src/main.cjs'),preload=read('src/preload.cjs'),tts=read('src/local-tts-service.cjs');
 for(const id of Object.keys(GOOGLE_MODELS))assert.match(index,new RegExp('value="'+id+'"'));
 for(const id of Object.keys(VOICES))assert.ok(voice.includes(id));
 assert.match(index,/id="f5ReferenceText"/);
 assert.match(voice,/ttsChooseReferenceAudio/);
 assert.match(main,/createVietnameseVoices/);
 assert.match(main,/googleAI\.translate/);
 assert.match(main,/vietTTS\.install/);
 assert.match(preload,/aiOpenOllamaDownload/);
 assert.match(preload,/ttsChooseReferenceAudio/);
 assert.match(settings,/ai-hardware-hint/);
 assert.match(settings,/recRamGB/);
 assert.match(settings,/CC-BY-NC-4\.0/);
 assert.match(tts,/vietnameseVoices\.speak/);
 assert.match(tts,/getPremiumSession\(\)\.synthesize/);
 assert.match(voice,/speechQueue\.enqueue\(payload\)/);
});
test('No Google or VN model is downloaded automatically at application launch',()=>{
 const ui=read('renderer/unified-ai-settings-v42356.js');
 const service=read('src/vietnamese-voices.cjs');
 assert.ok(ui.includes('api.aiInstallModel(id)'));
 assert.ok(service.includes('async function install(id)'));
 assert.doesNotMatch(ui,/window\.onload[\s\S]*aiInstallModel/);
 assert.ok(read('src/vietnamese-voices-bridge.py').includes('CC-BY-NC'));
});
