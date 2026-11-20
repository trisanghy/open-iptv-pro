#!/usr/bin/env bash
# Automatically create immutable, namespaced tags for the Rust Lab branch.
set -Eeuo pipefail
EXPECTED_REF="refs/heads/experiment/rust-tauri-v2"
[[ "${GITHUB_REF:-}" == "$EXPECTED_REF" ]] || { echo "::error::Only ${EXPECTED_REF} can create Rust Lab tags"; exit 1; }
: "${GITHUB_SHA:?This script must run in GitHub Actions}"

VERSION="$(node -p 'require("./package.json").version')"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+-tauri\.([0-9]+(\.[0-9]+)*)$ ]]; then
  echo "::error::Invalid package version: ${VERSION}. Use 4.23.17-tauri.19 or 4.23.17-tauri.19.1"
  exit 1
fi
RELEASE="${BASH_REMATCH[1]}"
TAG="rust-lab/v${RELEASE}"
# Fail before freezing a tag if its source release notes are missing.
# This must run before any git tag/push: release artifacts come from the immutable tag.
NOTES="RELEASE_NOTES_RUST_LAB_V${RELEASE//./_}.md"
if [[ ! -s "$NOTES" ]]; then
  echo "::error::Missing release notes before tagging: $NOTES"
  exit 1
fi
# Expose tag state to downstream CI builds; old tags remain immutable.
report(){
 if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'tag=%s\nrelease=%s\npublish=%s\n' "$TAG" "$RELEASE" "$1" >> "$GITHUB_OUTPUT"
 fi
}
echo "Tag policy: package=${VERSION}, tag=${TAG}, head=${GITHUB_SHA}"

EXISTING="$(git ls-remote --refs --tags origin "refs/tags/${TAG}" | awk 'NR==1 {print $1}')"
if [[ -n "$EXISTING" ]]; then
  git fetch --quiet --depth=1 origin "refs/tags/${TAG}:refs/tags/${TAG}"
  PINNED="$(git rev-parse "refs/tags/${TAG}^{commit}")"
  if [[ "$PINNED" == "$GITHUB_SHA" ]]; then
    echo "Existing tag ${TAG} already points to this commit."
    report true
    exit 0
  fi
  # Allow documentation-only follow-up commits, but don't silently republish
  # functional code as the same immutable release version.
  if ! git diff --quiet "$PINNED" "$GITHUB_SHA" -- \
     package.json src-tauri renderer src scripts tests .github/workflows BUILD_MAC_FAST.command; then
    echo "::error::${TAG} is frozen at ${PINNED}. Increment the version (v19.1, v20, ...) before changing code or build scripts."
    exit 1
  fi
  echo "Documentation-only commit. Keeping immutable ${TAG} unchanged."
  report false
  exit 0
fi

git -c user.name='github-actions[bot]' \
    -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
    tag -a "$TAG" "$GITHUB_SHA" -m "Open IPTV Pro Rust Lab ${TAG} (${VERSION})"
git push origin "refs/tags/${TAG}"
echo "Created immutable tag ${TAG} at ${GITHUB_SHA}."
report true
