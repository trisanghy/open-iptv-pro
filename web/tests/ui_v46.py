"""v4.6 smoke: sources merge, preview across tabs, persistent Timeshift preference and desktop auto start.
Requires playwright/chromium, uses synthetic streams and mock FFmpeg; it does not prove actual Mac playback.
"""
from pathlib import Path
import re, shutil, base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
m3u1='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" group-title="01 - VTV",VTV1 HD
https://demo.invalid/vtv1.m3u8
#EXTINF:-1 group-title="02 - Sports",Bóng đá
https://demo.invalid/sports.m3u8
'''
m3u2='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" group-title="02 - Another",VTV1
https://backup.invalid/vtv1.m3u8
'''
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=b.new_page(viewport={'width':1500,'height':940})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'renderer/index.html').read_text();html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>';html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
      const data={};window.__data=data;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
      window.confirm=()=>true;
      window.__startCalls=[];window.__activeBuffer='';
      window.streamleaf={capabilities:async()=>({snapshotBase:'',ffmpegExists:true}),proxy:async(u)=>u,mediaKind:async()=>({hls:true}),
        startTimeshift:async u=>{window.__startCalls.push(u);window.__activeBuffer='buf'+window.__startCalls.length;return {id:window.__activeBuffer,url:'https://buffer.invalid/rolling.m3u8'}},
        stopTimeshift:async()=>{window.__activeBuffer='';return true},timeshiftStatus:async()=>({id:window.__activeBuffer,active:!!window.__activeBuffer})};
      window.fetch=async u=>({ok:true,text:async()=>"#EXTM3U\\n#EXT-X-TARGETDURATION:5\\n#EXTINF:5,\\nsegment_000001.ts\\n"});
      HTMLMediaElement.prototype.play=function(){setTimeout(()=>this.dispatchEvent(new Event('playing')),0);return Promise.resolve()};
      HTMLMediaElement.prototype.pause=function(){};
      window.Hls=class {static isSupported(){return true}static Events={ERROR:'error',LEVEL_SWITCHED:'level'};loadSource(){}attachMedia(){}on(){}destroy(){}};
    }''')
    for s in ['core-browser.js','collector-core.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js','collector.js']:
        page.add_script_tag(content=(root/'renderer'/s).read_text())
    # M3U import
    for name,txt in [('demo1.m3u',m3u1),('demo2.m3u',m3u2)]:
        page.locator('#fileInput').set_input_files({'name':name,'mimeType':'audio/x-mpegurl','buffer':txt.encode()})
    assert page.evaluate('window.IPTVState.getStore().channels.length')==3
    # Default buffering opt-in persisted
    page.locator('.nav[data-page="settings"]').click()
    assert not page.locator('#autoTimeshiftSetting').is_checked()
    page.locator('#autoTimeshiftSetting').check()
    assert page.evaluate("JSON.parse(window.__data['open-iptv-pro-advanced-v1']).autoTimeshift") is True
    # Favorites hover preview without sound
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.channel-star').first.click()
    page.locator('.nav[data-page="fav"]').click()
    expect(page.locator('.fav-card')).to_have_count(1)
    page.locator('.fav-card').first.hover()
    expect(page.locator('#channelPreview')).to_be_visible(timeout=2500)
    assert page.locator('#channelPreview video').evaluate('(v)=>v.muted && v.volume===0 && v.defaultMuted')
    # Snapshot hover preview without sound
    page.evaluate('''() => {
       const s=window.IPTVState.getStore(),c=s.channels[0];
       s.snapshots[c.url]={data:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="90"%3E%3Crect width="160" height="90" fill="%23555"/%3E%3C/svg%3E',name:c.name,date:'demo'};
       window.IPTVState.save();window.IPTVState.render();
    }''')
    page.locator('.nav[data-page="shots"]').click()
    expect(page.locator('.shot-card')).to_have_count(1)
    page.locator('.shot-card').first.hover()
    expect(page.locator('#channelPreview')).to_be_visible(timeout=2500)
    assert page.locator('#channelPreview video').evaluate('(v)=>v.muted && v.volume===0')
    # Merge sources moved under source management. Analyze without mutations, then execute.
    page.locator('.nav[data-page="sources"]').click()
    expect(page.locator('#sourceMergeChoices .collector-source')).to_have_count(2)
    page.locator('#sourceMergeAnalyze').click()
    expect(page.locator('#sourceMergeSummary')).to_contain_text('1 mục trùng')
    assert page.evaluate('window.IPTVState.getStore().sources.length')==2
    # Before merging, capture actual management UI using synthetic sources (not broadcast)
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
    page.screenshot(path=str(root/'docs/images/source-merge-v4-6.png'),full_page=True)
    page.locator('#sourceMergeExecute').click()
    expect(page.locator('#sourceMergeSummary')).to_contain_text('Đã gộp 3 thành 2')
    assert page.evaluate("window.IPTVState.getStore().channels.filter(c=>c.sourceId==='collector_merged').length")==2
    page.locator('#sourceMergeUndo').click()
    expect(page.locator('#sourceMergeSummary')).to_contain_text('Đã hoàn tác')
    # Open live channel: auto Timeshift created once, not repeatedly for the timeshift playback.
    page.locator('.nav[data-page="tv"]').click()
    channel_id=page.evaluate('window.IPTVState.getStore().channels[0].id')
    page.evaluate('id=>window.IPTVState.playChannel(id)',channel_id)
    expect(page.locator('#bufferToggle')).to_have_text('Tắt bộ đệm',timeout=6500)
    page.wait_for_timeout(250)
    assert page.evaluate('window.__startCalls.length')==1
    assert page.evaluate('window.IPTVState.getPlayMode()')=='timeshift'
    # Switching channel starts a new automatic buffer, but never doubles the request for one channel.
    second_id=page.evaluate('window.IPTVState.getStore().channels[1].id')
    page.evaluate('id=>window.IPTVState.playChannel(id)',second_id)
    page.wait_for_function('window.__startCalls.length===2',timeout=5000)
    expect(page.locator('#bufferToggle')).to_have_text('Tắt bộ đệm',timeout=6500)
    page.locator('#bufferToggle').click()
    expect(page.locator('#bufferToggle')).to_have_text('Bật bộ đệm')
    page.wait_for_timeout(300)
    assert page.evaluate('window.__startCalls.length')==2, 'Manual turn-off should not instantly auto-restart the same channel'
    page.locator('.nav[data-page="settings"]').click()
    assert page.locator('#autoTimeshiftSetting').is_checked()
    page.screenshot(path=str(root/'docs/images/settings-timeshift-v4-6.png'),full_page=True)
    assert not errors,errors
    print('V4.6 UI PASSED: saved opt-in Timeshift auto starts once, source dedupe analysis/merge/undo, muted previews in Favorites & Snapshots, Settings.')
    b.close()
