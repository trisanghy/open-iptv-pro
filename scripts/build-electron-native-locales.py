#!/usr/bin/env python3
"""Build-time translation of public Electron UI only; no user IPTV data leaves the app."""
import argparse
import html
import json
from pathlib import Path
import random
import re
import subprocess
import time
import urllib.parse
import urllib.request
import urllib.error

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/"locale-output"
LANGS={"es":"es","pt-BR":"pt","zh-CN":"zh-CN","th":"th","lo":"lo","km":"km","fr":"fr","de":"de","it":"it","ja":"ja","ko":"ko","ru":"ru","id":"id","hi":"hi","ar":"ar"}
API="https://clients5.google.com/translate_a/t"

def report():
    raw=subprocess.check_output(["node","scripts/audit-electron-i18n.cjs","--json"],cwd=ROOT,text=True,timeout=120)
    return json.loads(raw)

def groups(items):
    batch=[];url_len=125
    for value in items:
        estimated=len(urllib.parse.quote(html.unescape(value),safe=""))+5
        if batch and (len(batch)>=9 or url_len+estimated>4500):
            yield batch
            batch=[];url_len=125
        batch.append(value);url_len+=estimated
    if batch:yield batch

def request(phrases,lang):
    args=[("client","dict-chrome-ex"),("sl","vi"),("tl",LANGS[lang])]
    args.extend(("q",html.unescape(s)) for s in phrases)
    req=urllib.request.Request(API+"?"+urllib.parse.urlencode(args),headers={"User-Agent":"Mozilla/5.0","Accept":"application/json"})
    for i in range(7):
        try:
            with urllib.request.urlopen(req,timeout=30) as stream:res=json.load(stream)
            if not isinstance(res,list) or len(res)!=len(phrases) or any(not isinstance(x,str) or not x.strip() for x in res):
                raise ValueError("Invalid response shape/content")
            return [html.unescape(s).strip() for s in res]
        except Exception as exc:
            if i==6:raise
            delay=min(50,2**(i+1))+random.uniform(0,0.4)
            print("retry",lang,i+1,str(exc)[:70],flush=True)
            time.sleep(delay)

def translate(lang):
    data=report()
    missing=next(x["untranslated"] for x in data["results"] if x["code"]==lang)
    missing=list(dict.fromkeys(missing))
    dest=OUTPUT/(lang+".json")
    OUTPUT.mkdir(exist_ok=True)
    current={}
    for idx,batch in enumerate(groups(missing)):
        values=request(batch,lang)
        current.update(zip(batch,values))
        if idx%5==0:
            dest.write_text(json.dumps(current,ensure_ascii=False,indent=2)+"\n","utf-8")
        if idx%10==0:print(lang,len(current),"/",len(missing),flush=True)
        time.sleep(0.25)
    dest.write_text(json.dumps(current,ensure_ascii=False,indent=2)+"\n","utf-8")
    if len(current)!=len(missing):raise RuntimeError(lang+": incomplete translations")
    print(lang,"DONE",len(current),flush=True)

def merge():
    packs={}
    for lang in LANGS:
        path=OUTPUT/(lang+".json")
        if not path.exists():raise RuntimeError("Missing generated dictionary: "+lang)
        packs[lang]=json.loads(path.read_text("utf-8"))
        if not packs[lang]:raise RuntimeError("No translations for: "+lang)
    renderer=ROOT/"renderer"
    (renderer/"i18n-full-locale-pack.js").write_text(
        "'use strict';\n// Build-time UI translations only; no runtime translation calls.\n"
        "(function(root){const packs="+json.dumps(packs,ensure_ascii=False,separators=(",",":"))+
        ";root.OpenIPTVCompletedLocales=Object.freeze({packs});"
        "})(typeof window!=='undefined'?window:globalThis);\n","utf-8")
    index=renderer/"index.html"
    src=index.read_text("utf-8")
    anchor='<script src="i18n-multilingual-packs.js"></script><script src="i18n.js"></script>'
    if src.count(anchor)!=1:raise RuntimeError("Unexpected index script order")
    index.write_text(src.replace(anchor,'<script src="i18n-multilingual-packs.js"></script><script src="i18n-full-locale-pack.js"></script><script src="i18n.js"></script>',1),"utf-8")
    path=renderer/"i18n.js"
    src=path.read_text("utf-8")
    anchor="  const key='open-iptv-pro-language';"
    if src.count(anchor)!=1:raise RuntimeError("Unexpected i18n dictionary insertion point")
    addition="""  // Generated labels supplement missing or English-equivalent native entries only.
  const completedLocalePacks=window.OpenIPTVCompletedLocales?.packs||{};
  for(const [lang,items] of Object.entries(completedLocalePacks)){
    const target=dictionaries[lang]||(dictionaries[lang]={});
    const english=dictionaries.en||{};
    for(const [key,value] of Object.entries(items)){
      if(!target[key]||target[key]===key||target[key]===english[key])target[key]=value;
    }
  }
"""
    path.write_text(src.replace(anchor,addition+anchor,1),"utf-8")
    audit_file=ROOT/"scripts/audit-electron-i18n.cjs"
    src=audit_file.read_text("utf-8")
    anchor="'renderer/i18n-multilingual-packs.js','renderer/i18n.js'"
    if src.count(anchor)!=1:raise RuntimeError("Unexpected audit script load order")
    audit_file.write_text(src.replace(anchor,"'renderer/i18n-multilingual-packs.js','renderer/i18n-full-locale-pack.js','renderer/i18n.js'",1),"utf-8")
    test=ROOT/"tests/i18n-100-percent-native.test.cjs"
    test.write_text("""'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-electron-i18n.cjs');
test('all 17 Electron languages translate every audited static UI label',()=>{
 const report=audit();
 assert.ok(report.total>=580);
 for(const lang of report.results)
  assert.deepEqual(lang.untranslated,[],lang.code+' missing native UI strings');
});
test('names and stream URLs from user playlists are unchanged',()=>{
 const e=engine();
 for(const lang of Object.keys(e.locales))
  for(const data of ['VTV1','Channel XYZ','https://example.com/live.m3u8'])
   assert.equal(e.t(data,lang),data);
});
""","utf-8")
    final=report()
    for v in final["results"]:
        print(v["code"],v["localized"],"/",v["total"],v["pct"],"native percent",flush=True)
    failed=[v for v in final["results"] if v["untranslated"]]
    if failed:
        for v in failed:
            print("STILL MISSING",v["code"],json.dumps(v["untranslated"][:30],ensure_ascii=False),flush=True)
        raise RuntimeError("Native UI audit not yet 100%; refusing to publish")
    print("All audited static UI labels translated natively",flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--lang",choices=LANGS)
    p.add_argument("--merge",action="store_true")
    a=p.parse_args()
    if a.merge:merge()
    elif a.lang:translate(a.lang)
    else:p.error("Choose --lang or --merge")
