'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=path.resolve(__dirname,'../src-tauri/src');
function rustFiles(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
   const f=path.join(dir,x.name);
   return x.isDirectory()?rustFiles(f):x.isFile()&&x.name.endsWith('.rs')?[f]:[];
 });
}
const files=rustFiles(src);
const read=name=>fs.readFileSync(path.join(src,name),'utf8');
test('all Rust Lab child processes on Windows use CREATE_NO_WINDOW',()=>{
 const helper=read('hidden_process.rs');
 assert.match(helper,/const CREATE_NO_WINDOW:u32\s*=\s*0x0800_0000/);
 assert.match(helper,/pub fn tokio</);
 assert.match(helper,/pub fn standard</);
 assert.match(helper,/\#\[cfg\(windows\)\][\s\S]*?command\.creation_flags\(CREATE_NO_WINDOW\)/);
 assert.match(helper,/std::os::windows::process::CommandExt/);
 for(const f of files.filter(f=>!f.endsWith('hidden_process.rs'))){
   const body=fs.readFileSync(f,'utf8');
   assert.doesNotMatch(body,/(?:std::process::|tokio::process::)?\bCommand::new\s*\(/,
     'Direct process launch could flash CMD or PowerShell: '+path.relative(src,f));
 }
});
test('no direct shell invocation or visible console from bundled AI, FFmpeg or recording',()=>{
 const required={
  'local_ai.rs':10,'local_ai/mlx_ai.rs':3,'recordings.rs':2,'video_enhance.rs':3,
  'compat.rs':1,'bridge.rs':2,'lib.rs':1
 };
 for(const [name,count] of Object.entries(required)){
   const content=read(name);
   const actual=(content.match(/crate::hidden_process::(?:tokio|standard)\(/g)||[]).length;
   assert.equal(actual,count,'Expected every child spawn wrapped in '+name);
 }
 const local=read('local_ai.rs');
 assert.match(local,/output_timeout\(&mut proc,limit\)\.await/);
 assert.match(local,/stderr/);
 assert.match(local,/whisper-cli/);
 assert.match(read('lib.rs'),/mod hidden_process;/);
});
