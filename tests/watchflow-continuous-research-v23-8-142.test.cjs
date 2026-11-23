'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('WatchFlow metadata research continues with Standard or Smart selected, not only Intelligence',()=>{
 const source=fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8');
 assert.match(source,/if\(metrics.enabled&&metrics.remaining>0&&metrics.used<metrics.limit&&!webFollowup\)/);
 assert.doesNotMatch(source,/getItem\('watchflow:demo-mode'\)==='intelligence'&&/);
 assert.doesNotMatch(source,/getItem\('watchflow:demo-mode'\)!=='intelligence'\|\|/);
 assert.match(source,/lastInternet=0;void runInternet\(\)/);
 assert.match(source,/const DAY_LIMIT=72,RUN_LIMIT=6/);
});
test('Search progress is visible in all WatchFlow modes, not only Qwen3 settings',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 assert.match(ui,/internetProgress\?\.\(root.localStorage,d.channels\)/);
 assert.match(ui,/research.searched/);assert.match(ui,/research.matched/);
 assert.match(ui,/research.failed/);
});
test('Correct test fixture keeps Vietnamese names in the same cache keys as real playback',()=>{
 const testSource=fs.readFileSync('tests/watchflow-internet-fallback-v23-8-141.test.cjs','utf8');
 assert.match(testSource,/key='sơn la'/);
});
