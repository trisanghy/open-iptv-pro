from pathlib import Path
import re, shutil, base64
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
    page=b.new_page(viewport={'width':1500,'height':1000},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'renderer/index.html').read_text()
    html=html[:html.index('<script src="../node_modules')]+ '</body></html>'
    html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
      let store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});
      window.streamleaf={
       checkUpdate:async()=>({phase:'available',latest:'v4.16.1',mode:'automatic',progress:0,message:'Có bản mới v4.16.1.'}),
       updateStatus:async()=>({phase:'idle',progress:0,message:'Chưa kiểm tra cập nhật'}),
       onUpdateStatus:cb=>{window.updateCallback=cb;return()=>{}},
       downloadUpdate:async()=>({phase:'downloaded',downloaded:true,mode:'automatic',progress:100,message:'Đã tải xong, có thể cài đặt.'}),
       installUpdate:async()=>({phase:'installing',progress:100,message:'Đang cài đặt và khởi động lại'}),
       openReleases:async()=>{},openRelease:async()=>{},
       capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:false,version:'4.16.0'})
      };
    }''')
    for file in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js','collector.js']:
        page.add_script_tag(content=(root/'renderer'/file).read_text())
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
    page.locator('.nav[data-page="settings"]').click()
    expect(page.locator('#releaseRepo')).to_have_value('trisanghy/open-iptv-pro')
    expect(page.locator('#releaseRepo')).to_have_attribute('readonly','')
    page.locator('#autoCheckUpdates').uncheck()
    page.locator('#autoDownloadUpdates').uncheck()
    page.locator('#updateCheckBtn').click()
    expect(page.locator('#updateDownloadBtn')).to_be_visible()
    expect(page.locator('#updateResult')).to_contain_text('v4.16.1')
    page.locator('#updateDownloadBtn').click()
    expect(page.locator('#updateInstallBtn')).to_be_visible()
    expect(page.locator('#updateProgressBar')).to_have_js_property('value',100)
    page.once('dialog',lambda dialog:dialog.accept())
    page.locator('#updateInstallBtn').click()
    expect(page.locator('#updateResult')).to_contain_text('Đang cài đặt')
    page.screenshot(path=str(root/'docs/images/auto-update-v4-16.png'))
    page.evaluate("window.updateCallback({phase:'manual-ready',downloaded:true,progress:100,message:'Bộ cài đã xác minh, cần mở thủ công.'})")
    expect(page.locator('#updateManualBtn')).to_be_visible()
    page.evaluate("window.updateCallback({phase:'no-release',progress:0,message:'Chưa có GitHub Release.'})")
    expect(page.locator('#updateDownloadBtn')).to_be_hidden()
    page.evaluate("window.updateCallback({phase:'source-only',progress:0,message:'Chỉ có mã nguồn, chưa có DMG/EXE.'})")
    expect(page.locator('#updateDownloadBtn')).to_be_hidden()
    assert not errors, errors
    print('AUTO UPDATE UI PASS: check, download progress, install consent, manual fallback, no Release, source-only, official repo')
    b.close()
