'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const file of ['renderer/i18n.js']){
  test(file+' translates collector metrics without touching IPTV names',()=>{
    const source=fs.readFileSync(path.join(root,file),'utf8');
    const document={documentElement:{},readyState:'loading',addEventListener(){},getElementById(){return null},dispatchEvent(){}};
    class MutationObserver{observe(){}}
    const window={OPEN_IPTV_TRANSLATIONS:{en:{},'zh-CN':{},fr:{},lo:{}}};
    vm.runInNewContext(source,{window,document,MutationObserver,localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}},{timeout:5000});
    const i18n=window.OpenIPTVI18n;
    assert.equal(i18n.t('Tổng nguồn:','zh-CN'),'来源总数:');
    assert.equal(i18n.t('Kênh gộp:','zh-CN'),'合并频道:');
    assert.equal(i18n.t('Trùng:','zh-CN'),'重复项:');
    assert.equal(i18n.t('Link dự phòng:','zh-CN'),'备用链接:');
    assert.equal(i18n.t('⧉ Playlist đã hợp nhất','zh-CN'),'⧉ 已合并播放列表');
    assert.equal(i18n.t(' · 25 kênh · File M3U','zh-CN'),' · 25 个频道 · File M3U');
    assert.equal(i18n.t('Tổng nguồn:','fr'),'Sources au total :');
    assert.equal(i18n.t('Tổng nguồn:','lo'),'ແຫຼ່ງທັງໝົດ:');
    assert.equal(i18n.t('VTV5 Tây Nguyên','zh-CN'),'VTV5 Tây Nguyên');
    assert.equal(i18n.t('https://example.invalid/abc','zh-CN'),'https://example.invalid/abc');
    i18n.setLanguage('zh-CN');
    assert.equal(i18n.getLanguage(),'zh-CN');
    i18n.setLanguage('vi');
    assert.equal(i18n.t('Tổng nguồn:'),'Tổng nguồn:');
  });
}
test('source UI protects user names and marks only generated merged playlist',()=>{
  for(const file of ['renderer/collector.js'])
    assert.match(fs.readFileSync(path.join(root,file),'utf8'),/nameNode\.setAttribute\('data-i18n-ignore','true'\)/);
  for(const file of ['renderer/app.js'])
    assert.match(fs.readFileSync(path.join(root,file),'utf8'),/data-i18n-ui="merged-playlist"/);
});
