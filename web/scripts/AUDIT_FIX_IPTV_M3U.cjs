#!/usr/bin/env node
'use strict';
// Local-only playlist audit. No DNS calls, no URL/token output, no playlist writes.
const fs=require('node:fs');
const {parseM3U}=require('../src/core.cjs');
const {format}=require('../renderer/playback-route-policy.js');
const file=process.argv[2];
if(!file){console.error('Cach dung: node scripts/AUDIT_FIX_IPTV_M3U.cjs "/duong-dan/FIX iptv.m3u"');process.exit(2);}
const content=fs.readFileSync(file,'utf8');
const channels=parseM3U(content,'local-playlist');
const count={},groups={};
for(const ch of channels){const mode=format(ch.url);count[mode]=(count[mode]||0)+1;const group=(ch.group||'Khác').split(' | ')[0];groups[group]=(groups[group]||0)+1;}
console.log('KIEM TRA FILE M3U - khong in URL hay token');
console.log('Tong so kenh:',channels.length);
console.log('Phan loai theo URL:',JSON.stringify(count));
console.log('Nhom lon nhat:',Object.entries(groups).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([g,c])=>`${g}: ${c}`).join(' | '));
console.log('Vi du ten kenh:',channels.filter(x=>/^(VTV1|VTV3|VTV4)$/.test(x.name)).map(x=>`${x.name} (${format(x.url)})`).join(', '));
