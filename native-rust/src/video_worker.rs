//! Non-blocking Slint/libmpv bridge. All native player calls, decoding and
//! software rendering stay on a single dedicated Rust thread. The UI receives
//! only bounded, pre-rendered frames and lightweight telemetry.
use crate::mpv::{Mpv, PlaybackInfo, VideoBackend};
use std::cell::RefCell;
use std::sync::mpsc::{self, Receiver, Sender, SyncSender};
use std::time::{Duration, Instant};

enum Request {
    Play(String), Stop, Pause, Volume(i32), Mute(bool), Aspect(String),
    Seek(i32), SeekPercent(f32), Live, Audio, Subtitle, Quit,
}
pub struct WorkerMpv {
    commands:Sender<Request>,
    frames:Receiver<Vec<u8>>,
    infos:Receiver<PlaybackInfo>,
    errors:Receiver<i32>,
    last_info:RefCell<PlaybackInfo>,
}
impl WorkerMpv {
    pub fn new()->Self {
        let (commands,rx)=mpsc::channel();
        // Never let a blocked UI accumulate gigabytes of decoded video.
        let (frames,frx)=mpsc::sync_channel(2);
        let (infos,irx)=mpsc::sync_channel(2);
        let (errors,erx)=mpsc::sync_channel(8);
        std::thread::Builder::new()
            .name("open-iptv-mpv-video".into())
            .spawn(move||run_decoder(rx,frames,infos,errors))
            .expect("Cannot spawn video decoding thread");
        Self{commands,frames:frx,infos:irx,errors:erx,
            last_info:RefCell::new(PlaybackInfo::default())}
    }
    fn send(&self,request:Request)->Result<(),String> {
        self.commands.send(request).map_err(|_|"Luồng giải mã video đã dừng".into())
    }
    pub fn video_backend(&self)->VideoBackend {VideoBackend::EmbeddedSoftware}
    pub fn play(&self,url:&str)->Result<(),String>{
        if !crate::m3u::is_media_url(url){return Err("URL media không hỗ trợ".into());}
        while self.frames.try_recv().is_ok(){}
        self.send(Request::Play(url.into()))
    }
    pub fn set_volume(&self,v:i32)->Result<(),String>{self.send(Request::Volume(v))}
    pub fn set_mute(&self,v:bool)->Result<(),String>{self.send(Request::Mute(v))}
    pub fn set_aspect_mode(&self,v:&str)->Result<(),String>{
        if !crate::model::valid_aspect_mode(v){return Err("Khung hình không hợp lệ".into());}
        self.send(Request::Aspect(v.into()))
    }
    pub fn toggle_pause(&self)->Result<(),String>{self.send(Request::Pause)}
    pub fn stop(&self)->Result<(),String>{self.send(Request::Stop)}
    pub fn seek(&self,v:i32)->Result<(),String>{self.send(Request::Seek(v))}
    pub fn seek_percent(&self,v:f32)->Result<(),String>{
        if !v.is_finite() || !(0.0..=100.0).contains(&v){return Err("Vị trí tua không hợp lệ".into());}
        self.send(Request::SeekPercent(v))
    }
    pub fn seek_to_live(&self)->Result<(),String>{self.send(Request::Live)}
    pub fn cycle_audio_track(&self)->Result<(),String>{self.send(Request::Audio)}
    pub fn cycle_subtitle_track(&self)->Result<(),String>{self.send(Request::Subtitle)}
    pub fn fullscreen(&self)->Result<(),String>{
        Err("Video nhúng sử dụng toàn màn hình Slint".into())
    }
    pub fn playback_info(&self)->PlaybackInfo{
        while let Ok(info)=self.infos.try_recv() {
            *self.last_info.borrow_mut()=info;
        }
        self.last_info.borrow().clone()
    }
    pub fn poll_playback_failure(&self)->Option<i32>{self.errors.try_recv().ok()}
    pub fn render_embedded_frame(&self)->Result<Option<Vec<u8>>,String>{
        let mut newest=None;
        while let Ok(frame)=self.frames.try_recv() {newest=Some(frame);}
        Ok(newest)
    }
}
impl Drop for WorkerMpv {
    fn drop(&mut self) {
        // Never join/terminate libmpv on Slint's event loop.
        let _=self.commands.send(Request::Quit);
    }
}
fn run_decoder(rx:Receiver<Request>,frames:SyncSender<Vec<u8>>,
    infos:SyncSender<PlaybackInfo>,errors:SyncSender<i32>) {
    let mpv=match Mpv::new_with_backend("embedded") {
        Ok(p) if p.video_backend()==VideoBackend::EmbeddedSoftware=>p,
        Ok(_)=>{
            eprintln!("Rust Native: library cannot create SW render context");
            let _=errors.try_send(-96);
            return;
        }
        Err(e)=>{
            eprintln!("Rust Native: cannot initialize libmpv: {e}");
            let _=errors.try_send(-97);
            return;
        }
    };
    let mut last_info=Instant::now();
    let mut playback_active=false;
    loop {
        // Prioritize control messages so channel changes remain responsive.
        for _ in 0..32 {
            match rx.try_recv() {
                Ok(Request::Quit)=>return,
                Err(mpsc::TryRecvError::Disconnected)=>return,
                Err(mpsc::TryRecvError::Empty)=>break,
                Ok(command)=>{
                    let result=match command {
                        Request::Play(url)=>{
                            let result=mpv.play(&url);
                            playback_active=result.is_ok();
                            result
                        },
                        Request::Stop=>{
                            playback_active=false;
                            mpv.stop()
                        },
                        Request::Pause=>mpv.toggle_pause(),
                        Request::Volume(v)=>mpv.set_volume(v),
                        Request::Mute(v)=>mpv.set_mute(v),
                        Request::Aspect(v)=>mpv.set_aspect_mode(&v),
                        Request::Seek(s)=>mpv.seek(s),
                        Request::SeekPercent(p)=>mpv.seek_percent(p),
                        Request::Live=>mpv.seek_to_live(),
                        Request::Audio=>mpv.cycle_audio_track(),
                        Request::Subtitle=>mpv.cycle_subtitle_track(),
                        Request::Quit=>return,
                    };
                    if let Err(e)=result {
                        eprintln!("Rust Native video command failed: {e}");
                        // Do not report unsupported seeks as playback failures.
                    }
                }
            }
        }
        if playback_active {
            match mpv.render_embedded_frame() {
                Ok(Some(frame))=>{
                    // Stale frame is dropped if UI is behind, rather than
                    // growing an unbounded backlog and making video lag.
                    let _=frames.try_send(frame);
                }
                Ok(None)=>{},
                Err(e)=>{
                    eprintln!("Rust Native render error: {e}");
                    let _=errors.try_send(-98);
                    playback_active=false;
                }
            }
            if let Some(error)=mpv.poll_playback_failure() {
                playback_active=false;
                let _=errors.try_send(error);
            }
        }
        if last_info.elapsed()>=Duration::from_millis(300) {
            last_info=Instant::now();
            let _=infos.try_send(mpv.playback_info());
        }
        // Rendering at most ~24 frames/s; idle CPU remains low.
        std::thread::sleep(Duration::from_millis(42));
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn invalid_urls_are_rejected_before_starting_decoder() {
        // No libmpv required to prove network preflight policy.
        assert!(!crate::m3u::is_media_url("file:///etc/passwd"));
    }
}
