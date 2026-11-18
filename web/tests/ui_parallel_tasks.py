from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import base64, shutil, re, textwrap
root=Path(__file__).resolve().parents[1]
# Synthetic file generated to test ordering. No third-party streams included.
groups=['03 - Nhóm C','01 - Nhóm A','02 - Nhóm B']
lines=['#EXTM3U']
for i in range(15):
    group=groups[i//5]
    lines.extend([f'#EXTINF:-1 group-title="{group}",Kênh mẫu {i+1:02d}',f'https://example.invalid/{i+1}.m3u8'])
m3u='\n'.join(lines)
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=b.new_page(viewport={'width':1700,'height':1050},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'renderer/index.html').read_text()
    html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>'
    html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
      let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
      window.streamleaf={
        check:async url=>{await new Promise(resolve=>setTimeout(resolve,90));const n=Number(url.match(/(\\d+)\\.m3u8/)[1]);return n%3===0?{status:'dead',reason:'HTTP 404'}:n%3===1?{status:'alive',reason:'HLS segment OK'}:{status:'uncertain',reason:'Timeout'};},
        snapshot:async(url,name)=>{await new Promise(resolve=>setTimeout(resolve,55));return {data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23482b77%22/%3E%3C/svg%3E',method:'Mock'};},
        capabilities:async()=>({snapshotBase:'',ffmpegExists:true})
      };
    }''')
    for name in ['core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js']:
        page.add_script_tag(content=(root/'renderer'/name).read_text())
    icon=base64.b64encode((root/'assets/icon.png').read_bytes()).decode()
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+icon)
    page.locator('#fileInput').set_input_files({'name':'kiem-thu.m3u','mimeType':'audio/x-mpegurl','buffer':m3u.encode()})
    expect(page.locator('.folder-header')).to_have_count(3)
    assert page.locator('.folder-header').all_text_contents()[0].find('Nhóm C')>=0
    assert page.locator('.folder-header').all_text_contents()[1].find('Nhóm A')>=0
    assert page.locator('.folder-header').all_text_contents()[2].find('Nhóm B')>=0

    # Add a few existing screenshots in the order of channels, before jobs start.
    page.evaluate('''()=>{const s=window.IPTVState.getStore();
       for (const ch of s.channels.slice(0,7))s.snapshots[ch.url]={data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23482b77%22/%3E%3C/svg%3E',name:ch.name,method:'Demo',date:'08/11/2026'};
       window.IPTVState.save();window.IPTVState.setPage('shots');}''')
    assert page.locator('.shot-group-heading h2').all_text_contents()==['📁 '+groups[0], '📁 '+groups[1]]
    cols=page.locator('.shot-group .shots-grid').first.evaluate('(el)=>getComputedStyle(el).gridTemplateColumns.split(" ").length')
    assert cols==5,cols
    assert page.locator('.shot-card').count()==7

    page.locator('.nav[data-page="tv"]').click()
    page.locator('.nav[data-page="sources"]').click()
    page.locator('#sourceCheckAllBtn').click()
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.nav[data-page="shots"]').click()
    page.locator('#shotsAllBtn').click()
    expect(page.locator('#task-check')).to_be_visible()
    expect(page.locator('#task-shots')).to_be_visible()
    page.wait_for_timeout(240)
    assert page.locator('.check-result').count()>0
    assert 'Sống' in page.locator('#task-check .task-status').inner_text()
    assert page.locator('.channel-health.alive').count()>0
    # Panels must stay visible when page switches.
    page.locator('.nav[data-page="shots"]').click()
    expect(page.locator('#task-check')).to_be_visible()
    expect(page.locator('#task-shots')).to_be_visible()
    expect(page.locator('#task-shots .task-count')).to_have_text('15/15 kênh',timeout=12000)
    expect(page.locator('#task-check .task-count')).to_have_text('15/15 kênh',timeout=12000)
    assert page.locator('.shot-card').count()==15
    assert page.locator('.shot-group-heading h2').all_text_contents()==['📁 '+g for g in groups]
    assert page.locator('#task-check .task-status').inner_text().count('5')>=3
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.filter-tab[data-filter="dead"]').click()
    expect(page.locator('.channel-item')).to_have_count(5)
    page.locator('.filter-tab[data-filter="all"]').click()
    page.locator('.nav[data-page="shots"]').click()
    page.locator('#toastArea').evaluate('(el)=>el.replaceChildren()')
    page.screenshot(path=str(root/'docs/images/snapshots-v4-3.png'),full_page=True)
    # Independent cancellation: stopping link checking must not stop snapshots.
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.nav[data-page="sources"]').click()
    page.locator('#sourceCheckAllBtn').click()
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.nav[data-page="shots"]').click()
    page.locator('#shotsAllBtn').click()
    page.wait_for_timeout(30)
    page.locator('#cancelCheckBtn').click()
    expect(page.locator('#task-check .task-title')).to_contain_text('Đã dừng',timeout=5000)
    checked=int(page.locator('#task-check .task-count').inner_text().split('/')[0])
    assert checked<15,checked
    expect(page.locator('#task-shots .task-count')).to_have_text('15/15 kênh',timeout=12000)
    assert not errors,errors
    print('PARALLEL TASKS UI PASSED: 5 columns, M3U group order, live statuses, concurrent jobs, independent cancel')
    b.close()
