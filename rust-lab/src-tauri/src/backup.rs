//! Native .iptvbackup JSON format, compatible with the Electron v4 series.
//! Restore is previewed, hashed and confirmed; partial image restores roll back.
use crate::AppState;
use std::{sync::Arc,fs,path::{Path,PathBuf}};
use serde_json::{json,Value,Map};
use sha2::{Sha256,Digest};
use base64::{Engine as _,engine::general_purpose::STANDARD};
use uuid::Uuid;
use tauri_plugin_dialog::DialogExt;
use tauri::AppHandle;

pub struct PendingBackup {pub token:String,pub path:PathBuf,pub hash:String}
pub struct PendingRestore {pub token:String,pub paths:Vec<PathBuf>,pub dvr_data:Option<Value>}
const MAX_BACKUP: usize=128*1024*1024;
const MAX_IMAGES:usize=96*1024*1024;
fn sha(bytes:&[u8])->String{format!("{:x}",Sha256::digest(bytes))}
fn valid_name(name:&str)->bool{
 name.ends_with(".jpg")&&name.len()<=160&&!name.contains("..")&&
 name.chars().all(|c|c.is_alphanumeric()||matches!(c,'-'|'_'|'.'))
}
fn owned(name:&str)->bool{
 name.len()<128&&(name.starts_with("open-iptv-pro-")||name.starts_with("open-iptv-doctor-v2-")||
 name.starts_with("open-iptv-doctor-v3-")||name=="streamleaf-3")
}
fn validate_storage(storage:&Value)->Result<Value,String>{
 let map=storage.as_object().ok_or("Backup storage must be an object")?;
 if map.len()>64||map.iter().any(|(k,v)|!owned(k)||!v.is_string()){return Err("Khóa cấu hình không hợp lệ".into());}
 if serde_json::to_vec(storage).map_err(|e|e.to_string())?.len()>16*1024*1024{return Err("Cấu hình quá lớn".into());}
 let primary=map.get("open-iptv-pro-4").or_else(||map.get("streamleaf-3")).and_then(Value::as_str).ok_or("Thiếu dữ liệu chính")?;
 let value:Value=serde_json::from_str(primary).map_err(|e|e.to_string())?;
 if !value["sources"].is_array()||!value["channels"].is_array()||!value.is_object(){return Err("Dữ liệu playlist/channels không hợp lệ".into());}
 Ok(value)
}
fn atomic_save(path:&Path,bytes:&[u8])->Result<(),String>{
 let tmp=path.with_extension(format!("tmp-{}",Uuid::new_v4()));
 fs::write(&tmp,bytes).map_err(|e|e.to_string())?;
 fs::rename(&tmp,path).map_err(|e|{let _=fs::remove_file(&tmp);e.to_string()})
}
fn load(path:&Path)->Result<(Value,String,Value),String>{
 let size=fs::metadata(path).map_err(|e|e.to_string())?.len();
 if size>MAX_BACKUP as u64{return Err("File backup vượt 128MB".into());}
 let bytes=fs::read(path).map_err(|e|e.to_string())?;
 let data:Value=serde_json::from_slice(&bytes).map_err(|e|e.to_string())?;
 if data["magic"]!="open-iptv-pro-backup"||data["formatVersion"]!=1{return Err("Định dạng backup không hợp lệ".into());}
 let state=validate_storage(&data["storage"])?;
 let images=data["snapshotFiles"].as_object().ok_or("Danh sách ảnh không hợp lệ")?;
 if images.len()>2000{return Err("Quá nhiều ảnh".into());}
 let mut size=0usize;
 for (name,entry) in images{
  if !valid_name(name){return Err("Tên ảnh trong backup không hợp lệ".into());}
  let decoded=STANDARD.decode(entry["content"].as_str().ok_or("Ảnh base64 sai")?).map_err(|e|e.to_string())?;
  size+=decoded.len();
  if size>MAX_IMAGES||decoded.len()>5_000_000||!decoded.starts_with(&[0xff,0xd8,0xff])||sha(&decoded)!=entry["sha256"].as_str().unwrap_or(""){
    return Err("Ảnh Snapshot trong backup bị hỏng hoặc vượt giới hạn".into());
  }
 }
 let summary=json!({"createdAt":data["createdAt"],"appVersion":data["appVersion"],
    "sourceCount":state["sources"].as_array().map_or(0,Vec::len),
    "channelCount":state["channels"].as_array().map_or(0,Vec::len),
    "images":images.len(),"bytes":bytes.len(),
    "recordingSchedules":data["storage"]["open-iptv-pro-dvr-v1"].as_str().and_then(|s|serde_json::from_str::<Value>(s).ok()).and_then(|v|v["pending"].as_array().map(Vec::len)).unwrap_or(0)});
 Ok((data,sha(&bytes),summary))
}
fn pick_open(app:AppHandle,kind:&str)->Result<Option<PathBuf>,String>{
 let dialog=app.dialog().file();
 let chosen=if kind=="backup"{
    dialog.add_filter("Open IPTV Pro Backup",&["iptvbackup"]).blocking_pick_file()
 }else{dialog.add_filter("XMLTV or M3U",&["m3u","m3u8","txt","xml","xmltv","gz"]).blocking_pick_file()};
 chosen.map(|f|f.into_path().map_err(|e|e.to_string())).transpose()
}
pub async fn export(app:&AppHandle,state:&Arc<AppState>,storage:Value,include_snapshots:bool)->Result<Value,String>{
 let mut storage=storage;
 validate_storage(&storage)?;
 let dvr=state.dvr.lock().await.export_pending();
 storage["open-iptv-pro-dvr-v1"]=Value::String(dvr.to_string());
 let key=if storage.get("open-iptv-pro-4").is_some(){"open-iptv-pro-4"}else{"streamleaf-3"};
 let mut primary:Value=serde_json::from_str(storage[key].as_str().ok_or("Primary config missing")?).map_err(|e|e.to_string())?;
 let mut images=Map::new();let mut missing=0usize;let mut size=0usize;
 if let Some(snapshots)=primary["snapshots"].as_object_mut(){
  for (_,v) in snapshots.iter_mut(){
   let Some(file)=v["file"].as_str().map(str::to_string) else {continue};
   if !include_snapshots||!valid_name(&file){if let Some(o)=v.as_object_mut(){o.remove("file");}continue;}
   if images.contains_key(&file){continue;}
   let bytes=fs::read(state.data_dir.join("snapshots").join(&file)).unwrap_or_default();
   if bytes.len()<4||bytes.len()>5_000_000||!bytes.starts_with(&[0xff,0xd8,0xff]){missing+=1;if let Some(o)=v.as_object_mut(){o.remove("file");}continue;}
   size+=bytes.len();if size>MAX_IMAGES||images.len()>=2000{return Err("Vượt giới hạn ảnh backup".into());}
   images.insert(file,json!({"content":STANDARD.encode(&bytes),"sha256":sha(&bytes)}));
  }
 }
 storage[key]=Value::String(primary.to_string());
 let data=json!({"magic":"open-iptv-pro-backup","formatVersion":1,"createdAt":chrono::Utc::now().to_rfc3339(),
   "appVersion":"4.23.17-tauri.1","includesSnapshots":include_snapshots,"storage":storage,"snapshotFiles":images});
 let bytes=serde_json::to_vec(&data).map_err(|e|e.to_string())?;
 if bytes.len()>MAX_BACKUP{return Err("Bản sao lưu vượt 128MB".into());}
 let handle=app.clone();
 let filename=tokio::task::spawn_blocking(move ||{
   handle.dialog().file().set_file_name("Open-IPTV-Pro-Rust-Lab.iptvbackup")
       .add_filter("Open IPTV Pro Backup",&["iptvbackup"]).blocking_save_file()
       .map(|f|f.into_path().map_err(|e|e.to_string())).transpose()
 }).await.map_err(|e|e.to_string())??;
 let Some(path)=filename else{return Ok(json!({"canceled":true}));};
 atomic_save(&path,&bytes)?;
 Ok(json!({"canceled":false,"file":path.to_string_lossy(),"sourceCount":primary["sources"].as_array().map_or(0,Vec::len),
   "channelCount":primary["channels"].as_array().map_or(0,Vec::len),"images":images.len(),"missingImages":missing,"bytes":bytes.len()}))
}
pub async fn inspect(app:&AppHandle,state:&Arc<AppState>)->Result<Value,String>{
 *state.pending_backup.lock().await=None;
 *state.pending_restore.lock().await=None;
 let handle=app.clone();
 let path=tokio::task::spawn_blocking(move ||pick_open(handle,"backup")).await.map_err(|e|e.to_string())??;
 let Some(path)=path else {return Ok(json!({"canceled":true}));};
 let (_,hash,mut summary)=load(&path)?;
 let token=Uuid::new_v4().simple().to_string();
 *state.pending_backup.lock().await=Some(PendingBackup{path,hash,token:token.clone()});
 summary["canceled"]=json!(false);summary["token"]=json!(token);
 Ok(summary)
}
pub async fn restore(state:&Arc<AppState>,token:&str)->Result<Value,String>{
 let picked=state.pending_backup.lock().await.take().ok_or("Chưa chọn file backup")?;
 if picked.token!=token{return Err("Phiên backup không hợp lệ".into());}
 let (data,hash,_)=load(&picked.path)?;
 if hash!=picked.hash{return Err("File backup đã bị thay đổi".into());}
 let mut storage=data["storage"].clone();
 let key=if storage.get("open-iptv-pro-4").is_some(){"open-iptv-pro-4"}else{"streamleaf-3"};
 let mut primary:Value=serde_json::from_str(storage[key].as_str().ok_or("Primary config missing")?).map_err(|e|e.to_string())?;
 let dir=state.data_dir.join("snapshots");fs::create_dir_all(&dir).map_err(|e|e.to_string())?;
 let mut written=vec![];let mut mapped=std::collections::HashMap::new();
 if let Some(images)=data["snapshotFiles"].as_object(){
  for (name,entry) in images{
   let suffix:String=name.chars().rev().take(90).collect::<String>().chars().rev().collect();
   let new_name=format!("restored_{}_{}",Uuid::new_v4().simple(),suffix);
   let bytes=STANDARD.decode(entry["content"].as_str().unwrap_or("")).map_err(|e|e.to_string())?;
   let target=dir.join(&new_name);
   if let Err(e)=fs::write(&target,bytes){for p in &written{let _=fs::remove_file(p);}return Err(e.to_string());}
   written.push(target);mapped.insert(name.clone(),new_name);
  }
 }
 if let Some(snapshots)=primary["snapshots"].as_object_mut(){
  for (_,v) in snapshots.iter_mut(){if let Some(old)=v["file"].as_str().map(str::to_string){
   if let Some(new)=mapped.get(&old){v["file"]=json!(new);}else if let Some(o)=v.as_object_mut(){o.remove("file");}
  }}
 }
 storage[key]=Value::String(primary.to_string());
 let dvr_data=storage["open-iptv-pro-dvr-v1"].as_str().and_then(|s|serde_json::from_str(s).ok());
 let finish_token=Uuid::new_v4().simple().to_string();
 *state.pending_restore.lock().await=Some(PendingRestore{token:finish_token.clone(),paths:written,dvr_data});
 Ok(json!({"storage":storage,"finishToken":finish_token}))
}
pub async fn finish(state:&Arc<AppState>,token:&str,success:bool)->Result<Value,String>{
 let mut pending=state.pending_restore.lock().await;
 let Some(p)=pending.take() else{return Ok(json!(false));};
 if p.token!=token{*pending=Some(p);return Ok(json!(false));}
 if success {
  if let Some(data)=p.dvr_data{state.dvr.lock().await.import_pending(&data)?;}
 } else {for path in p.paths {let _=fs::remove_file(path);}}
 Ok(json!(true))
}
#[cfg(test)]mod tests{
 use super::*;
 #[test]fn whitelist(){assert!(owned("open-iptv-pro-4"));assert!(!owned("../settings"));assert!(!owned("electron-updater"));}
}
