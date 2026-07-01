/* Life Explorer — topic: the Animal Cell in 3-D.
   A `kind:'embed'` topic: it embeds an interactive 3-D animal-cell model (hosted
   on Sketchfab under CC-BY, with attribution) as the canvas, while the info rail
   keeps the organelle glossary and quizzes beside it. Reuses the 2-D cell's
   `parts` so the two topics stay in sync. Loads AFTER data/cell.js.           */
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
    id: 'cell-3d', name: 'Animal Cell (3-D)', short: 'Cell 3-D', kind: 'embed', icon: '🧫', hideLegend: true,
    tagline: 'An interactive 3-D model',
    intro: 'Drag to rotate the cell and scroll to zoom for a close look at the organelles. Open the Parts tab to read what each one does. This 3-D model is embedded from Sketchfab under a Creative Commons licence.',
    embedSrc: 'https://sketchfab.com/models/737b35f5b779418998d834c28ed15295/embed?autostart=1&ui_theme=dark&ui_hint=0',
    embedTitle: 'Animal Cell',
    credit: {
      text: 'Animal Cell', author: 'James_Anthony', license: 'CC BY',
      authorUrl: 'https://sketchfab.com/James_Anthony',
      modelUrl: 'https://sketchfab.com/3d-models/animal-cell-737b35f5b779418998d834c28ed15295'
    },
    categories: cell.categories || {}, parts, quizzes
  };
})();
