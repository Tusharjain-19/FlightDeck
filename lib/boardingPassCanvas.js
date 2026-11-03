/**
 * Generates an authentic, high-resolution (1200x630) Theme-Aware Boarding Pass photo card
 * with scannable QR Code for sharing on WhatsApp, Instagram, or downloading.
 * Supports official airline vector logos, clean departure-to-arrival curve, and Light/Dark themes.
 */
import { generateQRCodeMatrix } from './qrcode';

export async function generateBoardingPassImage({
  flightIata = '6E6114',
  airlineName = 'IndiGo',
  airlineLogoUrl = '',
  depIata = 'DEL',
  arrIata = 'BOM',
  depCity = 'Delhi NCR',
  arrCity = 'Mumbai',
  depPhotoUrl = '',
  arrPhotoUrl = '',
  depTime = '11:00 PM',
  arrTime = '01:25 AM',
  flightDate = 'Today',
  duration = '2h 25m',
  gate = 'Gate D4',
  terminal = 'Terminal 1',
  flightStatus = 'SCHEDULED',
  flightPhase = null,
  qrUrl = 'https://flightdeck.app',
  theme = 'light',
  download = true
}) {
  if (typeof window === 'undefined') return null;

  const isLight = theme === 'light';

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Determine flight phase & progress position for trajectory curve
  const statusUpper = (flightStatus || 'SCHEDULED').toUpperCase();
  const isStatusActive = statusUpper === 'ACTIVE' || statusUpper === 'EN-ROUTE';
  const isStatusLanded = statusUpper === 'LANDED' || statusUpper === 'ARRIVED';

  let progressT = 0.03;
  let phaseLabel = 'AT GATE • BOARDING';

  if (flightPhase?.t !== undefined) {
    progressT = flightPhase.t;
    phaseLabel = flightPhase.label;
  } else if (isStatusLanded) {
    progressT = 1.0;
    phaseLabel = 'TOUCHDOWN • ARRIVED';
  } else if (isStatusActive) {
    progressT = 0.52;
    phaseLabel = 'CRUISING • FL360';
  } else {
    // Scheduled
    progressT = 0.03;
    phaseLabel = 'AT GATE • BOARDING';
  }

  // 1. Canvas Outer Canvas Background (Theme-Adaptive)
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  if (isLight) {
    bgGrad.addColorStop(0, '#f1f5f9');
    bgGrad.addColorStop(0.5, '#e2e8f0');
    bgGrad.addColorStop(1, '#cbd5e1');
  } else {
    bgGrad.addColorStop(0, '#060913');
    bgGrad.addColorStop(0.5, '#0a1024');
    bgGrad.addColorStop(1, '#05070f');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Ambient Radial Sky Glow
  const ambientGlow = ctx.createRadialGradient(600, 280, 20, 600, 280, 520);
  if (isLight) {
    ambientGlow.addColorStop(0, 'rgba(2, 132, 199, 0.10)');
    ambientGlow.addColorStop(0.7, 'rgba(37, 99, 235, 0.03)');
    ambientGlow.addColorStop(1, 'transparent');
  } else {
    ambientGlow.addColorStop(0, 'rgba(14, 165, 233, 0.16)');
    ambientGlow.addColorStop(0.7, 'rgba(14, 165, 233, 0.03)');
    ambientGlow.addColorStop(1, 'transparent');
  }
  ctx.fillStyle = ambientGlow;
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Ticket Body Container
  const tX = 50;
  const tY = 50;
  const tW = 1100;
  const tH = 530;
  const r = 24;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(tX, tY, tW, tH, r);
  ctx.fillStyle = isLight ? '#ffffff' : 'rgba(11, 15, 28, 0.94)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.16)';
  ctx.stroke();

  // Subtle landmark background watermark (clean, no place text)
  const loadImage = (url) => new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

  try {
    const depImg = depPhotoUrl ? await loadImage(depPhotoUrl) : null;
    const arrImg = arrPhotoUrl ? await loadImage(arrPhotoUrl) : null;

    if (depImg || arrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tX, tY, tW, tH, r);
      ctx.clip();

      if (depImg) {
        ctx.globalAlpha = isLight ? 0.07 : 0.15;
        ctx.drawImage(depImg, tX, tY, tW * 0.55, tH);
      }
      if (arrImg) {
        ctx.globalAlpha = isLight ? 0.07 : 0.15;
        ctx.drawImage(arrImg, tX + tW * 0.45, tY, tW * 0.55, tH);
      }

      const scrim = ctx.createLinearGradient(tX, tY, tX + tW, tY);
      if (isLight) {
        scrim.addColorStop(0, 'rgba(255, 255, 255, 0.93)');
        scrim.addColorStop(0.5, 'rgba(255, 255, 255, 0.90)');
        scrim.addColorStop(1, 'rgba(255, 255, 255, 0.94)');
      } else {
        scrim.addColorStop(0, 'rgba(6, 9, 19, 0.88)');
        scrim.addColorStop(0.5, 'rgba(10, 16, 36, 0.84)');
        scrim.addColorStop(1, 'rgba(6, 9, 19, 0.92)');
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = scrim;
      ctx.fillRect(tX, tY, tW, tH);
      ctx.restore();
    }
  } catch (e) {
    // Continue
  }
  ctx.restore();

  // 3. Single Perforation Line between Main Ticket (width: 760) and Stub (width: 340)
  const pX = tX + 760;
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(pX, tY + 28);
  ctx.lineTo(pX, tY + tH - 28);
  ctx.stroke();
  ctx.restore();

  // Cutout Notches at Perforation Top & Bottom
  ctx.save();
  ctx.fillStyle = isLight ? '#e2e8f0' : '#060913';
  ctx.beginPath();
  ctx.arc(pX, tY, 15, 0, Math.PI * 2);
  ctx.arc(pX, tY + tH, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // ===================== LEFT MAIN TICKET BODY =====================
  ctx.save();

  // App Branding Header (Modern Monospace)
  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '800 13px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText('BOARDING PASS • DIGITAL FLIGHT RADAR', tX + 40, tY + 45);

  // Airline Real Logo (Rendered transparently without background box)
  let logoDrawn = false;
  if (airlineLogoUrl) {
    try {
      const logoImg = await loadImage(airlineLogoUrl);
      if (logoImg) {
        ctx.save();
        ctx.drawImage(logoImg, tX + 40, tY + 58, 120, 32);
        ctx.restore();
        logoDrawn = true;
      }
    } catch (e) {
      logoDrawn = false;
    }
  }

  const nameX = tX + 40;
  let codeBadgeX = nameX;

  if (logoDrawn) {
    codeBadgeX = tX + 40 + 120 + 16;
  } else {
    ctx.fillStyle = isLight ? '#020617' : '#ffffff';
    ctx.font = '900 26px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(airlineName, nameX, tY + 84);
    codeBadgeX = nameX + ctx.measureText(airlineName).width + 16;
  }

  // Flight Code Badge (Properly spaced, never overlapping)
  ctx.font = '900 15px "JetBrains Mono", "Courier New", monospace';
  const fBadgeW = ctx.measureText(flightIata).width + 24;
  ctx.fillStyle = isLight ? '#0284c7' : 'rgba(2, 132, 199, 0.45)';
  ctx.strokeStyle = isLight ? '#0369a1' : '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(codeBadgeX, tY + 62, fBadgeW, 28, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(flightIata, codeBadgeX + 12, tY + 82);

  // Flight Status Pill (Top Right of Main body)
  const statusX = pX - 160;
  ctx.fillStyle = isStatusActive 
    ? (isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.35)') 
    : (isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.35)');
  ctx.strokeStyle = isStatusActive ? '#16a34a' : (isLight ? '#0284c7' : '#38bdf8');
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(statusX, tY + 62, 120, 26, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isStatusActive 
    ? (isLight ? '#15803d' : '#34d399') 
    : (isLight ? '#0369a1' : '#ffffff');
  ctx.font = '900 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(flightStatus, statusX + 60, tY + 79);
  ctx.textAlign = 'left';

  // ===================== ROUTE CORRIDOR =====================
  // DEPARTURE HUB
  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillText('DEPARTURE', tX + 40, tY + 155);

  ctx.fillStyle = isLight ? '#020617' : '#ffffff';
  ctx.font = '950 72px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(depIata, tX + 40, tY + 224);

  ctx.fillStyle = isLight ? '#334155' : '#f8fafc';
  ctx.font = '800 20px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(depCity, tX + 40, tY + 258);

  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '900 24px "JetBrains Mono", monospace';
  ctx.fillText(depTime, tX + 40, tY + 294);

  // ARRIVAL HUB (Right side of left body)
  const arrX = pX - 40;
  ctx.textAlign = 'right';
  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillText('ARRIVAL', arrX, tY + 155);

  ctx.fillStyle = isLight ? '#020617' : '#ffffff';
  ctx.font = '950 72px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(arrIata, arrX, tY + 224);

  ctx.fillStyle = isLight ? '#334155' : '#f8fafc';
  ctx.font = '800 20px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(arrCity, arrX, tY + 258);

  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '900 24px "JetBrains Mono", monospace';
  ctx.fillText(arrTime, arrX, tY + 294);
  ctx.textAlign = 'left';

  // ===================== FLIGHT TRAJECTORY CURVE (DEPARTURE TO ARRIVAL) =====================
  const startCurveX = tX + 220;
  const endCurveX = pX - 220;
  const baseY = tY + 220;
  const peakHeight = 82;

  // Background Corridor Arc (Dashed Planned Route across entire corridor)
  ctx.beginPath();
  const numSteps = 80;
  for (let i = 0; i <= numSteps; i++) {
    const st = i / numSteps;
    const sx = startCurveX + (endCurveX - startCurveX) * st;
    const sy = baseY - peakHeight * Math.sin(Math.PI * st);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.stroke();

  // Completed Flight Route Arc (Solid Laser line up to aircraft current progress)
  if (progressT > 0.03) {
    ctx.beginPath();
    const activeSteps = Math.max(2, Math.floor(progressT * numSteps));
    for (let i = 0; i <= activeSteps; i++) {
      const st = (i / activeSteps) * progressT;
      const sx = startCurveX + (endCurveX - startCurveX) * st;
      const sy = baseY - peakHeight * Math.sin(Math.PI * st);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // Exact Plane Position along track sticking to its verified phase
  const clampedPlaneT = Math.max(0.02, Math.min(0.98, progressT));
  const planeX = startCurveX + (endCurveX - startCurveX) * clampedPlaneT;
  const planeY = baseY - peakHeight * Math.sin(Math.PI * clampedPlaneT);

  // Tangent angle
  const nextT = Math.min(1, clampedPlaneT + 0.02);
  const prevT = Math.max(0, clampedPlaneT - 0.02);
  const dx = (endCurveX - startCurveX) * (nextT - prevT);
  const dy = -peakHeight * (Math.sin(Math.PI * nextT) - Math.sin(Math.PI * prevT));
  const planeAngle = Math.atan2(dy, dx);

  // Draw Realistic Jet Airliner Vector sticking on track
  ctx.save();
  ctx.translate(planeX, planeY);
  ctx.rotate(planeAngle);

  // Radar beacon circle around aircraft
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.95)' : '#0284c7';
  ctx.fill();
  ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Modern Jet Silhouette
  ctx.fillStyle = isLight ? '#0284c7' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(9, 0); // Nose pointing forward along motion (+X)
  ctx.lineTo(2.5, -2.5);
  ctx.lineTo(-0.5, -9);
  ctx.lineTo(1.8, -9);
  ctx.lineTo(1.5, -2.5);
  ctx.lineTo(6, -2);
  ctx.lineTo(8.5, -5);
  ctx.lineTo(9.5, -5);
  ctx.lineTo(8.2, 0);
  ctx.lineTo(9.5, 5);
  ctx.lineTo(8.5, 5);
  ctx.lineTo(6, 2);
  ctx.lineTo(1.5, 2.5);
  ctx.lineTo(1.8, 9);
  ctx.lineTo(-0.5, 9);
  ctx.lineTo(2.5, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Telemetry Phase Badge under Airplane mentioning the exact stage
  const badgeText = `${phaseLabel} • ${duration}`;
  ctx.font = '800 11.5px "JetBrains Mono", monospace';
  const badgeW = ctx.measureText(badgeText).width + 24;
  const badgeX = (startCurveX + endCurveX) / 2;

  ctx.fillStyle = isLight ? '#f8fafc' : 'rgba(2, 132, 199, 0.4)';
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.roundRect(badgeX - badgeW / 2, tY + 188, badgeW, 26, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0284c7' : '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX, tY + 205);
  ctx.textAlign = 'left';

  // ===================== BOTTOM METADATA CHIPS =====================
  const metaY = tY + 390;
  ctx.strokeStyle = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tX + 40, metaY - 25);
  ctx.lineTo(pX - 40, metaY - 25);
  ctx.stroke();

  function drawMetaChip(x, label, val) {
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.fillText(label, x, metaY);
    ctx.fillStyle = isLight ? '#020617' : '#ffffff';
    ctx.font = '900 16px "Inter", -apple-system, sans-serif';
    ctx.fillText(val, x, metaY + 24);
  }

  drawMetaChip(tX + 40, 'DATE', flightDate);
  drawMetaChip(tX + 210, 'TERMINAL', terminal);
  drawMetaChip(tX + 370, 'GATE', gate);
  drawMetaChip(tX + 530, 'DURATION', duration);
  drawMetaChip(tX + 660, 'STATUS', flightStatus || 'NON-STOP');

  // ===================== RIGHT TEAR-OFF STUB =====================
  const sX = pX + 35;
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillText('FLIGHT STUB', sX, tY + 45);

  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '950 26px "JetBrains Mono", monospace';
  ctx.fillText(flightIata, sX, tY + 80);

  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(`${depIata} ➔ ${arrIata}`, sX, tY + 110);

  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.fillText('BOARDING TIME', sX, tY + 148);
  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.font = '900 20px "JetBrains Mono", monospace';
  ctx.fillText(depTime, sX, tY + 172);

  // SCANNABLE QR CODE ON STUB
  try {
    const qrMatrix = generateQRCodeMatrix(qrUrl);
    const qSize = qrMatrix.length;
    const qrPixelBox = 160;
    const moduleSize = qrPixelBox / (qSize + 2);
    const qOriginX = sX + 35;
    const qOriginY = tY + 230;

    // Solid backing card for instant smartphone camera scanning
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(qOriginX - 8, qOriginY - 8, qrPixelBox + 16, qrPixelBox + 16, 12);
    ctx.fill();
    ctx.stroke();

    // Draw high-contrast black modules
    ctx.fillStyle = '#020617';
    for (let row = 0; row < qSize; row++) {
      for (let col = 0; col < qSize; col++) {
        if (qrMatrix[row][col] === 1) {
          ctx.fillRect(
            qOriginX + (col + 1) * moduleSize,
            qOriginY + (row + 1) * moduleSize,
            moduleSize + 0.3,
            moduleSize + 0.3
          );
        }
      }
    }

    // QR Labels
    ctx.fillStyle = isLight ? '#334155' : '#e2e8f0';
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO TRACK ON RADAR', qOriginX + qrPixelBox / 2, qOriginY + qrPixelBox + 26);
    ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.fillText('VERIFIED ADS-B TELEMETRY', qOriginX + qrPixelBox / 2, qOriginY + qrPixelBox + 42);
    ctx.textAlign = 'left';
  } catch (err) {
    console.error('Failed to draw QR code on canvas:', err);
  }

  // Footer Branding on Canvas
  ctx.fillStyle = isLight ? '#64748b' : 'rgba(255, 255, 255, 0.45)';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FLIGHTDECK LIVE RADAR • VERIFIED ADS-B TELEMETRY', tX + tW / 2, tY + tH + 34);
  ctx.restore();

  // Convert canvas to data URL PNG and Blob for sharing
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const fileName = `FlightDeck_${flightIata}_BoardingPass.png`;
  let file = null;
  try {
    file = new File([blob], fileName, { type: 'image/png' });
  } catch (e) {
    // Older browsers fallback
  }

  if (download) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { dataUrl, blob, file, fileName };
}
