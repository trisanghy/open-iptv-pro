#!/usr/bin/env python3
"""Build a static Web Edition from the latest tested WebView frontend."""
from pathlib import Path
from shutil import copytree,copy2
import argparse,json,re,sys
p=argparse.ArgumentParser()
p.add_argument('source',help='WebView source directory containing frontend/')
p.add_argument('destination',help='static output directory')
a=p.parse_args()
src=Path(a.source)/'frontend'
out=Path(a.destination)
if not (src/'index.html').is_file() or not (src/'app.js').is_file():
    sys.exit('Missing WebView frontend/index.html or app.js')
copytree(src,out,dirs_exist_ok=True)
for name in ('web-only.js','web-only.css'):
    copy2(Path(__file__).resolve().parent/name,out/name)
html=(out/'index.html').read_text(encoding='utf-8')
html=html.replace('<title>Open IPTV Pro 4.23.38 — WebView</title>','<title>Open IPTV Pro — Web Online</title>')
html=html.replace('</head>','<link rel="stylesheet" href="web-only.css"/><link rel="manifest" href="manifest.webmanifest"/></head>',1)
html=html.replace('</body>','<script src="web-only.js"></script></body>',1)
(out/'index.html').write_text(html,encoding='utf-8')
(out/'.nojekyll').write_text('')
(out/'manifest.webmanifest').write_text(json.dumps({
    'name':'Open IPTV Pro — Web Online','short_name':'Open IPTV Pro','start_url':'./','scope':'./',
    'display':'standalone','background_color':'#07111c','theme_color':'#102030',
    'icons':[{'src':'assets/icon.png','type':'image/png','sizes':'any'}]
},ensure_ascii=False),encoding='utf-8')
missing=[]
for url in re.findall(r'<(?:script|link)[^>]+(?:src|href)="([^"]+)"',html):
    if not url.startswith(('https:','http:','#')) and not (out/url).exists():missing.append(url)
if missing:sys.exit('Missing static assets: '+', '.join(missing))
print('Web assets validated:',len(list(out.rglob('*'))))
