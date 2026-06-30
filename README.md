# Historical Wars Explorer

An interactive, museum-quality atlas for understanding wars throughout history. It answers **“what did the world look like in this year?”** rather than “where was this battle?” — showing a war as one layer inside a living historical world you can scrub through year by year.

It ships with three conflicts you can switch between from the **War** menu — the **American Revolutionary War (1775–1783)** (the reference implementation), the **American Civil War (1861–1865)**, and **World War I (1914–1918)** — and is built so any further war is added as data, not code.

## Run it

It's a static site — no build step.

- **Easiest:** open it served over HTTP. From this folder:
  ```sh
  python3 -m http.server 8000
  # then visit http://localhost:8000/
  ```
- **GitHub Pages:** enable Pages on this repo (Settings → Pages → deploy from `main` / root) and it will be served automatically.
- Opening `index.html` directly from a full local clone (`file://`) also works, as long as the `app/` folder is alongside it.

It needs an internet connection: the historical basemap and the D3 libraries load from public CDNs.

## What's here

| Path | What it is |
|------|------------|
| `index.html` | The application shell. |
| `app/styles.css` | Atlas styling (light + dark). |
| `app/engine.js` | **War-agnostic** engine — the Temporal Resolver, search, quiz logic. Knows nothing about any specific war. |
| `app/app.js` | Presentation — map rendering, timeline, panels, state synchronization. |
| `app/data/american-revolution.js` | The Revolutionary War, as pure data. |
| `app/data/american-civil-war.js` | The Civil War, as pure data (US-state geometry, Union/Confederacy/border factions). |
| `app/data/world-war-1.js` | World War I, as pure data (1914 world basemap, Allied/Central/neutral factions). |
| `DESIGN.md` | The full design & architecture document, in Markdown (readable on GitHub, diff-friendly). |
| `design-document.html` | The same document, richly formatted with wireframes and a live embedded reference map (open in a browser). |

## Architecture in one idea

**Data is fully separated from a war-agnostic engine.** Adding a war means dropping in another `app/data/<war>.js` file (and one `<script>` tag) shaped like `american-revolution.js` — no changes to the engine or the app. Each war supplies its own factions, side labels, map geometry, and projection, so the Civil War colors US *states* by allegiance while the Revolution and World War I color *world* polities, all through the same engine. Scrubbing the WWI timeline shows the alliances shift — Italy joins in 1915, the US in 1917, and Russia drops out after its 1917 revolution. Entities exist once; their facts carry validity intervals, sources, and confidence, and are resolved for the selected year (e.g. France reads *“not involved”* in 1776 but *“active belligerent”* in 1778).

Rendering uses [D3-geo](https://github.com/d3/d3-geo) (Robinson projection by default) over period basemaps. The Civil War uses modern US-state outlines as a labeled teaching approximation.

## Status

Phase 1 (reference implementation) — working: year-driven map, four layers, seven info tabs, “world at this time,” search, and quizzes. The **second and third conflicts (Civil War, World War I)** land the design doc's Phase 3 goal — wars added by data alone. Known simplifications (single period geometry per war reused across the window; modern US-state outlines for the Civil War; curated world-context; deferred mobile polish) are documented in the design document and surfaced in-app.

## Credits & sources

- Basemap geometry: [Natural Earth](https://www.naturalearthdata.com/) (public domain) and [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) (`world_1783`, `world_1914`); US-state outlines from [PublicaMundi/MappingAPI](https://github.com/PublicaMundi/MappingAPI) (US Census-derived) for the Civil War.
- Historical content is sourced; see the **Sources** tab in the app and the design document. Where historians disagree, ranges and confidence levels are shown rather than invented precision.
