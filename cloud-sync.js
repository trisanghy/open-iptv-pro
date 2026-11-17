'use strict';
/* Open IPTV Pro Web — optional GitHub/Google OAuth and private Supabase sync.
 * No service-role keys, no OAuth provider tokens, no data uploaded as a guest.
 */
(async()=>{
 if(window.streamleaf)return;
 const app=window.IPTVState, core=window.OpenIPTVCloudCore;
 const el=id=>document.getElementById(id);
 const card=el('cloudSyncCard'),status=el('cloudStatus');
 if(!app||!core||!card||!status)return;
 const google=el('cloudLoginGoogle'),github=el('cloudLoginGithub');
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
  if(!localStorage.getItem(GUEST)){
   const saved=localStorage.getItem(STORE);
   localStorage.setItem(GUEST,saved||'');
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
  show(google,!uid&&!!client);show(github,!uid&&!!client);
  show(logout,!!uid);show(sync,!!uid&&ready);
  account.textContent=uid?'Đã đăng nhập · '+(window.__iptvCloudUserName||'Tài khoản'):'Chế độ khách · lưu trên thiết bị';
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
  show(choices,true);syncControls();
  label('Cần chọn bản dữ liệu để đồng bộ, chưa có dữ liệu nào bị ghi đè.');
 }
 async function uploadLocal(force=false){
  if(!uid||busy||!client)return;
  busy=true;clearTimeout(timer);
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
   revision=newRev;saveMeta(uid,revision,local);ready=true;
   show(choices,false);pendingRemote=null;
   label('Đã đồng bộ lúc '+new Date().toLocaleTimeString('vi-VN'));
  }catch(e){
   report(e,'khi tải dữ liệu lên');dirty=true;
  }finally{busy=false;syncControls();}
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
   clearTimeout(timer);
   if(dirty&&ready)await uploadLocal();
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
   label('Cloud chưa được kích hoạt. Website tiếp tục lưu riêng trên trình duyệt.');
   return;
  }
  client=window.supabase.createClient(cfg.url,cfg.publishableKey,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},
   global:{headers:{'x-client-info':'open-iptv-pro-web'}}
  });
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
  else label('Chế độ khách. Đăng nhập Google hoặc GitHub để đồng bộ dữ liệu.');
 }catch(e){report(e,'khởi tạo Cloud');}
})();
