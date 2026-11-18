'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'renderer/video-source-aspect-v42338.css'),'utf8');
test('v4.23.39 video frame uses the full available width instead of a viewport-height cap',()=>{
  assert.match(css,/width:\s*100%!important/);
  assert.doesNotMatch(css,/width:\s*min\(100%,\s*calc\(clamp/);
  assert.match(css,/aspect-ratio:\s*var\(--source-video-ratio\)!important/);
  assert.match(css,/height:\s*auto!important/);
  assert.match(css,/margin-inline:\s*0!important/);
});
