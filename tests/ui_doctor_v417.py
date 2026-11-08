from pathlib import Path
import re,shutil,base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
playlist='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" group-title="01 - Tin tức",VTV1 HD
https://example.invalid/live-a.m3u8
#EXTINF:-1 tvg-id="VTV1.vn" group-title="02 - Kênh phụ",VTV1
https://example.invalid/live-b.m3u8
#EXTINF:-1 tvg-id="VTV3.vn" group-title="03 - Giải trí",VTV3 HD
https://example.invalid/live-c.m3u8
'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 page=b.new_page(viewport={'width':1510,'height':950},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=html[:html.index('<script src="../node_modules')]+ '</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => { let items={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>items[k]||null,setItem:(k,v)=>items[k]=String(v),removeItem:k=>delete items[k]}});window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};window.HTMLMediaElement.prototype.pause=function(){}; }''')
 for name in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js','collector.js','doctor-v2.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.locator('#fileInput').set_input_files({'name':'sample.m3u','mimeType':'audio/x-mpegurl','buffer':playlist.encode()})
 expect(page.locator('.channel-item')).to_have_count(3)
 page.evaluate('''() => {const s=window.IPTVState.getStore(),c=document.createElement('canvas');c.width=90;c.height=80;const g=c.getContext('2d');for(let y=0;y<80;y++){for(let x=0;x<90;x++){g.fillStyle=`rgb(${(x*17+y*11)%256},${(x*9+y*23)%256},${(x*3+y*37)%256})`;g.fillRect(x,y,1,1);}}let snap=c.toDataURL('image/png');for(let ch of s.channels.slice(0,2))s.snapshots[ch.url]={data:snap,name:ch.name};window.IPTVState.save();}''')
 page.locator('.nav[data-page="doctor"]').click()
 expect(page.locator('#doctorV2Panel')).to_be_visible()
 page.locator('#doctorVisualMax').select_option('100')
 page.locator('#doctorVisualScan').click()
 expect(page.locator('.doctor-v2-match')).to_have_count(1,timeout=10000)
 expect(page.locator('#doctorVisualStatus')).to_contain_text('1 cặp')
 expect(page.locator('.doctor-v2-match button')).to_have_count(0) # second link has not been verified alive
 page.evaluate('''() => {let c=window.IPTVState.getStore().channels[1];c.status='alive';c.checkedAt=new Date().toISOString()}''')
 page.locator('#doctorVisualScan').click()
 expect(page.locator('.doctor-v2-match button')).to_have_count(1,timeout=10000)
 page.once('dialog',lambda d:d.accept())
 page.locator('.doctor-v2-match button').click()
 assert 'https://example.invalid/live-b.m3u8' in page.evaluate('''() => window.IPTVState.getStore().alternates[window.IPTVState.getStore().channels[0].id]''')
 page.once('dialog',lambda d:d.accept())
 page.locator('#doctorV2Undo').click()
 assert not page.evaluate('''() => window.IPTVState.getStore().alternates[window.IPTVState.getStore().channels[0].id]?.length''')
 assert not errors,errors
 page.screenshot(path=str(root/'docs/images/doctor-v4-17.png'),full_page=True)
 page.locator('.nav[data-page="settings"]').click()
 expect(page.locator('#freezeMonitorEnabled')).to_be_checked()
 page.locator('#freezeMonitorEnabled').uncheck()
 assert page.evaluate("JSON.parse(localStorage.getItem('open-iptv-doctor-v2-settings')).freezeMonitor") is False
 assert not errors,errors
 print('DOCTOR V4.17 UI PASS: safe snapshot comparison, manual action gate, freeze settings, visual report')
 b.close()
