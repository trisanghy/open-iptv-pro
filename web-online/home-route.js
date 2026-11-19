// Earlier player links and authentication callbacks used the project root.
const params=new URLSearchParams(location.search);
if(['view','v','code','token_hash','error','error_description'].some(key=>params.has(key)) ||
   /^#(?:access_token|error|refresh_token|type)=/.test(location.hash) ||
   window.matchMedia('(display-mode: standalone)').matches){
 location.replace('player.html'+location.search+location.hash);
}
