'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {openVerifiedInstaller}=require('../src/update-install-flow.cjs');
test('verified Mac DMG opens before Open IPTV Pro exits',async()=>{
 const order=[];let scheduled=null;
 const result=await openVerifiedInstaller({platform:'darwin',phase:'manual-ready',downloadedPath:'/tmp/verified-4.23.36.dmg',openPath:async()=>{order.push('open');return '';},quit:()=>order.push('quit'),scheduleQuit:fn=>scheduled=fn});
 assert.deepEqual(order,['open']);assert.equal(result.quitScheduled,true);
 scheduled();assert.deepEqual(order,['open','quit']);
});
test('failed DMG launch never quits Open IPTV Pro',async()=>{
 let quit=false;
 await assert.rejects(openVerifiedInstaller({platform:'darwin',phase:'manual-ready',downloadedPath:'/tmp/verified.dmg',openPath:async()=> 'LaunchServices denied',quit:()=>quit=true}),/Không thể mở bộ cài/);
 assert.equal(quit,false);
});
test('download or platform mismatch cannot open a file or quit',async()=>{
 let called=false;
 for(const [platform,phase,filename] of [['darwin','available','/tmp/f.dmg'],['darwin','manual-ready','/tmp/a.exe'],['win32','manual-ready','/tmp/a.dmg']]){
  await assert.rejects(openVerifiedInstaller({platform,phase,downloadedPath:filename,openPath:()=>{called=true;return '';},quit:()=>{called=true;}}));
 }
 assert.equal(called,false);
});
test('Windows manual EXE opens without quitting app',async()=>{
 let quit=false;
 const result=await openVerifiedInstaller({platform:'win32',phase:'manual-ready',downloadedPath:'C:/Downloads/setup.exe',openPath:async()=>'',quit:()=>quit=true});
 assert.equal(result.quitScheduled,false);assert.equal(quit,false);
});
test('manual macOS download asks consent; background download never auto-closes the player',()=>{
 const fs=require('node:fs');const path=require('node:path');
 const js=fs.readFileSync(path.join(__dirname,'../renderer/features.js'),'utf8');
 assert.match(js,/if\(!background&&confirm\(/);
 assert.match(js,/await openDownloadedInstaller\(\)/);
});
