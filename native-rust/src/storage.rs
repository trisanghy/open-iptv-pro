use crate::model::{Channel, NativeData, Source};
use std::collections::BTreeSet;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

const MAX_DATA_BYTES: u64 = 96 * 1024 * 1024;
const MAX_PLAYLIST_BYTES: u64 = 24 * 1024 * 1024;

pub fn app_data_file() -> Result<PathBuf, String> {
    let dirs = directories::ProjectDirs::from("org", "OpenIPTVPro", "OpenIPTVPro-Rust-Native")
        .ok_or_else(|| "Không tìm thấy thư mục dữ liệu người dùng".to_owned())?;
    Ok(dirs.data_local_dir().join("native-state-v1.json"))
}

pub fn read_limited(path: &Path, limit: u64) -> Result<Vec<u8>, String> {
    let meta = fs::metadata(path).map_err(|e| format!("Không đọc được file: {e}"))?;
    if !meta.is_file() || meta.len() > limit {
        return Err(format!("File quá lớn hoặc không phải file thường (tối đa {} MB)", limit / 1_048_576));
    }
    let mut bytes = Vec::with_capacity(meta.len().min(limit) as usize);
    fs::File::open(path).map_err(|e| e.to_string())?
        .take(limit + 1).read_to_end(&mut bytes).map_err(|e| e.to_string())?;
    if bytes.len() as u64 > limit { return Err("File vượt giới hạn kích thước".into()); }
    Ok(bytes)
}

pub fn load() -> Result<NativeData, String> {
    let path = app_data_file()?;
    if !path.exists() { return Ok(NativeData::default()); }
    parse_native_json(&read_limited(&path, MAX_DATA_BYTES)?)
}

pub fn parse_native_json(bytes: &[u8]) -> Result<NativeData, String> {
    let data: NativeData = serde_json::from_slice(bytes).map_err(|e| format!("Dữ liệu Native không hợp lệ: {e}"))?;
    data.validate()?;
    Ok(data)
}

pub fn save(data: &NativeData) -> Result<(), String> {
    let path = app_data_file()?;
    save_to(&path, data)
}

pub fn save_to(path: &Path, data: &NativeData) -> Result<(), String> {
    data.validate()?;
    let parent = path.parent().ok_or("Đường dẫn không hợp lệ")?;
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let output = serde_json::to_vec_pretty(data).map_err(|e| e.to_string())?;
    if output.len() as u64 > MAX_DATA_BYTES { return Err("Dữ liệu lớn hơn 96 MB".into()); }
    let mut temporary = tempfile::NamedTempFile::new_in(parent).map_err(|e| e.to_string())?;
    temporary.write_all(&output).map_err(|e| e.to_string())?;
    temporary.as_file().sync_all().map_err(|e| e.to_string())?;
    temporary.persist(path).map_err(|e| format!("Không lưu được dữ liệu: {e}"))?;
    Ok(())
}

pub fn read_m3u_file(path: &Path) -> Result<String, String> {
    String::from_utf8(read_limited(path, MAX_PLAYLIST_BYTES)?).map_err(|_| "M3U phải sử dụng UTF-8".into())
}

pub fn download_m3u(url: &str) -> Result<String, String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("Nguồn URL phải bắt đầu bằng http:// hoặc https://".into());
    }
    if url.len() > 8192 || url.chars().any(char::is_whitespace) {
        return Err("URL quá dài hoặc chứa khoảng trắng".into());
    }
    // ureq 2.x: configure total timeout through AgentBuilder.
    let agent = ureq::AgentBuilder::new()
        .timeout(std::time::Duration::from_secs(25))
        .timeout_connect(std::time::Duration::from_secs(8))
        .timeout_read(std::time::Duration::from_secs(20))
        .build();
    let response = agent.get(url)
        .set("User-Agent", "Open-IPTV-Pro-Rust-Native/0.1")
        .call().map_err(|e| format!("Tải M3U thất bại: {e}"))?;
    let mut bytes = Vec::new();
    response.into_reader().take(MAX_PLAYLIST_BYTES + 1)
        .read_to_end(&mut bytes).map_err(|e| e.to_string())?;
    if bytes.len() as u64 > MAX_PLAYLIST_BYTES { return Err("M3U vượt 24 MB".into()); }
    String::from_utf8(bytes).map_err(|_| "M3U tải về không phải UTF-8".into())
}

pub fn import_electron_backup(bytes: &[u8]) -> Result<NativeData, String> {
    // Chỉ đọc metadata playlist/yêu thích từ .iptvbackup gốc; KHÔNG can thiệp vào
    // ảnh Snapshot, lịch ghi hoặc cấu hình/mã hóa của bản Electron.
    if bytes.len() as u64 > MAX_DATA_BYTES { return Err("Backup quá lớn cho chế độ nhập thử nghiệm (96MB)".into()); }
    let backup: serde_json::Value = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if backup.get("magic").and_then(|x| x.as_str()) != Some("open-iptv-pro-backup")
        || backup.get("formatVersion").and_then(|x| x.as_u64()) != Some(1)
    { return Err("Không phải bản sao lưu Electron .iptvbackup v1".into()); }
    let storage = backup.get("storage").and_then(|x| x.as_object()).ok_or("Backup thiếu storage")?;
    let json_state = storage.get("open-iptv-pro-4").or_else(|| storage.get("streamleaf-3"))
        .and_then(|x| x.as_str()).ok_or("Backup thiếu trạng thái IPTV")?;
    let state: serde_json::Value = serde_json::from_str(json_state).map_err(|e| format!("Trạng thái hỏng: {e}"))?;
    let src_items = state.get("sources").and_then(|x| x.as_array()).ok_or("Backup thiếu sources")?;
    let channel_items = state.get("channels").and_then(|x| x.as_array()).ok_or("Backup thiếu channels")?;
    if src_items.len() > 1024 || channel_items.len() > 200_000 {
        return Err("Backup vượt giới hạn nguồn/kênh".into());
    }
    let sources: Vec<Source> = src_items.iter().filter_map(|x| {
        let id = x.get("id")?.as_str()?.to_string();
        let name = x.get("name").and_then(|v| v.as_str()).unwrap_or("Nguồn Electron").to_string();
        let origin = x.get("origin").and_then(|v| v.as_str()).unwrap_or("").to_string();
        Some(Source { id, name, origin })
    }).collect();
    let known: BTreeSet<&str> = sources.iter().map(|s| s.id.as_str()).collect();
    let channels: Vec<Channel> = channel_items.iter().filter_map(|x| {
        let url = x.get("url")?.as_str()?;
        let source_id = x.get("sourceId")?.as_str()?;
        if !known.contains(source_id) || !crate::m3u::is_media_url(url) { return None; }
        let field = |k: &str| x.get(k).and_then(|v| v.as_str()).unwrap_or("").to_string();
        Some(Channel {
            source_id: source_id.into(), url: url.into(),
            name: x.get("name").and_then(|v| v.as_str()).unwrap_or("Kênh").into(),
            group: x.get("group").and_then(|v| v.as_str()).unwrap_or("Khác").into(),
            tvg_id: field("tvgId"), logo: field("logo"), catchup: field("catchup"),
            catchup_source: field("catchupSource"), catchup_days: field("catchupDays"),
        })
    }).collect();
    let favorite_urls = state.get("favorites").and_then(|x| x.as_array()).map(|favs| {
        favs.iter().filter_map(|x| x.as_str()).filter(|url| channels.iter().any(|c| c.url == *url))
            .map(str::to_string).collect::<BTreeSet<_>>()
    }).unwrap_or_default();
    let volume = state.get("volume").and_then(|x| x.as_f64()).map(|n| (n * 100.0) as i32).unwrap_or(80);
    let result = NativeData { sources, channels, favorite_urls, volume: volume.clamp(0,100), ..NativeData::default() };
    result.validate()?;
    if result.channels.is_empty() { return Err("Backup không có kênh tương thích".into()); }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn electron_backup_v1() {
        let state = serde_json::json!({"sources":[{"id":"s","name":"VN","origin":""}],
            "channels":[{"name":"VTV", "url":"https://example.org/live.m3u8", "sourceId":"s", "group":"TV"}],
            "favorites":["https://example.org/live.m3u8"], "volume":0.5});
        let backup = serde_json::json!({"magic":"open-iptv-pro-backup", "formatVersion":1,
            "storage":{"open-iptv-pro-4":state.to_string()}, "snapshotFiles":{}});
        let d = import_electron_backup(backup.to_string().as_bytes()).unwrap();
        assert_eq!(d.channels.len(), 1);
        assert_eq!(d.volume, 50);
        assert_eq!(d.favorite_urls.len(), 1);
    }
    #[test]
    fn native_roundtrip() {
        let d = NativeData::default();
        let out = serde_json::to_vec(&d).unwrap();
        assert_eq!(parse_native_json(&out).unwrap().volume, 80);
    }
}
