'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Local Mac build creates only a native .app in a new Downloads folder',()=>{
 const s=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(s,/npm run build -- --bundles app/);
 assert.match(s,/src-tauri\/target\/release\/bundle\/macos/);
 assert.match(s,/ditto "\$APP" "\$APP_TARGET"/);
 assert.match(s,/OUTPUT_COUNT/);
 assert.match(s,/Contents\/Info\.plist/);
 assert.match(s,/trap 'rm -rf "\$TMP"' EXIT/);
 assert.doesNotMatch(s,/--bundles dmg/);
 assert.doesNotMatch(s,/cp "\$TMP\/source\.zip" "\$DEST/);
 assert.doesNotMatch(s,/\.dmg"\s*"\$DEST/);
});
test('Immutable local tag, source version and displayed UI are synchronized',()=>{
 const pkg=JSON.parse(read('package.json'));
 const rel=pkg.version.split('-tauri.')[1],s=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(rel,/^\d+(?:\.\d+)*$/);
 assert.ok(s.includes('VERSION="'+pkg.version+'"'));
 assert.ok(s.includes('TAG="rust-lab/v'+rel+'"'));
 assert.match(s,/ACTUAL_VERSION=.*sed -nE/);
 assert.ok(read('renderer/index.html').includes('Rust Lab v'+rel));
 assert.ok(read('src-tauri/tauri.conf.json').includes('Rust Lab v'+rel));
});
test('GitHub release pipeline remains separate: DMG and source ZIP retained',()=>{
 const ci=read('.github/workflows/rust-lab-version-tags.yml');
 assert.match(ci,/--target universal-apple-darwin --bundles dmg/);
 assert.match(ci,/dist\/OpenIPTVPro-RustLab-v\$\{RELEASE_NO\}-Source\.zip/);
 assert.match(ci,/dist\/\*Source\.zip/);
 assert.match(ci,/dist\/\*\.dmg/);
 assert.match(ci,/dist\/SHA256SUMS\.txt/);
 assert.match(ci,/--bundles nsis/);
});

test('macOS release verification mounts finished universal DMG, not deleted staging app',()=>{
 const ci=read('.github/workflows/rust-lab-version-tags.yml');
 const stage=ci.split('      - name: Verify finished DMG contains Apple Silicon + Intel app and FFmpeg')[1]?.split('      - uses: actions/upload-artifact@v4')[0]||'';
 assert.ok(stage.includes("hdiutil attach -readonly -nobrowse"));
 assert.ok(stage.includes("app=\"$(find \"$mount\" -maxdepth 1 -type d -name '*.app' -print -quit)\""));
 assert.ok(stage.includes("lipo \"$exe\" -verify_arch arm64 x86_64"));
 assert.ok(stage.includes("lipo \"$resource\" -verify_arch arm64 x86_64"));
 assert.ok(!stage.includes('find src-tauri/target/universal-apple-darwin/release/bundle/macos'));
});


test('immutable Rust Lab releases require versioned notes before tag creation',()=>{
 const pkg=JSON.parse(read('package.json'));
 const rel=pkg.version.split('-tauri.')[1];
 const notePath='RELEASE_NOTES_RUST_LAB_V'+rel.replaceAll('.','_')+'.md';
 assert.ok(fs.existsSync(path.join(__dirname,'..',notePath)),`Missing ${notePath}`);
 assert.ok(read(notePath).includes('Rust Lab v'+rel));
 const tagging=read('scripts/tag-rust-lab-release.sh');
 assert.ok(tagging.includes('NOTES="RELEASE_NOTES_RUST_LAB_V${RELEASE//./_}.md"'));
 assert.ok(tagging.includes('[[ ! -s "$NOTES" ]]'));
 assert.ok(tagging.indexOf('Missing release notes before tagging')<tagging.indexOf('git push origin'));
});
