/* Life Explorer — Biology · Unit 2 lessons (Cells).
   These reuse the original Life-Explorer diagrams as the hands-on Explore step:
   `diagramExplore` and `labelHunt` mount the animal-cell diagram and the 3-D
   plant-cell model right inside the lesson. Registered on BIO.Player.           */
(function () {
  const P = window.BIO.Player;
  const reg = P.register;

  reg({
    concept: 'cell-theory', title: 'Cell Theory',
    hook: { emoji: '🔬', text: 'In 1665 Robert Hooke looked at cork through a microscope and saw tiny boxes. He called them “cells”.', sub: 'That one observation grew into a theory about all of life.' },
    steps: [
      { kind: 'explore', title: 'Who discovered what?', component: 'matchPairs', config: {
        prompt: 'Match each scientist to their contribution.',
        pairs: [
          { left: 'Robert Hooke', right: 'Named the first “cells” in cork' },
          { left: 'Van Leeuwenhoek', right: 'Saw living cells (“animalcules”)' },
          { left: 'Schleiden & Schwann', right: 'All plants and animals are made of cells' },
          { left: 'Rudolf Virchow', right: 'All cells come from existing cells' }
        ] } },
      { kind: 'discover', title: 'Three big ideas', text: 'Those discoveries became the <b>cell theory</b>: (1) all living things are made of cells, (2) the cell is the basic unit of life, and (3) all cells come from pre-existing cells.', rule: 'Cells = the basic unit of life · every cell comes from another cell' },
      { kind: 'practice', difficulty: 'easy', title: 'The three tenets', component: 'problemSet', config: { problems: [
        { prompt: 'The basic unit of all life is the…', answer: 'cell', choices: ['cell', 'atom', 'organ'], hint: 'It’s the whole point of this unit.' },
        { prompt: 'Where do new cells come from?', answer: 'Existing cells', choices: ['Existing cells', 'Non-living matter', 'Thin air'], hint: 'Virchow’s principle.' },
        { prompt: 'How many living things are made of cells?', answer: 'All of them', choices: ['All of them', 'Only animals', 'Only plants'], hint: 'It’s a universal rule.' }
      ] } },
      { kind: 'mastery', title: 'Cell theory check', component: 'problemSet', config: { problems: [
        { prompt: 'Who named the first cells?', answer: 'Robert Hooke', choices: ['Robert Hooke', 'Charles Darwin', 'Gregor Mendel'], hint: 'He was looking at cork.' },
        { prompt: 'True or false: some living things are not made of cells.', answer: 'False', choices: ['True', 'False'], hint: 'Cell theory says all life is cellular.' },
        { prompt: 'A single-celled bacterium is still a complete…', answer: 'organism', choices: ['organism', 'organ', 'tissue'], hint: 'It can live on its own.' }
      ] } }
    ]
  });

  reg({
    concept: 'prokaryote-eukaryote', title: 'Prokaryotes & Eukaryotes',
    hook: { emoji: '🦠', text: 'Your cells and a bacterium’s cell both count as “alive” — but inside they’re built completely differently.', sub: 'The biggest divide in all of life is about one structure: the nucleus.' },
    steps: [
      { kind: 'explore', title: 'Which cell type?', component: 'sortCards', config: {
        prompt: 'Sort each feature or organism by the cell type it belongs to.',
        bins: [{ id: 'pro', label: 'Prokaryote' }, { id: 'euk', label: 'Eukaryote' }],
        items: [
          { label: 'No nucleus', emoji: '🚫', bin: 'pro' }, { label: 'Bacteria', emoji: '🦠', bin: 'pro' },
          { label: 'Usually tiny & simple', emoji: '·', bin: 'pro' }, { label: 'DNA floats freely', emoji: '🧬', bin: 'pro' },
          { label: 'Has a nucleus', emoji: '⚫', bin: 'euk' }, { label: 'Animal & plant cells', emoji: '🐕', bin: 'euk' },
          { label: 'Membrane-bound organelles', emoji: '🔩', bin: 'euk' }, { label: 'Larger & complex', emoji: '🌳', bin: 'euk' }
        ] } },
      { kind: 'discover', title: 'It’s all about the nucleus', text: '<b>Prokaryotes</b> (bacteria and archaea) have no nucleus — their DNA floats free, and they’re small and simple. <b>Eukaryotes</b> (animals, plants, fungi, protists) keep their DNA in a nucleus and have membrane-bound organelles.', rule: 'Pro = “before” a nucleus · Eu = “true” nucleus' },
      { kind: 'mastery', title: 'Tell them apart', component: 'problemSet', config: { problems: [
        { prompt: 'The key structure a prokaryote LACKS is the…', answer: 'nucleus', choices: ['nucleus', 'cell membrane', 'ribosome'], hint: '“Pro-karyote” means before the kernel.' },
        { prompt: 'Bacteria are…', answer: 'Prokaryotes', choices: ['Prokaryotes', 'Eukaryotes'], hint: 'No nucleus.' },
        { prompt: 'Your skin cells are…', answer: 'Eukaryotes', choices: ['Prokaryotes', 'Eukaryotes'], hint: 'They have a nucleus and organelles.' },
        { prompt: 'Which cell type is generally larger and more complex?', answer: 'Eukaryote', choices: ['Prokaryote', 'Eukaryote'], hint: 'The one with compartments.' }
      ] } }
    ]
  });

  reg({
    concept: 'organelles', title: 'Cell Organelles',
    hook: { emoji: '🏭', text: 'A single cell is a factory: a power plant, a post office, an assembly line and a recycling centre — all in one microscopic space.', sub: 'Let’s open it up and see who does what.' },
    steps: [
      { kind: 'explore', title: 'Explore the cell', intro: 'Click the organelles in the diagram to discover what each one does.', component: 'diagramExplore', config: { topic: 'cell', need: 5, prompt: 'Click at least 5 organelles to see their jobs.' } },
      { kind: 'discover', title: 'Every organelle has a job', text: 'The <b>nucleus</b> is the control centre (it holds the DNA), the <b>mitochondria</b> are the power plants, the <b>ribosomes</b> build proteins, the <b>Golgi apparatus</b> packages and ships them, and <b>lysosomes</b> clean up waste.', rule: 'A cell is a tiny factory — each organelle is a department' },
      { kind: 'practice', difficulty: 'easy', title: 'Organelle jobs', component: 'matchPairs', config: {
        prompt: 'Match each organelle to what it does.',
        pairs: [
          { left: 'Nucleus', right: 'Controls the cell; stores DNA' },
          { left: 'Mitochondria', right: 'Release energy (make ATP)' },
          { left: 'Ribosomes', right: 'Build proteins' },
          { left: 'Golgi apparatus', right: 'Package and ship proteins' },
          { left: 'Lysosome', right: 'Digest waste and worn-out parts' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Find the organelle', component: 'labelHunt', config: { topic: 'cell', targets: ['nucleus', 'mitochondria', 'golgi', 'ribosomes', 'lysosome'] } },
      { kind: 'mastery', title: 'Name that organelle', component: 'problemSet', config: { problems: [
        { prompt: 'The “powerhouse of the cell” is the…', answer: 'Mitochondria', choices: ['Mitochondria', 'Nucleus', 'Golgi apparatus'], hint: 'It makes ATP.' },
        { prompt: 'Which organelle stores the DNA?', answer: 'Nucleus', choices: ['Nucleus', 'Ribosome', 'Lysosome'], hint: 'The control centre.' },
        { prompt: 'Proteins are built by…', answer: 'Ribosomes', choices: ['Ribosomes', 'Vacuoles', 'Mitochondria'], hint: 'Tiny machines on the rough ER.' },
        { prompt: 'The cell’s “post office” that packages proteins is the…', answer: 'Golgi apparatus', choices: ['Golgi apparatus', 'Nucleolus', 'Membrane'], hint: 'A stack of flattened sacs.' }
      ] } }
    ]
  });

  reg({
    concept: 'plant-vs-animal', title: 'Plant vs Animal Cells',
    hook: { emoji: '🌿', text: 'A plant cell and an animal cell share most organelles — but a plant cell has three things yours will never have.', sub: 'Rotate a real plant cell and find out what.' },
    steps: [
      { kind: 'explore', title: 'Explore a plant cell', intro: 'Drag to rotate the 3-D plant cell. Tap its parts to explore them.', component: 'diagramExplore', config: { topic: 'plant-cell', need: 4, prompt: 'Rotate and tap at least 4 parts of the plant cell.' } },
      { kind: 'discover', title: 'Three plant-only structures', text: 'Plant cells add a rigid <b>cell wall</b> for support, green <b>chloroplasts</b> that capture sunlight for photosynthesis, and one big <b>central vacuole</b> that stores water and keeps the cell firm. Animal cells have none of these.', rule: 'Plants add: cell wall · chloroplasts · large central vacuole' },
      { kind: 'practice', difficulty: 'easy', title: 'Plant-only, or both?', component: 'sortCards', config: {
        prompt: 'Sort each structure: only in plants, or in both plant and animal cells?',
        bins: [{ id: 'plant', label: 'Plant only' }, { id: 'both', label: 'Both' }],
        items: [
          { label: 'Cell wall', emoji: '🧱', bin: 'plant' }, { label: 'Chloroplast', emoji: '🟢', bin: 'plant' },
          { label: 'Large central vacuole', emoji: '💧', bin: 'plant' },
          { label: 'Nucleus', emoji: '⚫', bin: 'both' }, { label: 'Mitochondria', emoji: '🔋', bin: 'both' },
          { label: 'Cell membrane', emoji: '🚪', bin: 'both' }, { label: 'Ribosomes', emoji: '⚙️', bin: 'both' }
        ] } },
      { kind: 'mastery', title: 'Spot the difference', component: 'problemSet', config: { problems: [
        { prompt: 'Which structure captures sunlight in plant cells?', answer: 'Chloroplast', choices: ['Chloroplast', 'Mitochondria', 'Nucleus'], hint: 'It’s green — full of chlorophyll.' },
        { prompt: 'What gives a plant cell its rigid, boxy shape?', answer: 'Cell wall', choices: ['Cell wall', 'Cell membrane', 'Vacuole'], hint: 'Made largely of cellulose.' },
        { prompt: 'Which of these do BOTH plant and animal cells have?', answer: 'Nucleus', choices: ['Nucleus', 'Chloroplast', 'Cell wall'], hint: 'Both are eukaryotes.' },
        { prompt: 'The large water-storing sac in a plant cell is the…', answer: 'Central vacuole', choices: ['Central vacuole', 'Lysosome', 'Golgi'], hint: 'It keeps the cell firm (turgid).' }
      ] } }
    ]
  });

  reg({
    concept: 'membrane', title: 'The Cell Membrane',
    hook: { emoji: '🚪', text: 'Every cell is wrapped in a skin just two molecules thick — yet it decides exactly what gets in and out.', sub: 'How can something so thin be such a careful gatekeeper?' },
    steps: [
      { kind: 'explore', title: 'Parts of the gatekeeper', component: 'matchPairs', config: {
        prompt: 'Match each part of the membrane to its role.',
        pairs: [
          { left: 'Phospholipid bilayer', right: 'The double-layered sheet that forms the barrier' },
          { left: 'Transport proteins', right: 'Channels that let specific molecules through' },
          { left: 'Selectively permeable', right: 'Lets some things pass, blocks others' },
          { left: 'Receptor proteins', right: 'Sense signals from outside the cell' }
        ] } },
      { kind: 'discover', title: 'A fluid mosaic', text: 'The membrane is a <b>phospholipid bilayer</b> — heads that love water face out, tails that hate water tuck inside. Proteins float in it like tiles in a mosaic, forming channels and sensors. Because it lets some things through but not others, we call it <b>selectively permeable</b>.', rule: 'Selectively permeable = the gate chooses what passes' },
      { kind: 'mastery', title: 'Membrane check', component: 'problemSet', config: { problems: [
        { prompt: 'The cell membrane is made mainly of a double layer of…', answer: 'phospholipids', choices: ['phospholipids', 'proteins', 'sugars'], hint: 'Heads out, tails in.' },
        { prompt: 'A membrane that lets some substances through but not others is…', answer: 'selectively permeable', choices: ['selectively permeable', 'impermeable', 'fully open'], hint: 'It’s picky.' },
        { prompt: 'What floats in the bilayer to form channels and sensors?', answer: 'Proteins', choices: ['Proteins', 'Bones', 'Chloroplasts'], hint: 'The “mosaic” tiles.' }
      ] } }
    ]
  });
})();
