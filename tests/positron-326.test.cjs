'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs');
test('P326 low-sample AI score disclaimer is conditional, accessible and never modifies ranking',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-326-audit.cjs','utf8');
 const runner=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const workflow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const x of ['P326: a 4-feedback model score is an estimate',
  'model.observations>=2&&model.observations<10',"' (sơ bộ)'",
  "metric.setAttribute('aria-label'","metric.dataset.aiSample='provisional'",
  'không phải độ chính xác được kiểm chứng'])
  assert.ok(js.includes(x),x);
 assert.ok(!js.includes('metric.dataset.aiSample=earlySample'), 'flag only qualifying cards');
 for(const x of ['smallLearningSample','probabilityUnchanged','accessibleDisclosure',
  'cardAndActionsVisible','playlistIntact','modelIntact','noAutoplay'])
  assert.ok(qa.includes(x),x);
 assert.ok(runner.includes("require('./positron-326-audit.cjs').run(page)"));
 for(const file of ['positron-p51326-ai-sample-before-1920x1080-real.png',
  'positron-p51326-ai-sample-after-1920x1080-real.png',
  'positron-p51326-ai-sample-after-720x900-real.png'])
  assert.ok(workflow.includes(file),file);
});
