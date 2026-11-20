'use strict';
/* Open IPTV Pro Web — email OTP, optional OAuth and private Supabase sync.
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
  let emailRequested=false,linkHelpOpen=false;
  const linkHelp=document.createElement('button');
  linkHelp.id='cloudLinkHelp';linkHelp.type='button';linkHelp.className='btn btn-subtle cloud-link-toggle';
  linkHelp.textContent='Email không có mã? Xác thực bằng liên kết';
  linkHelp.setAttribute('aria-controls','cloudLinkForm');
  linkHelp.setAttribute('aria-expanded','false');
  linkForm?.before(linkHelp);
  linkHelp.addEventListener('click',()=>{
   linkHelpOpen=!linkHelpOpen;linkHelp.setAttribute('aria-expanded',String(linkHelpOpen));
   linkHelp.textContent=linkHelpOpen?'Ẩn xác thực bằng liên kết':'Email không có mã? Xác thực bằng liên kết';
   syncControls();
  });
  let authGuide=null;
  if(emailForm){
   const guide=document.createElement('p');guide.className='cloud-auth-guide';
   authGuide=guide;
   guide.textContent='Đăng nhập bằng email: nếu thư có mã OTP, nhập mã ở Bước 2. Nếu thư chỉ có nút xác nhận tài khoản, chọn phương án liên kết bên dưới. Gmail có thể mở trong trình duyệt khác.';
   emailForm.before(guide);
   const hint=emailForm.querySelector('.hint');
   if(hint)hint.textContent='Với email đăng ký lần đầu, Supabase có thể gửi thư Confirm your email address thay vì mã OTP nếu mẫu Confirm sign up chưa thiết lập.';
   const sendButton=el('cloudEmailSend');if(sendButton)sendButton.textContent='Gửi mã OTP qua email';
   const label=linkForm?.querySelector('label');
   if(label)label.textContent='Dán liên kết Confirm email address hoặc Sign in chưa mở từ Gmail';
   const linkHint=linkForm?.querySelector('.hint');
   if(linkHint)linkHint.textContent='Gmail gửi thư Confirm your email address vì mẫu xác nhận đăng ký chưa có mã OTP. Nhấn giữ nút Confirm email address → Sao chép địa chỉ liên kết (không mở), dán tại đây rồi xác thực. Nếu liên kết báo lỗi hoặc trỏ về localhost, hãy yêu cầu email mới sau khi người quản trị cập nhật cài đặt Supabase.';
  }
 const logout=el('cloudLogout'),sync=el('cloudSyncNow');
 const migrationRestore=document.createElement('button');
 migrationRestore.id='cloudMigrationRestore';migrationRestore.type='button';
 migrationRestore.className='btn btn-subtle';migrationRestore.hidden=true;
 migrationRestore.textContent='Khôi phục dữ liệu cũ';
 migrationRestore.title='Khôi phục bản sao dữ liệu từ Supabase cũ';
 sync?.after(migrationRestore);
 const account=el('cloudAccount'),choices=el('cloudSyncConflict'),privacyNote=el('cloudPrivacyNote');
 const useLocal=el('cloudUseLocal'),useCloud=el('cloudUseRemote'),later=el('cloudLater');
 const info=el('cloudConflictReason');
 const STORE='open-iptv-pro-4',GUEST='openiptv:guest-backup:v1',ACTIVE='openiptv:active-uid:v1';
 const OLD_CLOUD_REF='ehzfaragssjolojyswin',NEW_CLOUD_REF='zjbsvqryaxtafuffpifu';
 const MIGRATION_BACKUP='openiptv:project-switch-backup:'+OLD_CLOUD_REF+':v1';
 function preserveOldProjectData(){
  try{
   // Do not automatically move another account's playlists to a new identity.
   // Keep a recovery copy before the old session is cleared on project switch.
   const oldUid=localStorage.getItem(ACTIVE);
   const raw=localStorage.getItem(STORE);
   if(!oldUid||!raw||localStorage.getItem(MIGRATION_BACKUP)
     ||localStorage.getItem('sb-'+NEW_CLOUD_REF+'-auth-token'))return true;
   const payload=JSON.parse(raw);
   if(!payload||typeof payload!=='object'||Array.isArray(payload))
    throw Error('Invalid prior account snapshot');
   localStorage.setItem(MIGRATION_BACKUP,JSON.stringify({
    project:OLD_CLOUD_REF,userId:oldUid,savedAt:new Date().toISOString(),payload
   }));
   return true;
  }catch(e){
   console.warn('Could not preserve data during Supabase project switch',e);
   label('Không đủ bộ nhớ sao lưu dữ liệu trước khi đổi Supabase. Hãy xuất bản sao lưu JSON; ứng dụng không tự xóa dữ liệu cũ.','error');
   return false;
  }
 }
 const META=id=>'openiptv:sync-meta:'+id;
 const RECOVERY=id=>'openiptv:autosync-recovery:'+id;
 let client=null,uid='',revision=0,ready=false,busy=false,dirty=false,timer=0,sessionSeq=0,pendingRemote=null,lastObservedHash='',retryTimer=0;
 const show=(node,visible)=>{if(node)node.hidden=!visible;};
 const label=(message,tone='info')=>{status.textContent=message;status.dataset.state=tone;};
 const current=()=>core.snapshot(app.getStore?.());
 const contentHash=data=>{
  const s=JSON.stringify(core.snapshot(data));let n=2166136261;
  for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);
  return String(n>>>0);
 };
 const metaFor=id=>{try{return JSON.parse(localStorage.getItem(META(id))||'null')}catch{return null}};
 function saveMeta(id,rev,payload){
  localStorage.setItem(META(id),JSON.stringify({revision:rev,hash:contentHash(payload),fields:core.fieldHashes(payload)}));
 }
 const guestBackup=()=>{
  if(localStorage.getItem(ACTIVE))return true;
  if(localStorage.getItem(GUEST)!==null)return true;
  const saved=localStorage.getItem(STORE);
  try{localStorage.setItem(GUEST,saved||'');return true;}
  catch(e){
   console.warn('Guest IPTV backup failed: localStorage quota',e);
   label('Bộ nhớ trình duyệt không đủ để sao lưu dữ liệu khách. Không thể tự ghi đè dữ liệu máy. Hãy xuất bản sao lưu JSON trước.','error');
   return false;
  }
 };
 const isDifferentUser=id=>{const p=localStorage.getItem(ACTIVE);return p&&p!==id};
 const saveRecoveryCopy=(id,state,fields)=>{
  // Save an unmerged version locally when two devices edited the same field.
  // If recovery storage is full, do not discard that unsynced local change.
  try{
   localStorage.setItem(RECOVERY(id),JSON.stringify({
    savedAt:new Date().toISOString(),reason:'simultaneous-edit',
    conflictedFields:fields,payload:core.snapshot(state)
   }));
   return true;
  }catch(e){
   console.warn('Cloud conflict backup quota reached',e);
   label('Không đủ bộ nhớ lưu bản dự phòng khi hai thiết bị cùng sửa. Đồng bộ tạm dừng để tránh mất dữ liệu.','error');
   return false;
  }
 };
 const swapIntoLocal=(state,id,rev)=>{
  core.validate(state);
  const from=core.snapshot(state);
  // Protect the anonymous user's state before restoring a cloud account.
  if(!guestBackup())return false;
  try{
   localStorage.setItem(STORE,JSON.stringify(from));
   localStorage.setItem(ACTIVE,id);
   saveMeta(id,rev,from);
   location.reload();
   return true;
  }catch(e){
   console.warn('Cannot restore cloud snapshot',e);
   label('Không thể tải dữ liệu đám mây vào bộ nhớ trình duyệt. Hãy kiểm tra dung lượng lưu trữ.','error');
   return false;
  }
 };
 const report=(error,context)=>{
  console.warn('Open IPTV cloud sync',context,error);
  label('Lỗi '+context+': '+core.authErrorMessage(error),'error');
 };
 const authName=user=>
  user?.user_metadata?.full_name||user?.user_metadata?.user_name||user?.email||'Tài khoản';
 const syncControls=()=>{
  show(google,!uid&&!!client&&enabledProviders.google);
  show(github,!uid&&!!client&&enabledProviders.github);
  show(authGuide,!uid&&!!client&&enabledProviders.email);
  show(providersNote,!uid&&!!client);
  show(emailForm,!uid&&!!client&&enabledProviders.email);
  show(otpForm,!uid&&!!client&&enabledProviders.email); // OTP works across browsers when the mail template includes {{ .Token }}.
  show(linkHelp,!uid&&!!client&&enabledProviders.email);
   show(linkForm,!uid&&!!client&&enabledProviders.email&&linkHelpOpen);
   card.dataset.authState=uid?'signed-in':'guest';
  show(logout,!!uid);show(sync,!!uid);
  const hasMigration=!!uid&&!!localStorage.getItem(MIGRATION_BACKUP);
  show(migrationRestore,hasMigration);
  card.dataset.hasMigration=hasMigration?'true':'false';
  if(sync)sync.textContent='Đồng bộ ngay';
  if(privacyNote)privacyNote.textContent=uid
   ? 'Dữ liệu IPTV được đồng bộ riêng với tài khoản này. Liên kết M3U chứa token cũng được lưu trong Supabase của bạn.'
   : 'Mỗi tài khoản chỉ truy cập dữ liệu của mình. Không đăng nhập vẫn sử dụng được IPTV. Liên kết M3U chứa token sẽ được lưu trong Supabase khi bạn đồng bộ.';
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
 // Automatic sync: the cloud is authoritative on a fresh browser, while
 // recognized local edits are written using a server-revision CAS update.
 const schedule=(delay=1100)=>{
  if(!uid||!ready||!client)return;
  dirty=true;
  clearTimeout(timer);
  label('Đã lưu trên máy · đang chờ đồng bộ…');
  timer=setTimeout(()=>void uploadLocal(),delay);
 };
 const queueRetry=()=>{
  if(!uid||!ready||retryTimer)return;
  retryTimer=setTimeout(()=>{
   retryTimer=0;if(uid&&ready)void uploadLocal();
  },12000);
 };
 async function uploadLocal(){
  if(!uid||!client||!ready)return false;
  if(busy){dirty=true;return false;}
  const originalId=uid;
  busy=true;clearTimeout(timer);dirty=false;
  label('Đang đồng bộ dữ liệu…');
  let completed=false,failed=false;
  try{
   for(let attempt=0;attempt<4;attempt++){
    const remote=await readRemote(originalId);
    if(uid!==originalId)return false;
    const local=core.validate(current()).payload;
    const meta=metaFor(originalId);
    const outcome=core.automaticDecision({local,remote,meta});
    if(outcome==='synced'){
     revision=remote.revision;saveMeta(originalId,revision,remote.payload);
     localStorage.setItem(ACTIVE,originalId);
     lastObservedHash=contentHash(local);
     completed=true;break;
    }
    if(outcome==='download'){
     // Preserve unsynced old-version local changes before cloud restore.
     if(meta && meta.hash!==contentHash(local) && !saveRecoveryCopy(originalId,local,['legacy-conflict']))return false;
     completed=swapIntoLocal(remote.payload,originalId,remote.revision);
     return completed;
    }
    let desired=local,conflicts=[];
    if(outcome==='merge'){
     const merged=core.mergeFields({local,remote:remote.payload,baseline:meta.fields});
     desired=core.validate(merged.merged).payload;
     conflicts=merged.conflicts;
     if(conflicts.length && !saveRecoveryCopy(originalId,local,conflicts))
      return false;
    }
    const expected=remote?.revision||0;
    let error=null,newRev=null;
    if(!remote){
     const reply=await client.from('openiptv_user_state')
      .insert({user_id:originalId,payload:desired,revision:1})
      .select('revision').single();
     error=reply.error;newRev=reply.data?.revision;
    }else if(!core.same(desired,remote.payload)){
     const reply=await client.from('openiptv_user_state')
      .update({payload:desired,revision:expected+1,updated_at:new Date().toISOString()})
      .eq('user_id',originalId).eq('revision',expected)
      .select('revision').maybeSingle();
     error=reply.error;newRev=reply.data?.revision;
    }else{
     newRev=expected;
    }
    if(uid!==originalId)return false;
    if(error){
     // Another device inserted the first row before we did.
     if(!remote && String(error.code)==='23505')continue;
     throw error;
    }
    if(!newRev)continue; // CAS miss: fetch latest revision and merge again.
    revision=newRev;
    saveMeta(originalId,newRev,desired);
    localStorage.setItem(ACTIVE,originalId);
    lastObservedHash=contentHash(desired);
    completed=true;
    if(core.same(current(),local) && !core.same(desired,local)){
     // The merged cloud view also belongs in this browser.
     swapIntoLocal(desired,originalId,newRev);
     return true;
    }
    if(!core.same(current(),desired)){dirty=true;}
    if(conflicts.length)
     label('Đã tự hợp nhất và đồng bộ. Một số mục được sửa đồng thời đã lưu bản dự phòng trên thiết bị.');
    break;
   }
   if(!completed)throw Error('Dữ liệu thay đổi đồng thời nhiều lần, sẽ thử lại.');
   if(!dirty)label('Đã tự đồng bộ lúc '+new Date().toLocaleTimeString('vi-VN'));
   return true;
  }catch(e){
   if(uid===originalId){
    failed=true;
    report(e,'đồng bộ tự động');
    dirty=true;queueRetry();
   }
   return false;
  }finally{
   busy=false;syncControls();
   if(!failed&&uid===originalId&&dirty&&ready){dirty=false;schedule(1600);}
  }
 }
 async function reconcile(user){
  const id=user.id;
  if(!id||uid===id)return;
  const ticket=++sessionSeq;
  clearTimeout(timer);ready=false;
  if(isDifferentUser(id)){
   // Never upload the previous account's browser state to another account.
   const backup=localStorage.getItem(GUEST);
   if(backup!==null){
    if(backup)localStorage.setItem(STORE,backup);
    else localStorage.removeItem(STORE);
   }
   localStorage.removeItem(ACTIVE);
   location.reload();return;
  }
  if(!guestBackup())return;
  uid=id;window.__iptvCloudUserName=authName(user);
  ready=true;show(choices,false);syncControls();
  label('Đăng nhập thành công · đang tự khôi phục và đồng bộ…');
  // Do not wait for a button press: new accounts upload automatically, and
  // previously saved accounts download automatically in a fresh browser.
  if(ticket===sessionSeq)await uploadLocal();
 }
 async function login(provider){
  if(!client)return;
  try{
   const url=new URL('./',location.href).href;
   const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:url}});
   if(error)throw error;
  }catch(e){report(e,'khi đăng nhập '+provider);}
 }
 google.addEventListener('click',()=>login('google'));
 github.addEventListener('click',()=>login('github'));

 linkVerify?.addEventListener('click',async()=>{
  if(!client||!enabledProviders.email)return;
  const raw=String(linkInput?.value||'').trim();
  // Fresh Supabase Magic Link: verify token_hash DIRECTLY with Supabase Auth
  // in this browser, without following the redirect_to=localhost link.
  // A previously clicked link instead leaves a one-time ?code=... on
  // localhost; that can still be exchanged with the local PKCE verifier.
  const callback=core.recoveryCode(raw,location.origin+location.pathname)||core.recoveryCode(raw,new URL('./',location.href).href);
  let verification=null;
  if(!callback){
   try{verification=core.verificationLink(raw,client.supabaseUrl);}
   catch(e){report(e,'kiểm tra liên kết');return;}
  }
  linkVerify.disabled=true;
  label('Đang xác thực liên kết email với Supabase…');
  try{
   const {data,error}=callback
    ? await client.auth.exchangeCodeForSession(callback.code,callback.flowId?{flowId:callback.flowId}:undefined)
    : await client.auth.verifyOtp(verification);
   if(error)throw error;
   if(linkInput)linkInput.value='';
   if(data?.user)await reconcile(data.user);
   else label('Xác thực đã được chấp nhận, đang mở phiên đăng nhập…');
  }catch(e){
   report(e,'xác thực liên kết email');
   if(/expired|invalid|otp_expired/i.test(String(e?.message||'')))
    label('Liên kết xác thực không hợp lệ hoặc đã dùng. Hãy yêu cầu email mới. Email xác nhận đăng ký có thể cần chỉnh mẫu Confirm sign up và địa chỉ chuyển hướng trên Supabase.','error');
  }finally{linkVerify.disabled=false;}
 });

 const EMAIL_RETRY_KEY='openiptv:email-retry-after:v1';
 const emailSendButton=el('cloudEmailSend');
 let nextEmailSend=0;
 try{nextEmailSend=Number(localStorage.getItem(EMAIL_RETRY_KEY))||0;}catch(_){}
 const secondsToRetry=()=>Math.max(0,Math.ceil((nextEmailSend-Date.now())/1000));
 const updateEmailSend=()=>{
  if(!emailSendButton)return;
  const remaining=secondsToRetry();
  emailSendButton.disabled=remaining>0;
  emailSendButton.textContent=remaining>0
   ? 'Thử lại sau '+Math.ceil(remaining/60)+' phút'
   : 'Gửi mã OTP qua email';
 };
 const limitEmailRetry=seconds=>{
  nextEmailSend=Math.max(nextEmailSend,Date.now()+seconds*1000);
  try{localStorage.setItem(EMAIL_RETRY_KEY,String(nextEmailSend));}catch(_){}
  updateEmailSend();
 };
 updateEmailSend();
 const emailCooldownTimer=setInterval(updateEmailSend,15000);
 window.addEventListener('pagehide',()=>clearInterval(emailCooldownTimer),{once:true});
 const safeEmail=()=>String(emailInput?.value||'').trim().toLowerCase();
 emailForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!client||!enabledProviders.email)return;
  const email=safeEmail();
  if(!core.validEmail(email)){
   label('Địa chỉ email không hợp lệ.','error');return;
  }
  if(secondsToRetry()){
   label('Đang tạm dừng gửi email để tránh vượt hạn mức Supabase. Thử lại sau '+Math.ceil(secondsToRetry()/60)+' phút.','error');
   return;
  }
  if(emailSendButton)emailSendButton.disabled=true;
  try{
   const {error}=await client.auth.signInWithOtp({
    email,options:{emailRedirectTo:new URL('./',location.href).href,shouldCreateUser:true}
   });
   if(error)throw error;
   emailRequested=true;linkHelpOpen=false;syncControls();
   limitEmailRetry(60);
   label('Đã yêu cầu email xác thực. Nếu thư có mã OTP, nhập vào Bước 2. Nếu thư ghi Confirm your email address và chỉ có liên kết, dùng mục “Email không có mã?” bên dưới.');
   otpCode?.focus();
  }catch(e){
   if(core.isEmailRateLimited(e)){
    limitEmailRetry(600);
    label(core.authErrorMessage(e)+' Trình duyệt tạm dừng thử lại trong 10 phút.','error');
   }else if(/failed to fetch|network|load failed/i.test(String(e?.message||e||''))){
    limitEmailRetry(120);
    label('Không nhận được phản hồi gửi email. Có thể do trình duyệt/mạng, hoặc lỗi giới hạn gửi 429 bị che khuất. Thử lại sau 2 phút; không bấm gửi liên tục.','error');
   }else report(e,'gửi email đăng nhập');
  }finally{updateEmailSend();}
 });
 otpCode?.addEventListener('input',()=>{
  // iOS OTP autofill and Gmail copy/paste may contain spaces or dashes.
  const normalized=core.normalizeEmailOtp(otpCode.value);
  if(otpCode.value!==normalized)otpCode.value=normalized;
 });
 otpCode?.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();otpVerify?.click();}
 });
 otpVerify?.addEventListener('click',async()=>{
  if(!client||!enabledProviders.email||otpVerify.disabled)return;
  const email=safeEmail(),token=core.normalizeEmailOtp(otpCode?.value);
  if(!core.validEmail(email)){label('Nhập email đã nhận mã OTP ở Bước 1.','error');emailInput?.focus();return;}
  if(!core.validEmailOtp(token)){label('Nhập toàn bộ mã OTP trong email, không bỏ bớt chữ số. Nếu muốn mã 6 số, quản trị viên cần đặt Email OTP length = 6 trên Supabase.','error');otpCode?.focus();return;}
  otpVerify.disabled=true;
  const oldLabel=otpVerify.textContent;
  otpVerify.textContent='Đang xác thực…';
  label('Đang xác thực mã OTP, không cần mở liên kết email…');
  try{
   const {data,error}=await client.auth.verifyOtp({email,token,type:'email'});
   if(error)throw error;
   if(otpCode)otpCode.value='';
   emailRequested=false;
   if(data?.user)await reconcile(data.user);
   else label('Mã được chấp nhận. Đang khởi tạo phiên đăng nhập…');
  }catch(e){report(e,'xác thực mã OTP');}
  finally{otpVerify.disabled=false;otpVerify.textContent=oldLabel;}
 });

 migrationRestore.addEventListener('click',async()=>{
   if(!uid||busy)return;
   try{
    const saved=JSON.parse(localStorage.getItem(MIGRATION_BACKUP)||'null');
    if(!saved||saved.project!==OLD_CLOUD_REF||!saved.payload)
     throw Error('Không có bản sao dữ liệu hợp lệ từ Supabase cũ.');
    const payload=core.validate(saved.payload).payload;
    if(!confirm('Khôi phục dữ liệu đã lưu trên thiết bị từ dự án Supabase cũ vào tài khoản mới đang đăng nhập? Chỉ thực hiện nếu đây là dữ liệu của bạn.'))return;
    const remote=await readRemote(uid);
    if(remote&&core.isMeaningful(remote.payload)){
     if(!confirm('Tài khoản Supabase mới đã có dữ liệu. Khôi phục sẽ thay thế dữ liệu đang đồng bộ bằng bản cũ. Tiếp tục?'))return;
     if(!saveRecoveryCopy(uid,remote.payload,['before-project-switch-restore']))return;
    }
    // Seed a revision baseline, then the normal CAS upload runs after reload.
    if(!swapIntoLocal(payload,uid,remote?.revision||0))return;
   }catch(e){report(e,'khôi phục bản sao dữ liệu cũ');}
  });
  sync.addEventListener('click',()=>{if(uid)void uploadLocal();});
 // Kept in the DOM for backward compatibility, but never require a manual
 // choice in the new auto-sync workflow.
 show(choices,false);
 useLocal?.addEventListener('click',()=>{show(choices,false);if(uid)void uploadLocal();});
 useCloud?.addEventListener('click',()=>{show(choices,false);if(uid)void uploadLocal();});
 later?.addEventListener('click',()=>show(choices,false));
 logout.addEventListener('click',async()=>{
  try{
   if(choices&&!choices.hidden){label('Hãy chọn dữ liệu cần giữ trước khi đăng xuất.');return;}
   clearTimeout(timer);
   if(busy){label('Đang đồng bộ, hãy đăng xuất khi quá trình lưu hoàn tất.');return;}
   if(ready){
    const ok=await uploadLocal();
    if(!ok||dirty){
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
 window.addEventListener('storage',e=>{
  if(e.key===STORE && uid&&ready)schedule(350);
 });
 window.addEventListener('online',()=>{if(uid&&ready)void uploadLocal();});
 window.addEventListener('focus',()=>{if(uid&&ready)void uploadLocal();});
 // Catch any app save path that does not dispatch openiptv:local-saved.
 // No need to watch only one feature: capture all serializable app settings.
 const localMonitor=setInterval(()=>{
  if(!uid||!ready||document.hidden)return;
  try{
   const hash=contentHash(current());
   if(hash!==lastObservedHash){lastObservedHash=hash;schedule(800);}
  }catch(e){report(e,'đọc dữ liệu trên máy');}
 },3500);
 // Pull changes made on a different logged-in browser even if this browser
 // has no local edits. No Realtime subscription or publication required.
 const remoteMonitor=setInterval(()=>{
  if(uid&&ready&&!busy&&!document.hidden&&navigator.onLine)void uploadLocal();
 },12000);
 window.addEventListener('pagehide',()=>{
  clearInterval(localMonitor);clearInterval(remoteMonitor);
  clearTimeout(timer);clearTimeout(retryTimer);
 },{once:true});
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
  if(new URL(cfg.url).hostname===NEW_CLOUD_REF+'.supabase.co'&&!preserveOldProjectData())return;
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
    const external=settings.external||{};
    enabledProviders={
      email:(external.email??settings.external_email)!==false,
      google:(external.google??settings.external_google)===true,
      github:(external.github??settings.external_github)===true
    };
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
  }else label('Chế độ khách · đăng nhập để tự sao lưu và khôi phục dữ liệu IPTV trên mọi trình duyệt.');
 }catch(e){report(e,'khởi tạo Cloud');}
})();
