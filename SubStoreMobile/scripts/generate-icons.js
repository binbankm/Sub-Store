const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

console.log('🎨 Sub-Store Mobile 图标生成器');
console.log('================================\n');

console.log('方法一：使用 HTML 预览生成（推荐）');
console.log('----------------------------------');
console.log('1. 在浏览器中打开: scripts/create-icons.html');
console.log('2. 点击各个"下载"按钮');
console.log('3. 将下载的文件移动到 assets/ 目录\n');

console.log('方法二：使用在线工具');
console.log('----------------------------------');
console.log('1. 访问 https://appicon.co 或 https://makeappicon.com');
console.log('2. 上传 assets/icon.svg 文件');
console.log('3. 下载生成的图标包');
console.log('4. 复制到 assets/ 目录\n');

console.log('方法三：使用 Figma/Sketch');
console.log('----------------------------------');
console.log('1. 导入 icon.svg 文件');
console.log('2. 导出为各尺寸 PNG');
console.log('3. 保存到 assets/ 目录\n');

console.log('所需图标文件：');
console.log('- icon.png (1024x1024) - iOS 应用图标');
console.log('- adaptive-icon.png (1024x1024) - Android 自适应图标');
console.log('- splash.png (2048x2048) - 启动画面');
console.log('- favicon.png (48x48) - Web favicon\n');

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="200" fill="#6C63FF"/>
  <text x="512" y="600" font-family="Arial" font-size="500" font-weight="bold" fill="white" text-anchor="middle">S</text>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), placeholderSvg);
console.log('✅ 已生成 icon.svg 源文件\n');

console.log('💡 快速启动（使用默认图标）：');
console.log('   应用已经可以运行，Expo 会使用默认图标。');
console.log('   之后可以随时替换为自定义图标。\n');
