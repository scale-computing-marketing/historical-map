/* Learning Atlas — Mathematics · lesson player.
   Runs one concept's lesson through the platform's learning flow:
     Hook → Explore → Discover → Practice → Challenge → Mastery → Unlock
   Steps are data (see data/lessons/*.js). Interactive steps name a reusable
   component; narrative steps carry a short line of framing (never long text).

   Lesson shape:
   {
     concept: conceptId,          // links to the knowledge graph
     title, hook: { text, emoji },
     steps: [
       { kind:'explore'|'practice'|'challenge'|'mastery',
         title, intro, component, config, difficulty }   // interactive
       { kind:'discover', title, text }                   // "here's what you found"
     ]
   }
   Difficulty: steps may be tagged easy|medium|challenge. The learner may stop
   after the Easy path; the Challenge step earns the 3rd star.

   Mastery: the player tallies attempts/correct across interactive steps. Score =
   correct/attempts. Stars: 1 = finished the core path; 2 = score ≥ masteryScore;
   3 = also cleared the Challenge step. Exposes window.MATH.Player.             */
(function () {
  const MATH = (window.MATH = window.MATH || {});
  const U = MATH.util, Store = MATH.Store, Graph = MATH.Graph;

  const LESSONS = {};
  const KIND_LABEL = { hook: 'Curiosity', prior: 'Warm-up', explore: 'Explore', discover: 'Discovery', practice: 'Practice', challenge: 'Challenge', mastery: 'Mastery check', reflect: 'Reflection', extend: 'Go further' };
  const KIND_ICON = { hook: '💡', prior: '🤔', explore: '🔎', discover: '✨', practice: '✏️', challenge: '🔥', mastery: '🏅', reflect: '🪞', extend: '🚀' };

  function register(lesson) { LESSONS[lesson.concept] = lesson; }
  function get(conceptId) { return LESSONS[conceptId]; }

  /* Build the ordered step list (the authored steps) plus a synthetic Unlock step
     at the end. A lesson's `hook` field, if present, is no longer shown as a step. */
  function buildFlow(lesson) {
    const flow = [];
    (lesson.steps || []).forEach(s => flow.push(s));
    flow.push({ kind: 'unlock', title: 'Unlocked!' });
    return flow;
  }

  /* Player controller. host = the #lesson element. onExit() returns to the map. */
  function Player(host, opts) {
    opts = opts || {};
    let lesson, concept, flow, idx, run, mountedDestroy = null, startTime = 0;

    function start(conceptId) {
      lesson = LESSONS[conceptId]; concept = Graph.get(conceptId);
      if (!lesson) { host.innerHTML = `<div class="m-lesson-empty note">This lesson isn't written yet — but the concept is on the map.</div>`; return; }
      flow = buildFlow(lesson);
      idx = 0; startTime = Date.now();
      run = { attempts: 0, correct: 0, solvedSteps: {}, challengeCleared: false, everFailedChallenge: false,
              summative: { attempts: 0, correct: 0 }, formative: { attempts: 0, correct: 0 }, misconceptions: [] };
      renderShell(); renderStep();
    }

    function renderShell() {
      host.innerHTML = `
        <div class="m-lesson">
          <header class="m-lesson-top ui">
            <button class="m-back" id="m-lesson-exit">← Map</button>
            <div class="m-lesson-title"><span class="m-lesson-crumb">Grade ${concept.grade} · ${concept.strand}</span><b>${lesson.title}</b></div>
            <div class="m-flowdots" id="m-flowdots"></div>
          </header>
          <div class="m-stage-wrap"><div class="m-card" id="m-card"></div></div>
          <footer class="m-lesson-foot ui">
            <button class="m-btn ghost m-prev" id="m-prev">← Back</button>
            <div class="m-feedback" id="m-feedback" aria-live="polite"></div>
            <div class="m-foot-right">
              <span class="m-roundpill" id="m-roundpill"></span>
              <button class="m-btn m-next" id="m-next" disabled>Continue →</button>
            </div>
          </footer>
        </div>`;
      host.querySelector('#m-lesson-exit').onclick = () => { cleanup(); opts.onExit && opts.onExit(); };
      host.querySelector('#m-next').onclick = advance;
      host.querySelector('#m-prev').onclick = back;
    }

    function renderDots() {
      // every step is freely clickable — the learner can wander the whole lesson
      const dots = flow.map((s, i) =>
        `<button class="m-fd ${i === idx ? 'now' : i < idx ? 'done' : ''} nav" data-i="${i}" title="${KIND_LABEL[s.kind] || s.kind}">${KIND_ICON[s.kind] || '•'}</button>`
      ).join('');
      const box = host.querySelector('#m-flowdots');
      box.innerHTML = dots;
      box.querySelectorAll('.m-fd.nav').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i !== idx) { idx = i; renderStep(); } });
    }

    function cleanup() { if (mountedDestroy) { try { mountedDestroy(); } catch (e) {} mountedDestroy = null; } Store.flushActivity(); }

    function setNext(enabled, label) { const b = host.querySelector('#m-next'); if (!b) return; b.disabled = !enabled; if (label) b.textContent = label; }
    function feedback(msg, kind) { const f = host.querySelector('#m-feedback'); if (!f) return; f.textContent = msg || ''; f.className = 'm-feedback' + (kind ? ' ' + kind : ''); }
    function progress(done, total) { const p = host.querySelector('#m-roundpill'); if (!p) return; p.textContent = total ? `${Math.min(done, total)} / ${total}` : ''; p.style.display = total ? '' : 'none'; }

    function back() { if (idx > 0) { idx--; renderStep(); } }

    function renderStep() {
      cleanup(); renderDots();
      const step = flow[idx]; const card = host.querySelector('#m-card');
      feedback(''); progress(0, 0); setNext(false, 'Continue →');
      run.currentAnswer = null;
      const prev = host.querySelector('#m-prev'); if (prev) prev.disabled = idx === 0;
      card.className = 'm-card kind-' + step.kind;

      if (step.kind === 'hook') {
        card.innerHTML = `<div class="m-kicker">${KIND_ICON.hook} Curiosity hook</div>
          <div class="m-hook"><div class="m-hook-emoji">${step.hook.emoji || '💡'}</div>
          <h2>${step.hook.text}</h2>${step.hook.sub ? `<p class="m-hook-sub">${step.hook.sub}</p>` : ''}</div>`;
        setNext(true, "Let's explore →");
        return;
      }
      if (step.kind === 'discover') {
        card.innerHTML = `<div class="m-kicker">${KIND_ICON.discover} What you discovered</div>
          <div class="m-discover"><h2>${step.title || 'Nice work!'}</h2><p>${step.text}</p>
          ${step.rule ? `<div class="m-rule-box">${step.rule}</div>` : ''}</div>`;
        setNext(true, 'Got it →');
        return;
      }
      if (step.kind === 'prior') {
        // Activate prior knowledge — a no-stakes prediction to prime thinking.
        const opts = step.options || [];
        card.innerHTML = `<div class="m-kicker">${KIND_ICON.prior} ${KIND_LABEL.prior}</div>
          ${step.title ? `<h2 class="m-step-title">${step.title}</h2>` : ''}
          <p class="m-prompt">${step.prompt || ''}</p>
          ${opts.length ? `<div class="m-prior-opts">${opts.map((o, i) => `<button class="m-prior-opt" data-i="${i}">${o}</button>`).join('')}</div>` : ''}
          <p class="m-prior-note">No wrong answers here — this is just to get you thinking.</p>`;
        if (opts.length) {
          card.querySelectorAll('.m-prior-opt').forEach(b => b.onclick = () => {
            card.querySelectorAll('.m-prior-opt').forEach(x => x.classList.remove('picked'));
            b.classList.add('picked'); feedback('Good guess — let’s find out.', 'ok'); setNext(true, 'Continue →');
          });
          setNext(false, 'Continue →');
        } else { setNext(true, 'Continue →'); }
        return;
      }
      if (step.kind === 'reflect') {
        // Reflection — a short written response; encouraged, never graded.
        const saved = (Store.getReflection && Store.getReflection(concept.id)) || '';
        const starters = step.starters || [];
        card.innerHTML = `<div class="m-kicker">${KIND_ICON.reflect} ${KIND_LABEL.reflect}</div>
          ${step.title ? `<h2 class="m-step-title">${step.title}</h2>` : ''}
          <p class="m-prompt">${step.prompt || 'What did you learn?'}</p>
          ${starters.length ? `<div class="m-starters">${starters.map(s => `<button class="m-starter" type="button">${s}…</button>`).join('')}</div>` : ''}
          <textarea class="m-reflect-in" id="m-reflect" rows="4" placeholder="Type your thinking…">${saved}</textarea>`;
        const ta = card.querySelector('#m-reflect');
        card.querySelectorAll('.m-starter').forEach(b => b.onclick = () => { ta.value = (ta.value ? ta.value.replace(/\s*$/, ' ') : '') + b.textContent; ta.focus(); if (Store.saveReflection) Store.saveReflection(concept.id, ta.value); });
        ta.addEventListener('input', () => { if (Store.saveReflection) Store.saveReflection(concept.id, ta.value); });
        setNext(true, 'Continue →');
        return;
      }
      if (step.kind === 'extend') {
        // Extension — enrichment: primary sources, harder challenges, links out.
        const items = step.items || [];
        card.innerHTML = `<div class="m-kicker">${KIND_ICON.extend} ${KIND_LABEL.extend}</div>
          ${step.title ? `<h2 class="m-step-title">${step.title}</h2>` : ''}
          ${step.intro ? `<p class="m-step-intro">${step.intro}</p>` : ''}
          <div class="m-extend-list">${items.map(it => (it.href
            ? `<a class="m-extend-card" href="${it.href}" target="_blank" rel="noopener"><span class="m-ext-ic">${it.icon || '↗'}</span><span class="m-ext-txt"><b>${it.label}</b><small>${it.detail || ''}</small></span></a>`
            : `<div class="m-extend-card"><span class="m-ext-ic">${it.icon || '✦'}</span><span class="m-ext-txt"><b>${it.label}</b><small>${it.detail || ''}</small></span></div>`)).join('')}</div>`;
        setNext(true, 'Finish →');
        return;
      }
      if (step.kind === 'unlock') { renderUnlock(card); return; }

      // interactive step. Assessment role: the mastery check is summative (it's the
      // graded demonstration); everything else is formative (low-stakes practice
      // that guides learning but doesn't set the grade). Authors may override with
      // step.assess.
      const role = step.assess || (step.kind === 'mastery' ? 'summative' : 'formative');
      const diffTag = step.difficulty ? `<span class="m-diff ${step.difficulty}">${step.difficulty}</span>` : '';
      const roleTag = role === 'summative' ? `<span class="m-assess summative">summative</span>`
        : step.kind === 'practice' ? `<span class="m-assess formative">formative</span>` : '';
      card.innerHTML = `<div class="m-kicker">${KIND_ICON[step.kind] || '•'} ${KIND_LABEL[step.kind] || step.kind} ${diffTag}${roleTag}</div>
        ${step.title ? `<h2 class="m-step-title">${step.title}</h2>` : ''}
        ${step.intro ? `<p class="m-step-intro">${step.intro}</p>` : ''}
        <div class="m-mount" id="m-mount"></div>`;
      const mount = card.querySelector('#m-mount');
      const def = MATH.Components.get(step.component);
      if (!def) { mount.innerHTML = `<p class="note">Missing component: ${step.component}</p>`; setNext(true); return; }
      const ctx = {
        difficulty: step.difficulty || 'easy',
        attempt(ok, info) {
          run.attempts++; if (ok) run.correct++;
          const bucket = role === 'summative' ? run.summative : run.formative;
          bucket.attempts++; if (ok) bucket.correct++;
          if (!ok && info && info.misconception) { run.misconceptions.push(info.misconception); Store.logMisconception(concept.id, info.misconception); }
        },
        feedback, progress,
        count(name) { Store.countActivity(name); },
        // a component tells the player the current correct answer, so the learner
        // can reveal it and move on if they're stuck.
        reveal(text) { run.currentAnswer = text; },
        solved() {
          run.solvedSteps[idx] = true;
          if (step.kind === 'challenge') run.challengeCleared = true;
          feedback(step.kind === 'challenge' ? 'Challenge cleared! 🔥' : 'Done — great job!', 'ok');
          setNext(true, idx + 1 < flow.length ? 'Continue →' : 'Finish →');
        }
      };
      const ret = def.mount(mount, step.config || {}, ctx);
      mountedDestroy = ret && ret.destroy;
      // Graded steps: never trap a stuck learner. Offer a reveal-and-continue so
      // they always have a way forward (challenge stays optional for the 3rd star).
      if (step.kind === 'practice' || step.kind === 'mastery' || step.kind === 'challenge') {
        const rb = U.el('button', 'm-reveal', step.kind === 'challenge' ? 'Skip challenge →' : 'Stuck? Show answer & continue →');
        rb.onclick = () => {
          if (step.kind === 'challenge') run.everFailedChallenge = true;
          feedback(run.currentAnswer != null ? `Answer: ${run.currentAnswer}. Keep going — you’ll get the next one.` : 'No worries — moving on.', '');
          setNext(true, idx + 1 < flow.length ? 'Continue →' : 'Finish →');
        };
        card.appendChild(rb);
      }
    }

    function advance() {
      if (idx + 1 < flow.length) { idx++; renderStep(); }
    }

    function computeResult() {
      // Mastery is judged on the SUMMATIVE assessment only. Fall back to overall
      // attempts for older lessons that have no dedicated mastery step.
      const s = run.summative;
      const gradedA = s.attempts || run.attempts, gradedC = s.attempts ? s.correct : run.correct;
      const acc = gradedA ? gradedC / gradedA : 1;
      const score = Math.round(acc * 100);
      // Mastery needs evidence: at least one graded attempt. (Steps are freely
      // navigable, so jumping straight to the results screen shouldn't master.)
      const passed = gradedA > 0 && score >= (concept.masteryScore || 80);
      let stars = 1;                              // finished the core path
      if (passed) stars = 2;                      // met the mastery bar
      if (passed && run.challengeCleared) stars = 3;
      return {
        conceptId: concept.id, score, accuracy: score,
        attempts: gradedA, correct: gradedC,
        formativeAttempts: run.formative.attempts,
        misconceptions: [...new Set(run.misconceptions)],
        timeMs: Date.now() - startTime,
        stars, completed: true, mastered: passed,
        challengeCleared: run.challengeCleared
      };
    }

    function renderUnlock(card) {
      const result = computeResult();
      Store.recordLesson(result);
      const unlocked = Graph.unlockedBy(concept.id).map(id => Graph.get(id)).filter(Boolean);
      const remediate = (!result.mastered) ? Graph.remediationFor(concept.id) : null;
      const starHtml = U.range(3).map(i => `<span class="m-star ${i < result.stars ? 'on' : ''}">★</span>`).join('');
      const stds = (concept.standards || []).map(code => MATH.Standards && MATH.Standards.get(code)).filter(Boolean);
      const stdBlock = stds.length ? `<div class="m-std-met">
        <span class="m-std-h">Indiana standards ${result.mastered ? 'mastered' : 'practised'}</span>
        <div class="m-std-chips">${stds.map(s => `<span class="badge" data-tooltip="${(s.statement || '').replace(/"/g, '&quot;')}">${s.code}</span>`).join('')}</div></div>` : '';
      const miscs = result.misconceptions || [];
      const miscBlock = miscs.length ? `<div class="m-misc">
        <span class="m-misc-h">⚠ Worth another look</span>
        <ul>${miscs.map(m => `<li>${m}</li>`).join('')}</ul></div>` : '';
      card.innerHTML = `
        <div class="m-unlock">
          <div class="m-kicker">${KIND_ICON.mastery} Lesson complete</div>
          <div class="m-stars-big" aria-label="${result.stars} of 3 stars">${starHtml}</div>
          <h2>${result.mastered ? 'Concept mastered!' : 'Good progress!'}</h2>
          <div class="m-result-stats">
            <div><b>${result.score}%</b><span>accuracy</span></div>
            <div><b>${result.correct}/${result.attempts || 0}</b><span>correct</span></div>
            <div><b>${Math.max(1, Math.round(result.timeMs / 60000))}m</b><span>time</span></div>
          </div>
          ${stdBlock}
          ${miscBlock}
          ${result.mastered
            ? (unlocked.length
              ? `<div class="m-unlock-list"><div class="m-unlock-h">🔓 New concepts unlocked</div>${unlocked.map(c => `<button class="m-unlock-card" data-go="${c.id}"><b>${c.name}</b><span>Grade ${c.grade} · ${c.strand}</span></button>`).join('')}</div>`
              : `<p class="m-unlock-note">You're at the frontier of what's built here — more concepts are on the way.</p>`)
            : `<p class="m-unlock-note">You need ${concept.masteryScore || 80}% to master this. ${remediate ? `Want to warm up with <b>${remediate.name}</b> first?` : 'Try the lesson again to raise your score.'}</p>
               ${remediate ? `<div class="m-unlock-list"><button class="m-unlock-card" data-go="${remediate.id}"><b>${remediate.name}</b><span>Review a prerequisite</span></button></div>` : ''}`}
          <div class="m-unlock-actions">
            <button class="m-btn ghost" id="m-replay">↻ Replay</button>
            <button class="m-btn" id="m-tomap">Back to map →</button>
          </div>
        </div>`;
      setNext(false); host.querySelector('#m-roundpill').style.display = 'none';
      card.querySelector('#m-replay').onclick = () => start(concept.id);
      card.querySelector('#m-tomap').onclick = () => { cleanup(); opts.onExit && opts.onExit(); };
      card.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { cleanup(); start(b.dataset.go); });
      if (opts.onComplete) opts.onComplete(result);
    }

    return { start, exit: () => { cleanup(); opts.onExit && opts.onExit(); } };
  }

  MATH.Player = { register, get, Player, KIND_LABEL, KIND_ICON };
})();
