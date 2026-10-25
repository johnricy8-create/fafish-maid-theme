import sharp from 'sharp';
const d = 'D:/大肥鱼主题';
await sharp(`${d}/assets/lock-maid.png`).extract({ left: 80, top: 260, width: 220, height: 240 }).resize(660, 720, { kernel: 'nearest' }).png().toFile(`${d}/output/_asset-fin.png`);
await sharp(`${d}/output/preview-lock.png`).extract({ left: 200, top: 1320, width: 300, height: 300 }).resize(750, 750, { kernel: 'nearest' }).png().toFile(`${d}/output/_scene-fin.png`);
console.log('ok');
