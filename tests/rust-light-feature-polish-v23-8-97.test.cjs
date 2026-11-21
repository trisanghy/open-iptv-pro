'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Rust visual Light repair loads after legacy GPU manager and main Rust stylesheet',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.indexOf('rust-light-feature-polish-v23-8-97.css')>html.indexOf('rust-light-consistency-v23-8-92.css'));
 assert.ok(html.indexOf('rust-light-feature-polish-v23-8-97.css')>html.indexOf('video-gpu-manager-v1.css'));
});
test('GPU card, modal, actions, explanatory text and caption selectors follow Light tokens',()=>{
 const css=read('renderer/rust-light-feature-polish-v23-8-97.css');
 for(const selector of ['#videoGpuManager','.veh-gpu-modal','#veh-gpu-storage','.veh-gpu-actions button','.veh-gpu-note','.caption-third-controls select']){
  assert.ok(css.includes(selector),'missing selector '+selector);
 }
 assert.match(css,/html\[data-theme="light"\]/);
 assert.match(css,/var\(--rust-light-card/);
 assert.match(css,/var\(--rust-light-text/);
 assert.doesNotMatch(css,/html\[data-theme="(?:dark|amoled)"\]/);
 assert.doesNotMatch(css,/localStorage|\.remove\(|\.append\(/);
});
test('gallery photographs legal notice and cancels rather than claiming usage rights',()=>{
 const js=read('tests/rust-feature-gallery-v23-8-97.cjs');
 assert.match(js,/dialog\.iptv-legal-consent/);
 assert.match(js,/24-sources-legal-usage-confirmation/);
 assert.match(js,/\.iptv-legal-actions button:first-child/);
 assert.doesNotMatch(js,/checkbox\.click\(|\.checked\s*=\s*true/);
 assert.match(js,/11-tv-ai-caption-translate-tts/);
 assert.match(js,/13-tv-video-enhancement-open/);
 assert.match(js,/44-amoled-settings/);
});
