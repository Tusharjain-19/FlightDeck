const fs = require('fs');

async function run() {
  // 1. Fetch fly91 website logo
  try {
    const res = await fetch('https://fly91.in/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const matches = text.match(/https?:\/\/[^"']+\.(?:svg|png)/gi) || [];
    console.log('fly91 assets found:', matches.filter(m => m.toLowerCase().includes('logo')));
    const logoUrl = matches.find(m => m.toLowerCase().includes('logo'));
    if (logoUrl) {
      const imgRes = await fetch(logoUrl);
      const buf = await imgRes.arrayBuffer();
      if (logoUrl.endsWith('.svg')) {
        fs.writeFileSync('d:/flighter tracker/public/airlines/IC.svg', Buffer.from(buf));
        console.log('Saved IC.svg directly from fly91.in');
      } else {
        fs.writeFileSync('d:/flighter tracker/public/airlines/IC.png', Buffer.from(buf));
      }
    }
  } catch(e) {
    console.log('fly91 error:', e.message);
  }

  // 2. Fetch indiaoneair website logo
  try {
    const res = await fetch('https://indiaoneair.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const matches = text.match(/https?:\/\/[^"']+\.(?:svg|png)/gi) || [];
    console.log('indiaoneair assets found:', matches.filter(m => m.toLowerCase().includes('logo')));
    const logoUrl = matches.find(m => m.toLowerCase().includes('logo'));
    if (logoUrl) {
      const imgRes = await fetch(logoUrl);
      const buf = await imgRes.arrayBuffer();
      if (logoUrl.endsWith('.svg')) {
        fs.writeFileSync('d:/flighter tracker/public/airlines/I1.svg', Buffer.from(buf));
        console.log('Saved I1.svg directly from indiaoneair.com');
      } else {
        fs.writeFileSync('d:/flighter tracker/public/airlines/I1.png', Buffer.from(buf));
      }
    }
  } catch(e) {
    console.log('indiaoneair error:', e.message);
  }
}

run();
