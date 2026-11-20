//! Out-of-process native mpv player.
//! Creating an mpv Cocoa/Win32 video window inside Slint's process may deadlock
//! the winit event loop. Keep OS video windows and their event loops isolated.
#![cfg(unix)]
use std::cell::{Cell, RefCell};
use std::io::Write;
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::mpv::{PlaybackInfo, VideoBackend};

pub struct ExternalMpv {
    binary: PathBuf,
    socket: PathBuf,
    child: RefCell<Option<Child>>,
    volume: Cell<i32>,
    muted: Cell<bool>,
    aspect: RefCell<String>,
}
impl ExternalMpv {
    pub fn new() -> Result<Self, String> {
        let binary=resolve_binary().ok_or(
            "Không tìm thấy mpv độc lập. Cài 'brew install mpv' rồi khởi động lại."
        )?;
        let nanos=SystemTime::now().duration_since(UNIX_EPOCH)
            .unwrap_or_default().as_nanos();
        let socket=std::env::temp_dir().join(
            format!("oip-{}-{:x}.sock",std::process::id(),nanos)
        );
        if socket.to_string_lossy().len()>95 {
            return Err("Đường dẫn IPC mpv quá dài".into());
        }
        Ok(Self {binary,socket,child:RefCell::new(None),volume:Cell::new(80),
            muted:Cell::new(false),aspect:RefCell::new("fit".into())})
    }
    pub fn video_backend(&self)->VideoBackend {VideoBackend::NativeWindow}
    pub fn render_embedded_frame(&self)->Result<Option<Vec<u8>>,String>{Ok(None)}
    pub fn playback_info(&self)->PlaybackInfo {
        PlaybackInfo {idle:Some(self.child.borrow().is_none()),..Default::default()}
    }
    pub fn play(&self,url:&str)->Result<(),String>{
        if !crate::m3u::is_media_url(url) {return Err("URL luồng không hợp lệ".into());}
        self.stop();
        let _=std::fs::remove_file(&self.socket);
        let mut cmd=Command::new(&self.binary);
        cmd.arg("--no-config")
            .arg("--no-terminal")
            .arg("--force-window=immediate")
            .arg("--vo=gpu")
            .arg("--hwdec=auto-safe")
            .arg("--osc=yes")
            .arg("--idle=no")
            .arg("--cache=yes")
            .arg("--demuxer-readahead-secs=3")
            .arg("--demuxer-max-bytes=32MiB")
            .arg(format!("--input-ipc-server={}",self.socket.display()))
            .arg(format!("--volume={}",self.volume.get()))
            .arg(format!("--mute={}",if self.muted.get(){"yes"}else{"no"}))
            .arg("--")
            .arg(url)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        let child=cmd.spawn().map_err(|e|format!(
            "Không mở được mpv độc lập {}: {e}",self.binary.display()))?;
        *self.child.borrow_mut()=Some(child);
        Ok(())
    }
    pub fn execute(&self,args:&[&str])->Result<(),String>{
        if self.child.borrow().is_none(){return Err("Cửa sổ mpv chưa phát kênh".into());}
        let mut stream=UnixStream::connect(&self.socket).map_err(|e|
            format!("mpv đang khởi tạo hoặc chưa sẵn sàng điều khiển: {e}"))?;
        let payload=serde_json::json!({"command":args});
        stream.write_all(payload.to_string().as_bytes()).map_err(|e|e.to_string())?;
        stream.write_all(b"\n").map_err(|e|e.to_string())
    }
    pub fn stop(&self) {
        if let Some(mut child)=self.child.borrow_mut().take() {
            // Never wait on an OS video window while Slint handles input.
            std::thread::spawn(move||{let _=child.kill();let _=child.wait();});
        }
        let _=std::fs::remove_file(&self.socket);
    }
    pub fn poll_playback_failure(&self)->Option<i32>{
        let mut proc=self.child.borrow_mut();
        let child=proc.as_mut()?;
        match child.try_wait() {
            Ok(Some(result))=>{
                let code=result.code();
                *proc=None;
                code.filter(|code|*code!=0)
            }
            Ok(None)=>None,
            Err(_)=>Some(-1),
        }
    }
    pub fn set_volume(&self,volume:i32)->Result<(),String>{
        self.volume.set(volume.clamp(0,100));
        if self.child.borrow().is_some(){
            self.execute(&["set","volume",&self.volume.get().to_string()])?;
        }
        Ok(())
    }
    pub fn set_mute(&self,muted:bool)->Result<(),String>{
        self.muted.set(muted);
        if self.child.borrow().is_some() {
            self.execute(&["set","mute",if muted{"yes"}else{"no"}])?;
        }
        Ok(())
    }
    pub fn set_aspect_mode(&self,mode:&str)->Result<(),String>{
        if !crate::model::valid_aspect_mode(mode) {return Err("Khung hình không hợp lệ".into());}
        *self.aspect.borrow_mut()=mode.into();
        if self.child.borrow().is_some(){
            match mode {
                "fit"=>{self.execute(&["set","video-unscaled","no"])?;
                    self.execute(&["set","panscan","0"])?;}
                "fill"=>{self.execute(&["set","video-unscaled","no"])?;
                    self.execute(&["set","panscan","1"])?;}
                "original"=>{self.execute(&["set","panscan","0"])?;
                    self.execute(&["set","video-unscaled","yes"])?;}
                _=>{}
            }
        }
        Ok(())
    }
    pub fn toggle_pause(&self)->Result<(),String>{self.execute(&["cycle","pause"])}
    pub fn seek(&self,seconds:i32)->Result<(),String>{
        self.execute(&["seek",&seconds.to_string(),"relative"])
    }
    pub fn seek_percent(&self,percent:f32)->Result<(),String>{
        if !percent.is_finite() || !(0.0..=100.0).contains(&percent) {
            return Err("Vị trí tua không hợp lệ".into());
        }
        self.execute(&["seek",&format!("{percent:.2}"),"absolute-percent"])
    }
    pub fn seek_to_live(&self)->Result<(),String>{
        self.execute(&["seek","100","absolute-percent"])
    }
    pub fn cycle_audio_track(&self)->Result<(),String>{self.execute(&["cycle","aid"])}
    pub fn cycle_subtitle_track(&self)->Result<(),String>{self.execute(&["cycle","sid"])}
    pub fn fullscreen(&self)->Result<(),String>{self.execute(&["cycle","fullscreen"])}
}
impl Drop for ExternalMpv {
    fn drop(&mut self) {self.stop();}
}
fn resolve_binary()->Option<PathBuf>{
    if let Ok(value)=std::env::var("OPEN_IPTV_MPV_EXECUTABLE") {
        let path=PathBuf::from(value);
        if path.is_absolute() && path.is_file(){return Some(path);}
    }
    for p in ["/opt/homebrew/bin/mpv","/usr/local/bin/mpv","/usr/bin/mpv"] {
        let path=Path::new(p);
        if path.is_file(){return Some(path.to_path_buf());}
    }
    for dir in std::env::split_paths(&std::env::var_os("PATH")?) {
        let path=dir.join("mpv");
        if path.is_file(){return Some(path);}
    }
    None
}
#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn no_process_does_not_spawn_by_polling_or_commands() {
        // No binary required to validate deterministic command failures.
        let p=ExternalMpv{
            binary:"/nonexistent/mpv".into(),socket:std::env::temp_dir().join("no-mpv-test.sock"),
            child:RefCell::new(None),volume:Cell::new(80),muted:Cell::new(false),
            aspect:RefCell::new("fit".into())};
        assert_eq!(p.poll_playback_failure(),None);
        assert!(p.toggle_pause().is_err());
        assert!(p.set_volume(45).is_ok());
        assert_eq!(p.volume.get(),45);
    }
}
