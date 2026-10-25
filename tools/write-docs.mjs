import fs from 'node:fs';
import path from 'node:path';

const root = 'D:/大肥鱼主题';
const out = path.join(root, 'output');
const phone = path.join(root, '手机安装包');
fs.mkdirSync(phone, { recursive: true });

const hwt = 'fatfish-maid-honor-x10.hwt';
const lockJpg = 'lock-wallpaper-1080x2400.jpg';
const homeJpg = 'home-wallpaper-1080x2400.jpg';

fs.copyFileSync(path.join(out, hwt), path.join(phone, hwt));
fs.copyFileSync(path.join(out, 'jpg', lockJpg), path.join(phone, lockJpg));
fs.copyFileSync(path.join(out, 'jpg', homeJpg), path.join(phone, homeJpg));

const guide = `深海女仆 · 大肥鱼
荣耀 X10 · HarmonyOS 2/3 · 1080 × 2400

包含文件
────────
1. ${hwt}
   静态滑动锁屏 + 桌面壁纸主题包
2. ${lockJpg}
   锁屏壁纸（不含时钟/通知）
3. ${homeJpg}
   桌面壁纸（不含图标）

安装 HWT
────────
1. 手机连电脑，把 ${hwt} 复制到：
   内部存储/Huawei/Themes/
   没有 Themes 文件夹就新建一个。
2. 设置 → 应用和服务 → 应用管理 → 主题 → 存储 → 清除缓存；
   必要时再点一次「强行停止」。
3. 打开「主题」→ 我的 → 我的主题（或「本地」），
   找到「深海女仆 · 大肥鱼」。
4. 应用；如果只想用一部分，在「混搭 / DIY」里单独选
   「锁屏」和「桌面壁纸」。

如果主题 App 不显示这个包
────────
直接用图库设置，最稳：
- 锁屏壁纸：${lockJpg}
- 桌面壁纸：${homeJpg}
路径：图库 → 图片 → 更多 → 设为壁纸；
或：设置 → 桌面和壁纸 → 壁纸 → 图库。

说明
────────
- 锁屏是静态滑动解锁，时钟/日期/通知由系统绘制，没有自定义时钟。
- 壁纸文件不含预览图里的时钟、通知、图标。
- 角色素材来自你提供的图片，个人自用；原图有水印/作者，
  请勿二次分发或上架主题商店。
- 本机无法真机验证 HarmonyOS 主题引擎；如果 HWT 不生效，
  图库壁纸方案一定可用。

主题包结构
────────
description.xml
preview/cover.jpg
preview/preview_unlock_0.jpg
preview/preview_home_0.jpg
preview/preview_wallpaper_0.jpg
wallpaper/unlock_wallpaper_0.jpg
wallpaper/home_wallpaper_0.jpg
unlock/theme.xml        (<item style="slide"/>)

设计参数
────────
分辨率：1080 × 2400
锁屏：委屈女仆 + 饭碗 + 蒸汽 + 舷窗
桌面：开心女仆 + 测试清单
配色：深海 #071026 / 鲸蓝 #2E4BC6 / DeepSeek 蓝 #4D6BFE /
      冷光青 #63E6FF / 奶白 #F6F1E7 / 樱粉 #FFB3C1
`;

fs.writeFileSync(path.join(phone, '安装说明.txt'), '\uFEFF' + guide, 'utf8');
fs.writeFileSync(path.join(root, '安装说明.md'), guide, 'utf8');

const readme = `# 深海女仆 · 大肥鱼

DeepSeek 女仆鱼娘主题，适配荣耀 X10（1080 × 2400，HarmonyOS 2/3）。

## 成品

- \`output/fatfish-maid-honor-x10.hwt\` — 静态滑动锁屏 + 桌面壁纸
- \`output/jpg/\` — 1080×2400 JPG 壁纸与预览
- \`手机安装包/\` — HWT + 两张壁纸 + 安装说明，直接拷到手机
- \`preview.html\` — 双机位预览页

## 设计

- 锁屏：委屈女仆跪坐、饭碗、蒸汽、深海军港舷窗；去掉原图的手、气泡、水印和梗文字。
- 桌面：开心女仆 + 饭碗 + 测试清单；图标为排版预览，壁纸本身不含 UI。
- 配色：深海 #071026 / 鲸蓝 #2E4BC6 / DeepSeek 蓝 #4D6BFE / 冷光青 #63E6FF / 奶白 #F6F1E7 / 樱粉 #FFB3C1。
- 机型安全区：荣耀 X10 无挖孔、侧边指纹；按 1080×2400 全屏构图。

## 素材处理

- 原图：用户提供的 3 张 webp（854×798 / 960×896 / 1005×670）。
- 使用本地背景去除模型抠出角色，保留饭碗/测试清单。
- 连通域清理掉指责的手、对话气泡、碎字和水印。
- 2px 腐蚀去白边 + 1px 羽化 + 边缘颜色去污。
- 桌面半身像左侧 120px 柔和淡出，底部裁切落到屏幕外。

## 技术

- 背景/排版：HTML + CSS，Chrome 无头渲染 1080×2400。
- 图片：sharp（JPG q94，4:4:4；单张 < 1MB）。
- 主题：HWT = ZIP，\`description.xml\` 在第一层；\`unlock/theme.xml\` 使用
  \`<item style="slide"/>\`，锁屏交给系统时钟。
- 兼容：静态滑动锁屏是最稳的方案；HarmonyOS 5 的包格式可能不同，先用图库壁纸兜底。

## 安装

见 \`安装说明.md\` 或 \`手机安装包/安装说明.txt\`。

## 版权

角色素材来自用户提供的图片，仅个人自用。原图带有作者水印，
请勿二次分发或上架主题商店。
`;

fs.writeFileSync(path.join(root, 'README.md'), readme, 'utf8');

console.log('docs + phone package written');
for (const f of fs.readdirSync(phone)) {
  const p = path.join(phone, f);
  console.log(' ', f, (fs.statSync(p).size / 1024).toFixed(0) + ' KB');
}
