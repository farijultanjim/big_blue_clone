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
  ['--image-hero', 'cedarflow-home-exterior-v1.png'],
  ['--image-process', 'cedarflow-tools-background-v1.png'],
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
  if (typeof gsap !== 'undefined' && typeof motion !== 'undefined' && !motion.matches) {
    gsap.fromTo(
      ['#review-text', '#review-name', '#review-avatar', '#hero-review-text', '#hero-review-name'],
      { autoAlpha: 0.2, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    );
  }
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

// Desktop hover for Plumbing mega menu
const plumbingMenu = document.querySelector('#plumbing-menu');
if (plumbingMenu) {
  let closeTimer;
  plumbingMenu.addEventListener('pointerenter', () => {
    if (hoverPointer.matches) {
      clearTimeout(closeTimer);
      plumbingMenu.open = true;
    }
  });
  plumbingMenu.addEventListener('pointerleave', () => {
    if (hoverPointer.matches) {
      closeTimer = setTimeout(() => {
        if (!plumbingMenu.contains(document.activeElement)) {
          plumbingMenu.open = false;
        }
      }, 150);
    }
  });
}

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

// ============================================================================
// 10. GSAP ANIMATIONS & SCROLL INTERACTIONS (SENIOR-DESIGNER LEVEL)
// ============================================================================

if (typeof gsap !== 'undefined') {
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const mm = gsap.matchMedia();
  const header = document.querySelector('header');

  // --- Dynamic Header Scroll State ---
  if (header && typeof window !== 'undefined') {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 45) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      },
      { passive: true },
    );
  }

  // --- Animations run only when the user has not requested reduced motion ---
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Luxury Easing Curves
    const EASE_LUXURY = 'expo.out';
    const EASE_SPRING = 'back.out(1.4)';
    const EASE_SMOOTH = 'power3.out';

    // ========================================================================
    // 01. HEADER & 02. HERO CHOREOGRAPHY
    // ========================================================================

    // Desktop Hero Master Sequence
    mm.add('(min-width: 1024px)', () => {
      const heroTl = gsap.timeline({ defaults: { ease: EASE_LUXURY } });

      // Ambient background subtle settle
      gsap.fromTo('.hero-scene', { scale: 1.07 }, { scale: 1, duration: 2.2, ease: 'power2.out' });

      // Hero Elements Staggered Symphony
      heroTl
        .from('[data-hero="badge"]', {
          x: -40,
          autoAlpha: 0,
          duration: 0.9,
        })
        .from(
          '[data-hero="heading"]',
          {
            y: 45,
            autoAlpha: 0,
            duration: 1.1,
          },
          '<0.1',
        )
        .from(
          '[data-hero="copy"]',
          {
            y: 25,
            autoAlpha: 0,
            duration: 0.9,
          },
          '<0.15',
        )
        .from(
          '[data-hero="cta"]',
          {
            scale: 0.92,
            y: 20,
            autoAlpha: 0,
            duration: 0.75,
            ease: EASE_SPRING,
          },
          '<0.2',
        )
        .from(
          '[data-hero="portrait"]',
          {
            y: 90,
            autoAlpha: 0,
            duration: 1.3,
            ease: EASE_LUXURY,
          },
          '<0.1',
        )
        .from(
          '[data-hero="review"]',
          {
            x: 55,
            rotationY: 8,
            autoAlpha: 0,
            duration: 1.05,
            ease: EASE_LUXURY,
          },
          '<0.2',
        );

      // Hero Plumber Subtle Parallax Scrub
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero-portrait-image', {
          y: 70,
          ease: 'none',
          scrollTrigger: {
            trigger: '#main',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }
    });

    // Mobile / Tablet Hero Entrance
    mm.add('(max-width: 1023px)', () => {
      const mobTl = gsap.timeline({ defaults: { ease: EASE_LUXURY } });
      mobTl
        .from('[data-hero="badge"]', { y: 25, autoAlpha: 0, duration: 0.8 })
        .from('[data-hero="heading"]', { y: 30, autoAlpha: 0, duration: 0.9 }, '<0.1')
        .from('[data-hero="copy"]', { y: 20, autoAlpha: 0, duration: 0.8 }, '<0.1')
        .from(
          '[data-hero="cta"]',
          { y: 15, scale: 0.95, autoAlpha: 0, duration: 0.7, ease: EASE_SPRING },
          '<0.15',
        )
        .from('[data-hero="review"]', { y: 25, autoAlpha: 0, duration: 0.85 }, '<0.2');
    });

    if (typeof ScrollTrigger !== 'undefined') {
      // Helper function to animate standard section headers
      const animateSectionIntro = (sectionSelector) => {
        const section = document.querySelector(sectionSelector);
        if (!section) return null;
        const intro = section.querySelector('.section-intro');
        if (!intro) return null;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        const pre = intro.querySelector('.preheading');
        const h2 = intro.querySelector('.section-heading, h2');
        const p = intro.querySelector('.body-copy') || intro.querySelector('p:not(.preheading)');

        if (pre) {
          tl.fromTo(
            pre,
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7, clearProps: 'opacity,visibility,transform' },
          );
        }
        if (h2) {
          tl.fromTo(
            h2,
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.85, clearProps: 'opacity,visibility,transform' },
            '<0.1',
          );
        }
        if (p) {
          tl.fromTo(
            p,
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.75, clearProps: 'opacity,visibility,transform' },
            '<0.12',
          );
        }

        return tl;
      };

      // ======================================================================
      // 03. BENEFITS STRIP
      // ======================================================================
      const benefitsSection =
        document.querySelector('#benefits') ||
        document.querySelector('[aria-label="Our service benefits"]');
      if (benefitsSection) {
        const bTl = gsap.timeline({
          scrollTrigger: {
            trigger: benefitsSection,
            start: 'top 84%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        bTl
          .from(benefitsSection.querySelectorAll('.benefit'), {
            y: 45,
            scale: 0.96,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.85,
          })
          .from(
            benefitsSection.querySelectorAll('.benefit-circle'),
            {
              scale: 0.7,
              rotation: -10,
              autoAlpha: 0,
              stagger: 0.12,
              duration: 0.7,
              ease: EASE_SPRING,
            },
            '<0.2',
          );
      }

      // ======================================================================
      // 04. QUOTE & TESTIMONIAL CAROUSEL
      // ======================================================================
      const quoteSection = document.querySelector('#quote');
      if (quoteSection) {
        const qTl = gsap.timeline({
          scrollTrigger: {
            trigger: quoteSection,
            start: 'top 78%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        qTl
          .from('#quote-heading, #quote-heading ~ *', {
            y: 30,
            autoAlpha: 0,
            stagger: 0.1,
            duration: 0.85,
          })
          .from(
            '[data-carousel="quote"]',
            {
              x: -35,
              autoAlpha: 0,
              duration: 0.9,
            },
            '<0.2',
          )
          .from(
            '#quote .order-1 > div',
            {
              scale: 0.92,
              autoAlpha: 0,
              stagger: 0.12,
              duration: 0.7,
              ease: EASE_SPRING,
            },
            '<0.2',
          )
          .from(
            '#quote-form',
            {
              x: 35,
              autoAlpha: 0,
              duration: 0.95,
            },
            '<0.1',
          );
      }

      // ======================================================================
      // 05. SERVICES (12 EXPANDABLE CARDS)
      // ======================================================================
      const servicesSection = document.querySelector('#services');
      if (servicesSection) {
        const sTl =
          animateSectionIntro('#services') ||
          gsap.timeline({
            scrollTrigger: { trigger: servicesSection, start: 'top 78%', once: true },
          });

        sTl
          .from(
            servicesSection.querySelectorAll('.service-card'),
            {
              y: 50,
              scale: 0.96,
              autoAlpha: 0,
              stagger: {
                each: 0.05,
                from: 'start',
              },
              duration: 0.8,
              ease: EASE_LUXURY,
            },
            '-=0.3',
          )
          .from(
            servicesSection.querySelectorAll('.button'),
            {
              scale: 0.92,
              autoAlpha: 0,
              duration: 0.6,
              ease: EASE_SPRING,
            },
            '-=0.2',
          );
      }

      // ======================================================================
      // 06. REASONS (THREE SERVICE PRINCIPLES)
      // ======================================================================
      const reasonsSection = document.querySelector('#reasons');
      if (reasonsSection) {
        const rTl =
          animateSectionIntro('#reasons') ||
          gsap.timeline({
            scrollTrigger: { trigger: reasonsSection, start: 'top 75%', once: true },
          });

        rTl
          .from(
            reasonsSection.querySelector('img'),
            {
              x: -45,
              scale: 0.96,
              autoAlpha: 0,
              duration: 1.0,
              ease: EASE_LUXURY,
            },
            '-=0.3',
          )
          .from(
            reasonsSection.querySelectorAll('.reason-item'),
            {
              x: 35,
              autoAlpha: 0,
              stagger: 0.18,
              duration: 0.85,
              ease: EASE_LUXURY,
            },
            '<0.2',
          )
          .from(
            reasonsSection.querySelectorAll('.reason-number'),
            {
              scale: 0.6,
              autoAlpha: 0,
              stagger: 0.18,
              duration: 0.6,
              ease: EASE_SPRING,
            },
            '<0.1',
          );
      }

      // ======================================================================
      // 07. PAYMENT / FINANCING OPTIONS
      // ======================================================================
      const financingSection = document.querySelector('#financing');
      if (financingSection) {
        gsap.fromTo(
          financingSection.querySelectorAll('h2, p, .button'),
          { y: 35, autoAlpha: 0 },
          {
            scrollTrigger: {
              trigger: financingSection,
              start: 'top 80%',
              once: true,
            },
            y: 0,
            autoAlpha: 1,
            stagger: 0.14,
            duration: 0.85,
            ease: EASE_LUXURY,
            clearProps: 'opacity,visibility,transform',
          },
        );
      }

      // ======================================================================
      // 08. CALL BANNER 1 (#call-us)
      // ======================================================================
      const callUsSection = document.querySelector('#call-us');
      if (callUsSection) {
        const cTl = gsap.timeline({
          scrollTrigger: {
            trigger: callUsSection,
            start: 'top 80%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        cTl
          .fromTo(
            callUsSection.querySelectorAll('h2, p'),
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.12,
              duration: 0.85,
              clearProps: 'opacity,visibility,transform',
            },
          )
          .from(
            callUsSection.querySelectorAll('a[href^="tel:"], .button'),
            {
              scale: 0.92,
              autoAlpha: 0,
              duration: 0.7,
              ease: EASE_SPRING,
            },
            '<0.2',
          )
          .from(
            callUsSection.querySelector('.call-portrait, img'),
            {
              y: 50,
              autoAlpha: 0,
              duration: 1.0,
            },
            '<0.1',
          );
      }

      // ======================================================================
      // 09. ABOUT US STORY
      // ======================================================================
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        const aTl =
          animateSectionIntro('#about') ||
          gsap.timeline({
            scrollTrigger: { trigger: aboutSection, start: 'top 78%', once: true },
          });

        aTl
          .from(
            aboutSection.querySelectorAll(
              '.mt-12 > div:first-child h3, .mt-12 > div:first-child p',
            ),
            {
              y: 30,
              autoAlpha: 0,
              stagger: 0.12,
              duration: 0.85,
              ease: EASE_LUXURY,
            },
            '-=0.2',
          )
          .from(
            aboutSection.querySelectorAll('.mt-12 img'),
            {
              scale: 0.96,
              autoAlpha: 0,
              duration: 1.1,
              ease: EASE_LUXURY,
            },
            '<0.15',
          );
      }

      // ======================================================================
      // 10. SERVICE VALUES (6 GUARANTEE CARDS)
      // ======================================================================
      const guaranteesSection = document.querySelector('#guarantees');
      if (guaranteesSection) {
        const gTl =
          animateSectionIntro('#guarantees') ||
          gsap.timeline({
            scrollTrigger: { trigger: guaranteesSection, start: 'top 78%', once: true },
          });

        gTl
          .from(
            guaranteesSection.querySelector('img'),
            {
              x: -40,
              autoAlpha: 0,
              duration: 0.95,
              ease: EASE_LUXURY,
            },
            '-=0.2',
          )
          .from(
            guaranteesSection.querySelectorAll('.guarantee-card'),
            {
              y: 40,
              rotationX: 10,
              scale: 0.94,
              autoAlpha: 0,
              stagger: 0.08,
              duration: 0.75,
              ease: EASE_LUXURY,
            },
            '<0.15',
          );
      }

      // ======================================================================
      // 11. TESTIMONIALS (3 CUSTOMER STORIES)
      // ======================================================================
      const testimonialsSection = document.querySelector('#testimonials');
      if (testimonialsSection) {
        const tTl =
          animateSectionIntro('#testimonials') ||
          gsap.timeline({
            scrollTrigger: { trigger: testimonialsSection, start: 'top 78%', once: true },
          });

        tTl.from(
          testimonialsSection.querySelectorAll('article'),
          {
            y: 45,
            scale: 0.96,
            autoAlpha: 0,
            stagger: 0.14,
            duration: 0.85,
            ease: EASE_LUXURY,
          },
          '-=0.3',
        );
      }

      // ======================================================================
      // 12. PROJECT GALLERY (#projects)
      // ======================================================================
      const projectsSection = document.querySelector('#projects');
      if (projectsSection) {
        const pTl = gsap.timeline({
          scrollTrigger: {
            trigger: projectsSection,
            start: 'top 78%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        pTl
          .from(projectsSection.querySelectorAll('h2, .body-copy, .relative.pb-5'), {
            y: 35,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.85,
          })
          .from(
            projectsSection.querySelectorAll('.gallery-track'),
            {
              y: 50,
              autoAlpha: 0,
              duration: 1.0,
            },
            '<0.2',
          );
      }

      // ======================================================================
      // 13. PROCESS (4 EASY STEPS & PROGRESS LINE)
      // ======================================================================
      const processSection = document.querySelector('#process');
      if (processSection) {
        const prTl =
          animateSectionIntro('#process') ||
          gsap.timeline({
            scrollTrigger: { trigger: processSection, start: 'top 75%', once: true },
          });

        prTl.from(
          processSection.querySelectorAll('ol > li:not([aria-hidden])'),
          {
            y: 40,
            scale: 0.95,
            autoAlpha: 0,
            stagger: 0.14,
            duration: 0.8,
            ease: EASE_LUXURY,
          },
          '-=0.3',
        );

        const activeLine = document.querySelector('#process-active-line');
        if (activeLine) {
          gsap.to(activeLine, {
            scrollTrigger: {
              trigger: '#process ol',
              start: 'top 75%',
              end: 'bottom 60%',
              scrub: 0.6,
            },
            width: '100%',
            ease: 'none',
          });
        }
      }

      // ======================================================================
      // 14. SERVICE AREAS & SUBURBS (#locations)
      // ======================================================================
      const locationsSection = document.querySelector('#locations');
      if (locationsSection) {
        const lTl =
          animateSectionIntro('#locations') ||
          gsap.timeline({
            scrollTrigger: { trigger: locationsSection, start: 'top 78%', once: true },
          });

        lTl
          .from(
            locationsSection.querySelectorAll('.area-tab'),
            {
              x: -25,
              autoAlpha: 0,
              stagger: 0.08,
              duration: 0.7,
              ease: EASE_LUXURY,
            },
            '-=0.3',
          )
          .from(
            locationsSection.querySelectorAll('[role="tabpanel"]:not([hidden])'),
            {
              y: 30,
              autoAlpha: 0,
              duration: 0.8,
              ease: EASE_LUXURY,
            },
            '<0.2',
          );
      }

      // ======================================================================
      // 15. ARTICLES PREVIEWS (#blog)
      // ======================================================================
      const blogSection = document.querySelector('#blog');
      if (blogSection) {
        const blTl =
          animateSectionIntro('#blog') ||
          gsap.timeline({
            scrollTrigger: { trigger: blogSection, start: 'top 78%', once: true },
          });

        blTl.from(
          blogSection.querySelectorAll('article'),
          {
            y: 45,
            scale: 0.96,
            autoAlpha: 0,
            stagger: 0.15,
            duration: 0.85,
            ease: EASE_LUXURY,
          },
          '-=0.3',
        );
      }

      // ======================================================================
      // 16. EMERGENCY CALL BANNER 2 (#emergency-call)
      // ======================================================================
      const emergencyCallSection =
        document.querySelector('#emergency-call') ||
        document.querySelector('[aria-labelledby="emergency-heading"]');
      if (emergencyCallSection) {
        const emTl = gsap.timeline({
          scrollTrigger: {
            trigger: emergencyCallSection,
            start: 'top 80%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        emTl
          .from(emergencyCallSection.querySelectorAll('h2, p, a[href^="tel:"]'), {
            y: 30,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.85,
          })
          .from(
            emergencyCallSection.querySelector('img'),
            {
              x: 40,
              autoAlpha: 0,
              duration: 0.95,
            },
            '<0.2',
          );
      }

      // ======================================================================
      // 17. CONTACT & FINAL FORM (#contact)
      // ======================================================================
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        const ctTl = gsap.timeline({
          scrollTrigger: {
            trigger: contactSection,
            start: 'top 80%',
            once: true,
          },
          defaults: { ease: EASE_LUXURY },
        });

        ctTl
          .from(contactSection.querySelector('.border.border-line.bg-white'), {
            y: 60,
            scale: 0.97,
            autoAlpha: 0,
            duration: 1.0,
          })
          .from(
            contactSection.querySelectorAll('form label, form button'),
            {
              y: 25,
              autoAlpha: 0,
              stagger: 0.08,
              duration: 0.65,
              ease: EASE_LUXURY,
            },
            '<0.3',
          );
      }

      // ======================================================================
      // 18. FOOTER
      // ======================================================================
      const footer = document.querySelector('footer');
      if (footer) {
        gsap.from(footer.querySelectorAll('.site-container > div:first-child > div'), {
          scrollTrigger: {
            trigger: footer,
            start: 'top 85%',
            once: true,
          },
          y: 35,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 0.85,
          ease: EASE_LUXURY,
        });
      }

      // ======================================================================
      // 19. FLOATING MOBILE CALL BUTTON (#mobile-call)
      // ======================================================================
      const mobileCall = document.querySelector('#mobile-call');
      if (mobileCall) {
        gsap.fromTo(
          mobileCall,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: EASE_SPRING,
            scrollTrigger: {
              trigger: '#main',
              start: 'top -300px',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }

      // ======================================================================
      // ANIMATED DIGIT COUNTERS
      // ======================================================================
      document.querySelectorAll('[data-counter]').forEach((el) => {
        const originalText = el.textContent.trim();
        const suffixMatch = originalText.match(/[^0-9.]+$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        const prefixMatch = originalText.match(/^[^0-9.]+/);
        const prefix = prefixMatch ? prefixMatch[0] : '';

        const parsedFromText = parseFloat(originalText.replace(/[^0-9.]/g, ''));
        const parsedFromData = parseFloat(el.dataset.counter);
        const targetVal = !isNaN(parsedFromText) ? parsedFromText : parsedFromData;

        if (!isNaN(targetVal)) {
          const counterObj = { val: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(counterObj, {
                val: targetVal,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = `${prefix}${Math.round(counterObj.val)}${suffix}`;
                },
              });
            },
          });
        }
      });
    }

    // ========================================================================
    // TACTILE, SENIOR-LEVEL HOVER INTERACTIONS (DESKTOP)
    // ========================================================================
    if (hoverPointer && hoverPointer.matches) {
      // 1. Primary Buttons (.button, .button-sheen, form buttons)
      document
        .querySelectorAll('.button, [data-demo-form] button[type="submit"]')
        .forEach((btn) => {
          const arrow = btn.querySelector('span[aria-hidden="true"]');
          const xTo = gsap.quickTo(btn, 'x', { duration: 0.3, ease: EASE_SMOOTH });
          const yTo = gsap.quickTo(btn, 'y', { duration: 0.3, ease: EASE_SMOOTH });

          btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - (rect.left + rect.width / 2)) * 0.16;
            const y = (e.clientY - (rect.top + rect.height / 2)) * 0.16;
            xTo(x);
            yTo(y);
          });

          btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
              scale: 1.02,
              boxShadow: '0 12px 28px -6px rgba(1, 144, 214, 0.42)',
              duration: 0.28,
              ease: EASE_SMOOTH,
            });
            if (arrow) gsap.to(arrow, { x: 5, duration: 0.25, ease: EASE_SMOOTH });
          });

          btn.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
            gsap.to(btn, {
              scale: 1,
              boxShadow: '0 0 0 0 rgba(0,0,0,0)',
              duration: 0.35,
              ease: 'power2.out',
            });
            if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: 'power2.out' });
          });
        });

      // 2. Service Cards (.service-card)
      document.querySelectorAll('.service-card').forEach((card) => {
        const img = card.querySelector('.service-summary img');
        const heading = card.querySelector('.service-summary .service-heading');
        const arrowCircle = card.querySelector('.service-summary span[aria-hidden="true"]');

        card.addEventListener('mouseenter', () => {
          if (img) gsap.to(img, { scale: 1.09, duration: 0.55, ease: EASE_SMOOTH });
          if (heading) gsap.to(heading, { y: -5, duration: 0.35, ease: EASE_SMOOTH });
          if (arrowCircle) {
            gsap.to(arrowCircle, {
              scale: 1.18,
              backgroundColor: '#0190d6',
              borderColor: '#0190d6',
              duration: 0.3,
              ease: 'back.out(2)',
            });
          }
        });

        card.addEventListener('mouseleave', () => {
          if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
          if (heading) gsap.to(heading, { y: 0, duration: 0.35, ease: 'power2.out' });
          if (arrowCircle) {
            gsap.to(arrowCircle, {
              scale: 1,
              backgroundColor: 'transparent',
              borderColor: '#ffffff',
              duration: 0.35,
              ease: 'power2.out',
            });
          }
        });
      });

      // 3. Guarantee Cards (.guarantee-card)
      document.querySelectorAll('.guarantee-card').forEach((card) => {
        const icon = card.querySelector('.icon');
        const h3 = card.querySelector('h3');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.16)',
            duration: 0.32,
            ease: EASE_SMOOTH,
          });
          if (icon) gsap.to(icon, { scale: 1.18, y: -4, duration: 0.32, ease: 'back.out(2)' });
          if (h3) gsap.to(h3, { color: '#0190d6', duration: 0.25 });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: '0 0 0 0 rgba(0,0,0,0)',
            duration: 0.38,
            ease: 'power2.out',
          });
          if (icon) gsap.to(icon, { scale: 1, y: 0, duration: 0.35, ease: 'power2.out' });
          if (h3) gsap.to(h3, { color: '', duration: 0.25 });
        });
      });

      // 4. Benefit Cards (.benefit)
      document.querySelectorAll('.benefit').forEach((card) => {
        const circle = card.querySelector('.benefit-circle');
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -6, duration: 0.3, ease: EASE_SMOOTH });
          if (circle)
            gsap.to(circle, { scale: 1.08, rotation: 6, duration: 0.35, ease: EASE_SPRING });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
          if (circle)
            gsap.to(circle, { scale: 1, rotation: 0, duration: 0.35, ease: 'power2.out' });
        });
      });

      // 5. Testimonial Cards (#testimonials article)
      document.querySelectorAll('#testimonials article').forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -6,
            borderColor: '#0190d6',
            boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)',
            duration: 0.32,
            ease: EASE_SMOOTH,
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            borderColor: '',
            boxShadow: 'none',
            duration: 0.38,
            ease: 'power2.out',
          });
        });
      });

      // 6. Blog Article Previews (#blog article)
      document.querySelectorAll('#blog article').forEach((card) => {
        const img = card.querySelector('img');
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -6,
            boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)',
            duration: 0.32,
            ease: EASE_SMOOTH,
          });
          if (img) gsap.to(img, { scale: 1.05, duration: 0.45, ease: EASE_SMOOTH });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            boxShadow: 'none',
            duration: 0.38,
            ease: 'power2.out',
          });
          if (img) gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
        });
      });

      // 7. Social Links (.social-link)
      document.querySelectorAll('.social-link').forEach((link) => {
        link.addEventListener('mouseenter', () => {
          gsap.to(link, { y: -5, scale: 1.15, duration: 0.28, ease: 'back.out(2.2)' });
        });
        link.addEventListener('mouseleave', () => {
          gsap.to(link, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
      });

      // 8. Area List Links (.area-list a)
      document.querySelectorAll('.area-list a').forEach((a) => {
        a.addEventListener('mouseenter', () => {
          gsap.to(a, { x: 6, color: '#0190d6', duration: 0.22, ease: 'power2.out' });
        });
        a.addEventListener('mouseleave', () => {
          gsap.to(a, { x: 0, color: '', duration: 0.28, ease: 'power2.out' });
        });
      });
    }
  });
}
