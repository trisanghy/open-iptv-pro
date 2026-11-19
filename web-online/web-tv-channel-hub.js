'use strict';
/* Open IPTV Pro Web-only channel hub. The existing IPTVState owns channels,
 * playback, favorites and recent history; this panel never makes copies of
 * playlists or writes its own storage. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document){root.OpenIPTVChannelHub=api;api.mount(root);}
})(typeof window!=='undefined'?window:null,function(){
 const LIMIT=48,MAX_VISIBLE=120;
 const langPack={
 vi:['Chọn kênh','Yêu thích','Xem gần đây','Tìm kênh…','Tất cả','Nhóm','Tất cả nhóm','Sắp xếp','Thứ tự nguồn','Tên A → Z','Tên Z → A','Xem tất cả','Kênh trước','Kênh sau','Chưa có kênh phù hợp.','Chưa có kênh yêu thích.','Chưa có lịch sử xem.','Hiển thị thêm','Dạng lưới','Dạng danh sách','Thêm yêu thích','Bỏ yêu thích','Chọn kênh để xem'],
 en:['Channels','Favorites','Recently watched','Search channels…','All','Group','All groups','Sort','Source order','Name A → Z','Name Z → A','View all','Previous channel','Next channel','No matching channels.','No favorite channels yet.','No recently watched channels.','Show more','Grid','List','Add to favorites','Remove favorite','Choose a channel to watch'],
 es:['Canales','Favoritos','Vistos recientemente','Buscar canales…','Todos','Grupo','Todos los grupos','Ordenar','Orden de origen','Nombre A → Z','Nombre Z → A','Ver todos','Canal anterior','Canal siguiente','No hay canales coincidentes.','Todavía no hay favoritos.','Sin canales recientes.','Mostrar más','Cuadrícula','Lista','Añadir a favoritos','Quitar de favoritos','Elige un canal para ver'],
 'pt-BR':['Canais','Favoritos','Assistidos recentemente','Buscar canais…','Todos','Grupo','Todos os grupos','Ordenar','Ordem da fonte','Nome A → Z','Nome Z → A','Ver todos','Canal anterior','Próximo canal','Nenhum canal encontrado.','Ainda não há favoritos.','Nenhum canal recente.','Mostrar mais','Grade','Lista','Adicionar aos favoritos','Remover dos favoritos','Escolha um canal'],
 'zh-CN':['选择频道','收藏','最近观看','搜索频道…','全部','分组','所有分组','排序','来源顺序','名称 A → Z','名称 Z → A','查看全部','上一个频道','下一个频道','没有匹配的频道。','暂无收藏频道。','暂无观看记录。','显示更多','网格','列表','加入收藏','取消收藏','选择频道观看'],
 th:['เลือกช่อง','รายการโปรด','ดูล่าสุด','ค้นหาช่อง…','ทั้งหมด','กลุ่ม','ทุกกลุ่ม','เรียงลำดับ','ตามแหล่งที่มา','ชื่อ A → Z','ชื่อ Z → A','ดูทั้งหมด','ช่องก่อนหน้า','ช่องถัดไป','ไม่พบช่องที่ตรงกัน','ยังไม่มีรายการโปรด','ไม่มีประวัติการรับชม','แสดงเพิ่มเติม','ตาราง','รายการ','เพิ่มในรายการโปรด','นำออกจากรายการโปรด','เลือกช่องเพื่อรับชม'],
 lo:['ເລືອກຊ່ອງ','ລາຍການມັກ','ເບິ່ງຫຼ້າສຸດ','ຄົ້ນຫາຊ່ອງ…','ທັງໝົດ','ກຸ່ມ','ທຸກກຸ່ມ','ຈັດລຽງ','ຕາມແຫຼ່ງ','ຊື່ A → Z','ຊື່ Z → A','ເບິ່ງທັງໝົດ','ຊ່ອງກ່ອນ','ຊ່ອງຕໍ່ໄປ','ບໍ່ພົບຊ່ອງ','ຍັງບໍ່ມີລາຍການມັກ','ບໍ່ມີປະຫວັດການເບິ່ງ','ສະແດງເພີ່ມ','ຕາຕະລາງ','ລາຍການ','ເພີ່ມລາຍການມັກ','ເອົາອອກຈາກລາຍການມັກ','ເລືອກຊ່ອງເພື່ອເບິ່ງ'],
 km:['ជ្រើសរើសប៉ុស្តិ៍','សំណព្វ','ទើបមើល','ស្វែងរកប៉ុស្តិ៍…','ទាំងអស់','ក្រុម','គ្រប់ក្រុម','តម្រៀប','តាមប្រភព','ឈ្មោះ A → Z','ឈ្មោះ Z → A','មើលទាំងអស់','ប៉ុស្តិ៍មុន','ប៉ុស្តិ៍បន្ទាប់','គ្មានប៉ុស្តិ៍ដែលត្រូវគ្នា។','មិនទាន់មានសំណព្វ។','គ្មានប្រវត្តិមើល។','បង្ហាញបន្ថែម','ក្រឡា','បញ្ជី','បន្ថែមសំណព្វ','ដកចេញពីសំណព្វ','ជ្រើសប៉ុស្តិ៍ដើម្បីមើល'],
 fr:['Choisir une chaîne','Favoris','Vus récemment','Rechercher une chaîne…','Tout','Groupe','Tous les groupes','Trier','Ordre des sources','Nom A → Z','Nom Z → A','Tout voir','Chaîne précédente','Chaîne suivante','Aucune chaîne correspondante.','Aucun favori pour le moment.','Aucune chaîne récente.','Afficher plus','Grille','Liste','Ajouter aux favoris','Retirer des favoris','Choisir une chaîne à regarder'],
 de:['Sender wählen','Favoriten','Zuletzt gesehen','Sender suchen…','Alle','Gruppe','Alle Gruppen','Sortieren','Quellreihenfolge','Name A → Z','Name Z → A','Alle anzeigen','Vorheriger Sender','Nächster Sender','Keine passenden Sender.','Noch keine Favoriten.','Keine zuletzt gesehenen Sender.','Mehr anzeigen','Raster','Liste','Zu Favoriten hinzufügen','Aus Favoriten entfernen','Sender zum Ansehen wählen'],
 it:['Scegli canale','Preferiti','Visti di recente','Cerca canali…','Tutti','Gruppo','Tutti i gruppi','Ordina','Ordine sorgente','Nome A → Z','Nome Z → A','Vedi tutti','Canale precedente','Canale successivo','Nessun canale trovato.','Nessun preferito.','Nessun canale recente.','Mostra altro','Griglia','Elenco','Aggiungi ai preferiti','Rimuovi dai preferiti','Scegli un canale'],
 ja:['チャンネル選択','お気に入り','最近視聴','チャンネルを検索…','すべて','グループ','すべてのグループ','並べ替え','ソース順','名前 A → Z','名前 Z → A','すべて見る','前のチャンネル','次のチャンネル','一致するチャンネルがありません。','お気に入りはまだありません。','視聴履歴はありません。','もっと見る','グリッド','リスト','お気に入りに追加','お気に入りから削除','チャンネルを選択'],
 ko:['채널 선택','즐겨찾기','최근 시청','채널 검색…','전체','그룹','모든 그룹','정렬','소스 순서','이름 A → Z','이름 Z → A','모두 보기','이전 채널','다음 채널','일치하는 채널 없음.','즐겨찾기가 없습니다.','최근 본 채널 없음.','더 보기','격자','목록','즐겨찾기에 추가','즐겨찾기 삭제','시청할 채널 선택'],
 ru:['Выбор канала','Избранное','Недавно смотрели','Поиск каналов…','Все','Группа','Все группы','Сортировка','По источнику','Имя A → Z','Имя Z → A','Показать все','Предыдущий канал','Следующий канал','Совпадений нет.','Нет избранных каналов.','История просмотров пуста.','Показать ещё','Сетка','Список','Добавить в избранное','Убрать из избранного','Выберите канал'],
 id:['Pilih saluran','Favorit','Baru ditonton','Cari saluran…','Semua','Grup','Semua grup','Urutkan','Urutan sumber','Nama A → Z','Nama Z → A','Lihat semua','Saluran sebelumnya','Saluran berikutnya','Tidak ada saluran cocok.','Belum ada favorit.','Belum ada riwayat tontonan.','Tampilkan lagi','Kisi','Daftar','Tambahkan favorit','Hapus favorit','Pilih saluran untuk ditonton'],
 hi:['चैनल चुनें','पसंदीदा','हाल ही में देखा','चैनल खोजें…','सभी','समूह','सभी समूह','क्रमबद्ध','स्रोत क्रम','नाम A → Z','नाम Z → A','सभी देखें','पिछला चैनल','अगला चैनल','कोई चैनल नहीं मिला।','अभी कोई पसंदीदा चैनल नहीं।','हाल में कोई चैनल नहीं देखा।','और दिखाएँ','ग्रिड','सूची','पसंदीदा में जोड़ें','पसंदीदा हटाएँ','देखने के लिए चैनल चुनें'],
 ar:['اختيار القناة','المفضلة','شوهد مؤخرًا','البحث عن قناة…','الكل','المجموعة','كل المجموعات','ترتيب','ترتيب المصادر','الاسم A → Z','الاسم Z → A','عرض الكل','القناة السابقة','القناة التالية','لا توجد قنوات مطابقة.','لا توجد قنوات مفضلة بعد.','لا توجد قنوات شوهدت مؤخرًا.','عرض المزيد','شبكة','قائمة','إضافة إلى المفضلة','إزالة من المفضلة','اختر قناة للمشاهدة']
 };
 const names=['channels','favorites','recent','search','all','group','allGroups','sort','source','az','za','viewAll','prev','next','empty','emptyFav','emptyRecent','more','grid','list','addFav','removeFav','choose'];
 function label(lang,key){
  const idx=names.indexOf(key),pack=langPack[lang]||langPack.en;
  return idx<0?'':pack[idx]||langPack.en[idx];
 }
 function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
 function recent(ids,channels){return (Array.isArray(ids)?ids:[]).map(id=>channels.find(c=>c.id===id)).filter(Boolean);}
 function section(channels,tab,store,favCore,recentCore){
  if(tab==='favorites')return favCore?.visible?.(store)||[];
  if(tab==='recent')return recentCore?.select?.(store?.recentChannelIds,channels)||recent(store?.recentChannelIds,channels);
  return channels;
 }
 function category(ch,chip){return chip==='all'||norm(ch?.name).includes(norm(chip))||norm(ch?.group).includes(norm(chip));}
 function group(ch){return String(ch?.group||'Khác').replace(/\s*\|\s*Kiểm tra:.+$/i,'').trim()||'Khác';}
 function choose(channels,{tab='channels',search='',chip='all',groupName='',sort='source',store={},favCore,recentCore}={}){
  let a=section(channels,tab,store,favCore,recentCore);
  const query=norm(search).trim();
  a=a.filter(ch=>(chip==='all'||category(ch,chip))&&(!groupName||group(ch)===groupName)&&(!query||norm(ch.name+' '+group(ch)).includes(query)));
  if(sort==='az')a=[...a].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
  else if(sort==='za')a=[...a].sort((a,b)=>b.name.localeCompare(a.name,undefined,{numeric:true,sensitivity:'base'}));
  return a;
 }
 const validImage=value=>typeof value==='string'&&value.length<2048&&/^(?:https?:\/\/|data:image\/(?:png|jpe?g|webp|gif);base64,)/i.test(value);
 const btn=(text,cls)=>{const el=document.createElement('button');el.type='button';el.className=cls||'';el.textContent=text;return el;};
 const span=(text,cls)=>{const el=document.createElement('span');el.className=cls||'';el.textContent=text;return el;};
 function mount(root){
  const doc=root.document;
  const quick=doc.getElementById('quickTools');
  if(!quick||doc.getElementById('webChannelHub'))return;
  const api=()=>root.IPTVState;
  const fav=()=>root.OpenIPTVFavorites;
  const rec=()=>root.OpenIPTVRecentChannels;
  let tab='channels',chip='all',groupName='',sort='source',view='grid',search='',limit=LIMIT,lastSig='';
  let currentLang=()=>root.OpenIPTVI18n?.getLanguage?.()||doc.documentElement.lang||'vi';
  const t=key=>label(currentLang(),key);
  const hub=doc.createElement('section');hub.id='webChannelHub';hub.className='web-channel-hub';
  hub.setAttribute('aria-label','Chọn kênh, yêu thích và xem gần đây');
  const main=doc.createElement('div');main.className='web-hub-main';
  const nav=doc.createElement('div');nav.className='web-hub-tabs';nav.setAttribute('role','tablist');
  const tabs={};
  for(const key of ['channels','favorites','recent']){
   const b=btn(t(key),'web-hub-tab');b.dataset.tab=key;b.setAttribute('role','tab');b.setAttribute('aria-selected',key==='channels'?'true':'false');tabs[key]=b;nav.append(b);
  }
  const filters=doc.createElement('div');filters.className='web-hub-chips';
  const controls=doc.createElement('div');controls.className='web-hub-controls';
  const find=doc.createElement('input');find.id='webHubSearch';find.type='search';find.placeholder=t('search');find.setAttribute('aria-label',t('search'));find.autocomplete='off';
  const groupSelect=doc.createElement('select');groupSelect.id='webHubGroup';groupSelect.setAttribute('aria-label',t('group'));
  const order=doc.createElement('select');order.id='webHubSort';order.setAttribute('aria-label',t('sort'));
  for(const key of ['source','az','za']){const opt=doc.createElement('option');opt.value=key;opt.textContent=t(key);order.append(opt);}
  const toggle=doc.createElement('div');toggle.className='web-hub-view-toggle';toggle.setAttribute('role','group');
  const gridBtn=btn('▦','web-hub-view active');gridBtn.dataset.view='grid';const listBtn=btn('☷','web-hub-view');listBtn.dataset.view='list';toggle.append(gridBtn,listBtn);
  controls.append(find,groupSelect,order,toggle);
  const tileWrap=doc.createElement('div');tileWrap.className='web-hub-carousel';
  const back=btn('‹','web-hub-arrow');back.setAttribute('aria-label',t('prev'));
  const tiles=doc.createElement('div');tiles.id='webHubTiles';tiles.className='web-hub-tiles';tiles.setAttribute('aria-live','polite');
  const forward=btn('›','web-hub-arrow');forward.setAttribute('aria-label',t('next'));
  tileWrap.append(back,tiles,forward);
  const more=btn(t('more'),'web-hub-more');more.hidden=true;
  main.append(nav,filters,controls,tileWrap,more);
  const aside=doc.createElement('aside');aside.className='web-hub-side';
  const sideContent={};
  for(const key of ['favorites','recent']){
   const card=doc.createElement('section');card.className='web-hub-side-card';
   const head=doc.createElement('header');const heading=doc.createElement('strong');heading.dataset.heading=key;
   const show=btn(t('viewAll')+' ›','web-hub-view-all');show.dataset.open=key;head.append(heading,show);
   const body=doc.createElement('div');body.className='web-hub-side-list';body.dataset.side=key;
   sideContent[key]={heading,body,show};card.append(head,body);aside.append(card);
  }
  hub.append(main,aside);quick.insertAdjacentElement('afterend',hub);

  function allChannels(){return api()?.getChannels?.()||[];}
  function store(){return api()?.getStore?.()||{sources:[],channels:[],recentChannelIds:[]};}
  function currentId(){return api()?.getCurrent?.()?.id||'';}
  function selectTab(next){
   tab=next;limit=LIMIT;chip='all';groupName='';search='';find.value='';
   for(const [k,b]of Object.entries(tabs)){b.classList.toggle('active',k===tab);b.setAttribute('aria-selected',String(k===tab));}
   render();
  }
  function tile(c,compact=false){
   const tile=doc.createElement('div');tile.className='web-hub-tile';tile.dataset.channelId=String(c.id);
   if(c.id===currentId())tile.classList.add('current');
   const play=btn('','web-hub-play');play.setAttribute('aria-label',t('choose')+': '+c.name);play.title=c.name;
   const art=doc.createElement('span');art.className='web-hub-art';art.textContent=String(c.name||'TV').slice(0,3).toUpperCase();
   if(validImage(c.logo)){const img=doc.createElement('img');img.src=c.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('load',()=>{art.textContent='';art.append(img);});}
   play.append(art,span(c.name,'web-hub-name'));play.addEventListener('click',()=>{void api()?.playChannel?.(c.id);schedule();});
   tile.append(play);
   if(!compact){
    const isFavorite=fav()?.has?.(store(),c);
    const star=btn(isFavorite?'★':'☆','web-hub-favorite'+(isFavorite?' marked':''));
    star.title=t(isFavorite?'removeFav':'addFav');star.setAttribute('aria-label',star.title);star.setAttribute('aria-pressed',String(!!isFavorite));
    star.addEventListener('click',()=>{
     const ctx=api(),f=fav(),data=store();
     if(!ctx||!f||!Array.isArray(data.favoriteKeys))return;
     const beforeKeys=[...data.favoriteKeys],beforeUrls=[...(data.favorites||[])];
     f.toggle(data,c);
     if(ctx.save?.()===false){data.favoriteKeys=beforeKeys;data.favorites=beforeUrls;return;}
     ctx.render?.(true);schedule();
    });
    tile.append(star);
   }
   return tile;
  }
  function fill(node,channels,small){
   const frag=doc.createDocumentFragment();
   if(!channels.length){frag.append(span(t(small==='favorites'?'emptyFav':small==='recent'?'emptyRecent':'empty'),'web-hub-empty'));}
   for(const ch of channels)frag.append(tile(ch,!!small));
   node.replaceChildren(frag);
  }
  function side(){
   const channels=allChannels(),s=store(),f=fav(),r=rec();
   for(const [key,els] of Object.entries(sideContent)){
    const data=section(channels,key,s,f,r);
    els.heading.textContent=(key==='favorites'?'★ ':'◷ ')+t(key)+' ('+data.length+')';
    els.show.textContent=t('viewAll')+' ›';
    fill(els.body,data.slice(0,key==='favorites'?6:5),key);
   }
  }
  function render(){
   if(!api())return;
   const all=allChannels(),s=store();
   const ref=tab==='channels'?all:section(all,tab,s,fav(),rec());
   const chips=['all'];
   for(const brand of ['VTV','VTC','HTV','K+'])if(ref.some(c=>category(c,brand)))chips.push(brand);
   for(const ch of ref){const g=group(ch);if(g&&!chips.includes(g)){chips.push(g);if(chips.length>=13)break;}}
   if(!chips.includes(chip))chip='all';
   filters.replaceChildren();
   for(const key of chips){
    const button=btn(key==='all'?t('all'):key,'web-hub-chip'+(key===chip?' active':''));
    button.setAttribute('aria-pressed',String(key===chip));button.addEventListener('click',()=>{chip=key;limit=LIMIT;render();});
    filters.append(button);
   }
   const groups=[...new Set(ref.map(group))];groups.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
   if(groupName&&!groups.includes(groupName))groupName='';
   groupSelect.replaceChildren();
   const first=doc.createElement('option');first.value='';first.textContent=t('allGroups');groupSelect.append(first);
   for(const g of groups){const o=doc.createElement('option');o.value=g;o.textContent=g;groupSelect.append(o);}
   groupSelect.value=groupName;
   for(const [key,b]of Object.entries(tabs)){b.textContent=t(key);b.classList.toggle('active',key===tab);b.setAttribute('aria-selected',String(key===tab));}
   find.placeholder=t('search');find.setAttribute('aria-label',t('search'));
   groupSelect.setAttribute('aria-label',t('group'));
   order.setAttribute('aria-label',t('sort'));
   for(const opt of order.options)opt.textContent=t(opt.value);
   order.value=sort;gridBtn.title=t('grid');listBtn.title=t('list');back.title=t('prev');forward.title=t('next');
   more.textContent=t('more');tiles.classList.toggle('list-mode',view==='list');toggle.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
   const shown=choose(all,{tab,search,chip,groupName,sort,store:s,favCore:fav(),recentCore:rec()});
   fill(tiles,shown.slice(0,Math.min(limit,MAX_VISIBLE)),null);
   more.hidden=shown.length<=limit||limit>=MAX_VISIBLE;
   side();
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;Promise.resolve().then(()=>{scheduled=false;render();});}
  nav.addEventListener('click',event=>{const target=event.target.closest('[data-tab]');if(target)selectTab(target.dataset.tab);});
  aside.addEventListener('click',event=>{const target=event.target.closest('[data-open]');if(target)selectTab(target.dataset.open);});
  find.addEventListener('input',()=>{search=find.value;limit=LIMIT;render();});
  groupSelect.addEventListener('change',()=>{groupName=groupSelect.value;limit=LIMIT;render();});
  order.addEventListener('change',()=>{sort=order.value;render();});
  toggle.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(button){view=button.dataset.view;render();}});
  back.addEventListener('click',()=>{tiles.scrollBy({left:-Math.max(230,tiles.clientWidth*.75),behavior:'smooth'});});
  forward.addEventListener('click',()=>{tiles.scrollBy({left:Math.max(230,tiles.clientWidth*.75),behavior:'smooth'});});
  more.addEventListener('click',()=>{limit=Math.min(MAX_VISIBLE,limit+LIMIT);render();});
  doc.addEventListener('openiptv:local-saved',schedule);
  root.addEventListener('openiptv:favorites-changed',schedule);
  doc.addEventListener('openiptv:languagechange',schedule);
  // M3U source additions update the existing channelMeta text after renderList.
  // Observe that stable element instead of watching the entire document tree.
  const meta=doc.getElementById('channelMeta');
  if(meta&&root.MutationObserver)new root.MutationObserver(schedule).observe(meta,{childList:true,characterData:true,subtree:true});
  render();
 }
 return Object.freeze({LIMIT,MAX_VISIBLE,choose,category,section,group,label,mount});
});
