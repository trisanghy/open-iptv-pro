'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('Positron HEAD preserves immutable feature-first rule and branch isolation', () => {
  const policy = read('POSITRON_FEATURE_RULES.md');
  assert.match(policy, /^# Positron — Quy tắc ưu tiên chức năng mới/m);
  assert.match(policy, /Ưu tiên số 1: thêm nhiều tính năng mới thiết thực/);
  assert.match(policy, /Không dùng nhiều vòng liên tiếp chỉ để tinh chỉnh/);
  assert.match(policy, /tuyệt đối không sửa main/);
  assert.match(policy, /Không đổi nhánh nguồn Pages và không ghi đè website Web/);
  assert.match(policy, /P5\.1\.134/);
  assert.match(policy, /Feature priority: NEW/);
  assert.match(policy, /Feature priority: BLOCKER_FIX/);
});

test('every following Positron application version must justify feature-first decision', () => {
  const pkg = JSON.parse(read('package.json'));
  const match = /\bPositron\s+(P5\.1\.(\d+)(?:\.\d+)?)/.exec(String(pkg.description || ''));
  assert.ok(match, 'package.json must retain its Positron P5.1.N label');
  const label = match[1];
  const number = Number(match[2]);
  const sections = read('POSITRON_P5_CHANGELOG.md').split(/\n(?=## P5\.1\.\d+)/);
  const heading = '## ' + label;
  const current = sections.find(s => s.startsWith(heading + ' '));
  assert.ok(current, 'current Positron version needs own changelog section ' + heading);
  // Baseline P5.1.133 predates adoption; future releases may not bypass this gate.
  if (number < 134) return;
  const declared = /^- Feature priority: (NEW|BLOCKER_FIX) — (.+)$/m.exec(current);
  assert.ok(declared, heading + ' must declare NEW or justified BLOCKER_FIX');
  assert.ok(declared[2].trim().length >= 35, 'priority needs a real impact explanation');
  const screenshot = /^- Electron screenshot: (.+)$/m.exec(current);
  assert.ok(screenshot && screenshot[1].includes(label.toLowerCase().replaceAll('.','')) && /\.png\b/i.test(screenshot[1]),
    'declare genuine native Electron screenshot filename for same version');
  if (declared[1] === 'NEW') {
    const action = /^- User action: (.+)$/m.exec(current);
    assert.ok(action && action[1].trim().length >= 24,
      'a new feature must describe how the viewer activates and uses it');
  } else {
    assert.match(declared[2], /phát|âm thanh|video|dữ liệu|bảo mật|privacy|security|CI|build|crash|mất dữ liệu|playback/i,
      'fix exception must be about an actual release or user-data blocker');
  }
});

test('GitHub version gallery has one expandable row and authentic screenshots', () => {
  const workflow = read('.github/workflows/positron-feature-pages.yml');
  const generator = read('scripts/build-positron-feature-site.py');
  const page = read('docs/positron-features/index.html');
  assert.match(workflow, /branches: \[Positron\]/);
  assert.match(workflow, /node --test tests\/positron-feature-priority\.test\.cjs/);
  assert.match(workflow, /docs\/positron-features\/FEATURES\.md/);
  assert.match(workflow, /if: vars\.POSITRON_PAGES_ENABLED == 'true'/);
  assert.match(generator, /def write_github_index\(rows\)/);
  assert.match(generator, /def attach_real_images\(rows\)/);
  assert.match(generator, /data\.startswith\(b"\\x89PNG/);
  assert.match(page, /details\.entry/);
  assert.match(page, /r\.image/);
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/positron-features/FEATURES.md')),
    'GitHub-native expandable timeline must remain checked into Positron');
});

test('HEAD bất biến yêu cầu đủ 20 tính năng mới, 20 phiên bản và ảnh Electron thật từng vòng',()=>{
 const head=read('POSITRON_HEAD_20_VONG_TINH_NANG_MOI.md');
 const policy=read('POSITRON_FEATURE_RULES.md');
 assert.match(head,/MỖI LẦN NGƯỜI DÙNG GỬI FILE KHỞI CHẠY/);
 assert.match(head,/20 VÒNG \/ 20 TÍNH NĂNG MỚI \/ 20 PHIÊN BẢN/);
 assert.match(head,/round-NN-before-real\.png/);
 assert.match(head,/round-NN-after-real\.png/);
 assert.match(head,/mở và xem ảnh sau bằng mắt/);
 assert.match(head,/Không nhầm 70 screenshot checks với 20 vòng tính năng/);
 assert.match(head,/CANDIDATE/);
 assert.match(head,/không dừng sau vòng đầu/i);
 assert.match(head,/expected_sha/);
 assert.match(policy,/HEAD BẤT BIẾN/);
 assert.match(policy,/POSITRON_HEAD_20_VONG_TINH_NANG_MOI\.md/);
});


test('Hai PNG Electron thật riêng cho phiên bản mới phải được khai báo và CI kiểm tra',()=>{
 const pkg=JSON.parse(read('package.json'));
 const m=/Positron\s+(P5\.1\.(\d+)(?:\.\d+)?)/.exec(pkg.description||'');
 assert.ok(m,'cần nhãn sản phẩm để đối chiếu bằng chứng');
 const n=Number(m[2]);
 if(n<136)return; // Nhãn lịch sử trước khi áp dụng cổng này.
 const prefix='positron-'+m[1].toLowerCase().replaceAll('.','')+'-';
 const legacy=read('scripts/positron-20-extension.cjs');
 const workflow=read('.github/workflows/positron-lab.yml');
 // From P352 the independent native audit declares its own actual output files.
 // The full regression runner must invoke that audit, not just list filenames.
 let qa=legacy;
 if(n>=352){
  const file='positron-'+n+'-audit.cjs';
  qa=read('scripts/'+file);
  const runner=read('scripts/positron-50-audit.cjs');
  assert.ok(runner.includes("await require('./"+file+"').run(page)"),'full Electron QA must execute current independent audit');
  assert.ok(qa.includes('await page.screenshot({path:path.join(dir,'),'current audit must capture real Electron PNG');
 }
 const names=[...qa.matchAll(/positron-p51\d+[-a-zA-Z0-9]+\.png/g)]
  .map(x=>x[0]).filter(x=>x.startsWith(prefix));
 const before=names.filter(x=>x.includes('-before-'));
 const after=names.filter(x=>x.includes('-after-'));
 assert.ok(before.length>=1,'phiên bản '+n+' thiếu ảnh Electron TRƯỚC trong QA');
 assert.ok(after.length>=1,'phiên bản '+n+' thiếu ảnh Electron SAU trong QA');
 assert.ok(after.some(x=>workflow.includes(x)),'workflow không xác minh PNG SAU');
 assert.ok(before.some(x=>workflow.includes(x)),'workflow không xác minh PNG TRƯỚC');
 if(n>=352){
  for(const name of [...before,...after])assert.ok(workflow.includes('test -s positron-evidence/p5-20-rounds/'+name),'workflow must verify actual PNG '+name);
 }else assert.ok(qa.includes('await page.screenshot({path:path.join(out,'),
  'Ảnh mới phải ghi bởi Playwright/Electron thực, không phải mockup');
});


test('HEAD từ P5.1.266 yêu cầu AI hoặc BREAKTHROUGH có bằng chứng và quyền riêng tư',()=>{
 const rules=read('POSITRON_FEATURE_RULES.md');
 const guide=read('POSITRON_HEAD_20_VONG_TINH_NANG_MOI.md');
 assert.match(rules,/HEAD BẤT BIẾN — TỪ P5\.1\.266/);
 assert.match(rules,/Feature class: AI/);
 assert.match(rules,/Feature class: BREAKTHROUGH/);
 assert.match(rules,/Evidence:/);
 assert.match(rules,/không gửi stream URL, M3U, lịch sử/);
 assert.match(guide,/BẤT BIẾN CỦA HEAD MỚI TỪ P5\.1\.266/);
 const pkg=JSON.parse(read('package.json'));
 const match=/Positron P5\.1\.(\d+)/.exec(pkg.description||'');
 if(!match||Number(match[1])<266)return;
 const source=read('POSITRON_P5_CHANGELOG.md');
 const section=source.split(/(?=^## P5\.1\.\d+)/m).find(s=>s.startsWith('## P5.1.'+match[1]+' '));
 assert.ok(section,'cần mục changelog đúng phiên bản');
 if(/^- Feature priority: BLOCKER_FIX/m.test(section))return;
 assert.match(section,/^- Feature class: (AI|BREAKTHROUGH)$/m);
 const evidence=/^- Evidence: (.+)$/m.exec(section);
 assert.ok(evidence && evidence[1].trim().length>=55,'cần bằng chứng hành vi và đo lường, không chỉ thay UI');
});
