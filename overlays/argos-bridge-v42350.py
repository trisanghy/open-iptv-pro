#!/usr/bin/env python3
"""Offline Argos: exact same-language bypass; direct pair first; English pivot only if no direct."""
import sys
from pathlib import Path

def pairs():
    from argostranslate import package
    return package.get_installed_packages()

def has_direct(src, dst):
    return any(p.from_code == src and p.to_code == dst and
               getattr(p,"type","translate")=="translate" for p in pairs())

def route(src, dst):
    from argostranslate import translate
    languages = translate.get_installed_languages()
    source = next((i for i in languages if i.code == src),None)
    target = next((i for i in languages if i.code == dst),None)
    if source is None or target is None:
        raise RuntimeError("Argos chưa nạp gói "+src+" → "+dst)
    return source.get_translation(target)

def load_route(src,dst):
    if src==dst: return lambda text:text
    # Do not silently use an Argos auto-pivot when a direct model exists.
    if has_direct(src,dst):
        r=route(src,dst)
        if r is None: raise RuntimeError("Không mở được mô hình trực tiếp "+src+" → "+dst)
        return r.translate
    if src=="en" or dst=="en":
        raise RuntimeError("Chưa cài mô hình "+src+" → "+dst)
    if not (has_direct(src,"en") and has_direct("en",dst)):
        raise RuntimeError("Không có mô hình trực tiếp hoặc đường dự phòng qua English cho "+src+" → "+dst)
    first,second=route(src,"en"),route("en",dst)
    if first is None or second is None:raise RuntimeError("Không nạp được gói dịch qua English")
    return lambda text:second.translate(first.translate(text))

def ensure_direct(src,dst):
    from argostranslate import package
    if has_direct(src,dst):return True
    package.update_package_index()
    available=[p for p in package.get_available_packages()
               if p.from_code==src and p.to_code==dst and
               getattr(p,"type","translate")=="translate"]
    if not available:return False
    chosen=sorted(available,key=lambda p:str(getattr(p,"package_version","0")))[-1]
    archive=chosen.download()
    try:package.install_from_path(archive)
    finally:
        try:Path(archive).unlink(missing_ok=True)
        except OSError:pass
    return has_direct(src,dst)

def install(src,dst):
    if src==dst:return "same"
    if ensure_direct(src,dst):return "direct"
    if src=="en" or dst=="en":
        raise RuntimeError("Kho Argos không có mô hình "+src+" → "+dst)
    if not ensure_direct(src,"en"):raise RuntimeError("Kho Argos thiếu mô hình "+src+" → en")
    if not ensure_direct("en",dst):raise RuntimeError("Kho Argos thiếu mô hình en → "+dst)
    return "via-en"

def main():
    args=sys.argv[1:]
    if len(args)==2:
        # Backwards compatible with older en -> language requests.
        action,dst=args
        src="en"
    elif len(args)==3:
        action,src,dst=args
    else:raise ValueError("Usage: argos-bridge.py install|probe|translate SOURCE TARGET")
    if action not in ("install","probe","translate"):raise ValueError("Unsupported operation")
    allowed={"en","vi","fr","es","de","zh","ja","ko","pt","it","ru","id","ar","hi","th"}
    if src not in allowed or dst not in allowed:raise ValueError("Unsupported language pair")
    if src==dst:
        if action=="translate":sys.stdout.write(sys.stdin.read(2400).strip())
        else:print("OK same")
        return
    if action=="install":install(src,dst)
    fn=load_route(src,dst)
    if action in ("install","probe"):
        output=fn("Hello! How are you?" if src=="en" else "Hello!")
        if not isinstance(output,str) or not output.strip():raise RuntimeError("Mô hình dịch thử trả về chuỗi rỗng")
        print("OK "+("direct" if has_direct(src,dst) else "via-en"))
        return
    sentence=sys.stdin.read(2400).strip()
    if not sentence:raise ValueError("Không có câu đầu vào")
    output=fn(sentence)
    if not isinstance(output,str) or not output.strip():raise RuntimeError("Bản dịch rỗng")
    sys.stdout.write(output.strip())

if __name__=="__main__":
    try:main()
    except Exception as err:
        sys.stderr.write("Argos: "+str(err).replace("\n"," ")[:450]+"\n")
        raise SystemExit(1)
