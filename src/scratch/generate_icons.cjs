const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to write standard PNG from raw RGBA buffer
function createPng(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image scanlines with filter byte 0 (None) at start of each row
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    rawData[y * scanlineLength] = 0; // Filter byte: 0
    const rowOffset = y * scanlineLength + 1;
    const srcRowOffset = y * width * 4;
    rgbaBuffer.copy(rawData, rowOffset, srcRowOffset, srcRowOffset + width * 4);
  }

  // Deflate compressed IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

// Draw the AutoVerse automotive badge
function renderAutoVerseIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;

  // Background: Deep Automotive Dark Titanium (#05070a with radial glow)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = (x - cx) / (size / 2);
      const dy = (y - cy) / (size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 5;
      let g = 7;
      let b = 10;
      let a = 255;

      // Subtle cyan radial lighting in center
      if (dist < 1.0) {
        const glow = Math.max(0, 1 - dist);
        r = Math.min(255, Math.round(r + glow * 20));
        g = Math.min(255, Math.round(g + glow * 35));
        b = Math.min(255, Math.round(b + glow * 60));
      }

      // Rounded squircle border if not maskable
      if (!isMaskable) {
        const cornerDist = Math.pow(Math.abs(dx), 4) + Math.pow(Math.abs(dy), 4);
        if (cornerDist > 0.85) {
          // Antialiased edge
          const edgeAlpha = Math.max(0, Math.min(1, (1.0 - cornerDist) / 0.15));
          a = Math.round(edgeAlpha * 255);
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  // Draw stylized AutoVerse geometric chevron badge (V-shaped arrow / automotive grille crest)
  // Polygon 1: Outer cyan chevron
  const chevronW = isMaskable ? 140 * scale : 180 * scale;
  const chevronH = isMaskable ? 160 * scale : 200 * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      if (buf[idx + 3] === 0) continue;

      const relX = x - cx;
      const relY = y - cy + (15 * scale); // slightly lower

      // V-shape formula
      const slope = chevronH / chevronW;
      const expectedY1 = Math.abs(relX) * slope - (chevronH * 0.5);
      const expectedY2 = Math.abs(relX) * slope - (chevronH * 0.1);

      // Main Outer Arrow
      if (relY >= expectedY1 && relY <= expectedY2 && Math.abs(relX) <= chevronW) {
        // Gradient: Cyan (#00f0ff) at top to Electric Purple (#8b5cf6) at apex
        const t = (relY - expectedY1) / (expectedY2 - expectedY1);
        const cr = Math.round(0 + t * 139);
        const cg = Math.round(240 - t * 148);
        const cb = Math.round(255);

        buf[idx] = cr;
        buf[idx + 1] = cg;
        buf[idx + 2] = cb;
        buf[idx + 3] = 255;
      }

      // Secondary Upper Accent Wings
      const wingY1 = Math.abs(relX) * (slope * 0.85) - (chevronH * 0.85);
      const wingY2 = Math.abs(relX) * (slope * 0.85) - (chevronH * 0.65);
      if (relY >= wingY1 && relY <= wingY2 && Math.abs(relX) <= chevronW * 0.75) {
        buf[idx] = 0x38;
        buf[idx + 1] = 0xbd;
        buf[idx + 2] = 0xf8; // Sky blue
        buf[idx + 3] = 255;
      }
    }
  }

  return createPng(size, size, buf);
}

const outDir = path.join(__dirname, '..', '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), renderAutoVerseIcon(192, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), renderAutoVerseIcon(512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-192.png'), renderAutoVerseIcon(192, true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), renderAutoVerseIcon(512, true));
console.log('PWA icons successfully created in public/icons/');
