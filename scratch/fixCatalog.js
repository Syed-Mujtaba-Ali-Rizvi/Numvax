const fs = require('fs');
const path = 'c:/Users/mujta/Desktop/calora/src/lib/toolCatalog.ts';

let content = fs.readFileSync(path, 'utf8');

const badSnippet = `    ],
                "name": "Image Resizer",
                "categorySlug": "image-tools",
                "description": "Resize image dimensions"
          },
          {
                "slug": "image-converter",
                "name": "Image Format Converter",
                "categorySlug": "image-tools",
                "description": "Convert image formats"
          }
    ],
  },`;

if (content.includes(badSnippet)) {
  content = content.replace(badSnippet, `    ],\n  },`);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully fixed toolCatalog.ts!');
} else {
  console.log('Snippet not found, checking raw lines...');
  const lines = content.split('\n');
  const cleanLines = [];
  let skip = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"name": "Image Resizer"') && lines[i-1] && lines[i-1].includes('],')) {
      skip = true;
    }
    if (skip && lines[i].trim() === '},' && lines[i+1] && lines[i+1].includes('image-resizer')) {
      skip = false;
      continue;
    }
    if (!skip) {
      cleanLines.push(lines[i]);
    }
  }
  fs.writeFileSync(path, cleanLines.join('\n'), 'utf8');
  console.log('Processed line-by-line fix!');
}
