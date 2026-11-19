'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('web-online/cloud-sync.css');
const deployed=read('cloud-sync.css');
const html=read('index.html');
const builder=read('web-online/prepare-web.py');

test('Web and build source ship the same compact Supabase form CSS',()=>{
  assert.equal(deployed,source,'Published cloud CSS must match source used by prepare-web.py');
  assert.match(source,/the desktop flex-basis \(220px\) becomes INPUT HEIGHT/);
  assert.match(source,/@media \(max-width:550px\)/);
  for(const field of ['cloudEmailInput','cloudOtpCode','cloudLinkInput'])
    assert.ok(source.includes('#cloudSyncCard #'+field),'Expected compact '+field+' selector');
  assert.match(source,/flex:0 0 44px!important/);
  assert.match(source,/max-height:44px!important/);
  assert.match(source,/font-size:16px/);
  assert.match(source,/\.cloud-email-input-line > button/);
  assert.ok(!html.includes('href="cloud-sync.css"'),'Live page must invalidate old Safari CSS cache');
  assert.ok(html.includes('href="cloud-sync.css?v=auth-input-compact-20261119a"'));
  assert.ok(builder.includes('href=\\"cloud-sync.css?v=auth-input-compact-20261119a\\"'),
    'Web builder must retain the same versioned CSS on regenerated pages');
  for(const id of ['cloudEmailInput','cloudLinkInput','cloudOtpCode','cloudEmailSend','cloudLinkVerify'])
    assert.ok(html.includes('id="'+id+'"'),'Cloud auth input/button '+id+' missing');
});

test('Chromium layout: iPhone email, magic link and OTP fields remain 44px high',()=>{
 const available=['google-chrome','chromium','chromium-browser'].find(bin=>{
   const result=spawnSync('which',[bin],{encoding:'utf8'});return result.status===0;
 });
 if(!available){
   // CSS/HTML contract still runs locally; deploy CI supplies Chrome for the actual layout check.
   return;
 }
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-cloud-compact-'));
 try{
   const styles=path.join(root,'styles.css');
   const cloud=path.join(root,'web-online/cloud-sync.css');
   const fixture=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
     <link rel="stylesheet" href="file://${styles}"><link rel="stylesheet" href="file://${cloud}">
     </head><body><div id="page-settings" class="active-page"><article id="cloudSyncCard" class="settings-card">
     <form id="cloudEmailForm" class="cloud-email-form">
       <label for="cloudEmailInput">Email</label><div class="cloud-email-input-line">
         <input id="cloudEmailInput" type="email" placeholder="ten@example.com" />
         <button class="btn btn-primary" id="cloudEmailSend">Send sign-in email</button>
       </div></form>
     <div id="cloudLinkForm" class="cloud-email-form"><label for="cloudLinkInput">Link verification</label>
       <div class="cloud-email-input-line"><input id="cloudLinkInput" type="url" placeholder="Paste link" />
         <button class="btn" id="cloudLinkVerify">Verify</button></div></div>
     <div id="cloudOtpForm" class="cloud-email-form"><div class="cloud-email-input-line">
       <input id="cloudOtpCode" placeholder="Code" /><button class="btn">Verify code</button>
     </div></div></article></div>
     <pre id="test-result"></pre>
     <script>document.getElementById('test-result').textContent=JSON.stringify(
       Object.fromEntries(['cloudEmailInput','cloudLinkInput','cloudOtpCode','cloudEmailSend','cloudLinkVerify']
         .map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,{height:r.height,width:r.width}]})));
     </script></body></html>`;
   const file=path.join(dir,'mobile-cloud-login.html');
   fs.writeFileSync(file,fixture);
   for(const width of [390,430]){
     const proc=spawnSync(available,
       ['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
        '--window-size='+width+',900','--dump-dom','file://'+file],{
        encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024
       });
     assert.equal(proc.status,0,'Headless Chrome '+width+' failed: '+(proc.stderr||'').slice(-750));
     const data=proc.stdout.match(/<pre id="test-result">([^<]+)<\/pre>/);
     assert.ok(data,'Missing browser layout measurements at width '+width);
     const measurements=JSON.parse(data[1].replace(/&quot;/g,'"'));
     for(const id of ['cloudEmailInput','cloudLinkInput','cloudOtpCode']){
       assert.ok(measurements[id].height>=38&&measurements[id].height<=52,
         width+'px viewport: '+id+' is '+measurements[id].height+'px high (expected compact)');
       assert.ok(measurements[id].width>100,
         width+'px viewport: '+id+' is too narrow');
     }
     for(const id of ['cloudEmailSend','cloudLinkVerify'])
       assert.ok(measurements[id].height>=40, id+' should remain touch-friendly');
   }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
