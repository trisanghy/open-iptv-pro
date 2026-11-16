//! FFmpeg-backed rolling buffer and single-channel scheduled DVR.
//! FFmpeg must be present on PATH or configured with OPEN_IPTV_FFMPEG.
use std::{path::{Path,PathBuf},fs,sync::Arc};
use serde::{Serialize,Deserialize};
use serde_json::{Value,json};
use tokio::{process::{Child,Command},time::{Duration,interval}};
use crate::AppState;
use uuid::Uuid;

pub struct TimeSession { pub id:String,pub minutes:u32,pub created_at:i64,pub child:Child,pub folder:PathBuf }
fn now()->i64{chrono::Utc::now().timestamp_millis()}
fn safe_file(s:&str)->String{
 let out:String=s.chars().filter(|c|c.is_alphanumeric()||matches!(c,' '|'-'|'_')).take(70).collect();
 if out.trim().is_empty(){"channel".into()}else{out.trim().replace(' ',"_")}
}
fn validate_url(raw:&str)->Result<(),String>{crate::stream::valid_http_url(raw).map(|_|())}
pub async fn start_timeshift(state:&Arc<AppState>,url:&str,minutes:u32)->Result<Value,String>{
 validate_url(url)?;
 if ![5,10,15,30].contains(&minutes){return Err("Tua lại chỉ hỗ trợ 5/10/15/30 phút".into());}
 let bin=state.ffmpeg.as_ref().ok_or("Chưa cài FFmpeg: cần cài FFmpeg rồi mở lại ứng dụng")?;
 stop_timeshift(state).await;
 let id=Uuid::new_v4().simple().to_string();
 let folder=state.data_dir.join("timeshift").join(&id);
 fs::create_dir_all(&folder).map_err(|e|e.to_string())?;
 let dest=folder.join("rolling.m3u8");
 let mut cmd=Command::new(bin);
 cmd.args(["-hide_banner","-nostdin","-loglevel","error","-rw_timeout","10000000","-i",url,
       "-map","0:v:0","-map","0:a:0?","-c","copy","-f","hls","-hls_time","5",
       "-hls_list_size",&(minutes*12).to_string(),"-hls_delete_threshold","3",
       "-hls_flags","delete_segments+omit_endlist","-hls_segment_filename"])
   .arg(folder.join("segment_%06d.ts")).arg(dest)
   .stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null()).kill_on_drop(true);
 let child=cmd.spawn().map_err(|e|format!("Cannot start FFmpeg: {e}"))?;
 let created_at=now();
 *state.timeshift.lock().await=Some(TimeSession{id:id.clone(),minutes,created_at,child,folder});
 Ok(json!({"id":id,"url":crate::stream::buffer_url(state,&id,"rolling.m3u8")}))
}
pub async fn stop_timeshift(state:&Arc<AppState>){
 let session=state.timeshift.lock().await.take();
 if let Some(mut s)=session {let _=s.child.kill().await;let _=fs::remove_dir_all(&s.folder);}
}
pub async fn timeshift_status(state:&Arc<AppState>)->Value{
 let mut lock=state.timeshift.lock().await;
 if let Some(session)=lock.as_mut(){
  let done=session.child.try_wait().ok().flatten().map(|s|format!("FFmpeg exited with {s}"));
  return json!({"active":done.is_none(),"id":session.id,"uptimeSec":(now()-session.created_at)/1000,
               "minutes":session.minutes,"error":done.unwrap_or_default()});
 }
 json!({"active":false})
}

#[derive(Clone,Debug,Serialize,Deserialize)]
#[serde(rename_all="camelCase")]
pub struct DvrJob {
 pub id:String,pub channel_id:String,pub channel_name:String,pub url:String,
 pub start_at:i64,pub end_at:i64,pub title:String,pub status:String,
 #[serde(default)]pub file:Option<String>,
 #[serde(default)]pub bytes:Option<u64>,
 #[serde(default)]pub error:Option<String>,
 #[serde(default)]pub late_ms:Option<i64>
}
pub struct DvrStore {
 pub directory:PathBuf,
 pub jobs:Vec<DvrJob>,
 pub active:Option<(String,Child,PathBuf,PathBuf)>,
 pub data_dir:PathBuf,
}
impl DvrStore {
 pub fn load(data_dir:&Path)->Self{
  let dir=fs::read_to_string(data_dir.join("dvr-directory.txt")).ok().map(PathBuf::from)
    .filter(|p|p.is_dir()).unwrap_or_else(||data_dir.join("recordings"));
  let _=fs::create_dir_all(&dir);
  let jobs:Vec<DvrJob>=fs::read(data_dir.join("dvr-jobs.json")).ok()
   .and_then(|bytes|serde_json::from_slice(&bytes).ok()).unwrap_or_default();
  let jobs=jobs.into_iter().map(|mut j|{
   if matches!(j.status.as_str(),"recording"|"finalizing"){j.status="interrupted".into();j.error=Some("Ứng dụng đã đóng khi đang ghi".into());}j
  }).collect();
  Self{directory:dir,jobs,active:None,data_dir:data_dir.to_path_buf()}
 }
 pub fn persist(&self)->Result<(),String>{
  let data=serde_json::to_vec(&self.jobs).map_err(|e|e.to_string())?;
  let tmp=self.data_dir.join("dvr-jobs.json.tmp");
  fs::write(&tmp,data).map_err(|e|e.to_string())?;
  fs::rename(tmp,self.data_dir.join("dvr-jobs.json")).map_err(|e|e.to_string())?;
  fs::write(self.data_dir.join("dvr-directory.txt"),self.directory.to_string_lossy().as_bytes()).map_err(|e|e.to_string())
 }
 pub fn list(&self)->Value{json!({"directory":self.directory.to_string_lossy(),"jobs":self.jobs})}
 pub fn create(&mut self,input:&Value)->Result<Value,String>{
  let url=input["url"].as_str().ok_or("Thiếu URL")?;validate_url(url)?;
  let start_at=input["startAt"].as_i64().ok_or("Thiếu thời gian bắt đầu")?;
  let end_at=input["endAt"].as_i64().ok_or("Thiếu thời gian kết thúc")?;
  if start_at<now()-30_000||end_at-start_at<60_000||end_at-start_at>8*60*60*1000 {return Err("Lịch ghi phải kéo dài từ 1 phút đến 8 giờ và chưa hết hạn".into());}
  if self.jobs.iter().any(|j| j.status=="scheduled"&&start_at<j.end_at&&end_at>j.start_at){return Err("Lịch ghi mới trùng thời gian một lịch đã đặt".into());}
  let job=DvrJob{
    id:Uuid::new_v4().simple().to_string(), channel_id:input["channelId"].as_str().unwrap_or("").into(),
    channel_name:input["channelName"].as_str().unwrap_or("IPTV").chars().take(120).collect(),
    url:url.into(),start_at,end_at,
    title:input["title"].as_str().unwrap_or("Chương trình IPTV").chars().take(220).collect(),
    status:"scheduled".into(),file:None,bytes:None,error:None,late_ms:None,
  };
  self.jobs.push(job.clone());self.persist()?;
  Ok(json!(job))
 }
 pub fn export_pending(&self)->Value{
  let pending:Vec<Value>=self.jobs.iter().filter(|j|j.status=="scheduled"&&j.end_at>now()).map(|j|json!({
   "channelId":j.channel_id,"channelName":j.channel_name,"title":j.title,
   "url":j.url,"startAt":j.start_at,"endAt":j.end_at
  })).collect();
  json!({"version":1,"pending":pending})
 }
 pub fn import_pending(&mut self,raw:&Value)->Result<(),String>{
  if raw["version"]!=1{return Err("Unsupported recording backup version".into());}
  let entries=raw["pending"].as_array().ok_or("Backup pending recordings are invalid")?;
  if entries.len()>100{return Err("Too many schedules in backup".into());}
  for j in entries {
   let url=j["url"].as_str().ok_or("Schedule URL missing")?;
   validate_url(url)?;
   let start=j["startAt"].as_i64().ok_or("Schedule start missing")?;
   let end=j["endAt"].as_i64().ok_or("Schedule end missing")?;
   if start<=now()||end-start<60_000||end-start>8*60*60*1000 {continue;}
   if self.jobs.iter().any(|old|old.status=="scheduled"&&start<old.end_at&&end>old.start_at){continue;}
   self.jobs.push(DvrJob{
    id:Uuid::new_v4().simple().to_string(),
    channel_id:j["channelId"].as_str().unwrap_or("").into(),
    channel_name:j["channelName"].as_str().unwrap_or("IPTV").chars().take(120).collect(),
    url:url.into(),start_at:start,end_at:end,
    title:j["title"].as_str().unwrap_or("IPTV").chars().take(220).collect(),
    status:"scheduled".into(),file:None,bytes:None,error:None,late_ms:None
   });
  }self.persist()
 }
}
pub async fn dvr_stop(state:&Arc<AppState>,id:&str)->Result<Value,String>{
 let child={
  let mut store=state.dvr.lock().await;
  let j=store.jobs.iter_mut().find(|j|j.id==id).ok_or("Không có lịch ghi")?;
  if !["scheduled","recording"].contains(&j.status.as_str()){return Err("Lịch đã dừng".into());}
  j.status="cancelled".into();
  let running=if store.active.as_ref().is_some_and(|(a,_,_,_)|a==id){store.active.take()}else{None};
  store.persist()?;running
 };
 if let Some((_,mut child,_,_))=child{let _=child.kill().await;}
 Ok(json!(true))
}
pub async fn dvr_monitor(state:Arc<AppState>){
 let mut timer=interval(Duration::from_secs(3));
 loop {
  timer.tick().await;
  let Some(bin)=state.ffmpeg.as_ref() else {continue};
  let mut store=state.dvr.lock().await;
  if let Some((id,mut child,temp,final_path))=store.active.take(){
   match child.try_wait(){
    Ok(Some(exit))=>{
     if let Some(job)=store.jobs.iter_mut().find(|j|j.id==id){
      if exit.success(){
       if fs::rename(&temp,&final_path).is_ok(){
        job.status="completed".into();job.file=Some(final_path.to_string_lossy().to_string());
        job.bytes=fs::metadata(&final_path).ok().map(|m|m.len());
       }else{job.status="failed".into();job.error=Some("Không hoàn thiện được MP4".into());}
      }else{job.status="failed".into();job.error=Some(format!("FFmpeg exited: {exit}"));}
     }
    },
    Ok(None)=>{store.active=Some((id,child,temp,final_path));},
    Err(e)=>{if let Some(j)=store.jobs.iter_mut().find(|j|j.id==id){j.status="failed".into();j.error=Some(e.to_string());}}
   }
  }
  if store.active.is_none(){
   let now=now();
   for j in &mut store.jobs{if j.status=="scheduled"&&j.end_at<=now{j.status="missed".into();}}
   if let Some(index)=store.jobs.iter().position(|j|j.status=="scheduled"&&j.start_at<=now&&j.end_at>now){
    // Snapshot this scheduled job before mutating `store.jobs` after spawning FFmpeg.
    // Keeping `&store.jobs[index]` alive would trigger Rust E0502.
    let j=store.jobs[index].clone();
    let filename=format!("{}_{}_{}.mp4",safe_file(&j.channel_name),j.start_at,safe_file(&j.title));
    let final_path=store.directory.join(filename);
    let temp=final_path.with_extension("partial.mp4");
    let duration=((j.end_at-now)/1000).max(1).to_string();
    let url=j.url.clone();let id=j.id.clone();
    let mut cmd=Command::new(bin);
    cmd.args(["-hide_banner","-nostdin","-loglevel","error","-y","-i",&url,"-t",&duration,
       "-map","0:v:0?","-map","0:a:0?","-c","copy","-movflags","+faststart","-f","mp4"])
     .arg(&temp).stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null())
     .stderr(std::process::Stdio::null()).kill_on_drop(true);
    match cmd.spawn(){
     Ok(child)=>{store.jobs[index].status="recording".into();store.jobs[index].late_ms=Some(now-j.start_at);
       store.active=Some((id,child,temp,final_path));},
     Err(e)=>{store.jobs[index].status="failed".into();store.jobs[index].error=Some(e.to_string());}
    }
   }
  }
  let _=store.persist();
 }
}
#[cfg(test)]mod tests {
 use super::*;
 #[test]fn name_sanitized(){assert!(!safe_file("../../hello\\evil").contains('/'));}
}
