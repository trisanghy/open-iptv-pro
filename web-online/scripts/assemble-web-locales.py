#!/usr/bin/env python3
"""Create an offline Web language supplement from verified public UI translation artifacts.
Only translates fixed application UI strings; never accesses playlist or EPG user data.
Run with the extracted 15 *.json translation artifacts as an argument.
"""
import json, pathlib, sys
LANGUAGES=('es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar')
base=pathlib.Path(sys.argv[1]).resolve()
target=pathlib.Path(__file__).resolve().parents[1]/'web-generated-locales.js'
packs={}
for lang in LANGUAGES:
    file=base/(lang+'.json')
    if not file.is_file():
        raise SystemExit('Missing locale artifact: '+lang)
    source=json.loads(file.read_text('utf-8'))
    if not isinstance(source,dict) or len(source)<150:
        raise SystemExit('Incomplete locale artifact: '+lang)
    selected={}
    for key,value in source.items():
        if (isinstance(key,str) and isinstance(value,str)
                and 0<len(key)<=1200 and 0<len(value)<=2000
                and value.strip() and key!=value
                and '<script' not in value.lower()):
            selected[key]=value
    if len(selected)<150:
        raise SystemExit('Translations missing after validation: '+lang)
    packs[lang]=selected
prefix='''/* Offline Web UI dictionary, generated from public application labels only.
 * Data from tested translation jobs; no runtime API requests or user media included. */
'use strict';
(() => {
  const packs='''
suffix=''';\n  const dictionaries=window.OPEN_IPTV_TRANSLATIONS;
  if(!dictionaries)return;
  const english=dictionaries.en||{};
  for(const [language,entries] of Object.entries(packs)){
    const target=dictionaries[language]||(dictionaries[language]={});
    for(const [source,value] of Object.entries(entries)){
      if(!target[source] || target[source]===source || target[source]===english[source])
        target[source]=value;
    }
  }
})();
'''
target.write_text(prefix+json.dumps(packs,ensure_ascii=False,separators=(',',':'))+suffix,encoding='utf-8')
print('Web native packs:',', '.join(lang+'='+str(len(packs[lang])) for lang in LANGUAGES))
print('Written',target,'bytes',target.stat().st_size)
