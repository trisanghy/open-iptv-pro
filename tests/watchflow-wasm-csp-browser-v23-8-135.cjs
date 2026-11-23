'use strict';
/* Runs in a real Chromium renderer under the actual app CSP, not a mock.
 * CI serves renderer/index.html through the existing Rust Lab devserver.
 */
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:1420/',{waitUntil:'domcontentloaded',timeout:30000});
  const result=await page.evaluate(async()=>{
   const policy=document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content||'';
   if(!policy.includes("'wasm-unsafe-eval'"))throw Error('WASM permission missing from app CSP');
   const bytes=new Uint8Array([0,97,115,109,1,0,0,0]);
   const module=await WebAssembly.compile(bytes);
   const instance=await WebAssembly.instantiate(module);
   let jsEvalBlocked=false;
   try{new Function('return 42')();}catch(error){jsEvalBlocked=/EvalError|unsafe-eval|Content Security Policy/i.test(String(error?.name||'')+' '+String(error?.message||''));}
   if(!jsEvalBlocked)throw Error('JS eval unexpectedly permitted: policy is too broad');
   const remote=await fetch('./vendor/ort-wasm-simd-threaded.jsep.wasm');
   if(!remote.ok)throw Error('Bundled ONNX WASM asset unavailable: HTTP '+remote.status);
   const modelBytes=await remote.arrayBuffer();
   if(modelBytes.byteLength<10_000_000)throw Error('Bundled ONNX WASM asset too small');
   const compiled=await WebAssembly.compile(modelBytes);
   return{validModule:module instanceof WebAssembly.Module,
     instanced:instance instanceof WebAssembly.Instance,
     compiledOnnx:compiled instanceof WebAssembly.Module,
     bytes:modelBytes.byteLength,jsEvalBlocked};
  });
  if(!result.validModule||!result.instanced||!result.compiledOnnx||!result.jsEvalBlocked)
   throw Error('Smart CSP browser smoke assertions failed: '+JSON.stringify(result));
  console.log('PASS WatchFlow ONNX CSP Chromium WebAssembly.compile: '+JSON.stringify(result));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
