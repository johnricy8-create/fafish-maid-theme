import sharp from 'sharp';
const d = 'C:/Users/Administrator/AppData/Local/Temp/opencode/imgtool';
const { data, info } = await sharp(`${d}/06809-cut.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) mask[i] = data[i * 4 + 3] > 100 ? 1 : 0;
const seen = new Uint8Array(W * H); const comps = []; const stack = new Int32Array(W * H);
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
    for (const n of [q-1,q+1,q-W,q+W,q-W-1,q-W+1,q+W-1,q+W+1]) {
      if (n < 0 || n >= W*H) continue;
      if (Math.abs((n % W) - qx) > 1) continue;
      if (mask[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; }
    }
  }
  comps.push({ area, minX, maxX, minY, maxY, px });
}
comps.sort((a,b) => b.area - a.area);
const keep = new Uint8Array(W*H);
for (const p of comps[0].px) keep[p] = 1;
// 裁到腰部
const CX = 280, CY = 0, CW = 520, CH = 760;
const out = Buffer.alloc(CW * CH * 4);
for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
  const si = (y + CY) * W + (x + CX); const di = (y * CW + x) * 4;
  const a = keep[si] ? data[si*4+3] : 0;
  out[di] = data[si*4]; out[di+1] = data[si*4+1]; out[di+2] = data[si*4+2]; out[di+3] = a;
}
// 底部中间的“观众手”擦掉（只擦最下面 45px，保护清单和尾巴）
for (let y = 715; y < CH; y++) for (let x = 0; x < 190; x++) out[(y*CW+x)*4+3] = 0;
// 腐蚀 2px + 羽化 + 边缘去白
let alpha = new Uint8Array(CW*CH);
for (let i=0;i<CW*CH;i++) alpha[i]=out[i*4+3];
for (let pass=0; pass<2; pass++) {
  const next = new Uint8Array(CW*CH);
  for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) {
    let m=255;
    for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
      const nx=x+dx, ny=y+dy;
      const v=(nx<0||ny<0||nx>=CW||ny>=CH)?0:alpha[ny*CW+nx];
      if (v<m) m=v;
    }
    next[y*CW+x]=m;
  }
  alpha=next;
}
const soft = new Uint8Array(CW*CH);
for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) {
  let s=0,n=0;
  for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
    const nx=x+dx, ny=y+dy;
    if (nx<0||ny<0||nx>=CW||ny>=CH) continue;
    const w=(dx===0?2:1)*(dy===0?2:1);
    s+=alpha[ny*CW+nx]*w; n+=w;
  }
  soft[y*CW+x]=Math.round(s/n);
}
// 左边缘 26px 柔和淡出，藏住裁切线
for (let y=0;y<CH;y++) for (let x=0;x<26;x++) {
  const f = x/26; const ease = f*f*(3-2*f);
  soft[y*CW+x] = Math.round(soft[y*CW+x] * ease);
}
for (let i=0;i<CW*CH;i++) out[i*4+3]=soft[i];
const rgb = new Uint8ClampedArray(out);
for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) {
  const i=y*CW+x; const a=soft[i];
  if (a===0||a===255) continue;
  let r=0,g=0,b=0,n=0;
  for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++) {
    const nx=x+dx, ny=y+dy;
    if (nx<0||ny<0||nx>=CW||ny>=CH) continue;
    const j=ny*CW+nx;
    if (soft[j]>245){ r+=out[j*4]; g+=out[j*4+1]; b+=out[j*4+2]; n++; }
  }
  if (n){ rgb[i*4]=r/n; rgb[i*4+1]=g/n; rgb[i*4+2]=b/n; }
}
await sharp(Buffer.from(rgb), { raw:{width:CW,height:CH,channels:4} }).png().toFile(`${d}/06809-home.png`);
await sharp({ create:{width:CW,height:CH,channels:4,background:'#0b1430'} })
  .composite([{ input:`${d}/06809-home.png` }]).png().toFile(`${d}/06809-home-preview.png`);
console.log('ok', CW, CH);
