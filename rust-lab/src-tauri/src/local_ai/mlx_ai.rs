//! Rust Lab v23.8: real local MLX Hy-MT2/Qwen3 backend, ported from
//! Electron src/hymt-service.cjs + src/hymt-bridge.py (v4.23.67).
//! Only Mac Apple Silicon; all repositories, identifiers and file locations
//! are allowlisted and model downloads require an explicit install action.
use super::*;
use std::collections::HashSet;

static CATALOG: [(&str, &str, u64); 8] = [
 ("hymt18", "Hy-MT2 1.8B · nhanh", 1_100_000_000),
 ("hymt18q8", "Hy-MT2 1.8B · 8-bit", 1_900_000_000),
 ("hymt7", "Hy-MT2 7B · chất lượng cao", 4_550_000_000),
 ("hymt7q8", "Hy-MT2 7B · 8-bit", 8_000_000_000),
 ("qwen06", "Qwen3 0.6B · siêu nhẹ", 360_000_000),
 ("qwen17", "Qwen3 1.7B · cân bằng", 980_000_000),
 ("qwen4", "Qwen3 4B · đa năng", 2_300_000_000),
 ("qwen8", "Qwen3 8B · nâng cao", 4_600_000_000),
];

pub(super) struct MlxWorker {
 key: String,
 child: Child,
 stdin: ChildStdin,
 stdout: BufReader<ChildStdout>,
}

pub(super) fn supported() -> bool { cfg!(all(target_os="macos", target_arch="aarch64")) }
pub(super) fn keys() -> impl Iterator<Item=&'static str> {
 CATALOG.iter().map(|x| x.0)
}
fn model_info(key: &str) -> Result<(&'static str, u64),String> {
 CATALOG.iter().find(|m|m.0==key).map(|m|(m.1,m.2))
  .ok_or_else(||"Mô hình MLX không có trong danh mục an toàn".into())
}
fn root(ai:&LocalAi)->PathBuf { ai.root.join("ai-translate") }
fn model_root(ai:&LocalAi,key:&str)->Result<PathBuf,String>{
 model_info(key)?;
 Ok(root(ai).join("models").join(key))
}
fn python(ai:&LocalAi)->PathBuf{
 root(ai).join("python-env").join("bin").join("python")
}
fn bridge(ai:&LocalAi)->PathBuf{root(ai).join("hymt-bridge-v23-8.py")}
fn env(cmd:&mut Command,ai:&LocalAi,key:&str){
 let root=root(ai);
 cmd.env("HF_HOME",root.join("models").join(key).join("hub-cache"))
  .env("HF_HUB_DISABLE_TELEMETRY","1")
  .env("TOKENIZERS_PARALLELISM","false")
  .env("UV_CACHE_DIR",root.join("uv-cache"))
  .env("UV_PYTHON_INSTALL_DIR",root.join("python-managed"))
  .env("HF_HUB_DISABLE_PROGRESS_BARS","0");
}
fn has_weights(ai:&LocalAi,key:&str)->bool{
 let dir=match model_root(ai,key){Ok(x)=>x.join("weights"),Err(_)=>return false};
 if !exists(&dir.join("config.json"),200)||!exists(&dir.join("tokenizer.json"),100_000){return false;}
 let index=dir.join("model.safetensors.index.json");
 if exists(&index,50){
  if let Ok(value)=fs::read(&index).ok().and_then(|v|serde_json::from_slice::<Value>(&v).ok()).ok_or(()) {
   let files:HashSet<String>=value["weight_map"].as_object().map(|m|m.values()
    .filter_map(|v|v.as_str().map(str::to_owned)).collect()).unwrap_or_default();
   return !files.is_empty()&&files.iter().all(|file|Path::new(file).file_name().and_then(|s|s.to_str())==Some(file.as_str())
    &&exists(&dir.join(file),1_000_000))
    &&files.iter().map(|x|fs::metadata(dir.join(x)).map(|m|m.len()).unwrap_or(0)).sum::<u64>()>10_000_000;
  }
  return false;
 }
 fs::read_dir(&dir).ok().is_some_and(|entries|entries.flatten().any(|e|{
  let file=e.file_name().to_string_lossy().to_string();
  file.starts_with("model")&&file.ends_with(".safetensors")&&exists(&e.path(),10_000_000)
 }))
}
fn runtime_ready(ai:&LocalAi)->bool{
 exists(&python(ai),1)&&exists(&root(ai).join("mlx-runtime.ready"),1)
}
pub(super) fn select_auto(ai:&LocalAi,mode:&str)->Option<&'static str>{
 let priorities:&[&str]=match mode{
  "saver"=>&["qwen06","hymt18","qwen17","hymt18q8","qwen4","hymt7","hymt7q8","qwen8"],
  "quality"=>&["hymt7q8","hymt7","qwen8","qwen4","hymt18q8","hymt18","qwen17","qwen06"],
  _=>&["hymt18","hymt18q8","hymt7","qwen17","qwen06","qwen4","hymt7q8","qwen8"],
 };
 if !supported()||!runtime_ready(ai){return None;}
 priorities.iter().copied().find(|k|has_weights(ai,k))
}
pub(super) fn status(ai:&LocalAi)->Value{
 let mut models=serde_json::Map::new();
 for (key,label,approx) in CATALOG {
  let installed=has_weights(ai,key);
  let size=super::asset_bytes(&root(ai).join("models").join(key),0);
  models.insert(key.into(),json!({"id":key,"label":label,"installed":installed,
    "supported":supported(),"runtimeReady":runtime_ready(ai),"approxBytes":approx,
    "bytes":size,"installing":ai.mlx_installing.load(Ordering::SeqCst),
    "reason":if supported(){""}else{"Cần Mac Apple Silicon (ARM64)"}}));
 }
 json!({"supported":supported(),"runtimeReady":runtime_ready(ai),
  "installing":ai.mlx_installing.load(Ordering::SeqCst),"models":models})
}
fn notice(app:&AppHandle,message:&str){
 let _=app.emit("ai:event",json!({"type":"ai-progress","message":message}));
}
async fn exec(_app:&AppHandle,ai:&LocalAi,key:&str,bin:&Path,args:&[&str],seconds:u64)->Result<String,String>{
 let mut cmd=Command::new(bin);
 cmd.args(args);
 env(&mut cmd,ai,key);
 let output=output_timeout(&mut cmd,seconds).await?;
 Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
async fn prepare_uv(app:&AppHandle,ai:&LocalAi)->Result<PathBuf,String>{
 let dir=ai.tts_root().join("uv");
 let uv=dir.join(exec_name("uv"));
 if exists(&uv,1){return Ok(uv);}
 let (asset,hash)=uv_asset().ok_or("Không có uv được xác minh cho kiến trúc máy")?;
 if !supported(){return Err("Chỉ hỗ trợ MLX trên Apple Silicon".into());}
 tokio::fs::create_dir_all(&dir).await.map_err(error)?;
 notice(app,"Tải uv đã xác minh SHA-256 cho môi trường MLX…");
 let archive=dir.join(asset);
 download_verified(app,"ai:event",&format!("https://github.com/astral-sh/uv/releases/download/0.12.24/{asset}"),&archive,hash,40*1024*1024).await?;
 let extracted=dir.join("mlx-unpacked");
 tokio::fs::create_dir_all(&extracted).await.map_err(error)?;
 let mut unpack=Command::new("tar");
 unpack.arg("-xzf").arg(&archive).arg("-C").arg(&extracted);
 output_timeout(&mut unpack,90).await?;
 let found=find_small_file(&extracted,"uv",0).ok_or("Không tìm thấy uv trong bản tải")?;
 tokio::fs::copy(&found,&uv).await.map_err(error)?;
 #[cfg(unix)]{
  use std::os::unix::fs::PermissionsExt;
  fs::set_permissions(&uv,fs::Permissions::from_mode(0o700)).map_err(error)?;
 }
 let _=tokio::fs::remove_file(&archive).await;
 let _=tokio::fs::remove_dir_all(&extracted).await;
 Ok(uv)
}
async fn write_bridge(ai:&LocalAi)->Result<(),String>{
 tokio::fs::create_dir_all(root(ai)).await.map_err(error)?;
 // Versioned name avoids running stale Electron/Rust scripts on existing machines.
 tokio::fs::write(bridge(ai),include_str!("../../resources/hymt_bridge.py")).await.map_err(error)
}
pub(super) async fn install(app:AppHandle,ai:Arc<LocalAi>,key:&str)->Result<Value,String>{
 model_info(key)?;
 if !supported(){return Err("Hy-MT2/Qwen3 MLX chỉ chạy trên Mac Apple Silicon".into());}
 if ai.mlx_installing.compare_exchange(false,true,Ordering::SeqCst,Ordering::SeqCst).is_err(){
  return Err("Đang cài một mô hình MLX khác; vui lòng hoàn tất trước".into());
 }
 let key=key.to_string();
 let result=async{
  let base=root(&ai);
  let model=model_root(&ai,&key)?;
  tokio::fs::create_dir_all(&model).await.map_err(error)?;
  write_bridge(&ai).await?;
  let uv=prepare_uv(&app,&ai).await?;
  if !exists(&python(&ai),1){
   notice(&app,"Đang cài Python 3.11 vào dữ liệu riêng của Rust Lab…");
   exec(&app,&ai,&key,&uv,&["python","install","3.11"],450).await?;
   let folder=base.join("python-env").to_string_lossy().to_string();
   exec(&app,&ai,&key,&uv,&["venv",&folder,"--python","3.11","--python-preference","only-managed"],240).await?;
  }
  if !runtime_ready(&ai){
   notice(&app,"Đang cài mlx-lm và huggingface-hub; chỉ thực hiện lần đầu…");
   let py=python(&ai).to_string_lossy().to_string();
   exec(&app,&ai,&key,&uv,&["pip","install","--python",&py,"mlx-lm","huggingface-hub"],1200).await?;
   exec(&app,&ai,&key,&python(&ai),&["-c","import mlx_lm, huggingface_hub"],180).await?;
   tokio::fs::write(base.join("mlx-runtime.ready"),b"mlx-lm\n").await.map_err(error)?;
  }
  if !has_weights(&ai,&key){
   notice(&app,&format!("Đang tải Hy-MT2/Qwen3 {key} · dung lượng có thể tới vài GB…"));
   let folder=model.to_string_lossy().to_string();
   exec(&app,&ai,&key,&python(&ai),&["-u",bridge(&ai).to_string_lossy().as_ref(),"install",&key,&folder],3600).await?;
  }
  if !has_weights(&ai,&key){return Err("Mô hình MLX tải chưa hoàn chỉnh; hãy thử Tải tiếp".into());}
  notice(&app,&format!("Mô hình {key} đã cài, có thể dịch offline"));
  Ok(status(&ai))
 }.await;
 ai.mlx_installing.store(false,Ordering::SeqCst);
 result
}
pub(super) async fn stop(ai:&LocalAi){
 let mut guard=ai.mlx_worker.lock().await;
 if let Some(mut worker)=guard.take(){let _=worker.child.start_kill();}
}
async fn start_locked(ai:&LocalAi,slot:&mut Option<MlxWorker>,key:&str)->Result<(),String>{
 if slot.as_ref().is_some_and(|w|w.key==key){return Ok(());}
 if let Some(mut old)=slot.take(){let _=old.child.start_kill();}
 write_bridge(ai).await?;
 let dir=model_root(ai,key)?;
 let mut cmd=Command::new(python(ai));
 cmd.arg("-u").arg(bridge(ai)).arg("worker").arg(key).arg(&dir)
  .stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::null()).kill_on_drop(true);
 env(&mut cmd,ai,key);
 let mut child=cmd.spawn().map_err(error)?;
 let input=child.stdin.take().ok_or("MLX không có stdin")?;
 let stdout=BufReader::new(child.stdout.take().ok_or("MLX không có stdout")?);
 let mut worker=MlxWorker{key:key.into(),child,stdin:input,stdout};
 let deadline=tokio::time::Instant::now()+Duration::from_secs(180);
 let check=async{
  loop{
   let mut line=String::new();
   let left=deadline.saturating_duration_since(tokio::time::Instant::now());
   if left.is_zero(){return Err("MLX khởi tạo quá thời gian".into());}
   let n=tokio::time::timeout(left,worker.stdout.read_line(&mut line)).await
    .map_err(|_|"MLX khởi động quá thời gian")?.map_err(error)?;
   if n==0{return Err("Mô hình MLX không chạy; thiếu thư viện hoặc bộ nhớ".into());}
   if let Ok(event)=serde_json::from_str::<Value>(&line){
    if event["type"]=="ready"&&event["model"]==key{return Ok(());}
   }
  }
 }.await;
 if let Err(e)=check{
  let _=worker.child.start_kill();
  return Err(e);
 }
 *slot=Some(worker);
 Ok(())
}
pub(super) async fn translate(ai:&LocalAi,key:&str,source:&str,target:&str,text:&str)->Result<String,String>{
 model_info(key)?;
 if !supported(){return Err("MLX chỉ chạy trên Mac Apple Silicon".into());}
 if source==target{return Ok(text.to_owned());}
 if !has_weights(ai,key)||!runtime_ready(ai){return Err(format!("Chưa cài đủ {key} hoặc môi trường MLX; nhấn Tải mô hình trong ⚙")); }
 if !TRANSLATION_TARGETS.contains(&source)||!TRANSLATION_TARGETS.contains(&target){
  return Err("Ngôn ngữ MLX chưa được hỗ trợ".into());
 }
 let bounded:String=text.chars().take(1200).collect();
 let mut guard=ai.mlx_worker.lock().await;
 start_locked(ai,&mut guard,key).await?;
 let worker=guard.as_mut().ok_or("MLX chưa hoạt động")?;
 let id=Uuid::new_v4().to_string();
 let request=json!({"id":id,"source":source,"target":target,"text":bounded}).to_string()+"\n";
 worker.stdin.write_all(request.as_bytes()).await.map_err(error)?;
 worker.stdin.flush().await.map_err(error)?;
 let deadline=tokio::time::Instant::now()+Duration::from_secs(120);
 loop{
  let left=deadline.saturating_duration_since(tokio::time::Instant::now());
  if left.is_zero(){let _=worker.child.start_kill();*guard=None;return Err("MLX dịch quá thời gian".into());}
  let mut line=String::new();
  let bytes=tokio::time::timeout(left,worker.stdout.read_line(&mut line)).await
   .map_err(|_|"MLX không phản hồi trong 120 giây")?.map_err(error)?;
  if bytes==0{*guard=None;return Err("Mô hình MLX đã thoát bất ngờ".into());}
  if let Ok(event)=serde_json::from_str::<Value>(&line){
   if event["id"].as_str()!=Some(&id){continue;}
   if event["ok"]!=true{return Err(format!("Lỗi MLX: {}",event["error"].as_str().unwrap_or("không rõ")));}
   let translated=event["text"].as_str().unwrap_or("").trim();
   if translated.is_empty(){return Err("MLX tạo bản dịch rỗng".into());}
   return Ok(translated.chars().take(1200).collect());
  }
 }
}
pub(super) async fn remove(ai:&LocalAi,key:&str)->Result<Value,String>{
 model_info(key)?;
 if ai.mlx_installing.load(Ordering::SeqCst){return Err("Đang tải mô hình MLX; không thể xóa".into());}
 stop(ai).await;
 let dir=model_root(ai,key)?;
 if dir.symlink_metadata().is_ok_and(|m|m.file_type().is_symlink()){
  return Err("Không xóa thư mục mô hình có liên kết tượng trưng".into());
 }
 let freed=super::asset_bytes(&dir,0);
 if dir.exists(){tokio::fs::remove_dir_all(&dir).await.map_err(error)?;}
 Ok(json!({"removed":key,"freed":freed,"status":status(ai)}))
}
