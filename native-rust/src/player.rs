//! The UI talks to one player interface. Isolate native GUI backends in a
//! separate mpv process so Cocoa and Slint never share a blocking event loop.
use crate::mpv::{VideoBackend, PlaybackInfo, Mpv as LibMpv};
use crate::video_worker::WorkerMpv;
#[cfg(unix)] use crate::external_mpv::ExternalMpv;
pub enum Player {
    Library(LibMpv),
    Worker(WorkerMpv),
    #[cfg(unix)]
    Sidecar(ExternalMpv),
}
impl Player {
    pub fn new_with_backend(mode:&str)->Result<Self,String>{
        if !crate::model::valid_video_backend(mode){
            return Err("Đầu ra video không hợp lệ".into());
        }
        if mode=="native" {return Self::new_native_window();}
        Ok(Self::Worker(WorkerMpv::new()))
    }
    pub fn new_native_window()->Result<Self,String>{
        #[cfg(unix)] { ExternalMpv::new().map(Self::Sidecar) }
        #[cfg(not(unix))] {LibMpv::new_native_window().map(Self::Library)}
    }
    pub fn video_backend(&self)->VideoBackend{
        match self{Self::Library(x)=>x.video_backend(),
            Self::Worker(x)=>x.video_backend(),
            #[cfg(unix)] Self::Sidecar(x)=>x.video_backend()}
    }
    pub fn play(&self,url:&str)->Result<(),String>{
        match self{Self::Library(x)=>x.play(url),
            Self::Worker(x)=>x.play(url),
            #[cfg(unix)] Self::Sidecar(x)=>x.play(url)}
    }
    pub fn set_volume(&self,v:i32)->Result<(),String>{
        match self{Self::Library(x)=>x.set_volume(v),
            Self::Worker(x)=>x.set_volume(v),
            #[cfg(unix)] Self::Sidecar(x)=>x.set_volume(v)}
    }
    pub fn set_mute(&self,v:bool)->Result<(),String>{
        match self{Self::Library(x)=>x.set_mute(v),
            Self::Worker(x)=>x.set_mute(v),
            #[cfg(unix)] Self::Sidecar(x)=>x.set_mute(v)}
    }
    pub fn set_aspect_mode(&self,v:&str)->Result<(),String>{
        match self{Self::Library(x)=>x.set_aspect_mode(v),
            Self::Worker(x)=>x.set_aspect_mode(v),
            #[cfg(unix)] Self::Sidecar(x)=>x.set_aspect_mode(v)}
    }
    pub fn toggle_pause(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.toggle_pause(),
            Self::Worker(x)=>x.toggle_pause(),
            #[cfg(unix)] Self::Sidecar(x)=>x.toggle_pause()}
    }
    pub fn stop(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.stop(),
            Self::Worker(x)=>x.stop(),
            #[cfg(unix)] Self::Sidecar(x)=>{x.stop();Ok(())}}
    }
    pub fn seek(&self,v:i32)->Result<(),String>{
        match self{Self::Library(x)=>x.seek(v),
            Self::Worker(x)=>x.seek(v),
            #[cfg(unix)] Self::Sidecar(x)=>x.seek(v)}
    }
    pub fn seek_percent(&self,v:f32)->Result<(),String>{
        match self{Self::Library(x)=>x.seek_percent(v),
            Self::Worker(x)=>x.seek_percent(v),
            #[cfg(unix)] Self::Sidecar(x)=>x.seek_percent(v)}
    }
    pub fn seek_to_live(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.seek_to_live(),
            Self::Worker(x)=>x.seek_to_live(),
            #[cfg(unix)] Self::Sidecar(x)=>x.seek_to_live()}
    }
    pub fn cycle_audio_track(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.cycle_audio_track(),
            Self::Worker(x)=>x.cycle_audio_track(),
            #[cfg(unix)] Self::Sidecar(x)=>x.cycle_audio_track()}
    }
    pub fn cycle_subtitle_track(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.cycle_subtitle_track(),
            Self::Worker(x)=>x.cycle_subtitle_track(),
            #[cfg(unix)] Self::Sidecar(x)=>x.cycle_subtitle_track()}
    }
    pub fn fullscreen(&self)->Result<(),String>{
        match self{Self::Library(x)=>x.fullscreen(),
            Self::Worker(x)=>x.fullscreen(),
            #[cfg(unix)] Self::Sidecar(x)=>x.fullscreen()}
    }
    pub fn playback_info(&self)->PlaybackInfo{
        match self{Self::Library(x)=>x.playback_info(),
            Self::Worker(x)=>x.playback_info(),
            #[cfg(unix)] Self::Sidecar(x)=>x.playback_info()}
    }
    pub fn poll_playback_failure(&self)->Option<i32>{
        match self{Self::Library(x)=>x.poll_playback_failure(),
            Self::Worker(x)=>x.poll_playback_failure(),
            #[cfg(unix)] Self::Sidecar(x)=>x.poll_playback_failure()}
    }
    pub fn render_embedded_frame(&self)->Result<Option<Vec<u8>>,String>{
        match self{Self::Library(x)=>x.render_embedded_frame(),
            Self::Worker(x)=>x.render_embedded_frame(),
            #[cfg(unix)] Self::Sidecar(x)=>x.render_embedded_frame()}
    }
}
