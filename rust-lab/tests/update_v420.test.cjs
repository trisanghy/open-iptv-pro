'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const {mkdtemp,rm,readFile}=require('node:fs/promises');
const {spawnSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {EventEmitter}=require('node:events');
const {UpdateManager}=require('../src/update-manager.cjs');
const {checkUpdate}=require('../src/update-check.cjs');
const base='https://github.com/trisanghy/open-iptv-pro/releases/download/v4.20.1/';
const name='Open-IPTV-Pro-4.20.1-mac-arm64.dmg';
const install={name,url:base+name};
const assets=[install,{name:'SHA256SUMS.txt',url:base+'SHA256SUMS.txt'},{name:'latest-mac.yml',url:base+'latest-mac.yml'}];
const app={getPath:()=>os.tmpdir(),getVersion:()=> '4.20.0',isPackaged:true};
function make(opts={}){return new UpdateManager({app,platform:'darwin',arch:'arm64',check:async()=>({latest:'v4.20.1',newer:true,assets}),signatureCheck:()=>false,...opts});}
test('v4.20: do not offer a download when Release has no SHA256 manifest',async()=>{
 const m=make({check:async()=>({latest:'v4.20.1',newer:true,assets:[install]})});
 const st=await m.checkForUpdates();
 assert.equal(st.phase,'unverified-release');assert.equal(st.mode,null);
 assert.match(st.message,/SHA256SUMS/);
 await assert.rejects(()=>m.download(),/Hãy kiểm tra/);
});
test('v4.20: a failing native updater falls back to SHA256-verified installer',async()=>{
 class BadUpdater extends EventEmitter{
  setFeedURL(){} async checkForUpdates(){throw Error('latest-mac.yml failed');}
 }
 const payload=Buffer.from('fixture DMG bytes');
 const sha=createHash('sha256').update(payload).digest('hex');
 const dir=await mkdtemp(path.join(os.tmpdir(),'open-iptv420-'));
 const m=make({updater:new BadUpdater(),signatureCheck:()=>true,downloadsDir:dir,fetcher:async(url)=>url.includes('SHA256SUMS')?new Response(`${sha}  ${name}\n`):new Response(payload)});
 try{
  assert.equal((await m.checkForUpdates()).mode,'automatic');
  const st=await m.download();
  assert.equal(st.phase,'manual-ready');
  assert.equal(st.mode,'manual');
  assert.deepEqual(await readFile(st.downloadedFile),payload);
  assert.throws(()=>m.install(),/Chưa có/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('v4.20: GitHub API errors are reported clearly',async()=>{
 await assert.rejects(()=>checkUpdate('trisanghy/open-iptv-pro','4.20.0',async()=>{throw Error('simulated timeout');}),/Không kết nối được GitHub/);
});
test('v4.20: assemble one mac updater manifest for two architectures with real SHA512 and SHA256',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'open-iptv-assemble-'));
 const stage=path.join(root,'stage'),out=path.join(root,'release');
 try{
  const write=(dir,name,data)=>{const p=path.join(stage,dir);fs.mkdirSync(p,{recursive:true});fs.writeFileSync(path.join(p,name),data)};
  write('windows-x64','Open-IPTV-Pro-Setup-4.20.0-x64.exe','setup');
  write('windows-x64','Open-IPTV-Pro-4.20.0-x64.exe','portable');
  write('windows-x64','latest.yml','version: 4.20.0\nfiles:\n  - url: Open-IPTV-Pro-Setup-4.20.0-x64.exe\n');
  write('mac-arm64','Open-IPTV-Pro-4.20.0-mac-arm64.zip','ARM zip');
  write('mac-arm64','Open-IPTV-Pro-4.20.0-mac-arm64.dmg','ARM dmg');
  write('mac-x64','Open-IPTV-Pro-4.20.0-mac-x64.zip','Intel zip');
  write('mac-x64','Open-IPTV-Pro-4.20.0-mac-x64.dmg','Intel dmg');
  const result=spawnSync(process.execPath,[path.join(__dirname,'../scripts/assemble-release.cjs'),stage,out],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  const mac=fs.readFileSync(path.join(out,'latest-mac.yml'),'utf8');
  assert.match(mac,/arm64\.zip/);assert.match(mac,/x64\.zip/);
  const sha=createHash('sha512').update('Intel zip').digest('base64');assert.ok(mac.includes(sha));
  const sums=fs.readFileSync(path.join(out,'SHA256SUMS.txt'),'utf8');
  assert.match(sums,/Open-IPTV-Pro-Setup-4\.20\.0-x64\.exe/);
  assert.match(sums,/Open-IPTV-Pro-4\.20\.0-mac-arm64\.dmg/);
 }finally{await rm(root,{recursive:true,force:true});}
});
