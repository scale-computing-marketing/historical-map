# Learning Atlas

An interactive, museum-quality **educational hub**. Each subject is explored the way it's best understood — history as a living map you scrub through year by year, biology as diagrams and interactive models you click into — all sharing one design language and one set of reusable UI.

Two subjects are live today:

- **🗺️ History — Historical Wars Explorer.** Six conflicts (French & Indian War → World War II) with animated borders, battles, leaders and treaties on an interactive world map. Answers *“what did the world look like in this year?”* rather than *“where was this battle?”*
- **🧬 Biology — Life Explorer.** Four topics — the Animal Cell, the Tree of Life, the Human Body, and an interactive Genetics (Punnett square) tool — as clickable diagrams and models.

More subjects (Mathematics, English, Chemistry, Geography) are scaffolded on the hub as *coming soon*.

## Run it

It's a **static site — no build step, no dependencies to install.**

```sh
# from the repo root
python3 -m http.server 8000
# then visit http://localhost:8000/
```

`python3 -m http.server` (and GitHub Pages) automatically serve `index.html` for a directory URL, so the hub's links to `subjects/history/` and `subjects/biology/` just work. To publish, enable **GitHub Pages** (Settings → Pages → deploy from `main` / root).

Opening an individual page directly from a clone over `file://` also works (e.g. `subjects/biology/index.html`); only the hub's directory-style card links need an HTTP server. An internet connection is required — map basemaps and the D3 libraries load from public CDNs.

## Repository structure

```
index.html              Hub home — the subject cards
core/
  theme.css             Shared design system: tokens (light/dark), top bar,
                        info rail, tabs, cards, quiz modal
  shell.js              Shared UI widgets: Atlas.Rail, Atlas.Quiz, menus, search
subjects/
  history/              Historical Wars Explorer (self-contained)
    index.html
    app/                engine.js, app.js, styles.css, data/<war>.js
  biology/              Life Explorer (self-contained)
    index.html
    explorer.js         Renders diagram + tool topics; composes the Atlas shell
    styles.css          Biology-specific styles (diagrams, Punnett tool)
    data/<topic>.js     cell, tree-of-life, body-systems, genetics
DESIGN.md               Design & architecture of the History subject
```

## Architecture in one idea

**A hub shell + a shared core + self-contained subject modules.**

Everything subject-agnostic lives in [`core/`](core): the design tokens and the reusable UI (`core/theme.css`), and the framework-free widgets (`core/shell.js`) — a sliding info **Rail**, a **Quiz** modal, dropdown menus and search. Each subject under [`subjects/`](subjects) brings its own *canvas* (history's is a D3 map; biology's is a diagram/tool explorer) but composes those shared pieces, so every subject looks and behaves like part of one Atlas.

Within a subject, **content is data, not code.** A war is a `subjects/history/app/data/<war>.js` file that registers on `window.HWE.wars`; a biology topic is a `subjects/biology/data/<topic>.js` file that registers on `window.BIO.topics`. Adding content is a data change — no engine edits.

## One repo, on purpose

The whole Atlas lives in **a single repository (a monorepo).** For a buildless static site with a shared core, that's the sweet spot:

- The core stays **trivially shared** — subjects just link `../../core/…`; no versioning, submodules or publish step to keep in sync.
- Changes are **atomic** — update the design system and every subject in one commit, so nothing drifts.
- It's **one deploy, one URL** — hub → subject links are plain relative paths.

### Conventions that keep it healthy at scale

1. **Subject isolation.** A subject depends only on `core/`, never on another subject. This keeps things comprehensible *and* makes a future `git filter-repo` extraction clean if one subject ever needs its own repo.
2. **Content is small, per-item, lazy-loaded.** One data file per war/topic; a visitor loads only the subject they open, so repo growth never affects page weight.
3. **Heavy assets by URL, not committed.** The real bloat risk in a content site is binaries, not text. Reference large images/audio/video/datasets from a CDN or object store (as the history basemaps already load from jsdelivr); if an asset must be versioned, use **git-LFS** so it stays out of normal history. This keeps the repo lean no matter how many subjects are added.

## How to extend it

**Add a topic to Biology** — create `subjects/biology/data/<topic>.js` that registers on `window.BIO.topics`, then add its `<script>` tag in `subjects/biology/index.html`. Two kinds are supported:

- `kind:'diagram'` — supply an SVG whose elements carry `data-part` attributes plus a `parts` array; the explorer wires clicks to the info rail automatically.
- `kind:'tool'` — supply a `mount(canvas, api)` function for a custom interactive (as the Genetics Punnett square does).

**Add a new subject** — create `subjects/<name>/` with an `index.html` that links `../../core/theme.css` and `../../core/shell.js`, build its explorer against the Atlas shell, and add a card on the hub home. (Once a third subject lands, the hub renders its cards from a `subjects.json` manifest, so this becomes a one-entry change.)

## Credits & sources

- **History** basemap geometry: [Natural Earth](https://www.naturalearthdata.com/) (public domain) and [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps); US-state outlines (Civil War) from US Census-derived data. Historical content is sourced — see each war's **Sources** tab and [`DESIGN.md`](DESIGN.md). Where historians disagree, ranges and confidence levels are shown rather than invented precision.
- **Biology** diagrams are original schematic illustrations built for clarity, not anatomical precision.
