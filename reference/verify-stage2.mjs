import { readFile, access } from 'node:fs/promises';
const html = await readFile('index.html', 'utf8');
const css = await readFile('assets/site.css', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const failures = [];
if (new Set(ids).size !== ids.length) failures.push('Duplicate HTML IDs');
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map(m => m[1]);
for (const file of refs) {
  try { await access(file); } catch { failures.push(`Missing file: ${file}`); }
}
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(id)) failures.push(`Missing anchor: ${id}`);
}
for (const [, group] of html.matchAll(/(?:aria-controls|aria-labelledby)="([^"]+)"/g)) {
  for (const id of group.split(' ')) if (!ids.includes(id)) failures.push(`Missing ARIA target: ${id}`);
}
for (const file of ['patrick-capuano.jpg', 'hendrix-green.jpg', 'home-banner.jpg']) {
  try { await access(`assets/images/${file}`); } catch { failures.push(`Missing dynamic asset: ${file}`); }
}
if (!css.includes('font-family:Inter') && !css.includes('font-family:"Inter"')) failures.push('Inter font missing from build');
if (!css.includes('.hero-review') || !css.includes('.benefit')) failures.push('Component styles missing');
console.log(JSON.stringify({ localReferences: refs.length, uniqueIds: ids.length, cssBytes: css.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
