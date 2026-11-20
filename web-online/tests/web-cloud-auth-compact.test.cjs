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
  assert.ok(html.includes('href="cloud-sync.css?v=ios-visual-caret-20261121a"'));
  assert.ok(builder.includes('cloud-sync.css?v=ios-visual-caret-20261121a'),
    'Web builder must retain the same versioned CSS on regenerated pages');
  for(const id of ['cloudEmailInput','cloudLinkInput','cloudOtpCode','cloudEmailSend','cloudLinkVerify'])
    assert.ok(html.includes('id="'+id+'"'),'Cloud auth input/button '+id+' missing');
});

test('iPhone uses a native one-row textarea for editable email cursor and selection',()=>{
 const script=read('cloud-sync.js');
 assert.match(html,/<textarea id="cloudEmailInput" rows="1" wrap="off"[^>]+><\/textarea>/);
 assert.doesNotMatch(html,/<input id="cloudEmailInput"/);
 assert.match(script,/const safeEmail=\(\)=>String\(emailInput\?\.value\|\|''\)\.trim\(\)\.toLowerCase\(\)/);
 assert.match(script,/core\.validEmail\(email\)/);
 assert.match(script,/emailInput\?\.addEventListener\('keydown'/);
 assert.match(script,/emailForm\?\.requestSubmit\(\)/);
 assert.match(source,/#cloudSyncCard textarea#cloudEmailInput/);
 assert.match(source,/touch-action:auto!important/);
 assert.match(source,/-webkit-touch-callout:default!important/);
 assert.match(source,/caret-color:currentColor!important/);
 assert.match(source,/resize:none!important/);
 assert.match(builder,/textarea id=\\?"cloudEmailInput\\?" rows=\\?"1\\?" wrap=\\?"off\\?"/);
});

test('iOS visual cursor follows textarea selection without intercepting native edits',()=>{
 const script=read('cloud-sync.js');
 assert.match(html,/<span id="cloudEmailVisualCaret" class="cloud-email-visual-caret" aria-hidden="true" hidden><\/span>/);
 assert.match(html,/cloud-sync\.js\?v=ios-visual-caret-20261121a/);
 assert.match(script,/function attachMobileEmailCaret\(\)/);
 assert.match(script,/emailInput\.selectionStart!==emailInput\.selectionEnd/);
 assert.match(script,/emailInput\.value\.slice\(0,start\)/);
 assert.match(script,/ctx\.measureText\(prefix\)\.width/);
 assert.match(script,/emailInput\.scrollLeft/);
 assert.match(script,/document\.addEventListener\('selectionchange'/);
 assert.match(script,/emailInput\.addEventListener\('touchend'/);
 assert.match(script,/requestAnimationFrame\(paint\)/);
 assert.match(script,/node\.hidden===visible/);
 assert.match(source,/\.cloud-email-editor \{/);
 assert.match(source,/\.cloud-email-visual-caret \{/);
 assert.match(source,/pointer-events:none!important/);
 assert.match(source,/@keyframes cloud-email-caret-blink/);
 assert.match(source,/animation:cloud-email-caret-blink 1s step-end infinite/);
 assert.match(builder,/cloudEmailVisualCaret/);
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
         <div class="cloud-email-editor"><textarea id="cloudEmailInput" rows="1" wrap="off" placeholder="ten@example.com"></textarea><span id="cloudEmailVisualCaret" class="cloud-email-visual-caret" hidden></span></div>
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

test('signed-in account hides guest login copy and prevents restore button overflow',()=>{
 const script=read('cloud-sync.js');
 assert.match(script,/show\(authGuide,!uid&&!!client&&enabledProviders\.email\)/);
 assert.match(script,/show\(providersNote,!uid&&!!client&&\(enabledProviders\.google\|\|enabledProviders\.github\)\)/);
 assert.match(script,/card\.dataset\.authState=uid\?'signed-in':'guest'/);
 assert.match(script,/card\.dataset\.hasMigration=hasMigration\?'true':'false'/);
 assert.match(script,/migrationRestore\.textContent='Khôi phục dữ liệu cũ'/);
 assert.match(html,/id="cloudPrivacyNote"/);
 assert.match(html,/cloud-sync\.js\?v=ios-visual-caret-20261121a/);
 assert.match(source,/#cloudSyncCard\[data-auth-state="signed-in"\] > \.cloud-sync-actions/);
 assert.match(source,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(source,/white-space:normal!important/);
 assert.match(source,/#cloudLogout \{grid-column:1\/-1\}/);
 assert.match(source,/#cloudSyncCard\[data-auth-state="signed-in"\]\[data-has-migration="false"\] #cloudSyncNow/);
});

test('email inputs grow within available width on phone and tablet',()=>{
 assert.match(source,/#cloudSyncCard \.cloud-email-form \.cloud-email-input-line \{/);
 assert.match(source,/display:grid;grid-template-columns:minmax\(0,1fr\) auto/);
 assert.match(source,/width:100%!important;min-width:0!important/);
 assert.match(source,/@media \(max-width:760px\)/);
 assert.match(source,/grid-template-columns:minmax\(0,1fr\);gap:8px/);
 assert.match(html,/id="cloudEmailInput"/);
 assert.match(html,/id="cloudOtpCode"/);
});

test('Chromium regression: cloud account buttons and email input do not overflow',()=>{
 const browser=['google-chrome','chromium','chromium-browser'].find(bin=>
  spawnSync('which',[bin],{encoding:'utf8'}).status===0);
 if(!browser)return; // CI runs this with Chrome; local static checks still apply.
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-cloud-layout-'));
 try{
  const css=path.join(root,'cloud-sync.css');
  const base=path.join(root,'styles.css');
  const htmlFixture='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'
   +'<link rel="stylesheet" href="file://'+base+'"><link rel="stylesheet" href="file://'+css+'">'
   +'<style>body{margin:0;padding:16px}#page-settings{display:block;width:100%}#cloudSyncCard{width:100%}</style></head><body>'
   +'<section id="page-settings"><article class="settings-card" id="cloudSyncCard" data-auth-state="signed-in" data-has-migration="true">'
   +'<h2>Cloud account</h2><div class="cloud-sync-actions">'
   +'<button class="btn btn-primary" id="cloudSyncNow">Đồng bộ ngay</button>'
   +'<button class="btn btn-subtle" id="cloudMigrationRestore">Khôi phục dữ liệu cũ</button>'
   +'<button class="btn btn-subtle" id="cloudLogout">Đăng xuất</button></div>'
   +'<form class="cloud-email-form"><div class="cloud-email-input-line">'
   +'<div class="cloud-email-editor"><textarea id="cloudEmailInput" rows="1" wrap="off" placeholder="ten@example.com"></textarea><span id="cloudEmailVisualCaret" class="cloud-email-visual-caret" hidden></span></div>'
   +'<button class="btn btn-primary" id="cloudEmailSend">Gửi mã OTP qua email</button>'
   +'</div></form></article></section><pre id="test-result"></pre>'
   +'<script>const ids=["cloudSyncCard","cloudSyncNow","cloudMigrationRestore","cloudLogout","cloudEmailInput","cloudEmailSend"];'
   +'document.getElementById("test-result").textContent=JSON.stringify(Object.fromEntries(ids.map(id=>{'
   +'const r=document.getElementById(id).getBoundingClientRect();return [id,{left:r.left,right:r.right,width:r.width,height:r.height}]})));'
   +'</script></body></html>';
  const filename=path.join(dir,'account-layout.html');fs.writeFileSync(filename,htmlFixture);
  for(const width of [390,430,900]){
   const proc=spawnSync(browser,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--window-size='+width+',900','--dump-dom','file://'+filename],{
    encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024
   });
   assert.equal(proc.status,0,'Chrome viewport '+width+' failed: '+(proc.stderr||'').slice(-500));
   const result=proc.stdout.match(/<pre id="test-result">([^<]+)<\/pre>/);
   assert.ok(result,'Missing cloud layout dimensions at '+width);
   const data=JSON.parse(result[1].replace(/&quot;/g,'"'));
   const card=data.cloudSyncCard;
   for(const name of ['cloudSyncNow','cloudMigrationRestore','cloudLogout','cloudEmailInput','cloudEmailSend']){
    const rect=data[name];
    assert.ok(rect.left>=card.left-1&&rect.right<=card.right+1,
     width+'px: '+name+' overflows cloud card ('+rect.left+'..'+rect.right+' vs '+card.left+'..'+card.right+')');
    assert.ok(rect.height>=35,name+' should be touch friendly at '+width+'px');
   }
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('server inventory reads confirmed payload and guards against mistaken local counts',()=>{
 const script=read('cloud-sync.js');
 for(const id of ['cloudServerStats','cloudServerChannelCount','cloudServerUpdatedAt'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(script,/show\(serverStats,!!uid\)/);
 assert.match(script,/core\.serverChannelCount\(row\?\.payload\)/);
 assert.match(script,/\.select\('payload,revision,updated_at'\)\.eq\('user_id',id\)\.maybeSingle\(\)/);
 assert.match(script,/updateServerStats\(id,data\)/);
 assert.match(script,/\.select\('revision,updated_at'\)\.single\(\)/);
 assert.match(script,/\.select\('revision,updated_at'\)\.maybeSingle\(\)/);
 assert.match(script,/if\(!newRev\)continue/);
 assert.match(script,/updateServerStats\(originalId,\{payload:desired,updated_at:/);
 assert.match(script,/uid!==originalId/);
 assert.match(source,/#cloudSyncCard \.cloud-server-stats/);
 assert.match(source,/@media\(max-width:550px\)/);
 assert.match(html,/cloud-sync\.js\?v=ios-visual-caret-20261121a/);
 assert.match(html,/cloud-core\.js\?v=exclude-images-20261120b/);
 assert.match(builder,/server_stats_html/);
 assert.match(builder,/id="cloudServerChannelCount"/);
});
