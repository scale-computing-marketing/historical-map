/* Learning Atlas — Mathematics · Kindergarten lessons.
   Each lesson follows the platform flow: a curiosity Hook, hands-on Explore,
   a short Discover that names what the learner just did, then Practice, an
   optional Challenge (for the 3rd star) and a Mastery check. Registered by
   concept id on MATH.Player.                                                    */
(function () {
  const P = window.MATH.Player, U = window.MATH.util;
  const reg = P.register;

  reg({
    concept: 'count-10', title: 'Counting to 10',
    hook: { emoji: '🍪', text: 'How many cookies are on the table?', sub: 'And is a longer row always more?' },
    steps: [
      { kind: 'explore', title: 'Meet the number rods', intro: 'Longer rods hold more. Find each length by counting its red and blue parts.', component: 'numberRods', config: { mode: 'identify', max: 10, rounds: 3 } },
      { kind: 'discover', title: 'Number is amount', text: 'Each rod is one part longer than the last. Whether you count parts on a rod or objects on a table, the <b>last number you say is how many</b> — that is counting.' },
      { kind: 'practice', difficulty: 'easy', title: 'Count the turtles', component: 'counter', config: { emoji: '🐢', min: 4, max: 8, rounds: 3 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Bigger groups', intro: 'Now count all the way up to 10.', component: 'counter', config: { emoji: '⭐', min: 7, max: 10, rounds: 3 } },
      { kind: 'mastery', title: 'How many?', intro: 'Look and tell how many — quick as you can.', component: 'problemSet',
        config: { generate(d) { const n = d === 'challenge' ? [6, 10] : [3, 8]; return U.range(4).map(() => { const k = U.rand(n[0], n[1]); return { prompt: `How many? <div class="m-emoji-row">${U.range(k).map(() => '🍎').join('')}</div>`, answer: k, hint: 'Count each apple once.' }; }); } } }
    ]
  });

  reg({
    concept: 'compare-qty', title: 'Comparing Quantities',
    hook: { emoji: '🐘', text: 'Which group has more?', sub: 'The elephants or the mice — how can you be sure?' },
    steps: [
      { kind: 'explore', title: 'More, fewer, or the same', component: 'compare', config: { rounds: 4, max: 6, emoji: '🍓' } },
      { kind: 'discover', title: 'The bigger number wins', text: 'Count each group. The one with the bigger number has <b>more</b>. We write <b>&gt;</b> (greater than) and <b>&lt;</b> (less than) — the open mouth always points at the bigger number.' },
      { kind: 'practice', difficulty: 'easy', title: 'Pick the sign', component: 'compare', config: { rounds: 4, max: 9, emoji: '🐟' } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Trickier groups', component: 'compare', config: { rounds: 5, max: 12, emoji: '🎈' } },
      { kind: 'mastery', title: 'Which sign?', component: 'problemSet',
        config: { generate() { return U.range(4).map(() => { const a = U.rand(1, 12), b = U.rand(1, 12); const ans = a > b ? '>' : a < b ? '<' : '='; return { prompt: `Which sign makes it true?<br><b class="m-big">${a} &nbsp;?&nbsp; ${b}</b>`, answer: ans, choices: ['<', '=', '>'], hint: 'The open side points at the bigger number.' }; }); } } }
    ]
  });

  reg({
    concept: 'patterns-k', title: 'Patterns',
    hook: { emoji: '🔺', text: 'Can you predict what comes next?', sub: '🔺 🔵 🔺 🔵 🔺 …' },
    steps: [
      { kind: 'explore', title: 'Find what repeats', component: 'pattern', config: { rounds: 3 } },
      { kind: 'discover', title: 'Patterns repeat', text: 'A pattern has a part that <b>repeats</b> over and over. Once you spot the repeating part, you can always tell what comes next.' },
      { kind: 'practice', difficulty: 'easy', title: 'Keep it going', component: 'pattern', config: { rounds: 4 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Longer patterns', component: 'pattern', config: { rounds: 5 } },
      { kind: 'mastery', title: 'What comes next?', component: 'pattern', config: { rounds: 3 } }
    ]
  });

  reg({
    concept: 'shapes-2d', title: '2D Shapes',
    hook: { emoji: '🔺', text: 'Which of these is a triangle?', sub: 'Look at the sides and corners.' },
    steps: [
      { kind: 'explore', title: 'Meet the shapes', intro: 'First learn their names, then prove you know them.', component: 'threePeriod', config: { items: [{ id: 'circle', label: 'circle', shape: 'circle' }, { id: 'square', label: 'square', shape: 'square' }, { id: 'triangle', label: 'triangle', shape: 'triangle' }] } },
      { kind: 'discover', title: 'Shapes have names', text: 'We name flat shapes by their <b>sides</b>. A <b>triangle</b> has 3 sides, a <b>square</b> has 4 equal sides, and a <b>circle</b> has no sides at all — it is perfectly round.' },
      { kind: 'practice', difficulty: 'easy', title: 'Sort the shapes', component: 'shapeSort', config: { kinds: ['circle', 'square', 'triangle', 'star'], perKind: 2 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Every shape', component: 'shapeSort', config: { kinds: ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond'], perKind: 2 } },
      { kind: 'mastery', title: 'Know your shapes', component: 'problemSet',
        config: { problems: [
          { prompt: 'How many sides does a <b>triangle</b> have?', answer: '3', choices: ['2', '3', '4'], hint: 'Tri- means three.' },
          { prompt: 'How many sides does a <b>square</b> have?', answer: '4', choices: ['3', '4', '5'], hint: 'Count the corners.' },
          { prompt: 'Which shape is perfectly round with no sides?', answer: 'circle', choices: ['circle', 'square', 'triangle'], hint: 'It has no corners.' },
          { prompt: 'A shape with 6 sides is a…', answer: 'hexagon', choices: ['pentagon', 'hexagon', 'triangle'], hint: 'Hex- means six.' }
        ] } }
    ]
  });

  reg({
    concept: 'add-10', title: 'Adding within 10',
    hook: { emoji: '🍎', text: 'You have 3 apples and get 2 more.', sub: 'How many apples do you have now?' },
    steps: [
      { kind: 'explore', title: 'Join two rods', intro: 'Lay one rod after another — where do they reach?', component: 'numberRods', config: { mode: 'add', max: 10, rounds: 3 } },
      { kind: 'discover', title: 'That is addition', text: 'Adding means joining two amounts and measuring the whole. Laying a rod of 3 and a rod of 2 end-to-end reaches 5: we write <b>3 + 2 = 5</b>.' },
      { kind: 'practice', difficulty: 'easy', title: 'Fill the frames', component: 'tenFrame', config: { mode: 'add', rounds: 3 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Add in your head', component: 'problemSet',
        config: { generate() { return U.range(4).map(() => { const a = U.rand(2, 6), b = U.rand(2, 10 - a); return { prompt: `<b class="m-big">${a} + ${b} = ?</b>`, answer: a + b, hint: 'Count on from the bigger number.' }; }); } } },
      { kind: 'mastery', title: 'Sums to 10', component: 'problemSet',
        config: { generate() { return U.range(5).map(() => { const a = U.rand(1, 5), b = U.rand(1, 5); return { prompt: `<b class="m-big">${a} + ${b} = ?</b>`, answer: a + b, hint: 'Use your fingers or a ten frame.' }; }); } } }
    ]
  });
})();
