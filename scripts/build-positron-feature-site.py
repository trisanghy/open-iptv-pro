#!/usr/bin/env python3
"""Build the public Positron feature timeline from authentic GitHub releases.

Read-only against GitHub. Never commits screenshots or changes user IPTV data.
Only images present in a release's real-Electron ZIP are published.
"""
from __future__ import annotations

import io
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "positron-features"
API = "https://api.github.com/repos/trisanghy/open-iptv-pro"
TAG = re.compile(r"^positron/v(\d+\.\d+\.\d+)-p5\.1\.(\d+)$")
FEATURE_NUMBERS = {60, 61, 79, 92, 93, 96, 98, 99, 101, 102, 105, 113, 118, 119, 121, 127, 132}
IMAGE_RE = re.compile(r"(?:^|[-_])p51(\d{1,3})(?=[-_])", re.I)


def get_json(url: str):
    headers = {"User-Agent": "Positron-Feature-Catalog/1.0",
               "Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40) as resp:
        return json.load(resp)


def fetch_releases():
    results = []
    for page in range(1, 5):
        chunk = get_json(API + "/releases?per_page=100&page=" + str(page))
        if not isinstance(chunk, list):
            raise RuntimeError("GitHub release API returned an unexpected response")
        results.extend(chunk)
        if len(chunk) < 100:
            break
    return results


def sections():
    file = ROOT / "POSITRON_P5_CHANGELOG.md"
    if not file.exists():
        return {}
    source = file.read_text(encoding="utf-8")
    headers = list(re.finditer(r"(?m)^## P5\.1\.(\d+)[^\n]*$", source))
    out = {}
    for i, match in enumerate(headers):
        number = int(match.group(1))
        if number in out:
            continue
        segment = source[match.end():headers[i + 1].start() if i + 1 < len(headers) else len(source)]
        bullets = []
        for line in segment.splitlines():
            line = line.strip()
            if line.startswith("- "):
                value = line[2:].strip()
                if not re.match(r"(Status|Tests?|Regression|Candidate|Before|After|Screenshot|CI|Release|Baseline|Input|Root|QA)\b", value, re.I):
                    bullets.append(value)
        if bullets:
            out[number] = " ".join(bullets[:2])[:660]
    return out


def summary_name(release):
    value = str(release.get("name") or "").strip()
    value = re.sub(r"^Open IPTV Pro\s+Positron\s*", "", value, flags=re.I)
    value = re.sub(r"^P5\.1\.\d+\s*[-—–:]*\s*", "", value)
    return value[:160] or "Cập nhật Positron"


def feature_type(n: int, title: str, detail: str):
    # Explicit known feature rounds come from the verified Positron changelog.
    if n in FEATURE_NUMBERS or re.search(
        r"\b(new feature|feat\(|introduce|add new|thêm chức năng|tính năng mới)\b",
        title + " " + detail[:200], re.I
    ):
        return "feature"
    return "fix"


def records(releases, descriptions):
    out = []
    for item in releases:
        matched = TAG.match(str(item.get("tag_name") or ""))
        if not matched or item.get("draft"):
            continue
        version, n = matched.groups()
        n = int(n)
        assets = [{"name": a.get("name", ""), "url": a.get("browser_download_url", "")}
                  for a in item.get("assets", []) if a.get("name") and a.get("browser_download_url")]
        title = summary_name(item)
        description = descriptions.get(n) or str(item.get("body") or "").replace("\r", "").strip()[:600]
        out.append({"number": n, "version": "P5.1." + str(n),
                    "appVersion": version, "title": title, "description": description,
                    "kind": feature_type(n, title, description), "status": "release",
                    "published": item.get("published_at") or "", "tag": item.get("tag_name", ""),
                    "commit": item.get("target_commitish", ""), "url": item.get("html_url", ""),
                    "assets": assets, "image": None})
    out.sort(key=lambda x: x["number"], reverse=True)
    by_number = {}
    for row in out:
        by_number.setdefault(row["number"], row)
    return list(by_number.values())


def add_candidate(rows, descriptions):
    pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    matched = re.search(r"Positron\s+P5\.1\.(\d+)", str(pkg.get("description") or ""))
    if not matched:
        return rows
    n = int(matched.group(1))
    if any(row["number"] == n for row in rows):
        return rows
    sha = os.environ.get("GITHUB_SHA", "").strip()
    if not re.fullmatch(r"[0-9a-fA-F]{40}", sha):
        sha = ""
    label = re.sub(r"^Positron P5\.1\.\d+\s*:?\s*", "", str(pkg.get("description") or ""))
    rows.append({"number": n, "version": "P5.1." + str(n),
                 "appVersion": str(pkg.get("version") or ""), "title": label or "Đang kiểm thử",
                 "description": descriptions.get(n) or label or "Chưa có mô tả.",
                 "kind": feature_type(n, label, descriptions.get(n, "")),
                 "status": "candidate", "published": "", "tag": "", "commit": sha,
                 "url": "https://github.com/trisanghy/open-iptv-pro/tree/Positron",
                 "assets": [], "image": None})
    return rows


def attach_real_images(rows):
    # The most recent successful version's P5 archive retains screenshots
    # of earlier rounds. We download one verified Release asset, not N files.
    sources = [r for r in rows if r["status"] == "release"]
    sources.sort(key=lambda r: r["number"], reverse=True)
    bundle = None
    for row in sources[:8]:
        archive = next((a for a in row["assets"]
                        if re.search(r"20-Real-Screenshots\.zip$", a["name"], re.I)), None)
        if archive:
            bundle = archive
            break
    if not bundle:
        print("INFO: No real Electron screenshots archive in the last 8 releases")
        return
    print("Reading real Electron screenshots:", bundle["name"])
    try:
        req = urllib.request.Request(bundle["url"], headers={"User-Agent": "Positron-Feature-Catalog/1.0"})
        with urllib.request.urlopen(req, timeout=120) as response:
            blob = response.read(60_000_001)
        if len(blob) > 60_000_000:
            raise ValueError("Unexpectedly large screenshot archive")
        with zipfile.ZipFile(io.BytesIO(blob)) as z:
            matches = {}
            for entry in z.infolist():
                name = Path(entry.filename).name
                found = IMAGE_RE.search(name)
                if not found or not name.lower().endswith(".png"):
                    continue
                n = int(found.group(1))
                if entry.file_size <= 1000 or entry.file_size > 7_000_000:
                    continue
                # For each version, choose the screenshot with the clearest
                # feature-specific marker when multiple QA images are present.
                priority = (2 if "after" in name.lower() else 0) + (
                    1 if "real" in name.lower() else 0)
                current = matches.get(n)
                if current is None or priority > current[0]:
                    matches[n] = (priority, entry)
            folder = OUT / "screenshots"
            folder.mkdir(parents=True, exist_ok=True)
            count = 0
            for row in rows:
                match = matches.get(row["number"])
                if match is None:
                    continue
                entry = match[1]
                data = z.read(entry)
                if not data.startswith(b"\x89PNG\r\n\x1a\n"):
                    continue
                # Whitelisted basename only; a zip cannot write arbitrary paths.
                name = Path(entry.filename).name
                (folder / name).write_bytes(data)
                row["image"] = "screenshots/" + name
                count += 1
            print("Published", count, "release-backed individual screenshots")
    except (urllib.error.URLError, ValueError, zipfile.BadZipFile, TimeoutError, OSError) as err:
        # Never fabricate or reuse another version's image on failure.
        print("WARNING: Could not retrieve authentic screenshot ZIP:", err, file=sys.stderr)



def write_github_index(rows):
    """Render a GitHub-native expandable timeline when Pages is owned by web/online.

    Store only public QA images from the release-backed ZIP; never use mock images.
    """
    import html
    docs = ROOT / "docs" / "positron-features"
    docs.mkdir(parents=True, exist_ok=True)
    images = docs / "screenshots"
    images.mkdir(parents=True, exist_ok=True)
    for file in (OUT / "screenshots").glob("*.png"):
        shutil.copyfile(file, images / file.name)
    shutil.copyfile(OUT / "catalog.json", docs / "catalog.json")
    lines = [
        "# Positron — Nhật ký tính năng theo phiên bản",
        "",
        "**Ưu tiên: tính năng mới hữu ích, không chỉ sửa giao diện.**",
        "",
        "Trang này được tạo tự động từ GitHub Releases và ảnh kiểm thử Electron thật. "
        "Bấm vào từng phiên bản để đọc mô tả, mở ảnh và tải EXE.",
        "",
        "[Xem mã nguồn website](index.html) · "
        "[Các bản phát hành](https://github.com/trisanghy/open-iptv-pro/releases) · "
        "[Quy tắc ưu tiên tính năng](../../POSITRON_FEATURE_RULES.md)",
        "",
    ]
    for row in rows:
        title = html.escape(str(row["title"]).replace("\n", " "), quote=False)
        version = html.escape(row["version"])
        status = "ĐANG PHÁT TRIỂN" if row["status"] == "candidate" else "ĐÃ PHÁT HÀNH"
        kind = "TÍNH NĂNG" if row["kind"] == "feature" else "CẢI TIẾN / SỬA LỖI"
        lines.extend([
            "<details>",
            "<summary><strong>" + version + "</strong> · " + title +
            " · " + status + " · " + kind + "</summary>",
            "",
            "**Ứng dụng:** " + row["appVersion"] + " · **Trạng thái:** " + status,
            "",
            str(row.get("description") or "Chưa có mô tả chi tiết.")[:850],
            "",
        ])
        if row.get("image"):
            file = Path(row["image"]).name
            lines.extend(["![Ảnh chụp Electron thật " + version + "](./screenshots/" + file + ")", ""])
        else:
            lines.extend(["*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*", ""])
        links = []
        if row.get("url"):
            links.append("[Release / thông tin](" + row["url"] + ")")
        if re.fullmatch(r"[0-9a-fA-F]{40}", str(row.get("commit") or "")):
            links.append("[Commit](https://github.com/trisanghy/open-iptv-pro/commit/" +
                         row["commit"] + ")")
        for asset in row.get("assets", []):
            if "Setup" in asset["name"] and asset["name"].endswith("-x64.exe"):
                links.append("[Tải Windows Setup x64](" + asset["url"] + ")")
                break
        for asset in row.get("assets", []):
            if asset["name"].endswith("20-Real-Screenshots.zip"):
                links.append("[Tải gói ảnh QA](" + asset["url"] + ")")
                break
        lines.extend([" · ".join(links), "", "</details>", ""])
    lines.extend([
        "---", "",
        "Ảnh chỉ xuất hiện nếu có PNG thực từ GitHub Release. "
        "Mỗi lần nhánh Positron được cập nhật, GitHub Actions tạo lại "
        "trang Markdown và đồng bộ ảnh mà không force-push hay sửa nhánh web/online.",
        "",
    ])
    (docs / "FEATURES.md").write_text("\n".join(lines), encoding="utf-8")
    print("Wrote GitHub-native timeline with", len(rows), "expandable version rows")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / "docs" / "positron-features" / "index.html", OUT / "index.html")
    descriptions = sections()
    rows = add_candidate(records(fetch_releases(), descriptions), descriptions)
    attach_real_images(rows)
    rows.sort(key=lambda row: row["number"], reverse=True)
    (OUT / "catalog.json").write_text(json.dumps({
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "repository": "trisanghy/open-iptv-pro", "branch": "Positron",
        "versions": rows
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    write_github_index(rows)
    (ROOT / "site" / "index.html").write_text(
        '<!doctype html><html lang="vi"><meta charset="utf-8">'
        '<meta http-equiv="refresh" content="0;url=./positron-features/">'
        '<title>Positron Feature Lab</title>'
        '<a href="./positron-features/">Xem nhật ký Positron</a></html>\n',
        encoding="utf-8")
    print("Built", len(rows), "version rows under site/positron-features/")


if __name__ == "__main__":
    main()
