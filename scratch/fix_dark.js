const fs = require('fs');
const path = require('path');

const replacements = [
  ['bg-white dark:bg-slate-900', 'bg-slate-900'],
  ['bg-white dark:bg-slate-800', 'bg-slate-800'],
  ['border-slate-200 dark:border-slate-800', 'border-slate-800'],
  ['border-slate-300 dark:border-slate-700', 'border-slate-700'],
  ['border-slate-100 dark:border-slate-800', 'border-slate-800'],
  ['text-slate-700 dark:text-slate-300', 'text-slate-300'],
  ['text-slate-800 dark:text-slate-200', 'text-slate-200'],
  ['text-slate-900 dark:text-white', 'text-white'],
  ['text-slate-600 dark:text-slate-300', 'text-slate-300'],
  ['text-slate-600 dark:text-slate-400', 'text-slate-400'],
  ['text-slate-500 dark:text-slate-400', 'text-slate-400'],
  ['text-sky-600 dark:text-sky-400', 'text-sky-400'],
  ['text-sky-700 dark:text-sky-300', 'text-sky-300'],
  ['bg-sky-100 dark:bg-sky-950/80', 'bg-sky-950/80'],
  ['bg-sky-50 dark:bg-slate-800', 'bg-slate-800'],
  ['bg-sky-50 dark:bg-sky-950', 'bg-sky-950'],
  ['dark:bg-sky-500 dark:hover:bg-sky-600', ''],
  ['dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200', ''],
  ['dark:hover:bg-slate-800 dark:text-slate-300', ''],
  ['dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100', ''],
  ['dark:text-red-400', ''],
  ['dark:placeholder:text-slate-600', 'placeholder:text-slate-500'],
  ['dark:text-slate-500', ''],
  ['dark:hover:border-sky-500', ''],
  ['dark:group-hover:text-sky-400', 'group-hover:text-sky-400'],
  ['hover:bg-white', 'hover:bg-slate-800'],
  ['hover:bg-slate-100', 'hover:bg-slate-800'],
  ['hover:bg-slate-50', 'hover:bg-slate-800'],
  ['bg-slate-100 hover:bg-slate-200', 'bg-slate-800 hover:bg-slate-700'],
];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      files.push(...walk(full));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walk(srcDir);
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    totalChanges++;
    console.log('Fixed:', path.relative(path.join(__dirname, '..'), file));
  }
}

console.log(`\nDone. Fixed ${totalChanges} files.`);
