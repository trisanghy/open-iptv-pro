'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../renderer');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'manual-link-picker.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const picker=require(path.join(root,'manual-link-picker.js'));
const adaptive=require(path.join(root,'adaptive-playback.js'));
const advanced=require(path.join(root,'advanced-core.js'));

test('v13 uses native labeled Link phát dropdown, before Favorite button',()=>{
 const pos=html.indexOf('id="manualLinkControl"');
 assert(pos>0);
 assert(html.indexOf('id="playingTitle"')<pos);
 assert(html.indexOf('id="manualLinkSelect"')>pos);
 assert(html.indexOf('id="favCurrentBtn"')>html.indexOf('id="manualLinkSelect"'));
 assert.match(html,/<label class="manual-link-caption" for="manualLinkSelect">Link phát<\/label>/);
 assert.doesNotMatch(html,/id="manualLinkToggle"|id="manualLinkMenu"/);
});

test('selector is conditional on >=2 candidates and keeps existing playback+failover',()=>{
 assert.match(app,/if\(items\.length<2\)\{control\.classList\.add\('hidden'\);select\.replaceChildren\(\);return;/);
 assert.match(app,/\$\('#manualLinkSelect'\)\?\.addEventListener\('change'/);
 assert.match(app,/playChannel\(channel\.id,null,\{mode:'live',manualUrl:url\}\)/);
 assert.match(app,/const activeUrl=urls\.includes\(currentUrl\)\?currentUrl:items\[0\]\.url/);
});

test('links display selected host/path but not authorization tokens',()=>{
 const ch={id:'a',url:'https://origin.example/stream/index.m3u8?secret=do-not-display',name:'VTV3'};
 const items=picker.choices(ch,[ch],{a:['https://backup.example/stream.m3u8?token=private']},advanced.alternatives,adaptive);
 assert.equal(items.length,2);
 assert(items.every(item=>!item.host.includes('secret=')&&!item.host.includes('token=')));
 assert.match(app,/item\.url===ch\.url\?'Link chính':item\.label/);
 assert.match(app,/opt\.textContent=`\$\{label\} · \$\{item\.host/);
});

test('desktop dropdown has a long width and selector stays in header across themes',()=>{
 assert.match(css,/width:clamp\(220px,25vw,445px\)/);
 assert.match(css,/\.playing-info>\.favorite-current\{flex:0 0 auto/);
 assert.match(css,/html\[data-theme="light"\] \.manual-link-select/);
 assert.match(css,/@media\(max-width:800px\)/);
});
