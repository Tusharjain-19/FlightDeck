const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = 'd:/flighter tracker/public/airlines';

async function processImageToTransparentPng(inputPath, outputPath, tolerance = 240) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  
  // Iterate over RGBA pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if pixel is white / near white
    if (r >= tolerance && g >= tolerance && b >= tolerance) {
      data[i + 3] = 0; // Transparent
    } else {
      // Soft feathering around edges
      const brightness = (r + g + b) / 3;
      if (brightness > 220) {
        const factor = (255 - brightness) / 35;
        data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)));
      }
    }
  }

  // Trim transparent boundaries and save as PNG
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(outputPath);
  
  console.log(`Saved transparent PNG: ${outputPath}`);
}

async function main() {
  // 1. Process IndiaOne Air
  const i1Jpg = path.join(dir, 'I1.jpg');
  const i1Png = path.join(dir, 'I1.png');
  if (fs.existsSync(i1Jpg)) {
    await processImageToTransparentPng(i1Jpg, i1Png, 235);
    const meta = await sharp(i1Png).metadata();
    const b64 = fs.readFileSync(i1Png).toString('base64');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="${meta.width}" height="${meta.height}">
  <image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${b64}" />
</svg>`;
    fs.writeFileSync(path.join(dir, 'I1.svg'), svg);
    console.log(`Created I1.svg (${meta.width}x${meta.height}) without background`);
  }

  // 2. Process Fly91
  const icJpg = path.join(dir, 'IC.jpg');
  const icPng = path.join(dir, 'IC.png');
  if (fs.existsSync(icJpg)) {
    await processImageToTransparentPng(icJpg, icPng, 230);
    const meta = await sharp(icPng).metadata();
    const b64 = fs.readFileSync(icPng).toString('base64');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="${meta.width}" height="${meta.height}">
  <image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${b64}" />
</svg>`;
    fs.writeFileSync(path.join(dir, 'IC.svg'), svg);
    console.log(`Created IC.svg (${meta.width}x${meta.height}) without background`);
  }

  // 3. Process Star Air user logo (S5_user.jpg if needed)
  const s5UserJpg = path.join(dir, 'S5_user.jpg');
  if (fs.existsSync(s5UserJpg)) {
    const s5UserPng = path.join(dir, 'S5_user.png');
    await processImageToTransparentPng(s5UserJpg, s5UserPng, 230);
    const meta = await sharp(s5UserPng).metadata();
    const b64 = fs.readFileSync(s5UserPng).toString('base64');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="${meta.width}" height="${meta.height}">
  <image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${b64}" />
</svg>`;
    // Also update S5.svg with high quality
    fs.writeFileSync(path.join(dir, 'S5.svg'), svg);
    console.log(`Created S5.svg from user Star Air reference (${meta.width}x${meta.height}) without background`);
  }
}

main().catch(console.error);
