import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import Hls from 'hls.js';
import './style.css';

type Channel={name:string, url:string, group:string, logo?:string};
let channels:Channel[]=[]; let selected:Channel|null=null; let hls:Hls|null=null;
const el=document.querySelector<HTMLDivElement>('#app')!;
el.innerHTML=`<header><span class="logo">▶</span><div><b>Open IPTV Pro — WebView</b><small>Nhánh thử nghiệm Tauri • Windows WebView2 / macOS WKWebView • FFmpeg đóng gói</small></div><span class="pill">TRIAL</span></header>
<main><aside><h3>Danh sách phát</h3><p class="dim">Bản thử nghiệm trình phát và FFmpeg. Chưa thay thế được toàn bộ chức năng Electron.</p><label for="src">URL M3U</label><div class="form"><input id="src" placeholder="https://example.com/iptv.m3u"/><button id="load">Tải</button></div><button class="ghost" id="file">Mở tệp M3U</button><input class="hidden" id="chooser" type="file" accept=".m3u,.m3u8,text/plain"/><div id="count"></div><div id="channels"></div></aside>
<section><div class="panel"><h3>Trình phát</h3><video id="video" controls autoplay playsinline></video><div id="now">Chọn một kênh</div><div class="actions"><button id="ffver">Kiểm tra FFmpeg</button><button id="probe">FFprobe</button><button id="snapshot">Chụp hình</button><button id="record">Ghi 30 giây</button></div><pre id="msg"></pre></div><div class="panel"><b>Giữ FFmpeg/FFprobe trong gói cài</b><p class="dim">Không dùng libffmpeg của Electron làm FFmpeg CLI. Nhánh thử nghiệm dùng FFmpeg/FFprobe riêng dưới dạng sidecar, có đầy đủ binary phát hành.</p><p class="dim">Các chức năng cần chuyển từ IPC Electron: MultiView, EPG, Failover, Doctor, Freeze Detector, Timeshift nâng cao, cập nhật ứng dụng và đồng bộ trạng thái. Xem file PARITY.md.</p></div></section></main>`;
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
function status(s:string){$('msg').textContent=s;}
function parseM3U(raw:string):Channel[]{let out:Channel[]=[];let pending:Partial<Channel>={};for(const line0 of raw.split(/\r?\n/)){const line=line0.trim();if(line.startsWith('#EXTINF:')){const name=line.split(',').slice(1).join(',').trim();pending={name:name||'Không có tên',group:/group-title="([^"]*)"/.exec(line)?.[1]||'Khác',logo:/tvg-logo="([^"]*)"/.exec(line)?.[1]};}else if(/^https?:\/\//i.test(line)&&pending.name){out.push({name:pending.name,url:line,group:pending.group||'Khác',logo:pending.logo});pending={};}}return out;}
function render(list:Channel[]){$('count').textContent=`${list.length} kênh`;const box=$('channels');box.replaceChildren();for(const c of list.slice(0,1500)){const b=document.createElement('button');b.className='channel';b.textContent=`${c.name}   ·   ${c.group}`;b.onclick=()=>play(c);box.appendChild(b);}}
async function load(text:string){channels=parseM3U(text);render(channels);status(`Đã nhập ${channels.length} kênh`);}
$('load').onclick=async()=>{try{status('Đang tải M3U...');await load(await invoke<string>('fetch_m3u',{url:($<HTMLInputElement>('src')).value.trim()}));}catch(e){status(String(e));}};
$('file').onclick=()=>$<HTMLInputElement>('chooser').click();
$('chooser').onchange=async()=>{const f=$<HTMLInputElement>('chooser').files?.[0];if(f)await load(await f.text());};
function play(c:Channel){selected=c;const video=$<HTMLVideoElement>('video');hls?.destroy();hls=null;video.pause();video.removeAttribute('src');video.load();$('now').textContent=`${c.name} — ${c.url}`;
 if(/\.m3u8(?:\?|$)/i.test(c.url)&&Hls.isSupported()){hls=new Hls({enableWorker:true});hls.loadSource(c.url);hls.attachMedia(video);}else{video.src=c.url;}video.play().catch(e=>status(`Không phát được: ${e}`));}
$('ffver').onclick=async()=>{try{status(await invoke<string>('ffmpeg_info'));}catch(e){status(String(e));}};
$('probe').onclick=async()=>{if(!selected)return status('Hãy chọn kênh');try{status('Đang kiểm tra FFprobe...');const v=await invoke<string>('ffprobe_info',{url:selected.url});status(v.slice(0,10000));}catch(e){status(String(e));}};
$('snapshot').onclick=async()=>{if(!selected)return status('Hãy chọn kênh');const output=await save({defaultPath:'snapshot.jpg',filters:[{name:'JPEG',extensions:['jpg']}]});if(!output)return;try{status('Đang chụp...');status('Đã lưu: '+await invoke<string>('snapshot',{url:selected.url,output}));}catch(e){status(String(e));}};
$('record').onclick=async()=>{if(!selected)return status('Hãy chọn kênh');const output=await save({defaultPath:'recording.ts',filters:[{name:'MPEG-TS',extensions:['ts']}]});if(!output)return;try{status('Đang ghi 30 giây...');status('Đã lưu: '+await invoke<string>('record_clip',{url:selected.url,seconds:30,output}));}catch(e){status(String(e));}};
