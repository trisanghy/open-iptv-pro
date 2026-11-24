'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('P354 setup hint follows consent without mutating it',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const match=js.match(/const setupHint=([^\n]+);\s*empty\.textContent=setupHint\(enabled\);/);
 assert.ok(match,'render must use the current consent');
 const hint=vm.runInNewContext('('+match[1]+')');
 assert.match(hint(true),/Bạn đã bật học sở thích/);
 assert.match(hint(true),/AI chỉ học sau khi xem kênh đủ điều kiện/);
 assert.match(hint(false),/vẫn có thể xem IPTV mà không bật học sở thích/);
 assert.doesNotMatch(hint(false),/Bạn đã bật học/);
 assert.doesNotMatch(hint(true),/sau đó bật học/);
 assert.ok(js.includes("openSources.id='poAIAddLegalSource'"));
});
