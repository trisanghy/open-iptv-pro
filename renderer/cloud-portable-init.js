/* Mount portable Supabase account controls once the desktop state is hydrated. */
'use strict';
(function(){
 const cloud=window.OpenIPTVPortableCloud,api=window.IPTVState;
 if(!cloud||!api?.getStore||!api?.save)return;
 cloud.mount({
  mode:'desktop',
  getState:()=>api.getStore(),
  saveState:next=>{
   const current=api.getStore();
   if(!current||typeof current!=='object')throw Error('Không tìm thấy dữ liệu đang lưu');
   Object.assign(current,next);
   if(api.save()===false)throw Error('Không thể lưu dữ liệu đã tải từ Supabase');
   return window.IPTVPrimaryPersistence?.flush?.();
  }
 });
})();