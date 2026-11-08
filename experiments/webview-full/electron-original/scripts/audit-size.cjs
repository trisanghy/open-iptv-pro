#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(process.argv[2]||'dist');
function walk(p){let size=0;try{for(const d of fs.readdirSync(p,{withFileTypes:true})){const full=path.join(p,d.name);if(d.isDirectory())size+=walk(full);else if(d.isFile())size+=fs.statSync(full).size;}}catch{}return size;}
const mib=n=>(n/1048576).toFixed(2)+' MiB';
if(!fs.existsSync(base)){console.error('Chưa có thư mục dist. Chạy BUILD_MAC.command hoặc BUILD_WINDOWS.bat trước.');process.exit(1);}
for(const name of fs.readdirSync(base).sort()){
 const p=path.join(base,name),st=fs.statSync(p);
 console.log(`${name.padEnd(56)} ${mib(st.isDirectory()?walk(p):st.size)}`);
}
console.log('DMG / EXE là dung lượng bộ cài tải về; .app / win-unpacked là kích thước ứng dụng sau giải nén.');
