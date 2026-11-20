'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const features=fs.readFileSync(path.join(root,'features.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-mobile-player.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function runPanel({mobile,preference}){
 const start=features.indexOf(' function isMobileChannelPanel(){');
 const end=features.indexOf(' function updateAppearance(persist=true){',start);
 assert.ok(start>=0&&end>start);
 const button=()=>({hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v}});
 const hide=button(),show=button(),nodes={'#channelPanelHideBtn':hide,'#channelPanelShowBtn':show};
 const document={documentElement:{dataset:{iptvDevice:mobile?'mobile':'desktop'}}};
 const config={channelPanelVisible:preference};
 let saves=0;
 const result=vm.runInNewContext(features.slice(start,end)+
   '\nupdateChannelPanelVisibility(true);({mobile:isMobileChannelPanel(),visible:document.documentElement.dataset.channelPanelVisible,config:config.channelPanelVisible});',
   {document,config,$:selector=>nodes[selector],saveConfig:()=>saves++});
 return {result,hide,show,saves};
}
test('mobile displays list even if a previous desktop session hid it',()=>{
 const x=runPanel({mobile:true,preference:false});
 assert.equal(x.result.mobile,true);
 assert.equal(x.result.visible,'true');
 assert.equal(x.result.config,false,'must not corrupt desktop preference');
 assert.equal(x.saves,0,'must not write desktop state or sync it to cloud');
 assert.equal(x.hide.hidden,true);
 assert.equal(x.show.hidden,true);
 assert.equal(x.hide.attrs['aria-expanded'],'true');
 assert.equal(x.show.attrs['aria-expanded'],'true');
});
test('desktop retains collapse, open button, and persisted preference',()=>{
 const hidden=runPanel({mobile:false,preference:false});
 assert.equal(hidden.result.visible,'false');
 assert.equal(hidden.result.config,false);
 assert.equal(hidden.hide.hidden,false);
 assert.equal(hidden.show.hidden,false);
 assert.equal(hidden.show.textContent,'›');
 assert.equal(hidden.saves,1);
 const open=runPanel({mobile:false,preference:true});
 assert.equal(open.result.visible,'true');
 assert.equal(open.show.textContent,'');
});
test('mobile CSS overrides legacy collapsed style and hides detached arrow',()=>{
 const marker='/* Always-open channel list on mobile';
 const start=css.indexOf(marker);
 assert.ok(start>css.indexOf('data-channel-panel-visible="false"] body #page-tv .channel-panel'));
 const tail=css.slice(start);
 assert.match(tail,/html\[data-iptv-device="mobile"\]\[data-channel-panel-visible="false"\] body #page-tv \.channel-panel\{\s*display:flex!important/);
 assert.match(tail,/#channelPanelShowBtn,[\s\S]*?#channelPanelHideBtn\{\s*display:none!important/);
 assert.match(tail,/\.tv-layout\{\s*padding-left:0!important/);
});
test('mobile preference changes and viewport lifecycle are synchronized without overriding desktop-site request',()=>{
 assert.match(features,/function isMobileChannelPanel\(\)/);
 assert.match(features,/window.addEventListener\('resize',\(\)=>updateChannelPanelVisibility\(false\)\)/);
 assert.match(features,/window.addEventListener\('pageshow',\(\)=>updateChannelPanelVisibility\(false\)\)/);
 assert.match(features,/window.addEventListener\('orientationchange',\(\)=>updateChannelPanelVisibility\(false\)\)/);
 assert.match(features,/if\(isMobileChannelPanel\(\)\)return;config.channelPanelVisible=false/);
 assert.match(html,/features\.js\?v=web-perf-20261120a/);
 assert.match(html,/web-mobile-player\.css\?v=apple-more-20261120a/);
 assert.match(fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8'),/Cannot protect mobile channel list visibility after WebView build/);
});
