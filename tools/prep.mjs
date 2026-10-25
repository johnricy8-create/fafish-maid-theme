import sharp from 'sharp';
const d = 'C:/Users/Administrator/AppData/Local/Temp/opencode/imgtool';
const root = 'D:/大肥鱼主题';
await sharp(`${d}/6677-clean.png`).extract({ left: 180, top: 80, width: 780, height: 816 }).png().toFile(`${root}/assets/lock-maid.png`);
await sharp(`${d}/06809-home.png`).png().toFile(`${root}/assets/home-maid.png`);
const a = await sharp(`${root}/assets/lock-maid.png`).metadata();
const b = await sharp(`${root}/assets/home-maid.png`).metadata();
console.log(JSON.stringify({ lock: [a.width, a.height], home: [b.width, b.height] }));
