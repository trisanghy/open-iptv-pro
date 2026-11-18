"""Regression: Timeshift DVR quick schedule, status & task dock non-overlap (mock Electron)."""
from pathlib import Path
import shutil,re
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
files=['app-icons.js','languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','doctor-v3-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js','dvr-ui.js']
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 for width in (1360,1000):
  page=browser.new_page(viewport={'width':width,'height':850})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  html=(root/'renderer/index.html').read_text();html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html);html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
  page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
  page.evaluate('''() => {
   let data={};window.__qa={jobs:[],sent:[]};
   Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k],key:i=>Object.keys(data)[i]||null,get length(){return Object.keys(data).length}}});
   window.HTMLMediaElement.prototype.pause=function(){};
   window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
   window.streamleaf={capabilities:async()=>({native:true,platform:'win32',version:'4.23.4',ffmpegExists:true}),
    updateStatus:async()=>({phase:'idle'}),onUpdateStatus:()=>()=>{},
    dvrList:async()=>({directory:'/mock/recordings',jobs:window.__qa.jobs}),
    dvrCreate:async j=>{window.__qa.sent.push(j);const job={...j,id:'job'+(window.__qa.jobs.length+1),status:'scheduled'};window.__qa.jobs.push(job);return job},
    dvrStop:async id=>{let job=window.__qa.jobs.find(x=>x.id===id);job.status='cancelled';return job},
    dvrChooseDirectory:async()=>'/mock/recordings',dvrOpenDirectory:async()=>'',dvrReveal:async()=>true,stopTimeshift:async()=>true};
   window.fetch=async()=>({ok:false,status:403});
  }''')
  for file in files:
   page.add_script_tag(content=(root/'renderer'/file).read_text())
   if file=='app.js':
    page.evaluate('''() => {const st=window.IPTVState.getStore();st.sources=[{id:'qa',name:'QA',type:'url',enabled:true}];st.channels=[{id:'qa-vtv1',name:'VTV1',url:'https://example.invalid/a.ts',sourceId:'qa',group:'News'}];window.IPTVState.render();}''')
  assert page.locator('#dvrQuickToggle').is_visible()
  assert page.locator('#dvrQuickStatus').is_visible()
  assert not page.locator('#dvrQuickForm').is_visible()
  page.locator('#dvrQuickToggle').click()
  expect(page.locator('#dvrQuickForm')).to_be_visible()
  assert 'Chưa chọn kênh' in page.locator('#dvrQuickChannel').inner_text()
  page.locator('#dvrQuickToggle').click()
  # Playing channel -> prefilled quick schedule -> validated backend call
  page.evaluate("window.IPTVState.playChannel('qa-vtv1')")
  page.locator('#dvrQuickToggle').click()
  expect(page.locator('#dvrQuickChannel')).to_contain_text('VTV1')
  page.locator('#dvrQuickSubmit').click()
  expect(page.locator('#dvrQuickStatus')).to_contain_text('Đã hẹn 1 lịch')
  assert page.evaluate('window.__qa.sent.length')==1
  assert not page.locator('#dvrQuickForm').is_visible()
  # Mutate mock status to recording, then navigate away and back to force refresh.
  page.evaluate("window.__qa.jobs[0].status='recording'")
  page.locator('#dvrQuickManage').click()
  expect(page.locator('#dvrPanel')).to_be_visible()
  page.locator('.nav[data-page="tv"]').click()
  expect(page.locator('#dvrQuickStatus')).to_contain_text('ĐANG GHI')
  # Task progress is an in-flow sibling directly before footer, not an overlay.
  page.evaluate("document.querySelector('#taskDock').classList.remove('hidden')")
  dock=page.locator('#taskDock');footer=page.locator('.footer');content=page.locator('.content')
  assert page.evaluate("getComputedStyle(document.querySelector('#taskDock')).position")=='relative'
  for collapsed in (True,False):
   if not collapsed: page.locator('#taskDockMinimize').click()
   bb=dock.bounding_box();fb=footer.bounding_box();cb=content.bounding_box()
   assert bb and fb and cb
   assert bb['y']+bb['height']<=fb['y']+1,(bb,fb)
   assert cb['y']+cb['height']<=bb['y']+1,(cb,bb)
  assert not errors,(width,errors)
  print('DVR QUICK + BOTTOM DOCK PASS',width)
  page.close()
 browser.close()
