#!/usr/bin/env python3
"""Build native translations for all public text in the Open IPTV Pro homepage.

All translation happens in CI from fixed, public strings. Runtime makes no translation
requests and user IPTV/EPG/playlist data is never transmitted.
"""
import argparse, hashlib, json, pathlib, random, re, time, urllib.parse, urllib.request, urllib.error

ROOT=pathlib.Path(__file__).resolve().parents[2]
HOME=ROOT/'web-online/project-home.html'
ARTIFACTS=ROOT/'home-locales'
OUTPUT=ROOT/'web-online/home-native-locales.js'
LOCALES={
    'fr':'fr','de':'de','es':'es','pt':'pt','zh':'zh-CN','ja':'ja','ko':'ko',
    'th':'th','id':'id','ru':'ru','lo':'lo','km':'km','it':'it','hi':'hi','ar':'ar',
}
META_KEY='Khám phá Open IPTV Pro: trình phát IPTV/M3U cho trình duyệt và máy tính. Tính năng, ảnh giao diện, hướng dẫn, mã nguồn và link tải.'
META_EN='Open IPTV Pro: open-source IPTV player and M3U playlist manager for Web, Windows and macOS. Features, screenshots, guides, source code and official downloads.'
NEW_NAMES={'lo':'ລາວ','km':'ភាសាខ្មែរ','it':'Italiano','hi':'हिन्दी','ar':'العربية'}
NEW_TITLES={
    'lo':'Open IPTV Pro — ເຄື່ອງຫຼິ້ນ IPTV ສຳລັບເວັບ ແລະ ຄອມພິວເຕີ',
    'km':'Open IPTV Pro — កម្មវិធីចាក់ IPTV សម្រាប់វេប និងកុំព្យូទ័រ',
    'it':'Open IPTV Pro — Lettore IPTV per Web e desktop',
    'hi':'Open IPTV Pro — वेब और डेस्कटॉप के लिए IPTV प्लेयर',
    'ar':'Open IPTV Pro — مشغّل IPTV للويب وسطح المكتب',
}

def source():
    html=HOME.read_text(encoding='utf8')
    mark='const translations='
    if html.count(mark)!=1:raise RuntimeError('Homepage catalog anchor changed')
    dictionary,_=json.JSONDecoder().raw_decode(html.split(mark,1)[1])
    en=dict(dictionary['en'])
    en[META_KEY]=META_EN
    return html,dictionary,en

def batches(items):
    batch=[]
    charcount=0
    for value in items:
        length=len(urllib.parse.quote(value,safe=''))
        if batch and (len(batch)>=6 or charcount+length>2400):
            yield batch;batch=[];charcount=0
        batch.append(value);charcount+=length
    if batch:yield batch

def fetch(phrases,language):
    params=[('client','dict-chrome-ex'),('sl','en'),('tl',LOCALES[language])]
    params.extend(('q',value) for value in phrases)
    url='https://clients5.google.com/translate_a/t?'+urllib.parse.urlencode(params)
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
    for attempt in range(7):
        try:
            with urllib.request.urlopen(request,timeout=30) as connection:
                translated=json.load(connection)
            if (not isinstance(translated,list) or len(translated)!=len(phrases)
                or any(not isinstance(v,str) or not v.strip() for v in translated)):
                raise ValueError('Invalid translation response shape')
            return [v.strip() for v in translated]
        except (urllib.error.URLError,ValueError,TimeoutError) as error:
            if attempt==6:raise RuntimeError('Translation failed for '+language+': '+str(error)) from error
            time.sleep(min(45,2**(attempt+1))+random.uniform(0,1))
    raise RuntimeError('Translation unavailable: '+language)

def translate(code):
    _,existing,english=source()
    authored=existing.get(code,{})
    missing=[k for k in english if not authored.get(k)]
    translations={}
    path=ARTIFACTS/(code+'.json')
    ARTIFACTS.mkdir(parents=True,exist_ok=True)
    if path.exists():
        data=json.loads(path.read_text(encoding='utf8'))
        translations={k:v for k,v in data.items() if k in missing and isinstance(v,str) and v.strip()}
    waiting=[key for key in missing if key not in translations]
    for batch in batches(waiting):
        values=fetch([english[key] for key in batch],code)
        translations.update(zip(batch,values))
        path.write_text(json.dumps(translations,ensure_ascii=False,sort_keys=True),encoding='utf8')
        time.sleep(.3)
    if set(translations)!=set(missing):raise RuntimeError('Incomplete homepage locale: '+code)
    print(code,'native translations:',len(translations),'already authored:',len(authored),'total:',len(english),flush=True)

def assemble():
    html,existing,english=source()
    packed={}
    for language in LOCALES:
        path=ARTIFACTS/(language+'.json')
        if not path.exists():raise RuntimeError('Missing translated artifact: '+language)
        translations=json.loads(path.read_text(encoding='utf8'))
        native={**existing.get(language,{}),**translations}
        missing=[key for key in english if not native.get(key)]
        if missing:raise RuntimeError('Missing homepage translations for '+language+': '+repr(missing[:5]))
        packed[language]={key:value for key,value in translations.items() if key in english}
    payload='/* Pretranslated public homepage UI; no runtime network or IPTV user data. */\n'
    payload+='window.OpenIPTVHomeNativeLocales='+json.dumps(packed,ensure_ascii=False,separators=(',',':'))+';\n'
    OUTPUT.write_text(payload,encoding='utf8')
    # Inline the pretranslated dictionary: the independent user-site workflow
    # fetches only project-home.html, not companion JS files.
    script='<script id="home-native-locales-data">\n'+OUTPUT.read_text(encoding='utf8').replace('</script','<\\/script')+'\n</script>\n'
    anchor='<script id="homepage-language-controller">'
    if html.count(anchor)!=1:raise RuntimeError('Homepage localization controller moved')
    if 'id="home-native-locales-data"' in html:
        html,count=re.subn(r'<script id="home-native-locales-data">[\s\S]*?</script>\s*',
                           lambda match:script,html,count=1)
        if count!=1:raise RuntimeError('Cannot update inline homepage translations')
    elif 'src="home-native-locales.js?' in html:
        html,count=re.subn(r'<script src="home-native-locales.js\?v=[^"]+"></script>\s*',
                           lambda match:script,html,count=1)
        if count!=1:raise RuntimeError('Cannot replace external homepage locale asset')
    else:
        html=html.replace(anchor,script+anchor,1)
    insertion='''const nativeHome=window.OpenIPTVHomeNativeLocales||{};
for(const [language,items] of Object.entries(nativeHome)){
 const target=translations[language]||(translations[language]={});
 for(const [key,value] of Object.entries(items))if(!target[key])target[key]=value;
}
'''
    before='const supported=['
    if 'const nativeHome=' not in html:
        if html.count(before)!=1:raise RuntimeError('Could not insert completed home locale packs')
        html=html.replace(before,insertion+before,1)
    old='const supported=["vi","en","zh","ja","ko","th","fr","de","es","pt","id","ru"];'
    allcodes='["vi","en","zh","ja","ko","th","fr","de","es","pt","id","ru","lo","km","it","hi","ar"]'
    if old in html:html=html.replace(old,'const supported='+allcodes+';',1)
    elif 'const supported='+allcodes+';' not in html:raise RuntimeError('Unsupported homepage language selector')
    for lang,label in NEW_NAMES.items():
        option='<option value="'+lang+'">'+label+'</option>'
        if option not in html:html=html.replace('</select></div></div></header>',option+'</select></div></div></header>',1)
    for lang,label in NEW_NAMES.items():
        key=lang+':'+json.dumps(label,ensure_ascii=False)
        if key not in html:
            html=html.replace("ru:'Русский'};", "ru:'Русский',"+lang+":"+repr(label)+"};",1)
    # Replace single preferred-name definition with a predictable complete object.
    names={'vi':'Tiếng Việt','en':'English','zh':'简体中文','ja':'日本語','ko':'한국어',
      'th':'ไทย','fr':'Français','de':'Deutsch','es':'Español','pt':'Português',
      'id':'Bahasa Indonesia','ru':'Русский',**NEW_NAMES}
    html=re.sub(r'const preferredName=\{[^;]+;', 'const preferredName='+json.dumps(names,ensure_ascii=False)+';',html,count=1)
    oldlang="document.documentElement.lang=code==='zh'?'zh-CN':code;"
    newlang="document.documentElement.lang=code==='zh'?'zh-CN':code==='pt'?'pt-BR':code;"
    if oldlang in html:html=html.replace(oldlang,newlang,1)
    elif newlang not in html:raise RuntimeError('HTML language setter moved')
    html=html.replace("document.documentElement.dir='ltr';","document.documentElement.dir=code==='ar'?'rtl':'ltr';",1)
    title_anchor="ru:'Open IPTV Pro — IPTV-плеер для веба и компьютера'};"
    added_titles=','.join(code+':'+json.dumps(title,ensure_ascii=False) for code,title in NEW_TITLES.items())
    if title_anchor in html:
        html=html.replace(title_anchor,"ru:'Open IPTV Pro — IPTV-плеер для веба и компьютера',"+added_titles+"};",1)
    else:
        titles=html.split('const titles=',1)[1].split(';',1)[0]
        if any(code+':' not in titles for code in NEW_TITLES):
            raise RuntimeError('Homepage page title dictionary missing a native language')
    oldmeta="if(desc&&code!=='vi')desc.content='Open IPTV Pro: open-source IPTV player and M3U playlist manager for Web, Windows and macOS. Features, screenshots, guides, source code and official downloads.';"
    newmeta="if(desc&&code!=='vi')desc.content=resolve("+json.dumps(META_KEY,ensure_ascii=False)+",code);"
    if oldmeta in html:html=html.replace(oldmeta,newmeta,1)
    elif newmeta not in html:raise RuntimeError('Homepage description setter moved')
    HOME.write_text(html,encoding='utf8')
    print('Complete 17-language homepage translations generated:',len(english),'labels × 17 locales')
    print('Asset',OUTPUT,'bytes',OUTPUT.stat().st_size)

def main():
    parser=argparse.ArgumentParser()
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--lang',choices=LOCALES)
    group.add_argument('--assemble',action='store_true')
    args=parser.parse_args()
    if args.lang:translate(args.lang)
    else:assemble()

if __name__=='__main__':main()
