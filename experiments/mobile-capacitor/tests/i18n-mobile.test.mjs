import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
const i18n=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'public/languages.bundle.js'),'utf8');
test('Capacitor Mobile exposes a display language chooser in Settings',()=>{
 assert.match(layout,/id="appLanguage"/);assert.match(layout,/for="appLanguage"/);
 assert.match(layout,/Ngôn ngữ giao diện/);assert.match(layout,/page-tools/);
 assert.match(html,/src="\/languages.bundle.js"/);assert.match(html,/src="\/i18n.js"/);
 assert.ok(html.indexOf('/languages.bundle.js')<html.indexOf('/i18n.js'));
});
test('Mobile embeds offline translations, 17 language options and persistence',()=>{
 for(const c of ['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']) assert.ok(i18n.includes('"'+c+'":'),c);
 assert.match(i18n,/open-iptv-pro-language/);
 assert.match(i18n,/const mobileUiEnglish=/);
 assert.match(i18n,/const collectionCastEnglish=/);
 assert.match(i18n,/const advancedUiEnglish=/);
 assert.match(i18n,/const appUiEnglish=/);
 assert.match(i18n,/const finishUiEnglish=/);
 assert.match(i18n,/Account & Cloud Sync/);
 assert.match(i18n,/Background audio/);
 assert.match(i18n,/Import an M3U playlist or choose a channel/);assert.match(i18n,/english\[compact\]/);
 assert.match(i18n,/channel-card \.channel-name/);
 assert.match(bundle,/window.OPEN_IPTV_TRANSLATIONS/);
});
