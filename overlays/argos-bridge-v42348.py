#!/usr/bin/env python3
"""Small Argos runtime bridge for Open IPTV Pro. Python environment is app-private.
Calls real installed Argos package models; no success marker or fake translation."""
import sys

def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ("check", "install", "translate"):
        raise ValueError("Usage: argos-bridge.py {check|install|translate} target")
    action, target = sys.argv[1], sys.argv[2]
    if not target.isascii() or not target.isalpha() or len(target) > 3:
        raise ValueError("Invalid translation language")
    from argostranslate import package, translate

    def is_installed():
        return any(p.from_code == "en" and p.to_code == target
                   and getattr(p, "type", "translate") == "translate"
                   for p in package.get_installed_packages())

    if action == "install" and not is_installed():
        package.update_package_index()
        matches = [p for p in package.get_available_packages()
                   if p.from_code == "en" and p.to_code == target
                   and getattr(p, "type", "translate") == "translate"]
        if not matches:
            raise RuntimeError("Không có mô hình Argos English → " + target + " trong kho hiện tại")
        selected = matches[0]
        archive = selected.download()
        try:
            package.install_from_path(archive)
        finally:
            try:
                archive.unlink(missing_ok=True)
            except Exception:
                pass

    if not is_installed():
        raise RuntimeError("Chưa có mô hình dịch English → " + target
                           + ". Hãy bấm Cài mô hình tự động để sửa.")

    installed_languages = translate.get_installed_languages()
    source = next((l for l in installed_languages if l.code == "en"), None)
    destination = next((l for l in installed_languages if l.code == target), None)
    if source is None or destination is None:
        raise RuntimeError("Argos chưa nạp được cặp ngôn ngữ English → " + target)
    route = source.get_translation(destination)
    if route is None:
        raise RuntimeError("Argos chưa khởi tạo được bộ dịch English → " + target)

    if action == "translate":
        text = sys.stdin.read(2400).strip()
        if not text:
            raise ValueError("Không có văn bản để dịch")
        result = route.translate(text)
        if not isinstance(result, str) or not result.strip():
            raise RuntimeError("Mô hình Argos trả về bản dịch rỗng")
        sys.stdout.write(result.strip())
    else:
        sys.stdout.write("OK " + target)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write(str(exc) + "\n")
        sys.exit(1)
