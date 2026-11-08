from pathlib import Path
import base64
import re,shutil,datetime
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
now=datetime.datetime.now(datetime.timezone.utc)
fmt=lambda t:t.strftime('%Y%m%d%H%M%S +0000')
xml=f'''<?xml version="1.0"?><tv generator-info-name="test"><channel id="VTV1.vn"><display-name>VTV1</display-name></channel><programme channel="VTV1.vn" start="{fmt(now-datetime.timedelta(minutes=5))}" stop="{fmt(now+datetime.timedelta(minutes=55))}"><title>Chương trình sáng thử nghiệm</title><desc>Thông tin giới thiệu bằng dữ liệu giả lập.</desc></programme><programme channel="VTV1.vn" start="{fmt(now+datetime.timedelta(minutes=55))}" stop="{fmt(now+datetime.timedelta(hours=2))}"><title>Thời sự kế tiếp</title></programme></tv>'''
channels='''#EXTM3U\n#EXTINF:-1 tvg-id="VTV1.vn" group-title="01 - VTV",VTV1 HD\nhttps://example.invalid/channel1.m3u8\n#EXTINF:-1 group-title="02 - Demo",Kênh Demo\nhttps://example.invalid/channel2.m3u8\n'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1460,'height':930},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text()
 html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>'
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}''')
 for filename in ['core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js']:
  page.add_script_tag(content=(root/'renderer'/filename).read_text())
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':channels.encode()})
 expect(page.locator('.folder-header')).to_have_count(2)
 assert page.locator('.live-label').count()==0
 assert page.locator('.player-top').count()==0
 page.locator('.nav[data-page="settings"]').click()
 expect(page.locator('#epgSources input[type=checkbox]')).to_have_count(4)
 page.locator('#themePicker').fill('#fd8844')
 assert page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()")=='#fd8844'
 page.locator('#colorWheel').click(position={'x':145,'y':84})
 assert page.locator('#themePicker').input_value().startswith('#')
 page.locator('#releaseRepo').fill('myaccount/open-iptv-pro')
 page.locator('#releaseRepo').dispatch_event('change')
 page.locator('.nav[data-page="epg"]').click()
 page.evaluate('''data => {const s=window.IPTVState.getStore();const g=window.IPTVGuide.parse(data,s.channels);localStorage.setItem('testGuide',JSON.stringify(g));window.__testEPG=g;}''',xml)
 assert page.evaluate("window.IPTVGuide.when('20261108060000 +0700')") == int(datetime.datetime(2026,11,7,23,tzinfo=datetime.timezone.utc).timestamp()*1000)
 # Use the public refresh path with mocked desktop backend to verify guide display
 page.evaluate('''() => {window.streamleaf={fetchEPG:async()=>({xml:window.__xml})}}''')
 page.evaluate('(x)=>{window.__xml=x}',xml)
 page.locator('#epgRefreshBtn').click()
 expect(page.locator('.epg-row')).to_have_count(1,timeout=5000)
 assert 'Chương trình sáng thử nghiệm' in page.locator('.epg-row').inner_text()
 page.locator('.nav[data-page="tv"]').click()
 assert page.locator('.channel-epg').count()==1
 page.locator('#pipBtn').click()
 assert page.locator('.toast').count()>=1
 # Screenshot images are actual UI captures with synthetic test data, not actual broadcast
 page.evaluate("document.getElementById('resetThemeBtn').click()")
 page.locator('#toastArea').evaluate('(el)=>el.replaceChildren()')
 page.screenshot(path=str(root/'docs/images/interface-v4-1.png'),full_page=True)
 page.locator('.nav[data-page="epg"]').click()
 page.screenshot(path=str(root/'docs/images/epg-v4-1.png'),full_page=True)
 page.locator('.nav[data-page="settings"]').click()
 page.screenshot(path=str(root/'docs/images/settings-v4-1.png'),full_page=True)
 assert not errors,errors
 print('UI EPG PASSED: badges removed, EPG matching/display, PiP fallback, color wheel, settings, cached guide')
 b.close()
