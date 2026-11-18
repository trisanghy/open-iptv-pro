//! Durable primary IPTV data for Tauri Rust Lab. Files are stored only inside
//! the Tauri app data directory; callers cannot supply a filesystem path.
use std::{fs,io::Write,path::Path};
use serde_json::{json,Value};
use uuid::Uuid;
const MAX_BYTES:usize=64*1024*1024;
const NAME:&str="primary-store-v1.json";
fn path(dir:&Path)->std::path::PathBuf{dir.join(NAME)}

pub fn read(dir:&Path)->Result<Value,String>{
 let file=path(dir);
 if !file.exists(){return Ok(Value::Null);}
 if fs::metadata(&file).map_err(|e|e.to_string())?.len()>MAX_BYTES as u64{return Err("Dữ liệu kênh trên ổ đĩa vượt giới hạn 64MB".into());}
 let raw=fs::read_to_string(file).map_err(|e|e.to_string())?;
 let v:Value=serde_json::from_str(&raw).map_err(|e|format!("Dữ liệu đã lưu bị lỗi: {e}"))?;
 if !v.is_object(){return Err("Dữ liệu lưu không hợp lệ".into());}
 Ok(json!(raw))
}

pub fn write(dir:&Path,raw:&str)->Result<Value,String>{
 if raw.len()>MAX_BYTES{return Err("Danh sách vượt giới hạn tệp dữ liệu 64MB".into());}
 let parsed:Value=serde_json::from_str(raw).map_err(|e|format!("Dữ liệu JSON không hợp lệ: {e}"))?;
 if !parsed.is_object()||!parsed.get("channels").is_some_and(Value::is_array)
     ||!parsed.get("sources").is_some_and(Value::is_array) {
   return Err("Thiếu cấu trúc nguồn/kênh; không ghi đè dữ liệu đang có".into());
 }
 fs::create_dir_all(dir).map_err(|e|e.to_string())?;
 let target=path(dir);
 let tmp=dir.join(format!(".primary-{}.tmp",Uuid::new_v4().simple()));
 let backup=dir.join("primary-store-v1.previous.json");
 let result=(||->Result<(),String>{
   let mut f=fs::File::create(&tmp).map_err(|e|e.to_string())?;
   f.write_all(raw.as_bytes()).map_err(|e|e.to_string())?;
   f.sync_all().map_err(|e|e.to_string())?;
   if target.exists() { // Retain a previous known-good version for recovery.
      fs::copy(&target,&backup).map_err(|e|format!("Không sao lưu được dữ liệu cũ: {e}"))?;
   }
   match fs::rename(&tmp,&target){
      Ok(())=>Ok(()),
      Err(e)=>{
         // Windows can reject rename-over-existing. Preserve a recoverable
         // previous copy before replacing the destination.
         if !target.exists(){return Err(e.to_string());}
         fs::remove_file(&target).map_err(|e|e.to_string())?;
         fs::rename(&tmp,&target).map_err(|e|format!("Không thể đổi tệp dữ liệu: {e}. Bản trước ở {}",backup.display()))
      }
   }
 })();
 if result.is_err(){let _=fs::remove_file(&tmp);}
 result?;Ok(json!({"saved":true,"bytes":raw.len()}))
}

#[cfg(test)]
mod tests {
 use super::*;
 #[test] fn write_read_and_reject_bad_input(){
   let dir=std::env::temp_dir().join(format!("iptv-primary-test-{}",Uuid::new_v4()));
   let ok=r#"{"sources":[],"channels":[{"url":"https://example.com/a"}],"favorites":[]}"#;
   assert!(write(&dir,ok).is_ok());
   assert_eq!(read(&dir).unwrap().as_str(),Some(ok));
   assert!(write(&dir,r#"{"sources":[]}"#).is_err());
   assert_eq!(read(&dir).unwrap().as_str(),Some(ok));
   let _=fs::remove_dir_all(dir);
 }
}
