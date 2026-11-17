'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createCaptionTranslator,LANGUAGES,isValidTarget}=require('../src/caption-translator.cjs');
test('v4.23.46: dropdown includes 15 target languages, Vietnamese default',()=>{
 const h=read('renderer/index.html');const m=h.match(/<select id="liveTranslateTarget"[^>]*>([\s\S]*?)<\/select>/);
 assert.ok(m);for(const key of Object.keys(LANGUAGES))assert.match(m[1],new RegExp('value="'+key+'"'));
 assert.match(m[1],/value="vi" selected/);
});
test('v4.23.46: Whisper no longer uses no-print flag, emits English intermediate',()=>{
 const s=read('src/live-caption-service.cjs');
 assert.ok(s.includes("'-nt','-t','4'"));
 assert.doesNotMatch(s,/'-nt','-np'/);
 assert.match(s,/routeLiveSegment/);
 assert.match(s,/englishText,/);
});
test('v4.23.46: errors do not silently uncheck Caption and Translate',()=>{
 const s=read('renderer/live-captions-v42343.js');
 assert.match(s,/captionAutoInstall\(\)/);assert.match(s,/captionInstallLanguage\(target\)/);
 assert.match(s,/captionRetry/);assert.doesNotMatch(s,/caption.checked=false;translate.checked=false/);
});
test('v4.23.46: Argos status, translation, safe supported language validation',async()=>{
 const installer={paths:()=>({argos:'',argosDir:'/tmp',pairReady:()=>false}),installTranslation:async()=>({ready:false})};
 const t=createCaptionTranslator({installer});
 assert.ok(isValidTarget('vi'));assert.equal(isValidTarget('bogus'),false);
 assert.equal(t.status('vi').ready,false);assert.equal(t.status('en').ready,true);
 assert.equal(await t.translateEnglish('Hello','en'),'Hello');
 await assert.rejects(t.translateEnglish('Hello','vi'),/chưa/i);
 assert.throws(()=>t.status('../etc'));
});
test('v4.23.46: translate-only installer never requires Piper voice model',()=>{
 const s=read('src/local-ai-autoinstall.cjs');const a=s.indexOf('async function installTranslation');
 assert.ok(a>0);const c=s.slice(a,s.indexOf('function cancel()',a));
 assert.match(c,/installPair\('en',lang\)/);assert.doesNotMatch(c,/voiceFile\(/);
});
test('v4.23.46: speech synthesis consumes English intermediate, no double-translate',()=>{
 assert.match(read('renderer/local-tts-v42344.js'),/englishIntermediate\|\|e\.text/);
});
test('v4.23.46: bounded IPC plus app version is synchronized',()=>{
 const main=read('src/main.cjs'),pre=read('src/preload.cjs');
 assert.match(main,/caption:installLanguage/);assert.match(main,/caption:languageStatus/);
 assert.match(pre,/captionInstallLanguage/);assert.match(pre,/captionLanguageStatus/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.63');
});
