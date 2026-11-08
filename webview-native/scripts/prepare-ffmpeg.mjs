import { createRequire } from 'node:module';
import { mkdirSync, copyFileSync, chmodSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const ffprobe = require('@w6s/ffprobe-static').path;
const triples = {
  'darwin:arm64': 'aarch64-apple-darwin',
  'darwin:x64': 'x86_64-apple-darwin',
  'win32:x64': 'x86_64-pc-windows-msvc'
};
const triple = triples[`${process.platform}:${process.arch}`];
if (!triple) throw new Error(`Chưa hỗ trợ đóng gói FFmpeg: ${process.platform}/${process.arch}`);
const dir = resolve('src-tauri', 'binaries'); mkdirSync(dir, {recursive:true});
for (const [name, src] of [['ffmpeg', ffmpeg],['ffprobe',ffprobe]]) {
  if (!src || statSync(src).size < 100000) throw new Error(`${name} thiếu hoặc không hợp lệ: ${src}`);
  const dest = join(dir, `${name}-${triple}${process.platform === 'win32'?'.exe':''}`);
  copyFileSync(src, dest);
  if (process.platform !== 'win32') chmodSync(dest, 0o755);
  const version = execFileSync(dest, ['-version'], {encoding:'utf8', timeout:12000}).split('\n')[0];
  console.log(`${name}: ${version}; bundled ${dest}`);
}
console.log('FFmpeg & FFprobe đã sẵn sàng đóng gói; KHÔNG tự bỏ FFmpeg nếu gặp lỗi.');
