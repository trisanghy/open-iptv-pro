# Optional GUI test. Requires: pip install playwright; python -m playwright install chromium
from pathlib import Path
import re
import shutil
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
m3u='''#EXTM3U
#EXTINF:-1 group-title="01 - Tin tức",Tin tức demo
https://example.invalid/01.m3u8
#EXTINF:-1 group-title="01 - Tin tức",Kênh thứ hai
https://example.invalid/02.m3u8
#EXTINF:-1 group-title="02 - Thể thao",Thể thao demo
https://example.invalid/03.m3u8
'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text()
 html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 # mocked storage on about:blank, avoiding any actual IPTV/network calls
 page.evaluate('''() => {
   let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{
   getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
 }''')
 page.add_script_tag(content=(root/'renderer/core-browser.js').read_text())
 page.add_script_tag(content=(root/'renderer/favorites-core.js').read_text())
 page.add_script_tag(content=(root/'renderer/app.js').read_text())
 page.locator('#fileBtn').click()
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':m3u.encode()})
 expect(page.locator('.folder-header')).to_have_count(2)
 expect(page.locator('.channel-item')).to_have_count(3)
 page.locator('#videoFit').select_option('cover')
 assert page.locator('#video').get_attribute('class')=='fit-cover'
 page.locator('#folderCreateBtn').count()
 page.locator('button[data-page="folders"]').click()
 page.locator('#folderCreateBtn').click()
 page.locator('#folderName').fill('Tự tạo')
 page.locator('#modalConfirm').click()
 expect(page.locator('.folder-card')).to_have_count(3)
 page.locator('button[data-page="tv"]').click()
 page.locator('.channel-move').first.click()
 page.locator('#folderSelect').select_option('Tự tạo')
 page.locator('#modalConfirm').click()
 expect(page.locator('.folder-header')).to_have_count(3)
 page.locator('.channel-star').first.click()
 assert page.locator('#favCount').inner_text()=='1'
 assert errors==[],errors
 print('UI PASSED: import, group, create folder, move channel, favorite, fit mode')
 b.close()
