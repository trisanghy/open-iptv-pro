'use strict';
/* Open IPTV Pro Web — optional GitHub/Google OAuth and private Supabase sync.
 * No service-role keys, no OAuth provider tokens, no data uploaded as a guest.
 */
(async()=>{
 if(window.streamleaf)return;
 const app=window.IPTVState, core=window.OpenIPTVCloudCore;
 const el=id=>document.getElementById(id);
 const card=el('cloudSyncCard'),status=el('cloudStatus');
 const quick=el('cloudAccountQuick');
 if(!app||!core||!card||!status)return;
 if(quick)quick.addEventListener('click',()=>{
   document.querySelector('.nav[data-page="settings"]')?.click();
   requestAnimationFrame(()=>card.scrollIntoView({block:'start',behavior:'smooth'}));
 });
 const google=el('cloudLoginGoogle'),github=el('cloudLoginGithub');
 const emailForm=el('cloudEmailForm'),emailInput=el('cloudEmailInput'),otpForm=el('cloudOtpForm');
 const otpCode=el('cloudOtpCode'),otpVerify=el('cloudOtpVerify'),providersNote=el('cloudAuthProviders');
 const linkForm=el('cloudLinkForm'),linkInput=el('cloudLinkInput'),linkVerify=el('cloudLinkVerify');
 let enabledProviders={email:false,google:false,github:false};
 const logout=el('cloudLogout'),sync=el('cloudSyncNow');
 const account=el('cloudAccount'),choices=el('cloudSyncConflict');
 const useLocal=el('cloudUseLocal'),useCloud=el('cloudUseRemote'),later=el('cloudLater');
 const info=el('cloudConflictReason');
 const STORE='open-iptv-pro-4',GUEST='openiptv:guest-backup:v1',ACTIVE='openiptv:active-uid:v1';
 const META=id=>'openiptv:sync-meta:'+id;
 let client=null,uid='',revision=0,ready=false,busy=false,dirty=false,timer=0,sessionSeq=0,pendingRemote=null;
 const show=(node,visible)=>{if(node)node.hidden=!visible;};
 const label=(message)=>{status.textContent=message;};
 const current=()=>core.snapshot(app.getStore?.());
 const contentHash=data=>{
  const s=JSON.stringify(core.snapshot(data));let n=2166136261;
  for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);
  return String(n>>>0);
 };
 const metaFor=id=>{try{return JSON.parse(localStorage.getItem(META(id))||'null')}catch{return null}};
 function saveMeta(id,rev,payload){
  localStorage.setItem(META(id),JSON.stringify({revision:rev,hash:contentHash(payload)}));
 }
 const guestBackup=()=>{
  // If this browser is already holding the signed-in user's state,
  // never mistake it for a guest backup after a refresh.
  if(localStorage.getItem(ACTIVE))return;
  if(localStorage.getItem(GUEST)===null){
   const saved=localStorage.getItem(STORE);
   try{localStorage.setItem(GUEST,saved||'');}
   catch(e){
    // Large lists can exhaust localStorage quota. Never block sign-in,
    // and never restore another user's data when signing out.
    console.warn('Guest backup unavailable due to local storage quota',e);
   }
  }
 };
 const isDifferentUser=id=>{const p=localStorage.getItem(ACTIVE);return p&&p!==id};
 const swapIntoLocal=(state,id,rev)=>{
  core.validate(state);
  const from=core.snapshot(state);
  localStorage.setItem(STORE,JSON.stringify(from));
  localStorage.setItem(ACTIVE,id);
  saveMeta(id,rev,from);
  location.reload();
 };
 const report=(error,context)=>{
  console.warn('Open IPTV cloud sync',context,error);
  label('Lỗi '+context+': '+String(error?.message||error||'Không rõ').slice(0,170));
 };
 const authName=user=>
  user?.user_metadata?.full_name||user?.user_metadata?.user_name||user?.email||'Tài khoản';
 const syncControls=()=>{
  show(google,!uid&&!!client&&enabledProviders.google);
  show(github,!uid&&!!client&&enabledProviders.github);
  show(emailForm,!uid&&!!client&&enabledProviders.email);
  show(otpForm,!uid&&!!client&&enabledProviders.email);
  show(linkForm,!uid&&!!client&&enabledProviders.email);
  show(logout,!!uid);show(sync,!!uid&&ready);
  account.textContent=uid?'Đã đăng nhập · '+(window.__iptvCloudUserName||'Tài khoản'):'Chế độ khách · lưu trên thiết bị';
  if(quick){
   quick.textContent=uid?'☁ '+(window.__iptvCloudUserName||'Tài khoản'):'☁ Tài khoản';
   quick.title=uid?'Tài khoản đã đăng nhập và đồng bộ':'Đăng nhập và đồng bộ dữ liệu IPTV';
  }
 };
 async function readRemote(id){
  const {data,error}=await client.from('openiptv_user_state')
   .select('payload,revision,updated_at').eq('user_id',id).maybeSingle();
  if(error)throw error;
  return data;
 }
 function prompt(reason,remote){
  ready=false;pendingRemote=remote;dirty=false;
  info.textContent=reason;
  show(choices,true);show(useCloud,!!remote);syncControls();
  label('Cần chọn bản dữ liệu để đồng bộ, chưa có dữ liệu nào bị ghi đè.');
 }
 async function uploadLocal(force=false){
  if(!uid||busy||!client)return;
  busy=true;clearTimeout(timer);
  let reschedule=false;
  try{
   const local=core.validate(current()).payload;
   // Always compare revisions in DB; never silently clobber another device.
   const prior=force?await readRemote(uid):null;
   const expected=prior?prior.revision:revision;
   let error=null,newRev=null;
   if(!expected){
    const result=await client.from('openiptv_user_state')
     .insert({user_id:uid,payload:local,revision:1})
     .select('revision').single();
    error=result.error;newRev=result.data?.revision;
   }else{
    const result=await client.from('openiptv_user_state')
     .update({payload:local,revision:expected+1,updated_at:new Date().toISOString()})
     .eq('user_id',uid).eq('revision',expected)
     .select('revision').maybeSingle();
    error=result.error;newRev=result.data?.revision;
   }
   if(error)throw error;
   if(!newRev){
    const next=await readRemote(uid);
    prompt('Thiết bị khác vừa cập nhật dữ liệu. Chọn giữ bản trên máy hoặc bản đám mây.',next);
    return;
   }
   revision=newRev;saveMeta(uid,revision,local);
   localStorage.setItem(ACTIVE,uid);ready=true;
   dirty=!core.same(current(),local);
   reschedule=dirty;
   show(choices,false);pendingRemote=null;
   label('Đã đồng bộ lúc '+new Date().toLocaleTimeString('vi-VN'));
  }catch(e){
   report(e,'khi tải dữ liệu lên');dirty=true;
  }finally{busy=false;syncControls();if(reschedule&&ready)schedule();}
 }
 const schedule=()=>{
  if(!ready||!uid)return;
  dirty=true;clearTimeout(timer);label('Đang chờ đồng bộ…');
  timer=setTimeout(()=>{
   if(!dirty||!ready)return;
   dirty=false;
   uploadLocal(false);
  },1800);
 };
 async function reconcile(user){
  const id=user.id;
  if(!id||uid===id)return;
  const ticket=++sessionSeq;
  ready=false;clearTimeout(timer);
  if(isDifferentUser(id)){
   // Never upload the previous account's browser state to a new account.
   const backup=localStorage.getItem(GUEST);
   if(backup!==null) {
    if(backup)localStorage.setItem(STORE,backup);
    else localStorage.removeItem(STORE);
   }
   localStorage.removeItem(ACTIVE);
   location.reload();return;
  }
  guestBackup();
  uid=id;window.__iptvCloudUserName=authName(user);
  syncControls();
  label('Đang kiểm tra dữ liệu tài khoản…');
  try{
   const remote=await readRemote(id);
   if(ticket!==sessionSeq)return;
   revision=remote?.revision||0;
   const local=current();
   const meta=metaFor(id);
   if(!remote){
    if(core.isMeaningful(local))
     prompt('Tài khoản chưa có bản sao. Tải dữ liệu đang có trên máy lên đám mây?',null);
    else {ready=true;label('Đăng nhập thành công · chưa có dữ liệu.');syncControls();}
    return;
   }
   if(core.same(remote.payload,local)){
    ready=true;saveMeta(id,revision,local);
    localStorage.setItem(ACTIVE,id);
    label('Đã khôi phục kết nối · dữ liệu đồng bộ.');syncControls();return;
   }
   if(!core.isMeaningful(local)){swapIntoLocal(remote.payload,id,revision);return;}
   if(meta?.hash===contentHash(local)&&remote.revision>meta.revision){
    swapIntoLocal(remote.payload,id,revision);return;
   }
   if(meta?.revision===remote.revision && meta.hash!==contentHash(local)){
    ready=true;syncControls();schedule();return;
   }
   prompt('Dữ liệu trên máy khác với bản đám mây. Chọn bản bạn muốn giữ; không tự ghi đè.',remote);
  }catch(e){report(e,'khi tải dữ liệu tài khoản');}
 }
 async function login(provider){
  if(!client)return;
  try{
   const url=location.origin+location.pathname;
   const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:url}});
   if(error)throw error;
  }catch(e){report(e,'khi đăng nhập '+provider);}
 }
 google.addEventListener('click',()=>login('google'));
 github.addEventListener('click',()=>login('github'));

 linkVerify?.addEventListener('click',async()=>{
  if(!client||!enabledProviders.email)return;
  let url,parsed;
  try{
   url=new URL(String(linkInput?.value||'').trim());
   const ownHost=new URL(client.supabaseUrl).hostname;
   if(url.protocol!=='https:'||url.hostname!==ownHost||url.pathname!=='/auth/v1/verify')
    throw Error('Chỉ nhận liên kết xác thực của dự án Supabase này.');
   const token_hash=url.searchParams.get('token_hash')||url.searchParams.get('token');
   const kind=url.searchParams.get('type')||'email';
   if(!token_hash||!['magiclink','email','signup','invite'].includes(kind))
    throw Error('Liên kết chưa có mã xác thực hợp lệ.');
   parsed={token_hash,type:kind};
  }catch(e){report(e,'kiểm tra liên kết');return;}
  linkVerify.disabled=true;
  try{
   const {data,error}=await client.auth.verifyOtp(parsed);
   if(error)throw error;
   if(data?.user)await reconcile(data.user);
   if(linkInput)linkInput.value='';
   label('Xác thực liên kết thành công.');
  }catch(e){report(e,'xác thực liên kết');}
  finally{linkVerify.disabled=false;}
 });


 const safeEmail=()=>String(emailInput?.value||'').trim().toLowerCase();
 emailForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!client||!enabledProviders.email)return;
  const email=safeEmail();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   label('Địa chỉ email không hợp lệ.');return;
  }
  const send=el('cloudEmailSend');if(send)send.disabled=true;
  try{
   const {error}=await client.auth.signInWithOtp({
    email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}
   });
   if(error)throw error;
   label('Đã yêu cầu gửi liên kết đăng nhập tới '+email+'. Kiểm tra cả thư rác; nếu có mã OTP, nhập bên dưới.');
  }catch(e){report(e,'gửi email đăng nhập');}
  finally{if(send)send.disabled=false;}
 });
 otpVerify?.addEventListener('click',async()=>{
  if(!client||!enabledProviders.email)return;
  const email=safeEmail(),token=String(otpCode?.value||'').trim();
  if(!email||!/^[0-9]{6,8}$/.test(token)){label('Nhập email và mã xác nhận hợp lệ.');return;}
  otpVerify.disabled=true;
  try{
   const {data,error}=await client.auth.verifyOtp({email,token,type:'email'});
   if(error)throw error;
   if(data?.user)await reconcile(data.user);
   label('Xác thực email thành công.');
  }catch(e){report(e,'xác thực mã email');}
  finally{otpVerify.disabled=false;}
 });

 sync.addEventListener('click',async()=>{
  if(!uid)return;
  const live=await readRemote(uid).catch(e=>{report(e,'kiểm tra dữ liệu');return undefined});
  if(live===undefined)return;
  if(!ready){
   prompt('Đồng bộ đang tạm dừng. Chọn dữ liệu máy hoặc dữ liệu đám mây để tiếp tục.',live);
   return;
  }
  if((live?.revision||0)!==revision){
   prompt('Đã có thay đổi từ thiết bị khác. Hãy chọn bản muốn giữ.',live);
   return;
  }
  await uploadLocal();
 });
 useLocal.addEventListener('click',()=>{if(uid)void uploadLocal(true);});
 useCloud.addEventListener('click',()=>{
  if(!uid)return;
  if(!pendingRemote){label('Chưa có bản đám mây để khôi phục.');return;}
  swapIntoLocal(pendingRemote.payload,uid,pendingRemote.revision);
 });
 later.addEventListener('click',()=>{
  show(choices,false);pendingRemote=null;ready=false;
  label('Đã giữ dữ liệu trên máy. Đồng bộ tạm dừng cho đến khi bạn chọn lại.');
  show(sync,true);sync.textContent='Thiết lập đồng bộ';
 });
 logout.addEventListener('click',async()=>{
  try{
   if(choices&&!choices.hidden){label('Hãy chọn dữ liệu cần giữ trước khi đăng xuất.');return;}
   clearTimeout(timer);
   if(dirty&&ready){
    await uploadLocal();
    if(dirty){
      label('Đồng bộ chưa hoàn tất. Vui lòng thử lại trước khi đăng xuất để tránh mất dữ liệu.');
      return;
    }
   }
   const {error}=await client.auth.signOut();
   if(error)throw error;
   const guest=localStorage.getItem(GUEST);
   if(guest===null||guest==='')localStorage.removeItem(STORE);
   else localStorage.setItem(STORE,guest);
   localStorage.removeItem(ACTIVE);
   uid='';ready=false;location.reload();
  }catch(e){report(e,'khi đăng xuất');}
 });
 document.addEventListener('openiptv:local-saved',()=>schedule());
 window.addEventListener('online',()=>{if(dirty&&ready)schedule();});
 window.addEventListener('focus',()=>{if(dirty&&ready)schedule();});
 syncControls();
 try{
  const reply=await fetch(new URL('cloud-config.json',document.baseURI),{cache:'no-cache'});
  if(!reply.ok)throw Error('Không tìm thấy cấu hình Cloud');
  const cfg=await reply.json();
  if(!cfg.enabled||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url||'')
      ||!cfg.publishableKey||!window.supabase?.createClient){
   label('Đồng bộ chưa được kích hoạt: cần thiết lập dự án Supabase và OAuth. Dữ liệu vẫn lưu an toàn trong trình duyệt.');
   return;
  }
  client=window.supabase.createClient(cfg.url,cfg.publishableKey,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},
   global:{headers:{'x-client-info':'open-iptv-pro-web'}}
  });
  // Public GoTrue settings reveal which OAuth providers are actually enabled.
  // Do not show a broken Google/GitHub button if its secret is not configured.
  try{
   const providerReply=await fetch(cfg.url+'/auth/v1/settings',{
    headers:{apikey:cfg.publishableKey},cache:'no-store'
   });
   if(providerReply.ok){
    const settings=await providerReply.json();
    enabledProviders={email:settings.external_email!==false,
      google:settings.external_google===true,
      github:settings.external_github===true};
   }else enabledProviders={email:true,google:false,github:false};
  }catch(e){
   console.warn('Could not verify enabled OAuth providers',e);
   enabledProviders={email:true,google:false,github:false};
  }
  if(providersNote){
   providersNote.textContent=enabledProviders.google||enabledProviders.github
    ? 'Có thể đăng nhập bằng email hoặc nhà cung cấp đang khả dụng.'
    : 'Đăng nhập bằng email. Google/GitHub sẽ xuất hiện khi bật OAuth trong Supabase.';
  }
  syncControls();
  client.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_IN'||event==='INITIAL_SESSION'||event==='TOKEN_REFRESHED'){
    setTimeout(()=>{if(session?.user)reconcile(session.user).catch(e=>report(e,'xác thực'));},0);
   }
   if(event==='SIGNED_OUT'){ready=false;uid='';syncControls();}
  });
  const {data,error}=await client.auth.getSession();
  if(error)throw error;
  if(data.session?.user)await reconcile(data.session.user);
  else if(localStorage.getItem(ACTIVE)){
   // Session expired or was revoked: restore the saved guest state instead
   // of exposing a signed-in user's IPTV data to the next visitor.
   const backup=localStorage.getItem(GUEST);
   if(backup)localStorage.setItem(STORE,backup);
   else localStorage.removeItem(STORE);
   localStorage.removeItem(ACTIVE);
   location.reload();
  }else label('Chế độ khách. Đăng nhập bằng email; Google/GitHub khả dụng khi được cấu hình.');
 }catch(e){report(e,'khởi tạo Cloud');}
})();
