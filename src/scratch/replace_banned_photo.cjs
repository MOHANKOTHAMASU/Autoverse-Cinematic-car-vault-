const fs = require('fs');
const path = require('path');

const vehiclesPath = path.join(__dirname, '..', 'data', 'vehicles.ts');
let content = fs.readFileSync(vehiclesPath, 'utf8');

content = content.replace(/photo-1549399542-7e3f8b79c341/g, 'photo-1616422285623-13ff0162193c');

fs.writeFileSync(vehiclesPath, content, 'utf8');
console.log('Successfully eradicated photo-1549399542-7e3f8b79c341 and replaced with photo-1616422285623-13ff0162193c!');
