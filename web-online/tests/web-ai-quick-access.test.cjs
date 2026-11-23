'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const src=fs.readFileSync(path.join(root,'web-ai-quick-access.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-ai-quick-access.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const build=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
test('quick-access script is valid and only calls the existing AI tabs',()=>{
 assert.doesNotThrow(()=>new vm.Script(src));
 const api=require(path.join(root,'web-ai-quick-access.js'));
 assert.deepEqual(api.modes,['classification','recommended']);
 assert.match(src,/data-ai-tab/);
 assert.match(src,/tab\.click\(\)/);
 assert.doesNotMatch(src,/NaiveBayes|function predict\(|localStorage\.setItem|fetch\(|indexedDB/);
});
test('two accessible AI shortcuts appear in sidebar and channel filter, including mobile',()=>{
 assert.match(src,/web-ai-quick-nav/);
 assert.match(src,/web-ai-quick-filter/);
 assert.match(src,/webAiQuickBack/);
 assert.match(src,/setPage\?\.\('tv'\)/);
 assert.match(src,/aria-pressed/);
 assert.match(css,/web-ai-quick-open/);
 assert.match(css,/data-iptv-device="mobile"/);
 assert.match(css,/webChannelIntelligence/);
 assert.match(html,/web-ai-quick-access\.js\?v=ai-shortcut-nav-20261123a/);
 assert.match(html,/web-ai-quick-access\.css\?v=ai-shortcut-nav-20261123a/);
 assert.match(build,/web-ai-quick-access\.js/);
 assert.match(build,/web-ai-quick-access\.css/);
});
test('original full channel hub, player, playlist and AI model stay intact',()=>{
 const ai=fs.readFileSync(path.join(root,'web-channel-intelligence.js'),'utf8');
 assert.match(ai,/function analyse\(/);
 assert.match(ai,/function filterRows\(/);
 assert.match(html,/id="channelList"/);
 assert.match(html,/id="video"/);
 assert.match(html,/web-channel-intelligence\.js\?v=/);
});
