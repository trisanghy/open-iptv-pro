"""Regression: Favorites follow enabled sources and remain one logical channel after refresh/delete."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import re,shutil,base64
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=browser.new_page(viewport={'width':1360,'height':850})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});window.confirm=()=>true;}''')
 for name in ['core-browser.js','favorites-core.js','app.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 playlist_a='#EXTM3U\n#EXTINF:-1 group-title="01 - VTV",VTV1 HD\nhttps://a.example/1.m3u8\n#EXTINF:-1 group-title="01 - VTV",VTV2\nhttps://a.example/2.m3u8\n'
 playlist_b='#EXTM3U\n#EXTINF:-1 group-title="02 - VTV",VTV1\nhttps://b.example/1.m3u8\n#EXTINF:-1 group-title="02 - VTV",VTV3\nhttps://b.example/3.m3u8\n'
 page.evaluate('([a,b])=>{window.IPTVState.importSource("Nguồn A","a.m3u",a,"file");window.IPTVState.importSource("Nguồn B","b.m3u",b,"file");}',[playlist_a,playlist_b])
 expect(page.locator('.channel-item')).to_have_count(4)
 page.locator('.channel-item').first.locator('.channel-star').click()
 expect(page.locator('#favCount')).to_have_text('1')
 page.locator('.nav[data-page="fav"]').click();expect(page.locator('.fav-card')).to_have_count(1)
 assert 'VTV1' in page.locator('.fav-card').inner_text()
 # Delete A: favorite should switch to B, not linger as orphaned card.
 page.locator('.nav[data-page="sources"]').click();page.locator('.source-card').first.locator('.src-delete').click()
 expect(page.locator('#favCount')).to_have_text('1')
 page.locator('.nav[data-page="fav"]').click();expect(page.locator('.fav-card')).to_have_count(1)
 assert 'Nguồn B' in page.locator('.fav-card').inner_text()
 # Disable B: no visible favorite but retain the preference for a future imported source.
 page.locator('.nav[data-page="sources"]').click();page.locator('.source-card .toggle').first.uncheck()
 expect(page.locator('#favCount')).to_have_text('0')
 page.locator('.nav[data-page="fav"]').click();expect(page.locator('.fav-card')).to_have_count(0)
 # Re-enable source, list updates instantly.
 page.locator('.nav[data-page="sources"]').click();page.locator('.source-card .toggle').first.check()
 expect(page.locator('#favCount')).to_have_text('1')
 # Refresh URL with same channel name should keep favorite identity but switch to new URL.
 page.evaluate('''() => {let s=window.IPTVState.getStore();const ch=s.channels.find(x=>x.name==='VTV1');ch.url='https://b.example/new.m3u8';window.IPTVState.render();window.IPTVState.save();}''')
 assert page.evaluate("window.IPTVState.getStore().favorites.includes('https://b.example/new.m3u8')")
 page.locator('.nav[data-page="fav"]').click();expect(page.locator('.fav-card')).to_have_count(1)
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.screenshot(path=str(root/'docs/images/favorites-v4-9.png'),full_page=True)
 # Unstar removes across sources, no hidden favorite keys.
 page.locator('.fav-card .fav-unstar').click();expect(page.locator('#favCount')).to_have_text('0')
 assert not errors, errors
 print('FAVORITES/SOURCES UI PASSED: dedup, delete, disable, re-enable, URL refresh, unstar')
 browser.close()
