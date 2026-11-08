from pathlib import Path
import re, shutil, base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
playlist='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" group-title="02 - Tin" catchup-source="https://example.invalid/play?start={start}&duration={duration}",VTV1 HD
https://demo.invalid/a.m3u8
#EXTINF:-1 group-title="01 - Sport",Sport One
https://demo.invalid/b.mp4
#EXTINF:-1 group-title="01 - Sport",Sport Two
https://demo.invalid/c.mp4
#EXTINF:-1 group-title="03 - Films",Films
https://demo.invalid/d.mp4
'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1560,'height':960},accept_downloads=True)
 errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};window.HTMLMediaElement.prototype.pause=function(){}; }''')
 for name in ['core-browser.js','advanced-core.js','epg.js','favorites-core.js','app.js','features.js','advanced.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 page.locator('.brand-icon img').evaluate('(el,v)=>{el.src=v}', 'data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
 expect(page.locator('.folder-header')).to_have_count(3)
 # multiview and hover-audio
 page.locator('.nav[data-page="multiview"]').click()
 expect(page.locator('.multi-tile')).to_have_count(4)
 page.locator('#multiTile0 select').select_option(index=1)
 page.locator('#multiTile1 select').select_option(index=2)
 page.locator('#multiTile0').hover()
 assert page.locator('#multiTile0').get_attribute('class').find('audible')>=0
 assert page.locator('#multiTile1').get_attribute('class').find('audible')<0
 page.locator('#multiStop').click()
 # Backup configs
 page.locator('.nav[data-page="health"]').click()
 page.locator('#backupURLs').fill('https://backup.invalid/b.m3u8')
 page.locator('#backupSave').click()
 assert page.evaluate('''() => Object.values(window.IPTVState.getStore().alternates)[0][0]''')=='https://backup.invalid/b.m3u8'
 page.locator('#bufferPreset').select_option('stable')
 # doctor
 page.locator('.nav[data-page="doctor"]').click()
 expect(page.locator('.doctor-metrics article')).to_have_count(6)
 assert page.locator('#doctorReport').inner_text().find('Thiếu tvg-id')>=0
 # profiles
 page.locator('.nav[data-page="profiles"]').click()
 page.locator('#profileName').fill('Trẻ em')
 page.locator('#profileChild').check()
 page.locator('#profileCreate').click()
 expect(page.locator('#profileChoice option')).to_have_count(2)
 # EPG search UI
 page.locator('.nav[data-page="epg"]').click()
 page.locator('#epgGlobalSearch').fill('thời sự')
 page.locator('#epgSearchGo').click()
 assert 'Chưa tìm thấy' in page.locator('#epgSearchResults').inner_text()
 # check no code errors
 assert not errs,errs
 page.locator('#toastArea').evaluate('(el)=>el.replaceChildren()')
 page.locator('.nav[data-page="multiview"]').click()
 page.screenshot(path=str(root/'docs/images/multiview-v4-4.png'),full_page=True)
 page.locator('.nav[data-page="health"]').click()
 page.screenshot(path=str(root/'docs/images/health-v4-4.png'),full_page=True)
 page.locator('.nav[data-page="doctor"]').click()
 page.screenshot(path=str(root/'docs/images/doctor-v4-4.png'),full_page=True)
 print('ADVANCED UI PASSED: multiview/hover audio, backups, optimizer, doctor, profiles, EPG search')
 b.close()
