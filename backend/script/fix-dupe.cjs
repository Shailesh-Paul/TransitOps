const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/features/auth/auth.routes.js');
let content = fs.readFileSync(file, 'utf8');

// Match everything from the first " *     requestBody:" up to " *     responses:"
// and replace it with just one instance.
// A simpler way: we know requestBody has a specific block of text.
const block = `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object`;

// split by responses:
const chunks = content.split(' *     responses:');
for(let i=0; i<chunks.length - 1; i++) {
  // If this chunk has multiple "requestBody:", keep only the last one.
  const idxFirst = chunks[i].indexOf(' *     requestBody:');
  const idxLast = chunks[i].lastIndexOf(' *     requestBody:');
  if (idxFirst !== -1 && idxFirst !== idxLast) {
    // Has multiple
    chunks[i] = chunks[i].substring(0, idxFirst) + chunks[i].substring(idxLast);
  }
}
fs.writeFileSync(file, chunks.join(' *     responses:'), 'utf8');
console.log("Fixed duplicates in auth.routes.js");
