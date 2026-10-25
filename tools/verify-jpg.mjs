import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const dir = 'D:/大肥鱼主题/output/jpg';
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.jpg'))) {
  const p = path.join(dir, f);
  const m = await sharp(p).metadata();
  console.log(JSON.stringify({
    file: f,
    w: m.width, h: m.height, format: m.format, space: m.space,
    channels: m.channels, hasAlpha: m.hasAlpha,
    progressive: m.isProgressive, chroma: m.chromaSubsampling,
    kb: Math.round(fs.statSync(p).size / 1024)
  }));
}
