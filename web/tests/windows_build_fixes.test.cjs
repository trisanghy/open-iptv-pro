'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const bat = fs.readFileSync(path.join(root, 'BUILD_WINDOWS.bat'), 'utf8');
const ps = fs.readFileSync(path.join(root, 'scripts', 'BUILD_WINDOWS_AUTO.ps1'), 'utf8');
const pkg = require(path.join(root, 'package.json'));

test('Windows launcher builds from its own folder and refuses missing package.json', () => {
  assert.match(bat, /cd \/d "%~dp0"/i);
  assert.match(bat, /if not exist "%PROJECT%package\.json"/i);
  assert.match(bat, /scripts\\BUILD_WINDOWS_AUTO\.ps1/);
});
test('Windows build validates source version and passes explicit projectDir to builder', () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.ok(ps.includes("$expectedVersion = '" + pkg.version + "'"));
  assert.match(ps, /Assert-ProjectRoot/);
  assert.match(ps, /\$info\.version -ne \$expectedVersion/);
  assert.match(ps, /src\\main\.cjs/);
  assert.match(ps, /--projectDir\s+"\$root"/);
  assert.match(ps, /--publish never/);
});
test('Windows checks actual symbolic-link privileges before unpacking winCodeSign', () => {
  assert.match(ps, /Test-SymlinkPrivilege/);
  assert.match(ps, /New-Item -Path \$link -ItemType SymbolicLink/);
  assert.match(ps, /ms-settings:developers/);
  assert.match(ps, /-Verb RunAs/);
  assert.match(ps, /\$choice -match/);
});
test('Windows build retains app icon and validates fresh Setup and Portable outputs', () => {
  assert.equal(pkg.build.win.icon, 'assets/icon.ico');
  assert.notEqual(pkg.build.win.signAndEditExecutable, false);
  assert.match(ps, /Open-IPTV-Pro-Setup-\$\{expectedVersion\}-x64\.exe/);
  assert.match(ps, /Open-IPTV-Pro-\$\{expectedVersion\}-x64\.exe/);
  assert.match(ps, /\$file\.LastWriteTimeUtc -lt \$buildStarted\.AddSeconds/);
});
