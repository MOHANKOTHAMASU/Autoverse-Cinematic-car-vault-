const fs = require('fs');
const path = require('path');

const vehiclesPath = path.join(__dirname, '..', 'data', 'vehicles.ts');
let content = fs.readFileSync(vehiclesPath, 'utf8');

// Parse by vehicle blocks
// Each block starts with "// [number]." or starts with an object inside VEHICLES = [
// We can split by the `id:` property
const vehicleRegex = /\{\s*id:\s*['"]([a-z0-9\-]+)['"][\s\S]*?(?=\{\s*id:|$)/g;

let matches = 0;
content = content.replace(vehicleRegex, (block, id) => {
  matches++;
  
  // Extract thumbnail
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

  // Replace existing imageGallery in this block
  const updatedBlock = block.replace(/imageGallery:\s*\[[\s\S]*?\]/, newGallery);
  return updatedBlock;
});

console.log(`Processed ${matches} vehicle blocks.`);
fs.writeFileSync(vehiclesPath, content, 'utf8');
console.log('Successfully updated all 50 vehicle image galleries with unique angles and views!');
