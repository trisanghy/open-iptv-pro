//! Real, reproducible libmpv decoder + Slint-frame-path smoke check.
 //! Usage: cargo run --bin video_smoke -- /absolute/path/to/synthetic-test.mp4
 //! Unlike unit tests this requires an installed libmpv shared library.
 use open_iptv_pro_native::mpv::{Mpv, VideoBackend, FRAME_HEIGHT, FRAME_WIDTH};
 use std::time::{Duration, Instant};
 
 fn main() -> Result<(), Box<dyn std::error::Error>> {
     let path = std::env::args().nth(1).ok_or("Pass the path to a synthetic test MP4")?;
     let path = std::fs::canonicalize(path)?;
     if !path.is_file() {return Err("Test source must be a file".into());}
     let p = Mpv::new().map_err(|e|format!("libmpv init failed: {e}"))?;
     if p.video_backend() != VideoBackend::EmbeddedSoftware {
         return Err("Embedded SW render context is unavailable; test does not count separate windows".into());
     }
     // The local path is intentionally used only by this harness. User playlists
     // remain validated as remote media URLs by the app's public interface.
     let file = path.to_str().ok_or("Invalid path encoding")?;
     p.execute(&["loadfile",file,"replace"]).map_err(|e|format!("Video load rejected: {e}"))?;
     let started=Instant::now();
     let mut frames=0usize;
     let mut saw_decoded_video=false;
     let mut varying_pixels=false;
     while started.elapsed() < Duration::from_secs(12) {
         if let Some(code)=p.poll_playback_failure() {
             return Err(format!("mpv decoder returned error {code}").into());
         }
         saw_decoded_video |= p.playback_info().is_video_loaded();
         match p.render_embedded_frame()? {
             Some(image) => {
                 frames+=1;
                 if image.len()!=FRAME_WIDTH*FRAME_HEIGHT*4 {
                     return Err("Software video buffer has invalid dimensions".into());
                 }
                 // The ffmpeg synthetic test pattern must have more than a flat
                 // background, proving this is decoded video and not a mock.
                 let colors=image.chunks_exact(4).take(2000)
                     .map(|p|(p[0],p[1],p[2]))
                     .collect::<std::collections::BTreeSet<_>>();
                 varying_pixels|=colors.len()>4;
                 if saw_decoded_video && varying_pixels && frames>=2 { break; }
             }
             None=>{}
         }
         std::thread::sleep(Duration::from_millis(25));
     }
     if !saw_decoded_video || !varying_pixels || frames<2 {
         return Err(format!(
             "No confirmed video frame: decoder={saw_decoded_video}, distinct_pixels={varying_pixels}, frames={frames}; elapsed={:?}",
             started.elapsed()
         ).into());
     }
     println!("PASS: {frames} true libmpv SW frames ({FRAME_WIDTH}x{FRAME_HEIGHT}); video stream decoded");
     Ok(())
 }
