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

for name in ('web-only.js','web-only.css','resume-last.js','resume-last.css','browser-channel-check.js','web-volume.css','web-volume.js'):
    copy2(Path(__file__).resolve().parent/name,out/name)
# Patch the generated application from its WebView source on every deployment.
app_file=out/'app.js'
app_text=app_file.read_text(encoding='utf-8')
for old,new,label in [[" async function checkOne(url){if(!native){try{const r=await fetch(url,{method:'GET',signal:AbortSignal.timeout(7000)});if(!r.ok)return {status:'uncertain',reason:'HTTP '+r.status+' • Trình duyệt không đủ bằng chứng để kết luận Die'};return {status:'uncertain',reason:'Trình duyệt không kiểm tra được segment do CORS'};}catch(e){return {status:'uncertain',reason:'CORS / mạng: '+e.message};}}return await window.streamleaf.check(url);}\n"," async function checkOne(channel,task){\n  if(!native){\n   if(!window.OpenIPTVWebChannelCheck?.checkChannel)\n    return {status:'uncertain',reason:'Thiếu module kiểm tra Web. Hãy tải lại website.'};\n   return window.OpenIPTVWebChannelCheck.checkChannel(channel,{\n    links:currentAvailableLinks(channel),\n    timeoutMs:6500,\n    signal:task?.abortController?.signal,\n    makeVideo:()=>document.createElement('video')\n   });\n  }\n  return await window.streamleaf.check(channel.url);\n }\n","checkOne"],["if(!native)toast('Kiểm tra sâu chỉ có trên bản cài. Trình duyệt có thể bị giới hạn CORS.','warn');","if(!native)toast('Kiểm tra Web: đọc HLS, segment và link dự phòng khi nguồn cho phép. CORS có thể khiến một số kênh không xác minh được.','warn');","info toast"],["try{result=await checkOne(ch.url);}catch(e){result={status:'uncertain',reason:e.message};}","try{result=await checkOne(ch,t);}catch(e){if(t.cancel)break;result={status:'uncertain',reason:e.message};}if(t.cancel)break;","browser worker"],["if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;\n    t.done++;t.results.push","if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;\n    if(result.blocked)t.blocked++;\n    t.done++;t.results.push","blocked count"],["status.textContent=`● Sống ${task.alive}  ·  ● Die ${task.dead}  ·  ● Chưa rõ ${task.uncertain}`;","status.textContent=`● Sống ${task.alive}  ·  ● Die ${task.dead}  ·  ● Chưa rõ ${task.uncertain}`+(task.blocked?'  ·  CORS/mạng '+task.blocked:'');","status UI"],["t.alive=0;t.dead=0;t.uncertain=0;t.success=0;","t.alive=0;t.dead=0;t.uncertain=0;t.blocked=0;t.abortController=type==='check'&&!native?new AbortController():null;t.success=0;","initialize"],["if(t.running){t.cancel=true;textStatus(","if(t.running){t.cancel=true;if(type==='check')t.abortController?.abort();textStatus(","cancel"],["function taskEnd(type){const t=tasks[type];t.running=false;updateTaskUI(type);","function taskEnd(type){const t=tasks[type];t.running=false;t.abortController=null;updateTaskUI(type);","cleanup"],["label.textContent=item.status==='alive'?'Sống':item.status==='dead'?'Die':'Chưa rõ';","label.textContent=item.status==='alive'?'Sống':item.status==='dead'?'Die':/CORS|mạng/i.test(item.reason||'')?'CORS/mạng':'Chưa rõ';","status label"],["(type==='check'?'Kiểm tra link trực tiếp':'Chụp Snapshot')","(type==='check'?(native?'Kiểm tra link trực tiếp':'Kiểm tra Web HLS/DASH'):'Chụp Snapshot')","title"]]:
    if old not in app_text:
        sys.exit('Web checker patch missing: '+label)
    app_text=app_text.replace(old,new,1)
audio_old="store.current=chId;mediaInfo="
audio_new="store.current=chId;if(!native&&!opts.buffer){player.defaultMuted=store.autoEnableAudio===false;player.muted=store.autoEnableAudio===false;}mediaInfo="
if app_text.count(audio_old) != 1:
    sys.exit('Missing audio playback insertion point')
app_text=app_text.replace(audio_old,audio_new,1)
app_file.write_text(app_text,encoding='utf-8')

html=(out/'index.html').read_text(encoding='utf-8')
html=html.replace('<title>Open IPTV Pro 4.23.38 — WebView</title>','<title>Open IPTV Pro — Web Online</title>')
html=html.replace('<script src="app.js"></script>','<script src="browser-channel-check.js"></script><script src="app.js"></script>',1)
html=html.replace('<article class="settings-card" id="defaultBufferSettings">',"    <article class=\"settings-card\" id=\"webAutoResumeSettings\">\n      <h2>▶ Tự mở kênh khi vào website</h2>\n      <label class=\"check-line\" for=\"webAutoResumeLast\">\n        <input type=\"checkbox\" id=\"webAutoResumeLast\" checked/>\n        Tự động phát lại kênh xem cuối\n      </label>\n      <small id=\"webAutoResumeHint\" role=\"status\" aria-live=\"polite\">\n        Mặc định bật. Thử tự phát có tiếng; trình duyệt có thể yêu cầu nhấn Phát có tiếng một lần.\n      </small>\n    </article>\n"+'    <article class="settings-card" id="defaultBufferSettings">',1)
# Independent web-only default-on audio setting.
if html.count('<small id="webAutoResumeHint"') != 1:
    sys.exit('Missing Web resume card')
html=html.replace('      <small id="webAutoResumeHint"',"      <label class=\"check-line\" for=\"webAutoEnableAudio\">\n        <input type=\"checkbox\" id=\"webAutoEnableAudio\" checked/>\n        Tự động bật tiếng khi mở kênh\n      </label>\n      <small id=\"webAutoAudioHint\" role=\"status\" aria-live=\"polite\">\n        Mặc định bật. Nếu trình duyệt chặn tự phát có tiếng, hãy nhấn “Phát có tiếng” một lần.\n      </small>\n"+'      <small id="webAutoResumeHint"',1)
html=html.replace('Mặc định bật. Thử tự phát có tiếng; trình duyệt có thể yêu cầu nhấn Phát có tiếng một lần.','Mặc định bật. Tự mở lại kênh xem cuối khi truy cập website.',1)
# Relocate the SAME existing #volume slider out of the overflow popup.
# Do not create a duplicate ID; desktop's main app.js still persists volume.
if html.count("<div class=\"output-controls\" role=\"group\" aria-label=\"Thiết bị và toàn màn hình\">") != 1:
    sys.exit('Volume toolbar: expected one output-controls group')
if html.count("<label for=\"volume\">Âm lượng</label><input type=\"range\" min=\"0\" max=\"100\" value=\"80\" id=\"volume\" title=\"Âm lượng\"/>") != 1:
    sys.exit('Volume toolbar: expected one native #volume range')
html=html.replace("<div class=\"output-controls\" role=\"group\" aria-label=\"Thiết bị và toàn màn hình\">", "<div class=\"output-controls\" role=\"group\" aria-label=\"Thiết bị và toàn màn hình\">\n         <div class=\"web-volume-control\" role=\"group\" aria-label=\"Điều khiển âm lượng\"><button type=\"button\" id=\"webVolumeMute\" class=\"web-volume-mute\" aria-label=\"Tắt tiếng\" aria-pressed=\"false\" title=\"Tắt / bật tiếng\"><span aria-hidden=\"true\">🔊</span></button><label class=\"screen-reader-only\" for=\"volume\">Âm lượng</label><input type=\"range\" id=\"volume\" min=\"0\" max=\"100\" step=\"1\" value=\"80\" aria-label=\"Âm lượng\" title=\"Kéo để chỉnh âm lượng\" /></div>",1)
html=html.replace("<label for=\"volume\">Âm lượng</label><input type=\"range\" min=\"0\" max=\"100\" value=\"80\" id=\"volume\" title=\"Âm lượng\"/>",'',1)
html=html.replace('Công cụ khác: âm lượng, chụp ảnh, FFmpeg','Công cụ khác: chụp ảnh, FFmpeg')
html=html.replace('Âm lượng, chụp ảnh và FFmpeg','Chụp ảnh và FFmpeg')
# Web-only toolbar: physically remove the old ellipsis menu from the DOM.
# Keep nonvisible legacy buttons outside the control bar for existing app.js hooks.
# The desktop source is unaffected.
menu_pattern=r'\s*<details class="playback-extra" id="playbackExtra">[\s\S]*?</details>'
if len(re.findall(menu_pattern,html)) != 1:
    sys.exit('Expected exactly one old player ellipsis menu')
html=re.sub(menu_pattern,'',html,count=1)
html=html.replace('</head>','<link rel="stylesheet" href="web-only.css"/><link rel="stylesheet" href="resume-last.css"/><link rel="stylesheet" href="web-volume.css"/><link rel="manifest" href="manifest.webmanifest"/></head>',1)
html=html.replace('</body>','<script src="web-only.js"></script><script src="resume-last.js"></script><script src="web-volume.js"></script></body>',1)
if 'id="playbackExtra"' in html:
    sys.exit('Obsolete three-dots player menu still present')
if html.count('id="volume"') != 1:
    sys.exit('Web toolbar must have one volume range')
html=html.replace('</body>',"<div id=\"webLegacyPlayerActionHooks\" hidden aria-hidden=\"true\" style=\"display:none!important\"><button type=\"button\" id=\"shotBtn\" hidden tabindex=\"-1\"></button><button type=\"button\" id=\"tryFfmpegBtn\" hidden tabindex=\"-1\"></button></div>"+'\n</body>',1)
if html.count('id="shotBtn"') != 1 or html.count('id="tryFfmpegBtn"') != 1:
    sys.exit('Player legacy hooks must remain singular for event bindings')
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
