/* Life Explorer — Biology · learning map (focused-unit model).
   Shows ONE unit at a time as a compact dependency graph that fits the screen
   (focus mode), plus a zoomed-out grid of every unit as progress cards (overview
   mode). The sidebar drives which unit is in focus. Pure view over BIO.Graph +
   the progress store.

   Exposes window.BIO.Map: mount(host, opts) -> {
     render, focusUnit(u), unit(), mode(), setMode('focus'|'overview'),
     units(), unitTitle(u), destroy
   }.  opts: onOpen(id), onLocked(c,missing), onSoon(c), onFocusChange(unit,mode) */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });
  const U = BIO.util, Graph = BIO.Graph, Store = BIO.Store;

  const COL_W = 214, NODE_W = 186, NODE_H = 78, GAP_Y = 22, PAD = 40, TOPGAP = 20;

  function mount(host, opts) {
    opts = opts || {};
    host.classList.add('m-map-host');
    host.innerHTML = `<div class="m-map-scroll" id="m-map-scroll">
      <div class="m-map-inner" id="m-map-inner">
        <svg class="m-map-edges" id="m-map-edges"></svg>
        <div class="m-map-nodes" id="m-map-nodes"></div>
      </div></div>
      <div class="m-overview" id="m-overview"></div>`;
    const scrollEl = host.querySelector('#m-map-scroll');
    const inner = host.querySelector('#m-map-inner');
    const edgesSvg = host.querySelector('#m-map-edges');
    const nodesEl = host.querySelector('#m-map-nodes');
    const overviewEl = host.querySelector('#m-overview');

    let mode = 'focus';
    let focus = null;              // current unit number
    let layout = {};

    function units() { return Graph.UNIT_ORDER.filter(u => Graph.all().some(c => c.unit === u)); }
    function unitTitle(u) { return Graph.unitName(u) || ('Unit ' + u); }
    function defaultUnit() {
      const rec = Graph.recommended();
      if (rec) return rec.unit;
      const us = units();
      return us.find(u => Graph.all().some(c => c.unit === u && Graph.status(c.id) === 'available')) || us[0];
    }

    function render() {
      if (focus == null || !units().includes(focus)) focus = defaultUnit();
      host.classList.toggle('is-overview', mode === 'overview');
      if (mode === 'overview') renderOverview(); else renderFocus();
      if (opts.onFocusChange) opts.onFocusChange(focus, mode);
    }

    function renderFocus() {
      const concepts = Graph.all().filter(c => c.unit === focus);
      concepts.sort((a, b) => (a.strand || '').localeCompare(b.strand || ''));
      const inUnit = new Set(concepts.map(c => c.id));

      const depthCache = {};
      function depth(id, seen) {
        if (depthCache[id] != null) return depthCache[id];
        seen = seen || new Set(); if (seen.has(id)) return 0; seen.add(id);
        const c = Graph.get(id); if (!c) return 0;
        const pre = (c.prereqs || []).filter(p => inUnit.has(p));
        const d = pre.length ? 1 + Math.max.apply(null, pre.map(p => depth(p, seen))) : 0;
        return (depthCache[id] = d);
      }
      const cols = {};
      concepts.forEach(c => { const d = depth(c.id); (cols[d] = cols[d] || []).push(c); });
      const colKeys = Object.keys(cols).map(Number).sort((a, b) => a - b);

      layout = {}; nodesEl.innerHTML = '';
      let maxRows = 0;
      colKeys.forEach((d, ci) => {
        const x = PAD + ci * COL_W;
        cols[d].forEach((c, ri) => {
          const y = PAD + TOPGAP + ri * (NODE_H + GAP_Y);
          layout[c.id] = { x: x + NODE_W / 2, y: y + NODE_H / 2, left: x, top: y };
          nodesEl.appendChild(nodeEl(c, x, y));
        });
        maxRows = Math.max(maxRows, cols[d].length);
      });

      const w = PAD * 2 + colKeys.length * COL_W;
      const h = PAD * 2 + TOPGAP + maxRows * (NODE_H + GAP_Y);
      inner.style.width = w + 'px'; inner.style.height = h + 'px';
      edgesSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      edgesSvg.setAttribute('width', w); edgesSvg.setAttribute('height', h);
      drawEdges(inUnit);
      inner.style.margin = (w <= scrollEl.clientWidth && h <= scrollEl.clientHeight) ? 'auto' : '0 auto';
    }

    function nodeEl(c, x, y) {
      const st = Graph.status(c.id);
      const rec = Store.concept(c.id);
      const stars = rec ? rec.stars : 0;
      const n = U.el('button', 'm-node st-' + st + ' strand-' + slug(c.strand));
      n.dataset.cid = c.id;
      n.style.left = x + 'px'; n.style.top = y + 'px';
      n.style.width = NODE_W + 'px'; n.style.height = NODE_H + 'px';
      const lock = st === 'locked' ? '<span class="m-node-lock">🔒</span>' : '';
      const starRow = (st === 'mastered' || st === 'review')
        ? `<span class="m-node-stars">${U.range(3).map(i => `<span class="${i < stars ? 'on' : ''}">★</span>`).join('')}</span>` : '';
      const badge = st === 'mastered' ? '✓' : st === 'review' ? '↻' : st === 'available' ? '▶' : st === 'ready-soon' ? '…' : '';
      n.innerHTML = `<span class="m-node-top"><span class="m-node-name">${c.name}</span>${lock}</span>
        <span class="m-node-bot"><span class="m-node-blurb">${c.blurb || ''}</span></span>
        ${starRow}<span class="m-node-badge">${badge}</span>`;
      n.title = c.blurb || c.name;
      if (st === 'locked') {
        const missing = (c.prereqs || []).filter(p => !Store.isMastered(p)).map(p => (Graph.get(p) || {}).name).filter(Boolean);
        n.onclick = () => opts.onLocked && opts.onLocked(c, missing);
        n.setAttribute('aria-disabled', 'true');
      } else if (st === 'ready-soon') {
        n.onclick = () => opts.onSoon && opts.onSoon(c);
      } else {
        n.onclick = () => opts.onOpen && opts.onOpen(c.id);
      }
      return n;
    }

    function drawEdges(inUnit) {
      const parts = [];
      Graph.all().forEach(c => {
        const to = layout[c.id]; if (!to) return;
        (c.prereqs || []).forEach(p => {
          if (!inUnit.has(p)) return;
          const from = layout[p]; if (!from) return;
          const met = Store.isMastered(p);
          const x1 = from.x + NODE_W / 2, y1 = from.y, x2 = to.x - NODE_W / 2, y2 = to.y;
          const mx = (x1 + x2) / 2;
          parts.push(`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" class="m-edge ${met ? 'met' : ''}"/>`);
        });
      });
      edgesSvg.innerHTML = parts.join('');
    }

    function renderOverview() {
      overviewEl.innerHTML = units().map(u => {
        const cs = Graph.all().filter(c => c.unit === u);
        const total = cs.length;
        const mastered = cs.filter(c => Store.isMastered(c.id)).length;
        const available = cs.some(c => Graph.status(c.id) === 'available');
        const pct = total ? Math.round(mastered / total * 100) : 0;
        const state = mastered === total ? 'done' : available || mastered ? 'now' : 'locked';
        const badge = state === 'done' ? '<span class="badge badge-good">Complete</span>'
          : state === 'now' ? '<span class="badge badge-accent">In progress</span>'
            : '<span class="badge">Locked</span>';
        const dots = cs.map(c => `<i class="${Store.isMastered(c.id) ? 'on' : Graph.status(c.id) === 'available' ? 'cur' : ''}"></i>`).join('');
        return `<button class="m-ucard" data-unit="${u}">
          <div class="m-ucard-top"><h3>${unitTitle(u)}</h3>${badge}</div>
          <div class="m-ucard-meta">Unit ${u} · ${total} concepts</div>
          <div class="m-ucard-mini">${dots}</div>
          <div class="m-ucard-foot"><span class="progress" style="flex:1"><span style="width:${pct}%"></span></span><b>${pct}%</b></div>
        </button>`;
      }).join('');
      overviewEl.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => { focus = +b.dataset.unit; setMode('focus'); });
    }

    function slug(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, ''); }
    function focusUnit(u) { if (units().includes(u)) { focus = u; mode = 'focus'; render(); } }
    function setMode(m) { mode = m; render(); }

    const off = Store.onChange(() => render());
    render();
    return {
      render, focusUnit, unit: () => focus, mode: () => mode, setMode,
      units, unitTitle, destroy() { off(); }
    };
  }

  BIO.Map = { mount };
})();
