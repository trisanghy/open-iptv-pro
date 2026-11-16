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
# Web-only EPG downloader: native desktop frontend calls its own RPC.
# Replace exactly one fetchXML implementation so a future build never undoes
# the same-origin EPG fix when regenerating the Pages website.
features=out/'features.js'
js=features.read_text(encoding='utf-8')
start=js.find(' async function fetchXML(url){')
end=js.find(' async function refreshEPG(',start)
if start<0 or end<0:
    sys.exit('Cannot patch the EPG downloader: frontend API changed')
replacement=(Path(__file__).resolve().parent/'epg-fetch-function.txt').read_text(encoding='utf-8').rstrip()
js=js[:start]+replacement+'\n'+js[end:]
features.write_text(js,encoding='utf-8')

for name in ('web-only.js','web-only.css','resume-last.js','resume-last.css','browser-channel-check.js'):
    copy2(Path(__file__).resolve().parent/name,out/name)
# Patch the generated application from its WebView source on every deployment.
app_file=out/'app.js'
app_text=app_file.read_text(encoding='utf-8')
for old,new,label in [[" async function checkOne(url){if(!native){try{const r=await fetch(url,{method:'GET',signal:AbortSignal.timeout(7000)});if(!r.ok)return {status:'uncertain',reason:'HTTP '+r.status+' • Trình duyệt không đủ bằng chứng để kết luận Die'};return {status:'uncertain',reason:'Trình duyệt không kiểm tra được segment do CORS'};}catch(e){return {status:'uncertain',reason:'CORS / mạng: '+e.message};}}return await window.streamleaf.check(url);}\n"," async function checkOne(channel,task){\n  if(!native){\n   if(!window.OpenIPTVWebChannelCheck?.checkChannel)\n    return {status:'uncertain',reason:'Thiếu module kiểm tra Web. Hãy tải lại website.'};\n   return window.OpenIPTVWebChannelCheck.checkChannel(channel,{\n    links:currentAvailableLinks(channel),\n    timeoutMs:6500,\n    signal:task?.abortController?.signal,\n    makeVideo:()=>document.createElement('video')\n   });\n  }\n  return await window.streamleaf.check(channel.url);\n }\n","checkOne"],["if(!native)toast('Kiểm tra sâu chỉ có trên bản cài. Trình duyệt có thể bị giới hạn CORS.','warn');","if(!native)toast('Kiểm tra Web: đọc HLS, segment và link dự phòng khi nguồn cho phép. CORS có thể khiến một số kênh không xác minh được.','warn');","info toast"],["try{result=await checkOne(ch.url);}catch(e){result={status:'uncertain',reason:e.message};}","try{result=await checkOne(ch,t);}catch(e){if(t.cancel)break;result={status:'uncertain',reason:e.message};}if(t.cancel)break;","browser worker"],["if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;\n    t.done++;t.results.push","if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;\n    if(result.blocked)t.blocked++;\n    t.done++;t.results.push","blocked count"],["status.textContent=`● Sống ${task.alive}  ·  ● Die ${task.dead}  ·  ● Chưa rõ ${task.uncertain}`;","status.textContent=`● Sống ${task.alive}  ·  ● Die ${task.dead}  ·  ● Chưa rõ ${task.uncertain}`+(task.blocked?'  ·  CORS/mạng '+task.blocked:'');","status UI"],["t.alive=0;t.dead=0;t.uncertain=0;t.success=0;","t.alive=0;t.dead=0;t.uncertain=0;t.blocked=0;t.abortController=type==='check'&&!native?new AbortController():null;t.success=0;","initialize"],["if(t.running){t.cancel=true;textStatus(","if(t.running){t.cancel=true;if(type==='check')t.abortController?.abort();textStatus(","cancel"],["function taskEnd(type){const t=tasks[type];t.running=false;updateTaskUI(type);","function taskEnd(type){const t=tasks[type];t.running=false;t.abortController=null;updateTaskUI(type);","cleanup"],["label.textContent=item.status==='alive'?'Sống':item.status==='dead'?'Die':'Chưa rõ';","label.textContent=item.status==='alive'?'Sống':item.status==='dead'?'Die':/CORS|mạng/i.test(item.reason||'')?'CORS/mạng':'Chưa rõ';","status label"],["(type==='check'?'Kiểm tra link trực tiếp':'Chụp Snapshot')","(type==='check'?(native?'Kiểm tra link trực tiếp':'Kiểm tra Web HLS/DASH'):'Chụp Snapshot')","title"]]:
    if old not in app_text:
        sys.exit('Web checker patch missing: '+label)
    app_text=app_text.replace(old,new,1)
app_file.write_text(app_text,encoding='utf-8')

html=(out/'index.html').read_text(encoding='utf-8')
html=html.replace('<title>Open IPTV Pro 4.23.38 — WebView</title>','<title>Open IPTV Pro — Web Online</title>')
html=html.replace('<script src="app.js"></script>','<script src="browser-channel-check.js"></script><script src="app.js"></script>',1)
html=html.replace('<article class="settings-card" id="defaultBufferSettings">',"    <article class=\"settings-card\" id=\"webAutoResumeSettings\">\n      <h2>▶ Tự mở kênh khi vào website</h2>\n      <label class=\"check-line\" for=\"webAutoResumeLast\">\n        <input type=\"checkbox\" id=\"webAutoResumeLast\" checked/>\n        Tự động phát lại kênh xem cuối\n      </label>\n      <small id=\"webAutoResumeHint\" role=\"status\" aria-live=\"polite\">\n        Mặc định bật. Thử tự phát có tiếng; trình duyệt có thể yêu cầu nhấn Phát có tiếng một lần.\n      </small>\n    </article>\n"+'    <article class="settings-card" id="defaultBufferSettings">',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-only.css"/><link rel="stylesheet" href="resume-last.css"/><link rel="manifest" href="manifest.webmanifest"/></head>',1)
html=html.replace('</body>','<script src="web-only.js"></script><script src="resume-last.js"></script></body>',1)
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
