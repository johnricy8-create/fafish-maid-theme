import sharp from 'sharp';
const d = 'D:/大肥鱼主题';
await sharp(`${d}/output/preview-lock.png`).extract({ left: 180, top: 1450, width: 360, height: 360 }).resize(720, 720, { kernel: 'nearest' }).png().toFile(`${d}/output/_fin-check.png`);
await sharp(`${d}/output/preview-lock.png`).extract({ left: 0, top: 2200, width: 1080, height: 200 }).png().toFile(`${d}/output/_bottom-check.png`);
console.log('ok');
