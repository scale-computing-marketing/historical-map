/* Life Explorer — topic renderer (BIO.Explorer).
   Knows how to render one topic's *canvas* — a `kind:'diagram'` SVG, a `model3d`
   GLB with clickable hotspots, an `embed` iframe, or a custom `tool` — and wire
   every element carrying a data-part attribute to a caller-supplied onSelect(id).

   It is deliberately a pure renderer + a few rail-content helpers: the app
   orchestrator (engine/app.js) owns the rail, quiz, search and view switching,
   and the diagramExplore / labelHunt lesson simulations reuse renderTopic to put
   an existing diagram inside a lesson. New topics are still added as data files
   that register on window.BIO.topics.                                          */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });

  function catName(topic, key) { return (topic.categories && topic.categories[key]) || key; }
  function partById(topic, id) { return (topic.parts || []).find(p => p.id === id); }

  /* Render a topic's canvas into `host`. opts.onSelect(id) fires on any part
     click (diagram element or model hotspot). opts.interactive toggles pointer
     affordances (default true).                                                 */
  function renderTopic(host, topic, opts) {
    opts = opts || {};
    const onSelect = opts.onSelect || function () {};

    if (topic.kind === 'model3d') {
      const hs = (topic.hotspots || []).map((h, i) => {
        const p = partById(topic, h.partId) || {};
        return `<button class="mv-hotspot" slot="hotspot-${i}" data-part="${h.partId}"
          data-position="${h.position}" data-normal="${h.normal || '0 0 1'}">
          <span class="mv-dot"></span><span class="mv-label">${p.name || h.partId}</span></button>`;
      }).join('');
      host.innerHTML = `<model-viewer class="mv" src="${topic.modelSrc}" alt="${topic.name}"
        camera-controls touch-action="pan-y" loading="eager" reveal="auto" ${topic.autoRotate === false ? '' : 'auto-rotate'}
        shadow-intensity="1" exposure="1.05" interaction-prompt="none" ar>${hs}</model-viewer>
        ${topic.credit && topic.credit.text ? `<p class="embed-credit"><a href="${topic.credit.modelUrl}" target="_blank" rel="noopener nofollow">${topic.credit.text}</a>${topic.credit.author ? ' · ' + topic.credit.author : ''}${topic.credit.license ? ' · ' + topic.credit.license : ''}</p>` : ''}`;
      host.querySelectorAll('.mv-hotspot').forEach(b =>
        b.addEventListener('click', e => { e.stopPropagation(); onSelect(b.getAttribute('data-part')); }));
      // Diagnostics: turn a silent blank into an explanation of what failed.
      const mv = host.querySelector('model-viewer');
      const fail = msg => { if (host.querySelector('.mv-fallback')) return;
        const d = document.createElement('div'); d.className = 'mv-fallback note'; d.innerHTML = msg; host.appendChild(d); };
      mv.addEventListener('error', () => fail(`Couldn’t load the 3-D model <code>${topic.modelSrc}</code>. Check the file exists and that you’re viewing over <b>http://</b> (a local server), not opening the file directly.`));
      setTimeout(() => {
        if (!customElements.get('model-viewer')) fail('The 3-D viewer script (<code>vendor/model-viewer.min.js</code>) didn’t load. Serve this folder over <b>http://</b> — module scripts are blocked on <code>file://</code>.');
        else if (mv && !mv.loaded) fail('The 3-D viewer loaded but the model didn’t render — your browser may have <b>WebGL</b> disabled or unavailable.');
      }, 6000);
      return;
    }
    if (topic.kind === 'embed') {
      const c = topic.credit || {};
      host.innerHTML = `<div class="embed3d">
        <iframe title="${topic.embedTitle || topic.name}" frameborder="0" allowfullscreen
          allow="autoplay; fullscreen; xr-spatial-tracking" src="${topic.embedSrc}"></iframe>
        ${c.text ? `<p class="embed-credit"><a href="${c.modelUrl}" target="_blank" rel="noopener nofollow">${c.text}</a>
          by <a href="${c.authorUrl}" target="_blank" rel="noopener nofollow">${c.author}</a>
          on <a href="https://sketchfab.com" target="_blank" rel="noopener nofollow">Sketchfab</a>${c.license ? ' · ' + c.license : ''}</p>` : ''}
      </div>`;
      return;
    }
    if (topic.kind === 'tool' && typeof topic.mount === 'function') {
      host.innerHTML = '';
      topic.mount(host, { el: id => document.getElementById(id), selectPart: onSelect, openRail: opts.openRail || function () {} });
      return;
    }
    // diagram (default)
    host.innerHTML = topic.svg || '<p class="note">This topic has no diagram yet.</p>';
    host.querySelectorAll('[data-part]').forEach(g => {
      g.addEventListener('click', e => { e.stopPropagation(); onSelect(g.getAttribute('data-part')); });
    });
  }

  /* Toggle the .selected class on the diagram element for a given part id. */
  function highlight(host, partId) {
    host.querySelectorAll('[data-part]').forEach(g =>
      g.classList.toggle('selected', g.getAttribute('data-part') === partId));
  }

  /* ---- rail-content builders (used by the app's browse mode) ---- */
  function overviewHtml(topic) {
    const legend = Object.entries(topic.categories || {}).map(([k, label]) =>
      `<div class="chip" style="border-color:var(--bio-${k})">${label}</div>`).join('');
    const hint = topic.kind === 'model3d'
      ? 'Drag to rotate the 3-D model. Tap a dot — or open the Parts tab — to read about each part.'
      : topic.kind === 'embed'
        ? 'Drag to rotate the 3-D model and press play. Open the Parts tab to read about each organelle.'
        : topic.kind === 'tool'
          ? 'Use the tool on the left. Open the Parts tab for the key terms.'
          : 'Click any labelled part on the diagram — or open the Parts tab — to see what it does.';
    const heading = topic.kind === 'tool' ? 'Key terms' : 'Parts by role';
    return `<p class="lead">${topic.intro || ''}</p>
      <h3>${heading}</h3><div class="chips">${legend}</div>
      <p class="note">${hint}</p>`;
  }
  function partsListHtml(topic) {
    const groups = {};
    (topic.parts || []).forEach(p => { (groups[p.category] = groups[p.category] || []).push(p); });
    return Object.keys(topic.categories || groups).filter(k => groups[k]).map(cat =>
      `<div class="parts-group">${catName(topic, cat)}</div>` +
      groups[cat].map(p =>
        `<button class="list-item" data-open="${p.id}"><span class="dot" style="background:var(--bio-${cat})"></span>
          <span class="li-main"><span class="li-title">${p.name}</span><span class="li-sub">${(p.summary || '').slice(0, 62)}…</span></span></button>`).join('')
    ).join('');
  }
  function partDetailHtml(topic, p) {
    const fns = (p.functions || []).map(f => `<li>${f}</li>`).join('');
    const facts = (p.facts || []).map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('');
    const related = (p.related || []).map(id => { const r = partById(topic, id); return r ? `<button class="chip" data-open="${id}">${r.name}</button>` : ''; }).join('');
    return `<div class="chips"><span class="cat-tag" style="background:var(--bio-${p.category})">${catName(topic, p.category)}</span></div>
      <p class="lead">${p.summary}</p>
      ${p.analogy ? `<p class="analogy">${p.analogy}</p>` : ''}
      ${fns ? `<h3>What it does</h3><ul>${fns}</ul>` : ''}
      ${facts ? `<h3>Key facts</h3><dl class="kv">${facts}</dl>` : ''}
      ${related ? `<h3>Related parts</h3><div class="chips">${related}</div>` : ''}
      <button class="chip" data-back>← All parts</button>`;
  }
  function search(topic, q) {
    q = q.toLowerCase();
    return (topic.parts || []).filter(p => p.name.toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q))
      .map(p => ({ id: p.id, label: p.name, sub: catName(topic, p.category) }));
  }

  BIO.Explorer = { renderTopic, highlight, catName, partById, overviewHtml, partsListHtml, partDetailHtml, search };
})();
