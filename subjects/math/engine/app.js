/* Learning Atlas — Mathematics · app boot (sidebar shell).
   Composes the shared shell: a left curriculum sidebar (built from the graph),
   a slim breadcrumb header, the focused-unit Map, the lesson Player, a ⌘K
   command palette, and the shared Drawer (#rail) for concept details + progress.
   Framework-free; uses core/shell.js (Atlas.Rail, Atlas.CommandPalette,
   Atlas.wireShell).                                                            */
(function () {
  const MATH = window.MATH, Graph = MATH.Graph, Store = MATH.Store;
  const el = id => Atlas.el(id);

  let rail, player, mapView, palette, shell;
  let view = 'map';           // 'map' | 'lesson'
  let currentLesson = null;

  const gradeLabel = g => (g.length <= 2 ? 'Grade ' + g : g);

  /* ---------------- drawer open/close (rail + scrim) ---------------- */
  function openRail() { rail.open(); el('scrim').classList.add('open'); }
  function closeRail() { rail.close(); el('scrim').classList.remove('open'); }

  /* ---------------- breadcrumbs ---------------- */
  function setCrumbs(parts) {
    const c = el('crumbs');
    c.innerHTML = parts.map((p, i) => {
      const last = i === parts.length - 1;
      return (last ? `<span class="here">${p.label}</span>` : `<button data-i="${i}">${p.label}</button>`)
        + (last ? '' : '<span class="sep">›</span>');
    }).join('');
    c.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const p = parts[+b.dataset.i]; if (p.on) p.on(); });
  }
  function crumbsForMap() {
    const atlas = { label: 'Atlas', on: () => (location.href = '../../') };
    const subject = { label: 'Mathematics', on: () => mapView.setMode('overview') };
    if (mapView.mode() === 'overview') setCrumbs([atlas, subject, { label: 'Overview' }]);
    else setCrumbs([atlas, subject, { label: gradeLabel(mapView.grade()) }]);
  }

  /* ---------------- sidebar outline (accordion tied to map focus) ---------------- */
  function buildOutline() {
    const wrap = el('outline'); if (!wrap) return;
    wrap.innerHTML = '';
    mapView.grades().forEach(g => {
      const cs = Graph.all().filter(c => c.grade === g).sort((a, b) => (a.strand || '').localeCompare(b.strand || ''));
      const mastered = cs.filter(c => Store.isMastered(c.id)).length;
      const pct = cs.length ? Math.round(mastered / cs.length * 100) : 0;
      const isFocus = g === mapView.grade() && mapView.mode() === 'focus';

      const group = document.createElement('div'); group.className = 'la-navgroup';
      const head = document.createElement('button');
      head.className = 'la-grouphead'; head.setAttribute('aria-expanded', String(isFocus));
      head.innerHTML = `<span class="tw">▾</span><span>${gradeLabel(g)}</span><span class="cnt">${mastered}/${cs.length}</span>`;
      head.onclick = () => mapView.focusGrade(g);
      group.appendChild(head);

      if (isFocus) {
        const bar = document.createElement('div'); bar.className = 'la-groupbar';
        bar.innerHTML = `<span style="width:${pct}%"></span>`; group.appendChild(bar);
        const items = document.createElement('div'); items.className = 'la-subgroup';
        cs.forEach(c => {
          const st = Graph.status(c.id);
          const dot = (st === 'mastered' || st === 'review') ? 'done' : st === 'available' ? 'now' : st === 'ready-soon' ? '' : 'locked';
          const it = document.createElement('button');
          it.className = 'la-navitem' + (view === 'lesson' && currentLesson === c.id ? ' active' : '');
          it.innerHTML = `<span class="dot ${dot}"></span><span class="nm">${c.name}</span>${st === 'locked' ? '<span class="lk">🔒</span>' : ''}`;
          it.onclick = () => { openConcept(c.id); if (shell) shell.closeNav(); };
          items.appendChild(it);
        });
        group.appendChild(items);
      }
      wrap.appendChild(group);
    });
  }

  function renderStreak() {
    const s = Store.summary();
    el('streak').innerHTML = `<span class="fire">${s.streakActive ? '🔥' : '☆'}</span> <b>${s.streak}</b><span>day streak · ${s.stars} ★</span>`;
  }

  /* keep chrome in sync with the map's focus/mode (also fires on progress change) */
  function syncChrome() {
    if (!mapView) return;
    el('overview-label').textContent = mapView.mode() === 'overview' ? '◈ Focused unit' : '⤢ Overview';
    if (view === 'map') crumbsForMap();
    buildOutline();
    renderStreak();
  }

  /* ---------------- concept detail drawer ---------------- */
  function openConcept(id) {
    const c = Graph.get(id); if (!c) return;
    if (view === 'lesson') showMap();
    mapView.focusGrade(c.grade);
    const st = Graph.status(id);
    const rec = Store.concept(id) || {};
    const kindMap = { mastered: 'Concept · mastered', available: 'Concept · ready to learn', review: 'Concept · review', 'ready-soon': 'Concept · coming soon', locked: 'Concept · locked' };
    const pre = (c.prereqs || []).map(p => Graph.get(p)).filter(Boolean);
    const unlocks = Graph.all().filter(x => (x.prereqs || []).includes(id));
    const missing = pre.filter(p => !Store.isMastered(p.id));
    const canStart = (st === 'available' || st === 'mastered' || st === 'review') && c.lesson;
    const pct = st === 'mastered' ? 100 : rec.stars ? Math.round(rec.stars / 3 * 100) : 0;
    const body = `
      <p class="ui" style="font-size:13px;color:var(--muted);margin:0 0 14px">${gradeLabel(c.grade)} · ${c.strand} strand</p>
      ${canStart ? `<button class="btn btn-primary btn-block" data-start="${id}" style="margin-bottom:16px">${st === 'mastered' ? 'Practise again' : 'Start lesson'} →</button>` : ''}
      ${st !== 'locked' && st !== 'ready-soon' ? `<div class="progress" style="margin-bottom:16px"><span style="width:${pct}%"></span></div>` : ''}
      <p class="lead">${c.blurb || ''}</p>
      ${pre.length ? `<h3>Prerequisites</h3><div class="chips">${pre.map(p => `<button class="chip ${Store.isMastered(p.id) ? 'active' : ''}" data-go="${p.id}">${p.name}${Store.isMastered(p.id) ? ' ✓' : ''}</button>`).join('')}</div>` : ''}
      ${unlocks.length ? `<h3>Unlocks next</h3><div class="chips">${unlocks.map(u => `<button class="chip" data-go="${u.id}">${u.name}</button>`).join('')}</div>` : ''}
      ${st === 'locked' ? `<div class="alert alert-warn" style="margin-top:16px"><span class="alert-ic">🔒</span><span>Master ${missing.map(m => '<b>' + m.name + '</b>').join(' and ') || 'the prerequisites'} to unlock this.</span></div>` : ''}
      ${st === 'ready-soon' ? `<div class="alert alert-info" style="margin-top:16px"><span class="alert-ic">ℹ</span><span>Unlocked — its interactive lesson is still being built.</span></div>` : ''}`;
    rail.update({
      title: c.name, kind: kindMap[st] || 'Concept', tabs: [], body,
      onBody(elm) {
        const s = elm.querySelector('[data-start]'); if (s) s.onclick = () => openLesson(id);
        elm.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openConcept(b.dataset.go));
      }
    });
    openRail();
  }

  /* ---------------- progress drawer ---------------- */
  function openProgress() { renderProgress(); openRail(); }
  function renderProgress() {
    const s = Store.summary();
    const total = Graph.all().filter(c => c.lesson).length;
    const rec = Graph.recommended();
    const review = Store.needsReview(70).map(r => Graph.get(r.id)).filter(Boolean);
    const fav = s.favourite ? (MATH.Components.get(s.favourite) || {}).title || s.favourite : null;
    const body = `
      <div class="m-prog-hero">
        <div class="m-prog-streak">${s.streakActive ? '🔥' : '☆'} <b>${s.streak}</b><span>day streak</span></div>
        <div class="m-prog-stars">★ <b>${s.stars}</b><span>stars earned</span></div>
      </div>
      <div class="m-prog-grid">
        <div><b>${s.mastered}</b><span>concepts mastered</span></div>
        <div><b>${s.completed}/${total}</b><span>lessons done</span></div>
        <div><b>${s.accuracy == null ? '—' : s.accuracy + '%'}</b><span>accuracy</span></div>
        <div><b>${s.timeMs ? Math.max(1, Math.round(s.timeMs / 60000)) + 'm' : '—'}</b><span>time learning</span></div>
      </div>
      ${rec ? `<h3>Recommended next</h3>
        <button class="m-rec" data-go="${rec.id}"><b>${rec.name}</b><span>${gradeLabel(rec.grade)} · ${rec.strand}</span></button>` : ''}
      ${review.length ? `<h3>Areas to review</h3><div class="chips">${review.map(c => `<button class="chip" data-go="${c.id}">${c.name}</button>`).join('')}</div>` : ''}
      ${fav ? `<h3>Favourite activity</h3><p class="m-fav">${fav}</p>` : ''}
      <h3>Explorer titles</h3>
      <div class="m-badges">${titles(s).map(t => `<div class="m-badge-t ${t.earned ? 'earned' : ''}"><span class="m-bt-ic">${t.icon}</span><span class="m-bt-name">${t.name}</span><span class="m-bt-req">${t.req}</span></div>`).join('')}</div>
      <button class="chip m-reset" data-reset style="margin-top:14px">Reset all progress</button>`;
    rail.update({ title: 'Your progress', kind: 'Explorer', tabs: [], body, onBody(elm) {
      elm.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openConcept(b.dataset.go));
      const rst = elm.querySelector('[data-reset]'); if (rst) rst.onclick = () => { if (confirm('Reset all math progress? This cannot be undone.')) { Store.reset(); openProgress(); } };
    } });
  }
  function titles(s) {
    return [
      { icon: '🌱', name: 'First Steps', req: 'Finish 1 lesson', earned: s.completed >= 1 },
      { icon: '🧮', name: 'Number Explorer', req: 'Master 3 concepts', earned: s.mastered >= 3 },
      { icon: '🔥', name: 'On a Streak', req: '3-day streak', earned: s.streak >= 3 },
      { icon: '⭐', name: 'Star Collector', req: 'Earn 15 stars', earned: s.stars >= 15 },
      { icon: '🎓', name: 'Math Scholar', req: 'Master 10 concepts', earned: s.mastered >= 10 }
    ];
  }

  /* ---------------- view switching ---------------- */
  function openLesson(id) {
    const c = Graph.get(id); if (!c || !c.lesson) return;
    view = 'lesson'; currentLesson = id;
    el('m-map').style.display = 'none';
    el('m-lesson').style.display = '';
    player.start(id);
    closeRail(); if (shell) shell.closeNav();
    setCrumbs([
      { label: 'Atlas', on: () => (location.href = '../../') },
      { label: 'Mathematics', on: showMap },
      { label: gradeLabel(c.grade), on: () => { showMap(); mapView.focusGrade(c.grade); } },
      { label: c.name }
    ]);
    buildOutline();
  }
  function showMap() {
    view = 'map'; currentLesson = null;
    el('m-lesson').style.display = 'none'; el('m-lesson').innerHTML = '';
    el('m-map').style.display = '';
    mapView.render();
    crumbsForMap(); buildOutline();
  }

  /* ---------------- command palette ---------------- */
  function provider(q) {
    q = q.trim().toLowerCase();
    const groups = [];
    const rec = Graph.recommended();
    if (!q && rec) groups.push({ sec: 'Continue', items: [{ icon: '▶', label: rec.name, sub: 'resume', onPick: () => openLesson(rec.id) }] });

    let concepts = Graph.all();
    concepts = q ? concepts.filter(c => c.name.toLowerCase().includes(q) || (c.blurb || '').toLowerCase().includes(q))
      : concepts.filter(c => Graph.status(c.id) !== 'locked').slice(0, 6);
    if (concepts.length) groups.push({ sec: q ? 'Concepts' : 'Jump to a concept',
      items: concepts.slice(0, 8).map(c => ({ icon: '◈', label: c.name, sub: gradeLabel(c.grade), onPick: () => openConcept(c.id) })) });

    let gs = mapView.grades().map(g => ({ g, label: gradeLabel(g) }));
    if (q) gs = gs.filter(x => x.label.toLowerCase().includes(q));
    if (gs.length) groups.push({ sec: 'Jump to a grade',
      items: gs.slice(0, 8).map(x => ({ icon: '↦', label: x.label, sub: 'grade', onPick: () => mapView.focusGrade(x.g) })) });

    const actions = [
      { icon: '◱', label: 'Overview map', sub: 'V', onPick: () => mapView.setMode('overview') },
      { icon: '★', label: 'Your progress', onPick: openProgress }
    ];
    const fa = q ? actions.filter(a => a.label.toLowerCase().includes(q)) : actions;
    if (fa.length) groups.push({ sec: 'Actions', items: fa });
    return groups;
  }

  /* ---------------- boot ---------------- */
  function boot() {
    rail = Atlas.Rail(el('rail'));
    el('railclose').onclick = closeRail;
    player = MATH.Player.Player(el('m-lesson'), { onExit: showMap, onComplete: () => { /* store change re-syncs */ } });
    mapView = MATH.Map.mount(el('m-map'), {
      onOpen: id => openConcept(id),
      onLocked: (c) => openConcept(c.id),
      onSoon: (c) => openConcept(c.id),
      onFocusChange: syncChrome
    });

    palette = Atlas.CommandPalette(el('cmd'), { provider });
    shell = Atlas.wireShell({ shell: el('app'), collapseBtn: el('collapse-btn'), menuBtn: el('menu-btn'), scrim: el('scrim'), onScrimClick: closeRail });

    el('open-cmd').onclick = palette.open;
    el('open-cmd2').onclick = palette.open;
    el('progress-btn').onclick = openProgress;
    el('continue-btn').onclick = () => { const rec = Graph.recommended(); if (rec) openLesson(rec.id); };
    el('overview-btn').onclick = () => { if (view === 'lesson') showMap(); mapView.setMode(mapView.mode() === 'overview' ? 'focus' : 'overview'); };

    // first paint (mapView now defined, so sync is safe)
    buildOutline(); syncChrome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
