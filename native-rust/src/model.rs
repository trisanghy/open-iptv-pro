use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Channel {
    pub source_id: String,
    pub name: String,
    pub url: String,
    pub group: String,
    #[serde(default)] pub tvg_id: String,
    #[serde(default)] pub logo: String,
    #[serde(default)] pub catchup: String,
    #[serde(default)] pub catchup_source: String,
    #[serde(default)] pub catchup_days: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Source {
    pub id: String,
    pub name: String,
    pub origin: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Folder {
    pub name: String,
    #[serde(default)] pub urls: BTreeSet<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeData {
    pub format_version: u32,
    #[serde(default)] pub sources: Vec<Source>,
    #[serde(default)] pub channels: Vec<Channel>,
    #[serde(default)] pub favorite_urls: BTreeSet<String>,
    #[serde(default = "default_volume")] pub volume: i32,
    #[serde(default)] pub folders: Vec<Folder>,
    #[serde(default)] pub health: BTreeMap<String, String>,
    #[serde(default)] pub alternate_links: BTreeMap<String, Vec<String>>,
    #[serde(default)] pub recent_urls: Vec<String>,
    #[serde(default = "default_auto_failover")] pub auto_failover: bool,
    #[serde(default)] pub last_channel_url: String,
    #[serde(default)] pub epg_url: String,
    #[serde(default = "default_epg_auto_refresh")] pub epg_auto_refresh: bool,
    #[serde(default = "default_theme")] pub theme: String,
}

fn default_volume() -> i32 { 80 }
fn default_auto_failover() -> bool { true }
fn default_epg_auto_refresh() -> bool { true }
fn default_theme() -> String { "Tối · Tím".to_owned() }

impl Default for NativeData {
    fn default() -> Self {
        Self { format_version: 1, sources: vec![], channels: vec![], favorite_urls: BTreeSet::new(),
            volume: 80, folders: vec![], health: BTreeMap::new(), alternate_links: BTreeMap::new(),
            last_channel_url: String::new(), epg_url: "https://epg.io.vn/epg.xml.gz".into(), theme: default_theme(),
            recent_urls: Vec::new(), auto_failover: true, epg_auto_refresh: true }
    }
}

impl NativeData {
    pub fn validate(&self) -> Result<(), String> {
        if self.format_version != 1 { return Err("Phiên bản dữ liệu Rust Native chưa hỗ trợ".into()); }
        if self.sources.len() > 1024 || self.channels.len() > 200_000 || self.folders.len() > 1000 {
            return Err("Dữ liệu vượt giới hạn nguồn/kênh/thư mục".into());
        }
        if !(0..=100).contains(&self.volume) { return Err("Âm lượng ngoài 0–100".into()); }
        if self.epg_url.len() > 8192 || self.last_channel_url.len() > 8192 || self.theme.len() > 128 {
            return Err("Cấu hình quá dài".into());
        }
        let ids: BTreeSet<&str> = self.sources.iter().map(|s| s.id.as_str()).collect();
        if ids.len() != self.sources.len() { return Err("Trùng ID nguồn".into()); }
        for source in &self.sources {
            if source.name.len() > 1024 || source.origin.len() > 8192 || source.id.len() > 128 {
                return Err("Thông tin nguồn quá dài".into());
            }
        }
        for ch in &self.channels {
            if !ids.contains(ch.source_id.as_str()) || !crate::m3u::is_media_url(&ch.url)
                || ch.name.len() > 2048 || ch.url.len() > 8192 {
                return Err("Có kênh hoặc nguồn không hợp lệ".into());
            }
        }
        let mut names = BTreeSet::new();
        for f in &self.folders {
            if f.name.trim().is_empty() || f.name.len() > 128 || !names.insert(f.name.to_lowercase()) || f.urls.len() > 200_000 {
                return Err("Thư mục kênh không hợp lệ/trùng tên".into());
            }
        }
        if self.recent_urls.len() > 30 || self.recent_urls.iter().any(|u| u.len() > 8192 || !crate::m3u::is_media_url(u)) { 
            return Err("Lịch sử kênh không hợp lệ".into());
        }
        if self.recent_urls.iter().collect::<BTreeSet<_>>().len() != self.recent_urls.len() {
            return Err("Lịch sử kênh trùng lặp".into());
        }
        let channel_urls = self.channels.iter().map(|c|c.url.as_str()).collect::<BTreeSet<_>>();
        for (primary, links) in &self.alternate_links {
            if !channel_urls.contains(primary.as_str()) || links.len()>8 { return Err("Nguồn dự phòng không hợp lệ".into()); }
            let mut unique = BTreeSet::new();
            for url in links {
                if url.len()>8192 || !crate::m3u::is_media_url(url) || url == primary || !unique.insert(url) {
                    return Err("URL dự phòng trống, sai định dạng hoặc trùng lặp".into());
                }
            }
        }
        if self.health.len() > 200_000 || self.alternate_links.len() > 200_000 {
            return Err("Dữ liệu kiểm tra luồng vượt giới hạn".into());
        }
        Ok(())
    }

    pub fn insert_source(&mut self, source: Source, channels: Vec<Channel>) -> Result<usize, String> {
        let previous = self.clone();
        self.channels.retain(|c| c.source_id != source.id);
        self.sources.retain(|s| s.id != source.id);
        let count = channels.len();
        self.sources.push(source);
        self.channels.extend(channels);
        let remaining: BTreeSet<&str> = self.channels.iter().map(|c|c.url.as_str()).collect();
        self.alternate_links.retain(|k,_| remaining.contains(k.as_str()));
        self.recent_urls.retain(|u| remaining.contains(u.as_str()));
        self.favorite_urls.retain(|u| remaining.contains(u.as_str()));
        for folder in &mut self.folders {folder.urls.retain(|u|remaining.contains(u.as_str()));}
        if let Err(e) = self.validate() { *self = previous; return Err(e); }
        Ok(count)
    }

    pub fn remove_source(&mut self, id: &str) -> usize {
        self.sources.retain(|s| s.id != id);
        let before = self.channels.len();
        self.channels.retain(|c| c.source_id != id);
        let remaining: BTreeSet<&str> = self.channels.iter().map(|c| c.url.as_str()).collect();
        self.favorite_urls.retain(|u| remaining.contains(u.as_str()));
        self.health.retain(|k, _| remaining.contains(k.as_str()));
        self.alternate_links.retain(|k, _| remaining.contains(k.as_str()));
        self.recent_urls.retain(|u| remaining.contains(u.as_str()));
        for folder in &mut self.folders { folder.urls.retain(|u| remaining.contains(u.as_str())); }
        before - self.channels.len()
    }

    pub fn remember_channel(&mut self, url: &str) {
        if !self.channels.iter().any(|c| c.url == url) { return; }
        self.recent_urls.retain(|u| u != url);
        self.recent_urls.insert(0, url.to_string());
        self.recent_urls.truncate(30);
    }

    pub fn add_alternate(&mut self, primary: &str, alternate: &str) -> Result<(), String> {
        let alternate = alternate.trim();
        if !self.channels.iter().any(|c| c.url == primary) { return Err("Chưa chọn kênh hợp lệ".into()); }
        if alternate.len() > 8192 || !crate::m3u::is_media_url(alternate) || alternate == primary {
            return Err("URL dự phòng không hợp lệ hoặc trùng link chính".into());
        }
        let list = self.alternate_links.entry(primary.to_string()).or_default();
        if list.iter().any(|s| s == alternate) { return Err("Đã có link dự phòng này".into()); }
        if list.len() >= 8 { return Err("Tối đa 8 link dự phòng mỗi kênh".into()); }
        list.push(alternate.to_string());
        Ok(())
    }
    pub fn remove_last_alternate(&mut self, primary: &str) -> bool {
        let Some(list) = self.alternate_links.get_mut(primary) else { return false; };
        let removed = list.pop().is_some();
        if list.is_empty() { self.alternate_links.remove(primary); }
        removed
    }

    pub fn add_folder(&mut self, name: &str) -> Result<(), String> {
        let name = name.trim();
        if name.is_empty() || name.len() > 128 { return Err("Tên thư mục phải dài từ 1 đến 128 ký tự".into()); }
        if self.folders.iter().any(|f| f.name.eq_ignore_ascii_case(name)) { return Err("Thư mục đã tồn tại".into()); }
        self.folders.push(Folder { name: name.to_owned(), urls: BTreeSet::new() });
        Ok(())
    }

    pub fn folder_add_url(&mut self, name: &str, url: &str) -> Result<(), String> {
        if !self.channels.iter().any(|c| c.url == url) { return Err("Không tìm thấy kênh để thêm vào thư mục".into()); }
        let folder = self.folders.iter_mut().find(|f| f.name == name).ok_or("Chưa tạo thư mục này")?;
        folder.urls.insert(url.to_owned());
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn insert_and_remove_source() {
        let mut d = NativeData::default();
        let s = Source { id: "one".into(), name: "A".into(), origin: "test".into() };
        let ch = Channel { source_id: "one".into(), name: "News".into(), url: "https://example.org/a.m3u8".into(), group: "TV".into(), tvg_id: "".into(), logo: "".into(), catchup: "".into(), catchup_source: "".into(), catchup_days: "".into() };
        assert_eq!(d.insert_source(s, vec![ch]).unwrap(), 1);
        d.favorite_urls.insert("https://example.org/a.m3u8".into());
        d.add_folder("News").unwrap();
        d.folder_add_url("News", "https://example.org/a.m3u8").unwrap();
        assert_eq!(d.remove_source("one"), 1);
        assert!(d.channels.is_empty());
        assert!(d.favorite_urls.is_empty());
        assert!(d.folders[0].urls.is_empty());
    }
    #[test]
    fn failover_links_and_history() {
        let mut d = NativeData::default();
        let s = Source {id:"s".into(),name:"A".into(),origin:"x".into()};
        let c = Channel{source_id:"s".into(),name:"VTV".into(),url:"https://example.org/a.m3u8".into(),group:"".into(),tvg_id:"".into(),logo:"".into(),catchup:"".into(),catchup_source:"".into(),catchup_days:"".into()};
        d.insert_source(s,vec![c]).unwrap();
        d.add_alternate("https://example.org/a.m3u8","https://example.org/b.m3u8").unwrap();
        assert!(d.add_alternate("https://example.org/a.m3u8","https://example.org/b.m3u8").is_err());
        d.remember_channel("https://example.org/a.m3u8");
        d.remember_channel("https://example.org/a.m3u8");
        assert_eq!(d.recent_urls.len(),1);
        d.validate().unwrap();
        assert!(d.remove_last_alternate("https://example.org/a.m3u8"));
        d.remove_source("s");
        assert!(d.recent_urls.is_empty());
        assert!(d.alternate_links.is_empty());
    }
    #[test]
    fn old_profiles_default_to_epg_auto_refresh_without_losing_any_data() {
        let mut raw = serde_json::to_value(NativeData::default()).unwrap();
        raw.as_object_mut().unwrap().remove("epg_auto_refresh");
        let restored: NativeData = serde_json::from_value(raw).unwrap();
        assert!(restored.epg_auto_refresh);
        assert_eq!(restored.epg_url, "https://epg.io.vn/epg.xml.gz");
        let mut customized = restored;
        customized.epg_auto_refresh = false;
        assert!(!serde_json::from_slice::<NativeData>(&serde_json::to_vec(&customized).unwrap()).unwrap().epg_auto_refresh);
    }
    #[test]
    fn c2_json_backward_compatible() {
        let mut old=serde_json::to_value(NativeData::default()).unwrap();
        old.as_object_mut().unwrap().remove("recent_urls");
        old.as_object_mut().unwrap().remove("auto_failover");
        let restored:NativeData=serde_json::from_value(old).unwrap();
        assert!(restored.auto_failover);
        assert!(restored.recent_urls.is_empty());
        restored.validate().unwrap();
    }
    #[test]
    fn folder_validation() {
        let mut d = NativeData::default();
        d.add_folder("VN").unwrap();
        assert!(d.add_folder("vn").is_err());
        d.validate().unwrap();
    }
}
