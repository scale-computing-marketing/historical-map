/* Life Explorer — biology app. War-agnostic in spirit: it knows how to render a
   `kind:'diagram'` topic (inject the SVG, wire data-part clicks to the info rail)
   and composes the shared Atlas shell for the rail, quiz, menus and search.
   New topics are added as data files that register on window.BIO.topics.       */
(function () {
  const BIO = window.BIO || { topics: {} };
  const TOPICS = Object.values(BIO.topics);
  let topic = TOPICS[0];
  const state = { partId: null, tab: 'overview' };
  let rail, quiz, pickResolver = null;

  const partById = id => topic.parts.find(p => p.id === id);
  const catName = key => (topic.categories && topic.categories[key]) || key;

  /* ---------------- canvas (diagram or custom tool) ---------------- */
  function renderCanvas() {
    const canvas = Atlas.el('canvas');
    const hintEl = Atlas.el('hint'); if (hintEl) hintEl.style.display = topic.kind === 'diagram' ? '' : 'none';
    if (topic.kind === 'model3d') {
      const hs = (topic.hotspots || []).map((h, i) => {
        const p = partById(h.partId) || {};
        return `<button class="mv-hotspot" slot="hotspot-${i}" data-part="${h.partId}"
          data-position="${h.position}" data-normal="${h.normal || '0 0 1'}">
          <span class="mv-dot"></span><span class="mv-label">${p.name || h.partId}</span></button>`;
      }).join('');
      canvas.innerHTML = `<model-viewer class="mv" src="${topic.modelSrc}" alt="${topic.name}"
        camera-controls touch-action="pan-y" loading="eager" reveal="auto" ${topic.autoRotate === false ? '' : 'auto-rotate'}
        shadow-intensity="1" exposure="1.05" interaction-prompt="none" ar>${hs}</model-viewer>
        ${topic.credit && topic.credit.text ? `<p class="embed-credit"><a href="${topic.credit.modelUrl}" target="_blank" rel="noopener nofollow">${topic.credit.text}</a>${topic.credit.author ? ' · ' + topic.credit.author : ''}${topic.credit.license ? ' · ' + topic.credit.license : ''}</p>` : ''}`;
      canvas.querySelectorAll('.mv-hotspot').forEach(b =>
        b.addEventListener('click', e => { e.stopPropagation(); selectPart(b.getAttribute('data-part')); }));
      // Diagnostics: turn a silent blank into an explanation of what failed.
      const mv = canvas.querySelector('model-viewer');
      const fail = msg => { if (canvas.querySelector('.mv-fallback')) return;
        const d = document.createElement('div'); d.className = 'mv-fallback note'; d.innerHTML = msg; canvas.appendChild(d); };
      mv.addEventListener('error', () => fail(`Couldn’t load the 3-D model <code>${topic.modelSrc}</code>. Check the file exists and that you’re viewing over <b>http://</b> (a local server), not opening the file directly.`));
      setTimeout(() => {
        if (!customElements.get('model-viewer')) fail('The 3-D viewer script (<code>vendor/model-viewer.min.js</code>) didn’t load. Serve this folder over <b>http://</b> — module scripts are blocked on <code>file://</code>.');
        else if (mv && !mv.loaded) fail('The 3-D viewer loaded but the model didn’t render — your browser may have <b>WebGL</b> disabled or unavailable.');
      }, 6000);
      return;
    }
    if (topic.kind === 'embed') {
      const c = topic.credit || {};
      canvas.innerHTML = `<div class="embed3d">
        <iframe title="${topic.embedTitle || topic.name}" frameborder="0" allowfullscreen
          allow="autoplay; fullscreen; xr-spatial-tracking" src="${topic.embedSrc}"></iframe>
        ${c.text ? `<p class="embed-credit"><a href="${c.modelUrl}" target="_blank" rel="noopener nofollow">${c.text}</a>
          by <a href="${c.authorUrl}" target="_blank" rel="noopener nofollow">${c.author}</a>
          on <a href="https://sketchfab.com" target="_blank" rel="noopener nofollow">Sketchfab</a>${c.license ? ' · ' + c.license : ''}</p>` : ''}
      </div>`;
      return;
    }
    if (topic.kind === 'tool' && typeof topic.mount === 'function') {
      canvas.innerHTML = '';
      topic.mount(canvas, { el: Atlas.el, selectPart, openRail: () => rail.open() });
      return;
    }
    canvas.innerHTML = topic.svg || '<p class="note">This topic has no diagram yet.</p>';
    canvas.querySelectorAll('[data-part]').forEach(g => {
      g.addEventListener('click', e => {
        e.stopPropagation();
        const id = g.getAttribute('data-part');
        if (quiz.isAwaitingClick()) { if (pickResolver) { const r = pickResolver; pickResolver = null; r(id); } return; }
        selectPart(id);
      });
    });
    highlightSelected();
  }
  function highlightSelected() {
    Atlas.el('canvas').querySelectorAll('[data-part]').forEach(g =>
      g.classList.toggle('selected', g.getAttribute('data-part') === state.partId));
  }
  function selectPart(id) { state.partId = id; state.tab = 'parts'; rail.open(); render(); highlightSelected(); }
  function clearSelection() { state.partId = null; render(); highlightSelected(); }

  /* ---------------- rail content ---------------- */
  function render() {
    const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'parts', label: 'Parts' }];
    let title, kind, body;
    if (state.tab === 'parts' && state.partId) {
      const p = partById(state.partId);
      title = p.name; kind = catName(p.category) + ' · ' + topic.name; body = partDetail(p);
    } else if (state.tab === 'parts') {
      title = topic.name; kind = topic.parts.length + ' parts'; body = partsList();
    } else {
      title = topic.name; kind = 'Topic'; body = overview();
    }
    rail.update({
      title, kind, tabs, activeTab: state.tab,
      onTab: id => { state.tab = id; if (id !== 'parts') state.partId = null; render(); highlightSelected(); },
      body, onBody: wireBody
    });
  }
  function wireBody(el) {
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => selectPart(b.getAttribute('data-open')));
    const back = el.querySelector('[data-back]'); if (back) back.onclick = clearSelection;
  }

  function overview() {
    const legend = Object.entries(topic.categories || {}).map(([k, label]) =>
      `<div class="chip" style="border-color:var(--bio-${k})">${label}</div>`).join('');
    const hint = topic.kind === 'embed'
      ? 'Drag to rotate the 3-D model and press play. Open the Parts tab to read about each organelle.'
      : topic.kind === 'tool'
        ? 'Use the tool on the left. Open the Parts tab for the key terms.'
        : 'Click any labelled part on the diagram — or open the Parts tab — to see what it does.';
    const heading = topic.kind === 'tool' ? 'Key terms' : (topic.kind === 'embed' ? 'Organelles by role' : 'Parts by role');
    return `<p class="lead">${topic.intro || ''}</p>
      <h3>${heading}</h3><div class="chips">${legend}</div>
      <p class="note">${hint}</p>`;
  }
  function partsList() {
    const groups = {};
    topic.parts.forEach(p => { (groups[p.category] = groups[p.category] || []).push(p); });
    return Object.keys(topic.categories || groups).filter(k => groups[k]).map(cat =>
      `<div class="parts-group">${catName(cat)}</div>` +
      groups[cat].map(p =>
        `<button class="list-item" data-open="${p.id}"><span class="dot" style="background:var(--bio-${cat})"></span>
          <span class="li-main"><span class="li-title">${p.name}</span><span class="li-sub">${p.summary.slice(0, 62)}…</span></span></button>`).join('')
    ).join('');
  }
  function partDetail(p) {
    const fns = (p.functions || []).map(f => `<li>${f}</li>`).join('');
    const facts = (p.facts || []).map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('');
    const related = (p.related || []).map(id => { const r = partById(id); return r ? `<button class="chip" data-open="${id}">${r.name}</button>` : ''; }).join('');
    return `<div class="chips"><span class="cat-tag" style="background:var(--bio-${p.category})">${catName(p.category)}</span></div>
      <p class="lead">${p.summary}</p>
      ${p.analogy ? `<p class="analogy">${p.analogy}</p>` : ''}
      ${fns ? `<h3>What it does</h3><ul>${fns}</ul>` : ''}
      ${facts ? `<h3>Key facts</h3><dl class="kv">${facts}</dl>` : ''}
      ${related ? `<h3>Related parts</h3><div class="chips">${related}</div>` : ''}
      <button class="chip" data-back>← All parts</button>`;
  }

  /* ---------------- legend ---------------- */
  function renderLegend() {
    const legend = Atlas.el('legend');
    if (topic.hideLegend) { legend.style.display = 'none'; return; }
    legend.style.display = '';
    const rows = Object.entries(topic.categories || {}).map(([k, label]) =>
      `<div class="row"><span class="sw" style="background:var(--bio-${k})"></span>${label}</div>`).join('');
    legend.innerHTML = `<div class="ttl">${topic.name}</div>${rows}`;
  }

  /* ---------------- topic switching ---------------- */
  function setBrand() {
    document.getElementById('brand-title').textContent = topic.name;
    document.title = 'Life Explorer — ' + topic.name + ' · Learning Atlas';
  }
  function buildTopicMenu() {
    const pop = Atlas.el('topic-pop');
    pop.innerHTML = '<div class="head">Choose a topic</div>' + TOPICS.map(t =>
      `<button class="menu-item" data-topic="${t.id}" style="${t.id === topic.id ? 'font-weight:700' : ''}">
        ${t.icon || ''} ${t.name}<span style="display:block;font-size:11px;color:var(--muted)">${t.tagline || ''}</span></button>`).join('');
    pop.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { switchTopic(b.getAttribute('data-topic')); pop.classList.remove('open'); });
  }
  function switchTopic(id) {
    if (!BIO.topics[id]) return;
    topic = BIO.topics[id]; state.partId = null; state.tab = 'overview';
    setBrand(); buildTopicMenu(); renderCanvas(); renderLegend(); render();
  }

  /* ---------------- search ---------------- */
  function search(q) {
    q = q.toLowerCase();
    return topic.parts.filter(p => p.name.toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q))
      .map(p => ({ id: p.id, label: p.name, sub: catName(p.category) }));
  }

  /* ---------------- boot ---------------- */
  function boot() {
    if (!topic) { document.getElementById('canvas').innerHTML = '<p class="note">No topics loaded.</p>'; return; }
    rail = Atlas.Rail(Atlas.el('rail'));
    quiz = Atlas.Quiz(Atlas.el('quiz'), {
      banner: Atlas.el('live-instruction'),
      onExpectClick: cb => { pickResolver = cb; }
    });
    Atlas.wireMenus([['topic-btn', 'topic-pop']]);
    Atlas.wireSearch(Atlas.el('search'), Atlas.el('results'), search, item => selectPart(item.id));
    Atlas.el('quiz-btn').onclick = () => quiz.run(topic.quizzes || []);
    Atlas.el('overview-btn').onclick = () => { state.tab = 'overview'; state.partId = null; rail.open(); render(); highlightSelected(); };
    Atlas.el('canvas').addEventListener('click', e => {
      if (topic.kind !== 'diagram') return;              // tools/embeds manage their own area
      if (e.target.closest('[data-part]')) return;       // a part handled it
      if (!quiz.isAwaitingClick()) clearSelection();
    });

    setBrand(); buildTopicMenu(); renderCanvas(); renderLegend(); render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
