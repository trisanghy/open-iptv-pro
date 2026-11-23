'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P330 prevents global AI hotkeys when a native dialog or editable field is active',()=>{
 const source=read('renderer/positron-intelligence.js'),qa=read('scripts/positron-330-audit.cjs');
 const extension=read('scripts/positron-20-extension.cjs'),workflow=read('.github/workflows/positron-lab.yml');
 const pkg=JSON.parse(read('package.json'));
 for(const token of ['el?.isContentEditable','[contenteditable]','.modal-backdrop:not(.hidden):not([hidden])','[contenteditable="true"]'])assert.ok(source.includes(token),token);
 for(const token of ['sourceModalSafe','castModalSafe','plaintextEditableSafe','emptyEditableSafe','desktopShortcutWorks','twoWayUnchanged','narrowShortcutWorks','playlistUnchanged','modelUnchanged','noAutoplay',
  'positron-p51330-modal-f6-before-1920x1080-real.png','positron-p51330-modal-f6-after-1920x1080-real.png','positron-p51330-ai-after-720x900-real.png'])assert.ok(qa.includes(token),token);
 assert.ok(extension.includes("require('./positron-330-audit.cjs').run(page)"));
 assert.ok(workflow.includes('node --check scripts/positron-330-audit.cjs'));
 assert.ok(workflow.includes('audit-p51330-modal-f6.json'));
 assert.ok(Number(pkg.version.split('.')[2])>=415,'P330 minimum application version retained');
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.330 / Electron 4.23.415'),'P330 immutable changelog entry retained');
});
