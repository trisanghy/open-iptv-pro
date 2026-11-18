"""Desktop DVR interface smoke with a fully mocked Electron bridge; no real network or recordings."""
from pathlib import Path
import re,shutil
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
files=['app-icons.js','languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','doctor-v3-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js','dvr-ui.js']
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 for width in (1360,1000):
  page=browser.new_page(viewport={'width':width,'height':850})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda dialog:dialog.accept())
  html=(root/'renderer/index.html').read_text()
  html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
  html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
  page.set_content(html)
  page.add_style_tag(content=(root/'renderer/styles.css').read_text())
  page.evaluate('''() => {
    const data={};window.__qa={jobs:[],sent:[],dir:'/mock/recordings'};
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
     getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k],key:i=>Object.keys(data)[i]||null,get length(){return Object.keys(data).length}
    }});
    const start=Date.now()+600000;
    data['open-iptv-pro-epg-v1']=JSON.stringify({guide:{names:{vtv1:'vtv1'},aliasesById:{vtv1:['VTV1']},programmes:[{id:'vtv1',start,end:start+60*60000,title:'Thời sự QA',description:'Test programme'}]},updatedAt:new Date().toISOString()});
    window.HTMLMediaElement.prototype.pause=function(){};
    window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
    window.streamleaf={
     capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:true,version:'4.23.3'}),
     updateStatus:async()=>({phase:'idle',message:'Đã sẵn sàng'}),onUpdateStatus:()=>()=>{},
     dvrList:async()=>({directory:window.__qa.dir,jobs:[...window.__qa.jobs]}),
     dvrCreate:async job=>{window.__qa.sent.push(job);const saved={...job,id:'job'+(window.__qa.jobs.length+1),status:'scheduled'};window.__qa.jobs.push(saved);return saved},
     dvrStop:async id=>{const item=window.__qa.jobs.find(j=>j.id===id);item.status='cancelled';return item},
     dvrChooseDirectory:async()=>window.__qa.dir,dvrOpenDirectory:async()=>'',dvrReveal:async()=>true,
    };
  }''')
  for file in files:
   page.add_script_tag(content=(root/'renderer'/file).read_text())
   if file=='app.js':
    page.evaluate('''() => {const st=window.IPTVState.getStore();st.sources=[{id:'qa',name:'QA Source',type:'url',enabled:true}];st.channels=[{id:'qa-vtv1',name:'VTV1',tvgId:'vtv1',url:'https://example.com/valid.m3u8',sourceId:'qa',group:'News',status:'unchecked'}] }''')
  page.locator('.nav[data-page="epg"]').click()
  expect(page.locator('#dvrPanel')).to_be_visible()
  expect(page.locator('#dvrChannel option')).to_have_count(1)
  expect(page.locator('.epg-record')).to_have_count(1)
  page.locator('.epg-record').click()
  expect(page.locator('#dvrJobs .dvr-job')).to_have_count(1)
  assert page.evaluate('window.__qa.sent[0].title')=='Thời sự QA'
  page.locator('#dvrJobs .dvr-job-actions button').click()
  expect(page.locator('#dvrJobs .dvr-job')).to_contain_text('Đã hủy')
  page.locator('#dvrTitle').fill('Bản tin thủ công')
  # Existing form has default start/end so can create without editing dates.
  page.locator('#dvrForm button[type="submit"]').click()
  expect(page.locator('#dvrJobs .dvr-job')).to_have_count(2)
  assert page.locator('#dvrAdd').is_enabled()
  assert not errors,errors
  # Main content must remain within horizontal scrollable area at narrow desktop size.
  assert page.locator('#dvrForm').is_visible()
  page.locator('.nav[data-page="settings"]').click()
  page.locator('#appLanguage').select_option('en')
  page.locator('.nav[data-page="epg"]').click()
  expect(page.locator('#dvrPanel h2')).to_contain_text('Scheduled TV recording')
  page.locator('.nav[data-page="settings"]').click()
  page.locator('#appLanguage').select_option('th')
  page.locator('.nav[data-page="epg"]').click()
  expect(page.locator('#dvrPanel h2')).to_contain_text('ตั้งเวลาอัดรายการ')
  print(f'DVR UI PASS {width}px: EPG schedule, cancel, manual schedule, render, exceptions 0')
  page.close()
 browser.close()
