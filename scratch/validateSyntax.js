const fs = require('fs');
const code = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts', 'utf8');

try {
  // Simple check for object key brackets
  const matchKeys = code.match(/'[a-z0-9-]+':\s*\{/g);
  console.log(`Total tool entries found: ${matchKeys.length}`);
  console.log('Tool slugs:', matchKeys.map(k => k.split("'")[1]));
} catch (e) {
  console.error(e);
}
