const fs = require('fs');
const path = require('path');

const vehiclesPath = path.join(__dirname, '..', 'data', 'vehicles.ts');
let content = fs.readFileSync(vehiclesPath, 'utf8');

const regex = /(id:\s*["']maruti-suzuki-fronx["'][\s\S]*?thumbnail:\s*["'])[^"']+(["'])/;
content = content.replace(regex, '$1https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80$2');

// Re-sync all 50 galleries
const vehicleRegex = /\{\s*id:\s*['"]([a-z0-9\-]+)['"][\s\S]*?(?=\{\s*id:|$)/g;
content = content.replace(vehicleRegex, (block, id) => {
  const thumbMatch = block.match(/thumbnail:\s*['"]([^'"]+)['"]/);
  if (!thumbMatch) return block;

  const thumb = thumbMatch[1];
  const baseThumbClean = thumb.split('?')[0];

  const url1 = thumb;
  const url2 = `${baseThumbClean}?auto=format&fit=crop&w=1400&q=85&view=profile&veh=${id}`;
  const url3 = `${baseThumbClean}?auto=format&fit=crop&w=1400&q=85&view=rear&veh=${id}`;
  const url4 = `${baseThumbClean}?auto=format&fit=crop&w=1400&q=85&view=interior&veh=${id}`;

  const newGallery = `imageGallery: [
      "${url1}",
      "${url2}",
      "${url3}",
      "${url4}",
    ]`;

  return block.replace(/imageGallery:\s*\[[\s\S]*?\]/, newGallery);
});

fs.writeFileSync(vehiclesPath, content, 'utf8');
console.log('Fronx thumbnail updated & galleries re-synced!');
