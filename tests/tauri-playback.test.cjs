'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

test('Tauri compatibility fallback exists in JS IPC and Rust dispatcher',()=>{
  const bridge=read('renderer/tauri-bridge.js');
  const rust=read('src-tauri/src/bridge.rs');
  assert.match(bridge,/compatStart:\s*'media:compatStart'/);
  assert.match(bridge,/compatStop:\s*'media:compatStop'/);
  assert.match(rust,/"media:compatStart"=>compat::start/);
  assert.match(rust,/"media:compatStop"=>/);
});

test('FFmpeg fallback is bounded to a single attempted session and HLS player path',()=>{
  const js=read('renderer/app.js');
  const compat=read('src-tauri/src/compat.rs');
  assert.match(js,/isTauri&&!compatAttempted/);
  assert.match(js,/compatAttempted=true/);
  assert.match(js,/tryPlayback\(session\.url,generation,\{compat:true\}\)/);
  assert.match(compat,/Duration::from_secs\(14\)/);
  assert.match(compat,/"libx264"/);
  assert.match(compat,/"aac"/);
  assert.match(compat,/kill_on_drop\(true\)/);
});

test('Loopback FFmpeg media route is token-authenticated and session-scoped',()=>{
  const server=read('src-tauri/src/stream.rs');
  const compat=read('src-tauri/src/compat.rs');
  assert.match(server,/route\("\/compat", get\(compat_file\)/);
  assert.match(server,/async fn compat_file[\s\S]*?authenticated\(&state,&q\)/);
  assert.match(server,/session\.id==id/);
  assert.match(compat,/name\.is_ascii\(\)/);
});

test('DASH starts with proxy manifest and opaque-path HLS is sniffed',()=>{
  const js=read('renderer/app.js');
  const server=read('src-tauri/src/stream.rs');
  assert.match(js,/engine\.initialize\(player,actual,false\)/);
  assert.match(server,/String::from_utf8_lossy\(head\)[\s\S]*?starts_with\("#EXTM3U"\)/);
  assert.match(server,/stream::once\(async move/);
});

test('Preview failure distinguishes saved snapshot from playing video',()=>{
  const js=read('renderer/advanced.js');
  assert.match(js,/Ảnh đã lưu • không phát được xem trước/);
});
