# WatchFlow AI model architecture — agreed specification

The original v4.23.82 UI concept shows:
1. Standard: rule-based channel/EPG classification, 0 MB extra model.
2. Smart: dedicated **trained ~18 MB channel and TV-program classifier** for offline topics and recommendations. The images do not specify a concrete weights file, checksum, model architecture or download host. The separate demo used ~15 MB, but the more detailed model catalog uses **~18 MB**.
3. Intelligence: **use existing installed AI model first, otherwise download a compatible model**. The original concept depicts Qwen3 0.6B ~523 MB, Qwen3 1.7B ~1.42 GB, Qwen3 4B ~2.55 GB, and Hy-MT2 ~1.20 GB as examples, not guaranteed actual disk sizes.
4. Current Rust Lab has a separate local MLX translation catalog with different estimates depending on variants, plus the WatchFlow Bayes prototype (<1 MB). There is no verified pretrained Smart 18 MB artifact in the repository, and no native WatchFlow LLM inference link yet.
5. UI must clearly show target vs installed/working status; never present a simulated/placeholder model as active.
6. All edits and releases remain **prereleases**; Stable and Latest must be left unchanged.

## Implementation clarification v23.8.109

- The approved lightweight classifier technology is **fastText** (not Naive Bayes); target ~18 MB after training and quantization on real labelled TV/EPG data. No verified .ftz training artefact is supplied/installed yet. DO NOT mislabel the bundled Naive Bayes engine as Smart.
- The existing bundled **Naive Bayes** algorithm is permanently assigned to **Standard** to classify TV programmes/channels from XMLTV metadata; it is independent of any model download.
- Intelligence uses the **existing native Rust Lab AI model inventory** and allows explicit user selection of a previously installed model or on-demand download of another native MLX model via `streamleaf.aiInstallModel` (macOS Apple Silicon only in current native backend). Model selection, installation and reuse do not equate to WatchFlow language-model inference; that backend remains to be implemented.
- All releases are immutable **prereleases** only; no Stable/Latest changes.

## Revised Rust Lab tiers v23.8.112

- Standard (<20 MB): Naive Bayes under 1 MB already running. fastText Quantized targeting ~18 MB is an optional future Standard candidate; no .ftz weights are installed.
- Smart (<200 MB): user's choice from TinyBERT 4L INT8, MobileBERT INT8, multilingual E5 Small INT8, multilingual MiniLM INT8, PhoBERT Base INT8, with descriptions and size estimates. Selection persists locally, but no unverified model is presented as active. Existing Standard Bayes and existing behavioral ranking continue to handle real data.
- Strict activation requirement: full packaged weights plus tokenizer strictly below 200 MiB; verified integrity, license and functional inference runtime. PhoBERT Base unquantized does not qualify.
- Intelligence: existing Qwen3 MLX native integration remains unchanged.

### v23.8.113 regression correction
- UI tests now assert the actual Smart-catalog fallback and installed Qwen3 native route, rather than stale v23.8.108 preview text. The pre-release version is incremented; no immutable tag is rewritten.

## v23.8.115 — Full automatic channel and EPG scan (Rust Lab)

- On startup or playlist/EPG update, the bundled Naive Bayes classifier processes every enabled channel and every valid EPG programme associated with that channel, asynchronously in short batches. No WatchFlow panel action or manual scan is required.
- The current results are in-memory only; scan progress reports channel count, classified count, and matched programme entries. Stale runs are cancelled when the input fingerprint changes. Playback, playlist and source URLs are never modified.
- Optional Internet lookup is separate from the local scan, limited to sanitized public names, with its existing daily request budget. Disabling online search does not disable offline EPG analysis.
- The Standard model works now. Smart Transformer models under 200 MB remain a documented user-selectable catalog pending verified weights and inference runtimes; do not label them active.

## v23.8.117 — multi-topic classification and programme folders

- A shared taxonomy with 17 topics categorizes channel names, user-imported programme EPG titles/descriptions, and confidence-filtered exact-match Wikidata descriptions. Each channel and programme may appear in multiple virtual folders, without modifying M3U groups.
- WatchFlow displays **Thư mục chủ đề** and **Chương trình EPG**. Items are paginated inside disclosure folders and use real playlist IDs and guide match results. No matching EPG yields a truthful explanation, not fabricated programmes.
- Specific channel examples include Asian Food Network => Ẩm thực, An Ninh TV => Pháp luật/Tin tức, and recognized provincial TV stations => Địa phương/Truyền hình tổng hợp. These are metadata-derived classifications, not proof of each individual programme.
- Installed Qwen3 models in Intelligence mode can automatically process the complete available channel queue in the background, one at a time, using cached local metadata results; it no longer caps at eight or creates a separate disconnected result list. Native Qwen3 returns a validated set of up to four topics. Existing non-Intelligence modes do not trigger additional Qwen inference.
- Optional online Wikidata enrichment prioritizes unclassified channels, uses sanitized public names only, and remains bounded by a daily request limit. It cannot guarantee third-party coverage; the offline classification continues independently.

## v23.8.119 — Result-first WatchFlow and native model storage

- Default panel shows ranked channels and matched current/upcoming EPG programmes. The 6-tab/3-large-cards layout is reduced to four outcome tabs: Dành cho bạn, Chủ đề kênh, Chương trình EPG, Tất cả kênh. Preferences, recent viewing, time of day, genres and live/upcoming programme time inform rankings. No EPG means honest empty state; no invented programme titles.
- Models, optional public-name lookup and learned-preference clearing are behind one compact, accessible «⚙ Mô hình AI & dung lượng» details summary near the top. Standard continues to work offline. Smart <200MB entries remain honestly flagged not installed/unavailable without a verified runtime; they are not silently downloaded.
- Native macOS Apple Silicon models (Qwen3 and Hy-MT2) can be selected and installed using existing `aiInstallModel` API with explicit user click. All actually stored models/data (Qwen, HyMT, Whisper/Argos/Piper/etc., runtime/cache) appear with real byte usage via `aiStorageStatus`; any deletions require confirmation and call `aiRemoveModel`. No fake download/delete UI. Shared runtime deletion warns about feature impact. Non-native contexts report unavailable instead of fabricating storage.
- No modification to playback, M3U, guide data, Stable/Latest/main, or other branches. Test coverage for priority rankings, EPG empty/expired states, native install/delete/size wiring, compact layout and privacy-safe operation.

## v23.8.121 — Scan once per channel, update EPG incrementally, preserve browsing state

- WatchFlow automatically saves channel name/group/tvgId topic classifications in `localStorage` under `watchflow:classified-channels-v4`. Startup restores the existing channel/topic folders immediately. Matching channel metadata is **not classified again** on subsequent launches; new/renamed channels alone trigger automatic fresh channel classification.
- EPG programmes have stable hashes of title+description (not air time). Freshly imported/replaced EPG is inspected and only previously unseen programme content requires new classification; rows with changed airtimes reuse learned labels. A compact cache of current/future programme data supports restoring prior programme suggestions before the latest guide arrives. No periodic 30-minute channel rescan.
- Qwen3 local MLX is queued **once per stable channel/model identity**, independent of EPG content and without a seven-day expiration. Results and empty (truly unclassified) labels are cached. Existing legacy v2 EPG-keyed results are migrated when their matching metadata is still available. User changing playlist channel metadata or pressing the explicit **↻ Quét lại** button can force new inference; routine EPG refresh cannot.
- A manual scan deliberately recalculates local channels and guide classifications; it retriggers installed Qwen3 classification in Intelligence mode. The optional public-name Internet lookup remains bounded, only invoked on startup/new channels/manual request, not via 2-minute polling.
- `Thư mục chủ đề` and `Chương trình EPG` store their open/closed state and 'show more' page size while results are refreshed. Qwen progress does not continuously destroy and rebuild the folder DOM. No changes to playlist data, channel source URLs, playback paths, Stable Releases or main.

### v23.8.122 storage quota protection

- Persistent classifications should never be discarded solely because a large EPG pushes WebView localStorage over its quota. The serializer retries with smaller optional programme caches (160/40, 80/20, 40/10, 16/5, finally base-channel-only), preserving all channel topic labels and stable signatures wherever possible. A full-storage failure is surfaced as an error instead of silently pretending persistence succeeded.
- Added regression tests simulate a strict localStorage quota with 560 channels and verify that labels survive restarts, as well as an asynchronous native Qwen3 queue that does not rerun on EPG-only refresh, processes a new channel once, and obeys explicit manual rescan.

## v23.8.124 — Durable WatchFlow cache in IndexedDB

- WatchFlow's channel classification/EPG programme cache and native Qwen3 cache now use a separate **IndexedDB** database (`OpenIPTV-WatchFlow-Cache`) with two purpose-specific keys (`channels`, `qwen`) instead of competing with playlist/EPG/preferences in quota-limited WebView `localStorage`.
- Existing `watchflow:classified-channels-v4` and `watchflow:qwen-channel-cache-v2` values are migrated automatically. The legacy **WatchFlow-only** localStorage key is removed strictly after its replacement is saved successfully; playlist/EPG/other app storage is neither cleared nor changed.
- First launch restores channel categories from durable storage **before** incremental channel/EPG analysis. Restarts reuse Qwen classifications without re-inference; Qwen also retains an in-memory cache for the current session when all persistent storage is genuinely unavailable.
- On IndexedDB errors/unavailability, the previous compact localStorage fallback remains. If both stores are unavailable, correct in-memory results remain usable, with an honest storage warning rather than a misleading `Lỗi quét` (classification failure).
- The WatchFlow close control explicitly sets a legible × foreground in light and dark themes rather than inheriting white text on a white background.
- Regression tests simulate a completely full localStorage with 560 channels and 40 EPG items each, confirm successful IndexedDB restoration and Qwen cache persistence across app restarts, verify migration is restricted to WatchFlow-owned keys, and check failures are not suppressed.

## v23.8.126 — Real Smart ONNX downloads, small-model catalog and inference

- **Standard (<20 MB):** bundled Naive Bayes remains installed and fully usable offline with no weights download; the Standard panel now shows its installed state. The ~18 MB fastText option is listed for comparison but explicitly disabled pending verified Vietnamese `.ftz` weights and a working compatible runner. We do not pretend to download a model already integrated in application code.
- **Smart (<200 MB):** two real quantized multilingual ONNX models were checked on the Hugging Face Hub: `Xenova/multilingual-e5-small` and `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, each approximately 118 MB of INT8 weights plus small tokenizer/config files. Their download buttons require explicit user confirmation, and execute local Transformers.js/ONNX WASM inference as a smoke test before marking installed. Other catalog candidates (TinyBERT, MobileBERT, PhoBERT) remain visible but disabled until Vietnamese-compatible ONNX weights and sizes are verified.
- The application bundles a pinned `@huggingface/transformers@3.8.1` browser runtime and its local ONNX WASM companion assets during build, so it does not import JavaScript from a CDN at application runtime. The app downloads model weights only after the user clicks **↓ Tải**, and saves each model in its own CacheStorage bucket (`openiptv-watchflow-smart-<id>`) for offline use. Smart **Xóa** deletes only that model's CacheStorage bucket, after confirmation; it cannot erase IPTV playlist/EPG or the separate native Qwen/Whisper models.
- The Smart worker restores cached channel topic labels across app restarts, classifies new/changed channels and currently relevant new EPG programme descriptions using on-device semantic embeddings, and merges category labels into the existing WatchFlow folders. No stream URLs, user channel history or private playlists are sent to Hugging Face. Model weights are downloaded from public allowlisted repositories; first-time download requires network and actual on-device WebView/WASM support.
- Downloads/install status are not inferred solely from a selection or a cache marker: only a successful downloaded model + real ONNX inference check can mark a model installed. Legacy Standard remains the automatic fallback if Smart is unavailable or unsupported by the user's device.
