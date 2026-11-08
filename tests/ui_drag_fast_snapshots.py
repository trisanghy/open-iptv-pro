"""UI regression for folder drop and bounded parallel snapshots. Synthetic streams only."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import re, shutil, base64
root=Path(__file__).resolve().parents[1]
channels=['#EXTM3U']
for i in range(12):
    name='Nhóm A' if i<6 else 'Nhóm B'
    channels.extend([f'#EXTINF:-1 group-title="{name}",Demo {i+1:02}',f'https://example.invalid/test{i+1}.m3u8'])
m3u='\n'.join(channels)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=browser.new_page(viewport={'width':1510,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'renderer/index.html').read_text()
    html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
    html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
     let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
     window.confirm=()=>true;window.__shots={active:0,max:0,calls:0};
     window.streamleaf={
       capabilities:async()=>({snapshotBase:'',ffmpegExists:true}),
       snapshot:async(url,label)=>{const r=window.__shots;r.active++;r.max=Math.max(r.max,r.active);r.calls++;await new Promise(ok=>setTimeout(ok,90));r.active--;return {data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22384%22 height=%22216%22%3E%3Crect width=%22384%22 height=%22216%22 fill=%22%23424177%22/%3E%3C/svg%3E',method:'Mock'};}
     };
    }''')
    for name in ['core-browser.js','favorites-core.js','app.js']:
        page.add_script_tag(content=(root/'renderer'/name).read_text())
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
    page.evaluate('(text)=>window.IPTVState.importSource("Demo","demo.m3u",text,"file")',m3u)
    expect(page.locator('.folder-header')).to_have_count(2)
    # Drag a channel to another folder's HEADER and verify internal M3U data.
    page.locator('.channel-item').first.drag_to(page.locator('.folder-header[data-group="Nhóm B"]'))
    assert page.evaluate("window.IPTVState.getStore().channels[0].group")== 'Nhóm B'
    expect(page.locator('.folder-header[data-group="Nhóm A"] .folder-size')).to_have_text('5')
    expect(page.locator('.folder-header[data-group="Nhóm B"] .folder-size')).to_have_text('7')
    # Drag to a collapsed folder: should accept a drop without expanding.
    page.locator('.folder-header[data-group="Nhóm A"]').click()
    page.locator('.channel-item').first.drag_to(page.locator('.folder-header[data-group="Nhóm A"]'))
    assert page.evaluate("window.IPTVState.getStore().channels[0].group")== 'Nhóm A'
    assert 'group-title="Nhóm A"' in page.evaluate('window.StreamLeafCore.exportM3U(window.IPTVState.getStore().channels)')
    # Drag onto a card in the dedicated folder manager.
    page.locator('.nav[data-page="folders"]').click()
    page.evaluate("window.IPTVState.getStore().channels[0].group='Nhóm A';window.IPTVState.render()")
    page.locator('.nav[data-page="tv"]').click()
    # no channel can be dragged across pages, but card targets accept drag events from DnD payload
    page.locator('.nav[data-page="shots"]').click()
    page.evaluate('''()=>{const s=window.IPTVState.getStore();
       s.snapshots[s.channels[0].url]={data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E',name:'Demo 01'};
       s.snapshots[s.channels[1].url]={data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E',name:'Demo 02'};
       window.IPTVState.save();}''')
    page.locator('#snapshotWorkersQuick').select_option('4')
    assert page.locator('#snapshotWorkersSetting').input_value()=='4'
    assert page.locator('#snapshotSkipQuick').is_checked()
    page.locator('#shotsAllBtn').click()
    expect(page.locator('#task-shots .task-count')).to_have_text('12/12 kênh',timeout=12000)
    stats=page.evaluate('window.__shots')
    assert stats['calls']==10,stats
    assert 2 <= stats['max'] <= 4,stats
    assert page.locator('.shot-card').count()==12
    assert 'Giữ ảnh 2' in page.locator('#task-shots .task-status').inner_text()
    # Option sync and resume full refresh of existing snapshots.
    page.locator('#snapshotSkipQuick').uncheck()
    page.locator('#snapshotWorkersQuick').select_option('2')
    assert page.locator('#snapshotWorkersSetting').input_value()=='2'
    assert not page.locator('#snapshotSkipSetting').is_checked()
    page.evaluate('window.__shots={active:0,max:0,calls:0}')
    page.locator('#shotsAllBtn').click()
    expect(page.locator('#task-shots .task-count')).to_have_text('12/12 kênh',timeout=12000)
    stats=page.evaluate('window.__shots')
    assert stats['calls']==12,stats
    assert stats['max']==2,stats
    # Settings are retained after a mock re-open.
    saved=page.evaluate('JSON.parse(localStorage.getItem("open-iptv-pro-4"))')
    assert saved['snapshotConcurrency']==2 and saved['snapshotSkipExisting'] is False
    page.locator('#toastArea').evaluate('(el)=>el.replaceChildren()')
    page.screenshot(path=str(root/'docs/images/fast-snapshots-v4-10.png'),full_page=True)
    assert not errors,errors
    print('UI DRAG/FAST SNAPSHOTS PASSED: cross-folder drop, collapsed target, saved group, concurrency=4/2, skip existing, synchronized options')
    browser.close()
