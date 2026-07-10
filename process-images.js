const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\grd_a\\Downloads\\logo_nuevo.jpg.jpeg';
const outputDir = path.join(__dirname, 'public');

async function processImages() {
  try {
    // Save as main logo
    await sharp(inputPath)
      .toFile(path.join(outputDir, 'logo.jpeg'));

    // Save as 192x192 PNG for PWA
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat('png')
      .toFile(path.join(outputDir, 'icon-192x192.png'));

    // Save as 512x512 PNG for PWA
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat('png')
      .toFile(path.join(outputDir, 'icon-512x512.png'));

    console.log('Images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
  }
}

processImages();
