//! Safe outbound HTTP for Discovery and imported remote M3U playlists.
//! Resolve, verify and PIN public DNS IPs. Never follow automatic redirects.
use std::{net::{IpAddr,Ipv4Addr,Ipv6Addr,SocketAddr},time::Duration};
use reqwest::{header,redirect::Policy,Url};
use url::Host;

const MAX_REDIRECTS:usize=4;
pub fn public_ipv4(ip:Ipv4Addr)->bool{
 let [a,b,c,_]=ip.octets();
 !(a==0||a==10||a==127||a>=224||
  (a==100&&(64..=127).contains(&b))||(a==169&&b==254)||
  (a==172&&(16..=31).contains(&b))||
  (a==192&&(b==0||b==168||(b==88&&c==99)))||
  (a==198&&(b==18||b==19||(b==51&&c==100)))||
  (a==203&&b==0&&c==113))
}
pub fn public_ipv6(ip:Ipv6Addr)->bool{
 let s=ip.segments();
 (0x2000..0x4000).contains(&s[0]) &&
 !(s[0]==0x2001&&(s[1]==0||s[1]==0x0db8)) &&
 s[0]!=0x2002&&ip.to_ipv4().is_none()
}
pub fn public_ip(ip:IpAddr)->bool{
 match ip{IpAddr::V4(v)=>public_ipv4(v),IpAddr::V6(v)=>public_ipv6(v)}
}
pub fn validate_url(url:&Url)->Result<(),String>{
 if !matches!(url.scheme(),"http"|"https"){return Err("Chỉ hỗ trợ HTTP/HTTPS".into());}
 if !url.username().is_empty()||url.password().is_some(){return Err("URL chứa thông tin đăng nhập".into());}
 if url.port_or_known_default().is_none(){return Err("Cổng URL không hợp lệ".into());}
 match url.host().ok_or("URL thiếu host")? {
  Host::Ipv4(ip) if !public_ipv4(ip)=>Err("Chặn địa chỉ nội bộ/đặc biệt (SSRF)".into()),
  Host::Ipv6(ip) if !public_ipv6(ip)=>Err("Chặn IPv6 nội bộ/đặc biệt (SSRF)".into()),
  Host::Domain(host)=>{
   let host=host.to_ascii_lowercase();
   if host=="localhost"||host.ends_with(".localhost")||
    host.ends_with(".local")||host.ends_with(".internal")||
    host.ends_with(".home.arpa")||host.ends_with(".onion")||
    host.ends_with(".test")||host.ends_with(".invalid"){
    return Err("Chặn hostname nội bộ/đặc biệt (SSRF)".into());
   }
   Ok(())
  },_=>Ok(())
 }
}
pub fn validate_redirect(base:&Url,location:&str)->Result<Url,String>{
 let next=base.join(location).map_err(|_|"Redirect không hợp lệ")?;
 validate_url(&next)?;Ok(next)
}
async fn pinned_client(url:&Url)->Result<reqwest::Client,String>{
 validate_url(url)?;
 let port=url.port_or_known_default().ok_or("Thiếu cổng")?;
 let mut builder=reqwest::Client::builder().no_proxy().redirect(Policy::none())
  .connect_timeout(Duration::from_secs(6)).timeout(Duration::from_secs(15));
 if let Host::Domain(host)=url.host().ok_or("Thiếu hostname")? {
  let addresses=tokio::time::timeout(Duration::from_secs(6),tokio::net::lookup_host((host,port)))
   .await.map_err(|_|"DNS quá thời gian")?.map_err(|_|"Không phân giải DNS")?
   .map(|a|a.ip()).collect::<Vec<_>>();
  // Reject mixed public/private DNS results, rather than risking a rebind.
  if addresses.is_empty()||addresses.iter().any(|ip|!public_ip(*ip)){
   return Err("DNS trỏ tới địa chỉ nội bộ/đặc biệt (SSRF)".into());
  }
  // HTTPS continues to validate the ORIGINAL hostname; TCP connects to
  // exactly the checked public address, not a newly resolved rebind.
  builder=builder.resolve(host,SocketAddr::new(addresses[0],port));
 }
 builder.build().map_err(|e|e.to_string())
}
pub async fn get(url:&Url)->Result<reqwest::Response,String>{
 let mut target=url.clone();
 for step in 0..=MAX_REDIRECTS {
  let client=pinned_client(&target).await?;
  let response=client.get(target.clone())
   .header(header::USER_AGENT,"Mozilla/5.0 (compatible; OpenIPTVPro-RustLab)")
   .send().await.map_err(|e|format!("Kết nối lỗi: {e}"))?;
  if !response.status().is_redirection(){return Ok(response);}
  if step==MAX_REDIRECTS{return Err("Redirect vượt giới hạn".into());}
  let location=response.headers().get(header::LOCATION)
   .and_then(|v|v.to_str().ok()).ok_or("Redirect thiếu Location")?;
  target=validate_redirect(&target,location)?;
 }
 Err("Redirect vượt giới hạn".into())
}
pub async fn read_bounded(raw:&str,max:usize)->Result<Vec<u8>,String>{
 let url=Url::parse(raw).map_err(|_|"URL không hợp lệ")?;
 let mut response=get(&url).await?;
 if !response.status().is_success(){return Err(format!("HTTP {}",response.status()));}
 if response.content_length().is_some_and(|n|n>max as u64){return Err("Nguồn vượt giới hạn".into());}
 let mut result=Vec::new();
 while let Some(chunk)=response.chunk().await.map_err(|e|e.to_string())? {
  if chunk.len()>max.saturating_sub(result.len()){return Err("Nguồn vượt giới hạn".into());}
  result.extend_from_slice(&chunk);
 }
 Ok(result)
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]fn rejects_nonpublic_addrs_and_dns_hostnames(){
  for x in ["0.0.0.0","127.0.0.1","10.1.2.3","169.254.169.254",
   "192.168.1.1","172.16.1.2","100.64.1.1","198.18.1.2",
   "192.0.2.1","198.51.100.1","203.0.113.1","224.0.0.1",
   "::1","fe80::1","fc00::1","::ffff:127.0.0.1","2001:db8::1"]{
    assert!(!public_ip(x.parse().unwrap()),"{x}");
  }
  for x in ["http://localhost/x","http://host.local/test",
   "http://192.168.1.1/","http://2130706433/","http://[::1]/",
   "file:///etc/passwd","https://user:pw@example.com/"]{
    assert!(validate_url(&Url::parse(x).unwrap()).is_err(),"{x}");
  }
  assert!(public_ip("1.1.1.1".parse().unwrap()));
  assert!(public_ip("2606:4700:4700::1111".parse().unwrap()));
 }
 #[test]fn rejects_redirects_to_private_networks(){
  let from=Url::parse("https://media.example.com/live").unwrap();
  for to in ["http://127.0.0.1/admin","http://169.254.169.254/latest/meta-data",
   "http://host.local/","file:///etc/passwd"]{
   assert!(validate_redirect(&from,to).is_err(),"{to}");
  }
  assert!(validate_redirect(&from,"https://cdn.example.com/new").is_ok());
 }
}
