import fs from 'node:fs';
const p = 'D:/大肥鱼主题/theme/fatfish-maid-honor-x10/description.xml';
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<HwTheme>
    <title>DeepSea Maid FatFish</title>
    <title-cn>深海女仆 · 大肥鱼</title-cn>
    <author>FatFish</author>
    <designer>FatFish</designer>
    <screen>FHD</screen>
    <version>11.1.0</version>
    <font>Default</font>
    <font-cn>默认</font-cn>
    <briefinfo>DeepSeek maid fish girl theme for Honor X10. 1080x2400 lock screen and home wallpaper.</briefinfo>
</HwTheme>
`;
fs.writeFileSync(p, xml, 'utf8');
console.log('description.xml rewritten', Buffer.byteLength(xml));
