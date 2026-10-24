const fs = require('fs');
const content = fs.readFileSync('src/data/vehicles.ts', 'utf8');

// Match vehicles and their fields
const vehicleMatches = [...content.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?brand:\s*'([^']+)'[\s\S]*?model:\s*'([^']+)'[\s\S]*?thumbnail:\s*'([^']+)'[\s\S]*?imageGallery:\s*\[([\s\S]*?)\]/g)];

console.log('Total vehicles matched:', vehicleMatches.length);

const catalog = vehicleMatches.map((m, idx) => {
  const id = m[1];
  const brand = m[2];
  const model = m[3];
  const thumbnail = m[4];
  const gallery = [...m[5].matchAll(/'([^']+)'|"([^"]+)"/g)].map(g => g[1] || g[2]);
  return { idx: idx + 1, id, brand, model, thumbnail, gallery };
});

catalog.forEach(c => {
  console.log(`${String(c.idx).padStart(2, '0')}. [${c.id}] ${c.brand} ${c.model}`);
  console.log(`    Thumbnail: ${c.thumbnail.slice(0, 75)}...`);
  console.log(`    Gallery (${c.gallery.length} items):`);
  c.gallery.forEach(g => console.log(`      - ${g.slice(0, 70)}...`));
});
