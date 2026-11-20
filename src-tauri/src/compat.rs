//! Optional FFmpeg compatibility renderer for sources WKWebView/WebView2 cannot decode.
//! A single low-resolution H.264/AAC HLS session is allowed at a time, and it is
//! scoped to the running app's loopback listener (not the LAN).
use crate::{stream, AppState, video_enhance};
use serde_json::{json, Value};
use std::{fs, path::PathBuf, sync::Arc, process::Stdio};
use regex::Regex;
use tokio::io::AsyncReadExt;
use tokio::{process::{Child, Command}, time::{sleep, Duration, Instant}};
use uuid::Uuid;

pub struct CompatSession {
    pub id: String,
    pub folder: PathBuf,
    pub child: Child,
    pub stderr_tail: Arc<tokio::sync::Mutex<Vec<u8>>>,
}

pub async fn stop(state: &Arc<AppState>) {
    let old = state.compat.lock().await.take();
    if let Some(mut old) = old {
        let _ = old.child.kill().await;
        let _ = old.child.wait().await;
        let _ = fs::remove_dir_all(&old.folder);
    }
}

// Keep only the last 12 KiB of FFmpeg diagnostics, not an unbounded log file.
// FFmpeg may embed signed IPTV URLs in errors: never expose those URLs to the UI.
async fn diagnosis(tail: &Arc<tokio::sync::Mutex<Vec<u8>>>, status: &std::process::ExitStatus) -> String {
    let bytes = tail.lock().await.clone();
    let raw = String::from_utf8_lossy(&bytes);
    let low = raw.to_ascii_lowercase();
    let reason = if low.contains("403") || low.contains("forbidden") { "Nguồn trả HTTP 403 (bị từ chối truy cập)" }
      else if low.contains("404") { "Nguồn trả HTTP 404 (không tìm thấy)" }
      else if low.contains("401") { "Nguồn yêu cầu xác thực HTTP 401" }
      else if low.contains("invalid data found") { "Dữ liệu video hoặc manifest không hợp lệ" }
      else if low.contains("codec not found") || low.contains("unknown decoder") || low.contains("encoder not found") { "Codec hoặc bộ mã hóa FFmpeg không sẵn có" }
      else if low.contains("connection timed out") || low.contains("timed out") { "Kết nối đến nguồn bị quá thời gian" }
      else if low.contains("server returned") { "Máy chủ nguồn trả về lỗi HTTP" }
      else if low.contains("error opening input") { "Không thể mở nguồn video" }
      else if low.contains("cannot allocate memory") || low.contains("out of memory") { "FFmpeg không đủ bộ nhớ để xử lý video" }
      else { "FFmpeg không xử lý được luồng hoặc nguồn không còn truy cập được" };
    let url_re = Regex::new(r#"(?i)https?://[^\s\"'<>()]+"#).unwrap();
    let last_line = raw.lines().rev().find(|l| !l.trim().is_empty()).unwrap_or("");
    let clean = url_re.replace_all(last_line, "[URL đã ẩn]");
    let clean = clean.chars().filter(|c| !c.is_control()).take(150).collect::<String>();
    if clean.is_empty(){format!("{reason} ({status})")}else{format!("{reason} ({status}); {clean}")}
}

pub fn url(state: &AppState, id: &str, file: &str) -> String {
    format!("http://127.0.0.1:{}/compat?key={}&id={}&file={}",
        state.port, state.secret, id, file)
}

pub async fn start(state: &Arc<AppState>, raw: &str) -> Result<Value, String> {
    start_with_motion(state, raw, None).await
}

/// Reuse the single original-player HLS relay; never create a second player.
pub async fn start_enhanced(state: &Arc<AppState>, raw: &str, options:&Value)->Result<Value,String>{
    let fps=video_enhance::motion_target(options)?;
    start_with_motion(state,raw,Some(fps)).await
}
async fn start_with_motion(state:&Arc<AppState>,raw:&str,motion:Option<u32>)->Result<Value,String>{
    stream::valid_http_url(raw)?;
    let bin = state.ffmpeg.as_ref().ok_or("Thiếu FFmpeg, không thể bật bộ phát tương thích")?;
    stop(state).await;
    let id = Uuid::new_v4().simple().to_string();
    let folder = state.data_dir.join("compat-player").join(&id);
    fs::create_dir_all(&folder).map_err(|e| e.to_string())?;
    let manifest = folder.join("live.m3u8");

    // No shell, no user-supplied flags or filenames. Only HTTP/HTTPS URLs.
    // Requested interpolation is opt-in; this is not an AI super-resolution filter.
    let filter=match motion {
      Some(fps)=>video_enhance::motion_filter(fps),
      None=>"scale=w=min(720\\,iw):h=min(406\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2".into()
    };
    let filter_threads=if motion.is_some(){"2"}else{"1"};
    // Transcoding remains a fallback unless motion is explicitly enabled.
    let mut command = crate::hidden_process::tokio(bin);
    command.args([
        "-hide_banner", "-nostdin", "-loglevel", "error", "-rw_timeout", "12000000",
        "-fflags", "+genpts", "-i", raw,
        "-map", "0:v:0", "-map", "0:a:0?",
        "-filter_threads", filter_threads, "-vf", filter.as_str(),
        "-c:v", "libx264", "-threads", "2", "-preset", "ultrafast", "-crf", "30", "-pix_fmt", "yuv420p",
        "-force_key_frames", "expr:gte(t,n_forced*2)",
        "-c:a", "aac", "-b:a", "96k", "-ac", "2",
        "-f", "hls", "-hls_time", "2", "-hls_list_size", "8",
        "-hls_delete_threshold", "2", "-hls_flags", "delete_segments+omit_endlist+independent_segments",
        "-hls_segment_filename",
    ]);
    command.arg(folder.join("segment_%06d.ts")).arg(&manifest)
        .stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::piped()).kill_on_drop(true);
    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(e) => { let _ = fs::remove_dir_all(&folder); return Err(format!("Không khởi chạy được FFmpeg: {e}")); }
    };
    let stderr_tail = Arc::new(tokio::sync::Mutex::new(Vec::<u8>::new()));
    if let Some(mut stderr) = child.stderr.take() {
        let history = stderr_tail.clone();
        tokio::spawn(async move {
            let mut chunk = [0_u8; 2048];
            loop {
                match stderr.read(&mut chunk).await {
                    Ok(0) | Err(_) => break,
                    Ok(n) => {
                        let mut tail = history.lock().await;
                        tail.extend_from_slice(&chunk[..n]);
                        if tail.len() > 12_288 { let count = tail.len() - 12_288; tail.drain(..count); }
                    }
                }
            }
        });
    }
    *state.compat.lock().await = Some(CompatSession { id: id.clone(), folder: folder.clone(), child, stderr_tail });
    let deadline = Instant::now() + Duration::from_secs(14);
    while Instant::now() < deadline {
        // If another channel has already been selected, do not wait for this session.
        {
            let mut lock = state.compat.lock().await;
            let session = lock.as_mut().ok_or("Bộ phát tương thích đã dừng")?;
            if session.id != id { return Err("Bộ phát tương thích đã chuyển kênh".into()); }
            if let Ok(Some(status)) = session.child.try_wait() {
                let captured=session.stderr_tail.clone();
                drop(lock);
                // Let the asynchronous stderr reader finish draining a just-exited child.
                sleep(Duration::from_millis(80)).await;
                let message=diagnosis(&captured,&status).await;
                stop(state).await;
                return Err(format!("FFmpeg dừng trước khi có video: {message}"));
            }
        }
        if let Ok(manifest_text) = fs::read_to_string(&manifest) {
            if manifest_text.contains("#EXTINF:") {
                let has_segment = fs::read_dir(&folder).ok().is_some_and(|entries| entries.flatten().any(|p| {
                    p.file_name().to_string_lossy().starts_with("segment_") &&
                    p.metadata().is_ok_and(|m| m.len() > 188)
                }));
                if has_segment {
                    let notice=match motion {
                      Some(fps)=>format!("FFmpeg đang bù chuyển động {fps} FPS · tối đa 720p · không phải AI upscaling"),
                      None=>"Đang dùng FFmpeg chuyển mã H.264/AAC để tương thích WebView".to_string()
                    };
                    return Ok(json!({"url":url(state,&id,"live.m3u8"),"mode":"compat-hls","notice":notice,"motionFps":motion,"aiUpscaleActive":false}));
                }
            }
        }
        sleep(Duration::from_millis(250)).await;
    }
    stop(state).await;
    Err("FFmpeg không tạo được phân đoạn video trong 14 giây; kiểm tra nguồn, mạng hoặc codec".into())
}

pub fn allowed_file(name: &str) -> bool {
    name == "live.m3u8" || (name.starts_with("segment_") && name.ends_with(".ts") &&
        name.len() == 17 && name.is_ascii() && name[8..14].bytes().all(|x| x.is_ascii_digit()))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn only_known_compat_names() {
        assert!(allowed_file("live.m3u8"));
        assert!(allowed_file("segment_000123.ts"));
        assert!(!allowed_file("../segment_000123.ts"));
        assert!(!allowed_file("segment_xxxxxx.ts"));
    }
}
