import sharp from 'sharp';
const d = 'C:/Users/Administrator/AppData/Local/Temp/opencode/imgtool';
const src = process.argv[2] || `${d}/6677-cut.png`;
const dst = process.argv[3] || `${d}/6677-clean.png`;
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;

// 1) 连通域：保留最大主体 + 饭碗（y>700 的大块），去掉手、气泡、碎字
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) mask[i] = data[i * 4 + 3] > 100 ? 1 : 0;
const seen = new Uint8Array(W * H);
const comps = [];
const stack = new Int32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = y * W + x;
  if (!mask[p] || seen[p]) continue;
  let sp = 0; stack[sp++] = p; seen[p] = 1;
  let area = 0, minX = x, maxX = x, minY = y, maxY = y; const px = [];
  while (sp) {
    const q = stack[--sp]; const qx = q % W, qy = (q / W) | 0;
    area++; px.push(q);
    if (qx < minX) minX = qx; if (qx > maxX) maxX = qx;
    if (qy < minY) minY = qy; if (qy > maxY) maxY = qy;
    for (const n of [q-1, q+1, q-W, q+W, q-W-1, q-W+1, q+W-1, q+W+1]) {
      if (n < 0 || n >= W * H) continue;
      if (Math.abs((n % W) - qx) > 1) continue;
      if (mask[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; }
    }
  }
  comps.push({ area, minX, maxX, minY, maxY, px });
}
comps.sort((a, b) => b.area - a.area);
const keep = new Uint8Array(W * H);
let kept = 0;
for (const c of comps) {
  const isMain = c.area > 100000;
  const isBowl = c.area > 10000 && c.minY > 700 && c.maxX < 500;
  if (isMain || isBowl) { for (const p of c.px) keep[p] = 1; kept++; }
}
console.log('kept components:', kept, 'of', comps.length);

// 2) 应用保留域，并腐蚀 2px 去掉白边
for (let i = 0; i < W * H; i++) if (!keep[i]) data[i * 4 + 3] = 0;
let alpha = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) alpha[i] = data[i * 4 + 3];
for (let pass = 0; pass < 2; pass++) {
  const next = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 255;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      const v = (nx < 0 || ny < 0 || nx >= W || ny >= H) ? 0 : alpha[ny * W + nx];
      if (v < m) m = v;
    }
    next[y * W + x] = m;
  }
  alpha = next;
}

// 3) 1px 羽化
const soft = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let sum = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const w = (dx === 0 ? 2 : 1) * (dy === 0 ? 2 : 1);
    sum += alpha[ny * W + nx] * w; n += w;
  }
  soft[y * W + x] = Math.round(sum / n);
}
for (let i = 0; i < W * H; i++) data[i * 4 + 3] = soft[i];

// 4) 边缘去白边：半透明像素用附近不透明像素的颜色
const rgb = new Uint8ClampedArray(data);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x; const a = soft[i];
  if (a === 0 || a === 255) continue;
  let r = 0, g = 0, b = 0, n = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (soft[j] > 245) { r += data[j * 4]; g += data[j * 4 + 1]; b += data[j * 4 + 2]; n++; }
  }
  if (n) { rgb[i * 4] = r / n; rgb[i * 4 + 1] = g / n; rgb[i * 4 + 2] = b / n; }
}

await sharp(Buffer.from(rgb), { raw: { width: W, height: H, channels: 4 } }).png().toFile(dst);
console.log('written', dst);
