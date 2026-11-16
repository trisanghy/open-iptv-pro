const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'BUILD_WINDOWS_TAURI.ps1'), 'utf8');

test('preflight covers Visual Studio 2022/2026 and SDK without repeating winget VS installation', () => {
  assert.match(source, /Get-VSWhere/);
  assert.match(source, /vswhere -all -products '\*' -requires/);
  assert.match(source, /Common7\\Tools\\VsDevCmd\.bat/);
  assert.match(source, /foreach \(\$tool in @\('cl\.exe','link\.exe','rc\.exe'\)\)/);
  assert.doesNotMatch(source, /Install-WingetPackage 'Microsoft\.VisualStudio/);
});
test('preflight gives actionable policy guidance and a help file', () => {
  assert.match(source, /Organization policies are preventing installation/);
  assert.match(source, /MSVC_INSTALL_REQUIRED\.txt/);
  assert.match(source, /Desktop development with C\+\+/);
});
test('existing Rust MSVC toolchain is reused without reinstallation', () => {
  assert.match(source, /rustup\.exe toolchain list/);
  assert.match(source, /if \(\$installed -notmatch 'stable-x86_64-pc-windows-msvc'\)/);
});
