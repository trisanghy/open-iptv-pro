'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('only the new public Supabase project is deployed to Web',()=>{
 const active=JSON.parse(read('cloud-config.json'));
 const fallback=JSON.parse(read('web-online/cloud-deployment.json'));
 assert.equal(active.enabled,true);
 assert.equal(active.url,'https://zjbsvqryaxtafuffpifu.supabase.co');
 assert.equal(active.url,fallback.url);
 assert.equal(active.publishableKey,fallback.publishableKey);
 assert.match(active.publishableKey,/^sb_publishable_/);
 assert.equal(Object.hasOwn(active,'service_role'),false);
 assert.equal(Object.hasOwn(active,'secret'),false);
});

test('GitHub Pages staging cannot override the project with stale Actions vars',()=>{
 const builder=read('web-online/write-cloud-config.py');
 assert.match(builder,/source=Path\(__file__\)\.resolve\(\)\.parent\.parent\/'cloud-config.json'/);
 assert.match(builder,/committed\.get\('url'\) or os\.environ\.get\('SUPABASE_URL'\)/);
 assert.match(builder,/committed\.get\('publishableKey'\) or os\.environ\.get\('SUPABASE_PUBLISHABLE_KEY'\)/);
});

test('old account data is backed up before the new project can clear the prior session',()=>{
 const script=read('cloud-sync.js');
 assert.match(script,/function preserveOldProjectData\(\)/);
 assert.match(script,/localStorage\.setItem\(MIGRATION_BACKUP/);
 assert.match(script,/if\(new URL\(cfg\.url\)\.hostname===NEW_CLOUD_REF\+'\.supabase\.co'&&!preserveOldProjectData\(\)\)return/);
 assert.match(script,/migrationRestore\.addEventListener\('click'/);
 assert.match(script,/confirm\('Khôi phục dữ liệu/);
 assert.match(script,/if\(!saveRecoveryCopy\(uid,remote\.payload/);
 assert.match(script,/if\(!swapIntoLocal\(payload,uid,remote\?\.revision\|\|0\)\)return/);
});

test('web refreshes its cloud script and retains OTP and OAuth provider checks',()=>{
 const html=read('index.html'),script=read('cloud-sync.js');
 assert.match(html,/cloud-sync\.js\?v=ios-visual-caret-20261121a/);
 assert.match(script,/client\.auth\.verifyOtp\(\{email,token,type:'email'\}\)/);
 assert.match(script,/signInWithOAuth\(\{provider/);
 assert.match(script,/enabledProviders\.github/);
});
