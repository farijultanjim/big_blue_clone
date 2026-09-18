import { readFile, writeFile, stat } from 'node:fs/promises';
const local = 'assets/images/big-blue-finance.png';
const bytes = (await stat(local)).size;
const manifest = JSON.parse(await readFile('reference/assets.json', 'utf8'));
if (!manifest.some(asset => asset.local === local)) manifest.push({
  source: 'https://zeve.au/bigblue/themes/bigblue/images/big-blue-finance.png',
  local, bytes, status: 'downloaded', discoveredIn: 'homepage financing data-srcset'
});
await writeFile('reference/assets.json', JSON.stringify(manifest, null, 2));
console.log(`Financing image registered: ${bytes} bytes`);
