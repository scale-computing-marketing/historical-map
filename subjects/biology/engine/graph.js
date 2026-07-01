/* Life Explorer — Biology · knowledge graph.
   The most important architectural piece: the curriculum is a graph of
   interconnected concepts, NOT a linear course. Units are a `unit` label used to
   lay concepts out and recommend a path; what actually gates progression is
   `prereqs` + mastery recorded in the Store. So a learner who already understands
   cells can move ahead, and one struggling with genetics is sent back to DNA.

   A concept:
   {
     id, name, unit, strand,            // strand groups concepts by topic colour
     blurb,                             // one line shown on the map / rail
     prereqs: [conceptId, ...],         // must be mastered to unlock this
     related: [conceptId, ...],         // optional cross-links
     lesson: true|false,                // an authored lesson exists (else coming soon)
     explore: topicId,                  // an existing Life-Explorer topic it reuses
     masteryScore: 80,                  // % needed on the mastery check
     components: [name, ...]            // reusable simulations it uses (informational)
   }
   Register with BIO.Graph.add(concept). Status is derived, never stored:
     'mastered'   — Store says mastered
     'review'     — completed/mastered but accuracy low (still open)
     'available'  — all prereqs mastered (or none) and a lesson exists
     'ready-soon' — unlocked but no lesson authored yet
     'locked'     — a prereq is unmet
   Exposes window.BIO.Graph.                                                     */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });
  const Store = BIO.Store;

  /* Units are the layout columns. Each entry: { n:'1', name:'What Is Life?' } */
  const UNITS = [
    { n: '1', name: 'What Is Life?' },
    { n: '2', name: 'Cells' },
    { n: '3', name: 'Cell Processes' },
    { n: '4', name: 'Cell Division' },
    { n: '5', name: 'Genetics' },
    { n: '6', name: 'Evolution' },
    { n: '7', name: 'Classification' },
    { n: '8', name: 'Ecology' },
    { n: '9', name: 'Human Body' },
    { n: '10', name: 'Plants' },
    { n: '11', name: 'Microbiology' },
    { n: '12', name: 'Biotechnology' }
  ];
  const UNIT_ORDER = UNITS.map(u => u.n);
  const unitName = n => (UNITS.find(u => u.n === n) || {}).name || '';

  const byId = {};
  const order = [];

  function add(concept) {
    const c = Object.assign({ prereqs: [], related: [], components: [], masteryScore: 80, lesson: false }, concept);
    byId[c.id] = c;
    order.push(c.id);
    return c;
  }

  function get(id) { return byId[id] || null; }
  function all() { return order.map(id => byId[id]); }

  function prereqsMet(c) { return (c.prereqs || []).every(p => Store.isMastered(p)); }

  function status(id) {
    const c = byId[id]; if (!c) return 'locked';
    if (Store.isMastered(id)) {
      const rec = Store.concept(id);
      return (rec && rec.plays && rec.accuracy < 70) ? 'review' : 'mastered';
    }
    if (!prereqsMet(c)) return 'locked';
    return c.lesson ? 'available' : 'ready-soon';
  }

  /* The concepts that become newly available when `id` is mastered — used for
     the "unlock" moment at the end of a lesson. */
  function unlockedBy(id) {
    return all().filter(c => (c.prereqs || []).includes(id) && c.lesson &&
      (c.prereqs || []).every(p => p === id || Store.isMastered(p)))
      .map(c => c.id);
  }

  /* Concepts that list `id` as a prerequisite (its children in the DAG). */
  function children(id) { return all().filter(c => (c.prereqs || []).includes(id)); }

  /* A recommended next lesson: the earliest-unit available concept with a lesson
     that isn't mastered yet. */
  function recommended() {
    const avail = all().filter(c => c.lesson && status(c.id) === 'available');
    avail.sort((a, b) => UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit));
    return avail[0] || null;
  }

  /* If a concept is being struggled with, the prereq to send the learner back to. */
  function remediationFor(id) {
    const c = byId[id]; if (!c) return null;
    for (const p of c.prereqs) { const pr = byId[p]; if (pr && pr.lesson) return pr; }
    return null;
  }

  function search(q) {
    q = q.toLowerCase();
    return all().filter(c => c.name.toLowerCase().includes(q) || (c.blurb || '').toLowerCase().includes(q) || (c.strand || '').toLowerCase().includes(q))
      .map(c => ({ id: c.id, label: c.name, sub: 'Unit ' + c.unit + ' · ' + unitName(c.unit) }));
  }

  BIO.Graph = { UNITS, UNIT_ORDER, unitName, add, get, all, status, prereqsMet, unlockedBy, children, recommended, remediationFor, search };
})();
