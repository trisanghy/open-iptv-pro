# Open IPTV Pro — Web Online

Bản mã nguồn và website đang phát hành từ nhánh [web/online](https://github.com/trisanghy/open-iptv-pro/tree/web/online), commit `787c73a00b1be51fd5970a204d50d8bc9fcfad91`.

**[MỞ WEB IPTV](https://trisanghy.github.io/open-iptv-pro/)** · [Hướng dẫn](huong-dan.html).

## Cấu trúc

- `index.html`, các file `.js`/`.css` cùng cấp, `locales/`, `assets/`, `epg/`: **website đã đóng gói**, chạy từ thư mục này qua một HTTP server.
- `web-online/`: mã nguồn chuyển đổi WebView → Web, script tạo site, kiểm tra EPG/Cloud Sync và tests.
- `supabase/migrations/`: migration dùng cho Cloud Sync (chỉ chạy nếu chủ dự án cấu hình và cấp quyền).
- `cloud-config.json`: cấu hình trình duyệt **public**, không chứa service-role secret.

Các bản sao code Electron legacy (renderer/, src/, tests/, scripts/) và source ZIP cũ không cần để chạy Website và đã được bỏ khỏi snapshot trên main; mã Electron chính hiện ở gốc repository.

## Chạy & kiểm tra

Dùng máy chủ HTTP tĩnh tại thư mục `web/`, không mở trực tiếp qua `file://` khi cần Fetch/Service Worker hoặc Cloud Sync.

```bash
python3 -m http.server 8000
```

Từ thư mục gốc `web/` (tại `http://localhost:8000/`). Có thể kiểm thử các module qua `node --test web-online/tests/*.test.cjs` (Node.js 22+).

Web phụ thuộc CORS, autoplay, codec, DRM và cấu hình Supabase. Không thể đảm bảo mọi nguồn phát vốn hoạt động trên Electron sẽ chạy trên trình duyệt.
