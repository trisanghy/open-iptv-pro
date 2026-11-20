use crate::model::Channel;
use std::io::Write;
use std::path::Path;

fn quoted(s: &str) -> String {
    s.chars().filter(|c| !c.is_control()).map(|c| if c == '"' { '_' } else { c }).collect()
}
pub fn to_m3u(channels: &[Channel]) -> String {
    let mut out = String::from("#EXTM3U\n");
    for ch in channels {
        out.push_str(&format!("#EXTINF:-1 tvg-id=\"{}\" tvg-logo=\"{}\" group-title=\"{}\",{}\n{}\n",
            quoted(&ch.tvg_id), quoted(&ch.logo), quoted(&ch.group),
            ch.name.replace('\r', " " ).replace('\n', " " ), ch.url));
    }
    out
}
pub fn save_m3u(path: &Path, channels: &[Channel]) -> Result<(), String> {
    let parent = path.parent().ok_or("Đường dẫn lưu file không hợp lệ")?;
    let mut tmp = tempfile::NamedTempFile::new_in(parent).map_err(|e| e.to_string())?;
    tmp.write_all(to_m3u(channels).as_bytes()).map_err(|e| e.to_string())?;
    tmp.persist(path).map_err(|e| e.to_string())?;
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn export_empty() { assert_eq!(to_m3u(&[]), "#EXTM3U\n"); }
}
