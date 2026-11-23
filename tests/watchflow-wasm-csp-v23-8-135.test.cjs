'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const runtime=require('../renderer/watchflow-smart-runtime-v23-8-126.js');
const getPolicy=()=>{const html=fs.readFileSync('renderer/index.html','utf8'),meta=html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);assert.ok(meta,'CSP meta must exist');return meta[1];};
test('Renderer CSP allows WASM compilation while JS eval remains prohibited',()=>{
 const csp=getPolicy(),directive=csp.split(';').map(x=>x.trim()).find(x=>x.startsWith('script-src '));
 assert.ok(directive,'script-src missing');
 assert.match(directive,/(?:^|\s)'wasm-unsafe-eval'(?:\s|$)/);
 assert.doesNotMatch(directive,/(?:^|\s)'unsafe-eval'(?:\s|$)/);
 assert.match(directive,/'self'/);
});
test('Tauri relies on HTML CSP; do not paper over this with csp=null or unsafe-eval',()=>{
 const conf=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
 assert.equal(conf.app.security.csp,null);
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.equal((html.match(/http-equiv="Content-Security-Policy"/g)||[]).length,1);
 assert.doesNotMatch(html,/\bscript-src[^;]*'unsafe-eval'/);
});
test('WASM preflight passes with a real valid WebAssembly binary',async()=>{
 assert.equal(await runtime.wasmPreflight({WebAssembly}),true);
});
test('CSP-blocked WebAssembly fails before ONNX download with actionable Vietnamese explanation',async()=>{
 const blocked={WebAssembly:{compile:async()=>{throw new EvalError("Refused to create a WebAssembly object because 'unsafe-eval' or 'wasm-unsafe-eval' is not an allowed source of script in the CSP");}}};
 await assert.rejects(runtime.wasmPreflight(blocked),/CSP chặn WebAssembly/);
 const source=fs.readFileSync('renderer/watchflow-smart-runtime-v23-8-126.js','utf8');
 assert.ok(source.indexOf('await wasmPreflight(win);')<source.indexOf("await import('./vendor/transformers.min.js')"),
  'must diagnose WASM CSP before downloading or importing ONNX model runtime');
});
