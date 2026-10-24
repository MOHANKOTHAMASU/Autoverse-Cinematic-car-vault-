const fs = require('fs');
const path = require('path');

const vehiclesPath = path.join(__dirname, '..', 'data', 'vehicles.ts');
let content = fs.readFileSync(vehiclesPath, 'utf8');

const finalFixes = {
  'honda-elevate': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=80',
  'kia-seltos': 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&w=1200&q=80',
  'mahindra-xuv700': 'https://images.unsplash.com/photo-1522037576655-7a93ce0f4d10?auto=format&fit=crop&w=1200&q=80',
  'byd-atto-3': 'https://images.unsplash.com/photo-1534093607318-f025413f49cb?auto=format&fit=crop&w=1200&q=80',
  'mg-windsor-ev': 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&w=1200&q=80',
  'land-rover-defender-110': 'https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?auto=format&fit=crop&w=1200&q=80',
  'mg-zs-ev': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
  'mercedes-benz-eqs': 'https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&w=1200&q=80'
};

for (const [id, newThumb] of Object.entries(finalFixes)) {
  const regex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?thumbnail:\\s*["'])[^"']+(["'])`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1${newThumb}$2`);
    console.log(`Updated thumbnail for ${id}`);
  }
}

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
console.log('Final pass complete!');
