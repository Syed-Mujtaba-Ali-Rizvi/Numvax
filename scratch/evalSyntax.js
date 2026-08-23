const fs = require('fs');
const content = fs.readFileSync('c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts', 'utf8');

const lines = content.split('\n');
let currentSlug = '';
let currentCode = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^\s*'([a-z0-9-]+)':\s*\{/);
  if (m) {
    if (currentSlug && currentCode) {
      try {
        new Function('return {' + currentCode + '}');
      } catch (e) {
        console.log(`SYNTAX ERROR IN SLUG [${currentSlug}]: ${e.message}`);
      }
    }
    currentSlug = m[1];
    currentCode = `'${currentSlug}': {` + '\n';
  } else if (currentSlug) {
    currentCode += line + '\n';
  }
}

if (currentSlug && currentCode) {
  // strip ending };
  const lastCode = currentCode.replace(/};\s*$/, '');
  try {
    new Function('return {' + lastCode + '}');
  } catch (e) {
    console.log(`SYNTAX ERROR IN LAST SLUG [${currentSlug}]: ${e.message}`);
  }
}
console.log('Evaluated all tool entries.');
