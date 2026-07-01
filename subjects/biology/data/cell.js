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
  /* A glossy, textbook-style animal cell: a translucent sphere with 3-D shaded
     organelles. Organelles use naturalistic colours (their role is shown in the
     rail and legend, not on the diagram). Every organelle is a
     <g class="part" data-part="id"> the explorer wires to the rail. Decorative
     gloss/labels sit in `.nolabels` groups so they never block a click.        */
  const svg = `
  <svg viewBox="0 0 880 660" xmlns="http://www.w3.org/2000/svg" class="bio-diagram natural" role="img" aria-label="Animal cell diagram">
    <defs>
      <radialGradient id="c-body" cx="42%" cy="36%" r="72%"><stop offset="0%" stop-color="#f2fbff"/><stop offset="55%" stop-color="#d3edf8"/><stop offset="100%" stop-color="#a6d6ea"/></radialGradient>
      <radialGradient id="c-shell" cx="50%" cy="50%" r="50%"><stop offset="83%" stop-color="#8fc9e3" stop-opacity="0"/><stop offset="95%" stop-color="#5aa7cc" stop-opacity=".5"/><stop offset="100%" stop-color="#3f8cb4" stop-opacity=".18"/></radialGradient>
      <radialGradient id="c-nuc" cx="40%" cy="34%" r="70%"><stop offset="0%" stop-color="#fbd3e6"/><stop offset="50%" stop-color="#ec93bf"/><stop offset="100%" stop-color="#c95a93"/></radialGradient>
      <radialGradient id="c-nucl" cx="42%" cy="36%" r="70%"><stop offset="0%" stop-color="#d95fa0"/><stop offset="100%" stop-color="#93336c"/></radialGradient>
      <radialGradient id="c-mito" cx="36%" cy="30%" r="76%"><stop offset="0%" stop-color="#f4a79f"/><stop offset="55%" stop-color="#e46b62"/><stop offset="100%" stop-color="#bb3a34"/></radialGradient>
      <radialGradient id="c-golgi" cx="40%" cy="30%" r="78%"><stop offset="0%" stop-color="#a6d98f"/><stop offset="100%" stop-color="#4f9a54"/></radialGradient>
      <radialGradient id="c-vac" cx="38%" cy="30%" r="78%"><stop offset="0%" stop-color="#eaf7fb"/><stop offset="100%" stop-color="#b7dcea"/></radialGradient>
      <radialGradient id="c-lyso" cx="38%" cy="32%" r="76%"><stop offset="0%" stop-color="#c9a6e0"/><stop offset="100%" stop-color="#8a56b0"/></radialGradient>
      <linearGradient id="c-er" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6b25a"/><stop offset="100%" stop-color="#dd8a24"/></linearGradient>
      <linearGradient id="c-cent" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f2a94a"/><stop offset="100%" stop-color="#c97e1c"/></linearGradient>
      <filter id="c-drop" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1c3a4a" flood-opacity="0.26"/></filter>
      <filter id="c-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
      <clipPath id="c-clip"><circle cx="430" cy="332" r="246"/></clipPath>
    </defs>

    <g class="part" data-part="cytoplasm"><circle cx="430" cy="332" r="246" fill="url(#c-body)" filter="url(#c-drop)"/></g>

    <g clip-path="url(#c-clip)">
      <g class="part" data-part="rough-er">
        <g fill="none" stroke="#e88ab6" stroke-width="13" stroke-linecap="round" opacity=".92">
          <path d="M300 372 q40 -70 130 -78 q96 -8 150 46"/><path d="M300 404 q52 -74 140 -84 q92 -8 152 34"/><path d="M316 436 q60 -70 132 -80"/>
        </g>
        <g fill="#d76aa0"><circle cx="300" cy="372" r="4"/><circle cx="336" cy="330" r="4"/><circle cx="384" cy="300" r="4"/><circle cx="300" cy="404" r="4"/><circle cx="316" cy="436" r="4"/><circle cx="512" cy="300" r="4"/></g>
      </g>
      <g class="part" data-part="smooth-er">
        <g fill="none" stroke="url(#c-er)" stroke-width="11" stroke-linecap="round"><path d="M556 300 q56 8 58 66 q-2 52 -58 60"/><path d="M566 356 q46 16 24 66"/></g>
      </g>
      <g class="part" data-part="mitochondria">
        <g filter="url(#c-drop)" transform="translate(566 214) rotate(24)"><ellipse rx="60" ry="31" fill="url(#c-mito)"/><path d="M-44 -6 q11 -17 22 0 q11 17 22 0 q11 -17 22 0 q11 17 22 0" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7" stroke-linecap="round"/></g>
        <g filter="url(#c-drop)" transform="translate(452 502) rotate(-12)"><ellipse rx="56" ry="29" fill="url(#c-mito)"/><path d="M-42 -5 q10 -16 21 0 q10 16 21 0 q10 -16 21 0 q10 16 21 0" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7" stroke-linecap="round"/></g>
      </g>
      <g class="part" data-part="golgi">
        <g filter="url(#c-drop)" fill="url(#c-golgi)"><path d="M262 476 q70 -40 142 0 l0 5 q-71 -34 -142 0Z"/><path d="M272 494 q60 -34 122 0 l0 5 q-61 -30 -122 0Z"/><path d="M282 512 q50 -28 102 0 l0 5 q-51 -24 -102 0Z"/><path d="M292 530 q40 -22 82 0 l0 5 q-41 -18 -82 0Z"/></g>
        <circle cx="392" cy="522" r="7" fill="url(#c-golgi)"/><circle cx="410" cy="540" r="5" fill="url(#c-golgi)"/>
      </g>
      <g class="part" data-part="lysosome"><g filter="url(#c-drop)"><circle cx="250" cy="256" r="26" fill="url(#c-lyso)"/><g fill="#5e2f86"><circle cx="243" cy="250" r="3"/><circle cx="257" cy="257" r="3"/><circle cx="248" cy="264" r="3"/></g></g></g>
      <g class="part" data-part="vacuole"><g filter="url(#c-drop)"><circle cx="632" cy="418" r="42" fill="url(#c-vac)"/><ellipse cx="620" cy="404" rx="12" ry="7" fill="#fff" opacity=".7"/></g></g>
      <g class="part" data-part="centrosome"><g filter="url(#c-drop)"><rect x="238" y="176" width="40" height="15" rx="6" fill="url(#c-cent)"/><rect x="250" y="192" width="15" height="40" rx="6" fill="url(#c-cent)"/></g></g>
      <g class="part" data-part="ribosomes"><g fill="#c9701f"><circle cx="520" cy="472" r="5"/><circle cx="540" cy="484" r="5"/><circle cx="508" cy="492" r="5"/><circle cx="352" cy="250" r="5"/><circle cx="372" cy="240" r="5"/></g></g>
      <g class="part" data-part="nucleus"><g filter="url(#c-drop)"><circle cx="430" cy="336" r="96" fill="url(#c-nuc)"/><circle cx="430" cy="336" r="96" fill="none" stroke="#b5568c" stroke-width="3" opacity=".7"/><g fill="#fff" opacity=".8"><circle cx="404" cy="252" r="2.6"/><circle cx="452" cy="248" r="2.6"/><circle cx="352" cy="316" r="2.6"/><circle cx="510" cy="360" r="2.6"/></g></g></g>
      <g class="part" data-part="nucleolus"><path d="M452 352 q-6 -30 20 -40 q26 -8 30 20 q6 30 -22 40 q-26 8 -28 -20Z" fill="url(#c-nucl)"/></g>
    </g>

    <g class="nolabels">
      <circle cx="430" cy="332" r="246" fill="url(#c-shell)"/>
      <circle cx="430" cy="332" r="240" fill="none" stroke="#ffffff" stroke-width="3" opacity=".45"/>
      <ellipse cx="352" cy="228" rx="120" ry="78" fill="#ffffff" opacity=".32" filter="url(#c-blur)"/>
      <ellipse cx="300" cy="196" rx="34" ry="20" fill="#ffffff" opacity=".62" filter="url(#c-blur)"/>
    </g>
    <g class="part" data-part="cell-membrane"><circle cx="430" cy="332" r="245" fill="none" stroke="#5aa7cc" stroke-width="7" opacity=".55"/></g>

    <g class="nolabels">
      <line class="lead-nat" x1="154" y1="130" x2="250" y2="196"/><circle class="pin-nat" cx="250" cy="196" r="3.4"/><text class="plabel" x="150" y="134" text-anchor="end">Centrioles</text>
      <line class="lead-nat" x1="154" y1="205" x2="232" y2="252"/><circle class="pin-nat" cx="232" cy="252" r="3.4"/><text class="plabel" x="150" y="209" text-anchor="end">Lysosome</text>
      <line class="lead-nat" x1="154" y1="285" x2="368" y2="288"/><circle class="pin-nat" cx="368" cy="288" r="3.4"/><text class="plabel" x="150" y="289" text-anchor="end">Nucleus</text>
      <line class="lead-nat" x1="154" y1="365" x2="330" y2="372"/><circle class="pin-nat" cx="330" cy="372" r="3.4"/><text class="plabel" x="150" y="369" text-anchor="end">Rough ER</text>
      <line class="lead-nat" x1="154" y1="500" x2="316" y2="500"/><circle class="pin-nat" cx="316" cy="500" r="3.4"/><text class="plabel" x="150" y="504" text-anchor="end">Golgi apparatus</text>
      <line class="lead-nat" x1="154" y1="430" x2="360" y2="430"/><circle class="pin-nat" cx="360" cy="430" r="3.4"/><text class="plabel" x="150" y="434" text-anchor="end">Cytoplasm</text>
      <line class="lead-nat" x1="726" y1="130" x2="672" y2="300"/><circle class="pin-nat" cx="672" cy="300" r="3.4"/><text class="plabel" x="730" y="134" text-anchor="start">Cell membrane</text>
      <line class="lead-nat" x1="726" y1="210" x2="574" y2="216"/><circle class="pin-nat" cx="574" cy="216" r="3.4"/><text class="plabel" x="730" y="214" text-anchor="start">Mitochondrion</text>
      <line class="lead-nat" x1="726" y1="292" x2="490" y2="356"/><circle class="pin-nat" cx="490" cy="356" r="3.4"/><text class="plabel" x="730" y="296" text-anchor="start">Nucleolus</text>
      <line class="lead-nat" x1="726" y1="360" x2="608" y2="346"/><circle class="pin-nat" cx="608" cy="346" r="3.4"/><text class="plabel" x="730" y="364" text-anchor="start">Smooth ER</text>
      <line class="lead-nat" x1="726" y1="430" x2="666" y2="416"/><circle class="pin-nat" cx="666" cy="416" r="3.4"/><text class="plabel" x="730" y="434" text-anchor="start">Vacuole</text>
      <line class="lead-nat" x1="726" y1="500" x2="528" y2="478"/><circle class="pin-nat" cx="528" cy="478" r="3.4"/><text class="plabel" x="730" y="504" text-anchor="start">Ribosomes</text>
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
    viewBox: '0 0 880 660', svg, parts, quizzes
  };
})();
