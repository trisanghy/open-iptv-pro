#!/usr/bin/env python3
"""Build a Samsung Tizen TV native web-app archive for subsequent owner-side signing.

This is deliberately NOT an installable signed package. Samsung TV distributor
certificates are tied to the target TV DUID and must stay with the owner.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile
from native_variant import adapt_native

ROOT = Path(__file__).resolve().parents[1]
ROOT_NS = "http://www.w3.org/ns/widgets"

def build(output: Path) -> Path:
    info = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    version = info["version"]
    tv = (ROOT / "tizenbrew/index.html").read_text(encoding="utf-8")
    phone = (ROOT / "tizenbrew/phone.html").read_text(encoding="utf-8")
    xml = (ROOT / "tizen-native/config.xml").read_text(encoding="utf-8")
    sdk = ROOT / "supabase-sdk.js"
    hls = ROOT / "hls.min.js"
    dash = ROOT / "dash.all.min.js"
    mpegts = ROOT / "mpegts.min.js"
    icon = ROOT / "assets/icon.png"

    assert info.get("tizenbrewEdition") == version
    assert info.get("appPath") == "tizenbrew/bootstrap.html", "Do not change working OTA module"
    assert f"TizenBrew v{version}" in tv
    assert 'webapis.avplay' in tv
    assert 'src="$WEBAPIS/webapis/webapis.js"' in tv
    assert sdk.is_file() and hls.is_file() and dash.is_file() and mpegts.is_file() and icon.is_file()
    assert '<script>\n(function(){' in tv

    tv = adapt_native(tv, version)

    # The native WGT has its own file:// application context, which is what
    # exposes Samsung's AVPlay Product API. Keep an offline local HLS fallback.
    tv = tv.replace(
        '<script>\n(function(){',
        '<script src="supabase-sdk.js"></script>\n<script>\n(function(){',
        1,
    )
    phone = phone.replace(
        '<script>\n(function(){',
        '<script src="supabase-sdk.js"></script>\n<script>\n(function(){',
        1,
    )
    # JS loader already tries these bundled files before the online fallback.
    assert "var urls=['hls.min.js'" in tv and "var urls=['dash.all.min.js'" in tv and "var urls=['mpegts.min.js'" in tv
    root = ET.fromstring(xml)
    assert root.tag == f"{{{ROOT_NS}}}widget"
    root.set("version", version)
    # Preserve the Tizen namespace with a predictable prefix.
    ET.register_namespace("", ROOT_NS)
    ET.register_namespace("tizen", "http://tizen.org/ns/widgets")
    xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        archive.writestr("index.html", tv)
        archive.writestr("phone.html", phone)
        archive.writestr("config.xml", xml)
        archive.write(sdk, "supabase-sdk.js")
        archive.write(hls, "hls.min.js")
        archive.write(dash, "dash.all.min.js")
        archive.write(mpegts, "mpegts.min.js")
        archive.write(icon, "icon.png")
        archive.write(ROOT / "tizenbrew/licenses/mpegts-Apache-2.0.txt", "licenses/mpegts-Apache-2.0.txt")
        archive.write(ROOT / "tizen-native/README.md", "README.md")
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        names = set(archive.namelist())
        required = {"index.html", "phone.html", "config.xml", "supabase-sdk.js", "hls.min.js", "dash.all.min.js", "mpegts.min.js", "icon.png"}
        assert required.issubset(names), names
        content = archive.read("index.html").decode("utf-8")
        assert "Native WGT v" + version in content and "registerNativeRemote()" in content
        assert "webapis.avplay" in content and "hls.min.js" in content and "dash.all.min.js" in content and "mpegts.min.js" in content
        m = ET.fromstring(archive.read("config.xml"))
        assert m.attrib.get("version") == version
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="dist-tizen-native/Open-IPTV-Pro-TV-Native-UNSIGNED.wgt")
    args = parser.parse_args()
    target = build(ROOT / args.output)
    print(f"Built UNSIGNED Tizen TV native app: {target}")
    print("Sign with Samsung TV certificate for your TV's DUID before installation.")
