import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { VideoPlayer } from '@capgo/capacitor-video-player';
import Hls from 'hls.js';
import appIcon from './icon.png';
import {oldStyleLayout} from './legacy-mobile-layout.mjs';
import {MOBILE_VERSION,MAX_BATCH,batchWindow,appendEvidence,rightsDialog,installMobileParity} from './mobile-rustlab-parity.mjs';
import './core-browser.js';
import './styles.css';
import { stableId, dedupChannels, normalizeHTTPURL, textFromResponse, parseBasicEPG, pool, xmltvDate } from './mobile-core.mjs';

const $ = x=>document.querySelector(x), $$=x=>[...document.querySelectorAll(x)];
const CORE=window.StreamLeafCore;
const KEY='openiptv_mobile_4211_v1';
let state={sources:[],favorites:[],channels:[],checks:{},healthHistory:{},checkCursor:0,fallbacks:{},epgUrl:'',selected:null,filter:'',page:'tv',group:'',settings:{threads:16}};
try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');state={...state,...old,settings:{...state.settings,...old.settings}};}catch{}
state.channels=Array.isArray(state.channels)?state.channels:[];
state.sources=Array.isArray(state.sources)?state.sources:[];
state.favorites=Array.isArray(state.favorites)?state.favorites:[];
state.checks=state.checks||{};
state.healthHistory=state.healthHistory||{};
state.checkCursor=Number(state.checkCursor)||0;
state.fallbacks=state.fallbacks||{};
let busy=false, playerHls=null;let multiPlayers=[];
const native=Capacitor.isNativePlatform();
function save(){const keep={...state};try{localStorage.setItem(KEY,JSON.stringify(keep));}catch(e){status('Bộ nhớ gần đầy; hãy xuất M3U sao lưu','error');}}
function status(t,kind=''){const el=$('#status');if(!el)return;el.textContent=t;el.dataset.kind=kind;el.hidden=false;clearTimeout(status.hideTimer);status.hideTimer=setTimeout(()=>{el.hidden=true;},3800);}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function button(text,action,cls=''){const b=node('button',cls,text);b.type='button';b.onclick=()=>Promise.resolve().then(action).catch(e=>{status(e.message||e,'error');console.error(e);});return b;}
function downloadFile(name,content,type='application/vnd.apple.mpegurl'){const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(new Blob([content],{type}));a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function exportFile(name,content){if(native){await Filesystem.writeFile({path:name,data:content,directory:Directory.Cache,encoding:Encoding.UTF8});const {uri}=await Filesystem.getUri({path:name,directory:Directory.Cache});await Share.share({title:name,url:uri,dialogTitle:'Lưu hoặc gửi playlist M3U'});}else downloadFile(name,content);status('Đã xuất '+name,'ok');}
async function getText(url,timeoutMs=15000){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);try{if(native){const response=await CapacitorHttp.request({url,method:'GET',connectTimeout:timeoutMs,readTimeout:timeoutMs,headers:{'Accept':'application/x-mpegURL,application/vnd.apple.mpegurl,text/plain,application/xml,*/*','User-Agent':'OpenIPTVProMobile/4.21.1'},responseType:'text'});if(response.status<200||response.status>=300)throw Error('HTTP '+response.status);return textFromResponse(response);}const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.text();}finally{clearTimeout(timer);}}
async function headStatus(url,timeoutMs=7000){if(native){const r=await CapacitorHttp.request({url,method:'HEAD',connectTimeout:timeoutMs,readTimeout:timeoutMs});return r.status;}const c=new AbortController();const t=setTimeout(()=>c.abort(),timeoutMs);try{const r=await fetch(url,{method:'HEAD',signal:c.signal});return r.status;}finally{clearTimeout(t);}}
async function rightsFor(kind){const consent=await rightsDialog({title:'Xác nhận quyền sử dụng · '+kind});if(!consent){status('Đã hủy nhập nguồn. Không thay đổi dữ liệu.');return false;}return true;}
function annotate(sourceId,rows){return rows.map((c,i)=>({...c,sourceId,id:sourceId+'|'+i,group:c.group||'Khác'}));}
function flatten(){let result=[];for(const src of state.sources.filter(s=>s.enabled!==false)){result.push(...(src.channels||[]));}state.channels=result;save();render();}
async function addURL(){const value=$('#newSource').value.trim();if(!value)throw Error('Nhập URL M3U');const url=normalizeHTTPURL(value);if(state.sources.some(x=>x.url===url))throw Error('Nguồn này đã có');if(!(await rightsFor('URL M3U')))return;busy=true;status('Đang tải M3U…');try{const txt=await getText(url,18000);const id='src-'+stableId(url);const rows=annotate(id,CORE.parseM3U(txt,id));if(!rows.length)throw Error('M3U không có kênh HTTP hợp lệ');state.sources.push({id,name:new URL(url).hostname,url,enabled:true,channels:rows,updatedAt:new Date().toISOString()});$('#newSource').value='';flatten();status('Đã thêm '+rows.length+' kênh từ '+url,'ok');}finally{busy=false;}}
async function addFile(file){if(!file)return;if(file.size>25*1024*1024)throw Error('M3U vượt 25MB');if(!(await rightsFor('file M3U')))return;const content=await file.text();const id='file-'+stableId(file.name+'|'+Date.now());const rows=annotate(id,CORE.parseM3U(content,id));if(!rows.length)throw Error('M3U không có kênh');state.sources.push({id,name:file.name,enabled:true,channels:rows,updatedAt:new Date().toISOString()});flatten();status('Đã nhập '+rows.length+' kênh từ file','ok');}
async function editSource(s){const next=prompt('URL M3U mới',s.url||'');if(next===null)return;const url=normalizeHTTPURL(next);if(!(await rightsFor('sửa URL M3U')))return;status('Đang kiểm tra URL mới…');const txt=await getText(url);const rows=annotate(s.id,CORE.parseM3U(txt,s.id));if(!rows.length)throw Error('Nguồn URL mới không có kênh hợp lệ. Giữ URL cũ');s.url=url;s.name=new URL(url).hostname;s.channels=rows;s.updatedAt=new Date().toISOString();flatten();status('Đã thay URL nguồn và tải '+rows.length+' kênh','ok');}
async function refreshSources(){if(busy)return;busy=true;let n=0;for(const s of state.sources.filter(s=>s.url&&s.enabled!==false)){try{const text=await getText(s.url);s.channels=annotate(s.id,CORE.parseM3U(text,s.id));s.updatedAt=new Date().toISOString();n++;}catch(e){status(`Không tải được ${s.name}: ${e.message}`,'error');}}flatten();busy=false;status(`Đã làm mới ${n} nguồn. Các nguồn lỗi vẫn giữ dữ liệu cũ`,'ok');}
function activeChannels(){let all=dedupChannels(state.channels);if(state.page==='fav')all=all.filter(c=>state.favorites.includes(c.url));if(state.group)all=all.filter(c=>c.group===state.group);const q=state.filter.toLowerCase().trim();if(q)all=all.filter(c=>(c.name+' '+c.group+' '+c.url).toLowerCase().includes(q));return all;}

const groupOpened=new Set();
let showOnlyFavorites=false;
function pickChannel(c){
 state.selected=c.url;
 const el=$('#fallbackSource');if(el)el.value=c.url;
 save();renderNowPlaying();renderChannels();
}
function renderNowPlaying(){
 const c=state.channels.find(x=>x.url===state.selected);
 const title=$('#nowTitle'),group=$('#nowGroup'),star=$('#nowFavorite');
 if(!title)return;
 title.textContent=c?.name||'Chưa chọn kênh';
 group.textContent=c?.group||'Chọn một kênh trong danh sách';
 $('#heroTitle').textContent=c?'Sẵn sàng phát':'Chưa chọn kênh';
 $('#heroSubtitle').textContent=c?'Bấm Phát để xem kênh đã chọn':'Nhập M3U hoặc chọn kênh để xem';
 star.textContent=c&&state.favorites.includes(c.url)?'★':'☆';
 star.disabled=!c;
 $('#playCurrent').disabled=!c;
 $('#previousChannel').disabled=!state.channels.length;
 $('#nextChannel').disabled=!state.channels.length;
}
function jumpChannel(delta){
 const rows=dedupChannels(state.channels);if(!rows.length)return;
 const at=rows.findIndex(x=>x.url===state.selected);
 pickChannel(rows[at<0?0:(at+delta+rows.length)%rows.length]);
}
function channelCard(c){
 const item=node('article','channel');if(c.url===state.selected)item.classList.add('selected');
 const logo=node('span','ch-logo');
 if(c.logo&&/^https?:\/\//i.test(c.logo)){const img=node('img');img.src=c.logo;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.replaceWith(node('span','','TV'));logo.append(img);}else logo.textContent='▶';
 item.append(logo);
 const info=node('div','ch-info');info.append(node('b','',c.name));
 const health=state.checks[c.url]?.status||'unchecked';
 info.append(node('small','',c.group+' · '+(health==='alive'?'LIVE':health==='dead'?'DIE':health==='uncertain'?'Chưa rõ':'Chưa kiểm tra')));
 item.append(info);
 item.append(button(state.favorites.includes(c.url)?'★':'☆',()=>toggleFavorite(c),'star'));
 item.append(button('▶',()=>{pickChannel(c);return play(c);},'play'));
 item.onclick=e=>{if(!e.target.closest('button'))pickChannel(c);};
 return item;
}
function renderChannels(){
 const rows=dedupChannels(state.channels);
 const q=(state.filter||'').toLowerCase().trim();
 const all=rows.filter(c=>(!showOnlyFavorites||state.favorites.includes(c.url))&&(!q||(c.name+' '+c.group+' '+c.url).toLowerCase().includes(q)));
 const list=$('#channelList');list.replaceChildren();
 const count=$('#count');if(count)count.textContent=all.length+' / '+rows.length+' kênh';
 const favoriteList=$('#favoritesList');favoriteList.replaceChildren();
 const favs=rows.filter(c=>state.favorites.includes(c.url));
 if(!favs.length)favoriteList.append(node('p','muted','Chưa có kênh yêu thích.'));
 else for(const c of favs.slice(0,1500))favoriteList.append(channelCard(c));
 if(!all.length){list.append(node('p','muted',rows.length?'Không tìm thấy kênh phù hợp.':'Chưa có kênh. Thêm nguồn M3U tại tab Nguồn.'));return;}
 const grouped=new Map();
 for(const c of all){const group=c.group||'Khác';if(!grouped.has(group))grouped.set(group,[]);grouped.get(group).push(c);}
 const fragment=document.createDocumentFragment();
 for(const [group,channels] of grouped){
   const box=node('section','channel-folder');
   const open=Boolean(q)||groupOpened.has(group);
   const header=button('',()=>{if(groupOpened.has(group))groupOpened.delete(group);else groupOpened.add(group);renderChannels();},'folder-heading');
   header.setAttribute('aria-expanded',String(open));
   header.append(node('span','folder-arrow',open?'▾':'▸'),node('span','folder-icon','📁'),node('strong','folder-name',group),node('span','folder-count',channels.length));
   box.append(header);
   if(open){const inner=node('div','folder-entries');for(const c of channels.slice(0,1500))inner.append(channelCard(c));box.append(inner);}
   fragment.append(box);
 }
 list.append(fragment);
 const favBtn=$('#quickFavorite');if(favBtn){favBtn.textContent=showOnlyFavorites?'★ Tất cả':'☆ Yêu thích';favBtn.classList.toggle('active',showOnlyFavorites);}
}
function renderSources(){const root=$('#sources');root.replaceChildren();for(const s of state.sources){const box=node('article','src-card');const txt=node('div');txt.append(node('b','',s.name));txt.append(node('small','',`${s.channels?.length||0} kênh · ${s.url||'File M3U'}`));box.append(txt);box.append(button(s.enabled===false?'Bật':'Tắt',()=>{s.enabled=s.enabled===false;flatten();},'tiny'));if(s.url)box.append(button('Sửa URL',()=>editSource(s),'tiny'));box.append(button('Xóa',()=>{if(!confirm('Xóa nguồn '+s.name+'?'))return;state.sources=state.sources.filter(x=>x.id!==s.id);flatten();},'tiny danger'));root.append(box);}}
function render(){
 renderChannels();renderSources();renderNowPlaying();
 const sources=$('#sourceCount');if(sources)sources.textContent=String(state.sources.length);
 const fav=$('#favCount');if(fav)fav.textContent=String(state.favorites.length);
 const epg=$('#epgURL');if(epg)epg.value=state.epgUrl||'';
 const threads=$('#threadCount');if(threads)threads.value=String(state.settings.threads||16);
 $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
 $$('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+state.page));
 $('#settingsBtn').classList.toggle('active',state.page==='tools');
}
function toggleFavorite(c){state.favorites=state.favorites.includes(c.url)?state.favorites.filter(x=>x!==c.url):[...state.favorites,c.url];save();renderChannels();$('#favCount').textContent=String(state.favorites.length);renderNowPlaying();}
function nativePlayOptions(c,url){return {mode:'fullscreen',playerId:'main-player',url,title:c.name,smallTitle:c.group,artwork:c.logo||undefined,showControls:true,chromecast:true,pipEnabled:true};}
async function play(c){state.selected=c.url;renderNowPlaying();$('#fallbackSource').value=c.url;save();const alternatives=[c.url,...(state.fallbacks[c.url]||[])].filter(Boolean);status('Đang mở: '+c.name);
 if(native){let last;for(const url of alternatives){try{await VideoPlayer.stopAllPlayers().catch(()=>{});await VideoPlayer.initPlayer(nativePlayOptions(c,url));await VideoPlayer.play({playerId:'main-player'});status('Trình phát native đã nhận yêu cầu phát: '+c.name+' (chưa xác nhận khung hình)','ok');return;}catch(e){last=e;}}throw Error('Native player không phát được. '+(last?.message||last||''));}
 const url=alternatives[0],v=$('#webVideo');$('#webPlayer').hidden=false;$('#webTitle').textContent=c.name;if(playerHls){playerHls.destroy();playerHls=null;}v.pause();v.removeAttribute('src');v.load();if(url.includes('.m3u8')&&Hls.isSupported()){playerHls=new Hls({lowLatencyMode:false,maxBufferLength:20});playerHls.loadSource(url);playerHls.attachMedia(v);}else v.src=url;await v.play().catch(e=>{throw Error('Không phát được. Một số nguồn chặn CORS: '+e.message)});}
async function stop(){if(native)await VideoPlayer.stopAllPlayers();else{playerHls?.destroy();playerHls=null;$('#webVideo').pause();$('#webPlayer').hidden=true;}status('Đã dừng phát');}
async function checkOne(c){const url=c.url;try{
 if(/\.m3u8(?:\?|$)/i.test(url)){const manifest=await getText(url,8000);if(!/#EXTM3U/i.test(manifest))return {status:'dead',reason:'HTTP 200 nhưng không phải HLS'};
 let list=manifest,base=url;
 if(/#EXT-X-STREAM-INF/.test(manifest)){const next=manifest.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);let variant='';for(let i=0;i<next.length-1;i++)if(next[i].startsWith('#EXT-X-STREAM-INF')&&next[i+1]&&!next[i+1].startsWith('#')){variant=next[i+1];break;}if(variant){base=new URL(variant,url).toString();list=await getText(base,8000);}}
 const lines=list.split(/\r?\n/).map(x=>x.trim());const parts=lines.filter(x=>x&&!x.startsWith('#'));if(!parts.length)return {status:'uncertain',reason:'HLS thiếu segment'};const segment=new URL(parts[parts.length-1],base).toString();const code=await headStatus(segment,6500);if(code>=200&&code<400)return {status:'uncertain',reason:'HLS + segment HTTP '+code+'; chưa xác nhận khung hình'};if(code===404||code===410)return {status:'dead',reason:'Segment '+code};return {status:'uncertain',reason:'Segment HTTP '+code};}
 const code=await headStatus(url,6500);if(code>=200&&code<400)return {status:'uncertain',reason:'HTTP '+code+'; chưa xác minh decode video'};if(code===404||code===410)return {status:'dead',reason:'HTTP '+code};return {status:'uncertain',reason:'HTTP '+code};
 }catch(e){return {status:'uncertain',reason:String(e?.message||e).slice(0,130)};}}
async function checkAll(){
 if(busy)return;
 const all=dedupChannels(state.channels);if(!all.length)throw Error('Chưa có kênh');
 const batch=batchWindow(all,state.checkCursor,MAX_BATCH),list=batch.items;
 busy=true;$('#checkBtn').disabled=true;let live=0,dead=0,unknown=0;
 const limit=Math.max(1,Math.min(32,Number($('#threadCount').value)||16));
 state.settings.threads=limit;save();
 status('Đang kiểm tra '+(batch.start+1)+'–'+batch.end+'/'+all.length+' · '+limit+' luồng');
 try{
  const results=await pool(list,limit,checkOne,(done,total,res)=>{
   if(res?.status==='alive')live++;else if(res?.status==='dead')dead++;else unknown++;
   if(done%5===0||done===total)status('Đã kiểm tra '+done+'/'+total+' · LIVE '+live+' · DIE '+dead+' · UNKNOWN '+unknown);
  });
  const now=new Date().toISOString();results.forEach((r,i)=>{const url=list[i].url;state.checks[url]={...r,checkedAt:now};});
  state.checkCursor=batch.nextCursor;
  const entries=Object.entries(state.checks);if(entries.length>5000)state.checks=Object.fromEntries(entries.slice(-5000));
  save();renderChannels();
  status('Xong lô '+(batch.start+1)+'–'+batch.end+'/'+all.length+' · LIVE '+live+', DIE '+dead+', UNKNOWN '+unknown+'. '+(state.checkCursor?'Bấm tiếp để kiểm tra lô kế':'Đã hết danh sách'),'ok');
 }finally{busy=false;$('#checkBtn').disabled=false;}
}
async function viewEPG(){const url=normalizeHTTPURL($('#epgURL').value);state.epgUrl=url;save();status('Đang tải XMLTV EPG…');const xml=await getText(url,24000);if(xml.length>12000000)throw Error('EPG lớn hơn 12 MB, cần bản parser luồng');const id=$('#epgChannel').value.trim();const items=parseBasicEPG(xml,id,200);const root=$('#epgResults');root.replaceChildren();for(const item of items){const row=node('article','epg-row');row.append(node('small','',`[${item.channel}] ${xmltvDate(item.start)?.toLocaleString('vi-VN')||item.start}`));row.append(node('b','',item.title));root.append(row);}status(`Đã tải ${items.length} chương trình EPG`,'ok');}
async function exportM3U(){const channels=state.channels.map(c=>({...c,status:state.checks[c.url]?.status||'unchecked'})).sort((a,b)=>Number(a.status==='dead')-Number(b.status==='dead'));await exportFile('OpenIPTV_Mobile_Channels.m3u',CORE.exportM3U(channels));}
async function editFallback(){const url=$('#fallbackSource').value.trim();if(!url)throw Error('Chọn kênh/URL trước');const alt=$('#fallbackURL').value.trim();if(!alt){delete state.fallbacks[url];save();status('Đã xóa URL dự phòng');return;}state.fallbacks[url]=[normalizeHTTPURL(alt)];save();status('Đã lưu link dự phòng','ok');}
async function currentSnapshot(){if(native)throw Error('Snapshot native cần module FFmpegKitNext riêng; phiên bản mobile thử nghiệm chưa chụp được video DRM/HLS native.');const v=$('#webVideo');if(!v.videoWidth)throw Error('Chưa phát được video để chụp');const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);try{const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!blob)throw Error('Không có ảnh');const b64=await new Promise(resolve=>{const rd=new FileReader();rd.onload=()=>resolve(rd.result.split(',')[1]);rd.readAsDataURL(blob)});await Filesystem.writeFile({path:'snapshot.jpg',data:b64,directory:Directory.Cache});const {uri}=await Filesystem.getUri({path:'snapshot.jpg',directory:Directory.Cache});await Share.share({title:'Snapshot IPTV',url:uri});}catch(e){throw Error('Snapshot lỗi (CORS/DRM): '+e.message);}}
function stopMulti(){const wasPlaying=multiPlayers.length>0;for(const p of multiPlayers){try{p.hls?.destroy();p.v.pause();p.v.removeAttribute('src');p.v.load();}catch{}}multiPlayers=[];if(wasPlaying)status('Đã dừng MultiView');}
async function startMulti(){stopMulti();const grid=$('#multiGrid');grid.replaceChildren();const list=dedupChannels(state.channels).filter(c=>/^https?:/.test(c.url));if(!list.length)throw Error('Chưa nhập M3U');for(let slot=0;slot<4;slot++){const cell=node('div','multi-cell');const sel=node('select');sel.append(new Option('Chọn kênh',''));for(const c of list.slice(0,1500)){sel.add(new Option(c.name,c.url));}const v=node('video');v.controls=true;v.muted=true;v.playsInline=true;v.preload='none';v.autoplay=false;const info=node('small','','');sel.onchange=async()=>{try{const old=multiPlayers.find(x=>x.v===v);old?.hls?.destroy();multiPlayers=multiPlayers.filter(x=>x.v!==v);v.pause();v.removeAttribute('src');v.load();if(!sel.value)return;const chosen=sel.value;if(/\.m3u8(?:\?|$)/i.test(chosen)&&Hls.isSupported()){const hls=new Hls({enableWorker:true,maxBufferLength:7,maxBackBufferLength:3});hls.loadSource(chosen);hls.attachMedia(v);multiPlayers.push({hls,v});}else{v.src=chosen;multiPlayers.push({v});}await v.play();info.textContent='Đang phát · chạm biểu tượng loa để nghe';}catch(e){info.textContent='Không thể phát trong WebView (CORS/codec): '+e.message;}};cell.append(sel,v,info);grid.append(cell);}status('MultiView thử nghiệm: chọn tối đa 4 kênh, tất cả mặc định tắt tiếng');}
function showTab(tab){if(state.page==='multi'&&tab!=='multi')stopMulti();state.page=tab;save();render();}
function init(){document.querySelector('#app').innerHTML=oldStyleLayout(appIcon);
  $$('.tab').forEach(b=>b.onclick=()=>showTab(b.dataset.page));$('#search').oninput=e=>{state.filter=e.target.value;renderChannels();};$('#quickFavorite').onclick=()=>{showOnlyFavorites=!showOnlyFavorites;renderChannels();};
 $('#expandFolders').onclick=()=>{for(const c of state.channels)groupOpened.add(c.group||'Khác');renderChannels();};
 $('#collapseFolders').onclick=()=>{groupOpened.clear();renderChannels();};
 $('#settingsBtn').onclick=()=>showTab('tools');
 $('#nowFavorite').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);if(c)toggleFavorite(c);};
 $('#previousChannel').onclick=()=>jumpChannel(-1);
 $('#nextChannel').onclick=()=>jumpChannel(1);
 $('#playCurrent').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);if(c)play(c).catch(e=>status(e.message,'error'));};
 $('#fullScreenCurrent').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);if(c)play(c).catch(e=>status(e.message,'error'));else status('Hãy chọn kênh trước','error');};
 $('#pictureInPicture').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);if(c&&native)play(c).catch(e=>status(e.message,'error'));else if(c)$('#webVideo').requestPictureInPicture?.().catch(e=>status(e.message,'error'));else status('Chọn kênh trước','error');};$('#addURL').onclick=()=>addURL().catch(e=>status(e.message,'error'));
 $('#file').onchange=e=>addFile(e.target.files?.[0]).catch(err=>status(err.message,'error'));
 $('#refresh').onclick=()=>refreshSources().catch(e=>status(e.message,'error'));
 $('#checkBtn').onclick=()=>checkAll().catch(e=>status(e.message,'error'));
 $('#exportBtn').onclick=()=>exportM3U().catch(e=>status(e.message,'error'));
 $('#loadEPG').onclick=()=>viewEPG().catch(e=>status(e.message,'error'));
 $('#saveFallback').onclick=()=>editFallback().catch(e=>status(e.message,'error'));
 $('#snapshot').onclick=()=>currentSnapshot().catch(e=>status(e.message,'error'));
 $('#startMulti').onclick=()=>startMulti().catch(e=>status(e.message,'error'));$('#stopMulti').onclick=stopMulti;
 $('#closePlayer').onclick=()=>stop().catch(e=>status(e.message,'error'));
 
 $('#threadCount').replaceChildren(...Array.from({length:32},(_,i)=>new Option(String(i+1),String(i+1))));
 const video=$('#webVideo');video.addEventListener('playing',()=>{if(state.selected){try{appendEvidence(state.healthHistory,state.selected,'decoded-playback');save();}catch{}}});
 render();}
init();
installMobileParity({getState:()=>state,replaceState:next=>{state={...state,...next};flatten();},save,status,exportFile});
