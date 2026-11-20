//! libmpv playback with a true frame path into Slint.
//! Software render API is used for the portable embedded preview; the native
//! mpv window remains a fallback if an installed libmpv lacks the SW renderer.
//! No HTML/WebView renderer is involved. A future GPU renderer can replace SW.
use libloading::Library;
use std::ffi::{c_char, c_int, c_void, CString};
use std::path::PathBuf;

type Create = unsafe extern "C" fn() -> *mut c_void;
type Initialize = unsafe extern "C" fn(*mut c_void) -> c_int;
type OptionString = unsafe extern "C" fn(*mut c_void, *const c_char, *const c_char) -> c_int;
type Command = unsafe extern "C" fn(*mut c_void, *const *const c_char) -> c_int;
type Terminate = unsafe extern "C" fn(*mut c_void);
type WaitEvent = unsafe extern "C" fn(*mut c_void, f64) -> *const MpvEvent;
type GetProperty = unsafe extern "C" fn(*mut c_void, *const c_char, c_int, *mut c_void) -> c_int;
type RenderCreate = unsafe extern "C" fn(*mut *mut c_void, *mut c_void, *mut RenderParam) -> c_int;
type RenderUpdate = unsafe extern "C" fn(*mut c_void) -> u64;
type RenderFrame = unsafe extern "C" fn(*mut c_void, *mut RenderParam) -> c_int;
type RenderFree = unsafe extern "C" fn(*mut c_void);

#[repr(C)]
struct RenderParam {
    kind: c_int,
    data: *mut c_void,
}
#[repr(C)]
struct MpvEvent {
    event_id: c_int,
    error: c_int,
    reply_userdata: u64,
    data: *mut c_void,
}
#[repr(C)]
struct MpvEndFileEvent {
    reason: c_int,
    error: c_int,
    playlist_entry_id: i64,
    playlist_insert_id: i64,
    playlist_insert_num_entries: c_int,
}
const MPV_EVENT_NONE: c_int = 0;
const MPV_EVENT_END_FILE: c_int = 7;
const MPV_END_FILE_REASON_ERROR: c_int = 4;
const MPV_FORMAT_FLAG: c_int = 3;
const MPV_FORMAT_INT64: c_int = 4;
const MPV_FORMAT_DOUBLE: c_int = 5;
const RENDER_PARAM_API_TYPE: c_int = 1;
const RENDER_PARAM_SW_SIZE: c_int = 17;
const RENDER_PARAM_SW_FORMAT: c_int = 18;
const RENDER_PARAM_SW_STRIDE: c_int = 19;
const RENDER_PARAM_SW_POINTER: c_int = 20;
const RENDER_UPDATE_FRAME: u64 = 1;
pub const FRAME_WIDTH: usize = 640;
pub const FRAME_HEIGHT: usize = 360;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VideoBackend { EmbeddedSoftware, NativeWindow }

#[derive(Debug, Clone, Default)]
pub struct PlaybackInfo {
    pub position_seconds: Option<f64>,
    pub duration_seconds: Option<f64>,
    pub paused: Option<bool>,
    pub video_width: Option<i64>,
    pub idle: Option<bool>,
}

impl PlaybackInfo {
    pub fn is_video_loaded(&self) -> bool {
        self.video_width.is_some_and(|width| width > 0)
    }
}
pub fn clock(seconds: f64) -> String {
    if !seconds.is_finite() || seconds < 0.0 { return "--:--".into(); }
    let n = seconds.min(86400.0 * 100.0).round() as u64;
    if n >= 3600 { format!("{:02}:{:02}:{:02}", n / 3600, (n / 60) % 60, n % 60) }
    else { format!("{:02}:{:02}", n / 60, n % 60) }
}
pub fn progress_percent(info: &PlaybackInfo) -> f32 {
    match (info.position_seconds, info.duration_seconds) {
        (Some(pos), Some(total)) if total.is_finite() && total > 0.0 && pos.is_finite() =>
            ((pos / total).clamp(0.0, 1.0) * 100.0) as f32,
        _ => 0.0,
    }
}

pub struct Mpv {
    _library: Library,
    ctx: *mut c_void,
    command: Command,
    property: OptionString,
    terminate: Terminate,
    wait_event: WaitEvent,
    get_property: GetProperty,
    render_ctx: *mut c_void,
    render_update: Option<RenderUpdate>,
    render_frame: Option<RenderFrame>,
    render_free: Option<RenderFree>,
    backend: VideoBackend,
}

impl Mpv {
    pub fn new() -> Result<Self, String> {
        let wants_native=std::env::var("OPEN_IPTV_VIDEO_BACKEND")
            .is_ok_and(|v| v.eq_ignore_ascii_case("native"));
        Self::new_for_backend(wants_native)
    }
    /// MultiView opens separate native windows until four Slint render targets
    /// are implemented. Never create four invisible software render contexts.
    pub fn new_native_window() -> Result<Self, String> {
        Self::new_for_backend(true)
    }
    pub fn new_with_backend(mode: &str) -> Result<Self, String> {
        if !crate::model::valid_video_backend(mode) {
            return Err("Backend video không hợp lệ".into());
        }
        Self::new_for_backend(mode == "native")
    }
    fn new_for_backend(wants_native: bool) -> Result<Self, String> {
        let mut candidates: Vec<PathBuf> = Vec::new();
        if let Ok(custom) = std::env::var("OPEN_IPTV_LIBMPV") {
            let path = PathBuf::from(custom);
            if !path.is_absolute() { return Err("OPEN_IPTV_LIBMPV phải là đường dẫn tuyệt đối".into()); }
            candidates.push(path);
        }
        if let Ok(exe) = std::env::current_exe().and_then(|p|p.canonicalize()) {
            if let Some(parent) = exe.parent() {
                for name in ["mpv-2.dll", "libmpv-2.dll", "libmpv.dylib", "libmpv.2.dylib", "libmpv.1.dylib"] {
                    candidates.push(parent.join(name));
                }
            }
        }
        if cfg!(target_os = "macos") {
            for dir in ["/opt/homebrew/lib", "/usr/local/lib", "/opt/homebrew/opt/mpv/lib", "/usr/local/opt/mpv/lib"] {
                for name in ["libmpv.dylib", "libmpv.2.dylib", "libmpv.1.dylib"] {
                    candidates.push(PathBuf::from(dir).join(name));
                }
            }
            candidates.extend(["libmpv.2.dylib", "libmpv.1.dylib", "libmpv.dylib"].into_iter().map(PathBuf::from));
        } else if cfg!(target_os = "windows") {
            candidates.push("mpv-2.dll".into());
            candidates.push("libmpv-2.dll".into());
        } else {
            candidates.push("libmpv.so.2".into());
            candidates.push("libmpv.so.1".into());
            candidates.push("libmpv.so".into());
        }
        let mut failures = Vec::new();
        for candidate in candidates {
            let library = match unsafe { Library::new(&candidate) } {
                Ok(lib) => lib,
                Err(e) => { failures.push(format!("{}: {e}", candidate.display())); continue; }
            };
            return Self::from_library(library, wants_native);
        }
        Err(format!("Chưa tìm thấy thư viện libmpv. Mac: brew install mpv; Windows: đặt mpv-2.dll cạnh EXE. Hoặc đặt OPEN_IPTV_LIBMPV tới đường dẫn tuyệt đối. {}", failures.join(" | ")))
    }

    fn from_library(library: Library, wants_native: bool) -> Result<Self, String> {
        // SAFETY: typed symbols use mpv/client.h and mpv/render.h C ABI.
        unsafe {
            let create: Create = *library.get(b"mpv_create\0").map_err(|e|e.to_string())?;
            let initialize: Initialize = *library.get(b"mpv_initialize\0").map_err(|e|e.to_string())?;
            let option: OptionString = *library.get(b"mpv_set_option_string\0").map_err(|e|e.to_string())?;
            let command: Command = *library.get(b"mpv_command\0").map_err(|e|e.to_string())?;
            let property: OptionString = *library.get(b"mpv_set_property_string\0").map_err(|e|e.to_string())?;
            let terminate: Terminate = *library.get(b"mpv_terminate_destroy\0").map_err(|e|e.to_string())?;
            let wait_event: WaitEvent = *library.get(b"mpv_wait_event\0").map_err(|e|e.to_string())?;
            let get_property: GetProperty = *library.get(b"mpv_get_property\0").map_err(|e|e.to_string())?;
            let render_create = library.get::<RenderCreate>(b"mpv_render_context_create\0").ok().map(|s|*s);
            let render_update = library.get::<RenderUpdate>(b"mpv_render_context_update\0").ok().map(|s|*s);
            let render_frame = library.get::<RenderFrame>(b"mpv_render_context_render\0").ok().map(|s|*s);
            let render_free = library.get::<RenderFree>(b"mpv_render_context_free\0").ok().map(|s|*s);
            let ctx = create();
            if ctx.is_null() { return Err("mpv_create trả về NULL".into()); }
            let set = |key: &str, value: &str| {
                option(ctx, CString::new(key).unwrap().as_ptr(), CString::new(value).unwrap().as_ptr())
            };
            let prefer_embed = !wants_native && render_create.is_some()
                && render_update.is_some() && render_frame.is_some() && render_free.is_some();
            let vo = if prefer_embed { "libmpv" } else { "gpu" };
            if set("vo", vo) < 0 || set("force-window", if prefer_embed {"no"} else {"yes"}) < 0 {
                terminate(ctx);
                return Err("Không cấu hình được đầu ra video libmpv".into());
            }
            // Do not enable hwdec here: software render API does not support
            // zero-copy GPU surfaces. GPU embedding requires a separate backend.
            if prefer_embed { let _ = set("hwdec", "no"); }
            if initialize(ctx) < 0 {
                terminate(ctx);
                return Err("mpv_initialize thất bại (kiểm tra thư viện/codec)".into());
            }
            let mut render_ctx: *mut c_void = std::ptr::null_mut();
            let mut backend = VideoBackend::NativeWindow;
            if prefer_embed {
                let mut params = [
                    RenderParam { kind: RENDER_PARAM_API_TYPE, data: c"sw".as_ptr() as *mut c_void },
                    RenderParam { kind: 0, data: std::ptr::null_mut() },
                ];
                let code = render_create.unwrap()(&mut render_ctx, ctx, params.as_mut_ptr());
                if code >= 0 && !render_ctx.is_null() {
                    backend = VideoBackend::EmbeddedSoftware;
                } else {
                    // Fallback must explicitly select a window-capable VO. The
                    // libmpv render-only VO cannot draw without a render context.
                    let name = c"vo";
                    let val = c"gpu";
                    let force = c"force-window";
                    let yes = c"yes";
                    if property(ctx, name.as_ptr(), val.as_ptr()) < 0 ||
                        property(ctx, force.as_ptr(), yes.as_ptr()) < 0 {
                        terminate(ctx);
                        return Err(format!("Không tạo được render context Slint (mpv {code}), chế độ cửa sổ cũng không khởi tạo được"));
                    }
                }
            }
            Ok(Self {
                _library: library, ctx, command, property, terminate, wait_event, get_property,
                render_ctx, render_update, render_frame, render_free, backend,
            })
        }
    }
    pub fn video_backend(&self) -> VideoBackend { self.backend }

    pub fn render_embedded_frame(&self) -> Result<Option<Vec<u8>>, String> {
        if self.backend != VideoBackend::EmbeddedSoftware || self.render_ctx.is_null() {
            return Ok(None);
        }
        let Some(update) = self.render_update else {return Ok(None)};
        let Some(render) = self.render_frame else {return Ok(None)};
        // A new frame is delivered only when libmpv signals an update; avoids
        // continuously copying stale 640×360 images through Slint.
        if unsafe { update(self.render_ctx) } & RENDER_UPDATE_FRAME == 0 {
            return Ok(None);
        }
        let mut size: [c_int; 2] = [FRAME_WIDTH as c_int, FRAME_HEIGHT as c_int];
        let mut stride: usize = FRAME_WIDTH * 4;
        let mut pixels = vec![0_u8; FRAME_WIDTH * FRAME_HEIGHT * 4];
        let mut params = [
            RenderParam {kind:RENDER_PARAM_SW_SIZE, data:size.as_mut_ptr().cast()},
            RenderParam {kind:RENDER_PARAM_SW_FORMAT, data:c"rgb0".as_ptr() as *mut c_void},
            RenderParam {kind:RENDER_PARAM_SW_STRIDE, data:(&mut stride as *mut usize).cast()},
            RenderParam {kind:RENDER_PARAM_SW_POINTER, data:pixels.as_mut_ptr().cast()},
            RenderParam {kind:0, data:std::ptr::null_mut()},
        ];
        let code = unsafe { render(self.render_ctx, params.as_mut_ptr()) };
        if code < 0 {return Err(format!("libmpv không kết xuất được khung hình ({code})"));}
        for alpha in pixels.iter_mut().skip(3).step_by(4) { *alpha = 255; }
        Ok(Some(pixels))
    }

    pub fn execute(&self, args: &[&str]) -> Result<(), String> {
        let strings = args.iter().map(|a| CString::new(*a).map_err(|_|"Tham số mpv chứa NUL".to_string()))
            .collect::<Result<Vec<_>, _>>()?;
        let mut argv: Vec<*const c_char> = strings.iter().map(|a|a.as_ptr()).collect();
        argv.push(std::ptr::null());
        let code = unsafe { (self.command)(self.ctx, argv.as_ptr()) };
        if code < 0 {Err(format!("mpv command lỗi: {code}"))} else {Ok(())}
    }
    pub fn play(&self, url: &str) -> Result<(), String> {
        if !crate::m3u::is_media_url(url) {return Err("URL luồng không được hỗ trợ".into());}
        self.execute(&["loadfile",url,"replace"])
    }
    pub fn toggle_pause(&self) -> Result<(), String> {self.execute(&["cycle","pause"])}
    pub fn stop(&self) -> Result<(), String> {self.execute(&["stop"])}
    pub fn set_mute(&self, muted:bool) -> Result<(), String> {
        self.execute(&["set","mute", if muted {"yes"}else{"no"}])
    }
    pub fn set_volume(&self, volume:i32) -> Result<(), String> {
        let name = c"volume";
        let value = CString::new(volume.clamp(0,100).to_string()).unwrap();
        let code = unsafe { (self.property)(self.ctx, name.as_ptr(), value.as_ptr()) };
        if code < 0 {Err(format!("Không chỉnh được volume ({code})"))}else{Ok(())}
    }
    pub fn set_aspect_mode(&self, mode: &str) -> Result<(), String> {
        if !crate::model::valid_aspect_mode(mode) {return Err("Khung hình không hợp lệ".into());}
        match mode {
            "fit"=>{self.execute(&["set","video-unscaled","no"])?;self.execute(&["set","panscan","0"])}
            "fill"=>{self.execute(&["set","video-unscaled","no"])?;self.execute(&["set","panscan","1.0"])}
            "original"=>{self.execute(&["set","panscan","0"])?;self.execute(&["set","video-unscaled","yes"])}
            _=>Err("Khung hình không hợp lệ".into()),
        }
    }
    pub fn seek(&self, seconds:i32) -> Result<(),String> {
        self.execute(&["seek",&seconds.to_string(),"relative"])
    }
    pub fn seek_percent(&self, value:f32) -> Result<(),String> {
        if !value.is_finite() || !(0.0..=100.0).contains(&value) {
            return Err("Vị trí tua không hợp lệ".into());
        }
        self.execute(&["seek",&format!("{value:.2}"),"absolute-percent"])
    }
    pub fn cycle_audio_track(&self) -> Result<(),String> {
        self.execute(&["cycle","aid"])
    }
    pub fn cycle_subtitle_track(&self) -> Result<(),String> {
        self.execute(&["cycle","sid"])
    }
    pub fn seek_to_live(&self) -> Result<(),String> {
        // A bounded HLS timeshift/DVR implementation is separate. For seekable
        // streams mpv jumps to the latest position; unseekable streams report error.
        self.execute(&["seek","100","absolute-percent"])
    }
    pub fn fullscreen(&self) -> Result<(),String> {
        if self.backend == VideoBackend::NativeWindow {self.execute(&["cycle","fullscreen"])}
        else {Err("Video nhúng: đổi fullscreen bằng cửa sổ Slint".into())}
    }
    fn get_f64(&self, key:&str)->Option<f64>{
        let name=CString::new(key).ok()?;
        let mut v=0f64;
        let code=unsafe{(self.get_property)(self.ctx,name.as_ptr(),MPV_FORMAT_DOUBLE,(&mut v as *mut f64).cast())};
        if code >= 0 && v.is_finite() {Some(v)}else{None}
    }
    fn get_i64(&self,key:&str)->Option<i64>{
        let name=CString::new(key).ok()?;
        let mut v=0_i64;
        let code=unsafe{(self.get_property)(self.ctx,name.as_ptr(),MPV_FORMAT_INT64,(&mut v as *mut i64).cast())};
        if code>=0 {Some(v)}else{None}
    }
    fn get_flag(&self,key:&str)->Option<bool>{
        let name=CString::new(key).ok()?;
        let mut v=0_i32;
        let code=unsafe{(self.get_property)(self.ctx,name.as_ptr(),MPV_FORMAT_FLAG,(&mut v as *mut i32).cast())};
        if code>=0 {Some(v!=0)}else{None}
    }
    pub fn playback_info(&self)->PlaybackInfo {
        PlaybackInfo {
            position_seconds:self.get_f64("time-pos"),
            duration_seconds:self.get_f64("duration"),
            paused:self.get_flag("pause"),
            video_width:self.get_i64("video-params/w"),
            idle:self.get_flag("idle-active"),
        }
    }
    pub fn poll_playback_failure(&self)->Option<i32> {
        for _ in 0..64 {
            let event=unsafe{(self.wait_event)(self.ctx,0.0)};
            if event.is_null(){return None;}
            let event=unsafe{&*event};
            if event.event_id==MPV_EVENT_NONE{return None;}
            if event.event_id==MPV_EVENT_END_FILE && !event.data.is_null(){
                let end=unsafe{&*(event.data as *const MpvEndFileEvent)};
                if end.reason==MPV_END_FILE_REASON_ERROR {return Some(end.error);}
            }
        }
        None
    }
}
impl Drop for Mpv {
    fn drop(&mut self) {
        if !self.render_ctx.is_null() {
            if let Some(free) = self.render_free {
                unsafe{free(self.render_ctx)};
            }
            self.render_ctx=std::ptr::null_mut();
        }
        if !self.ctx.is_null() {
            unsafe{(self.terminate)(self.ctx)};
            self.ctx=std::ptr::null_mut();
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn clock_display_bounded_and_safe() {
        assert_eq!(clock(f64::NAN),"--:--");
        assert_eq!(clock(-3.0),"--:--");
        assert_eq!(clock(61.0),"01:01");
        assert_eq!(clock(3661.0),"01:01:01");
    }
    #[test]
    fn progress_display_does_not_fake_live_percentages() {
        assert_eq!(progress_percent(&PlaybackInfo::default()),0.0);
        assert_eq!(progress_percent(&PlaybackInfo{position_seconds:Some(20.0), duration_seconds:Some(40.0),..Default::default()}),50.0);
        assert_eq!(progress_percent(&PlaybackInfo{position_seconds:Some(30.0), duration_seconds:Some(0.0),..Default::default()}),0.0);
    }
}
