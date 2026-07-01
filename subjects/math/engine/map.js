/* Learning Atlas — Mathematics · learning map (focused-unit model).
   Instead of one endless horizontal plane, the map shows ONE grade at a time as
   a compact dependency graph that fits the screen (focus mode), plus a zoomed-out
   grid of every grade as progress cards (overview mode). The sidebar drives which
   grade is in focus; this stays a pure view over MATH.Graph + the progress store.

   Exposes window.MATH.Map: mount(host, opts) -> {
     render, focusGrade(g), grade(), mode(), setMode('focus'|'overview'),
     grades(), destroy
   }.  opts: onOpen(id), onLocked(c,missing), onSoon(c), onFocusChange(grade,mode) */
(function () {
  const MATH = (window.MATH = window.MATH || {});
  const U = MATH.util, Graph = MATH.Graph, Store = MATH.Store;

  const COL_W = 208, NODE_W = 176, NODE_H = 74, GAP_Y = 22, PAD = 40, TOPGAP = 20;

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
    let focus = null;              // current grade
    let layout = {};

    function grades() { return Graph.GRADES.filter(g => Graph.all().some(c => c.grade === g)); }
    function gradeLabel(g) { return g.length <= 2 ? 'Grade ' + g : g; }
    function defaultGrade() {
      const rec = Graph.recommended();
      if (rec) return rec.grade;
      const gs = grades();
      return gs.find(g => Graph.all().some(c => c.grade === g && Graph.status(c.id) === 'available')) || gs[0];
    }

    function render() {
      if (!focus || !grades().includes(focus)) focus = defaultGrade();
      host.classList.toggle('is-overview', mode === 'overview');
      if (mode === 'overview') renderOverview(); else renderFocus();
      if (opts.onFocusChange) opts.onFocusChange(focus, mode);
    }

    /* ---- focus: one grade as a layered dependency graph -------------------- */
    function renderFocus() {
      const concepts = Graph.all().filter(c => c.grade === focus);
      concepts.sort((a, b) => (a.strand || '').localeCompare(b.strand || ''));
      const inGrade = new Set(concepts.map(c => c.id));

      // depth = longest prerequisite chain *within this grade* → column index
      const depthCache = {};
      function depth(id, seen) {
        if (depthCache[id] != null) return depthCache[id];
        seen = seen || new Set(); if (seen.has(id)) return 0; seen.add(id);
        const c = Graph.get(id); if (!c) return 0;
        const pre = (c.prereqs || []).filter(p => inGrade.has(p));
        const d = pre.length ? 1 + Math.max.apply(null, pre.map(p => depth(p, seen))) : 0;
        return (depthCache[id] = d);
      }
      const cols = {};
      concepts.forEach(c => { const d = depth(c.id); (cols[d] = cols[d] || []).push(c); });
      const colKeys = Object.keys(cols).map(Number).sort((a, b) => a - b);

      layout = {}; nodesEl.innerHTML = '';
      let maxRows = 0;
      colKeys.forEach((d, ci) => {
        const list = cols[d];
        const x = PAD + ci * COL_W;
        list.forEach((c, ri) => {
          const y = PAD + TOPGAP + ri * (NODE_H + GAP_Y);
          layout[c.id] = { x: x + NODE_W / 2, y: y + NODE_H / 2, left: x, top: y };
          nodesEl.appendChild(nodeEl(c, x, y));
        });
        maxRows = Math.max(maxRows, list.length);
      });

      const w = PAD * 2 + colKeys.length * COL_W;
      const h = PAD * 2 + TOPGAP + maxRows * (NODE_H + GAP_Y);
      inner.style.width = w + 'px'; inner.style.height = h + 'px';
      edgesSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      edgesSvg.setAttribute('width', w); edgesSvg.setAttribute('height', h);
      drawEdges(inGrade);
      // centre when it fits; otherwise let it scroll from the start
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

    function drawEdges(inGrade) {
      const parts = [];
      Graph.all().forEach(c => {
        const to = layout[c.id]; if (!to) return;
        (c.prereqs || []).forEach(p => {
          if (!inGrade.has(p)) return;              // only within-grade edges in focus mode
          const from = layout[p]; if (!from) return;
          const met = Store.isMastered(p);
          const x1 = from.x + NODE_W / 2, y1 = from.y, x2 = to.x - NODE_W / 2, y2 = to.y;
          const mx = (x1 + x2) / 2;
          parts.push(`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" class="m-edge ${met ? 'met' : ''}"/>`);
        });
      });
      edgesSvg.innerHTML = parts.join('');
    }

    /* ---- overview: every grade as a progress card ------------------------- */
    function renderOverview() {
      overviewEl.innerHTML = grades().map(g => {
        const cs = Graph.all().filter(c => c.grade === g);
        const total = cs.length;
        const mastered = cs.filter(c => Store.isMastered(c.id)).length;
        const available = cs.some(c => Graph.status(c.id) === 'available');
        const pct = total ? Math.round(mastered / total * 100) : 0;
        const strands = Array.from(new Set(cs.map(c => c.strand))).slice(0, 3).join(' · ');
        const state = mastered === total ? 'done' : available || mastered ? 'now' : 'locked';
        const badge = state === 'done' ? '<span class="badge badge-good">Complete</span>'
          : state === 'now' ? '<span class="badge badge-accent">In progress</span>'
            : '<span class="badge">Locked</span>';
        const dots = cs.map(c => {
          const s = Graph.status(c.id);
          return `<i class="${Store.isMastered(c.id) ? 'on' : s === 'available' ? 'cur' : ''}"></i>`;
        }).join('');
        return `<button class="m-ucard" data-grade="${g}">
          <div class="m-ucard-top"><h3>${gradeLabel(g)}</h3>${badge}</div>
          <div class="m-ucard-meta">${total} concepts${strands ? ' · ' + strands : ''}</div>
          <div class="m-ucard-mini">${dots}</div>
          <div class="m-ucard-foot"><span class="progress" style="flex:1"><span style="width:${pct}%"></span></span><b>${pct}%</b></div>
        </button>`;
      }).join('');
      overviewEl.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { focus = b.dataset.grade; setMode('focus'); });
    }

    function slug(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, ''); }

    function focusGrade(g) { if (grades().includes(g)) { focus = g; mode = 'focus'; render(); } }
    function setMode(m) { mode = m; render(); }

    const off = Store.onChange(() => render());
    render();
    return {
      render, focusGrade, grade: () => focus, mode: () => mode, setMode,
      grades, destroy() { off(); }
    };
  }

  MATH.Map = { mount };
})();
