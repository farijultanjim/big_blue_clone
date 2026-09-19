# CedarFlow Plumbing

A static homepage built with HTML, Tailwind CSS 4, and vanilla JavaScript.

## Run locally

```sh
npm install
npm start
```

Open **http://localhost:3001**. The preview server listens only on this computer. You can also open `index.html` directly because the compiled CSS and assets are local.

## Project structure

```text
index.html                 Homepage content, with numbered section comments
assets/
  site-config.js           Business details, sample reviews, image overrides
  site.js                  Page interactions, grouped by feature
  site.css                 Generated Tailwind CSS; do not edit directly
  images/                  Images currently used by the homepage
  fonts/                   Local fonts and icon font
styles/
  theme.css                Global colors, typography, fonts, component styles
scripts/
  check.mjs                DOM interaction, structure, and asset checks
preview.mjs                Local preview server
```

## Editing

- **Page sections:** edit `index.html`. Its index lists all 19 sections. Search for `05. SERVICES` or `09. ABOUT` to jump to a section.
- **Business details and rotating reviews:** edit `assets/site-config.js`, then refresh the browser.
- **Images:** change an entry in `SITE_CONFIG.images`. Keys are existing filenames; values are replacement paths. This also controls the hero and process backgrounds.
- **Colors and fonts:** edit the centralized theme in `styles/theme.css`, then rebuild.
- **Other text:** service descriptions, static testimonial cards, and article previews live in `index.html`.

## Commands

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm start`            | Serve the homepage on port 3001                        |
| `npm run build`        | Rebuild the compiled CSS                               |
| `npm run watch`        | Rebuild CSS automatically while editing                |
| `npm run format`       | Format the editable source files                       |
| `npm run format:check` | Check formatting without changing files                |
| `npm run check`        | Check JavaScript, interactions, links, IDs, and assets |

Run the build after changing HTML utility classes or theme styles. All npm packages are development dependencies; none are loaded by the browser.

## Current content and behavior

CedarFlow Plumbing is a fictional demo company. Its contact details, service locations, and customer stories are placeholders. Original images and logos remain pending the image-replacement stage.

The quote, contact, and newsletter forms validate locally and show demo confirmations. They do not send data. Navigation stays on the homepage; phone and email links use the configured contact details.

Service cards support mouse hover, tap, and keyboard controls. Region tabs support Up/Down, Home, and End. Reviews and the project gallery have pause controls and respect reduced-motion preferences.

## Verification and publishing

Automated checks cover the page structure, local assets, rebranding, menus, reviews, forms, search, region tabs, and gallery controls. They do not verify rendered layouts or browser-native form validation. Desktop/mobile visual verification is still required.

Publish only `index.html` and `assets/` for static hosting. Before launch, replace placeholder business content and images, connect the forms, review contact destinations, and remove the preview's `noindex` meta tag.
