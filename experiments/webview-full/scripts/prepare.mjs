import {createRequire} from 'node:module';
import {cpSync,copyFileSync,chmodSync,mkdirSync,statSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import process from 'node:process';
const require=createRequire(import.meta.url);
const triple={"darwin:arm64":"aarch64-apple-darwin","darwin:x64":"x86_64-apple-darwin","win32:x64":"x86_64-pc-windows-msvc"}[`${process.platform}:${process.arch}`];
if(!triple)throw Error(`Chưa hỗ trợ build: ${process.platform}/${process.arch}. Hãy dùng Mac hoặc Windows đúng kiến trúc cần build.`);
const extension=process.platform==='win32'?'.exe':'';
const folder=resolve('src-tauri','binaries');mkdirSync(folder,{recursive:true});
function bundle(name,src){
 if(!src||!existsSync(src)||statSync(src).size<100000)throw Error(`Thiếu ${name}: ${src}`);
 const dest=join(folder,`${name}-${triple}${extension}`);
 copyFileSync(src,dest);if(process.platform!=='win32')chmodSync(dest,0o755);
 const result=execFileSync(dest,[name==='iptv-node'?'--version':'-version'],{timeout:10000,encoding:'utf8'}).split('\n')[0];
 console.log(`✓ ${name}: ${result} (${(statSync(dest).size/1048576).toFixed(1)} MiB)`);
}
const ffmpeg=require('ffmpeg-static');
const ffprobe=require('@w6s/ffprobe-static').path;
bundle('ffmpeg',ffmpeg);bundle('ffprobe',ffprobe);
// Node is kept INSIDE the installer to run the existing Node backend, NOT a user's prerequisite.
const {downloadNodeBinary}=await import('./prepare-node.mjs');
const portableNode=await downloadNodeBinary();
bundle('iptv-node',portableNode);
const license=join(portableNode.replace(/[/\\]node(?:\.exe)?$/,''),'NODE_LICENSE.txt');
if(existsSync(license)){mkdirSync(resolve('third_party'),{recursive:true});copyFileSync(license,resolve('third_party','NODE_LICENSE.txt'));}
let hls=resolve('node_modules','hls.js','dist','hls.min.js');
copyFileSync(hls,resolve('frontend','hls.min.js'));
console.log('✓ hls.js offline, all original renderer code and FFmpeg/FFprobe kept.');
