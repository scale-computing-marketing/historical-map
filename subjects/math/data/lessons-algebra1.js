/* Learning Atlas — Mathematics · Algebra I lessons.
   Seven concepts carry the full 9-stage arc (Hook → Warm-up → Explore → Discover →
   Practice → Challenge → Mastery → Reflect → Extend), each aligned to Indiana
   Algebra I standards and using a real manipulative as the teaching tool — the
   equationBalance scale and the lineGrapher, plus the function machine. Summative
   checks tag their distractors with the misconception each reveals. Registered on
   MATH.Player by concept id.                                                      */
(function () {
  const P = window.MATH.Player, U = window.MATH.util;
  const reg = P.register;

  /* ---- AI.L.1 · Solving Linear Equations -------------------------------- */
  reg({
    concept: 'solve-linear-eq', title: 'Solving Linear Equations',
    standards: ['AI.L.1'],
    hook: { emoji: '⚖️', text: 'A scale balances only when both sides weigh the same.', sub: 'Solving an equation is just keeping that balance while you get x alone.' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'In <b>x + 5 = 12</b>, what should you do to <b>both sides</b> to get x by itself?',
        options: ['Add 5 to both sides', 'Subtract 5 from both sides', 'Move the 5 across and flip its sign'] },
      { kind: 'explore', title: 'Balance the scale', intro: 'Do the same inverse operation to both sides until x is alone.', component: 'equationBalance', config: { rounds: 3 } },
      { kind: 'discover', title: 'Keep it balanced', text: 'An equation is a balance. To undo <b>+ b</b> you subtract b <b>from both sides</b>; to undo <b>× a</b> you divide both sides by a. Do the same thing to each side and the two sides stay equal — that is how x gets alone.', rule: 'Whatever you do to one side, do to the other' },
      { kind: 'practice', difficulty: 'easy', title: 'Solve for x', component: 'problemSet',
        config: { generate() { return U.range(3).map(() => { const a = U.rand(2, 5), x = U.rand(1, 8), b = U.rand(1, 9), c = a * x + b; return { prompt: `Solve: <b class="m-big">${a}x + ${b} = ${c}</b>`, answer: x, hint: `First subtract ${b} from both sides, then divide by ${a}.` }; }); } } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Variables on both sides', component: 'problemSet',
        config: { generate() { return U.range(3).map(() => { const x = U.rand(1, 6), a = U.rand(3, 6), bLeft = U.rand(1, 5); const cRight = U.rand(1, 3); const bRight = (a - cRight) * x + bLeft; return { prompt: `Solve: <b class="m-big">${a}x + ${bLeft} = ${cRight}x + ${bRight}</b>`, answer: x, hint: `Get the x's on one side: subtract ${cRight}x from both sides first.` }; }); } } },
      { kind: 'mastery', title: 'Solve each equation', component: 'problemSet',
        config: { problems: [
          { prompt: 'Solve: <b>x + 7 = 3</b>. &nbsp; x =', answer: '−4', choices: ['−4', '4', '10', '−10'], hint: 'Subtract 7 from both sides.', misconceptions: { '4': 'You added 7 instead of subtracting it', '10': 'Adding 7 gives 10 — but you need the inverse: subtract' } },
          { prompt: 'Solve: <b>2x = 10</b>. &nbsp; x =', answer: '5', choices: ['5', '20', '8', '12'], hint: 'Divide both sides by 2.', misconceptions: { '20': 'You multiplied by 2 instead of dividing', '8': 'You subtracted 2 — the inverse of × is ÷' } },
          { prompt: 'Solve: <b>3x + 2 = 14</b>. &nbsp; x =', answer: '4', choices: ['4', '6', '16', '12'], hint: 'Subtract 2 first, then divide by 3.', misconceptions: { '6': 'You divided 14 by 3 before subtracting the 2', '16': 'You added instead of using inverse operations' } },
          { prompt: 'Solve: <b>5x − 3 = 12</b>. &nbsp; x =', answer: '3', choices: ['3', '9', '15', '1.8'], hint: 'Add 3 to both sides, then divide by 5.', misconceptions: { '9': 'You subtracted 3 again instead of adding it back', '1.8': 'You divided before adding the 3 back' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'Why do you have to do the same thing to BOTH sides of an equation? What happens if you don’t?',
        starters: ['I do the same to both sides because', 'Solving is the opposite of', 'The scale would'] },
      { kind: 'extend', title: 'Go further', intro: 'Push the balance idea further.',
        items: [
          { icon: '📐', label: 'Solve for a letter', detail: 'Rearrange the perimeter formula P = 2l + 2w to solve for w. Same moves, letters instead of numbers.' },
          { icon: '💸', label: 'Real-world setup', detail: 'A gym costs $25 to join plus $10/month. Write and solve an equation for how many months make the total $95.' },
          { icon: '⚖️', label: 'Break the balance', detail: 'Try adding to only ONE side of a real balance scale. What happens? Why must equations avoid that?' }
        ] }
    ]
  });

  /* ---- AI.L.3 · Slope ---------------------------------------------------- */
  reg({
    concept: 'slope', title: 'Slope',
    standards: ['AI.L.3'],
    hook: { emoji: '📈', text: 'A wheelchair ramp, a ski run, a staircase — all the same idea: how steep?', sub: 'How do we put a single number on the steepness of a line?' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'A line goes <b>up 6</b> every time it goes <b>2 to the right</b>. How steep is it (its slope)?',
        options: ['3', '8', '12'] },
      { kind: 'explore', title: 'Feel the slope', intro: 'Build each target line — watch how the slope tilts it.', component: 'lineGrapher', config: { mode: 'explore', rounds: 3 } },
      { kind: 'discover', title: 'Rise over run', text: 'Slope measures steepness as <b>rise ÷ run</b> — how far the line goes <b>up</b> for each step to the <b>right</b>. A line going up has a <b>positive</b> slope; going down is <b>negative</b>; flat is <b>0</b>.', rule: 'slope = rise ÷ run' },
      { kind: 'practice', difficulty: 'easy', title: 'Read the line', component: 'lineGrapher', config: { mode: 'read', rounds: 2 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Slope from two points', component: 'problemSet',
        config: { generate() { return U.range(3).map(() => { const x1 = U.rand(-4, 0), x2 = U.rand(1, 4), m = U.pick([-2, -1, 1, 2, 3]), y1 = U.rand(-3, 3), y2 = y1 + m * (x2 - x1); return { prompt: `Slope through <b>(${x1}, ${y1})</b> and <b>(${x2}, ${y2})</b>?`, answer: m, hint: '(change in y) ÷ (change in x).' }; }); } } },
      { kind: 'mastery', title: 'Find the slope', component: 'problemSet',
        config: { problems: [
          { prompt: 'A line rises <b>4</b> for every <b>2</b> across. Its slope is…', answer: '2', choices: ['2', '1/2', '8', '−2'], hint: 'rise ÷ run.', misconceptions: { '1/2': 'That’s run ÷ rise — slope is rise ÷ run', '−2': 'A rising line has a positive slope' } },
          { prompt: 'Through <b>(0, 1)</b> and <b>(2, 5)</b>, the slope is…', answer: '2', choices: ['2', '3', '1/2', '−2'], hint: 'Change in y over change in x.', misconceptions: { '3': 'That’s the change in x plus 1 — use rise ÷ run', '1/2': 'You put run over rise' } },
          { prompt: 'A <b>horizontal</b> line has slope…', answer: '0', choices: ['0', '1', 'undefined'], hint: 'It never rises.', misconceptions: { 'undefined': 'A vertical line is undefined; a horizontal line is 0' } },
          { prompt: 'Going <b>down 3</b> for every <b>1</b> across, the slope is…', answer: '−3', choices: ['−3', '3', '−1/3'], hint: 'Down means negative.', misconceptions: { '3': 'A falling line has a negative slope', '−1/3': 'You swapped rise and run' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'How can you tell, just by looking, whether a line’s slope is positive, negative, or zero?',
        starters: ['A positive slope', 'A negative slope', 'The bigger the number, the'] },
      { kind: 'extend', title: 'Go further', intro: 'Find slope in the world.',
        items: [
          { icon: '🛹', label: 'Slope hunt', detail: 'Find a ramp or roof and estimate its rise and run. What’s its slope? Is a 1/12 wheelchair ramp steep?' },
          { icon: '↔️', label: 'Zero vs. undefined', detail: 'Why is a flat line slope 0 but a vertical line “undefined”? Try rise ÷ run when the run is 0.' },
          { icon: '📊', label: 'Slope as a rate', detail: 'On a distance-vs-time graph, what does the slope actually measure?' }
        ] }
    ]
  });

  /* ---- AI.L.3 / AI.L.5 · Slope-Intercept Form --------------------------- */
  reg({
    concept: 'slope-intercept', title: 'Slope-Intercept Form',
    standards: ['AI.L.3', 'AI.L.5'],
    hook: { emoji: '📐', text: 'One tidy formula — y = mx + b — describes an entire line at a glance.', sub: 'If you know only the slope and the starting height, can you draw the whole line?' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'In <b>y = 3x + 2</b>, which number tells you where the line <b>crosses the y-axis</b>?',
        options: ['3', '2', 'x'] },
      { kind: 'explore', title: 'Build y = mx + b', intro: 'Change m and b and watch the line respond.', component: 'lineGrapher', config: { mode: 'explore', rounds: 3 } },
      { kind: 'discover', title: 'What m and b do', text: 'In <b>y = mx + b</b>, <b>m</b> is the <b>slope</b> (the tilt) and <b>b</b> is the <b>y-intercept</b> (where the line crosses the y-axis). Change m and the line pivots; change b and it slides up or down.', rule: 'y = mx + b  →  m = slope, b = y-intercept' },
      { kind: 'practice', difficulty: 'easy', title: 'Name m and b', component: 'problemSet',
        config: { generate() { return U.range(4).map(() => { const m = U.pick([-3, -2, -1, 1, 2, 3]), b = U.rand(-5, 5); const ask = U.pick(['m', 'b']); return ask === 'm' ? { prompt: `In <b>y = ${m}x ${b < 0 ? '− ' + -b : '+ ' + b}</b>, the <b>slope</b> is…`, answer: m, hint: 'The number multiplied by x.' } : { prompt: `In <b>y = ${m}x ${b < 0 ? '− ' + -b : '+ ' + b}</b>, the <b>y-intercept</b> is…`, answer: b, hint: 'The constant on its own.' }; }); } } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Match the line', component: 'lineGrapher', config: { mode: 'read', rounds: 2 } },
      { kind: 'mastery', title: 'Read the equation', component: 'problemSet',
        config: { problems: [
          { prompt: 'In <b>y = −2x + 5</b>, the <b>slope</b> is…', answer: '−2', choices: ['−2', '5', '2', '−5'], hint: 'The coefficient of x.', misconceptions: { '5': 'That’s the y-intercept, not the slope', '2': 'Keep the negative sign' } },
          { prompt: 'In <b>y = 4x − 3</b>, the <b>y-intercept</b> is…', answer: '−3', choices: ['−3', '4', '3', '−4'], hint: 'The constant term.', misconceptions: { '4': 'That’s the slope', '3': 'The intercept is negative here' } },
          { prompt: 'A line with slope <b>1</b> crossing y at <b>−2</b> is…', answer: 'y = x − 2', choices: ['y = x − 2', 'y = −2x + 1', 'y = x + 2', 'y = 2x − 1'], hint: 'y = mx + b.', misconceptions: { 'y = −2x + 1': 'You swapped the slope and the intercept' } },
          { prompt: 'Which line is <b>steeper</b>?', answer: 'y = 5x − 1', choices: ['y = 5x − 1', 'y = 2x + 9'], hint: 'Steepness is the slope.', misconceptions: { 'y = 2x + 9': 'Steepness is the slope (5 > 2), not the intercept' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'Why is y = mx + b so useful? What can you tell about a line the instant you see it in this form?',
        starters: ['From y = mx + b I can immediately see', 'The b tells me', 'The m tells me'] },
      { kind: 'extend', title: 'Go further', intro: 'Other forms, same line.',
        items: [
          { icon: '🔁', label: 'Other forms', detail: 'Standard form is Ax + By = C. Rearrange 2x + y = 4 into y = mx + b. Which form shows the slope faster?' },
          { icon: '📱', label: 'Model a plan', detail: 'A plan charges $30 up front plus $15/month. Write it as y = mx + b. What are m and b in real terms?' },
          { icon: '✏️', label: 'Sketch from scratch', detail: 'Given y = −½x + 3, plot the intercept, then use the slope to step to the next point.' }
        ] }
    ]
  });

  /* ---- AI.F.1 / AI.F.2 · Functions & Notation --------------------------- */
  reg({
    concept: 'function-basics', title: 'Functions & Notation',
    standards: ['AI.F.1', 'AI.F.2'],
    hook: { emoji: '⚙️', text: 'A function is a machine: one input goes in, exactly one output comes out.', sub: 'Could the same input ever give two different outputs?' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'A machine follows the rule <b>f(x) = 2x + 1</b>. What is <b>f(3)</b>?',
        options: ['7', '6', '5'] },
      { kind: 'explore', title: 'Run the machine', intro: 'Apply the rule to each input.', component: 'functionMachine', config: { mode: 'apply', rounds: 3 } },
      { kind: 'discover', title: 'What f(x) means', text: '<b>f(x)</b> is just a name for the output when the input is x. A relation is a <b>function</b> only if every input has <b>exactly one</b> output — put the same number in, you always get the same answer out.', rule: 'f(x) = the one output for input x' },
      { kind: 'practice', difficulty: 'easy', title: 'Find the rule', component: 'functionMachine', config: { mode: 'infer', rounds: 2 } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Evaluate functions', component: 'problemSet',
        config: { generate() { return U.range(3).map(() => { const a = U.rand(2, 5), b = U.rand(-4, 4), x = U.rand(-3, 5); return { prompt: `If <b>f(x) = ${a}x ${b < 0 ? '− ' + -b : '+ ' + b}</b>, then <b>f(${x})</b> =`, answer: a * x + b, hint: `Multiply by ${a}, then ${b < 0 ? 'subtract ' + -b : 'add ' + b}.` }; }); } } },
      { kind: 'mastery', title: 'Function check', component: 'problemSet',
        config: { problems: [
          { prompt: 'If <b>f(x) = 3x − 2</b>, then <b>f(4)</b> =', answer: '10', choices: ['10', '12', '5', '14'], hint: 'Multiply first, then subtract.', misconceptions: { '12': 'You found 3×4 but forgot the − 2', '5': 'That’s 3 + 4 − 2 — multiply before you add' } },
          { prompt: 'If <b>f(x) = x² + 1</b>, then <b>f(3)</b> =', answer: '10', choices: ['10', '7', '9', '16'], hint: 'Square first.', misconceptions: { '7': '3² is 9, not 6', '9': 'You forgot to add the 1' } },
          { prompt: 'Which is <b>NOT</b> a function?', answer: '{(1,2), (1,5)}', choices: ['{(1,2), (1,5)}', '{(1,2), (2,5)}', '{(1,2), (3,2)}'], hint: 'One input, two outputs?', misconceptions: { '{(1,2), (3,2)}': 'Two inputs sharing an output is fine — the problem is one input with two outputs' } },
          { prompt: 'For <b>f(x) = 5</b>, what is <b>f(100)</b>?', answer: '5', choices: ['5', '100', '500'], hint: 'It’s a constant function.', misconceptions: { '100': 'Every input maps to 5 — the output never changes' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'What makes a relation a function? Give an everyday example of a rule that IS a function and one that isn’t.',
        starters: ['A relation is a function when', 'A function I use every day is', 'It is NOT a function if'] },
      { kind: 'extend', title: 'Go further', intro: 'See functions everywhere.',
        items: [
          { icon: '📏', label: 'The vertical line test', detail: 'Why does a vertical line crossing a graph twice mean it’s not a function?' },
          { icon: '🎛️', label: 'Domain limits', detail: 'For f(x) = 1/x, what input is not allowed? Functions can have inputs they refuse.' },
          { icon: '🔗', label: 'Compose machines', detail: 'If f(x) = x + 1 and g(x) = 2x, what does g(f(3)) give? Feed one machine into the next.' }
        ] }
    ]
  });

  /* ---- AI.SEI.1 · Systems by Graphing ----------------------------------- */
  reg({
    concept: 'systems', title: 'Systems by Graphing',
    standards: ['AI.SEI.1'],
    hook: { emoji: '✖️', text: 'Two lines, two rules — but is there a single (x, y) that makes BOTH true at once?', sub: 'Where would two phone plans cost exactly the same?' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'Two lines are graphed. The <b>solution</b> to the system is…',
        options: ['where the lines cross', 'where each line hits the y-axis', 'the steeper line'] },
      { kind: 'explore', title: 'Find the crossing', intro: 'Click the point that sits on both lines.', component: 'lineGrapher', config: { mode: 'system', rounds: 3 } },
      { kind: 'discover', title: 'One point, both rules', text: 'The <b>solution</b> of a system is the point that lies on <b>both</b> lines — the (x, y) that satisfies both equations. Lines that cross once have <b>one</b> solution; parallel lines have <b>none</b>; the same line drawn twice has <b>infinitely many</b>.', rule: 'Solution = the point on BOTH lines' },
      { kind: 'practice', difficulty: 'easy', title: 'Does the point fit?', component: 'problemSet',
        config: { problems: [
          { prompt: 'Is <b>(2, 5)</b> on <b>y = 2x + 1</b>?', answer: 'Yes', choices: ['Yes', 'No'], hint: '2(2)+1 = ?' },
          { prompt: 'Is <b>(1, 4)</b> on <b>y = x + 3</b>?', answer: 'Yes', choices: ['Yes', 'No'], hint: '1 + 3 = ?' },
          { prompt: 'Is <b>(0, 0)</b> on <b>y = x + 2</b>?', answer: 'No', choices: ['Yes', 'No'], hint: '0 + 2 ≠ 0.' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'How many solutions?', component: 'problemSet',
        config: { problems: [
          { prompt: 'Lines with <b>different slopes</b> have how many solutions?', answer: 'One', choices: ['One', 'None', 'Infinite'], hint: 'They cross exactly once.' },
          { prompt: '<b>y = 2x + 1</b> and <b>y = 2x + 6</b> have…', answer: 'No solution', choices: ['No solution', 'One solution', 'Infinite'], hint: 'Same slope, different intercept.' },
          { prompt: '<b>y = x + 4</b> and <b>y = x + 4</b> have…', answer: 'Infinite solutions', choices: ['Infinite solutions', 'One solution', 'No solution'], hint: 'It’s the same line.' }
        ] } },
      { kind: 'mastery', title: 'Systems check', component: 'problemSet',
        config: { problems: [
          { prompt: 'The solution graphed as two crossing lines is…', answer: 'the intersection point', choices: ['the intersection point', 'the two y-intercepts', 'the origin'], hint: 'Where they meet.', misconceptions: { 'the two y-intercepts': 'Intercepts are where each line meets an axis, not each other', 'the origin': 'Only if the lines happen to cross at (0,0)' } },
          { prompt: 'Same slope, <b>different</b> intercepts →', answer: 'no solution', choices: ['no solution', 'one solution', 'infinite solutions'], hint: 'Picture parallel lines.', misconceptions: { 'one solution': 'Parallel lines never cross', 'infinite solutions': 'Different intercepts means they’re never the same line' } },
          { prompt: '<b>y = x + 1</b> and <b>y = x + 1</b> have…', answer: 'infinite solutions', choices: ['infinite solutions', 'one solution', 'no solution'], hint: 'Compare the two equations.', misconceptions: { 'one solution': 'They are the SAME line — every point works', 'no solution': 'Identical lines overlap everywhere' } },
          { prompt: 'Is <b>(2, 5)</b> a solution of <b>y = 2x + 1</b> AND <b>y = x + 3</b>?', answer: 'Yes', choices: ['Yes', 'No'], hint: 'Test both.', misconceptions: { 'No': 'Check both: 2(2)+1 = 5 ✓ and 2+3 = 5 ✓ — it fits both' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'How can two lines have NO solution? How can they have infinitely many? Sketch each in your head.',
        starters: ['No solution happens when', 'Infinite solutions happen when', 'One solution is the usual case because'] },
      { kind: 'extend', title: 'Go further', intro: 'Beyond graphing.',
        items: [
          { icon: '📱', label: 'Break-even', detail: 'Plan A: $40 + $10/mo. Plan B: $10 + $20/mo. Graph both — after how many months do they cost the same?' },
          { icon: '🧮', label: 'Solve without graphing', detail: 'Graphing is approximate. Substitution and elimination find the exact crossing — that’s the next concept.' },
          { icon: '🚗', label: 'Two travelers', detail: 'Two cars start apart and drive toward each other. When (and where) do their distance-time lines cross?' }
        ] }
    ]
  });

  /* ---- AI.NE.2 · Exponent Rules ----------------------------------------- */
  reg({
    concept: 'exponent-rules', title: 'Exponent Rules',
    standards: ['AI.NE.2'],
    hook: { emoji: '🔢', text: '3² × 3⁴ — do you add the exponents, or multiply them?', sub: 'Every exponent rule hides a simple counting shortcut. Let’s uncover it.' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'What does <b>2³</b> mean?',
        options: ['2 × 2 × 2', '2 × 3', '3 × 3'] },
      { kind: 'explore', title: 'Count the factors', intro: 'Expand each one and count — the rule will jump out.', component: 'problemSet',
        config: { problems: [
          { prompt: '<b>3² × 3³</b> means (3·3)(3·3·3) = 3 to the power…?', answer: '5', choices: ['5', '6', '9'], hint: 'Count how many 3’s are multiplied: 2 + 3.' },
          { prompt: '<b>x⁴ × x²</b> = x to the power…?', answer: '6', choices: ['6', '8', '2'], hint: 'Line up the x’s: 4 + 2.' },
          { prompt: '<b>x⁵ ÷ x²</b> = x to the power…?', answer: '3', choices: ['3', '7', '2.5'], hint: 'Cancel matching x’s: 5 − 2.' }
        ] } },
      { kind: 'discover', title: 'The exponent rules', text: 'Same base? <b>Multiply → add</b> exponents (xᵃ·xᵇ = xᵃ⁺ᵇ). <b>Divide → subtract</b> (xᵃ ÷ xᵇ = xᵃ⁻ᵇ). <b>Power of a power → multiply</b> ((xᵃ)ᵇ = xᵃᵇ). And anything (nonzero) to the <b>0</b> power is <b>1</b>.', rule: 'multiply → add · divide → subtract · power of power → multiply' },
      { kind: 'practice', difficulty: 'easy', title: 'Apply a rule', component: 'problemSet',
        config: { problems: [
          { prompt: '<b>x² · x³</b> =', answer: 'x⁵', choices: ['x⁵', 'x⁶', 'x¹'], hint: 'Add the exponents.' },
          { prompt: '<b>x⁹ ÷ x⁴</b> =', answer: 'x⁵', choices: ['x⁵', 'x¹³', 'x²'], hint: 'Subtract the exponents.' },
          { prompt: '<b>(x³)²</b> =', answer: 'x⁶', choices: ['x⁶', 'x⁵', 'x⁹'], hint: 'Multiply the exponents.' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Mixed rules', component: 'problemSet',
        config: { problems: [
          { prompt: '<b>2x² · 3x⁴</b> =', answer: '6x⁶', choices: ['6x⁶', '6x⁸', '5x⁶'], hint: 'Multiply the numbers, add the exponents.' },
          { prompt: '<b>(2x²)³</b> =', answer: '8x⁶', choices: ['8x⁶', '6x⁵', '8x⁵'], hint: 'Cube the 2 AND multiply the exponent.' }
        ] } },
      { kind: 'mastery', title: 'Exponent check', component: 'problemSet',
        config: { problems: [
          { prompt: '<b>x³ · x⁴</b> =', answer: 'x⁷', choices: ['x⁷', 'x¹²', 'x', 'x⁶'], hint: 'Multiply → add.', misconceptions: { 'x¹²': 'Multiplying powers ADDS exponents (3 + 4), it doesn’t multiply them', 'x': 'You subtracted — that’s the division rule' } },
          { prompt: '<b>x⁸ ÷ x²</b> =', answer: 'x⁶', choices: ['x⁶', 'x⁴', 'x¹⁰', 'x¹⁶'], hint: 'Divide → subtract.', misconceptions: { 'x¹⁰': 'Dividing SUBTRACTS exponents (8 − 2), not adds', 'x⁴': '8 ÷ 2 is for numbers — for powers you subtract exponents' } },
          { prompt: '<b>(x²)⁵</b> =', answer: 'x¹⁰', choices: ['x¹⁰', 'x⁷', 'x²⁵', 'x³²'], hint: 'Power of a power → multiply.', misconceptions: { 'x⁷': 'A power of a power MULTIPLIES exponents (2 × 5), not adds', 'x²⁵': 'You raised 5, not multiplied 2 × 5' } },
          { prompt: '<b>x⁰</b> =', answer: '1', choices: ['1', '0', 'x'], hint: 'A special rule.', misconceptions: { '0': 'Any nonzero base to the 0 power is 1, not 0' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'Why does multiplying powers ADD the exponents? Explain it using what an exponent really counts.',
        starters: ['An exponent counts', 'Multiplying powers adds exponents because', 'Dividing subtracts because'] },
      { kind: 'extend', title: 'Go further', intro: 'Stretch the rules.',
        items: [
          { icon: '➖', label: 'Negative exponents', detail: 'If x⁵ ÷ x⁵ = x⁰ = 1, what must x⁻² mean? (Hint: it’s a fraction.)' },
          { icon: '🌐', label: 'Scientific notation', detail: 'Why do scientists write huge and tiny numbers as powers of 10? Multiply 10³ × 10⁵ the fast way.' },
          { icon: '½', label: 'Fractional powers', detail: 'What could x^(1/2) mean? Test it: (x^(1/2))² should equal x.' }
        ] }
    ]
  });

  /* ---- AI.DS.4 · Correlation vs. Causation ------------------------------ */
  reg({
    concept: 'correlation-causation', title: 'Correlation vs. Causation',
    standards: ['AI.DS.4'],
    hook: { emoji: '🍦', text: 'Ice-cream sales and shark attacks rise together every single summer.', sub: 'So… does eating ice cream cause shark attacks? When two things move together, what can we actually conclude?' },
    steps: [
      { kind: 'prior', title: 'What do you think?',
        prompt: 'Ice-cream sales and shark attacks both climb in summer. The best explanation is…',
        options: ['Ice cream causes shark attacks', 'A third factor (hot weather) drives both', 'Sharks are drawn to ice cream'] },
      { kind: 'explore', title: 'Cause, or coincidence?', intro: 'For each pair, decide the most likely reason they move together.', component: 'problemSet',
        config: { problems: [
          { prompt: 'More firefighters at a fire ↔ more damage. Most likely…', answer: 'Bigger fires bring both', choices: ['Bigger fires bring both', 'Firefighters cause damage'], hint: 'What causes both to be large?' },
          { prompt: 'Hours studied ↔ test score. Most likely…', answer: 'Studying helps the score', choices: ['Studying helps the score', 'High scores cause studying'], hint: 'Which direction makes sense?' },
          { prompt: 'Shoe size ↔ reading level in kids. Most likely…', answer: 'Age drives both', choices: ['Age drives both', 'Big feet help reading'], hint: 'What grows with age?' }
        ] } },
      { kind: 'discover', title: 'Linked ≠ caused', text: 'Two things moving together are <b>correlated</b> — but that alone never proves one <b>causes</b> the other. There may be a hidden <b>lurking variable</b> driving both, the cause may run the <b>other way</b>, or it may be pure <b>coincidence</b>. Only a <b>controlled experiment</b> can really show cause.', rule: 'Correlation ≠ causation' },
      { kind: 'practice', difficulty: 'easy', title: 'Spot the lurking variable', component: 'problemSet',
        config: { problems: [
          { prompt: 'Towns with more churches have more crime. The lurking variable is likely…', answer: 'Population size', choices: ['Population size', 'Churches cause crime'], hint: 'Bigger towns have more of everything.' },
          { prompt: 'People who sleep with shoes on wake with headaches. Likely cause…', answer: 'Going to bed drunk', choices: ['Going to bed drunk', 'Shoes cause headaches'], hint: 'What might cause both?' }
        ] } },
      { kind: 'challenge', difficulty: 'challenge', title: 'Which shows causation?', component: 'problemSet',
        config: { problems: [
          { prompt: 'Which is the strongest evidence of CAUSE?', answer: 'A randomized controlled experiment', choices: ['A randomized controlled experiment', 'A survey showing two things rise together', 'A striking coincidence'], hint: 'What controls other variables?' }
        ] } },
      { kind: 'mastery', title: 'Reasoning check', component: 'problemSet',
        config: { problems: [
          { prompt: 'Towns with more firefighters have more fire damage. Best conclusion?', answer: 'Bigger fires draw more firefighters', choices: ['Bigger fires draw more firefighters', 'Firefighters cause the damage', 'Fewer firefighters is safer'], hint: 'A third factor.', misconceptions: { 'Firefighters cause the damage': 'That reverses cause and effect — the big fire draws the firefighters', 'Fewer firefighters is safer': 'The fire size, not the crew, drives the damage' } },
          { prompt: 'A strong correlation <b>proves</b> one thing causes the other.', answer: 'False', choices: ['False', 'True'], hint: 'Think of ice cream and sharks.', misconceptions: { 'True': 'Correlation alone never proves causation' } },
          { prompt: 'Which best shows CAUSATION?', answer: 'A controlled experiment changing one thing', choices: ['A controlled experiment changing one thing', 'A survey where two things rise together', 'A news headline'], hint: 'What isolates the cause?', misconceptions: { 'A survey where two things rise together': 'A survey shows correlation; only a controlled experiment isolates a cause' } },
          { prompt: 'Kids’ shoe size correlates with reading ability. Why?', answer: 'Age — older kids have bigger feet and read better', choices: ['Age — older kids have bigger feet and read better', 'Big feet help you read', 'Reading makes feet grow'], hint: 'The lurking variable.', misconceptions: { 'Big feet help you read': 'A lurking variable (age) explains both', 'Reading makes feet grow': 'That’s reversed and unrelated — age drives both' } }
        ] } },
      { kind: 'reflect', title: 'Think it over',
        prompt: 'Describe two things that are correlated but where neither causes the other. What’s the real link?',
        starters: ['Two correlated things are', 'They move together because', 'To actually test for cause you would'] },
      { kind: 'extend', title: 'Go further', intro: 'Be a data skeptic.',
        items: [
          { icon: '📰', label: 'Headline hunt', detail: 'Find a news headline claiming X causes Y from a study. Was it an experiment, or just a correlation?' },
          { icon: '🧪', label: 'Design an experiment', detail: 'How would you test whether a new study app actually raises grades — not just correlates with them?' },
          { icon: '📉', label: 'Spurious correlations', detail: 'Search “spurious correlations” — nicolas cage films vs. drownings. Why do these happen?' }
        ] }
    ]
  });
})();
