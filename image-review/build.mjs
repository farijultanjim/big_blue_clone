// Rebuild the separate review gallery from the saved image manifest.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const jobs = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const old = await readFile(new URL('index.html', root), 'utf8');
const styles = old.match(/<style>([\s\S]*?)<\/style>/)[1];
const hero = old.match(/<section id="hero">[\s\S]*?<\/section>/)[0];
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const groups = [
  ['02-services', 'services', '02 â€” Services', '12 scenes for service cards, navigation thumbnails and related article previews.'],
  ['04-company', 'company', '04 â€” Company and backgrounds', 'Homepage backdrop, fictional team and process background.'],
  ['05-gallery', 'gallery', '05 â€” Gallery concepts', 'AI-created illustrative project scenes.'],
  ['06-portraits', 'portraits', '06 â€” Sample portraits', 'Fictional people for the existing sample reviews.'],
];
const card = (job) => `<article class="card">
  <a href="${job.file}" target="_blank" rel="noopener"><img loading="lazy" src="${job.file}" alt="${escape(job.title)}"></a>
  <div class="caption"><h3>${escape(job.title)}</h3>
  <p class="badge ${job.status === 'saved' ? '' : 'warning'}">${job.status === 'saved' ? 'Ready for review' : 'DRAFT â€” transparency needs correction'}</p>
  <p>${escape(job.note || 'Original AI-generated fictional scene.')}</p>
  <p class="filename">${job.file}</p><a href="${job.file}" download>Download PNG</a>
  <details><summary>Intended page locations</summary><ul>${job.replaces.map((file) => `<li>${escape(file)}</li>`).join('')}</ul></details>
  </div></article>`;
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CedarFlow image review</title><style>${styles}
#company img,#gallery img{aspect-ratio:3/2}#portraits img{aspect-ratio:1}
</style></head><body><main>
<p class="badge">CEDARFLOW Â· SEPARATE ASSET REVIEW</p><h1>Your new image collection</h1>
<p>The 22 new photos and approved hero are now installed on the homepage. This gallery preserves the separate source files for reference. The old downloaded images have been removed.</p>
<nav aria-label="Image groups"><a href="#hero">Approved hero</a>${groups.map(([,id,title])=>`<a href="#${id}">${title}</a>`).join('')}</nav>
<div class="notice">The service collection now includes two additional teammates at work. The homepage hero uses a hip-level display crop of the approved transparent portrait. Superseded images and failed drafts have been removed.</div>
${hero}
${groups.map(([folder,id,title,description])=>`<section id="${id}"><h2>${title}</h2><p>${description}</p><div class="grid">${jobs.filter(job=>job.folder===folder).map(card).join('')}</div></section>`).join('')}
<p><a href="manifest.json">View image map and generation prompts</a></p>
<p>The homepage uses a new CedarFlow wordmark and text service-value cards in place of the downloaded brand graphics.</p>
</main></body></html>`;
await writeFile(new URL('index.html', root), html);
console.log('Built current image gallery: 22 photos and approved hero.');


