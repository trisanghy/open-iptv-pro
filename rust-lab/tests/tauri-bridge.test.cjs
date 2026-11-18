const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('renderer/index.html','utf8');
const shim=fs.readFileSync('renderer/tauri-bridge.js','utf8');
const cfg=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const preload=fs.readFileSync('src/preload.cjs','utf8');
const bridge=fs.readFileSync('src-tauri/src/bridge.rs','utf8');

test('Tauri experimental identity stays separate from Electron stable ID',()=>{
 assert.equal(cfg.identifier,'org.openiptvpro.experiments.rustlab');
 assert.equal(cfg.productName,'Open IPTV Pro Rust Lab');
 assert.equal(cfg.app.withGlobalTauri,true);
 assert.notEqual(cfg.identifier,'org.openiptvpro.desktop');
});
test('IPC shim is loaded before original browser scripts',()=>{
 assert.ok(html.indexOf('tauri-bridge.js')<html.indexOf('theme-boot.js'));
 assert.match(shim,/window\.streamleaf\s*=\s*Object\.freeze/);
});
test('All original preload method names preserved by compatibility shim',()=>{
 const names=[...preload.matchAll(/^\s*([a-zA-Z][\w]*):/gm)].map(m=>m[1]).filter(n=>n!=='onUpdateStatus');
 for(const name of names) assert.match(shim,new RegExp('\\b'+name+':'),'Missing shim: '+name);
 assert.ok(bridge.includes('pub async fn bridge('));
});
test('Update from Electron main releases is disabled',()=>{
 assert.match(bridge,/"update:download"/);
 assert.match(bridge,/"update:install"/);
 assert.doesNotMatch(cfg.identifier,/desktop$/);
});

test('Tauri IPC shim forwards arguments to Rust bridge without Electron', async()=>{
 const vm=require('node:vm');
 const calls=[];
 const target={__TAURI__:{core:{invoke:async(command,payload)=>{calls.push({command,payload});return {ok:true}}}}};
 const ctx={window:target,document:{documentElement:{dataset:{}}},queueMicrotask};
 vm.runInNewContext(shim,ctx,{filename:'tauri-bridge.js'});
 assert.equal(target.streamleaf!==undefined,true);
 assert.equal(target.streamleaf.proxy!==undefined,true);
 const val=await target.streamleaf.proxy('https://example.org/stream.m3u8');
 assert.deepEqual(val,{ok:true});
 assert.equal(calls[0].command,'bridge');
 assert.equal(calls[0].payload.op,'media:proxy');
 assert.equal(calls[0].payload.args[0],'https://example.org/stream.m3u8');
 assert.equal(ctx.document.documentElement.dataset.desktopRuntime,'tauri2-rust');
});
test('Tauri build uses offline-bundled media libraries, not node_modules URLs',()=>{
 assert.match(html,/src="vendor\/hls\.min\.js"/);
 assert.match(html,/src="vendor\/dash\.all\.min\.js"/);
 assert.doesNotMatch(html,/script src="\.\.\/node_modules\//);
 const prep=fs.readFileSync('scripts/prepare-renderer.cjs','utf8');
 assert.match(prep,/ffmpeg-static/);
 assert.ok(cfg.bundle.resources.includes('resources/*'));
});
