/* Life Explorer — topic: the Animal Cell in 3-D.
   A `kind:'embed'` topic: it embeds an interactive 3-D cell model (hosted on
   Sketchfab, with attribution) as the canvas, while the info rail keeps the
   organelle glossary and quizzes beside it. Reuses the 2-D cell's `parts` so the
   two topics stay in sync. Loads AFTER data/cell.js.                          */
(function () {
  window.BIO = window.BIO || { topics: {} };
  const cell = window.BIO.topics['cell'] || {};
  const parts = cell.parts || [];
  // The 3-D model isn't click-mapped to the rail, so keep only the questions
  // that don't require clicking the diagram (multiple-choice).
  const quizzes = (cell.quizzes || []).filter(q => q.type === 'multiple-choice').concat([
    { type: 'multiple-choice', prompt: 'Which organelle is the “powerhouse of the cell”?', options: ['Ribosome', 'Mitochondrion', 'Vacuole', 'Golgi apparatus'], answer: 'Mitochondrion',
      feedback: { correct: 'Correct — mitochondria release energy as ATP.', incorrect: 'It releases energy from food.' } },
    { type: 'multiple-choice', prompt: 'Where in the cell are proteins packaged and shipped?', options: ['Nucleus', 'Golgi apparatus', 'Lysosome', 'Cytoplasm'], answer: 'Golgi apparatus',
      feedback: { correct: 'Correct — the Golgi apparatus is the cell’s post office.', incorrect: 'Think of the stack of flattened sacs.' } },
  ]);

  window.BIO.topics['cell-3d'] = {
    id: 'cell-3d', name: 'Cell in 3-D', short: 'Cell 3-D', kind: 'embed', icon: '🧫', hideLegend: true,
    tagline: 'An interactive 3-D model',
    intro: 'Drag to rotate the cell, scroll to zoom, and press play to watch it animate. Open the Parts tab to read about each organelle. This model — “Human Cell Animation” by flarar-01 — is embedded from Sketchfab.',
    embedSrc: 'https://sketchfab.com/models/c09821843c7147dcb97c227be12a2357/embed',
    embedTitle: 'Human Cell Animation',
    credit: {
      text: 'Human Cell Animation', author: 'flarar-01',
      authorUrl: 'https://sketchfab.com/flarar',
      modelUrl: 'https://sketchfab.com/3d-models/human-cell-animation-c09821843c7147dcb97c227be12a2357'
    },
    categories: cell.categories || {}, parts, quizzes
  };
})();
