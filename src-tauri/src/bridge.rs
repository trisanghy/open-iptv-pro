//! Electron preload -> Tauri IPC compatibility. The frontend still calls
//! window.streamleaf.*; all implemented native operations run in Rust.
use crate::{AppState,stream,smart,backup,recordings,compat,primary_store,link_checker};
use std::{sync::Arc,fs,path::PathBuf};
use tauri::{AppHandle,State};
use tauri_plugin_dialog::DialogExt;
use serde_json::{json,Value};
use uuid::Uuid;
use flate2::read::GzDecoder;
use std::io::Read;

fn item<'a>(args:&'a [Value],idx:usize)->&'a Value{args.get(idx).unwrap_or(&Value::Null)}
fn text<'a>(args:&'a [Value],idx:usize)->Result<&'a str,String>{item(args,idx).as_str().ok_or_else(||format!("Thiếu tham số {idx}"))}
fn err<E:std::fmt::Display>(e:E)->String{e.to_string()}

async fn fetch_limited(state:&Arc<AppState>,url:&str,max_bytes:usize)->Result<Vec<u8>,String>{
 stream::valid_http_url(url)?;
 let mut resp=state.client.get(url).header("User-Agent","Open-IPTV-Pro-Rust-Lab/4.23.17")
  .timeout(std::time::Duration::from_secs(25))
  .send().await.map_err(err)?.error_for_status().map_err(err)?;
 if resp.content_length().is_some_and(|l|l>max_bytes as u64){return Err("Tệp tải vượt giới hạn".into());}
 let mut out=vec![];
 while let Some(chunk)=resp.chunk().await.map_err(err)? {
  if out.len()+chunk.len()>max_bytes{return Err("Dữ liệu vượt giới hạn".into());}
  out.extend_from_slice(&chunk);
 }
 Ok(out)
}
fn guide_decode(bytes:Vec<u8>)->Result<Value,String>{
 if bytes.len()>35*1024*1024{return Err("XMLTV vượt 35MB".into());}
 let xml=if bytes.starts_with(&[0x1f,0x8b]){
  if bytes.len()>12*1024*1024{return Err("Gzip XMLTV vượt 12MB".into());}
  let dec=GzDecoder::new(bytes.as_slice());
  let mut buf=vec![];dec.take(35*1024*1024+1).read_to_end(&mut buf).map_err(err)?;
  if buf.len()>35*1024*1024{return Err("XMLTV giải nén vượt 35MB".into());}
  buf
 }else{bytes};
 let text=String::from_utf8(xml).map_err(err)?;
 let text=text.trim_start_matches('\u{feff}');
 if !text.contains("<tv")||(!text.contains("<channel")&&!text.contains("<programme")){
   return Err("Nguồn không phải XMLTV hợp lệ".into());
 }
 Ok(json!({"xml":text,"bytes":text.len()}))
}
async fn file_open(app:AppHandle,filter:&str)->Result<Option<PathBuf>,String>{
 let filter=filter.to_string();
 tokio::task::spawn_blocking(move ||{
  let dialog=app.dialog().file();
  let file=match filter.as_str(){
   "playlist"=>dialog.add_filter("IPTV playlist", &["m3u","m3u8","txt"]).blocking_pick_file(),
   "epg"=>dialog.add_filter("XMLTV EPG", &["xml","xmltv","gz"]).blocking_pick_file(),
   _=>dialog.blocking_pick_file()
  };
  file.map(|f|f.into_path().map_err(err)).transpose()
 }).await.map_err(err)?
}
async fn file_save(app:AppHandle,name:&str,filter:&str)->Result<Option<PathBuf>,String>{
 let name=name.to_string();let filter=filter.to_string();
 tokio::task::spawn_blocking(move ||{
  let builder=app.dialog().file().set_file_name(&name);
  let file=match filter.as_str(){"playlist"=>builder.add_filter("IPTV M3U", &["m3u"]).blocking_save_file(),_=>builder.blocking_save_file()};
  file.map(|f|f.into_path().map_err(err)).transpose()
 }).await.map_err(err)?
}
async fn check_link(state:&Arc<AppState>,raw:&str)->Result<Value,String>{link_checker::check(state,raw).await}
async fn media_kind(state:&Arc<AppState>,raw:&str)->Result<Value,String>{
 stream::valid_http_url(raw)?;
 let result=state.client.get(raw).timeout(std::time::Duration::from_secs(8)).header(reqwest::header::RANGE,"bytes=0-65535").send().await.map_err(err)?;
 let url=result.url().to_string();
 let ct=result.headers().get(reqwest::header::CONTENT_TYPE).and_then(|v|v.to_str().ok()).unwrap_or("").to_lowercase();
 let ranges=result.headers().get(reqwest::header::ACCEPT_RANGES).and_then(|v|v.to_str().ok()).unwrap_or("").to_lowercase();
 let mut response=result;let mut bytes=vec![];
 while bytes.len()<65536{match response.chunk().await{Ok(Some(c))=>bytes.extend_from_slice(&c[..c.len().min(65536-bytes.len())]),_=>break}}
 let body=String::from_utf8_lossy(&bytes);
 let hls=body.trim_start().starts_with("#EXTM3U")&&body.contains("#EXT-X-")||ct.contains("mpegurl")||url.to_lowercase().contains(".m3u8");
 let dash=ct.contains("dash+xml")||url.to_lowercase().contains(".mpd");
 let mp4=ct.contains("video/mp4")||url.to_lowercase().contains(".mp4");
 let event=body.contains("#EXT-X-PLAYLIST-TYPE:EVENT");
 let vod=body.contains("#EXT-X-ENDLIST")||body.contains("#EXT-X-PLAYLIST-TYPE:VOD");
 let live=hls&&!vod&&!event;
 Ok(json!({"hls":hls,"dash":dash,"format":if dash{"dash"}else if hls{"hls"}else if mp4{"mp4"}else{"unknown"},
   "event":event,"vod":vod||mp4,"mode":if vod||mp4{"vod"}else if event{"event"}else if live{"live"}else{"unknown"},
   "seekable":vod||event||(mp4&&ranges.contains("bytes")),"durationSeconds":null}))
}
async fn snapshot(state:&Arc<AppState>,url:&str,label:&str)->Result<Value,String>{
 stream::valid_http_url(url)?;
 let bin=state.ffmpeg.as_ref().ok_or("FFmpeg chưa được cài: hãy cài và khởi động lại ứng dụng")?;
 let dir=state.data_dir.join("snapshots");fs::create_dir_all(&dir).map_err(err)?;
 let label:String=label.chars().map(|c|if c.is_alphanumeric()||matches!(c,'_'|'-'){c}else{'_'}).take(70).collect();
 let name=format!("{}_{}.jpg",label,Uuid::new_v4().simple());let path=dir.join(&name);
 let mut child=tokio::process::Command::new(bin).args(["-hide_banner","-nostdin","-loglevel","error","-y",
   "-rw_timeout","7500000","-probesize","1048576","-analyzeduration","1600000","-i",url,
   "-an","-sn","-dn","-threads","1","-frames:v","1","-vf","scale=384:-2","-q:v","5"])
  .arg(&path).stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null())
  .kill_on_drop(true).spawn().map_err(err)?;
 let result=tokio::time::timeout(std::time::Duration::from_secs(12),child.wait()).await;
 if matches!(result,Ok(Ok(ref status)) if status.success()) && fs::metadata(&path).is_ok_and(|m|m.len()>300){
  return Ok(json!({"file":name,"data":stream::snapshot_url(state,&name),"method":"FFmpeg"}));
 }
 let _=child.kill().await;let _=fs::remove_file(&path);
 Err("Không chụp được khung hình (FFmpeg timeout/codec không tương thích)".into())
}
async fn remove_retired_snapshot(state:&Arc<AppState>,name:&str)->Result<Value,String>{
 // Only own UUID-named JPEGs in app-data/snapshots may be removed.
 // Never accept paths, shell input, or imported arbitrary filenames.
 let Some(base)=name.strip_suffix(".jpg") else{return Err("Invalid snapshot file".into())};
 let Some((_,uuid))=base.rsplit_once('_') else{return Err("Invalid snapshot file".into())};
 if uuid.len()!=32||!uuid.bytes().all(|x|x.is_ascii_hexdigit())||
    name.contains('/')||name.contains('\\')||name.contains("..")||name.len()>180{
   return Err("Invalid snapshot file".into());
 }
 let file=state.data_dir.join("snapshots").join(name);
 match tokio::fs::remove_file(file).await {
  Ok(())=>Ok(json!(true)),
  Err(e) if e.kind()==std::io::ErrorKind::NotFound=>Ok(json!(false)),
  Err(e)=>Err(e.to_string())
 }
}
async fn epg_fetch(state:&Arc<AppState>,raw:&str)->Result<Value,String>{
 let u=stream::valid_http_url(raw)?;
 if u.scheme()!="https"&&!(u.scheme()=="http"&&matches!(u.host_str(),Some("localhost"|"127.0.0.1"))){return Err("EPG từ xa phải dùng HTTPS".into());}
 let bytes=fetch_limited(state,raw,12*1024*1024).await?;
 let mut result=guide_decode(bytes)?;
 result["downloadedAt"]=json!(chrono::Utc::now().to_rfc3339());Ok(result)
}
async fn epg_import(app:AppHandle)->Result<Value,String>{
 let Some(file)=file_open(app,"epg").await? else{return Ok(Value::Null)};
 let bytes=fs::read(&file).map_err(err)?;
 let mut result=guide_decode(bytes)?;
 result["name"]=json!(file.file_name().and_then(|f|f.to_str()).unwrap_or("").to_string());
 result["importedAt"]=json!(chrono::Utc::now().to_rfc3339());Ok(result)
}
fn version_status()->Value{json!({"phase":"disabled","message":"Nhánh thử nghiệm Tauri độc lập: đã tắt cập nhật từ bản Electron chính.","mode":"manual","progress":0})}

#[tauri::command]
pub async fn bridge(app:AppHandle,state:State<'_,Arc<AppState>>,op:String,args:Vec<Value>)->Result<Value,String>{
 let s=state.inner();
 match op.as_str() {
  "app:capabilities"=>Ok(json!({"native":true,"platform":if cfg!(target_os="windows"){"win32"}else if cfg!(target_os="macos"){"darwin"}else{"linux"},
   "ffmpegExists":s.ffmpeg.is_some(),"snapshotBase":format!("http://127.0.0.1:{}/snapshot?key={}&file=",s.port,s.secret),
   "version":"4.23.17-tauri.7","runtime":"tauri2-rust"})),
  "storage:read"=>primary_store::read(&s.data_dir),
  "storage:write"=>primary_store::write(&s.data_dir,text(&args,0)?),
  "source:readFile"=>{
    let Some(file)=file_open(app.clone(),"playlist").await? else{return Ok(Value::Null)};
    if fs::metadata(&file).map_err(err)?.len()>25*1024*1024{return Err("M3U vượt 25MB".into());}
    let content=fs::read_to_string(&file).map_err(err)?;
    Ok(json!({"name":file.file_name().and_then(|f|f.to_str()).unwrap_or(""),"content":content}))
  },
  "source:readUrl"=>{
   let raw=text(&args,0)?;let bytes=fetch_limited(s,raw,25*1024*1024).await?;
   Ok(json!({"content":String::from_utf8(bytes).map_err(err)?.trim_start_matches('\u{feff}')}))
  },
  "media:proxy"=>{let raw=text(&args,0)?;stream::valid_http_url(raw)?;Ok(json!(stream::proxy_url(s,raw)))},
  "media:kind"=>media_kind(s,text(&args,0)?).await,
  "media:compatStart"=>compat::start(s,text(&args,0)?).await,
  "media:compatStop"=>{compat::stop(s).await;Ok(json!(true))},
  "link:check"=>check_link(s,text(&args,0)?).await,
  "snapshot:make"=>snapshot(s,text(&args,0)?,item(&args,1).as_str().unwrap_or("channel")).await,
  "snapshot:delete"=>remove_retired_snapshot(s,text(&args,0)?).await,
  "file:export"=>{
    let name=item(&args,0).as_str().unwrap_or("iptv.m3u");
    let content=text(&args,1)?;
    if content.len()>25*1024*1024{return Err("Nội dung export vượt 25MB".into());}
    let Some(path)=file_save(app.clone(),name,"playlist").await? else{return Ok(Value::Null)};
    let temp=path.with_extension(format!("tmp-{}",Uuid::new_v4()));
    fs::write(&temp,content).map_err(err)?;
    fs::rename(temp,&path).map_err(err)?;Ok(json!(path.to_string_lossy().to_string()))
  },
  "epg:fetch"=>epg_fetch(s,text(&args,0)?).await,
  "epg:importFile"=>epg_import(app.clone()).await,
  "smart:countries"=>smart::countries(s).await,
  "smart:country"=>smart::load(s,&json!({"kind":"country","code":text(&args,0)?})).await,
  "smart:catalog-options"=>smart::catalog_options(s,text(&args,0)?).await,
  "smart:load"=>smart::load(s,item(&args,0)).await,
  "smart:check"=>{smart::safe_stream_url(text(&args,0)?)?;check_link(s,text(&args,0)?).await},
  "source:listRepo"=>smart::repo_list(s,text(&args,0)?).await,
  "timeshift:start"=>recordings::start_timeshift(s,text(&args,0)?,item(&args,1).as_u64().unwrap_or(10) as u32).await,
  "timeshift:stop"=>{recordings::stop_timeshift(s).await;Ok(json!(true))},
  "timeshift:status"=>Ok(recordings::timeshift_status(s).await),
  "dvr:list"=>Ok(s.dvr.lock().await.list()),
  "dvr:create"=>{
    if s.ffmpeg.is_none(){return Err("FFmpeg chưa được cài cho Rust Lab".into());}
    s.dvr.lock().await.create(item(&args,0))
  },
  "dvr:stop"=>recordings::dvr_stop(s,text(&args,0)?).await,
  "dvr:chooseDirectory"=>{
    let handle=app.clone();
    let path=tokio::task::spawn_blocking(move||{
      handle.dialog().file().blocking_pick_folder().map(|x|x.into_path().map_err(err)).transpose()
    }).await.map_err(err)??;
    let Some(p)=path else{return Ok(Value::Null)};
    fs::create_dir_all(&p).map_err(err)?;
    let mut d=s.dvr.lock().await;d.directory=p.clone();d.persist()?;Ok(json!(p.to_string_lossy()))
  },
  "dvr:openDirectory"=>{
    let dir=s.dvr.lock().await.directory.clone();
    tauri_plugin_opener::open_path(&dir,None::<&str>).map_err(err)?;
    Ok(json!(""))
  },
  "dvr:reveal"=>{
    let id=text(&args,0)?;
    let file=s.dvr.lock().await.jobs.iter().find(|j|j.id==id).and_then(|j|j.file.clone()).ok_or("Không có file")?;
    tauri_plugin_opener::open_path(&file,None::<&str>).map_err(err)?;Ok(json!(true))
  },
  "backup:export"=>backup::export(&app,s,item(&args,0).clone(),item(&args,1).as_bool().unwrap_or(false)).await,
  "backup:inspect"=>backup::inspect(&app,s).await,
  "backup:restore"=>backup::restore(s,text(&args,0)?).await,
  "backup:finish"=>backup::finish(s,text(&args,0)?,item(&args,1).as_bool().unwrap_or(false)).await,
  "update:check"|"update:status"=>Ok(version_status()),
  "update:download"|"update:install"|"update:openDownloaded"=>Err("Bản Tauri Lab không sử dụng cập nhật của nhánh Electron chính".into()),
  "update:openRelease"|"update:openReleases"=>{
    tauri_plugin_opener::open_url("https://github.com/trisanghy/open-iptv-pro/releases",None::<&str>).map_err(err)?;
    Ok(json!(true))
  },
  "cast:discover"|"airplay:discover"=>Ok(json!([])),
  "cast:status"=>Ok(json!({"active":false,"supported":false})),
  "cast:stop"=>Ok(json!(true)),
  "cast:play"|"cast:lan"=>Err("Google Cast / liên kết LAN chưa được chuyển sang Rust ở bản thử nghiệm này".into()),
  "airplay:open"=>{
    let url=text(&args,0)?;stream::valid_http_url(url)?;
    #[cfg(target_os="macos")]
    {std::process::Command::new("open").args(["-a","Safari",url]).spawn().map_err(err)?;Ok(json!(true))}
    #[cfg(not(target_os="macos"))]
    {Err("AirPlay qua Safari chỉ hỗ trợ macOS".into())}
  },
  "reminder:notify"=>Ok(json!(false)),
  "system:openVLC"=>{
    tauri_plugin_opener::open_url("https://www.videolan.org/vlc/",None::<&str>).map_err(err)?;Ok(json!(true))
  },
  _=>Err(format!("Tauri Rust chưa triển khai lệnh IPC: {op}")),
 }
}
