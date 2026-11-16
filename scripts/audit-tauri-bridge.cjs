'use strict';
const fs=require('node:fs');
const preload=fs.readFileSync('src/preload.cjs','utf8');
const shim=fs.readFileSync('renderer/tauri-bridge.js','utf8');
const rust=fs.readFileSync('src-tauri/src/bridge.rs','utf8');
const entries=[...preload.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*):/gm)].map(x=>x[1]);
const missing=entries.filter(x=>x!=='onUpdateStatus'&&!shim.includes(x+':'));
const ops=[...shim.matchAll(/\w+:\s*'([^']+:[^']+)'/g)].map(x=>x[1]);
const missingRust=ops.filter(x=>!rust.includes('"'+x+'"'));
if(missing.length||missingRust.length){console.error({missingShim:missing,missingRust});process.exit(1)}
if(!rust.includes('pub async fn bridge(')) {console.error('Rust command missing');process.exit(1)}
console.log(`PRELOAD -> Tauri shim: ${entries.length} methods; Rust IPC routes: ${ops.length}.`);
console.log('Experimental unimplemented operations return explicit errors; none invoke Electron.');
