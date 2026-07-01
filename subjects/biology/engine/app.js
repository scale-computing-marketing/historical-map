/* Life Explorer — Biology · app boot (sidebar shell).
   Composes the shared shell: a left curriculum sidebar (units + Explore models),
   a slim breadcrumb header, the focused-unit Map, the lesson Player, the classic
   clickable diagrams / 3-D models as an Explore surface (docked drawer + quiz),
   a ⌘K command palette, and the shared Drawer (#rail) for concept details.
   Framework-free; uses core/shell.js.                                          */
(function () {
  const BIO = window.BIO, Graph = BIO.Graph, Store = BIO.Store, Explorer = BIO.Explorer;
  const $ = id => document.getElementById(id);
  const app = $('app');
  const mapEl = () => $('bio-map'), lessonEl = () => $('bio-lesson'), canvasEl = () => $('canvas');

  let rail, quiz, player, mapView, palette, shell, pickResolver = null;
  let mode = 'map';                       // 'map' | 'lesson' | 'browse'
  let currentLesson = null;
  let browseTopic = null, bstate = { partId: null, tab: 'overview' };

  const unitTitle = u => Graph.unitName(u) || ('Unit ' + u);

  /* ---------------- drawer (overlay) vs docked panel ---------------- */
  function openDrawer() { app.classList.remove('rail-docked'); rail.open(); $('scrim').classList.add('open'); }
  function closeDrawer() { rail.close(); $('scrim').classList.remove('open'); }

  /* ---------------- view switching ---------------- */
  function setView(v) {
    mode = v;
    mapEl().style.display = v === 'map' ? '' : 'none';
    lessonEl().style.display = v === 'lesson' ? '' : 'none';
    canvasEl().style.display = v === 'browse' ? 'flex' : 'none';
    $('legend').style.display = v === 'browse' && browseTopic && !browseTopic.hideLegend ? '' : 'none';
    $('hint').style.display = v === 'browse' && browseTopic && browseTopic.kind === 'diagram' ? '' : 'none';
    $('quiz-btn').style.display = v === 'browse' ? '' : 'none';
    $('overview-btn').style.display = v === 'browse' ? 'none' : '';
    app.classList.toggle('rail-docked', v === 'browse');
  }

  /* ---------------- breadcrumbs ---------------- */
  function setCrumbs(parts) {
    const c = $('crumbs');
    c.innerHTML = parts.map((p, i) => {
      const last = i === parts.length - 1;
      return (last ? `<span class="here">${p.label}</span>` : `<button data-i="${i}">${p.label}</button>`)
        + (last ? '' : '<span class="sep">›</span>');
    }).join('');
    c.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const p = parts[+b.dataset.i]; if (p.on) p.on(); });
  }
  function crumbsSync() {
    const atlas = { label: 'Atlas', on: () => (location.href = '../../') };
    const subject = { label: 'Biology', on: showMap };
    if (mode === 'browse' && browseTopic) setCrumbs([atlas, subject, { label: 'Explore', on: showMap }, { label: browseTopic.name }]);
    else if (mode === 'lesson' && currentLesson) { const c = Graph.get(currentLesson); setCrumbs([atlas, subject, { label: unitTitle(c.unit), on: () => { showMap(); mapView.focusUnit(c.unit); } }, { label: c.name }]); }
    else if (mapView.mode() === 'overview') setCrumbs([atlas, subject, { label: 'Overview' }]);
    else setCrumbs([atlas, subject, { label: unitTitle(mapView.unit()) }]);
  }

  /* ---------------- sidebar outline ---------------- */
  function buildOutline() {
    const wrap = $('outline'); if (!wrap) return;
    wrap.innerHTML = '';
    mapView.units().forEach(u => {
      const cs = Graph.all().filter(c => c.unit === u).sort((a, b) => (a.strand || '').localeCompare(b.strand || ''));
      const mastered = cs.filter(c => Store.isMastered(c.id)).length;
      const pct = cs.length ? Math.round(mastered / cs.length * 100) : 0;
      const isFocus = u === mapView.unit() && (mode === 'map' || mode === 'lesson');

      const group = document.createElement('div'); group.className = 'la-navgroup';
      const head = document.createElement('button');
      head.className = 'la-grouphead'; head.setAttribute('aria-expanded', String(isFocus));
      head.innerHTML = `<span class="tw">▾</span><span>${unitTitle(u)}</span><span class="cnt">${mastered}/${cs.length}</span>`;
      head.onclick = () => mapView.focusUnit(u);
      group.appendChild(head);
      if (isFocus) {
        const bar = document.createElement('div'); bar.className = 'la-groupbar';
        bar.innerHTML = `<span style="width:${pct}%"></span>`; group.appendChild(bar);
        const items = document.createElement('div'); items.className = 'la-subgroup';
        cs.forEach(c => {
          const st = Graph.status(c.id);
          const dot = (st === 'mastered' || st === 'review') ? 'done' : st === 'available' ? 'now' : st === 'ready-soon' ? '' : 'locked';
          const it = document.createElement('button');
          it.className = 'la-navitem' + (mode === 'lesson' && currentLesson === c.id ? ' active' : '');
          it.innerHTML = `<span class="dot ${dot}"></span><span class="nm">${c.name}</span>${st === 'locked' ? '<span class="lk">🔒</span>' : ''}`;
          it.onclick = () => { openConcept(c.id); if (shell) shell.closeNav(); };
          items.appendChild(it);
        });
        group.appendChild(items);
      }
      wrap.appendChild(group);
    });

    // Explore models group
    const topics = Object.values(BIO.topics || {});
    if (topics.length) {
      const group = document.createElement('div'); group.className = 'la-navgroup';
      const head = document.createElement('button');
      head.className = 'la-grouphead'; head.setAttribute('aria-expanded', 'true');
      head.innerHTML = `<span class="tw">▾</span><span>Explore models</span>`;
      head.onclick = () => head.parentElement.querySelector('.la-subgroup').classList.toggle('collapsed');
      const items = document.createElement('div'); items.className = 'la-subgroup';
      topics.forEach(t => {
        const it = document.createElement('button');
        it.className = 'la-navitem' + (mode === 'browse' && browseTopic && browseTopic.id === t.id ? ' active' : '');
        it.innerHTML = `<span class="dot" style="border:0;background:none;font-size:13px;width:auto;height:auto">${t.icon || '🔬'}</span><span class="nm">${t.name}</span>`;
        it.onclick = () => { openBrowse(t.id); if (shell) shell.closeNav(); };
        items.appendChild(it);
      });
      group.appendChild(head); group.appendChild(items); wrap.appendChild(group);
    }
  }

  function renderStreak() {
    const s = Store.summary();
    $('streak').innerHTML = `<span class="fire">${s.streakActive ? '🔥' : '☆'}</span> <b>${s.streak}</b><span>day streak · ${s.stars} ★</span>`;
  }
  function syncChrome() {
    if (!mapView) return;
    $('overview-label').textContent = mapView.mode() === 'overview' ? '◈ Focused unit' : '⤢ Overview';
    crumbsSync(); buildOutline(); renderStreak();
  }

  /* ---------------- concept detail drawer ---------------- */
  function openConcept(id) {
    const c = Graph.get(id); if (!c) return;
    if (mode !== 'map') showMap();
    mapView.focusUnit(c.unit);
    const st = Graph.status(id);
    const rec = Store.concept(id) || {};
    const kindMap = { mastered: 'Concept · mastered', available: 'Concept · ready to learn', review: 'Concept · review', 'ready-soon': 'Concept · coming soon', locked: 'Concept · locked' };
    const pre = (c.prereqs || []).map(p => Graph.get(p)).filter(Boolean);
    const unlocks = Graph.all().filter(x => (x.prereqs || []).includes(id));
    const missing = pre.filter(p => !Store.isMastered(p.id));
    const canStart = (st === 'available' || st === 'mastered' || st === 'review') && c.lesson;
    const pct = st === 'mastered' ? 100 : rec.stars ? Math.round(rec.stars / 3 * 100) : 0;
    const body = `
      <p class="ui" style="font-size:13px;color:var(--muted);margin:0 0 14px">${unitTitle(c.unit)} · ${c.strand} strand</p>
      ${canStart ? `<button class="btn btn-primary btn-block" data-start="${id}" style="margin-bottom:16px">${st === 'mastered' ? 'Practise again' : 'Start lesson'} →</button>` : ''}
      ${st !== 'locked' && st !== 'ready-soon' ? `<div class="progress" style="margin-bottom:16px"><span style="width:${pct}%"></span></div>` : ''}
      <p class="lead">${c.blurb || ''}</p>
      ${pre.length ? `<h3>Prerequisites</h3><div class="chips">${pre.map(p => `<button class="chip ${Store.isMastered(p.id) ? 'active' : ''}" data-go="${p.id}">${p.name}${Store.isMastered(p.id) ? ' ✓' : ''}</button>`).join('')}</div>` : ''}
      ${unlocks.length ? `<h3>Unlocks next</h3><div class="chips">${unlocks.map(u => `<button class="chip" data-go="${u.id}">${u.name}</button>`).join('')}</div>` : ''}
      ${st === 'locked' ? `<div class="alert alert-warn" style="margin-top:16px"><span class="alert-ic">🔒</span><span>Master ${missing.map(m => '<b>' + m.name + '</b>').join(' and ') || 'the prerequisites'} to unlock this.</span></div>` : ''}
      ${st === 'ready-soon' ? `<div class="alert alert-info" style="margin-top:16px"><span class="alert-ic">ℹ</span><span>Unlocked — its interactive lesson is still being built.</span></div>` : ''}`;
    rail.update({
      title: c.name, kind: kindMap[st] || 'Concept', tabs: [], body,
      onBody(el) {
        const s = el.querySelector('[data-start]'); if (s) s.onclick = () => openLesson(id);
        el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openConcept(b.dataset.go));
      }
    });
    openDrawer();
  }

  /* ---------------- progress drawer ---------------- */
  function openProgress() { if (mode !== 'map') showMap(); renderProgress(); openDrawer(); }
  function renderProgress() {
    const s = Store.summary();
    const total = Graph.all().filter(c => c.lesson).length;
    const rec = Graph.recommended();
    const review = Store.needsReview(70).map(r => Graph.get(r.id)).filter(Boolean);
    const fav = s.favourite ? (BIO.Components.get(s.favourite) || {}).title || s.favourite : null;
    const body = `
      <div class="m-prog-hero">
        <div class="m-prog-streak">${s.streakActive ? '🔥' : '☆'} <b>${s.streak}</b><span>day streak</span></div>
        <div class="m-prog-stars">★ <b>${s.stars}</b><span>stars earned</span></div>
      </div>
      <div class="m-prog-grid">
        <div><b>${s.mastered}</b><span>concepts mastered</span></div>
        <div><b>${s.completed}/${total}</b><span>lessons done</span></div>
        <div><b>${s.accuracy == null ? '—' : s.accuracy + '%'}</b><span>accuracy</span></div>
        <div><b>${s.timeMs ? Math.max(1, Math.round(s.timeMs / 60000)) + 'm' : '—'}</b><span>time exploring</span></div>
      </div>
      ${rec ? `<h3>Recommended next</h3>
        <button class="m-rec" data-go="${rec.id}"><b>${rec.name}</b><span>${unitTitle(rec.unit)}</span></button>` : ''}
      ${review.length ? `<h3>Areas to review</h3><div class="chips">${review.map(c => `<button class="chip" data-go="${c.id}">${c.name}</button>`).join('')}</div>` : ''}
      ${fav ? `<h3>Favourite simulation</h3><p class="m-fav">${fav}</p>` : ''}
      <h3>Biologist badges</h3>
      <div class="m-badges">${titles(s).map(t => `<div class="m-badge-t ${t.earned ? 'earned' : ''}"><span class="m-bt-ic">${t.icon}</span><span class="m-bt-name">${t.name}</span><span class="m-bt-req">${t.req}</span></div>`).join('')}</div>
      <button class="chip m-reset" data-reset style="margin-top:14px">Reset all progress</button>`;
    rail.update({ title: 'Your progress', kind: 'Field notebook', tabs: [], body, onBody(el) {
      el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openConcept(b.dataset.go));
      const rst = el.querySelector('[data-reset]'); if (rst) rst.onclick = () => { if (confirm('Reset all biology progress? This cannot be undone.')) { Store.reset(); renderProgress(); } };
    } });
  }
  function titles(s) {
    return [
      { icon: '🌱', name: 'First Discovery', req: 'Finish 1 lesson', earned: s.completed >= 1 },
      { icon: '🔬', name: 'Cell Explorer', req: 'Master 3 concepts', earned: s.mastered >= 3 },
      { icon: '🔥', name: 'On a Streak', req: '3-day streak', earned: s.streak >= 3 },
      { icon: '⭐', name: 'Specimen Collector', req: 'Earn 15 stars', earned: s.stars >= 15 },
      { icon: '🧬', name: 'Life Scientist', req: 'Master 8 concepts', earned: s.mastered >= 8 }
    ];
  }

  /* ---------------- view transitions ---------------- */
  function openLesson(id) {
    const c = Graph.get(id); if (!c || !c.lesson) return;
    currentLesson = id; browseTopic = null;
    setView('lesson');
    player.start(id);
    closeDrawer(); if (shell) shell.closeNav();
    crumbsSync(); buildOutline();
  }
  function showMap() {
    currentLesson = null; browseTopic = null;
    lessonEl().innerHTML = '';
    setView('map');
    closeDrawer();
    mapView.render();
    crumbsSync(); buildOutline();
  }

  /* ---------------- Explore (browse) ---------------- */
  function openBrowse(topicId) {
    const t = BIO.topics[topicId]; if (!t) return;
    browseTopic = t; currentLesson = null; bstate = { partId: null, tab: 'overview' };
    setView('browse');
    renderLegend();
    Explorer.renderTopic(canvasEl(), t, {
      interactive: true, openRail: () => rail.open(),
      onSelect(id) {
        if (quiz.isAwaitingClick()) { if (pickResolver) { const r = pickResolver; pickResolver = null; r(id); } return; }
        selectPart(id);
      }
    });
    Explorer.highlight(canvasEl(), null);
    renderBrowseRail(); rail.open();       // docked (rail-docked set by setView)
    if (shell) shell.closeNav();
    crumbsSync(); buildOutline();
  }
  function selectPart(id) { bstate.partId = id; bstate.tab = 'parts'; rail.open(); renderBrowseRail(); Explorer.highlight(canvasEl(), id); }
  function clearSelection() { bstate.partId = null; renderBrowseRail(); Explorer.highlight(canvasEl(), null); }
  function renderLegend() {
    const legend = $('legend');
    if (!browseTopic || browseTopic.hideLegend) { legend.style.display = 'none'; return; }
    const rows = Object.entries(browseTopic.categories || {}).map(([k, label]) =>
      `<div class="row"><span class="sw" style="background:var(--bio-${k})"></span>${label}</div>`).join('');
    legend.innerHTML = `<div class="ttl">${browseTopic.name}</div>${rows}`;
  }
  function renderBrowseRail() {
    const t = browseTopic;
    const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'parts', label: 'Parts' }];
    let title, kind, body;
    if (bstate.tab === 'parts' && bstate.partId) {
      const p = Explorer.partById(t, bstate.partId);
      title = p.name; kind = Explorer.catName(t, p.category) + ' · ' + t.name; body = Explorer.partDetailHtml(t, p);
    } else if (bstate.tab === 'parts') {
      title = t.name; kind = (t.parts || []).length + ' parts'; body = Explorer.partsListHtml(t);
    } else {
      title = t.name; kind = 'Explore'; body = Explorer.overviewHtml(t);
    }
    rail.update({
      title, kind, tabs, activeTab: bstate.tab,
      onTab: id => { bstate.tab = id; if (id !== 'parts') bstate.partId = null; renderBrowseRail(); Explorer.highlight(canvasEl(), bstate.partId); },
      body,
      onBody(el) {
        el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => selectPart(b.getAttribute('data-open')));
        const back = el.querySelector('[data-back]'); if (back) back.onclick = clearSelection;
      }
    });
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
      items: concepts.slice(0, 8).map(c => ({ icon: '◈', label: c.name, sub: unitTitle(c.unit), onPick: () => openConcept(c.id) })) });

    let topics = Object.values(BIO.topics || {});
    if (q) topics = topics.filter(t => t.name.toLowerCase().includes(q));
    if (topics.length) groups.push({ sec: 'Explore models',
      items: topics.slice(0, 6).map(t => ({ icon: t.icon || '🔬', label: t.name, sub: 'model', onPick: () => openBrowse(t.id) })) });

    let us = mapView.units().map(u => ({ u, label: unitTitle(u) }));
    if (q) us = us.filter(x => x.label.toLowerCase().includes(q));
    if (us.length) groups.push({ sec: 'Jump to a unit',
      items: us.slice(0, 8).map(x => ({ icon: '↦', label: x.label, sub: 'unit', onPick: () => mapView.focusUnit(x.u) })) });

    const actions = [
      { icon: '◱', label: 'Overview map', onPick: () => { if (mode !== 'map') showMap(); mapView.setMode('overview'); } },
      { icon: '★', label: 'Your progress', onPick: openProgress }
    ];
    const fa = q ? actions.filter(a => a.label.toLowerCase().includes(q)) : actions;
    if (fa.length) groups.push({ sec: 'Actions', items: fa });
    return groups;
  }

  /* ---------------- boot ---------------- */
  function boot() {
    rail = BIO.Rail = Atlas.Rail($('rail'));
    $('railclose').onclick = closeDrawer;
    quiz = Atlas.Quiz($('quiz'), { banner: $('live-instruction'), onExpectClick: cb => { pickResolver = cb; } });
    player = BIO.Player.Player(lessonEl(), { onExit: showMap, onComplete: () => { /* store change re-syncs */ } });
    mapView = BIO.Map.mount(mapEl(), {
      onOpen: id => openConcept(id),
      onLocked: (c) => openConcept(c.id),
      onSoon: (c) => openConcept(c.id),
      onFocusChange: syncChrome
    });

    palette = Atlas.CommandPalette($('cmd'), { provider });
    shell = Atlas.wireShell({ shell: app, collapseBtn: $('collapse-btn'), menuBtn: $('menu-btn'), scrim: $('scrim'), onScrimClick: closeDrawer });

    $('open-cmd').onclick = palette.open;
    $('open-cmd2').onclick = palette.open;
    $('progress-btn').onclick = openProgress;
    $('continue-btn').onclick = () => { const rec = Graph.recommended(); if (rec) openLesson(rec.id); };
    $('overview-btn').onclick = () => { if (mode !== 'map') showMap(); mapView.setMode(mapView.mode() === 'overview' ? 'focus' : 'overview'); };
    $('quiz-btn').onclick = () => { if (browseTopic) quiz.run(browseTopic.quizzes || []); };
    canvasEl().addEventListener('click', e => {
      if (mode !== 'browse' || !browseTopic || browseTopic.kind !== 'diagram') return;
      if (e.target.closest('[data-part]')) return;
      if (!quiz.isAwaitingClick()) clearSelection();
    });

    setView('map');
    buildOutline(); syncChrome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
