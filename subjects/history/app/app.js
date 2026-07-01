/* Historical Wars Explorer — application boot + presentation.
   Talks to the war-agnostic Engine; holds the single synchronized state.
   Everything war-specific (factions, side labels, geometry, projection, timeline
   bounds, title) is read from the active `war` object, so switching wars — or
   adding a new one as a data file — needs no change here.                      */
(function () {
  const E = window.HWE.Engine;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  /* The registered wars, in declared order. Adding a data file (and its <script>
     tag) makes a new war appear in the switcher automatically. */
  const WARS = Object.values(window.HWE.wars);
  let war = WARS[0];

  /* Faction descriptors for the active war: key -> { label, color }. */
  function FACTION() {
    const out = {};
    Object.entries(war.factions || {}).forEach(([k, f]) => { out[k] = { label: f.label, color: css(f.colorVar) }; });
    if (!out.neutral) out.neutral = { label: 'Uninvolved', color: css('--neutral') };
    return out;
  }
  function factionColor(key) {
    const f = (war.factions || {})[key];
    return css(f ? f.colorVar : '--' + key);
  }
  function side(s) { return (war.sides && war.sides[s]) || { label: s, factionKey: 'neutral' }; }
  function sideLabel(s) { return side(s).label; }
  function sideColor(s) { return factionColor(side(s).factionKey); }

  const state = {
    year: war.meta.defaultYear,
    selectedEntityId: null, selectedType: null,
    activeTab: 'overview',
    layers: { political: true, borders: true, cities: true, battles: true },
    projection: (war.geo && war.geo.projection) || 'robinson',
    railPinned: false,
    geo: null, geoUrl: null,
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

  /* Fit to the loaded geometry's bounds for a regional map (Civil War), or to the
     whole globe for a world map (Revolution). */
  function fitProjection() {
    const dataFit = war.geo && war.geo.fit === 'data' && state.geo;
    const target = dataFit ? state.geo : { type: 'Sphere' };
    proj.fitExtent([[14, 14], [W - 14, H - 14]], target);
    path = d3.geoPath(proj);
  }

  function setProjection(name, skipRender) {
    state.projection = name;
    proj = projections[name]();
    fitProjection();
    if (!skipRender) renderGeometry();
  }

  function drawBackdrop() {
    // A world map gets the styled ocean sphere + graticule; a data-fit regional
    // map sits on the stage's ocean tone (no global sphere to blow up the view).
    const showGlobe = !(war.geo && war.geo.fit === 'data');
    gRoot.select('.sphere').attr('d', showGlobe ? path({ type: 'Sphere' }) : null)
      .attr('fill', css('--ocean')).attr('stroke', css('--sphere')).attr('stroke-width', 0.8);
    gRoot.select('.grat').attr('d', showGlobe ? path(d3.geoGraticule10()) : null)
      .attr('fill', 'none').attr('stroke', css('--grat')).attr('stroke-width', 0.4);
  }

  function renderGeometry() {
    if (!state.geo) return;
    drawBackdrop();

    const tip = document.getElementById('maptip');
    const nameProp = E.geoNameProp(war);
    // Rebuild land paths from scratch. renderGeometry runs only on load, snapshot
    // swap, projection or theme change — never on the smooth year-recolor (that's
    // colorLand alone) — so a clean enter avoids index-keyed data-join mismatches
    // when one snapshot has a different feature set than the next.
    gLand.selectAll('path').remove();
    const sel = gLand.selectAll('path').data(state.geo.features, (d, i) => i);
    sel.join(
      enter => enter.append('path').attr('class', 'land')
        .attr('fill', css('--neutral'))
        .attr('stroke', css('--neutral-stroke')).attr('stroke-width', 0.35)
        .style('cursor', 'pointer')
        .on('mousemove', function (ev, d) {
          if (this !== selectedNode) { d3.select(this).attr('stroke', css('--ink')).attr('stroke-width', 0.9).raise(); }
          const n = E.nationForGeo(war, d.properties);
          tip.textContent = (d.properties[nameProp] || 'Territory') + (n ? ' · ' + FACTION()[E.factionForFeature(war, d.properties, state.year)].label : '');
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
    // Set fills directly (correctness); the .land CSS rule cross-fades the change.
    gLand.selectAll('path')
      .attr('fill', d => state.layers.political ? F[E.factionForFeature(war, d.properties, state.year)].color : css('--neutral'))
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
    gBattle.selectAll('g.b').attr('transform', d => { const p = proj([d.location.lon, d.location.lat]); return p ? `translate(${p[0]},${p[1]})` : 'translate(-99,-99)'; });
    gBattle.selectAll('g.b').select('.ring').attr('opacity', d => d.date.y === state.year ? 0.7 : 0);
    gBattle.selectAll('g.b').select('.core').attr('r', d => d.date.y === state.year ? 5 : 3.4)
      .attr('fill-opacity', d => d.date.y === state.year ? 1 : 0.72);
  }

  function renderCities() {
    const data = state.layers.cities ? war.cities : [];
    const g = gCity.selectAll('g.c').data(data, d => d.id);
    const en = g.enter().append('g').attr('class', 'c').style('cursor', 'pointer')
      .on('click', (ev, d) => { ev.stopPropagation(); selectEntity(d.id, 'city'); flyTo([d.lon, d.lat], 3); })
      .on('mousemove', (ev, d) => { const tip = document.getElementById('maptip'); tip.textContent = d.name + (d.capitalOf ? ' · capital' : ''); showTip(ev); })
      .on('mouseout', hideTip);
    en.each(function (d) {
      const s = d3.select(this);
      if (d.capitalOf) s.append('path').attr('d', 'M0,-5 L1.5,-1.6 5.2,-1 2.3,1.7 3.1,5.3 0,3.1 -3.1,5.3 -2.3,1.7 -5.2,-1 -1.5,-1.6 Z')
        .attr('transform', 'scale(0.62)').attr('fill', css('--capital')).attr('stroke', css('--page')).attr('stroke-width', 0.8);
      else s.append('circle').attr('r', 2.6).attr('fill', css('--ink')).attr('stroke', css('--page')).attr('stroke-width', 0.7);
    });
    g.exit().remove();
    gCity.selectAll('g.c').attr('transform', d => { const p = proj([d.lon, d.lat]); return p ? `translate(${p[0]},${p[1]})` : 'translate(-99,-99)'; });
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
    if (!state.railPinned) document.getElementById('rail').classList.remove('open');
  }
  /* Drop the current entity but keep the rail open — returns a section tab to its list. */
  function clearRailSelection() {
    state.selectedEntityId = null; state.selectedType = null; selectedNode = null;
    gSel.selectAll('*').remove();
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
    updateSliderFill();
    // reload geometry only if this year falls under a different border snapshot
    if (E.geoSourceFor(war, state.year) !== state.geoUrl) {
      loadGeometryAndRender();   // handles colorLand / battles / cities / legend / world
    } else {
      colorLand(); renderBattles(); redrawSelection();
      renderWorld(); updateLegend();
    }
    renderRail();
  }

  /* ---------------- RAIL ---------------- */
  /* Base tabs shared by every war. A war that supplies a `documents` array
     (e.g. founding documents) gets a Documents tab inserted after Timeline. */
  function tabsFor(w) {
    const t = [['overview', 'Overview'], ['countries', 'Countries'], ['battles', 'Battles'], ['leaders', 'Leaders'], ['timeline', 'Timeline'], ['statistics', 'Statistics'], ['sources', 'Sources']];
    if (w.documents && w.documents.length) t.splice(5, 0, ['documents', 'Documents']);
    return t;
  }
  /* The list tab each selectable entity belongs to; clicking that tab's header
     while its detail is open jumps back to the full list. */
  const LIST_TAB = { nation: 'countries', city: 'countries', battle: 'battles', leader: 'leaders' };
  function openRail() { document.getElementById('rail').classList.add('open'); }

  function renderRail() {
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
    tabsFor(war).forEach(([id, label]) => {
      const b = document.createElement('button'); b.textContent = label; b.className = state.activeTab === id ? 'active' : '';
      b.onclick = () => {
        // re-clicking a section header with its detail open returns to the list
        if (state.selectedEntityId && LIST_TAB[state.selectedType] === id) clearRailSelection();
        state.activeTab = id; renderRail();
      };
      tabsEl.appendChild(b);
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
    if (tab === 'documents') return tabDocuments();
    if (tab === 'statistics') return tabStatistics();
    if (tab === 'sources') return tabSources();
    return '';
  }

  function tabOverview() {
    const m = war.meta;
    return `
      <p class="lead">${m.summary}</p>
      <dl class="kv">
        <dt>Dates</dt><dd>${m.duration}</dd>
        <dt>Outcome</dt><dd>${cap(m.victor)} victory</dd>
        <dt>Peace</dt><dd>${m.peaceTreaty ? linkChip(m.peaceTreaty, E.entity(war, m.peaceTreaty).name) : '—'}</dd>
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
    return `<p class="note">Participants and their allegiance in ${state.year}. Click one — or click it on the map.</p>` +
      war.nations.map(n => {
        const on = E.isActive(n, state.year);
        return listItem(n.id, 'nation', factionColor(n.factionKey),
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
      <div class="chips"><span class="chip" style="border-color:${factionColor(n.factionKey)}">${sideLabel(n.side)}</span>
        <span class="chip">${active ? 'Active · ' + state.year : 'Not involved in ' + state.year}</span></div>
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
        ${factRow('Entered war', 'entryEvent')}
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
    return `<p class="note">${occurred.length} of ${war.battles.length} battles have occurred by ${state.year}. Selecting one zooms the map; use ‹ › inside a battle to step through them.</p>` +
      battlesChrono().map(b => {
        const past = b.date.y <= state.year;
        return listItem(b.id, 'battle', css('--battle'), b.name + (past ? '' : ' <span class="li-sub">(later)</span>'),
          E.fmt.date(b.date) + ' · ' + b.location.place + ' · ' + b.victor);
      }).join('');
  }
  function battleDetail(b) {
    const order = battlesChrono();
    const idx = order.findIndex(x => x.id === b.id);
    const prev = order[idx - 1], next = order[idx + 1];
    const nav = `<div class="navrow">
      <button class="nav-btn" ${prev ? `data-go-battle="${prev.id}"` : 'disabled'} title="${prev ? prev.name : ''}">‹ Prev</button>
      <span class="nav-count">Battle ${idx + 1} of ${order.length}</span>
      <button class="nav-btn" ${next ? `data-go-battle="${next.id}"` : 'disabled'} title="${next ? next.name : ''}">Next ›</button>
    </div>`;
    const cdrs = (b.commanders || []).map(c => c.startsWith('person:') ? linkChip(c, E.entity(war, c).name, 'leader') : `<span class="chip">${c}</span>`).join('');
    const cas = b.casualties ? Object.entries(b.casualties).map(([k, val]) => `<dt>${cap(k)} losses</dt><dd>${E.fmt.number(val)}</dd>`).join('') : '';
    return `${nav}
      <div class="chips"><span class="chip">${E.fmt.date(b.date)}</span><span class="chip">${b.location.place}</span>${b.decisive ? '<span class="chip" style="border-color:var(--accent);color:var(--accent)">Decisive</span>' : ''}${b.naval ? '<span class="chip">Naval</span>' : ''}</div>
      <p class="lead">${b.significance}</p>
      <dl class="kv"><dt>Outcome</dt><dd>${b.victor}</dd>${cas}</dl>
      ${cdrs ? `<h3>Commanders</h3><div class="chips">${cdrs}</div>` : ''}
      <button class="chip" data-fly="${b.location.lon},${b.location.lat}">Zoom to location ↗</button>
      <button class="chip" data-back-list="battles">← All battles</button>
      ${sourcesFor(b)}`;
  }

  function tabLeaders() {
    if (state.selectedType === 'leader') return leaderDetail(E.entity(war, state.selectedEntityId));
    return `<p class="note">Key figures on every side.</p>` + war.leaders.map(l =>
      listItem(l.id, 'leader', sideColor(l.side), l.name, l.role + ' · ' + l.years)).join('');
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
      <button class="chip" data-back-list="leaders">← All leaders</button>
      ${sourcesFor(l)}`;
  }

  function tabTimeline() {
    const evs = war.timeline.slice().sort((a, b) => a.date.y - b.date.y || (a.date.m || 0) - (b.date.m || 0));
    return `<p class="note">Events through ${state.year} are highlighted; later events are dimmed. Click a battle or treaty to open it.</p>` +
      evs.map(ev => {
        const past = ev.date.y <= state.year;
        const dot = ev.type === 'battle' ? css('--battle') : ev.type === 'treaty' ? css('--accent') : css('--muted');
        const link = ev.type === 'battle' ? bestBattleId(ev) : (ev.type === 'treaty' ? bestTreatyId(ev) : null);
        return `<button class="list-item" ${link ? `data-id="${link.id}" data-type="${link.type}"` : ''} style="opacity:${past ? 1 : .45}">
          <span class="dot" style="background:${dot}"></span>
          <span class="li-main"><span class="li-title">${ev.title}</span><span class="li-sub">${E.fmt.date(ev.date)} — ${ev.desc}</span></span></button>`;
      }).join('');
  }

  function tabDocuments() {
    const docs = (war.documents || []).slice().sort((a, b) =>
      a.date.y - b.date.y || (a.date.m || 0) - (b.date.m || 0) || (a.date.d || 0) - (b.date.d || 0));
    return `<p class="note">Founding documents of the era — click a link to read the full text at its archive.</p>` +
      docs.map(d => `
        <div class="doc">
          <h3>${d.name}</h3>
          <div class="doc-meta">${E.fmt.date(d.date)}${d.author ? ' · ' + d.author : ''}</div>
          ${d.excerpt ? `<blockquote>${d.excerpt}</blockquote>` : ''}
          <p>${d.summary}</p>
          ${amendmentsBlock(d.amendments)}
          ${d.significance ? `<p class="doc-sig"><strong>Why it matters:</strong> ${d.significance}</p>` : ''}
          ${d.url ? `<a class="doc-link" href="${d.url}" target="_blank" rel="noopener">Read the full text ↗</a>` : ''}
        </div>`).join('') +
      (docs.some(d => (d.sources || []).length) ? sourcesFor({ sources: [...new Set(docs.flatMap(d => d.sources || []))] }) : '');
  }

  /* Renders a document's amendments as a numbered list, split into the Bill of
     Rights (1–10) and the later amendments. Returns '' when there are none. */
  function amendmentsBlock(list) {
    if (!list || !list.length) return '';
    const row = a => `<li class="amend"><span class="amend-n">${a.n}</span><span class="amend-txt">${a.text}<span class="amend-yr">${a.year}</span></span></li>`;
    const bor = list.filter(a => a.n <= 10), later = list.filter(a => a.n > 10);
    return `
      ${bor.length ? `<div class="amend-h">Bill of Rights · 1791</div><ol class="amends">${bor.map(row).join('')}</ol>` : ''}
      ${later.length ? `<div class="amend-h">Later amendments</div><ol class="amends">${later.map(row).join('')}</ol>` : ''}`;
  }

  function tabStatistics() {
    const rows = war.nations.map(n => {
      const st = E.stateOf(war, n.id, state.year);
      const pop = (st.facts || []).find(f => f.attr === 'population');
      return `<tr><td>${n.short}</td><td>${E.isActive(n, state.year) ? sideLabel(n.side) : '—'}</td><td>${pop ? E.fmt.factValue(pop) : '—'}</td></tr>`;
    }).join('');
    const m = war.meta;
    return `
      <h3>The participants in ${state.year}</h3>
      <p class="note">Where historians give ranges, ranges are shown. Population figures are period estimates, not censuses.</p>
      <table style="width:100%;font-family:var(--ui);font-size:13px;border-collapse:collapse">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px 4px">Side</th><th>Allegiance (${state.year})</th><th>Population</th></tr>
        ${rows}
      </table>
      ${m.humanCost ? `<h3>Human cost</h3><p>${m.humanCost}</p>` : ''}
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
  function battlesChrono() { return war.battles.slice().sort((a, b) => a.date.y - b.date.y || (a.date.m || 0) - (b.date.m || 0) || (a.date.d || 0) - (b.date.d || 0)); }
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
        if (type === 'treaty') { const t = E.entity(war, id); alert(t.name + '\n\n' + t.summary); return; }
        const ent = E.entity(war, id);
        selectEntity(id, type);
        if (type === 'battle') flyTo([ent.location.lon, ent.location.lat], 3.2);
        if (type === 'nation') { resetZoom(); }
      });
    });
    document.querySelectorAll('#railbody [data-fly]').forEach(el => {
      el.addEventListener('click', () => { const [lon, lat] = el.getAttribute('data-fly').split(',').map(Number); flyTo([lon, lat], 3.4); });
    });
    document.querySelectorAll('#railbody [data-go-battle]').forEach(el => {
      el.addEventListener('click', () => { const id = el.getAttribute('data-go-battle'); const ent = E.entity(war, id); selectEntity(id, 'battle'); flyTo([ent.location.lon, ent.location.lat], 3.2); });
    });
    document.querySelectorAll('#railbody [data-back-list]').forEach(el => {
      el.addEventListener('click', () => { clearRailSelection(); state.activeTab = el.getAttribute('data-back-list'); renderRail(); });
    });
  }

  /* ---------------- WORLD AT THIS TIME ---------------- */
  function renderWorld() {
    const w = E.worldAt(war, state.year);
    const pop = w.worldPopulation;
    const card = (lbl, html, cls) => `<div class="wcard${cls ? ' ' + cls : ''}"><div class="lbl">${lbl} ${cls === 'wide' ? '<span class="lbl-yr">· ' + state.year + '</span>' : ''}</div><div class="val">${html}</div></div>`;
    const ul = arr => `<ul>${(arr || []).map(li).join('')}</ul>`;
    document.getElementById('world-year').textContent = 'The world in ' + state.year;
    // Concurrent wars elsewhere in the world, filtered to this year.
    const conflicts = E.conflictsAt(war, state.year);
    const warsHtml = conflicts.length
      ? `<ul class="warlist">${conflicts.map(c =>
          `<li><span class="wl-name">${c.name}</span><span class="wl-meta">${c.region} · ${c.start}${c.end !== c.start ? '–' + c.end : ''}</span><span class="wl-note">${c.note}</span></li>`).join('')}</ul>`
      : ul(w.otherConflicts);  // fall back to the war's own curated list
    document.getElementById('world-cards').innerHTML =
      card('Wars around the world', warsHtml, 'wide') +
      (pop ? card('World population', `${(pop.low / 1e6 | 0)}–${(pop.high / 1e6 | 0)} million <span class="conf low">est.</span>`) : '') +
      card('Largest empires', ul(w.largestEmpires)) +
      card('Largest cities', ul(w.largestCities)) +
      card('Science', ul(w.science)) +
      card('Culture', ul(w.culture));
  }

  /* ---------------- LEGEND ---------------- */
  function updateLegend() {
    const F = FACTION();
    const order = war.legendOrder || Object.keys(F);
    // which faction keys have a belligerent that hasn't entered yet?
    const byFaction = {};
    war.nations.forEach(n => { (byFaction[n.factionKey] = byFaction[n.factionKey] || []).push(n); });
    const rows = order.map(k => {
      const nats = byFaction[k];
      const dim = nats && nats.length && !nats.some(n => E.isActive(n, state.year));
      return `<div class="row" style="opacity:${dim ? .4 : 1}"><span class="sw" style="background:${F[k].color}"></span>${F[k].label}${dim ? ' (not yet)' : ''}</div>`;
    }).join('');
    document.getElementById('legend').innerHTML =
      `<div class="ttl">Allegiance · ${state.year}</div>${rows}
       <div class="row" style="margin-top:5px"><span class="sw" style="background:${css('--battle')};border-radius:50%"></span>Battle</div>
       <div class="row"><span class="sw" style="background:${css('--capital')}"></span>Capital</div>
       ${war.geo && war.geo.note ? `<div class="row legnote">${war.geo.note}</div>` : ''}`;
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
  function openQuiz(i) {
    if (!war.quizzes || !war.quizzes.length) return;
    const q = war.quizzes[i]; state.quiz = q; state.chosenOption = null;
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
  function stopPlay() { if (playing) { clearInterval(playing); playing = null; document.getElementById('play').textContent = '▶'; } }

  /* ---------------- TOP BAR MENUS ---------------- */
  function wireMenus() {
    const layerBtn = document.getElementById('layers-btn'), layerPop = document.getElementById('layers-pop');
    const projBtn = document.getElementById('proj-btn'), projPop = document.getElementById('proj-pop');
    const closeAll = () => { layerPop.classList.remove('open'); projPop.classList.remove('open'); };

    buildWarMenu();   // renders the war list into the sidebar

    layerBtn.onclick = (e) => { e.stopPropagation(); const open = layerPop.classList.contains('open'); closeAll(); if (!open) layerPop.classList.add('open'); };
    layerPop.querySelectorAll('input').forEach(cb => cb.onchange = () => {
      state.layers[cb.dataset.layer] = cb.checked;
      colorLand(); renderBattles(); renderCities(); updateLegend();
    });
    projBtn.onclick = (e) => { e.stopPropagation(); const open = projPop.classList.contains('open'); closeAll(); if (!open) projPop.classList.add('open'); };
    projPop.querySelectorAll('button').forEach(b => b.onclick = () => {
      projPop.querySelectorAll('button').forEach(x => x.style.fontWeight = '400');
      b.style.fontWeight = '600'; projPop.classList.remove('open');
      resetZoom(); setProjection(b.dataset.proj); redrawSelection();
    });
    document.body.addEventListener('click', closeAll);

    document.getElementById('railclose').onclick = () => { document.getElementById('rail').classList.remove('open'); state.railPinned = false; document.getElementById('rail').classList.remove('pinned'); document.getElementById('app').classList.remove('rail-pinned'); };
    document.getElementById('world-btn').onclick = () => document.getElementById('world').classList.toggle('open');
    document.getElementById('world-close').onclick = () => document.getElementById('world').classList.remove('open');
    document.getElementById('quiz-btn').onclick = () => openQuiz(0);
    document.getElementById('quiz').addEventListener('click', (e) => { if (e.target.id === 'quiz') closeQuiz(); });
  }

  function buildWarMenu() {
    const list = document.getElementById('war-list');
    list.innerHTML = WARS.map(w =>
      `<button class="la-navitem war-item${w.id === war.id ? ' active' : ''}" data-war="${w.id}">
        <span class="dot ${w.id === war.id ? 'now' : ''}"></span>
        <span class="li-main"><span class="nm">${w.meta.name}</span><span class="war-dur ui">${w.meta.duration}</span></span></button>`).join('');
    list.querySelectorAll('[data-war]').forEach(b => b.onclick = () => {
      switchWar(b.dataset.war);
      document.getElementById('app').classList.remove('nav-open');   // close mobile slide-over
    });
  }

  /* ---------------- WAR SWITCHING ---------------- */
  function switchWar(id) {
    if (id === war.id) return;
    const next = WARS.find(w => w.id === id); if (!next) return;
    stopPlay();
    war = next;
    // reset synchronized state for the new war
    state.year = war.meta.defaultYear;
    state.selectedEntityId = null; state.selectedType = null; selectedNode = null;
    state.activeTab = 'overview'; state.quiz = null; state.chosenOption = null;
    state.projection = (war.geo && war.geo.projection) || 'robinson';
    state.geo = null; state.geoUrl = null;
    gSel.selectAll('*').remove(); gLand.selectAll('path').remove();
    gBattle.selectAll('*').remove(); gCity.selectAll('*').remove();
    closeQuiz();
    applyWarChrome();
    setProjection(state.projection, true);
    buildWarMenu();
    loadGeometryAndRender();
  }

  /* Update the parts of the shell that name or bound the active war. */
  function applyWarChrome() {
    document.title = 'Historical Wars Explorer — ' + war.meta.name;
    document.getElementById('brand-title').textContent = war.meta.name;
    // mark the projection menu's active entry
    document.querySelectorAll('#proj-pop button').forEach(b => b.style.fontWeight = b.dataset.proj === state.projection ? '600' : '400');
    // timeline bounds + ticks
    const sl = document.getElementById('yearslider'), yi = document.getElementById('yearinput');
    sl.min = yi.min = war.meta.years.start; sl.max = yi.max = war.meta.years.end;
    sl.value = yi.value = state.year;
    document.getElementById('yearbig').textContent = state.year;
    const ys = war.meta.years.start, ye = war.meta.years.end, yspan = ye - ys || 1;
    document.querySelector('#timeline .tl-ticks').innerHTML = buildTicks(ys, ye)
      .map(y => `<span style="left:${((y - ys) / yspan * 100).toFixed(3)}%">${y}</span>`).join('');
    updateSliderFill();
    resetZoom();
    document.getElementById('rail').classList.remove('open');
  }

  /* Evenly stepped integer year ticks (~5–6 of them), always including the end
     year. Labels are positioned by their true fraction, so even an uneven final
     step still sits exactly under the slider dot. */
  function buildTicks(start, end) {
    const span = end - start;
    if (span <= 0) return [start];
    const step = Math.max(1, Math.round(span / 5));
    const out = [];
    for (let y = start; y < end; y += step) out.push(y);
    out.push(end);
    return [...new Set(out)];
  }

  /* Paints the WebKit track fill up to the current year (Firefox uses
     ::-moz-range-progress natively). */
  function updateSliderFill() {
    const s = document.getElementById('yearslider');
    const span = war.meta.years.end - war.meta.years.start || 1;
    const pct = (state.year - war.meta.years.start) / span * 100;
    s.style.setProperty('--pct', pct.toFixed(3) + '%');
  }

  /* ---------------- BOOT ---------------- */
  function reTheme() {
    if (!state.geo) return;
    gBattle.selectAll('*').remove(); gCity.selectAll('*').remove();
    renderGeometry(); updateLegend(); renderWorld();
    if (document.getElementById('rail').classList.contains('open')) renderRail();
  }

  /* d3-geo treats polygons on the sphere and expects CLOCKWISE exterior rings;
     a counter-clockwise ring is read as "everything except this area" and fills
     the whole map. Some GeoJSON files (e.g. the US-states set) use the opposite
     winding, so normalize per ring. Gated by `geo.rewind` to leave already-correct
     basemaps untouched. */
  function ringSignedArea(ring) { let a = 0; for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]; return a / 2; }
  function rewindRing(ring, wantClockwise) { const isClockwise = ringSignedArea(ring) < 0; if (isClockwise !== wantClockwise) ring.reverse(); }
  function rewindPolygon(poly) { rewindRing(poly[0], true); for (let i = 1; i < poly.length; i++) rewindRing(poly[i], false); }
  function validRing(ring) { return ring && ring.length >= 4 && Math.abs(ringSignedArea(ring)) > 1e-9; }
  function rewindGeometry(g) {
    if (!g) return;
    if (g.type === 'Polygon') { rewindPolygon(g.coordinates); }
    else if (g.type === 'MultiPolygon') {
      // drop degenerate sub-polygons (zero-area slivers read as a filled hemisphere)
      g.coordinates = g.coordinates.filter(poly => validRing(poly[0]));
      g.coordinates.forEach(rewindPolygon);
    }
  }

  let geoLoadToken = 0;
  const geoCache = {};   // processed FeatureCollections keyed by URL — snapshots swap instantly once seen
  function applyGeometry(geo) {
    state.geo = geo;
    fitProjection();
    renderGeometry(); colorLand(); renderBattles(); renderCities();
    updateLegend(); renderWorld();
  }
  function loadGeometryAndRender() {
    const url = E.geoSourceFor(war, state.year);
    const nameProp = E.geoNameProp(war);
    state.geoUrl = url;
    if (geoCache[url]) { applyGeometry(geoCache[url]); return; }
    const myToken = ++geoLoadToken;   // ignore a slow load if the war/year moved on meanwhile
    d3.json(url).then(geo => {
      if (myToken !== geoLoadToken) return;
      if (war.geo && war.geo.exclude) geo.features = geo.features.filter(f => !war.geo.exclude.includes(f.properties[nameProp]));
      if (war.geo && war.geo.rewind) geo.features.forEach(f => rewindGeometry(f.geometry));
      geoCache[url] = geo;
      applyGeometry(geo);
    }).catch(() => { if (myToken === geoLoadToken) document.getElementById('map').innerHTML = '<p style="font-family:var(--ui);padding:40px;color:var(--muted)">The map needs internet access to load the historical basemap (CDN).</p>'; });
  }

  function boot() {
    buildMap();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', reTheme);
    wireSearch(); wireMenus(); wireTimeline(); wireShellChrome();
    applyWarChrome();
    loadGeometryAndRender();
    setTimeout(() => { document.getElementById('hint').style.opacity = 1; }, 200);
  }

  /* Sidebar-shell chrome: collapse the rail, toggle the mobile slide-over. */
  function wireShellChrome() {
    const appEl = document.getElementById('app');
    document.getElementById('collapse-btn').onclick = () => appEl.classList.toggle('collapsed');
    document.getElementById('menu-btn').onclick = () => appEl.classList.toggle('nav-open');
    document.getElementById('scrim').onclick = () => appEl.classList.remove('nav-open');
  }

  function wireTimeline() {
    document.getElementById('yearslider').addEventListener('input', e => setYear(+e.target.value));
    document.getElementById('yearinput').addEventListener('change', e => setYear(+e.target.value));
    document.getElementById('prev').onclick = () => setYear(state.year - 1);
    document.getElementById('next').onclick = () => setYear(state.year + 1);
    document.getElementById('play').onclick = togglePlay;
    document.getElementById('reset').onclick = resetZoom;
    document.getElementById('overview-btn').onclick = () => { clearRailSelection(); state.activeTab = 'overview'; openRail(); renderRail(); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
