'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const marker='/* Netflix-inspired COLOR PALETTE ONLY.';
const start=html.indexOf(marker);
const end=html.indexOf('.playerdiag{position:absolute;',start);
const css=html.slice(start,end);
test('Previous TV homepage is restored: no cinematic hero or poster gallery',()=>{
 assert.ok(start>=0&&end>start,'Netflix colors appended after the original CSS');
 assert.match(html,/<div class="main">\s*<nav class="nav">/);
 assert.match(html,/<section class="listpane" aria-labelledby="heading">/);
 assert.match(html,/<aside class="details" aria-label="Kênh đang chọn">/);
 assert.match(html,/id="previewStage"/);
 assert.match(html,/id="channelPicker" hidden tabindex="-1"/);
 assert.doesNotMatch(html,/class="main cinema-home"|picker-cover|picker-overline|library-eyebrow|hero-eyebrow|nearestHomeTile/);
 assert.match(html,/#channelPicker \.picker-panel\{width:min\(920px,57vw\)/);
 assert.match(html,/#channelPicker \.picker-row\{min-height:78px;font-size:29px/);
 assert.match(html,/\.main\{[\s\S]{0,160}grid-template-columns:minmax\(186px,16fr\) minmax\(0,49fr\) minmax\(0,35fr\)/);
});
test('Netflix red black white gray colors apply to home buttons, fullscreen picker and dialogs',()=>{
 for(const value of ['#141414','#e50914','#ffffff','#f5f5f1','#b3b3b3']){
  assert.ok(css.includes(value),'missing Netflix palette '+value);
 }
 for(const selector of ['body #app button.active','body #app .channel:focus',
  'body #app .actions .primary','body #app .brandicon',
  'body #channelPicker .picker-panel','body #channelPicker .picker-row.active',
  'body #channelPicker .picker-groups button.active',
  'body .dialog','body #browserFallback','body #toast']){
  assert.ok(css.includes(selector),'missing Netflix color rule for '+selector);
 }
 assert.match(css,/body\[data-theme=amoled\]/);
 assert.match(css,/body\[data-theme=light\]/);
 assert.doesNotMatch(css,/grid-template|grid-auto-flow|font-size|min-height|min-width|max-height|height:calc|width:min|position:absolute/,
  'palette override must never change geometry or layout');
});
test('Playback, TV preview and Samsung remote navigation remain unchanged',()=>{
 assert.match(html,/pickerPlayTimer=setTimeout\(commitPickerPlay,200\)/);
 assert.match(html,/pickerHideTimer=setTimeout\(function\(\)\{pickerHideTimer=null;/);
 assert.match(html,/function startRelayHlsPlayback\(channel,token\)/);
 assert.match(html,/function stopHomePreview\(\)/);
 assert.match(html,/function scheduleHomePreview\(channel\)/);
 assert.match(html,/function recoverStalledPlayback\(token,reason\)/);
 assert.match(html,/function savedPlaybackRoute\(channel\)/);
 assert.match(html,/id="homePreviewVideo" playsinline muted/);
 assert.match(html,/class="brand-svg"/);
 assert.match(html,/class="nav-icon"><svg class="ui-icon"/);
});
test('All inline JavaScript parses after visual-only rollback',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.ok(scripts.length>0);
 for(const match of scripts)assert.doesNotThrow(()=>new vm.Script(match[1]));
});
