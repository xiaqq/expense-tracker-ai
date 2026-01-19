#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SPLASH_DIR = path.join(__dirname, '../public/splash');
const SOURCE_ICON = path.join(ICONS_DIR, 'icon-512.png');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });

// Icon sizes needed
const iconSizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

// Apple touch icon sizes
const appleIconSizes = [152, 167, 180];

// Splash screen sizes for various iPhone models
const splashScreens = [
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },    // iPhone SE, 6s, 7, 8
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },  // iPhone 6+, 7+, 8+
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },  // iPhone X, Xs, 11 Pro
  { width: 828, height: 1792, name: 'apple-splash-828-1792' },    // iPhone Xr, 11
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },  // iPhone Xs Max, 11 Pro Max
  { width: 1080, height: 2340, name: 'apple-splash-1080-2340' },  // iPhone 12 mini, 13 mini
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' },  // iPhone 12, 13, 14
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' },  // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556' },  // iPhone 14 Pro, 15, 15 Pro
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796' },  // iPhone 14 Pro Max, 15 Plus, 15 Pro Max
];

const THEME_COLOR = '#4f46e5';
const BG_COLOR = '#ffffff';

async function generateIcons() {
  console.log('Generating icons...');

  // Skip if source doesn't exist
  if (!fs.existsSync(SOURCE_ICON)) {
    console.log(`Source icon not found at ${SOURCE_ICON}, creating placeholder...`);
    await createPlaceholderIcon(512, SOURCE_ICON);
  }

  // Read source into buffer to avoid same-file conflict
  const sourceBuffer = await sharp(SOURCE_ICON).toBuffer();

  for (const size of iconSizes) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);

    await sharp(sourceBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}.png`);
  }

  // Create maskable icons (with padding for safe zone)
  for (const size of [192, 512]) {
    const outputPath = path.join(ICONS_DIR, `maskable-icon-${size}.png`);
    const iconSize = Math.floor(size * 0.8); // 80% of total size for safe zone
    const padding = Math.floor((size - iconSize) / 2);

    await sharp(sourceBuffer)
      .resize(iconSize, iconSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: THEME_COLOR
      })
      .png()
      .toFile(outputPath);

    console.log(`  Created: maskable-icon-${size}.png`);
  }

  // Create Apple touch icons
  for (const size of appleIconSizes) {
    const outputPath = path.join(ICONS_DIR, `apple-touch-icon-${size}.png`);

    await sharp(sourceBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: apple-touch-icon-${size}.png`);
  }
}

async function createPlaceholderIcon(size, outputPath) {
  // Create a simple placeholder icon with the app initial
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${THEME_COLOR}"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.5}"
            font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">E</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

async function generateSplashScreens() {
  console.log('\nGenerating splash screens...');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.log(`Source icon not found, creating placeholder first...`);
    await createPlaceholderIcon(512, SOURCE_ICON);
  }

  for (const screen of splashScreens) {
    const { width, height, name } = screen;
    const outputPath = path.join(SPLASH_DIR, `${name}.png`);

    // Icon size (centered, about 20% of the smaller dimension)
    const iconSize = Math.min(width, height) * 0.2;
    const iconX = Math.floor((width - iconSize) / 2);
    const iconY = Math.floor((height - iconSize) / 2) - Math.floor(height * 0.05); // Slightly above center

    // Create background with centered icon
    const icon = await sharp(SOURCE_ICON)
      .resize(Math.floor(iconSize), Math.floor(iconSize))
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BG_COLOR
      }
    })
    .composite([
      {
        input: icon,
        left: iconX,
        top: iconY
      }
    ])
    .png()
    .toFile(outputPath);

    console.log(`  Created: ${name}.png (${width}x${height})`);
  }
}

async function main() {
  console.log('PWA Asset Generator');
  console.log('===================\n');

  try {
    await generateIcons();
    await generateSplashScreens();

    console.log('\nAll assets generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Replace public/icons/icon-512.png with your actual app icon');
    console.log('2. Re-run this script to regenerate all sizes');
    console.log('3. Build and deploy your PWA');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main();
