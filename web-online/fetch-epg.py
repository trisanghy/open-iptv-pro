#!/usr/bin/env python3
"""Fetch public Vietnam XMLTV safely during a GitHub Actions build.

The browser reads epg/vn.xml from the same GitHub Pages origin, avoiding CORS
and gzip incompatibility. Does not proxy arbitrary user-provided URLs.
"""
from __future__ import annotations
import gzip
import io
import json
import pathlib
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

MAX_COMPRESSED = 12 * 1024 * 1024
MAX_XML = 35 * 1024 * 1024
FEEDS = (
    ("EPGShare01", "https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz"),
    ("xmltv.live", "https://xmltv.live/epg/vn.xml.gz"),
    ("Lịch Phát Sóng", "https://lichphatsong.io.vn/epg.xml"),
)

def download(url: str) -> tuple[bytes, int, int]:
    req = urllib.request.Request(url, headers={
        "User-Agent": "OpenIPTVPro-Web-EPG/1.0 (+https://github.com/trisanghy/open-iptv-pro)",
        "Accept": "application/gzip, application/xml, text/xml, */*",
    })
    with urllib.request.urlopen(req, timeout=40) as response:
        if response.status != 200:
            raise ValueError(f"HTTP {response.status}")
        data = response.read(MAX_COMPRESSED + 1)
        if len(data) > MAX_COMPRESSED:
            raise ValueError("XMLTV compressed source exceeds 12 MiB")
        if response.read(1):
            raise ValueError("XMLTV source is too large")
    if data[:2] == b"\x1f\x8b":
        with gzip.GzipFile(fileobj=io.BytesIO(data)) as gz:
            data = gz.read(MAX_XML + 1)
    if len(data) > MAX_XML:
        raise ValueError("XMLTV expanded source exceeds 35 MiB")
    if not data.strip().startswith((b"<?xml", b"<tv")):
        raise ValueError("Source is not an XMLTV document")
    root = ET.fromstring(data)
    if root.tag != "tv":
        raise ValueError("XMLTV root element must be tv")
    n_channels = len(root.findall("channel"))
    n_programmes = len(root.findall("programme"))
    if n_channels < 1 or n_programmes < 1:
        raise ValueError("XMLTV contains no channel/programme entries")
    # A structurally valid historical schedule cannot populate the live player.
    clock = datetime.now(timezone.utc)
    for p in root.iter("programme"):
        value = (p.get("stop") or "").strip()
        try:
            parts = value.split()
            stop = datetime.strptime(parts[0] + (parts[1] if len(parts) > 1 else "+0000"), "%Y%m%d%H%M%S%z")
        except (IndexError, ValueError):
            continue
        if stop > clock:
            break
    else:
        raise ValueError("XMLTV has no remaining programme")
    return data, n_channels, n_programmes

def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: fetch-epg.py <output-path>", file=sys.stderr)
        return 2
    output = pathlib.Path(sys.argv[1])
    output.parent.mkdir(parents=True, exist_ok=True)
    for name, url in FEEDS:
        try:
            xml, channels, programmes = download(url)
            temp = output.with_suffix(".xml.tmp")
            temp.write_bytes(xml)
            temp.replace(output)
            metadata = {
                "source": name,
                "url": url,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "channel_count": channels,
                "programme_count": programmes,
            }
            output.with_name("status.json").write_text(
                json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"OK: {name} {channels} channels, {programmes} programmes, {len(xml)} bytes")
            return 0
        except Exception as exc:
            print(f"EPG source {name} failed: {exc}", file=sys.stderr)
    print("All Vietnam EPG sources failed; retain previously published guide, if any.", file=sys.stderr)
    return 1

if __name__ == "__main__":
    sys.exit(main())
