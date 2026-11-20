use crate::model::Channel;

pub fn is_media_url(raw: &str) -> bool {
    let l = raw.trim().to_ascii_lowercase();
    ["https://", "http://", "rtsp://", "rtmp://", "udp://"]
        .iter().any(|scheme| l.starts_with(scheme))
        && !raw.chars().any(|c| c.is_control() || c.is_whitespace())
        && raw.len() <= 8192
}

fn split_extinf(line: &str) -> (&str, &str) {
    let mut quoted = false;
    for (i, c) in line.char_indices() {
        if c == '"' { quoted = !quoted; }
        if c == ',' && !quoted { return (&line[..i], line[i + 1..].trim()); }
    }
    (line, "")
}

fn attr(meta: &str, key: &str) -> String {
    // Chỉ đọc thuộc tính quoted, tương thích bộ M3U của bản Electron.
    let search = format!("{key}=\"");
    let mut from = 0;
    while let Some(found) = meta[from..].find(&search) {
        let pos = from + found;
        let boundary_ok = pos == 0 || meta[..pos].chars().last().is_some_and(char::is_whitespace);
        let value_start = pos + search.len();
        if boundary_ok {
            if let Some(end) = meta[value_start..].find('"') {
                return meta[value_start..value_start + end].to_string();
            }
        }
        from = value_start;
    }
    String::new()
}

pub fn parse_m3u(content: &str, source_id: &str) -> Result<Vec<Channel>, String> {
    let text = content.trim_start_matches('\u{feff}');
    if !text.lines().any(|l| l.trim().starts_with("#EXTM3U") || l.trim().starts_with("#EXTINF:")) {
        return Err("Không phải playlist M3U (thiếu EXTM3U/EXTINF)".into());
    }
    let mut channels = Vec::new();
    let mut pending: Option<Channel> = None;
    for raw in text.lines() {
        let line = raw.trim();
        if line.starts_with("#EXTINF:") {
            let (meta, name) = split_extinf(line);
            pending = Some(Channel {
                source_id: source_id.to_owned(),
                name: if name.is_empty() { "Kênh không tên".into() } else { name.to_owned() },
                url: String::new(),
                group: { let g = attr(meta, "group-title"); if g.is_empty() { "Khác".into() } else { g } },
                tvg_id: attr(meta, "tvg-id"),
                logo: attr(meta, "tvg-logo"),
                catchup: attr(meta, "catchup"),
                catchup_source: attr(meta, "catchup-source"),
                catchup_days: attr(meta, "catchup-days"),
            });
        } else if !line.is_empty() && !line.starts_with('#') {
            if let Some(mut ch) = pending.take() {
                if is_media_url(line) {
                    ch.url = line.to_owned();
                    channels.push(ch);
                    if channels.len() > 200_000 { return Err("Playlist vượt 200.000 kênh".into()); }
                }
            }
        }
    }
    if channels.is_empty() { return Err("Playlist không chứa URL kênh hợp lệ".into()); }
    Ok(channels)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn m3u_quoted_comma() {
        let s = "\u{feff}#EXTM3U\r\n#EXTINF:-1 tvg-id=\"id.one\" tvg-name=\"News, Local\" group-title=\"News\",BBC\r\n#EXTVLCOPT:http-user-agent=Foo\r\nhttps://example.org/stream.m3u8\r\n";
        let ch = parse_m3u(s, "s1").unwrap();
        assert_eq!(ch.len(), 1);
        assert_eq!(ch[0].name, "BBC");
        assert_eq!(ch[0].group, "News");
        assert_eq!(ch[0].tvg_id, "id.one");
    }
    #[test]
    fn blocks_unsupported_scheme() {
        assert!(parse_m3u("#EXTM3U\n#EXTINF:-1,Bad\nfile:///etc/passwd", "x").is_err());
        assert!(!is_media_url("https://example.org/bad\nHeader:evil"));
    }
    #[test]
    fn parses_upstream_demo_fixture() {
        let demo = include_str!("../examples/demo.m3u");
        let channels = parse_m3u(demo, "fixture").unwrap();
        assert_eq!(channels.len(), 4);
        assert_eq!(channels[3].tvg_id, "demo.event");
    }
    #[test]
    fn preserves_replay_attrs() {
        let s = "#EXTM3U\n#EXTINF:-1 catchup=\"append\" catchup-days=\"7\" catchup-source=\"https://example.com/?start={utc}\",TV\nhttp://example.org/live\n";
        let ch = parse_m3u(s, "s").unwrap();
        assert_eq!(ch[0].catchup, "append");
        assert_eq!(ch[0].catchup_days, "7");
    }
}
