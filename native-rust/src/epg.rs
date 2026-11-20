use chrono::{DateTime, Local, NaiveDateTime, TimeZone, Utc};
use quick_xml::events::{BytesStart, Event};
use quick_xml::Reader;
use std::collections::HashMap;
use std::io::Read;
use std::path::Path;

const MAX_XML_BYTES: u64 = 35 * 1024 * 1024;
const MAX_GZIP_BYTES: u64 = 12 * 1024 * 1024;

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

pub fn from_file(path: &Path) -> Result<HashMap<String, String>, String> {
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
    parse_now(&text, Utc::now())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn enriches_generic_film_titles_but_preserves_specific_titles() {
        assert_eq!(detailed_title("Phim truyện", "", "Kẻ mai mối xứng tầm - Tập 25"),
            "Phim truyện: Kẻ mai mối xứng tầm - Tập 25");
        assert_eq!(detailed_title("Thời sự", "", "Thông tin thời tiết"), "Thời sự");
        assert_eq!(detailed_title("Phim truyện", "Biệt dược đen - Tập 12", ""),
            "Phim truyện: Biệt dược đen - Tập 12");
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

pub fn from_url(url: &str) -> Result<HashMap<String, String>, String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) || url.len() > 8192 {
        return Err("EPG URL phải là địa chỉ HTTP(S) hợp lệ".into());
    }
    // ureq 2.x: timeouts belong to AgentBuilder, not Request.
    let agent = ureq::AgentBuilder::new()
        .timeout_connect(std::time::Duration::from_secs(8))
        .timeout_read(std::time::Duration::from_secs(20))
        .timeout(std::time::Duration::from_secs(30))
        .build();
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
    parse_now(&text, Utc::now())
}
