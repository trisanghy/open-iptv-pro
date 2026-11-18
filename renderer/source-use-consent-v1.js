'use strict';
/* Explicit, per-action legal-use notices. This is user self-attestation, not
   an entitlement or copyright validator, and must never silently auto-accept. */
(function(root,make){
 const api=make(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document)root.OpenIPTVSourceConsent=api;
})(typeof window==='undefined'?null:window,function(root){
 let smartAccepted=false,opening=false;
 const NOTICE='Open IPTV Pro là phần mềm trình phát do cá nhân phát triển, không cung cấp hoặc cấp phép các kênh truyền hình. Bạn chịu trách nhiệm về nguồn, tài khoản, playlist và nội dung mình nhập, xem, lưu hoặc chia sẻ. Tác giả không kiểm soát hay bảo đảm tính hợp pháp của các nguồn này và không chịu trách nhiệm đối với dữ liệu người dùng trong phạm vi pháp luật cho phép.';
 const LABELS=Object.freeze({
  file:'Quyền sử dụng file M3U',
  url:'Quyền sử dụng đường dẫn M3U',
  'smart-start':'Điều khoản sử dụng Smart Discovery',
  'smart-import':'Xác nhận nhập kênh từ Smart Discovery'
 });
 const LEGAL='Tôi xác nhận có quyền hợp pháp để truy cập và sử dụng nội dung trong nguồn này, tự chịu trách nhiệm về playlist, dữ liệu và việc xem.';
 const DISCOVERY_TERMS='Tôi đã tự kiểm tra điều khoản sử dụng, nguồn gốc và quyền truy cập của danh mục/nhà cung cấp trước khi sử dụng Smart Discovery.';
 const DISCOVERY_RIGHTS='Tôi hiểu nguồn công khai hoặc được kiểm tra phát thành công KHÔNG đồng nghĩa được phép sử dụng; tôi tự chịu trách nhiệm về bản quyền, pháp luật, nội dung và dữ liệu.';
 function isReady(kind,accepted){
  const checks=Array.isArray(accepted)?accepted:[];
  return kind==='smart-start'||kind==='smart-import'
   ?checks.length>=2&&checks[0]===true&&checks[1]===true
   :kind==='file'||kind==='url'?checks.length>=1&&checks[0]===true:false;
 }
 function request(kind,detail=''){
  if(!root?.document||opening||!Object.prototype.hasOwnProperty.call(LABELS,kind))return Promise.resolve(false);
  const doc=root.document;
  if(!doc.body?.append||typeof doc.createElement!=='function')return Promise.resolve(false);
  opening=true;
  return new Promise(resolve=>{
   const dialog=doc.createElement('dialog');dialog.className='iptv-legal-consent';
   dialog.setAttribute('aria-labelledby','iptvLegalTitle');
   dialog.setAttribute('aria-describedby','iptvLegalNotice');
   const box=doc.createElement('div');box.className='iptv-legal-card';
   const eyebrow=doc.createElement('div');eyebrow.className='iptv-legal-eyebrow';eyebrow.textContent='⚠ LƯU Ý QUYỀN SỬ DỤNG';
   const title=doc.createElement('h2');title.id='iptvLegalTitle';title.textContent=LABELS[kind];
   const notice=doc.createElement('p');notice.id='iptvLegalNotice';notice.textContent=NOTICE;
   const extra=doc.createElement('p');extra.className='iptv-legal-extra';
   const discovery=kind.startsWith('smart-');
   extra.textContent=detail|| (discovery
    ?'Smart Discovery chỉ tổng hợp liên kết từ bên thứ ba. Việc thấy kênh hoặc kiểm tra tín hiệu không chứng minh có giấy phép hoặc quyền xem.'
    :'Chỉ thêm file hoặc URL M3U mà bạn có quyền sử dụng. Không nhập nguồn trái phép hoặc dữ liệu bí mật của người khác.');
   const checks=discovery?[DISCOVERY_TERMS,DISCOVERY_RIGHTS]:[LEGAL];
   const inputs=checks.map((line,i)=>{
    const label=doc.createElement('label');label.className='iptv-legal-check';
    const input=doc.createElement('input');input.type='checkbox';input.checked=false;input.required=true;
    input.setAttribute('aria-label',line);
    const span=doc.createElement('span');span.textContent=line;
    label.append(input,span);box.append();return {label,input};
   });
   const actions=doc.createElement('div');actions.className='iptv-legal-actions';
   const link=doc.createElement('a');link.textContent='Đọc tuyên bố trách nhiệm trong README';
   link.href='https://github.com/trisanghy/open-iptv-pro/blob/main/README.md';
   link.target='_blank';link.rel='noopener noreferrer';
   const cancel=doc.createElement('button');cancel.type='button';cancel.className='btn btn-subtle';cancel.textContent='Hủy';
   const yes=doc.createElement('button');yes.type='button';yes.className='btn btn-primary';
   yes.textContent=kind==='smart-start'?'Tôi xác nhận, bắt đầu khám phá':'Tôi xác nhận và tiếp tục';
   yes.disabled=true;
   let finished=false;
   const finish=ok=>{
    if(finished)return;finished=true;opening=false;
    try{dialog.close?.();}catch{}
    dialog.remove?.();resolve(!!ok);
   };
   const update=()=>{yes.disabled=!isReady(kind,inputs.map(item=>item.input.checked));};
   inputs.forEach(({input})=>input.addEventListener('change',update));
   cancel.addEventListener('click',()=>finish(false));
   yes.addEventListener('click',()=>{if(!yes.disabled&&isReady(kind,inputs.map(i=>i.input.checked)))finish(true);});
   dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
   dialog.addEventListener('keydown',e=>{e.stopPropagation();});
   dialog.addEventListener('click',e=>{if(e.target===dialog)finish(false);});
   actions.append(cancel,yes);
   box.append(eyebrow,title,notice,extra,...inputs.map(i=>i.label),link,actions);
   dialog.append(box);doc.body.append(dialog);
   if(typeof dialog.showModal!=='function'){finish(false);return;}
   try{dialog.showModal();cancel.focus?.();}catch{finish(false);}
  });
 }
 async function requireSmart(){
  if(smartAccepted)return true;
  const accepted=await request('smart-start');
  if(accepted)smartAccepted=true;
  return accepted;
 }
 async function requestSmartImport(detail=''){
  if(!await requireSmart())return false;
  return request('smart-import',detail);
 }
 return Object.freeze({
  NOTICE,LABELS,isReady,
  requestImport:(kind)=>request(kind),
  requireSmart,requestSmartImport,
  isSmartAccepted:()=>smartAccepted
 });
});
