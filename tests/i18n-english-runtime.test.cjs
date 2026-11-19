'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=name=>fs.readFileSync(path.join(root,'renderer',name),'utf8');
const full=load('languages.bundle.js');
const base=JSON.parse(full.slice(full.indexOf('window.OPEN_IPTV_TRANSLATIONS=')+'window.OPEN_IPTV_TRANSLATIONS='.length).replace(/;\s*$/,''));
function environment(){
 const local=new Map(),calls=[];
 const document={body:null,documentElement:{},readyState:'loading',addEventListener(){},getElementById(){return null;},dispatchEvent(){}};
 const window={OPEN_IPTV_TRANSLATIONS:structuredClone(base),confirm(message){calls.push(message);return true;},alert(message){calls.push(message);}};
 class MutationObserver{observe(){}}
 const sandbox={window,document,MutationObserver,localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},CustomEvent:class {}};
 vm.runInNewContext(load('i18n-english-coverage.js'),sandbox,{timeout:5000});
 vm.runInNewContext(load('i18n.js'),sandbox,{timeout:5000});
 return {i18n:window.OpenIPTVI18n,window,local,calls};
}
test('English messages, native dialogs and stored preference update immediately',()=>{
 const {i18n,window,local,calls}=environment();
 i18n.setLanguage('en');
 assert.equal(i18n.getLanguage(),'en');
 assert.equal(i18n.t('Thu gọn danh sách kênh'),'Collapse channel list');
 assert.equal(i18n.t('5 phút'),'5 minutes');
 assert.equal(i18n.t('Không tải được nguồn: HTTP 404'),'Could not load source: HTTP 404');
 assert.equal(i18n.t('VTV1'),'VTV1');
 assert.equal(window.confirm('Bạn muốn hủy lịch ghi này?'),true);
 window.alert('Đang tìm Chromecast / Google TV trong mạng nội bộ…');
 assert.deepEqual(calls,['Cancel this scheduled recording?','Searching the local network for Chromecast / Google TV…']);
 assert.equal(local.get('open-iptv-pro-language'),'en');
 i18n.setLanguage('vi');
 assert.equal(i18n.t('Thu gọn danh sách kênh'),'Thu gọn danh sách kênh');
 window.alert('Đang tìm Chromecast / Google TV trong mạng nội bộ…');
 assert.equal(calls[2],'Đang tìm Chromecast / Google TV trong mạng nội bộ…');
});
