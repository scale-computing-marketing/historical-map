/* Life Explorer — Biology · Unit 3 lessons (Cell Processes).
   The showcase for `simSlider`: drag a variable and watch life respond, then the
   Discover step names the process you just drove. Registered on BIO.Player.     */
(function () {
  const P = window.BIO.Player;
  const reg = P.register;

  reg({
    concept: 'diffusion-osmosis', title: 'Diffusion & Osmosis',
    hook: { emoji: '💧', text: 'Drop food colouring in still water and it spreads on its own — no stirring needed.', sub: 'The same invisible force decides whether a cell swells, shrinks or stays just right.' },
    steps: [
      { kind: 'explore', title: 'Balance the cell', intro: 'A cell sits in salty water. Its inside is 50% salt. Change the salt outside and watch water move.', component: 'simSlider', config: {
        prompt: 'Water always moves toward the saltier side. Find the setting where water stops moving.',
        vars: [{ id: 'outside', label: 'Salt outside', min: 0, max: 100, step: 5, value: 90, unit: '%' }],
        outputs: [
          { id: 'out', label: 'Water leaving cell', unit: '%', color: '#c85b5b', max: 50, fn: v => Math.max(0, v.outside - 50) },
          { id: 'in', label: 'Water entering cell', unit: '%', color: '#3f8ea5', max: 50, fn: v => Math.max(0, 50 - v.outside) }
        ],
        viz: v => v.outside > 55 ? '🥀 cell shrinking' : v.outside < 45 ? '🎈 cell swelling' : '🟢 balanced',
        goal: { text: 'Make the water stop moving (an isotonic balance).', done: 'Balanced! Salt inside = salt outside, so water flow stops.', test: v => Math.abs(v.outside - 50) <= 5 }
      } },
      { kind: 'discover', title: 'Water follows the salt', text: '<b>Diffusion</b> is particles spreading from where they’re crowded to where they’re sparse. <b>Osmosis</b> is diffusion of <i>water</i> across a membrane — water moves toward the saltier (more concentrated) side. Too salty outside and the cell loses water and shrinks; too pure outside and it swells.', rule: 'Osmosis: water moves from low → high solute concentration' },
      { kind: 'practice', difficulty: 'easy', title: 'What happens to the cell?', component: 'matchPairs', config: {
        prompt: 'Match each surrounding solution to what happens to the cell.',
        pairs: [
          { left: 'Hypertonic (saltier outside)', right: 'Water leaves — cell shrinks' },
          { left: 'Hypotonic (purer outside)', right: 'Water enters — cell swells' },
          { left: 'Isotonic (equal)', right: 'No net movement — cell unchanged' }
        ] } },
      { kind: 'mastery', title: 'Movement check', component: 'problemSet', config: { problems: [
        { prompt: 'Diffusion moves particles from ___ to ___ concentration.', answer: 'high, low', choices: ['high, low', 'low, high', 'cold, hot'], hint: 'They spread out to fill space.' },
        { prompt: 'Osmosis is specifically the diffusion of…', answer: 'water', choices: ['water', 'salt', 'oxygen'], hint: 'It’s about the solvent.' },
        { prompt: 'A cell placed in very salty water will…', answer: 'shrink', choices: ['shrink', 'swell', 'stay the same'], hint: 'Water leaves toward the salt.' },
        { prompt: 'Neither diffusion nor osmosis needs the cell to spend…', answer: 'energy', choices: ['energy', 'water', 'time'], hint: 'They’re “passive” transport.' }
      ] } }
    ]
  });

  reg({
    concept: 'photosynthesis', title: 'Photosynthesis',
    hook: { emoji: '🌱', text: 'A tree is built almost entirely out of thin air — carbon pulled from the sky and stitched together using sunlight.', sub: 'What does a plant actually need to make its food?' },
    steps: [
      { kind: 'explore', title: 'Grow the plant', intro: 'Adjust light, water and CO₂ to maximise the oxygen and sugar the plant makes.', component: 'simSlider', config: {
        prompt: 'One input is holding the plant back. Find it and turn it up.',
        vars: [
          { id: 'light', label: 'Sunlight', min: 0, max: 100, step: 5, value: 90, unit: '%' },
          { id: 'water', label: 'Water', min: 0, max: 100, step: 5, value: 90, unit: '%' },
          { id: 'co2', label: 'Carbon dioxide', min: 0, max: 100, step: 5, value: 20, unit: '%' }
        ],
        outputs: [
          { id: 'sugar', label: 'Glucose made', unit: '', color: '#4f9a54', max: 100, fn: v => Math.round(Math.min(v.light, v.water, v.co2)) },
          { id: 'oxygen', label: 'Oxygen released', unit: '', color: '#3f8ea5', max: 100, fn: v => Math.round(Math.min(v.light, v.water, v.co2)) }
        ],
        viz: (v, o) => (o.oxygen < 30 ? '🥀' : o.oxygen < 70 ? '🌱' : '🌻') + ' ' + '🫧'.repeat(Math.round(o.oxygen / 12)),
        goal: { text: 'Get oxygen output above 80.', done: 'Thriving! With all three inputs high, photosynthesis runs full speed.', test: (v, o) => o.oxygen >= 80 }
      } },
      { kind: 'discover', title: 'Light + water + CO₂ → food', text: 'You found that raising an already-high input did nothing — only the <b>lowest</b> input (the limiting factor) mattered. Inside <b>chloroplasts</b>, plants combine carbon dioxide and water, powered by sunlight, to make glucose and release oxygen.', rule: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂' },
      { kind: 'practice', difficulty: 'easy', title: 'Inputs and outputs', component: 'matchPairs', config: {
        prompt: 'Sort the parts of the photosynthesis equation.',
        pairs: [
          { left: 'Sunlight', right: 'The energy source' },
          { left: 'Carbon dioxide', right: 'Reactant taken in from the air' },
          { left: 'Water', right: 'Reactant drawn up from the roots' },
          { left: 'Glucose', right: 'Product — the plant’s food' },
          { left: 'Oxygen', right: 'Product — released as waste' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Push it to the max', component: 'simSlider', config: {
        prompt: 'Now every input starts low. Balance all three to get oxygen above 90.',
        vars: [
          { id: 'light', label: 'Sunlight', min: 0, max: 100, step: 5, value: 30, unit: '%' },
          { id: 'water', label: 'Water', min: 0, max: 100, step: 5, value: 25, unit: '%' },
          { id: 'co2', label: 'Carbon dioxide', min: 0, max: 100, step: 5, value: 35, unit: '%' }
        ],
        outputs: [{ id: 'oxygen', label: 'Oxygen released', unit: '', color: '#3f8ea5', max: 100, fn: v => Math.round(Math.min(v.light, v.water, v.co2)) }],
        viz: (v, o) => (o.oxygen < 30 ? '🥀' : o.oxygen < 70 ? '🌱' : '🌻') + ' ' + '🫧'.repeat(Math.round(o.oxygen / 12)),
        goal: { text: 'Oxygen above 90 — all three inputs must be high.', done: 'Maxed out! No single input is limiting the plant now.', test: (v, o) => o.oxygen >= 90 }
      } },
      { kind: 'mastery', title: 'Photosynthesis check', component: 'problemSet', config: { problems: [
        { prompt: 'Photosynthesis happens in which organelle?', answer: 'Chloroplast', choices: ['Chloroplast', 'Mitochondria', 'Nucleus'], hint: 'The green one.' },
        { prompt: 'Which gas does photosynthesis RELEASE?', answer: 'Oxygen', choices: ['Oxygen', 'Carbon dioxide', 'Nitrogen'], hint: 'The gas we breathe in.' },
        { prompt: 'The sugar made by photosynthesis is…', answer: 'Glucose', choices: ['Glucose', 'Protein', 'Starch water'], hint: 'C₆H₁₂O₆.' },
        { prompt: 'If light is plentiful but CO₂ is very low, photosynthesis is limited by…', answer: 'Carbon dioxide', choices: ['Carbon dioxide', 'Light', 'Nothing'], hint: 'The lowest input sets the rate.' }
      ] } }
    ]
  });

  reg({
    concept: 'respiration', title: 'Cellular Respiration',
    hook: { emoji: '🔋', text: 'Your muscles are burning sugar right now — quietly, without a flame — to power everything you do.', sub: 'It’s almost exactly photosynthesis run in reverse.' },
    steps: [
      { kind: 'explore', title: 'Power the cell', intro: 'Mitochondria burn glucose using oxygen to make ATP (energy). Supply both and watch the ATP.', component: 'simSlider', config: {
        prompt: 'Raise glucose and oxygen together to maximise ATP.',
        vars: [
          { id: 'glucose', label: 'Glucose', min: 0, max: 100, step: 5, value: 40, unit: '%' },
          { id: 'oxygen', label: 'Oxygen', min: 0, max: 100, step: 5, value: 30, unit: '%' }
        ],
        outputs: [{ id: 'atp', label: 'ATP (energy) made', unit: '', color: '#e0a52e', max: 100, fn: v => Math.round(Math.min(v.glucose, v.oxygen)) }],
        viz: (v, o) => o.atp < 30 ? '😴' : o.atp < 70 ? '🙂' : '💪⚡',
        goal: { text: 'Get ATP output above 80.', done: 'Fully powered! Plenty of glucose and oxygen means plenty of energy.', test: (v, o) => o.atp >= 80 }
      } },
      { kind: 'discover', title: 'Burning food for energy', text: 'In the <b>mitochondria</b>, glucose reacts with oxygen to release energy stored as <b>ATP</b>, giving off carbon dioxide and water. Notice: the inputs and outputs are the <i>reverse</i> of photosynthesis.', rule: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (ATP)' },
      { kind: 'practice', difficulty: 'easy', title: 'Photosynthesis vs respiration', component: 'matchPairs', config: {
        prompt: 'Which process does each describe?',
        pairs: [
          { left: 'Happens in chloroplasts', right: 'Photosynthesis' },
          { left: 'Happens in mitochondria', right: 'Respiration' },
          { left: 'Uses CO₂, releases O₂', right: 'Photosynthesis' },
          { left: 'Uses O₂, releases CO₂', right: 'Respiration' },
          { left: 'Stores energy in glucose', right: 'Photosynthesis' }
        ] } },
      { kind: 'mastery', title: 'Respiration check', component: 'problemSet', config: { problems: [
        { prompt: 'Cellular respiration takes place mainly in the…', answer: 'Mitochondria', choices: ['Mitochondria', 'Chloroplast', 'Ribosome'], hint: 'The powerhouse.' },
        { prompt: 'The energy molecule cells actually use is…', answer: 'ATP', choices: ['ATP', 'DNA', 'CO₂'], hint: 'Three letters.' },
        { prompt: 'Respiration RELEASES which gas?', answer: 'Carbon dioxide', choices: ['Carbon dioxide', 'Oxygen', 'Hydrogen'], hint: 'What you breathe out.' },
        { prompt: 'Respiration is essentially photosynthesis run…', answer: 'in reverse', choices: ['in reverse', 'twice as fast', 'in the nucleus'], hint: 'Swap the inputs and outputs.' }
      ] } }
    ]
  });
})();
