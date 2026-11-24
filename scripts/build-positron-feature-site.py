#!/usr/bin/env python3
"""Build the public Positron feature timeline from releases and verified Actions artifacts.

Read-only against GitHub. Never commits screenshots or changes user IPTV data.
Only version-matched real Electron evidence is published.
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
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "positron-features"
API = "https://api.github.com/repos/trisanghy/open-iptv-pro"
TAG = re.compile(r"^positron/v(\d+\.\d+\.\d+)-p5\.1\.(\d+)$")
FEATURE_NUMBERS = {60, 61, 79, 92, 93, 96, 98, 99, 101, 102, 105, 113, 118, 119, 121, 127, 132}
IMAGE_RE = re.compile(r"(?:^|[-_])p51(\d{1,3})(?=[-_])", re.I)
VI_SOURCE = ROOT / "docs" / "positron-features" / "vi.json"


def viet_hoa_rows(rows):
    """Dùng tiêu đề và mô tả tiếng Việt đã được đối chiếu với nhật ký nguồn.

    Không sửa SHA, đường tải, tên ảnh, trạng thái phát hành hay lịch sử Git.
    Phiên bản mới chưa có bản dịch sẽ không hiển thị nguyên văn tiếng Anh.
    """
    data = json.loads(VI_SOURCE.read_text(encoding="utf-8"))
    versions = data["versions"]
    for row in rows:
        translation = versions.get(str(row["number"]))
        if translation:
            row["title"] = translation["title"]
            row["description"] = translation["description"]
        else:
            # Với phiên bản mới, ưu tiên chính changelog tiếng Việt.
            # Không đẩy Release tiếng Anh trực tiếp ra trang công khai.
            if not re.search(r"[À-ỹđĐ]", row.get("title", "")):
                row["title"] = "Cập nhật Positron " + row["version"]
            if not re.search(r"[À-ỹđĐ]", row.get("description", "")):
                row["description"] = ("Ghi chú tiếng Việt của phiên bản đang được xác minh. "
                                      "Có thể mở liên kết mã nguồn hoặc bản phát hành để đối chiếu.")
    return rows


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


def changelog_titles():
    """Prefer the actual source changelog over a possibly stale Release title."""
    source = (ROOT / "POSITRON_P5_CHANGELOG.md").read_text(encoding="utf-8")
    found = {}
    for m in re.finditer(r"(?m)^## P5\.1\.(\d+)([^\n]*)$", source):
        n = int(m.group(1))
        raw = m.group(2).strip()
        ver = re.search(r"\b(?:v)?(4\.23\.\d+)", raw, re.I)
        name = re.sub(r"^\s*[—–:\-]\s*", "", raw)
        name = re.sub(r"^\s*/?\s*(?:Electron\s*)?v?4\.23\.\d+\s*[—–:\-]*\s*", "", name, flags=re.I)
        name = name.strip(" —–-:/")
        item = {"title": name[:160], "appVersion": ver.group(1) if ver else ""}
        if n not in found or (not found[n]["appVersion"] and item["appVersion"]):
            found[n] = item
    return found


def include_source_versions(rows, descriptions, titles):
    """Show real numbered source versions without inventing a successful Release."""
    seen = {r["number"] for r in rows}
    for n, meta in titles.items():
        if n in seen:
            continue
        title = meta["title"] or "Thay đổi được ghi nhận trong mã nguồn"
        rows.append({"number": n, "version": "P5.1." + str(n),
                     "appVersion": meta["appVersion"] or "Chưa xác minh",
                     "title": title, "description": descriptions.get(n) or title,
                     "kind": feature_type(n, title, descriptions.get(n, "")),
                     "status": "candidate", "published": "", "tag": "", "commit": "",
                     "url": "https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md",
                     "assets": [], "image": None})
    return rows


def summary_name(release):
    value = str(release.get("name") or "").strip()
    value = re.sub(r"^Open IPTV Pro\s+Positron\s*", "", value, flags=re.I)
    value = re.sub(r"^P5\.1\.\d+\s*[-—–:]*\s*", "", value)
    return value[:160] or "Cập nhật Positron"


def feature_type(n: int, title: str, detail: str):
    # Explicit known feature rounds come from the verified Positron changelog.
    if n in FEATURE_NUMBERS or re.search(
        r"(?:feature priority:\s*new\b|\bnew feature\b|feat\(|introduce|add new|thêm chức năng|tính năng mới)",
        title + " " + detail[:450], re.I
    ):
        return "feature"
    return "fix"


def records(releases, descriptions, titles):
    out = []
    for item in releases:
        matched = TAG.match(str(item.get("tag_name") or ""))
        if not matched or item.get("draft"):
            continue
        version, n = matched.groups()
        n = int(n)
        assets = [{"name": a.get("name", ""), "url": a.get("browser_download_url", "")}
                  for a in item.get("assets", []) if a.get("name") and a.get("browser_download_url")]
        title = titles.get(n, {}).get('title') or summary_name(item)
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
    # Commit đang hiển thị phải là commit sửa phiên bản ứng dụng.
    # Không gắn nhầm commit của bot cập nhật website vào tính năng mới.
    sha = ""
    try:
        changes = get_json(API + "/commits?sha=Positron&path=package.json&per_page=1")
        candidate_sha = changes[0]["sha"] if changes else ""
        if re.fullmatch(r"[0-9a-fA-F]{40}", candidate_sha):
            sha = candidate_sha
    except (urllib.error.URLError, KeyError, IndexError, TypeError, ValueError):
        print("THÔNG TIN: Chưa xác minh được commit của phiên bản ứng dụng.")
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
        print("THÔNG TIN: Chưa có gói ảnh Electron thật trong 8 bản phát hành gần nhất")
        return
    print("Đang đọc ảnh chụp Electron thật:", bundle["name"])
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
                if entry.file_size <= 1000 or entry.file_size > 12_000_000:
                    continue
                # For each version, choose the screenshot with the clearest
                # feature-specific marker when multiple QA images are present.
                priority = (50 if "desktop-1920x1080" in name.lower() else 0) + (
                    20 if "after" in name.lower() else 0) + (
                    5 if "trang-chu" in name.lower() else 0) + (
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
            print("Đã đưa vào thư viện", count, "ảnh Electron đúng phiên bản")
    except (urllib.error.URLError, ValueError, zipfile.BadZipFile, TimeoutError, OSError) as err:
        # Never fabricate or reuse another version's image on failure.
        print("CẢNH BÁO: Không tải được gói ảnh Electron thật:", err, file=sys.stderr)




def attach_checked_in_images(rows):
    """Fallback to authentic PNGs already checked into the Positron branch.

    A transient Release ZIP download failure must not blank out *all* images
    in the public catalog. Only an exact version-number match may be used.
    """
    source = ROOT / "docs" / "positron-features" / "screenshots"
    if not source.is_dir():
        return
    matches = {}
    for file in source.glob("*.png"):
        found = IMAGE_RE.search(file.name)
        if not found or not file.is_file():
            continue
        size = file.stat().st_size
        if size <= 1000 or size > 12_000_000:
            continue
        with file.open("rb") as handle:
            if handle.read(8) != b"\x89PNG\r\n\x1a\n":
                continue
        name = file.name.lower()
        score = (20 if "after" in name else 0) + (5 if "real" in name else 0) + (
            1 if "desktop-1920x1080" in name else 0)
        number = int(found.group(1))
        if number not in matches or score > matches[number][0]:
            matches[number] = (score, file)
    folder = OUT / "screenshots"
    folder.mkdir(parents=True, exist_ok=True)
    count = 0
    for row in rows:
        if row.get("image"):
            continue  # A newer verified Release image takes precedence.
        found = matches.get(row["number"])
        if found is None:
            continue
        file = found[1]
        shutil.copyfile(file, folder / file.name)
        row["image"] = "screenshots/" + file.name
        count += 1
    print("Ảnh Electron phục hồi từ repository:", count)



# Positron experiments are no longer GitHub Releases. Actions is authoritative
# for candidate builds and native screenshots. A successful build job can
# provide a valid installer even when a different capture job failed.
BUILD_NAME = re.compile(r"^positron-p51(\d+)-(win-x64|mac-arm64|mac-x64)$", re.I)
RUN_NAME = re.compile(r"\bP5\.1\.(\d+)\b")
BUILD_JOBS = {"win-x64": "windows-latest", "mac-arm64": "macos-15, mac, arm64",
              "mac-x64": "macos-15-intel"}
ART_ROOT = "https://github.com/trisanghy/open-iptv-pro/actions/runs/"


def safe_api(path):
    try:
        return get_json(API + path)
    except (urllib.error.URLError, OSError, ValueError, TimeoutError) as err:
        print("CẢNH BÁO: Actions API:", path, str(err), file=sys.stderr)
        return {}


def workflow_runs(workflow, pages=5):
    result = []
    for page in range(1, pages + 1):
        data = safe_api("/actions/workflows/" + workflow + "/runs?branch=Positron&per_page=100&page=" + str(page))
        items = data.get("workflow_runs", []) if isinstance(data, dict) else []
        result.extend(r for r in items if r.get("head_branch") == "Positron")
        if len(items) < 100:
            break
    return result


def live_artifact(a):
    if not a.get("id") or a.get("expired") is not False or not a.get("expires_at"):
        return False
    try:
        expiry = datetime.fromisoformat(a["expires_at"].replace("Z", "+00:00"))
        return expiry > datetime.now(timezone.utc)
    except (ValueError, TypeError):
        return False


def run_artifacts(run):
    data = safe_api("/actions/runs/" + str(run["id"]) + "/artifacts?per_page=100")
    return [a for a in data.get("artifacts", []) if live_artifact(a)]


def run_jobs(run):
    data = safe_api("/actions/runs/" + str(run["id"]) + "/jobs?per_page=100")
    return data.get("jobs", [])


def ci_result(run):
    # A reusable changelog job is not part of native QA. In its own run, the
    # required jobs already finished although the workflow itself is in progress.
    jobs = [j for j in run_jobs(run) if j.get("name") in ("test", "capture")
            or j.get("name", "").startswith("build (")]
    if any(j.get("conclusion") == "failure" for j in jobs):
        return "completed", "failure"
    if len(jobs) >= 5 and all(j.get("conclusion") == "success" for j in jobs):
        return "completed", "success"
    if jobs and any(j.get("status") != "completed" for j in jobs):
        return "in_progress", None
    return run.get("status"), run.get("conclusion")


def artifact_link(run, artifact):
    return ART_ROOT + str(run["id"]) + "/artifacts/" + str(artifact["id"])


def read_native_zip(artifact, limit=15_000_000):
    # GitHub redirects the authenticated archive request to a signed blob URL.
    # Never forward the workflow token to a different host.
    class SafeRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
            if redirected and not newurl.startswith("https://api.github.com/"):
                redirected.remove_header("Authorization")
            return redirected
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    headers = {"User-Agent": "Positron-Feature-Catalog/2.0",
               "Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    if not live_artifact(artifact) or not 0 < artifact.get("size_in_bytes", 0) <= limit:
        raise ValueError("invalid or oversized native QA artifact")
    url = API + "/actions/artifacts/" + str(artifact["id"]) + "/zip"
    with urllib.request.build_opener(SafeRedirect()).open(urllib.request.Request(url, headers=headers), timeout=60) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("oversized native QA archive")
    return zipfile.ZipFile(io.BytesIO(data))


def extract_native_images(archive, expected=None):
    """Require the same-version passing Electron audit plus before/after PNGs."""
    reports = []
    for item in archive.infolist():
        name = Path(item.filename).name
        if not name.startswith("audit-") or not name.endswith(".json") or item.file_size > 2_000_000:
            continue
        try:
            report = json.loads(archive.read(item))
        except (ValueError, OSError, UnicodeError):
            continue
        if not isinstance(report, dict):
            continue
        match = re.fullmatch(r"P5\.1\.(\d+)", str(report.get("version", "")))
        if not match or report.get("realElectron") is not True or report.get("pass") is not True:
            continue
        number = int(match.group(1))
        if expected is not None and number != expected:
            continue
        reports.append((number, report))
    if len(reports) != 1:
        return None
    number, report = reports[0]
    matches = {}
    for item in archive.infolist():
        name = Path(item.filename).name
        # Restrict to valid basenames; never extract arbitrary archive paths.
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+\.png", name) or not 1000 < item.file_size <= 12_000_000:
            continue
        found = IMAGE_RE.search(name)
        if not found or int(found.group(1)) != number or "-real" not in name:
            continue
        phase = "after" if "-after-" in name else "before" if "-before-" in name else None
        if not phase:
            continue
        data = archive.read(item)
        if not data.startswith(b"\x89PNG\r\n\x1a\n") or len(data) < 24:
            continue
        w, h = int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
        if w < 600 or h < 600:
            continue
        score = 10 if (w, h) == (1920, 1080) else 5 if (w, h) == (720, 900) else 0
        if phase not in matches or score > matches[phase][0]:
            matches[phase] = (score, name, data)
    if set(matches) != {"before", "after"}:
        return None
    return number, report, matches


def attach_actions_evidence(rows):
    """Backfill non-expired build ZIPs and exact-version native screenshots."""
    by_number = {row["number"]: row for row in rows}
    previous_file = ROOT / "docs" / "positron-features" / "catalog.json"
    try:
        previous = {r["number"]: r for r in json.loads(previous_file.read_text(encoding="utf-8"))["versions"]}
    except (OSError, KeyError, ValueError, TypeError):
        previous = {}
    # Preserve previously verified evidence beyond the bounded discovery window.
    for n, row in by_number.items():
        old = previous.get(n, {})
        if old.get("imageSource") == "actions" and row.get("image") == old.get("image"):
            for key in ("imageBefore", "imageSource", "imageRun", "imageCommit", "imageArtifact"):
                if old.get(key):
                    row[key] = old[key]
            if row.get("imageBefore"):
                f = ROOT / "docs" / "positron-features" / Path(row["imageBefore"]).name
                f = f.parent / "screenshots" / f.name
                if f.is_file():
                    shutil.copyfile(f, OUT / "screenshots" / f.name)
                else:
                    row.pop("imageBefore", None)
        row["builds"] = [a for a in old.get("builds", []) if live_artifact({
            "id": a.get("id"), "expired": False, "expires_at": a.get("expiresAt")})]
        if old.get("ci"):
            row["ci"] = old["ci"]
    full = workflow_runs("positron-lab.yml")
    fast = workflow_runs("positron-fast-round.yml", pages=4)
    full_by_version, sha_versions = {}, {}
    for r in full:
        match = RUN_NAME.search(r.get("name", ""))
        if not match:
            continue
        n = int(match.group(1))
        if n not in by_number:
            continue
        sha_versions.setdefault(r.get("head_sha"), n)
        full_by_version.setdefault(n, []).append(r)
    # Most recent attempts first, plus an older successful attempt if needed.
    selected = []
    for n, runs in full_by_version.items():
        row = by_number[n]
        latest = runs[0]
        ci_status, ci_conclusion = (ci_result(latest) if latest["id"] == int(os.environ.get("GITHUB_RUN_ID", "0")) else (latest.get("status"), latest.get("conclusion")))
        row["ci"] = {"url": ART_ROOT + str(latest["id"]),
                     "status": ci_status, "conclusion": ci_conclusion,
                     "commit": latest.get("head_sha", "")}
        if not row.get("commit"):
            row["commit"] = latest.get("head_sha", "")
        if len(row["builds"]) == 3 and all(a.get("commit") == latest.get("head_sha") for a in row["builds"]):
            continue
        eligible = [r for r in runs if r.get("status") == "completed" or r["id"] == int(os.environ.get("GITHUB_RUN_ID", "0"))]
        choices = eligible[:3]
        success = next((r for r in eligible if r.get("conclusion") == "success"), None)
        if success and success not in choices:
            choices.append(success)
        selected.extend((n, r) for r in choices)
    def builds_for(pair):
        n, run = pair
        artifacts = [a for a in run_artifacts(run) if BUILD_NAME.fullmatch(a.get("name", ""))]
        if not artifacts:
            return n, []
        jobs = run_jobs(run) if run.get("conclusion") != "success" else []
        out = []
        for a in artifacts:
            m = BUILD_NAME.fullmatch(a["name"])
            if int(m.group(1)) != n:
                continue
            platform = m.group(2)
            if run.get("conclusion") != "success" and not any(
                job.get("conclusion") == "success" and job.get("name", "").startswith("build (")
                and BUILD_JOBS[platform] in job.get("name", "") for job in jobs):
                continue
            out.append({"id": a["id"], "name": a["name"], "platform": platform,
                        "url": artifact_link(run, a), "runUrl": ART_ROOT + str(run["id"]),
                        "expiresAt": a["expires_at"], "createdAt": a.get("created_at", ""),
                        "commit": run.get("head_sha", "")})
        return n, out
    with ThreadPoolExecutor(max_workers=8) as pool:
        for n, assets in pool.map(builds_for, selected):
            row = by_number[n]
            existing = {a["platform"]: a for a in row["builds"]}
            for a in assets:
                if a["platform"] not in existing or a["createdAt"] > existing[a["platform"]].get("createdAt", ""):
                    existing[a["platform"]] = a
            row["builds"] = sorted(existing.values(), key=lambda a: a["platform"])
    # Fast QA archives are small and contain the current binary's own audit,
    # rather than historical screenshots generated using a later executable.
    candidates, seen = [], set()
    for run in fast:
        own = run["id"] == int(os.environ.get("GITHUB_RUN_ID", "0"))
        if run.get("conclusion") != "success" and not (own and any(
            j.get("name") == "fast-electron-round" and j.get("conclusion") == "success" for j in run_jobs(run))):
            continue
        expected = sha_versions.get(run.get("head_sha"))
        if expected is not None:
            row = by_number.get(expected)
            if not row or expected in seen:
                continue
            if row.get("imageSource") == "actions" and row.get("image") and row.get("imageBefore"):
                # Refresh if a newer source commit has passed the fast QA.
                if row.get("imageCommit") == run.get("head_sha") or row.get("imageRun") == ART_ROOT + str(run["id"]):
                    seen.add(expected)
                    continue
            seen.add(expected)
        candidates.append((expected, run))
        if len(candidates) >= 60:
            break
    def images_for(pair):
        expected, run = pair
        try:
            a = next((a for a in run_artifacts(run) if a.get("name") == "positron-fast-round"), None)
            if not a:
                return None
            with read_native_zip(a) as archive:
                result = extract_native_images(archive, expected)
            return (run, a, result) if result else None
        except (urllib.error.URLError, OSError, ValueError, zipfile.BadZipFile, TimeoutError) as err:
            print("CẢNH BÁO: Không đọc được ảnh Actions", run["id"], str(err), file=sys.stderr)
            return None
    folder = OUT / "screenshots"
    folder.mkdir(parents=True, exist_ok=True)
    recovered = set()
    with ThreadPoolExecutor(max_workers=6) as pool:
        for result in pool.map(images_for, candidates):
            if not result:
                continue
            run, artifact, (n, report, matches) = result
            row = by_number.get(n)
            if not row or n in recovered:
                continue
            app = report.get("app") or report.get("appVersion")
            if app and row["appVersion"] not in ("", "Chưa xác minh", app):
                continue
            if app and row["appVersion"] in ("", "Chưa xác minh"):
                row["appVersion"] = app
            for phase, (_, name, data) in matches.items():
                (folder / name).write_bytes(data)
                row["image" if phase == "after" else "imageBefore"] = "screenshots/" + name
            row.update(imageSource="actions", imageRun=ART_ROOT + str(run["id"]),
                       imageCommit=run.get("head_sha", ""), imageArtifact=artifact_link(run, artifact))
            recovered.add(n)
    print("Actions: ảnh Electron mới", len(recovered), "; phiên bản có bộ cài", sum(bool(r["builds"]) for r in rows))


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
        "Trang này được tạo tự động từ GitHub Actions Artifacts và Releases lịch sử. "
        "Bấm vào từng phiên bản để đọc mô tả, mở ảnh và tải EXE.",
        "",
        "[Mở WEBSITE changelog tương tác](https://raw.githack.com/trisanghy/open-iptv-pro/Positron/docs/positron-features/index.html) · "
        "[Giao diện HTML trong repository](index.html) · "
        "[Các bản phát hành](https://github.com/trisanghy/open-iptv-pro/releases) · "
        "[Nhật ký Git tiếng Việt](LOG_GIT_TIENG_VIET.md) · "
        "[Quy tắc ưu tiên tính năng](../../POSITRON_FEATURE_RULES.md)",
        "",
    ]
    for row in rows:
        title = html.escape(str(row["title"]).replace("\n", " "), quote=False)
        version = html.escape(row["version"])
        status = "CHƯA CÓ BẢN PHÁT HÀNH" if row["status"] == "candidate" else "ĐÃ PHÁT HÀNH"
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
        if row.get("imageBefore"):
            links.append("[Ảnh trước sửa](./" + row["imageBefore"] + ")")
        if row.get("imageRun"):
            links.append("[QA Electron thật](" + row["imageRun"] + ")")
        if row.get("ci", {}).get("url"):
            links.append("[CI tổng hợp](" + row["ci"]["url"] + ")")
        labels = {"win-x64": "Windows x64 (Setup + Portable ZIP)", "mac-arm64": "Mac Apple Silicon (ZIP)", "mac-x64": "Mac Intel (ZIP)"}
        for build in row.get("builds", []):
            links.append("[Tải " + labels[build["platform"]] + "](" + build["url"] + ")")
        if row.get("url"):
            links.append("[Bản phát hành / thông tin](" + row["url"] + ")")
        if re.fullmatch(r"[0-9a-fA-F]{40}", str(row.get("commit") or "")):
            links.append("[Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/" +
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
        "Ảnh lấy từ QA Electron thật của Actions hoặc Release lịch sử; bộ cài thử nghiệm là artifact ZIP. "
        "Mỗi lần nhánh Positron được cập nhật, GitHub Actions tạo lại "
        "trang Markdown và đồng bộ ảnh mà không force-push hay sửa nhánh web/online.",
        "",
    ])
    (docs / "FEATURES.md").write_text("\n".join(lines), encoding="utf-8")
    print("Đã tạo nhật ký GitHub tiếng Việt với", len(rows), "phiên bản có thể mở rộng")
    # Lịch sử Git bất biến: đây là nhật ký diễn giải tiếng Việt, không viết
    # lại commit cũ hoặc dùng force-push.
    git_log = [
        "# Nhật ký thay đổi Git — Positron (tiếng Việt)", "",
        "Bản diễn giải theo phiên bản từ mã nguồn và GitHub Releases. "
        "SHA và liên kết commit nguyên gốc được giữ để đối chiếu.", "",
    ]
    for row in rows:
        git_log.append("## " + row["version"] + " — " + row["title"])
        git_log.append("")
        git_log.append("**Ứng dụng:** " + row["appVersion"] + " · **Trạng thái:** " +
                       ("Đã phát hành" if row["status"] == "release"
                        else "Chưa có bản phát hành"))
        git_log.append("")
        git_log.append(row["description"])
        git_log.append("")
        if re.fullmatch(r"[0-9a-fA-F]{40}", str(row.get("commit") or "")):
            git_log.append("[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/" +
                           row["commit"] + ")")
        if row.get("url"):
            git_log.append("[Bản phát hành hoặc mã nguồn](" + row["url"] + ")")
        git_log.append("")
    (docs / "LOG_GIT_TIENG_VIET.md").write_text(
        "\n".join(git_log) + "\n", encoding="utf-8")
    print("Đã tạo nhật ký thay đổi Git bằng tiếng Việt")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / "docs" / "positron-features" / "index.html", OUT / "index.html")
    descriptions = sections()
    titles = changelog_titles()
    rows = add_candidate(records(fetch_releases(), descriptions, titles), descriptions)
    rows = include_source_versions(rows, descriptions, titles)
    viet_hoa_rows(rows)
    attach_real_images(rows)
    attach_checked_in_images(rows)
    attach_actions_evidence(rows)
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
        '<title>Nhật ký tính năng Positron</title>'
        '<a href="./positron-features/">Xem nhật ký Positron</a></html>\n',
        encoding="utf-8")
    print("Đã tạo", len(rows), "dòng phiên bản tại site/positron-features/")


if __name__ == "__main__":
    main()
