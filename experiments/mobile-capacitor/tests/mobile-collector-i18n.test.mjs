import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('mobile collector metrics switch language without rewriting IPTV channel names',()=>{
 const source=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
 const document={documentElement:{},readyState:'loading',addEventListener(){},getElementById(){return null},dispatchEvent(){}};
 class MutationObserver{observe(){}}
 const window={OPEN_IPTV_TRANSLATIONS:{en:{},'zh-CN':{},fr:{},lo:{}}};
 vm.runInNewContext(source,{window,document,MutationObserver,localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}},{timeout:5000});
 const i18n=window.OpenIPTVI18n;
 assert.equal(i18n.t('Tổng nguồn:','zh-CN'),'来源总数:');
 assert.equal(i18n.t('Kênh gộp:','zh-CN'),'合并频道:');
 assert.equal(i18n.t('Trùng:','zh-CN'),'重复项:');
 assert.equal(i18n.t('Link dự phòng:','zh-CN'),'备用链接:');
 assert.equal(i18n.t(' · 25 kênh · File M3U','zh-CN'),' · 25 个频道 · File M3U');
 assert.equal(i18n.t('VTV5 Tây Nguyên','zh-CN'),'VTV5 Tây Nguyên');
 i18n.setLanguage('zh-CN');assert.equal(i18n.getLanguage(),'zh-CN');
 i18n.setLanguage('vi');assert.equal(i18n.t('Tổng nguồn:'),'Tổng nguồn:');
});
