use chrono::{DateTime, Local, NaiveDateTime, TimeZone, Utc};
use quick_xml::events::{BytesStart, Event};
use serde::{Deserialize, Serialize};
use quick_xml::Reader;
use std::collections::HashMap;
use std::io::Read;
use std::path::Path;

const MAX_XML_BYTES: u64 = 35 * 1024 * 1024;
const MAX_GZIP_BYTES: u64 = 12 * 1024 * 1024;


#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GuideEntry {
    pub channel: String,
    pub title: String,
    pub start: DateTime<Utc>,
    pub stop: DateTime<Utc>,
}

#[derive(Clone, Debug)]
pub struct GuideData {
    pub now_next: HashMap<String, String>,
    pub schedule: Vec<GuideEntry>,
}

#[derive(Clone, Debug)]
struct Program {
    channel: String,
    title: String,
    description: String,
    subtitle: String,
    start: DateTime<Utc>,
    stop: DateTime<Utc>,
}

/// Prefer XMLTV's actual title; enrich generic "Phim truyện" using episode metadata.
/// Normalize tvg-id/source suffix spellings without merging distinct VTV feeds.
pub fn channel_key(value: &str) -> String {
    let head = value.split('(').next().unwrap_or(value).trim();
    let head = head.strip_suffix(".vn").unwrap_or(head);
    let mut key: String = head.chars().filter(|c| c.is_alphanumeric())
        .flat_map(|c| c.to_uppercase()).collect();
    for suffix in ["FHD", "HD", "SD", "4K"] {
        if key.starts_with("VTV") && key.ends_with(suffix) {
            let stem = key.trim_end_matches(suffix);
            if stem.strip_prefix("VTV").is_some_and(|rest| !rest.is_empty() && rest.chars().all(|c| c.is_ascii_digit())) {
                key = stem.to_owned();
                break;
            }
        }
    }
    key
}

pub fn detailed_title(title: &str, subtitle: &str, description: &str) -> String {
    let base = title.trim();
    if base.is_empty() { return String::new(); }
    let generic = matches!(base.to_lowercase().as_str(),
        "phim truyện" | "phim truyền hình" | "phim" | "phim truyện việt nam" | "phim truyện nước ngoài" | "series");
    let sub = subtitle.trim();
    if !sub.is_empty() && sub != base && sub.chars().count() <= 140 {
        return format!("{base}: {sub}");
    }
    if generic {
        let detail = description.lines().next().unwrap_or("").trim();
        let lower = detail.to_lowercase();
        let episode = ["tập ", "tập:", "episode ", "ep. ", "phần "].iter().any(|term| lower.contains(term));
        if episode && detail != base && detail.chars().count() <= 160 {
            return format!("{base}: {detail}");
        }
    }
    base.to_string()
}

fn decode_time(text: &str) -> Option<DateTime<Utc>> {
    let t = text.trim();
    if t.len() >= 20 {
        let date_part = &t[..14];
        let tz = t[14..].trim();
        if let Ok(d) = DateTime::parse_from_str(&format!("{date_part} {tz}"), "%Y%m%d%H%M%S %z") {
            return Some(d.with_timezone(&Utc));
        }
    }
    if t.len() >= 14 {
        if let Ok(d) = NaiveDateTime::parse_from_str(&t[..14], "%Y%m%d%H%M%S") {
            return Local.from_local_datetime(&d).single().map(|dt| dt.with_timezone(&Utc));
        }
    }
    None
}

fn field(e: &BytesStart<'_>, key: &[u8]) -> Option<String> {
    for a in e.attributes().flatten() {
        if a.key.as_ref() == key {
            return String::from_utf8(a.value.as_ref().to_vec()).ok();
        }
    }
    None
}

pub fn parse_now(xml: &str, now: DateTime<Utc>) -> Result<HashMap<String, String>, String> {
    let mut rdr = Reader::from_str(xml.trim_start_matches('\u{feff}'));
    rdr.config_mut().trim_text(true);
    let mut buf = Vec::new();
    let mut current: Option<Program> = None;
    let mut inside_title = false;
    let mut inside_description = false;
    let mut inside_subtitle = false;
    let mut best: HashMap<String, (DateTime<Utc>, String)> = HashMap::new();
    let mut seen = 0usize;
    loop {
        match rdr.read_event_into(&mut buf) {
            Ok(Event::Start(e)) if e.name().as_ref() == b"programme" => {
                seen += 1;
                if seen > 1_000_000 { return Err("EPG vượt 1 triệu chương trình".into()); }
                let id = field(&e, b"channel").unwrap_or_default();
                let start = field(&e, b"start").and_then(|x| decode_time(&x));
                let stop = field(&e, b"stop").and_then(|x| decode_time(&x));
                current = match (start,stop) {
                    (Some(a),Some(b)) if !id.is_empty() && a <= now && b > now =>
                        Some(Program { channel:id, title:String::new(), description:String::new(), subtitle:String::new(), start:a, stop:b }),
                    _ => None,
                };
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"title" => {
                inside_title = current.is_some();
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"desc" => { inside_description = current.is_some(); }
            Ok(Event::Start(e)) if e.name().as_ref() == b"sub-title" => { inside_subtitle = current.is_some(); }
            Ok(Event::Text(e)) if inside_title || inside_description || inside_subtitle => {
                if let Some(ref mut p) = current {
                    if let Ok(v) = e.unescape() {
                        if inside_title { p.title.push_str(&v); }
                        else if inside_description { p.description.push_str(&v); }
                        else if inside_subtitle { p.subtitle.push_str(&v); }
                    }
                }
            }
            Ok(Event::CData(e)) if inside_title || inside_description || inside_subtitle => {
                if let Some(ref mut p) = current {
                    let text = String::from_utf8_lossy(e.as_ref());
                    if inside_title { p.title.push_str(&text); }
                    else if inside_description { p.description.push_str(&text); }
                    else if inside_subtitle { p.subtitle.push_str(&text); }
                }
            }
            Ok(Event::End(e)) if e.name().as_ref() == b"title" => { inside_title = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"desc" => { inside_description = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"sub-title" => { inside_subtitle = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"programme" => {
                if let Some(p) = current.take() {
                    let title = detailed_title(&p.title, &p.subtitle, &p.description);
                    if !title.is_empty() {
                        if best.get(&p.channel).is_none_or(|(a, _)| p.start > *a) {
                            best.insert(p.channel, (p.start, title));
                        }
                    }
                }
                inside_title = false;
                inside_description = false;
                inside_subtitle = false;
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(format!("XMLTV lỗi tại byte {}: {e}", rdr.buffer_position())),
            _ => {}
        }
        buf.clear();
    }
    if seen == 0 { return Err("Không có chương trình trong XMLTV".into()); }
    Ok(best.into_iter().map(|(k, (_, v))| (k, v)).collect())
}

fn parse_next(xml: &str, now: DateTime<Utc>) -> Result<HashMap<String, (DateTime<Utc>, String)>, String> {
    let mut rdr = Reader::from_str(xml.trim_start_matches('\u{feff}'));
    rdr.config_mut().trim_text(true);
    let mut buf = Vec::new();
    let mut current: Option<Program> = None;
    let mut inside_title = false;
    let mut inside_description = false;
    let mut inside_subtitle = false;
    let mut best: HashMap<String, (DateTime<Utc>, String)> = HashMap::new();
    let mut seen = 0usize;
    loop {
        match rdr.read_event_into(&mut buf) {
            Ok(Event::Start(e)) if e.name().as_ref() == b"programme" => {
                seen += 1;
                if seen > 1_000_000 { return Err("EPG vượt 1 triệu chương trình".into()); }
                let id = field(&e, b"channel").unwrap_or_default();
                let start = field(&e, b"start").and_then(|x| decode_time(&x));
                let stop = field(&e, b"stop").and_then(|x| decode_time(&x));
                current = match (start,stop) {
                    (Some(a),Some(b)) if !id.is_empty() && a > now && a <= now + chrono::Duration::days(7) && b > a =>
                        Some(Program { channel:id, title:String::new(), description:String::new(), subtitle:String::new(), start:a, stop:b }),
                    _ => None,
                };
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"title" => {
                inside_title = current.is_some();
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"desc" => { inside_description = current.is_some(); }
            Ok(Event::Start(e)) if e.name().as_ref() == b"sub-title" => { inside_subtitle = current.is_some(); }
            Ok(Event::Text(e)) if inside_title || inside_description || inside_subtitle => {
                if let Some(ref mut p) = current {
                    if let Ok(v) = e.unescape() {
                        if inside_title { p.title.push_str(&v); }
                        else if inside_description { p.description.push_str(&v); }
                        else if inside_subtitle { p.subtitle.push_str(&v); }
                    }
                }
            }
            Ok(Event::CData(e)) if inside_title || inside_description || inside_subtitle => {
                if let Some(ref mut p) = current {
                    let text = String::from_utf8_lossy(e.as_ref());
                    if inside_title { p.title.push_str(&text); }
                    else if inside_description { p.description.push_str(&text); }
                    else if inside_subtitle { p.subtitle.push_str(&text); }
                }
            }
            Ok(Event::End(e)) if e.name().as_ref() == b"title" => { inside_title = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"desc" => { inside_description = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"sub-title" => { inside_subtitle = false; }
            Ok(Event::End(e)) if e.name().as_ref() == b"programme" => {
                if let Some(p) = current.take() {
                    let title = detailed_title(&p.title, &p.subtitle, &p.description);
                    if !title.is_empty() {
                        if best.get(&p.channel).is_none_or(|(a, _)| p.start < *a) {
                            best.insert(p.channel, (p.start, title));
                        }
                    }
                }
                inside_title = false;
                inside_description = false;
                inside_subtitle = false;
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(format!("XMLTV lỗi tại byte {}: {e}", rdr.buffer_position())),
            _ => {}
        }
        buf.clear();
    }
    if seen == 0 { return Err("Không có chương trình trong XMLTV".into()); }
    Ok(best)
}

/// Native Slint now/next presentation. Only two per-channel labels are retained;
/// each parser uses bounded XML input, never a 12,000-programme cutoff.
pub fn parse_now_and_next(xml: &str, now: DateTime<Utc>) -> Result<HashMap<String, String>, String> {
    let mut current = parse_now(xml, now)?;
    let next = parse_next(xml, now)?;
    for (id, (start, title)) in next {
        let detail = format!("Tiếp {}: {}", start.with_timezone(&Local).format("%H:%M"), title);
        current.entry(id)
            .and_modify(|present| *present = format!("Đang: {present}\n{detail}"))
            .or_insert(detail);
    }
    for title in current.values_mut() {
        if !title.starts_with("Đang: ") && !title.starts_with("Tiếp ") {
            *title = format!("Đang: {title}");
        }
    }
    Ok(current)
}


/// One bounded XMLTV pass for the native programme guide. Keep entries within
/// seven days of the current time; count all programmes and never stop after
/// 12,000. Sort once to make day/filter views cheap and predictable.
pub fn parse_schedule(xml: &str, now: DateTime<Utc>) -> Result<Vec<GuideEntry>, String> {
    let mut rdr = Reader::from_str(xml.trim_start_matches('\u{feff}'));
    rdr.config_mut().trim_text(true);
    let mut buf = Vec::new();
    let mut current: Option<Program> = None;
    let mut field_name: Option<&'static str> = None;
    let mut entries = Vec::new();
    let mut seen = 0usize;
    loop {
        match rdr.read_event_into(&mut buf) {
            Ok(Event::Start(e)) if e.name().as_ref() == b"programme" => {
                seen += 1;
                if seen > 1_000_000 { return Err("EPG vượt 1 triệu chương trình".into()); }
                let id = field(&e, b"channel").unwrap_or_default();
                let start = field(&e, b"start").and_then(|s| decode_time(&s));
                let stop = field(&e, b"stop").and_then(|s| decode_time(&s));
                current = match (start, stop) {
                    (Some(a), Some(b)) if !id.is_empty() && a < b
                        && b >= now - chrono::Duration::days(1)
                        && a < now + chrono::Duration::days(8) => Some(Program {
                            channel: id, title: String::new(), description: String::new(),
                            subtitle: String::new(), start: a, stop: b,
                        }),
                    _ => None,
                };
                field_name = None;
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"title" => {
                field_name = Some("title");
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"desc" => {
                field_name = Some("desc");
            }
            Ok(Event::Start(e)) if e.name().as_ref() == b"sub-title" => {
                field_name = Some("sub-title");
            }
            Ok(Event::Text(e)) if current.is_some() && field_name.is_some() => {
                if let (Some(p), Ok(v)) = (current.as_mut(), e.unescape()) {
                    match field_name {
                        Some("title") => p.title.push_str(&v),
                        Some("desc") => p.description.push_str(&v),
                        Some("sub-title") => p.subtitle.push_str(&v),
                        _ => {}
                    }
                }
            }
            Ok(Event::CData(e)) if current.is_some() && field_name.is_some() => {
                if let Some(p) = current.as_mut() {
                    let v = String::from_utf8_lossy(e.as_ref());
                    match field_name {
                        Some("title") => p.title.push_str(&v),
                        Some("desc") => p.description.push_str(&v),
                        Some("sub-title") => p.subtitle.push_str(&v),
                        _ => {}
                    }
                }
            }
            Ok(Event::End(e)) if matches!(e.name().as_ref(), b"title" | b"desc" | b"sub-title") => {
                field_name = None;
            }
            Ok(Event::End(e)) if e.name().as_ref() == b"programme" => {
                if let Some(p) = current.take() {
                    let title = detailed_title(&p.title, &p.subtitle, &p.description);
                    if !title.is_empty() {
                        if entries.len() >= 150_000 {
                            return Err("EPG có hơn 150.000 chương trình trong 7 ngày; cần dữ liệu nguồn nhỏ hơn".into());
                        }
                        entries.push(GuideEntry { channel: p.channel, title, start: p.start, stop: p.stop });
                    }
                }
                field_name = None;
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(format!("XMLTV lỗi tại byte {}: {e}", rdr.buffer_position())),
            _ => {}
        }
        buf.clear();
    }
    if seen == 0 { return Err("Không có chương trình trong XMLTV".into()); }
    entries.sort_unstable_by(|a,b| a.start.cmp(&b.start).then(a.channel.cmp(&b.channel)));
    Ok(entries)
}

pub fn parse_guide(xml: &str, now: DateTime<Utc>) -> Result<GuideData, String> {
    Ok(GuideData {
        now_next: parse_now_and_next(xml, now)?,
        schedule: parse_schedule(xml, now)?,
    })
}

pub fn from_file(path: &Path) -> Result<GuideData, String> {
    let limit = if path.extension().and_then(|e| e.to_str()).is_some_and(|e| e.eq_ignore_ascii_case("gz")) { MAX_GZIP_BYTES } else { MAX_XML_BYTES };
    let bytes = crate::storage::read_limited(path, limit)?;
    let xml_bytes = if bytes.starts_with(&[0x1f,0x8b]) {
        let mut decoded = Vec::new();
        flate2::read::GzDecoder::new(bytes.as_slice()).take(MAX_XML_BYTES + 1)
            .read_to_end(&mut decoded).map_err(|e| e.to_string())?;
        if decoded.len() as u64 > MAX_XML_BYTES { return Err("XMLTV sau giải nén vượt 35 MB".into()); }
        decoded
    } else { bytes };
    let text = String::from_utf8(xml_bytes).map_err(|_| "EPG XMLTV không phải UTF-8".to_owned())?;
    parse_guide(&text, Utc::now())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn full_guide_keeps_entries_beyond_12000_and_episode_details() {
        let now = DateTime::parse_from_rfc3339("2026-11-20T05:00:00+07:00").unwrap().with_timezone(&Utc);
        let mut xml = String::from("<tv>");
        for _ in 0..12_005 {
            xml.push_str(r#"<programme channel="VTV1" start="20261120060000 +0700" stop="20261120070000 +0700"><title>Thời sự</title></programme>"#);
        }
        xml.push_str(r#"<programme channel="VTV3" start="20261120080000 +0700" stop="20261120090000 +0700"><title>Phim truyện</title><sub-title>Biệt dược đen - Tập 12</sub-title></programme></tv>"#);
        let schedule = parse_schedule(&xml, now).unwrap();
        assert_eq!(schedule.len(), 12_006);
        assert_eq!(schedule.last().unwrap().channel, "VTV3");
        assert_eq!(schedule.last().unwrap().title, "Phim truyện: Biệt dược đen - Tập 12");
    }
    #[test]
    fn guide_sorts_by_real_timezone_and_skips_expired_far_future() {
        let now = DateTime::parse_from_rfc3339("2026-11-20T05:00:00+07:00").unwrap().with_timezone(&Utc);
        let xml = r#"<tv>
        <programme channel="A" start="20261120070000 +0700" stop="20261120080000 +0700"><title>A morning</title></programme>
        <programme channel="B" start="20261119235900 +0000" stop="20261120003000 +0000"><title>B evening</title></programme>
        <programme channel="C" start="20261020070000 +0700" stop="20261020080000 +0700"><title>Expired</title></programme>
        <programme channel="D" start="20261220070000 +0700" stop="20261220080000 +0700"><title>Later</title></programme></tv>"#;
        let schedule = parse_schedule(xml, now).unwrap();
        assert_eq!(schedule.len(), 2);
        assert_eq!(schedule[0].channel, "B");
        assert_eq!(schedule[1].channel, "A");
    }


    #[test]
    fn maps_vtv_ids_without_mixing_regional_or_similarly_numbered_channels() {
        assert_eq!(channel_key("VTV3 HD (Nguồn 1)"), channel_key("vtv3.vn"));
        assert_eq!(channel_key("VTV10"), "VTV10");
        assert_ne!(channel_key("VTV10"), channel_key("VTV1"));
        assert_ne!(channel_key("VTV5 Tây Nam Bộ"), channel_key("VTV5"));
    }
    #[test]
    fn enriches_generic_film_titles_but_preserves_specific_titles() {
        assert_eq!(detailed_title("Phim truyện", "", "Kẻ mai mối xứng tầm - Tập 25"),
            "Phim truyện: Kẻ mai mối xứng tầm - Tập 25");
        assert_eq!(detailed_title("Thời sự", "", "Thông tin thời tiết"), "Thời sự");
        assert_eq!(detailed_title("Phim truyện", "Biệt dược đen - Tập 12", ""),
            "Phim truyện: Biệt dược đen - Tập 12");
    }
    #[test]
    fn current_and_next_keep_programme_episode_metadata() {
        let now = DateTime::parse_from_rfc3339("2026-11-20T05:00:00+07:00").unwrap().with_timezone(&Utc);
        let xml = r#"<tv>
        <programme channel="VTV3" start="20261120040000 +0700" stop="20261120060000 +0700">
            <title>Phim truyện</title><desc>Kẻ mai mối xứng tầm - Tập 25</desc>
        </programme>
        <programme channel="VTV3" start="20261120060000 +0700" stop="20261120064500 +0700">
            <title>Cà phê sáng</title>
        </programme></tv>"#;
        let result = parse_now_and_next(xml, now).unwrap();
        assert!(result["VTV3"].contains("Đang: Phim truyện: Kẻ mai mối xứng tầm - Tập 25"));
        assert!(result["VTV3"].contains("Tiếp 06:00: Cà phê sáng") || result["VTV3"].contains("Tiếp 23:00: Cà phê sáng"));
    }
    #[test]
    fn handles_more_than_12000_programmes_and_keeps_vtv3_at_end() {
        let now = DateTime::parse_from_rfc3339("2026-11-20T05:00:00+07:00").unwrap().with_timezone(&Utc);
        let mut xml = String::from("<tv>");
        for _ in 0..13005 {
            xml.push_str(r#"<programme channel="VTV1" start="20261120040000 +0700" stop="20261120060000 +0700"><title>Chào buổi sáng</title></programme>"#);
        }
        xml.push_str(r#"<programme channel="VTV3" start="20261120040000 +0700" stop="20261120060000 +0700"><title>Phim truyện</title><desc>Kẻ mai mối xứng tầm - Tập 25</desc></programme></tv>"#);
        let result = parse_now(&xml, now).unwrap();
        assert_eq!(result["VTV1"], "Chào buổi sáng");
        assert_eq!(result["VTV3"], "Phim truyện: Kẻ mai mối xứng tầm - Tập 25");
    }
    #[test]
    fn parses_active_program() {
        let now = DateTime::parse_from_rfc3339("2026-11-11T14:00:00+07:00").unwrap().with_timezone(&Utc);
        let xml = r#"<tv><programme start="20261111130000 +0700" stop="20261111150000 +0700" channel="vtv1"><title lang="vi">Thời sự &amp; tin tức</title></programme><programme start="20261111160000 +0700" stop="20261111170000 +0700" channel="vtv1"><title>Ngày mai</title></programme></tv>"#;
        let data = parse_now(xml, now).unwrap();
        assert_eq!(data["vtv1"], "Thời sự & tin tức");
    }
}

pub fn from_url(url: &str) -> Result<GuideData, String> {
    crate::netguard::validate_public_http_url(url)?;
    let agent = crate::netguard::public_http_agent(30, 8, 20);
    let response = agent.get(url)
        .set("User-Agent", "OpenIPTVPro-Rust-Native/0.2")
        .call().map_err(|e| format!("Không tải được EPG: {e}"))?;
    let mut bytes = Vec::new();
    response.into_reader().take(MAX_XML_BYTES + 1)
        .read_to_end(&mut bytes).map_err(|e| e.to_string())?;
    if bytes.len() as u64 > MAX_XML_BYTES { return Err("EPG tải về vượt 35 MB".into()); }
    let expanded = if bytes.starts_with(&[0x1f, 0x8b]) {
        let mut decoded = Vec::new();
        flate2::read::GzDecoder::new(bytes.as_slice()).take(MAX_XML_BYTES + 1)
            .read_to_end(&mut decoded).map_err(|e| format!("Giải nén EPG lỗi: {e}"))?;
        if decoded.len() as u64 > MAX_XML_BYTES { return Err("EPG giải nén vượt 35 MB".into()); }
        decoded
    } else { bytes };
    let text = String::from_utf8(expanded).map_err(|_| "EPG không phải UTF-8".to_owned())?;
    parse_guide(&text, Utc::now())
}
