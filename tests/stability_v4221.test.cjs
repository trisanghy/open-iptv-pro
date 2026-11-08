'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {mkdtemp,rm,readdir,readFile}=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {createHash}=require('node:crypto');
const {UpdateManager}=require('../src/update-manager.cjs');
const repo='https://github.com/trisanghy/open-iptv-pro/releases/download/v4.22.2/';
const filename='Open-IPTV-Pro-4.22.2-mac-arm64.dmg';
const assets=[{name:filename,url:repo+filename},{name:'SHA256SUMS.txt',url:repo+'SHA256SUMS.txt'}];
const payload=Buffer.from('installer fixture, not an actual DMG');
const checksum=createHash('sha256').update(payload).digest('hex');
const app={getPath:()=>os.tmpdir(),getVersion:()=> '4.22.1',isPackaged:true};
const make=(overrides={})=>new UpdateManager({app,platform:'darwin',arch:'arm64',signatureCheck:()=>false,
 check:async()=>({latest:'v4.22.2',newer:true,assets}), ...overrides});
const checksumResponse=()=>new Response(`${checksum}  ${filename}\n`);
test('4.22.1: verified streaming installer is saved atomically',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'iptv-stable-'));
 const m=make({downloadsDir:dir,fetcher:async url=>url.includes('SHA256SUMS')?checksumResponse():new Response(payload,{headers:{'content-length':String(payload.length)}})});
 try{await m.checkForUpdates();const r=await m.download();assert.equal(r.phase,'manual-ready');assert.deepEqual(await readFile(r.downloadedFile),payload);assert.ok(!(await readdir(dir)).some(x=>x.endsWith('.part')));}finally{await rm(dir,{recursive:true,force:true});}
});
test('4.22.1: reject installer exceeding stream limit without an uncaught throw or partial file',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'iptv-size-'));
 const m=make({downloadsDir:dir,maxInstallerBytes:12,fetcher:async url=>url.includes('SHA256SUMS')?checksumResponse():new Response(payload)});
 try{await m.checkForUpdates();const r=await m.download();assert.equal(r.phase,'error');assert.match(r.message,/dung lượng/i);assert.deepEqual(await readdir(dir),[]);}finally{await rm(dir,{recursive:true,force:true});}
});
test('4.22.1: reject suspicious claimed installer size before writing file',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'iptv-sizeclaim-'));
 const m=make({downloadsDir:dir,maxInstallerBytes:12,fetcher:async url=>url.includes('SHA256SUMS')?checksumResponse():new Response(payload,{headers:{'content-length':'10000'}})});
 try{await m.checkForUpdates();const r=await m.download();assert.equal(r.phase,'error');assert.deepEqual(await readdir(dir),[]);}finally{await rm(dir,{recursive:true,force:true});}
});
test('4.22.1: abort stalled network transfer rather than hanging forever',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'iptv-stall-'));
 const fetcher=async (url,{signal}={})=>url.includes('SHA256SUMS')?checksumResponse():new Promise((resolve,reject)=>{
  if(signal?.aborted)return reject(signal.reason);signal?.addEventListener('abort',()=>reject(signal.reason),{once:true});
 });
 const m=make({downloadsDir:dir,downloadIdleMs:40,fetcher});
 try{await m.checkForUpdates();const r=await m.download();assert.equal(r.phase,'error');assert.match(r.message,/lâu không nhận/);assert.deepEqual(await readdir(dir),[]);}finally{await rm(dir,{recursive:true,force:true});}
});
test('4.22.1: full desktop builds and workflow use the correct new release notes',()=>{
 const fs=require('node:fs');const pkg=require('../package.json');assert.equal(pkg.version,'4.22.2');
 assert.equal(pkg.dependencies['ffmpeg-static'],'5.3.0');
 const yaml=fs.readFileSync(path.join(__dirname,'../.github/workflows/release-desktop.yml'),'utf8');
 assert.match(yaml,/RELEASE_NOTES_V4_22_2_VI_EN\.md/);assert.match(yaml,/macos-15-intel/);
 const mac=fs.readFileSync(path.join(__dirname,'../BUILD_MAC.command'),'utf8');assert.match(mac,/-s \"\$DMG\"/);
 const win=fs.readFileSync(path.join(__dirname,'../scripts/BUILD_WINDOWS_AUTO.ps1'),'utf8');assert.match(win,/setupFile/);assert.match(win,/portableFile/);
});
