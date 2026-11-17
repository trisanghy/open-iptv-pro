'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createWhisperAutoInstaller,BINARIES}=require('../src/whisper-autoinstall.cjs');
for(const [platform,arch,alias,expected] of [
 ['darwin','arm64','whisper-cpp-darwin-arm64','whisper-cli'],
 ['darwin','x64','whisper-cpp-darwin-x64','whisper-cli'],
 ['win32','x64','whisper-cpp-win32-x64-cpu.exe','whisper-cli.exe']
]){
 test('v4.23.60 recovers already extracted '+platform+' '+arch+' without network',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'whisper-repair-'));
  const folder=path.join(root,'live-caption','auto','binary');
  fs.mkdirSync(folder,{recursive:true});
  const oldFile=path.join(folder,alias);fs.writeFileSync(oldFile,Buffer.alloc(52000,65));
  fs.writeFileSync(path.join(root,'live-caption','auto','ggml-base.bin'),Buffer.alloc(1100000,42));
  let downloads=0;
  try{
   const installer=createWhisperAutoInstaller({dataDir:root,platform,arch,download:async()=>{downloads++;throw Error('Unexpected re-download');}});
   assert.equal(installer.status().installed,false);
   const result=await installer.install();
   assert.equal(result.installed,true);
   assert.equal(path.basename(result.binary),expected);
   assert.equal(fs.existsSync(oldFile),false);
   assert.equal(downloads,0);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
 });
}
test('v4.23.60 pins the correct architecture-specific original ZIP filenames',()=>{
 for(const [key,filename] of [['darwin-arm64','whisper-cpp-darwin-arm64.zip'],['darwin-x64','whisper-cpp-darwin-x64.zip'],['win32-x64','whisper-cpp-win32-x64-cpu.zip']]){
  assert.equal(BINARIES[key][0],filename);assert.equal(BINARIES[key][1].length,64);
 }
});
test('v4.23.60 installer normalizes binary and source version is synchronized',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../src/whisper-autoinstall.cjs'),'utf8');
 assert.match(text,/packagedBinaryName/);
 assert.match(text,/normalizeBinary/);
 assert.match(text,/fs\.renameSync\(source,destination\)/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(__dirname,'../package.json'),'utf8')).version,'4.23.62');
});
