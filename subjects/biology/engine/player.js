/* Life Explorer — Biology · lesson player.
   Runs one concept's lesson through the platform's learning flow:
     Hook → Explore → Discover → Practice → Challenge → Mastery → Unlock
   Steps are data (see data/lessons-*.js). Interactive steps name a reusable
   simulation; narrative steps carry a short line of framing (never long text).

   Lesson shape:
   {
     concept: conceptId,          // links to the knowledge graph
     title, hook: { text, emoji, sub },
     steps: [
       { kind:'explore'|'practice'|'challenge'|'mastery',
         title, intro, component, config, difficulty }   // interactive
       { kind:'discover', title, text, rule }             // "here's what you found"
     ]
   }
   Difficulty: steps may be tagged easy|medium|challenge. The learner may stop
   after the core path; the Challenge step earns the 3rd star.

   Mastery: the player tallies attempts/correct across interactive steps. Score =
   correct/attempts. Stars: 1 = finished the core path; 2 = score ≥ masteryScore;
   3 = also cleared the Challenge step. Exposes window.BIO.Player.               */
(function () {
  const BIO = (window.BIO = window.BIO || { topics: {} });
  const U = BIO.util, Store = BIO.Store, Graph = BIO.Graph;

  const LESSONS = {};
  const KIND_LABEL = { hook: 'Curiosity', explore: 'Explore', discover: 'Discovery', practice: 'Practice', challenge: 'Challenge', mastery: 'Mastery check' };
  const KIND_ICON = { hook: '💡', explore: '🔬', discover: '✨', practice: '✏️', challenge: '🔥', mastery: '🏅' };

  function register(lesson) { LESSONS[lesson.concept] = lesson; }
  function get(conceptId) { return LESSONS[conceptId]; }

  /* Build the ordered step list including the auto Hook (from lesson.hook) and a
     synthetic Unlock step appended at the end. */
  function buildFlow(lesson) {
    const flow = [];
    if (lesson.hook) flow.push({ kind: 'hook', title: 'A question to start', hook: lesson.hook });
    (lesson.steps || []).forEach(s => flow.push(s));
    flow.push({ kind: 'unlock', title: 'Unlocked!' });
    return flow;
  }

  /* Player controller. host = the #bio-lesson element. onExit() returns to the map. */
  function Player(host, opts) {
    opts = opts || {};
    let lesson, concept, flow, idx, run, mountedDestroy = null, startTime = 0;

    function crumb() { return 'Unit ' + concept.unit + ' · ' + Graph.unitName(concept.unit); }

    function start(conceptId) {
      lesson = LESSONS[conceptId]; concept = Graph.get(conceptId);
      if (!lesson) { host.innerHTML = `<div class="m-lesson-empty note">This lesson isn't written yet — but the concept is on the map.</div>`; return; }
      flow = buildFlow(lesson);
      idx = 0; startTime = Date.now();
      run = { attempts: 0, correct: 0, solvedSteps: {}, challengeCleared: false, everFailedChallenge: false };
      renderShell(); renderStep();
    }

    function renderShell() {
      host.innerHTML = `
        <div class="m-lesson">
          <header class="m-lesson-top ui">
            <button class="m-back" id="m-lesson-exit">← Map</button>
            <div class="m-lesson-title"><span class="m-lesson-crumb">${crumb()}</span><b>${lesson.title}</b></div>
            <div class="m-flowdots" id="m-flowdots"></div>
          </header>
          <div class="m-stage-wrap"><div class="m-card" id="m-card"></div></div>
          <footer class="m-lesson-foot ui">
            <div class="m-feedback" id="m-feedback" aria-live="polite"></div>
            <div class="m-foot-right">
              <span class="m-roundpill" id="m-roundpill"></span>
              <button class="m-btn m-next" id="m-next" disabled>Continue →</button>
            </div>
          </footer>
        </div>`;
      host.querySelector('#m-lesson-exit').onclick = () => { cleanup(); opts.onExit && opts.onExit(); };
      host.querySelector('#m-next').onclick = advance;
    }

    function renderDots() {
      const dots = flow.map((s, i) => `<span class="m-fd ${i === idx ? 'now' : i < idx ? 'done' : ''}" title="${KIND_LABEL[s.kind] || s.kind}">${KIND_ICON[s.kind] || '•'}</span>`).join('');
      host.querySelector('#m-flowdots').innerHTML = dots;
    }

    function cleanup() { if (mountedDestroy) { try { mountedDestroy(); } catch (e) {} mountedDestroy = null; } Store.flushActivity(); }

    function setNext(enabled, label) { const b = host.querySelector('#m-next'); if (!b) return; b.disabled = !enabled; if (label) b.textContent = label; }
    function feedback(msg, kind) { const f = host.querySelector('#m-feedback'); if (!f) return; f.innerHTML = msg || ''; f.className = 'm-feedback' + (kind ? ' ' + kind : ''); }
    function progress(done, total) { const p = host.querySelector('#m-roundpill'); if (!p) return; p.textContent = total ? `${Math.min(done, total)} / ${total}` : ''; p.style.display = total ? '' : 'none'; }

    function renderStep() {
      cleanup(); renderDots();
      const step = flow[idx]; const card = host.querySelector('#m-card');
      feedback(''); progress(0, 0); setNext(false, 'Continue →');
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
      if (step.kind === 'unlock') { renderUnlock(card); return; }

      // interactive step
      const diffTag = step.difficulty ? `<span class="m-diff ${step.difficulty}">${step.difficulty}</span>` : '';
      card.innerHTML = `<div class="m-kicker">${KIND_ICON[step.kind] || '•'} ${KIND_LABEL[step.kind] || step.kind} ${diffTag}</div>
        ${step.title ? `<h2 class="m-step-title">${step.title}</h2>` : ''}
        ${step.intro ? `<p class="m-step-intro">${step.intro}</p>` : ''}
        <div class="m-mount" id="m-mount"></div>`;
      const mount = card.querySelector('#m-mount');
      const def = BIO.Components.get(step.component);
      if (!def) { mount.innerHTML = `<p class="note">Missing simulation: ${step.component}</p>`; setNext(true); return; }
      const ctx = {
        difficulty: step.difficulty || 'easy',
        attempt(ok) { run.attempts++; if (ok) run.correct++; },
        feedback, progress,
        count(name) { Store.countActivity(name); },
        solved() {
          run.solvedSteps[idx] = true;
          if (step.kind === 'challenge') run.challengeCleared = true;
          feedback(step.kind === 'challenge' ? 'Challenge cleared! 🔥' : 'Done — great work, scientist!', 'ok');
          setNext(true, idx + 1 < flow.length ? 'Continue →' : 'Finish →');
        }
      };
      const ret = def.mount(mount, step.config || {}, ctx);
      mountedDestroy = ret && ret.destroy;
      // Challenge steps are optional: allow skipping to still finish the lesson.
      if (step.kind === 'challenge') {
        const skip = U.el('button', 'm-skip', 'Skip challenge');
        skip.onclick = () => { run.everFailedChallenge = true; feedback('Skipped the challenge — you can come back for the 3rd star.', ''); setNext(true, 'Finish →'); };
        card.appendChild(skip);
      }
    }

    function advance() {
      if (idx + 1 < flow.length) { idx++; renderStep(); }
    }

    function computeResult() {
      const acc = run.attempts ? run.correct / run.attempts : 1;
      const score = Math.round(acc * 100);
      const passed = score >= (concept.masteryScore || 80);
      let stars = 1;                              // finished the core path
      if (passed) stars = 2;                      // met the mastery bar
      if (passed && run.challengeCleared) stars = 3;
      return {
        conceptId: concept.id, score, accuracy: score,
        attempts: run.attempts, correct: run.correct,
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
          ${result.mastered
            ? (unlocked.length
              ? `<div class="m-unlock-list"><div class="m-unlock-h">🔓 New concepts unlocked</div>${unlocked.map(c => `<button class="m-unlock-card" data-go="${c.id}"><b>${c.name}</b><span>Unit ${c.unit} · ${Graph.unitName(c.unit)}</span></button>`).join('')}</div>`
              : `<p class="m-unlock-note">You're at the frontier of what's built here — more concepts are on the way.</p>`)
            : `<p class="m-unlock-note">You need ${concept.masteryScore || 80}% to master this. ${remediate ? `Want to review <b>${remediate.name}</b> first?` : 'Try the lesson again to raise your score.'}</p>
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

  BIO.Player = { register, get, Player, KIND_LABEL, KIND_ICON };
})();
