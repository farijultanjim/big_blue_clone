import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile('reference/homepage.html', 'utf8');
const menu = source.slice(source.indexOf('id="dropdownMenuPlumbing"'), source.indexOf('<header class="py-5'));
const cards = [...menu.matchAll(/<a href="([^"]+)"[^>]*>\s*<div class="card">\s*<img[^>]*data-src="([^"]+)"[^>]*>\s*<span[^>]*>([^<]+)<\/span>/g)].map(([, href, image, label]) => `<a href="${href}" class="border border-nav-line p-2.5 hover:border-brand"><img src="./assets/images/${image.split('/').pop()}" width="242" height="188" alt="" loading="lazy" class="w-full"><span class="block p-2 font-extrabold uppercase">${label}</span></a>`);
if (cards.length !== 10) throw new Error(`Expected 10 service cards, found ${cards.length}`);
const html = await readFile('index.html', 'utf8');
await writeFile('index.html', html.replace('<!-- Service cards inserted below during build. -->', cards.join('\n')));
console.log(`Inserted ${cards.length} static HTML menu cards using source destinations.`);
