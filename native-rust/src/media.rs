//! FFmpeg sidecar tasks. Never overwrites Electron files and bounds time spent
//! waiting for snapshots. Video/stream rights remain the user's responsibility.
use crate::model::Channel;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

fn id() -> u128 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos()
}
fn ffmpeg() -> PathBuf {
    if let Some(path) = std::env::var_os("OPEN_IPTV_FFMPEG") { return PathBuf::from(path); }
    PathBuf::from("ffmpeg")
}
pub fn data_dir(sub: &str) -> Result<PathBuf, String> {
    let state = crate::storage::app_data_file()?;
    let path = state.parent().ok_or("Thư mục dữ liệu không hợp lệ")?.join(sub);
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}
pub fn safe_file_name(name: &str) -> String {
    let cleaned: String = name.chars().map(|c| {
        if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' { c } else { '_' }
    }).take(80).collect();
    let trimmed = cleaned.trim().trim_matches(|c| c == '.' || c == '_').trim();
    if trimmed.is_empty() { "channel".into() } else { trimmed.into() }
}
fn snapshot_path(ch: &Channel) -> Result<PathBuf, String> {
    // Stable fingerprint without hashing credentials to disk in plaintext.
    let mut h = 0xcbf29ce484222325u64;
    for b in ch.url.as_bytes() { h ^= *b as u64; h = h.wrapping_mul(0x100000001b3); }
    Ok(data_dir("snapshots")?.join(format!("channel-{h:016x}.jpg")))
}
pub fn snapshot(ch: &Channel) -> Result<(PathBuf, bool), String> {
    let path = snapshot_path(ch)?;
    if let Ok(meta) = fs::metadata(&path) {
        if let Ok(age) = meta.modified().and_then(|t| t.elapsed().map_err(std::io::Error::other)) {
            if age < Duration::from_secs(6 * 3600) && meta.len() > 1000 { return Ok((path, true)); }
        }
    }
    let tmp = path.with_extension(format!("{}.tmp.jpg", id()));
    let mut child = Command::new(ffmpeg())
        .arg("-hide_banner").arg("-loglevel").arg("error")
        .arg("-nostdin").arg("-y")
        .arg("-rw_timeout").arg("8000000")
        .arg("-i").arg(&ch.url)
        .arg("-frames:v").arg("1")
        .arg("-vf").arg("scale=640:-2")
        .arg(&tmp)
        .stdout(Stdio::null()).stderr(Stdio::null())
        .spawn().map_err(|e| format!("Không thể chạy FFmpeg: {e}"))?;
    let started = Instant::now();
    let result = loop {
        match child.try_wait() {
            Ok(Some(status)) => break if status.success() { Ok(()) } else { Err(format!("FFmpeg trả mã lỗi: {status}")) },
            Ok(None) if started.elapsed() <= Duration::from_secs(15) => thread::sleep(Duration::from_millis(90)),
            Ok(None) => { let _ = child.kill(); let _ = child.wait(); break Err("Chụp snapshot vượt 15 giây".into()); }
            Err(e) => { let _ = child.kill(); let _ = child.wait(); break Err(e.to_string()); }
        }
    };
    if let Err(e) = result { let _ = fs::remove_file(&tmp); return Err(e); }
    if fs::metadata(&tmp).map(|m| m.len()).unwrap_or(0) < 1000 {
        let _ = fs::remove_file(&tmp);
        return Err("Không có khung hình hợp lệ".into());
    }
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok((path, false))
}
pub fn start_record_60s(ch: &Channel) -> Result<(Child, PathBuf), String> {
    let folder = data_dir("recordings")?;
    let file = folder.join(format!("{}_{}.mkv", safe_file_name(&ch.name), id()));
    let child = Command::new(ffmpeg())
        .args(["-hide_banner", "-loglevel", "warning", "-nostdin", "-y", "-i"])
        .arg(&ch.url)
        .args(["-t", "60", "-map", "0:v:0?", "-map", "0:a:0?", "-c", "copy"])
        .arg(&file)
        .stdout(Stdio::null()).stderr(Stdio::null())
        .spawn().map_err(|e| format!("Không thể chạy FFmpeg ghi hình: {e}"))?;
    Ok((child, file))
}
pub fn file_is_in_native_data_dir(path: &Path) -> bool {
    // Reserved for future recording management; do not touch arbitrary paths.
    data_dir("recordings").ok().is_some_and(|p| path.starts_with(&p))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn sanitize_filename() {
        assert_eq!(safe_file_name("ABC/News: Live"), "ABC_News_ Live");
        assert_eq!(safe_file_name(".."), "channel");
    }
}
