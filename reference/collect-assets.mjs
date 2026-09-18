import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const html = await readFile('reference/homepage.html', 'utf8');
const urls = [...new Set([...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match => match[1])
  .filter(url => url.startsWith('https://zeve.au/') && /\.(woff2|svg|png|jpg|webp)$/.test(url)))];
const manifest = [];
for (let i = 0; i < urls.length; i += 6) {
  await Promise.all(urls.slice(i, i + 6).map(async url => {
    const local = `assets/${url.endsWith('.woff2') ? 'fonts' : 'images'}/${path.basename(url)}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(local, bytes);
      manifest.push({ source: url, local, bytes: bytes.length, status: 'downloaded' });
    } catch (error) {
      manifest.push({ source: url, local, status: 'failed', error: error.message });
    }
  }));
}
manifest.sort((a, b) => a.local.localeCompare(b.local));
await writeFile('reference/assets.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ downloaded: manifest.filter(a => a.status === 'downloaded').length, failed: manifest.filter(a => a.status === 'failed') }, null, 2));
