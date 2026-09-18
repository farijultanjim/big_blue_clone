# Source design inventory

Source: https://bigblueplumbing.au/ (retrieved 2026-09-18).

## Confirmed from source styles

- Body: Inter Regular, 16px baseline, line-height 1.7, color #031b35.
- Headings: Inter Extra Bold, uppercase.
- Navigation and buttons: Inter Semi Bold, uppercase.
- Handwritten preheadings: Better Times, brand blue, nominal size 2.2em.
- Main blue: #0190d6; deep navy: #031b35; dark navy: #04162c.
- Pale section background: #eaf2f5; light borders: #d0deee.
- Review badge: #0f725b.
- Base buttons: square corners, 18px 26px padding, 2px brand border; transparent background on hover.
- Source responsive thresholds include 576, 768, 992, 1200, and 1400px. These are configured as Tailwind breakpoints so subsequent stages can reproduce the source transitions.
- Desktop hero uses a background on the right half, an overlapping person cutout, review badge, and testimonial panel. Mobile rules hide the person cutout and use a background overlay. Precise rendered positioning remains to be checked.

## Homepage sequence

Utility bar; navigation; hero; three benefits; quote form and reviews; 12 services; three reasons; Brighte financing; phone CTA; company introduction; six guarantees; testimonials; job/project gallery; four-step process; service-area tabs; three blog cards; final call/form area; review-platform logos; newsletter and footer; call control.

## Implementation boundaries

Only the homepage is in scope. Preserve visible navigation items during reconstruction; decide destinations for links to excluded pages with the user. Form destinations are not configured yet. Source analytics and live lead submission endpoints must not be copied into the local review build.

## Pending evidence

Full-page desktop and mobile reference captures, menu states, carousel behavior, source image crops, and final visual comparison. No claim of pixel accuracy until those checks are complete.

## Stage 3 asset correction

The original financing `data-src` is malformed (`imagesbig-blue-finance.png`, HTTP 404). Its `data-srcset` provides the valid original asset at https://zeve.au/bigblue/themes/bigblue/images/big-blue-finance.png. Downloaded that image to `assets/images/big-blue-finance.png` and used it in Stage 3.

Stage 3 preserves original service destinations and source service descriptions. New layout uses Tailwind and existing local assets. Service details use native HTML details with small vanilla-JavaScript hover enhancements; no carousel dependency was added.
