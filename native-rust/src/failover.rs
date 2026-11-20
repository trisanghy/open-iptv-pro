//! Native playback failover helpers; candidate creation has no network side effects.
use std::collections::BTreeSet;

pub fn candidates(primary: &str, alternates: &[String]) -> Vec<String> {
    let mut seen = BTreeSet::new();
    std::iter::once(primary.to_string())
        .chain(alternates.iter().take(8).cloned())
        .filter(|u| crate::m3u::is_media_url(u) && seen.insert(u.to_string()))
        .collect()
}

pub fn next_index(current: usize, len: usize) -> Option<usize> {
    current.checked_add(1).filter(|i| *i < len)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn unique_and_bounded() {
        let primary="https://a.test/live.m3u8";
        let alt=vec![primary.to_string(),"bad-url".to_string(),"https://b.test/live.m3u8".to_string()];
        assert_eq!(candidates(primary,&alt).len(),2);
        assert_eq!(next_index(0,2),Some(1));
        assert_eq!(next_index(1,2),None);
    }
}
