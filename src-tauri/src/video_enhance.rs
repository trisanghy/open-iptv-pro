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
