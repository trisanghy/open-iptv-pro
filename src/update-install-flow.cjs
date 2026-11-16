'use strict';
const path=require('node:path');
/** Open a SHA256-verified downloaded installer; never quit if opening fails. */
async function openVerifiedInstaller({platform,phase,downloadedPath,openPath,quit,scheduleQuit=setImmediate}){
 if(phase!=='manual-ready'||!downloadedPath)throw Error('Chưa có bộ cài đã xác minh');
 if(typeof openPath!=='function')throw Error('Thiếu phương thức mở bộ cài');
 const ext=platform==='darwin'?'.dmg':platform==='win32'?'.exe':null;
 if(!ext||path.extname(downloadedPath).toLowerCase()!==ext)throw Error('Bộ cài không phù hợp hệ điều hành');
 const error=await openPath(downloadedPath);
 if(error)throw Error('Không thể mở bộ cài: '+String(error).slice(0,180));
 if(platform==='darwin'){
   if(typeof quit!=='function')throw Error('Thiếu phương thức thoát ứng dụng');
   scheduleQuit(()=>quit());
 }
 return {opened:true,quitScheduled:platform==='darwin'};
}
module.exports={openVerifiedInstaller};
