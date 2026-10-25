import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = 'D:/大肥鱼主题';
const out = path.join(root, 'output');
const phone = path.join(root, '手机安装包');
const data = JSON.parse(fs.readFileSync(path.join(out, '_verify-data.json'), 'utf8'));
const zipPath = path.join(out, 'fatfish-maid-honor-x10-phone.zip');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const zipHash = sha(zipPath);
const zipKb = Math.round(fs.statSync(zipPath).size / 1024);
const hwtKb = Math.round(fs.statSync(path.join(out, 'fatfish-maid-honor-x10.hwt')).size / 1024);

const rows = data.checks.map((c) => `| ${c.pass ? '✅' : '❌'} | ${c.name} | ${c.detail || ''} |`).join('\n');
const imgRows = data.images.map((i) => `| ${i.key} | ${i.w}×${i.h} | JPEG baseline | ${i.chroma} | ${i.kb} KB |`).join('\n');
const passCount = data.checks.filter((c) => c.pass).length;
const failCount = data.checks.length - passCount;

const report = `# 深海女仆 · 大肥鱼 — 验收报告

**结论：${failCount === 0 ? '全部通过' : `${failCount} 项失败`}（${passCount}/${data.checks.length} 项）**

生成时间：${new Date().toISOString().replace('T', ' ').slice(0, 19)}

## 一、发手机用的安装包

| 项目 | 内容 |
|---|---|
| 路径 | \`D:\\大肥鱼主题\\output\\fatfish-maid-honor-x10-phone.zip\` |
| 大小 | ${zipKb} KB |
| SHA256 | \`${zipHash}\` |
| 内含 | 主题包 HWT + 锁屏/桌面 JPG + 安装说明 + 校验报告 |

发送到手机后解压，把 \`fatfish-maid-honor-x10.hwt\` 复制到 **内部存储/Huawei/Themes/**，再清主题 App 缓存并应用。

## 二、主题包

| 项目 | 内容 |
|---|---|
| 路径 | \`D:\\大肥鱼主题\\output\\fatfish-maid-honor-x10.hwt\` |
| 大小 | ${hwtKb} KB |
| SHA256 | \`${data.hashes.hwt}\` |
| 结构 | description.xml 在根目录；preview/、wallpaper/、unlock/ 齐全 |
| 内部路径 | 全部正斜杠 /，无多余一级文件夹 |
| description.xml | UTF-8 无 BOM；title-cn = 深海女仆 · 大肥鱼；screen = FHD；version = 11.1.0 |
| 锁屏 | unlock/theme.xml 使用 \`<item style="slide"/>\`，静态滑动解锁，系统时钟 |

## 三、图片参数

| 用途 | 尺寸 | 编码 | 色度采样 | 大小 |
|---|---|---|---|---|
${imgRows}

全部为 sRGB、无 alpha、baseline JPEG，单张小于 1MB。

## 四、校验明细

| 结果 | 检查项 | 实测 |
|---|---|---|
${rows}

## 五、兼容性

- 目标机：**荣耀 X10**，1080×2400，升降前摄无挖孔，侧边指纹。
- 锁屏为系统滑动解锁 + 系统时钟，不含自定义时钟/图标，这是 HarmonyOS 2/3 上最稳的锁屏方案。
- 本地无法真机验证 HarmonyOS 主题引擎；如果主题 App 不识别这个 HWT，用同目录的两张 JPG 在图库直接设置即可，图库方案不依赖主题引擎。
- 原图为 1080 级素材，角色在 1080×2400 下清晰；没有做 1440 宽放大版。

## 六、安装步骤

1. 把 \`fatfish-maid-honor-x10.hwt\` 复制到 **内部存储/Huawei/Themes/**（没有 Themes 就新建）。
2. 设置 → 应用和服务 → 应用管理 → 主题 → 存储 → **清除缓存**；必要时点一次「强行停止」。
3. 打开「主题」→ 我的 → 我的主题，找到 **「深海女仆 · 大肥鱼」**，应用。
4. 只想用一部分：在「混搭 / DIY」里单独选锁屏和桌面壁纸。
5. 如果主题 App 不显示：用图库直接设置
   - \`lock-wallpaper-1080x2400.jpg\`
   - \`home-wallpaper-1080x2400.jpg\`

## 七、文件清单

\`\`\`
output/fatfish-maid-honor-x10.hwt          主题包
output/fatfish-maid-honor-x10-phone.zip    发手机用（推荐）
output/jpg/                                1080×2400 JPG 壁纸/预览
手机安装包/                                  HWT + JPG + 安装说明 + 校验报告
preview.html                               双机位预览页
\`\`\`

## 八、说明

- 角色素材来自你提供的图片，个人自用；原图带作者水印，请勿二次分发或上架主题商店。
- 壁纸文件不含预览里的时钟、通知、图标。
- 主题包是静态滑动锁屏；如果后续想要视频锁屏/动态锁屏，需要按你的实际 HarmonyOS 版本再做一版并真机测试。
`;

fs.writeFileSync(path.join(root, '验收报告.md'), report, 'utf8');
console.log(JSON.stringify({ zipKb, zipHash, hwtKb, passCount, failCount }, null, 2));
