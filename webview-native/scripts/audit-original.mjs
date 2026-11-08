import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
const root=resolve('..');
const results=[];
const patterns=[/require\s*\(\s*['"]electron['"]/,/from\s+['"]electron['"]/,/ipcRenderer\b/,/ipcMain\b/,/contextBridge\b/,/window\.(?:electronAPI|api|openIPTV|nativeAPI)\b/,/app\.getPath\s*\(/,/shell\.openExternal\s*\(/,/ffmpeg-static/,/ffmpeg\.exec/,/autoUpdater\b/];
const ignored=new Set(['node_modules','.git','dist','out','build','webview-native','.next','.cache']);
function walk(d){ if (!existsSync(d))return; for(const f of readdirSync(d,{withFileTypes:true})){
 if(ignored.has(f.name))continue;const p=join(d,f.name);if(f.isDirectory())walk(p);
 else if(/\.(tsx?|jsx?|mjs|cjs)$/.test(f.name)){
 let content;try{content=readFileSync(p,'utf8')}catch{continue}for(let i=0;i<patterns.length;i++){
 const n=content.split('\n').filter(line=>patterns[i].test(line)).length;
 if(n)results.push({file:relative(root,p),rule:patterns[i].source,count:n});}
 }
}}
walk(join(root,'src'));walk(join(root,'electron'));walk(join(root,'main'));walk(join(root,'preload'));
const output=resolve('ELECTRON_API_AUDIT.json');writeFileSync(output,JSON.stringify({note:'Không kết luận đủ tính năng nếu còn Electron API chưa chuyển',total:results.reduce((a,x)=>a+x.count,0),results},null,2));
console.log(`Đã xuất ${output}: ${results.length} nhóm cần rà soát.`);
if(results.length)console.warn('CẢNH BÁO: UI Electron có thể không chạy được nguyên trạng trong Tauri. Chuyển IPC trước khi phát hành chính thức.');
