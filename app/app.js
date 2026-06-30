/* Historical Wars Explorer — application boot + presentation.
   Talks to the war-agnostic Engine; holds the single synchronized state. */
(function () {
  const E = window.HWE.Engine;
  const war = window.HWE.wars['american-revolution'];
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const FACTION = () => ({
    britain: { label: 'British Empire', color: css('--britain') },
    usa: { label: 'United States', color: css('--usa') },
    france: { label: 'France & allies', color: css('--france') },
    spain: { label: 'Spain & possessions', color: css('--spain') },
    dutch: { label: 'Dutch Republic', color: css('--dutch') },
    neutral: { label: 'Uninvolved', color: css('--neutral') }
  });

  const state = {
    year: war.meta.defaultYear,
    selectedEntityId: null, selectedType: null,
    activeTab: 'overview',
    layers: { political: true, borders: true, cities: true, battles: true },
    projection: 'robinson',
    railPinned: false,
    geo: null,
    quiz: null, chosenOption: null
  };

  /* ---------------- MAP ---------------- */
  const W = 960, H = 520;
  let svg, gRoot, gLand, gBattle, gCity, gSel, proj, path, zoom;
  const projections = {
    robinson: () => d3.geoRobinson ? d3.geoRobinson() : d3.geoNaturalEarth1(),
    winkel: () => d3.geoWinkel3 ? d3.geoWinkel3() : d3.geoNaturalEarth1(),
    natural: () => d3.geoNaturalEarth1(),
    mercator: () => d3.geoMercator(),
    orthographic: () => d3.geoOrthographic().rotate([90, -20]).clipAngle(90)
  };

  function buildMap() {
    const host = document.getElementById('map');
    svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'application')
      .attr('aria-label', 'Interactive historical map. Use the timeline to change the year; click territories, cities and battles for details.');
    gRoot = svg.append('g');
    gRoot.append('path').attr('class', 'sphere');
    gRoot.append('path').attr('class', 'grat');
    gLand = gRoot.append('g');
    gBattle = gRoot.append('g');
    gCity = gRoot.append('g');
    gSel = gRoot.append('g');

    zoom = d3.zoom().scaleExtent([1, 9]).on('zoom', (ev) => gRoot.attr('transform', ev.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', () => clearSelection());
    setProjection(state.projection, true);
  }

  function setProjection(name, skipRender) {
    state.projection = name;
    proj = projections[name]();
    proj.fitExtent([[12, 12], [W - 12, H - 12]], { type: 'Sphere' });
    path = d3.geoPath(proj);
    if (!skipRender) renderGeometry();
    else renderGeometry();
  }

  function renderGeometry() {
    if (!state.geo) return;
    gRoot.select('.sphere').attr('d', path({ type: 'Sphere' })).attr('fill', css('--ocean'))
      .attr('stroke', css('--sphere')).attr('stroke-width', 0.8);
    gRoot.select('.grat').attr('d', path(d3.geoGraticule10())).attr('fill', 'none')
      .attr('stroke', css('--grat')).attr('stroke-width', 0.4);

    const tip = document.getElementById('maptip');
    const sel = gLand.selectAll('path').data(state.geo.features, (d, i) => i);
    sel.join(
      enter => enter.append('path')
        .attr('stroke', css('--neutral-stroke')).attr('stroke-width', 0.35)
        .style('cursor', 'pointer')
        .on('mousemove', function (ev, d) {
          if (this !== selectedNode) { d3.select(this).attr('stroke', css('--ink')).attr('stroke-width', 0.9).raise(); }
          const n = E.nationForGeo(war, d.properties);
          tip.textContent = (d.properties.NAME || 'Territory') + (n ? ' · ' + FACTION()[E.factionForFeature(war, d.properties, state.year)].label : '');
          showTip(ev);
        })
        .on('mouseout', function () { if (this !== selectedNode) d3.select(this).attr('stroke', css('--neutral-stroke')).attr('stroke-width', 0.35); hideTip(); })
        .on('click', function (ev, d) {
          ev.stopPropagation();
          const n = E.nationForGeo(war, d.properties);
          if (n) selectEntity(n.id, 'nation', this);
          else { selectedNode = null; gSel.selectAll('*').remove(); }
        }),
      update => update,
      exit => exit.remove()
    );
    gLand.selectAll('path').attr('d', path);   // geometry (re-applied on projection change)
    colorLand();
    renderBattles();
    renderCities();
    redrawSelection();
  }

  function colorLand() {
    const F = FACTION();
    const t = gLand.selectAll('path').transition().duration(420);
    t.attr('fill', d => state.layers.political ? F[E.factionForFeature(war, d.properties, state.year)].color : css('--neutral'))
      .attr('fill-opacity', 1)
      .attr('stroke', css('--neutral-stroke'))
      .attr('stroke-opacity', state.layers.borders ? 1 : 0);
  }

  function renderBattles() {
    const data = state.layers.battles ? E.battlesUpTo(war, state.year) : [];
    const g = gBattle.selectAll('g.b').data(data, d => d.id);
    const en = g.enter().append('g').attr('class', 'b').style('cursor', 'pointer')
      .attr('transform', d => { const p = proj([d.location.lon, d.location.lat]); return p ? `translate(${p[0]},${p[1]})` : 'translate(-99,-99)'; })
      .on('click', (ev, d) => { ev.stopPropagation(); selectEntity(d.id, 'battle'); flyTo([d.location.lon, d.location.lat], 3.2); })
      .on('mousemove', (ev, d) => { const tip = document.getElementById('maptip'); tip.textContent = d.name + ' · ' + d.date.y; showTip(ev); })
      .on('mouseout', hideTip);
    en.append('circle').attr('class', 'ring').attr('r', 9).attr('fill', 'none').attr('stroke', css('--battle')).attr('stroke-width', 1).attr('opacity', 0);
    en.append('circle').attr('class', 'core').attr('r', 4).attr('fill', css('--battle')).attr('stroke', css('--page')).attr('stroke-width', 1.2);
    g.exit().remove();
    gBattle.selectAll('g.b').select('.ring').attr('opacity', d => d.date.y === state.year ? 0.7 : 0);
    gBattle.selectAll('g.b').select('.core').attr('r', d => d.date.y === state.year ? 5 : 3.4)
      .attr('fill-opacity', d => d.date.y === state.year ? 1 : 0.72);
  }

  function renderCities() {
    const data = state.layers.cities ? war.cities : [];
    const g = gCity.selectAll('g.c').data(data, d => d.id);
    const en = g.enter().append('g').attr('class', 'c').style('cursor', 'pointer')
      .attr('transform', d => { const p = proj([d.lon, d.lat]); return p ? `translate(${p[0]},${p[1]})` : 'translate(-99,-99)'; })
      .on('click', (ev, d) => { ev.stopPropagation(); selectEntity(d.id, 'city'); flyTo([d.lon, d.lat], 3); })
      .on('mousemove', (ev, d) => { const tip = document.getElementById('maptip'); tip.textContent = d.name + (d.capitalOf ? ' · capital' : ''); showTip(ev); })
      .on('mouseout', hideTip);
    en.each(function (d) {
      const s = d3.select(this);
      if (d.capitalOf) s.append('path').attr('d', 'M0,-5 L1.5,-1.6 5.2,-1 2.3,1.7 3.1,5.3 0,3.1 -3.1,5.3 -2.3,1.7 -5.2,-1 -1.5,-1.6 Z')
        .attr('fill', css('--capital')).attr('stroke', css('--page')).attr('stroke-width', 0.5);
      else s.append('circle').attr('r', 2.6).attr('fill', css('--ink')).attr('stroke', css('--page')).attr('stroke-width', 0.7);
    });
    g.exit().remove();
  }

  let selectedNode = null;
  function redrawSelection() {
    gSel.selectAll('*').remove();
    if (state.selectedType === 'nation') {
      const n = E.entity(war, state.selectedEntityId);
      (state.geo.features || []).forEach(f => {
        const fn = E.nationForGeo(war, f.properties);
        if (fn && fn.id === n.id) gSel.append('path').attr('d', path(f)).attr('fill', 'none')
          .attr('stroke', css('--selected')).attr('stroke-width', 2).style('pointer-events', 'none');
      });
    }
  }

  function flyTo(lonlat, k) {
    const p = proj(lonlat); if (!p) return;
    const tx = W / 2 - k * p[0], ty = H / 2 - k * p[1];
    svg.transition().duration(700).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  }
  function resetZoom() { svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity); }

  function showTip(ev) {
    const tip = document.getElementById('maptip'); const r = document.getElementById('stage').getBoundingClientRect();
    tip.style.left = (ev.clientX - r.left + 12) + 'px'; tip.style.top = (ev.clientY - r.top + 12) + 'px'; tip.style.opacity = 1;
  }
  function hideTip() { document.getElementById('maptip').style.opacity = 0; }

  /* ---------------- SELECTION + STATE ---------------- */
  function selectEntity(id, type, node) {
    state.selectedEntityId = id; state.selectedType = type; state.chosenOption = null;
    if (type === 'nation') state.activeTab = 'countries';
    else if (type === 'battle') state.activeTab = 'battles';
    else if (type === 'leader') state.activeTab = 'leaders';
    else if (type === 'city') state.activeTab = 'countries';
    if (type === 'nation') { selectedNode = node || null; }
    openRail();
    redrawSelection();
    renderRail();
    if (state.quiz) checkLiveQuiz();
  }
  function clearSelection() {
    if (state.quiz && state.quiz.type === 'click-map') return; // clicks during quiz are answers
    state.selectedEntityId = null; state.selectedType = null; selectedNode = null;
    gSel.selectAll('*').remove();
    document.getElementById('rail').classList.remove('open');
    if (!state.railPinned) document.getElementById('rail').classList.remove('open');
  }

  function setYear(y) {
    y = Math.max(war.meta.years.start, Math.min(war.meta.years.end, y | 0));
    if (y === state.year) return;
    state.year = y;
    syncYear();
    if (state.quiz) checkLiveQuiz();
  }
  function syncYear() {
    document.getElementById('yearbig').textContent = state.year;
    document.getElementById('yearslider').value = state.year;
    document.getElementById('yearinput').value = state.year;
    colorLand(); renderBattles(); redrawSelection();
    renderRail(); renderWorld();
    updateLegend();
  }

  /* ---------------- RAIL ---------------- */
  const TABS = [['overview', 'Overview'], ['countries', 'Countries'], ['battles', 'Battles'], ['leaders', 'Leaders'], ['timeline', 'Timeline'], ['statistics', 'Statistics'], ['sources', 'Sources']];
  function openRail() { document.getElementById('rail').classList.add('open'); }

  function renderRail() {
    const rail = document.getElementById('rail');
    // head
    let title = war.meta.name, kind = 'War';
    const ent = state.selectedEntityId ? E.entity(war, state.selectedEntityId) : null;
    if (ent) {
      if (state.selectedType === 'nation') { title = ent.name; kind = 'Nation · ' + state.year; }
      else if (state.selectedType === 'battle') { title = ent.name; kind = 'Battle · ' + E.fmt.date(ent.date); }
      else if (state.selectedType === 'leader') { title = ent.name; kind = ent.role; }
      else if (state.selectedType === 'city') { title = ent.name; kind = 'City'; }
    }
    document.getElementById('rtitle').textContent = title;
    document.getElementById('rkind').textContent = kind;
    // tabs
    const tabsEl = document.getElementById('tabs'); tabsEl.innerHTML = '';
    TABS.forEach(([id, label]) => {
      const b = document.createElement('button'); b.textContent = label; b.className = state.activeTab === id ? 'active' : '';
      b.onclick = () => { state.activeTab = id; renderRail(); }; tabsEl.appendChild(b);
    });
    document.getElementById('railbody').innerHTML = renderTab(state.activeTab);
    wireRailLinks();
  }

  function renderTab(tab) {
    if (tab === 'overview') return tabOverview();
    if (tab === 'countries') return tabCountries();
    if (tab === 'battles') return tabBattles();
    if (tab === 'leaders') return tabLeaders();
    if (tab === 'timeline') return tabTimeline();
    if (tab === 'statistics') return tabStatistics();
    if (tab === 'sources') return tabSources();
    return '';
  }

  const m = war.meta;
  function tabOverview() {
    return `
      <p class="lead">${m.summary}</p>
      <dl class="kv">
        <dt>Dates</dt><dd>${m.duration}</dd>
        <dt>Outcome</dt><dd>${cap(m.victor)} victory</dd>
        <dt>Peace</dt><dd>${linkChip(m.peaceTreaty, E.entity(war, m.peaceTreaty).name)}</dd>
      </dl>
      <h3>Background</h3><p>${m.background}</p>
      <h3>Long-term causes</h3><ul>${m.causesLong.map(li).join('')}</ul>
      <h3>Immediate causes</h3><ul>${m.causesImmediate.map(li).join('')}</ul>
      <h3>Turning points</h3><ul>${m.turningPoints.map(li).join('')}</ul>
      <h3>Outcome &amp; significance</h3><p>${m.significance}</p>
      <p><strong>Territorial change:</strong> ${m.territorialChanges}</p>
      <h3>Long-term consequences</h3><ul>${m.consequences.map(li).join('')}</ul>`;
  }

  function tabCountries() {
    if (state.selectedType === 'nation') return nationDetail(E.entity(war, state.selectedEntityId));
    if (state.selectedType === 'city') return cityDetail(E.entity(war, state.selectedEntityId));
    const active = war.nations.filter(n => E.isActive(n, state.year));
    return `<p class="note">Participants active in ${state.year}. Click one — or click it on the map.</p>` +
      war.nations.map(n => {
        const on = E.isActive(n, state.year);
        return listItem(n.id, 'nation', FACTION()[n.factionKey] ? css('--' + n.factionKey) : css('--neutral'),
          n.name, (on ? sideLabel(n.side) : 'Not yet involved in ' + state.year));
      }).join('');
  }

  function nationDetail(n) {
    const st = E.stateOf(war, n.id, state.year);
    const f = (attr) => { const x = (st.facts || []).find(ff => ff.attr === attr); return x; };
    const factRow = (label, attr) => { const x = f(attr); return x ? `<dt>${label}</dt><dd>${E.fmt.factValue(x)}</dd>` : ''; };
    const allies = war.nations.filter(o => o.id !== n.id && o.side === n.side && E.isActive(o, state.year));
    const enemies = war.nations.filter(o => o.side !== n.side && E.isActive(o, state.year));
    const active = E.isActive(n, state.year);
    return `
      <div class="chips"><span class="chip" style="border-color:${css('--' + n.factionKey)}">${sideLabel(n.side)}</span>
        <span class="chip">${active ? 'Active belligerent · ' + state.year : 'Not involved in ' + state.year}</span></div>
      <p class="lead">${n.summary}</p>
      <dl class="kv">
        <dt>Capital</dt><dd>${n.capital.name}</dd>
        ${factRow('Government', 'government')}
        ${factRow('Monarch', 'monarch')}
        ${factRow('Leader', 'leader')}
        ${factRow('Head of govt', 'headOfGovernment')}
        ${factRow('Key minister', 'keyMinister')}
        ${factRow('Population', 'population')}
        ${factRow('Army', 'army')}
        ${factRow('Navy', 'navy')}
        ${factRow('Entered war', 'entryEvent') || factRow('Entered', 'entryEvent')}
      </dl>
      ${(f('population') && f('population').note) ? `<p class="note">${f('population').note}</p>` : ''}
      <h3>War objectives</h3><ul>${n.objectives.map(li).join('')}</ul>
      <h3>Allies in ${state.year}</h3>${allies.length ? `<div class="chips">${allies.map(a => linkChip(a.id, a.short, 'nation')).join('')}</div>` : '<p>None active yet.</p>'}
      <h3>Opponents in ${state.year}</h3>${enemies.length ? `<div class="chips">${enemies.map(a => linkChip(a.id, a.short, 'nation')).join('')}</div>` : '<p>—</p>'}
      <p class="note">Values are resolved for <strong>${state.year}</strong>. Scrub the timeline to see them change.</p>`;
  }

  function cityDetail(c) {
    return `<p class="lead">${c.note}</p><dl class="kv">${c.capitalOf ? `<dt>Capital of</dt><dd>${linkChip(c.capitalOf, E.entity(war, c.capitalOf).short, 'nation')}</dd>` : ''}<dt>Location</dt><dd>${c.lat.toFixed(1)}°, ${c.lon.toFixed(1)}°</dd></dl>`;
  }

  function tabBattles() {
    if (state.selectedType === 'battle') return battleDetail(E.entity(war, state.selectedEntityId));
    const occurred = E.battlesUpTo(war, state.year);
    return `<p class="note">${occurred.length} of ${war.battles.length} battles have occurred by ${state.year}. Selecting one zooms the map.</p>` +
      war.battles.map(b => {
        const past = b.date.y <= state.year;
        return listItem(b.id, 'battle', css('--battle'), b.name + (past ? '' : ' <span class="li-sub">(later)</span>'),
          E.fmt.date(b.date) + ' · ' + b.location.place + ' · ' + b.victor);
      }).join('');
  }
  function battleDetail(b) {
    const cdrs = (b.commanders || []).map(c => c.startsWith('person:') ? linkChip(c, E.entity(war, c).name, 'leader') : `<span class="chip">${c}</span>`).join('');
    const cas = b.casualties ? Object.entries(b.casualties).map(([k, val]) => `<dt>${cap(k)} losses</dt><dd>${E.fmt.number(val)}</dd>`).join('') : '';
    return `
      <div class="chips"><span class="chip">${E.fmt.date(b.date)}</span><span class="chip">${b.location.place}</span>${b.decisive ? '<span class="chip" style="border-color:var(--accent);color:var(--accent)">Decisive</span>' : ''}${b.naval ? '<span class="chip">Naval</span>' : ''}</div>
      <p class="lead">${b.significance}</p>
      <dl class="kv"><dt>Outcome</dt><dd>${b.victor}</dd>${cas}</dl>
      ${cdrs ? `<h3>Commanders</h3><div class="chips">${cdrs}</div>` : ''}
      <button class="chip" data-fly="${b.location.lon},${b.location.lat}">Zoom to location ↗</button>
      ${sourcesFor(b)}`;
  }

  function tabLeaders() {
    if (state.selectedType === 'leader') return leaderDetail(E.entity(war, state.selectedEntityId));
    return `<p class="note">Key figures on every side.</p>` + war.leaders.map(l =>
      listItem(l.id, 'leader', css('--' + (sideKey(l.side))), l.name, l.role + ' · ' + l.years)).join('');
  }
  function leaderDetail(l) {
    const nat = E.entity(war, l.nationId);
    const rb = (l.relatedBattles || []).map(b => linkChip(b, E.entity(war, b).name, 'battle')).join('');
    const rt = (l.relatedTreaties || []).map(t => linkChip(t, E.entity(war, t).name, 'treaty')).join('');
    return `
      <div class="chips"><span class="chip">${l.years}</span><span class="chip">${nat ? nat.short : ''}</span><span class="chip">${sideLabel(l.side)}</span></div>
      <p><strong>${l.role}</strong></p><p class="lead">${l.bio}</p>
      ${rb ? `<h3>Related battles</h3><div class="chips">${rb}</div>` : ''}
      ${rt ? `<h3>Related treaties</h3><div class="chips">${rt}</div>` : ''}
      ${sourcesFor(l)}`;
  }

  function tabTimeline() {
    const evs = war.timeline.slice().sort((a, b) => a.date.y - b.date.y || (a.date.m || 0) - (b.date.m || 0));
    return `<p class="note">Events through ${state.year} are highlighted; later events are dimmed. Click a battle or treaty to open it.</p>` +
      evs.map(ev => {
        const past = ev.date.y <= state.year;
        const dot = ev.type === 'battle' ? css('--battle') : ev.type === 'treaty' ? css('--france') : css('--muted');
        const link = ev.type === 'battle' ? bestBattleId(ev) : (ev.type === 'treaty' ? bestTreatyId(ev) : null);
        return `<button class="list-item" ${link ? `data-id="${link.id}" data-type="${link.type}"` : ''} style="opacity:${past ? 1 : .45}">
          <span class="dot" style="background:${dot}"></span>
          <span class="li-main"><span class="li-title">${ev.title}</span><span class="li-sub">${E.fmt.date(ev.date)} — ${ev.desc}</span></span></button>`;
      }).join('');
  }

  function tabStatistics() {
    const rows = war.nations.map(n => {
      const st = E.stateOf(war, n.id, state.year);
      const pop = (st.facts || []).find(f => f.attr === 'population');
      return `<tr><td>${n.short}</td><td>${E.isActive(n, state.year) ? sideLabel(n.side) : '—'}</td><td>${pop ? E.fmt.factValue(pop) : '—'}</td></tr>`;
    }).join('');
    return `
      <h3>The world in ${state.year}</h3>
      <p class="note">Where historians give ranges, ranges are shown. Population figures are period estimates, not censuses.</p>
      <table style="width:100%;font-family:var(--ui);font-size:13px;border-collapse:collapse">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px 4px">Nation</th><th>Side (${state.year})</th><th>Population</th></tr>
        ${rows}
      </table>
      <h3>Human cost</h3>
      <p>Total deaths are debated. Combined American military deaths are usually estimated at <strong>25,000–70,000</strong> <span class="conf low">low confidence</span>, the majority from disease rather than combat. Global figures (French, Spanish, British, Indian theatres) are far less certain.</p>
      <h3>Scale</h3><ul>${m.consequences.map(li).join('')}</ul>`;
  }

  function tabSources() {
    const list = Object.values(war.sources);
    return `<p class="note">Every factual claim in this atlas is traceable to a source below. Where scholars disagree, ranges and confidence levels are shown rather than a single invented figure.</p>` +
      list.map(s => `<div class="src"><div>${s.citation}${s.url ? ` — <a href="${s.url}" target="_blank" rel="noopener">link</a>` : ''}</div><div class="rel" style="color:${s.reliability === 'high' ? 'var(--dutch)' : s.reliability === 'low' ? 'var(--accent)' : 'var(--muted)'}">${s.type} · ${s.reliability} reliability</div></div>`).join('');
  }

  function sourcesFor(ent) {
    if (!ent.sources || !ent.sources.length) return '';
    const items = ent.sources.map(id => { const s = E.source(war, id); return s ? `<div class="src">${s.citation}</div>` : ''; }).join('');
    return `<h3>Sources ${ent.confidence ? `<span class="conf ${ent.confidence === 'low' ? 'low' : ''}">${ent.confidence} confidence</span>` : ''}</h3>${items}`;
  }

  /* link/list helpers */
  function li(x) { return `<li>${x}</li>`; }
  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function sideKey(side) { return side === 'british' ? 'britain' : 'usa'; }
  function sideLabel(side) { return side === 'british' ? 'British side' : 'American coalition'; }
  function linkChip(id, label, type) { return `<button class="chip" data-id="${id}" data-type="${type || E.entity(war, id).type}">${label}</button>`; }
  function listItem(id, type, color, title, sub) {
    return `<button class="list-item" data-id="${id}" data-type="${type}"><span class="dot" style="background:${color}"></span><span class="li-main"><span class="li-title">${title}</span><span class="li-sub">${sub}</span></span></button>`;
  }
  function bestBattleId(ev) { const b = war.battles.find(b => b.date.y === ev.date.y && ev.title.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())); return b ? { id: b.id, type: 'battle' } : null; }
  function bestTreatyId(ev) { const t = war.treaties.find(t => t.date.y === ev.date.y); return t ? { id: t.id, type: 'treaty' } : null; }

  function wireRailLinks() {
    document.querySelectorAll('#railbody [data-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id'), type = el.getAttribute('data-type');
        if (type === 'treaty') { state.selectedEntityId = id; state.selectedType = 'treaty'; alert(E.entity(war, id).name + '\n\n' + E.entity(war, id).summary); return; }
        const ent = E.entity(war, id);
        selectEntity(id, type);
        if (type === 'battle') flyTo([ent.location.lon, ent.location.lat], 3.2);
        if (type === 'nation') { resetZoom(); }
      });
    });
    document.querySelectorAll('#railbody [data-fly]').forEach(el => {
      el.addEventListener('click', () => { const [lon, lat] = el.getAttribute('data-fly').split(',').map(Number); flyTo([lon, lat], 3.4); });
    });
  }

  /* ---------------- WORLD AT THIS TIME ---------------- */
  function renderWorld() {
    const w = E.worldAt(war, state.year);
    const pop = w.worldPopulation;
    const card = (lbl, html) => `<div class="wcard"><div class="lbl">${lbl}</div><div class="val">${html}</div></div>`;
    const ul = arr => `<ul>${(arr || []).map(li).join('')}</ul>`;
    document.getElementById('world-year').textContent = 'The world in ' + state.year;
    document.getElementById('world-cards').innerHTML =
      card('World population', `${(pop.low / 1e6 | 0)}–${(pop.high / 1e6 | 0)} million <span class="conf low">est.</span>`) +
      card('Largest empires', ul(w.largestEmpires)) +
      card('Largest cities', ul(w.largestCities)) +
      card('Other conflicts', ul(w.otherConflicts)) +
      card('Science', ul(w.science)) +
      card('Culture', ul(w.culture));
  }

  /* ---------------- LEGEND ---------------- */
  function updateLegend() {
    const F = FACTION();
    const order = ['usa', 'france', 'spain', 'dutch', 'britain', 'neutral'];
    const active = new Set(war.nations.filter(n => E.isActive(n, state.year)).map(n => n.factionKey));
    const rows = order.map(k => {
      const dim = (k !== 'britain' && k !== 'usa' && k !== 'neutral' && !active.has(k));
      return `<div class="row" style="opacity:${dim ? .4 : 1}"><span class="sw" style="background:${F[k].color}"></span>${F[k].label}${dim ? ' (not yet)' : ''}</div>`;
    }).join('');
    document.getElementById('legend').innerHTML =
      `<div class="ttl">Allegiance · ${state.year}</div>${rows}
       <div class="row" style="margin-top:5px"><span class="sw" style="background:${css('--battle')};border-radius:50%"></span>Battle</div>
       <div class="row"><span class="sw" style="background:${css('--capital')}"></span>Capital</div>`;
  }

  /* ---------------- SEARCH ---------------- */
  function wireSearch() {
    const input = document.getElementById('search'), res = document.getElementById('results');
    input.addEventListener('input', () => {
      const items = E.search(war, input.value);
      if (!items.length) { res.classList.remove('open'); res.innerHTML = ''; return; }
      res.innerHTML = items.map(it => `<button data-id="${it.id}" data-type="${it.type}"><span>${it.label}</span><span class="sub">${it.sublabel}</span></button>`).join('');
      res.classList.add('open');
      res.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-id'), type = b.getAttribute('data-type');
        res.classList.remove('open'); input.value = '';
        if (type === 'year') { setYear(+id.split(':')[1]); return; }
        const ent = E.entity(war, id);
        selectEntity(id, type);
        if (type === 'battle' || type === 'city') flyTo(type === 'battle' ? [ent.location.lon, ent.location.lat] : [ent.lon, ent.lat], 3.2);
      }));
    });
    input.addEventListener('blur', () => setTimeout(() => res.classList.remove('open'), 180));
  }

  /* ---------------- QUIZ ---------------- */
  let quizIdx = 0;
  function openQuiz(i) {
    quizIdx = i; const q = war.quizzes[i]; state.quiz = q; state.chosenOption = null;
    const card = document.getElementById('quizcard');
    document.getElementById('quiz').classList.add('open');
    let body = `<div class="kq">Quiz · ${i + 1} of ${war.quizzes.length}</div><h3>${q.prompt}</h3>`;
    if (q.type === 'multiple-choice') {
      body += `<div class="opts">${q.options.map(o => `<button data-opt="${o}">${o}</button>`).join('')}</div>`;
    } else {
      body += `<div class="opts"><button id="quiz-go">${q.type === 'click-map' ? 'Find it on the map' : 'Use the timeline'} ↗</button></div>`;
    }
    body += `<div class="feedback" id="quiz-fb"></div><div class="qfoot"><button id="quiz-close">Close</button><button id="quiz-next">Skip →</button></div>`;
    card.innerHTML = body;
    document.getElementById('quiz-close').onclick = closeQuiz;
    document.getElementById('quiz-next').onclick = () => openQuiz((i + 1) % war.quizzes.length);
    if (q.type === 'multiple-choice') card.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { state.chosenOption = b.getAttribute('data-opt'); judgeQuiz(); });
    const go = document.getElementById('quiz-go'); if (go) go.onclick = () => { document.getElementById('quiz').classList.remove('open'); showInstruction(q.prompt); };
  }
  function showInstruction(text) { const el = document.getElementById('live-instruction'); el.textContent = '⤷ ' + text; el.classList.add('show'); }
  function hideInstruction() { document.getElementById('live-instruction').classList.remove('show'); }
  function checkLiveQuiz() {
    if (!state.quiz) return;
    const ok = E.checkQuiz(state.quiz, state);
    if (ok) { hideInstruction(); document.getElementById('quiz').classList.add('open'); judgeQuiz(); }
  }
  function judgeQuiz() {
    const q = state.quiz; const ok = E.checkQuiz(q, state);
    document.getElementById('quiz').classList.add('open');
    const fb = document.getElementById('quiz-fb');
    if (fb) { fb.className = 'feedback show ' + (ok ? 'ok' : 'no'); fb.textContent = ok ? q.feedback.correct : q.feedback.incorrect; }
    if (ok) state.quiz = state.quiz; // keep for review
  }
  function closeQuiz() { document.getElementById('quiz').classList.remove('open'); state.quiz = null; hideInstruction(); }

  /* ---------------- TIMELINE CONTROLS ---------------- */
  let playing = null;
  function togglePlay() {
    const btn = document.getElementById('play');
    if (playing) { clearInterval(playing); playing = null; btn.textContent = '▶'; return; }
    btn.textContent = '❚❚';
    playing = setInterval(() => {
      if (state.year >= war.meta.years.end) { setYear(war.meta.years.start); }
      else setYear(state.year + 1);
    }, 1100);
  }

  /* ---------------- TOP BAR MENUS ---------------- */
  function wireMenus() {
    const layerBtn = document.getElementById('layers-btn'), layerPop = document.getElementById('layers-pop');
    layerBtn.onclick = (e) => { e.stopPropagation(); layerPop.classList.toggle('open'); document.getElementById('proj-pop').classList.remove('open'); };
    layerPop.querySelectorAll('input').forEach(cb => cb.onchange = () => {
      state.layers[cb.dataset.layer] = cb.checked;
      colorLand(); renderBattles(); renderCities(); updateLegend();
    });
    const projBtn = document.getElementById('proj-btn'), projPop = document.getElementById('proj-pop');
    projBtn.onclick = (e) => { e.stopPropagation(); projPop.classList.toggle('open'); layerPop.classList.remove('open'); };
    projPop.querySelectorAll('button').forEach(b => b.onclick = () => {
      projPop.querySelectorAll('button').forEach(x => x.style.fontWeight = '400');
      b.style.fontWeight = '600'; projPop.classList.remove('open');
      resetZoom(); setProjection(b.dataset.proj); redrawSelection();
    });
    document.body.addEventListener('click', () => { layerPop.classList.remove('open'); projPop.classList.remove('open'); });

    document.getElementById('pin').onclick = () => {
      state.railPinned = !state.railPinned;
      document.getElementById('app').classList.toggle('rail-pinned', state.railPinned);
      document.getElementById('rail').classList.toggle('pinned', state.railPinned);
      document.getElementById('pin').textContent = state.railPinned ? '⇥' : '⇤';
    };
    document.getElementById('railclose').onclick = () => { document.getElementById('rail').classList.remove('open'); state.railPinned = false; document.getElementById('rail').classList.remove('pinned'); document.getElementById('app').classList.remove('rail-pinned'); };
    document.getElementById('world-btn').onclick = () => document.getElementById('world').classList.toggle('open');
    document.getElementById('world-close').onclick = () => document.getElementById('world').classList.remove('open');
    document.getElementById('quiz-btn').onclick = () => openQuiz(0);
    document.getElementById('quiz').addEventListener('click', (e) => { if (e.target.id === 'quiz') closeQuiz(); });
  }

  /* ---------------- BOOT ---------------- */
  function reTheme() {
    if (!state.geo) return;
    gBattle.selectAll('*').remove(); gCity.selectAll('*').remove();
    renderGeometry(); updateLegend(); renderWorld();
    if (document.getElementById('rail').classList.contains('open')) renderRail();
  }

  function boot() {
    buildMapShellRefs();
    buildMap();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', reTheme);
    wireSearch(); wireMenus(); wireTimeline();
    syncYearStatic();
    d3.json(war.geo.borderSnapshots[1783]).then(geo => {
      state.geo = geo;
      renderGeometry(); colorLand(); renderBattles(); renderCities();
      updateLegend(); renderWorld();
      // open rail to the overview by default (pinned-feel without covering map fully)
      setTimeout(() => { document.getElementById('hint').style.opacity = 1; }, 200);
    }).catch(() => { document.getElementById('map').innerHTML = '<p style="font-family:var(--ui);padding:40px;color:var(--muted)">The map needs internet access to load the historical basemap (CDN).</p>'; });
  }

  function buildMapShellRefs() { /* placeholder for symmetry */ }
  function syncYearStatic() {
    document.getElementById('yearbig').textContent = state.year;
    document.getElementById('yearslider').min = war.meta.years.start;
    document.getElementById('yearslider').max = war.meta.years.end;
    document.getElementById('yearslider').value = state.year;
    document.getElementById('yearinput').value = state.year;
  }
  function wireTimeline() {
    document.getElementById('yearslider').addEventListener('input', e => setYear(+e.target.value));
    document.getElementById('yearinput').addEventListener('change', e => setYear(+e.target.value));
    document.getElementById('prev').onclick = () => setYear(state.year - 1);
    document.getElementById('next').onclick = () => setYear(state.year + 1);
    document.getElementById('play').onclick = togglePlay;
    document.getElementById('reset').onclick = resetZoom;
    document.getElementById('overview-btn').onclick = () => { state.selectedEntityId = null; state.selectedType = null; state.activeTab = 'overview'; gSel.selectAll('*').remove(); openRail(); renderRail(); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
