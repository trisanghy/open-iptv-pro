#!/usr/bin/env python3
"""Open IPTV Pro 4.23.50: recover bad Argos models, direct route first, English pivot last.
No speech or text is uploaded. Install requires internet once, translate stays offline.
"""
import sys
import os
from pathlib import Path

# Argos Translate 1.11.0 recognizes NONE but rejects it when constructing
# PackageTranslation (NotImplementedError); MINISBD is supported and offline.
# Force a local model provider even if the parent shell has stale settings.
os.environ["ARGOS_CHUNK_TYPE"] = "MINISBD"
os.environ["ARGOS_MODEL_PROVIDER"] = "OPENNMT"
os.environ["ARGOS_DEVICE_TYPE"] = "cpu"


ALLOWED = {"en","vi","fr","es","de","zh","ja","ko","pt","it","ru","id","ar","hi","th"}
SMOKE = "Hello! How are you today?"

def packages():
    from argostranslate import package
    return package.get_installed_packages()

def direct_packages(src, dst):
    return [p for p in packages() if p.from_code == src and p.to_code == dst and
            getattr(p, "type", "translate") in ("translate", None, "")]

def actual_translation(src, dst):
    from argostranslate import translate
    installed = translate.get_installed_languages()
    source = next((p for p in installed if p.code == src), None)
    target = next((p for p in installed if p.code == dst), None)
    if source is None or target is None:
        raise RuntimeError("Argos không tìm thấy ngôn ngữ đã cài: " + src + " → " + dst)
    result = source.get_translation(target)
    if result is None:
        raise RuntimeError("Argos chưa thể khởi tạo mô hình " + src + " → " + dst)
    return result

def route(src, dst):
    if src == dst:
        return lambda text: text, "same"
    if direct_packages(src, dst):
        return actual_translation(src, dst).translate, "direct"
    if src in ("en",) or dst in ("en",):
        raise RuntimeError("Chưa cài mô hình trực tiếp " + src + " → " + dst)
    if not (direct_packages(src, "en") and direct_packages("en", dst)):
        raise RuntimeError("Chưa cài cặp trực tiếp " + src + " → " + dst +
                           " và không có đường dự phòng qua English")
    first, second = actual_translation(src, "en"), actual_translation("en", dst)
    return lambda text: second.translate(first.translate(text)), "via-en"

def smoke(src, dst):
    fn, kind = route(src, dst)
    output = fn(SMOKE)
    if not isinstance(output, str) or not output.strip():
        raise RuntimeError("Mô hình dịch thử trả về văn bản rỗng")
    return kind

def fetch_direct(src, dst, repair=False):
    from argostranslate import package
    existing = direct_packages(src, dst)
    if existing and not repair:
        return True
    if repair:
        for installed in existing:
            package.uninstall(installed)
    package.update_package_index()
    available = [item for item in package.get_available_packages()
                 if item.from_code == src and item.to_code == dst and
                 getattr(item, "type", "translate") in ("translate", None, "")]
    if not available:
        return False
    chosen = sorted(available, key=lambda item: str(getattr(item,"package_version","0")))[-1]
    downloaded = chosen.download()
    try:
        package.install_from_path(downloaded)
    finally:
        try:
            Path(downloaded).unlink(missing_ok=True)
        except OSError:
            pass
    return bool(direct_packages(src, dst))

def install(src, dst):
    if src == dst:
        return "same"
    # Probe a real translation first; metadata/old marker alone never proves readiness.
    try:
        return smoke(src, dst)
    except Exception:
        pass
    # If a direct model is corrupt, uninstall and redownload instead of keeping bad state.
    if direct_packages(src, dst):
        if not fetch_direct(src, dst, repair=True):
            raise RuntimeError("Không thể sửa mô hình lỗi " + src + " → " + dst)
        return smoke(src, dst)
    if fetch_direct(src, dst):
        return smoke(src, dst)
    # Direct model unavailable: only now use an explicit English pivot.
    if "en" in (src, dst):
        raise RuntimeError("Kho Argos không cung cấp mô hình " + src + " → " + dst)
    for a, b in ((src, "en"), ("en", dst)):
        try:
            smoke(a, b)
        except Exception:
            if not fetch_direct(a, b, repair=bool(direct_packages(a, b))):
                raise RuntimeError("Không tải được mô hình dự phòng " + a + " → " + b)
            smoke(a, b)
    return smoke(src, dst)

def main():
    args = sys.argv[1:]
    if len(args) == 2:
        command, dst = args
        src = "en"
    elif len(args) == 3:
        command, src, dst = args
    else:
        raise ValueError("Cách dùng: argos-bridge.py install|probe|translate [nguồn] đích")
    if command not in {"install", "install-direct", "probe", "translate"} or src not in ALLOWED or dst not in ALLOWED:
        raise ValueError("Ngôn ngữ hoặc thao tác dịch không hợp lệ")
    if src == dst:
        if command == "translate":
            sys.stdout.write(sys.stdin.read(2400).strip())
        else:
            print("OK same")
        return
    if command == "install":
        print("OK " + install(src, dst))
        return
    if command == "install-direct":
        # Direct-only probe and repair. NEVER attempt src -> English here.
        # Caller can use Whisper's already proven English transcription as fallback.
        if direct_packages(src, dst):
            try:
                smoke(src, dst)
            except Exception:
                if not fetch_direct(src, dst, repair=True):
                    raise RuntimeError("Không sửa được mô hình trực tiếp " + src + " → " + dst)
                smoke(src, dst)
            print("OK direct", flush=True)
            return
        if not fetch_direct(src, dst):
            print("NO_DIRECT", flush=True)
            return
        smoke(src, dst)
        print("OK direct", flush=True)
        return
    if command == "probe":
        print("OK " + smoke(src, dst))
        return
    text = sys.stdin.read(2400).strip()
    if not text:
        raise ValueError("Chưa có câu để dịch")
    fn, _ = route(src, dst)
    result = fn(text)
    if not isinstance(result, str) or not result.strip():
        raise RuntimeError("Mô hình trả về bản dịch rỗng")
    sys.stdout.write(result.strip())

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write("Argos: " + str(exc).replace("\n", " ")[:460] + "\n")
        raise SystemExit(1)
