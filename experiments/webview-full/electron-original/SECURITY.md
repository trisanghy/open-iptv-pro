# Security

- Do not paste GitHub tokens in issues, bug reports or screenshots.
- No GitHub/Gist publishing code or token-based upload is included in the app.
- Repository discovery uses the public, read-only GitHub API and imports only selected `.m3u` files; remote scripts are never executed.
- The optional channel/media proxy listens on localhost with an unpredictable session key.
- Only import IPTV playlists from sources you trust; streams and logo URLs may
  contact third-party servers and reveal your public IP address to them.
- When filing a security report, do not include real private playlists; send a
  synthetic test sample instead.
- No included playlist grants access to copyrighted or paid channels.
