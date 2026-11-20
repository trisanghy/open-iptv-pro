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
    #[serde(default = "default_auto_refresh_sources")] pub auto_refresh_sources: bool,
    #[serde(default = "default_theme")] pub theme: String,
    #[serde(default = "default_video_backend")] pub video_backend: String,
    #[serde(default)] pub quick_tools_expanded: bool,
    #[serde(default = "default_aspect_mode")] pub aspect_mode: String,
    #[serde(default)] pub muted: bool,
    #[serde(default)] pub auto_resume_last_channel: bool,
}

fn default_volume() -> i32 { 80 }
fn default_auto_failover() -> bool { true }
fn default_epg_auto_refresh() -> bool { true }
fn default_auto_refresh_sources() -> bool { true }
fn default_theme() -> String { "Tối · Tím".to_owned() }
fn default_video_backend() -> String { "embedded".to_owned() }
pub fn valid_video_backend(value: &str) -> bool { matches!(value, "embedded" | "native") }
fn default_aspect_mode() -> String { "fit".to_owned() }
pub fn valid_aspect_mode(mode: &str) -> bool { matches!(mode, "fit" | "fill" | "original") }

impl Default for NativeData {
    fn default() -> Self {
        Self { format_version: 1, sources: vec![], channels: vec![], favorite_urls: BTreeSet::new(),
            volume: 80, folders: vec![], health: BTreeMap::new(), alternate_links: BTreeMap::new(),
            last_channel_url: String::new(), epg_url: "https://epg.io.vn/epg.xml.gz".into(), theme: default_theme(),
            recent_urls: Vec::new(), auto_failover: true, epg_auto_refresh: true, auto_refresh_sources: true, video_backend: default_video_backend(),
            quick_tools_expanded: false, aspect_mode: default_aspect_mode(), muted: false, auto_resume_last_channel: false }
    }
}

impl NativeData {
    pub fn validate(&self) -> Result<(), String> {
        if self.format_version != 1 { return Err("Phiên bản dữ liệu Rust Native chưa hỗ trợ".into()); }
        if self.sources.len() > 1024 || self.channels.len() > 200_000 || self.folders.len() > 1000 {
            return Err("Dữ liệu vượt giới hạn nguồn/kênh/thư mục".into());
        }
        if !(0..=100).contains(&self.volume) { return Err("Âm lượng ngoài 0–100".into()); }
        if !valid_aspect_mode(&self.aspect_mode) { return Err("Chế độ khung hình không hợp lệ".into()); }
        if !valid_video_backend(&self.video_backend) { return Err("Backend video không hợp lệ".into()); }
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

    /// Reorder the currently filtered channel list without changing identities or favorites.
    pub fn move_visible_channel(&mut self, visible: &[usize], row: usize, delta: i32) -> Result<(), String> {
        if delta != -1 && delta != 1 { return Err("Chỉ hỗ trợ lên hoặc xuống một vị trí".into()); }
        let next = if delta < 0 { row.checked_sub(1) } else { row.checked_add(1) };
        let target = next.filter(|&p| p < visible.len()).ok_or("Kênh đã ở đầu/cuối danh sách")?;
        let first = *visible.get(row).ok_or("Không tìm thấy kênh đang sắp xếp")?;
        let second = *visible.get(target).ok_or("Không tìm thấy vị trí mới")?;
        if first >= self.channels.len() || second >= self.channels.len() { return Err("Chỉ mục kênh không hợp lệ".into()); }
        self.channels.swap(first, second);
        Ok(())
    }


    /// Transactional import: never overwrite an existing source with a colliding
    /// backup ID, and preserve links, folders, favorites and recents. The
    /// incoming profile's global settings do not replace user preferences.
    pub fn merge_backup(&mut self, incoming: NativeData, prefix: &str) -> Result<usize, String> {
        incoming.validate()?;
        let count = incoming.channels.len();
        let mut merged = self.clone();
        for src in &incoming.sources {
            let mut base = prefix.to_string();
            for ch in src.id.chars() {
                if base.len() + ch.len_utf8() > 96 { break; }
                base.push(ch);
            }
            let mut id = base.clone();
            let mut suffix = 1usize;
            while merged.sources.iter().any(|current| current.id == id) {
                id = format!("{base}_{suffix}");
                suffix += 1;
            }
            let mut new_source = src.clone();
            new_source.id = id.clone();
            merged.channels.extend(
                incoming.channels.iter().filter(|ch| ch.source_id == src.id)
                    .cloned().map(|mut ch| { ch.source_id = id.clone(); ch })
            );
            merged.sources.push(new_source);
        }
        let known: BTreeSet<String> = merged.channels.iter().map(|ch| ch.url.clone()).collect();
        merged.favorite_urls.extend(
            incoming.favorite_urls.into_iter().filter(|url| known.contains(url))
        );
        for (url, links) in incoming.alternate_links {
            if !known.contains(&url) { continue; }
            let existing = merged.alternate_links.entry(url.clone()).or_default();
            for link in links {
                if existing.len() >= 8 { break; }
                if link != url && crate::m3u::is_media_url(&link) && !existing.contains(&link) {
                    existing.push(link);
                }
            }
        }
        let mut recent = Vec::new();
        for url in incoming.recent_urls.into_iter().chain(merged.recent_urls.iter().cloned()) {
            if recent.len() == 30 { break; }
            if known.contains(&url) && !recent.contains(&url) { recent.push(url); }
        }
        merged.recent_urls = recent;
        for mut folder in incoming.folders {
            folder.urls.retain(|url| known.contains(url));
            if merged.folders.iter().any(|f| f.name.eq_ignore_ascii_case(&folder.name)) {
                let mut base = String::new();
                for ch in folder.name.chars() {
                    if base.len() + ch.len_utf8() > 96 { break; }
                    base.push(ch);
                }
                let mut suffix = 1usize;
                loop {
                    let candidate = format!("{base} ({prefix}{suffix})");
                    if !merged.folders.iter().any(|f| f.name.eq_ignore_ascii_case(&candidate)) {
                        folder.name = candidate;
                        break;
                    }
                    suffix += 1;
                }
            }
            merged.folders.push(folder);
        }
        for (url, label) in incoming.health {
            if known.contains(&url) && !merged.health.contains_key(&url) {
                merged.health.insert(url, label);
            }
        }
        merged.validate()?;
        *self = merged;
        Ok(count)
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
    fn video_backend_is_migratable_and_persistent() {
        let mut old = serde_json::to_value(NativeData::default()).unwrap();
        old.as_object_mut().unwrap().remove("video_backend");
        let restored: NativeData = serde_json::from_value(old).unwrap();
        assert_eq!(restored.video_backend, "embedded");
        let mut manual = restored;
        manual.video_backend = "native".into();
        let updated: NativeData=serde_json::from_slice(&serde_json::to_vec(&manual).unwrap()).unwrap();
        assert_eq!(updated.video_backend,"native");
        manual.video_backend="other".into();
        assert!(manual.validate().is_err());
    }
    #[test]
    fn source_refresh_preference_roundtrips_and_migrates() {
        let mut state = NativeData::default();
        assert!(state.auto_refresh_sources);
        state.auto_refresh_sources = false;
        let stored = serde_json::to_vec(&state).unwrap();
        let restored: NativeData = serde_json::from_slice(&stored).unwrap();
        assert!(!restored.auto_refresh_sources);
        let mut old = serde_json::to_value(state).unwrap();
        old.as_object_mut().unwrap().remove("auto_refresh_sources");
        let migrated: NativeData = serde_json::from_value(old).unwrap();
        assert!(migrated.auto_refresh_sources);
        migrated.validate().unwrap();
    }


    #[test]
    fn import_backup_is_lossless_and_never_overwrites_colliding_sources() {
        let make_channel = |id: &str, name: &str, url: &str| Channel {
            source_id: id.into(), name: name.into(), url: url.into(),
            group: "News".into(), tvg_id: name.into(), logo: String::new(),
            catchup: String::new(), catchup_source: String::new(), catchup_days: String::new(),
        };
        let mut local = NativeData::default();
        local.insert_source(
            Source { id: "import_tv".into(), name: "Existing".into(), origin: "local".into() },
            vec![make_channel("import_tv", "Local", "https://example.org/local")],
        ).unwrap();
        local.favorite_urls.insert("https://example.org/local".into());
        local.add_folder("My TV").unwrap();
        local.folder_add_url("My TV", "https://example.org/local").unwrap();
        local.recent_urls.push("https://example.org/local".into());
        let mut backup = NativeData::default();
        backup.insert_source(
            Source { id: "tv".into(), name: "Backup".into(), origin: "https://example.org/m3u".into() },
            vec![make_channel("tv", "New", "https://example.org/new")],
        ).unwrap();
        backup.favorite_urls.insert("https://example.org/new".into());
        backup.recent_urls.push("https://example.org/new".into());
        backup.add_alternate("https://example.org/new", "https://example.org/new-backup").unwrap();
        backup.add_folder("My TV").unwrap();
        backup.folder_add_url("My TV", "https://example.org/new").unwrap();
        backup.health.insert("https://example.org/new".into(), "Sống".into());

        assert_eq!(local.merge_backup(backup.clone(), "import_").unwrap(), 1);
        assert_eq!(local.sources.len(), 2);
        assert!(local.sources.iter().any(|s| s.id == "import_tv"));
        assert!(local.sources.iter().any(|s| s.id == "import_tv_1"));
        assert_eq!(local.channels.len(), 2);
        assert_eq!(local.favorite_urls.len(), 2);
        assert_eq!(local.recent_urls, vec!["https://example.org/new", "https://example.org/local"]);
        assert_eq!(local.alternate_links["https://example.org/new"][0], "https://example.org/new-backup");
        assert_eq!(local.health["https://example.org/new"], "Sống");
        assert_eq!(local.folders.len(), 2);
        assert!(local.folders[1].name.starts_with("My TV (import_"));
        assert!(local.folders[1].urls.contains("https://example.org/new"));
        assert_eq!(local.merge_backup(backup, "import_").unwrap(), 1);
        assert_eq!(local.sources.len(), 3);
        assert_eq!(local.channels.len(), 3);
        local.validate().unwrap();
    }
    #[test]
    fn invalid_backup_does_not_mutate_live_profile() {
        let mut current = NativeData::default();
        let mut backup = NativeData::default();
        backup.volume = 999;
        assert!(current.merge_backup(backup, "import_").is_err());
        assert_eq!(current.volume, 80);
        assert!(current.sources.is_empty());
    }


    #[test]
    fn reorder_visible_channels_keeps_favorites_and_channel_metadata() {
        let mut d=NativeData::default();
        let source=Source{id:"s".into(),name:"TV".into(),origin:"file".into()};
        let mk=|name: &str| Channel{source_id:"s".into(),name:name.into(),url:format!("https://tv.example/{name}.m3u8"),group:"News".into(),tvg_id:name.into(),logo:String::new(),catchup:String::new(),catchup_source:String::new(),catchup_days:String::new()};
        d.insert_source(source,vec![mk("VTV1"),mk("VTV2"),mk("VTV3")]).unwrap();
        d.favorite_urls.insert("https://tv.example/VTV3.m3u8".into());
        assert!(d.move_visible_channel(&[0,1,2],2,-1).is_ok());
        assert_eq!(d.channels[1].name,"VTV3");
        assert!(d.favorite_urls.contains("https://tv.example/VTV3.m3u8"));
        assert!(d.move_visible_channel(&[0,1,2],0,-1).is_err());
        d.validate().unwrap();
        let restored:NativeData=serde_json::from_slice(&serde_json::to_vec(&d).unwrap()).unwrap();
        assert_eq!(restored.channels[1].name,"VTV3");
    }
    #[test]
    fn update_source_reuses_id_and_preserves_matching_favorites() {
        let mut d=NativeData::default();
        let src=Source{id:"same".into(),name:"Nguồn A".into(),origin:"https://old.example/a.m3u".into()};
        let make=|id:&str,name:&str,url:&str| Channel{
            source_id:id.into(),name:name.into(),url:url.into(),group:"TV".into(),
            tvg_id:name.into(),logo:String::new(),catchup:String::new(),catchup_source:String::new(),catchup_days:String::new()};
        d.insert_source(src,vec![make("same","VTV1","https://example.org/vtv1.m3u8"),make("same","VTV2","https://example.org/vtv2.m3u8")]).unwrap();
        d.favorite_urls.insert("https://example.org/vtv1.m3u8".into());
        d.favorite_urls.insert("https://example.org/vtv2.m3u8".into());
        d.insert_source(Source{id:"same".into(),name:"Nguồn A".into(),origin:"https://new.example/a.m3u".into()},
            vec![make("same","VTV1","https://example.org/vtv1.m3u8"),make("same","VTV3","https://example.org/vtv3.m3u8")]).unwrap();
        assert_eq!(d.sources.len(),1);
        assert_eq!(d.sources[0].origin,"https://new.example/a.m3u");
        assert_eq!(d.channels.len(),2);
        assert!(d.favorite_urls.contains("https://example.org/vtv1.m3u8"));
        assert!(!d.favorite_urls.contains("https://example.org/vtv2.m3u8"));
        d.validate().unwrap();
    }
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
    fn player_preferences_survive_json_roundtrip_and_old_state_migration() {
        let mut original=NativeData::default();
        original.aspect_mode="fill".into();
        original.quick_tools_expanded=true;
        original.muted=true;
        original.auto_resume_last_channel=true;
        let restored:NativeData=serde_json::from_slice(&serde_json::to_vec(&original).unwrap()).unwrap();
        assert_eq!(restored.aspect_mode,"fill");
        assert!(restored.quick_tools_expanded && restored.muted && restored.auto_resume_last_channel);
        let mut old=serde_json::to_value(original).unwrap();
        for field in ["aspect_mode","quick_tools_expanded","muted","auto_resume_last_channel"] {
            old.as_object_mut().unwrap().remove(field);
        }
        let backward:NativeData=serde_json::from_value(old).unwrap();
        assert_eq!(backward.aspect_mode,"fit");
        assert!(!backward.quick_tools_expanded && !backward.muted && !backward.auto_resume_last_channel);
        let mut bad=backward;
        bad.aspect_mode="invalid".into();
        assert!(bad.validate().is_err());
    }
    #[test]
    fn folder_validation() {
        let mut d = NativeData::default();
        d.add_folder("VN").unwrap();
        assert!(d.add_folder("vn").is_err());
        d.validate().unwrap();
    }
}
