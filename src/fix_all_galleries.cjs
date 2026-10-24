const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'vehicles.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The palm tree image to eradicate completely:
const badImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

// We want each vehicle's imageGallery to contain:
// 1. Its distinct thumbnail (Front 3/4 Exterior)
// 2. Its distinct heroImage (High-resolution scenic/track view)
// 3. A dynamic side/rear profile view tailored to its category (SUV, Sedan, Electric, Coupe)
// 4. Its interiorImage (Luxury cockpit / dashboard)

// Let's replace each vehicle's imageGallery: [ badImage ] with rich multi-angle array
// Matching vehicle blocks:
const vehicleRegex = /id:\s*"([^"]+)"[\s\S]*?imageGallery:\s*\[[\s\S]*?\][\s\S]*?thumbnail:\s*"([^"]+)"[\s\S]*?heroImage:\s*"([^"]+)"[\s\S]*?interiorImage:\s*"([^"]+)"/g;

let replacements = 0;

content = content.replace(
  /imageGallery:\s*\[\s*"https:\/\/images\.unsplash\.com\/photo-1549399542-7e3f8b79c341\?auto=format&fit=crop&w=1200&q=80",?\s*\]/g,
  (match, offset) => {
    // Look ahead or behind to find thumbnail and interiorImage
    const sliceAfter = content.substring(offset, offset + 1500);
    const thumbMatch = sliceAfter.match(/thumbnail:\s*"([^"]+)"/);
    const heroMatch = sliceAfter.match(/heroImage:\s*"([^"]+)"/);
    const interiorMatch = sliceAfter.match(/interiorImage:\s*"([^"]+)"/);

    const thumb = thumbMatch ? thumbMatch[1] : '';
    const hero = heroMatch ? heroMatch[1] : '';
    const interior = interiorMatch ? interiorMatch[1] : 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80';

    replacements++;

    return `imageGallery: [
      "${thumb || hero}",
      "${hero || thumb}",
      "${interior}",
    ]`;
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully replaced ${replacements} instances of bad imageGallery arrays in vehicles.ts.`);
