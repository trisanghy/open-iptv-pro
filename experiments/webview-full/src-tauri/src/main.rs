#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{io::{BufRead, BufReader}, path::PathBuf, process::{Child, Command, Stdio}, sync::{mpsc, Mutex}, time::Duration};
use serde_json::{json, Value};
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

struct BackendState { port:u16, secret:String, child:Mutex<Child> }

#[tauri::command]
fn backend_info(state: tauri::State<'_, BackendState>) -> Value {
 json!({"port":state.port,"secret":state.secret})
}
#[tauri::command]
fn open_m3u() -> Result<Option<Value>,String> {
 let file=rfd::FileDialog::new().add_filter("M3U playlist", &["m3u","m3u8","txt"]).pick_file();
 match file {
  None=>Ok(None),
  Some(p)=>{let meta=std::fs::metadata(&p).map_err(|e|e.to_string())?;
   if meta.len()>25*1024*1024{return Err("File M3U quá lớn".into())}
   let text=std::fs::read_to_string(&p).map_err(|e|e.to_string())?;
   let name=p.file_name().unwrap_or_default().to_string_lossy().to_string();
   Ok(Some(json!({"name":name,"content":text}))) }
 }
}
#[tauri::command]
fn export_m3u(name:String,content:String)->Result<Option<String>,String>{
 if content.len()>25*1024*1024{return Err("Danh sách quá lớn".into())}
 let filename=if name.ends_with(".m3u") && !name.contains('/') && !name.contains('\\') {name} else {"iptv.m3u".into()};
 let file=rfd::FileDialog::new().set_file_name(filename.as_str()).save_file();
 match file {None=>Ok(None),Some(p)=>{
  let temp=p.with_extension("m3u.tmp");std::fs::write(&temp,content).map_err(|e|e.to_string())?;
  std::fs::rename(&temp,&p).map_err(|e|e.to_string())?;
  Ok(Some(p.to_string_lossy().to_string()))
 }}
}
#[tauri::command]
fn native_notify(app:tauri::AppHandle,title:String,body:String)->Result<bool,String>{
 let t:String=title.chars().take(100).collect();let b:String=body.chars().take(200).collect();
 app.notification().builder().title(t).body(b).show().map_err(|e|e.to_string())?;Ok(true)
}
#[tauri::command]
fn open_external(url:String)->Result<(),String>{
 let allowed=["https://github.com/trisanghy/open-iptv-pro/releases","https://www.videolan.org/vlc/"];
 if !allowed.iter().any(|base|url==*base || url.starts_with(&format!("{base}/"))) {return Err("URL ngoài không hợp lệ".into());}
 open::that(url).map_err(|e|e.to_string())
}
fn native_bin(parent:&std::path::Path,name:&str)->PathBuf{
 let bin=if cfg!(windows){format!("{name}.exe")}else{name.to_string()};
 let normal=parent.join(&bin);if normal.exists(){return normal}
 let dev=std::env::current_dir().unwrap_or_default().join("src-tauri").join("binaries");
 let triple=if cfg!(target_os="macos"){
  if cfg!(target_arch="aarch64"){ "aarch64-apple-darwin" } else {"x86_64-apple-darwin"}
 }else{"x86_64-pc-windows-msvc"};
 dev.join(format!("{name}-{triple}{}",if cfg!(windows){".exe"}else{""}))
}
fn start_backend(app:&tauri::AppHandle)->Result<BackendState,String>{
 let resources=app.path().resource_dir().map_err(|e|e.to_string())?;
 let mut backend=resources.join("backend").join("main.cjs");
 if !backend.exists(){backend=std::env::current_dir().unwrap_or_default().join("backend").join("main.cjs")}
 if !backend.exists(){return Err(format!("Thiếu Node backend: {}",backend.display()))}
 let exe=std::env::current_exe().map_err(|e|e.to_string())?;
 let parent=exe.parent().ok_or("Không tìm được thư mục chương trình")?;
 let node=native_bin(parent,"iptv-node");let ffmpeg=native_bin(parent,"ffmpeg");let ffprobe=native_bin(parent,"ffprobe");
 for (name,path) in [("Node",&node),("FFmpeg",&ffmpeg),("FFprobe",&ffprobe)] {
  if !path.exists(){return Err(format!("Thiếu {} đóng gói: {}",name,path.display()))}
 }
 let mut child=Command::new(&node).arg(&backend)
  .env("OPEN_IPTV_FFMPEG",&ffmpeg).env("OPEN_IPTV_FFPROBE",&ffprobe)
  .env("ELECTRON_RUN_AS_NODE","1")
  .stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::inherit())
  .spawn().map_err(|e|format!("Không khởi động được Node backend: {e}"))?;
 let stdout=child.stdout.take().ok_or("Không lấy được backend output")?;
 let (tx,rx)=mpsc::channel();
 std::thread::spawn(move||{
  for line in BufReader::new(stdout).lines().map_while(Result::ok) {
   if let Some(data)=line.strip_prefix("OPEN_IPTV_BACKEND_READY:") {
    if let Ok(parsed)=serde_json::from_str::<Value>(data){let _=tx.send(parsed);}
   } else if !line.contains("secret") {eprintln!("[IPTV backend] {line}");}
  }
 });
 let ready=match rx.recv_timeout(Duration::from_secs(20)) {Ok(x)=>x,Err(_)=>{let _=child.kill();return Err("Node backend không khởi động sau 20 giây. Hãy xem log.".into())}};
 let port=ready.get("port").and_then(|x|x.as_u64()).ok_or("Thiếu backend port")? as u16;
 let secret=ready.get("secret").and_then(|x|x.as_str()).ok_or("Thiếu backend key")?.to_string();
 Ok(BackendState{port,secret,child:Mutex::new(child)})
}
fn main(){
 tauri::Builder::default()
  .plugin(tauri_plugin_notification::init())
  .setup(|app|{
   let state=start_backend(app.handle()).map_err(std::io::Error::other)?;
   app.manage(state);Ok(())
  })
  .invoke_handler(tauri::generate_handler![backend_info,open_m3u,export_m3u,native_notify,open_external])
  .build(tauri::generate_context!()).expect("Không build được Tauri")
  .run(|app,event|{if let tauri::RunEvent::Exit=event {if let Some(state)=app.try_state::<BackendState>() {if let Ok(mut child)=state.child.lock(){let _=child.kill();let _=child.wait();}}}});
}
