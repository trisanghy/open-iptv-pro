//! Conservative stream checks: a failed probe is not proof that playback is dead.
//! Explicitly avoids false 'Die' classifications on timeout, blocked HEAD,
//! anti-bot responses, or transient CDN failures.
use std::io::Read;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Health { Alive, Dead, Uncertain }
impl Health {
    pub fn label(&self) -> &'static str {
        match self { Health::Alive => "Sống", Health::Dead => "Die", Health::Uncertain => "Chưa rõ" }
    }
}

pub fn classify_http(status: u16, sniff: &[u8], content_type: &str) -> Health {
    match status {
        404 | 410 => Health::Dead,
        200..=299 => {
            let text = String::from_utf8_lossy(sniff);
            let lower = content_type.to_ascii_lowercase();
            if text.trim_start().starts_with("#EXTM3U")
                || lower.contains("video/") || lower.contains("audio/")
                || lower.contains("mpegurl") || lower.contains("octet-stream")
                || sniff.starts_with(&[0x47]) || status == 206
            { Health::Alive } else { Health::Uncertain }
        }
        _ => Health::Uncertain,
    }
}

pub fn probe(url: &str) -> Health {
    if !crate::m3u::is_media_url(url) { return Health::Dead; }
    // Non-HTTP streams require libmpv/ffprobe: HTTP probes cannot classify them.
    if !url.starts_with("http://") && !url.starts_with("https://") { return Health::Uncertain; }
    // ureq 2.x: configure timeouts on an Agent, then create the request.
    let agent = ureq::AgentBuilder::new()
        .timeout_connect(Duration::from_secs(5))
        .timeout_read(Duration::from_secs(6))
        .timeout(Duration::from_secs(12))
        .build();
    let result = agent.get(url)
        .set("Range", "bytes=0-8191")
        .set("User-Agent", "Mozilla/5.0 OpenIPTVPro-Native/0.2")
        .call();
    match result {
        Ok(response) => {
            let status = response.status();
            let content_type = response.header("Content-Type").unwrap_or("").to_owned();
            let mut sniff = Vec::new();
            let _ = response.into_reader().take(8192).read_to_end(&mut sniff);
            classify_http(status, &sniff, &content_type)
        }
        Err(ureq::Error::Status(code, _)) => classify_http(code, &[], ""),
        Err(_) => Health::Uncertain,
    }
}

pub fn check_batch(urls: &[String], parallel: usize) -> Vec<(String, Health)> {
    let selected = urls.iter().take(1000).cloned().collect::<Vec<_>>();
    if selected.is_empty() { return vec![]; }
    let selected = Arc::new(selected);
    let next = AtomicUsize::new(0);
    let results: Mutex<Vec<(String, Health)>> = Mutex::new(Vec::with_capacity(selected.len()));
    std::thread::scope(|scope| {
        for _ in 0..parallel.clamp(1, 32).min(selected.len()) {
            let selected = Arc::clone(&selected);
            let next = &next;
            let results = &results;
            scope.spawn(move || {
                loop {
                    let i = next.fetch_add(1, Ordering::Relaxed);
                    if i >= selected.len() { break; }
                    let url = selected[i].clone();
                    let health = probe(&url);
                    if let Ok(mut all) = results.lock() { all.push((url, health)); }
                }
            });
        }
    });
    results.into_inner().unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn conservative_status() {
        assert_eq!(classify_http(404, &[], ""), Health::Dead);
        assert_eq!(classify_http(403, &[], ""), Health::Uncertain);
        assert_eq!(classify_http(503, &[], ""), Health::Uncertain);
        assert_eq!(classify_http(200, b"<html>blocked</html>", "text/html"), Health::Uncertain);
        assert_eq!(classify_http(200, b"#EXTM3U\n#EXT-X-STREAM-INF", ""), Health::Alive);
        assert_eq!(classify_http(206, &[], ""), Health::Alive);
    }
    #[test]
    fn empty_batch() { assert!(check_batch(&[], 8).is_empty()); }
}
