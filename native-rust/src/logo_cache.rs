//! Bounded, asynchronous M3U tvg-logo cache. No network calls on Slint's
//! event loop; never fetch private-network hosts or unbounded image payloads.
use std::hash::{Hash, Hasher};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::collections::hash_map::DefaultHasher;

const MAX_LOGO_BYTES:u64=256*1024;
fn cache_dir()->Result<PathBuf,String>{
    let mut path=crate::storage::app_data_file()?;
    path.set_file_name("channel-logos");
    Ok(path)
}
fn logo_hash(url:&str)->String{
    let mut h=DefaultHasher::new();
    url.hash(&mut h);
    format!("{:016x}",h.finish())
}
fn supported_extension(bytes:&[u8])->Option<&'static str>{
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") && bytes.len()>=24 {
        let width=u32::from_be_bytes(bytes[16..20].try_into().ok()?);
        let height=u32::from_be_bytes(bytes[20..24].try_into().ok()?);
        if width>0 && width<=1024 && height>0 && height<=1024 {
            return Some("png");
        }
    }
    if bytes.starts_with(&[0xff,0xd8,0xff]) {return Some("jpg");}
    None
}
pub fn cached(url:&str)->Option<PathBuf>{
    if crate::netguard::validate_public_http_url(url).is_err(){return None;}
    let directory=cache_dir().ok()?;
    for ext in ["png","jpg"] {
        let path=directory.join(format!("{}.{}",logo_hash(url),ext));
        if path.is_file() {return Some(path);}
    }
    None
}
pub fn fetch(url:&str)->Result<Option<PathBuf>,String>{
    if crate::netguard::validate_public_http_url(url).is_err() {return Ok(None);}
    if let Some(path)=cached(url){return Ok(Some(path));}
    let agent=crate::netguard::public_http_agent(8,4,5);
    let response=agent.get(url).set("User-Agent","OpenIPTVPro-RustNative/0.3").call()
        .map_err(|e|format!("Logo download failed: {e}"))?;
    let mut bytes=Vec::new();
    response.into_reader().take(MAX_LOGO_BYTES+1)
        .read_to_end(&mut bytes).map_err(|e|e.to_string())?;
    if bytes.len() as u64>MAX_LOGO_BYTES{return Err("Logo vượt 256KB".into());}
    let Some(ext)=supported_extension(&bytes) else{return Ok(None)};
    let dir=cache_dir()?;
    std::fs::create_dir_all(&dir).map_err(|e|e.to_string())?;
    let path=dir.join(format!("{}.{}",logo_hash(url),ext));
    if path.exists(){return Ok(Some(path));}
    let mut tmp=tempfile::NamedTempFile::new_in(&dir).map_err(|e|e.to_string())?;
    use std::io::Write;
    tmp.write_all(&bytes).map_err(|e|e.to_string())?;
    tmp.persist(&path).map_err(|e|e.to_string())?;
    Ok(Some(path))
}
#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn logo_parser_rejects_unbounded_png_dimensions(){
        let mut png=b"\x89PNG\r\n\x1a\n".to_vec();
        png.extend_from_slice(&[0;8]);
        png.extend_from_slice(&640_u32.to_be_bytes());
        png.extend_from_slice(&360_u32.to_be_bytes());
        assert_eq!(supported_extension(&png),Some("png"));
        png[16..20].copy_from_slice(&100_000_u32.to_be_bytes());
        assert_eq!(supported_extension(&png),None);
        assert_eq!(supported_extension(b"<svg/>"),None);
    }
    #[test]
    fn unsafe_logo_urls_are_rejected(){
        assert!(cached("http://127.0.0.1/secret.png").is_none());
        assert!(fetch("http://10.0.0.1/img").unwrap().is_none());
        assert_eq!(logo_hash("https://example.org/a"),logo_hash("https://example.org/a"));
    }
}
