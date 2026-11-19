'use strict';
/* Web-only iOS PiP compatibility.
 * WebKit bug 303885: standalone iOS Home Screen apps can report
 * document.pictureInPictureEnabled=true while the video rejects PiP.
 * Never claim PiP succeeded if WebKit explicitly blocks the video.
 */
(function(factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof window!=='undefined'&&window.document){
  window.OpenIPTVIOSPiP=api;
  api.install(window);
 }
})(function(){
 const translations={
  vi:['PiP chưa khả dụng trong ứng dụng iPhone','iOS hiện chặn Picture-in-Picture khi mở trang web từ biểu tượng trên màn hình chính. Hãy mở Open IPTV Pro trực tiếp trong Safari để sử dụng PiP.','Mở trang web','Sao chép liên kết','Đóng','Đã sao chép liên kết','Hãy mở Safari và dán liên kết này vào thanh địa chỉ.','Safari có thể lưu danh sách kênh riêng. Hãy đồng bộ tài khoản hoặc nhập lại nguồn của bạn nếu cần.','Chọn và phát một kênh trước khi bật PiP.','Video hoặc trình duyệt này hiện không hỗ trợ PiP.','PiP không thể bật trên video này.','PiP trong Safari'],
  en:['PiP is unavailable in the iPhone app','iOS currently blocks Picture-in-Picture when this site is opened from a Home Screen icon. Open Open IPTV Pro directly in Safari to use PiP.','Open website','Copy link','Close','Link copied','Open Safari and paste this link into the address bar.','Safari may store your channel list separately. Sync your account or re-import your source if needed.','Play a channel before using PiP.','This video or browser does not support PiP.','PiP cannot be started for this video.','PiP in Safari'],
  es:['PiP no está disponible en la app de iPhone','iOS bloquea PiP en las aplicaciones web de la pantalla de inicio. Abre Open IPTV Pro directamente en Safari.','Abrir sitio web','Copiar enlace','Cerrar','Enlace copiado','Abre Safari y pega este enlace en la barra de direcciones.','Safari puede guardar los canales por separado. Sincroniza tu cuenta o importa la fuente de nuevo.','Reproduce un canal antes de activar PiP.','Este vídeo o navegador no admite PiP.','No se puede iniciar PiP para este vídeo.','PiP en Safari'],
  'pt-BR':['PiP indisponível no app do iPhone','O iOS bloqueia PiP em apps da Tela de Início. Abra o Open IPTV Pro diretamente no Safari.','Abrir site','Copiar link','Fechar','Link copiado','Abra o Safari e cole o link na barra de endereços.','O Safari pode armazenar os canais separadamente. Sincronize sua conta ou importe a fonte novamente.','Reproduza um canal antes de ativar PiP.','Este vídeo ou navegador não suporta PiP.','Não foi possível iniciar PiP neste vídeo.','PiP no Safari'],
  'zh-CN':['iPhone 应用中无法使用画中画','iOS 会阻止主屏幕网页应用使用画中画。请直接在 Safari 中打开 Open IPTV Pro。','打开网站','复制链接','关闭','链接已复制','打开 Safari 并将链接粘贴到地址栏。','Safari 可能单独保存频道列表。如有需要，请同步账户或重新导入节目源。','请先播放频道，再启用画中画。','此视频或浏览器不支持画中画。','无法为此视频启用画中画。','在 Safari 中使用画中画'],
  th:['PiP ใช้ไม่ได้ในแอป iPhone','iOS บล็อก PiP ในเว็บแอปที่เปิดจากหน้าจอหลัก โปรดเปิด Open IPTV Pro ใน Safari โดยตรง','เปิดเว็บไซต์','คัดลอกลิงก์','ปิด','คัดลอกแล้ว','เปิด Safari แล้ววางลิงก์นี้ในช่องที่อยู่','Safari อาจจัดเก็บรายการช่องแยกกัน ให้ซิงค์บัญชีหรือนำเข้าแหล่งอีกครั้งหากจำเป็น','เล่นช่องก่อนใช้ PiP','วิดีโอหรือเบราว์เซอร์นี้ไม่รองรับ PiP','ไม่สามารถเปิด PiP สำหรับวิดีโอนี้','PiP ใน Safari'],
  lo:['PiP ບໍ່ພ້ອມໃຊ້ໃນແອັບ iPhone','iOS ບລັອກ PiP ໃນເວັບແອັບຈາກໜ້າຈໍຫຼັກ. ເປີດ Open IPTV Pro ໃນ Safari ໂດຍກົງ.','ເປີດເວັບ','ສຳເນົາລິ້ງ','ປິດ','ສຳເນົາແລ້ວ','ເປີດ Safari ແລ້ວວາງລິ້ງໃນແຖບທີ່ຢູ່.','Safari ອາດບັນທຶກລາຍການຊ່ອງແຍກກັນ. ໃຫ້ຊິງບັນຊີ ຫຼື ນຳເຂົ້າແຫຼ່ງໃໝ່.','ເປີດຊ່ອງກ່ອນໃຊ້ PiP.','ວິດີໂອ ຫຼື ເບຣາວເຊີນີ້ບໍ່ຮອງຮັບ PiP.','ເປີດ PiP ບໍ່ໄດ້.','PiP ໃນ Safari'],
  km:['PiP មិនអាចប្រើក្នុងកម្មវិធី iPhone','iOS រារាំង PiP នៅក្នុងកម្មវិធីវេបពីអេក្រង់ដើម។ សូមបើក Open IPTV Pro ក្នុង Safari ផ្ទាល់។','បើកវេបសាយ','ចម្លងតំណ','បិទ','បានចម្លងតំណ','បើក Safari រួចបិទភ្ជាប់តំណក្នុងរបារអាសយដ្ឋាន។','Safari អាចរក្សាបញ្ជីប៉ុស្តិ៍ដាច់ដោយឡែក។ ធ្វើសមកាលកម្មគណនី ឬនាំចូលប្រភពម្ដងទៀត។','ចាក់ប៉ុស្តិ៍មុនបើក PiP។','វីដេអូឬកម្មវិធីរុករកនេះមិនគាំទ្រ PiP។','មិនអាចបើក PiP សម្រាប់វីដេអូនេះ។','PiP ក្នុង Safari'],
  fr:['PiP indisponible dans l’app iPhone','iOS bloque PiP dans les applications web ouvertes depuis l’écran d’accueil. Ouvrez Open IPTV Pro directement dans Safari.','Ouvrir le site','Copier le lien','Fermer','Lien copié','Ouvrez Safari et collez ce lien dans la barre d’adresse.','Safari peut conserver une liste de chaînes distincte. Synchronisez votre compte ou réimportez votre source.','Lancez une chaîne avant d’utiliser PiP.','Cette vidéo ou ce navigateur ne prend pas en charge PiP.','Impossible de démarrer PiP pour cette vidéo.','PiP dans Safari'],
  de:['PiP in der iPhone-App nicht verfügbar','iOS blockiert PiP in Web-Apps vom Home-Bildschirm. Öffnen Sie Open IPTV Pro direkt in Safari.','Website öffnen','Link kopieren','Schließen','Link kopiert','Öffnen Sie Safari und fügen Sie den Link in die Adressleiste ein.','Safari kann Sender getrennt speichern. Synchronisieren Sie Ihr Konto oder importieren Sie die Quelle erneut.','Spielen Sie vor PiP einen Sender ab.','Dieses Video oder dieser Browser unterstützt PiP nicht.','PiP kann für dieses Video nicht gestartet werden.','PiP in Safari'],
  it:['PiP non disponibile nell’app iPhone','iOS blocca PiP nelle web app aperte dalla schermata Home. Apri Open IPTV Pro direttamente in Safari.','Apri il sito','Copia link','Chiudi','Link copiato','Apri Safari e incolla questo link nella barra degli indirizzi.','Safari potrebbe memorizzare i canali separatamente. Sincronizza l’account o importa di nuovo la sorgente.','Avvia un canale prima di usare PiP.','Questo video o browser non supporta PiP.','Impossibile avviare PiP per questo video.','PiP in Safari'],
  ja:['iPhone アプリでは PiP を利用できません','iOS ではホーム画面から起動した Web アプリの PiP が制限されます。Open IPTV Pro を Safari で直接開いてください。','サイトを開く','リンクをコピー','閉じる','リンクをコピーしました','Safari を開き、このリンクをアドレスバーに貼り付けてください。','Safari のチャンネル一覧は別に保存される場合があります。必要に応じて同期または再インポートしてください。','PiP を使う前にチャンネルを再生してください。','この動画またはブラウザーは PiP に対応していません。','この動画で PiP を開始できません。','Safari で PiP'],
  ko:['iPhone 앱에서 PiP를 사용할 수 없음','iOS는 홈 화면에서 연 웹 앱의 PiP를 제한합니다. Safari에서 Open IPTV Pro를 직접 여세요.','웹사이트 열기','링크 복사','닫기','링크 복사됨','Safari를 열고 주소창에 링크를 붙여넣으세요.','Safari는 채널 목록을 별도로 저장할 수 있습니다. 필요하면 계정을 동기화하거나 소스를 다시 가져오세요.','PiP 사용 전에 채널을 재생하세요.','이 동영상 또는 브라우저는 PiP를 지원하지 않습니다.','이 동영상에서 PiP를 시작할 수 없습니다.','Safari에서 PiP'],
  ru:['PiP недоступен в приложении iPhone','iOS блокирует PiP в веб-приложениях с домашнего экрана. Откройте Open IPTV Pro непосредственно в Safari.','Открыть сайт','Скопировать ссылку','Закрыть','Ссылка скопирована','Откройте Safari и вставьте ссылку в адресную строку.','Safari может хранить каналы отдельно. Синхронизируйте учётную запись или импортируйте источник снова.','Сначала включите канал, затем PiP.','Это видео или браузер не поддерживает PiP.','Не удалось запустить PiP для этого видео.','PiP в Safari'],
  id:['PiP tidak tersedia di aplikasi iPhone','iOS memblokir PiP di aplikasi web dari Layar Utama. Buka Open IPTV Pro langsung di Safari.','Buka situs','Salin tautan','Tutup','Tautan disalin','Buka Safari dan tempel tautan di bilah alamat.','Safari dapat menyimpan daftar saluran secara terpisah. Sinkronkan akun atau impor ulang sumber jika perlu.','Putar saluran sebelum mengaktifkan PiP.','Video atau browser ini tidak mendukung PiP.','PiP tidak dapat dimulai untuk video ini.','PiP di Safari'],
  hi:['iPhone ऐप में PiP उपलब्ध नहीं है','iOS होम स्क्रीन से खुलने वाले वेब ऐप में PiP रोकता है। Open IPTV Pro को सीधे Safari में खोलें।','वेबसाइट खोलें','लिंक कॉपी करें','बंद करें','लिंक कॉपी हो गया','Safari खोलें और लिंक को पता बार में पेस्ट करें।','Safari चैनलों को अलग से सहेज सकता है। ज़रूरत पर खाता सिंक करें या स्रोत दोबारा आयात करें।','PiP से पहले चैनल चलाएँ।','यह वीडियो या ब्राउज़र PiP समर्थित नहीं करता।','इस वीडियो पर PiP शुरू नहीं हो सका।','Safari में PiP'],
  ar:['PiP غير متاح في تطبيق iPhone','يقيد iOS وضع الصورة داخل الصورة في تطبيقات الويب المفتوحة من الشاشة الرئيسية. افتح Open IPTV Pro مباشرة في Safari.','فتح الموقع','نسخ الرابط','إغلاق','تم نسخ الرابط','افتح Safari والصق الرابط في شريط العنوان.','قد يحفظ Safari القنوات بشكل منفصل. زامن حسابك أو أعد استيراد المصدر عند الحاجة.','شغّل قناة قبل استخدام PiP.','هذا الفيديو أو المتصفح لا يدعم PiP.','تعذر تشغيل PiP لهذا الفيديو.','PiP في Safari']
 };
 const keys=['title','body','open','copy','close','copied','manual','storage','playFirst','unsupported','failure','safari'];
 function locale(root){
  const raw=String(root?.OpenIPTVI18n?.getLanguage?.()||root?.document?.documentElement?.lang||'vi');
  if(raw in translations)return raw;
  if(raw.toLowerCase().startsWith('pt'))return 'pt-BR';
  if(raw.toLowerCase().startsWith('zh'))return 'zh-CN';
  const short=raw.split(/[-_]/)[0];
  return short in translations?short:'en';
 }
 function text(root,key){
  const i=keys.indexOf(key);
  return i<0?'':translations[locale(root)]?.[i]||translations.en[i];
 }
 function isIOS(nav){
  const ua=String(nav?.userAgent||''),platform=String(nav?.platform||'');
  return /iPhone|iPad|iPod/i.test(ua)||platform==='MacIntel'&&Number(nav?.maxTouchPoints)>1;
 }
 function isStandalone(root){
  if(root?.navigator?.standalone===true)return true;
  try{return root?.matchMedia?.('(display-mode: standalone)')?.matches===true;}catch{return false;}
 }
 function nativeSupport(video){
  if(typeof video?.webkitSupportsPresentationMode!=='function')return null;
  try{return video.webkitSupportsPresentationMode('picture-in-picture')===true;}catch{return false;}
 }
 function capability(video,doc,nav,root){
  if(!video||video.readyState<2)return 'not-ready';
  const apple=isIOS(nav),native=nativeSupport(video);
  // WebKit bug 303885: document.pictureInPictureEnabled lies in iOS PWAs.
  if(apple&&native===false)return isStandalone(root)?'standalone-blocked':'unsupported';
  if(apple&&native===true&&typeof video.webkitSetPresentationMode==='function')return 'webkit';
  if(apple&&isStandalone(root))return 'standalone-blocked';
  if(doc?.pictureInPictureEnabled&&typeof video.requestPictureInPicture==='function')return 'standard';
  if(native===true&&typeof video.webkitSetPresentationMode==='function')return 'webkit';
  return 'unsupported';
 }
 function safeBrowserURL(root){
  try{
   const u=new URL(root.location.pathname,root.location.origin);
   u.hash='';u.search='';
   u.searchParams.set('view','mobile');
   return u.href;
  }catch{return 'https://trisanghy.github.io/open-iptv-pro/?view=mobile';}
 }
 function makeHelp(root){
  const doc=root.document,existing=doc.getElementById('webPipIOSHelp');
  if(existing)return existing;
  const overlay=doc.createElement('div');overlay.id='webPipIOSHelp';overlay.className='web-pip-ios-help';overlay.hidden=true;
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  const card=doc.createElement('section');card.className='web-pip-ios-card';
  const h=doc.createElement('h2'),message=doc.createElement('p'),note=doc.createElement('p'),manual=doc.createElement('p');
  note.className='web-pip-ios-note';manual.className='web-pip-ios-note';
  const link=doc.createElement('a');link.className='web-pip-ios-action primary';link.target='_blank';
  link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';
  const copy=doc.createElement('button');copy.type='button';copy.className='web-pip-ios-action';
  const close=doc.createElement('button');close.type='button';close.className='web-pip-ios-action';
  const address=doc.createElement('input');address.type='text';address.readOnly=true;
  address.className='web-pip-ios-url';address.setAttribute('aria-label','URL');
  const actions=doc.createElement('div');actions.className='web-pip-ios-actions';actions.append(link,copy,close);
  card.append(h,message,note,actions,manual,address);overlay.append(card);
  overlay.addEventListener('click',event=>{if(event.target===overlay)hide();});
  function hide(){overlay.hidden=true;}
  close.addEventListener('click',hide);
  copy.addEventListener('click',async()=>{
   try{
    if(typeof root.navigator.clipboard?.writeText!=='function')throw new Error('clipboard unavailable');
    await root.navigator.clipboard.writeText(address.value);
    copy.textContent=text(root,'copied');
   }catch{
    address.focus();address.select();
    copy.textContent=text(root,'copy');
   }
  });
  doc.body.append(overlay);
  overlay.show=(why)=>{
   const blocked=why==='standalone-blocked';
   h.textContent=text(root,blocked?'title':'unsupported');
   message.textContent=text(root,blocked?'body':'failure');
   note.textContent=blocked?text(root,'storage'):'';
   manual.textContent=text(root,'manual');
   link.textContent=text(root,'open');copy.textContent=text(root,'copy');close.textContent=text(root,'close');
   const url=safeBrowserURL(root);
   link.href=url;address.value=url;
   overlay.hidden=false;
   close.focus();
  };
  return overlay;
 }
 function install(root){
  const doc=root?.document;
  if(!doc||!isIOS(root.navigator))return false;
  if(doc.__openIPTViOSPiPCompatInstalled)return true;
  doc.__openIPTViOSPiPCompatInstalled=true;
  const show=why=>makeHelp(root).show(why);
  doc.addEventListener('click',event=>{
   const target=event.target?.closest?.('#pipBtn, #fsPipBtn');
   if(!target)return;
   event.preventDefault();
   // Intercept before the legacy handler calls requestPictureInPicture and
   // before fullscreen's #fsPipBtn forwards a synthetic click to #pipBtn.
   event.stopImmediatePropagation?.();
   event.stopPropagation?.();
   const video=doc.getElementById('video');
   const type=capability(video,doc,root.navigator,root);
   if(type==='not-ready'){
    root.IPTVState?.toast?.(text(root,'playFirst'),'warn');
    return;
   }
   if(type==='standalone-blocked'||type==='unsupported'){show(type);return;}
   try{
    if(doc.pictureInPictureElement===video&&typeof doc.exitPictureInPicture==='function'){
     Promise.resolve(doc.exitPictureInPicture()).catch(()=>show('unsupported'));
     return;
    }
    if(video?.webkitPresentationMode==='picture-in-picture'&&typeof video.webkitSetPresentationMode==='function'){
     video.webkitSetPresentationMode('inline');return;
    }
    if(type==='webkit'){
     video.webkitSetPresentationMode('picture-in-picture');
     return;
    }
    const request=video.requestPictureInPicture();
    Promise.resolve(request).catch(()=>show(isStandalone(root)?'standalone-blocked':'unsupported'));
   }catch{show(isStandalone(root)?'standalone-blocked':'unsupported');}
  },true);
  return true;
 }
 return Object.freeze({isIOS,isStandalone,nativeSupport,capability,safeBrowserURL,locale,text,install});
});
