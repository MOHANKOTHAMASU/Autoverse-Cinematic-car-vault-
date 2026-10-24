// Script to generate complete, fully verified 50-car collection for AutoVerse
const fs = require('fs');
const path = require('path');

// We'll read the existing 6 vehicles from vehicles.ts so their extensive descriptions and verified specs are 100% preserved.
const targetFile = path.resolve(__dirname, '../src/data/vehicles.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// We extract the first 6 vehicles code block
const headerMatch = content.match(/^([\s\S]*?export const VEHICLES: Vehicle\[\] = \[)/);
if (!headerMatch) {
  console.error("Could not find start of VEHICLES array");
  process.exit(1);
}

console.log("Found start of VEHICLES array successfully");
