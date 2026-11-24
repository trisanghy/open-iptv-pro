# Open IPTV Pro — mandatory repository release policy

Applies to ALL branches and ALL future commits, generated workflows, agents, CI, releases and patch cycles.

## The Releases page is STABLE ONLY
- GitHub Releases in `trisanghy/open-iptv-pro` are repository-wide, not branch-scoped.
- Publish a GitHub Release ONLY for a tested, official Stable version from `main` with a semantic version tag (e.g. `v4.23.76`). Existing legitimate stable versions must remain available.
 - A Stable release may contain **only verified Stable installers/assets**. Never attach experimental Rust Lab betas, Mobile debug builds, development previews, or test-only screenshots to an official Stable release. Existing historical Stable assets must not be silently rewritten.
- **Never** publish prereleases, betas, release-per-commit, screenshot-only releases, experimental test releases, or non-Stable patch releases to GitHub Releases.
- On every development branch, including `Positron`, `tizenbrew`, Rust Lab/Tauri, Slint, Electron desktop, Web Online and Mobile Capacitor, use GitHub Actions `actions/upload-artifact@v4` for EXE/DMG/WGT/APK/IPA/ZIP files, test reports, screenshots and preview packages.
- Git commit SHAs, branch histories and immutable experimental tags remain in Git; they are **not** GitHub Release objects. Never delete commits, branches, tags or legitimate Stable releases to enforce this policy.
- Keep all QA/build workflows working. Disable/remove ONLY steps/jobs that call `gh release create`, `gh release upload`, `gh release edit`, release REST publication endpoints, or `softprops/action-gh-release` on non-`main` branches.
- Do not regenerate `.github/workflows/positron-lab.yml` or other automatically rewritten workflows with an enabled `release` / `publish` job. Keep artifacts but leave GitHub Release publication disabled. Before every commit, check generated CI changes for unintended Release publication.
- The `main` workflow `.github/workflows/stable-release-policy.yml` audits and deletes non-Stable Release objects from the shared Releases page; it never deletes Git tags or source history.
- Link experimental builds to their GitHub Actions run/artifact, **not** `/releases/tag/<experimental-tag>`. Do not claim an artifact exists until the build succeeds and the artifact is verified.
- Do not force-push. Respect branch isolation; changes for a particular product/branch must not unexpectedly modify other product branches.

This policy must survive version bumps, generated workflows, bulk upgrade loops, CI refactoring, automated commits and future AI-assisted changes.

## Positron changelog evidence sync
- Preserve `refresh-changelog` in both `.github/workflows/positron-lab.yml` (after test, capture and build) and `.github/workflows/positron-fast-round.yml` (after fast Electron QA), including when generating workflows for subsequent versions. Keep `.github/workflows/positron-catalog-refresh.yml` and exact-version Actions artifact evidence. Mark installer success independently from overall QA. Do not publish experimental Releases or alter the Web Online Pages source for catalog synchronization.
