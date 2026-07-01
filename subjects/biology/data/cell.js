/* Life Explorer — topic: the Animal Cell.
   PURE DATA in the shape the biology explorer expects. Registers on
   window.BIO.topics. `kind:'diagram'` means the explorer injects `svg` into the
   stage and wires every element carrying a data-part attribute to open the rail
   for the matching entry in `parts`.                                           */
(function () {
  window.BIO = window.BIO || { topics: {} };

  const parts = [
    { id: 'cell-membrane', name: 'Cell membrane', category: 'structure',
      summary: 'The thin outer boundary of the cell — a double layer of phospholipids that controls what enters and leaves.',
      functions: ['Separates the cell from its surroundings', 'Controls the movement of substances in and out', 'Carries receptors that sense the environment'],
      facts: [['Also called', 'Plasma membrane'], ['Made of', 'Phospholipid bilayer'], ['Property', 'Selectively permeable']],
      analogy: 'Like a security gate that decides who gets in and out.', related: ['cytoplasm', 'nucleus'] },
    { id: 'cytoplasm', name: 'Cytoplasm', category: 'structure',
      summary: 'The jelly-like fluid that fills the cell and holds the organelles in place, where many reactions happen.',
      functions: ['Suspends and cushions the organelles', 'Site of many chemical reactions', 'Helps move materials around the cell'],
      facts: [['Mostly', 'Water (~80%)'], ['Contains', 'Salts, enzymes, nutrients']],
      analogy: 'The water in an aquarium that everything floats in.', related: ['cell-membrane', 'ribosomes'] },
    { id: 'nucleus', name: 'Nucleus', category: 'control',
      summary: 'The control centre of the cell. It stores the DNA and directs all of the cell’s activities.',
      functions: ['Stores the genetic material (DNA)', 'Controls growth, metabolism and reproduction', 'Sends instructions to build proteins'],
      facts: [['Contains', 'Chromosomes (DNA)'], ['Wrapped in', 'Nuclear envelope'], ['Usually', 'One per cell']],
      analogy: 'The head office where all the decisions are made.', related: ['nucleolus', 'ribosomes'] },
    { id: 'nucleolus', name: 'Nucleolus', category: 'control',
      summary: 'A dense region inside the nucleus that manufactures ribosomes.',
      functions: ['Makes and assembles ribosomes', 'Produces ribosomal RNA (rRNA)'],
      facts: [['Location', 'Inside the nucleus'], ['Builds', 'Ribosomes']],
      analogy: 'The office within head office that hires the factory workers.', related: ['nucleus', 'ribosomes'] },
    { id: 'mitochondria', name: 'Mitochondria', category: 'energy',
      summary: 'The powerhouse of the cell — it releases energy from food through respiration.',
      functions: ['Releases energy as ATP through cellular respiration', 'Supplies power for all cell activities'],
      facts: [['Nickname', 'Powerhouse of the cell'], ['Makes', 'ATP (energy)'], ['Has its own', 'DNA']],
      analogy: 'The power station that keeps the lights on everywhere.', related: ['cytoplasm'] },
    { id: 'ribosomes', name: 'Ribosomes', category: 'manufacturing',
      summary: 'Tiny machines, free-floating or on the rough ER, that build proteins from amino acids.',
      functions: ['Read genetic instructions (mRNA)', 'Assemble amino acids into proteins'],
      facts: [['Job', 'Protein synthesis'], ['Made by', 'The nucleolus'], ['Size', 'Extremely small']],
      analogy: 'Workers on an assembly line snapping parts together.', related: ['rough-er', 'nucleolus'] },
    { id: 'rough-er', name: 'Rough endoplasmic reticulum', category: 'manufacturing',
      summary: 'A folded membrane network studded with ribosomes that processes and folds newly made proteins.',
      functions: ['Folds and modifies proteins', 'Transports proteins toward the Golgi'],
      facts: [['“Rough” because', 'Covered in ribosomes'], ['Connects to', 'The nuclear envelope']],
      analogy: 'A packing line that finishes and forwards new products.', related: ['ribosomes', 'golgi'] },
    { id: 'smooth-er', name: 'Smooth endoplasmic reticulum', category: 'manufacturing',
      summary: 'A membrane network without ribosomes that makes lipids and helps detoxify the cell.',
      functions: ['Synthesises lipids and fats', 'Detoxifies chemicals', 'Stores calcium ions'],
      facts: [['“Smooth” because', 'No ribosomes'], ['Makes', 'Lipids']],
      analogy: 'A chemical plant next door to the packing line.', related: ['rough-er'] },
    { id: 'golgi', name: 'Golgi apparatus', category: 'manufacturing',
      summary: 'A stack of flattened sacs that packages proteins and ships them to their destinations.',
      functions: ['Modifies, sorts and packages proteins', 'Ships products in vesicles inside or outside the cell'],
      facts: [['Also called', 'Golgi body / complex'], ['Shape', 'Stacked flattened sacs']],
      analogy: 'The post office that wraps and mails parcels.', related: ['rough-er', 'lysosome'] },
    { id: 'lysosome', name: 'Lysosome', category: 'cleanup',
      summary: 'A sac of digestive enzymes that breaks down waste, debris and worn-out parts.',
      functions: ['Digests food particles and waste', 'Recycles worn-out organelles', 'Destroys invading bacteria'],
      facts: [['Contains', 'Digestive enzymes'], ['Nickname', 'The cell’s stomach']],
      analogy: 'The recycling and clean-up crew.', related: ['golgi', 'vacuole'] },
    { id: 'vacuole', name: 'Vacuole', category: 'storage',
      summary: 'A storage sac holding water, nutrients or waste. Small in animal cells, large in plant cells.',
      functions: ['Stores water, food and waste', 'Helps maintain internal pressure'],
      facts: [['In animal cells', 'Small and many'], ['In plant cells', 'One large central vacuole']],
      analogy: 'A storage cupboard or water tank.', related: ['lysosome'] },
    { id: 'centrosome', name: 'Centrosome', category: 'structure',
      summary: 'Organises microtubules and pulls chromosomes apart when the cell divides.',
      functions: ['Organises the cell’s skeleton (microtubules)', 'Directs chromosome separation during division'],
      facts: [['Contains', 'A pair of centrioles'], ['Active during', 'Cell division']],
      analogy: 'The scaffolding crew during a big rebuild.', related: ['nucleus'] },
  ];

  /* ---- diagram ---------------------------------------------------------- */
  /* A schematic animal cell. Every organelle is a <g class="part cat-…"
     data-part="id"> so a click anywhere in the group (shape or label) selects
     it. Fills come from category classes in the biology stylesheet.           */
  const L = (x, y, t, anchor) => `<text class="plabel" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${t}</text>`;
  const svg = `
  <svg viewBox="0 0 840 600" xmlns="http://www.w3.org/2000/svg" class="bio-diagram" role="img" aria-label="Animal cell diagram">
    <!-- membrane + cytoplasm -->
    <g class="part cat-structure" data-part="cytoplasm">
      <ellipse class="shape" cx="420" cy="300" rx="392" ry="272"/>
    </g>
    <g class="part cat-structure" data-part="cell-membrane">
      <ellipse class="shape hollow" cx="420" cy="300" rx="400" ry="280"/>
      <ellipse class="shape hollow inner" cx="420" cy="300" rx="388" ry="268"/>
      ${L(420, 44, 'Cell membrane')}
    </g>

    <!-- nucleus -->
    <g class="part cat-control" data-part="nucleus">
      <ellipse class="shape" cx="440" cy="290" rx="132" ry="116"/>
      <ellipse class="shape hollow inner2" cx="440" cy="290" rx="120" ry="104"/>
      ${L(440, 200, 'Nucleus')}
    </g>
    <g class="part cat-control" data-part="nucleolus">
      <circle class="shape" cx="466" cy="300" r="38"/>
      ${L(466, 305, 'Nucleolus')}
    </g>

    <!-- rough ER (left of nucleus) with ribosome dots -->
    <g class="part cat-manufacturing" data-part="rough-er">
      <path class="shape stroke" d="M300 210 q-46 26 0 52 q46 26 0 52 q-46 26 0 52"/>
      <path class="shape stroke" d="M330 206 q-46 26 0 52 q46 26 0 52 q-46 26 0 52"/>
      <g class="dots"><circle r="4" cx="300" cy="210"/><circle r="4" cx="300" cy="262"/><circle r="4" cx="300" cy="314"/><circle r="4" cx="330" cy="206"/><circle r="4" cx="330" cy="258"/><circle r="4" cx="330" cy="310"/></g>
      ${L(250, 196, 'Rough ER', 'end')}
    </g>

    <!-- smooth ER (right of nucleus) -->
    <g class="part cat-manufacturing" data-part="smooth-er">
      <path class="shape stroke" d="M600 226 q44 22 0 46 q-44 22 0 46 q44 22 0 46"/>
      <path class="shape stroke" d="M624 232 q44 22 0 46 q-44 22 0 46"/>
      ${L(648, 214, 'Smooth ER', 'start')}
    </g>

    <!-- golgi (lower left) -->
    <g class="part cat-manufacturing" data-part="golgi">
      <path class="shape stroke thick" d="M232 452 q70 -34 140 0"/>
      <path class="shape stroke thick" d="M240 466 q64 -30 124 0"/>
      <path class="shape stroke thick" d="M248 480 q58 -26 108 0"/>
      <path class="shape stroke thick" d="M256 494 q52 -22 92 0"/>
      ${L(302, 524, 'Golgi apparatus')}
    </g>

    <!-- mitochondria (two) -->
    <g class="part cat-energy" data-part="mitochondria">
      <g transform="translate(628 168) rotate(24)">
        <ellipse class="shape" cx="0" cy="0" rx="64" ry="34"/>
        <path class="shape crista" d="M-48 -6 q12 -18 24 0 q12 18 24 0 q12 -18 24 0 q12 18 24 0"/>
      </g>
      <g transform="translate(452 486) rotate(-12)">
        <ellipse class="shape" cx="0" cy="0" rx="58" ry="30"/>
        <path class="shape crista" d="M-42 -4 q11 -16 22 0 q11 16 22 0 q11 -16 22 0 q11 16 22 0"/>
      </g>
      ${L(690, 150, 'Mitochondria', 'start')}
    </g>

    <!-- free ribosomes -->
    <g class="part cat-manufacturing" data-part="ribosomes">
      <g class="dots big"><circle r="6" cx="200" cy="360"/><circle r="6" cx="222" cy="376"/><circle r="6" cx="186" cy="392"/><circle r="6" cx="560" cy="430"/><circle r="6" cx="582" cy="444"/><circle r="6" cx="548" cy="452"/></g>
      ${L(190, 348, 'Ribosomes', 'middle')}
    </g>

    <!-- lysosome -->
    <g class="part cat-cleanup" data-part="lysosome">
      <circle class="shape" cx="180" cy="250" r="30"/>
      <g class="dots"><circle r="3" cx="172" cy="244"/><circle r="3" cx="186" cy="250"/><circle r="3" cx="178" cy="258"/></g>
      ${L(180, 300, 'Lysosome')}
    </g>

    <!-- vacuole -->
    <g class="part cat-storage" data-part="vacuole">
      <circle class="shape" cx="660" cy="404" r="46"/>
      <circle class="shape hollow inner" cx="660" cy="404" r="38"/>
      ${L(660, 470, 'Vacuole')}
    </g>

    <!-- centrosome -->
    <g class="part cat-structure" data-part="centrosome">
      <rect class="shape" x="236" y="150" width="30" height="12" rx="3"/>
      <rect class="shape" x="248" y="166" width="12" height="30" rx="3"/>
      ${L(196, 150, 'Centrosome', 'end')}
    </g>
  </svg>`;

  /* ---- quizzes ---------------------------------------------------------- */
  const quizzes = [
    { type: 'click', prompt: 'Click the powerhouse of the cell.', answerId: 'mitochondria',
      feedback: { correct: 'Correct — mitochondria release energy as ATP.', incorrect: 'Not that one — look for the bean-shaped organelle with folds.' } },
    { type: 'multiple-choice', prompt: 'Which organelle stores the cell’s DNA?', options: ['Golgi apparatus', 'Nucleus', 'Lysosome', 'Ribosome'], answer: 'Nucleus',
      feedback: { correct: 'Right — the nucleus is the control centre and holds the DNA.', incorrect: 'The DNA lives in the cell’s control centre.' } },
    { type: 'click', prompt: 'Click the organelle that packages and ships proteins.', answerId: 'golgi',
      feedback: { correct: 'Correct — the Golgi apparatus is the cell’s post office.', incorrect: 'Look for the stack of flattened sacs.' } },
    { type: 'multiple-choice', prompt: 'What builds proteins in the cell?', options: ['Mitochondria', 'Vacuole', 'Ribosomes', 'Centrosome'], answer: 'Ribosomes',
      feedback: { correct: 'Correct — ribosomes assemble amino acids into proteins.', incorrect: 'Think of the tiny machines on the rough ER.' } },
    { type: 'click', prompt: 'Click the structure that controls what enters and leaves the cell.', answerId: 'cell-membrane',
      feedback: { correct: 'Correct — the cell membrane is selectively permeable.', incorrect: 'Look at the very edge of the cell.' } },
  ];

  window.BIO.topics['cell'] = {
    id: 'cell', name: 'Animal Cell', short: 'Cell', kind: 'diagram', icon: '🔬',
    tagline: 'The building block of life',
    intro: 'Every animal is built from trillions of cells. Each cell is a tiny, self-contained factory whose organelles each do a special job. Click any part of the diagram to learn what it does.',
    categories: {
      control: 'Control', energy: 'Energy', manufacturing: 'Manufacturing',
      storage: 'Storage', cleanup: 'Cleanup', structure: 'Structure'
    },
    viewBox: '0 0 840 600', svg, parts, quizzes
  };
})();
