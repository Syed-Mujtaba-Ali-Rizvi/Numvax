const fs = require('fs');

const toolCatalog = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts', 'utf8');
const catalog = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/catalog.ts', 'utf8');

const titleMatches1 = toolCatalog.match(/metaTitle:\s*['"]([^'"]+)['"]/g) || [];
const titleMatches2 = catalog.match(/metaTitle:\s*['"]([^'"]+)['"]/g) || [];

console.log('--- Checking toolCatalog.ts metaTitles > 60 chars ---');
titleMatches1.forEach(m => {
  const title = m.replace(/metaTitle:\s*['"]/, '').replace(/['"]$/, '');
  if (title.length > 60) {
    console.log(`[${title.length} chars] ${title}`);
  }
});

console.log('--- Checking catalog.ts metaTitles > 60 chars ---');
titleMatches2.forEach(m => {
  const title = m.replace(/metaTitle:\s*['"]/, '').replace(/['"]$/, '');
  if (title.length > 60) {
    console.log(`[${title.length} chars] ${title}`);
  }
});
