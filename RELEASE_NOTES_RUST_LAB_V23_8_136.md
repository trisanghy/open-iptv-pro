# Rust Lab v23.8.136 — All WatchFlow AI model options visible (PRE-RELEASE)

- Fix UI visibility bug: Standard mode hid the Smart and Intelligence model sections, making the user believe only two options remained.
- All three model groups remain visible within the expanded model manager, with a highlighted active mode. Standard retains 2 entries (Naive Bayes installed and fastText ~18 MB not supported).
- Smart shows all 5 candidates and opens their comparisons by default. Only E5 Small INT8 and Multilingual MiniLM INT8 have a valid download path; TinyBERT/MobileBERT/PhoBERT remain clearly unavailable.
- Intelligence keeps existing installed or download-capable Qwen3/Hy-MT2 entries with genuine native state and no false inference claims.
- Model download/delete behavior unchanged; merely viewing the catalog does not download weights. Preserve v23.8.135 WebAssembly CSP fix and prerelease-only rule.
- Static Node and real Chromium UI tests verify full model group visibility and save a screenshot artifact. Mac/Windows native runtime inference must still be verified on user hardware.
