import sharp from 'sharp';
const d = 'D:/大肥鱼主题';
const src = `${d}/assets/source/home-maid-clean.png`;
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const FADE = 120;
for (let y = 0; y < H; y++) for (let x = 0; x < FADE; x++) {
  const i = (y * W + x) * 4;
  const t = x / FADE;
  const ease = t * t * (3 - 2 * t);
  data[i + 3] = Math.round(data[i + 3] * ease);
}
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(`${d}/assets/home-maid.png`);
console.log('faded', W, H, FADE);
