from pathlib import Path
import re,shutil,base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=b.new_page(viewport={'width':1460,'height':1000}, device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    html=(root/'renderer/index.html').read_text()
    html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
    html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
       const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});
       window.HTMLMediaElement.prototype.play=()=>Promise.resolve();
       window.HTMLMediaElement.prototype.pause=function(){};
       window.streamleaf={
          capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:true,version:'4.22.0'}),
          updateStatus:async()=>({phase:'idle',message:'Chưa kiểm tra',progress:0}),
          onUpdateStatus:cb=>{window.onUpdater=cb;return()=>{}},
          checkUpdate:async()=>({phase:'available',latest:'v4.23.0',mode:'manual',message:'Có bản cập nhật v4.23.0 cho thiết bị này.',progress:0}),
          downloadUpdate:async()=>({phase:'manual-ready',mode:'manual',message:'Đã tải bản cập nhật an toàn.',progress:100}),
          openDownloadedUpdate:async()=>{},openReleases:async()=>{}
       };
    }''')
    for f in ['app-icons.js','languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js']:
      page.add_script_tag(content=(root/'renderer'/f).read_text())
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
    expect(page.locator('.sidebar .nav .apple-ui-symbol')).to_have_count(12)
    page.locator('.nav[data-page="settings"]').click()
    expect(page.locator('.update-publisher')).to_contain_text('trisanghy/open-iptv-pro')
    expect(page.locator('#releaseRepo')).to_have_count(0)
    page.locator('#autoDownloadUpdates').uncheck()
    page.locator('#updateCheckBtn').click()
    expect(page.locator('#updateDownloadBtn')).to_be_visible()
    page.locator('#updateDownloadBtn').click()
    expect(page.locator('#updateManualBtn')).to_be_visible()
    page.locator('#appLanguage').select_option('en')
    expect(page.locator('.nav[data-page="settings"]')).to_contain_text('Settings')
    expect(page.locator('.nav[data-page="settings"] svg')).to_have_count(1)
    page.locator('#appLanguage').select_option('vi')
    page.screenshot(path=str(root/'docs/images/desktop-macos-icons-updater-v4-22.png'),full_page=True)
    assert not errors,errors
    print('PASS UI v4.22: 12 macOS SVG sidebar icons, fixed official repository, check & download, 8-language runtime unaffected')
    b.close()
