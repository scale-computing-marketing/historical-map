/* Life Explorer — Biology · the knowledge graph (concept nodes).
   This is the curriculum's spine: concepts and their prerequisites across the
   twelve units, from "what is life?" to biotechnology. Units are labels for
   layout & recommendation; what actually gates a concept is `prereqs`.

   Concepts with `lesson:true` have an authored interactive lesson (see
   data/lessons-*.js); the rest render on the map as "unlocked, coming soon" so
   the whole path is visible and future-proof. `explore:'<topicId>'` links a
   concept to one of the original Life-Explorer diagrams/models it reuses.

   Add a concept here → it appears on the map. Author its lesson keyed by the same
   id → it becomes playable. No engine edits needed.                            */
(function () {
  const add = window.BIO.Graph.add;

  /* ---- Unit 1 · What Is Life? ---- */
  add({ id: 'characteristics', name: 'Characteristics of Life', unit: '1', strand: 'foundations', lesson: true, prereqs: [], blurb: 'What makes something alive?', components: ['sortCards', 'problemSet'] });
  add({ id: 'scientific-method', name: 'The Scientific Method', unit: '1', strand: 'foundations', lesson: true, prereqs: [], blurb: 'How scientists ask and answer questions.', components: ['orderList'] });
  add({ id: 'levels-org', name: 'Levels of Organization', unit: '1', strand: 'foundations', lesson: true, prereqs: ['characteristics'], blurb: 'From atoms to the biosphere.', components: ['orderList'] });

  /* ---- Unit 2 · Cells ---- */
  add({ id: 'cell-theory', name: 'Cell Theory', unit: '2', strand: 'cells', lesson: true, prereqs: ['characteristics'], blurb: 'All life is made of cells.', components: ['orderList', 'problemSet'] });
  add({ id: 'prokaryote-eukaryote', name: 'Prokaryotes & Eukaryotes', unit: '2', strand: 'cells', lesson: true, prereqs: ['cell-theory'], blurb: 'Two kinds of cell — with or without a nucleus.', components: ['sortCards'] });
  add({ id: 'organelles', name: 'Cell Organelles', unit: '2', strand: 'cells', lesson: true, prereqs: ['cell-theory'], explore: 'cell', blurb: 'The tiny organs that run the cell.', components: ['diagramExplore', 'matchPairs', 'labelHunt'] });
  add({ id: 'plant-vs-animal', name: 'Plant vs Animal Cells', unit: '2', strand: 'cells', lesson: true, prereqs: ['organelles'], explore: 'plant-cell', blurb: 'What plants have that animals don’t.', components: ['diagramExplore', 'sortCards'] });
  add({ id: 'membrane', name: 'The Cell Membrane', unit: '2', strand: 'cells', lesson: true, prereqs: ['organelles'], blurb: 'The gatekeeper of the cell.', components: ['problemSet'] });

  /* ---- Unit 3 · Cell Processes ---- */
  add({ id: 'diffusion-osmosis', name: 'Diffusion & Osmosis', unit: '3', strand: 'processes', lesson: true, prereqs: ['membrane'], blurb: 'How things move in and out of cells.', components: ['simSlider', 'problemSet'] });
  add({ id: 'photosynthesis', name: 'Photosynthesis', unit: '3', strand: 'processes', lesson: true, prereqs: ['organelles'], blurb: 'How plants turn light into food.', components: ['simSlider'] });
  add({ id: 'respiration', name: 'Cellular Respiration', unit: '3', strand: 'processes', lesson: true, prereqs: ['organelles'], blurb: 'Releasing energy from food.', components: ['simSlider', 'matchPairs'] });
  add({ id: 'protein-synthesis', name: 'Protein Synthesis', unit: '3', strand: 'processes', prereqs: ['dna'], blurb: 'Reading genes to build proteins.' });

  /* ---- Unit 4 · Cell Division ---- */
  add({ id: 'cell-cycle', name: 'The Cell Cycle', unit: '4', strand: 'division', prereqs: ['organelles'], blurb: 'How and when cells copy themselves.' });
  add({ id: 'mitosis', name: 'Mitosis', unit: '4', strand: 'division', prereqs: ['cell-cycle'], blurb: 'One cell becomes two identical cells.' });
  add({ id: 'meiosis', name: 'Meiosis', unit: '4', strand: 'division', prereqs: ['mitosis'], blurb: 'Making sex cells with half the DNA.' });
  add({ id: 'cancer', name: 'Cancer', unit: '4', strand: 'division', prereqs: ['cell-cycle'], blurb: 'When cell division goes wrong.' });

  /* ---- Unit 5 · Genetics ---- */
  add({ id: 'dna', name: 'DNA Structure', unit: '5', strand: 'genetics', lesson: true, prereqs: ['organelles'], blurb: 'The double helix that codes for life.', components: ['buildSequence', 'problemSet'] });
  add({ id: 'genes-chromosomes', name: 'Genes & Chromosomes', unit: '5', strand: 'genetics', prereqs: ['dna'], blurb: 'How DNA is packaged and read.' });
  add({ id: 'inheritance', name: 'Inheritance & Punnett Squares', unit: '5', strand: 'genetics', lesson: true, prereqs: ['dna'], explore: 'genetics', blurb: 'Predicting traits from parents.', components: ['punnettCross', 'problemSet'] });
  add({ id: 'mutations', name: 'Mutations', unit: '5', strand: 'genetics', prereqs: ['dna'], blurb: 'Changes in the genetic code.' });

  /* ---- Unit 6 · Evolution ---- */
  add({ id: 'natural-selection', name: 'Natural Selection', unit: '6', strand: 'evolution', lesson: true, prereqs: ['inheritance'], blurb: 'Survival of the best-suited.', components: ['simSlider', 'problemSet'] });
  add({ id: 'adaptation', name: 'Adaptation', unit: '6', strand: 'evolution', prereqs: ['natural-selection'], blurb: 'Traits that fit an environment.' });
  add({ id: 'speciation', name: 'Speciation', unit: '6', strand: 'evolution', prereqs: ['natural-selection'], blurb: 'How new species arise.' });
  add({ id: 'evidence-evolution', name: 'Evidence of Evolution', unit: '6', strand: 'evolution', prereqs: ['natural-selection'], blurb: 'Fossils, DNA and homology.' });

  /* ---- Unit 7 · Classification ---- */
  add({ id: 'taxonomy', name: 'Classification & Taxonomy', unit: '7', strand: 'classification', lesson: true, prereqs: ['characteristics'], explore: 'tree-of-life', blurb: 'Sorting life into a branching tree.', components: ['diagramExplore', 'orderList', 'sortCards'] });
  add({ id: 'domains-kingdoms', name: 'Domains & Kingdoms', unit: '7', strand: 'classification', prereqs: ['taxonomy'], blurb: 'The biggest branches of life.' });
  add({ id: 'phylogenetics', name: 'Phylogenetic Trees', unit: '7', strand: 'classification', prereqs: ['taxonomy', 'evidence-evolution'], blurb: 'Reading evolutionary relationships.' });

  /* ---- Unit 8 · Ecology ---- */
  add({ id: 'food-chains', name: 'Food Chains & Webs', unit: '8', strand: 'ecology', lesson: true, prereqs: ['characteristics'], blurb: 'Who eats whom, and energy flow.', components: ['foodChain', 'problemSet'] });
  add({ id: 'energy-flow', name: 'Energy Flow', unit: '8', strand: 'ecology', prereqs: ['food-chains'], blurb: 'The 10% rule and trophic levels.' });
  add({ id: 'biomes', name: 'Biomes', unit: '8', strand: 'ecology', prereqs: ['food-chains'], blurb: 'The great ecosystems of Earth.' });
  add({ id: 'populations', name: 'Population Growth', unit: '8', strand: 'ecology', lesson: true, prereqs: ['food-chains'], blurb: 'Booms, crashes and carrying capacity.', components: ['simSlider'] });

  /* ---- Unit 9 · Human Body ---- */
  add({ id: 'organ-systems', name: 'Organs & Systems', unit: '9', strand: 'anatomy', lesson: true, prereqs: ['levels-org'], explore: 'body-systems', blurb: 'The teams of organs that keep you alive.', components: ['diagramExplore', 'matchPairs', 'labelHunt'] });
  add({ id: 'circulatory', name: 'Circulatory System', unit: '9', strand: 'anatomy', prereqs: ['organ-systems'], blurb: 'The heart and blood highway.' });
  add({ id: 'respiratory-sys', name: 'Respiratory System', unit: '9', strand: 'anatomy', prereqs: ['organ-systems'], blurb: 'Breathing and gas exchange.' });
  add({ id: 'nervous-sys', name: 'Nervous System', unit: '9', strand: 'anatomy', prereqs: ['organ-systems'], blurb: 'The body’s signalling network.' });
  add({ id: 'digestive-sys', name: 'Digestive System', unit: '9', strand: 'anatomy', prereqs: ['organ-systems'], blurb: 'Turning food into fuel.' });

  /* ---- Unit 10 · Plants ---- */
  add({ id: 'plant-anatomy', name: 'Plant Anatomy', unit: '10', strand: 'plants', prereqs: ['plant-vs-animal'], blurb: 'Roots, stems, leaves and flowers.' });
  add({ id: 'plant-transport', name: 'Water Transport', unit: '10', strand: 'plants', prereqs: ['plant-anatomy', 'diffusion-osmosis'], blurb: 'How water climbs a tree.' });
  add({ id: 'plant-reproduction', name: 'Plant Reproduction', unit: '10', strand: 'plants', prereqs: ['plant-anatomy'], blurb: 'Pollination, seeds and fruit.' });

  /* ---- Unit 11 · Microbiology ---- */
  add({ id: 'bacteria', name: 'Bacteria', unit: '11', strand: 'microbiology', prereqs: ['prokaryote-eukaryote'], blurb: 'The most abundant life on Earth.' });
  add({ id: 'viruses', name: 'Viruses', unit: '11', strand: 'microbiology', prereqs: ['bacteria'], blurb: 'Are they even alive?' });
  add({ id: 'fungi-protists', name: 'Fungi & Protists', unit: '11', strand: 'microbiology', prereqs: ['prokaryote-eukaryote'], blurb: 'The other microscopic kingdoms.' });
  add({ id: 'disease', name: 'Disease & Immunity', unit: '11', strand: 'microbiology', prereqs: ['bacteria', 'viruses'], blurb: 'How the body fights back.' });

  /* ---- Unit 12 · Biotechnology ---- */
  add({ id: 'dna-sequencing', name: 'DNA Sequencing', unit: '12', strand: 'biotechnology', prereqs: ['dna'], blurb: 'Reading the code of life.' });
  add({ id: 'crispr', name: 'CRISPR Gene Editing', unit: '12', strand: 'biotechnology', prereqs: ['dna-sequencing', 'mutations'], blurb: 'Rewriting genes with precision.' });
  add({ id: 'genetic-engineering', name: 'Genetic Engineering', unit: '12', strand: 'biotechnology', prereqs: ['crispr'], blurb: 'Designing organisms — and the ethics.' });
  add({ id: 'stem-cells', name: 'Stem Cells', unit: '12', strand: 'biotechnology', prereqs: ['cell-cycle'], blurb: 'Cells that can become anything.' });
})();
