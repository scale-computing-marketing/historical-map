# Historical Wars Explorer — Design & Architecture

**Design & Architecture Document · v1**

> **Context.** This document describes the **History** subject (the *Historical Wars Explorer*)
> within the broader **Learning Atlas** hub. The Atlas is a single-repository, buildless
> educational site: a shared design system and reusable UI live in [`core/`](core), and each
> subject is a self-contained module under [`subjects/`](subjects) that composes them. History
> lives at [`subjects/history/`](subjects/history); see the [README](README.md) for the hub
> structure and conventions. Everything below is the design of the History subject specifically —
> its map, temporal model, and data schema.

> This is the Markdown edition of the design document. A richly formatted version with
> wireframes and an embedded live reference map lives in
> [`design-document.html`](design-document.html) (open it in a browser). The two are kept
> in sync; this file is the diff-friendly, GitHub-readable source of record.

An interactive, museum-quality atlas for understanding wars through history — beginning with
the American Revolutionary War (1775–1783) as the reference implementation, architected so any
future conflict is added by importing data, not changing code.

Answering *“What did the world look like during this year?”* rather than *“Where was this
battle?”* · Robinson projection · vector-only · data-driven · accessible.

**How to read this.** Deliverables are presented in the requested order (1–15), with two
recommendation sections folded in where they belong: the technology stack (after architecture)
and the map-data source evaluation (within the data strategy). Implementation begins only after
this plan is approved.

## Contents

- [The reference map](#the-reference-map--already-built)
- [1. Product vision](#1-product-vision)
- [2. User experience](#2-user-experience)
- [3. Three UI concepts](#3-three-ui-concepts)
- [4. Concept comparison](#4-concept-comparison)
- [5. Recommendation](#5-recommendation)
- [6. Application architecture](#6-application-architecture)
- [6b. Technology stack](#6b-technology-stack)
- [7. Data model & database](#7-data-model--database)
- [8. Folder structure](#8-folder-structure)
- [9. Component hierarchy](#9-component-hierarchy)
- [10. Historical data strategy](#10-historical-data-strategy)
- [10b. Map data sources](#10b-historical-map-data-sources)
- [11. Border strategy](#11-historical-border-strategy)
- [12. Map rendering](#12-map-rendering-strategy)
- [13. UI mockups](#13-ui-mockups)
- [14. Roadmap](#14-development-roadmap)
- [15. Phase 1 plan](#15-phase-1-implementation-plan)
- [Final principle](#final-design-principle)

---

## The reference map — already built

This is the map we created together, restyled into the proposed atlas aesthetic (muted
parchment, Robinson projection, per-nation allegiance colors). It is interactive: **hover** any
territory, **click** to select it (dark-navy outline), and toggle the four Version 1 layers. It
runs on the same period-accurate 1783 dataset we validated. Everything in this document is
designed to grow outward from exactly this.

The live, interactive version of this reference map is embedded at the top of
[`design-document.html`](design-document.html).

Reference implementation preview · basemap: Natural Earth graticule +
[historical-basemaps](https://github.com/aourednik/historical-basemaps) (`world_1783`). The full
app replaces the single 1783 snapshot with a temporal sequence; see §11–12.

---

## 1. Product vision

The definitive interactive atlas for understanding wars throughout history — Google Earth’s
explorability, Wikipedia’s depth, National Geographic’s craft, and a Civilopedia’s sense of a
living, connected world, built for teaching.

Most war media is event-centric: a battle, a date, a general. Historical Wars Explorer is
**world-centric and time-centric**. A war is shown as one layer inside a living historical world
that the learner can scrub through year by year. The defining question is always *“What did the
world look like in this year, and how did this conflict fit into it?”*

- **For learners** — Students and the curious explore freely, see cause and consequence in
  context, and leave understanding *why*, not just *when*.
- **For teachers** — A classroom-ready instrument: project it, scrub the timeline, click a
  country, run a quick quiz. No prep, no clutter.
- **For historians** — Every fact is sourced and every uncertainty is shown honestly as ranges
  and confidence — never invented precision.

### Principles that constrain the product

- **Educational value beats feature count.** If a feature adds complexity without improving
  understanding, it is cut.
- **Honesty about uncertainty.** Where historians disagree, we present both readings and a
  confidence signal.
- **Data, not code.** Wars are content. The application is an engine that renders any conflict
  expressed in the schema.
- **Museum, not dashboard.** Calm, legible, beautiful. It should feel like National Geographic,
  not GIS software or a strategy game.

---

## 2. User experience

### Audiences

| Persona | Goal | Primary path |
|---------|------|--------------|
| Middle/high-school student | Understand the war for class; satisfy curiosity | Land → scrub years → click highlighted countries → read Overview → take a quiz |
| Teacher | Explain visually, live, in front of a class | Jump to a year → toggle layers → click a battle → “World at this time” |
| Enthusiast / lifelong learner | Deep, connected exploration | Search a leader/treaty → follow links across entities → compare concurrent conflicts |
| Researcher / educator-author | Verify, cite, and (later) contribute data | Open Sources tab → trace each claim → export citations |

### The core loop

Everything orbits one synchronized state: `{ year, selectedEntity, activeConflicts, activeLayers }`.
Any change re-derives the whole experience.

```
Choose a year  ──▶  map borders + colors + cities + battles update
        │                         │
        ▼                         ▼
Select an entity  ──▶  information panel + map focus update
        │                         │
        ▼                         ▼
"World at this time"  ◀──  context recomputed for the year
        │
        ▼
Optional: quiz / search / compare conflicts
```

### First-load experience (the 10-second promise)

1. A beautiful Robinson world resolves in, already set to a meaningful year (1778 — the year
   France enters).
2. One gentle prompt: *“Drag the timeline. Click a country.”* Nothing else competes for
   attention.
3. The war’s belligerents are softly colored; everything else is quiet neutral. The eye goes
   where the learning is.

### Interaction guarantees

- **Synchronized:** borders, governments, population, leaders, military strength, alliances,
  statistics, timeline, and coloring always reflect the same year.
- **Reversible & calm:** every transition is animated, interruptible, and respects
  `prefers-reduced-motion`.
- **Keyboard- and screen-reader-complete:** the map is operable without a mouse; selection is
  announced; data has a non-visual reading.

---

## 3. Three UI concepts

Three honestly different directions for the same content. One is deliberately the “wrong”
direction (C), included so the comparison is real.

- **A · Immersive Atlas.** Map is the room. Chrome is minimal: a slim timeline docked at the
  bottom, a context rail that slides over from the right only when something is selected.
  Google-Earth feel. Maximum immersion and focus.
- **B · Atlas Spread.** A two-page book: map left, encyclopedia always-on right. Context is
  permanent, never hidden. Most “textbook-like,” strongest for reading depth — at the cost of map
  size and immersion.
- **C · Control Dashboard.** Map shrinks to one widget among charts, gauges, and stat cards.
  Information-dense and powerful — but reads as analytics software, not a museum. Included as the
  cautionary direction.

> Wireframes for each concept appear in [`design-document.html`](design-document.html) §3.

---

## 4. Concept comparison

| Criterion (weight) | A · Immersive | B · Spread | C · Dashboard |
|--------------------|---------------|------------|---------------|
| Educational clarity (×3) | High | High | Medium |
| Encourages exploration (×3) | Very high | Medium | Medium |
| Museum aesthetic (×2) | Very high | High | Low |
| Map prominence (×2) | Very high | Medium | Low |
| Reading depth on screen (×1) | Medium | Very high | High |
| Mobile / projector friendliness (×2) | High | Medium | Low |
| Build complexity (lower better) (×1) | Medium | Low | High |
| **Weighted outcome** | **Strongest** | Close second | Weakest |

A wins on the heaviest-weighted criteria (clarity, exploration, aesthetic, map prominence). B’s
only real edge is on-screen reading depth. C loses precisely because it violates the brief’s
“avoid a dashboard” constraint.

---

## 5. Recommendation

> **Recommended: Concept A (Immersive Atlas)**, hybridized with Concept B’s persistent context.
> The map owns the screen; a docked context rail can pin open (B’s reading depth) or auto-slide
> away for full immersion (A’s focus). The user chooses.

This captures B’s biggest advantage (permanent, readable context) without surrendering A’s
immersion or map prominence. It scales cleanly: the rail collapses to a bottom sheet on mobile,
and expands to a fixed spread on wide displays.

- **Map stage:** full-bleed, the centerpiece, always vector.
- **Timeline:** slim, docked bottom, always visible — the spine of synchronization.
- **Context rail (right):** the tabbed information panel; pin-open or auto-hide.
- **Top bar:** just search, the conflict selector, and projection/layer menus. Nothing else.

All subsequent mockups (§13) and the component hierarchy (§9) assume this recommended hybrid.

---

## 6. Application architecture

The system is layered so the **engine knows nothing about any specific war**. A war is a dataset
that satisfies the schema; the engine renders it. The crucial component is the **Temporal
Resolver** — given a year, it derives the state of every entity.

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION  (React components — recommended Concept A)      │
│  MapStage · TimelineBar · ContextRail · SearchOverlay ·       │
│  ConflictSelector · WorldAtThisTime · QuizOverlay             │
├──────────────────────────────────────────────────────────────┤
│  APPLICATION STATE  (single source of truth — Zustand store)  │
│  { year, selectedEntityId, activeConflicts[], activeLayers[],  │
│    projection } → every view subscribes & re-derives          │
├──────────────────────────────────────────────────────────────┤
│  DOMAIN ENGINE  (war-agnostic, pure TypeScript)               │
│  • TemporalResolver: stateOf(entityId, year) → resolved facts │
│  • BorderResolver:   bordersFor(year) → FeatureCollection     │
│  • SelectionService · SearchIndex · QuizEngine                │
│  • Projection abstraction (Robinson default)                  │
├──────────────────────────────────────────────────────────────┤
│  DATA ACCESS  (loads + validates datasets, caches by year)    │
│  DatasetLoader → schema validation (Zod) → in-memory indices  │
├──────────────────────────────────────────────────────────────┤
│  DATA  (static, versioned, per-conflict bundles)              │
│  /data/wars/american-revolution/*.json  +  /geo/*.topojson    │
└──────────────────────────────────────────────────────────────┘
```

### Why this shape

- **Adding a war = adding a folder under `/data/wars/`.** No engine change. This is the single
  most important architectural property.
- **The Temporal Resolver is the heart.** “France exists once; its facts change with the year” is
  implemented here, not scattered through the UI.
- **Rendering is abstracted behind interfaces** (`MapRenderer`, `Projection`) so a future
  GPU/tiled backend or globe projection slots in without touching components.
- **State is one object.** Synchronization is automatic because every view derives from the same
  store.

---

## 6b. Technology stack

| Choice | Verdict | Why |
|--------|---------|-----|
| TypeScript | **Yes** | The data contracts *are* the product. Schemas become types; the compiler enforces that every dataset and every component agree. Non-negotiable for a data-driven engine. |
| React | **Yes** | Component model maps cleanly to the synchronized panels; vast ecosystem; testable. |
| Next.js | **Yes** | Static export for a zero-backend V1 (cheap, fast, cacheable). Routing gives every war/leader/battle a real URL — vital for an educational resource (shareable, SEO, deep-linkable). SSR available later for entity pages. |
| Zustand (state) | **Yes** | Tiny, unopinionated global store — the perfect home for `{year, selection, layers}`. Redux is overkill; Context alone re-renders too broadly. |
| D3-geo (+ d3-geo-projection) | **Yes — V1 renderer** | Only mature option that does *atlas* projections (Robinson, Winkel Tripel) natively. Drives projection math + path generation. See §12. |
| TopoJSON | **Yes** | Shared-arc topology = far smaller files and no border slivers between neighbors. The wire format for all border snapshots. |
| MapLibre GL | **Later / optional** | Excellent for tiled, zoomable raster/vector at scale — but Mercator/globe-centric and fights atlas projections. Reserved as a pluggable backend if street-level zoom is ever needed. |
| deck.gl | **Later** | GPU layers shine at 10⁵–10⁶ features (supply routes, troop flows, density). Overkill for V1’s ~600 polygons; kept behind the `MapRenderer` seam. |
| SQLite | **Yes — authoring** | The build-time source of truth for curation/validation. A pipeline exports static JSON + TopoJSON bundles. Ships nothing to the client. |
| PostgreSQL / PostGIS | **Later** | When datasets grow and spatial queries/collaborative authoring matter. Not needed while data is static. |
| Supabase | **Later** | Natural fit when the app gains accounts, saved quiz progress, and community contributions (hosted Postgres + auth + API). Out of scope for V1. |

> **V1 stack, in one line:** Next.js (static export) + React + TypeScript + Zustand, rendering
> with D3-geo/Canvas over TopoJSON; no backend. Heavier GPU/tiled and Postgres/Supabase paths are
> pre-seamed for later phases.

---

## 7. Data model & database

The defining rule: **nothing is hardcoded, and every entity exists exactly once**. An entity is a
timeless identity; its attributes are *temporal facts* with validity intervals, a confidence
level, and source references. The Temporal Resolver collapses these into a single resolved object
for any year.

### Core pattern — identity + temporal facts

```jsonc
// France exists once. Its facts change over time.
{
  "id": "nation:france",
  "type": "nation",
  "names": [{ "value": "Kingdom of France", "from": 1190, "to": 1792 }],
  "facts": [
    { "attr": "government", "value": "Absolute monarchy",
      "from": 1610, "to": 1792, "sources": ["src:doyle-1989"], "confidence": "high" },
    { "attr": "leader", "value": "person:louis-xvi",
      "from": 1774, "to": 1792, "sources": ["src:..."], "confidence": "high" },
    { "attr": "allegiance", "value": "coalition",
      "from": 1778, "to": 1783, "sources": ["src:treaty-alliance-1778"], "confidence": "high" },
    { "attr": "militarySize", "value": { "low": 180000, "high": 220000 },
      "from": 1778, "to": 1783, "sources": ["src:..."], "confidence": "medium" }
  ]
}
```

Querying `stateOf("nation:france", 1775)` returns France *before* it joined the war (no coalition
allegiance); `stateOf(...,1778)` returns it after. One entity, year-dependent truth — exactly the
brief’s requirement.

### Entity catalogue (V1)

- `War` · the conflict envelope, its envelope of years, sides, outcome
- `Nation` / polity · sovereigns, colonies, native nations
- `Territory` / Border · time-stamped polygons with a ruler + status
- `City` · significant settlements, with founding/period validity
- `Battle` · point events with date, forces, casualties, outcome
- `Leader` / Person · biography facts over time
- `Treaty` · agreements, signatories, territorial effects
- `Alliance` · time-bounded relationships between nations
- `TimelineEvent` · dated events of typed categories
- `Source` · citations with reliability ratings
- `WorldContext` · per-year “world at this time” bundle
- `Quiz` · prompts with machine-checkable targets

### Representative schemas

```
// Battle — every fact carries sources; coordinates drive map zoom
Battle {
  id: "battle:yorktown";  warId: "war:american-revolution";
  name: "Siege of Yorktown";  date: { y:1781, m:9, d:28, end:{y:1781,m:10,d:19} };
  location: { lon:-76.51, lat:37.24, place:"Yorktown, Virginia" };
  belligerents: [ { side:"coalition", nations:["nation:usa","nation:france"],
                    commanders:["person:washington","person:rochambeau"], strength:{low:17000,high:19000} },
                  { side:"britain", nations:["nation:great-britain"],
                    commanders:["person:cornwallis"], strength:{value:9000} } ];
  casualties: { coalition:{low:300,high:400}, britain:{captured:7000} };
  outcome: { victor:"coalition", decisive:true };
  significance: "Last major land battle; led to peace negotiations.";
  sources: ["src:..."];  confidence: "high";
}

// Source — the spine of trust
Source { id; type:"book"|"archive"|"journal"|"museum"|"primary";
         citation; url?; reliability:"high"|"medium"|"contested"; notes? }

// Quiz — typed + auto-checkable against app state
Quiz { id; type:"multiple-choice"|"click-map"|"set-year"|"identify";
       prompt; target; accept; feedback:{ correct; incorrect }; sources? }
```

### Honest uncertainty, in the schema

> **Uncertainty is a first-class value.** Numbers are `{ value }` *or* `{ low, high }`; every fact
> carries a `confidence`; conflicting interpretations are stored as multiple facts with distinct
> sources and surfaced side-by-side. The UI never shows a fabricated single number where
> historians give a range.

### Storage strategy

- **Authoring:** SQLite (normalized entities, facts, sources) + a validation/export pipeline.
- **Shipping:** per-war static bundles — `entities.json`, `timeline.json`, `world-context.json`,
  plus `borders/{year}.topojson`. Validated with Zod at load.
- **Indexing:** on load, build by-id maps, a spatial index for hit-testing, and a search index
  (names, aliases, years).

---

## 8. Folder structure

```
historical-wars-explorer/
├─ apps/web/                      # Next.js app (presentation only)
│  ├─ app/                        # routes: /, /war/[id], /battle/[id], /leader/[id]
│  └─ components/                 # MapStage, TimelineBar, ContextRail, ...
├─ packages/
│  ├─ engine/                     # war-AGNOSTIC domain core (no React)
│  │  ├─ temporal/                # TemporalResolver, validity intervals
│  │  ├─ geo/                     # BorderResolver, Projection abstraction
│  │  ├─ search/  quiz/  selection/
│  │  └─ index.ts
│  ├─ schema/                     # Zod schemas + generated TS types (the contract)
│  └─ ui/                         # shared presentational primitives, tokens, theme
├─ data/
│  ├─ wars/
│  │  └─ american-revolution/     # ← a war is just this folder
│  │     ├─ war.json  entities.json  timeline.json
│  │     ├─ world-context.json  quizzes.json  sources.json
│  │     └─ borders/ 1775.topojson … 1783.topojson
│  └─ shared/  geo/               # Natural Earth basemap, graticule, ocean
├─ tools/
│  ├─ authoring/                  # SQLite schema + import scripts
│  └─ pipeline/                   # validate → export static bundles
└─ docs/                          # this document; ADRs; data dictionary
```

The boundary that matters: `packages/engine` must never `import` from `data/`. Datasets flow in
through the loader; the engine stays a pure function of its inputs.

> Note: the structure above is an aspirational (Next.js + packages) target. The **current** repo
> is intentionally build-step-free. Within the Learning Atlas hub, the History subject lives at
> [`subjects/history/`](subjects/history) — `index.html` plus an `app/` folder holding
> `engine.js` (the war-agnostic core), `app.js` (presentation), `styles.css`, and
> `data/<war>.js` datasets — and shares the hub's design system and UI widgets from
> [`core/`](core). The engine-never-imports-data boundary still holds: datasets register
> themselves on `window.HWE.wars` and flow into the engine as inputs. See the
> [README](README.md) for the full hub layout.

---

## 9. Component hierarchy

```
<AppShell>                         // owns the Zustand store
├─ <TopBar>
│   ├─ <GlobalSearch/>             // countries·cities·battles·leaders·treaties·years
│   ├─ <ConflictSelector/>        // ☑ active conflicts (multi-war ready)
│   └─ <ViewMenu/>                 // projection · layer toggles
├─ <MapStage>                      // the centerpiece
│   ├─ <MapCanvas/>                // renderer behind MapRenderer interface
│   └─ <MapLayers>
│       ├─ <PoliticalLayer/>       // allegiance fills
│       ├─ <BorderLayer/>          // period boundaries for the year
│       ├─ <CityLayer/>            // significant cities · capital stars
│       └─ <BattleLayer/>          // burgundy markers
│   └─ <MapTooltip/> <SelectionOutline/>
├─ <TimelineBar>                   // slider · prev/next · year entry · play/pause
├─ <ContextRail>                   // pin-open or auto-hide
│   └─ <Tabs: Overview·Timeline·Countries·Battles·Leaders·Statistics·Sources>
├─ <WorldAtThisTime/>             // the connected-history surface
└─ <QuizOverlay/>                  // optional, typed quizzes
```

Every leaf component is a pure function of the store plus the resolved data for the current year —
which is why “change the year” updates everything at once with no manual wiring.

---

## 10. Historical data strategy

Data is curated, versioned, and sourced — never scraped-and-trusted. The strategy is a pipeline
from authoritative sources into validated bundles, with human curation where machine data is
wrong (we already hit this: the 1783 set mis-tagged Quebec as French).

1. **Source** from authoritative references (archives, peer-reviewed scholarship, museums) for
   facts; from open GIS for geometry.
2. **Curate** in SQLite: enter facts with validity intervals, confidence, and a required source
   id.
3. **Validate** against the schema; reject any fact without a source; flag low-confidence and
   contested facts.
4. **Export** static, versioned bundles; record dataset provenance + version in `war.json`.
5. **Review** against the historian/teacher gates (see Final principle) before publishing.

> **Where historians disagree:** we store every interpretation as a separate sourced fact and
> present them together with confidence labels — e.g. casualty figures at Camden, or the true size
> of the Continental Army, which scholarship gives only as ranges.

---

## 10b. Historical map data sources

| Source | Role | Assessment |
|--------|------|------------|
| Natural Earth | **Basemap (use now)** | Public domain coastlines, ocean, graticule at 110m/50m. The quiet canvas under everything. Ideal and license-free. |
| historical-basemaps (aourednik) | **V1 period borders (use now, curated)** | Year-snapshot world polygons we already validated (`world_1783`). Pragmatic and immediately usable — but generalized and inconsistent (mis-tags, self-referential rulers), so it is *seeded then hand-corrected*, not trusted raw. |
| OpenHistoricalMap | **Long-term authoritative (architect now, ingest later)** | OSM-style, natively date-aware, community-maintained, growing. The right long-run spine; build an importer against it once coverage for a period is solid. |
| Custom curated polygons | **High-value regions (use now)** | For places where accuracy is pedagogically critical and open data is too coarse — the Thirteen Colonies, the western frontier, contested zones — we hand-author TopoJSON. |
| GeoJSON / TopoJSON | **Formats** | Author in GeoJSON; ship TopoJSON (smaller, topology-preserving). Vector tiles only later, if street-level zoom is ever required. |

> **Recommended: Natural Earth basemap + curated TopoJSON year-snapshots** (seeded from
> historical-basemaps, corrected by hand, supplemented with custom polygons for key regions) for
> V1 — with an **OpenHistoricalMap ingestion path architected** for the long term. This balances
> “usable today” against “authoritative forever.”

---

## 11. Historical border strategy

Borders are the soul of the atlas, and the brief is emphatic: **never default to modern borders**.
Boundaries change, overlap, and are disputed. The model must express all of that.

### Representation: validity intervals + snapshots

- Each border feature is a polygon with `{ rulerId, statusType, validFrom, validTo }`. A territory
  “subject to” another power carries the parent’s id — the mechanism that lets a colony inherit
  its empire’s color (the corrected *SUBJECTO* idea from our 1783 work).
- Geometry ships as **year snapshots** (`borders/1775.topojson` … `1783.topojson`). The
  `BorderResolver` returns the snapshot whose validity interval contains the requested year — the
  nearest preceding snapshot if a year is missing.

### Status types (how the same land reads differently)

`sovereign` · `colony / possession` · `protectorate` · `dependent territory` · `occupied` ·
`disputed` · `native / indigenous nation` · `unorganized`

Status drives rendering: sovereigns are solid fills; occupied/disputed land uses a subtle hatch
over the base color (never color alone); native nations use earth-tone fills with their historical
names. Every territory keeps its **period name**, not its modern one.

```
// Resolver contract
bordersFor(year, conflictScope) → FeatureCollection
  // features tagged { rulerId, status, name, period } ready to color
stateOf(entityId, year)         → resolved entity facts
// UI never reasons about time; it asks the resolver.
```

---

## 12. Map rendering strategy

The decisive constraint is the **projection**. The brief wants Robinson by default, with Winkel
Tripel, an orthographic globe, and Mercator as options. That single requirement selects the
renderer.

### Why D3-geo for V1 (not MapLibre)

- **D3-geo natively supports atlas projections** — Robinson and Winkel Tripel via
  `d3-geo-projection`, orthographic for the globe, Mercator trivially. MapLibre GL is built around
  Mercator/globe and fights these.
- **V1 is ~600 polygons + a few hundred points** — comfortably within Canvas2D. We render crisp
  vectors with a quadtree for hit-testing, animating zoom/pan with `requestAnimationFrame`. The
  live demo is exactly this approach.
- **TopoJSON** keeps borders small and sliver-free; shared arcs mean neighbors never gap or
  overlap.

### The seam that protects the future

```ts
interface Projection { project(lonlat): xy; invert(xy): lonlat; fit(bounds): void }
interface MapRenderer {
  setProjection(p: Projection): void
  render(scene: { layers: Layer[], camera: Camera }): void
  pick(xy): FeatureRef | null            // hit-testing for hover/click
  animateTo(camera, opts): Promise<void> // smooth zoom/pan
}
// V1: CanvasD3Renderer.  Later: MapLibreRenderer / DeckGlRenderer — same interface.
```

Components talk only to `MapRenderer` and `Projection`. Swapping in a GPU/tiled backend for dense
future layers (supply routes, troop flows, density) is a renderer change, not an application
change.

### Timeline synchronization

The store holds `year`. On change, the engine resolves borders + entity facts for that year; the
renderer cross-fades fills and morphs the legend while points (cities/battles) animate in/out by
validity. Yearly precision in V1; the date model already carries `{y,m,d}` so months/days need no
redesign.

---

## 13. UI mockups

The recommended hybrid, in its key states. The live demo at the top of
[`design-document.html`](design-document.html) is the real thing; the wireframes there annotate
the full-app chrome around it.

- **Default view — “the world in this year.”** Top bar with search and conflict selector; full
  map; slim bottom timeline (year readout, e.g. 1778); collapsed context rail at the right edge.
- **Country selected — context rail open.** Map on the left with a navy outline on the selected
  country; tabbed information panel (Overview · Countries · Battles · Leaders · Stats · Sources)
  open on the right, values updating with the year.
- **Battle selected — map zooms in.** Map zoomed to a region with a highlighted burgundy battle
  marker; a battle detail card (date, location, commanders, forces, casualties, outcome).
- **“The world at this time” — connected history.** A horizontal strip of cards for the selected
  year: world population, largest empires, largest cities, other conflicts, science & culture.
  This strip is the brief’s signature educational feature — it reframes the war as one thread in a
  connected world, recomputed each year.

---

## 14. Development roadmap

| Phase | Outcome | Proves |
|-------|---------|--------|
| **0 · Foundations** | Monorepo, schemas + types, dataset loader/validator, Projection + MapRenderer seams, empty app shell with store. | The engine/data boundary holds. |
| **1 · ARW reference** | The American Revolutionary War, fully: 4 layers, timeline, 7 panel tabs, “World at this time,” search, simple quizzes. (Detailed in §15.) | The product is real and teaches. |
| **2 · Polish & access** | Animation refinement, full keyboard/screen-reader support, mobile bottom-sheet rail, performance pass. | Museum-quality & inclusive. |
| **3 · Second conflict** | Add a concurrent war (e.g. First Anglo-Mysore or the Anglo-Dutch War) *by importing data only*. Enable the conflict selector / comparison. | Extensibility — the core promise. |
| **4 · Projections & layers** | Orthographic globe + Winkel Tripel; architect (not yet fill) future layers — fronts, campaigns, trade routes. | The seams were right. |
| **5 · Accounts & learning** | Supabase: saved progress, richer quiz types, classroom features. | Durable educational value. |
| **6 · Authoring & OHM** | Curation tooling + OpenHistoricalMap ingestion for scalable, sourced datasets. | The atlas can grow to all of history. |

---

## 15. Phase 1 implementation plan

Goal: ship the American Revolutionary War as the reference implementation — beautiful, accurate,
synchronized, accessible — on the Phase 0 engine. Milestones are vertical slices, each ending at a
historian/teacher review gate.

| Milestone | Scope | Done when |
|-----------|-------|-----------|
| M1 · Map & year | Robinson Canvas renderer; load 1775–1783 border snapshots; political + border layers; timeline slider/prev/next/entry/play. | Scrubbing the year visibly re-borders and re-colors the world, smoothly. |
| M2 · Selection & rail | Click country → navy outline + Overview/Countries tabs from resolved facts (year-aware). Hover tooltips. | Clicking France in 1775 vs 1778 shows different allegiance/leader/army. |
| M3 · Cities & battles | City layer (capital stars) + battle layer (burgundy markers); battle click zooms map + opens Battle tab. | Clicking Yorktown flies the camera and shows sourced details. |
| M4 · Panels complete | Leaders, Timeline (clickable events), Statistics (ranges + confidence), Sources (every claim traceable). | Every visible fact links to a source; ranges shown where they exist. |
| M5 · World & learn | “World at this time” strip; global search with zoom-to-result; 3–5 simple quizzes (click-map, set-year, multiple-choice). | Search “Yorktown” zooms; a quiz checks the map/timeline state. |
| M6 · Review & ship | Accessibility + mobile pass; content QA against sources; performance budget; the evaluation gates below. | Passes all four review questions; loads fast; works by keyboard. |

### Phase 1 data deliverables (the actual content work)

- Curated `borders/1775…1783.topojson` (seeded from our validated 1783 set, corrected, plus the
  Thirteen Colonies as custom polygons).
- `entities.json`: the belligerents + key colonies/native nations, with year-aware facts and
  sources.
- ~20–30 battles, ~12 leaders, the key treaties, a timeline of ~40 events, a `world-context` entry
  per year, and a starter quiz set.

> **Acceptance theme:** A teacher can open it cold, scrub to 1781, click Yorktown, explain why it
> mattered, glance at “the world in 1781,” and run a one-click quiz — with every number traceable
> to a source. That is Phase 1 “done.”

---

## Final design principle

**After every milestone, judge it as a historian and a teacher.** Each milestone ends by asking
four questions — and acting on the answers:

- **Does it explain *why*?** Causes and consequences must be legible, not just dates and places.
- **Does it show *how the world changed*?** The before/after of borders, power, and people must be
  felt by scrubbing time.
- **Does it invite curiosity?** The interface should reward clicking, wandering, and asking “what
  else was happening?”
- **Does every feature improve learning?** If it adds complexity without understanding, simplify
  or remove it.

Educational value over feature count, always. The goal is the finest interactive historical atlas
and war-education platform available — and it starts from the map we have already built.

---

*Historical Wars Explorer · Design & Architecture v1 · reference implementation: American
Revolutionary War (1775–1783).*
