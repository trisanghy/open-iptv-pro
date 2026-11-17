'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createAutoModelInstaller}=require('../src/local-ai-autoinstall.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v4.23.60: Whisper detects original language and direct routing bypasses identical languages',()=>{
 const cap=read('src/live-caption-service.cjs'),main=read('src/main.cjs');
 assert.match(cap,/vietnamese:'vi'/);
 assert.match(read('src/live-translate-router.cjs'),/if\(source===target\)/);
 assert.match(cap,/routeLiveSegment/);
 assert.match(cap,/sourceLanguage:detected/);
 assert.doesNotMatch(cap,/if\(s.translate\)args.push\('-tr'\)/);
 assert.match(main,/captionTranslator.translateText\(text,target,source,options\)/);
});
test('v4.23.60: repeats suppressed in both caption service and TTS queue',()=>{
 const cap=read('src/live-caption-service.cjs'),tts=read('renderer/local-tts-v42344.js');
 assert.match(cap,/key===s.lastKey&&now-s.lastEmittedAt<60000/);
 assert.match(tts,/const recentLines=new Map\(\)/);
 assert.match(tts,/now-earlier<60000/);
 assert.match(tts,/rememberOnce\(e.utteranceKey\|\|text\)/);
 assert.match(tts,/recentLines.clear\(\)/);
});
test('v4.23.60: original audio ducking persists while TTS is enabled',()=>{
 const ui=read('renderer/local-tts-v42344.js');
 assert.match(ui,/function applyDuck\(\)/);
 assert.match(ui,/if\(!enabled\)return/);
 assert.match(ui,/baseVolume\*scale\(\)/);
 assert.match(ui,/if\(enabled\)applyDuck\(\)/);
 assert.match(ui,/700\)/);
 assert.doesNotMatch(ui,/attenuate\(\)/);
 assert.match(ui,/speechQueue\.setEnabled\(enabled\)/);
 assert.match(ui,/if\(!enabled\)\{restore\(\)/);
});
test('v4.23.60: caption and voice source language independent of English intermediate',()=>{
 const tts=read('renderer/local-tts-v42344.js'),svc=read('src/local-tts-service.cjs');
 assert.match(tts,/const sourceLanguage=sameLanguage\?target.value/);
 assert.match(tts,/alreadyTranslated:!!sameLanguage/);
 assert.match(svc,/sourceLanguage!==lang/);
 assert.match(svc,/translateText\(input,lang,sourceLanguage\)/);
 assert.match(read('src/main.cjs'),/resolveAIEngine/);
 assert.match(read('src/main.cjs'),/localHyMT\.translate/);
});
test('v4.23.60: Argos bridge prefers direct language pairs and falls back to English only if missing',()=>{
 const p=read('src/argos-bridge.py'),installer=read('src/local-ai-autoinstall.cjs');
 assert.match(p,/if src == dst/);
 assert.match(p,/if direct_packages\(src, dst\)/);
 assert.match(p,/direct_packages\(src, "en"\) and direct_packages\("en", dst\)/);
 assert.match(p,/if fetch_direct\(src, dst\)/);
 assert.match(installer,/async function installPair\(from,to\)/);
 assert.match(installer,/pairReadyFor\(from,to\)/);
 const source=read('src/caption-translator.cjs');
 assert.match(source,/installer.installPair\(from,target\)/);
});
