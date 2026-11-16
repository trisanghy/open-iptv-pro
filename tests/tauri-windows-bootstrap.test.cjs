const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const script = fs.readFileSync(path.join(__dirname, '..', 'BUILD_WINDOWS_TAURI.ps1'), 'utf8');
test('Windows bootstrap parses node --version without fragile node -p quoting', () => {
  assert.match(script, /function Get-NodeMajor \{/);
  assert.match(script, /node\.exe --version/);
  assert.ok(script.includes("'^v([0-9]+)\\.'"));
});
test('Windows bootstrap does not evaluate JS to parse Node version', () => {
  assert.doesNotMatch(script, /node\.exe\s+-p\s+/);
  assert.match(script, /\$major -lt 22/);
  assert.match(script, /Has-Tool 'npm\.cmd'/);
});
