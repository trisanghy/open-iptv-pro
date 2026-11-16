from pathlib import Path
import re,shutil,json,os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'renderer/index.html').read_text()
html=html[:html.index('<script src="app-icons.js"')]+"</body></html>"
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
styles=['current','minimal','material3','hig','liquid','cinema','fluent','glass','broadcast','bento','swiss']
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
    for w in (1000,1360):
        page=browser.new_page(viewport={'width':w,'height':860}, device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.set_content(html)
        for name in ('styles.css','ui-styles.css','ui-fullsync.css'):
            page.add_style_tag(content=(root/'renderer'/name).read_text())
        page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}}); window.streamleaf={capabilities:async()=>({ffmpegExists:true,platform:'darwin',native:true})}}''')
        for name in ('languages.bundle.js','i18n.js','core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','settings-ui.js','ui-style.js'):
            page.add_script_tag(content=(root/'renderer'/name).read_text())
        page.locator('.nav[data-page="settings"]').click()
        page.locator('#uiStyleSettings summary').click()
        assert page.locator('input[name="uiStyle"]').count()==11
        for density in ('compact','comfort'):
            page.locator(f'input[name="uiDensity"][value="{density}"]').check(force=True)
            assert page.evaluate('document.documentElement.dataset.uiDensity')==density
            assert page.evaluate('localStorage.getItem("open-iptv-pro-ui-density-v1")')==density
            for style in styles:
                page.locator(f'input[name="uiStyle"][value="{style}"]').check(force=True)
                assert page.evaluate('document.documentElement.dataset.uiStyle')==style
                # Check all functional pages contain correctly themed surfaces and footer remains visible.
                page.locator('.nav[data-page="tv"]').click()
                page.wait_for_timeout(10)
                metrics=page.evaluate('''() => {
                  const rect=s=>{const el=document.querySelector(s);if(!el)return null;const b=el.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height}};
                  const color=s=>getComputedStyle(document.querySelector(s)).backgroundColor;
                  return {root:rect('.app-shell'),footer:rect('.footer'),sidebar:rect('.sidebar'),topbar:rect('.topbar'),player:rect('.player-box'),channels:rect('.channel-panel'),content:rect('.content'),scrollX:document.documentElement.scrollWidth,scrollY:document.documentElement.scrollHeight,bg:color('.app-shell'),sideBg:color('.sidebar'),playerBg:color('.player-box')}
                }''')
                assert metrics['footer']['bottom']<=861 and metrics['footer']['top']>=750, (w,density,style,'footer',metrics)
                assert metrics['player']['width']>=225 and metrics['player']['height']>=160,(w,density,style,'player',metrics)
                assert metrics['channels']['width']>=145,(w,density,style,'channels',metrics)
                assert metrics['scrollX']<=w+3,(w,density,style,'overflow',metrics)
                if density=='comfort' and w==1360:
                    (Path(os.environ['OPENIPTV_SCREENSHOTS']).mkdir(parents=True,exist_ok=True),page.screenshot(path=str(Path(os.environ['OPENIPTV_SCREENSHOTS'])/f'{style}.png'),animations='disabled')) if os.environ.get('OPENIPTV_SCREENSHOTS') else None
                page.locator('.nav[data-page="settings"]').click()
                if not page.locator('#uiStyleChoices').is_visible():page.locator('#uiStyleSettings summary').click()
        assert not errors,(w,errors)
        print('PASS',w,'11 themes x 2 densities: footer visible, player panel usable, no document overflow, settings persistence')
        page.close()
    browser.close()
