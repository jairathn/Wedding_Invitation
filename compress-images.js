#!/usr/bin/env node

/**
 * Image Compression Script
 *
 * Requirements: npm install sharp
 * Usage: node compress-images.js
 *
 * This will compress all JPG images in public/images/
 * and save them as optimized versions.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/images';
const quality = 70; // Adjust quality (1-100)

async function compressImages() {
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpg|jpeg)$/i.test(file))
    .filter(file => file !== 'castell-background.jpg'); // Skip background

  console.log(`Found ${files.length} images to compress...\n`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(inputDir, `compressed-${file}`);

    const stats = fs.statSync(inputPath);
    const originalSize = (stats.size / 1024 / 1024).toFixed(2);

    await sharp(inputPath)
      .jpeg({ quality, progressive: true })
      .resize(2000, null, { // Max width 2000px, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = (newStats.size / 1024 / 1024).toFixed(2);
    const savings = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);

    console.log(`✓ ${file}`);
    console.log(`  ${originalSize}MB → ${newSize}MB (${savings}% reduction)\n`);
  }

  console.log('Done! Review the compressed-* files, then:');
  console.log('1. Delete originals if satisfied');
  console.log('2. Rename compressed-*.jpg to remove "compressed-" prefix');
}

compressImages().catch(console.error);
