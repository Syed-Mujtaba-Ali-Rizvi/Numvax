const fs = require('fs');
const content = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts', 'utf8');

// Find all tool entries by splitting on `'slug':`
const lines = content.split('\n');
let currentSlug = 'START';
let slugLines = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^\s*'([a-z0-9-]+)':\s*\{/);
  if (m) {
    currentSlug = m[1];
    slugLines[currentSlug] = { start: i + 1, depth: 1 };
  }
}

// Now check depth of each slug
for (let slug in slugLines) {
  let start = slugLines[slug].start;
  let d = 1;
  let end = -1;
  for (let j = start; j < lines.length; j++) {
    for (let c of lines[j]) {
      if (c === '{') d++;
      if (c === '}') d--;
    }
    if (d === 0) {
      end = j + 1;
      break;
    }
  }
  if (end === -1) {
    console.log(`BROKEN TOOL ENTRY: ${slug} starting at line ${start}`);
  }
}
console.log('Check completed.');
