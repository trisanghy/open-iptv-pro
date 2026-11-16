#!/usr/bin/env python3
"""Verified, private offline Argos translator for Open IPTV Pro v4.23.49."""
import os
import sys
from pathlib import Path

SMOKE = "Hello, how are you today?"

def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ("probe", "install", "translate"):
        raise ValueError("Usage: argos-bridge.py probe|install|translate language-code")
    action, target = sys.argv[1:]
    if target not in ("vi","fr","es","de","zh","ja","ko","pt","it","ru","id","ar","hi","th"):
        raise ValueError("Unsupported translation target")
    from argostranslate import package, translate
    def candidates():
        return [p for p in package.get_installed_packages()
                if p.from_code == "en" and p.to_code == target
                and getattr(p, "type", "translate") == "translate"]
    def check(real_smoke=True):
        langs = translate.get_installed_languages()
        source = next((l for l in langs if l.code == "en"), None)
        destination = next((l for l in langs if l.code == target), None)
        if not candidates() or source is None or destination is None:
            raise RuntimeError("Chưa có mô hình Argos English → " + target)
        route = source.get_translation(destination)
        if route is None:
            raise RuntimeError("Argos không mở được cặp ngôn ngữ English → " + target)
        if real_smoke:
            result = route.translate(SMOKE)
            if not isinstance(result, str) or not result.strip():
                raise RuntimeError("Argos dịch thử không có kết quả")
        return route
    if action == "install":
        try:
            check()
        except Exception:
            # Repair only en->target packages from the app-private ARGOS_PACKAGES_DIR.
            for installed in candidates():
                package.uninstall(installed)
            package.update_package_index()
            available = [p for p in package.get_available_packages()
                         if p.from_code == "en" and p.to_code == target
                         and getattr(p, "type", "translate") == "translate"]
            if not available:
                raise RuntimeError("Không tìm thấy mô hình English → " + target + " trên kho Argos")
            # Prefer highest declared version without inventing remote links.
            selected = sorted(available, key=lambda p: str(getattr(p,"package_version","0")))[-1]
            download_path = selected.download()
            try:
                package.install_from_path(download_path)
            finally:
                try:
                    Path(download_path).unlink(missing_ok=True)
                except OSError:
                    pass
        check()
        print("OK " + target, flush=True)
    elif action == "probe":
        check()
        print("OK " + target, flush=True)
    else:
        route = check(real_smoke=False)
        original = sys.stdin.read(2400).strip()
        if not original:
            raise ValueError("Không có văn bản để dịch")
        result = route.translate(original)
        if not isinstance(result, str) or not result.strip():
            raise RuntimeError("Argos trả về bản dịch rỗng")
        sys.stdout.write(result.strip())

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stderr.write("Argos: " + str(error).replace("\n", " ")[:450] + "\n")
        raise SystemExit(1)
