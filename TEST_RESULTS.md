# v4.16 desktop auto-update – verification

- `npm test`: **51/51 pass** (42 existing checks + 9 new updater tests).
- `python tests/ui_auto_update_v416.py`: pass (official repository, check new release, download progress, install confirmation, manual installer fallback, no Release, source-only release).
- `python tests/ui_language_v415.py`: pass for all 8 interface languages.
- Node syntax: `src/main.cjs`, `src/preload.cjs`, `src/update-manager.cjs`, `renderer/features.js` checked.
- GitHub Actions YAML parsed; **no GitHub publication performed here**.
- **Not tested:** real signed/notarized DMG, Windows Setup, automatic system-level installation on Mac/Windows or the actual GitHub release pipeline. These require OS-specific build machines and release signing credentials.

# Open IPTV Pro v4.13 — Kiểm thử sửa Yêu thích và icon

- **42/42 bài kiểm thử Node.js đạt.**
- **12/12 bộ kiểm thử giao diện Playwright đạt**, gồm bài mới `tests/ui_favorites_sync_v413.py`.
- Bài mới kiểm tra bấm/bỏ sao ở danh sách kênh, khung đang phát, bộ lọc Yêu thích, trang Yêu thích và Snapshot; đồng bộ hồ sơ người dùng; nguồn trùng tên; xóa nguồn rồi nhập lại URL mới.
- Tối ưu đổi sao: chỉ cập nhật các màn liên quan, không dựng lại thư viện hàng nghìn ảnh Snapshot mỗi lần bấm.
- Icon mới được xuất thành SVG/PNG/ICO/ICNS và kiểm tra định dạng tệp.
- **Giới hạn:** kiểm thử dùng M3U và luồng giả lập trong Chromium/Node. Chưa build hoặc kiểm chứng `.dmg`/`.exe` trên máy macOS/Windows thật, chưa thử với playlist người dùng.

---

# Open IPTV Pro v4.13 — Test results

- **42/42 Node.js core tests passed.**
- **11/11 Playwright GUI suites passed**, including `tests/ui_concurrency_v412.py`.
- 40 synthetic streams: maximum **32 concurrent link checks and 32 concurrent Snapshot jobs** in the same run; subsequent test verified 2 checks with 32 Snapshot jobs, and **32 merged-source repairs**. Picker options 1–32 and local persistence verified.
- GUI theme/sources test fixture was adjusted to mock `.invalid` URLs instead of accessing the network; no production behavior changed.
- **Limits:** The tests mock network streams and Snapshot jobs and do not benchmark 32 real FFmpeg processes or remote IPTV servers. macOS `.dmg` / Windows `.exe` were not built or validated on those systems.

---

# Open IPTV Pro v4.11 — Test results

- **42/42 Node.js tests passed**, including a regression for legacy merged channels without `alternates`.
- **11/11 Playwright GUI suites passed**, including `ui_concurrency_v411.py`.
- Parallel-check concurrency measured with 40 simulated channels: **16 workers** when configured to 16, then **2** when configured to 2. Snapshot measured **12** and **16** simultaneous calls respectively. Merged-source link repair also reached **16** concurrent checks.
- Both values are persistent and synchronized between Settings and their quick pickers. In-progress tasks keep their initial worker count.
- Existing EPG, MultiView, favorites, folders, drag/drop, Timeshift and independent cancellation regressions pass.
- **Limits:** tests use local synthetic/mock streams, not real remote IPTV throughput; macOS `.dmg` and Windows `.exe` were not built or tested on those OSes. High settings can exhaust bandwidth or be throttled by providers.

---

# Open IPTV Pro v4.10 – Test results

- **41/41 Node.js core tests passed.**
- **10 Playwright GUI suites passed**, including `tests/ui_drag_fast_snapshots.py`.
- New UI test: drag a channel between M3U groups, drop into collapsed folder, persist `group-title`, run 4 simultaneous mock snapshot requests (max concurrency bounded to 4), skip previously saved images, refresh all with 2 workers, and persist settings.
- Existing independent snapshot and live link-checking tasks regression test still passes.
- **Limits:** concurrency demonstrated using synthetic/mock sources in Chromium. Not yet benchmarked on a real Mac/Windows build, on 2,725 live channels, or with physical FFmpeg under heavy load.

---

# Open IPTV Pro v4.9 — Test results

- **41/41 Node.js tests passed**: previous 29 tests plus 4 Favorites regressions and 8 HTTP/HLS checker tests.
- **9/9 Playwright UI suites passed**, including new `tests/ui_favorites_sources.py` (deduplicated favorites, delete/disable source, restore, source URL change, unstar).
- Link checker integration tests run a local HTTP server for repeated 404, 403, 429, 503, 200 HTML, HLS expired segments, valid MPEG-TS, Range rejection, UA mismatch and transient 404.
- FFmpeg test uses a local synthetic MPEG-TS stream and verifies timeshift HLS files are created then removed.
- All icon formats produced: SVG, PNG, ICO and ICNS.
- **Not tested:** real 2,725-channel playlists, macOS DMG installation, Windows installer, or on-device playback and speed on the user's network. Real services can have custom access headers, geo restrictions or volatile HLS tokens.

---

# Open IPTV Pro v4.9 – Test results

- Node.js core tests: **41/41 passed** (includes 5 new collection, safe merge, repo discovery, repair tests).
- Playwright UI suites: **9/9 passed** (base, EPG, advanced, parallel tasks, failover).
- New Playwright collector test: passed (M3U import, confirmed backup switch, read-only repo scan UI, Git publish removal).
- Tests use synthetic playlists, fake stream status responses and local FFmpeg; no real 624-channel playlist or built macOS/Windows installer was exercised.

## v4.6 checks (synthetic test inputs)

- New Playwright UI test (`tests/ui_v46.py`) covers: default OFF, saved preference ON, one automatic FFmpeg Timeshift startup on LIVE (mocked segment response), silent preview in Favorites and Snapshots, Source Management dry-run/merge/undo and screenshot capture.
- Existing collector UI test updated to use the merge controls in Source Management.
- These tests are **not** a substitute for live stream/FFmpeg playback on a physical macOS or Windows desktop.

## v4.8 — Appearance + source checks
- Test UI Playwright: Sáng/Tối/Tự động, chuyển màu hệ thống, localStorage persistence, xóa mục sidebar, kiểm tra từ Quản lý nguồn.
- Test UI Chromium chạy với playlist mô phỏng; chưa kiểm chứng `.dmg` và `.exe` trên máy thật.

## v4.7 consolidated Source Management

- Removed old sidebar Collector tab and redundant merge button. All controls are within Source Management.
- Reused the collector code and local storage without losing saved sources, previous merge or snapshots.
- Smoke tests exercise import, merge, verified alternate promotion and public GitHub repository M3U discovery with synthetic responses.
- Updated light icon generated as PNG/ICNS/ICO and vector SVG; app build still requires a Mac or Windows runner and has not been tested as an installed executable.
