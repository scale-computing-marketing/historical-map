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

  /* ---------------- diagram ---------------- */
  function renderDiagram() {
    const canvas = Atlas.el('canvas');
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
    return `<p class="lead">${topic.intro || ''}</p>
      <h3>Parts by role</h3><div class="chips">${legend}</div>
      <p class="note">Click any labelled part on the diagram — or open the Parts tab — to see what it does.</p>`;
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
    return `<div class="chips"><span class="cat-tag ${p.category}">${catName(p.category)}</span></div>
      <p class="lead">${p.summary}</p>
      ${p.analogy ? `<p class="analogy">${p.analogy}</p>` : ''}
      ${fns ? `<h3>What it does</h3><ul>${fns}</ul>` : ''}
      ${facts ? `<h3>Key facts</h3><dl class="kv">${facts}</dl>` : ''}
      ${related ? `<h3>Related parts</h3><div class="chips">${related}</div>` : ''}
      <button class="chip" data-back>← All parts</button>`;
  }

  /* ---------------- legend ---------------- */
  function renderLegend() {
    const rows = Object.entries(topic.categories || {}).map(([k, label]) =>
      `<div class="row"><span class="sw" style="background:var(--bio-${k})"></span>${label}</div>`).join('');
    Atlas.el('legend').innerHTML = `<div class="ttl">${topic.name}</div>${rows}`;
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
    setBrand(); buildTopicMenu(); renderDiagram(); renderLegend(); render();
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
    Atlas.el('canvas').addEventListener('click', () => { if (!quiz.isAwaitingClick()) clearSelection(); });

    setBrand(); buildTopicMenu(); renderDiagram(); renderLegend(); render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
