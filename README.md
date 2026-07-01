# Learning Atlas

An interactive, museum-quality **educational hub**. Each subject is explored the way it's best understood — history as a living map you scrub through year by year, biology and maths as knowledge maps of interactive lessons you explore and master — all sharing one design language and one set of reusable UI.

Three subjects are live today:

- **🗺️ History — Historical Wars Explorer.** Eight conflicts (French & Indian War → the Cold War) with animated borders, battles, leaders and treaties on an interactive world map. Answers *“what did the world look like in this year?”* rather than *“where was this battle?”*
- **🧬 Biology — Life Explorer.** A *knowledge map* of twelve units from *“what is life?”* to biotechnology: 47 interconnected concepts where mastering one unlocks the next. 18 concepts have full interactive lessons (characteristics of life, the scientific method, cell theory, organelles, plant vs animal cells, the membrane, diffusion & osmosis, photosynthesis, respiration, DNA, inheritance, natural selection, taxonomy, food chains, populations, body systems…), each following an *explore → discover → practice → challenge → master* flow with 10 reusable simulations (sort, sequence, match, sliders you drag to drive photosynthesis / osmosis / natural selection / population growth, a DNA base-pair builder, a Punnett cross and a food-chain builder), star-based mastery and progress tracking. The original clickable diagrams, the 3-D plant cell and the Punnett tool live on as the hands-on *Explore* surface inside lessons — and stay browsable from the **Explore ▾** menu.
- **➗ Mathematics — Math Explorer.** A *knowledge map* from Kindergarten to Calculus: 37 interconnected concepts where mastering one unlocks the next. 18 concepts have full interactive lessons (counting, comparing, patterns, shapes, ten-frame addition, number lines, place value, skip counting, arrays, fractions, multiplication, area, the coordinate plane, integers, function machines…), each following an *explore → discover → practice → challenge → master* flow with 14 reusable manipulatives — including **Montessori materials** (number rods, golden beads with number cards, drag-and-drop sorting and a three-period naming activity) — plus star-based mastery and progress tracking.

More subjects (English, Chemistry, Geography) are scaffolded on the hub as *coming soon*.

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
index.html              Hub home — renders subject cards from the manifest
subjects.json           Manifest of subjects (drives the hub cards)
core/
  theme.css             Shared design system: tokens (light/dark), top bar,
                        info rail, tabs, cards, quiz modal
  shell.js              Shared UI widgets: Atlas.Rail, Atlas.Quiz, menus, search
subjects/
  history/              Historical Wars Explorer (self-contained)
    index.html
    app/                engine.js, app.js, styles.css, data/<war>.js
  biology/              Life Explorer (self-contained learning engine)
    index.html
    engine/             store.js (progress), graph.js (12-unit knowledge graph),
                        components.js (10 reusable simulations),
                        player.js (the lesson flow), map.js (the learning map),
                        app.js (boot + map/lesson/browse views + progress panel)
    explorer.js         BIO.Explorer — renders a topic's diagram/model/tool canvas;
                        reused by Browse mode and the diagram-based simulations
    styles.css          Biology palette, map, lesson flow, simulations, diagrams
    data/               concepts.js (the knowledge graph) + lessons-*.js;
                        topic data cell, plant-cell, tree-of-life, body-systems, genetics
  math/                 Math Explorer (self-contained learning engine)
    index.html
    engine/             store.js (progress), graph.js (knowledge graph),
                        components.js (14 reusable manipulatives),
                        player.js (the lesson flow), map.js (the learning map),
                        app.js (boot + progress panel)
    data/               concepts.js (the K–Calculus graph) + lessons-*.js
    styles.css          Math palette, map, lesson flow, component styles
DESIGN.md               Design & architecture of the History subject
```

## Architecture in one idea

**A hub shell + a shared core + self-contained subject modules.**

Everything subject-agnostic lives in [`core/`](core): the design tokens and the reusable UI (`core/theme.css`), and the framework-free widgets (`core/shell.js`) — a sliding info **Rail**, a **Quiz** modal, dropdown menus and search. Each subject under [`subjects/`](subjects) brings its own *canvas* (history's is a D3 map; maths and biology run a knowledge-graph learning engine — a map, a lesson player and reusable interactive components — with biology also reusing its clickable diagrams/models as an exploration surface) but composes those shared pieces, so every subject looks and behaves like part of one Atlas.

Within a subject, **content is data, not code.** A war is a `subjects/history/app/data/<war>.js` file that registers on `window.HWE.wars`. Biology and Maths go one step further with the same engine shape: a *concept* is a node registered on the knowledge graph (`BIO.Graph.add` / `MATH.Graph.add`) and a *lesson* is a step-list registered by concept id (`BIO.Player.register` / `MATH.Player.register`), so both the curriculum map and its lessons are pure data over a shared engine. Biology also keeps its original clickable *topics* (`window.BIO.topics`) — the cell diagram, the 3-D plant cell, the Tree of Life, the body diagram and the Punnett tool — which double as the hands-on *Explore* surface inside lessons. Adding content is a data change — no engine edits.

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

**Add a concept or lesson to Biology** — the curriculum is a knowledge graph, exactly like Maths, so there are two independent data changes:

- **A concept (map node):** call `BIO.Graph.add({ id, name, unit, strand, prereqs:[…], blurb, lesson:true, explore:'<topicId>' })` in `subjects/biology/data/concepts.js`. It appears on the map immediately; `prereqs` decide what unlocks it, `unit` is its column and `strand` its colour. Leave `lesson` off for a visible-but-coming-soon node. `explore` optionally links a reusable topic diagram.
- **Its lesson:** call `BIO.Player.register({ concept:'<id>', title, hook, steps:[…] })` in a `data/lessons-*.js` file. Steps follow the flow (`explore`/`discover`/`practice`/`challenge`/`mastery`); interactive steps name a reusable simulation (`sortCards`, `orderList`, `matchPairs`, `simSlider`, `buildSequence`, `punnettCross`, `foodChain`, `diagramExplore`, `labelHunt`, `problemSet`) and pass a small `config`. Add a new simulation once with `BIO.Components.register(name, { mount(host, config, ctx) })` and every lesson can use it.

**Add a browsable topic to Biology** — create `subjects/biology/data/<topic>.js` that registers on `window.BIO.topics`, then add its `<script>` tag in `subjects/biology/index.html`. It appears in the **Explore ▾** menu and can be reused inside lessons via the `diagramExplore` / `labelHunt` simulations. Kinds supported: `kind:'diagram'` (an SVG whose elements carry `data-part` attributes plus a `parts` array — clicks wire to the info rail automatically), `kind:'model3d'` (a GLB with `hotspots`), `kind:'embed'` (an iframe), and `kind:'tool'` (a custom `mount(canvas, api)` interactive, as the Genetics Punnett square does).

**Add a concept or lesson to Mathematics** — the curriculum is a knowledge graph, so there are two independent data changes:

- **A concept (map node):** call `MATH.Graph.add({ id, name, grade, strand, prereqs:[…], blurb, lesson:true })` in `subjects/math/data/concepts.js`. It appears on the map immediately; `prereqs` decide what unlocks it. Leave `lesson` off for a visible-but-coming-soon node.
- **Its lesson:** call `MATH.Player.register({ concept:'<id>', title, hook, steps:[…] })` in a `data/lessons-*.js` file. Steps are ordered by the flow (`explore`/`discover`/`practice`/`challenge`/`mastery`); interactive steps name a reusable component (`counter`, `numberLine`, `arrayBuilder`, `fractionPizza`, `functionMachine`, `problemSet`, …) and pass a small `config`. Add a new manipulative once with `MATH.Components.register(name, { mount(host, config, ctx) })` and every lesson can use it.

**Add a new subject** — create `subjects/<name>/` with an `index.html` that links `../../core/theme.css` and `../../core/shell.js`, build its explorer against the Atlas shell, then add an entry to [`subjects.json`](subjects.json) — the hub renders its cards from that manifest, so no HTML edits are needed. Use `"status": "live"` with an `"href"` to link it, or `"status": "soon"` for a coming-soon placeholder.

## Credits & sources

- **History** basemap geometry: [Natural Earth](https://www.naturalearthdata.com/) (public domain) and [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps); US-state outlines (Civil War) from US Census-derived data. Historical content is sourced — see each war's **Sources** tab and [`DESIGN.md`](DESIGN.md). Where historians disagree, ranges and confidence levels are shown rather than invented precision.
- **Biology** diagrams are original schematic illustrations built for clarity, not anatomical precision.
- **Mathematics** is organised around a knowledge graph rather than a rigid grade ladder: grades are recommended paths, but mastery of a concept’s prerequisites is what unlocks it, so learners can accelerate, branch, or be sent back to a prerequisite for review. All progress is stored locally in the browser.
