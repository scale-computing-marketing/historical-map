/* Life Explorer — topic: Plant Cell (interactive, owned model).
   A `kind:'model3d'` topic rendering a licensed GLB (converted from a purchased
   CGTrader model) with Google <model-viewer> and clickable hotspots wired to the
   info rail. The .glb is gitignored (licensed asset — not redistributed); for
   production, host it privately and point `modelSrc` at that URL.
   Reuses the plant-cell glossary + quizzes. Loads AFTER data/plant-cell-3d.js. */
(function () {
  window.BIO = window.BIO || { topics: {} };
  const plant = window.BIO.topics['plant-cell-3d'] || {};
  const parts = plant.parts || [];
  const quizzes = (plant.quizzes || []).filter(q => q.type === 'multiple-choice');

  window.BIO.topics['plant-cell-model'] = {
    id: 'plant-cell-model', name: 'Plant Cell (interactive)', short: 'Plant 3-D', kind: 'model3d',
    icon: '🌿', hideLegend: true, autoRotate: false, tagline: 'Owned 3-D model with clickable hotspots',
    intro: 'A real 3-D plant cell you can rotate and zoom — the “own the model” route. Click a marker to open that structure’s details. Model licensed from CGTrader.',
    modelSrc: 'assets/plant-cell.glb',
    credit: { text: 'Plant Cell', author: 'licensed via CGTrader', license: '', modelUrl: 'https://www.cgtrader.com/3d-models/science/medical/plant-cell-14840ad4-6392-41e2-a51d-e89d6e8e5b6d' },
    // Positions captured from the model's named organelle objects (OBJ centroids;
    // OBJ coords map 1:1 to model space). normal "0 1 0" for the cutaway top.
    hotspots: [
      { partId: 'cell-wall', position: '0.0 -0.16 0.50', normal: '0 0 1' },
      { partId: 'cell-membrane', position: '0.34 0.05 0.30', normal: '0 1 0' },
      { partId: 'nucleus', position: '-0.20 0.15 -0.70', normal: '0 1 0' },
      { partId: 'nucleolus', position: '-0.066 0.09 -0.72', normal: '0 1 0' },
      { partId: 'vacuole', position: '0.233 0.08 0.111', normal: '0 1 0' },
      { partId: 'chloroplast', position: '0.542 0.09 0.248', normal: '0 1 0' },
      { partId: 'mitochondria', position: '0.270 0.03 0.462', normal: '0 1 0' },
      { partId: 'golgi', position: '-0.275 0.07 0.312', normal: '0 1 0' },
      { partId: 'rough-er', position: '-0.128 0.08 -0.40', normal: '0 1 0' },
      { partId: 'smooth-er', position: '0.356 0.05 -0.84', normal: '0 1 0' },
      { partId: 'ribosomes', position: '0.046 0.03 -0.078', normal: '0 1 0' }
    ],
    categories: plant.categories || {}, parts, quizzes
  };
})();
