from pathlib import Path
import re,shutil,base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 page=b.new_page(viewport={'width':1500,'height':1020},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda x:errors.append(str(x)))
 html=(root/'renderer/index.html').read_text()
 html=html[:html.index('<script src="../node_modules')]+ '</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {let data={};window.__fakeStorage=data;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}''')
 for file in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','epg.js','favorites-core.js','app.js','features.js','advanced.js','collector.js']:
  page.add_script_tag(content=(root/'renderer'/file).read_text())
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.locator('.nav[data-page="settings"]').click()
 locales={'en':'Settings','es':'Configuración','pt-BR':'Configurações','zh-CN':'设置','th':'การตั้งค่า','lo':'ການຕັ້ງຄ່າ','km':'ការកំណត់','vi':'Cài đặt'}
 for code,text in locales.items():
  page.locator('#appLanguage').select_option(code)
  expect(page.locator('#appLanguage')).to_have_value(code)
  # confirm left nav changed, and persisted
  expect(page.locator('.nav[data-page="settings"]')).to_contain_text(text)
  assert page.evaluate('document.documentElement.lang')==code
  assert page.evaluate('localStorage.getItem("open-iptv-pro-language")')==code
  print(code,'PASS',page.locator('.nav[data-page="settings"]').inner_text())
 # switch English and import playlist, verify channel names not translated
 page.locator('#appLanguage').select_option('en')
 page.locator('.nav[data-page="tv"]').click()
 playlist='''#EXTM3U\n#EXTINF:-1 group-title="Bóng đá Châu Âu" tvg-id="DemoTV",Truyền hình Demo Việt Nam\nhttps://example.invalid/test.m3u8\n'''
 page.locator('#fileInput').set_input_files({'name':'test.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
 expect(page.locator('.folder-header')).to_have_count(1)
 assert 'Bóng đá Châu Âu' in page.locator('.folder-header').inner_text()
 if page.locator('.channel-item').count()==0: page.locator('.folder-header').click()
 expect(page.locator('.channel-item')).to_have_count(1)
 assert 'Truyền hình Demo Việt Nam' in page.locator('.channel-item').inner_text()
 # re-render & locale updates
 page.locator('.nav[data-page="settings"]').click()
 page.locator('#appLanguage').select_option('zh-CN')
 assert page.locator('.nav[data-page="sources"]').inner_text().find('管理来源')>=0
 page.locator('#appLanguage').select_option('en')
 page.screenshot(path=str(root/'docs/images/i18n-english-v4-15.png'))
 page.locator('#appLanguage').select_option('es')
 page.screenshot(path=str(root/'docs/images/i18n-language-selector-v4-15.png'))
 assert not errors,errors
 print('UI LANGUAGE SMOKE: passed all 8 languages, persistence, playlist name unchanged, re-render, screenshots')
 b.close()
