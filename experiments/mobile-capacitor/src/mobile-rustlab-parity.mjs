// Rust Lab mobile parity subset: rights, evidence-based diagnostics, bounded checks and safe local backup.
// No automatic network discovery: Rust Lab's native DNS-pinned SSRF guard cannot be assumed on Capacitor.
export const MOBILE_VERSION='4.23.17-mobile.18';
export const TERMS_REVISION='2026-11-18-v1';
export const MAX_BATCH=1000;
export function batchWindow(items,cursor=0,size=MAX_BATCH){
  const rows=Array.isArray(items)?items:[],cap=Math.max(1,Math.min(MAX_BATCH,Number(size)||MAX_BATCH));
  const start=rows.length?Math.max(0,Math.floor(Number(cursor)||0))%rows.length:0;
  const end=Math.min(rows.length,start+cap);
  return {items:rows.slice(start,end),start,end,nextCursor:end>=rows.length?0:end,total:rows.length};
}
export function checkedURL(value){
  const u=new URL(String(value||'').trim());
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Chỉ chấp nhận URL HTTP/HTTPS không chứa thông tin đăng nhập');
  return u.href;
}
export function scoreChannel(channel,checks={},history={}){
  const check=checks[channel.url]||{},entries=Array.isArray(history[channel.url])?history[channel.url]:[];
  const now=Date.now(),recent=entries.filter(e=>e&&Date.parse(e.at)>now-86400000);
  const verified=recent.some(e=>e.kind==='decoded-playback'&&e.url===channel.url);
  const errors=recent.filter(e=>e.kind==='play-error').length;
  const checkedAt=Date.parse(check.checkedAt||'');
  const probeRecent=Number.isFinite(checkedAt)&&checkedAt>now-86400000;
  // Heuristic confidence, not a measured uptime percentage.
  const score=Math.max(0,Math.min(100,35+(verified?45:0)+(probeRecent?5:0)-Math.min(36,errors*12)-(check.status==='dead'?15:0)));
  return {score,verified,confidence:verified?'thấp (có sự kiện phát)':probeRecent?'chỉ HTTP':'chưa đủ dữ liệu',label:verified?'Có bằng chứng phát gần đây':check.status==='dead'?'Nguồn cần kiểm tra lại':'Chưa xác minh giải mã'};
}
export function doctorReport(channels,checks={},history={}){
  const unique=new Map();for(const c of channels||[]){if(c?.url&&!unique.has(c.url))unique.set(c.url,c);}
  const rows=[...unique.values()].map(channel=>({channel,...scoreChannel(channel,checks,history)}));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const suggestions=[];
  for(const row of rows){
    if(row.verified)continue;
    const cur=row.channel,identity=norm(cur.tvgId||'');
    const match=rows.find(other=>other.verified&&other.channel.url!==cur.url&&
      ((identity.length>=3&&norm(other.channel.tvgId||'')===identity)||
       (norm(cur.name).length>=8&&norm(other.channel.name)===norm(cur.name)&&norm(other.channel.group)===norm(cur.group))));
    if(match)suggestions.push({channel:cur,alternate:match.channel.url,score:match.score,reason:'Nguồn cùng tvg-id hoặc tên đã có bằng chứng phát; chỉ gợi ý link dự phòng, không tự thay nguồn'});
  }
  return {rows:rows.sort((a,b)=>b.score-a.score),suggestions};
}
export function appendEvidence(history,url,kind,maxPerURL=12,maxURLs=1000){
  if(!history||typeof history!=='object')return;
  checkedURL(url);
  const items=Array.isArray(history[url])?history[url]:[];
  history[url]=[...items,{kind,url,at:new Date().toISOString()}].slice(-maxPerURL);
  const keys=Object.keys(history);
  if(keys.length>maxURLs)for(const key of keys.slice(0,keys.length-maxURLs))delete history[key];
}
const FIELDS=['sources','favorites','fallbacks','epgUrl','selected','settings','checks','healthHistory'];
export function createBackup(state){
  const snapshot={};
  for(const field of FIELDS)snapshot[field]=JSON.parse(JSON.stringify(state[field]??(field==='sources'||field==='favorites'?[]:{})));
  return JSON.stringify({format:'open-iptv-pro-mobile-backup',version:2,appVersion:MOBILE_VERSION,createdAt:new Date().toISOString(),data:snapshot});
}
export function parseBackup(json){
  if(typeof json!=='string'||json.length>16*1024*1024)throw Error('File sao lưu không hợp lệ hoặc quá 16MB');
  const root=JSON.parse(json);
  if(root?.format!=='open-iptv-pro-mobile-backup'||root.version!==2||!root.data||typeof root.data!=='object')throw Error('Không đúng định dạng sao lưu Mobile v2');
  const data=root.data;
  if(!Array.isArray(data.sources)||data.sources.length>100||!Array.isArray(data.favorites)||data.favorites.length>100000)throw Error('Dữ liệu nguồn/yêu thích vượt giới hạn');
  let total=0;
  const sources=data.sources.map(s=>{
    if(!s||typeof s!=='object'||typeof s.name!=='string'||s.name.length>500||!Array.isArray(s.channels)||s.channels.length>50000)throw Error('Nguồn M3U không hợp lệ');
    if(s.url)checkedURL(s.url);
    total+=s.channels.length;if(total>100000)throw Error('Bản sao lưu có quá nhiều kênh');
    const channels=s.channels.map(c=>{if(!c||typeof c!=='object')throw Error('Kênh không hợp lệ');checkedURL(c.url);return {...c};});
    return {...s,channels};
  });
  const favorites=data.favorites.map(s=>checkedURL(s));
  const fallbacks={};if(data.fallbacks&&typeof data.fallbacks==='object')for(const [key,arr] of Object.entries(data.fallbacks)){checkedURL(key);if(!Array.isArray(arr)||arr.length>8)throw Error('Link dự phòng không hợp lệ');fallbacks[key]=arr.map(checkedURL);}
  return {sources,favorites,channels:[],fallbacks,checks:data.checks&&typeof data.checks==='object'?data.checks:{},healthHistory:data.healthHistory&&typeof data.healthHistory==='object'?data.healthHistory:{},settings:{threads:Math.max(1,Math.min(32,Number(data.settings?.threads)||16))},epgUrl:typeof data.epgUrl==='string'?data.epgUrl:'',selected:null,filter:'',page:'tv',group:'',checkCursor:0};
}
export function rightsDialog({title='Xác nhận quyền sử dụng',discovery=false}={}){
  return new Promise(resolve=>{
    const dialog=document.createElement('dialog');dialog.className='rights-dialog';dialog.setAttribute('aria-label',title);
    const heading=document.createElement('h2');heading.textContent=title;
    const info=document.createElement('p');info.textContent=discovery?
      'Smart Discovery chỉ được dùng với danh mục và luồng bạn có quyền sử dụng. Nguồn công khai hoặc phát được không đồng nghĩa có giấy phép. Phiên bản Mobile chưa có bộ quét DNS chống SSRF của Rust Lab, vì vậy không tự động quét catalog.':
      'Chỉ nhập playlist và xem nội dung khi bạn có quyền hợp pháp. Ứng dụng không cung cấp kênh IPTV. Người dùng chịu trách nhiệm về nguồn đã nhập; giới hạn trách nhiệm của tác giả chỉ trong phạm vi pháp luật cho phép.';
    dialog.append(heading,info);
    const checks=[['Tôi có quyền truy cập và sử dụng các nguồn này.'],...(discovery?[['Tôi đã kiểm tra điều khoản và quyền của bên cung cấp danh mục.']]:[])];
    const inputs=checks.map(([label])=>{const row=document.createElement('label');row.className='rights-check';const input=document.createElement('input');input.type='checkbox';input.checked=false;row.append(input,document.createTextNode(label));dialog.append(row);return input;});
    const actions=document.createElement('div');actions.className='rights-actions';
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Hủy';
    const accept=document.createElement('button');accept.type='button';accept.textContent='Tôi xác nhận và tiếp tục';accept.disabled=true;
    const enabled=()=>{accept.disabled=!inputs.every(x=>x.checked);};inputs.forEach(x=>x.addEventListener('change',enabled));
    actions.append(cancel,accept);dialog.append(actions);document.body.append(dialog);
    let settled=false;const finish=value=>{if(settled)return;settled=true;dialog.close();dialog.remove();resolve(value);};
    cancel.addEventListener('click',()=>finish(false));accept.addEventListener('click',()=>{if(!accept.disabled)finish(true);});
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.showModal();
  });
}
export function installMobileParity({getState,replaceState,save,status,exportFile}){
  const tools=document.getElementById('page-tools');if(!tools)return;
  const section=document.createElement('section');section.className='mobile-parity';
  const heading=document.createElement('h2');heading.textContent='Rust Lab → Mobile · '+MOBILE_VERSION;section.append(heading);
  const summary=document.createElement('p');summary.className='muted';summary.textContent='Smart Doctor dựa trên bằng chứng, kiểm tra 1.000 kênh/đợt, backup/restore và xác nhận quyền sử dụng. Whisper, FFmpeg Timeshift và quét Discovery an toàn phía Rust chưa có bản native mobile.';section.append(summary);
  const buttons=document.createElement('div');buttons.className='parity-buttons';section.append(buttons);
  const report=document.createElement('div');report.id='doctorReport';report.className='doctor-report';section.append(report);
  function add(label,fn){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>status(String(e.message||e),'error')));buttons.append(button);return button;}
  add('Smart Doctor · xem gợi ý',()=>{
    const state=getState();const out=doctorReport(state.channels,state.checks,state.healthHistory);
    report.replaceChildren();
    const intro=document.createElement('p');intro.className='muted';intro.textContent=out.rows.length+' kênh · điểm là chỉ số gợi ý, không phải % uptime';report.append(intro);
    for(const row of out.rows.slice(0,30)){const item=document.createElement('div');item.className='doctor-item';item.textContent=row.channel.name+' · '+row.score+'/100 · '+row.label;report.append(item);}
    for(const suggestion of out.suggestions.slice(0,15)){const item=document.createElement('div');item.className='doctor-item';
      const title=document.createElement('span');title.textContent=suggestion.channel.name+' · có thể thêm nguồn dự phòng đã phát được';item.append(title);
      const button=document.createElement('button');button.type='button';button.textContent='Thêm dự phòng';button.addEventListener('click',()=>{
        const state=getState();const arr=state.fallbacks[suggestion.channel.url]||[];
        if(!arr.includes(suggestion.alternate))state.fallbacks[suggestion.channel.url]=[...arr,suggestion.alternate].slice(0,8);
        save();status('Đã thêm dự phòng (không đổi nguồn chính)','ok');
      });item.append(button);report.append(item);
    }
    status('Smart Doctor đã phân tích dữ liệu có sẵn, không tự quét Internet','ok');
  });
  add('Xuất backup JSON',async()=>{await exportFile('OpenIPTVPro_Mobile_'+MOBILE_VERSION+'.iptvbackup.json',createBackup(getState()));});
  const importLabel=document.createElement('label');importLabel.className='file-label';
  importLabel.textContent='Khôi phục backup';const input=document.createElement('input');input.type='file';input.accept='.json,.iptvbackup,application/json';importLabel.append(input);buttons.append(importLabel);
  input.addEventListener('change',async()=>{
    try{const f=input.files?.[0];if(!f)return;if(f.size>16*1024*1024)throw Error('File lớn hơn 16MB');
      const next=parseBackup(await f.text());
      if(!confirm('Thay thế toàn bộ playlist, yêu thích và cài đặt Mobile hiện tại? Hãy sao lưu trước khi tiếp tục.'))return;
      replaceState(next);status('Khôi phục thành công từ bản backup Mobile v2','ok');
    }catch(e){status('Không thể khôi phục: '+String(e.message||e),'error');}finally{input.value='';}
  });
  const consentKey='openiptv:mobile:discovery-consent';
  const terms=document.createElement('p');terms.className='muted';section.append(terms);
  const updateTerms=()=>{const allowed=localStorage.getItem(consentKey)===TERMS_REVISION;terms.textContent='Smart Discovery Safe Mode: '+(allowed?'Đã xác nhận điều khoản trên thiết bị':'Chưa xác nhận')+'. Chưa kích hoạt quét nguồn tự động trên Mobile.';};
  add('Xác nhận điều khoản Discovery',async()=>{
    if(await rightsDialog({title:'Điều khoản Smart Discovery',discovery:true})){localStorage.setItem(consentKey,TERMS_REVISION);updateTerms();status('Đã lưu xác nhận điều khoản Discovery; không tự quét nguồn','ok');}
  });
  add('Rút xác nhận Discovery',()=>{localStorage.removeItem(consentKey);updateTerms();status('Đã rút xác nhận trên thiết bị','ok');});updateTerms();
  tools.append(section);
}
