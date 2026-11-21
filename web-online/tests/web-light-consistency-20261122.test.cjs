'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..','..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Web Light patch is loaded last by the actual published index',()=>{
 const html=read('index.html'),css=read('web-light-consistency-20261122.css');
 assert.match(html,/web-light-consistency-20261122\.css\?v=light-audit-20261122a/);
 assert.ok(html.indexOf('web-light-consistency-20261122.css')>html.indexOf('web-source-repair-layout.css'));
 assert.match(css,/html\[data-theme="light"\]/);
 assert.doesNotMatch(css,/data-theme="dark"|data-theme="amoled"|localStorage/);
});
test('Web Light theme covers every functional surface without altering player overlay',()=>{
 const css=read('web-light-consistency-20261122.css');
 for(const key of ['.epg-summary','.epg-tools-fold','.health-table','.doctor-v3-panel',
 '.smart-panel','.source-repair-log-card','.collector-progress','.source-hub','.settings-card',
 '.web-hub-main','.web-hub-side-card','.web-hub-chip.active','#cloudSyncCard',
 '#cloudOtpCode','.cloud-email-input-line','#webMobileVolumePanel','#appSidebar',
 '.dvr-panel','.modal-box']){
   assert.ok(css.includes(key),'Light palette missing: '+key);
 }
 assert.ok(css.includes('html[data-theme="light"] #page-tv :is(.player-box,.player-box video'));
});
test('Web deploy workflow stages CSS automatically and retains known legal controls',()=>{
 const job=read('.github/workflows/deploy-openiptv-web.yml');
 assert.match(job,/find \. -maxdepth 1 -type f/);
 assert.match(job,/name '\*\.css'/);
 assert.match(read('index.html'),/source-use-consent-v1\.js/);
});