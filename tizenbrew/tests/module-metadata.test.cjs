'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'tizenbrew/index.html'), 'utf8');

test('TizenBrew card exposes the actual Samsung TV edition', () => {
  assert.equal(pkg.packageType, 'app');
  assert.equal(pkg.appName, 'Open IPTV Pro TV');
  assert.equal(pkg.appPath, 'tizenbrew/bootstrap.html');
  const boot=fs.readFileSync(path.join(root, 'tizenbrew/bootstrap.html'), 'utf8');
  assert.match(boot, /api\.github\.com\/repos\//);
  assert.match(boot, /tizenbrew\/index\.html/);
  assert.equal(pkg.version, pkg.tizenbrewEdition, 'TizenBrew reads package.version for the module card');
  assert.ok(html.includes('Samsung Tizen Edition · TizenBrew v' + pkg.version));
});

test('TizenBrew module description fits TV module cards', () => {
  assert.ok(pkg.description.length > 0 && pkg.description.length <= 150, 'Keep module descriptions concise');
  assert.doesNotMatch(pkg.description, /Full Desktop|Windows\/macOS|Timeshift for Windows/i);
  assert.match(pkg.description, /TV Samsung|TV cho Samsung/);
});
