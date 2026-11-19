# Open IPTV Pro — GitHub Pages user-site homepage

This is **the separate homepage for https://trisanghy.github.io/**, NOT the Open IPTV player at /open-iptv-pro/.

GitHub requires a separate repository named `trisanghy.github.io` for this domain.
At preparation time that repository does not exist, so the player repository cannot serve the user-root hostname.

The Web branch retains a complete homepage at `web-online/project-home.html`.
The workflow packages this source as `index.html`, plus this folder's `robots.txt` and `sitemap.xml`, into the build artifact `openiptv-user-homepage.zip`.

- User-site root /: project introduction, current screenshots, installation guides, download links, repository links
- Project-site /open-iptv-pro/: actual Open IPTV Pro player, NEVER replace its index.html with homepage
- User-site /robots.txt and /sitemap.xml: crawler discovery for both the homepage and project routes
- Project-site /open-iptv-pro/robots.txt and /sitemap.xml: supplementary crawler metadata (robots at the hostname root controls crawling)

All images and actions on the homepage use absolute URLs on the project site so the separate domain root works.
The preview `/open-iptv-pro/gioi-thieu.html` is `noindex` to avoid duplicating the canonical homepage.
The owner repo must be provisioned before its root 404 can disappear. Never claim that preparing this archive deployed to the user-site.
