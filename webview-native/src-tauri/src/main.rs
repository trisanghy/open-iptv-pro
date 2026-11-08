#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_shell::ShellExt;
use url::Url;

fn check_http_url(raw: &str) -> Result<(), String> {
    let value = Url::parse(raw).map_err(|e| e.to_string())?;
    if !matches!(value.scheme(), "http" | "https") || value.host_str().is_none() {
        return Err("Chỉ chấp nhận URL HTTP/HTTPS".into());
    }
    Ok(())
}

#[tauri::command]
async fn ffmpeg_info(app: tauri::AppHandle) -> Result<String, String> {
    let cmd = app.shell().sidecar("ffmpeg").map_err(|e| e.to_string())?;
    let res = cmd.args(["-hide_banner", "-version"]).output().await.map_err(|e| e.to_string())?;
    if !res.status.success() { return Err(String::from_utf8_lossy(&res.stderr).to_string()) }
    Ok(String::from_utf8_lossy(&res.stdout).lines().next().unwrap_or("FFmpeg").to_owned())
}

#[tauri::command]
async fn ffprobe_info(app: tauri::AppHandle, url: String) -> Result<String, String> {
    check_http_url(&url)?;
    let cmd = app.shell().sidecar("ffprobe").map_err(|e| e.to_string())?;
    let res = cmd.args(["-v", "error", "-show_format", "-show_streams", "-of", "json", "-i", &url])
        .output().await.map_err(|e| e.to_string())?;
    if !res.status.success() { return Err(String::from_utf8_lossy(&res.stderr).to_string()) }
    Ok(String::from_utf8_lossy(&res.stdout).to_string())
}

#[tauri::command]
async fn snapshot(app: tauri::AppHandle, url: String, output: String) -> Result<String, String> {
    check_http_url(&url)?;
    if output.is_empty() { return Err("Đường dẫn xuất trống".into()) }
    let cmd = app.shell().sidecar("ffmpeg").map_err(|e| e.to_string())?;
    let res = cmd.args(["-y", "-hide_banner", "-loglevel", "error", "-rw_timeout", "12000000", "-i", &url, "-frames:v", "1", &output])
        .output().await.map_err(|e| e.to_string())?;
    if !res.status.success() { return Err(String::from_utf8_lossy(&res.stderr).to_string()) }
    Ok(output)
}

#[tauri::command]
async fn record_clip(app: tauri::AppHandle, url: String, seconds: u32, output: String) -> Result<String, String> {
    check_http_url(&url)?;
    if seconds == 0 || seconds > 3600 { return Err("Giới hạn ghi 1–3600 giây".into()) }
    if output.is_empty() { return Err("Đường dẫn xuất trống".into()) }
    let duration = seconds.to_string();
    let cmd = app.shell().sidecar("ffmpeg").map_err(|e| e.to_string())?;
    let res = cmd.args(["-y", "-hide_banner", "-loglevel", "error", "-i", &url, "-t", &duration, "-c", "copy", &output])
        .output().await.map_err(|e| e.to_string())?;
    if !res.status.success() { return Err(String::from_utf8_lossy(&res.stderr).to_string()) }
    Ok(output)
}

#[tauri::command]
async fn fetch_m3u(url: String) -> Result<String, String> {
    check_http_url(&url)?;
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(5)).build().map_err(|e| e.to_string())?;
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?.error_for_status().map_err(|e| e.to_string())?;
    let data = res.bytes().await.map_err(|e| e.to_string())?;
    if data.len() > 12_000_000 { return Err("Playlist lớn hơn 12 MB".into()); }
    let content = String::from_utf8_lossy(&data).to_string();
    if !content.contains("#EXTM3U") { return Err("URL không trả về playlist M3U".into()) }
    Ok(content)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![ffmpeg_info, ffprobe_info, snapshot, record_clip, fetch_m3u])
        .run(tauri::generate_context!())
        .expect("failed to start Open IPTV Pro WebView trial");
}
