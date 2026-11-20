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
 assert.match(html,/unified-ai-inline-v1\\.js/);
 assert.match(html,/unified-ai-inline-v1\\.css/);
 assert.doesNotThrow(()=>new Function(code));
});
test('original AI controls and saved preferences remain in DOM',()=>{
 for(const id of ['captionThirdRow','liveCaptionToggle','liveTranslateToggle','liveTranslateTarget',
 'liveTtsToggle','liveTtsLanguage','liveTtsVoice','liveTtsSpeed','liveTtsDuck']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(code,/while \\(row\\.firstChild\\)/);
 assert.match(code,/content\\.appendChild\\(row\\.firstChild\\)/);
 assert.match(code,/aria-expanded/);
});
test('CC is inline without an outer modal frame',()=>{
 assert.match(css,/unified-inline-cc/);
 assert.match(css,/position:static!important/);
 assert.match(css,/border:0!important/);
 assert.match(code,/content\\.appendChild\\(panel\\)/);
});
test('fullscreen CC portal is retained on Rust Lab',()=>{
 const cc=fs.readFileSync(path.join(root,'rust-subtitle-controls-v23-8-5.js'),'utf8');
 assert.match(cc,/unified-inline-cc/);
 assert.match(cc,/const parent=fullscreen\\?frame:document\\.body/);
});
