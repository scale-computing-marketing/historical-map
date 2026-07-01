/* Life Explorer — Biology · progress store.
   All learner progress lives in localStorage under one key, so the platform is
   fully client-side and buildless. Subject-namespaced (`atlas.bio`) so it never
   collides with Mathematics (`atlas.math`) — the two engines are twins.

   Shape:
   {
     concepts: { <conceptId>: { stars, best, accuracy, attempts, correct,
                                completed, timeMs, plays, mastered } },
     activityCounts: { <componentName>: n },   // "favourite simulations"
     streak: { count, lastDay },               // daily discovery streak (YYYY-MM-DD)
     totalTimeMs, updated
   }
   Exposes window.BIO.Store.                                                     */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });
  const KEY = 'atlas.bio.v1';

  function today() { return new Date().toISOString().slice(0, 10); }
  function blank() {
    return { concepts: {}, activityCounts: {}, streak: { count: 0, lastDay: null }, totalTimeMs: 0, updated: null };
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(blank(), JSON.parse(raw)); }
    catch (e) { /* private mode / corrupt — fall through to blank */ }
    return blank();
  }
  let data = load();
  const subs = [];
  function persist() {
    data.updated = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full/blocked */ }
    subs.forEach(fn => { try { fn(data); } catch (e) {} });
  }
  function rec(id) { return (data.concepts[id] = data.concepts[id] || { stars: 0, best: 0, accuracy: 0, attempts: 0, correct: 0, completed: false, timeMs: 0, plays: 0, mastered: false }); }

  const Store = {
    onChange(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; },
    concept(id) { return data.concepts[id] || null; },
    isMastered(id) { const c = data.concepts[id]; return !!(c && c.mastered); },
    isCompleted(id) { const c = data.concepts[id]; return !!(c && c.completed); },
    stars(id) { const c = data.concepts[id]; return c ? c.stars : 0; },

    /* Called by the lesson player when a lesson run finishes.
       result = { conceptId, stars, score, accuracy, attempts, correct, timeMs,
                  completed, mastered }                                          */
    recordLesson(result) {
      const c = rec(result.conceptId);
      c.plays += 1;
      c.attempts += result.attempts || 0;
      c.correct += result.correct || 0;
      c.accuracy = c.attempts ? Math.round((c.correct / c.attempts) * 100) : 0;
      c.timeMs += result.timeMs || 0;
      c.best = Math.max(c.best, result.score || 0);
      c.stars = Math.max(c.stars, result.stars || 0);
      c.completed = c.completed || !!result.completed;
      c.mastered = c.mastered || !!result.mastered;
      data.totalTimeMs += result.timeMs || 0;
      this.touchStreak();
      persist();
      return c;
    },
    /* Count an interaction with a named reusable simulation (favourite activity). */
    countActivity(name) { if (!name) return; data.activityCounts[name] = (data.activityCounts[name] || 0) + 1; /* not persisted per-tick to avoid churn */ },
    flushActivity() { persist(); },

    touchStreak() {
      const t = today(), s = data.streak;
      if (s.lastDay === t) return;
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      s.count = (s.lastDay === y) ? s.count + 1 : 1;
      s.lastDay = t;
    },

    summary() {
      const cs = Object.values(data.concepts);
      const mastered = cs.filter(c => c.mastered).length;
      const completed = cs.filter(c => c.completed).length;
      const stars = cs.reduce((a, c) => a + (c.stars || 0), 0);
      const attempts = cs.reduce((a, c) => a + (c.attempts || 0), 0);
      const correct = cs.reduce((a, c) => a + (c.correct || 0), 0);
      const fav = Object.entries(data.activityCounts).sort((a, b) => b[1] - a[1])[0];
      return {
        mastered, completed, stars,
        accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
        timeMs: data.totalTimeMs,
        streak: data.streak.count || 0, streakActive: data.streak.lastDay === today(),
        favourite: fav ? fav[0] : null
      };
    },

    /* Concepts whose accuracy sits below a threshold — "areas needing review". */
    needsReview(min) {
      min = min || 70;
      return Object.entries(data.concepts)
        .filter(([, c]) => c.plays > 0 && c.accuracy < min)
        .map(([id, c]) => ({ id, accuracy: c.accuracy }));
    },

    reset() { data = blank(); persist(); },
    _all() { return data; }
  };

  BIO.Store = Store;
})();
