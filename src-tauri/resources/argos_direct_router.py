#!/usr/bin/env python3
"""Offline Argos exact-pair routing. Direct source->target first; pivot only when needed.

CLI accepts "route|probe|install|translate SOURCE TARGET". Legacy "translate TARGET"
and "install TARGET" keep English as source for previous Electron/Argos callers.
No automatic network call on route/probe/translate; only explicit install downloads.
"""
import json
import os
import sys
from pathlib import Path

LANGS={"vi","en","fr","es","de","zh","ja","ko","pt","it","ru","id","ar","hi","th"}
MAGIC="OIPTV_ROUTE:"

def codes(args):
    if len(args)==2:
        source,target="en",args[1]
    elif len(args)==3:
        source,target=args[1],args[2]
    else:
        raise ValueError("Usage: action [SOURCE] TARGET")
    if source not in LANGS or target not in LANGS:
        raise ValueError("Unsupported source or target language")
    return source,target

def installed_pairs(package):
    return {(p.from_code,p.to_code) for p in package.get_installed_packages()
            if getattr(p,"type","translate")=="translate"}

def plan(pairs,source,target):
    if source==target:
        return "same"
    if (source,target) in pairs:
        return "direct"
    if source!="en" and target!="en" and (source,"en") in pairs and ("en",target) in pairs:
        return "pivot"
    if target=="en" or ("en",target) in pairs:
        return "whisper"
    return "needs-model"

def package_version(item):
    return tuple(int(v) if v.isdigit() else 0 for v in str(getattr(item,"package_version","0")).split("."))

def install_pair(package,from_lang,to_lang):
    if (from_lang,to_lang) in installed_pairs(package):
        return True
    package.update_package_index()
    available=[p for p in package.get_available_packages()
               if p.from_code==from_lang and p.to_code==to_lang
               and getattr(p,"type","translate")=="translate"]
    if not available:
        return False
    selected=sorted(available,key=package_version)[-1]
    download=selected.download()
    try:
        package.install_from_path(download)
    finally:
        try: Path(download).unlink(missing_ok=True)
        except OSError: pass
    return (from_lang,to_lang) in installed_pairs(package)

def main():
    if len(sys.argv)<3 or sys.argv[1] not in ("route","probe","install","translate"):
        raise ValueError("Usage: route|probe|install|translate [SOURCE] TARGET")
    action=sys.argv[1]
    source,target=codes(sys.argv[1:])
    if source==target:
        if action=="translate":
            sys.stdout.write(sys.stdin.read(2400).strip())
        else:
            print(MAGIC+json.dumps({"source":source,"target":target,"route":"same","ready":True}))
        return
    from argostranslate import package, translate
    pairs=installed_pairs(package)
    if action=="install":
        # Fetch a DIRECT pair when the official package index has one.
        # Most non-English pairs do not currently have standalone Argos models.
        if (source,target) not in pairs:
            if not install_pair(package,source,target) and target!="en":
                # Whisper can produce English directly when no direct model exists.
                if not install_pair(package,"en",target):
                    raise RuntimeError(f"No offline model available for en -> {target}")
        pairs=installed_pairs(package)
    route=plan(pairs,source,target)
    if action in ("route","probe","install"):
        print(MAGIC+json.dumps({"source":source,"target":target,"route":route,
                                "ready":route not in ("needs-model",)}))
        return
    original=sys.stdin.read(2400).strip()
    if not original:
        raise ValueError("No source text to translate")
    if route not in ("direct","pivot"):
        raise RuntimeError("No installed direct or pivot Argos route; use Whisper English fallback")
    languages={l.code:l for l in translate.get_installed_languages()}
    if source not in languages or target not in languages:
        raise RuntimeError("Source or target language model is not available locally")
    result=languages[source].get_translation(languages[target]).translate(original)
    if not isinstance(result,str) or not result.strip():
        raise RuntimeError("Argos returned empty translation")
    sys.stdout.write(result.strip())

if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("Argos route: "+str(exc).replace("\n"," ")[:400],file=sys.stderr)
        sys.exit(1)
