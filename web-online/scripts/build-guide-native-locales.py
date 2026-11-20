#!/usr/bin/env python3
"""Generate complete, offline guide translations for fixed public HTML text.

The translator runs only in CI, never inside the IPTV player. No playlist,
user account, URL token or EPG is processed.
"""
import argparse, hashlib, json, pathlib, random, re, time, urllib.parse, urllib.request, urllib.error
from html.parser import HTMLParser

ROOT=pathlib.Path(__file__).resolve().parents[2]
GUIDE=ROOT/'huong-dan.html'
SOURCE=ROOT/'web-online'/'huong-dan.html'  # Editable guide template; published HTML is generated
OUT=ROOT/'guide-locale-output'
ASSET=ROOT/'guide-native-locales.js'
LANGS={'en':'en','fr':'fr','de':'de','es':'es','pt-BR':'pt','zh-CN':'zh-CN',
       'ja':'ja','ko':'ko','th':'th','id':'id','ru':'ru','lo':'lo','km':'km',
       'it':'it','hi':'hi','ar':'ar'}
NAMES={'vi':'Tiếng Việt','en':'English','fr':'Français','de':'Deutsch',
       'es':'Español','pt-BR':'Português (Brasil)','zh-CN':'简体中文',
       'ja':'日本語','ko':'한국어','th':'ไทย','id':'Bahasa Indonesia',
       'ru':'Русский','lo':'ລາວ','km':'ភាសាខ្មែរ','it':'Italiano',
       'hi':'हिन्दी','ar':'العربية'}
VIET=re.compile(r'[À-ỹ]')
EXCLUDED={'style','script','code','pre','option'}
class LabelParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.exclude=0
        self.labels=set()
    def handle_starttag(self,tag,attrs):
        if tag in EXCLUDED:self.exclude+=1
        for key,value in attrs:
            if value and key in ('title','aria-label','alt','content') and VIET.search(value):
                self.labels.add(value.strip())
    def handle_endtag(self,tag):
        if tag in EXCLUDED:self.exclude=max(0,self.exclude-1)
    def handle_data(self,value):
        value=value.strip()
        if value and self.exclude==0 and VIET.search(value):self.labels.add(value)

def keys():
    parser=LabelParser()
    parser.feed(SOURCE.read_text(encoding='utf8'))
    parser.labels.add('Ngôn ngữ')
    return sorted(parser.labels)

def groups(phrases):
    batch=[];total=0
    for phrase in phrases:
        length=len(urllib.parse.quote(phrase,safe=''))
        if batch and (len(batch)>=6 or total+length>2450):
            yield batch;batch=[];total=0
        batch.append(phrase);total+=length
    if batch:yield batch

def api(batch,lang):
    args=[('client','dict-chrome-ex'),('sl','vi'),('tl',LANGS[lang])]
    args.extend(('q',value) for value in batch)
    req=urllib.request.Request('https://clients5.google.com/translate_a/t?'+urllib.parse.urlencode(args),
        headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
    for attempt in range(7):
        try:
            with urllib.request.urlopen(req,timeout=30) as response:data=json.load(response)
            if not isinstance(data,list) or len(data)!=len(batch) or any(not isinstance(v,str) or not v.strip() for v in data):
                raise ValueError('Translation API changed return shape')
            return [v.strip() for v in data]
        except (urllib.error.URLError,ValueError,TimeoutError) as error:
            if attempt==6:raise RuntimeError('Guide translation unavailable: '+lang+' '+str(error)) from error
            time.sleep(min(45,2**(attempt+1))+random.uniform(0,.8))
    raise RuntimeError('Guide translation retry exhausted')

def translate(lang):
    originals=keys()
    OUT.mkdir(exist_ok=True)
    dest=OUT/(lang+'.json')
    existing=json.loads(dest.read_text(encoding='utf8')) if dest.exists() else {}
    answers={key:value for key,value in existing.items() if key in originals and isinstance(value,str) and value.strip()}
    missing=[key for key in originals if key not in answers]
    for group in groups(missing):
        answers.update(zip(group,api(group,lang)))
        dest.write_text(json.dumps(answers,ensure_ascii=False,sort_keys=True),encoding='utf8')
        time.sleep(.3)
    if len(answers)!=len(originals):raise RuntimeError('Missing guide labels: '+lang)
    print(lang,':',len(answers),'translated guide strings')

def assemble():
    originals=keys()
    packs={}
    for lang in LANGS:
        path=OUT/(lang+'.json')
        if not path.is_file():raise RuntimeError('Missing guide locale file: '+lang)
        items=json.loads(path.read_text(encoding='utf8'))
        missing=[key for key in originals if not isinstance(items.get(key),str) or not items[key].strip()]
        if missing:raise RuntimeError('Incomplete guide locale '+lang+': '+repr(missing[:5]))
        packs[lang]={key:items[key] for key in originals}
    ASSET.write_text('/* Pretranslated guide, public strings only. */\n'+
        'window.OpenIPTVGuideLocales='+json.dumps(packs,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
    hash=hashlib.sha256(ASSET.read_bytes()).hexdigest()[:16]
    html=SOURCE.read_text(encoding='utf8')
    if 'id="guideLanguage"' in html:raise RuntimeError('Guide translation was already installed; refresh source before regenerating')
    selectors='<div class="guide-locale"><label for="guideLanguage">Ngôn ngữ</label>'
    selectors+='<select id="guideLanguage" aria-label="Ngôn ngữ">'
    selectors+=''.join('<option value="'+code+'">'+name+'</option>' for code,name in NAMES.items())
    selectors+='</select></div>'
    anchor='</div></nav></header>'
    if html.count(anchor)!=1:raise RuntimeError('Guide navigation anchor changed')
    html=html.replace(anchor,'</div>'+selectors+'</nav></header>',1)
    css=''  # Modern guide template already owns responsive language-picker styles
    if html.count('</style>')!=1:raise RuntimeError('Guide style anchor missing')
    html=html.replace('</style>',css+'</style>',1)
    controller=r"""<script src="guide-native-locales.js?v=__HASH__"></script>
<script id="guide-language-controller">
(function(){
'use strict';
const dictionaries=window.OpenIPTVGuideLocales||{};
const codes=['vi','en','fr','de','es','pt-BR','zh-CN','ja','ko','th','id','ru','lo','km','it','hi','ar'];
const select=document.getElementById('guideLanguage');
if(!select)return;
const nodes=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
let node;
while((node=walker.nextNode())){
 if(node.parentElement&&['SCRIPT','STYLE','OPTION','CODE','PRE'].includes(node.parentElement.tagName))continue;
 const raw=node.nodeValue,word=raw.trim();
 if(word)nodes.push({node,raw,word});
}
const meta=[];
for(const element of document.querySelectorAll('[title],[aria-label],[alt],meta[content]')){
 for(const attr of ['title','aria-label','alt','content']){
  if(element.hasAttribute(attr))meta.push({element,attr,raw:element.getAttribute(attr)});
 }
}
const initialTitle=document.title;
function normalize(value){
 const lower=String(value||'').toLowerCase();
 if(lower.startsWith('pt'))return 'pt-BR';
 if(lower.startsWith('zh'))return 'zh-CN';
 const primary=lower.split(/[-_]/)[0];
 return codes.find(code=>code.toLowerCase()===primary)||null;
}
function translate(value,code){
 if(code==='vi'||!dictionaries[code])return value;
 return dictionaries[code][value]||value;
}
function apply(code){
 if(!codes.includes(code))code='vi';
 const labels=dictionaries[code]||{};
 for(const {node,raw,word} of nodes){
  if(!node.isConnected)continue;
  const changed=translate(word,code);
  node.nodeValue=changed===word?raw:raw.replace(word,changed);
 }
 for(const {element,attr,raw} of meta){
  if(element.isConnected)element.setAttribute(attr,translate(raw,code));
 }
 document.title=translate(initialTitle,code);
 document.documentElement.lang=code;
 document.documentElement.dir=code==='ar'?'rtl':'ltr';
 select.value=code;
}
let wanted=null;
try{wanted=normalize(new URL(window.location.href).searchParams.get('lang'));}catch(e){}
try{wanted=wanted||normalize(localStorage.getItem('openiptv.home.language'));}catch(e){}
if(!wanted)for(const code of (navigator.languages||[navigator.language])){wanted=normalize(code);if(wanted)break;}
apply(wanted||'vi');
select.addEventListener('change',()=>{
 const code=normalize(select.value)||'vi';
 apply(code);
 try{localStorage.setItem('openiptv.home.language',code);}catch(e){}
 try{const url=new URL(window.location.href);url.searchParams.set('lang',code);
  history.replaceState(history.state,'',url.pathname+url.search+url.hash);}catch(e){}
});
})();
</script>
"""
    controller=controller.replace('__HASH__',hash)
    if html.count('</body>')!=1:raise RuntimeError('Guide closing body missing')
    html=html.replace('</body>',controller+'</body>',1)
    GUIDE.write_text(html,encoding='utf8')
    print('Guide localization:',len(originals),'labels ×',len(packs),'native languages; complete with Vietnamese')
    print('Output size:',ASSET.stat().st_size)

def main():
    parser=argparse.ArgumentParser()
    choice=parser.add_mutually_exclusive_group(required=True)
    choice.add_argument('--lang',choices=LANGS)
    choice.add_argument('--assemble',action='store_true')
    options=parser.parse_args()
    if options.lang:translate(options.lang)
    else:assemble()
if __name__=='__main__':main()
