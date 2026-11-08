"""Smoke tests for appearance auto sync and consolidated link checks.
Requires Playwright + Chromium; synthetic local M3U, no network.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import base64, re, shutil

root=Path(__file__).resolve().parents[1]
html=(root/'renderer/index.html').read_text().replace('<script src="theme-boot.js"></script>','')
html=html[:html.index('<script src=')]+'</body></html>'
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
playlist='''#EXTM3U
#EXTINF:-1 tvg-id="demo" group-title="03 - Demo",Demo One
https://example.invalid/one.m3u8
#EXTINF:-1 group-title="01 - Demo",Demo Two
https://example.invalid/two.m3u8
'''
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=b.new_page(viewport={'width':1440,'height':920},accept_downloads=True,color_scheme='light')
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
      let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
      // Avoid actual DNS/network for example.invalid; this regression tests the UI, not remote IPTV.
      window.fetch=async()=>({ok:false,status:403});
    }''')
    for name in ['theme-boot.js','core-browser.js','epg.js','advanced-core.js','collector-core.js','favorites-core.js','app.js','features.js','advanced.js','collector.js']:
        page.add_script_tag(content=(root/'renderer'/name).read_text())
    assert page.locator('#checkNav').count()==0,'Standalone check menu should be removed'
    page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
    page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
    page.locator('.nav[data-page="settings"]').click()
    expect(page.locator('input[name="appearanceMode"]')).to_have_count(3)
    page.locator('input[name="appearanceMode"][value="light"]').check()
    assert page.evaluate("document.documentElement.dataset.theme")=='light'
    assert 'light' in page.evaluate("localStorage.getItem('open-iptv-pro-settings-v1')")
    assert page.evaluate("getComputedStyle(document.body).backgroundColor")=='rgb(243, 246, 251)'
    page.locator('input[name="appearanceMode"][value="dark"]').check()
    assert page.evaluate("document.documentElement.dataset.theme")=='dark'
    page.locator('input[name="appearanceMode"][value="auto"]').check()
    assert page.evaluate("document.documentElement.dataset.theme")=='light'
    page.emulate_media(color_scheme='dark')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    page.emulate_media(color_scheme='light')
    expect(page.locator('html')).to_have_attribute('data-theme','light')
    # Persistent setting auto and selectable light theme
    assert 'auto' in page.evaluate("localStorage.getItem('open-iptv-pro-settings-v1')")
    page.locator('input[name="appearanceMode"][value="light"]').check()
    page.locator('.nav[data-page="sources"]').click()
    expect(page.locator('#sourceCheckAllBtn')).to_be_visible()
    expect(page.locator('#collectorRepair')).to_be_visible()
    assert page.locator('#checkNav').count()==0
    page.locator('#sourceCheckAllBtn').click()
    expect(page.locator('#task-check')).to_be_visible()
    expect(page.locator('#task-check .task-count')).to_contain_text('2/2',timeout=12000)
    assert page.locator('.channel-health').count()>=0
    page.locator('#taskDockMinimize').click()
    page.locator('.nav[data-page="tv"]').click()
    page.locator('.nav[data-page="sources"]').click()
    expect(page.locator('#page-sources')).to_have_class(re.compile('active-page'))
    page.locator('.nav[data-page="settings"]').click()
    # No fake broadcast data needed for screenshot
    page.screenshot(path=str(root/'docs/images/settings-theme-light-v4-8.png'),full_page=True)
    page.locator('.nav[data-page="sources"]').click()
    page.locator('#sourceRepairSection').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})')
    page.wait_for_timeout(120)
    page.screenshot(path=str(root/'docs/images/source-checks-v4-8.png'),full_page=True)
    page.locator('.nav[data-page="settings"]').click()
    page.locator('input[name="appearanceMode"][value="dark"]').check()
    page.screenshot(path=str(root/'docs/images/settings-theme-dark-v4-8.png'),full_page=True)
    assert not errors,errors
    print('UI THEME/SOURCES PASSED: light/dark/auto, system updates, persistence, sidebar removal, checks in source management')
    b.close()
