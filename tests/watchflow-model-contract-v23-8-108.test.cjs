'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
test('agreed lightweight AI model is ~18 MB, not the 1 MB fallback',()=>{
 assert.match(source,/≈18 MB · Chưa tích hợp/);
 assert.match(source,/Bayes dự phòng &lt;1 MB/);
 assert.match(source,/Chưa có file trọng số/);
});
test('advanced model uses already installed Qwen3 or Hy-MT2, or offers new download through existing model manager',()=>{
 assert.match(source,/Dùng chung Qwen3\/Hy-MT2 đã tải hoặc tải thêm/);
 assert.match(source,/chưa gọi mô hình LLM/);
});
test('prior prerelease rules remain enforced',()=>{
 const policy=fs.readFileSync('PRE_RELEASE_POLICY_RUST_LAB.md','utf8');
 const wf=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 assert.match(policy,/PRE-RELEASE ONLY/);
 assert.match(wf,/prerelease: true/);assert.match(wf,/make_latest: false/);
});
