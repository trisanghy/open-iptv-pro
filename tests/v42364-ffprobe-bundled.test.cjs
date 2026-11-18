'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {checkedBinary,resolveBundledFFprobe,pythonAudioEnvironment,unpacked}
 =require('../src/local-audio-toolchain.cjs');
test('v4.23.67 resolves bundled executable via app.asar.unpacked rather than virtual ASAR path',()=>{
 const source=path.join(path.sep,'Applications','Open IPTV Pro.app','Contents','Resources','app.asar','node_modules','@ffprobe-installer','darwin-arm64','ffprobe');
 const expected=unpacked(source);
 assert.ok(expected.includes('app.asar.unpacked'));
 const tried=[];
 const resolved=checkedBinary(source,{exists:p=>p===expected,spawn:(cmd,args,opts)=>{
  tried.push({cmd,args,opts});return {status:0};
 }});
 assert.equal(resolved,expected);
 assert.deepEqual(tried[0].args,['-version']);
 assert.equal(tried[0].opts.shell,false);
});
test('v4.23.67 ffprobe resolver selects bundled binary before Homebrew / PATH',()=>{
 const bundled=path.join(path.sep,'bundle','app.asar','node_modules','darwin-arm64','ffprobe');
 const unpackedBinary=unpacked(bundled);
 const result=resolveBundledFFprobe({
  load:()=>({path:bundled}),exists:p=>p===unpackedBinary,
  spawn:()=>({status:0}),environment:{PATH:'/usr/local/bin'},
  platform:'darwin'
 });
 assert.equal(result,unpackedBinary);
});
test('v4.23.67 Python workers see executable folders, without changing global PATH',()=>{
 const source={PATH:'/usr/bin:/bin',HOME:'/tmp/example'};
 const updated=pythonAudioEnvironment({
  environment:source,ffprobe:'/bundle/ffprobe-bin/ffprobe',ffmpeg:'/bundle/ffmpeg-bin/ffmpeg'
 });
 assert.equal(updated.PATH.split(path.delimiter)[0],'/bundle/ffprobe-bin');
 assert.equal(updated.PATH.split(path.delimiter)[1],'/bundle/ffmpeg-bin');
 assert.equal(updated.FFPROBE_BINARY,'/bundle/ffprobe-bin/ffprobe');
 assert.equal(updated.FFMPEG_BINARY,'/bundle/ffmpeg-bin/ffmpeg');
 assert.equal(source.PATH,'/usr/bin:/bin');
});
test('v4.23.67 speech worker, installer and app bundle connect self-contained ffprobe',()=>{
 const root=path.resolve(__dirname,'..');
 const file=p=>fs.readFileSync(path.join(root,p),'utf8');
 const pkg=require('../package.json');
 assert.equal(pkg.version,'4.23.70');
 assert.equal(pkg.dependencies['@ffprobe-installer/ffprobe'],'2.1.2');
 assert.ok(pkg.build.asarUnpack.some(p=>p.includes('@ffprobe-installer')));
 assert.match(file('src/main.cjs'),/resolveBundledFFprobe/);
 assert.match(file('src/local-tts-service.cjs'),/pythonAudioEnvironment/);
 assert.match(file('src/local-ai-autoinstall.cjs'),/pythonAudioEnvironment/);
 assert.ok(file('renderer/index.html').includes('<title>Open IPTV Pro '+pkg.version+'</title>'));
 assert.ok(file('renderer/index.html').includes('<span class="version">'+pkg.version+'</span>'));
 assert.match(file('build-mac-v42366.sh'),/--dir/);
 assert.match(file('.github/workflows/test-mac-ffprobe-v42364.yml'),/ffprobe/);
});
