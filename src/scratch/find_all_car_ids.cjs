const fs = require('fs');

const content = fs.readFileSync('src/data/vehicles.ts', 'utf8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, lineNum) => {
  const match = line.match(/^\s*id:\s*['"]([a-z0-9\-]+)['"]/);
  if (match) {
    results.push({ lineNum: lineNum + 1, id: match[1], line: line.trim() });
  }
});

console.log('Total vehicles found with line numbers:', results.length);
results.forEach(r => {
  console.log(`Line ${String(r.lineNum).padStart(4, ' ')}: [${r.id}]`);
});
