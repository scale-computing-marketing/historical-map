/* Life Explorer — Biology · app boot.
   Ties the platform together: the learning Map (a view over the biology knowledge
   graph), the lesson Player, a Browse mode that reuses the original clickable
   diagrams / 3-D models / tools as an exploration surface, a progress + rewards
   panel in the docked Rail, and top-bar search over concepts.

   Three views swap inside #bio-main (map / lesson / browse); the Rail stays
   docked beside them. Framework-free; composes core/shell.js.                  */
(function () {
  const BIO = window.BIO, Graph = BIO.Graph, Store = BIO.Store, Explorer = BIO.Explorer;

  let rail, quiz, player, mapView, pickResolver = null;
  let mode = 'map';
  let browseTopic = null, bstate = { partId: null, tab: 'overview' };

  const $ = id => document.getElementById(id);
  const mapEl = () => $('bio-map'), lessonEl = () => $('bio-lesson'), canvasEl = () => $('canvas');

  /* ---------------- view switching ---------------- */
  function setView(v) {
    mode = v;
    mapEl().style.display = v === 'map' ? '' : 'none';
    lessonEl().style.display = v === 'lesson' ? '' : 'none';
    canvasEl().style.display = v === 'browse' ? 'flex' : 'none';
    $('legend').style.display = v === 'browse' && browseTopic && !browseTopic.hideLegend ? '' : 'none';
    $('hint').style.display = v === 'browse' && browseTopic && browseTopic.kind === 'diagram' ? '' : 'none';
    $('quiz-btn').style.display = v === 'browse' ? '' : 'none';
  }

  function showMap() {
    setView('map');
    $('brand-title').textContent = 'Learning Map';
    document.title = 'Life Explorer — Learning Map · Learning Atlas';
    if (mapView) mapView.render();
  }
  function openLesson(conceptId) {
    const c = Graph.get(conceptId); if (!c) return;
    setView('lesson');
    $('brand-title').textContent = c.name;
    player.start(conceptId);
  }

  /* ---------------- browse mode (the classic Life Explorer) ---------------- */
  function openBrowse(topicId) {
    const t = BIO.topics[topicId]; if (!t) return;
    browseTopic = t; bstate = { partId: null, tab: 'overview' };
    setView('browse');
    $('brand-title').textContent = t.name;
    document.title = 'Life Explorer — ' + t.name + ' · Learning Atlas';
    renderLegend();
    Explorer.renderTopic(canvasEl(), t, {
      interactive: true, openRail: () => rail.open(),
      onSelect(id) {
        if (quiz.isAwaitingClick()) { if (pickResolver) { const r = pickResolver; pickResolver = null; r(id); } return; }
        selectPart(id);
      }
    });
    Explorer.highlight(canvasEl(), null);
    renderBrowseRail(); rail.open();
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

  /* ---------------- progress + rewards panel (in the rail) ---------------- */
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
        <button class="m-rec" data-go="${rec.id}"><b>${rec.name}</b><span>Unit ${rec.unit} · ${Graph.unitName(rec.unit)}</span></button>` : ''}
      ${review.length ? `<h3>Areas to review</h3><div class="chips">${review.map(c => `<button class="chip" data-go="${c.id}">${c.name}</button>`).join('')}</div>` : ''}
      ${fav ? `<h3>Favourite simulation</h3><p class="m-fav">${fav}</p>` : ''}
      <h3>Biologist badges</h3>
      <div class="m-badges">${titles(s).map(t => `<div class="m-badge-t ${t.earned ? 'earned' : ''}"><span class="m-bt-ic">${t.icon}</span><span class="m-bt-name">${t.name}</span><span class="m-bt-req">${t.req}</span></div>`).join('')}</div>
      <button class="chip m-reset" data-reset style="margin-top:14px">Reset all progress</button>`;
    rail.update({ title: 'Your progress', kind: 'Field notebook', tabs: [], body, onBody(el) {
      el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openLesson(b.dataset.go));
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

  /* ---------------- topic menu (browse existing diagrams) ---------------- */
  function buildTopicMenu() {
    const pop = $('topic-pop');
    const list = Object.values(BIO.topics);
    pop.innerHTML = '<div class="head">Explore a model</div>' + list.map(t =>
      `<button class="menu-item" data-topic="${t.id}">${t.icon || ''} ${t.name}<span style="display:block;font-size:11px;color:var(--muted)">${t.tagline || ''}</span></button>`).join('');
    pop.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { openBrowse(b.getAttribute('data-topic')); pop.classList.remove('open'); });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    rail = BIO.Rail = Atlas.Rail($('rail'));
    quiz = Atlas.Quiz($('quiz'), { banner: $('live-instruction'), onExpectClick: cb => { pickResolver = cb; } });
    player = BIO.Player.Player(lessonEl(), { onExit: showMap, onComplete: () => { /* status re-derives via Store.onChange */ } });
    mapView = BIO.Map.mount(mapEl(), {
      onOpen: openLesson,
      onLocked: (c, missing) => { rail.open(); rail.update({ title: c.name + ' 🔒', kind: 'Locked', tabs: [], body:
        `<p class="lead">${c.blurb || ''}</p><div class="note">First master ${missing.length ? missing.map(m => '<b>' + m + '</b>').join(' and ') : 'the prerequisites'} to unlock this.</div>
         <h3>Unit</h3><p>${c.unit} · ${Graph.unitName(c.unit)}</p>` }); },
      onSoon: (c) => { rail.open(); rail.update({ title: c.name, kind: 'Coming soon', tabs: [], body:
        `<p class="lead">${c.blurb || ''}</p><div class="note">This concept is unlocked, but its interactive lesson is still being built. The path to it is ready.</div>
         <h3>Unit</h3><p>${c.unit} · ${Graph.unitName(c.unit)}</p>` }); }
    });

    Atlas.wireMenus([['view-btn', 'view-pop'], ['topic-btn', 'topic-pop']]);
    Atlas.wireSearch($('search'), $('results'), Graph.search, item => {
      const st = Graph.status(item.id);
      if (st === 'locked' || st === 'ready-soon') { showMap(); }
      else openLesson(item.id);
    });
    buildTopicMenu();

    $('progress-btn').onclick = () => { renderProgress(); rail.open(); };
    $('map-btn').onclick = () => { showMap(); rail.close(); };
    $('continue-btn').onclick = () => { const rec = Graph.recommended(); if (rec) openLesson(rec.id); else showMap(); };
    $('quiz-btn').onclick = () => { if (browseTopic) quiz.run(browseTopic.quizzes || []); };
    canvasEl().addEventListener('click', e => {
      if (mode !== 'browse' || !browseTopic || browseTopic.kind !== 'diagram') return;
      if (e.target.closest('[data-part]')) return;
      if (!quiz.isAwaitingClick()) clearSelection();
    });

    showMap();
    // The rail is docked on desktop, so always fill it with the progress panel;
    // only pop the drawer open on mobile if there's history worth showing.
    renderProgress();
    if (Store.summary().completed > 0) rail.open();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
