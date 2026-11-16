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
  page=browser.new_page(viewport={'width':width,'height':850})
  errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content(html)
  page.add_style_tag(content=(root/'renderer/styles.css').read_text(encoding='utf8'))
  page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
   window.streamleaf={check:async()=>({status:'alive',reason:'verified',confirmedAlive:true}),capabilities:async()=>({ffmpegExists:true,platform:'darwin',native:true})};}''')
  for name in ['core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','settings-ui.js']:
   page.add_script_tag(content=(root/'renderer'/name).read_text(encoding='utf8'))
  page.locator('.nav[data-page="settings"]').click()
  folds=page.locator('#page-settings details.settings-accordion')
  assert folds.count()>=9,('fold count',folds.count())
  assert not any(folds.nth(i).get_attribute('open') is not None for i in range(folds.count())), 'all settings initially folded'
  page.locator('#appearanceSettings summary').click()
  assert page.locator('#appearanceSettings').get_attribute('open') is not None
  page.locator('input[name="appearanceMode"][value="amoled"]').check()
  assert page.evaluate('document.documentElement.dataset.theme')=='amoled'
  assert page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()')=='#000000'
  page.locator('#colorSettings summary').click()
  page.wait_for_timeout(100)
  assert page.locator('#appearanceSettings').get_attribute('open') is None, 'others close on open'
  page.locator('#colorWheel').click(position={'x':125,'y':36})
  assert page.locator('#themePicker').input_value()!='#bc7cff', 'click changes color'
  first=page.locator('#themePicker').input_value()
  page.locator('#colorWheel').click(position={'x':96,'y':95})
  assert page.locator('#themePicker').input_value()!=first, 'center modifies shade'
  page.locator('#colorWheel').press('ArrowRight')
  assert page.locator('#themePicker').input_value().startswith('#')
  # Popover is anchored over a footer that never changes height.
  dock=page.locator('#taskDock');dock.evaluate("e=>e.classList.remove('hidden')")
  footer=page.locator('.footer');before=footer.bounding_box();assert before['height']<50,before
  page.locator('#taskDockMinimize').click()
  assert page.locator('#taskDockBody').is_visible()
  after=footer.bounding_box();pop=page.locator('#taskDockBody').bounding_box()
  assert abs(before['height']-after['height'])<2,(before,after)
  assert pop['y']+pop['height'] <= after['y']+1,(pop,after)
  assert pop['height'] <= 360,pop
  page.locator('#taskDockMinimize').click()
  assert page.locator('#taskDockBody').is_hidden()
  page.locator('#taskDockMinimize').click()
  page.locator('#page-settings .section-heading h1').click()
  assert page.locator('#taskDockBody').is_hidden(),'outside click closes'
  page.locator('#taskDockMinimize').click()
  page.keyboard.press('Escape')
  assert page.locator('#taskDockBody').is_hidden(),'Escape closes'
  page.locator('.nav[data-page="epg"]').click()
  page.locator('#epgSettingsBtn').click()
  page.wait_for_timeout(150)
  assert page.locator('#epgSettingsCard').get_attribute('open') is not None,'EPG settings deep link'
  page.locator('#backupSettings summary').click()
  page.wait_for_timeout(150)
  assert page.locator('#backupSettings').get_attribute('open') is not None,'Backup settings deep link'
  assert not errors,errors
  print('PASS responsive width',width,'folded settings, live AMOLED, HSV wheel, fixed footer/popup, deep links',flush=True)
  page.close()
 browser.close()
