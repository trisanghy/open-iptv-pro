'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createCaptionTranslator}=require('../src/caption-translator.cjs');
test('v4.23.60: identical source and target never require models or installation',async()=>{
 let installs=0;
 const installer={paths:()=>({}),installTranslation:async()=>{installs++},
  installPair:async()=>{installs++}};
 const translator=createCaptionTranslator({installer});
 const sentence='Bạn đang làm gì?';
 assert.equal(await translator.translateText(sentence,'vi','vi'),sentence);
 assert.equal(await translator.translateText('Hello','en','en'),'Hello');
 assert.equal(installs,0);
});
test('v4.23.60: offline translator repairs one failure and backs off repeated errors',()=>{
 const t=read('src/caption-translator.cjs');
 assert.match(t,/await installer.installPair\(from,target\)/);
 assert.match(t,/const repaired=await translateOnce\(\)/);
 assert.match(t,/Date.now\(\)-failed.time<60000/);
 assert.match(t,/failedPairs.set\(pair/);
 assert.match(read('src/argos-bridge.py'),/package.uninstall\(installed\)/);
 assert.match(read('src/argos-bridge.py'),/smoke\(src, dst\)/);
});
test('v4.23.60: errors never terminate Live Caption; original text remains visible',()=>{
 const cap=read('src/live-caption-service.cjs'),ui=read('renderer/live-captions-v42343.js');
 assert.match(cap,/type:'translation-error'/);
 assert.match(cap,/finalText=words;translated=false/);
 assert.match(cap,/catch\(error\)/);
 assert.match(ui,/ev.type==='translation-error'/);
 assert.match(ui,/lastTranslationFailureAt/);
 assert.match(ui,/outputWords\(ev.text/);
});
test('v4.23.60: language detection accepts names and ISO and direct pair preferred',()=>{
 const cap=read('src/live-caption-service.cjs'),bridge=read('src/argos-bridge.py');
 assert.match(cap,/vietnamese:'vi'/);
 assert.match(cap,/english:'en'/);
 assert.match(cap,/mandarin:'zh'/);
 assert.match(read('src/live-translate-router.cjs'),/if\(source===target\)/);
 assert.match(bridge,/if direct_packages\(src, dst\)/);
 assert.match(bridge,/if "en" in \(src, dst\)/);
});
test('v4.23.60: source version and user-selected DMG-only distribution',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.64');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
