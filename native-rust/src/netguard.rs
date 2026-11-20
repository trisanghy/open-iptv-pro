//! SSRF safety for AUTOMATIC HTTP fetches (M3U, XMLTV and channel health).
//! Playback initiated by a user through libmpv/FFmpeg remains a separate policy.
use std::io;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr, ToSocketAddrs};
use std::time::Duration;

fn public_ipv4(ip: Ipv4Addr) -> bool {
    let [a, b, c, _] = ip.octets();
    !(
        a == 0 || a == 10 || a == 127 || a >= 224
        || (a == 100 && (64..=127).contains(&b))
        || (a == 169 && b == 254)
        || (a == 172 && (16..=31).contains(&b))
        || (a == 192 && (b == 168 || b == 0 || (b == 88 && c == 99) || (b == 0 && c == 2)))
        || (a == 198 && ((18..=19).contains(&b) || (b == 51 && c == 100)))
        || (a == 203 && b == 0 && c == 113)
    )
}

pub fn public_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => public_ipv4(v4),
        IpAddr::V6(v6) => public_ipv6(v6),
    }
}

fn public_ipv6(ip: Ipv6Addr) -> bool {
    // Only globally routable IPv6 unicast; reject documentation and tunnel prefixes.
    let s = ip.segments();
    (s[0] & 0xe000) == 0x2000
        && !(s[0] == 0x2001 && (s[1] == 0x0db8 || s[1] == 0))
        && s[0] != 0x2002
        && !((s[0] & 0xfff0) == 0x3ff0)
}

/// Does not resolve DNS: useful for rejecting unsafe literal targets before
/// user confirmation and before the request is dispatched.
pub fn validate_public_http_url(raw: &str) -> Result<(), String> {
    if raw.len() > 8192 || raw.chars().any(|c| c.is_whitespace() || c.is_control()) {
        return Err("URL mạng quá dài hoặc có ký tự không hợp lệ".into());
    }
    let parsed = url::Url::parse(raw).map_err(|_| "URL mạng không hợp lệ".to_string())?;
    if !matches!(parsed.scheme(), "http" | "https") {
        return Err("Chỉ chấp nhận URL HTTP(S)".into());
    }
    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err("Không chấp nhận tài khoản hoặc mật khẩu trong URL".into());
    }
    if parsed.fragment().is_some() {
        return Err("URL mạng không được chứa fragment".into());
    }
    match parsed.host() {
        Some(url::Host::Ipv4(ip)) if !public_ip(IpAddr::V4(ip)) => {
            Err("Đã chặn địa chỉ IPv4 mạng nội bộ hoặc dành riêng".into())
        }
        Some(url::Host::Ipv6(ip)) if !public_ip(IpAddr::V6(ip)) => {
            Err("Đã chặn địa chỉ IPv6 mạng nội bộ hoặc dành riêng".into())
        }
        Some(url::Host::Domain(host)) if host == "localhost"
            || host.ends_with(".localhost") || host.ends_with(".local")
            || host.ends_with(".internal") || host.ends_with(".lan") =>
        {
            Err("Đã chặn hostname mạng nội bộ".into())
        }
        None => Err("URL thiếu hostname".into()),
        _ => Ok(()),
    }
}

fn checked_dns(netloc: &str) -> io::Result<Vec<SocketAddr>> {
    let addrs: Vec<SocketAddr> = netloc.to_socket_addrs()?.collect();
    if addrs.is_empty() || addrs.iter().any(|addr| !public_ip(addr.ip())) {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "DNS trả về IP riêng/tài liệu hoặc không có IP công khai",
        ));
    }
    Ok(addrs)
}

/// A ureq 2.x resolver validates the *same* addresses used to establish
/// the connection, avoiding DNS-rebinding TOCTOU. Redirects are re-resolved
/// through this resolver, and proxy environment variables are deliberately
/// ignored so proxies cannot bypass local address checking.
pub fn public_http_agent(total_secs: u64, connect_secs: u64, read_secs: u64) -> ureq::Agent {
    ureq::AgentBuilder::new()
        .try_proxy_from_env(false)
        .resolver(|netloc: &str| checked_dns(netloc))
        .redirects(3)
        .timeout(Duration::from_secs(total_secs))
        .timeout_connect(Duration::from_secs(connect_secs))
        .timeout_read(Duration::from_secs(read_secs))
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn block_private_ipv4_and_ipv6() {
        for raw in ["127.0.0.1", "10.2.3.4", "172.16.0.1",
            "192.168.5.10", "169.254.169.254", "100.64.0.1",
            "0.0.0.0", "198.18.0.1", "192.0.2.1", "203.0.113.4",
            "224.0.0.1", "255.255.255.255", "::1", "fe80::1",
            "fc00::1", "2001:db8::1", "2002::1"] {
            let ip: IpAddr = raw.parse().unwrap();
            assert!(!public_ip(ip), "{raw} must be blocked");
        }
        for raw in ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"] {
            assert!(public_ip(raw.parse().unwrap()), "{raw} must be permitted");
        }
    }
    #[test]
    fn reject_unsafe_urls_before_dns() {
        for url in ["http://127.0.0.1/epg.xml", "http://[::1]/",
            "http://0x7f000001/live", "http://localhost:8080/",
            "http://router.local/live", "http://a.internal/x",
            "file:///etc/passwd", "ftp://example.org/a",
            "https://user:pass@example.org/data", "https://example.org/a#fragment"] {
            assert!(validate_public_http_url(url).is_err(), "{url}");
        }
        for url in ["https://example.org/live.m3u",
            "https://example.org:8443/guide.xml.gz",
            "http://8.8.8.8:8080/m3u"] {
            assert!(validate_public_http_url(url).is_ok(), "{url}");
        }
    }
    #[test]
    fn checked_resolver_blocks_literal_private_targets() {
        assert!(checked_dns("127.0.0.1:80").is_err());
        assert!(checked_dns("[::1]:80").is_err());
        assert!(checked_dns("8.8.8.8:443").is_ok());
    }
}
