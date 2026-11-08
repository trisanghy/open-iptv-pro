"""Regression v4.13: same star state in channel list, video player, favorites, snapshots, and profiles.
Uses synthetic M3U and mock browser media; does NOT fetch IPTV streams or exercise Mac/Win installers.
"""
from pathlib import Path
import re, shutil, base64
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
A='''#EXTM3U
#EXTINF:-1 group-title="01 - VTV",VTV1 HD
https://demo.invalid/a_vtv1.mp4
#EXTINF:-1 group-title="01 - VTV",VTV2
https://demo.invalid/a_vtv2.mp4
'''
B='''#EXTM3U
#EXTINF:-1 group-title="02 - VTV",VTV1
https://demo.invalid/b_vtv1.mp4
'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=browser.new_page(viewport={'width':1460,'height':920})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'renderer/index.html').read_text()
 html=html.replace('<script src="theme-boot.js"></script>', '')
 html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(ROOT/'renderer/styles.css').read_text())
 page.evaluate('''() => {const data={};window.__data=data;
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
   getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
   window.confirm=()=>true;HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
   HTMLMediaElement.prototype.pause=function(){};
   window.Hls=class {static isSupported(){return true}static Events={ERROR:'error'};on(){}loadSource(){}attachMedia(){}destroy(){}};
 }''')
 for name in ['core-browser.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js']:
  page.add_script_tag(content=(ROOT/'renderer'/name).read_text())
 page.route('https://demo.invalid/**',lambda route:route.abort())
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((ROOT/'assets/icon.png').read_bytes()).decode())
 page.evaluate('([a,b])=>{IPTVState.importSource("Nguồn A","A.m3u",a,"file");IPTVState.importSource("Nguồn B","B.m3u",b,"file");}',[A,B])
 expect(page.locator('.channel-item')).to_have_count(3)
 # Mark via one source. Deduplicate same channel across both sources.
 page.locator('.channel-item').first.locator('.channel-star').click()
 expect(page.locator('#favCount')).to_have_text('1')
 expect(page.locator('.channel-item .channel-star.marked')).to_have_count(2)
 assert page.evaluate('''()=>JSON.parse(window.__data["open-iptv-pro-advanced-v1"]).profiles[0].favoriteKeys[0]==="name:vtv1"''')
 # Main player selects VTV1 from first source, gold star and accessible pressed state.
 page.locator('.channel-item').first.locator('.channel-text').click()
 expect(page.locator('#favCurrentBtn')).to_have_text('★')
 assert page.locator('#favCurrentBtn').get_attribute('aria-pressed')=='true'
 # Player unstars and restars simultaneously in both source rows.
 page.locator('#favCurrentBtn').click()
 expect(page.locator('#favCount')).to_have_text('0')
 expect(page.locator('.channel-item .channel-star.marked')).to_have_count(0)
 page.locator('#favCurrentBtn').click()
 expect(page.locator('#favCount')).to_have_text('1')
 expect(page.locator('.channel-item .channel-star.marked')).to_have_count(2)
 # Favorites filter must show exactly same 1 logical channel as Favorites tab.
 page.locator('.filter-tab[data-filter="fav"]').click()
 expect(page.locator('.channel-item')).to_have_count(1)
 page.locator('.channel-item .channel-star').click()
 expect(page.locator('.channel-item')).to_have_count(0)
 expect(page.locator('#favCurrentBtn')).to_have_text('☆')
 page.locator('.filter-tab[data-filter="all"]').click()
 # Favorites screen unstar updates player and list instantly.
 page.locator('.channel-item').first.locator('.channel-star').click()
 page.locator('.nav[data-page="fav"]').click()
 expect(page.locator('.fav-card')).to_have_count(1)
 page.locator('.fav-card .fav-unstar').click()
 expect(page.locator('.fav-card')).to_have_count(0)
 expect(page.locator('#favCurrentBtn')).to_have_text('☆')
 # Snapshot star toggles favorite without unexpectedly switching channel.
 page.evaluate('''() => {const s=IPTVState.getStore(),c=s.channels[1];
 s.snapshots[c.url]={data:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="110"%3E%3Crect width="200" height="110" fill="%23bacdea"/%3E%3C/svg%3E',name:c.name,date:'demo'};
 IPTVState.save();IPTVState.render();}''')
 page.locator('.nav[data-page="shots"]').click()
 expect(page.locator('.shot-card')).to_have_count(1)
 page.locator('.snapshot-star').click()
 expect(page.locator('#favCount')).to_have_text('1')
 expect(page.locator('.snapshot-star.marked')).to_have_count(1)
 assert page.evaluate('IPTVState.getCurrent().name')=='VTV1 HD'
 page.locator('.nav[data-page="fav"]').click()
 assert 'VTV2' in page.locator('.fav-card').inner_text()
 # Favorites are stored per profile. After switching, parent profile restores its own selection.
 page.locator('.nav[data-page="profiles"]').click()
 page.locator('#profileName').fill('Khác')
 page.locator('#profileCreate').click()
 expect(page.locator('#profileChoice option')).to_have_count(2)
 page.locator('#profileChoice').select_option(index=1)
 page.locator('#profileSwitch').click()
 expect(page.locator('#favCount')).to_have_text('0')
 page.locator('#profileChoice').select_option('admin')
 page.locator('#profileSwitch').click()
 expect(page.locator('#favCount')).to_have_text('1')
 # Delete source A, VTV2 has no replacement; favorites hidden but key retained.
 page.locator('.nav[data-page="sources"]').click()
 page.locator('.source-card').first.locator('.src-delete').click()
 expect(page.locator('#favCount')).to_have_text('0')
 # Reimport VTV2 under another source and restore favorite by stable name.
 page.evaluate('''()=>IPTVState.importSource("Nguồn C","C.m3u","#EXTM3U\\n#EXTINF:-1 group-title=\\"C\\",VTV2\\nhttps://demo.invalid/c_vtv2.mp4\\n","file")''')
 expect(page.locator('#favCount')).to_have_text('1')
 page.locator('.nav[data-page="fav"]').click()
 expect(page.locator('.fav-card')).to_have_count(1)
 assert 'Nguồn C' in page.locator('.fav-card').inner_text()
 # Actual UI screenshot with test data, no copyrighted video frames.
 page.locator('#toastArea').evaluate('(el)=>el.replaceChildren()')
 page.screenshot(path=str(ROOT/'docs/images/favorites-v4-13.png'),full_page=True)
 assert not errors,errors
 print('FAVORITE SYNC UI PASSED: list/player/favorites/snapshot, profile, source delete/reimport')
 browser.close()
