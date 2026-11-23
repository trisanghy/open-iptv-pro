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
# Always ship the reviewed Web-only localization engine, not an outdated WebView copy.
copy2(Path(__file__).resolve().parent.parent/'i18n.js',out/'i18n.js')
# Preserve the complete native Web catalog in any regenerated browser bundle.
copy2(Path(__file__).resolve().parent.parent/'web-native-complete.js',out/'web-native-complete.js')
# Keep Web translations isolated from Electron/Rust renderer resources.
copy2(Path(__file__).resolve().parent/'web-language-supplement.js',out/'web-language-supplement.js')
copy2(Path(__file__).resolve().parent/'web-generated-locales.js',out/'web-generated-locales.js')

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
js=js.replace('const xml=await fetchXML(source.url);const parsed=guideLib.parse(xml,ctx.getChannels());','const parsed=await readFreshGuide(source.url,ctx.getChannels());')
if 'const parsed=await readFreshGuide(source.url,ctx.getChannels());' not in js: sys.exit('Cannot install fresh XMLTV reader')
# Preserve mobile's always-expanded channel list when rebuilding WebView sources.
# Take the reviewed Web-only function from the live project's features.js.
web_features=(Path(__file__).resolve().parent.parent/'features.js').read_text(encoding='utf-8')
# Restore the reviewed Web-only EPG source policy when WebView builds regenerate this file.
source_start=web_features.find(' const defaultSources=[')
source_end=web_features.find(' const presetEPGURLs=',source_start)
target_start=js.find(' const defaultSources=[')
target_end=js.find(' const presetEPGURLs=',target_start)
if min(source_start,source_end,target_start,target_end)<0:
    sys.exit('Cannot transplant Web-only EPG source settings')
js=js[:target_start]+web_features[source_start:source_end]+js[target_end:]
# Ensure a WebView rebuild cannot restore the old oversized IndexedDB cache.
cache_src=web_features.find(' async function encodeGuideSnapshot(')
cache_src_end=web_features.find(' function rgbToHsv(',cache_src)
cache_dst=js.find(' function openGuideDatabase(){')
cache_dst_end=js.find(' function rgbToHsv(',cache_dst)
if min(cache_src,cache_src_end,cache_dst,cache_dst_end)<0:
    sys.exit('Cannot copy atomic compressed EPG cache into Web build')
js=js[:cache_dst]+web_features[cache_src:cache_src_end]+js[cache_dst_end:]
# Rebuilds must preserve large Web XMLTV guides and their persistent cache.
for block_start,block_end,label in (
    (' let guide={names:{},programmes:[]', ' function rgbToHsv(', 'IndexedDB guide cache'),
    (' async function refreshEPG(', ' function renderGuidePages()', 'uncapped EPG merge/import'),
):
    reviewed_start=web_features.find(block_start)
    reviewed_end=web_features.find(block_end,reviewed_start)
    built_start=js.find(block_start)
    built_end=js.find(block_end,built_start)
    if min(reviewed_start,reviewed_end,built_start,built_end)<0:
        sys.exit('Cannot preserve '+label+' during WebView build')
    js=js[:built_start]+web_features[reviewed_start:reviewed_end]+js[built_end:]
if js.count('renderSources();renderGuidePages();')!=1:
    sys.exit('Cannot enable IndexedDB EPG restore after WebView build')
js=js.replace('renderSources();renderGuidePages();',
              'renderSources();renderGuidePages();void restoreGuideCache();',1)
marker=' function isMobileChannelPanel(){'
patch_start=web_features.find(marker)
patch_end=web_features.find(' function updateAppearance(persist=true){',patch_start)
legacy_start=js.find(' function updateChannelPanelVisibility(persist=true){')
legacy_end=js.find(' function updateAppearance(persist=true){',legacy_start)
if min(patch_start,patch_end,legacy_start,legacy_end)<0:
    sys.exit('Cannot protect mobile channel list visibility after WebView build')
js=js[:legacy_start]+web_features[patch_start:patch_end]+js[legacy_end:]
for previous,next_value in (
 ("$('#channelPanelHideBtn')?.addEventListener('click',()=>{config.channelPanelVisible=false;updateChannelPanelVisibility();});",
  "$('#channelPanelHideBtn')?.addEventListener('click',()=>{if(isMobileChannelPanel())return;config.channelPanelVisible=false;updateChannelPanelVisibility();});"),
 ("$('#channelPanelShowBtn')?.addEventListener('click',()=>{config.channelPanelVisible=true;updateChannelPanelVisibility();});",
  "$('#channelPanelShowBtn')?.addEventListener('click',()=>{if(isMobileChannelPanel())return;config.channelPanelVisible=true;updateChannelPanelVisibility();});"),
 ("window.addEventListener('resize',updateSidebarEdge);",
  "window.addEventListener('resize',updateSidebarEdge);\n window.addEventListener('resize',()=>updateChannelPanelVisibility(false));\n window.addEventListener('pageshow',()=>updateChannelPanelVisibility(false));\n window.addEventListener('orientationchange',()=>updateChannelPanelVisibility(false));")
):
    if js.count(previous)!=1: sys.exit('WebView channel visibility hook changed')
    js=js.replace(previous,next_value,1)
# Preserve Web player film/episode description renderer when building from WebView.
epg_now_start=' function renderNow(){'
epg_now_end=' function renderEPG(){'
if any(x.count(epg_now_start)!=1 or x.count(epg_now_end)!=1 for x in (js,web_features)):
    sys.exit('EPG player renderNow source changed')
js=js[:js.index(epg_now_start)]+web_features[web_features.index(epg_now_start):web_features.index(epg_now_end)]+js[js.index(epg_now_end):]
# Web-only EPG: local 00:00–24:00 day, collapsed channels, no Web record buttons.
day_source=' const expandedEPGChannels=new Set();'
day_end=' async function fetchXML('
if web_features.count(day_source)!=1 or web_features.count(day_end)!=1 or js.count(day_end)!=1 or js.count(' function renderEPG(){')!=1:
    sys.exit('Web EPG daily renderer anchors changed')
js=js[:js.index(' function renderEPG(){')]+web_features[web_features.index(day_source):web_features.index(day_end)]+js[js.index(day_end):]
# Web-only EPG performance: skip hidden-tab DOM and duplicate minute refresh.
epg_lazy_old=" function renderGuidePages(){renderNow();renderEPG();"
epg_lazy_new=" function renderGuidePages(){renderNow();if($('#page-epg')?.classList.contains('active-page'))renderEPG();"
if js.count(epg_lazy_old)!=1:sys.exit('Web performance EPG lazy patch drift')
js=js.replace(epg_lazy_old,epg_lazy_new,1)
epg_search_old="$('#epgSearch').addEventListener('input',renderEPG);"
epg_search_new="let pendingEPGSearch=0;$('#epgSearch').addEventListener('input',()=>{if(pendingEPGSearch)cancelAnimationFrame(pendingEPGSearch);pendingEPGSearch=requestAnimationFrame(()=>{pendingEPGSearch=0;renderEPG();});});"
if js.count(epg_search_old)!=1:sys.exit('Web performance EPG filter patch drift')
js=js.replace(epg_search_old,epg_search_new,1)
timer_old=" window.setInterval(()=>{if($('#page-tv')?.classList.contains('active-page'))renderNow();},60_000);"
timer_extra=" window.setInterval(()=>{renderNow();if(document.querySelector('#page-epg').classList.contains('active-page'))renderEPG();},60000);"
timer_new=""" window.setInterval(()=>{
  if(document.visibilityState==='hidden')return;
  if($('#page-tv')?.classList.contains('active-page'))renderNow();
  else if($('#page-epg')?.classList.contains('active-page'))renderGuidePages();
 },60000);
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  if($('#page-tv')?.classList.contains('active-page'))renderNow();
  else if($('#page-epg')?.classList.contains('active-page'))renderGuidePages();
 });"""
if js.count(timer_old)!=1 or js.count(timer_extra)!=1:sys.exit('Web performance EPG timer patch drift')
js=js.replace(timer_old,timer_new,1).replace(timer_extra,'',1)

features.write_text(js,encoding='utf-8')

for name in ('web-only.js','web-only.css','resume-last.js','resume-last.css','browser-channel-check.js','web-autoplay.js','cloud-core.js','cloud-sync.js','cloud-sync.css','web-volume.css','web-volume.js','web-mobile-player.css','web-mobile-player.js','web-player-icons.css','web-player-icons.js','web-tv-wide.css','web-mobile-controls-polish.css','web-mobile-volume.js','web-mobile-volume.css','web-desktop-download.css','web-desktop-download.js','web-recent-channels.js','web-compact-toolbar.css','web-snapshot-batch.js','web-background-audio.js','web-background-audio.css','web-ios-audio-recovery.js','web-ios-audio-recovery.css','web-fullscreen-controls.css','web-fullscreen-controls.js','web-mobile-tablet-controls.css','web-epg-day.css','web-smart-discovery-compact.css','web-source-repair-layout.css','web-smart-discovery.js','smart-discovery-ui.js','source-use-consent-v1.js','source-use-consent-v1.css'):
    source=Path(__file__).resolve().parent/name
    if not source.is_file():source=Path(__file__).resolve().parent.parent/name
    copy2(source,out/name)
# Keep Web's multi-source fallback matcher even if the originating WebView
# frontend has an older name-only matcher. Do not change Electron/Rust source.
copy2(Path(__file__).resolve().parent.parent/'epg.js',out/'epg.js')
copy2(Path(__file__).resolve().parent.parent/'source-edit.js',out/'source-edit.js')
copy2(Path(__file__).resolve().parent.parent/'advanced-core.js',out/'advanced-core.js')
for name in ('advanced.js','collector.js'):
    copy2(Path(__file__).resolve().parent.parent/name,out/name)
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
web_autoplay_new="  const startPlaying=()=>{\n   if(!isCurrent())return;\n   // Chrome/Safari may block audible autoplay on first visit. Try sound\n   // first, then muted autoplay so the picture starts automatically.\n   if(window.OpenIPTVWebAutoplay?.start){\n    void window.OpenIPTVWebAutoplay.start(player,{\n     isCurrent,\n     allowMutedFallback:true,\n     onMuted:()=>{\n      if(!isCurrent())return;\n      $('#streamInfo').textContent='● Đang phát (tắt tiếng)';\n      document.dispatchEvent(new CustomEvent('openiptv:autoplay-muted',{detail:{channelId:current?.id}}));\n     },\n     onBlocked:()=>{\n      if(!isCurrent()||!player.paused)return;\n      $('#streamInfo').textContent='Nhấn Phát để tiếp tục';\n      document.dispatchEvent(new CustomEvent('openiptv:autoplay-blocked',{detail:{channelId:current?.id}}));\n     },\n     onError:e=>{if(isCurrent())recoverPlayback(generation,e?.message||'Lỗi video',attempt);}\n    });\n    return;\n   }\n   const promise=player.play();\n   if(promise?.catch)promise.catch(e=>{\n    if(!isCurrent()||e?.name==='AbortError')return;\n    if(e?.name==='NotAllowedError'){\n     $('#streamInfo').textContent='Nhấn Phát để tiếp tục';\n     toast('Trình phát yêu cầu thao tác Phát của người dùng','warn');\n    }else recoverPlayback(generation,e.message||'Lỗi video',attempt);\n   });\n  };\n"
if app_text.count(web_autoplay_old) != 1:
    sys.exit('Web autoplay bootstrap changed in upstream app.js')
app_text=app_text.replace(web_autoplay_old,web_autoplay_new,1)
sync_event_before="function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));return true;}"
sync_event_after="function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));if(!native)document.dispatchEvent(new CustomEvent('openiptv:local-saved'));return true;}"
if app_text.count(sync_event_before) != 1:
    sys.exit('Web cloud: upstream state-save method changed')
app_text=app_text.replace(sync_event_before,sync_event_after,1)
# Keep import, refresh and merge on the same Web playlist reader.
web_app=(Path(__file__).resolve().parent.parent/'app.js').read_text(encoding='utf-8')
for start,end in [(' async function openURL()', ' async function replaceURLSource'),(' async function modalSubmit()', '\n function '),(' function channelView()', ' function renderList(')]:
    left=app_text.index(start)
    right=app_text.index(end,left)
    first=web_app.index(start)
    app_text=app_text[:left]+web_app[first:web_app.index(end,first)]+app_text[right:]
marker='window.IPTVState=Object.freeze({'
assert app_text.count(marker)==1
app_text=app_text.replace(marker,marker+'readSourceURL,',1)
# Keep the recent channels filter and automatic watch history in regenerated Web.
# Never edit Electron source; copy only the approved browser behavior.
for old,new in (
 (" const favCore=window.OpenIPTVFavorites;"," const favCore=window.OpenIPTVFavorites;\n const recentCore=window.OpenIPTVRecentChannels;"),
 (" if(!Array.isArray(store.channels))store.channels=[];"," if(!Array.isArray(store.channels))store.channels=[];\n store.recentChannelIds=recentCore.normalize(store.recentChannelIds);"),
 ("store.current=chId;","store.current=chId;store.recentChannelIds=recentCore.push(store.recentChannelIds,chId);"),
 ("const orderedGroups=groupNames().filter(g=>showEmpty||groups.has(g)).concat([...groups.keys()].filter(g=>!groupNames().includes(g)));","const orderedGroups=filter==='recent'?[...groups.keys()]:groupNames().filter(g=>showEmpty||groups.has(g)).concat([...groups.keys()].filter(g=>!groupNames().includes(g)));"),
 ("const entries=groups.get(group)||[],collapsed=store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();","const entries=groups.get(group)||[],collapsed=filter!=='recent'&&store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();"),
 ("header.addEventListener('click',()=>{const pos=preserveListScroll();if(store.collapsedGroups.includes(group))","header.addEventListener('click',()=>{if(filter==='recent')return;const pos=preserveListScroll();if(store.collapsedGroups.includes(group))")
):
    if app_text.count(old)!=1:sys.exit('Recent WebView patch marker not found: '+old[:80])
    app_text=app_text.replace(old,new,1)
old_empty="if(!result.length){updateSelectionBar();target.innerHTML=`<div class=\\\"empty-list\\\">${store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}</div>`;restoreListScroll(prev);return;}"
# Apply a short anchor rather than changing the source's HTML structure.
empty_anchor="${store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}"
if app_text.count(empty_anchor)!=1:sys.exit('Recent filter empty state changed in WebView build')
app_text=app_text.replace(empty_anchor,"${filter==='recent'?'Chưa có kênh vừa xem. Mở một kênh để bắt đầu lưu lịch sử.':store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}",1)

# Keep Web snapshot's unlimited, cancellable queue in regenerated WebView builds.
# Copy only the snapshotAll function from the browser app, not Electron or Rust code.
snapshot_start=' async function snapshotAll(){'
snapshot_end=' async function exportFile(){'
if app_text.count(snapshot_start)!=1 or web_app.count(snapshot_start)!=1:
    sys.exit('Web snapshot source function missing')
if app_text.count(snapshot_end)!=1 or web_app.count(snapshot_end)!=1:
    sys.exit('Web snapshot function end missing')
app_text=app_text[:app_text.index(snapshot_start)]+web_app[web_app.index(snapshot_start):web_app.index(snapshot_end,web_app.index(snapshot_start))]+app_text[app_text.index(snapshot_end,app_text.index(snapshot_start)):]

# Preserve Web favorite card tap-to-play when rebuilding from old WebView sources.
fav_start=' function renderFavorites(){'
fav_end=' function updatePlayerFavorite(){'
if app_text.count(fav_start)!=1 or web_app.count(fav_start)!=1:
    sys.exit('Favorite renderer missing in source or WebView')
if app_text.count(fav_end)!=1 or web_app.count(fav_end)!=1:
    sys.exit('Favorite renderer end missing')
app_text=app_text[:app_text.index(fav_start)]+web_app[web_app.index(fav_start):web_app.index(fav_end,web_app.index(fav_start))]+app_text[app_text.index(fav_end,app_text.index(fav_start)):]

# Preserve the Web-only background audio route when regenerating from an older
# desktop WebView frontend. Do not edit or ship changes to Electron/Rust.
audio_begin=' function suspendVideoForBackground(){'
audio_play=' async function playChannel(chId,override=null,opts={}){'
audio_end=' function updateTaskUI('
if web_app.count(audio_begin)!=1 or web_app.count(audio_play)!=1 or web_app.count(audio_end)!=1:
    sys.exit('Background audio Web source functions changed')
if app_text.count(audio_play)!=1 or app_text.count(audio_end)!=1:
    sys.exit('Background audio WebView function anchors changed')
app_text=app_text[:app_text.index(audio_play)]+web_app[web_app.index(audio_begin):web_app.index(audio_end,web_app.index(audio_begin))]+app_text[app_text.index(audio_end,app_text.index(audio_play)):]
for previous,updated in (
 ("player.addEventListener('playing',()=>{clearTimeout(failoverTimer);",
  "player.addEventListener('playing',()=>{if(window.OpenIPTVBackgroundAudio?.active){player.pause();return;}clearTimeout(failoverTimer);"),
 ("player.addEventListener('pause',()=>{clearTimeout(stallTimer);$('#playBtn').textContent='▶';});",
  "player.addEventListener('pause',()=>{clearTimeout(stallTimer);if(!window.OpenIPTVBackgroundAudio?.active)$('#playBtn').textContent='▶';});"),
 ("void playChannel(ch.id,null,{manualUrl:url,mode:'live'});",
  "void playChannel(ch.id,null,{manualUrl:url,mode:'live',audioOnly:!!window.OpenIPTVBackgroundAudio?.active});"),
 ("playChannel,stopPlayer,refreshManualLinks:",
  "playChannel,switchChannel,suspendVideoForBackground,stopPlayer,refreshManualLinks:")
):
    if app_text.count(previous)!=1:sys.exit('Background audio build patch drift: '+previous[:95])
    app_text=app_text.replace(previous,updated,1)
# Web-only performance: avoid full render() on every route.
nav_call='render();window.IPTVExtras?.onPage?.(p);'
nav_marker=' function closeModal(){'
nav_start=' function renderOnNavigation(p){'
if app_text.count(nav_call)!=1 or app_text.count(nav_marker)!=1 or web_app.count(nav_start)!=1:
    sys.exit('Web performance route patch drift')
app_text=app_text.replace(nav_call,'renderOnNavigation(p);window.IPTVExtras?.onPage?.(p);',1)
nav_function=web_app[web_app.index(nav_start):web_app.index(nav_marker,web_app.index(nav_start))]
app_text=app_text.replace(nav_marker,nav_function+nav_marker,1)
channel_search_old="$('#searchBox').addEventListener('input',renderList);"
channel_search_new="let pendingChannelSearch=0;$('#searchBox').addEventListener('input',()=>{if(pendingChannelSearch)cancelAnimationFrame(pendingChannelSearch);pendingChannelSearch=requestAnimationFrame(()=>{pendingChannelSearch=0;renderList();});});"
if app_text.count(channel_search_old)!=1:sys.exit('Web performance search patch drift')
app_text=app_text.replace(channel_search_old,channel_search_new,1)


# Web startup fast path: keep the built WebView source in sync with the
# reviewed Web-only decoder loading and offscreen-page policy.
# This patch never touches Electron/Rust or the upstream WebView frontend.
reviewed_load=re.search(r'(?m)^ async function loadHlsLib\(\)\{[^\n]*\}',web_app)
built_load=re.search(r'(?m)^ async function loadHlsLib\(\)\{[^\n]*\}',app_text)
if reviewed_load is None or built_load is None:
    sys.exit('Web fastload HLS loader anchor changed')
app_text=app_text[:built_load.start()]+reviewed_load.group(0)+app_text[built_load.end():]
dash_old='   const Dash=window.dashjs;'
dash_new="   const Dash=window.dashjs||(native?null:await window.OpenIPTVPlaybackLibs?.load?.('dash'));\n   if(!isCurrent())return;"
if app_text.count(dash_old)!=1:sys.exit('Web fastload DASH anchor changed')
app_text=app_text.replace(dash_old,dash_new,1)
render_sig=' function render(preserveScroll=false){'
render_old='  renderList(preserveScroll);renderSources();renderShots();renderFavorites();renderFolders();'
startup_call=' wire();render();if(upgradedChecker)save();'
if any(app_text.count(item)!=1 for item in (render_sig,render_old,startup_call)):
    sys.exit('Web fastload hidden-page startup anchors changed')
app_text=app_text.replace(render_sig,' function render(preserveScroll=false,startup=false){',1)
app_text=app_text.replace(render_old,
 '  renderList(preserveScroll);if(!startup){renderSources();renderShots();renderFavorites();renderFolders();}',1)
app_text=app_text.replace(startup_call,' wire();render(false,true);if(upgradedChecker)save();',1)

# Keep the reviewed Web TS/FLV transport in future regenerated builds.
play_start=' function stopPlayer(){'
play_end=' function suspendVideoForBackground(){'
if not all(x in app_text and x in web_app for x in (play_start,play_end)):
    sys.exit('Web mpegts playback regeneration anchors changed')
app_text=(app_text[:app_text.index(play_start)]+web_app[web_app.index(play_start):web_app.index(play_end,web_app.index(play_start))]+app_text[app_text.index(play_end,app_text.index(play_start)):])
app_file.write_text(app_text,encoding='utf-8')
copy2(Path(__file__).resolve().parent.parent/'mpegts.min.js',out/'mpegts.min.js')
(out/'licenses').mkdir(parents=True,exist_ok=True)
copy2(Path(__file__).resolve().parent.parent/'licenses/mpegts-Apache-2.0.txt',out/'licenses/mpegts-Apache-2.0.txt')
copy2(Path(__file__).resolve().parent.parent/'THIRD_PARTY_NOTICES.md',out/'THIRD_PARTY_NOTICES.md')

html=(out/'index.html').read_text(encoding='utf-8')
# Remove redundant Quick Tools capture button only; preserve Snapshot page,
# single-channel shotBtn and batch-capture workflows.
quick_shot_current="<button class=\"quick-btn\" id=\"quickShotCurrent\"><span>▣</span><b>Chụp kênh đang xem</b><small>Chờ có hình rồi chụp</small></button>"
if html.count(quick_shot_current)!=1:
    sys.exit('Quick Tools current-channel action changed')
html=html.replace(quick_shot_current,'',1)
# Retain hidden legacy markup for theme-stage hooks; remove only its visible EPG
# sidebar, while preserving player EPG and the full Schedule page.
guide_marker='<aside class="theme-guide-panel" id="themeGuidePanel" aria-label="Thông tin chương trình">'
if html.count(guide_marker)!=1:
    sys.exit('Web TV wide: cannot find the original EPG sidebar')
html=html.replace(guide_marker,'<aside class="theme-guide-panel" id="themeGuidePanel" aria-hidden="true" hidden style="display:none!important">',1)
html=html.replace('<title>Open IPTV Pro 4.23.38 — WebView</title>','<title>Open IPTV Pro — Web Online</title>')
html=html.replace('<title>Open IPTV Pro — Web Online</title>','<title>Open IPTV Pro — Web Online</title>'+ "<link rel=\"icon\" type=\"image/png\" sizes=\"any\" href=\"assets/icon.png?v=20261116a\"/><link rel=\"apple-touch-icon\" href=\"assets/icon.png?v=20261116a\"/>",1)
html=html.replace('<script src="app.js"></script>','<script src="browser-channel-check.js"></script><script src="web-autoplay.js"></script><script src="app.js"></script>',1)
for name in ('advanced.js','collector.js'):
    version='no-timeshift-20261119a' if name=='advanced.js' else 'collector-merge-repair-20261119a'
    html=html.replace('<script src="'+name+'"></script>','<script src="'+name+'?v='+version+'"></script>',1)
# Always refresh the Web's source matcher after a new build.
html=html.replace('<script src="advanced-core.js"></script>','<script src="advanced-core.js?v=collector-merge-repair-20261119a"></script>',1)
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
server_stats_html='''
      <div id="cloudServerStats" class="cloud-server-stats" hidden>
        <div class="cloud-server-metric">
          <span class="cloud-server-label">Kênh đã lưu trên Supabase</span>
          <strong id="cloudServerChannelCount" class="cloud-server-count" aria-live="polite">—</strong>
        </div>
        <span id="cloudServerUpdatedAt" class="cloud-server-updated">Đang kiểm tra bản lưu trên server…</span>
      </div>'''
html=html.replace(email_anchor,email_anchor+server_stats_html+'\n'+"      <form id=\"cloudEmailForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudEmailInput\">Đăng nhập bằng email</label>\n        <div class=\"cloud-email-input-line\">\n          <div class=\"cloud-email-editor\">\n          <textarea id=\"cloudEmailInput\" rows=\"1\" wrap=\"off\" autocomplete=\"email\" autocapitalize=\"none\" autocorrect=\"off\" spellcheck=\"false\" enterkeyhint=\"done\" placeholder=\"ten@example.com\" aria-label=\"Địa chỉ email\" required></textarea>\n            <span id=\"cloudEmailVisualCaret\" class=\"cloud-email-visual-caret\" aria-hidden=\"true\" hidden></span>\n          </div>\n          <button type=\"submit\" class=\"btn btn-primary\" id=\"cloudEmailSend\">Gửi liên kết đăng nhập</button>\n        </div>\n        <p class=\"hint\">Nhận liên kết qua email. Nếu liên kết dẫn tới localhost, gửi lại email rồi sao chép liên kết mới vào ô xác thực bên dưới, không nhấp vào liên kết.</p>\n      </form>\n      <div id=\"cloudOtpForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudOtpCode\">Mã xác thực từ email (nếu có)</label>\n        <div class=\"cloud-email-input-line\">\n          <input id=\"cloudOtpCode\" inputmode=\"numeric\" autocomplete=\"one-time-code\" maxlength=\"10\" placeholder=\"Nhập mã trong email\"/>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudOtpVerify\">Xác thực</button>\n        </div>\n      </div>\n      <p id=\"cloudAuthProviders\" class=\"hint\" aria-live=\"polite\"></p>\n",1)
link_anchor="<p id=\"cloudAuthProviders\" class=\"hint\" aria-live=\"polite\"></p>"
if html.count(link_anchor)!=1:
    sys.exit('Cloud link form anchor missing')
html=html.replace(link_anchor,"      <div id=\"cloudLinkForm\" class=\"cloud-email-form\" hidden>\n        <label for=\"cloudLinkInput\">Nếu liên kết trong email không quay về website, hãy dán liên kết vào đây</label>\n        <div class=\"cloud-email-input-line\">\n          <input id=\"cloudLinkInput\" type=\"url\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"Liên kết xác nhận của Supabase\"/>\n          <button type=\"button\" class=\"btn btn-subtle\" id=\"cloudLinkVerify\">Xác thực liên kết</button>\n        </div>\n        <p class=\"hint\">Liên kết chỉ được dùng một lần và không được lưu vào playlist hoặc đám mây.</p>\n      </div>\n"+link_anchor,1)
html=html.replace('</head>','<link rel="stylesheet" href="web-only.css?v=no-timeshift-20261119a"/><link rel="stylesheet" href="web-volume.css"/><link rel="stylesheet" href="cloud-sync.css?v=ios-visual-caret-20261121a"/><link rel="manifest" href="manifest.webmanifest"/></head>',1)
html=html.replace('<script src="app.js"></script>','<script src="web-mobile-player.js?v=apple-more-20261120a"></script><script src="app.js"></script>',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-mobile-player.css?v=desktop-handheld-fs-20261119a"/></head>',1)
html=html.replace('src="theme-boot.js"','src="theme-boot.js?v=responsive-desktop-20261118j"',1)
html=html.replace('</body>','<script src="supabase-sdk.js"></script><script src="cloud-core.js"></script><script src="web-only.js"></script><script src="resume-last.js?v=autoplay-clean-20261119a"></script><script src="web-volume.js"></script><script src="web-mobile-volume.js?v=mobile-volume-popover-20261119a"></script><script src="cloud-sync.js"></script><script src="web-player-icons.js?v=audio-state-sync-20261119a"></script></body>',1)
# Preserve Web fullscreen toolbar when generating static assets from legacy WebView.
fs_exit='<button type="button" id="fsExit" title="Thoát toàn màn hình">⛶</button>'
if html.count(fs_exit)!=1:sys.exit('Fullscreen exit button missing')
html=html.replace(fs_exit,"<div id=\"fsExtra\" class=\"fs-extra\" role=\"group\" aria-label=\"Công cụ fullscreen\">\n          <button id=\"fsEpgBtn\" type=\"button\" class=\"fs-tool\" aria-expanded=\"false\" aria-controls=\"fsEpgPanel\" title=\"Lịch chương trình\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4M17 3v4M3 10h18M7 14h5M7 17h8\"/></svg><span>EPG</span></button>\n          <button id=\"fsFitBtn\" type=\"button\" class=\"fs-tool\" aria-expanded=\"false\" aria-controls=\"fsFitPanel\" title=\"Khung hình\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M8 9h8v6H8z\"/></svg><span>Khung hình</span></button>\n          <button id=\"fsLinkBtn\" type=\"button\" class=\"fs-tool\" aria-expanded=\"false\" aria-controls=\"fsLinkPanel\" title=\"Link chính / dự phòng\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 14 6-6M11 7H7a4 4 0 0 0 0 8h3M13 17h4a4 4 0 0 0 0-8h-3\"/></svg><span id=\"fsLinkName\">Link phát</span></button>\n          <section id=\"fsEpgPanel\" class=\"fs-popup fs-epg-popup\" hidden aria-label=\"EPG hiện tại\"><header><b>EPG · Lịch phát sóng</b><small id=\"fsEpgChannel\"></small></header><div id=\"fsEpgItems\" class=\"fs-epg-items\" role=\"list\"></div><button id=\"fsGuidePage\" class=\"fs-guide-page\" type=\"button\">Xem lịch phát sóng đầy đủ</button></section>\n          <section id=\"fsFitPanel\" class=\"fs-popup\" hidden aria-label=\"Tùy chọn khung hình\"><header><b>Chế độ khung hình</b></header><div id=\"fsFitItems\" class=\"fs-choices\" role=\"group\"></div></section>\n          <section id=\"fsLinkPanel\" class=\"fs-popup\" hidden aria-label=\"Link phát\"><header><b>Link phát chính / dự phòng</b></header><div id=\"fsLinkItems\" class=\"fs-choices\" role=\"group\"></div></section>\n         </div>\n         <button id=\"fsFavBtn\" class=\"fs-action\" type=\"button\" aria-label=\"Yêu thích\" aria-pressed=\"false\" title=\"Yêu thích\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m12 2 3.1 6.3 7 .9-5.1 5 1.2 7L12 17.8l-6.2 3.4 1.2-7-5.1-5 7-.9z\"/></svg></button>\n         <div class=\"fs-volume\" role=\"group\" aria-label=\"Âm lượng\"><button type=\"button\" id=\"fsMuteBtn\" aria-label=\"Tắt bật tiếng\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m11 5-5 4H3v6h3l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12\"/></svg></button><input id=\"fsVolumeSlider\" type=\"range\" min=\"0\" max=\"100\" value=\"80\" aria-label=\"Âm lượng\"/></div>\n         <button id=\"fsPipBtn\" class=\"fs-action\" type=\"button\" title=\"PiP\" aria-label=\"Picture-in-Picture\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><rect x=\"12\" y=\"11\" width=\"7\" height=\"6\" rx=\"1\"/></svg></button>\n         "+fs_exit,1)
html=html.replace('</head>','<link rel="stylesheet" href="web-fullscreen-controls.css?v=fullscreen-tools-20261119b"/></head>',1)
html=html.replace('</body>','<script src="web-fullscreen-controls.js?v=fullscreen-tools-20261119b"></script></body>',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-player-icons.css?v=single-icon-first-paint-20261119a"/><link rel="stylesheet" href="web-tv-wide.css?v=tv-wide-responsive-fill-20261119a"/><link rel="stylesheet" href="web-mobile-controls-polish.css?v=quick-icons-unified-20261119b"/></head>',1)
# The old PiP label overlaps the vector icon even with font-size:0 in Safari.
# Preserve the button ID and its accessible aria-label.
pip_caption='<span class="pip-label">PiP</span>'
if html.count(pip_caption)!=1:
    sys.exit('Mobile PiP: cannot locate old in-button label')
html=html.replace(pip_caption,'',1)
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

html=html.replace('src="app.js"','src="app.js?v=playlist-http-20261119d"').replace('collector.js?v=collector-merge-repair-20261119a','collector.js?v=collector-quota-20261120b')
html=html.replace('src="source-edit.js"','src="source-edit.js?v=playlist-input-20261119c"')
for name in ('features.js','epg.js'):
    cache_version='epg-atomic-gzip-20261120a' if name=='features.js' else 'epg-film-titles-20261120a'
    html=html.replace('src=\"'+name+'\"','src=\"'+name+'?v='+cache_version+'\"')
# Reuse the source-controlled player EPG rows when regenerating the WebView layout.
web_html=(Path(__file__).resolve().parent.parent/'index.html').read_text(encoding='utf-8')
start='<div class="epg-current-item">'
end='<span id="epgNowText"'
html=html[:html.index(start)]+web_html[web_html.index(start):web_html.index(end,web_html.index(start))]+html[html.index(end,html.index(start)):]

# Replace only Web EPG markup; keep the DVR DOM hooks hidden for compatibility.
epg_page='<section id="page-epg" class="page">'
epg_next='<section id="page-settings" class="page">'
if any(x.count(epg_page)!=1 or x.count(epg_next)!=1 for x in (html,web_html)):
    sys.exit('Web EPG page markup anchors changed')
html=html[:html.index(epg_page)]+web_html[web_html.index(epg_page):web_html.index(epg_next,web_html.index(epg_page))]+html[html.index(epg_next):]
# Web-only software download picker: stable Electron, Rust Lab and Mobile builds.
# All HTML comes from the versioned root Web source; desktop WebView is unchanged.
desktop_button="<button type=\"button\" class=\"btn btn-subtle desktop-download-top\" id=\"desktopDownloadBtn\" aria-haspopup=\"dialog\" aria-controls=\"desktopDownloadDialog\" title=\"Tải phần mềm Open IPTV Pro mới nhất\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12m-4-4 4 4 4-4\"/><path d=\"M4 17v3h16v-3\"/></svg><span>Tải phần mềm</span><span data-desktop-download-version></span></button>"
mobile_button="<div id=\"softwareDownloadIntro\" class=\"desktop-download-intro\" hidden><button type=\"button\" id=\"desktopDownloadMobileBtn\" class=\"desktop-download-banner\" aria-haspopup=\"dialog\" aria-controls=\"desktopDownloadDialog\"><span class=\"desktop-download-banner-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3v12m-4-4 4 4 4-4\"/><path d=\"M4 17v3h16v-3\"/></svg></span><span class=\"desktop-download-banner-copy\"><strong>Tải Open IPTV Pro cho điện thoại</strong><small>Android APK · iOS IPA · Windows · macOS</small></span><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 5 7 7-7 7\"/></svg></button><button type=\"button\" id=\"softwareDownloadIntroClose\" class=\"desktop-download-intro-dismiss\" aria-label=\"Ẩn gợi ý tải phần mềm, không hiển thị lại\" title=\"Không hiển thị lại\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg></button></div>"
sidebar_button="<button type=\"button\" class=\"nav software-download-nav\" id=\"softwareDownloadNav\" aria-haspopup=\"dialog\" aria-controls=\"desktopDownloadDialog\" title=\"Tải Open IPTV Pro cho Windows, macOS, Android và iOS\"><span aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" width=\"19\" height=\"19\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3v12m-4-4 4 4 4-4\"/><path d=\"M4 17v3h16v-3\"/></svg></span> Tải xuống phần mềm</button>"
top_anchor='<button type="button" class="btn btn-subtle" id="cloudAccountQuick" title="Đăng nhập và đồng bộ dữ liệu">☁ Tài khoản</button>'
sidebar_anchor='<button class="nav" data-page="settings"><span>⚙</span> Cài đặt</button>'
tv_anchor='<section id="page-tv" class="page active-page">'
if html.count(top_anchor)!=1 or html.count(tv_anchor)!=1 or html.count(sidebar_anchor)!=1:
    sys.exit('Cannot insert Web software download entry points')
html=html.replace(top_anchor,top_anchor+desktop_button,1)
html=html.replace(sidebar_anchor,sidebar_anchor+'\n  '+sidebar_button,1)
html=html.replace(tv_anchor,tv_anchor+'\n    '+mobile_button,1)
html=html.replace('</head>','<link rel="stylesheet" href="web-desktop-download.css?v=android-cta-theme-20261122c"/></head>',1)
html=html.replace('</body>','<script src="web-desktop-download.js?v=android-pwa-prompt-20261122b"></script></body>',1)
# Stable Web controls + watched channels; preserve them through subsequent builds.
if html.count('<div class="filter-tabs">')!=1:sys.exit('Recent channel filter slot changed')
html=html.replace('<div class="filter-tabs">','<div class="filter-tabs"><button class="filter-tab" data-filter="recent">Vừa xem</button>',1)
app_script='<script src="app.js?v=playlist-http-20261119d"></script>'
if html.count(app_script)!=1:sys.exit('Recent channel script slot changed')
html=html.replace(app_script,'<script src="web-recent-channels.js?v=recent-controls-20261119a"></script><script src="app.js?v=ios-lockscreen-next-state-20261119a"></script>',1)
html=html.replace('<script src="web-recent-channels.js?v=recent-controls-20261119a"></script>','<script src="web-snapshot-batch.js?v=snapshot-all-20261119b"></script><script src="web-recent-channels.js?v=recent-controls-20261119a"></script>',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-compact-toolbar.css?v=recent-controls-20261119a"/></head>',1)
# Web background audio: same HTML5 media element, Android/Apple Media Session controls.
background_start='<article class="settings-card" id="webBackgroundAudioSettings">'
background_end='<article class="settings-card" id="epgSettingsCard">'
if web_html.count(background_start)!=1 or web_html.count(background_end)!=1 or html.count(background_end)!=1:
    sys.exit('Background audio settings insertion point changed')
background_card=web_html[web_html.index(background_start):web_html.index(background_end,web_html.index(background_start))]
html=html.replace(background_end,background_card+background_end,1)
html=html.replace('</body>','<script src="web-background-audio.js?v=lock-audio-20261119c"></script></body>',1)
# Compact audio-only action beside link picker and favorite, no separate bar.
audio_action='<button type="button" id="webBackgroundAudioToggle"'
audio_status='<small id="webBackgroundAudioModeStatus"'
fav_marker='id="favCurrentBtn"'
if web_html.count(audio_action)!=1 or web_html.count(audio_status)!=1 or html.count(fav_marker)!=1:
    sys.exit('Compact background audio control insertion point changed')
button_start=web_html.index(audio_action)
button_end=web_html.index('</button>',button_start)+len('</button>')
status_start=web_html.index(audio_status,button_end)
status_end=web_html.index('</small>',status_start)+len('</small>')
compact_audio=web_html[button_start:button_end]+'\n        '+web_html[status_start:status_end]
fav_end=html.index('</button>',html.index(fav_marker))+len('</button>')
html=html[:fav_end]+'\\n        '+compact_audio+html[fav_end:]
html=html.replace('web-background-audio.js?v=lock-audio-20261119c','web-background-audio.js?v=lockscreen-state-20261119b',1)
html=html.replace('</head>','<link rel="stylesheet" href="web-background-audio.css?v=lock-artwork-20261119e"/></head>',1)
# Refresh the localization file URL so iOS/Chrome do not reuse the untranslated unmute control.
locale_script='<script src="i18n.js"></script>'
if html.count(locale_script)!=1:
    sys.exit('Web i18n script anchor changed; cannot apply unmute translation cache version')
html=html.replace(locale_script,'<script src="i18n.js?v=unmute-language-20261119a"></script>',1)
# Load native Web labels before the localization engine starts.
html=html.replace('<script src="i18n.js?v=unmute-language-20261119a"></script>',
    '<script src="web-language-supplement.js"></script><script src="i18n.js?v=unmute-language-20261119a"></script>',1)
# Generated offline translations fill gaps before curated Web strings are applied.
html=html.replace('<script src="web-language-supplement.js"></script>',
    '<script src="web-generated-locales.js"></script><script src="web-language-supplement.js"></script>',1)
# Content-addressed language assets. Never reuse a stale 20261119 cache key on Safari/Chrome.
import hashlib
for asset in ('i18n.js','languages.bundle.js','web-language-supplement.js','web-generated-locales.js'):
    digest=hashlib.sha256((out/asset).read_bytes()).hexdigest()[:16]
    html,count=re.subn(r'<script src="'+re.escape(asset)+r'(?:\?[^"]*)?"></script>',
        '<script src="'+asset+'?v='+digest+'"></script>',html,count=1)
    if count!=1:sys.exit('Missing language resource script: '+asset)

# Preserve exactly one user-gesture banner at the top of the video on iOS.
html=html.replace('</head>','<link rel="stylesheet" href="web-ios-audio-recovery.css?v=top-silent-20261119d"/></head>',1)
if 'web-ios-audio-recovery.js' not in html:
    html=html.replace('</body>','<script src="web-ios-audio-recovery.js?v=top-silent-20261119d"></script></body>',1)
# Web-only: remove live Timeshift from generated desktop and mobile website.
# A WebView source refresh must never restore the rewind controls or settings.
for pattern,label in (
    (r'<div class="timeshift-actions">[\s\S]*?</div>\s*<small id="bufferInfo">[\s\S]*?</small>','Timeshift buttons'),
    (r'<fieldset class="settings-choice-group" aria-label="Thời gian tua lại">[\s\S]*?</fieldset>','Timeshift minutes'),
    (r'<article class="settings-card" id="defaultBufferSettings">[\s\S]*?</article>','Timeshift automatic setting'),
):
    html,count=re.subn(pattern,'',html,count=1)
    if count!=1:sys.exit('Missing Web Timeshift removal anchor: '+label)
for old,new in (
    ('aria-label="Tua lại và hẹn giờ ghi hình"','aria-label="Hẹn giờ ghi hình"'),
):
    html=html.replace(old,new)

# Remove explanatory paragraphs that belonged to the discontinued feature,
# rather than ship new untranslated copy in the 17-language UI.
for pattern,label in (
    (r'(<div class="dvr-heading"><div><h2>[\s\S]*?</h2>)<p>[\s\S]*?</p>','DVR description'),
    (r'<small>Backup không mã hóa,[\s\S]*?</small>','Old backup note'),
    (r'(<article class="settings-card full-tool-panel" id="fullFeatureTools"><h2>[\s\S]*?</h2>)\s*<p>[\s\S]*?</p>','Old scan description'),
    (r'<small>Kiểm tra tối đa 32 luồng;[\s\S]*?</small>','Old scan hint'),
):
    def strip_text(match):
        return match.group(1) if label in ('DVR description','Old scan description') else ''
    html,count=re.subn(pattern,strip_text,html,count=1)
    if count!=1:sys.exit('Missing Web Timeshift description removal anchor: '+label)

# Scheduled DVR nodes are kept for compatibility; web-only.css hides the
# container. VOD/catch-up seek and normal playback are intentionally retained.

# Web-only channel hub must survive a rebuild of the original WebView frontend.
# It reads the existing IPTVState after app.js and never changes Electron/Rust.
for filename in ('web-tv-channel-hub.js','web-tv-channel-hub.css'):
    copy2(Path(__file__).resolve().parent/filename,out/filename)
hub_css='<link rel="stylesheet" href="web-tv-channel-hub.css?v=tv-hub-20261119c"/>'
hub_js='<script src="web-tv-channel-hub.js?v=tv-hub-unified-search-20261123a"></script>'
if html.count('</head>')!=1 or html.count('</body>')!=1:
    sys.exit('Web channel hub insertion points missing')
html=html.replace('</head>',hub_css+'</head>',1)
html=html.replace('</body>',hub_js+'</body>',1)
if html.count('web-tv-channel-hub.js?')!=1 or html.count('web-tv-channel-hub.css?')!=1:
    sys.exit('Web channel hub assets duplicated or missing')

# Expanded mobile device mode uses tablet-sized controls even in wide browser windows.
html=html.replace('</head>','<link rel="stylesheet" href="web-mobile-tablet-controls.css?v=tablet-controls-20261119c"/></head>',1)
html=html.replace('web-mobile-controls-polish.css?v=quick-icons-unified-20261119b"/>','web-mobile-controls-polish.css?v=quick-icons-unified-20261119b"/><link rel="stylesheet" href="web-mobile-volume.css?v=mobile-volume-popover-20261119a"/>',1)

# Keep the click-to-play, disabled mobile hover, and mobile CSS cache fresh.
for previous,next_value in (
    ('app.js?v=ios-lockscreen-next-state-20261119a','app.js?v=tv-local-handoff-20261122d'),
    ('advanced.js?v=no-timeshift-20261119a','advanced.js?v=advanced-health-compact-20261120a'),
    ('web-mobile-player.css?v=desktop-handheld-fs-20261119a','web-mobile-player.css?v=apple-more-20261120a'),
):
    if html.count(previous)!=1:sys.exit('Favorites cache key has changed: '+previous)
    html=html.replace(previous,next_value,1)

# Web-only iOS PiP compatibility: Home Screen WebKit may falsely claim PiP
# support. Keep the platform workaround isolated from Electron/Rust features.
for asset in ('web-ios-pip-compat.js','web-ios-pip-compat.css'):
    copy2(Path(__file__).resolve().parent/asset,out/asset)
if html.count('</head>')!=1 or html.count('</body>')!=1:
    sys.exit('iOS PiP helper insertion points missing')
html=html.replace('</head>','<link rel="stylesheet" href="web-ios-pip-compat.css?v=pip-tab-resume-20261120b"/></head>',1)
html=html.replace('</body>','<script src="web-ios-pip-compat.js?v=pip-tab-resume-20261120c"></script></body>',1)
if html.count('web-ios-pip-compat.js?v=')!=1 or html.count('web-ios-pip-compat.css?v=')!=1:
    sys.exit('iOS PiP helper scripts duplicated or missing')

# Keep player subtitles and fullscreen EPG across Safari cached PWA versions.
for old,new in (
    ('features.js?v=epg-atomic-gzip-20261120a','features.js?v=web-perf-20261120a'),
    ('web-only.css?v=no-timeshift-20261119a','web-only.css?v=cast-visible-20261122a'),
    ('web-fullscreen-controls.js?v=fullscreen-tools-20261119b','web-fullscreen-controls.js?v=epg-player-details-20261120a'),
    ('web-fullscreen-controls.css?v=fullscreen-tools-20261119b','web-fullscreen-controls.css?v=epg-player-details-20261120a'),
):
    if html.count(old)!=1:sys.exit('EPG subtitles asset cache version changed: '+old)
    html=html.replace(old,new,1)


# Mobile-only touch drag handles preserve native scrolling/taps and the existing
# app.js ordering + cloud-sync state. Do not modify Electron/Rust/Mobile builds.
touch_sort_root=Path(__file__).resolve().parent.parent
for asset in ('web-mobile-touch-sort.css','web-mobile-touch-sort.js'):
    if not (touch_sort_root / asset).is_file():
        sys.exit('Missing Web mobile touch-sort asset: '+asset)
    copy2(touch_sort_root / asset,out / asset)
if 'web-mobile-touch-sort.css' not in html:
    html=html.replace('</head>','<link rel="stylesheet" href="web-mobile-touch-sort.css?v=header-page-scroll-20261122d"/></head>',1)
if 'web-mobile-touch-sort.js' not in html:
    html=html.replace('</body>','<script src="web-mobile-touch-sort.js?v=header-swipe-page-20261122e"></script></body>',1)
if html.count('web-mobile-touch-sort.js?v=')!=1 or html.count('web-mobile-touch-sort.css?v=')!=1:
    sys.exit('Duplicated Web touch-sort assets')

if html.count('</head>')!=1:sys.exit('EPG stylesheet insertion failed')
html=html.replace('</head>','<link rel="stylesheet" href="web-epg-day.css?v=epg-logo-20261120b"/></head>',1)
if html.count('web-epg-day.css?v=')!=1:sys.exit('Duplicate EPG day CSS')
# On iPhone "Request Desktop Website" uses a 1024px virtual width.
# Keep the desktop UI but correct 100vh that visually occupies only the
# upper part of the physical screen; do not modify Electron/WebView files.
desktop_viewport_version='desktop-phone-rollback-20261120b'
for asset in ('web-desktop-viewport-fix.js','web-desktop-viewport-fix.css'):
    source=Path(__file__).resolve().parent.parent/asset
    if not source.is_file():
        sys.exit('Missing desktop-on-iPhone viewport asset: '+asset)
    copy2(source,out/asset)
bootstrap='src="theme-boot.js?v=responsive-desktop-20261118j"></script>'
if html.count(bootstrap)!=1:
    sys.exit('Desktop-on-iPhone viewport bootstrap marker changed')
html=html.replace(bootstrap,bootstrap+
 '<script src="web-desktop-viewport-fix.js?v='+desktop_viewport_version+'"></script>',1)
if html.count('</head>')!=1:
    sys.exit('Desktop viewport stylesheet insertion failed')
html=html.replace('</head>',
 '<link rel="stylesheet" href="web-desktop-viewport-fix.css?v='+desktop_viewport_version+'"/></head>',1)
if html.count('web-desktop-viewport-fix.js?v=')!=1 or html.count('web-desktop-viewport-fix.css?v=')!=1:
    sys.exit('Desktop viewport helper assets duplicated')
# Browser Smart Discovery must survive regeneration from the desktop WebView files.
discovery_script='<script src="smart-discovery-ui.js"></script>'
legal_script='<script src="source-use-consent-v1.js"></script>'
if html.count(discovery_script)!=1 or html.count(legal_script)!=1:
    sys.exit('Missing Smart Discovery / rights consent script anchors')
html=html.replace(discovery_script,'<script src="web-smart-discovery.js?v=discovery-web-20261120a"></script><script src="smart-discovery-ui.js?v=discovery-web-20261120a"></script>',1)
html=html.replace(legal_script,'<script src="source-use-consent-v1.js?v=discovery-web-20261120a"></script>',1)
if html.count('web-smart-discovery.js?v=')!=1 or html.count('smart-discovery-ui.js?v=')!=1:
    sys.exit('Duplicate Web Smart Discovery module')
# Version the offline EPG tools dictionary so Safari does not reuse the old cache.
if html.count('src="web-language-supplement.js"')!=1:
    sys.exit('Offline Web dictionary asset anchor changed')
html=html.replace('src="web-language-supplement.js"',
    'src="web-language-supplement.js?v=drawer-native-epg-20261120a"',1)
# Keep Web Discovery's compact markup when regenerating from desktop WebView sources.
root_html=(Path(__file__).resolve().parent.parent/'index.html').read_text(encoding='utf-8')
discovery_start='<section class="source-hub-section smart-discovery-section" id="smartDiscoverySection">'
discovery_end='<section class="source-hub-section" id="collectorSection">'
if not all(x in html and x in root_html for x in (discovery_start,discovery_end)):
    sys.exit('Missing Web Discovery compact layout anchors')
html=html[:html.index(discovery_start)]+root_html[root_html.index(discovery_start):root_html.index(discovery_end)]+html[html.index(discovery_end):]
html=html.replace('</head>','<link rel="stylesheet" href="web-smart-discovery-compact.css?v=discovery-compact-20261120a"/></head>',1)
if html.count('web-smart-discovery-compact.css?v=')!=1:
    sys.exit('Missing compact Discovery stylesheet')
# Apply the Web-specific responsive Source Repair layout after WebView regeneration.
repair_start='<section class="source-hub-section" id="sourceRepairSection">'
repair_end='<section id="page-shots"'
if not all(x in html and x in root_html for x in (repair_start,repair_end)):
    sys.exit('Missing Source Repair section anchors')
html=html[:html.index(repair_start)]+root_html[root_html.index(repair_start):root_html.index(repair_end,root_html.index(repair_start))]+html[html.index(repair_end,html.index(repair_start)):]
html=html.replace('</head>','<link rel="stylesheet" href="web-source-repair-layout.css?v=source-repair-layout-20261120a"/></head>',1)

# Eagerly load HLS/DASH at startup as selected; keep same-origin loader fallback.
for name in ('hls.min.js','dash.all.min.js'):
    eager='<script src="'+name+'"></script>'
    if html.count(eager)!=1:sys.exit('Web eager decoder script anchor changed: '+name)
loader_tag='<script src="web-playback-libs.js?v=startup-fastload-20261123a"></script>'
app_match=re.search(r'<script src="app\.js\?v=[^"]+"></script>',html)
if app_match is None or html.count('<script src="app.js?')!=1:
    sys.exit('Web fastload entrypoint anchor missing')
html=html[:app_match.start()]+loader_tag+html[app_match.start():]
copy2(Path(__file__).resolve().parent.parent/'web-playback-libs.js',out/'web-playback-libs.js')
# Rebuilding the WebView must keep current browser Cast/AirPlay assets.
for js_file in ('web-cast-sender.js','web-cast-v2.js'):
    html=re.sub(r'(?<=src=")'+re.escape(js_file)+r'(?:\?v=[^"]+)?',js_file+'?v=airplay-chrome-20261123b',html)
html=re.sub(r'(?<=href=")web-cast-v2\.css(?:\?v=[^"]+)?','web-cast-v2.css?v=airplay-chrome-20261123b',html)


# Lightweight shortcuts reuse the existing Web AI tabs on desktop and mobile.
for filename in ('web-ai-quick-access.js','web-ai-quick-access.css'):
    copy2(Path(__file__).resolve().parent.parent/filename,out/filename)
if 'web-ai-quick-access.js?' in html or 'web-ai-quick-access.css?' in html:
    sys.exit('AI quick access included twice')
if html.count('</head>')!=1 or html.count('</body>')!=1:
    sys.exit('AI quick access insertion anchor changed')
html=html.replace('</head>','<link rel="stylesheet" href="web-ai-quick-access.css?v=ai-shortcut-nav-20261123a"/></head>',1)
html=html.replace('</body>','<script src="web-ai-quick-access.js?v=ai-shortcut-nav-20261123a"></script></body>',1)

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

import subprocess
subprocess.run([sys.executable, str(Path(__file__).with_name('publish-home.py')), str(out)], check=True)
