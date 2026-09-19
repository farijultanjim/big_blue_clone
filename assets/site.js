// Page interactions. Business content belongs in site-config.js; styles in theme.css.
// Sections run in order because later features share configuration and motion state.

// ============================================================================
// 01. BUSINESS SETTINGS AND IMAGE OVERRIDES
// ============================================================================

const config = window.SITE_CONFIG || {};
const replacements = [
  ['CedarFlow Plumbing', config.name],
  ['(202) 555-0147', config.phone],
  ['hello@cedarflow.example', config.email],
  ['24 Willow Lane, Mapleford, EX 00000', config.address],
  ['Every day, 24 hours', config.hours],
].filter(([, value]) => value);
function brandText(text) {
  for (const [original, replacement] of replacements) text = text.replaceAll(original, replacement);
  return text;
}
function imagePath(filename) {
  return config.images?.[filename] || `./assets/images/${filename}`;
}
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (textWalker.nextNode()) {
  const node = textWalker.currentNode;
  if (!['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName))
    node.textContent = brandText(node.textContent);
}
document.title = brandText(document.title);
document.querySelectorAll('[alt], [aria-label]').forEach((element) => {
  for (const attribute of ['alt', 'aria-label']) {
    if (element.hasAttribute(attribute))
      element.setAttribute(attribute, brandText(element.getAttribute(attribute)));
  }
});
document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  if (config.phoneLink) link.href = `tel:${config.phoneLink}`;
});
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  if (config.email) link.href = `mailto:${config.email}`;
});
document.querySelectorAll('img').forEach((img) => {
  const filename = img.getAttribute('src').split('/').pop();
  if (config.images?.[filename]) img.src = config.images[filename];
});
for (const [variable, filename] of [
  ['--image-hero', 'home-banner.jpg'],
  ['--image-process', 'our-process-bg.jpg'],
]) {
  const url = new URL(imagePath(filename), document.baseURI).href;
  document.documentElement.style.setProperty(variable, `url("${url.replaceAll('"', '%22')}")`);
}

// ============================================================================
// 02. MOBILE NAVIGATION AND DISCLOSURES
// ============================================================================

const toggle = document.querySelector('#menu-toggle');
const menu = document.querySelector('#main-menu');
function closeMenu() {
  menu.classList.add('hidden');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('hidden', !open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = document.querySelector('details[open]');
  if (open) {
    open.open = false;
    open.querySelector('summary').focus();
  } else if (toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', (event) => {
  document.querySelectorAll('details[open]').forEach((details) => {
    if (!details.contains(event.target)) details.open = false;
  });
});
document.querySelectorAll('[data-disclosure]').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (details.open)
      document.querySelectorAll('[data-disclosure][open]').forEach((other) => {
        if (other !== details) other.open = false;
      });
  });
});
// ============================================================================
// 03. FEATURED SUBURB FILTER
// ============================================================================

document.querySelector('#suburb').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  const items = [...document.querySelectorAll('[data-suburb]')];
  items.forEach((item) => {
    item.hidden = !item.dataset.suburb.toLowerCase().includes(query);
  });
  document.querySelector('#suburb-empty').hidden = items.some((item) => !item.hidden);
});
// ============================================================================
// 04. HOMEPAGE SEARCH
// ============================================================================

document.querySelector('#page-search').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.querySelector('#search').value.trim().toLowerCase();
  if (!query) return;
  const target = [
    ...document.querySelectorAll('main h1, main h2, main h3, main p, .area-list a'),
  ].find((element) => element.textContent.toLowerCase().includes(query));
  document.querySelector('#search-status').textContent = target
    ? 'Match found on this homepage.'
    : 'No match in the current homepage preview.';
  if (target) {
    const panel = target.closest('[role="tabpanel"]');
    if (panel) activateArea(document.querySelector(`[aria-controls="${panel.id}"]`));
    const card = target.closest('[data-service-card]');
    if (card) card.open = true;
    target.scrollIntoView({ block: 'center' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    event.target.closest('details').open = false;
  }
});

// ============================================================================
// 05. REVIEW CAROUSEL AND MOTION PREFERENCES
// ============================================================================

const reviews = config.reviews;
let current = 0;
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = motion.matches;
const pauseButton = document.querySelector('#review-pause');
function showReview(index) {
  current = index;
  const review = reviews[index];
  document.querySelector('#review-name').textContent = review.name;
  document.querySelector('#review-text').textContent = brandText(`“${review.text}”`);
  document.querySelector('#review-avatar').src = imagePath(review.image);
  document.querySelector('#hero-review-name').textContent = review.name;
  document.querySelector('#hero-review-text').textContent = brandText(`“${review.text}”`);
  document
    .querySelectorAll('[data-review]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(Number(button.dataset.review) === index)),
    );
}
function updatePause() {
  pauseButton.textContent = paused ? 'Play reviews' : 'Pause reviews';
  pauseButton.setAttribute('aria-pressed', String(paused));
}
document.querySelectorAll('[data-review]').forEach((button) =>
  button.addEventListener('click', () => {
    showReview(Number(button.dataset.review));
    paused = true;
    updatePause();
  }),
);
pauseButton.addEventListener('click', () => {
  paused = !paused;
  updatePause();
});
motion.addEventListener('change', (event) => {
  paused = event.matches;
  updatePause();
});
updatePause();
setInterval(() => {
  if (
    !paused &&
    !document.hidden &&
    !document.querySelector('[data-carousel]:hover, [data-carousel]:focus-within')
  )
    showReview((current + 1) % reviews.length);
}, 7000);

// ============================================================================
// 06. SERVICE CARD HOVER AND CLOSE CONTROLS
// ============================================================================

// Native details supports tap and keyboard; hover reveals cards on desktop.
const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('[data-service-card]').forEach((card) => {
  card.addEventListener('pointerenter', () => {
    if (hoverPointer.matches) card.open = true;
  });
  card.addEventListener('pointerleave', () => {
    if (hoverPointer.matches && !card.contains(document.activeElement)) card.open = false;
  });
  card.querySelector('[data-close-service]').addEventListener('click', () => {
    card.open = false;
    card.querySelector('summary').focus({ preventScroll: true });
  });
});

// ============================================================================
// 07. SERVICE-AREA TABS AND KEYBOARD NAVIGATION
// ============================================================================

const areaTabs = [...document.querySelectorAll('[role="tab"]')];
function activateArea(tab, focus = false) {
  if (!tab) return;
  areaTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
areaTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateArea(tab));
  tab.addEventListener('keydown', (event) => {
    const targets = {
      ArrowDown: (index + 1) % areaTabs.length,
      ArrowUp: (index + areaTabs.length - 1) % areaTabs.length,
      Home: 0,
      End: areaTabs.length - 1,
    };
    if (event.key in targets) {
      event.preventDefault();
      activateArea(areaTabs[targets[event.key]], true);
    }
  });
});
// ============================================================================
// 08. PROJECT GALLERY PAUSE CONTROL
// ============================================================================

const gallery = document.querySelector('.project-gallery');
const galleryPause = document.querySelector('#gallery-pause');
function setGalleryPaused(paused) {
  gallery.dataset.paused = String(paused);
  galleryPause.setAttribute('aria-pressed', String(paused));
  galleryPause.textContent = paused ? 'Play gallery' : 'Pause gallery';
}
setGalleryPaused(motion.matches);
galleryPause.addEventListener('click', () => setGalleryPaused(gallery.dataset.paused !== 'true'));
motion.addEventListener('change', (event) => setGalleryPaused(event.matches));
// ============================================================================
// 09. QUOTE, CONTACT, AND NEWSLETTER FORMS — demo only
// ============================================================================

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    status.hidden = false;
    status.textContent =
      form.id === 'newsletter-form'
        ? 'Demo only: your email is valid. No subscription has been created.'
        : 'Demo only: your form is valid. No enquiry has been sent.';
  });
});
