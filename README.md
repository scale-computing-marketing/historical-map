# Historical Wars Explorer

An interactive, museum-quality atlas for understanding wars throughout history. It answers **“what did the world look like in this year?”** rather than “where was this battle?” — showing a war as one layer inside a living historical world you can scrub through year by year.

The first implementation is the **American Revolutionary War (1775–1783)**, built as the reference implementation for all future conflicts.

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
| `app/data/american-revolution.js` | The war, as pure data. |
| `design-document.html` | The full design & architecture document (open in a browser). |

## Architecture in one idea

**Data is fully separated from a war-agnostic engine.** Adding a future war means adding another `app/data/<war>.js` file shaped like `american-revolution.js` — no changes to the engine or the app. Entities exist once; their facts carry validity intervals, sources, and confidence, and are resolved for the selected year (e.g. France reads *“not involved”* in 1776 but *“active belligerent”* in 1778).

Rendering uses [D3-geo](https://github.com/d3/d3-geo) (Robinson projection by default) over a period-accurate 1783 basemap.

## Status

Phase 1 (reference implementation) — working: year-driven map, four layers, seven info tabs, “world at this time,” search, and quizzes. Known simplifications (a single 1783 border geometry reused across the window; curated world-context; deferred mobile polish) are documented in the design document and surfaced in-app.

## Credits & sources

- Basemap geometry: [Natural Earth](https://www.naturalearthdata.com/) (public domain) and [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) (`world_1783`).
- Historical content is sourced; see the **Sources** tab in the app and the design document. Where historians disagree, ranges and confidence levels are shown rather than invented precision.
