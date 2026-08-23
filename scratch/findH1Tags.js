const fs = require('fs');
const path = require('path');

function searchH1(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchH1(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/<h1[^>]*>/gi);
      if (matches) {
        console.log(`Found ${matches.length} <h1> tag(s) in: ${fullPath}`);
      }
    }
  }
}

searchH1('c:/Users/mujta/Desktop/calora/src');
