/* Life Explorer — Biology · Unit 1 lessons (What Is Life?).
   Each lesson follows the platform flow: a curiosity Hook, a hands-on Explore,
   a short Discover that names what the learner just did, then Practice, an
   optional Challenge (for the 3rd star) and a Mastery check. Registered by
   concept id on BIO.Player.                                                     */
(function () {
  const P = window.BIO.Player;
  const reg = P.register;

  reg({
    concept: 'characteristics', title: 'Characteristics of Life',
    hook: { emoji: '🔥', text: 'A candle flame moves, grows, uses oxygen and dies. So is it alive?', sub: 'How can we tell the living from the non-living?' },
    steps: [
      { kind: 'explore', title: 'Living or not?', component: 'sortCards', config: {
        prompt: 'Tap each thing, then drop it into the group you think it belongs in.',
        bins: [{ id: 'living', label: 'Living' }, { id: 'nonliving', label: 'Non-living' }],
        items: [
          { label: 'Oak tree', emoji: '🌳', bin: 'living' }, { label: 'Dog', emoji: '🐕', bin: 'living' },
          { label: 'Mushroom', emoji: '🍄', bin: 'living' }, { label: 'Bacterium', emoji: '🦠', bin: 'living' },
          { label: 'Rock', emoji: '🪨', bin: 'nonliving' }, { label: 'Candle flame', emoji: '🔥', bin: 'nonliving' },
          { label: 'River', emoji: '🌊', bin: 'nonliving' }, { label: 'Robot', emoji: '🤖', bin: 'nonliving' }
        ] } },
      { kind: 'discover', title: 'Life shares seven signs', text: 'A flame moves and uses oxygen, but it can’t <b>grow from within</b>, <b>respond</b> to the world, or <b>reproduce</b>. Living things do all seven: <b>M</b>ovement, <b>R</b>espiration, <b>S</b>ensitivity, <b>G</b>rowth, <b>R</b>eproduction, <b>E</b>xcretion and <b>N</b>utrition.', rule: 'Remember it as <b>MRS GREN</b> 🧬' },
      { kind: 'practice', difficulty: 'easy', title: 'Match the sign of life', component: 'matchPairs', config: {
        prompt: 'Match each life process to what it means.',
        pairs: [
          { left: 'Respiration', right: 'Releasing energy from food' },
          { left: 'Sensitivity', right: 'Responding to the surroundings' },
          { left: 'Reproduction', right: 'Making more of your own kind' },
          { left: 'Excretion', right: 'Removing waste products' },
          { left: 'Nutrition', right: 'Taking in food or making it' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'The tricky cases', component: 'sortCards', config: {
        prompt: 'These fool a lot of people. Living or not?',
        bins: [{ id: 'living', label: 'Living' }, { id: 'nonliving', label: 'Non-living' }],
        items: [
          { label: 'Seed', emoji: '🌱', bin: 'living' }, { label: 'Coral', emoji: '🪸', bin: 'living' },
          { label: 'Yeast', emoji: '🍞', bin: 'living' }, { label: 'Virus', emoji: '🦠', bin: 'nonliving' },
          { label: 'Cloud', emoji: '☁️', bin: 'nonliving' }, { label: 'Crystal', emoji: '💎', bin: 'nonliving' }
        ] } },
      { kind: 'mastery', title: 'Signs of life', component: 'problemSet', config: { problems: [
        { prompt: 'The seven signs of life are remembered by the phrase…', answer: 'MRS GREN', choices: ['MRS GREN', 'DR ROY G BIV', 'PEMDAS'], hint: 'It sounds like a person’s name.' },
        { prompt: 'Releasing energy from food is called…', answer: 'Respiration', choices: ['Respiration', 'Excretion', 'Nutrition'], hint: 'It happens in your mitochondria.' },
        { prompt: 'Which is NOT a sign of life?', answer: 'Being made of metal', choices: ['Growth', 'Reproduction', 'Being made of metal'], hint: 'Materials don’t define life.' },
        { prompt: 'A virus is usually considered non-living because it cannot ___ on its own.', answer: 'reproduce', choices: ['reproduce', 'move', 'float'], hint: 'It needs to hijack a host cell.' }
      ] } }
    ]
  });

  reg({
    concept: 'scientific-method', title: 'The Scientific Method',
    hook: { emoji: '🪴', text: 'Two identical plants — one by the window, one in a closet. One thrives, one wilts.', sub: 'How would a scientist prove that light is the cause?' },
    steps: [
      { kind: 'explore', title: 'Order the investigation', component: 'orderList', config: {
        prompt: 'Put the steps of a scientific investigation in order.',
        items: ['Ask a question', 'Form a hypothesis', 'Design an experiment', 'Collect data', 'Analyse results', 'Draw a conclusion'] } },
      { kind: 'discover', title: 'A fair test isolates one variable', text: 'You change <b>one</b> thing (the independent variable — here, light), keep everything else the same, and measure the effect. The plant in the dark is your <b>control</b>. That’s what makes the test <i>fair</i>.', rule: 'Change one variable · keep the rest constant · compare to a control' },
      { kind: 'practice', difficulty: 'easy', title: 'Name the parts', component: 'matchPairs', config: {
        prompt: 'Match each term to its meaning in the plant experiment.',
        pairs: [
          { left: 'Hypothesis', right: 'A testable prediction' },
          { left: 'Independent variable', right: 'The one thing you change (light)' },
          { left: 'Dependent variable', right: 'What you measure (growth)' },
          { left: 'Control', right: 'The plant kept in the dark for comparison' }
        ] } },
      { kind: 'mastery', title: 'Think like a scientist', component: 'problemSet', config: { problems: [
        { prompt: 'A testable, predictive statement is a…', answer: 'Hypothesis', choices: ['Hypothesis', 'Conclusion', 'Theory'], hint: 'It comes before the experiment.' },
        { prompt: 'To be fair, an experiment should change how many variables at a time?', answer: '1', choices: ['1', '2', 'As many as possible'], hint: 'Isolate the cause.' },
        { prompt: 'The group that gets no treatment, used for comparison, is the…', answer: 'control', choices: ['control', 'sample', 'variable'], hint: 'The plant in the closet.' }
      ] } }
    ]
  });

  reg({
    concept: 'levels-org', title: 'Levels of Organization',
    hook: { emoji: '🔎', text: 'Zoom out from a single heart-muscle cell far enough and you reach the whole living planet.', sub: 'What are the steps in between?' },
    steps: [
      { kind: 'explore', title: 'Zoom out, step by step', component: 'orderList', config: {
        prompt: 'Order these from smallest to largest.',
        items: ['Cell', 'Tissue', 'Organ', 'Organ system', 'Organism', 'Population', 'Community', 'Ecosystem'] } },
      { kind: 'discover', title: 'Small parts build bigger wholes', text: 'Each level is made of the one below it: <b>cells</b> group into <b>tissues</b>, tissues into <b>organs</b>, organs into <b>systems</b>, and systems into a whole <b>organism</b>. Beyond the body, organisms form <b>populations</b>, <b>communities</b> and <b>ecosystems</b>.', rule: 'Cell → Tissue → Organ → System → Organism → Population → Community → Ecosystem' },
      { kind: 'challenge', difficulty: 'challenge', title: 'The full ladder', component: 'orderList', config: {
        prompt: 'Now the complete sequence — atoms all the way to the whole planet.',
        items: ['Atom', 'Molecule', 'Organelle', 'Cell', 'Tissue', 'Organ', 'Organism', 'Ecosystem', 'Biosphere'] } },
      { kind: 'mastery', title: 'Which level?', component: 'problemSet', config: { problems: [
        { prompt: 'The heart is an example of a…', answer: 'Organ', choices: ['Cell', 'Tissue', 'Organ', 'Organ system'], hint: 'It’s made of several tissues working together.' },
        { prompt: 'All the deer living in one forest are a…', answer: 'Population', choices: ['Community', 'Population', 'Ecosystem'], hint: 'One species, one place.' },
        { prompt: 'A group of similar cells doing one job is a…', answer: 'Tissue', choices: ['Organ', 'Tissue', 'Organelle'], hint: 'Between a cell and an organ.' },
        { prompt: 'The largest level — every living thing on Earth — is the…', answer: 'Biosphere', choices: ['Ecosystem', 'Community', 'Biosphere'], hint: 'The whole living planet.' }
      ] } }
    ]
  });
})();
