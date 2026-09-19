# CedarFlow image sources

Open http://localhost:3001/image-review/index.html to browse current images.

- 01-hero: approved transparent full-length portrait. The homepage crops its display at the hips, flush with the hero section bottom. A regenerated crop failed alpha validation, so the working original is preserved.
- 02-services: 12 service scenes, including four version-2 scenes featuring the female and bearded teammates.
- 04-company: company and background photographs.
- 05-gallery: four illustrative project scenes.
- 06-portraits: fictional sample-review portraits.

All generated images use the built-in image tool. Exact prompts and source paths are in manifest.json; teammate update prompts are also in team-updates.json. Live copies are in assets/images/. Superseded service images and six failed cutout drafts have been removed. The full-length hero remains in use in other homepage sections.

Run `node image-review/build.mjs` to rebuild the review gallery. All people and project scenes are AI-generated fictional illustrations.
