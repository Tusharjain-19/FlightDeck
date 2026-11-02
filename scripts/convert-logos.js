const fs = require('fs');
const path = require('path');

const dir = 'd:/flighter tracker/public/airlines';

// 1. Star Air (S5.png is 260x66 RGBA transparent)
if (fs.existsSync(path.join(dir, 'S5.png'))) {
  const b64 = fs.readFileSync(path.join(dir, 'S5.png')).toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 66" width="260" height="66">
  <image width="260" height="66" href="data:image/png;base64,${b64}" />
</svg>`;
  fs.writeFileSync(path.join(dir, 'S5.svg'), svg);
  console.log('Created S5.svg');
}

// 2. Alliance Air (9I.png is 638x156 RGBA transparent)
if (fs.existsSync(path.join(dir, '9I.png'))) {
  const b64 = fs.readFileSync(path.join(dir, '9I.png')).toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 638 156" width="638" height="156">
  <image width="638" height="156" href="data:image/png;base64,${b64}" />
</svg>`;
  fs.writeFileSync(path.join(dir, '9I.svg'), svg);
  console.log('Created 9I.svg');
}

console.log('Logos wrapped successfully');
