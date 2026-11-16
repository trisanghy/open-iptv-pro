'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'renderer','vendor');fs.mkdirSync(output,{recursive:true});
const list=[
  ['node_modules/hls.js/dist/hls.min.js','hls.min.js'],
  ['node_modules/dashjs/dist/modern/umd/dash.all.min.js','dash.all.min.js']
];
for(const [source,target] of list){
 const from=path.join(root,source),to=path.join(output,target);
 if(!fs.existsSync(from)){
   console.error(`Missing ${source}: run npm install from project root first.`);process.exitCode=1;continue;
 }
 fs.copyFileSync(from,to);
 console.log(`Bundled ${target} (${Math.round(fs.statSync(to).size/1024)} KiB)`);
}
const ffmpegBinary=process.platform==='win32'?'ffmpeg.exe':'ffmpeg';
const ffmpegTarget=path.join(root,'src-tauri','resources',ffmpegBinary);
try{
 const ffmpegPath=require('ffmpeg-static');
 if(!ffmpegPath||!fs.existsSync(ffmpegPath))throw Error('FFmpeg binary unavailable');
 fs.mkdirSync(path.dirname(ffmpegTarget),{recursive:true});
 fs.copyFileSync(ffmpegPath,ffmpegTarget);
 if(process.platform!=='win32')fs.chmodSync(ffmpegTarget,0o755);
 console.log(`Prepared bundled FFmpeg for ${process.platform}/${process.arch}`);
}catch(e){console.error('Cannot prepare FFmpeg:',e.message);process.exitCode=1;}
