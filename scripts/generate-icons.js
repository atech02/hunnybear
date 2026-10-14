import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Helper to encode RGBA buffer to valid PNG
function encodePNG(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: 0
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0; // Filter type 0 (None)
    const srcOffset = y * width * 4;
    rgbaBuffer.copy(rawData, rawOffset + 1, srcOffset, srcOffset + width * 4);
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(12 + length);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw a cute teddy bear icon into an RGBA buffer
function renderBearIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;

  // Colors
  const bg = [254, 243, 199, 255]; // Amber 100
  const bgRing = [245, 158, 11, 255]; // Amber 500
  const fur = [217, 119, 6, 255]; // Amber 600
  const furLight = [251, 191, 36, 255]; // Amber 400
  const muzzleCol = [254, 215, 170, 255]; // Peach / light muzzle
  const darkCol = [69, 26, 3, 255]; // Dark brown
  const blushCol = [251, 113, 133, 180]; // Rose blush

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full square background with soft border
        buf[idx] = bg[0];
        buf[idx + 1] = bg[1];
        buf[idx + 2] = bg[2];
        buf[idx + 3] = 255;
      } else {
        // Rounded badge / circular background
        const radius = size * 0.47;
        if (dist <= radius) {
          if (dist >= radius - 8 * scale) {
            buf[idx] = bgRing[0];
            buf[idx + 1] = bgRing[1];
            buf[idx + 2] = bgRing[2];
            buf[idx + 3] = 255;
          } else {
            buf[idx] = bg[0];
            buf[idx + 1] = bg[1];
            buf[idx + 2] = bg[2];
            buf[idx + 3] = 255;
          }
        }
      }
    }
  }

  // Draw circle helper
  function drawCircle(centerX, centerY, radius, color) {
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(size - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(size - 1, Math.ceil(centerY + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= radius) {
          const idx = (y * size + x) * 4;
          const alpha = color[3] / 255;
          if (alpha >= 1) {
            buf[idx] = color[0];
            buf[idx + 1] = color[1];
            buf[idx + 2] = color[2];
            buf[idx + 3] = 255;
          } else {
            // Simple alpha blend
            buf[idx] = Math.round(color[0] * alpha + buf[idx] * (1 - alpha));
            buf[idx + 1] = Math.round(color[1] * alpha + buf[idx + 1] * (1 - alpha));
            buf[idx + 2] = Math.round(color[2] * alpha + buf[idx + 2] * (1 - alpha));
            buf[idx + 3] = 255;
          }
        }
      }
    }
  }

  // Bear elements
  const headY = cy + 10 * scale;
  const earOffsetY = headY - 110 * scale;
  const earOffsetX = 120 * scale;
  const earRadius = 60 * scale;
  const innerEarRadius = 38 * scale;

  // Left & Right Outer Ears
  drawCircle(cx - earOffsetX, earOffsetY, earRadius, fur);
  drawCircle(cx + earOffsetX, earOffsetY, earRadius, fur);

  // Left & Right Inner Ears
  drawCircle(cx - earOffsetX, earOffsetY, innerEarRadius, furLight);
  drawCircle(cx + earOffsetX, earOffsetY, innerEarRadius, furLight);

  // Head
  drawCircle(cx, headY, 135 * scale, fur);

  // Muzzle
  drawCircle(cx, headY + 35 * scale, 70 * scale, muzzleCol);

  // Nose (dark oval approx by small circle)
  drawCircle(cx, headY + 15 * scale, 22 * scale, darkCol);

  // Cheeks / Blush
  drawCircle(cx - 75 * scale, headY + 40 * scale, 24 * scale, blushCol);
  drawCircle(cx + 75 * scale, headY + 40 * scale, 24 * scale, blushCol);

  // Eyes
  drawCircle(cx - 45 * scale, headY - 15 * scale, 16 * scale, darkCol);
  drawCircle(cx + 45 * scale, headY - 15 * scale, 16 * scale, darkCol);

  // Eye highlights (sparkle white)
  const eyeWhite = [255, 255, 255, 255];
  drawCircle(cx - 40 * scale, headY - 20 * scale, 5 * scale, eyeWhite);
  drawCircle(cx + 50 * scale, headY - 20 * scale, 5 * scale, eyeWhite);

  return buf;
}

// Generate files
const publicIconsDir = path.resolve('public', 'icons');
fs.mkdirSync(publicIconsDir, { recursive: true });

// 192x192
const buf192 = renderBearIcon(192, false);
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), encodePNG(192, 192, buf192));
console.log('Generated icon-192.png');

// 512x512
const buf512 = renderBearIcon(512, false);
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), encodePNG(512, 512, buf512));
console.log('Generated icon-512.png');

// 512x512 Maskable
const bufMaskable = renderBearIcon(512, true);
fs.writeFileSync(path.join(publicIconsDir, 'icon-maskable-512.png'), encodePNG(512, 512, bufMaskable));
console.log('Generated icon-maskable-512.png');

// Also write favicon.svg
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
  <!-- Ears -->
  <circle cx="28" cy="28" r="14" fill="#d97706"/>
  <circle cx="28" cy="28" r="8" fill="#fbbf24"/>
  <circle cx="72" cy="28" r="14" fill="#d97706"/>
  <circle cx="72" cy="28" r="8" fill="#fbbf24"/>
  <!-- Head -->
  <circle cx="50" cy="54" r="32" fill="#d97706"/>
  <!-- Muzzle -->
  <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fed7aa"/>
  <!-- Nose -->
  <ellipse cx="50" cy="58" rx="6" ry="4" fill="#451a03"/>
  <path d="M50 62 L50 67 M45 66 Q50 71 55 66" stroke="#451a03" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <circle cx="39" cy="48" r="4" fill="#451a03"/>
  <circle cx="40.5" cy="46.5" r="1.5" fill="#ffffff"/>
  <circle cx="61" cy="48" r="4" fill="#451a03"/>
  <circle cx="62.5" cy="46.5" r="1.5" fill="#ffffff"/>
  <!-- Blush -->
  <circle cx="32" cy="60" r="5" fill="#fb7185" opacity="0.6"/>
  <circle cx="68" cy="60" r="5" fill="#fb7185" opacity="0.6"/>
</svg>`;

fs.writeFileSync(path.resolve('public', 'favicon.svg'), svgFavicon);
console.log('Generated favicon.svg');
