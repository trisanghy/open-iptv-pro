# Rust Lab v23.8.111 — Real native Qwen3 WatchFlow classification (PRE-RELEASE)

- Standard: Naive Bayes under 1 MB, integrated. Smart: fastText target ~18 MB, not activated without verified trained .ftz weights. No false fallback claim.
- Intelligence now offers real Qwen3 inference using the existing installed MLX model on Mac Apple Silicon via the existing model manager. If absent, user can explicitly select and download a model; no duplicate download on classification.
- New native bounded classification worker receives only names and EPG titles for up to eight actual channels per user action; never sends stream URLs or media data.
- Hy-MT2 remains reusable for translation but not general-purpose WatchFlow classification. The UI explicitly explains this.
- Windows continues Standard and autonomous EPG/Internet enrichment; native Qwen3 MLX only supports Apple Silicon. Mac physical inference quality/latency not yet verified.
- Prerelease only, no Stable/Latest/main updates.
