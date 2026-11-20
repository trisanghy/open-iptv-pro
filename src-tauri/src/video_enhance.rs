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
    format!("scale=w=min(1280\\,iw):h=min(720\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2,minterpolate=fps={fps}:mi_mode=mci:mc_mode=obmc:me_mode=bidir")
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


/// Query the actual macOS 26 VideoToolbox ML processor class and its reported
/// hardware support without requiring an SDK-26 build-time dependency.
/// This is a hardware *probe*, NOT evidence that Rust Lab has a live
/// super-resolution processing pipeline.
#[cfg(target_os="macos")]
fn apple_low_latency_sr_available()->bool{
    use std::{ffi::{c_char,c_void},ptr};
    #[link(name="objc")]
    extern "C" {
        fn objc_getClass(name:*const c_char)->*mut c_void;
        fn sel_registerName(name:*const c_char)->*mut c_void;
        fn objc_msgSend();
    }
    extern "C" {
        fn dlopen(path:*const c_char, flags:i32)->*mut c_void;
        fn dlclose(handle:*mut c_void)->i32;
    }
    unsafe {
        const FRAMEWORK:&[u8]=b"/System/Library/Frameworks/VideoToolbox.framework/VideoToolbox\0";
        const CLASS:&[u8]=b"VTLowLatencySuperResolutionScalerConfiguration\0";
        const SELECTOR:&[u8]=b"isSupported\0";
        let library=dlopen(FRAMEWORK.as_ptr().cast(),2);
        if library.is_null(){return false;}
        let cls=objc_getClass(CLASS.as_ptr().cast());
        let selector=sel_registerName(SELECTOR.as_ptr().cast());
        let supported=if cls==ptr::null_mut()||selector==ptr::null_mut(){false}else{
            let send:unsafe extern "C" fn(*mut c_void,*mut c_void)->bool=
                std::mem::transmute(objc_msgSend as *const ());
            send(cls,selector)
        };
        let _=dlclose(library);
        supported
    }
}
#[cfg(not(target_os="macos"))]
fn apple_low_latency_sr_available()->bool{false}

/// Distinguish hardware support from an actually connected renderer. Never
/// suggest that any chosen 1080p/2K/4K setting runs AI until inference has
/// been integrated, benchmarked and enabled on that precise device.
pub fn ai_capabilities()->Value{
    let native=apple_low_latency_sr_available();
    json!({
      "platform":std::env::consts::OS,
      "architecture":std::env::consts::ARCH,
      "nativeProcessor":"VideoToolbox VTLowLatencySuperResolutionScaler",
      "nativeAvailable":native,
      "livePipelineImplemented":false,
      "aiBenchmarkAvailable":false,
      "reason":if native {
        "VideoToolbox báo hỗ trợ bộ xử lý ML, nhưng Rust Lab chưa kết nối khung hình để suy luận trực tiếp"
      } else {
        "Chưa có bộ xử lý AI được xác minh trên thiết bị này; giữ video nguyên bản"
      }
    })
}
#[cfg(test)]
mod capability_tests {
 use super::*;
 #[test]
 fn capability_never_claims_running_inference(){
   let c=ai_capabilities();
   assert_eq!(c["livePipelineImplemented"],false);
   assert_eq!(c["aiBenchmarkAvailable"],false);
 }
 #[test]
 fn motion_filter_keeps_inference_out_of_ffmpeg_fallback(){
   assert!(!motion_filter(60).contains("dnn_processing"));
 }
}


// GPU H.264 hardware-encoder benchmark. This is not AI super-resolution or GPU motion.
fn gpu_encoder_names()->&'static [&'static str]{
 if cfg!(target_os="macos"){&["h264_videotoolbox"]}
 else if cfg!(target_os="windows"){&["h264_nvenc","h264_amf","h264_qsv","h264_mf"]}
 else {&[]}
}
pub async fn gpu_prepare(ffmpeg:Option<&str>)->Value{
 let names=gpu_encoder_names();
 let Some(bin)=ffmpeg else{
  return json!({"platform":std::env::consts::OS,"ready":false,"backends":[],"liveAiUpscale":false,
   "modelReady":false,"message":"Thiếu FFmpeg đi kèm bản cài đặt; cần cập nhật bản đầy đủ"});
 };
 let mut probe=Command::new(bin);
 probe.args(["-hide_banner","-encoders"]).stdin(Stdio::null()).kill_on_drop(true);
 let text=match timeout(Duration::from_secs(5),probe.output()).await{
  Ok(Ok(out)) if out.status.success()=>String::from_utf8_lossy(&out.stdout).into_owned(),
  _=>String::new()
 };
 let list:Vec<&str>=names.iter().copied()
  .filter(|name|text.split_whitespace().any(|word|word==*name)).collect();
 json!({"platform":std::env::consts::OS,"architecture":std::env::consts::ARCH,
  "ready":true,"backends":list,"automaticInstaller":"FFmpeg bundled with application",
  "modelReady":false,"liveAiUpscale":false,
  "message":"FFmpeg tích hợp; GPU encoder và GPU AI phải được xác minh riêng"})
}
async fn sample_gpu(ffmpeg:&str,encoder:&str,width:u32,height:u32,rate:u32,frames:u32)->Value{
 let source=format!("testsrc2=size={}x{}:rate={}:duration={}",width,height,rate,frames as f64/rate as f64);
 let count=frames.to_string();
 let mut child=match Command::new(ffmpeg).args([
  "-hide_banner","-nostdin","-loglevel","error","-f","lavfi","-i",source.as_str(),
  "-an","-sn","-c:v",encoder,"-b:v","2500k","-frames:v",count.as_str(),
  "-f","null","-"
 ]).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null())
 .kill_on_drop(true).spawn(){
  Ok(v)=>v,
  Err(e)=>return json!({"ok":false,"processingFps":0,"reason":e.to_string()})
 };
 let start=Instant::now();
 let result=timeout(Duration::from_secs(12),child.wait()).await;
 let good=matches!(result,Ok(Ok(ref status)) if status.success());
 if !good{let _=child.kill().await;}
 json!({"ok":good,"processingFps":if good {frames as f64/start.elapsed().as_secs_f64().max(0.01)}else{0.0}})
}
pub async fn gpu_benchmark(ffmpeg:Option<&str>)->Result<Value,String>{
 let info=gpu_prepare(ffmpeg).await;
 let options=info["backends"].as_array().ok_or("GPU backend list invalid")?;
 let Some(bin)=ffmpeg else{return Ok(json!({"kind":"gpu-h264-encode-only","available":false,"encoder":null,
  "tests":{},"aiUpscaleAvailable":false,"aiMotionAvailable":false}));};
 for name in options.iter().filter_map(Value::as_str){
  let p720=sample_gpu(bin,name,1280,720,60,90).await;
  if p720["ok"]!=true{continue;}
  let p1080=sample_gpu(bin,name,1920,1080,30,45).await;
  return Ok(json!({"kind":"gpu-h264-encode-only","available":true,"encoder":name,
   "tests":{"p720":p720,"p1080":p1080},
   "aiUpscaleAvailable":false,"aiMotionAvailable":false}));
 }
 Ok(json!({"kind":"gpu-h264-encode-only","available":false,"encoder":null,
  "tests":{},"aiUpscaleAvailable":false,"aiMotionAvailable":false}))
}
const GPU_OWNED:[(&str,&str);3]=[
 ("cache","Bộ đệm xử lý video"),("models","Mô hình video đã tải"),("runtime","Thư viện video riêng")
];
fn gpu_managed(data:&std::path::Path,id:&str)->Result<std::path::PathBuf,String>{
 if !GPU_OWNED.iter().any(|(key,_)|*key==id){return Err("Không được xóa ngoài kho video GPU".into());}
 let root=data.join("video-gpu-assets");
 let dest=root.join(id);
 for p in [data,&root,&dest]{
  match std::fs::symlink_metadata(p){
   Ok(meta) if meta.file_type().is_symlink()=>return Err("Không thao tác trên symlink".into()),
   Err(e) if e.kind()==std::io::ErrorKind::NotFound=>{},
   Err(e)=>return Err(e.to_string()),
   _=>{}
  }
 }
 Ok(dest)
}
fn gpu_bytes(p:&std::path::Path,count:&mut usize)->Result<u64,String>{
 *count+=1;
 if *count>25000{return Err("Kho video có quá nhiều file".into());}
 let meta=match std::fs::symlink_metadata(p){
  Ok(m)=>m,Err(e) if e.kind()==std::io::ErrorKind::NotFound=>return Ok(0),
  Err(e)=>return Err(e.to_string())
 };
 if meta.file_type().is_symlink(){return Ok(0);}
 if meta.is_file(){return Ok(meta.len());}
 let mut total=0u64;
 if meta.is_dir(){
  for entry in std::fs::read_dir(p).map_err(|e|e.to_string())?{
   let entry=entry.map_err(|e|e.to_string())?;
   total=total.saturating_add(gpu_bytes(&entry.path(),count)?);
  }
 }
 Ok(total)
}
pub fn gpu_storage(data:&std::path::Path)->Result<Value,String>{
 let mut items=Vec::new();let mut total=0u64;
 for (id,label) in GPU_OWNED{
  let p=gpu_managed(data,id)?;
  let bytes=gpu_bytes(&p,&mut 0usize)?;
  total=total.saturating_add(bytes);
  items.push(json!({"id":id,"label":label,"bytes":bytes}));
 }
 Ok(json!({"totalBytes":total,"items":items}))
}
pub fn gpu_delete(data:&std::path::Path,id:&str)->Result<Value,String>{
 let p=gpu_managed(data,id)?;
 if p.exists(){std::fs::remove_dir_all(&p).map_err(|e|e.to_string())?;}
 gpu_storage(data)
}
#[cfg(test)]
mod gpu_backend_tests{
 use super::*;
 #[test] fn gpu_model_inference_is_never_faked(){
  assert!(!motion_filter(60).contains("dnn_processing"));
  assert!(gpu_encoder_names().iter().all(|name|name.starts_with("h264_")));
 }
 #[test] fn deletion_cannot_escape_owned_directories(){
  let root=std::env::temp_dir().join(format!("openiptv-gpu-test-{}",std::process::id()));
  let _=std::fs::create_dir_all(&root);
  let forbidden=gpu_delete(&root,"../user-settings.json");
  assert!(forbidden.is_err());
  let _=std::fs::remove_dir_all(&root);
 }
}
