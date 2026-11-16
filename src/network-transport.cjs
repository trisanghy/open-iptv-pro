'use strict';
/** Main-process desktop fetch: Chromium first, Node as a connection fallback.
 *  Keeps Chromium's macOS/Windows system proxy and TLS configuration.
 *  Does not override upstream HTTP denials, credentials, or DRM.
 */
function errorCode(error){
 const msg=String(error?.message||'');
 const fromMessage=/\b(ERR_[A-Z0-9_]{2,64})\b/.exec(msg)?.[1];
 const raw=String(error?.cause?.code||error?.code||fromMessage||error?.cause?.name||error?.name||'NETWORK_ERROR');
 const code=/^[A-Z][A-Z_0-9]{1,64}$/.test(raw)?raw:'NETWORK_ERROR';
 return code;
}
function makeDesktopFetcher(chromiumFetch,nodeFetch){
 if(typeof chromiumFetch!=='function')throw TypeError('Chromium fetch is required');
 if(typeof nodeFetch!=='function')throw TypeError('Node fetch is required');
 return async function desktopFetch(url,init={}){
  try{return await chromiumFetch(url,init);}
  catch(primaryError){
   if(init.signal?.aborted||primaryError?.name==='AbortError')throw primaryError;
   // Only transport failures throw; HTTP 403/404 are Response values and
   // must be returned unchanged, not retried under a different identity.
   try{return await nodeFetch(url,init);}
   catch(secondaryError){
    if(init.signal?.aborted||secondaryError?.name==='AbortError')throw secondaryError;
    const err=new Error(`Kết nối thất bại: Chromium ${errorCode(primaryError)}, Node ${errorCode(secondaryError)}`);
    err.code='UPSTREAM_CONNECT_FAILED';err.cause=secondaryError;
    throw err;
   }
  }
 };
}
/** Restore the low-overhead Node streaming route used by earlier fast desktop builds.
 * Chromium remains a failover for OS proxy/TLS environments; never retry an
 * explicit HTTP denial. All calls keep the same request headers and signal.
 */
function makeStreamFetcher(nodeFetch,chromiumFetch){
 if(typeof nodeFetch!=='function'||typeof chromiumFetch!=='function')throw TypeError('Both stream transports are required');
 return async function streamFetch(url,init={}){
  try{return await nodeFetch(url,init);}
  catch(primaryError){
   if(init.signal?.aborted||primaryError?.name==='AbortError')throw primaryError;
   try{return await chromiumFetch(url,init);}
   catch(secondaryError){
    if(init.signal?.aborted||secondaryError?.name==='AbortError')throw secondaryError;
    const err=new Error(`Kết nối nguồn lỗi: Node ${errorCode(primaryError)}, Chromium ${errorCode(secondaryError)}`);
    err.code='UPSTREAM_CONNECT_FAILED';err.cause=secondaryError;throw err;
   }
  }
 };
}
module.exports={makeDesktopFetcher,makeStreamFetcher,errorCode};
