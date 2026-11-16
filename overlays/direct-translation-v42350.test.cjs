'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createCaptionTranslator}=require('../src/caption-translator.cjs');
const service=read('src/live-caption-service.cjs'),ui=read('renderer/local-tts-v42344.js'),tts=read('src/local-tts-service.cjs');
test('no translation process or model install when spoken source already equals destination',async()=>{
 let calls=0;
 const engine=createCaptionTranslator({installer:{paths:()=>({python:'/not/a/python'}),installTranslation:()=>{calls++;throw Error('Unexpected install');}}});
 const text=await engine.translate('Xin chào!','vi','vi');
 assert.equal(text.text,'Xin chào!');
 assert.equal(text.route,'same');
 assert.equal((await engine.install('vi','vi')).route,'same');
 assert.equal((await engine.route('en','en')).route,'same');
 assert.equal(calls,0);
});
test('Whisper uses original transcription and verified language JSON before any translation',()=>{
 assert.match(service,/decoded\?\.result\?\.language/);
 assert.match(service,/-oj','-of',fileBase/);
 assert.match(service,/detected!==s\.target/);
 assert.match(service,/sourceLanguage:detected/);
 assert.match(service,/if\(routed\.needsEnglish\)/);
 assert.match(service,/routed\.needsModel/);
 assert.match(service,/route='same'/);
});
test('TTS receives actual text language and bypasses Argos for identical languages',()=>{
 assert.match(ui,/sourceLanguage:payload\.sourceLanguage/);
 assert.match(ui,/if\(visibleLang===language\)/);
 assert.match(ui,/else if\(originalLang===language&&original\)/);
 assert.match(tts,/if\(sourceLanguage!==lang\)\{/);
 assert.doesNotMatch(tts,/if\(lang!=='en'\)\{/);
 assert.match(tts,/try\{\s*speakText=await runPair\(sourceLanguage,lang,input\)/);
 assert.match(tts,/englishFallbackText/);
});
test('regressions: persistent attenuation, no repeated speech, no premature English model install',()=>{
 assert.match(ui,/function acceptSpeech\(/);
 assert.match(ui,/if\(!acceptSpeech\(/);
 assert.match(ui,/video\.addEventListener\('volumechange'/);
 assert.match(ui,/video\.addEventListener\('playing'/);
 const c=read('renderer/live-captions-v42343.js');
 assert.match(c,/actual Whisper detection/);
 assert.match(c,/type==='needs-model'/);
});

test('same-language caption is still spoken when translated=false, without Argos',()=>{
 assert.ok(ui.includes("if(!enabled||!translate?.checked||!e||e.type!=='segment'||!e.text)return;"));
 assert.ok(!ui.includes("e.type!=='segment'||!e.translated"));
});
