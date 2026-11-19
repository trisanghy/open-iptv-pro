import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { VideoPlayer } from '@capgo/capacitor-video-player';
import Hls from 'hls.js';
import {oldStyleLayout} from './legacy-mobile-layout.mjs';
import {streamOptions,epgNowNext} from './mobile-player-controls.mjs';
import {installEPGAuto} from './mobile-epg-autosync.mjs';
import {matchGuideChannel,resumeChannel} from './mobile-epg-auto.mjs';
import {swipeChannelDelta,nextChannelIndex,safeHistory,recentChannelMatches} from './mobile-ux.mjs';
import {createAutoPiPController} from './mobile-auto-pip.mjs';
import {chooseCast,togglePiP,isMuted} from './mobile-media-controls.mjs';
import {playerSvg} from './mobile-player-icons.mjs';
import {createMobileBackgroundAudio} from './mobile-background-audio.mjs';
import {MOBILE_VERSION,MAX_BATCH,batchWindow,appendEvidence,rightsDialog,installMobileParity} from './mobile-rustlab-parity.mjs';
import './core-browser.js';
import './styles.css';
import { stableId, dedupChannels, normalizeHTTPURL, textFromResponse, parseBasicEPG, pool, xmltvDate } from './mobile-core.mjs';

const $ = x=>document.querySelector(x), $$=x=>[...document.querySelectorAll(x)];
const tMobile=key=>window.OpenIPTVI18n?.t?.(key)||key;
const CORE=window.StreamLeafCore;
const KEY='openiptv_mobile_4211_v1';
let state={sources:[],favorites:[],channels:[],checks:{},healthHistory:{},checkCursor:0,fallbacks:{},epgUrl:'',epgCache:null,epgSources:null,resumeUrl:null,selected:null,filter:'',page:'tv',group:'',recentlyWatched:[],manualStreams:{},settings:{threads:16,autoRefreshEPG:true,autoRefreshPlaylists:true,autoResumeLast:true,autoPiPOnBackground:false,backgroundAudioEnabled:true}};
try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');state={...state,...old,settings:{...state.settings,...old.settings}};}catch{}
state.channels=Array.isArray(state.channels)?state.channels:[];
state.sources=Array.isArray(state.sources)?state.sources:[];
state.favorites=Array.isArray(state.favorites)?state.favorites:[];
state.recentlyWatched=Array.isArray(state.recentlyWatched)?state.recentlyWatched:[];
state.checks=state.checks||{};
state.healthHistory=state.healthHistory||{};
state.checkCursor=Number(state.checkCursor)||0;
state.fallbacks=state.fallbacks||{};
state.manualStreams=state.manualStreams||{};
let busy=false, playerHls=null;let multiPlayers=[];
let mediaPlaying=false, mediaPaused=false, mediaMuted=false, epgItems=state.epgCache?.items||[];
let epgManager=null,startupPlaybackDone=false;
let nativeFullscreenActive=false;
let pipController=null;
let backgroundAudio=null;
function syncAutoPiP(){void pipController?.sync();}
const native=Capacitor.isNativePlatform();
const androidPiP = native && Capacitor.getPlatform()==='android' ? registerPlugin('OpenIPTVAutoPiP'):null;
function save(){const keep={...state};try{localStorage.setItem(KEY,JSON.stringify(keep));}catch(e){status('Bộ nhớ gần đầy; hãy xuất M3U sao lưu','error');}}
function status(t,kind=''){const el=$('#status');if(!el)return;el.textContent=t;el.dataset.kind=kind;el.hidden=false;clearTimeout(status.hideTimer);status.hideTimer=setTimeout(()=>{el.hidden=true;},3800);}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function button(text,action,cls=''){const b=node('button',cls,text);b.type='button';b.onclick=()=>Promise.resolve().then(action).catch(e=>{status(e.message||e,'error');console.error(e);});return b;}
function downloadFile(name,content,type='application/vnd.apple.mpegurl'){const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(new Blob([content],{type}));a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function exportFile(name,content){if(native){await Filesystem.writeFile({path:name,data:content,directory:Directory.Cache,encoding:Encoding.UTF8});const {uri}=await Filesystem.getUri({path:name,directory:Directory.Cache});await Share.share({title:name,url:uri,dialogTitle:'Lưu hoặc gửi playlist M3U'});}else downloadFile(name,content);status(tMobile('Đã xuất')+' '+name,'ok');}
async function getText(url,timeoutMs=15000){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);try{if(native){const response=await CapacitorHttp.request({url,method:'GET',connectTimeout:timeoutMs,readTimeout:timeoutMs,headers:{'Accept':'application/x-mpegURL,application/vnd.apple.mpegurl,text/plain,application/xml,*/*','User-Agent':'OpenIPTVProMobile/4.21.1'},responseType:'text'});if(response.status<200||response.status>=300)throw Error('HTTP '+response.status);return textFromResponse(response);}const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.text();}finally{clearTimeout(timer);}}
async function headStatus(url,timeoutMs=7000){if(native){const r=await CapacitorHttp.request({url,method:'HEAD',connectTimeout:timeoutMs,readTimeout:timeoutMs});return r.status;}const c=new AbortController();const t=setTimeout(()=>c.abort(),timeoutMs);try{const r=await fetch(url,{method:'HEAD',signal:c.signal});return r.status;}finally{clearTimeout(t);}}
async function rightsFor(kind){const consent=await rightsDialog({title:tMobile('Xác nhận quyền sử dụng')+' · M3U'});if(!consent){status('Đã hủy nhập nguồn. Không thay đổi dữ liệu.');return false;}return true;}
function annotate(sourceId,rows){return rows.map((c,i)=>({...c,sourceId,id:sourceId+'|'+i,group:c.group||'Khác'}));}
function flatten(){let result=[];for(const src of state.sources.filter(s=>s.enabled!==false)){result.push(...(src.channels||[]));}state.channels=result;if(!state.selected && result.length)state.selected=result[0].url;
 if(state.selected&&!result.some(c=>c.url===state.selected))state.selected=result[0]?.url||null;
 save();render();}
async function addURL(){const value=$('#newSource').value.trim();if(!value)throw Error('Nhập URL M3U');const url=normalizeHTTPURL(value);if(state.sources.some(x=>x.url===url))throw Error('Nguồn này đã có');if(!(await rightsFor('URL M3U')))return;busy=true;status('Đang tải M3U…');try{const txt=await getText(url,18000);const id='src-'+stableId(url);const rows=annotate(id,CORE.parseM3U(txt,id));if(!rows.length)throw Error('M3U không có kênh HTTP hợp lệ');state.sources.push({id,name:new URL(url).hostname,url,enabled:true,channels:rows,updatedAt:new Date().toISOString()});$('#newSource').value='';flatten();status(tMobile('Đã thêm')+' '+rows.length+' '+tMobile('kênh')+' '+tMobile('từ')+' '+url,'ok');}finally{busy=false;}}
async function addFile(file){if(!file)return;if(file.size>25*1024*1024)throw Error('M3U vượt 25MB');if(!(await rightsFor('file M3U')))return;const content=await file.text();const id='file-'+stableId(file.name+'|'+Date.now());const rows=annotate(id,CORE.parseM3U(content,id));if(!rows.length)throw Error('M3U không có kênh');state.sources.push({id,name:file.name,enabled:true,channels:rows,updatedAt:new Date().toISOString()});flatten();status('Đã nhập '+rows.length+' kênh từ file','ok');}
async function editSource(s){const next=prompt('URL M3U mới',s.url||'');if(next===null)return;const url=normalizeHTTPURL(next);if(!(await rightsFor('sửa URL M3U')))return;status('Đang kiểm tra URL mới…');const txt=await getText(url);const rows=annotate(s.id,CORE.parseM3U(txt,s.id));if(!rows.length)throw Error('Nguồn URL mới không có kênh hợp lệ. Giữ URL cũ');s.url=url;s.name=new URL(url).hostname;s.channels=rows;s.updatedAt=new Date().toISOString();flatten();status('Đã thay URL nguồn và tải '+rows.length+' kênh','ok');}
async function refreshSources({quiet=false}={}){
 if(busy)return;busy=true;
 const sources=state.sources.filter(x=>x.url&&x.enabled!==false);let index=0,success=0,failed=0;
 try{
  await Promise.all(Array.from({length:Math.min(3,sources.length)},async()=>{while(index<sources.length){
   const src=sources[index++];
   try{const raw=await getText(src.url,20000);if(raw.length>25*1024*1024)throw Error('M3U quá 25MB');
       const items=annotate(src.id,CORE.parseM3U(raw,src.id));
       if(!items.length)throw Error('Danh sách mới không có kênh hợp lệ');
       src.channels=items;src.updatedAt=new Date().toISOString();success++;
   }catch(e){failed++;console.warn('Refresh playlist',src.name,e);}
  }}));
  flatten();
  if(!quiet)status('Đã làm mới '+success+'/'+sources.length+' nguồn; '+failed+' lỗi giữ dữ liệu cũ',success?'ok':'error');
  return {success,failed};
 }finally{busy=false;}
}
function activeChannels(){let all=dedupChannels(state.channels);if(state.page==='fav')all=all.filter(c=>state.favorites.includes(c.url));if(state.group)all=all.filter(c=>c.group===state.group);const q=state.filter.toLowerCase().trim();if(q)all=all.filter(c=>(c.name+' '+c.group+' '+c.url).toLowerCase().includes(q));return all;}

const groupOpened=new Set();
let showOnlyFavorites=false;
function pickChannel(c){
 state.selected=c.url;
 // Selection alone must not add an unplayed channel to watch history.
 const el=$('#fallbackSource');if(el)el.value=c.url;
 save();renderNowPlaying();renderChannels();
}

function channelTitle(channel){return channel?.name||'Chưa chọn kênh';}
function renderStreamPicker(channel){
 const picker=$('#manualStreamSelect');if(!picker)return;
 const options=streamOptions(channel,state.fallbacks),previous=state.manualStreams[channel?.url]||channel?.url;
 picker.replaceChildren();
 if(!options.length){picker.add(new Option('Chưa chọn kênh',''));picker.disabled=true;return;}
 for(const item of options){let host='';try{host=new URL(item.url).hostname;}catch{}picker.add(new Option(item.label+(host?' · '+host:''),item.url));}
 picker.disabled=false;
 picker.value=options.some(x=>x.url===previous)?previous:channel.url;
}
function formatProgramClock(value){
 const parsed=xmltvDate(value);
 return parsed?parsed.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'—';
}
function renderCurrentEPG(channel){
 const id=matchGuideChannel(state.epgCache,channel);
 const result=epgNowNext(epgItems,id,Date.now(),xmltvDate);
 const nowName=$('#epgNowName'),nextName=$('#epgNextName');
 if(!nowName)return;
 nowName.dataset.i18nIgnore=result.current?'true':'false';nextName.dataset.i18nIgnore=result.following?'true':'false';
 nowName.textContent=result.current?.title||'Chưa có lịch hiện tại';
 nextName.textContent=result.following?.title||'Chưa có lịch tiếp theo';
 $('#epgNowTime').textContent=result.current?formatProgramClock(result.current.start)+' – '+formatProgramClock(result.current.stop):'—';
 $('#epgNextTime').textContent=result.following?formatProgramClock(result.following.start)+' – '+formatProgramClock(result.following.stop):'—';
}
function syncMediaControls(){
 const toggle=$('#playCurrent');
 const playing=backgroundAudio?.active?!backgroundAudio.paused:mediaPlaying&&!mediaPaused;
 if(toggle){toggle.innerHTML=playerSvg(playing?'pause':'play');toggle.setAttribute('aria-label',playing?'Tạm dừng':'Phát');}
 const v=$('#webVideo'),silent=backgroundAudio?.active?backgroundAudio.muted:isMuted(v);
 const mute=$('#muteCurrent');
 if(mute){const glyph=mute.querySelector('.media-icon');if(glyph)glyph.innerHTML=playerSvg(silent?'muted':'volume');mute.setAttribute('aria-pressed',String(silent));mute.setAttribute('aria-label',silent?'Bật tiếng':'Tắt tiếng');}
}

function renderNowPlaying(){
 const c=state.channels.find(x=>x.url===state.selected);
 const title=$('#nowTitle'),group=$('#nowGroup'),star=$('#nowFavorite');
 if(!title)return;
 title.dataset.i18nIgnore=c?'true':'false';group.dataset.i18nIgnore=c?'true':'false';
 title.textContent=c?.name||'Chưa chọn kênh';
 group.textContent=c?.group||'Chọn một kênh trong danh sách';
 $('#heroTitle').textContent=c?'Sẵn sàng phát':'Chưa chọn kênh';
 $('#heroSubtitle').textContent=c?'Bấm Phát để xem kênh đã chọn':'Nhập M3U hoặc chọn kênh để xem';
 star.textContent=c&&state.favorites.includes(c.url)?'★':'☆';
 star.disabled=!c;
 $('#playCurrent').disabled=!c;
 $('#previousChannel').disabled=!state.channels.length;
 $('#nextChannel').disabled=!state.channels.length;
 $('#stopCurrent').disabled=!c;
 renderStreamPicker(c);
 renderCurrentEPG(c);
 syncMediaControls();
}
function jumpChannel(delta,autoplay=true){
 const rows=dedupChannels(state.channels);if(!rows.length)return;
 const at=nextChannelIndex(rows,state.selected,delta);
 const c=rows[at];if(!c)return;
 if(autoplay&&backgroundAudio?.active){
   void backgroundAudio.switchChannel(c).then(ok=>{
     if(!ok)return;
     pickChannel(c);state.resumeUrl=c.url;
     state.recentlyWatched=safeHistory(state.recentlyWatched,c.url,30);
     save();renderRecentChannels();
   }).catch(e=>status('Nghe nền: '+(e.message||e),'error'));
   return;
 }
 pickChannel(c);
 if(autoplay)play(c).catch(e=>status(tMobile('Chuyển kênh')+': '+(e.message||e),'error'));
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

function renderRecentChannels(){
 const section=$('#recentChannelsSection'),root=$('#recentChannelList');
 if(!root||!section)return;
 const q=(state.filter||'').trim();
 // The favorites-only toggle is independent of the watch history.
 const visible=recentChannelMatches(dedupChannels(state.channels),state.recentlyWatched,{maxItems:10,query:q});
 section.hidden=showOnlyFavorites||(Boolean(q)&&visible.length===0);
 root.replaceChildren();
 $('#recentCount').textContent=String(visible.length);
 const clear=$('#clearRecent');clear.hidden=!state.recentlyWatched.length;
 if(section.hidden)return;
 if(!visible.length){
   root.append(node('p','recent-empty',
     state.recentlyWatched.length?'Kênh đã xem chưa có trong nguồn đang bật.':'Chưa có kênh vừa xem. Mở một kênh để lưu vào đây.'));
   return;
 }
 const fragment=document.createDocumentFragment();
 for(const c of visible){
   const item=button('',()=>{pickChannel(c);return play(c);},'recent-channel');
   item.setAttribute('aria-label','Phát lại '+c.name);
   if(c.url===state.selected)item.classList.add('selected');
   const imageWrap=node('span','recent-channel-logo');
   if(c.logo&&/^https?:\/\//i.test(c.logo)){
     const img=node('img');img.src=c.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';
     img.onerror=()=>img.replaceWith(node('span','','▶'));
     imageWrap.append(img);
   }else imageWrap.textContent='▶';
   const copy=node('span','recent-channel-copy');
   copy.append(node('strong','',c.name),node('small','',c.group||'Kênh TV'));
   item.append(imageWrap,copy);
   fragment.append(item);
 }
 root.append(fragment);
}

function renderChannels(){
 renderRecentChannels();
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
 epgManager?.render();
 const threads=$('#threadCount');if(threads)threads.value=String(state.settings.threads||16);
 $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
 $$('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+state.page));
 $('#moreTrigger').classList.toggle('active',!['tv','fav','epg','sources'].includes(state.page));
}
function toggleFavorite(c){state.favorites=state.favorites.includes(c.url)?state.favorites.filter(x=>x!==c.url):[...state.favorites,c.url];save();renderChannels();$('#favCount').textContent=String(state.favorites.length);renderNowPlaying();}

// Capgo's native player supports only fullscreen on iOS/Android.
// Default play must use the in-page HTML5 video; native is reserved for ⛶.
function nativePlayOptions(c,url){return {mode:'fullscreen',playerId:'main-player',url,title:c.name,smallTitle:c.group,artwork:c.logo||undefined,showControls:true,chromecast:true,pipEnabled:state.settings.autoPiPOnBackground===true,bkmodeEnabled:true};}
function showInline(visible){
 const v=$('#webVideo'),ph=$('.hero-placeholder'),hero=$('.hero-player');
 v.hidden=!visible;ph.hidden=visible;hero.classList.toggle('has-video',visible);
}
async function play(c,requestedURL,{startup=false}={}){
 if(!c)throw Error('Chưa chọn kênh');
 if(backgroundAudio?.active)backgroundAudio.deactivate(false);
 state.selected=c.url;
 const configured=streamOptions(c,state.fallbacks),allowed=new Set(configured.map(x=>x.url));
 const preferred=requestedURL||state.manualStreams[c.url];
 const urls=[...new Set([preferred,...configured.map(x=>x.url)].filter(x=>allowed.has(x)))];
 if(!urls.length)throw Error('Kênh chưa có URL phát hợp lệ');
 renderNowPlaying();$('#fallbackSource').value=c.url;save();
 const v=$('#webVideo');let last;
 for(const url of urls){
  try{
   playerHls?.destroy();playerHls=null;
   v.pause();v.removeAttribute('src');v.load();
   v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
   v.controls=false;v.muted=mediaMuted;v.defaultMuted=mediaMuted;v.style.objectFit=state.settings.videoFit||'contain';
   v.setAttribute('x-webkit-airplay','allow');
   if(/\.m3u8(?:[?#]|$)/i.test(url)&&!v.canPlayType('application/vnd.apple.mpegurl')&&Hls.isSupported()){
     playerHls=new Hls({lowLatencyMode:false,maxBufferLength:20});
     playerHls.attachMedia(v);playerHls.loadSource(url);
   }else{v.src=url;v.load();}
   showInline(true);
   try{await v.play();}catch(e){
    if(!startup||e?.name!=='NotAllowedError')throw e;
    v.muted=true;mediaMuted=true;await v.play();
   }
   state.resumeUrl=c.url;
   state.recentlyWatched=safeHistory(state.recentlyWatched,c.url,30);
   save();renderRecentChannels();
   mediaPlaying=true;mediaPaused=false;syncMediaControls();syncAutoPiP();
   status(isMuted(v)?'Đang phát hình. Chạm nút loa nhỏ dưới video để bật tiếng.':tMobile('Đang phát trong khung')+': '+c.name,'ok');return;
  }catch(e){
   last=e;playerHls?.destroy();playerHls=null;
   v.pause();v.removeAttribute('src');v.load();
  }
 }
 showInline(false);mediaPlaying=false;mediaPaused=false;syncMediaControls();syncAutoPiP();
 throw Error('Không phát trong khung (CORS/codec): '+(last?.message||last||'')+'. Có thể thử ⛶.');
}
async function playFullscreen(){
 if(backgroundAudio?.active)backgroundAudio.deactivate(false);
 const c=state.channels.find(x=>x.url===state.selected);if(!c)throw Error('Chọn kênh trước');
 const v=$('#webVideo');
 if(native){
   const configured=streamOptions(c,state.fallbacks);
   const requested=state.manualStreams[c.url]||c.url;
   const url=configured.some(x=>x.url===requested)?requested:c.url;
   const wasPlaying=!v.paused;v.pause();mediaPaused=true;syncMediaControls();
   try{
     await VideoPlayer.stopAllPlayers().catch(()=>{});
     await VideoPlayer.initPlayer(nativePlayOptions(c,url));
     nativeFullscreenActive=true;syncAutoPiP();
     await VideoPlayer.play({playerId:'main-player'});
   }catch(e){
     nativeFullscreenActive=false;syncAutoPiP();
     if(wasPlaying){await v.play().catch(()=>{});mediaPaused=v.paused;syncMediaControls();}
     throw Error('Lỗi toàn màn hình: '+(e?.message||e));
   }
   return;
 }
 if(v.requestFullscreen){await v.requestFullscreen();return;}
 if(typeof v.webkitEnterFullscreen==='function'){v.webkitEnterFullscreen();return;}
 if($('.hero-player').requestFullscreen){await $('.hero-player').requestFullscreen();return;}
 throw Error('Không hỗ trợ toàn màn hình');
}
async function pauseResumeCurrent(){
 const c=state.channels.find(x=>x.url===state.selected);if(!c)throw Error('Chưa chọn kênh');
 if(backgroundAudio?.active)return backgroundAudio.togglePlayback();
 if(!mediaPlaying)return play(c);
 const v=$('#webVideo');
 if(v.paused){await v.play();mediaPaused=false;}else{v.pause();mediaPaused=true;}
 syncMediaControls();syncAutoPiP();
}
async function muteUnmute(){
 if(backgroundAudio?.active){
   mediaMuted=!backgroundAudio.muted;backgroundAudio.setMuted(mediaMuted);
   const video=$('#webVideo');video.muted=mediaMuted;video.defaultMuted=mediaMuted;
   syncMediaControls();return;
 }
 const v=$('#webVideo');
 mediaMuted=!isMuted(v);v.muted=mediaMuted;v.defaultMuted=mediaMuted;
 if(!mediaMuted&&v.currentSrc&&v.paused){try{await v.play();}catch(e){syncMediaControls();throw Error('Không thể bật tiếng cho luồng này: '+(e?.message||e));}}
 syncMediaControls();
 if(!mediaMuted)status('Đã bật âm thanh. Nếu vẫn im lặng, kiểm tra âm lượng iPhone hoặc codec âm thanh của nguồn IPTV.','ok');
}
async function stop(){
 if(backgroundAudio?.active)backgroundAudio.deactivate(false);
 if(nativeFullscreenActive){await VideoPlayer.stopAllPlayers().catch(()=>{});nativeFullscreenActive=false;}
 playerHls?.destroy();playerHls=null;
 const v=$('#webVideo');v.pause();v.removeAttribute('src');v.load();showInline(false);
 mediaPlaying=false;mediaPaused=false;syncMediaControls();syncAutoPiP();status('Đã dừng phát');
}
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
 status(tMobile('Đang kiểm tra')+' '+(batch.start+1)+'–'+batch.end+'/'+all.length+' · '+limit+' luồng');
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
async function viewEPG(){if(!epgManager)throw Error('EPG chưa khởi tạo');const custom=$('#epgURL').value.trim();if(custom)epgManager.addCustom();return epgManager.refresh(false);}
async function exportM3U(){const channels=state.channels.map(c=>({...c,status:state.checks[c.url]?.status||'unchecked'})).sort((a,b)=>Number(a.status==='dead')-Number(b.status==='dead'));await exportFile('OpenIPTV_Mobile_Channels.m3u',CORE.exportM3U(channels));}
async function editFallback(){const url=$('#fallbackSource').value.trim();if(!url)throw Error('Chọn kênh/URL trước');const alt=$('#fallbackURL').value.trim();if(!alt){delete state.fallbacks[url];save();status('Đã xóa URL dự phòng');return;}state.fallbacks[url]=[normalizeHTTPURL(alt)];save();renderNowPlaying();status('Đã lưu link dự phòng','ok');}
async function currentSnapshot(){const v=$('#webVideo');if(!v.videoWidth)throw Error('Chưa phát được video để chụp');const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);try{const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!blob)throw Error('Không có ảnh');const b64=await new Promise(resolve=>{const rd=new FileReader();rd.onload=()=>resolve(rd.result.split(',')[1]);rd.readAsDataURL(blob)});await Filesystem.writeFile({path:'snapshot.jpg',data:b64,directory:Directory.Cache});const {uri}=await Filesystem.getUri({path:'snapshot.jpg',directory:Directory.Cache});await Share.share({title:'Snapshot IPTV',url:uri});}catch(e){throw Error('Snapshot lỗi (CORS/DRM): '+e.message);}}
function stopMulti(){const wasPlaying=multiPlayers.length>0;for(const p of multiPlayers){try{p.hls?.destroy();p.v.pause();p.v.removeAttribute('src');p.v.load();}catch{}}multiPlayers=[];if(wasPlaying)status('Đã dừng MultiView');}
async function startMulti(){stopMulti();const grid=$('#multiGrid');grid.replaceChildren();const list=dedupChannels(state.channels).filter(c=>/^https?:/.test(c.url));if(!list.length)throw Error('Chưa nhập M3U');for(let slot=0;slot<4;slot++){const cell=node('div','multi-cell');const sel=node('select');sel.append(new Option('Chọn kênh',''));for(const c of list.slice(0,1500)){sel.add(new Option(c.name,c.url));}const v=node('video');v.controls=true;v.muted=true;v.playsInline=true;v.preload='none';v.autoplay=false;const info=node('small','','');sel.onchange=async()=>{try{const old=multiPlayers.find(x=>x.v===v);old?.hls?.destroy();multiPlayers=multiPlayers.filter(x=>x.v!==v);v.pause();v.removeAttribute('src');v.load();if(!sel.value)return;const chosen=sel.value;if(/\.m3u8(?:\?|$)/i.test(chosen)&&Hls.isSupported()){const hls=new Hls({enableWorker:true,maxBufferLength:7,maxBackBufferLength:3});hls.loadSource(chosen);hls.attachMedia(v);multiPlayers.push({hls,v});}else{v.src=chosen;multiPlayers.push({v});}await v.play();info.textContent='Đang phát · chạm biểu tượng loa để nghe';}catch(e){info.textContent='Không thể phát trong WebView (CORS/codec): '+e.message;}};cell.append(sel,v,info);grid.append(cell);}status('MultiView thử nghiệm: chọn tối đa 4 kênh, tất cả mặc định tắt tiếng');}
function showTab(tab){if(state.page==='multi'&&tab!=='multi')stopMulti();state.page=tab;save();render();window.scrollTo({top:0,behavior:'instant'});}
function init(){document.querySelector('#app').innerHTML=oldStyleLayout();
 if(!['tv','fav','epg','sources','multi','tools'].includes(state.page))state.page='tv';
 document.documentElement.classList.add(native?'native-mobile':'web-mobile');
 if(native && Capacitor.getPlatform()==='ios')document.documentElement.classList.add('ios-mobile');
 // Intentional swipe over the placeholder player only; does not steal list scrolling.
 const hero=$('.hero-player');let start=null;
 hero.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;const t=e.touches[0];start={x:t.clientX,y:t.clientY,at:Date.now()};},{passive:true});
 hero.addEventListener('touchend',e=>{if(!start||e.changedTouches.length!==1)return;const t=e.changedTouches[0];const dx=t.clientX-start.x,dy=t.clientY-start.y;const delta=swipeChannelDelta(dx,dy,Date.now()-start.at);start=null;if(delta && state.channels.length)jumpChannel(delta);},{passive:true});
 hero.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 $('#pasteM3U').onclick=async()=>{
  let value='';
  try{if(navigator.clipboard?.readText)value=(await navigator.clipboard.readText()).trim();}catch{}
  if(!value)value=(prompt('Dán URL M3U (HTTP/HTTPS)', '')||'').trim();
  if(!value)return;
  try{const link=normalizeHTTPURL(value);$('#newSource').value=link;status('Đã điền URL. Bấm Thêm để xác nhận quyền sử dụng.','ok');}catch(e){status('URL M3U không hợp lệ: '+e.message,'error');}
 };

  $$('.tab').forEach(b=>b.onclick=()=>showTab(b.dataset.page));$('#search').oninput=e=>{state.filter=e.target.value;renderChannels();};$('#quickFavorite').onclick=()=>{showOnlyFavorites=!showOnlyFavorites;renderChannels();};
 $('#clearRecent').onclick=()=>{
  if(!state.recentlyWatched.length||!confirm('Xóa danh sách kênh vừa xem?'))return;
  state.recentlyWatched=[];state.resumeUrl=null;save();renderRecentChannels();status('Đã xóa lịch sử kênh vừa xem','ok');
 };
 $('#expandFolders').onclick=()=>{for(const c of state.channels)groupOpened.add(c.group||'Khác');renderChannels();};
 $('#collapseFolders').onclick=()=>{groupOpened.clear();renderChannels();};


 $('#openGuideBtn').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);showTab('epg');if(c?.tvgId)$('#epgChannel').value=c.tvgId;};
 $('#videoFit').value=state.settings.videoFit||'contain';
 $('#videoFit').onchange=e=>{
   const mode=e.target.value;if(!['contain','cover','fill','none'].includes(mode))return;
   state.settings.videoFit=mode;
   $('#webVideo').style.objectFit=mode;save();
   if(native)status('Chế độ khung hình áp dụng cho WebView; trình phát native dùng điều khiển riêng','ok');
 };
 $('#manualStreamSelect').onchange=e=>{
   const c=state.channels.find(x=>x.url===state.selected);if(!c)return;
   const url=e.target.value;
   if(!streamOptions(c,state.fallbacks).some(o=>o.url===url))return;
   state.manualStreams[c.url]=url;save();
   play(c,url).catch(e=>status(e.message,'error'));
 };
 function closeMore(){
  $('#moreOverlay').hidden=true;$('#moreTrigger').setAttribute('aria-expanded','false');
  document.body.classList.remove('more-open');
 }
 function openMore(){
  $('#moreOverlay').hidden=false;$('#moreTrigger').setAttribute('aria-expanded','true');
  document.body.classList.add('more-open');$('#moreClose').focus();
 }
 $('#moreTrigger').onclick=()=>$('#moreOverlay').hidden?openMore():closeMore();
 $('#moreClose').onclick=closeMore;
 $('#moreOverlay').querySelector('.more-backdrop').onclick=closeMore;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#moreOverlay').hidden)closeMore();});
 $('#moreOverlay').querySelectorAll('[data-more]').forEach(btn=>btn.onclick=()=>{
   const action=btn.dataset.more;closeMore();
   const tools=()=>showTab('tools');
   if(action==='multiview'){showTab('multi');return;}
   if(action==='snapshot'){currentSnapshot().catch(e=>status(e.message,'error'));return;}
   if(action==='folders'){showTab('tv');$('#channelList').scrollIntoView({block:'start'});return;}
   if(action==='health'){tools();$('#checkBtn').scrollIntoView({block:'center'});return;}
   if(action==='doctor'){tools();const b=[...document.querySelectorAll('#page-tools .parity-buttons button')].find(b=>b.textContent.includes('Doctor'));b?.click();document.querySelector('#doctorReport')?.scrollIntoView({block:'start'});return;}
   if(action==='backup'){tools();document.querySelector('#page-tools .mobile-parity')?.scrollIntoView({block:'start'});return;}
   if(action==='file'){showTab('sources');$('#file').click();return;}
   if(action==='url'){showTab('sources');$('#newSource').focus();return;}
   if(action==='export'){exportM3U().catch(e=>status(e.message,'error'));return;}
   if(action==='settings'){tools();return;}
   if(action==='fallback'){tools();$('#fallbackURL').scrollIntoView({block:'center'});return;}
   if(action==='terms'){tools();const b=[...document.querySelectorAll('#page-tools .parity-buttons button')].find(b=>b.textContent.includes('điều khoản Discovery'));b?.click();}
 });

 $('#nowFavorite').onclick=()=>{const c=state.channels.find(x=>x.url===state.selected);if(c)toggleFavorite(c);};
 $('#previousChannel').onclick=()=>jumpChannel(-1);
 $('#nextChannel').onclick=()=>jumpChannel(1);
 $('#playCurrent').onclick=()=>pauseResumeCurrent().catch(e=>status(e.message,'error'));
 $('#stopCurrent').onclick=()=>stop().catch(e=>status(e.message,'error'));
 $('#backgroundAudioToggle').onclick=()=>{void backgroundAudio?.toggle().catch(e=>status('Nghe nền: '+e.message,'error'));};
 $('#muteCurrent').onclick=()=>muteUnmute().catch(e=>status(e.message,'error'));

 $('#fullScreenCurrent').onclick=()=>playFullscreen().catch(e=>status(e.message,'error'));
 $('#pictureInPicture').onclick=()=>{
   const v=$('#webVideo');
   if(!v.currentSrc||v.paused){status('Hãy phát kênh trước khi bật PiP','error');return;}
   if(androidPiP){androidPiP.enter().catch(e=>status('PiP Android: '+(e?.message||e),'error'));return;}
   togglePiP(v,document).catch(e=>status('PiP: '+(e?.message||e),'error'));
 };
 $('#castCurrent').onclick=()=>{
   const v=$('#webVideo');
   const ios=Capacitor.getPlatform()==='ios'||/iPhone|iPad|iPod/.test(navigator.userAgent);
   chooseCast(v,{
     isIOS:ios,
     isAndroidNative:Capacitor.getPlatform()==='android',
     openAndroidNativeCast:async()=>{
       status('Đang mở trình phát native. Chọn biểu tượng Chromecast trong trình phát.','ok');
       await playFullscreen();
     },
     onUnavailable:msg=>status(msg,'error')
   }).catch(e=>status('Cast / AirPlay: '+(e?.message||e),'error'));
 };$('#addURL').onclick=()=>addURL().catch(e=>status(e.message,'error'));
 $('#file').onchange=e=>addFile(e.target.files?.[0]).catch(err=>status(err.message,'error'));
 $('#refresh').onclick=()=>refreshSources().catch(e=>status(e.message,'error'));
 $('#checkBtn').onclick=()=>checkAll().catch(e=>status(e.message,'error'));
 $('#exportBtn').onclick=()=>exportM3U().catch(e=>status(e.message,'error'));
 $('#loadEPG').onclick=()=>viewEPG().catch(e=>status(e.message,'error'));
 $('#saveFallback').onclick=()=>editFallback().catch(e=>status(e.message,'error'));
 $('#snapshot').onclick=()=>currentSnapshot().catch(e=>status(e.message,'error'));
 $('#startMulti').onclick=()=>startMulti().catch(e=>status(e.message,'error'));$('#stopMulti').onclick=stopMulti;

 
 $('#threadCount').replaceChildren(...Array.from({length:32},(_,i)=>new Option(String(i+1),String(i+1))));
 const video=$('#webVideo');
 video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 video.addEventListener('playing',()=>{mediaPlaying=true;mediaPaused=false;syncMediaControls();syncAutoPiP();if(state.selected){try{appendEvidence(state.healthHistory,state.selected,'decoded-playback');save();}catch{}}});
 video.addEventListener('pause',()=>{if(mediaPlaying){mediaPaused=true;syncMediaControls();syncAutoPiP();}});
 video.addEventListener('ended',()=>{mediaPlaying=false;mediaPaused=false;syncMediaControls();syncAutoPiP();});
 video.addEventListener('volumechange',()=>{if(!backgroundAudio?.active)mediaMuted=isMuted(video);syncMediaControls();});

 render();}

async function resumePreviousChannel(){
 if(startupPlaybackDone||state.settings.autoResumeLast===false)return;
 const url=state.resumeUrl||state.recentlyWatched?.[0],channel=resumeChannel(state.channels,url);
 if(!channel)return;
 startupPlaybackDone=true;
 try{await play(channel,undefined,{startup:true});}
 catch(e){status('Không tự phát được kênh trước: '+(e?.message||e),'error');}
}
async function startupSync(){
 await resumePreviousChannel();
 const tasks=[];
 if(state.settings.autoRefreshPlaylists!==false&&state.sources.some(x=>x.url&&x.enabled!==false))
   tasks.push(refreshSources({quiet:true}).catch(e=>console.warn('Startup playlist:',e)));
 if(state.settings.autoRefreshEPG!==false)
   tasks.push(epgManager?.refresh(true).catch(e=>console.warn('Startup EPG:',e)));
 await Promise.allSettled(tasks);
 await resumePreviousChannel();
}
init();
backgroundAudio=createMobileBackgroundAudio({
 video:$('#webVideo'),getChannel:()=>state.channels.find(c=>c.url===state.selected),
 getStreamURL:channel=>{
   const options=streamOptions(channel,state.fallbacks);
   const choice=$('#manualStreamSelect')?.value||state.manualStreams[channel?.url]||channel?.url;
   return options.some(item=>item.url===choice)?choice:channel?.url;
 },
 getSettings:()=>state.settings,HlsImpl:Hls,onStatus:status,
 onNavigate:delta=>jumpChannel(delta),
 onStop:()=>{void stop().catch(e=>status(e.message,'error'));},
 onStateChange:({active,paused})=>{
   const button=$('#backgroundAudioToggle'),label=$('#backgroundAudioLabel'),note=$('#backgroundAudioStatus');
   if(!button)return;
   button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
   button.setAttribute('aria-label',active?'Quay lại xem TV':'Nghe nền · khóa màn hình');
   button.disabled=state.settings.backgroundAudioEnabled===false;
   if(label)label.textContent=active?'Xem TV':'Nghe nền';
   if(note)note.textContent=active?(paused?'Đã tạm dừng âm thanh nền.':'Đang nghe nền · khóa màn hình nếu thiết bị hỗ trợ.'):'Nhấn Nghe nền khi đang xem, sau đó khóa màn hình.';
   syncMediaControls();
 }
});
const backgroundEnabled=$('#backgroundAudioEnabled');
backgroundEnabled.checked=state.settings.backgroundAudioEnabled!==false;
backgroundEnabled.onchange=()=>{
 state.settings.backgroundAudioEnabled=backgroundEnabled.checked;save();
 if(!backgroundEnabled.checked)backgroundAudio.disable();
 $('#backgroundAudioToggle').disabled=!backgroundEnabled.checked;
 status(backgroundEnabled.checked?'Đã bật cho phép Nghe nền.':'Đã tắt Nghe nền.','ok');
};
if(!backgroundEnabled.checked)$('#backgroundAudioToggle').disabled=true;
installMobileParity({getState:()=>state,replaceState:next=>{state={...state,...next};flatten();},save,status,exportFile});
pipController=createAutoPiPController({
 getVideo:()=>$('#webVideo'),
 getSettings:()=>state.settings,
 isPlaying:()=>mediaPlaying&&!mediaPaused&&!$('#webVideo').paused,
 isNativeFullscreen:()=>nativeFullscreenActive,
 onWarning:message=>status(message,'error')
});
const pipToggle=$('#autoPiPOnBackground');
pipToggle.checked=state.settings.autoPiPOnBackground===true;
pipToggle.onchange=()=>{
 state.settings.autoPiPOnBackground=pipToggle.checked;save();syncAutoPiP();
 status(pipToggle.checked?'Đã bật tự động PiP (theo hỗ trợ của thiết bị)':'Đã tắt tự động PiP','ok');
};
epgManager=installEPGAuto({getState:()=>state,save,getText,parseDate:xmltvDate,
 getSelectedChannel:()=>state.channels.find(x=>x.url===state.selected),
 notify:status,onGuide:cache=>{epgItems=cache.items;renderCurrentEPG(state.channels.find(x=>x.url===state.selected));}});
Promise.resolve().then(startupSync).catch(e=>console.warn('Auto refresh:',e));

