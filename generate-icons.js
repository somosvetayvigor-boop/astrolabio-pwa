const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputPath = path.join(__dirname, 'public', 'logo.jpeg');
  
  if (!fs.existsSync(inputPath)) {
    console.error('Logo not found at', inputPath);
    return;
  }

  try {
    await sharp(inputPath).resize(192, 192).png().toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
    console.log('Generated icon-192x192.png');
    
    await sharp(inputPath).resize(512, 512).png().toFile(path.join(__dirname, 'public', 'icon-512x512.png'));
    console.log('Generated icon-512x512.png');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
