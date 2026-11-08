"""Headless UI regression: independently configurable 1..32 parallel link checks and FFmpeg captures.
No remote IPTV requests are made; 40 synthetic streams are mocked.
"""
from pathlib import Path
import re,shutil
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
channels=['#EXTM3U']
for i in range(40):
    channels.extend([f'#EXTINF:-1 group-title="Group {i//10+1}",Synthetic channel {i+1}',f'https://example.invalid/test{i+1}.m3u8'])
playlist='\n'.join(channels)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
    page=browser.new_page(viewport={'width':1530,'height':920})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'renderer/index.html').read_text()
    html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
    html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(root/'renderer/styles.css').read_text())
    page.evaluate('''() => {
      const data={};window.__testStorage=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
       getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]
      }});
      window.confirm=()=>true;
      window.__jobs={check:{active:0,max:0,calls:0},shot:{active:0,max:0,calls:0}};
      window.streamleaf={
       check:async url=>{const t=window.__jobs.check;t.calls++;t.active++;t.max=Math.max(t.max,t.active);
         try{await new Promise(r=>setTimeout(r,330));return {status:'alive',positiveEvidence:true,reason:'Synthetic video segment OK'};}finally{t.active--;}
       },
       snapshot:async (url,name)=>{const t=window.__jobs.shot;t.calls++;t.active++;t.max=Math.max(t.max,t.active);
         try{await new Promise(r=>setTimeout(r,300));return {method:'Mock',data:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22360%22 height=%22200%22%3E%3C/svg%3E'};}finally{t.active--;}
       },
       capabilities:async()=>({snapshotBase:'',ffmpegExists:true})
      };
    }''')
    for name in ['core-browser.js','epg.js','favorites-core.js','collector-core.js','app.js','features.js','collector.js']:
        page.add_script_tag(content=(root/'renderer'/name).read_text())
    page.evaluate('(s)=>window.IPTVState.importSource("Synthetic tests","synthetic.m3u",s,"file")',playlist)
    expect(page.locator('.channel-item')).to_have_count(40)
    page.locator('.nav[data-page="settings"]').click()
    assert page.locator('#checkWorkersSetting option').count()==32
    assert page.locator('#snapshotWorkersSetting option').count()==32
    assert page.locator('#checkWorkersSetting').input_value()=='4'
    assert page.locator('#snapshotWorkersSetting').input_value()=='4'
    page.locator('#checkWorkersSetting').select_option('32')
    page.locator('#snapshotWorkersSetting').select_option('32')
    state=page.evaluate('''() => {const s=window.IPTVState.getStore();const p=JSON.parse(localStorage.getItem('open-iptv-pro-4'));return [s.checkConcurrency,s.snapshotConcurrency,p.checkConcurrency,p.snapshotConcurrency]}''')
    assert state==[32,32,32,32],state
    page.locator('.nav[data-page="sources"]').click()
    assert page.locator('#checkWorkersQuick').input_value()=='32'
    page.locator('#sourceCheckAllBtn').click()
    # Link checking and snapshots must be able to overlap.
    page.locator('.nav[data-page="shots"]').click()
    assert page.locator('#snapshotWorkersQuick').input_value()=='32'
    page.locator('#shotsAllBtn').click()
    expect(page.locator('#task-check')).to_be_visible()
    expect(page.locator('#task-shots')).to_be_visible()
    expect(page.locator('#task-check .task-title')).to_contain_text('32 luồng')
    expect(page.locator('#task-shots .task-title')).to_contain_text('32 luồng')
    expect(page.locator('#task-check .task-count')).to_have_text('40/40 kênh',timeout=14000)
    expect(page.locator('#task-shots .task-count')).to_have_text('40/40 kênh',timeout=14000)
    observed=page.evaluate('window.__jobs')
    assert observed['check']['max']==32,observed
    assert observed['shot']['max']==32,observed
    assert observed['check']['calls']==40 and observed['shot']['calls']==40,observed
    assert observed['check']['active']==0 and observed['shot']['active']==0,observed
    # Changing the quick selectors persists and remains independent.
    page.locator('#snapshotWorkersQuick').select_option('32')
    page.locator('.nav[data-page="sources"]').click()
    page.locator('#checkWorkersQuick').select_option('2')
    # Second run proves that 32 concurrent FFmpeg captures are scheduled,
    # while reducing checks to 2 limits their actual network pressure.
    page.evaluate('''() => {window.__jobs.check={active:0,max:0,calls:0};window.__jobs.shot={active:0,max:0,calls:0};}''')
    page.locator('#sourceCheckAllBtn').click()
    page.locator('.nav[data-page="shots"]').click()
    page.locator('#snapshotSkipQuick').uncheck()
    page.locator('#shotsAllBtn').click()
    expect(page.locator('#task-check .task-count')).to_have_text('40/40 kênh',timeout=15000)
    expect(page.locator('#task-shots .task-count')).to_have_text('40/40 kênh',timeout=15000)
    observed=page.evaluate('window.__jobs')
    assert observed['check']['max']==2,observed
    assert observed['shot']['max']==32,observed
    page.locator('.nav[data-page="settings"]').click()
    assert page.locator('#checkWorkersSetting').input_value()=='2'
    assert page.locator('#snapshotWorkersSetting').input_value()=='32'
    # Display controls at their new maximum for the documentation screenshot.
    page.locator('#checkWorkersSetting').select_option('32')
    # Display un-obscured settings screenshot with real UI controls and demo data.
    page.evaluate("""() => {document.querySelector('#taskDock').classList.add('hidden');document.querySelector('#toastArea').replaceChildren();}""")
    page.locator('#checkPerformanceSettings').scroll_into_view_if_needed()
    page.locator('#checkPerformanceSettings').screenshot(path=str(root/'docs/images/check-concurrency-v4-12.png'))
    page.locator('#snapshotPerformanceSettings').screenshot(path=str(root/'docs/images/snapshot-concurrency-v4-12.png'))
    # The same check setting also controls the merged-playlist repair job.
    page.locator('#checkWorkersSetting').select_option('32')
    page.evaluate('''() => {const s=window.IPTVState.getStore();
      s.sources.push({id:'collector_merged',name:'Gộp kiểm thử',enabled:true,type:'file'});
      for(const ch of s.channels)ch.sourceId='collector_merged';
      window.__jobs.check={active:0,max:0,calls:0};
      window.IPTVState.save();window.IPTVState.render();
    }''')
    page.locator('.nav[data-page="sources"]').click()
    page.locator('#collectorRepair').click()
    expect(page.locator('#collectorStatus')).to_contain_text('Đã kiểm tra 40 kênh',timeout=16000)
    repaired=page.evaluate('window.__jobs.check')
    assert repaired['max']==32,repaired
    assert repaired['calls']==40,repaired
    assert not errors,errors
    print('UI CONCURRENCY PASS: 32 checks and 32 snapshots concurrently, 2 checks with 32 snapshots, 32 merged-playlist repairs; persistent 1..32')
    browser.close()
