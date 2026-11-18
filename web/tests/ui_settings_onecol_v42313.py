"""Browser regression: accent scrollbars, single-row settings and backup in settings only."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,shutil
root=Path(__file__).resolve().parents[1]
html=(root/'renderer/index.html').read_text(encoding='utf-8')
html=html[:html.index('<script src="app-icons.js"')]+'</body></html>'
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
    for width in (1000,1360):
        page=browser.new_page(viewport={'width':width,'height':850})
        errors=[];page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(html)
        for name in ('styles.css','ui-styles.css','ui-fullsync.css','ui-refined.css','ui-polish.css'):
            page.add_style_tag(content=(root/'renderer'/name).read_text(encoding='utf-8'))
        page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});window.streamleaf={capabilities:async()=>({ffmpegExists:true,platform:'darwin',native:true})};}''')
        for name in ('languages.bundle.js','i18n.js','core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','settings-ui.js','ui-style.js'):
            page.add_script_tag(content=(root/'renderer'/name).read_text(encoding='utf-8'))
        assert page.locator('#backupNav').count()==0
        page.locator('.nav[data-page="settings"]').click()
        assert page.locator('#backupSettings').count()==1
        assert page.locator('#backupExportBtn').count()==1
        assert page.locator('#backupImportBtn').count()==1
        folds=page.locator('#page-settings .settings-grid > details.settings-accordion')
        assert folds.count()>=9,folds.count()
        for density in ('compact','comfort'):
            page.locator('#uiStyleSettings summary').click()
            page.locator(f'input[name="uiDensity"][value="{density}"]').evaluate("el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}")
            for style in ('current','cinema','glass','material3','swiss'):
                page.locator(f'input[name="uiStyle"][value="{style}"]').evaluate("el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}")
                page.locator('#uiStyleSettings summary').click()
                rows=page.evaluate('''() => [...document.querySelectorAll('#page-settings .settings-grid > details.settings-accordion')].map(el=>{let r=el.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height,summary:el.querySelector('summary').getBoundingClientRect().height}})''')
                assert all(abs(r['x']-rows[0]['x'])<2 and abs(r['width']-rows[0]['width'])<2 for r in rows), (width,density,style,'grid',rows)
                assert all(rows[i]['y']>=rows[i-1]['y']+rows[i-1]['height']-2 for i in range(1,len(rows))), (width,density,style,'two columns')
                assert all(row['summary']<=65 for row in rows),(width,density,style,'heading too tall',rows)
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 2'),(width,style,'document horizontal overflow')
                page.locator('#uiStyleSettings summary').click()
        page.locator('input[name="uiStyle"][value="material3"]').evaluate("el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}")
        # Scrollbar color in Chromium should track the user's actual accent even across presets.
        def scroll_color():return page.evaluate('getComputedStyle(document.querySelector(".content")).scrollbarColor')
        before=scroll_color()
        page.locator('#uiStyleSettings summary').click()
        page.locator('#colorSettings summary').click()
        page.locator('#themePicker').evaluate('''el=>{el.value='#ff5522';el.dispatchEvent(new Event('input',{bubbles:true}));}''')
        after=scroll_color()
        assert before!=after,(width,'accent scrollbar did not change',before,after)
        assert page.evaluate('document.documentElement.dataset.customAccent')=='true'
        assert page.evaluate('getComputedStyle(document.querySelector("#themePicker")).accentColor') # sanity
        page.locator('#backupSettings summary').click()
        assert page.locator('#backupSettings').get_attribute('open') is not None
        assert page.locator('#backupExportBtn').is_visible()
        assert not errors,(width,errors)
        print('PASS',width,'single-column settings, 5 styles x 2 densities, scrollbar follows accent, backup accessible')
        page.close()
    browser.close()
