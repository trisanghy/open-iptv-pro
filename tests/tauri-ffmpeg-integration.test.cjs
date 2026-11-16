'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const compat=fs.readFileSync(path.join(__dirname,'..','src-tauri','src','compat.rs'),'utf8');
const match=compat.match(/"-vf",\s*"([^"\n]+)"/);
const filter=match?.[1].replace(/\\\\/g,'\\')||'';
let bin='ffmpeg';
try { const supplied=require('ffmpeg-static');if(supplied&&fs.existsSync(supplied))bin=supplied; } catch {}
const available=cp.spawnSync(bin,['-version'],{encoding:'utf8',timeout:3500}).status===0;
test('bundled FFmpeg fallback encoder produces playable HLS on 16:9 sources (odd-height regression)',{skip:!available},()=>{
  assert.ok(filter.includes('force_divisible_by=2'), 'enforce even dimensions for libx264');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-compat-'));
  try{
    const args=['-hide_banner','-nostdin','-loglevel','error','-y',
      '-f','lavfi','-i','testsrc2=size=480x270:rate=24','-t','3',
      '-map','0:v:0','-filter_threads','1','-vf',filter,
      '-c:v','libx264','-threads','2','-preset','ultrafast','-crf','30','-pix_fmt','yuv420p',
      '-force_key_frames','expr:gte(t,n_forced*2)',
      '-f','hls','-hls_time','2','-hls_list_size','8','-hls_delete_threshold','2',
      '-hls_flags','delete_segments+omit_endlist+independent_segments',
      '-hls_segment_filename',path.join(dir,'segment_%06d.ts'),path.join(dir,'live.m3u8')];
    const result=cp.spawnSync(bin,args,{encoding:'utf8',timeout:20000});
    assert.equal(result.status,0,result.stderr?.slice(-900));
    assert.match(fs.readFileSync(path.join(dir,'live.m3u8'),'utf8'),/#EXTINF/);
    const segments=fs.readdirSync(dir).filter(x=>x.endsWith('.ts'));
    assert.ok(segments.length>0);
    assert.ok(fs.statSync(path.join(dir,segments[0])).size>200);
  }finally{fs.rmSync(dir,{force:true,recursive:true});}
});
