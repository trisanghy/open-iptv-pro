//! Open IPTV Pro Rust Lab: optional local Whisper / Piper / Argos services.
//! v20 port based on the user's Electron v4.23.45 source. No cloud speech API.
//! Downloads require explicit UI action; pinned SHA-256 and app-private directories.
use std::{fs, path::{Path,PathBuf}, sync::{Arc,atomic::{AtomicBool,AtomicU64,Ordering}}, time::Duration};
use tokio::{process::{Command,Child,ChildStdin}, sync::Mutex, io::{AsyncWriteExt,AsyncBufReadExt,BufReader}, process::ChildStdout};
use std::process::Stdio;
use serde_json::{json,Value};
use sha2::{Digest,Sha256};
use base64::Engine;
use tauri::{AppHandle,Emitter};
use futures_util::StreamExt;
use uuid::Uuid;

const VIENEU_VOICES:[&str;25]=[
 "Adam bựa","Trúc Ly","Thiện Minh","Mai Anh","Hải Đăng","Thùy Dung",
 "Thiền Tâm Đức","Ngọc Huyền","Quang Sơn","Ngọc Trân","Minh Đức","Phạm Tuyên",
 "Thái Sơn","Xuân Vĩnh","Thanh Bình","Ngọc Linh","Đoan Trang","Thục Đoan",
 "Minh Triết","Mỹ Duyên","Quỳnh Anh","Đức Trí","Kim Thanh","Adam","Quốc Tuấn"];
const NATURAL_PREFIX:&str="vieneu:";
const NATIVE_PREFIX:&str="piper:";
struct NaturalWorker{
 child:Child,
 input:ChildStdin,
 output:BufReader<ChildStdout>,
}
struct ScopedFolder(PathBuf);
impl Drop for ScopedFolder {fn drop(&mut self){let _=fs::remove_dir_all(&self.0);}}
pub struct LocalAi {
 pub root: PathBuf,
 pub ffmpeg: Option<String>,
 pub caption: Mutex<Option<tokio::task::JoinHandle<()>>>,
 pub tts: Mutex<Option<tokio::task::AbortHandle>>,
 natural_worker: Mutex<Option<NaturalWorker>>,
 pub next: AtomicU64,
 pub installing_caption: AtomicBool,
 pub installing_tts: AtomicBool,
}
impl LocalAi {
 pub fn new(root:PathBuf,ffmpeg:Option<String>)->Self{
  Self{root,ffmpeg,caption:Mutex::new(None),tts:Mutex::new(None),natural_worker:Mutex::new(None),next:AtomicU64::new(0),installing_caption:AtomicBool::new(false),installing_tts:AtomicBool::new(false)}
 }
 fn caption_root(&self)->PathBuf{self.root.join("live-caption")}
 fn tts_root(&self)->PathBuf{self.root.join("local-tts")}
}
fn error<E:std::fmt::Display>(e:E)->String{e.to_string()}
fn exists(path:&Path,min:u64)->bool{fs::metadata(path).is_ok_and(|m|m.is_file()&&m.len()>=min)}
fn exec_name(name:&str)->String{if cfg!(windows){format!("{name}.exe")}else{name.to_owned()}}
fn find_named(dir:&Path,name:&str,depth:u8)->Option<PathBuf>{
 if depth>4{return None;}
 for ent in fs::read_dir(dir).ok()?.flatten(){
  let p=ent.path();
  if p.is_file()&&p.file_name().and_then(|s|s.to_str())==Some(name)&&exists(&p,50_000){return Some(p);}
  if p.is_dir(){if let Some(result)=find_named(&p,name,depth+1){return Some(result);}}
 }
 None
}
fn caption_files(ai:&LocalAi)->(Option<PathBuf>,Option<PathBuf>){
 let root=ai.caption_root();
 let cfg:Value=fs::read(root.join("config.json")).ok().and_then(|d|serde_json::from_slice(&d).ok()).unwrap_or(Value::Null);
 let exe=exec_name("whisper-cli");
 let binary=cfg["binary"].as_str().map(PathBuf::from).filter(|p|exists(p,1))
  .or_else(||std::env::var("OPEN_IPTV_WHISPER_BIN").ok().map(PathBuf::from).filter(|p|exists(p,1)))
  .or_else(||find_named(&root.join("auto/binary"),&exe,0));
 let model=cfg["model"].as_str().map(PathBuf::from).filter(|p|exists(p,1_000_000))
  .or_else(||std::env::var("OPEN_IPTV_WHISPER_MODEL").ok().map(PathBuf::from).filter(|p|exists(p,1_000_000)))
  .or_else(||Some(root.join("auto/ggml-base.bin")).filter(|p|exists(p,1_000_000)));
 (binary,model)
}
pub fn caption_status(ai:&LocalAi)->Value{
 let (bin,model)=caption_files(ai);
 let ff=ai.ffmpeg.is_some();
 json!({"available":ff&&bin.is_some()&&model.is_some(),"ffmpeg":ff,"whisper":bin.is_some(),"model":model.is_some(),
  "modelName":model.as_ref().and_then(|p|p.file_name()).map(|x|x.to_string_lossy().to_string()).unwrap_or_default(),
  "installing":ai.installing_caption.load(Ordering::SeqCst),"target":"en",
  "reason":if !ff{"Thiếu FFmpeg"}else if bin.is_none(){"Chưa cài whisper-cli"}else if model.is_none(){"Chưa cài mô hình GGML"}else{""}})
}
pub fn caption_choose(ai:&LocalAi,kind:&str,path:&Path)->Result<Value,String>{
 if !matches!(kind,"binary"|"model"){return Err("Loại tệp Whisper không hợp lệ".into());}
 let path=fs::canonicalize(path).map_err(error)?;
 if !exists(&path,if kind=="model"{1_000_000}else{50_000}){return Err("Tệp Whisper không hợp lệ".into());}
 if kind=="model" && path.extension().and_then(|s|s.to_str())!=Some("bin"){return Err("Mô hình Whisper phải là .bin".into());}
 if kind=="binary"&&path.file_name().and_then(|s|s.to_str())!=Some(exec_name("whisper-cli").as_str()){return Err("Cần chọn whisper-cli đúng tên".into());}
 let root=ai.caption_root();fs::create_dir_all(&root).map_err(error)?;
 let config=root.join("config.json");
 let mut cfg:Value=fs::read(&config).ok().and_then(|d|serde_json::from_slice(&d).ok()).unwrap_or(json!({}));
 cfg[kind]=json!(path.to_string_lossy().to_string());
 let temp=root.join("config.json.tmp");fs::write(&temp,serde_json::to_vec_pretty(&cfg).map_err(error)?).map_err(error)?;
 fs::rename(temp,config).map_err(error)?;
 Ok(caption_status(ai))
}
fn whisper_asset()->Option<(&'static str,&'static str)>{
 match (std::env::consts::OS,std::env::consts::ARCH){
 ("macos","aarch64")=>Some(("whisper-cpp-darwin-arm64.zip","d033bd3f590cad50f39957bf86354f87b44394cb001e3f78a7b47264358103e3")),
 ("macos","x86_64")=>Some(("whisper-cpp-darwin-x64.zip","f0f2ab6c2e92b7022ac02f0759a7a38f3ea110764e00b05a6f0d6c1dcadd571c")),
 ("windows","x86_64")=>Some(("whisper-cpp-win32-x64-cpu.zip","80f6b6481794825f65043001e408e70aea4257918b15906b7e070d2c7b205da5")),
 _=>None,
 }
}
fn allowed_download_host(host:&str)->bool{
 matches!(host,"github.com"|"release-assets.githubusercontent.com"|"objects.githubusercontent.com"|"huggingface.co"|"releases.astral.sh") || host=="hf.co" || host.ends_with(".hf.co")
}
async fn download_verified(app:&AppHandle,event:&str,url:&str,target:&Path,sha:&str,limit:u64)->Result<(),String>{
 let origin=reqwest::Url::parse(url).map_err(error)?;
 if origin.scheme()!="https"||!origin.host_str().is_some_and(allowed_download_host){return Err("Nguồn tải không nằm trong danh sách cho phép".into());}
 let client=reqwest::Client::builder().redirect(reqwest::redirect::Policy::custom(|attempt|{
  if attempt.previous().len()>8{attempt.error("Too many redirects")}
  else if attempt.url().scheme()!="https"||!attempt.url().host_str().is_some_and(allowed_download_host){attempt.error("Unexpected redirect host")}
  else{attempt.follow()}
 })).connect_timeout(Duration::from_secs(25)).read_timeout(Duration::from_secs(75))
 .timeout(Duration::from_secs(1800)).build().map_err(error)?;
 let resp=client.get(origin).send().await.map_err(error)?.error_for_status().map_err(error)?;
 if resp.content_length().is_some_and(|n|n>limit){return Err("Tệp vượt giới hạn tải".into());}
 let temp=target.with_extension("download-part");
 if let Some(parent)=temp.parent(){tokio::fs::create_dir_all(parent).await.map_err(error)?;}
 let result=async{
  let mut file=tokio::fs::File::create(&temp).await.map_err(error)?;
  let mut stream=resp.bytes_stream();let mut hash=Sha256::new();let mut bytes=0u64;let mut last_report=0u64;
  while let Some(chunk)=stream.next().await{
   let chunk=chunk.map_err(error)?;bytes+=chunk.len() as u64;
   if bytes>limit{return Err("Tệp tải vượt giới hạn".into());}
   hash.update(&chunk);file.write_all(&chunk).await.map_err(error)?;
   if bytes-last_report>8*1024*1024{
    last_report=bytes;let _=app.emit(event,json!({"type":if event=="caption:event"{"setup-progress"}else{"progress"},
      "target":"vi","message":format!("Đã tải {} MB…",bytes/1048576)}));
   }
  }
  file.flush().await.map_err(error)?;drop(file);
  let actual=format!("{:x}",hash.finalize());
  if actual!=sha{return Err("SHA-256 không khớp, đã hủy cài đặt".into());}
  tokio::fs::rename(&temp,target).await.map_err(error)?;Ok(())
 }.await;
 if result.is_err(){let _=tokio::fs::remove_file(temp).await;}
 result
}
fn safe_unzip(archive:&Path,out:&Path)->Result<(),String>{
 let f=fs::File::open(archive).map_err(error)?;
 let mut zip=zip::ZipArchive::new(f).map_err(error)?;
 if zip.len()>500{return Err("Tệp nén có quá nhiều mục".into());}
 fs::create_dir_all(out).map_err(error)?;
 let mut total=0u64;
 for i in 0..zip.len(){
  let mut entry=zip.by_index(i).map_err(error)?;
  let path=entry.enclosed_name().ok_or("Tệp nén chứa đường dẫn không an toàn")?;
  if entry.unix_mode().is_some_and(|m|m & 0o170000 == 0o120000){return Err("Không giải nén liên kết tượng trưng".into());}
  total+=entry.size();if total>130*1024*1024{return Err("Dữ liệu giải nén vượt 130MB".into());}
  let dest=out.join(path);
  if entry.is_dir(){fs::create_dir_all(&dest).map_err(error)?;continue;}
  if let Some(p)=dest.parent(){fs::create_dir_all(p).map_err(error)?;}
  let mut output=fs::File::create(dest).map_err(error)?;
  std::io::copy(&mut entry,&mut output).map_err(error)?;
 }
 Ok(())
}
fn normalize_whisper_binary(dir:&Path,asset:&str)->Result<PathBuf,String>{
 // OpenWhispr v1.0.0 ZIPs contain whisper-cpp-darwin-arm64/x64
 // (or whisper-cpp-win32-x64-cpu.exe), NOT whisper-cli.
 let packaged=asset.strip_suffix(".zip").ok_or("Tên gói Whisper không hợp lệ")?;
 let canonical=dir.join(exec_name("whisper-cli"));
 let source=find_named(dir,&exec_name("whisper-cli"),0)
  .or_else(||find_named(dir,packaged,0))
  .ok_or_else(||format!("ZIP Whisper không chứa bộ chạy {packaged}"))?;
 if source!=canonical{fs::rename(&source,&canonical).map_err(error)?;}
 #[cfg(unix)]{
  use std::os::unix::fs::PermissionsExt;
  fs::set_permissions(&canonical,fs::Permissions::from_mode(0o700)).map_err(error)?;
 }
 Ok(canonical)
}
#[cfg(test)]
mod whisper_package_regression{
 use super::*;
 #[test]
 fn renames_real_release_asset_to_whisper_cli(){
  let dir=std::env::temp_dir().join(format!("openiptv-whisper-test-{}",Uuid::new_v4()));
  fs::create_dir_all(&dir).unwrap();
  let _cleanup=ScopedFolder(dir.clone());
  let packaged=if cfg!(windows){"whisper-cpp-win32-x64-cpu.exe"}else{"whisper-cpp-darwin-arm64"};
  fs::write(dir.join(packaged),vec![0u8;60_000]).unwrap();
  let found=normalize_whisper_binary(&dir,&format!("{packaged}.zip")).unwrap();
  assert_eq!(found,dir.join(exec_name("whisper-cli")));
  assert!(exists(&found,50_000));
  assert!(!dir.join(packaged).exists());
 }
}
fn caption_progress(app:&AppHandle,message:&str){let _=app.emit("caption:event",json!({"type":"setup-progress","message":message}));}
pub async fn caption_install(app:AppHandle,ai:Arc<LocalAi>)->Result<Value,String>{
 if ai.installing_caption.compare_exchange(false,true,Ordering::SeqCst,Ordering::SeqCst).is_err(){return Err("Whisper đang được cài".into());}
 let result=async{
  let (asset,sha)=whisper_asset().ok_or("CPU chưa được hỗ trợ tự cài Whisper")?;
  let root=ai.caption_root().join("auto");tokio::fs::create_dir_all(&root).await.map_err(error)?;
  let (bin,model)=caption_files(&ai);
  if bin.is_none(){
   caption_progress(&app,"Đang tải Whisper.cpp được xác minh SHA-256…");
   let archive=root.join(asset);
   let url=format!("https://github.com/sjoerdteunisse/whisper.cpp/releases/download/v1.0.0/{asset}");
   download_verified(&app,"caption:event",&url,&archive,sha,30*1024*1024).await?;
   let dir=root.join("binary");safe_unzip(&archive,&dir)?;
   let _=tokio::fs::remove_file(archive).await;
   normalize_whisper_binary(&dir,asset)?;
  }
  if model.is_none(){
   caption_progress(&app,"Đang tải mô hình Whisper đa ngôn ngữ (~148 MB)…");
   download_verified(&app,"caption:event", "https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-base.bin",
    &root.join("ggml-base.bin"),"60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe",170*1024*1024).await?;
  }
  let status=caption_status(&ai);
  if !status["available"].as_bool().unwrap_or(false){return Err("Công cụ/mô hình chưa sẵn sàng sau cài đặt".into());}
  caption_progress(&app,"Whisper đã cài xong và có thể chạy offline.");
  Ok(json!({"installed":true,"caption":status}))
 }.await;
 ai.installing_caption.store(false,Ordering::SeqCst);
 result
}
fn caption_text(raw:&[u8])->String{
 let input=String::from_utf8_lossy(raw);
 // Ignore whisper timestamps; only show speech text, bounded to protect UI.
 input.lines().filter(|l|!l.trim_start().starts_with('[')).collect::<Vec<_>>().join(" ").trim().chars()
  .filter(|c|!c.is_control()).take(1000).collect()
}
async fn output_timeout(command:&mut Command,duration:u64)->Result<std::process::Output,String>{
 command.kill_on_drop(true);
 let output=tokio::time::timeout(Duration::from_secs(duration),command.output()).await.map_err(|_|"Tiến trình AI quá thời gian")?.map_err(error)?;
 if !output.status.success(){return Err(format!("Tiến trình AI lỗi: {}",String::from_utf8_lossy(&output.stderr).chars().take(230).collect::<String>()));}
 Ok(output)
}
pub async fn caption_stop(ai:&LocalAi)->Value{
 if let Some(task)=ai.caption.lock().await.take(){task.abort();}
 json!(true)
}
pub async fn caption_start(app:AppHandle,ai:Arc<LocalAi>,url:&str,translate:bool,target:&str)->Result<Value,String>{
 let parsed=reqwest::Url::parse(url).map_err(error)?;
 if !matches!(parsed.scheme(),"http"|"https"){return Err("Chỉ nhận URL http/https".into());}
 let (bin,model)=caption_files(&ai);
 let bin=bin.ok_or("Chưa cài whisper-cli")?;let model=model.ok_or("Chưa cài mô hình Whisper")?;
 let ffmpeg=ai.ffmpeg.clone().ok_or("Thiếu FFmpeg")?;
 let target=if translate{target}else{"en"};
 if translate&&translation_status(&ai,target)["ready"]!=true{
  return Err(format!("Chưa có mô hình dịch {target}; mở ⚙ rồi chọn Cài mô hình dịch"));
 }
 caption_stop(&ai).await;
 let id=ai.next.fetch_add(1,Ordering::SeqCst)+1;
 let ai_clone=ai.clone();let src=url.to_owned();let target=target.to_owned();let result_language=target.clone();
 let task=tokio::spawn(async move{
  let dir=ai_clone.caption_root().join("temp").join(format!("session-{id}-{}",Uuid::new_v4()));
  if let Err(e)=tokio::fs::create_dir_all(&dir).await {let _=app.emit("caption:event",json!({"type":"error","id":id,"message":e.to_string()}));return;}
  let _cleanup=ScopedFolder(dir.clone());
  let wav=dir.join("speech.wav");let mut errors=0;
  loop{
   let _=app.emit("caption:event",json!({"type":"status","id":id,"message":"Đang nhận diện giọng nói offline…"}));
   let mut ff=Command::new(&ffmpeg);
   ff.args(["-hide_banner","-nostdin","-loglevel","error","-y","-rw_timeout","8000000","-user_agent","Mozilla/5.0","-i",&src,
    "-map","0:a:0","-vn","-sn","-dn","-ac","1","-ar","16000","-c:a","pcm_s16le","-t","8"]).arg(&wav);
   let cycle=async{
    output_timeout(&mut ff,35).await?;
    if !exists(&wav,25_000){return Err("Nguồn không có âm thanh".to_string());}
    let mut wh=Command::new(&bin);
    wh.arg("-m").arg(&model).arg("-f").arg(&wav).args(["-l","auto","-nt","-np","-t","4"]);
    if translate{wh.arg("-tr");}
    let result=output_timeout(&mut wh,70).await?;
    let phrase=caption_text(&result.stdout);
    if !phrase.is_empty(){
     let rendered=if translate{translate_caption_text(&ai_clone,&target,&phrase).await?}else{phrase.clone()};
     let _=app.emit("caption:event",json!({"type":"segment","id":id,"text":rendered,"originalText":phrase,"translated":translate,"language":if translate{target.as_str()}else{"auto"},"target":target}));
    }
    Ok::<(),String>(())
   }.await;
   let _=tokio::fs::remove_file(&wav).await;
   match cycle{
    Ok(_)=>errors=0,
    Err(e)=>{errors+=1;let _=app.emit("caption:event",json!({"type":"status","id":id,"message":e}));
     if errors>=3{let _=app.emit("caption:event",json!({"type":"error","id":id,"message":"Không thể nhận diện tiếng sau 3 lần"}));break;}}
   }
  }
  let _=tokio::fs::remove_dir_all(dir).await;
  let _=app.emit("caption:event",json!({"type":"stopped","id":id}));
 });
 *ai.caption.lock().await=Some(task);
 Ok(json!({"running":true,"id":id,"language":if translate{result_language.as_str()}else{"auto"},"translated":translate}))
}
const LANGS:[(&str,&str);10]=[
 ("vi","vi_VN-25hours_single-low"),("en","en_US-lessac-low"),("es","es_ES-mls_10246-low"),
 ("fr","fr_FR-siwis-low"),("de","de_DE-thorsten-low"),("zh","zh_CN-huayan-x_low"),
 ("pt","pt_BR-edresson-low"),("it","it_IT-riccardo-x_low"),("ru","ru_RU-irina-medium"),
 ("id","id_ID-news_tts-medium")
];
fn lang_voice(lang:&str)->Option<&'static str>{LANGS.iter().find(|(l,_)|*l==lang).map(|(_,m)|*m)}
fn tts_exe(ai:&LocalAi,name:&str)->PathBuf{ai.tts_root().join("python-env").join(if cfg!(windows){"Scripts"}else{"bin"}).join(exec_name(name))}
fn tts_python(ai:&LocalAi)->PathBuf{tts_exe(ai,"python")}
fn tts_voice(ai:&LocalAi,lang:&str)->Result<PathBuf,String>{Ok(ai.tts_root().join("voices").join(format!("{}.onnx",lang_voice(lang).ok_or("Ngôn ngữ chưa được hỗ trợ")?)))}
fn pairs(ai:&LocalAi)->Value{fs::read(ai.tts_root().join("installed-pairs.json")).ok().and_then(|b|serde_json::from_slice(&b).ok()).unwrap_or(json!({}))}
pub fn tts_status(ai:&LocalAi,lang:&str)->Value{
 let Some(model)=lang_voice(lang)else{return json!({"ready":false,"reason":"Ngôn ngữ không được hỗ trợ"})};
 let voice=ai.tts_root().join("voices").join(format!("{model}.onnx"));
 let have_voice=exists(&voice,1_000_000)&&exists(&voice.with_extension("onnx.json"),20);
 let have_piper=exists(&tts_exe(ai,"piper"),1);
 let have_argos=exists(&tts_exe(ai,"argos-translate"),1);
 let have_pair=lang=="en"||pairs(ai)[lang]==true;
 let ready=have_voice&&have_piper&&(lang=="en"||(have_argos&&have_pair));
 let reason=if !have_piper{"Chưa cài Piper TTS"}else if !have_voice{"Chưa cài mô hình giọng đọc"}else if !have_argos&&lang!="en"{"Chưa cài Argos Translate"}else if !have_pair{"Chưa có mô hình dịch en → ngôn ngữ chọn"}else{""};
 json!({"ready":ready,"reason":reason,"target":lang,"voiceName":model,"offline":true,
  "piperReady":have_piper,"argosReady":have_argos,"voiceReady":have_voice,
  "installing":ai.installing_tts.load(Ordering::SeqCst),"engine":"Piper + Argos","availableLanguages":LANGS.iter().map(|x|x.0).collect::<Vec<_>>()})
}
fn uv_asset()->Option<(&'static str,&'static str)>{
 match (std::env::consts::OS,std::env::consts::ARCH){
 ("macos","aarch64")=>Some(("uv-aarch64-apple-darwin.tar.gz","0c4346de7abdb49495b393b9ec809fe387aa43e586be20fecb972216c1e71732")),
 ("macos","x86_64")=>Some(("uv-x86_64-apple-darwin.tar.gz","4fa82e37cb94767661f532b001e470b67a186c7260e305bd84ddb78fd545c0b6")),
 ("windows","x86_64")=>Some(("uv-x86_64-pc-windows-msvc.zip","7c38608c8a18ee137d748a1773053b07ec8f3a30fab49aebaa6f4e4efeceb019")),
 ("windows","aarch64")=>Some(("uv-aarch64-pc-windows-msvc.zip","4b783bda5cc44bbae0651a837223873a7acee31152381aef5fc86ef6bef25997")),
 _=>None,
 }
}
async fn run_install(app:&AppHandle,cmd:&Path,args:&[&str],lang:&str,root:&Path,limit:u64)->Result<(),String>{
 let _=app.emit("tts:event",json!({"type":"progress","target":lang,"message":format!("{} {}",cmd.file_name().map(|x|x.to_string_lossy().to_string()).unwrap_or_default(),args.join(" ")).chars().take(150).collect::<String>()}));
 let mut proc=Command::new(cmd);proc.args(args).env("ARGOS_PACKAGES_DIR",root.join("argos-packages"))
  .env("ARGOS_DEVICE_TYPE","cpu").env("UV_CACHE_DIR",root.join("uv-cache"))
  .env("UV_PYTHON_INSTALL_DIR",root.join("python-managed"));
 output_timeout(&mut proc,limit).await?;Ok(())
}
fn find_small_file(dir:&Path,name:&str,depth:u8)->Option<PathBuf>{
 if depth>4{return None;}
 for entry in fs::read_dir(dir).ok()?.flatten(){let p=entry.path();
  if p.is_file()&&p.file_name().and_then(|v|v.to_str())==Some(name){return Some(p);}
  if p.is_dir(){if let Some(p)=find_small_file(&p,name,depth+1){return Some(p);}}
 }None
}
fn tts_progress(app:&AppHandle,lang:&str,msg:&str){let _=app.emit("tts:event",json!({"type":"progress","target":lang,"message":msg}));}
// Shared Argos runtime: translation captions do not require any Piper voice model.
async fn ensure_argos_runtime(app:&AppHandle,ai:&LocalAi,lang:&str)->Result<(),String>{
 let root=ai.tts_root();tokio::fs::create_dir_all(&root).await.map_err(error)?;
  let uv=root.join("uv").join(exec_name("uv"));
  if !exists(&uv,1){
   let (asset,sha)=uv_asset().ok_or("CPU chưa được hỗ trợ cài tự động")?;
   let archive=root.join("uv").join(asset);
   tts_progress(app,lang,"Tải bộ công cụ uv chính thức (SHA-256)…");
   download_verified(&app,"tts:event",&format!("https://github.com/astral-sh/uv/releases/download/0.12.24/{asset}"),&archive,sha,40*1024*1024).await?;
   let dst=root.join("uv").join("unpacked");tokio::fs::create_dir_all(&dst).await.map_err(error)?;
   if cfg!(windows){safe_unzip(&archive,&dst)?;}else{
    let mut cmd=Command::new("tar");cmd.arg("-xzf").arg(&archive).arg("-C").arg(&dst);output_timeout(&mut cmd,90).await?;
   }
   let extracted=find_small_file(&dst,&exec_name("uv"),0).ok_or("Không tìm được uv trong gói")?;
   tokio::fs::copy(extracted,&uv).await.map_err(error)?;
   #[cfg(unix)]{use std::os::unix::fs::PermissionsExt;fs::set_permissions(&uv,fs::Permissions::from_mode(0o700)).map_err(error)?;}
   let _=tokio::fs::remove_file(archive).await;
  }
  let venv=root.join("python-env");let python=tts_python(ai);
  let argos=tts_exe(ai,"argos-translate");let pm=tts_exe(ai,"argospm");
  if !exists(&python,1){
   tts_progress(app,lang,"Cài Python 3.11 trong dữ liệu riêng của ứng dụng…");
   run_install(app,&uv,&["python","install","3.11"],lang,&root,500).await?;
   let v=venv.to_string_lossy().into_owned();
   run_install(app,&uv,&["venv",&v,"--python","3.11","--python-preference","only-managed"],lang,&root,240).await?;
  }
  if !exists(&argos,1)||!exists(&pm,1){
   tts_progress(app,lang,"Cài Argos Translate offline…");
   let p=python.to_string_lossy().into_owned();
   run_install(app,&uv,&["pip","install","--python",&p,"argostranslate==1.11.0"],lang,&root,900).await?;
  }
 Ok(())
}
const TRANSLATION_TARGETS:[&str;21]=["en","vi","zh","ja","ko","th","es","fr","de","pt","it","ru","id","ar","hi","tr","nl","pl","uk","sv","ms"];
fn translation_supported(lang:&str)->bool{TRANSLATION_TARGETS.contains(&lang)}
pub fn translation_status(ai:&LocalAi,lang:&str)->Value{
 let supported=translation_supported(lang);
 let ready=supported&&(lang=="en"||(exists(&tts_exe(ai,"argos-translate"),1)&&pairs(ai)[lang]==true));
 json!({"target":lang,"supported":supported,"ready":ready,"offline":true,
   "installing":ai.installing_tts.load(Ordering::SeqCst),
   "availableLanguages":TRANSLATION_TARGETS,
   "reason":if !supported{"Ngôn ngữ chưa được hỗ trợ"}else if ready{""}else{"Chưa cài mô hình dịch offline cho ngôn ngữ này"}})
}
pub async fn translation_install(app:AppHandle,ai:Arc<LocalAi>,lang:&str)->Result<Value,String>{
 if !translation_supported(lang){return Err("Ngôn ngữ dịch chưa được hỗ trợ".into());}
 if lang=="en"{return Ok(json!({"installed":true,"target":"en","ready":true}));}
 if ai.installing_tts.compare_exchange(false,true,Ordering::SeqCst,Ordering::SeqCst).is_err(){
  return Err("Đang cài mô hình dịch hoặc giọng đọc khác".into());
 }
 let lang=lang.to_owned();
 let result=async{
  caption_progress(&app,&format!("Đang chuẩn bị công cụ dịch {lang} offline…"));
  ensure_argos_runtime(&app,&ai,&lang).await?;
  let root=ai.tts_root();
  if pairs(&ai)[lang.as_str()]!=true{
   caption_progress(&app,&format!("Đang tải mô hình English → {lang}…"));
   let pm=tts_exe(&ai,"argospm");
   run_install(&app,&pm,&["update"],&lang,&root,350).await?;
   run_install(&app,&pm,&["install",&format!("translate-en_{lang}")],&lang,&root,800).await?;
   let mut value=pairs(&ai);value[lang.as_str()]=json!(true);
   tokio::fs::write(root.join("installed-pairs.json"),serde_json::to_vec(&value).map_err(error)?).await.map_err(error)?;
  }
  let status=translation_status(&ai,&lang);
  if status["ready"]!=true{return Err("Mô hình dịch chưa sẵn sàng".into());}
  caption_progress(&app,&format!("Đã cài mô hình dịch {lang}, có thể dùng offline."));
  Ok(json!({"installed":true,"target":lang,"ready":true}))
 }.await;
 ai.installing_tts.store(false,Ordering::SeqCst);
 result
}
async fn translate_caption_text(ai:&LocalAi,lang:&str,phrase:&str)->Result<String,String>{
 if lang=="en"{return Ok(phrase.to_owned());}
 if translation_status(ai,lang)["ready"]!=true{
  return Err(format!("Chưa cài dịch {lang}; vào ⚙ và chọn Cài mô hình dịch"));
 }
 let mut cmd=Command::new(tts_exe(ai,"argos-translate"));
 cmd.args(["--from-lang","en","--to-lang",lang,phrase])
   .env("ARGOS_PACKAGES_DIR",ai.tts_root().join("argos-packages"))
   .env("ARGOS_DEVICE_TYPE","cpu");
 let output=output_timeout(&mut cmd,55).await?;
 let text=String::from_utf8_lossy(&output.stdout).trim().chars().take(1000).collect::<String>();
 if text.is_empty(){return Err("Argos không trả về bản dịch".into());}
 Ok(text)
}
pub async fn tts_install(app:AppHandle,ai:Arc<LocalAi>,lang:&str)->Result<Value,String>{
 lang_voice(lang).ok_or("Ngôn ngữ giọng đọc không được hỗ trợ")?;
 if ai.installing_tts.compare_exchange(false,true,Ordering::SeqCst,Ordering::SeqCst).is_err(){return Err("Đang cài mô hình khác".into());}
 let lang=lang.to_owned();
 let result=async{
  let root=ai.tts_root();tokio::fs::create_dir_all(&root).await.map_err(error)?;
  ensure_argos_runtime(&app,&ai,&lang).await?;
  let python=tts_python(&ai);let piper=tts_exe(&ai,"piper");
  let uv=root.join("uv").join(exec_name("uv"));let pm=tts_exe(&ai,"argospm");
  if !exists(&piper,1){
   tts_progress(&app,&lang,"Cài công cụ giọng đọc Piper TTS…");
   let p=python.to_string_lossy().into_owned();
   run_install(&app,&uv,&["pip","install","--python",&p,"piper-tts==1.8.0"],&lang,&root,900).await?;
  }
  let voice=tts_voice(&ai,&lang)?;let voice_cfg=voice.with_extension("onnx.json");
  if !exists(&voice,1_000_000)||!exists(&voice_cfg,20){
   tts_progress(&app,&lang,"Đang tải giọng Piper chính thức…");
   let voice_dir=root.join("voices");tokio::fs::create_dir_all(&voice_dir).await.map_err(error)?;
   let v=voice_dir.to_string_lossy().into_owned();
   run_install(&app,&python,&["-m","piper.download_voices","--data-dir",&v,lang_voice(&lang).unwrap_or("en_US-lessac-low")],&lang,&root,800).await?;
  }
  if lang!="en"&&pairs(&ai)[lang.as_str()]!=true{
   tts_progress(&app,&lang,"Cài mô hình dịch English → ngôn ngữ đã chọn…");
   run_install(&app,&pm,&["update"],&lang,&root,350).await?;
   run_install(&app,&pm,&["install",&format!("translate-en_{lang}")],&lang,&root,800).await?;
   let mut value=pairs(&ai);value[lang.as_str()]=json!(true);
   tokio::fs::write(root.join("installed-pairs.json"),serde_json::to_vec(&value).map_err(error)?).await.map_err(error)?;
  }
  let status=tts_status(&ai,&lang);
  if status["ready"]!=true{return Err("Bộ giọng đọc/dịch chưa được cài hoàn chỉnh".into());}
  tts_progress(&app,&lang,"Giọng đọc và mô hình dịch đã sẵn sàng offline.");
  Ok(json!({"installed":true,"target":lang,"ready":true}))
 }.await;
 ai.installing_tts.store(false,Ordering::SeqCst);
 result
}
fn vietnamese_piper_model(voice:&str)->Option<&'static str>{
 match voice{
  "piper:25hours"=>Some("vi_VN-25hours_single-low"),
  "piper:vais1000"=>Some("vi_VN-vais1000-medium"),
  "piper:vivos"=>Some("vi_VN-vivos-x_low"),
  _=>None
 }
}
fn voice_supported(voice:&str)->bool{
 vietnamese_piper_model(voice).is_some() ||
 voice.strip_prefix(NATURAL_PREFIX).is_some_and(|n|VIENEU_VOICES.contains(&n))
}
fn piper_voice_file(ai:&LocalAi,model:&str)->PathBuf{
 ai.tts_root().join("voices").join(format!("{model}.onnx"))
}
fn natural_worker_script(ai:&LocalAi)->PathBuf{ai.tts_root().join("vieneu_worker.py")}
fn natural_ready_file(ai:&LocalAi)->PathBuf{ai.tts_root().join("vieneu-ready.json")}
fn natural_env(cmd:&mut Command,ai:&LocalAi,offline:bool){
 let root=ai.tts_root();
 cmd.env("HF_HOME",root.join("huggingface"))
  .env("HUGGINGFACE_HUB_CACHE",root.join("huggingface/hub"))
  .env("HF_HUB_DISABLE_TELEMETRY","1");
 if offline{cmd.env("HF_HUB_OFFLINE","1");}
}
pub fn tts_voice_status(ai:&LocalAi,voice:&str)->Value{
 let baseline=tts_status(ai,"vi");
 if !voice_supported(voice){return json!({"ready":false,"reason":"Giọng Việt không được hỗ trợ","voice":voice});}
 let ready=if let Some(model)=vietnamese_piper_model(voice){
  let p=piper_voice_file(ai,model);
  exists(&p,1_000_000)&&exists(&p.with_extension("onnx.json"),20)&&baseline["ready"]==true
 }else{
  let meta=fs::read(natural_ready_file(ai)).ok().and_then(|x|serde_json::from_slice::<Value>(&x).ok()).unwrap_or(Value::Null);
  meta["ready"]==true&&meta["engine"]=="v3turbo"&&exists(&tts_python(ai),1)&&baseline["ready"]==true
 };
 json!({"ready":ready,"voice":voice,"engine":if voice.starts_with(NATURAL_PREFIX){"VieNeu v3 Turbo"}else{"Piper"},
   "installing":ai.installing_tts.load(Ordering::SeqCst),
   "reason":if ready{""}else if baseline["ready"]!=true{"Cần cài mô hình dịch tiếng Việt và giọng đọc nền"}else if voice.starts_with(NATURAL_PREFIX){"Chưa cài VieNeu v3 Turbo (25 giọng)"}else{"Chưa cài mô hình Piper đã chọn"}})
}
async fn natural_read(worker:&mut NaturalWorker,id:Option<&str>,seconds:u64)->Result<Value,String>{
 let deadline=tokio::time::Instant::now()+Duration::from_secs(seconds);
 loop{
  let mut line=String::new();
  let remaining=deadline.saturating_duration_since(tokio::time::Instant::now());
  if remaining.is_zero(){return Err("Giọng VieNeu phản hồi quá lâu".into());}
  let n=tokio::time::timeout(remaining,worker.output.read_line(&mut line)).await
   .map_err(|_|"VieNeu hết thời gian phản hồi")?.map_err(error)?;
  if n==0{return Err("Tiến trình VieNeu đã dừng".into());}
  if let Some(payload)=line.trim().strip_prefix("OIPTV_RESULT:"){
   let v:Value=serde_json::from_str(payload).map_err(error)?;
   if let Some(fatal)=v["fatal"].as_str(){return Err(fatal.to_owned());}
   if let Some(id)=id{if v["id"].as_str()!=Some(id){continue;}}
   if let Some(msg)=v["error"].as_str(){return Err(msg.to_owned());}
   return Ok(v);
  }
 }
}
async fn natural_request(ai:&LocalAi,voice:&str,speech:&str)->Result<Value,String>{
 let mut slot=ai.natural_worker.lock().await;
 if slot.is_none(){
  let mut cmd=Command::new(tts_python(ai));
  cmd.arg(natural_worker_script(ai)).arg("--stdio")
   .stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::null()).kill_on_drop(true);
  natural_env(&mut cmd,ai,true);
  let mut child=cmd.spawn().map_err(error)?;
  let input=child.stdin.take().ok_or("Không có stdin VieNeu")?;
  let output=BufReader::new(child.stdout.take().ok_or("Không có stdout VieNeu")?);
  let mut worker=NaturalWorker{child,input,output};
  natural_read(&mut worker,None,180).await?;
  *slot=Some(worker);
 }
 let id=Uuid::new_v4().to_string();
 let request=json!({"id":id,"voice":voice,"text":speech}).to_string()+"\n";
 let result=async{
  let worker=slot.as_mut().ok_or("Không khởi động được VieNeu")?;
  worker.input.write_all(request.as_bytes()).await.map_err(error)?;
  worker.input.flush().await.map_err(error)?;
  natural_read(worker,Some(&id),180).await
 }.await;
 if result.is_err(){
  if let Some(mut worker)=slot.take(){let _=worker.child.start_kill();}
 }
 result
}
pub async fn tts_voice_install(app:AppHandle,ai:Arc<LocalAi>,voice:&str)->Result<Value,String>{
 if !voice_supported(voice){return Err("Giọng Việt không nằm trong danh sách hỗ trợ".into());}
 if tts_voice_status(&ai,voice)["ready"]==true{return Ok(json!({"ready":true,"voice":voice}));}
 // Ensure the existing English->Vietnamese translation chain and app-private uv first.
 if tts_status(&ai,"vi")["ready"]!=true{tts_install(app.clone(),ai.clone(),"vi").await?;}
 if ai.installing_tts.compare_exchange(false,true,Ordering::SeqCst,Ordering::SeqCst).is_err(){
  return Err("Đang cài đặt giọng đọc khác".into());
 }
 let result=async{
  let root=ai.tts_root();let python=tts_python(&ai);
  if let Some(model)=vietnamese_piper_model(voice){
   let wav_model=piper_voice_file(&ai,model);
   if !exists(&wav_model,1_000_000)||!exists(&wav_model.with_extension("onnx.json"),20){
    tts_progress(&app,"vi",&format!("Đang tải giọng Piper {model}…"));
    let data=root.join("voices").to_string_lossy().into_owned();
    run_install(&app,&python,&["-m","piper.download_voices","--data-dir",&data,model],"vi",&root,900).await?;
   }
  }else{
   let uv=root.join("uv").join(exec_name("uv"));
   let pack=python.to_string_lossy().into_owned();
   tts_progress(&app,"vi","Cài VieNeu v3 Turbo ONNX trong thư mục riêng…");
   run_install(&app,&uv,&["pip","install","--python",&pack,"vieneu==3.8.3"],"vi",&root,1200).await?;
   tokio::fs::write(natural_worker_script(&ai),include_str!("../resources/vieneu_worker.py")).await.map_err(error)?;
   tts_progress(&app,"vi","Tải mô hình VieNeu và khởi tạo 25 giọng tự nhiên (lần đầu có thể khá lớn)…");
   let mut cmd=Command::new(&python);
   cmd.arg(natural_worker_script(&ai)).arg("--prepare");
   natural_env(&mut cmd,&ai,false);
   let output=output_timeout(&mut cmd,2400).await?;
   let msg=String::from_utf8_lossy(&output.stdout);
   let mut found=false;
   for line in msg.lines(){
    if let Some(payload)=line.strip_prefix("OIPTV_RESULT:"){
     let report:Value=serde_json::from_str(payload).map_err(error)?;
     if report["ready"]==true&&report["voices"].as_array().is_some_and(|a|a.len()>=20){found=true;}
    }
   }
   if !found{return Err("Mô hình VieNeu chưa nạp đủ 25 giọng".into());}
   tokio::fs::write(natural_ready_file(&ai),serde_json::to_vec(&json!({"ready":true,"engine":"v3turbo"})).map_err(error)?).await.map_err(error)?;
  }
  let status=tts_voice_status(&ai,voice);
  if status["ready"]!=true{return Err("Giọng đọc chưa cài đầy đủ".into());}
  Ok(status)
 }.await;
 ai.installing_tts.store(false,Ordering::SeqCst);
 result
}
pub async fn tts_stop(ai:&LocalAi)->Value{
 if let Some(task)=ai.tts.lock().await.take(){task.abort();}
 json!({"canceled":true})
}
async fn synthesize_internal(app:AppHandle,ai:Arc<LocalAi>,lang:String,phrase:String,voice:String,source_language:String)->Result<Value,String>{
 let root=ai.tts_root();
 if tts_status(&ai,&lang)["ready"]!=true{return Err("Chưa cài đủ Piper, Argos hoặc giọng đọc".into());}
 let mut speech=phrase.clone();
 if lang!="en" && source_language!=lang{
  let _=app.emit("tts:event",json!({"type":"status","message":"Đang dịch với Argos offline…"}));
  let mut cmd=Command::new(tts_exe(&ai,"argos-translate"));
  cmd.args(["--from-lang","en","--to-lang",&lang,&phrase]).env("ARGOS_PACKAGES_DIR",root.join("argos-packages"));
  let out=output_timeout(&mut cmd,55).await?;
  speech=String::from_utf8(out.stdout).map_err(error)?.trim().chars().take(600).collect();
  if speech.is_empty(){return Err("Argos không trả về lời dịch".into());}
 }
 let dir=root.join("temp").join(Uuid::new_v4().to_string());tokio::fs::create_dir_all(&dir).await.map_err(error)?;
 let _cleanup=ScopedFolder(dir.clone());
 let result=async{
  let wav=dir.join("speech.wav");
  let _=app.emit("tts:event",json!({"type":"status","message":"Đang tạo WAV bằng Piper offline…"}));
  let mut cmd=Command::new(tts_exe(&ai,"piper"));
  let model=if lang=="vi"{vietnamese_piper_model(&voice).ok_or("Giọng Piper Việt không hợp lệ").map(|m|piper_voice_file(&ai,m))?}else{tts_voice(&ai,&lang)?};
  cmd.arg("--model").arg(model).arg("--output_file").arg(&wav)
   .stdin(Stdio::piped()).stderr(Stdio::piped()).kill_on_drop(true);
  let mut child=cmd.spawn().map_err(error)?;
  if let Some(mut input)=child.stdin.take(){input.write_all(speech.as_bytes()).await.map_err(error)?;input.write_all(b"\n").await.map_err(error)?;}
  let result=tokio::time::timeout(Duration::from_secs(90),child.wait_with_output()).await
    .map_err(|_|"Piper hết thời gian tạo giọng đọc")?.map_err(error)?;
  if !result.status.success(){return Err(format!("Piper: {}",String::from_utf8_lossy(&result.stderr).chars().take(200).collect::<String>()));}
  let bytes=tokio::fs::read(&wav).await.map_err(error)?;
  if bytes.len()<44||bytes.len()>7*1024*1024||!bytes.starts_with(b"RIFF")||&bytes[8..12]!=b"WAVE"{return Err("Piper không tạo WAV hợp lệ".into());}
  Ok(json!({"target":lang,"sourceText":phrase,"translatedText":speech,"mime":"audio/wav",
    "audioBase64":base64::engine::general_purpose::STANDARD.encode(bytes)}))
 }.await;
 let _=tokio::fs::remove_dir_all(dir).await;
 result
}
async fn synthesize_natural_internal(app:AppHandle,ai:Arc<LocalAi>,voice:String,phrase:String,source_language:String)->Result<Value,String>{
 if tts_voice_status(&ai,&format!("vieneu:{voice}"))["ready"]!=true{
  return Err("Chưa cài mô hình VieNeu. Nhấn Cài mô hình tự động trước.".into());
 }
 let root=ai.tts_root();
 let mut speech=phrase.clone();
 if source_language!="vi"{
  let mut cmd=Command::new(tts_exe(&ai,"argos-translate"));
  cmd.args(["--from-lang","en","--to-lang","vi",&phrase]).env("ARGOS_PACKAGES_DIR",root.join("argos-packages"));
  let out=output_timeout(&mut cmd,55).await?;
  speech=String::from_utf8(out.stdout).map_err(error)?.trim().chars().take(600).collect();
  if speech.is_empty(){return Err("Argos không trả về tiếng Việt".into());}
 }
 let _=app.emit("tts:event",json!({"type":"status","message":format!("VieNeu đang đọc giọng {voice} offline…")}));
 let data=natural_request(&ai,&voice,&speech).await?;
 if data["mime"]!="audio/wav"||data["audioBase64"].as_str().is_none(){return Err("VieNeu không tạo được WAV".into());}
 Ok(json!({"target":"vi","voice":format!("vieneu:{voice}"),"sourceText":phrase,
  "translatedText":speech,"mime":"audio/wav","audioBase64":data["audioBase64"]}))
}
pub async fn tts_synthesize(app:AppHandle,ai:Arc<LocalAi>,value:&Value)->Result<Value,String>{
 let lang=value["target"].as_str().unwrap_or("vi");lang_voice(lang).ok_or("Ngôn ngữ không được hỗ trợ")?;
 let phrase=value["text"].as_str().ok_or("Thiếu đoạn văn cần đọc")?.chars().filter(|c|!c.is_control()).take(361).collect::<String>();
 if phrase.is_empty()||phrase.chars().count()>360{return Err("Văn bản phải dài 1–360 ký tự".into());}
 let voice=if lang=="vi"{value["voice"].as_str().unwrap_or("piper:25hours")}else{"piper:default"};
 if lang=="vi"&&!voice_supported(voice){return Err("Không nhận dạng được giọng Việt".into());}
 if lang=="vi" && tts_voice_status(&ai,voice)["ready"]!=true{
  return Err("Giọng Việt chưa được cài. Nhấn Cài mô hình tự động.".into());
 }
 let source_language=if value["sourceLanguage"]=="vi" && lang=="vi"{"vi"}else{"en"};
 tts_stop(&ai).await;
 let task=if let Some(name)=voice.strip_prefix(NATURAL_PREFIX){
  tokio::spawn(synthesize_natural_internal(app,ai.clone(),name.to_owned(),phrase,source_language.to_owned()))
 }else{
  tokio::spawn(synthesize_internal(app,ai.clone(),lang.to_owned(),phrase,voice.to_owned(),source_language.to_owned()))
 };
 *ai.tts.lock().await=Some(task.abort_handle());
 let result=task.await.map_err(|e|format!("TTS bị hủy: {e}"))?;
 *ai.tts.lock().await=None;
 result
}