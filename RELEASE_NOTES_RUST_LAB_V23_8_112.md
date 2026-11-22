# Rust Lab v23.8.112 — WatchFlow model tiers (PRE-RELEASE)

- **Standard (<20 MB):** working Naive Bayes classifier below 1 MB. fastText Quantized ~18 MB remains a planned optional model without trained weights.
- **Smart (<200 MB):** user can select and persist TinyBERT 4L INT8, MobileBERT INT8, multilingual E5 Small INT8, multilingual MiniLM INT8, PhoBERT Base INT8. UI describes every candidate's strengths, estimated size and limitations.
- Smart selection is configuration only; no verified Smart weights or local runtime are supplied yet. Current classifications remain from Standard Bayes and existing local behavior ranking is unchanged. No false installed/active status, no automatic downloads.
- Future installation must verify the model + tokenizer are strictly below 200 MiB, verify integrity/license, and have an actual tested inference backend before claiming to run.
- Intelligence Qwen3 native inference and user-triggered MLX download unchanged. No Stable/Latest/main edits; immutable Rust Lab prerelease.
- Tests: new Smart catalog regression tests plus existing WatchFlow suite. Await GitHub Actions for native builds and EXE artifact.
