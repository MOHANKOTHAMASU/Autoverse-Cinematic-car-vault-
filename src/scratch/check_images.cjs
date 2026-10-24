const fs = require('fs');
const content = fs.readFileSync('src/data/vehicles.ts', 'utf8');

// Parse all vehicles using regex
const regex = /\{\s*id:\s*'([^']+)'[\s\S]*?brand:\s*'([^']+)'[\s\S]*?model:\s*'([^']+)'[\s\S]*?thumbnail:\s*'([^']+)'/g;

const vehicles = [];
let match;
while ((match = regex.exec(content)) !== null) {
  vehicles.push({
    id: match[1],
    brand: match[2],
    model: match[3],
    thumbnail: match[4]
  });
}

console.log('Vehicles parsed:', vehicles.length);

const thumbnailCounts = {};
vehicles.forEach(v => {
  thumbnailCounts[v.thumbnail] = thumbnailCounts[v.thumbnail] || [];
  thumbnailCounts[v.thumbnail].push(v);
});

const duplicateThumbnails = Object.entries(thumbnailCounts).filter(([url, list]) => list.length > 1);
console.log('Duplicate thumbnail URLs found:', duplicateThumbnails.length);

duplicateThumbnails.forEach(([url, list]) => {
  console.log(`\nDuplicate Thumbnail (${list.length} vehicles share this URL):`);
  console.log(`URL: ${url}`);
  list.forEach(v => console.log(`   - [${v.id}] ${v.brand} ${v.model}`));
});

// Also check all imageGallery URLs across all vehicles
const galleryUrlMap = {};
const galleryMatches = [...content.matchAll(/imageGallery:\s*\[([\s\S]*?)\]/g)];
console.log('\nGalleries found:', galleryMatches.length);

galleryMatches.forEach((gm, idx) => {
  const veh = vehicles[idx] || { id: `index-${idx}` };
  const urls = [...gm[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map(m => m[1] || m[2]);
  urls.forEach(url => {
    galleryUrlMap[url] = galleryUrlMap[url] || [];
    galleryUrlMap[url].push(veh.id);
  });
});

const duplicateGalleryUrls = Object.entries(galleryUrlMap).filter(([url, list]) => list.length > 1);
console.log('Duplicate gallery image URLs shared across multiple vehicles:', duplicateGalleryUrls.length);
duplicateGalleryUrls.forEach(([url, list]) => {
  console.log(`URL shared by ${list.length} vehicles: ${url}`);
  console.log(`  Vehicles: ${list.join(', ')}`);
});
