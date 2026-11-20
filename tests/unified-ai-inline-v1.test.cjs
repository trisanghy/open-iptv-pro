'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'../renderer');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const code=fs.readFileSync(path.join(root,'unified-ai-inline-v1.js'),'utf8');
const css=fs.readFileSync(path.join(root,'unified-ai-inline-v1.css'),'utf8');
test('unified AI assets are linked and script parses',()=>{
 assert.match(html,/unified-ai-inline-v1\.js/);
 assert.match(html,/unified-ai-inline-v1\.css/);
 assert.doesNotThrow(()=>new Function(code));
});
test('original AI controls and saved preferences remain in DOM',()=>{
 for(const id of ['captionThirdRow','liveCaptionToggle','liveTranslateToggle','liveTranslateTarget',
 'liveTtsToggle','liveTtsLanguage','liveTtsVoice','liveTtsSpeed','liveTtsDuck']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(code,/while \(row\.firstChild\)/);
 assert.match(code,/content\.appendChild\(row\.firstChild\)/);
 assert.match(code,/aria-expanded/);
});
test('CC is inline without an outer modal frame',()=>{
 assert.match(css,/unified-inline-cc/);
 assert.match(css,/position:static!important/);
 assert.match(css,/border:0!important/);
 assert.match(code,/content\.appendChild\(panel\)/);
});
test('fullscreen CC portal is retained on Rust Lab',()=>{
 const cc=fs.readFileSync(path.join(root,'rust-subtitle-controls-v23-8-5.js'),'utf8');
 assert.match(cc,/unified-inline-cc/);
 assert.match(cc,/const parent=fullscreen\?frame:document\.body/);
});

test('compact unified trigger and one-row desktop TTS keep all controls without cloning',()=>{
 assert.match(css,/Unified AI compact desktop TTS layout v2/);
 assert.match(css,/#page-tv \.unified-ai-row \.unified-ai-toggle/);
 assert.match(css,/min-height:32px!important;height:32px!important/);
 assert.match(css,/grid-template-columns:max-content minmax\(105px,132px\)/);
 for (const id of ['liveTtsLanguage','liveTtsVoice','liveTtsSpeed','liveTtsDuck']) {
   assert.match(css,new RegExp('caption-tts-main>\\#'+id+'\\{grid-column:'));
 }
 assert.match(code,/unified-tts-voice-label/);
 assert.match(code,/voice\.insertAdjacentElement\('beforebegin', label\)/);
 assert.match(code,/content\.appendChild\(row\.firstChild\)/);
 assert.match(css,/@container \(max-width:740px\)/);
});


test('v3: all four TTS selects occupy the first grid row, including narrow player panels',()=>{
 const part=css.slice(css.lastIndexOf('/* One-row TTS v3:'));
 assert.ok(part.length>500,'expected v3 rule after the old responsive styles');
 assert.match(part,/grid-template-columns:max-content minmax\(72px,\.9fr\)/);
 assert.match(part,/overflow-x:auto!important/);
 for(const id of ['liveTtsLanguage','liveTtsVoice','liveTtsSpeed','liveTtsDuck']){
   assert.match(part,new RegExp('>#'+id+'\\{grid-column:[2-8]!important;grid-row:1!important\\}'));
 }
 assert.match(part,/>#liveTtsStatus\\{grid-column:1\/-1!important;grid-row:3!important\\}/);
 assert.doesNotMatch(part,/@container\\s*\\(max-width:740px\\)/);
});
