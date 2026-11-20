//! Short-lived cache of the *currently airing* XMLTV titles. Do not treat as a full EPG database.
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, io::Write, path::PathBuf, time::{SystemTime, UNIX_EPOCH}};
const MAX_CACHE_BYTES: u64 = 8 * 1024 * 1024;
const MAX_CACHE_AGE_SECS: u64 = 600;

#[derive(Serialize, Deserialize)]
struct CachedNow {
    url: String,
    saved_at: u64,
    titles: HashMap<String, String>,
}
fn timestamp() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs()
}
fn cache_file() -> Result<PathBuf, String> {
    let mut path = crate::storage::app_data_file()?;
    path.set_file_name("epg-now-c3.json");
    Ok(path)
}
fn valid(cache: &CachedNow, source: &str, now: u64) -> bool {
    cache.url == source && !source.is_empty() && cache.saved_at <= now
        && now - cache.saved_at <= MAX_CACHE_AGE_SECS && cache.titles.len() <= 50_000
}
pub fn load(source: &str) -> Option<HashMap<String, String>> {
    let path = cache_file().ok()?;
    let bytes = crate::storage::read_limited(&path, MAX_CACHE_BYTES).ok()?;
    let cached: CachedNow = serde_json::from_slice(&bytes).ok()?;
    if valid(&cached, source, timestamp()) {Some(cached.titles)} else {None}
}
pub fn save(source: &str, titles: &HashMap<String, String>) -> Result<(), String> {
    if !(source.starts_with("https://") || source.starts_with("http://")) || source.len()>8192 || titles.len()>50_000 {
        return Err("Cache EPG không hợp lệ".into());
    }
    let path=cache_file()?;
    let parent=path.parent().ok_or("Đường dẫn cache lỗi")?;
    fs::create_dir_all(parent).map_err(|e|e.to_string())?;
    let data=serde_json::to_vec(&CachedNow{url:source.into(),saved_at:timestamp(),titles:titles.clone()}).map_err(|e|e.to_string())?;
    if data.len() as u64>MAX_CACHE_BYTES {return Err("Cache EPG vượt 8MB".into());}
    let mut tmp=tempfile::NamedTempFile::new_in(parent).map_err(|e|e.to_string())?;
    tmp.write_all(&data).map_err(|e|e.to_string())?;
    tmp.as_file().sync_all().map_err(|e|e.to_string())?;
    tmp.persist(path).map_err(|e|e.to_string())?;
    Ok(())
}

const MAX_FULL_CACHE_BYTES: u64 = 48 * 1024 * 1024;
const MAX_FULL_CACHE_AGE_SECS: u64 = 24 * 3600;

#[derive(Serialize, Deserialize)]
struct CachedFull {
    url: String,
    saved_at: u64,
    schedule: Vec<crate::epg::GuideEntry>,
}
fn full_cache_file() -> Result<PathBuf, String> {
    let mut path = crate::storage::app_data_file()?;
    path.set_file_name("epg-full-c3.json");
    Ok(path)
}
fn valid_full(cache: &CachedFull, source: &str, now: u64) -> bool {
    cache.url == source && !source.is_empty() && cache.saved_at <= now
        && now - cache.saved_at <= MAX_FULL_CACHE_AGE_SECS
        && cache.schedule.len() <= 150_000
        && cache.schedule.iter().all(|e| e.start < e.stop
            && !e.channel.is_empty() && e.channel.len() <= 2048
            && e.title.len() <= 4096)
}
fn load_full_from(path: &std::path::Path, source: &str, now: u64) -> Option<Vec<crate::epg::GuideEntry>> {
    let bytes = crate::storage::read_limited(path, MAX_FULL_CACHE_BYTES).ok()?;
    let cached: CachedFull = serde_json::from_slice(&bytes).ok()?;
    if valid_full(&cached, source, now) { Some(cached.schedule) } else { None }
}
pub fn load_full(source: &str) -> Option<Vec<crate::epg::GuideEntry>> {
    load_full_from(&full_cache_file().ok()?, source, timestamp())
}
pub fn save_full(source: &str, schedule: &[crate::epg::GuideEntry]) -> Result<(), String> {
    crate::netguard::validate_public_http_url(source)?;
    if schedule.len() > 150_000 { return Err("Lịch EPG vượt 150.000 chương trình".into()); }
    let path=full_cache_file()?;
    let parent=path.parent().ok_or("Đường dẫn cache EPG không hợp lệ")?;
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let data=serde_json::to_vec(&CachedFull{
        url:source.to_string(), saved_at:timestamp(), schedule:schedule.to_vec()
    }).map_err(|e| e.to_string())?;
    if data.len() as u64 > MAX_FULL_CACHE_BYTES {
        return Err("Cache lịch EPG lớn hơn 48MB".into());
    }
    let mut tmp=tempfile::NamedTempFile::new_in(parent).map_err(|e|e.to_string())?;
    tmp.write_all(&data).map_err(|e|e.to_string())?;
    tmp.as_file().sync_all().map_err(|e|e.to_string())?;
    tmp.persist(path).map_err(|e|format!("Không lưu được EPG đầy đủ: {e}"))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn persisted_guide_is_source_isolated_and_expires() {
        let started = chrono::DateTime::parse_from_rfc3339("2026-11-20T10:00:00+07:00")
            .unwrap().with_timezone(&chrono::Utc);
        let sample = crate::epg::GuideEntry {
            channel: "VTV3".into(),
            title: "Phim truyện: Tập 25".into(),
            start: started, stop: started + chrono::Duration::minutes(60),
        };
        let time = 1_800_000_000u64;
        let cached = CachedFull {
            url:"https://epg.example.org/guide.xml.gz".into(),
            saved_at:time,
            schedule:vec![sample],
        };
        assert!(valid_full(&cached, "https://epg.example.org/guide.xml.gz", time + 60));
        assert!(!valid_full(&cached, "https://epg.example.org/other.xml", time + 60));
        assert!(!valid_full(&cached, "https://epg.example.org/guide.xml.gz", time + 86401));
        let tmp=tempfile::tempdir().unwrap();
        let path=tmp.path().join("guide.json");
        std::fs::write(&path, serde_json::to_vec(&cached).unwrap()).unwrap();
        let restored=load_full_from(&path, "https://epg.example.org/guide.xml.gz", time).unwrap();
        assert_eq!(restored.len(),1);
        assert_eq!(restored[0].title,"Phim truyện: Tập 25");
        assert!(load_full_from(&path, "https://epg.example.org/other.xml", time).is_none());
    }

    #[test]
    fn cache_expiration_and_source_isolation() {
        let test=CachedNow {url:"https://epg.test/a.xml".into(),saved_at:10_000,titles:HashMap::new()};
        assert!(valid(&test,"https://epg.test/a.xml",10_300));
        assert!(!valid(&test,"https://epg.test/a.xml",10_700));
        assert!(!valid(&test,"https://epg.test/b.xml",10_300));
        assert!(!valid(&test,"https://epg.test/a.xml",9_999));
    }
}
