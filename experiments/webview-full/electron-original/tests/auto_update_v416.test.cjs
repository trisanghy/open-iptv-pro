'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const {mkdtemp,readFile,rm}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {UpdateManager,identifyInstaller,hasUpdateMetadata,isOfficialAsset,extractSha256}=require('../src/update-manager.cjs');
const base='https://github.com/trisanghy/open-iptv-pro/releases/download/v4.16.1/';
const mac='Open-IPTV-Pro-4.16.1-mac-universal.dmg';
const win='Open-IPTV-Pro-Setup-4.16.1-x64.exe';
const assets=[{name:mac,url:base+mac},{name:win,url:base+win},{name:'latest-mac.yml',url:base+'latest-mac.yml'},{name:'latest.yml',url:base+'latest.yml'}];
const app={isPackaged:true,getVersion:()=> '4.16.0',getPath:()=>tmpdir()};
const result=(extras={})=>({newer:true,latest:'v4.16.1',assets,...extras});
const make=(options={})=>new UpdateManager({app,platform:'darwin',arch:'arm64',check:async()=>result(),signatureCheck:()=>false,downloadsDir:path.join(tmpdir(),'open-iptv-auto-updater-test'),...options});
test('select platform-specific installer and require same-platform manifest',()=>{
 assert.equal(identifyInstaller(assets,'darwin','arm64').name,mac);
 assert.equal(identifyInstaller(assets,'win32','x64').name,win);
 assert.equal(identifyInstaller(assets,'linux','x64'),null);
 assert.equal(hasUpdateMetadata(assets,'darwin'),true);
 assert.equal(hasUpdateMetadata(assets.filter(a=>a.name!=='latest.yml'),'win32'),false);
});
test('trust only official GitHub release download URLs',()=>{
 assert.equal(isOfficialAsset(base+mac),true);
 assert.equal(isOfficialAsset('https://github.com/other/repo/releases/download/v4.16.1/file.exe'),false);
 assert.equal(isOfficialAsset('http://github.com/trisanghy/open-iptv-pro/releases/download/v4/file.exe'),false);
 assert.equal(isOfficialAsset('https://github.com.evil.test/trisanghy/open-iptv-pro/releases/download/v4/file.exe'),false);
});
test('no release and source-only updates are explained instead of crashing',async()=>{
 let u=make({check:async()=>({noRelease:true})});
 assert.equal((await u.checkForUpdates()).phase,'no-release');
 u=make({check:async()=>result({assets:[]})});
 assert.equal((await u.checkForUpdates()).phase,'source-only');
});
test('no newer release reports up-to-date',async()=>{
 const u=make({check:async()=>result({newer:false})});
 assert.equal((await u.checkForUpdates()).phase,'up-to-date');
});
test('unsigned/mac developer build requires manual installer, not silent execution',async()=>{
 const u=make();const state=await u.checkForUpdates();
 assert.equal(state.mode,'manual');assert.equal(state.phase,'available');
 assert.throws(()=>u.install(),/Chưa có/);
});
test('signed packaged build supports intentional download and install with progress',async()=>{
 class MockUpdater extends EventEmitter{
  async checkForUpdates(){return {updateInfo:{version:'4.16.1'}};}
  async downloadUpdate(){this.emit('download-progress',{percent:30,transferred:3,total:10});this.emit('downloaded');this.emit('update-downloaded',{});}
  setFeedURL(feed){this.feed=feed;}
  quitAndInstall(silent,runAfter){this.installed=[silent,runAfter];}
 }
 const mock=new MockUpdater();const u=make({updater:mock,signatureCheck:()=>true});
 assert.equal((await u.checkForUpdates()).mode,'automatic');
 assert.equal((await u.download()).phase,'downloaded');
 assert.equal(u.snapshot().progress,100);
 assert.equal(u.install().phase,'installing');assert.deepEqual(mock.installed,[false,true]);
 assert.equal(mock.feed.repo,'open-iptv-pro');
});
test('manual download checks SHA256 before writing final installer',async()=>{
 const content=Buffer.from('synthetic fake installer for test');
 const sha=createHash('sha256').update(content).digest('hex');
 const dir=await mkdtemp(path.join(tmpdir(),'iptv-update-test-'));
 const mockAssets=[...assets,{name:'SHA256SUMS.txt',url:base+'SHA256SUMS.txt'}];
 const fetcher=async url=>url.endsWith('SHA256SUMS.txt')?new Response(`${sha}  ${mac}\n`):new Response(content,{headers:{'content-length':String(content.length)}});
 const u=make({downloadsDir:dir,check:async()=>result({assets:mockAssets}),fetcher});
 try{
  assert.equal((await u.checkForUpdates()).mode,'manual');
  const status=await u.download();assert.equal(status.phase,'manual-ready');
  assert.deepEqual(await readFile(status.downloadedFile),content);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('manual fallback rejects checksum mismatch and removes partial download',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'iptv-update-bad-'));
 const checks=assets.map(a=>a.name);const u=make({downloadsDir:dir,check:async()=>result({assets:[...assets,{name:'SHA256SUMS.txt',url:base+'SHA256SUMS.txt'}]}),fetcher:async url=>new Response(url.endsWith('SHA256SUMS.txt')?`${'a'.repeat(64)}  ${mac}\n`:'BAD')});
 try{
  await u.checkForUpdates();const state=await u.download();assert.equal(state.phase,'error');assert.match(state.message,/SHA256/);
  const {readdir}=require('node:fs/promises');assert.equal((await readdir(dir)).length,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('checksum parser accepts expected hash and exact file only',()=>{
 const hash='a'.repeat(64);
 assert.equal(extractSha256(`${hash}  ${mac}`,mac),hash);
 assert.equal(extractSha256(`${hash}  ${win}`,mac),null);
});
