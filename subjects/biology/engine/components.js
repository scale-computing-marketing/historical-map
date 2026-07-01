/* Life Explorer — Biology · reusable interactive simulations.
   Lessons don't build interactions from scratch; they name a simulation and pass
   a small config. Each is a thing a learner *does* — sort, order, match, drag a
   slider and watch life respond — never a wall of text. One contract:

     BIO.Components.register(name, { title, mount(host, config, ctx) })

   ctx (provided by the lesson player):
     ctx.attempt(ok)        record one try (drives accuracy + mastery)
     ctx.solved()           the activity's goal is complete → learner may advance
     ctx.feedback(msg, kind) show a short line ('ok' | 'no' | '')
     ctx.progress(done,tot) optional round/goal counter
     ctx.difficulty         'easy' | 'medium' | 'challenge'
     ctx.count(name)        tally a favourite-simulation interaction

   mount() may return { destroy() } for cleanup. Exposes window.BIO.Components.  */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });

  /* ---------- tiny helpers ---------- */
  const U = BIO.util = {
    el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    range(n) { return Array.from({ length: n }, (_, i) => i); },
    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  };

  const REG = {};
  BIO.Components = {
    register(name, def) { REG[name] = def; },
    get(name) { return REG[name]; },
    has(name) { return !!REG[name]; },
    list() { return Object.keys(REG); }
  };
  const R = BIO.Components.register.bind(BIO.Components);

  /* A shared "check answer" field used by several simulations. */
  function answerField(host, { label, onCheck, placeholder, type }) {
    const wrap = U.el('div', 'm-answer');
    wrap.innerHTML = `<label class="m-answer-lab">${label || 'Answer:'}</label>
      <input class="m-input" type="${type || 'text'}" inputmode="${type === 'number' ? 'numeric' : 'text'}" placeholder="${placeholder || '?'}" aria-label="${label || 'Answer'}">
      <button class="m-btn m-check">Check</button>`;
    host.appendChild(wrap);
    const input = wrap.querySelector('input'), btn = wrap.querySelector('.m-check');
    const fire = () => onCheck(input.value.trim(), input);
    btn.onclick = fire;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') fire(); });
    return { input, btn, focus: () => input.focus() };
  }

  /* ============================================================= PROBLEM SET ===
     The workhorse for practice/challenge/mastery: numeric-entry or
     multiple-choice questions. config: { problems:[{prompt,answer,choices?,hint}],
     generate?(difficulty) }                                                     */
  R('problemSet', { title: 'Questions', mount(host, cfg, ctx) {
    let problems = (cfg.problems || []).slice();
    if (cfg.generate) problems = cfg.generate(ctx.difficulty);
    if (!problems.length) { ctx.solved(); return; }
    let i = 0;
    const info = U.el('p', 'm-prompt'); host.appendChild(info);
    const stage = U.el('div', 'm-ps-stage'); host.appendChild(stage);
    function render() {
      const p = problems[i]; ctx.progress(i, problems.length);
      info.innerHTML = p.prompt;
      stage.innerHTML = '';
      if (p.choices) {
        const opts = U.el('div', 'm-ps-opts');
        U.shuffle(p.choices).forEach(c => { const b = U.el('button', 'm-btn m-ps-opt', String(c)); b.onclick = () => judge(String(c) === String(p.answer), b); opts.appendChild(b); });
        stage.appendChild(opts);
      } else {
        answerField(stage, { label: 'Answer:', onCheck(v) { judge(String(v).toLowerCase().replace(/\s/g, '') === String(p.answer).toLowerCase().replace(/\s/g, '')); } });
      }
    }
    function judge(ok, btn) {
      ctx.attempt(ok); ctx.count('problemSet');
      if (btn) stage.querySelectorAll('.m-ps-opt').forEach(b => b.classList.toggle('picked', b === btn));
      const p = problems[i];
      ctx.feedback(ok ? U.pick(['Correct!', 'Nice work!', 'Exactly!', 'You got it!']) : (p.hint || 'Not quite — give it another go.'), ok ? 'ok' : 'no');
      if (ok) { i++; if (i >= problems.length) { ctx.progress(problems.length, problems.length); setTimeout(ctx.solved, 500); } else setTimeout(render, 700); }
    }
    render();
  } });

  /* ================================================================ SORT CARDS ===
     Drop labelled cards into the bin they belong in. Great for living vs
     non-living, prokaryote vs eukaryote, plant vs animal.
     config: { prompt, bins:[{id,label}], items:[{label, bin, emoji}] }          */
  R('sortCards', { title: 'Sort into groups', mount(host, cfg, ctx) {
    const bins = cfg.bins || [];
    let items = U.shuffle(cfg.items || []);
    const total = items.length;
    let sel = null, placed = 0;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Tap a card, then tap the group it belongs in.'); host.appendChild(info);
    const tray = U.el('div', 'm-sc-tray'); host.appendChild(tray);
    const binRow = U.el('div', 'm-sc-bins'); host.appendChild(binRow);

    function drawTray() {
      tray.innerHTML = '';
      items.forEach((it, k) => {
        const c = U.el('button', 'm-sc-card' + (sel === k ? ' sel' : ''), `${it.emoji ? `<span class="m-sc-emoji">${it.emoji}</span>` : ''}${it.label}`);
        c.onclick = () => { sel = (sel === k ? null : k); drawTray(); };
        tray.appendChild(c);
      });
      if (!items.length) tray.innerHTML = '<span class="m-sc-empty">All sorted! 🎉</span>';
    }
    binRow.innerHTML = bins.map(b => `<div class="m-sc-bin" data-bin="${b.id}"><div class="m-sc-bin-h">${b.label}</div><div class="m-sc-bin-body" data-bin="${b.id}"></div></div>`).join('');
    binRow.querySelectorAll('.m-sc-bin').forEach(binEl => {
      binEl.onclick = () => {
        if (sel == null) { ctx.feedback('Pick a card first, then tap a group.', ''); return; }
        const it = items[sel], target = binEl.dataset.bin, ok = it.bin === target;
        ctx.attempt(ok); ctx.count('sortCards');
        if (ok) {
          binEl.querySelector('.m-sc-bin-body').appendChild(U.el('span', 'm-sc-chip ok', `${it.emoji || ''} ${it.label}`));
          items.splice(sel, 1); sel = null; placed++;
          ctx.progress(placed, total);
          ctx.feedback(U.pick(['Right!', 'Yes!', 'Correct!']), 'ok');
          drawTray();
          if (!items.length) setTimeout(ctx.solved, 500);
        } else {
          ctx.feedback(`Not ${bins.find(b => b.id === target).label.toLowerCase()} — look again.`, 'no');
          binEl.classList.add('shake'); setTimeout(() => binEl.classList.remove('shake'), 400);
        }
      };
    });
    ctx.progress(0, total); drawTray();
  } });

  /* ================================================================ ORDER LIST ===
     Put steps/levels in the correct order by tapping them in sequence.
     config: { prompt, items:[label...] in CORRECT order, arrow }               */
  R('orderList', { title: 'Put in order', mount(host, cfg, ctx) {
    const correct = cfg.items || [];
    const arrow = cfg.arrow || '↓';
    let pool = U.shuffle(correct.map((label, i) => ({ label, i })));
    let next = 0;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Tap the items in the correct order.'); host.appendChild(info);
    const chain = U.el('div', 'm-ol-chain'); host.appendChild(chain);
    const poolEl = U.el('div', 'm-ol-pool'); host.appendChild(poolEl);
    function drawChain() {
      chain.innerHTML = correct.slice(0, next).map((l, k) => `<span class="m-ol-slot filled">${l}</span>`).join(`<span class="m-ol-arrow">${arrow}</span>`);
    }
    function drawPool() {
      poolEl.innerHTML = '';
      pool.forEach((it, k) => {
        const b = U.el('button', 'm-ol-item', it.label);
        b.onclick = () => {
          const ok = it.i === next;
          ctx.attempt(ok); ctx.count('orderList');
          if (ok) {
            pool.splice(k, 1); next++; ctx.progress(next, correct.length);
            ctx.feedback(U.pick(['Yes!', 'Right order!', 'Correct!']), 'ok');
            drawChain(); drawPool();
            if (next >= correct.length) setTimeout(ctx.solved, 500);
          } else {
            ctx.feedback(`Not next — what comes ${next === 0 ? 'first' : 'after that'}?`, 'no');
            b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          }
        };
        poolEl.appendChild(b);
      });
      if (!pool.length) poolEl.innerHTML = '<span class="m-sc-empty">Sequence complete! ✅</span>';
    }
    ctx.progress(0, correct.length); drawChain(); drawPool();
  } });

  /* =============================================================== MATCH PAIRS ===
     Match a term to its function/description. Tap a term, then tap its match.
     config: { prompt, pairs:[{left, right}] }                                   */
  R('matchPairs', { title: 'Match them up', mount(host, cfg, ctx) {
    const pairs = cfg.pairs || [];
    const lefts = pairs.map((p, i) => ({ text: p.left, i }));
    let rights = U.shuffle(pairs.map((p, i) => ({ text: p.right, i })));
    let selL = null, done = 0;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Tap a term, then tap its match.'); host.appendChild(info);
    const grid = U.el('div', 'm-mp-grid'); host.appendChild(grid);
    const colL = U.el('div', 'm-mp-col'); const colR = U.el('div', 'm-mp-col');
    grid.append(colL, colR);
    function draw() {
      colL.innerHTML = ''; colR.innerHTML = '';
      lefts.forEach(l => {
        const b = U.el('button', 'm-mp-cell left' + (l.done ? ' done' : selL === l.i ? ' sel' : ''), l.text);
        if (!l.done) b.onclick = () => { selL = (selL === l.i ? null : l.i); draw(); };
        colL.appendChild(b);
      });
      rights.forEach(r => {
        const b = U.el('button', 'm-mp-cell right' + (r.done ? ' done' : ''), r.text);
        if (!r.done) b.onclick = () => {
          if (selL == null) { ctx.feedback('Pick a term on the left first.', ''); return; }
          const ok = r.i === selL;
          ctx.attempt(ok); ctx.count('matchPairs');
          if (ok) {
            lefts.find(l => l.i === selL).done = true; r.done = true; selL = null; done++;
            ctx.progress(done, pairs.length); ctx.feedback(U.pick(['Match!', 'Correct!', 'Yes!']), 'ok');
            draw(); if (done >= pairs.length) setTimeout(ctx.solved, 500);
          } else { ctx.feedback('Not a match — try another.', 'no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
        };
        colR.appendChild(b);
      });
    }
    ctx.progress(0, pairs.length); draw();
  } });

  /* =========================================================== DIAGRAM EXPLORE ===
     Reuse an existing Life-Explorer topic (cell, body, tree, plant-cell model) as
     the hands-on Explore step: click parts to reveal what they do; the goal is to
     explore a number of them. config: { topic, need, prompt }                   */
  R('diagramExplore', { title: 'Explore the diagram', mount(host, cfg, ctx) {
    const topic = BIO.topics[cfg.topic];
    if (!topic || !BIO.Explorer) { host.innerHTML = `<p class="note">Diagram “${cfg.topic}” unavailable.</p>`; ctx.solved(); return; }
    const need = Math.min(cfg.need || 4, (topic.parts || []).length);
    const seen = new Set();
    const info = U.el('p', 'm-prompt', cfg.prompt || `Click parts of the diagram to discover what they do. Explore at least ${need}.`); host.appendChild(info);
    const stageWrap = U.el('div', 'm-de-stage'); host.appendChild(stageWrap);
    const canvas = U.el('div', 'm-de-canvas'); stageWrap.appendChild(canvas);
    const infoBox = U.el('div', 'm-de-info', '<span class="m-de-hint">Tap a labelled part…</span>'); stageWrap.appendChild(infoBox);
    const partById = id => (topic.parts || []).find(p => p.id === id);
    BIO.Explorer.renderTopic(canvas, topic, { interactive: true, onSelect(id) {
      const p = partById(id); if (!p) return;
      const fresh = !seen.has(id); if (fresh) { seen.add(id); ctx.attempt(true); ctx.count('diagramExplore'); }
      infoBox.innerHTML = `<h4>${p.name}</h4><p>${p.summary}</p>${p.analogy ? `<p class="m-de-analogy">${p.analogy}</p>` : ''}`;
      ctx.progress(Math.min(seen.size, need), need);
      if (fresh && seen.size >= need) { ctx.feedback(`Explored ${seen.size} parts — nice investigating!`, 'ok'); ctx.solved(); }
      else if (fresh) ctx.feedback(`Discovered ${p.name} (${seen.size}/${need})`, '');
    } });
    ctx.progress(0, need);
  } });

  /* ================================================================ LABEL HUNT ===
     "Click the mitochondria." Find-the-part rounds over an existing diagram.
     config: { topic, targets:[partId...], prompt }                             */
  R('labelHunt', { title: 'Find the part', mount(host, cfg, ctx) {
    const topic = BIO.topics[cfg.topic];
    if (!topic || !BIO.Explorer) { host.innerHTML = `<p class="note">Diagram “${cfg.topic}” unavailable.</p>`; ctx.solved(); return; }
    const partById = id => (topic.parts || []).find(p => p.id === id);
    const targets = U.shuffle((cfg.targets || []).filter(id => partById(id)));
    let round = 0;
    const info = U.el('p', 'm-prompt'); host.appendChild(info);
    const canvas = U.el('div', 'm-de-canvas'); host.appendChild(canvas);
    function ask() {
      const p = partById(targets[round]);
      info.innerHTML = cfg.promptFor ? cfg.promptFor(p) : `Click the <b>${p.name}</b>.`;
      ctx.progress(round, targets.length);
    }
    BIO.Explorer.renderTopic(canvas, topic, { interactive: true, onSelect(id) {
      const want = targets[round], ok = id === want;
      ctx.attempt(ok); ctx.count('labelHunt');
      const p = partById(want);
      if (ok) { ctx.feedback(`Yes — that's the ${p.name}.`, 'ok'); round++; if (round >= targets.length) setTimeout(ctx.solved, 500); else setTimeout(ask, 700); }
      else { const g = partById(id); ctx.feedback(`That's the ${g ? g.name : 'wrong part'} — find the ${p.name}.`, 'no'); }
    } });
    ask();
  } });

  /* ================================================================= SIM SLIDER ===
     The heart of "change a variable, observe life respond". Sliders drive live
     outputs and a bar visualisation; a goal must be reached to finish.
     config: {
       prompt,
       vars:    [{ id, label, min, max, step, value, unit }],
       outputs: [{ id, label, unit, fn(v) }],       // v = { varId: number }
       viz?:    (v, out) => html,                    // optional custom visual
       goal:    { text, test(v, out) => bool },      // solved when test passes
       hold?:   1                                     // # of times goal must hold
     }                                                                            */
  R('simSlider', { title: 'Run the simulation', mount(host, cfg, ctx) {
    const vars = cfg.vars || [];
    const outputs = cfg.outputs || [];
    const v = {}; vars.forEach(x => v[x.id] = (x.value != null ? x.value : x.min));
    let met = false;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Adjust the controls and watch what happens.'); host.appendChild(info);
    const wrap = U.el('div', 'm-sim'); host.appendChild(wrap);
    const controls = U.el('div', 'm-sim-controls'); wrap.appendChild(controls);
    const readout = U.el('div', 'm-sim-readout'); wrap.appendChild(readout);
    const vizBox = U.el('div', 'm-sim-viz'); wrap.appendChild(vizBox);
    const goalBox = cfg.goal ? U.el('div', 'm-sim-goal', `🎯 ${cfg.goal.text}`) : null;
    if (goalBox) wrap.appendChild(goalBox);

    controls.innerHTML = vars.map(x =>
      `<div class="m-sim-row"><label>${x.label}</label>
        <input type="range" class="m-sim-range" data-v="${x.id}" min="${x.min}" max="${x.max}" step="${x.step || 1}" value="${v[x.id]}">
        <output class="m-sim-out" data-o="${x.id}">${v[x.id]}${x.unit || ''}</output></div>`).join('');

    function outs() { const o = {}; outputs.forEach(op => o[op.id] = op.fn(v)); return o; }
    function fmt(n) { return Math.round(n * 10) / 10; }
    function update() {
      const o = outs();
      vars.forEach(x => { const el = controls.querySelector(`[data-o="${x.id}"]`); if (el) el.textContent = `${v[x.id]}${x.unit || ''}`; });
      readout.innerHTML = outputs.map(op => {
        const val = o[op.id], max = op.max || 100, pct = U.clamp((val / max) * 100, 0, 100);
        return `<div class="m-sim-meter"><div class="m-sim-meter-h"><span>${op.label}</span><b>${fmt(val)}${op.unit || ''}</b></div>
          <div class="m-sim-bar"><span style="width:${pct}%;background:${op.color || 'var(--m-accent)'}"></span></div></div>`;
      }).join('');
      if (cfg.viz) vizBox.innerHTML = cfg.viz(v, o); else vizBox.style.display = 'none';
      ctx.count('simSlider');
      if (cfg.goal && !met && cfg.goal.test(v, o)) {
        met = true;
        if (goalBox) { goalBox.classList.add('done'); goalBox.innerHTML = `✅ ${cfg.goal.done || 'Goal reached!'}`; }
        ctx.attempt(true); ctx.feedback('You found the conditions — great experiment!', 'ok'); setTimeout(ctx.solved, 400);
      }
    }
    controls.querySelectorAll('.m-sim-range').forEach(r => r.addEventListener('input', () => { v[r.dataset.v] = +r.value; update(); }));
    if (!cfg.goal) { ctx.feedback('Explore freely, then continue when ready.', ''); ctx.solved(); }
    update();
  } });

  /* ============================================================= BUILD SEQUENCE ===
     Base-pair a DNA strand. Given a template, choose the complementary base for
     each rung (A–T, C–G). config: { template:['A','T','G',...], prompt }        */
  R('buildSequence', { title: 'Build the DNA', mount(host, cfg, ctx) {
    const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
    const COLOR = { A: 'a', T: 't', G: 'g', C: 'c' };
    const template = (cfg.template || ['A', 'T', 'G', 'C', 'A', 'T']).map(b => b.toUpperCase());
    const built = template.map(() => null);
    let pos = 0;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Build the matching strand. Remember: A pairs with T, C pairs with G.'); host.appendChild(info);
    const ladder = U.el('div', 'm-dna'); host.appendChild(ladder);
    const palette = U.el('div', 'm-dna-palette'); host.appendChild(palette);
    palette.innerHTML = ['A', 'T', 'G', 'C'].map(b => `<button class="m-dna-base base-${COLOR[b]}" data-b="${b}">${b}</button>`).join('');
    function draw() {
      ladder.innerHTML = template.map((t, i) =>
        `<div class="m-dna-rung${i === pos ? ' active' : ''}">
          <span class="m-dna-cell base-${COLOR[t]}">${t}</span>
          <span class="m-dna-link"></span>
          <span class="m-dna-cell ${built[i] ? 'base-' + COLOR[built[i]] : 'empty'}">${built[i] || '?'}</span>
        </div>`).join('');
    }
    palette.querySelectorAll('.m-dna-base').forEach(b => b.onclick = () => {
      if (pos >= template.length) return;
      const chosen = b.dataset.b, want = COMP[template[pos]], ok = chosen === want;
      ctx.attempt(ok); ctx.count('buildSequence');
      if (ok) {
        built[pos] = chosen; pos++; ctx.progress(pos, template.length);
        ctx.feedback(`${template[pos - 1]} pairs with ${chosen} ✓`, 'ok'); draw();
        if (pos >= template.length) setTimeout(ctx.solved, 500);
      } else { ctx.feedback(`${template[pos]} doesn't pair with ${chosen}. Try again.`, 'no'); }
    });
    ctx.progress(0, template.length); draw();
  } });

  /* ============================================================== PUNNETT CROSS ===
     A live Punnett square for a monohybrid cross, then a question about the odds.
     config: { dom, rec, domName, recName, rounds }                             */
  R('punnettCross', { title: 'Punnett square', mount(host, cfg, ctx) {
    const D = cfg.dom || 'B', r = cfg.rec || 'b';
    const domName = cfg.domName || 'brown', recName = cfg.recName || 'blue';
    const rounds = cfg.rounds || 3;
    const GENOS = [D + D, D + r, r + r];
    let round = 0;
    const info = U.el('p', 'm-prompt'); host.appendChild(info);
    const stage = U.el('div', 'm-pn-stage'); host.appendChild(stage);
    function pheno(g) { return g.includes(D) ? domName : recName; }
    function cells(p1, p2) { const a = p1.split(''), b = p2.split(''), c = []; for (const x of a) for (const y of b) c.push([x, y].sort().join('')); return c; }
    function newRound() {
      const p1 = U.pick(GENOS), p2 = U.pick(GENOS), c = cells(p1, p2);
      const recCount = c.filter(g => pheno(g) === recName).length;
      const domCount = 4 - recCount;
      const askRec = U.pick([true, false]);
      const want = askRec ? recCount : domCount;
      const wantName = askRec ? recName : domName;
      const a = p1.split(''), b = p2.split('');
      info.innerHTML = `Cross <b>${p1} × ${p2}</b>. How many of the 4 offspring are expected to be <b>${wantName}</b>?`;
      stage.innerHTML = `
        <table class="m-pn-square">
          <tr><th class="corner"></th><th>${b[0]}</th><th>${b[1]}</th></tr>
          <tr><th>${a[0]}</th><td class="ph-${pheno(c[0])}">${c[0]}</td><td class="ph-${pheno(c[1])}">${c[1]}</td></tr>
          <tr><th>${a[1]}</th><td class="ph-${pheno(c[2])}">${c[2]}</td><td class="ph-${pheno(c[3])}">${c[3]}</td></tr>
        </table>
        <div class="m-pn-opts">${[0, 1, 2, 3, 4].map(n => `<button class="m-btn m-ps-opt" data-n="${n}">${n}</button>`).join('')}</div>
        <p class="note">${D} = ${domName} (dominant) · ${r} = ${recName} (recessive). The square is filled in — count the squares.</p>`;
      stage.querySelectorAll('[data-n]').forEach(btn => btn.onclick = () => {
        const ok = +btn.dataset.n === want; ctx.attempt(ok); ctx.count('punnettCross');
        stage.querySelectorAll('.m-ps-opt').forEach(b2 => b2.classList.toggle('picked', b2 === btn));
        ctx.feedback(ok ? `Right — ${want}/4 (${want * 25}%) ${wantName}.` : `Count the ${wantName} squares again.`, ok ? 'ok' : 'no');
        if (ok) { round++; ctx.progress(round, rounds); if (round >= rounds) setTimeout(ctx.solved, 500); else setTimeout(newRound, 900); }
      });
    }
    ctx.progress(0, rounds); newRound();
  } });

  /* ================================================================== FOOD WEB ===
     Build a food chain by tapping organisms from producer → apex predator.
     config: { prompt, chain:[{label, emoji}] in correct energy order }         */
  R('foodChain', { title: 'Build the food chain', mount(host, cfg, ctx) {
    const correct = cfg.chain || [];
    let pool = U.shuffle(correct.map((o, i) => ({ ...o, i })));
    let next = 0;
    const info = U.el('p', 'm-prompt', cfg.prompt || 'Tap the organisms in order of energy flow: producer first, then who eats whom.'); host.appendChild(info);
    const chainEl = U.el('div', 'm-fc-chain'); host.appendChild(chainEl);
    const poolEl = U.el('div', 'm-fc-pool'); host.appendChild(poolEl);
    function drawChain() {
      chainEl.innerHTML = correct.slice(0, next).map(o => `<span class="m-fc-node"><span class="m-fc-emoji">${o.emoji || ''}</span>${o.label}</span>`).join('<span class="m-fc-arrow">→</span>');
    }
    function drawPool() {
      poolEl.innerHTML = '';
      if (!pool.length) { poolEl.innerHTML = '<span class="m-sc-empty">Food chain complete! 🌿→🦊</span>'; return; }
      pool.forEach((o, k) => {
        const b = U.el('button', 'm-fc-item', `<span class="m-fc-emoji">${o.emoji || ''}</span>${o.label}`);
        b.onclick = () => {
          const ok = o.i === next; ctx.attempt(ok); ctx.count('foodChain');
          if (ok) { pool.splice(k, 1); next++; ctx.progress(next, correct.length); ctx.feedback(U.pick(['Energy flows on!', 'Correct!', 'Yes!']), 'ok'); drawChain(); drawPool(); if (next >= correct.length) setTimeout(ctx.solved, 500); }
          else { ctx.feedback(next === 0 ? 'Start with the producer — who makes its own food?' : 'Not next — what eats the last organism?', 'no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
        };
        poolEl.appendChild(b);
      });
    }
    ctx.progress(0, correct.length); drawChain(); drawPool();
  } });

})();
