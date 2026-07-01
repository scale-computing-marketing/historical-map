/* Life Explorer — Biology · cross-unit lessons (Genetics, Evolution,
   Classification, Ecology, Human Body). Representative lessons that reuse the
   original Life-Explorer models — the Punnett tool, the Tree of Life and the
   Human Body diagram — as their hands-on surface. Registered on BIO.Player.     */
(function () {
  const P = window.BIO.Player;
  const reg = P.register;

  /* ---- Unit 5 · Genetics ---- */
  reg({
    concept: 'dna', title: 'DNA Structure',
    hook: { emoji: '🧬', text: 'Every cell holds two metres of DNA coiled up — and the whole code uses just four letters.', sub: 'A, T, G and C. How do four letters spell out a living thing?' },
    steps: [
      { kind: 'explore', title: 'Build the second strand', intro: 'One side of the DNA ladder is given. Add the base that pairs with each rung.', component: 'buildSequence', config: { template: ['A', 'T', 'G', 'C', 'A', 'T'], prompt: 'Remember: A pairs with T, and C pairs with G.' } },
      { kind: 'discover', title: 'The double helix', text: 'DNA is a twisted ladder — two strands held together by <b>base pairs</b>. <b>A</b> always pairs with <b>T</b>, and <b>C</b> always pairs with <b>G</b>. Because pairing is fixed, one strand is a perfect template for copying the other.', rule: 'A–T · C–G · the sugar-phosphate backbone runs up each side' },
      { kind: 'practice', difficulty: 'easy', title: 'Pair a longer strand', component: 'buildSequence', config: { template: ['G', 'G', 'C', 'A', 'T', 'C', 'G'], prompt: 'Complete the complementary strand.' } },
      { kind: 'challenge', difficulty: 'challenge', title: 'No hints this time', component: 'buildSequence', config: { template: ['C', 'A', 'T', 'T', 'A', 'G', 'C', 'G'], prompt: 'Build the matching strand from memory.' } },
      { kind: 'mastery', title: 'DNA check', component: 'problemSet', config: { problems: [
        { prompt: 'In DNA, adenine (A) always pairs with…', answer: 'T', choices: ['T', 'G', 'C'], hint: 'A–T.' },
        { prompt: 'Cytosine (C) always pairs with…', answer: 'G', choices: ['G', 'A', 'T'], hint: 'C–G.' },
        { prompt: 'The overall shape of a DNA molecule is a…', answer: 'double helix', choices: ['double helix', 'flat sheet', 'sphere'], hint: 'A twisted ladder.' },
        { prompt: 'If one strand reads A-G-C, the matching strand reads…', answer: 'T-C-G', choices: ['T-C-G', 'A-G-C', 'G-C-A'], hint: 'Pair each base.' }
      ] } }
    ]
  });

  reg({
    concept: 'inheritance', title: 'Inheritance & Punnett Squares',
    hook: { emoji: '👀', text: 'Two brown-eyed parents can have a blue-eyed child — but two blue-eyed parents almost never have a brown-eyed one.', sub: 'A simple square can predict the odds.' },
    steps: [
      { kind: 'explore', title: 'Predict the offspring', intro: 'The square is filled in for you. Read it and predict the odds. (You can also open the full Punnett tool from Explore ▾.)', component: 'punnettCross', config: { dom: 'B', rec: 'b', domName: 'brown', recName: 'blue', rounds: 3 } },
      { kind: 'discover', title: 'Dominant hides recessive', text: 'Each parent passes one <b>allele</b>. A <b>dominant</b> allele (B) shows even with one copy; a <b>recessive</b> one (b) only shows as a pair (bb). A Punnett square lists every combination, so each box is a 1-in-4 chance.', rule: 'BB & Bb → brown · only bb → blue' },
      { kind: 'practice', difficulty: 'easy', title: 'More crosses', component: 'punnettCross', config: { dom: 'T', rec: 't', domName: 'tall', recName: 'short', rounds: 3 } },
      { kind: 'mastery', title: 'Inheritance check', component: 'problemSet', config: { problems: [
        { prompt: 'A cross of Bb × Bb gives what fraction of blue-eyed (bb) offspring?', answer: '1/4', choices: ['1/4', '1/2', '3/4'], hint: '1 BB : 2 Bb : 1 bb.' },
        { prompt: 'An allele that only shows when doubled up is…', answer: 'recessive', choices: ['recessive', 'dominant', 'hybrid'], hint: 'Lower-case letter.' },
        { prompt: 'The genotype Bb produces which eye colour?', answer: 'Brown', choices: ['Brown', 'Blue', 'Green'], hint: 'B is dominant.' },
        { prompt: 'Two bb parents can only have ___ children.', answer: 'bb', choices: ['bb', 'Bb', 'BB'], hint: 'They have no B to pass on.' }
      ] } }
    ]
  });

  /* ---- Unit 6 · Evolution ---- */
  reg({
    concept: 'natural-selection', title: 'Natural Selection',
    hook: { emoji: '🐞', text: 'On dark tree bark, pale beetles get eaten and dark ones survive. A few generations later, almost every beetle is dark.', sub: 'Nobody chose it — so how did the population change?' },
    steps: [
      { kind: 'explore', title: 'Help the beetles survive', intro: 'Predators eat the beetles they can see. Adjust how well the beetles blend in and watch how many survive.', component: 'simSlider', config: {
        prompt: 'Raise the beetles’ camouflage to help more survive this predator.',
        vars: [
          { id: 'camo', label: 'Camouflage', min: 0, max: 100, step: 5, value: 20, unit: '%' },
          { id: 'predators', label: 'Predator pressure', min: 0, max: 100, step: 5, value: 70, unit: '%' }
        ],
        outputs: [{ id: 'survivors', label: 'Beetles surviving', unit: '%', color: '#4f9a54', max: 100, fn: v => Math.round(Math.max(0, 100 - (v.predators / 100) * (100 - v.camo))) }],
        viz: (v, o) => '🐞'.repeat(Math.max(1, Math.round(o.survivors / 12))) + (o.survivors < 40 ? ' 🐦' : ''),
        goal: { text: 'Get beetle survival above 80%.', done: 'The well-camouflaged beetles survive — and pass on their camouflage genes.', test: (v, o) => o.survivors >= 80 }
      } },
      { kind: 'discover', title: 'The fittest pass on their genes', text: 'You saw that better-camouflaged beetles survive more. Those survivors <b>reproduce</b> and pass the trait on, so the next generation is more camouflaged. Over many generations this shifts the whole population — that’s <b>natural selection</b>.', rule: 'Variation → survival of the fittest → inheritance → the population evolves' },
      { kind: 'practice', difficulty: 'easy', title: 'The logic of selection', component: 'orderList', config: {
        prompt: 'Put the steps of natural selection in order.',
        items: ['Individuals vary', 'Some traits aid survival', 'Survivors reproduce', 'Helpful traits become common'] } },
      { kind: 'mastery', title: 'Selection check', component: 'problemSet', config: { problems: [
        { prompt: 'Natural selection acts on the ___ that already exist in a population.', answer: 'variations', choices: ['variations', 'wishes', 'habits'], hint: 'Differences between individuals.' },
        { prompt: '“Fitness” in evolution means being best at…', answer: 'surviving and reproducing', choices: ['surviving and reproducing', 'lifting weights', 'running fast'], hint: 'It’s about passing on genes.' },
        { prompt: 'Who proposed the theory of evolution by natural selection?', answer: 'Charles Darwin', choices: ['Charles Darwin', 'Gregor Mendel', 'Robert Hooke'], hint: 'Voyage of the Beagle.' },
        { prompt: 'For selection to change a population, the helpful trait must be…', answer: 'inherited', choices: ['inherited', 'invisible', 'learned'], hint: 'Passed to offspring.' }
      ] } }
    ]
  });

  /* ---- Unit 7 · Classification ---- */
  reg({
    concept: 'taxonomy', title: 'Classification & Taxonomy',
    hook: { emoji: '🌳', text: 'There are millions of species. To make sense of them, biologists file every one into a giant branching tree.', sub: 'How is life sorted, from the broadest group down to a single species?' },
    steps: [
      { kind: 'explore', title: 'Explore the tree of life', intro: 'Click the branches to see the great groups of living things.', component: 'diagramExplore', config: { topic: 'tree-of-life', need: 4, prompt: 'Explore at least 4 branches of the tree of life.' } },
      { kind: 'discover', title: 'From domains to species', text: 'Life’s biggest branches are three <b>domains</b> (Bacteria, Archaea, Eukarya), which split into <b>kingdoms</b> and then ever-finer ranks, down to a single <b>species</b>. Each step groups organisms that are more and more closely related.', rule: 'Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species' },
      { kind: 'practice', difficulty: 'easy', title: 'Order the ranks', component: 'orderList', config: {
        prompt: 'Put the classification ranks in order, broadest first.',
        items: ['Domain', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Find the branch', component: 'labelHunt', config: { topic: 'tree-of-life', targets: ['bacteria', 'eukarya', 'plantae', 'animalia'] } },
      { kind: 'mastery', title: 'Taxonomy check', component: 'problemSet', config: { problems: [
        { prompt: 'The three domains of life are Bacteria, Archaea and…', answer: 'Eukarya', choices: ['Eukarya', 'Animalia', 'Fungi'], hint: 'Cells with a nucleus.' },
        { prompt: 'The narrowest, most specific rank is the…', answer: 'Species', choices: ['Species', 'Kingdom', 'Domain'], hint: 'A single kind of organism.' },
        { prompt: 'Which rank comes directly below a domain?', answer: 'Kingdom', choices: ['Kingdom', 'Genus', 'Order'], hint: 'The second-broadest.' },
        { prompt: 'Organisms in the same species are…', answer: 'the most closely related', choices: ['the most closely related', 'the least related', 'unrelated'], hint: 'They can breed together.' }
      ] } }
    ]
  });

  /* ---- Unit 8 · Ecology ---- */
  reg({
    concept: 'food-chains', title: 'Food Chains & Webs',
    hook: { emoji: '🦅', text: 'A hawk owes its lunch to the sun — trace the energy back and every meal starts with a plant.', sub: 'How does energy travel through an ecosystem?' },
    steps: [
      { kind: 'explore', title: 'Build a food chain', component: 'foodChain', config: {
        prompt: 'Tap the organisms in order of energy flow — producer first, then who eats whom.',
        chain: [{ label: 'Grass', emoji: '🌱' }, { label: 'Grasshopper', emoji: '🦗' }, { label: 'Frog', emoji: '🐸' }, { label: 'Snake', emoji: '🐍' }, { label: 'Hawk', emoji: '🦅' }] } },
      { kind: 'discover', title: 'Energy flows one way', text: 'A food chain starts with a <b>producer</b> (a plant that makes food from sunlight), then a <b>primary consumer</b> that eats it, then <b>secondary</b> and <b>tertiary consumers</b>. Arrows point in the direction the <i>energy</i> flows — from the eaten to the eater.', rule: 'Producer → primary → secondary → tertiary consumer' },
      { kind: 'practice', difficulty: 'easy', title: 'A pond chain', component: 'foodChain', config: {
        prompt: 'Build this pond food chain.',
        chain: [{ label: 'Algae', emoji: '🟢' }, { label: 'Water flea', emoji: '🦐' }, { label: 'Minnow', emoji: '🐟' }, { label: 'Heron', emoji: '🦤' }] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'A longer chain', component: 'foodChain', config: {
        prompt: 'This ocean chain has six links.',
        chain: [{ label: 'Phytoplankton', emoji: '🦠' }, { label: 'Zooplankton', emoji: '🦐' }, { label: 'Herring', emoji: '🐟' }, { label: 'Seal', emoji: '🦭' }, { label: 'Orca', emoji: '🐋' }] } },
      { kind: 'mastery', title: 'Food chain check', component: 'problemSet', config: { problems: [
        { prompt: 'The organism at the START of every food chain is a…', answer: 'producer', choices: ['producer', 'predator', 'decomposer'], hint: 'It makes its own food.' },
        { prompt: 'An animal that eats plants directly is a ___ consumer.', answer: 'primary', choices: ['primary', 'secondary', 'tertiary'], hint: 'First in line after the plant.' },
        { prompt: 'In a food chain, arrows point…', answer: 'toward the eater', choices: ['toward the eater', 'toward the eaten', 'both ways'], hint: 'Follow the energy.' },
        { prompt: 'Roughly how much energy passes to the next level?', answer: 'About 10%', choices: ['About 10%', 'About 90%', 'All of it'], hint: 'Most is lost as heat.' }
      ] } }
    ]
  });

  reg({
    concept: 'populations', title: 'Population Growth',
    hook: { emoji: '🐇', text: 'Bring a few rabbits to an island with endless grass and no foxes — soon there are thousands. But it never lasts forever.', sub: 'What decides how big a population can get?' },
    steps: [
      { kind: 'explore', title: 'Balance the population', intro: 'A population grows when births beat deaths, and shrinks when deaths win. Find the balance point.', component: 'simSlider', config: {
        prompt: 'Adjust the rates until the population holds steady (births ≈ deaths).',
        vars: [
          { id: 'births', label: 'Birth rate', min: 0, max: 100, step: 5, value: 80, unit: '' },
          { id: 'deaths', label: 'Death rate', min: 0, max: 100, step: 5, value: 20, unit: '' }
        ],
        outputs: [
          { id: 'growth', label: 'Growth (births − deaths)', unit: '', color: '#4f9a54', max: 100, fn: v => Math.max(0, v.births - v.deaths) },
          { id: 'decline', label: 'Decline (deaths − births)', unit: '', color: '#c85b5b', max: 100, fn: v => Math.max(0, v.deaths - v.births) }
        ],
        viz: v => v.births - v.deaths > 5 ? '🐇🐇🐇 booming' : v.deaths - v.births > 5 ? '🐇 crashing' : '🐇🐇 stable',
        goal: { text: 'Make the population hold steady (carrying capacity).', done: 'Stable! Births balance deaths — the population sits at its carrying capacity.', test: v => Math.abs(v.births - v.deaths) <= 5 }
      } },
      { kind: 'discover', title: 'Growth meets its limits', text: 'With plenty of resources a population grows fast (exponentially). But food, space, water and predators are limited — this ceiling is the <b>carrying capacity</b>. There, births and deaths balance and growth levels off.', rule: 'Growth slows and levels off at the carrying capacity' },
      { kind: 'mastery', title: 'Population check', component: 'problemSet', config: { problems: [
        { prompt: 'A population grows when the birth rate is ___ the death rate.', answer: 'greater than', choices: ['greater than', 'less than', 'equal to'], hint: 'More born than die.' },
        { prompt: 'The maximum population an environment can sustain is its…', answer: 'carrying capacity', choices: ['carrying capacity', 'biomass', 'niche'], hint: 'The ceiling.' },
        { prompt: 'Which is a limiting factor on population growth?', answer: 'Food supply', choices: ['Food supply', 'The colour of the sky', 'The day of the week'], hint: 'A resource that runs short.' }
      ] } }
    ]
  });

  /* ---- Unit 9 · Human Body ---- */
  reg({
    concept: 'organ-systems', title: 'Organs & Systems',
    hook: { emoji: '🫀', text: 'Right now your heart, lungs, gut and brain are all cooperating without a single conscious instruction from you.', sub: 'How is the body organised into teams that keep you alive?' },
    steps: [
      { kind: 'explore', title: 'Tour the body', intro: 'Click the organs to see what they do and which system they belong to.', component: 'diagramExplore', config: { topic: 'body-systems', need: 5, prompt: 'Explore at least 5 organs in the body.' } },
      { kind: 'discover', title: 'Organs form systems', text: 'Organs that share a job form an <b>organ system</b>: the heart and vessels make the <b>circulatory</b> system, the lungs the <b>respiratory</b> system, the brain and nerves the <b>nervous</b> system. The systems then work together to keep the whole body alive.', rule: 'Cells → tissues → organs → organ systems → the whole organism' },
      { kind: 'practice', difficulty: 'easy', title: 'Which system?', component: 'matchPairs', config: {
        prompt: 'Match each organ to its system.',
        pairs: [
          { left: 'Heart', right: 'Circulatory' },
          { left: 'Lungs', right: 'Respiratory' },
          { left: 'Brain', right: 'Nervous' },
          { left: 'Stomach', right: 'Digestive' },
          { left: 'Kidneys', right: 'Excretory' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Find the organ', component: 'labelHunt', config: { topic: 'body-systems', targets: ['heart', 'lungs', 'brain', 'kidneys', 'stomach'] } },
      { kind: 'mastery', title: 'Body systems check', component: 'problemSet', config: { problems: [
        { prompt: 'The heart is the pump of the ___ system.', answer: 'circulatory', choices: ['circulatory', 'nervous', 'digestive'], hint: 'It moves blood.' },
        { prompt: 'Gas exchange (taking in oxygen) is the job of the ___ system.', answer: 'respiratory', choices: ['respiratory', 'skeletal', 'excretory'], hint: 'Think lungs.' },
        { prompt: 'The brain and spinal cord belong to the ___ system.', answer: 'nervous', choices: ['nervous', 'muscular', 'circulatory'], hint: 'It carries signals.' },
        { prompt: 'A group of organs working together is an organ…', answer: 'system', choices: ['system', 'tissue', 'cell'], hint: 'The level above an organ.' }
      ] } }
    ]
  });
})();
