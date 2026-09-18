import { readFile, writeFile } from 'node:fs/promises';
let html = await readFile('index.html', 'utf8');
for (const [page, anchor] of [['about-us','about'], ['locations','locations'], ['blog','blog'], ['contact-us','contact'], ['testimonials','testimonials'], ['services','services']]) {
  html = html.replaceAll(`href="https://bigblueplumbing.au/${page}"`, `href="#${anchor}"`);
}
// Prefer the actual source suburb destinations over guessed top-level routes.
const source = await readFile('reference/homepage.html', 'utf8');
for (const label of ['Buderim','Caloundra','Mooloolaba','Bribie Island']) {
  const sourceLink = [...source.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find(([,href,content]) => href.startsWith('https://bigblueplumbing.au/') && content.replace(/<[^>]+>/g,'').trim() === label);
  if (sourceLink) {
    const slug = label.toLowerCase().replaceAll(' ','-');
    html = html.replaceAll(`href="https://bigblueplumbing.au/${slug}"`, `href="${sourceLink[1]}"`);
  }
}
await writeFile('index.html', html);
console.log('Homepage navigation mapped to completed sections; source suburb links restored.');
