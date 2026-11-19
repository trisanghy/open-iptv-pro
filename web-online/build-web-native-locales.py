#!/usr/bin/env python3
"""Build complete native Web UI dictionaries, preserving every authored translation.

Only built-in UI labels are translated; no playlist, token, EPG or user data is sent.
Output stays in Web Online. Never modify Electron, Rust, Mobile or main.
"""
import argparse, json, re, sys, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CODES=['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']
CACHE=ROOT/'web-online'/'web-native-complete.json'
OUTPUT=ROOT/'web-native-complete.js'
EN_SETS=['patchEnglish','extraUiEnglish','webUiEnglish','collectionCastEnglish','advancedUiEnglish','appUiEnglish','finishUiEnglish']
OTHER_SETS=['patchOther','localizedUiCore','localizedSourceCore','localizedPlayerUi']

def object_from_js(text,name):
    m=re.search(r'\bconst\s+'+re.escape(name)+r'\s*=\s*',text)
    if not m:raise RuntimeError('Missing localization dictionary: '+name)
    data,_=json.JSONDecoder().raw_decode(text[m.end():].lstrip())
    if not isinstance(data,dict):raise RuntimeError('Invalid dictionary: '+name)
    return data

def catalogs():
    source=(ROOT/'languages.bundle.js').read_text(encoding='utf-8')
    marker='window.OPEN_IPTV_TRANSLATIONS='
    if marker not in source:raise RuntimeError('Missing languages.bundle.js data')
    data=json.loads(source.split(marker,1)[1].strip().rstrip(';'))
    engine=(ROOT/'i18n.js').read_text(encoding='utf-8')
    for name in EN_SETS:data['en'].update(object_from_js(engine,name))
    for name in OTHER_SETS:
        for lang,items in object_from_js(engine,name).items():
            data.setdefault(lang,{}).update(items)
    # Merge pretranslated, audited Web-only packs before generating the gaps.
    # Hand-written i18n.js translations remain authoritative.
    pretranslated=(ROOT/'web-generated-locales.js').read_text(encoding='utf-8')
    for lang,items in object_from_js(pretranslated,'packs').items():
        target=data.setdefault(lang,{})
        for key,value in items.items():
            if not target.get(key) or target[key]==data['en'].get(key):
                target[key]=value
    supplemental=(ROOT/'web-language-supplement.js').read_text(encoding='utf-8')
    originals_match=re.search(r'\bconst\s+originals\s*=\s*',supplemental)
    if not originals_match:raise RuntimeError('Missing curated Web originals')
    originals,_=json.JSONDecoder().raw_decode(supplemental[originals_match.end():].lstrip())
    for lang,translated in object_from_js(supplemental,'native').items():
        if len(translated)!=len(originals):raise RuntimeError('Incomplete curated Web locale: '+lang)
        data.setdefault(lang,{}).update(zip(originals,translated))
    return data

def remote_batch(phrases,lang):
    # The old translate.googleapis.com endpoint returns HTTP 429 on CI.
    # Use the same public-label-only batch endpoint already verified by the
    # repo's Electron locale job. This runs at build time, never in browsers.
    target={'pt-BR':'pt','zh-CN':'zh-CN'}.get(lang,lang)
    args=[('client','dict-chrome-ex'),('sl','en'),('tl',target)]
    args.extend(('q',phrase) for phrase in phrases)
    query=urllib.parse.urlencode(args)
    request=urllib.request.Request('https://clients5.google.com/translate_a/t?'+query,
        headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
    with urllib.request.urlopen(request,timeout=30) as response:
        data=json.loads(response.read().decode('utf-8'))
    if (not isinstance(data,list) or len(data)!=len(phrases)
        or any(not isinstance(value,str) or not value.strip() for value in data)):
        raise ValueError('Translation provider returned an unexpected response')
    return [value.strip() for value in data]

def retry(phrases,lang):
    for attempt in range(5):
        try:return remote_batch(phrases,lang)
        except (ValueError,urllib.error.URLError,TimeoutError,json.JSONDecodeError) as error:
            if len(phrases)>1:
                mid=len(phrases)//2
                return retry(phrases[:mid],lang)+retry(phrases[mid:],lang)
            if attempt==4:raise RuntimeError('Translation unavailable: '+lang+' '+repr(phrases[0][:70])) from error
            time.sleep(min(12,2**attempt))
    raise RuntimeError('Unreachable')

def emit(cache):
    CACHE.write_text(json.dumps(cache,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n',encoding='utf-8')
    output='/* Native UI dictionaries generated from Open IPTV Pro English strings. */\n'
    output+='(function(){"use strict";const extra='+json.dumps(cache,ensure_ascii=False,separators=(',',':'))+';'
    output+='const base=window.OPEN_IPTV_TRANSLATIONS||(window.OPEN_IPTV_TRANSLATIONS={});'
    output+='for(const [lang,items] of Object.entries(extra))Object.assign(base[lang]||(base[lang]={}),items);})();\n'
    OUTPUT.write_text(output,encoding='utf-8')

def main(fill):
    authored=catalogs()
    english=authored['en']
    cache=json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
    if not isinstance(cache,dict):raise RuntimeError('Invalid translation cache')
    result={}
    for lang in CODES:
        fixed=authored.get(lang,{})
        existing=cache.get(lang,{})
        items={k:v for k,v in existing.items() if k in english and k not in fixed and isinstance(v,str) and v.strip()}
        missing=[key for key in english if key not in fixed and key not in items]
        print('%s: authored=%d cached=%d missing=%d'%(lang,len(fixed),len(items),len(missing)),flush=True)
        if fill:
            pending=[]
            for key in missing:
                if not english[key].strip():raise RuntimeError('Empty English label: '+key)
                if pending and (sum(len(english[k]) for k in pending)+len(english[key])>950 or len(pending)>=12):
                    items.update(zip(pending,retry([english[k] for k in pending],lang)))
                    pending=[]
                pending.append(key)
            if pending:items.update(zip(pending,retry([english[k] for k in pending],lang)))
        result[lang]=items
        # Checkpoint completed languages to avoid re-translating them if later
        # languages hit a transient rate-limit or an unavailable endpoint.
        if fill:
            cache[lang]=items
            emit(cache)
    gaps={lang:[key for key in english if key not in authored.get(lang,{}) and key not in result.get(lang,{})] for lang in CODES}
    print('Native coverage:',{lang:len(keys) for lang,keys in gaps.items()},flush=True)
    if any(gaps.values()):raise RuntimeError('Localization incomplete; refusing 100% coverage claim')
    emit(result)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--fill',action='store_true')
    args=parser.parse_args()
    main(args.fill)
