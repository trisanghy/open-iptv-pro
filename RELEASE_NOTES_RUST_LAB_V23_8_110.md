# Rust Lab v23.8.110 — Align old regression tests with approved three-mode model routing (PRERELEASE)

- Fix outdated tests from 23.8.105 and 23.8.108 that assumed the Naive Bayes model belonged under Smart. It now stays assigned to Standard.
- Update the model selection test to check the exact 'không tải' label and keep explicit-install safeguards.
- No new model weights or LLM inference included. Smart fastText ~18MB remains a target, not a downloaded model.
- Preserve immutable tag policy, Windows EXE, native PiP, CC and release-prerelease isolation.
