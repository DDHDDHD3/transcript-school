const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const LOGO_PATH = path.resolve(PROJECT_ROOT, 'public/logo.jpg');
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, 'public');
const ICONS_DIR = path.resolve(PUBLIC_DIR, 'icons');

async function generateIcons() {
  try {
    // Ensure directories exist
    if (!fs.existsSync(ICONS_DIR)) {
      console.log('Creating icons directory:', ICONS_DIR);
      fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    console.log('Reading logo from:', LOGO_PATH);
    if (!fs.existsSync(LOGO_PATH)) {
      throw new Error(`Logo file not found at ${LOGO_PATH}`);
    }

    // Try reading as a buffer
    const buffer = fs.readFileSync(LOGO_PATH);
    const image = await Jimp.read(buffer);

    const icons = [
      { size: 192, filename: 'icons/icon-192.png' },
      { size: 512, filename: 'icons/icon-512.png' },
      { size: 180, filename: 'apple-touch-icon.png' },
      { size: 32, filename: 'favicon.png' },
    ];

    for (const icon of icons) {
      const outputPath = path.resolve(PUBLIC_DIR, icon.filename);
      console.log(`Generating ${icon.size}x${icon.size} icon to: ${outputPath}`);
      
      const resized = image.clone().resize({ w: icon.size, h: icon.size });
      await resized.write(outputPath);
    }

    console.log('\nSuccessfully generated all icons!');
    console.log('- public/icons/icon-192.png');
    console.log('- public/icons/icon-512.png');
    console.log('- public/apple-touch-icon.png');
    console.log('- public/favicon.png');
  } catch (error) {
    console.error('Error generating icons:', error.message || error);
    process.exit(1);
  }
}

generateIcons();
