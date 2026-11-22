'use strict';
// Bộ kiểm tra nội dung công khai phải hiện tiếng Việt, không chỉnh lịch sử Git.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('có bản dịch tiếng Việt đầy đủ cho mọi phiên bản đang hiển thị',()=>{
 const entries=JSON.parse(read('docs/positron-features/vi.json')).versions;
 const previous=JSON.parse(read('docs/positron-features/catalog.json')).versions;
 assert.ok(Object.keys(entries).length>=107,'thiếu bản dịch phiên bản đã có');
 for(const row of previous){
  if(row.number>133)continue; // bản mới sau mốc dịch phải viết changelog bằng tiếng Việt
  const local=entries[String(row.number)];
  assert.ok(local,'thiếu bản dịch P5.1.'+row.number);
  for(const key of ['title','description']){
   assert.ok(local[key]&&local[key].length>16,'bản dịch quá ngắn: '+row.number+' '+key);
   assert.match(local[key],/[À-ỹđĐ]/,'nội dung phải có tiếng Việt: '+row.number+' '+key);
  }
 }
});

test('website không lấy lại tiêu đề hoặc mô tả tiếng Anh từ API Release',()=>{
 const html=read('docs/positron-features/index.html');
 assert.ok(html.includes('<html lang="vi">'));
 assert.ok(html.includes('Nhật ký Git tiếng Việt'));
 assert.ok(html.includes('CHƯA CÓ BẢN PHÁT HÀNH'));
 assert.ok(!html.includes("r.status==='candidate'?'CHƯA CÓ RELEASE'"));
 assert.ok(!html.includes('(release.body||'));
 assert.ok(!html.includes('(release.name||'));
 assert.ok(html.includes('if(prev&&prev.title)r.title=prev.title'));
 assert.ok(html.includes('if(prev&&prev.description)r.description=prev.description'));
});

test('bộ tạo nhật ký Việt hóa trước khi xuất bản, giữ nguyên commit và ảnh thật',()=>{
 const code=read('scripts/build-positron-feature-site.py');
 assert.ok(code.includes('def viet_hoa_rows(rows):'));
 assert.ok(code.includes('viet_hoa_rows(rows)\n    attach_real_images(rows)'));
 assert.ok(code.includes('VI_SOURCE = ROOT / "docs" / "positron-features" / "vi.json"'));
 assert.ok(code.includes('def write_github_index(rows):'));
 assert.ok(code.includes('LOG_GIT_TIENG_VIET.md'));
 assert.ok(code.includes('commits?sha=Positron&path=package.json&per_page=1'),
   'không được gán commit của bot nhật ký cho phiên bản ứng dụng');
 assert.ok(code.includes('Không đẩy Release tiếng Anh trực tiếp'));
 assert.ok(code.includes('commit gốc')||code.includes('commit nguyên gốc'));
});

test('workflow kiểm tra tiếng Việt, tự tạo nhật ký và không ghi đè nhánh khác',()=>{
 const flow=read('.github/workflows/positron-feature-pages.yml');
 const rules=read('POSITRON_FEATURE_RULES.md');
 assert.ok(flow.includes('branches: [Positron]'));
 assert.ok(flow.includes('node --test tests/positron-site-language.test.cjs'));
 assert.ok(flow.includes('LOG_GIT_TIENG_VIET.md'));
 assert.ok(flow.includes("git commit -m 'Tài liệu Positron:"));
 assert.ok(flow.includes('git push origin HEAD:Positron'));
 assert.ok(!flow.includes('git push --force'));
 assert.ok(rules.includes('mọi nội dung dành cho người dùng trong nhánh Positron phải viết bằng tiếng Việt'));
 assert.ok(rules.includes('Không viết lại các commit lịch sử'));
});

test('website có đường dẫn công khai độc lập với Pages của web/online',()=>{
 const html=read('docs/positron-features/index.html');
 const readme=read('docs/positron-features/README.md');
 const builder=read('scripts/build-positron-feature-site.py');
 const url='https://raw.githack.com/trisanghy/open-iptv-pro/Positron/docs/positron-features/index.html';
 assert.ok(readme.includes(url),'thiếu link truy cập HTML tương tác');
 assert.ok(builder.includes(url),'workflow phải giữ link sau khi tạo lại Markdown');
 assert.ok(html.includes("const publicAssets='https://raw.githubusercontent.com/'"));
 assert.ok(html.includes("publicAssets+'catalog.json'"));
 assert.ok(html.includes("img.src=validImage?publicAssets+r.image"));
 assert.ok(html.includes("if(validImage&&!img.dataset.localFallback)"));
 assert.ok(html.includes('for(const address of [publicAssets+\'catalog.json\',\'./catalog.json\'])'));
 assert.ok(!html.includes('localStorage'),'website nhật ký không cần truy cập dữ liệu xem IPTV');
});


test('fallback ảnh Electron thật có sẵn và gallery được hiển thị nổi bật',()=>{
 const builder=read('scripts/build-positron-feature-site.py');
 const html=read('docs/positron-features/index.html');
 assert.ok(builder.includes('def attach_checked_in_images(rows):'));
 assert.ok(builder.includes('attach_real_images(rows)\n    attach_checked_in_images(rows)'));
 assert.ok(builder.includes('IMAGE_RE.search(file.name)'));
 assert.ok(builder.includes('row["image"] = "screenshots/" + file.name'));
 assert.ok(html.includes('Ảnh chụp Electron đã xác minh'));
 assert.ok(html.includes('id="gallery"'));
 assert.ok(html.includes('function renderGallery()'));
});
