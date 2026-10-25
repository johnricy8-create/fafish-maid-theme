import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = 'D:/大肥鱼主题';
const out = path.join(root, 'output', 'jpg');
fs.mkdirSync(out, { recursive: true });

const jobs = [
  { src: 'output/lock-1080x2400.png', dst: 'lock-wallpaper-1080x2400.jpg' },
  { src: 'output/home-1080x2400.png', dst: 'home-wallpaper-1080x2400.jpg' },
  { src: 'output/preview-lock.png', dst: 'preview-lock-1080x2400.jpg' },
  { src: 'output/preview-home.png', dst: 'preview-home-1080x2400.jpg' },
];

for (const j of jobs) {
  const dst = path.join(out, j.dst);
  await sharp(path.join(root, j.src))
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: false, mozjpeg: false })
    .toFile(dst);
  const kb = (fs.statSync(dst).size / 1024).toFixed(0);
  console.log(`${j.dst}  ${kb} KB`);
}

// 主题 App 封面：1080x1920，保持锁屏完整构图，两侧补深海底色
const inner = await sharp(path.join(root, 'output/preview-lock.png'))
  .resize({ height: 1920, fit: 'inside', kernel: 'lanczos3' })
  .toBuffer();
const meta = await sharp(inner).metadata();
const left = Math.round((1080 - meta.width) / 2);
const coverPath = path.join(out, 'cover-1080x1920.jpg');
await sharp({ create: { width: 1080, height: 1920, channels: 3, background: '#04070F' } })
  .composite([{ input: inner, left, top: 0 }])
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: false, mozjpeg: false })
  .toFile(coverPath);
console.log(`cover-1080x1920.jpg  ${(fs.statSync(coverPath).size / 1024).toFixed(0)} KB`);

