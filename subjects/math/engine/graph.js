/* Learning Atlas — Mathematics · knowledge graph.
   The most important architectural piece: the curriculum is a graph of
   interconnected concepts, NOT a rigid grade ladder. Grades are just a
   `grade` label used to lay concepts out and recommend a path; what actually
   gates progression is `prereqs` + mastery recorded in the Store.

   A concept:
   {
     id, name, grade, strand,           // strand groups concepts by topic colour
     blurb,                             // one line shown on the map / rail
     prereqs: [conceptId, ...],         // must be mastered to unlock this
     related: [conceptId, ...],         // optional cross-links
     lesson: lessonId | null,           // the lesson that teaches it (null = coming soon)
     masteryScore: 80,                  // % needed on the mastery check
     components: [name, ...]            // reusable components it uses (informational)
   }
   Register with MATH.Graph.add(concept). Status is derived, never stored:
     'mastered'   — Store says mastered
     'review'     — completed/mastered but accuracy low (still open)
     'available'  — all prereqs mastered (or none) and a lesson exists
     'ready-soon' — unlocked but no lesson authored yet
     'locked'     — a prereq is unmet
   Exposes window.MATH.Graph.                                                    */
(function () {
  const MATH = (window.MATH = window.MATH || {});
  const Store = MATH.Store;

  const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', 'Algebra I', 'Geometry', 'Algebra II', 'Precalculus', 'Calculus'];
  const byId = {};
  const order = [];

  function add(concept) {
    const c = Object.assign({ prereqs: [], related: [], components: [], masteryScore: 80, lesson: null }, concept);
    byId[c.id] = c;
    order.push(c.id);
    return c;
  }

  function get(id) { return byId[id] || null; }
  function all() { return order.map(id => byId[id]); }

  /* Dev/testing flag: "unlock all". When on, every concept's prerequisites are
     treated as met, so nothing is 'locked' and any authored lesson can be opened
     regardless of grade or progress. Off by default (normal learners keep the
     prereq gating). Turn on by visiting the page with ?unlock (or #unlock) in the
     URL, or from the console with MATH.Graph.setUnlockAll(true). It's persisted
     in localStorage so it survives reloads until you setUnlockAll(false).       */
  function readUnlockFlag() {
    try {
      if (/[?&#]unlock(all)?\b/i.test(location.href)) { localStorage.setItem('atlas.math.unlockAll', '1'); return true; }
      return localStorage.getItem('atlas.math.unlockAll') === '1';
    } catch (e) { return /[?&#]unlock(all)?\b/i.test(location.href || ''); }
  }
  let UNLOCK_ALL = readUnlockFlag();
  function setUnlockAll(on) {
    UNLOCK_ALL = !!on;
    try { localStorage.setItem('atlas.math.unlockAll', on ? '1' : '0'); } catch (e) {}
    /* Nudge subscribers (the map) to re-render so locks light up / relock live. */
    if (Store && Store.flushActivity) Store.flushActivity();
    return UNLOCK_ALL;
  }

  function prereqsMet(c) { return UNLOCK_ALL || (c.prereqs || []).every(p => Store.isMastered(p)); }

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

  /* A recommended next lesson: the lowest-grade available concept with a lesson
     that isn't mastered yet. */
  function recommended() {
    const avail = all().filter(c => c.lesson && status(c.id) === 'available');
    avail.sort((a, b) => GRADES.indexOf(a.grade) - GRADES.indexOf(b.grade));
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
      .map(c => ({ id: c.id, label: c.name, sub: 'Grade ' + c.grade + ' · ' + c.strand }));
  }

  MATH.Graph = { GRADES, add, get, all, status, prereqsMet, unlockedBy, children, recommended, remediationFor, search, setUnlockAll };
})();
