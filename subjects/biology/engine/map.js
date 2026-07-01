/* Life Explorer — Biology · learning map.
   Renders the knowledge graph as a layered map you scrub through: one column per
   unit, concept nodes placed within, and prerequisite edges drawn behind them.
   Node state (locked / available / mastered / review) comes from BIO.Graph, so
   the map is a pure view over the graph + progress store. Completing a lesson
   re-derives status, so nodes light up and unlock in place.

   Exposes window.BIO.Map: mount(host, { onOpen, onLocked, onSoon }).            */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });
  const U = BIO.util, Graph = BIO.Graph, Store = BIO.Store;

  const COL_W = 220, NODE_H = 76, GAP_Y = 20, PAD = 40, HEAD_H = 56;

  function mount(host, opts) {
    opts = opts || {};
    host.innerHTML = `<div class="m-map-scroll"><div class="m-map-inner" id="m-map-inner">
      <svg class="m-map-edges" id="m-map-edges"></svg>
      <div class="m-map-heads" id="m-map-heads"></div>
      <div class="m-map-nodes" id="m-map-nodes"></div>
    </div></div>`;
    const inner = host.querySelector('#m-map-inner');
    const edgesSvg = host.querySelector('#m-map-edges');
    const headsEl = host.querySelector('#m-map-heads');
    const nodesEl = host.querySelector('#m-map-nodes');

    let layout = {};   // conceptId -> {x,y}

    function render() {
      const units = Graph.UNIT_ORDER.filter(u => Graph.all().some(c => c.unit === u));
      layout = {};
      headsEl.innerHTML = ''; nodesEl.innerHTML = '';
      let maxRows = 0;

      units.forEach((u, gi) => {
        const concepts = Graph.all().filter(c => c.unit === u);
        // order within a column by strand then declaration order (stable)
        concepts.sort((a, b) => (a.strand || '').localeCompare(b.strand || ''));
        const x = PAD + gi * COL_W;
        // column header
        const head = U.el('div', 'm-col-head');
        head.style.left = x + 'px';
        head.innerHTML = `<span class="m-col-g">Unit ${u}</span><span class="m-col-name">${Graph.unitName(u)}</span>`;
        headsEl.appendChild(head);
        concepts.forEach((c, ci) => {
          const y = PAD + HEAD_H + ci * (NODE_H + GAP_Y);
          layout[c.id] = { x: x + COL_W / 2, y: y + NODE_H / 2, left: x, top: y };
          nodesEl.appendChild(nodeEl(c, x, y));
        });
        maxRows = Math.max(maxRows, concepts.length);
      });

      const w = PAD * 2 + units.length * COL_W;
      const h = PAD * 2 + HEAD_H + maxRows * (NODE_H + GAP_Y);
      inner.style.width = w + 'px'; inner.style.height = h + 'px';
      edgesSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      edgesSvg.setAttribute('width', w); edgesSvg.setAttribute('height', h);
      drawEdges();
    }

    function nodeEl(c, x, y) {
      const st = Graph.status(c.id);
      const rec = Store.concept(c.id);
      const stars = rec ? rec.stars : 0;
      const n = U.el('button', 'm-node st-' + st + ' strand-' + slug(c.strand));
      n.style.left = x + 'px'; n.style.top = y + 'px';
      n.style.width = (COL_W - 34) + 'px'; n.style.height = NODE_H + 'px';
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

    function drawEdges() {
      const parts = [];
      Graph.all().forEach(c => {
        const to = layout[c.id]; if (!to) return;
        (c.prereqs || []).forEach(p => {
          const from = layout[p]; if (!from) return;
          const met = Store.isMastered(p);
          const x1 = from.x + (COL_W - 34) / 2, y1 = from.y, x2 = to.x - (COL_W - 34) / 2, y2 = to.y;
          const mx = (x1 + x2) / 2;
          parts.push(`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" class="m-edge ${met ? 'met' : ''}"/>`);
        });
      });
      edgesSvg.innerHTML = parts.join('');
    }

    function slug(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, ''); }

    // re-render whenever progress changes (unlocks light up live)
    const off = Store.onChange(render);
    render();
    return { render, destroy() { off(); } };
  }

  BIO.Map = { mount };
})();
