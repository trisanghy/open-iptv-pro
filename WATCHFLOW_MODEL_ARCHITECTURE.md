# WatchFlow AI model architecture — agreed specification

The original v4.23.82 UI concept shows:
1. Standard: rule-based channel/EPG classification, 0 MB extra model.
2. Smart: dedicated **trained ~18 MB channel and TV-program classifier** for offline topics and recommendations. The images do not specify a concrete weights file, checksum, model architecture or download host. The separate demo used ~15 MB, but the more detailed model catalog uses **~18 MB**.
3. Intelligence: **use existing installed AI model first, otherwise download a compatible model**. The original concept depicts Qwen3 0.6B ~523 MB, Qwen3 1.7B ~1.42 GB, Qwen3 4B ~2.55 GB, and Hy-MT2 ~1.20 GB as examples, not guaranteed actual disk sizes.
4. Current Rust Lab has a separate local MLX translation catalog with different estimates depending on variants, plus the WatchFlow Bayes prototype (<1 MB). There is no verified pretrained Smart 18 MB artifact in the repository, and no native WatchFlow LLM inference link yet.
5. UI must clearly show target vs installed/working status; never present a simulated/placeholder model as active.
6. All edits and releases remain **prereleases**; Stable and Latest must be left unchanged.
