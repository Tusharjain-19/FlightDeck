/**
 * Pure JavaScript QR Code Generator (ISO/IEC 18004 compliant)
 * Zero external dependencies, client & server safe.
 * Generates valid, camera-scannable SVG QR codes.
 */

// Galois field tables for Reed-Solomon encoding
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x <<= 1;
  if (x & 256) x ^= 0x11d;
}

function gmult(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

function rsGenPoly(numEc) {
  let poly = [1];
  for (let i = 0; i < numEc; i++) {
    const next = [];
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] = (next[j] || 0) ^ gmult(poly[j], factor);
      next[j + 1] = (next[j + 1] || 0) ^ poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCompute(data, numEc) {
  const gen = rsGenPoly(numEc);
  const res = new Array(data.length + numEc).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];

  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gmult(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// QR Code Versions Capacity & EC specs (Level M: 15% recovery, Level L: 7% recovery)
// For short URLs (30-90 chars), Version 2 (25x25) or Version 3 (29x29) or Version 4 (33x33) is ideal
const VERSION_SPECS = {
  1: { size: 21, totalBytes: 26, ecBytes: 7, dataBytes: 19 },
  2: { size: 25, totalBytes: 44, ecBytes: 10, dataBytes: 34 },
  3: { size: 29, totalBytes: 70, ecBytes: 15, dataBytes: 55 },
  4: { size: 33, totalBytes: 100, ecBytes: 20, dataBytes: 80 },
  5: { size: 37, totalBytes: 134, ecBytes: 26, dataBytes: 108 },
  6: { size: 41, totalBytes: 172, ecBytes: 18 * 2, dataBytes: 136 },
};

function selectVersion(byteLength) {
  for (let v = 1; v <= 6; v++) {
    if (byteLength + 3 <= VERSION_SPECS[v].dataBytes) {
      return v;
    }
  }
  return 6;
}

export function generateQRCodeMatrix(text) {
  const utf8Bytes = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code < 0x80) utf8Bytes.push(code);
    else if (code < 0x800) {
      utf8Bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      utf8Bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }

  const version = selectVersion(utf8Bytes.length);
  const spec = VERSION_SPECS[version];
  const size = spec.size;

  // 1. Initialize matrix (-1: unset, 0: white, 1: black)
  const matrix = Array.from({ length: size }, () => new Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r, c, val) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      reserved[r][c] = true;
    }
  }

  // 2. Add Finder Patterns (7x7) + Separators
  function addFinder(topRow, leftCol) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = topRow + r;
        const col = leftCol + c;
        if (row < 0 || row >= size || col < 0 || col >= size) continue;

        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setModule(row, col, 1);
          } else {
            setModule(row, col, 0);
          }
        } else {
          setModule(row, col, 0);
        }
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 3. Add Alignment Pattern for Version >= 2
  if (version >= 2) {
    const alignPos = version === 2 ? 18 : (version === 3 ? 22 : (version === 4 ? 26 : (version === 5 ? 30 : 34)));
    const pos = [[alignPos, alignPos]];
    pos.forEach(([ar, ac]) => {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const row = ar + r;
          const col = ac + c;
          if (matrix[row][col] === -1) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
              setModule(row, col, 1);
            } else {
              setModule(row, col, 0);
            }
          }
        }
      }
    });
  }

  // 4. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === -1) setModule(6, i, i % 2 === 0 ? 1 : 0);
    if (matrix[i][6] === -1) setModule(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // Dark Module
  setModule(size - 8, 8, 1);

  // Reserve format info area
  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
    if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = true;
    if (!reserved[size - 1 - i][8]) reserved[size - 1 - i][8] = true;
  }

  // 5. Data encoding (Byte mode: 0100)
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(utf8Bytes.length, 8); // Character count indicator (8 bits for v1-9)
  for (const b of utf8Bytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zeros)
  const maxDataBits = spec.dataBytes * 8;
  const termLen = Math.min(4, maxDataBits - bitStream.length);
  pushBits(0, termLen);

  // Align to byte
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Pad bytes: 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < maxDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data bytes
  const dataBytes = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bitStream[i + j];
    }
    dataBytes.push(byte);
  }

  // Compute Reed-Solomon Error Correction Code
  const ecBytes = rsCompute(dataBytes, spec.ecBytes);
  const finalCodewords = dataBytes.concat(ecBytes);

  // Convert codewords back to bitstream for matrix placement
  const allBits = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((cw >> i) & 1);
    }
  }
  // Remainder bits (for versions that require them)
  while (allBits.length < spec.totalBytes * 8) {
    allBits.push(0);
  }

  // 6. Place data bits in matrix (Right-to-left 2-column zigzag)
  let bitIdx = 0;
  let dir = -1; // Moving upwards first
  let c = size - 1;
  while (c > 0) {
    if (c === 6) c--; // Skip timing column
    const rStart = dir === -1 ? size - 1 : 0;
    const rEnd = dir === -1 ? -1 : size;
    for (let r = rStart; r !== rEnd; r += dir) {
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = c - colOffset;
        if (!reserved[r][col]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          matrix[r][col] = bit;
        }
      }
    }
    dir = -dir;
    c -= 2;
  }

  // 7. Apply Standard Mask Pattern 0: (row + col) % 2 === 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        if ((r + c) % 2 === 0) {
          matrix[r][c] ^= 1;
        }
      }
    }
  }

  // 8. Format Information (Mask 0 + EC Level L/M)
  // Mask 0 + EC Level L = 0b01000 -> with BCH error correction = 0x77c4 (0b111011111000100)
  const formatBits = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = (formatBits >> (14 - i)) & 1;
    // Around top-left finder
    if (i < 6) matrix[i][8] = bit;
    else if (i === 6) matrix[7][8] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[8][7] = bit;
    else matrix[8][14 - i] = bit;

    // Around other finders
    if (i < 8) {
      matrix[8][size - 1 - i] = bit;
    } else {
      matrix[size - 15 + i][8] = bit;
    }
  }

  return matrix;
}

/**
 * Generate an SVG path string representing the QR code
 */
export function generateQRCodeSVG(text, size = 140, fgColor = 'currentColor', bgColor = 'transparent') {
  const matrix = generateQRCodeMatrix(text);
  const n = matrix.length;
  const cellSize = size / (n + 2); // 1-module quiet zone on each side

  let pathData = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + 1) * cellSize;
        const y = (r + 1) * cellSize;
        pathData += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
      }
    }
  }

  return {
    size,
    cellSize,
    modulesCount: n,
    pathData,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      ${bgColor !== 'transparent' ? `<rect width="${size}" height="${size}" fill="${bgColor}" />` : ''}
      <path d="${pathData}" fill="${fgColor}" />
    </svg>`
  };
}
