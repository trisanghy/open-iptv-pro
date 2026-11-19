const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../home-route.js'),'utf8');
for(const [search,hash,standalone,expected] of [
 ['', '', false, null],['','#bat-dau',false,null],['?view=desktop&v=old','',false,'player.html?view=desktop&v=old'],
 ['?code=example','',false,'player.html?code=example'],['','#access_token=example',false,'player.html#access_token=example'],
 ['','',true,'player.html']]){
 test('homepage routing '+JSON.stringify([search,hash,standalone]),()=>{
  let result=null;vm.runInNewContext(script,{URLSearchParams,location:{search,hash,replace:url=>result=url},window:{matchMedia:()=>({matches:standalone})}});
  assert.equal(result,expected);
 });
}
