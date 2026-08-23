const fs = require('fs');
const content = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts', 'utf8');

// Find brace mismatch
let depth = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let c of line) {
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  if (depth < 0) {
    console.log(`Unmatched closing brace at line ${i + 1}: ${line}`);
    break;
  }
}
console.log(`Final brace depth at end of file: ${depth}`);
