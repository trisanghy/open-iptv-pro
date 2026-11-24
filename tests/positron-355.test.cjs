'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P355 mode shortcut guidance follows source availability',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 assert.ok(js.includes("modeHintWithoutChannels='← → ↑ ↓: chế độ · Enter/Space: chọn'"));
 assert.ok(js.includes("modeHintWithChannels='← →: chế độ · Enter/Space: chọn · Alt+Shift+J: tới nút Xem đầu'"));
 assert.ok(js.includes('modeHelp.textContent=collection.length?modeHintWithChannels:modeHintWithoutChannels;'));
 assert.ok(js.includes('Thêm nguồn IPTV để có gợi ý.'));
 assert.ok(js.includes("area.setAttribute('aria-keyshortcuts','Alt+Shift+J')"));
});
