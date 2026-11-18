from pathlib import Path
import re,shutil,base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
playlist='''#EXTM3U
#EXTINF:-1 tvg-id="tv.news" group-title="01 - Tin tức",Tin tức HD
https://example.invalid/news.m3u8
#EXTINF:-1 tvg-id="tv.sport" group-title="02 - Thể thao",Thể thao HD
https://example.invalid/sports.m3u8
'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=browser.new_page(viewport={'width':1440,'height':940},accept_downloads=True)
 errors=[];downloads=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.on('download',lambda download:downloads.append(download.suggested_filename))
 html=(root/'renderer/index.html').read_text()
 html=html[:html.index('<script src="../node_modules')]+ '</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}}); window.HTMLMediaElement.prototype.play=()=>Promise.resolve(); window.HTMLMediaElement.prototype.pause=function(){};}''')
 for name in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js','collector.js','doctor-v2.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
 assert page.locator('#doctorV2Export,#doctorV2Report,#checkWorkersSetting,#snapshotWorkersSetting').count()==0
 assert page.locator('#quickTools').count()==1
 assert page.locator('#quickTools').get_attribute('open') is None
 page.locator('.nav[data-page="doctor"]').click()
 page.locator('#doctorRun').click()
 expect(page.locator('#doctorReport')).to_contain_text('Tổng kênh')
 expect(page.locator('#doctorV2Summary')).to_contain_text('đề xuất')
 page.locator('#doctorExport').click()
 page.wait_for_timeout(150)
 assert len(downloads)==1,downloads
 assert downloads[0]=='open-iptv-doctor-v2-report.json',downloads
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.evaluate('''() => {document.querySelector('#toastArea').replaceChildren();}''')
 page.screenshot(path=str(root/'docs/images/optimized-doctor-v4-18.png'),full_page=True)
 assert not errors,errors
 print('OPTIMIZATION UI PASS: single Doctor action, single export, no redundant worker controls, user data retained')
 browser.close()
