//! Discover public IPTV catalogs. Never evaluate imported M3U as code.
use serde_json::{json,Value};
use url::Url;
use crate::{AppState,stream::valid_http_url};
use std::sync::Arc;
const CATALOG: &str="https://iptv-org.github.io";
fn alpha_code(s:&str, uppercase:bool, count:usize)->Result<String,String>{
 let c=if uppercase{s.trim().to_uppercase()}else{s.trim().to_lowercase()};
 if c.len()!=count||!c.chars().all(|x|x.is_ascii_alphabetic()) {return Err("Mã danh mục không hợp lệ".into());}
 Ok(c)
}
fn safe_public_host(url:&Url)->Result<(),String>{
 let host=url.host_str().ok_or("Thiếu host")?.to_lowercase();
 if host=="localhost"||host.ends_with(".localhost")||host.ends_with(".local")||host.ends_with(".internal") {return Err("Không cho phép kiểm tra mạng nội bộ".into());}
 if let Ok(ip)=host.parse::<std::net::IpAddr>(){
  match ip {
   std::net::IpAddr::V4(v) if v.is_private()||v.is_loopback()||v.is_link_local()||v.is_multicast()||v.is_unspecified()=>return Err("Địa chỉ riêng".into()),
   std::net::IpAddr::V6(_)=>return Err("IPv6 literal chưa được hỗ trợ".into()),
   _=>{}
  }
 }
 Ok(())
}
pub fn safe_stream_url(raw:&str)->Result<Url,String>{let u=valid_http_url(raw)?;safe_public_host(&u)?;Ok(u)}
async fn read_limited(state:&Arc<AppState>, url:&str,limit:usize)->Result<String,String>{
 let resp=state.client.get(url).timeout(std::time::Duration::from_secs(25)).send().await.map_err(|e|e.to_string())?;
 if !resp.status().is_success(){return Err(format!("HTTP {}",resp.status()));}
 if resp.content_length().is_some_and(|n|n>limit as u64){return Err("Danh mục vượt giới hạn".into());}
 let data=resp.bytes().await.map_err(|e|e.to_string())?;
 if data.len()>limit{return Err("Danh mục quá lớn".into());}
 Ok(String::from_utf8_lossy(&data).trim_start_matches('\u{feff}').into())
}
fn stats(body:&str)->Result<Value,String>{
 if !body.trim_start().starts_with("#EXTM3U"){return Err("Không phải playlist M3U".into());}
 let mut declared=0usize;let mut unique=std::collections::HashSet::new();
 for line in body.lines(){let l=line.trim();if l.starts_with("#EXTINF:"){declared+=1;}
  else if !l.starts_with('#')&&!l.is_empty(){if let Ok(u)=valid_http_url(l){unique.insert(u.to_string());}}
 }
 if declared==0||unique.is_empty(){return Err("Playlist không có luồng HTTP hợp lệ".into());}
 Ok(json!({"channels":unique.len(),"declared":declared,"duplicateUrls":declared.saturating_sub(unique.len())}))
}
pub async fn countries(state:&Arc<AppState>)->Result<Value,String>{
 let text=read_limited(state,&format!("{CATALOG}/api/countries.json"),250_000).await?;
 let entries:Vec<Value>=serde_json::from_str(&text).map_err(|e|e.to_string())?;
 Ok(Value::Array(entries.into_iter().filter(|v|v["code"].as_str().is_some_and(|s|s.len()==2))
    .map(|v|json!({"code":v["code"],"name":v["name"],"flag":v["flag"]})).take(450).collect()))
}
pub async fn catalog_options(state:&Arc<AppState>, kind:&str)->Result<Value,String>{
 if kind=="country"{return countries(state).await;}
 if !["category","language"].contains(&kind){return Ok(json!([]));}
 let url=format!("{CATALOG}/api/{}.json",if kind=="category"{"categories"}else{"languages"});
 let text=read_limited(state,&url,280_000).await?;
 let entries:Vec<Value>=serde_json::from_str(&text).map_err(|e|e.to_string())?;
 Ok(Value::Array(entries.into_iter().filter_map(|v|{
  let code=if kind=="category"{v["id"].as_str()}else{v["code"].as_str()}?;
  if code.len()>32||!code.chars().all(|c|c.is_ascii_lowercase()||c=='-'){return None}
  Some(json!({"code":code,"name":v["name"]}))
 }).take(500).collect()))
}
pub async fn load(state:&Arc<AppState>, request:&Value)->Result<Value,String>{
 let kind=request["kind"].as_str().unwrap_or("country");
 let code=request["code"].as_str().unwrap_or("");
 let (url,provider,country,limit)=match kind {
  "country"=>{let code=alpha_code(code,false,2)?;(format!("{CATALOG}/iptv/countries/{code}.m3u"),"iptv-org · quốc gia",code.to_uppercase(),3_000_000)},
  "category"=>{let code=code.trim().to_lowercase();if code.len()>32||code.len()<2||!code.chars().all(|c|c.is_ascii_lowercase()||c=='-'){return Err("Category không hợp lệ".into())}
   (format!("{CATALOG}/iptv/categories/{code}.m3u"),"iptv-org · danh mục",code,3_000_000)},
  "language"=>{let code=alpha_code(code,false,3)?;(format!("{CATALOG}/iptv/languages/{code}.m3u"),"iptv-org · ngôn ngữ",code,3_000_000)},
  "global"=>(format!("{CATALOG}/iptv/index.m3u"),"iptv-org · toàn cầu","ALL".into(),12_000_000),
  "freetv"=>("https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8".into(),"Free-TV/IPTV · nguồn chọn lọc","ALL".into(),12_000_000),
  _=>return Err("Loại danh mục không được hỗ trợ".into())
 };
 let content=read_limited(state,&url,limit).await?;
 let mut out=json!({"kind":kind,"code":country,"country":country,"url":url,"content":content,"provider":provider,"fetchedAt":chrono::Utc::now().to_rfc3339()});
 let stats=stats(out["content"].as_str().unwrap())?;
 for name in ["channels","declared","duplicateUrls"] {out[name]=stats[name].clone();}
 Ok(out)
}
pub async fn repo_list(state:&Arc<AppState>,raw:&str)->Result<Value,String>{
 let u=valid_http_url(raw)?;
 if u.host_str()!=Some("github.com"){return Err("Chỉ hỗ trợ Github public repository".into());}
 let seg:Vec<&str>=u.path_segments().ok_or("Repo không hợp lệ")?.filter(|p|!p.is_empty()).collect();
 if seg.len()<2||seg[0].len()>50||seg[1].len()>100||seg[..2].iter().any(|s|!s.chars().all(|c|c.is_ascii_alphanumeric()||matches!(c,'_'|'-'|'.'))){return Err("Đường dẫn repo không hợp lệ".into());}
 let (owner,repo)=(seg[0],seg[1]);
 let client=&state.client;
 let meta:Value=client.get(format!("https://api.github.com/repos/{owner}/{repo}")).header("User-Agent","Open-IPTV-Pro-Rust-Lab").send().await.map_err(|e|e.to_string())?
   .error_for_status().map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())?;
 if meta["private"]==true{return Err("Repository private".into());}
 let branch=meta["default_branch"].as_str().unwrap_or("main");
 let tree:Value=client.get(format!("https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"))
  .header("User-Agent","Open-IPTV-Pro-Rust-Lab").send().await.map_err(|e|e.to_string())?
  .error_for_status().map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())?;
 if tree["truncated"]==true{return Err("GitHub tree truncated".into());}
 let files:Vec<Value>=tree["tree"].as_array().into_iter().flatten().filter_map(|f|{
  if f["type"]!="blob"{return None}
  let path=f["path"].as_str()?;
  if !path.to_ascii_lowercase().ends_with(".m3u")&&!path.to_ascii_lowercase().ends_with(".m3u8"){return None}
  if path.split('/').count()>7||f["size"].as_u64().unwrap_or(0)>5_000_000{return None}
  let escaped=path.split('/').map(|seg|url::form_urlencoded::byte_serialize(seg.as_bytes()).collect::<String>()).collect::<Vec<_>>().join("/");
  Some(json!({"path":path,"size":f["size"],"url":format!("https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{escaped}")}))
 }).take(500).collect();
 Ok(json!({"owner":owner,"repo":repo,"branch":branch,"files":files}))
}
#[cfg(test)]mod tests{
 use super::*;
 #[test]fn private_addresses_blocked(){assert!(safe_stream_url("http://127.0.0.1/m3u").is_err());assert!(safe_stream_url("http://192.168.1.2/test").is_err());}
 #[test]fn catalogue_name_validation(){assert!(alpha_code("VN",true,2).is_ok());assert!(alpha_code("a;b",false,2).is_err());}
}
