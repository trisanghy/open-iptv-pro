//! Dynamic libmpv client. Never links to libmpv while compiling; the library
//! must be installed separately on the target machine.
//!
//! Stage C1 plays video in mpv's own native window (force-window=yes).
//! Embedding a texture in the Slint window requires mpv_render_context and
//! is deliberately NOT claimed to be implemented in this prototype.
use libloading::Library;
use std::ffi::{c_char, c_int, c_void, CString};
use std::path::PathBuf;

type Create = unsafe extern "C" fn() -> *mut c_void;
type Initialize = unsafe extern "C" fn(*mut c_void) -> c_int;
type OptionString = unsafe extern "C" fn(*mut c_void, *const c_char, *const c_char) -> c_int;
type Command = unsafe extern "C" fn(*mut c_void, *const *const c_char) -> c_int;
type Terminate = unsafe extern "C" fn(*mut c_void);
type WaitEvent = unsafe extern "C" fn(*mut c_void, f64) -> *const MpvEvent;

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

pub struct Mpv {
    _library: Library,
    ctx: *mut c_void,
    command: Command,
    property: OptionString,
    terminate: Terminate,
    wait_event: WaitEvent,
}

impl Mpv {
    pub fn new() -> Result<Self, String> {
        let mut candidates: Vec<PathBuf> = Vec::new();
        if let Ok(custom) = std::env::var("OPEN_IPTV_LIBMPV") {
            let path = PathBuf::from(custom);
            if !path.is_absolute() { return Err("OPEN_IPTV_LIBMPV phải là đường dẫn tuyệt đối".into()); }
            candidates.push(path);
        }
        if let Ok(dir) = std::env::current_exe().and_then(|p| p.canonicalize()) {
            if let Some(parent) = dir.parent() {
                for name in ["mpv-2.dll", "libmpv-2.dll", "libmpv.dylib", "libmpv.2.dylib"] {
                    candidates.push(parent.join(name));
                }
            }
        }
        if cfg!(target_os="macos") {
            for p in ["/opt/homebrew/lib/libmpv.dylib", "/usr/local/lib/libmpv.dylib", "/opt/homebrew/opt/mpv/lib/libmpv.dylib", "/usr/local/opt/mpv/lib/libmpv.dylib"] {
                candidates.push(p.into());
            }
            candidates.push("libmpv.2.dylib".into());
            candidates.push("libmpv.dylib".into());
        } else if cfg!(target_os="windows") {
            candidates.push("mpv-2.dll".into());
            candidates.push("libmpv-2.dll".into());
        } else {
            candidates.push("libmpv.so.2".into());
            candidates.push("libmpv.so".into());
        }
        let mut failures = Vec::new();
        for candidate in candidates {
            // Dynamic loading is explicitly opted-in via installed libmpv.
            let lib = match unsafe { Library::new(&candidate) } {
                Ok(lib) => lib,
                Err(e) => { failures.push(format!("{}: {e}", candidate.display())); continue; }
            };
            return Self::from_library(lib);
        }
        Err(format!("Không tìm thấy libmpv. macOS: brew install mpv; Windows: đặt mpv-2.dll cùng EXE hoặc thiết lập OPEN_IPTV_LIBMPV. Chi tiết: {}", failures.join(" | ")))
    }

    fn from_library(library: Library) -> Result<Self, String> {
        // SAFETY: symbols are loaded from a compatible libmpv with matching C ABI.
        unsafe {
            let create: Create = *library.get(b"mpv_create\0").map_err(|e| e.to_string())?;
            let initialize: Initialize = *library.get(b"mpv_initialize\0").map_err(|e| e.to_string())?;
            let option: OptionString = *library.get(b"mpv_set_option_string\0").map_err(|e| e.to_string())?;
            let command: Command = *library.get(b"mpv_command\0").map_err(|e| e.to_string())?;
            let property: OptionString = *library.get(b"mpv_set_property_string\0").map_err(|e| e.to_string())?;
            let terminate: Terminate = *library.get(b"mpv_terminate_destroy\0").map_err(|e| e.to_string())?;
            let wait_event: WaitEvent = *library.get(b"mpv_wait_event\0").map_err(|e| e.to_string())?;
            let ctx = create();
            if ctx.is_null() { return Err("mpv_create trả về NULL".into()); }
            let set = |name: &str, value: &str| {
                let name = CString::new(name).expect("static mpv name");
                let value = CString::new(value).expect("static mpv value");
                option(ctx, name.as_ptr(), value.as_ptr())
            };
            // Let mpv use its native video output in an independent window.
            // This keeps Slint's renderer separate until render API integration.
            let code = set("force-window", "yes");
            if code < 0 { terminate(ctx); return Err(format!("mpv force-window lỗi: {code}")); }
            let code = initialize(ctx);
            if code < 0 { terminate(ctx); return Err(format!("mpv_initialize lỗi: {code}")); }
            Ok(Self { _library: library, ctx, command, property, terminate, wait_event })
        }
    }

    pub fn execute(&self, args: &[&str]) -> Result<(), String> {
        let mut strings = Vec::new();
        for a in args { strings.push(CString::new(*a).map_err(|_| "Tham số mpv chứa NUL".to_string())?); }
        let mut argv: Vec<*const c_char> = strings.iter().map(|s| s.as_ptr()).collect();
        argv.push(std::ptr::null());
        let code = unsafe { (self.command)(self.ctx, argv.as_ptr()) };
        if code < 0 { Err(format!("mpv command lỗi: {code}")) } else { Ok(()) }
    }

    pub fn play(&self, url: &str) -> Result<(), String> {
        if !crate::m3u::is_media_url(url) { return Err("URL luồng không được hỗ trợ".into()); }
        self.execute(&["loadfile", url, "replace"])
    }
    pub fn toggle_pause(&self) -> Result<(), String> { self.execute(&["cycle", "pause"]) }
    pub fn stop(&self) -> Result<(), String> { self.execute(&["stop"]) }
    pub fn fullscreen(&self) -> Result<(), String> { self.execute(&["cycle", "fullscreen"]) }
    pub fn seek(&self, seconds: i32) -> Result<(), String> {
        self.execute(&["seek", &seconds.to_string(), "relative"])
    }
    /// Non-blocking event polling on the same UI thread that owns the player.
    /// Reports only explicit MPV_END_FILE_REASON_ERROR, not EOF or user stops.
    pub fn poll_playback_failure(&self) -> Option<i32> {
        for _ in 0..64 {
            let event = unsafe { (self.wait_event)(self.ctx, 0.0) };
            if event.is_null() { return None; }
            let event = unsafe { &*event };
            if event.event_id == MPV_EVENT_NONE { return None; }
            if event.event_id == MPV_EVENT_END_FILE && !event.data.is_null() {
                let end = unsafe { &*(event.data as *const MpvEndFileEvent) };
                if end.reason == MPV_END_FILE_REASON_ERROR { return Some(end.error); }
            }
        }
        None
    }

    pub fn set_volume(&self, volume: i32) -> Result<(), String> {
        let name = CString::new("volume").expect("static");
        let level = CString::new(volume.clamp(0, 100).to_string()).expect("number");
        let code = unsafe { (self.property)(self.ctx, name.as_ptr(), level.as_ptr()) };
        if code < 0 { Err(format!("Không chỉnh được volume: {code}")) } else { Ok(()) }
    }
}

impl Drop for Mpv {
    fn drop(&mut self) {
        if !self.ctx.is_null() {
            unsafe { (self.terminate)(self.ctx) };
            self.ctx = std::ptr::null_mut();
        }
    }
}
