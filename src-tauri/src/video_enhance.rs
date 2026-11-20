//! Benchmark FFmpeg synthetic interpolation, without network or user media.
use serde_json::{json,Value};
use std::{process::Stdio,time::Instant};
use tokio::{process::Command,time::{timeout,Duration}};
async fn sample(ffmpeg:&str,fps:u32)->Value{
 let filter=motion_filter(fps);
 let mut c=match Command::new(ffmpeg).args(["-hide_banner","-nostdin","-loglevel","error","-f","lavfi","-i","testsrc2=size=1280x720:rate=30:duration=1.5","-vf",&filter,"-an","-f","null","-"]).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null()).kill_on_drop(true).spawn(){Ok(c)=>c,Err(_)=>return json!({"targetFps":fps,"ok":false})};
 let start=Instant::now();let run=timeout(Duration::from_secs(15),c.wait()).await;let secs=start.elapsed().as_secs_f64();
 match run{Ok(Ok(s)) if s.success()&&secs>0.0=>json!({"targetFps":fps,"ok":true,"processingFps":1.5*fps as f64/secs}),_=>{let _=c.kill().await;json!({"targetFps":fps,"ok":false})}}
}
pub async fn benchmark(ffmpeg:Option<&str>)->Result<Value,String>{
 let f=ffmpeg.ok_or("FFmpeg không sẵn có")?;
 let mut motion=Vec::new();for fps in [60,90,120]{motion.push(sample(f,fps).await);}
 Ok(json!({"kind":"synthetic-motion-only","motion":motion,"aiUpscaleAvailable":false}))
}

/// Only a narrow, allowlisted profile can enter FFmpeg. Untrusted filter graphs
/// or command-line arguments are never accepted from the renderer.
pub fn motion_target(options: &Value) -> Result<u32,String> {
    if options.get("motion") != Some(&Value::Bool(true)) {
        return Err("Bù chuyển động chưa bật".into());
    }
    let fps=options.get("fps").and_then(Value::as_u64)
        .ok_or("Thiếu FPS mục tiêu")?;
    match fps {
        60|90|120 => Ok(fps as u32),
        _ => Err("FPS chỉ hỗ trợ 60, 90 hoặc 120".into())
    }
}
/// Downscale before interpolation to bound CPU/RAM usage; this is real
/// optical-flow motion compensation, not an AI super-resolution filter.
pub fn motion_filter(fps:u32)->String {
    format!("scale=w=min(720\\,iw):h=min(406\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2,minterpolate=fps={fps}:mi_mode=mci:mc_mode=obmc:me_mode=bidir")
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test] fn accepts_only_whitelisted_profiles(){
   for fps in [60,90,120] {
     assert_eq!(motion_target(&json!({"motion":true,"fps":fps})).unwrap(),fps);
   }
   for v in [json!({"fps":60}),json!({"motion":true,"fps":24}),json!({"motion":true,"fps":"120"}),json!({"motion":true,"fps":0})] {
     assert!(motion_target(&v).is_err());
   }
 }
 #[test] fn scaled_before_interpolating(){
   let filter=motion_filter(60);
   assert!(filter.starts_with("scale="));
   assert!(filter.contains("minterpolate=fps=60"));
   assert!(!filter.contains("dnn_processing"));
 }
}
