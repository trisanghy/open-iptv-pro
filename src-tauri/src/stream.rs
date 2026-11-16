//! Local loopback relay. Only the app-provided unpredictable token can access
//! streams/snapshots. No public listener, open proxy, shell, or script execution.
use axum::{body::Body, extract::{Query, State}, http::{header, HeaderMap, HeaderValue, Response, StatusCode}, routing::get, Router};
use futures_util::{StreamExt, TryStreamExt};
use regex::Regex;
use std::{collections::HashMap, path::PathBuf, sync::Arc};
use url::Url;
use crate::{AppState, compat};

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/stream", get(stream).options(options))
        .route("/snapshot", get(snapshot).options(options))
        .route("/buffer", get(buffer).options(options))
        .route("/compat", get(compat_file).options(options))
        .with_state(state)
}
fn common(mut r: Response<Body>) -> Response<Body> {
    let h = r.headers_mut();
    h.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"));
    h.insert(header::ACCESS_CONTROL_ALLOW_HEADERS, HeaderValue::from_static("Range, Accept, Content-Type"));
    h.insert(header::ACCESS_CONTROL_EXPOSE_HEADERS, HeaderValue::from_static("Content-Length, Content-Range, Accept-Ranges"));
    h.insert("x-content-type-options", HeaderValue::from_static("nosniff"));
    // Video and HLS manifests must never survive a channel-switch re-entry.
    h.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store, no-cache, max-age=0"));
    r
}
fn response(status: StatusCode, mime: &str, bytes: impl Into<Body>) -> Response<Body> {
    common(Response::builder().status(status).header(header::CONTENT_TYPE, mime)
       .header(header::CACHE_CONTROL, "no-store").body(bytes.into()).unwrap())
}
async fn options() -> Response<Body> { response(StatusCode::NO_CONTENT, "text/plain", Body::empty()) }
fn authenticated(state: &AppState, query: &HashMap<String,String>) -> bool {
    query.get("key").is_some_and(|k| k == &state.secret)
}
pub fn valid_http_url(input: &str) -> Result<Url, String> {
    let url = Url::parse(input).map_err(|_| "URL không hợp lệ".to_string())?;
    if !matches!(url.scheme(), "http"|"https") || url.host_str().is_none() || !url.username().is_empty() || url.password().is_some() {
        return Err("Chỉ hỗ trợ URL HTTP/HTTPS không chứa thông tin đăng nhập".into());
    }
    Ok(url)
}
pub fn proxy_url(state: &AppState, remote: &str) -> String {
    format!("http://127.0.0.1:{}/stream?key={}&url={}", state.port, state.secret,
        url::form_urlencoded::byte_serialize(remote.as_bytes()).collect::<String>())
}
pub fn snapshot_url(state: &AppState, name: &str) -> String {
    format!("http://127.0.0.1:{}/snapshot?key={}&file={}", state.port, state.secret,
      url::form_urlencoded::byte_serialize(name.as_bytes()).collect::<String>())
}
pub fn buffer_url(state: &AppState,id: &str,file: &str) -> String {
    format!("http://127.0.0.1:{}/buffer?key={}&id={}&file={}",state.port,state.secret,id,file)
}
pub fn rewrite_hls(body: &str, base: &Url, state: &AppState) -> String {
    let attr = Regex::new(r#"URI="([^"]+)""#).unwrap();
    let mut out = String::with_capacity(body.len()+1024);
    for line in body.lines() {
        let line = if line.starts_with('#') {
            attr.replace_all(line, |c: &regex::Captures<'_>| {
                match base.join(&c[1]) {
                    Ok(u) if valid_http_url(u.as_str()).is_ok() => format!("URI=\"{}\"",proxy_url(state,u.as_str())),
                    _ => c[0].to_string()
                }
            }).into_owned()
        } else if line.trim().is_empty() { String::new() }
        else { base.join(line.trim()).ok().and_then(|u| valid_http_url(u.as_str()).ok().map(|_|proxy_url(state,u.as_str())))
               .unwrap_or_else(||line.to_string()) };
        out.push_str(&line);out.push('\n');
    }
    out
}
// DASH representation often uses relative BaseURL/initialization/media templates;
// a fully featured DASH URL rewrite needs an XML manifest parser and templates.
// We expose it as-is only when references are already absolute, otherwise report unsupported.
pub fn dash_has_relative_refs(text: &str) -> bool {
    let base=Regex::new(r"(?s)<BaseURL>\s*([^<]+)</BaseURL>").unwrap();
    base.captures_iter(text).any(|m| !m[1].starts_with("http://")&&!m[1].starts_with("https://")) ||
      text.contains("SegmentTemplate")
}
async fn stream(State(state):State<Arc<AppState>>,Query(q):Query<HashMap<String,String>>,headers:HeaderMap) -> Response<Body> {
    if !authenticated(&state,&q) {return response(StatusCode::FORBIDDEN,"text/plain","Forbidden");}
    let Some(raw)=q.get("url") else {return response(StatusCode::BAD_REQUEST,"text/plain","Missing stream URL");};
    let Ok(parsed)=valid_http_url(raw) else {return response(StatusCode::BAD_REQUEST,"text/plain","Invalid stream URL");};
    let path=parsed.path().to_ascii_lowercase();
    let manifest_path=path.ends_with(".m3u8")||path.ends_with(".mpd");
    let mut request=state.client.get(parsed.as_str()).header(header::USER_AGENT,"Mozilla/5.0");
    if manifest_path { request=request.header(header::CACHE_CONTROL,"no-cache").header(header::PRAGMA,"no-cache"); }
    // WebKit can send byte-range headers even for manifests; a partial playlist
    // cannot safely be rewritten as a full HLS playlist.
    if !manifest_path {
        if let Some(range)=headers.get(header::RANGE) { request=request.header(header::RANGE,range.clone()); }
    }
    let mut upstream=match request.send().await {Ok(x)=>x,Err(e)=>return response(StatusCode::BAD_GATEWAY,"text/plain",format!("Không tải được nguồn: {e}"))};
    let status=upstream.status();
    let content_type=upstream.headers().get(header::CONTENT_TYPE).and_then(|h|h.to_str().ok()).unwrap_or("application/octet-stream").to_ascii_lowercase();
    if !status.is_success(){return response(status,"text/plain",format!("Stream HTTP {}",status.as_u16()));}
    let url=upstream.url().clone();
    let resolved_path=url.path().to_ascii_lowercase();
    let is_hls=resolved_path.ends_with(".m3u8")||content_type.contains("mpegurl");
    let is_dash=resolved_path.ends_with(".mpd")||content_type.contains("dash+xml");
    let content_length=upstream.headers().get(header::CONTENT_LENGTH).cloned();
    let content_range=upstream.headers().get(header::CONTENT_RANGE).cloned();
    let accept_ranges=upstream.headers().get(header::ACCEPT_RANGES).cloned();

    // Many IPTV services return HLS from opaque paths with application/octet-stream.
    // Read only the first bounded chunk for sniffing. For binary streams preserve
    // the first chunk and forward the rest without buffering the whole video.
    let first=if is_hls||is_dash { None } else {
        match upstream.chunk().await {
            Ok(bytes)=>bytes,
            Err(e)=>return response(StatusCode::BAD_GATEWAY,"text/plain",format!("Stream response error: {e}"))
        }
    };
    let sniff=first.as_ref().is_some_and(|chunk| {
        let head=&chunk[..chunk.len().min(128)];
        String::from_utf8_lossy(head).trim_start_matches('\u{feff}').trim_start().starts_with("#EXTM3U")
    });
    if is_hls||is_dash||sniff {
        if upstream.content_length().is_some_and(|x|x>5_000_000) {
            return response(StatusCode::PAYLOAD_TOO_LARGE,"text/plain","Manifest too large");
        }
        let mut data=first.map(|b|b.to_vec()).unwrap_or_default();
        while data.len()<=5_000_000 {
            match upstream.chunk().await {
                Ok(Some(chunk))=>{
                    if data.len()+chunk.len()>5_000_000 {return response(StatusCode::PAYLOAD_TOO_LARGE,"text/plain","Manifest too large");}
                    data.extend_from_slice(&chunk);
                },
                Ok(None)=>break,
                Err(_)=>return response(StatusCode::BAD_GATEWAY,"text/plain","Cannot read manifest"),
            }
        }
        let text=String::from_utf8_lossy(&data);
        if is_dash {
            if dash_has_relative_refs(&text) {return response(StatusCode::NOT_IMPLEMENTED,"text/plain","DASH relative SegmentTemplate migration not yet implemented");}
            return response(StatusCode::OK,"application/dash+xml; charset=utf-8",text.to_string());
        }
        if !text.trim_start_matches('\u{feff}').trim_start().starts_with("#EXTM3U")||!text.contains("#EXT-X-") {
            return response(StatusCode::BAD_GATEWAY,"text/plain","Invalid HLS manifest");
        }
        return response(StatusCode::OK,"application/vnd.apple.mpegurl; charset=utf-8",rewrite_hls(&text,&url,&state));
    }
    let mut builder=Response::builder().status(status).header(header::CONTENT_TYPE,content_type).header(header::CACHE_CONTROL,"no-store");
    for (k, value) in [(header::CONTENT_LENGTH, content_length), (header::CONTENT_RANGE, content_range), (header::ACCEPT_RANGES, accept_ranges)] {
        if let Some(v)=value {builder=builder.header(k,v);}
    }
    let rest=upstream.bytes_stream().map_err(std::io::Error::other);
    let body=match first {
        Some(bytes)=>Body::from_stream(futures_util::stream::once(async move {Ok::<_,std::io::Error>(bytes)}).chain(rest)),
        None=>Body::from_stream(rest),
    };
    common(builder.body(body).unwrap())
}
fn safe_snapshot_filename(v:&str)->bool {
    !v.contains('/')&&!v.contains('\\')&&!v.contains("..")&&v.len()<=160&&v.ends_with(".jpg")&&
    v.chars().all(|c| c.is_alphanumeric()||matches!(c,'_'|'-'|'.'))
}
async fn snapshot(State(state):State<Arc<AppState>>,Query(q):Query<HashMap<String,String>>) -> Response<Body> {
    if !authenticated(&state,&q){return response(StatusCode::FORBIDDEN,"text/plain","Forbidden");}
    let file=q.get("file").map(String::as_str).unwrap_or("");
    if !safe_snapshot_filename(file){return response(StatusCode::BAD_REQUEST,"text/plain","Invalid filename");}
    let path=state.data_dir.join("snapshots").join(file);
    match tokio::fs::read(&path).await {Ok(bytes) if bytes.len()<=5_000_000 =>response(StatusCode::OK,"image/jpeg",bytes),_=>response(StatusCode::NOT_FOUND,"text/plain","Not found")}
}
// A single authenticated loopback-only FFmpeg HLS fallback. Never serve files
// supplied by the caller: IDs are checked against the *active* session.
async fn compat_file(State(state):State<Arc<AppState>>,Query(q):Query<HashMap<String,String>>) -> Response<Body> {
    if !authenticated(&state,&q) { return response(StatusCode::FORBIDDEN,"text/plain","Forbidden"); }
    let id=q.get("id").map(String::as_str).unwrap_or("");
    let file=q.get("file").map(String::as_str).unwrap_or("");
    if !Regex::new(r"^[0-9a-f]{32}$").unwrap().is_match(id) || !compat::allowed_file(file) {
        return response(StatusCode::BAD_REQUEST,"text/plain","Invalid media file");
    }
    let folder={
        let lock=state.compat.lock().await;
        match lock.as_ref() { Some(session) if session.id==id => session.folder.clone(),
            _=>return response(StatusCode::NOT_FOUND,"text/plain","Session ended") }
    };
    match tokio::fs::read(folder.join(file)).await {
        Ok(bytes) if file=="live.m3u8" && bytes.len()<=128_000 => {
            let manifest=String::from_utf8_lossy(&bytes);
            let segment=Regex::new(r"segment_\d{6}\.ts").unwrap();
            let rewritten=segment.replace_all(&manifest, |cap:&regex::Captures<'_>|compat::url(&state,id,&cap[0]));
            response(StatusCode::OK,"application/vnd.apple.mpegurl",rewritten.into_owned())
        },
        Ok(bytes) if file!="live.m3u8" && bytes.len()<=24_000_000 => response(StatusCode::OK,"video/mp2t",bytes),
        Ok(_)=>response(StatusCode::PAYLOAD_TOO_LARGE,"text/plain","Segment too large"),
        Err(_)=>response(StatusCode::NOT_FOUND,"text/plain","Segment not available"),
    }
}
async fn buffer(State(state):State<Arc<AppState>>,Query(q):Query<HashMap<String,String>>) -> Response<Body> {
    if !authenticated(&state,&q){return response(StatusCode::FORBIDDEN,"text/plain","Forbidden");}
    let id=q.get("id").map(String::as_str).unwrap_or("");
    let file=q.get("file").map(String::as_str).unwrap_or("");
    if !Regex::new(r"^[0-9a-f]{32}$").unwrap().is_match(id) || !(file=="rolling.m3u8"||Regex::new(r"^segment_\d{6}\.ts$").unwrap().is_match(file)) {
        return response(StatusCode::BAD_REQUEST,"text/plain","Invalid buffer path");
    }
    let allowed=state.timeshift.lock().await.as_ref().is_some_and(|s|s.id==id);
    if !allowed{return response(StatusCode::NOT_FOUND,"text/plain","Buffer not active");}
    let path:PathBuf=state.data_dir.join("timeshift").join(id).join(file);
    match tokio::fs::read(path).await {
        Ok(raw) if file=="rolling.m3u8" => {
            let text=String::from_utf8_lossy(&raw);
            let re=Regex::new(r"segment_\d{6}\.ts").unwrap();
            let rewritten=re.replace_all(&text, |c:&regex::Captures<'_>|buffer_url(&state,id,&c[0]));
            response(StatusCode::OK,"application/vnd.apple.mpegurl",rewritten.into_owned())
        },
        Ok(raw)=>response(StatusCode::OK,"video/mp2t",raw),
        Err(_)=>response(StatusCode::NOT_FOUND,"text/plain","Buffer warming up")
    }
}
#[cfg(test)]
mod tests {
 use super::*;
 #[test]fn rejects_non_http(){ assert!(valid_http_url("file:///etc/passwd").is_err()); assert!(valid_http_url("https://user:pw@server/x").is_err()); }
 #[test]fn snapshot_path_traversal(){assert!(!safe_snapshot_filename("../../secret.jpg"));assert!(safe_snapshot_filename("vtv1_2026.jpg"));}
}
