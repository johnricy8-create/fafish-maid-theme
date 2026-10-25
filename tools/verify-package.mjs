import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = 'D:/大肥鱼主题';
const verify = path.join(root, 'output', '_verify');
const out = path.join(root, 'output');
const phone = path.join(root, '手机安装包');
const hwtPath = path.join(out, 'fatfish-maid-honor-x10.hwt');
const hwtName = 'fatfish-maid-honor-x10.hwt';

const checks = [];
const ok = (name, pass, detail = '') => checks.push({ name, pass: !!pass, detail });

const walk = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p, base) : [path.relative(base, p).replace(/\\/g, '/')];
});

const files = walk(verify).sort();
const desc = fs.readFileSync(path.join(verify, 'description.xml'), 'utf8');
const theme = fs.readFileSync(path.join(verify, 'unlock', 'theme.xml'), 'utf8');
const entries = JSON.parse(fs.readFileSync(path.join(out, '_entries.json'), 'utf8').replace(/^\uFEFF/, ''));
const entryList = Array.isArray(entries) ? entries : [entries];

ok('HWT 能正常解压', files.length > 0, `${files.length} 个文件`);
ok('description.xml 在第一层', files.includes('description.xml'));
ok('unlock/theme.xml 存在', files.includes('unlock/theme.xml'));
ok('description.xml 无 BOM', !desc.startsWith('\uFEFF'));
ok('中文主题名正确', desc.includes('<title-cn>深海女仆 · 大肥鱼</title-cn>'));
ok('主题分辨率字段 FHD', desc.includes('<screen>FHD</screen>'));
ok('锁屏模式为 slide', /<item\s+style="slide"\s*\/>/.test(theme));
ok('包内文件名全为 ASCII', files.every((f) => /^[\x20-\x7E/]+$/.test(f)));
ok('ZIP 条目使用正斜杠', entryList.every((e) => !e.includes('\\')));
ok('ZIP 第一层无多余文件夹', entryList.includes('description.xml') && !entryList.some((e) => e.startsWith('fatfish-maid-honor-x10/')));

const specs = [
  { key: '锁屏壁纸', rel: 'wallpaper/unlock_wallpaper_0.jpg', w: 1080, h: 2400 },
  { key: '桌面壁纸', rel: 'wallpaper/home_wallpaper_0.jpg', w: 1080, h: 2400 },
  { key: '锁屏预览', rel: 'preview/preview_unlock_0.jpg', w: 1080, h: 2400 },
  { key: '桌面预览', rel: 'preview/preview_home_0.jpg', w: 1080, h: 2400 },
  { key: '封面', rel: 'preview/cover.jpg', w: 1080, h: 1920 },
];
const images = [];
for (const s of specs) {
  const p = path.join(verify, s.rel);
  const m = await sharp(p).metadata();
  const kb = Math.round(fs.statSync(p).size / 1024);
  images.push({ ...s, w: m.width, h: m.height, format: m.format, space: m.space, hasAlpha: m.hasAlpha, progressive: m.isProgressive, chroma: m.chromaSubsampling, kb });
  ok(`${s.key} ${s.w}×${s.h}`, m.width === s.w && m.height === s.h, `${m.width}×${m.height}`);
  ok(`${s.key} 为 baseline JPEG`, m.format === 'jpeg' && m.isProgressive === false, `progressive=${m.isProgressive}`);
  ok(`${s.key} 无 alpha / sRGB`, m.hasAlpha === false && m.space === 'srgb', `alpha=${m.hasAlpha}, space=${m.space}`);
  ok(`${s.key} < 1MB`, kb < 1024, `${kb} KB`);
}

const hwtKb = Math.round(fs.statSync(hwtPath).size / 1024);
ok('主题包 < 10MB', hwtKb < 10240, `${hwtKb} KB`);
ok('包内包含 8 个文件', files.length === 8, `${files.length}`);

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const hashes = {
  hwt: sha(hwtPath),
  lock: sha(path.join(verify, 'wallpaper', 'unlock_wallpaper_0.jpg')),
  home: sha(path.join(verify, 'wallpaper', 'home_wallpaper_0.jpg')),
};
ok('手机安装包内 HWT 与构建产物一致', sha(path.join(phone, hwtName)) === hashes.hwt);
ok('手机安装包内锁屏 JPG 与包内一致', sha(path.join(phone, 'lock-wallpaper-1080x2400.jpg')) === hashes.lock);
ok('手机安装包内桌面 JPG 与包内一致', sha(path.join(phone, 'home-wallpaper-1080x2400.jpg')) === hashes.home);

const failed = checks.filter((c) => !c.pass);
const allOk = failed.length === 0;

const lines = [];
lines.push('深海女仆 · 大肥鱼 — 本地验收报告');
lines.push(`生成时间：${new Date().toISOString().replace('T', ' ').slice(0, 19)}`);
lines.push(`结论：${allOk ? '全部通过' : `${failed.length} 项失败`}`);
lines.push('');
lines.push('一、主题包');
lines.push(`文件：${hwtName}`);
lines.push(`大小：${hwtKb} KB`);
lines.push(`SHA256：${hashes.hwt}`);
lines.push(`ZIP：有效，${files.length} 个条目，description.xml 在根目录，路径使用 /`);
lines.push('description.xml：UTF-8 无 BOM，title-cn=深海女仆 · 大肥鱼，screen=FHD，version=11.1.0');
lines.push('unlock/theme.xml：<item style="slide"/>（静态滑动锁屏）');
lines.push('');
lines.push('二、壁纸与预览');
for (const i of images) {
  lines.push(`${i.key}：${i.w}×${i.h}，JPEG baseline，sRGB，${i.chroma}，无 alpha，${i.kb} KB`);
}
lines.push('');
lines.push('三、校验明细');
for (const c of checks) lines.push(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? '  (' + c.detail + ')' : ''}`);
lines.push('');
lines.push('四、兼容性与安装');
lines.push('目标机：荣耀 X10，1080×2400，升降前摄无挖孔，侧边指纹。');
lines.push('锁屏为系统滑动解锁 + 系统时钟，不含自定义时钟/图标。');
lines.push('本地无法真机验证 HarmonyOS 主题引擎；若主题 App 不识别，用同目录 JPG 在图库设置。');
lines.push('');
lines.push('安装：');
lines.push('1. 把 fatfish-maid-honor-x10.hwt 复制到 内部存储/Huawei/Themes/。');
lines.push('2. 设置 → 应用和服务 → 应用管理 → 主题 → 存储 → 清除缓存，必要时强行停止。');
lines.push('3. 主题 → 我的 → 我的主题，找到「深海女仆 · 大肥鱼」应用。');
lines.push('4. 或在「混搭 / DIY」里只选锁屏和桌面壁纸。');
lines.push('');
lines.push('兜底：图库直接设置 lock-wallpaper-1080x2400.jpg 和 home-wallpaper-1080x2400.jpg。');

fs.writeFileSync(path.join(phone, '校验报告.txt'), '\uFEFF' + lines.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(out, '_verify-data.json'), JSON.stringify({ allOk, checks, images, hashes, files, entries: entryList }, null, 2), 'utf8');

console.log(JSON.stringify({ allOk, failed: failed.map((f) => f.name), images, hashes, entries: entryList, files }, null, 2));
process.exit(allOk ? 0 : 1);
