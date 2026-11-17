//! Tauri floating mini-player fallback when HTML PiP is rejected by WKWebView.
use std::sync::Mutex;
use serde_json::{json,Value};
use tauri::{AppHandle,Emitter,Manager,WebviewUrl,WebviewWindowBuilder};
use uuid::Uuid;
use crate::stream;
#[derive(Default)]
pub struct PipState{pub session:Mutex<Option<Value>>}
pub fn open(app:&AppHandle,v:&Value)->Result<Value,String>{
 let url=v["url"].as_str().ok_or("Chưa chọn nguồn phát")?;
 if url.len()>4096{return Err("URL quá dài".into());}
 stream::valid_http_url(url)?;
 let kind=v["kind"].as_str().unwrap_or("manual");
 if !matches!(kind,"manual"|"navigation"|"background"){return Err("Kiểu PiP không hợp lệ".into());}
 let state=app.state::<PipState>();
 if let Some(window)=app.get_webview_window("pip"){
  window.show().map_err(|e|e.to_string())?;
  let saved=state.session.lock().map_err(|_|"PiP state lock")?;
  return Ok(json!({"opened":true,"id":saved.as_ref().and_then(|s|s["id"].as_str()).unwrap_or("")}));
 }
 let id=Uuid::new_v4().simple().to_string();
 let title=v["title"].as_str().unwrap_or("Open IPTV Pro").chars().take(90).collect::<String>();
 let volume=v["volume"].as_f64().unwrap_or(1.0).clamp(0.0,1.0);
 let position=v["position"].as_f64().unwrap_or(0.0).max(0.0);
 let saved=json!({"id":id,"url":url,"title":title,"volume":volume,"muted":v["muted"]==true,"position":position});
 *state.session.lock().map_err(|_|"PiP state lock")?=Some(saved);
 let result=WebviewWindowBuilder::new(app,"pip",WebviewUrl::App("pip.html".into()))
  .title("Open IPTV Pro · Mini Player").inner_size(460.0,292.0)
  .min_inner_size(300.0,190.0).resizable(true).always_on_top(true).build();
 if let Err(e)=result{
  *state.session.lock().map_err(|_|"PiP state lock")?=None;
  return Err(format!("Không mở được cửa sổ nổi: {e}"));
 }
 Ok(json!({"opened":true,"id":id}))
}
pub fn session(app:&AppHandle)->Result<Value,String>{
 app.state::<PipState>().session.lock().map_err(|_|"PiP state lock".into())?
  .clone().ok_or("Không tìm thấy phiên PiP".into())
}
pub fn notify(app:&AppHandle,kind:&str,v:&Value)->Result<Value,String>{
 let current=session(app)?;
 if current["id"]!=v["id"]{return Err("Phiên PiP đã thay đổi".into());}
 let message=v["message"].as_str().unwrap_or("").chars().take(170).collect::<String>();
 app.emit_to("main","pip:event",json!({"type":kind,"id":current["id"],"message":message}))
  .map_err(|e|e.to_string())?;
 Ok(json!({"sent":true}))
}
pub fn close(app:&AppHandle)->Result<Value,String>{
 if let Some(window)=app.get_webview_window("pip"){
  window.close().map_err(|e|e.to_string())?;
  return Ok(json!({"closed":true}));
 }
 Ok(json!({"closed":false}))
}
