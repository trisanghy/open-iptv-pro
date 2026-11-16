#!/usr/bin/env python3
"""Deterministic smoke test of Argos repair. No model download or network."""
import importlib.util
import os
import sys
import tempfile
import types
from pathlib import Path

state={"models":{("en","vi"):False},"repaired":0}
tmp=tempfile.TemporaryDirectory()
def metadata():
    return [types.SimpleNamespace(from_code=a,to_code=b,type="translate")
            for (a,b) in state["models"]]
class Download:
    def __init__(self,source,target):
        self.from_code=source;self.to_code=target;self.type="translate";self.package_version="1.9"
    def download(self):
        item=Path(tmp.name)/(self.from_code+"_"+self.to_code+".argosmodel")
        item.write_text("local-test",encoding="utf-8")
        return str(item)

pkg=types.ModuleType("argostranslate.package")
pkg.get_installed_packages=metadata
pkg.update_package_index=lambda:None
pkg.get_available_packages=lambda:[
    Download("en","vi"),Download("vi","en"),Download("fr","en")]
def uninstall(item):
    state["models"].pop((item.from_code,item.to_code),None)
pkg.uninstall=uninstall
def install_from_path(source):
    name=Path(source).stem
    a,b=name.split("_")
    state["models"][(a,b)]=True
    state["repaired"]+=1
pkg.install_from_path=install_from_path

translate=types.ModuleType("argostranslate.translate")
class Route:
    def __init__(self,src,dst):self.src=src;self.dst=dst
    def translate(self,text):
        if not state["models"].get((self.src,self.dst),False):
            raise RuntimeError("No translation installed / corrupt model")
        return ("VI: " if self.dst=="vi" else "EN: ")+text
class Language:
    def __init__(self,code):self.code=code
    def get_translation(self,target):return Route(self.code,target.code)
def languages():
    all_codes=set(c for pair in state["models"] for c in pair)
    return [Language(code) for code in all_codes]
translate.get_installed_languages=languages

mod=types.ModuleType("argostranslate")
mod.package=pkg;mod.translate=translate
sys.modules["argostranslate"]=mod
sys.modules["argostranslate.package"]=pkg
sys.modules["argostranslate.translate"]=translate

entry=Path(__file__).resolve().parents[1]/"src"/"argos-bridge.py"
spec=importlib.util.spec_from_file_location("bridge_under_test",str(entry))
bridge=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)
assert bridge.route("vi","vi")[0]("Chào")== "Chào"
assert bridge.install("en","vi")=="direct"
assert state["repaired"]==1, "Corrupt installed model must be replaced once"
assert bridge.route("en","vi")[0]("hello").startswith("VI: ")
assert bridge.install("fr","vi")=="via-en"
assert state["repaired"]==2, "Direct fr→vi unavailable; install fr→en only"
assert bridge.route("fr","vi")[0]("bonjour").startswith("VI: EN: ")
assert state["models"][("en","vi")]
tmp.cleanup()
print("PASS: recovery of corrupted Argos direct pair; same-language skip; English pivot fallback")
