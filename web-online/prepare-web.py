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

for name in ('web-only.js','web-only.css','resume-last.js','resume-last.css','browser-channel-check.js','web-autoplay.js','cloud-core.js','cloud-sync.js','cloud-sync.css','web-volume.css','web-volume.js','web-mobile-player.css','web-mobile-player.js'):
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
web_autoplay_old="  const startPlaying=()=>{\n   if(!isCurrent())return;\n   const promise=player.play();\n   if(promise?.catch)promise.catch(e=>{\n    if(!isCurrent()||e?.name==='AbortError')return;\n    if(e?.name==='NotAllowedError'){\n     $('#streamInfo').textContent='Nhấn Phát để tiếp tục';\n     toast('Trình phát yêu cầu thao tác Phát của người dùng','warn');\n    }else recoverPlayback(generation,e.message||'Lỗi video',attempt);\n   });\n  };\n"
web_autoplay_new="  const startPlaying=()=>{\n   if(!isCurrent())return;\n   // Chrome/Safari may block audible autoplay on first visit. Try sound\n   // first, then muted autoplay so the picture starts automatically.\n   if(!native && window.OpenIPTVWebAutoplay?.start){\n    void window.OpenIPTVWebAutoplay.start(player,{\n     isCurrent,\n     allowMutedFallback:true,\n     onMuted:()=>{\n      if(!isCurrent())return;\n      $('#streamInfo').textContent='● Đang phát (tắt tiếng)';\n      document.dispatchEvent(new CustomEvent('openiptv:autoplay-muted',{detail:{channelId:current?.id}}));\n     },\n     onBlocked:()=>{\n      if(!isCurrent()||!player.paused)return;\n      $('#streamInfo').textContent='Nhấn Phát để tiếp tục';\n      document.dispatchEvent(new CustomEvent('openiptv:autoplay-blocked',{detail:{channelId:current?.id}}));\n     },\n     onError:e=>{if(isCurrent())recoverPlayback(generation,e?.message||'Lỗi video',attempt);}\n    });\n    return;\n   }\n   const promise=player.play();\n   if(promise?.catch)promise.catch(e=>{\n    if(!isCurrent()||e?.name==='AbortError')return;\n    if(e?.name==='NotAllowedError'){\n     $('#streamInfo').textContent='Nhấn Phát để tiếp tục';\n     toast('Trình phát yêu cầu thao tác Phát của người dùng','warn');\n    }else recoverPlayback(generation,e.message||'Lỗi video',attempt);\n   });\n  };\n"
if app_text.count(web_autoplay_old) != 1:
    sys.exit('Web autoplay bootstrap changed in upstream app.js')
app_text=app_text.replace(web_autoplay_old,web_autoplay_new,1)
sync_event_before="function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));return true;}"
sync_event_after="function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));if(!native)document.dispatchEvent(new CustomEvent('openiptv:local-saved'));return true;}"
if app_text.count(sync_event_before) != 1:
    sys.exit('Web cloud: upstream state-save method changed')
app_text=app_text.replace(sync_event_before,sync_event_after,1)
app_file.write_text(app_text,encoding='utf-8')

html=(out/'index.html').read_text(encoding='utf-8')
html=html.replace('<title>Open IPTV Pro 4.23.38 — WebView</title>','<title>Open IPTV Pro — Web Online</title>')
html=html.replace('<title>Open IPTV Pro — Web Online</title>','<title>Open IPTV Pro — Web Online</title>'+ "<link rel=\"icon\" type=\"image/png\" sizes=\"any\" href=\"assets/icon.png?v=20261116a\"/><link rel=\"apple-touch-icon\" href=\"assets/icon.png?v=20261116a\"/>",1)
html=html.replace('<script src="app.js"></script>','<script src="browser-channel-check.js"></script><script src="web-autoplay.js"></script><script src="app.js"></script>',1)
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
html=re.sub(menu_pattern,'\n         '+"<div id=\"webLegacyPlayerActionHooks\" hidden aria-hidden=\"true\" style=\"display:none!important\"><button type=\"button\" id=\"shotBtn\" hidden tabindex=\"-1\"></button><button type=\"button\" id=\"tryFfmpegBtn\" hidden tabindex=\"-1\"></button></div>",html,count=1)
# Cloud login is optional. Keep a visible disabled/guest state without config.
if html.count("    <article class=\"settings-card\" id=\"defaultBufferSettings\">") != 1:
    sys.exit('Web cloud: Settings insertion point changed')
html=html.replace("    <article class=\"settings-card\" id=\"defaultBufferSettings\">","    <article class=\"settings-card\" id=\"cloudSyncCard\">\n      <h2>☁ Tài khoản &amp; Đồng bộ đám mây</h2>\n      <p id=\"cloudAccount\">Chế độ khách · lưu trên thiết bị</p>\n      <p class=\"hint\" id=\"cloudStatus\" role=\"status\" aria-live=\"polite\">Đang kiểm tra cấu hình đồng bộ…</p>\n      <div class=\"cloud-sync-actions\">\n        <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLoginGoogle\" hidden>Đăng nhập Google</button>\n        <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLoginGithub\" hidden>Đăng nhập GitHub</button>\n        <button type=\"button\" class=\"btn btn-primary\" id=\"cloudSyncNow\" hidden>Đồng bộ ngay</button>\n        <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLogout\" hidden>Đăng xuất</button>\n      </div>\n      <div id=\"cloudSyncConflict\" class=\"cloud-sync-conflict\" hidden>\n        <p id=\"cloudConflictReason\"></p>\n        <div class=\"cloud-sync-actions\">\n          <button type=\"button\" class=\"btn btn-primary\" id=\"cloudUseRemote\">Dùng dữ liệu đám mây</button>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudUseLocal\">Giữ dữ liệu máy &amp; tải lên</button>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLater\">Để sau</button>\n        </div>\n      </div>\n      <p class=\"hint\">Mỗi tài khoản chỉ truy cập được dữ liệu của mình. Không đăng nhập vẫn sử dụng bình thường. Link M3U có token sẽ được lưu trong tài khoản Supabase của bạn.</p>\n    </article>\n"+"    <article class=\"settings-card\" id=\"defaultBufferSettings\">",1)
# Put Cloud at the VERY TOP of Settings, as a visible full-width card,
# rather than inside the auto-collapsing settings accordion.
cloud_card_match=re.search(r'\s*<article class="settings-card" id="cloudSyncCard">[\s\S]*?</article>',html)
if cloud_card_match is None:
    sys.exit('Cloud settings card not found for relocation')
cloud_card=cloud_card_match.group(0).lstrip()
html=html.replace(cloud_card_match.group(0),'',1)
settings_at=html.find('<section id="page-settings"')
settings_grid_at=html.find('<div class="settings-grid">',settings_at)
if settings_at<0 or settings_grid_at<0:
    sys.exit('Settings grid missing')
html=html[:settings_grid_at]+'\n    '+cloud_card+'\n    '+html[settings_grid_at:]
# Add persistent account shortcut in top bar, including on the TV page.
topbar_old="<div class=\"top-actions\"><span class=\"state-mark\" id=\"activeSourceTag\">Chưa có nguồn</span>"
topbar_new="<div class=\"top-actions\"><button type=\"button\" class=\"btn btn-subtle\" id=\"cloudAccountQuick\" title=\"Đăng nhập và đồng bộ dữ liệu\">☁ Tài khoản</button><span class=\"state-mark\" id=\"activeSourceTag\">Chưa có nguồn</span>"
if html.count(topbar_old)!=1:
    sys.exit('Cloud topbar shortcut insertion point changed')
html=html.replace(topbar_old,topbar_new,1)
email_anchor="<p class=\"hint\" id=\"cloudStatus\" role=\"status\" aria-live=\"polite\">Đang kiểm tra cấu hình đồng bộ…</p>"
if html.count(email_anchor)!=1:
    sys.exit('Cloud email form anchor not found')
html=html.replace(email_anchor,email_anchor+'\n'+"      <form id=\"cloudEmailForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudEmailInput\">Đăng nhập bằng email</label>\n        <div class=\"cloud-email-input-line\">\n          <input id=\"cloudEmailInput\" type=\"email\" autocomplete=\"email\" placeholder=\"ten@example.com\" required/>\n          <button type=\"submit\" class=\"btn btn-primary\" id=\"cloudEmailSend\">Gửi liên kết đăng nhập</button>\n        </div>\n        <p class=\"hint\">Nhận liên kết qua email. Nếu liên kết dẫn tới localhost, gửi lại email rồi sao chép liên kết mới vào ô xác thực bên dưới, không nhấp vào liên kết.</p>\n      </form>\n      <div id=\"cloudOtpForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudOtpCode\">Mã xác thực từ email (nếu có)</label>\n        <div class=\"cloud-email-input-line\">\n          <input id=\"cloudOtpCode\" inputmode=\"numeric\" autocomplete=\"one-time-code\" maxlength=\"8\" placeholder=\"Mã 6–8 số\"/>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudOtpVerify\">Xác thực</button>\n        </div>\n      </div>\n      <p id=\"cloudAuthProviders\" class=\"hint\" aria-live=\"polite\"></p>\n",1)
link_anchor="<p id=\"cloudAuthProviders\" class=\"hint\" aria-live=\"polite\"></p>"
if html.count(link_anchor)!=1:
    sys.exit('Cloud link form anchor missing')
html=html.replace(link_anchor,"      <div id=\"cloudLinkForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudLinkInput\">Nếu liên kết trong email không quay về website, hãy dán liên kết vào đây</label>\n        <div class=\"cloud-email-input-line\">\n          <input id=\"cloudLinkInput\" type=\"url\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"Liên kết xác nhận của Supabase\"/>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLinkVerify\">Xác thực liên kết</button>\n        </div>\n        <p class=\"hint\">Liên kết chỉ được dùng một lần và không được lưu vào playlist hoặc đám mây.</p>\n      </div>\n"+link_anchor,1)
html=html.replace('</head>','<link rel="stylesheet" href="web-only.css"/><link rel="stylesheet" href="resume-last.css"/><link rel="stylesheet" href="web-volume.css"/><link rel="stylesheet" href="cloud-sync.css"/><link rel="manifest" href="manifest.webmanifest"/></head>',1)
html=html.replace('<script src="app.js"></script>','<script src="web-mobile-player.js?v=mobilecompact-20261118d"></script><script src="app.js"></script>',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-mobile-player.css?v=mobilecompact-20261118d"/></head>',1)
html=html.replace('</body>','<script src="supabase-sdk.js"></script><script src="cloud-core.js"></script><script src="web-only.js"></script><script src="resume-last.js"></script><script src="web-volume.js"></script><script src="cloud-sync.js"></script></body>',1)
if 'id="playbackExtra"' in html:
    sys.exit('Obsolete three-dots player menu still present')
if html.count('id="volume"') != 1:
    sys.exit('Web toolbar must have one volume range')
if html.count('id="shotBtn"') != 1 or html.count('id="tryFfmpegBtn"') != 1:
    sys.exit('Player legacy hooks must remain singular for event bindings')
# v4.23.60 public Web guide — keep this browser-only, never ship Electron IPC.
guide_source=Path(__file__).resolve().parent/'huong-dan.html'
if not guide_source.is_file():
    sys.exit('Missing Web help page huong-dan.html')
copy2(guide_source,out/'huong-dan.html')
topbar='<div class="top-actions">'
if html.count(topbar)!=1:
    sys.exit('Cannot add Web user guide link: topbar changed')
html=html.replace(topbar,topbar+'<a class="btn btn-subtle" href="huong-dan.html" target="_blank" rel="noopener noreferrer" title="Tính năng và hướng dẫn Open IPTV Pro bản Web">📖 Hướng dẫn Web</a>',1)
if html.count('<title>Open IPTV Pro — Web Online</title>')!=1:
    sys.exit('Browser page title changed')
html=html.replace('<title>Open IPTV Pro — Web Online</title>',
 '<title>Open IPTV Pro — Xem IPTV Online Miễn Phí</title><meta name="description" content="Open IPTV Pro Web Online: mở tệp và URL M3U, xem HLS/DASH, yêu thích, EPG, PiP và lưu dữ liệu trong trình duyệt. Hướng dẫn sử dụng và link tải bản desktop v4.23.60."/>',1)
if 'href="huong-dan.html"' not in html:
    sys.exit('Public Web instructions are not linked')

(out/'index.html').write_text(html,encoding='utf-8')
(out/'.nojekyll').write_text('')
(out/'manifest.webmanifest').write_text(json.dumps({
    'name':'Open IPTV Pro — Web Online','short_name':'Open IPTV Pro','start_url':'./','scope':'./',
    'display':'standalone','background_color':'#07111c','theme_color':'#102030',
    'icons':[{'src':'assets/icon.png','type':'image/png','sizes':'any'}]
},ensure_ascii=False),encoding='utf-8')
missing=[]
for url in re.findall(r'<(?:script|link)[^>]+(?:src|href)="([^"]+)"',html):
    if not url.startswith(('https:','http:','#')) and not (out/url.split('?',1)[0].split('#',1)[0]).exists():missing.append(url)
if missing:sys.exit('Missing static assets: '+', '.join(missing))
print('Web assets validated:',len(list(out.rglob('*'))))
