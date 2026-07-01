/* Historical Wars Explorer — war-AGNOSTIC engine.
   Pure functions over a `war` object shaped like the data file. No war-specific
   knowledge, no DOM. This is the layer a future war reuses unchanged.         */
(function () {
  window.HWE = window.HWE || { wars: {} };

  function inRange(fact, year) {
    const from = fact.from == null ? -Infinity : fact.from;
    const to = fact.to == null ? Infinity : fact.to;
    return year >= from && year <= to;
  }

  const Engine = {
    /* Resolve an entity's state for a given year — collapses temporal facts.
       The core of "France exists once; its facts depend on the year". */
    stateOf(war, entityId, year) {
      const e = Engine.entity(war, entityId);
      if (!e) return null;
      const resolved = { id: e.id, type: e.type, name: e.name, base: e };
      if (Array.isArray(e.facts)) {
        resolved.facts = e.facts.filter(f => inRange(f, year));
      }
      return resolved;
    },

    /* Is this nation an active belligerent in the given year? */
    isActive(nation, year) {
      const from = nation.entered == null ? -Infinity : nation.entered;
      const to = nation.exited == null ? Infinity : nation.exited;
      return year >= from && year <= to;
    },

    /* The faction key used to color a map polygon for a year.
       Maps the polygon -> its ruling nation, then asks whether that nation is
       an active belligerent yet (France is neutral until 1778, etc.). */
    factionForFeature(war, props, year) {
      const nation = Engine.nationForGeo(war, props);
      if (!nation) return 'neutral';
      return Engine.isActive(nation, year) ? nation.factionKey : 'neutral';
    },

    /* Property keys the loaded geometry uses to name a polygon and (optionally)
       its parent polity. Each war declares these so the same matching logic works
       over a world basemap (NAME/SUBJECTO) or a US-states file (name). */
    geoNameProp(war) { return (war.geo && war.geo.nameProp) || 'NAME'; },
    geoSubjectProp(war) { return (war.geo && war.geo.subjectProp) || 'SUBJECTO'; },

    nationForGeo(war, props) {
      const name = (props && props[Engine.geoNameProp(war)]) || '';
      const sub = (props && props[Engine.geoSubjectProp(war)]) || '';
      // British is pinned by name first (basemap mis-tags some British colonies).
      for (const n of war.nations) {
        if (n.factionKey === 'britain') {
          if ((n.geoNames || []).includes(name) || (n.geoSubjects || []).includes(sub)) return n;
        }
      }
      for (const n of war.nations) {
        if (n.factionKey === 'britain') continue;
        if ((n.geoNames || []).includes(name) || (n.geoSubjects || []).includes(sub)) return n;
      }
      return null;
    },

    nationByGeoName(war, name) {
      return war.nations.find(n => (n.geoNames || []).includes(name)) || null;
    },

    /* Battles that have occurred by `year` (inclusive). */
    battlesUpTo(war, year) { return war.battles.filter(b => b.date.y <= year); },
    battlesIn(war, year) { return war.battles.filter(b => b.date.y === year); },

    /* Timeline events up to and including a year. */
    eventsUpTo(war, year) { return war.timeline.filter(e => e.date.y <= year); },

    /* Border geometry URL for a year: the nearest snapshot whose year is <= the
       requested year (falls back to the earliest available). A war ships one or
       more snapshots keyed by year under `geo.borderSnapshots`. */
    geoSourceFor(war, year) {
      const snaps = (war.geo && war.geo.borderSnapshots) || {};
      const years = Object.keys(snaps).map(Number).sort((a, b) => a - b);
      if (!years.length) return null;
      let pick = years[0];
      for (const y of years) { if (y <= year) pick = y; }
      return snaps[pick];
    },

    /* World-at-this-time: merge the per-year overrides onto the default. */
    worldAt(war, year) {
      const wc = war.worldContext || {};
      return Object.assign({}, wc._default || {}, wc[year] || {});
    },

    /* Other wars under way elsewhere in `year`, drawn from the shared global
       list. Excludes the war being viewed (matched on name / alt-names) so we
       never list the current conflict back to the reader. */
    conflictsAt(war, year) {
      const skip = new Set([war.meta.name, ...(war.meta.altNames || [])].map(s => s.toLowerCase()));
      return (window.HWE.globalConflicts || [])
        .filter(c => year >= c.start && year <= c.end && !skip.has(c.name.toLowerCase()))
        .sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));
    },

    entity(war, id) {
      if (!id) return null;
      const pools = [war.nations, war.leaders, war.battles, war.treaties, war.cities];
      for (const pool of pools) {
        const hit = (pool || []).find(x => x.id === id);
        if (hit) return hit;
      }
      return null;
    },

    source(war, id) { return war.sources[Object.keys(war.sources).find(k => war.sources[k].id === id)]; },

    /* Lightweight global search across entity types. */
    search(war, q) {
      q = (q || '').trim().toLowerCase();
      if (!q) return [];
      const out = [];
      const add = (type, id, label, sublabel) => out.push({ type, id, label, sublabel });
      war.nations.forEach(n => { if (n.name.toLowerCase().includes(q) || n.short.toLowerCase().includes(q)) add('nation', n.id, n.name, 'Nation'); });
      war.leaders.forEach(l => { if (l.name.toLowerCase().includes(q)) add('leader', l.id, l.name, l.role); });
      war.battles.forEach(b => { if (b.name.toLowerCase().includes(q) || (b.location.place || '').toLowerCase().includes(q)) add('battle', b.id, b.name, b.date.y + ' · ' + b.location.place); });
      war.cities.forEach(c => { if (c.name.toLowerCase().includes(q)) add('city', c.id, c.name, 'City'); });
      war.treaties.forEach(t => { if (t.name.toLowerCase().includes(q)) add('treaty', t.id, t.name, 'Treaty · ' + t.date.y); });
      // bare year
      if (/^\d{4}$/.test(q)) { const y = +q; if (y >= war.meta.years.start && y <= war.meta.years.end) add('year', 'year:' + y, q, 'Jump to year'); }
      return out.slice(0, 8);
    },

    /* Check a quiz answer against current app state. */
    checkQuiz(quiz, state) {
      const a = quiz.accept || {};
      if (quiz.type === 'set-year') return state.year === a.year;
      if (quiz.type === 'click-map') return state.selectedEntityId === a.entityId;
      if (quiz.type === 'multiple-choice') return state.chosenOption === a.option;
      return false;
    }
  };

  /* Display helpers (formatting only — still war-agnostic). */
  Engine.fmt = {
    number(x) {
      if (x == null) return '—';
      if (typeof x === 'object') {
        if ('low' in x && 'high' in x) return Engine.fmt.int(x.low) + '–' + Engine.fmt.int(x.high);
        if ('value' in x) return typeof x.value === 'number' ? Engine.fmt.int(x.value) : x.value;
        if ('captured' in x) return Engine.fmt.int(x.captured) + ' captured';
      }
      return typeof x === 'number' ? Engine.fmt.int(x) : String(x);
    },
    int(n) { return typeof n === 'number' ? n.toLocaleString('en-US') : n; },
    factValue(f) { return Engine.fmt.number(f.value); },
    date(d) {
      if (!d) return '';
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let s = (d.d ? d.d + ' ' : '') + (d.m ? months[d.m] + ' ' : '') + d.y;
      if (d.end) s += ' – ' + (d.end.d ? d.end.d + ' ' : '') + (d.end.m ? months[d.end.m] + ' ' : '') + d.end.y;
      return s;
    },
    confidence(c) { return c ? c[0].toUpperCase() + c.slice(1) + ' confidence' : ''; }
  };

  window.HWE.Engine = Engine;
})();
