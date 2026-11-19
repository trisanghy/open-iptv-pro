#!/usr/bin/env python3
"""Create offline dynamic-UI translations from authored Electron source, never user media."""
import argparse
import html
import json
import random
import re
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"locale-output"
LANGS={"en":"en","es":"es","pt-BR":"pt","zh-CN":"zh-CN","th":"th","lo":"lo","km":"km","fr":"fr","de":"de","it":"it","ja":"ja","ko":"ko","ru":"ru","id":"id","hi":"hi","ar":"ar"}
SERVICE="https://clients5.google.com/translate_a/t"
VI=re.compile("[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]")
MARKERS=["IPTVSLOTZERO","IPTVSLOTONE","IPTVSLOTTWO","IPTVSLOTTHREE","IPTVSLOTFOUR"]
TEMPLATE=re.compile(r"\$\{([^{}]{1,110})\}")
SKIP={"Tiếng Việt","Việt Nam","Trúc Ly","Hải Đăng","Thiện Minh","Thùy Dung","Thiền Tâm Đức","Ngọc Huyền","Quang Sơn","Ngọc Trân","Minh Đức","Phạm Tuyên"}
QUOTES=[
 re.compile(r'"((?:\\.|[^"\\]){2,650})"',re.S),
 re.compile(r"'((?:\\.|[^'\\]){2,650})'",re.S),
 re.compile(re.escape(chr(96))+r"((?:\\.|[^"+chr(96)+r"\\]){2,650})"+re.escape(chr(96)),re.S)
]
def clean(text):
    return html.unescape(text.replace("\\n","\n").replace("\\t","\t")).strip()
def valid(text):
    if len(text)<4 or len(text)>450 or not VI.search(text):return False
    if text in SKIP or text.startswith(("http:","https:","//","/*")):return False
    if any(word in text for word in ("function(","document.","window.","=>","console.","JSON.stringify","const ","let ","import ","require(")):return False
    return True

def extract():
    all_static=set()
    all_templates=set()
    files=sorted((ROOT/"renderer").glob("*.js"))
    count=0
    for file in files:
        if file.name.startswith(("i18n","languages.")):continue
        raw=file.read_text("utf-8")
        count+=1
        for q in QUOTES:
            for match in q.finditer(raw):
                value=clean(match.group(1))
                if not valid(value):continue
                if "<" in value or ">" in value:
                    # HTML inserted by JS: extract visible text and attributes; user source fields stay excluded.
                    for piece in re.findall(r">([^<>]{3,230})<",value):
                        piece=clean(piece)
                        if valid(piece) and not TEMPLATE.search(piece):all_static.add(piece)
                    for attr in re.findall(r"(?:title|placeholder|aria-label|alt)=[\"']([^\"']{3,250})[\"']",value):
                        attr=clean(attr)
                        if valid(attr) and not TEMPLATE.search(attr):all_static.add(attr)
                    continue
                if TEMPLATE.search(value):
                    slots=0
                    def replace(m):
                        nonlocal slots
                        if slots>=len(MARKERS):return ""
                        s=MARKERS[slots];slots+=1;return s
                    rendered=TEMPLATE.sub(replace,value)
                    if slots>0 and slots<=len(MARKERS) and valid(rendered) and all(x in rendered for x in MARKERS[:slots]):
                        # Each pattern has at least one Vietnamese UI word anchoring the match.
                        if len(re.sub(r"IPTVSLOT(?:ZERO|ONE|TWO|THREE|FOUR)","",rendered).strip())>=7:
                            all_templates.add(rendered)
                    continue
                all_static.add(value)
                # Dynamic messages built with literal prefix + runtime variable.
                next_part=raw[match.end():match.end()+95]
                if re.match(r"\s*\+\s*(?:[A-Za-z_$]|\()",next_part) and len(value)>=7:
                    if value.endswith((" ",":","·","-","(",": ")):
                        all_templates.add(value+MARKERS[0])
    # Do not add vague one-word dynamic patterns that might match playlist content.
    templates=sorted(t for t in all_templates if valid(t) and len(t)<=450)
    strings=sorted(s for s in all_static if valid(s))
    return {"static":strings,"templates":templates,"files":count}

def missing_static(keys,lang):
    js="""const {engine}=require('./scripts/audit-electron-i18n.cjs');
const i=engine(),l=process.argv[1];
const raw=require('node:fs').readFileSync(0,'utf8'),k=JSON.parse(raw);
const miss=k.filter(s=>i.t(s,l)===s||(l!=='en'&&i.t(s,l)===i.t(s,'en')));
process.stdout.write(JSON.stringify(miss));"""
    process=subprocess.run(["node","-e",js,lang],input=json.dumps(keys,ensure_ascii=False),text=True,cwd=ROOT,capture_output=True,timeout=90)
    if process.returncode:raise RuntimeError(process.stderr[-1500:])
    return json.loads(process.stdout)

def batches(keys):
    part=[];length=180
    for k in keys:
        n=len(urllib.parse.quote(k[1] if isinstance(k,tuple) else k,safe=""))+5
        if part and (len(part)>=8 or length+n>4300):
            yield part;part=[];length=180
        part.append(k);length+=n
    if part:yield part

def translate_group(keys,lang):
    args=[("client","dict-chrome-ex"),("sl","vi"),("tl",LANGS[lang])]
    args += [("q",key) for key in keys]
    req=urllib.request.Request(SERVICE+"?"+urllib.parse.urlencode(args),headers={"Accept":"application/json","User-Agent":"Mozilla/5.0"})
    for attempt in range(7):
        try:
            with urllib.request.urlopen(req,timeout=30) as stream:translated=json.load(stream)
            if len(translated)!=len(keys) or any(not isinstance(x,str) or not x.strip() for x in translated):
                raise RuntimeError("Translation response incomplete")
            return [html.unescape(v).strip() for v in translated]
        except Exception as exc:
            if attempt==6:raise
            print(lang,"retry",attempt+1,str(exc)[:110],flush=True)
            time.sleep(min(30,2**(attempt+1))+random.random()/4)

def generate(lang):
    src=extract()
    todo_static=missing_static(src["static"],lang)
    todo=[("static",s) for s in todo_static]+[("templates",s) for s in src["templates"]]
    print(lang,"files",src["files"],"raw static",len(src["static"]),"missing",len(todo_static),"dynamic templates",len(src["templates"]),flush=True)
    data={"static":{},"templates":{}}
    OUT.mkdir(exist_ok=True)
    for idx,part in enumerate(batches(todo)):
        # Split name/content to preserve associated dictionary.
        keys=[x[1] for x in part]
        values=translate_group(keys,lang)
        for (kind,key),translated in zip(part,values):
            if kind=="templates":
                markers=[m for m in MARKERS if m in key]
                # A translation is safe to apply only if it retained each variable marker.
                if any(translated.count(mark)!=1 for mark in markers):
                    print("BAD TOKEN",lang,repr(key[:90]),repr(translated[:90]),flush=True)
                    continue
            data[kind][key]=translated
        if idx%7==0:
            (OUT/("dynamic-"+lang+".json")).write_text(json.dumps(data,ensure_ascii=False)+"\n","utf-8")
        if idx%13==0:print(lang,"progress",sum(len(v) for v in data.values()),"/",len(todo),flush=True)
        time.sleep(0.15)
    (OUT/("dynamic-"+lang+".json")).write_text(json.dumps(data,ensure_ascii=False)+"\n","utf-8")
    dropped=set(src["templates"])-set(data["templates"])
    if dropped:print(lang,"untranslated template count",len(dropped),flush=True)
    if len(data["static"])!=len(todo_static):raise RuntimeError("Untranslated static labels")
    print(lang,"complete static",len(data["static"]),"dynamic",len(data["templates"]),flush=True)

def merge():
    sources=extract()
    allpacks={"static":{},"templates":{}}
    errors=[]
    for lang in LANGS:
        file=OUT/("dynamic-"+lang+".json")
        if not file.exists():raise RuntimeError("Missing "+str(file))
        data=json.loads(file.read_text("utf-8"))
        allpacks["static"][lang]=data["static"]
        allpacks["templates"][lang]=data["templates"]
        missing=set(sources["templates"])-set(data["templates"])
        if missing:errors.append((lang,len(missing),list(missing)[:4]))
    print("DYNAMIC AUDIT",len(sources["static"]),"static",len(sources["templates"]),"templates",flush=True)
    if errors:
        print("MISSING TRANSLATED DYNAMIC PATTERNS",errors,flush=True)
        raise RuntimeError("Unverified placeholder translations; cannot claim 100%")
    output=ROOT/"renderer/i18n-dynamic-locales.js"
    source="""'use strict';
// Generated at build-time from authored UI text; never user playlist data.
(function(root){
 const content=INSERT_DATA;
 const mark=/IPTVSLOT(?:ZERO|ONE|TWO|THREE|FOUR)/g;
 const escape=part=>part.replace(/[.*+?^$()[\\]{}|]/g,'\\$&');
 const sorted=Object.keys(content.templates.en||{}).sort((a,b)=>b.replace(mark,'').length-a.replace(mark,'').length);
 const rules=sorted.map(source=>{
  const chunks=source.split(mark),placeholders=source.match(mark)||[];
  if(!placeholders.length)return null;
  const regex=new RegExp('^'+chunks.map(escape).join('([\\s\\S]+?)')+'$');
  return {source,regex,placeholders};
 }).filter(Boolean);
 function translate(raw,lang){
  const map=content.templates[lang];
  if(!map)return null;
  for(const rule of rules){
   const matched=rule.regex.exec(raw);if(!matched)continue;
   const target=map[rule.source];if(!target)continue;
   const values=Object.fromEntries(rule.placeholders.map((token,i)=>[token,matched[i+1]]));
   return target.replace(mark,token=>values[token]??token);
  }
  return null;
 }
 root.OpenIPTVDynamicLocales=Object.freeze({static:content.static,translate,templateKeys:sorted});
})(typeof window!=='undefined'?window:globalThis);
""".replace("INSERT_DATA",json.dumps(allpacks,ensure_ascii=False,separators=(",",":")))
    output.write_text(source,"utf-8")
    print("Bundle generated",output.name,output.stat().st_size,"bytes",flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--extract",action="store_true")
    parser.add_argument("--lang",choices=LANGS)
    parser.add_argument("--merge",action="store_true")
    args=parser.parse_args()
    if args.extract:print(json.dumps(extract(),ensure_ascii=False))
    elif args.lang:generate(args.lang)
    elif args.merge:merge()
    else:parser.error("Use --extract, --lang or --merge")
