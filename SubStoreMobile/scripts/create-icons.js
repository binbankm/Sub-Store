const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <text x="512" y="620" font-family="Arial, Helvetica, sans-serif" font-size="500" font-weight="bold" fill="white" text-anchor="middle" opacity="0.95">S</text>
</svg>`;

const svgSplash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="2048" height="2048" fill="url(#bg)"/>
  <circle cx="1024" cy="850" r="200" fill="url(#iconBg)"/>
  <text x="1024" y="930" font-family="Arial, Helvetica, sans-serif" font-size="250" font-weight="bold" fill="white" text-anchor="middle">S</text>
  <text x="1024" y="1250" font-family="Arial, Helvetica, sans-serif" font-size="100" font-weight="600" fill="white" text-anchor="middle" opacity="0.9">Sub-Store</text>
  <text x="1024" y="1380" font-family="Arial, Helvetica, sans-serif" font-size="50" fill="white" text-anchor="middle" opacity="0.6">Advanced Subscription Manager</text>
</svg>`;

async function generateIcons() {
  console.log('🎨 正在生成 Sub-Store 图标...\n');

  try {
    const iconBuffer = Buffer.from(svgIcon);
    const splashBuffer = Buffer.from(svgSplash);

    await sharp(iconBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ 生成 icon.png (1024x1024)');

    await sharp(iconBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ 生成 adaptive-icon.png (1024x1024)');

    await sharp(iconBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ 生成 favicon.png (48x48)');

    await sharp(splashBuffer)
      .resize(2048, 2048)
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ 生成 splash.png (2048x2048)');

    console.log('\n🎉 所有图标生成完成！');
    console.log('📁 图标已保存到 assets/ 目录');
  } catch (error) {
    console.error('❌ 生成图标时出错:', error.message);
    process.exit(1);
  }
}

generateIcons();
