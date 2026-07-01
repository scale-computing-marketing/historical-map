/* Learning Atlas — shared UI shell.
   Framework-free, reusable widgets that any subject explorer composes: a
   dropdown-menu helper, the sliding info Rail (header + tabs + body), the Quiz
   modal (multiple-choice and "click the diagram" questions), and a search box.
   Loaded as a classic script; exposes window.Atlas.                          */
(function () {
  const Atlas = (window.Atlas = window.Atlas || {});

  Atlas.el = function (id) { return document.getElementById(id); };

  /* Wire a set of dropdown menus so a trigger toggles its .menu-pop, and any
     outside click / other trigger closes the rest. Pass [[btnId, popId], …]. */
  Atlas.wireMenus = function (pairs) {
    const pops = pairs.map(([b, p]) => ({ btn: Atlas.el(b), pop: Atlas.el(p) })).filter(x => x.btn && x.pop);
    pops.forEach(({ btn, pop }) => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = pop.classList.contains('open');
        pops.forEach(x => x.pop.classList.remove('open'));
        pop.classList.toggle('open', !open);
      });
      pop.addEventListener('click', e => e.stopPropagation());
    });
    document.addEventListener('click', () => pops.forEach(x => x.pop.classList.remove('open')));
    return { closeAll: () => pops.forEach(x => x.pop.classList.remove('open')) };
  };

  /* The sliding info panel. Give it the #rail element (with .rail-head > #rtitle,
     #rkind; a #tabs row; and a #railbody). update() rebuilds tabs + body.       */
  Atlas.Rail = function (railEl) {
    const rtitle = railEl.querySelector('#rtitle'), rkind = railEl.querySelector('#rkind');
    const tabsEl = railEl.querySelector('#tabs'), body = railEl.querySelector('#railbody');
    const closeBtn = railEl.querySelector('#railclose');
    if (closeBtn) closeBtn.onclick = () => railEl.classList.remove('open');
    function update(opts) {
      rtitle.textContent = opts.title || '';
      rkind.textContent = opts.kind || '';
      tabsEl.innerHTML = '';
      (opts.tabs || []).forEach(t => {
        const b = document.createElement('button');
        b.textContent = t.label; b.className = t.id === opts.activeTab ? 'active' : '';
        b.onclick = () => opts.onTab && opts.onTab(t.id);
        tabsEl.appendChild(b);
      });
      tabsEl.style.display = (opts.tabs && opts.tabs.length) ? '' : 'none';
      body.innerHTML = opts.body || '';
      if (opts.onBody) opts.onBody(body);
    }
    return {
      el: railEl, body,
      open() { railEl.classList.add('open'); },
      close() { railEl.classList.remove('open'); },
      isOpen() { return railEl.classList.contains('open'); },
      update
    };
  };

  /* Quiz modal controller. Supports two question shapes:
       { type:'multiple-choice', prompt, options:[…], answer:'…', feedback:{correct,incorrect} }
       { type:'click', prompt, answerId:'…', feedback:{correct,incorrect} }
     For 'click' questions the controller shows a banner and hands control to the
     host via opts.onExpectClick(cb); the host calls cb(id) when the user clicks a
     target, and the controller judges it against answerId.                      */
  Atlas.Quiz = function (modalEl, opts) {
    opts = opts || {};
    const card = modalEl.querySelector('#quizcard');
    const banner = opts.banner || null;   // optional .live-instruction element
    let quizzes = [], i = 0, awaiting = false;

    function run(list) { quizzes = list || []; i = 0; if (quizzes.length) { modalEl.classList.add('open'); render(); } }
    function close() { modalEl.classList.remove('open'); hideBanner(); awaiting = false; }
    function showBanner(txt) { if (banner) { banner.textContent = txt; banner.classList.add('show'); } }
    function hideBanner() { if (banner) banner.classList.remove('show'); }

    function render() {
      const q = quizzes[i]; if (!q) { close(); return; }
      const foot = `<div class="qfoot"><span>Question ${i + 1} of ${quizzes.length}</span>
        <button data-q="skip">${i + 1 < quizzes.length ? 'Skip →' : 'Close'}</button></div>`;
      if (q.type === 'click') {
        card.innerHTML = `<div class="kq">Find it</div><h3>${q.prompt}</h3>
          <div class="feedback" id="qfb"></div>
          <p class="note">Look at the diagram and click the answer.</p>${foot}`;
        awaiting = true; showBanner(q.prompt);
        if (opts.onExpectClick) opts.onExpectClick(id => judgeClick(id, q));
        // keep the modal from blocking the diagram: shrink to a hint
        modalEl.classList.add('peek');
      } else {
        modalEl.classList.remove('peek'); hideBanner(); awaiting = false;
        const optsHtml = (q.options || []).map(o => `<button data-opt="${encodeURIComponent(o)}">${o}</button>`).join('');
        card.innerHTML = `<div class="kq">Question</div><h3>${q.prompt}</h3>
          <div class="opts">${optsHtml}</div><div class="feedback" id="qfb"></div>${foot}`;
      }
      card.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => judgeMC(decodeURIComponent(b.dataset.opt), q, b));
      const skip = card.querySelector('[data-q="skip"]'); if (skip) skip.onclick = next;
    }
    function feedbackEl() { return card.querySelector('#qfb'); }
    function showFeedback(ok, q) {
      const fb = feedbackEl(); if (!fb) return;
      fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
      fb.textContent = ok ? (q.feedback && q.feedback.correct || 'Correct!') : (q.feedback && q.feedback.incorrect || 'Not quite — try again.');
    }
    function judgeMC(choice, q, btn) {
      const ok = choice === q.answer;
      showFeedback(ok, q);
      if (ok) { card.querySelectorAll('[data-opt]').forEach(b => b.disabled = true); setTimeout(next, 1100); }
    }
    function judgeClick(id, q) {
      if (!awaiting) return;
      const ok = id === q.answerId;
      modalEl.classList.remove('peek'); modalEl.classList.add('open'); hideBanner();
      // re-render the card body to show feedback (banner mode cleared it)
      card.innerHTML = `<div class="kq">${ok ? 'Correct' : 'Not quite'}</div><h3>${q.prompt}</h3>
        <div class="feedback show ${ok ? 'ok' : 'no'}">${ok ? (q.feedback && q.feedback.correct || 'Correct!') : (q.feedback && q.feedback.incorrect || 'That’s not the one — look again.')}</div>
        <div class="qfoot"><span>Question ${i + 1} of ${quizzes.length}</span><button data-q="skip">${i + 1 < quizzes.length ? 'Next →' : 'Close'}</button></div>`;
      awaiting = false;
      card.querySelector('[data-q="skip"]').onclick = next;
    }
    function next() { i++; if (i < quizzes.length) render(); else close(); }

    // close on backdrop click
    modalEl.addEventListener('click', e => { if (e.target === modalEl) close(); });
    return { run, close, isAwaitingClick: () => awaiting };
  };

  /* Wire a search box: input (#id) filters via searchFn(query) -> [{id,label,sub}]
     and renders results into resultsEl; selecting calls onPick(item).           */
  Atlas.wireSearch = function (input, resultsEl, searchFn, onPick) {
    function close() { resultsEl.classList.remove('open'); resultsEl.innerHTML = ''; }
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) return close();
      const hits = (searchFn(q) || []).slice(0, 8);
      if (!hits.length) return close();
      resultsEl.innerHTML = hits.map((h, k) =>
        `<button data-k="${k}">${h.label}<span class="sub">${h.sub || ''}</span></button>`).join('');
      resultsEl.querySelectorAll('button').forEach((b, k) => b.onclick = () => { onPick(hits[k]); close(); input.value = ''; });
      resultsEl.classList.add('open');
    });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; close(); } });
    document.addEventListener('click', e => { if (!resultsEl.contains(e.target) && e.target !== input) close(); });
  };
})();
