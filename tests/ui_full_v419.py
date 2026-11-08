from pathlib import Path
import re, shutil, base64
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
playlist='#EXTM3U\n#EXTINF:-1 tvg-id="vietnam.news" group-title="Tin tức",VTV News HD\nhttps://example.invalid/vtv.m3u8\n'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=browser.new_page(viewport={'width':1440,'height':940},accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text()
 html=html[:html.index('<script src="../node_modules')]+ '</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate("() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]||null,setItem:(k,v)=>d[k]=String(v)}});window.HTMLMediaElement.prototype.play=()=>Promise.resolve();window.HTMLMediaElement.prototype.pause=function(){};}")
 for name in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js','collector.js','doctor-v2.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
 expect(page.locator('#quickChecks')).to_have_count(1)
 expect(page.locator('#bufferToggle')).to_have_count(1)
 expect(page.locator('#snapshotWorkersQuick')).to_have_count(1)
 expect(page.locator('#checkWorkersQuick')).to_have_count(1)
 assert page.locator('#quickTools').get_attribute('open') is None
 page.locator('#quickTools > summary').click()
 assert page.locator('#quickTools').get_attribute('open') is not None
 expect(page.locator('#quickChecks')).to_be_visible()
 page.locator('#quickChecks').click()
 expect(page.locator('#page-sources')).to_have_class(re.compile('active-page'))
 page.locator('.nav[data-page="settings"]').click()
 expect(page.locator('#autoTimeshiftSetting')).to_have_count(1)
 expect(page.locator('#fullFeatureTools')).to_contain_text('FFmpeg tích hợp')
 page.locator('button[data-nav-to="shots"]').click()
 expect(page.locator('#page-shots')).to_have_class(re.compile('active-page'))
 page.locator('#snapshotWorkersQuick').select_option('32')
 assert page.locator('#snapshotWorkersQuick').input_value()=='32'
 page.locator('.nav[data-page="settings"]').click()
 page.locator('#appLanguage').select_option('en')
 assert page.locator('#fullFeatureTools').inner_text().find('FFmpeg included')!=-1
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.locator('#appLanguage').select_option('vi')
 page.evaluate('() => document.querySelector("#toastArea").replaceChildren()')
 page.screenshot(path=str(root/'docs/images/full-ui-v4-19.png'),full_page=True)
 assert not errors,errors
 print('UI FULL v4.19 PASS: compact tools, Timeshift, 32-workers, settings navigation, 8-language engine')
 browser.close()
