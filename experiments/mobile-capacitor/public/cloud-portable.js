/* Open IPTV Pro cross-platform Supabase sync (Web data format v1).
 * Explicit first pairing; optimistic revision checks; no image/video/EPG cache.
 * Publishable key only. NEVER embed service_role secrets or auth tokens in backups.
 */
'use strict';
(function(root){
 const URL='https://zjbsvqryaxtafuffpifu.supabase.co';
 const KEY='sb_publishable_j_aWS273AgxBi0JYj4O-WA_bNxHFxM7';
 const TABLE='openiptv_user_state';
 const STATE_KEY='openiptv:cross-cloud:paired:v1';
 const CHANNEL_KEYS=['sources','channels','favorites','favoriteKeys','folders','groupOrder',
  'channelOrder','collapsedGroups','alternates','collectorBackup','collectorConfig',
  'recentChannelIds','current','volume','videoFit','autoEnableAudio',
  'snapshotSkipExisting','snapshotConcurrency','checkConcurrency'];
 const SKIP=new Set(['snapshots','thumbnail','thumbnails','image','images','imageCache',
  'imageData','imageBlob','snapshotImage','snapshotImages','snapshotData','snapshotCache',
  'screenshot','screenshots','screenshotData','posterData','coverData','thumbnailData',
  'thumbnailBase64','previewImage','previewImages','previewFrame','previewFrames',
  'frameCapture','frameCaptures','lastFrame','epgCache','epgRaw','epgPrograms',
  'cloudSession','cloudToken','healthHistory','checks','checkCursor']);
 const copy=v=>JSON.parse(JSON.stringify(v,(k,val)=>{
  if(k.startsWith('_')||SKIP.has(k))return undefined;
  if(typeof val==='string'&&/^data:image\//i.test(val.trim()))return undefined;
  return val;
 }));
 function canonical(input,mode){
  const src=input&&typeof input==='object'?input:{},raw={};
  if(mode==='mobile'){
   const channels=Array.isArray(src.channels)?src.channels:[];
   raw.sources=(Array.isArray(src.sources)?src.sources:[]).map(({channels:unused,...rest})=>rest);
   raw.channels=channels;
   raw.favorites=(src.favorites||[]).map(k=>{
    const hit=channels.find(c=>c.id===k||c.url===k);
    return hit?.id||k;
   });
   raw.recentChannelIds=(src.recentlyWatched||[]).map(x=>typeof x==='string'?x:x?.id).filter(Boolean).slice(0,60);
   raw.channelOrder=src.channelOrder||{};
   raw.groupOrder=src.groupOrder||[];
   raw.volume=src.settings?.volume;
   raw.videoFit=src.settings?.videoFit;
  }else for(const k of CHANNEL_KEYS)if(Object.hasOwn(src,k))raw[k]=src[k];
  const out={};
  for(const [k,v] of Object.entries(raw))if(v!==undefined)out[k]=v;
  return copy(out);
 }
 function applyCloud(local,cloud,mode){
  const out=JSON.parse(JSON.stringify(local)); // local-only EPG and snapshot caches remain on device
  if(mode==='mobile'){
   const channels=Array.isArray(cloud.channels)?cloud.channels:[];
   if(Array.isArray(cloud.sources))out.sources=cloud.sources.map(s=>({
    ...s,channels:channels.filter(c=>c.sourceId===s.id)
   }));
   if(Array.isArray(cloud.channels))out.channels=channels;
   if(Array.isArray(cloud.favorites))
    out.favorites=cloud.favorites.map(k=>channels.find(c=>c.id===k)?.url||k);
   if(Array.isArray(cloud.recentChannelIds))out.recentlyWatched=cloud.recentChannelIds;
   if(cloud.groupOrder)out.groupOrder=cloud.groupOrder;
   if(cloud.channelOrder)out.channelOrder=cloud.channelOrder;
   if(typeof cloud.volume==='number')out.settings={...out.settings,volume:cloud.volume};
   if(typeof cloud.videoFit==='string')out.settings={...out.settings,videoFit:cloud.videoFit};
  }else for(const k of CHANNEL_KEYS)if(Object.hasOwn(cloud,k))out[k]=copy(cloud[k]);
  return out;
 }
 // Never leave a paired account's playlists visible after explicit sign-out.
 // Preserve device-only appearance preferences, but clear account-owned content.
 function guestState(local,mode){
  const out=JSON.parse(JSON.stringify(local||{}));
  if(mode==='mobile'){
   for(const key of ['sources','channels','favorites','recentlyWatched'])out[key]=[];
   for(const key of ['fallbacks','checks','healthHistory'])out[key]={};
   out.selected=null;out.resumeUrl=null;out.epgCache=null;out.epgSources=null;out.epgUrl='';
  }else{
   for(const key of ['sources','channels','favorites','favoriteKeys','folders','groupOrder',
    'collapsedGroups','recentChannelIds'])out[key]=[];
   for(const key of ['channelOrder','collectorBackup','collectorConfig','snapshots'])out[key]={};
   out.alternates=[];out.current='';
  }
  return out;
 }
 function mount({getState,saveState,mode='desktop',container}){
  if(root.__openIPTVPortableCloudMounted)return;
  if(typeof getState!=='function'||typeof saveState!=='function'||!root.supabase?.createClient)return;
  const host=container||document.querySelector(mode==='mobile'?'#page-tools':'#page-settings .settings-grid');
  if(!host)return;
  root.__openIPTVPortableCloudMounted=true;
  const css='display:block;max-width:760px;padding:14px;margin:12px 0;border:1px solid #8885;border-radius:12px;background:var(--surface,#162127);color:inherit';
  const el=document.createElement('section');
  el.id='openiptvPortableCloud';el.style.cssText=css;
  el.innerHTML='<h3 style="margin:0 0 8px">☁ Tài khoản & đồng bộ Supabase</h3>'+
   '<p id="portableCloudStatus" role="status" aria-live="polite">Đang kiểm tra tài khoản…</p>'+
   '<form id="portableCloudEmailForm"><input id="portableCloudEmail" type="email" autocomplete="email" required placeholder="Email" style="min-width:150px;max-width:100%;padding:8px"/>'+
   ' <button type="submit">Gửi mã OTP</button></form>'+
   '<form id="portableCloudOTPForm"><input id="portableCloudOTP" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" placeholder="Mã OTP"/>'+
   ' <button type="submit">Xác nhận</button></form>'+
   '<form id="portableCloudLinkForm"><input id="portableCloudLink" type="url" placeholder="Dán liên kết xác nhận email (nếu không có mã)" style="max-width:100%;min-width:240px;padding:8px"/>'+
   ' <button type="submit">Xác thực liên kết</button></form>'+
   '<div id="portableCloudActions" hidden><button id="portableCloudPull" type="button">↓ Lấy dữ liệu từ đám mây</button> '+
   '<button id="portableCloudPush" type="button">↑ Gửi dữ liệu thiết bị</button> '+
   '<button id="portableCloudLogout" type="button">Đăng xuất</button></div>'+
   '<p style="font-size:12px;opacity:.8">Chỉ đồng bộ danh sách kênh, nguồn, yêu thích và cài đặt. Không tải ảnh, video, EPG hay cache. '+
   'Lần đầu, chọn dữ liệu cần giữ; không tự ghi đè. Khi đã ghép thiết bị, tự đồng bộ thay đổi mỗi 60 giây.</p>';
  host.prepend(el);
  const $=id=>el.querySelector('#'+id),say=t=>{$('portableCloudStatus').textContent=t;};
  const cli=root.supabase.createClient(URL,KEY,{auth:{
   storageKey:'openiptv-cross-platform-auth-v1',persistSession:true,
   autoRefreshToken:true,detectSessionInUrl:false,flowType:'pkce'
  },global:{headers:{'x-client-info':'open-iptv-pro-cross-platform'}}});
  let user=null,busy=false,lastCheck=0;
  const paired=()=>{try{const x=JSON.parse(localStorage.getItem(STATE_KEY)||'null');return x?.userId===user?.id?x:null;}catch{return null;}};
  function setPair(rev,hash){localStorage.setItem(STATE_KEY,JSON.stringify({userId:user.id,revision:rev,hash}));}
  const serialize=()=>JSON.stringify(canonical(getState(),mode));
  const hash=()=>{const str=serialize();let h=2166136261;for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),16777619);return String(h>>>0);};
  async function head(){
   const {data,error}=await cli.from(TABLE).select('revision,updated_at').eq('user_id',user.id).maybeSingle();
   if(error)throw error;return data;
  }
  async function remote(){
   const {data,error}=await cli.from(TABLE).select('payload,revision,updated_at').eq('user_id',user.id).maybeSingle();
   if(error)throw error;return data;
  }
  function secureBackup(value,reason){
   const key='openiptv:cross-cloud:recovery:'+Date.now();
   localStorage.setItem(key,JSON.stringify({reason,createdAt:new Date().toISOString(),payload:copy(value)}));
   return key;
  }
  async function pull(confirmFirst=true){
   if(!user||busy)return;
   busy=true;try{
    const row=await remote();if(!row){say('Tài khoản chưa có dữ liệu trên server.');return;}
    if(confirmFirst&&!confirm('Thay kênh và cài đặt đang đồng bộ trên thiết bị này bằng bản đám mây? Bản cục bộ sẽ được giữ trong bản sao phục hồi.'))return;
    const prior=getState(),next=applyCloud(prior,row.payload,mode);
    const recovery=secureBackup(prior,'before-cloud-pull');
    await Promise.resolve(saveState(next));
    setPair(row.revision,hash());
    say('Đã lấy dữ liệu server. Bản cũ: '+recovery+'. Đang cập nhật giao diện…');
    setTimeout(()=>location.reload(),250);
   }catch(e){say('Không thể tải/khôi phục: '+e.message);}
   finally{busy=false;}
  }
  async function push(confirmFirst=true,expectedRevision=null){
   if(!user||busy)return;
   busy=true;try{
    const row=await remote();
    if(expectedRevision!==null&&(row?.revision||0)!==expectedRevision)
     throw Error('Server vừa đổi phiên bản, tải lại để tránh ghi đè');
    if(confirmFirst&&row?.payload&&
       !confirm('Ghi dữ liệu kênh và cài đặt trên máy lên tài khoản Supabase? Dữ liệu chung sẽ thay thế phiên bản cũ; một bản phục hồi được giữ trên thiết bị.'))return;
    const mine=canonical(getState(),mode);
    // Keep fields from Web/newer apps that this platform cannot represent.
    const desired={...(row?.payload||{}),...mine};
    const safeDesired=copy(desired);
   const serialized=JSON.stringify(safeDesired);
    if(new TextEncoder().encode(serialized).length>1950000)throw Error('Bản đồng bộ vượt 1,95 MB; hãy giảm số kênh');
    if(row)secureBackup(row.payload,'before-cloud-push');
    const query=row
      ?cli.from(TABLE).update({payload:safeDesired,revision:row.revision+1,updated_at:new Date().toISOString()})
          .eq('user_id',user.id).eq('revision',row.revision).select('revision').maybeSingle()
      :cli.from(TABLE).insert({user_id:user.id,payload:safeDesired,revision:1}).select('revision').single();
    const {data,error}=await query;
    if(error)throw error;
    if(!data?.revision)throw Error('Có thiết bị khác đã cập nhật; không ghi đè. Hãy kiểm tra lại.');
    setPair(data.revision,hash());say('Đã đồng bộ thành công, phiên bản '+data.revision+'.');
   }catch(e){say('Đồng bộ chưa thành công: '+e.message);}
   finally{busy=false;}
  }
  async function autosync(){
   if(!user||busy||document.hidden||navigator.onLine===false)return;
   const pair=paired();if(!pair)return;
   try{
    const latest=await head(),localHash=hash();
    if(!latest){if(localHash!==pair.hash)await push(false,pair.revision);return;}
    if(latest.revision===pair.revision){
     if(localHash!==pair.hash)await push(false,pair.revision);
    }else if(localHash===pair.hash)await pull(false);
    else say('Hai thiết bị đã thay đổi dữ liệu cùng lúc. Chọn Tải lên hoặc Tải xuống để giải quyết.');
   }catch(e){say('Tạm dừng đồng bộ tự động: '+e.message);}
  }
  function ui(){
   const signed=!!user;
   $('portableCloudEmailForm').hidden=signed;
   $('portableCloudOTPForm').hidden=signed;
   $('portableCloudLinkForm').hidden=signed;
   $('portableCloudActions').hidden=!signed;
   if(signed)say('Đã đăng nhập: '+(user.email||'Supabase')+(paired()?' · tự đồng bộ 60 giây':' · chọn tải lên hoặc tải xuống lần đầu'));
   else say('Chế độ khách · dữ liệu vẫn lưu trên máy');
  }
  $('portableCloudEmailForm').addEventListener('submit',async event=>{
   event.preventDefault();try{
    const email=$('portableCloudEmail').value.trim();
    if(!email)throw Error('Nhập email');
    const {error}=await cli.auth.signInWithOtp({email,options:{
      shouldCreateUser:true,emailRedirectTo:'https://trisanghy.github.io/open-iptv-pro/'
    }});
    if(error)throw error;
    say('Đã yêu cầu gửi mã. Nhập mã trong email; nếu thư chỉ có liên kết, quản trị viên cần bật mẫu OTP.');
   }catch(e){say('Không thể gửi mã: '+e.message);}
  });
  $('portableCloudOTPForm').addEventListener('submit',async event=>{
   event.preventDefault();
   try{
    const email=$('portableCloudEmail').value.trim(),token=$('portableCloudOTP').value.trim();
    if(!/^[0-9]{6,10}$/.test(token))throw Error('Mã OTP phải gồm 6 đến 10 chữ số');
    const {data,error}=await cli.auth.verifyOtp({email,token,type:'email'});
    if(error)throw error;
    user=data.user||data.session?.user;
    $('portableCloudOTP').value='';ui();
   }catch(e){say('Không thể xác thực: '+e.message);}
  });
  $('portableCloudLinkForm').addEventListener('submit',async event=>{
   event.preventDefault();
   try{
    const raw=$('portableCloudLink').value.trim();
    const u=new URL(raw);
    if(u.origin!==URL||u.pathname!=='/auth/v1/verify'||u.protocol!=='https:')
     throw Error('Chỉ chấp nhận link xác thực Open IPTV Pro');
    const type=u.searchParams.get('type')||'email';
    if(!['email','magiclink','signup','invite'].includes(type))
     throw Error('Kiểu link không được hỗ trợ');
    const token_hash=u.searchParams.get('token_hash')||u.searchParams.get('token');
    if(!token_hash||token_hash.length>2048)throw Error('Liên kết thiếu mã hợp lệ');
    const {data,error}=await cli.auth.verifyOtp({token_hash,type});
    if(error)throw error;
    $('portableCloudLink').value='';
    user=data.user||data.session?.user;ui();
   }catch(e){say('Không xác thực được link: '+e.message);}
  });
  $('portableCloudPull').onclick=()=>void pull(true);
  $('portableCloudPush').onclick=()=>void push(true);
  $('portableCloudLogout').onclick=async()=>{
   if(busy||!user)return;
   const pair=paired();
   if(pair&&hash()!==pair.hash){
    say('Có dữ liệu chưa đồng bộ. Hãy bấm Gửi dữ liệu thiết bị hoặc Lấy dữ liệu đám mây trước khi đăng xuất.');
    return;
   }
   if(!confirm('Đăng xuất và ẩn danh sách kênh của tài khoản trên thiết bị này? Dữ liệu đã đồng bộ trên Supabase không bị xóa.'))return;
   busy=true;
   let previous=null,cleared=false;
   try{
    if(pair){
     previous=JSON.parse(JSON.stringify(getState()));
     await Promise.resolve(saveState(guestState(previous,mode)));
     cleared=true;
    }
    const {error}=await cli.auth.signOut();
    if(error)throw error;
    user=null;localStorage.removeItem(STATE_KEY);
    ui();
    // Clear in-memory channel lists, player state and any rendered previews.
    location.reload();
   }catch(e){
    if(cleared){
     try{await Promise.resolve(saveState(previous));}
     catch(rollbackError){say('Không thể khôi phục dữ liệu cục bộ: '+rollbackError.message);busy=false;return;}
    }
    say('Lỗi đăng xuất: '+e.message);
   }finally{busy=false;}
  };
  cli.auth.onAuthStateChange((event,session)=>{
   if(['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED'].includes(event)){user=session?.user||null;ui();}
   if(event==='SIGNED_OUT'){user=null;ui();}
  });
  void cli.auth.getSession().then(({data,error})=>{
   if(error)throw error;user=data.session?.user||null;ui();
  }).catch(e=>say('Không tải được phiên đăng nhập: '+e.message));
  const interval=setInterval(()=>void autosync(),60000);
  root.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
  root.OpenIPTVCloudPortableInstance={pull,push,autosync};
 }
 root.OpenIPTVPortableCloud=Object.freeze({mount,canonical,applyCloud,guestState});
})(typeof window!=='undefined'?window:globalThis);
