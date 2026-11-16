'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'renderer','index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer','ui-polish.css'),'utf8');
const backup=fs.readFileSync(path.join(root,'renderer','backup-ui.js'),'utf8');
const settings=fs.readFileSync(path.join(root,'renderer','settings-ui.js'),'utf8');
test('Sidebar has no duplicate Backup/Restore entry; settings remains functional',()=>{
 assert.doesNotMatch(html,/id="backupNav"/);
 for(const id of ['backupSettings','backupExportBtn','backupImportBtn'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(settings,/window\.IPTVSettingsUI=\{openSection\}/);
 assert.match(backup,/backupExport/);assert.match(backup,/backupRestore/);
});
test('Settings accordion uses a single full-width column with one-line summary',()=>{
 assert.match(html,/href="ui-polish\.css"/);
 assert.match(css,/#page-settings \.settings-grid[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
 assert.match(css,/#page-settings \.settings-accordion-heading[\s\S]*?flex-wrap: nowrap/);
 assert.match(css,/settings-accordion-hint[\s\S]*?white-space: nowrap/);
});
test('Native scrollbar and horizontal scrollbars inherit the palette accent',()=>{
 assert.match(css,/--iptv-scroll-thumb:.*var\(--ui-primary/);
 assert.match(css,/html, html \*.*[\s\S]*?scrollbar-color: var\(--iptv-scroll-thumb\)/);
 assert.match(css,/::-webkit-scrollbar-thumb/);
 assert.match(css,/::-webkit-scrollbar-corner/);
 assert.match(css,/input\[type="range"\]/);
});
