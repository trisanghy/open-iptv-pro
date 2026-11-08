'use strict';
// Keep long-running MPEG-TS streams alive. The timeout protects the initial
// upstream handshake only, NOT the lifetime of an established media response.
const {Readable}=require('node:stream');
function pipeContinuousResponse({upstream,response,controller,connectTimeout,headers}){
 clearTimeout(connectTimeout);
 if(!upstream?.body)throw Error('Máy chủ không trả dữ liệu phát trực tiếp');
 response.writeHead(upstream.status,headers);
 const stream=Readable.fromWeb(upstream.body);
 stream.on('error',()=>response.destroy());
 stream.pipe(response);
 response.once('close',()=>{controller.abort();stream.destroy();});
 return stream;
}
module.exports={pipeContinuousResponse};
