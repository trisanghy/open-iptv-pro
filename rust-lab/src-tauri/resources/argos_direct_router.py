#!/usr/bin/env python3
"""Argos translation router for Rust Lab v23.8.

No network unless action=install. A model is not ready merely because metadata
lists an installed package; a real tiny translation smoke-test must succeed.
"""
import json
import os
import sys
from pathlib import Path

# In Argos Translate 1.11, NONE breaks translation setup; use working offline
# OpenNMT + MINISBD, as in Electron v4.23.67.
os.environ["ARGOS_CHUNK_TYPE"] = "MINISBD"
os.environ["ARGOS_MODEL_PROVIDER"] = "OPENNMT"
os.environ["ARGOS_DEVICE_TYPE"] = "cpu"

LANGS = {"vi","en","fr","es","de","zh","ja","ko","pt","it","ru","id","ar","hi","th","tr","nl","pl","uk","sv","ms"}
PREFIX = "OIPTV_ROUTE:"
SMOKE = "Hello! How are you today?"

def codes(argv):
    if len(argv) == 2:
        source, target = "en", argv[1]
    elif len(argv) == 3:
        source, target = argv[1], argv[2]
    else:
        raise ValueError("Usage: route|probe|install|translate [SOURCE] TARGET")
    if source not in LANGS or target not in LANGS:
        raise ValueError("Unsupported source or target language")
    return source, target

def direct_packages(package, source, target):
    return [p for p in package.get_installed_packages()
            if p.from_code == source and p.to_code == target
            and getattr(p, "type", "translate") in ("translate", "", None)]

def translation(source, target):
    from argostranslate import translate
    known = {lang.code: lang for lang in translate.get_installed_languages()}
    src, dst = known.get(source), known.get(target)
    if src is None or dst is None:
        raise RuntimeError(f"Argos lacks installed languages {source} -> {target}")
    engine = src.get_translation(dst)
    if engine is None:
        raise RuntimeError(f"Argos model {source} -> {target} is not initialized")
    return engine

def smoke(source, target):
    output = translation(source, target).translate(SMOKE)
    if not isinstance(output, str) or not output.strip():
        raise RuntimeError("Argos model returns an empty translation")
    return True

def working(source, target):
    try:
        return smoke(source, target)
    except Exception:
        return False

def route(source, target):
    if source == target:
        return "same"
    # Always validate the actual translation object, never trust a package index.
    if working(source, target):
        return "direct"
    if source != "en" and target != "en" and working(source, "en") and working("en", target):
        return "pivot"
    if target == "en" or working("en", target):
        return "whisper"  # Whisper can translate the recorded speech to English.
    return "needs-model"

def fetch_direct(package, source, target, repair=False):
    installed = direct_packages(package, source, target)
    if installed and not repair:
        return True
    if repair:
        for model in installed:
            package.uninstall(model)
    package.update_package_index()
    available = [p for p in package.get_available_packages()
                 if p.from_code == source and p.to_code == target
                 and getattr(p, "type", "translate") in ("translate", "", None)]
    if not available:
        return False
    selected = sorted(available, key=lambda p: str(getattr(p, "package_version", "0")))[-1]
    archive = selected.download()
    try:
        package.install_from_path(archive)
    finally:
        try:
            Path(archive).unlink(missing_ok=True)
        except OSError:
            pass
    return bool(direct_packages(package, source, target)) and working(source, target)

def install(source, target):
    if source == target:
        return "same"
    from argostranslate import package
    initial = route(source, target)
    if initial in ("direct", "pivot"):
        return initial
    # Repair corrupt direct model even if another fallback route exists.
    if direct_packages(package, source, target):
        try:
            if fetch_direct(package, source, target, repair=True):
                return "direct"
        except Exception:
            pass
    else:
        if fetch_direct(package, source, target):
            return "direct"
    # When a source->target pair is not supplied by Argos, use Whisper
    # to get English and only install English->target (not source->English).
    if target == "en":
        return "whisper"
    if not working("en", target):
        if not fetch_direct(package, "en", target, repair=bool(direct_packages(package, "en", target))):
            raise RuntimeError(f"Argos does not offer working en -> {target}")
    result = route(source, target)
    if result == "needs-model":
        raise RuntimeError(f"Argos route {source} -> {target} still missing")
    return result

def main():
    if len(sys.argv) < 3 or sys.argv[1] not in ("route","probe","install","translate"):
        raise ValueError("Usage: route|probe|install|translate [SOURCE] TARGET")
    action = sys.argv[1]
    source, target = codes(sys.argv[1:])
    if action == "install":
        selected = install(source, target)
    else:
        selected = route(source, target)
    if action != "translate":
        print(PREFIX + json.dumps({"source":source,"target":target,"route":selected,
                                   "installed":selected in ("direct","pivot"),
                                   "ready":selected != "needs-model"}), flush=True)
        return
    value = sys.stdin.read(2400).strip()
    if not value:
        raise ValueError("No text to translate")
    if selected == "same":
        sys.stdout.write(value)
        return
    if selected == "direct":
        translated = translation(source, target).translate(value)
    elif selected == "pivot":
        translated = translation("en", target).translate(translation(source, "en").translate(value))
    else:
        raise RuntimeError("Installed Argos cannot translate this pair; use Whisper English fallback")
    if not isinstance(translated, str) or not translated.strip():
        raise RuntimeError("Argos returned empty translation")
    sys.stdout.write(translated.strip())

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Argos route: " + str(exc).replace("\n"," ")[:400], file=sys.stderr)
        sys.exit(1)
