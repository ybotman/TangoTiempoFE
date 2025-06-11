// listingJS2JSON.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname/polyfill for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read your raw listing file
const raw = fs.readFileSync(path.join(__dirname, 'listingJS.txt'), 'utf-8');
const lines = raw.split(/\r?\n/).filter(l => l.trim());

// 2. Build the index entries
const entries = lines.map(p => {
  const filePath = p.startsWith('./') ? p.slice(2) : p;
  const fileName = path.basename(filePath);
  const fullFilePath = path.resolve(__dirname, filePath);

  return {
    fileName,
    filePath,
    fullFilePath,
    Descriptions: [],
    State : "",
    FolderFunction: "",
    CalledBy: [],
    Calls: [],
    PrimaryFunctions: [],
    ChangeHistory: [],
    Contexts: [],
    States: []
  };
});

// 3. Write out JSON
const outPath = path.join(__dirname, 'listing.json');
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf-8');
console.log(`✅ Wrote ${entries.length} entries to ${outPath}`);
