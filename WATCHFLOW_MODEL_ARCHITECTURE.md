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
