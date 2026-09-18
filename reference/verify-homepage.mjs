import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const html = await readFile('index.html', 'utf8');
const configCode = await readFile('assets/site-config.js', 'utf8');
const appCode = await readFile('assets/site.js', 'utf8');
const { document, window } = parseHTML(html);
const base = document.createElement('base');
base.setAttribute('href', 'http://localhost:3001/');
document.head.prepend(base);
let focused = null;
// Linkedom has no rendering, layout, native validation, or focus engine.
Object.defineProperty(document, 'activeElement', { get: () => focused });
window.HTMLElement.prototype.focus = function () { focused = this; };
window.HTMLElement.prototype.scrollIntoView = function () {};
for (const details of document.querySelectorAll('details')) {
  Object.defineProperty(details, 'open', {
    get() { return this.hasAttribute('open'); },
    set(value) { this.toggleAttribute('open', Boolean(value)); }
  });
}
window.matchMedia = () => ({ matches: false, addEventListener() {} });
const timers = [];
const context = vm.createContext({ window, document, NodeFilter: { SHOW_TEXT: 4 }, URL, console, setInterval: fn => timers.push(fn) });
vm.runInContext(configCode, context);
// Exercise rebranding as well as ordinary interaction behavior.
window.SITE_CONFIG.name = 'Example Plumbing';
window.SITE_CONFIG.phone = '(07) 1111 2222';
window.SITE_CONFIG.phoneLink = '0711112222';
vm.runInContext(appCode, context);
const $ = selector => document.querySelector(selector);
const click = element => element.dispatchEvent(new window.Event('click', { bubbles: true }));
const input = element => element.dispatchEvent(new window.Event('input', { bubbles: true }));
const key = (element, value) => {
  const event = new window.Event('keydown', { bubbles: true, cancelable: true });
  event.key = value;
  element.dispatchEvent(event);
};

assert.match($('h1').textContent, /Example Plumbing/);
assert.equal($('a[href^="tel:"]').getAttribute('href'), 'tel:0711112222');
assert.match(document.documentElement.style.getPropertyValue('--image-hero'), /http:\/\/localhost:3001\/assets\/images\/home-banner.jpg/);
click($('#menu-toggle'));
assert.equal($('#menu-toggle').getAttribute('aria-expanded'), 'true');
assert.equal($('#main-menu').classList.contains('hidden'), false);
key($('#menu-toggle'), 'Escape');
assert.equal($('#menu-toggle').getAttribute('aria-expanded'), 'false');
click($('[data-review="1"]'));
assert.equal($('#review-name').textContent, 'Patrick Capuano');
assert.match($('#review-text').textContent, /Example Plumbing/);
assert.equal($('#review-pause').getAttribute('aria-pressed'), 'true');
click($('#tab-noosa-shire'));
assert.equal($('#area-noosa-shire').hidden, false);
assert.equal($('#area-sunshine-coast').hidden, true);
key($('#tab-noosa-shire'), 'ArrowDown');
assert.equal($('#tab-moreton-bay').getAttribute('aria-selected'), 'true');
assert.equal(focused, $('#tab-moreton-bay'));
key($('#tab-moreton-bay'), 'Home');
assert.equal($('#area-sunshine-coast').hidden, false);
$('#suburb').value = '4556';
input($('#suburb'));
assert.equal(document.querySelectorAll('[data-suburb]:not([hidden])').length, 1);
$('#suburb').value = 'not-a-suburb';
input($('#suburb'));
assert.equal($('#suburb-empty').hidden, false);
$('#search').value = 'Cooran';
$('#page-search').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.equal($('#area-noosa-shire').hidden, false);
assert.match($('#search-status').textContent, /Match found/);
for (const id of ['quote-form', 'contact-form', 'newsletter-form']) {
  const form = $(`#${id}`);
  const event = new window.Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.match(form.querySelector('[role="status"]').textContent, /Demo only/);
  assert.ok(form.querySelector('input[type="email"][required]'));
}
click($('#gallery-pause'));
assert.equal($('.project-gallery').dataset.paused, 'true');
const card = $('[data-service-card]');
card.open = true;
click(card.querySelector('[data-close-service]'));
assert.equal(card.open, false);
assert.equal(document.querySelectorAll('[data-service-card]').length, 12);
assert.equal(document.querySelectorAll('.area-list li').length, 216);
assert.equal(document.querySelectorAll('main').length, 1);
assert.equal(document.querySelectorAll('footer').length, 1);
const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs');
for (const link of document.querySelectorAll('a[href^="#"]')) assert.ok(document.getElementById(link.getAttribute('href').slice(1)), `Missing anchor ${link.getAttribute('href')}`);
for (const element of document.querySelectorAll('[aria-controls], [aria-labelledby]')) {
  for (const attr of ['aria-controls', 'aria-labelledby']) for (const id of (element.getAttribute(attr) || '').split(' ').filter(Boolean)) assert.ok(document.getElementById(id), `Missing ARIA target ${id}`);
}
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map(match => match[1]);
for (const file of refs) await access(file);
for (const name of ['our-process-bg.jpg', 'home-banner.jpg']) await access(`assets/images/${name}`);
assert.equal([...html.matchAll(/<main\b/g)].length, 1);
assert.equal([...html.matchAll(/<\/main>/g)].length, 1);
assert.equal(document.querySelectorAll('script[src^="http"]').length, 0);
console.log('PASS: DOM interaction checks, rebranding, 216 suburbs, 12 services, forms, local files, anchors, ARIA targets, and document structure.');
console.log('Not covered: rendered layout, browser-native validation, visual matching, or browser-specific behavior.');
