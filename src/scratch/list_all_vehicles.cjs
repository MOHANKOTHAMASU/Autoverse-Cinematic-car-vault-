const fs = require('fs');

const content = fs.readFileSync('src/data/vehicles.ts', 'utf8');

const items = content.split(/id:\s*['"]([a-z0-9\-]+)['"]/);
const catalog = [];
for (let i = 1; i < items.length; i += 2) {
  const id = items[i];
  const block = items[i+1];
  const brandMatch = block.match(/brand:\s*['"]([^'"]+)['"]/);
  const modelMatch = block.match(/model:\s*['"]([^'"]+)['"]/);
  const thumbMatch = block.match(/thumbnail:\s*['"]([^'"]+)['"]/);
  const galleryMatch = block.match(/imageGallery:\s*\[([\s\S]*?)\]/);
  
  const brand = brandMatch ? brandMatch[1] : '';
  const model = modelMatch ? modelMatch[1] : '';
  const thumbnail = thumbMatch ? thumbMatch[1] : '';
  const gallery = galleryMatch ? [...galleryMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]) : [];
  
  catalog.push({ id, brand, model, thumbnail, gallery });
}

console.log('=== DUPLICATE THUMBNAIL CHECK ===');
const thumbMap = {};
catalog.forEach(c => {
  thumbMap[c.thumbnail] = thumbMap[c.thumbnail] || [];
  thumbMap[c.thumbnail].push(c.id);
});

let dupeThumbs = 0;
for (const [url, list] of Object.entries(thumbMap)) {
  if (list.length > 1) {
    dupeThumbs++;
    console.log(`Thumbnail shared by ${list.length} vehicles: ${list.join(', ')}`);
    console.log(`  URL: ${url}`);
  }
}
if (dupeThumbs === 0) console.log('All 50 vehicle thumbnails are 100% UNIQUE!');

console.log('\n=== DUPLICATE GALLERY IMAGE CHECK ===');
const galleryMap = {};
catalog.forEach(c => {
  c.gallery.forEach((url, pos) => {
    galleryMap[url] = galleryMap[url] || [];
    galleryMap[url].push(`${c.id}[${pos}]`);
  });
});

let dupeGalleries = 0;
for (const [url, list] of Object.entries(galleryMap)) {
  if (list.length > 1) {
    dupeGalleries++;
    console.log(`Gallery image shared by ${list.length} places: ${list.slice(0, 5).join(', ')}${list.length > 5 ? '... (' + (list.length - 5) + ' more)' : ''}`);
    console.log(`  URL: ${url}`);
  }
}
console.log(`Total duplicate gallery URLs: ${dupeGalleries}`);
