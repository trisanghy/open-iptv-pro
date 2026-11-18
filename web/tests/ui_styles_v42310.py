"""Responsive browser smoke test for five UI themes and legacy display modes."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil
root=Path(__file__).resolve().parents[1]
html=(root/'renderer/index.html').read_text(encoding='utf-8')
html=html[:html.index('<script src="app-icons.js"')]+'</body></html>'
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 for width in (1000,1360):
  page=browser.new_page(viewport={'width':width,'height':820})
  errors=[]
  page.on('pageerror',lambda err: errors.append(str(err)))
  page.set_content(html)
  for f in ('styles.css','ui-styles.css','ui-fullsync.css'):
   page.add_style_tag(content=(root/'renderer'/f).read_text(encoding='utf-8'))
  page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
   window.streamleaf={check:async()=>({status:'alive',reason:'verified',confirmedAlive:true}),capabilities:async()=>({ffmpegExists:true,platform:'darwin',native:true})};}''')
  for name in ['languages.bundle.js','i18n.js','core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','settings-ui.js','ui-style.js']:
   page.add_script_tag(content=(root/'renderer'/name).read_text(encoding='utf-8'))
  page.locator('.nav[data-page="settings"]').click()
  page.locator('#uiStyleSettings summary').click()
  assert page.locator('#uiStyleChoices input').count()==11
  for style in ('minimal','material3','hig','liquid','cinema','fluent','glass','broadcast','bento','swiss','current'):
   page.locator(f'input[name="uiStyle"][value="{style}"]').check()
   assert page.evaluate('document.documentElement.dataset.uiStyle')==style
   assert page.evaluate("localStorage.getItem('open-iptv-pro-ui-style-v1')")==style
   css=page.evaluate("let s=getComputedStyle(document.querySelector('.topbar'));s.backgroundColor+'|'+s.backgroundImage")
   assert css and (css!='rgba(0, 0, 0, 0)|none'),(style,css)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),(style,width)
  page.locator('input[name="uiStyle"][value="material3"]').check()
  page.locator('#appearanceSettings summary').click()
  page.locator('input[name="appearanceMode"][value="amoled"]').check()
  assert page.evaluate('document.documentElement.dataset.theme')=='amoled'
  assert page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()')=='#000000'
  assert page.evaluate('document.documentElement.dataset.uiStyle')=='material3'
  page.locator('input[name="appearanceMode"][value="light"]').check()
  assert page.evaluate('document.documentElement.dataset.theme')=='light'
  # Verify localized selector and live status after a language change.
  page.evaluate("window.OpenIPTVI18n.setLanguage('en')")
  page.wait_for_timeout(100)
  assert 'Interface style' in page.locator('#uiStyleSettings summary').inner_text()
  page.locator('#uiStyleSettings summary').click()
  page.locator('input[name="uiStyle"][value="liquid"]').check()
  assert page.locator('#uiStyleStatus').inner_text().startswith('Active:'),page.locator('#uiStyleStatus').inner_text()
  page.locator('#uiStyleReset').click()
  assert page.evaluate('document.documentElement.dataset.uiStyle')=='current'
  assert page.evaluate("localStorage.getItem('open-iptv-pro-ui-style-v1')")=='current'
  assert not errors,errors
  print(f'PASS {width}px: five styles, live choice/persistence, AMOLED/light compatibility, reset, no JS errors',flush=True)
  page.close()
 browser.close()
