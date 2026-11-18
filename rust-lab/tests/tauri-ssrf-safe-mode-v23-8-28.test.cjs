'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const secure=read('src-tauri/src/safe_network.rs');
const smart=read('src-tauri/src/smart.rs');
const checker=read('src-tauri/src/link_checker.rs');
const bridge=read('src-tauri/src/bridge.rs');
const app=read('renderer/app.js'),ui=read('renderer/smart-discovery-ui.js');
const consent=read('renderer/source-use-consent-v1.js');
const html=read('renderer/index.html');
test('No request can redirect into private infrastructure; pin a checked DNS result',()=>{
 for(const word of ['validate_redirect','validate_url','public_ipv4','public_ipv6','public_ip',
  'lookup_host((host,port))','.resolve(host,SocketAddr::new(addresses[0],port))',
  '.no_proxy()','.redirect(Policy::none())','addresses.iter().any(|ip|!public_ip(*ip))'])
  assert.ok(secure.includes(word),word);
 for(const addr of ['127.0.0.1','169.254.169.254','192.168.1.1','172.16.1.2',
  '100.64.1.1','198.18.1.2','2001:db8::1','::ffff:127.0.0.1'])
  assert.ok(secure.includes(addr),addr);
 assert.ok(secure.includes('chunk.len()>max.saturating_sub(result.len())'));
});
test('Smart Discovery and nested HLS checks all use guarded requests, not default auto redirects',()=>{
 assert.ok(checker.includes('crate::safe_network::get(url).await?'));
 assert.ok(checker.includes('get(state,&url,strict).await'));
 assert.ok(checker.includes('hls_media(state,&probe,strict).await'));
 assert.ok(checker.includes('pub async fn check_discovery'));
 assert.ok(bridge.includes('"smart:check"=>link_checker::check_discovery'));
 assert.ok(smart.includes('crate::safe_network::validate_url(&url)'));
 assert.ok(smart.includes('crate::safe_network::read_bounded(url,limit).await'));
 assert.ok(smart.includes('let tree_text=read_limited(state,'));
 assert.ok(bridge.includes('safe_network::read_bounded(raw,25*1024*1024)'));
});
test('Each imported M3U requires actual checkbox consent; saved Smart consent is separate and revocable',()=>{
 assert.ok(app.includes("requestImport?.('file')"));
 assert.ok(app.includes("requestImport?.('url')"));
 assert.ok(ui.includes("requestSmartImport?.("));
 assert.ok(ui.includes("requireSmart?.()"));
 assert.ok(ui.includes("revokeSmart?.()"));
 assert.ok(consent.includes('SMART_KEY='));
 assert.ok(consent.includes('persistedSmartConsent()'));
 assert.ok(consent.includes('root.localStorage.setItem(SMART_KEY'));
 assert.ok(consent.includes('root?.localStorage?.removeItem(SMART_KEY)'));
 assert.ok(consent.includes('if(!await requireSmart())return false'));
 assert.ok(html.includes('id="smartRevokeTerms"'));
 assert.ok(html.includes('Kênh công khai hoặc có tín hiệu không đồng nghĩa có bản quyền'));
});
test('New immutable version, one Mac app, release notes and Rust tests in CI',()=>{
 const p=JSON.parse(read('package.json')),shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.equal(p.version,'4.23.17-tauri.23.8.28');
 assert.ok(shell.includes('TAG="rust-lab/v23.8.28"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
 assert.ok(read('.github/workflows/rust-lab-version-tags.yml').includes('cargo test --manifest-path src-tauri/Cargo.toml safe_network::tests --lib'));
 assert.ok(read('RELEASE_NOTES_RUST_LAB_V23_8_28.md').includes('SSRF'));
});
