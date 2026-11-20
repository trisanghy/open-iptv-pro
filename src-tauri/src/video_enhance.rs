//! Benchmark FFmpeg synthetic interpolation, without network or user media.
use serde_json::{json,Value};
use std::{process::Stdio,time::Instant};
use tokio::{process::Command,time::{timeout,Duration}};
async fn sample(ffmpeg:&str,fps:u32)->Value{
 let filter=format!("minterpolate=fps={fps}:mi_mode=mci");
 let mut c=match Command::new(ffmpeg).args(["-hide_banner","-nostdin","-loglevel","error","-f","lavfi","-i","testsrc2=size=320x180:rate=30:duration=1.5","-vf",&filter,"-an","-f","null","-"]).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null()).kill_on_drop(true).spawn(){Ok(c)=>c,Err(_)=>return json!({"targetFps":fps,"ok":false})};
 let start=Instant::now();let run=timeout(Duration::from_secs(15),c.wait()).await;let secs=start.elapsed().as_secs_f64();
 match run{Ok(Ok(s)) if s.success()&&secs>0.0=>json!({"targetFps":fps,"ok":true,"processingFps":1.5*fps as f64/secs}),_=>{let _=c.kill().await;json!({"targetFps":fps,"ok":false})}}
}
pub async fn benchmark(ffmpeg:Option<&str>)->Result<Value,String>{
 let f=ffmpeg.ok_or("FFmpeg không sẵn có")?;
 let mut motion=Vec::new();for fps in [60,90,120]{motion.push(sample(f,fps).await);}
 Ok(json!({"kind":"synthetic-motion-only","motion":motion,"aiUpscaleAvailable":false}))
}