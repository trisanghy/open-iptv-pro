//! Conservative bounded live-stream checker. Verify HLS **media segments**,
//! not only the playlist; never use Range on a manifest or assume 403=Die.
use crate::{AppState,stream};
use std::{sync::Arc,time::Duration};
use reqwest::{header,Url};
use serde_json::{json,Value};

const BYTES:usize=98_304;
const AGENT:&str="Mozilla/5.0"; // Match actual Rust relay; do not trigger CDN anti-bot rules with a crawler UA.

#[derive(Clone)]
struct Probe{code:u16,final_url:Url,kind:String,bytes:Vec<u8>}
async fn get(state:&Arc<AppState>,url:&Url,strict:bool)->Result<Probe,String>{
 // A normal GET, not a byte range, avoids false 404/403 on HLS manifests
 // and on CDNs that do not implement Range correctly.
 let mut resp=if strict {crate::safe_network::get(url).await?}else{
   state.client.get(url.clone()).header(header::USER_AGENT,AGENT)
    .timeout(Duration::from_secs(9)).send().await.map_err(|e|format!("Mạng: {}",e.to_string().chars().take(70).collect::<String>()))?
  };
 let code=resp.status().as_u16();
 let final_url=resp.url().clone();
 let kind=resp.headers().get(header::CONTENT_TYPE).and_then(|v|v.to_str().ok()).unwrap_or("").to_ascii_lowercase();
 let mut bytes=Vec::new();
 if (200..300).contains(&code) {
  let collect=async{
    while bytes.len()<BYTES {
     match resp.chunk().await {
      Ok(Some(chunk))=>bytes.extend_from_slice(&chunk[..chunk.len().min(BYTES-bytes.len())]),
      Ok(None)=>break,
      Err(_)=>break,
     }
    }
  };
  let _=tokio::time::timeout(Duration::from_secs(6),collect).await;
 }
 Ok(Probe{code,final_url,kind,bytes})
}
fn signature(bytes:&[u8],kind:&str)->bool{
 if bytes.len()<160{return false;}
 let s=String::from_utf8_lossy(&bytes[..bytes.len().min(180)]).to_ascii_lowercase();
 if s.trim_start().starts_with('<')||s.contains("<!doctype html")||s.contains("<html") {return false;}
 if bytes.len()>=8 && (&bytes[4..8]==b"ftyp"||&bytes[4..8]==b"moof"||&bytes[4..8]==b"styp") {return true;}
 if bytes.len()>=564 && (0..188).any(|i|bytes[i]==0x47&&bytes[i+188]==0x47&&bytes[i+376]==0x47){return true;}
 if bytes.len()>800 && bytes[0]==0xff && bytes[1]&0xf0==0xf0{return true;}
 (kind.contains("video/mp2t")||kind.contains("video/mp4")||kind.contains("audio/aac")||kind.contains("audio/mpeg"))&&bytes.len()>=400
}
fn is_hls(p:&Probe)->bool{
 let s=String::from_utf8_lossy(&p.bytes);
 (s.trim_start_matches('\u{feff}').trim_start().starts_with("#EXTM3U")&&s.contains("#EXT-X-")) ||
 p.kind.contains("mpegurl")
}
fn absolute(base:&Url,raw:&str)->Option<Url>{
 let v=base.join(raw.trim()).ok()?;
 // Only HTTP(S) sources may become remote probes; reject unsafe schemes.
 stream::valid_http_url(v.as_str()).ok()
}
fn references(content:&str,master:bool)->Vec<String>{
 let mut out=Vec::new();let mut expect_variant=false;
 for line in content.lines(){
  let l=line.trim();
  if l.starts_with("#EXT-X-STREAM-INF:"){expect_variant=true;continue;}
  if l.is_empty()||l.starts_with('#'){continue;}
  if !master||expect_variant {out.push(l.to_string());}
  expect_variant=false;
 }
 out
}
fn hls_master(content:&str)->bool{content.contains("#EXT-X-STREAM-INF:")}
fn positive(reason:&str)->Value{json!({"status":"alive","positiveEvidence":true,"confirmedDead":false,"reason":reason})}
fn unsure(reason:&str)->Value{json!({"status":"uncertain","positiveEvidence":false,"confirmedDead":false,"reason":reason})}

async fn hls_media(state:&Arc<AppState>,playlist:&Probe,strict:bool)->Value{
 let mut current=playlist.clone();
 for _ in 0..2{
  let text=String::from_utf8_lossy(&current.bytes);
  if !hls_master(&text){break;}
  let links=references(&text,true);
  let mut next=None;
  for line in links.iter().take(2){
   if let Some(url)=absolute(&current.final_url,line){
    if let Ok(probe)=get(state,&url,strict).await{
     if probe.code>=200&&probe.code<300&&is_hls(&probe){next=Some(probe);break;}
    }
   }
  }
  match next{Some(p)=>{current=p;},None=>return unsure("HLS master có phản hồi nhưng không đọc được media playlist")}
 }
 let text=String::from_utf8_lossy(&current.bytes);
 if hls_master(&text){return unsure("HLS master nhiều cấp; chưa xác nhận video");}
 let references=references(&text,false);
 if references.is_empty(){return unsure("Playlist HLS không có phân đoạn video để kiểm tra");}
 let encrypted=text.contains("#EXT-X-KEY:");
 // Live HLS often has already-expired earlier segments; check the newest first.
 let mut reason="Không lấy được segment video HLS mới nhất";
 for part in references.iter().rev().take(3){
  let Some(url)=absolute(&current.final_url,part) else {continue;};
  match get(state,&url,strict).await{
   Ok(p) if (200..300).contains(&p.code)=>{
    if signature(&p.bytes,&p.kind) || (encrypted&&p.bytes.len()>512&&
       !String::from_utf8_lossy(&p.bytes[..p.bytes.len().min(80)]).trim_start().starts_with('<')){
      return positive("Đã nhận và xác minh segment video/audio HLS thực tế");
    }
    reason="Segment trả HTTP 2xx nhưng dữ liệu không phải video/audio xác minh được";
   },
   Ok(p)=>{if p.code==403||p.code==429{reason="CDN từ chối kiểm tra segment, không kết luận Die";}},
   Err(_)=>{reason="Không truy cập được segment HLS; chưa kết luận Die";},
  }
 }
 unsure(reason)
}

async fn check_inner(state:&Arc<AppState>,raw:&str,strict:bool)->Result<Value,String>{
 let url=stream::valid_http_url(raw)?;
 let mut fails=Vec::new();
 for attempt in 0..2{
  let response=get(state,&url,strict).await;
  match response{
   Err(_)=>{fails.push(0);},
   Ok(probe)=>{
    fails.push(probe.code);
    if (200..300).contains(&probe.code){
     if is_hls(&probe){
      let mut result=hls_media(state,&probe,strict).await;
      result["rounds"]=json!(attempt+1);
      return Ok(result);
     }
     if signature(&probe.bytes,&probe.kind){let mut p=positive("Nhận được dữ liệu video/audio hợp lệ từ URL nguồn");p["rounds"]=json!(attempt+1);return Ok(p);}
     return Ok(unsure("URL phản hồi nhưng chưa đủ bằng chứng dữ liệu media; không kết luận Die"));
    }
   }
  }
  if attempt==0{tokio::time::sleep(Duration::from_millis(300)).await;}
 }
 if fails.len()==2&&fails[0]==fails[1]&&(fails[0]==404||fails[0]==410){
  return Ok(json!({"status":"dead","confirmedDead":true,"positiveEvidence":false,
   "reason":format!("GET thông thường trả HTTP {} hai lần, chưa có bằng chứng phát thành công mới",fails[0]),"httpStatus":fails[0],"rounds":2}));
 }
 Ok(json!({"status":"uncertain","confirmedDead":false,"positiveEvidence":false,
  "reason":format!("Kết quả HTTP {:?} không đủ bằng chứng xác nhận Die",fails),"rounds":2}))
}

pub async fn check(state:&Arc<AppState>,raw:&str)->Result<Value,String>{
 check_inner(state,raw,false).await
}
pub async fn check_discovery(state:&Arc<AppState>,raw:&str)->Result<Value,String>{
 crate::smart::safe_stream_url(raw)?;
 check_inner(state,raw,true).await
}

#[cfg(test)]
mod tests{
 use super::*;
 #[test] fn playlist_references(){
  let master="#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\nlow/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1700000\nhigh/index.m3u8";
  assert_eq!(references(master,true),vec!["low/index.m3u8","high/index.m3u8"]);
  let media="#EXTM3U\n#EXT-X-TARGETDURATION:4\n#EXTINF:4,\nseg1.ts\n#EXTINF:4,\nseg2.ts";
  assert_eq!(references(media,false),vec!["seg1.ts","seg2.ts"]);
  assert!(hls_master(master));assert!(!hls_master(media));
 }
 #[test] fn media_signatures(){
  let mut ts=vec![0u8;600];ts[0]=0x47;ts[188]=0x47;ts[376]=0x47;
  assert!(signature(&ts,"application/octet-stream"));
  assert!(!signature(b"<html>invalid</html>","video/mp2t"));
 }
 async fn fixture() -> (Arc<AppState>,String,tokio::task::JoinHandle<()>) {
  use axum::{routing::get,Router,http::StatusCode};
  let listener=tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
  let address=listener.local_addr().unwrap();
  let server=Router::new()
   .route("/live.m3u8",get(||async{"#EXTM3U\n#EXT-X-TARGETDURATION:5\n#EXTINF:5,\nold.ts\n#EXTINF:5,\nnew.ts\n"}))
   .route("/old.ts",get(||async{StatusCode::NOT_FOUND}))
   .route("/new.ts",get(||async{
      let mut data=vec![0u8;600];data[0]=0x47;data[188]=0x47;data[376]=0x47;
      ([("content-type","video/mp2t")],data)
   }))
   .route("/master.m3u8",get(||async{"#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=700000\nlive.m3u8\n"}))
   .route("/gone",get(||async{StatusCode::NOT_FOUND}))
   .route("/forbidden",get(||async{StatusCode::FORBIDDEN}));
  let server_task=tokio::spawn(async move{let _=axum::serve(listener,server).await;});
  let dir=std::env::temp_dir().join(format!("iptv-checker-{}",uuid::Uuid::new_v4()));
  std::fs::create_dir_all(&dir).unwrap();
  let state=Arc::new(AppState{
   client:reqwest::Client::new(),data_dir:dir.clone(),port:0,secret:"test".into(),ffmpeg:None,
   timeshift:tokio::sync::Mutex::new(None),compat:tokio::sync::Mutex::new(None),
   dvr:tokio::sync::Mutex::new(crate::recordings::DvrStore::load(&dir)),
   pending_backup:tokio::sync::Mutex::new(None),pending_restore:tokio::sync::Mutex::new(None)
  });
  (state,format!("http://{}",address),server_task)
 }
 #[tokio::test]
 async fn media_playlist_last_segment_and_master_are_alive(){
  let (state,url,server)=fixture().await;
  let result=check(&state,&format!("{url}/live.m3u8")).await.unwrap();
  assert_eq!(result["status"],"alive");assert_eq!(result["positiveEvidence"],true);
  let nested=check(&state,&format!("{url}/master.m3u8")).await.unwrap();
  assert_eq!(nested["status"],"alive");
  server.abort();
 }
 #[tokio::test]
 async fn regular_404_is_confirmed_only_after_two_gets_and_403_is_uncertain(){
  let (state,url,server)=fixture().await;
  let gone=check(&state,&format!("{url}/gone")).await.unwrap();
  assert_eq!(gone["status"],"dead");assert_eq!(gone["confirmedDead"],true);
  let forbidden=check(&state,&format!("{url}/forbidden")).await.unwrap();
  assert_eq!(forbidden["status"],"uncertain");
  server.abort();
 }
}
