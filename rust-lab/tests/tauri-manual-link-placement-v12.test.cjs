'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','renderer');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'manual-link-picker.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');

test('manual source selector is a direct header sibling, right before Favorite, not beside title',()=>{
 const match=html.match(/<div class="playing-info">([\s\S]*?)<\/div>\s*<div class="controls">/);
 assert.ok(match,'channel info header exists');
 const head=match[1];
 assert.match(head, /<div class="playing-meta"><b id="playingTitle">[^<]*<\/b><small id="playingSubtitle">[^<]*<\/small><\/div><div class="manual-link-control hidden" id="manualLinkControl">/);
 assert.ok(head.indexOf('id="playingSubtitle"')<head.indexOf('id="manualLinkControl"'));
 assert.ok(head.indexOf('id="manualLinkControl"')<head.indexOf('id="favCurrentBtn"'));
 assert.doesNotMatch(head,/playing-title-line/);
});

test('selector has Link phát label, native dropdown to the right and responsive style',()=>{
 assert.match(html,/<label class="manual-link-caption" for="manualLinkSelect">Link phát<\/label>/);
 assert.match(html,/<select id="manualLinkSelect"/);
 assert.match(css,/\.playing-info>\.playing-meta\{flex:1 1 auto;/);
 assert.match(css,/\.playing-info>\.manual-link-control\{[^\n]*margin-left:auto;/);
 assert.match(css,/\.manual-link-select\{[^\n]*width:clamp\(220px,25vw,445px\)/);
 assert.match(css,/@media\(max-width:800px\)/);
});

test('backup selector continues to appear only with multiple sources and keeps native Auto Failover',()=>{
 assert.match(app,/if\(items\.length<2\)\{control\.classList\.add\('hidden'\)/);
 assert.match(app,/playChannel\(channel\.id,null,\{mode:'live',manualUrl:url\}\)/);
 assert.match(html,/id="manualLinkSelect"/);
 assert.doesNotMatch(html,/id="manualLinkMenu"/);
});
