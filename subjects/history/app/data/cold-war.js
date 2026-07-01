/* Historical Wars Explorer — dataset: The Cold War (1947–1991)
   PURE DATA in the same shape as the other war files. Registers itself on
   window.HWE.wars; the engine is war-agnostic and reads factions, sides and
   geometry from this object with no code changes.

   The Cold War was not a single battlefield but a global, bipolar standoff
   between a US-led West and a Soviet-led East, fought through proxy "hot wars"
   (Korea, Vietnam), crises (Berlin, Cuba) and an arms and space race. So the map
   colours the WORLD BY BLOC rather than tracking front lines — answering "which
   way did each country lean?" — with the proxy wars shown as battles.

   Geometry note: borders switch from a ~1960 basemap (a divided Germany, one
   vast USSR, two Koreas) used for 1947–1990, to a 1994 basemap from 1991 — so
   the dissolution of the Soviet Union is visible as its single red mass breaks
   into Russia and a scatter of newly independent (here uncoloured) states. Bloc
   alignments are shown at their Cold War extent; the two Vietnams and shifting
   memberships (the Sino-Soviet split, Spain joining NATO in 1982) are simplified. */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {
    gaddis: { id: 'src:gaddis', type: 'book', citation: 'John Lewis Gaddis, The Cold War: A New History (Penguin, 2005)', reliability: 'high' },
    westad: { id: 'src:westad', type: 'book', citation: 'Odd Arne Westad, The Cold War: A World History (Basic Books, 2017)', reliability: 'high' },
    service: { id: 'src:service', type: 'book', citation: 'Robert Service, The End of the Cold War, 1985–1991', reliability: 'high' },
    halberstam: { id: 'src:halberstam', type: 'book', citation: 'David Halberstam, The Coldest Winter: America and the Korean War', reliability: 'medium' },
    britannica: { id: 'src:britannica-cw2', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    hbm: { id: 'src:historical-basemaps-cw', type: 'archive', citation: 'aourednik/historical-basemaps (world_1960, world_1994), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });
  const v = (value) => ({ value });

  /* ---- NATIONS (blocs) ---------------------------------------------------
     Each bloc is one "nation" that owns many polities via geoNames. geoNames
     cover BOTH basemaps: the East lists 'USSR' (1960) and 'Russia' (1994), the
     West lists 'West Germany' (1960) and 'Germany' (1994). Anything unlisted —
     the decolonising world, the genuinely neutral states — stays neutral.      */
  const nations = [
    {
      id: 'nation:west', type: 'nation', name: 'The Western bloc', short: 'West',
      side: 'west', entered: 1947, exited: 1991, factionKey: 'west',
      capital: { name: 'Washington, D.C.', lon: -77.04, lat: 38.91 },
      geoNames: ['United States', 'Canada', 'United Kingdom', 'France', 'West Germany', 'Germany', 'Italy',
        'Belgium', 'Netherlands', 'Luxembourg', 'Norway', 'Denmark', 'Iceland', 'Portugal', 'Greece', 'Turkey',
        'Spain', 'Japan', 'Australia', 'New Zealand', 'Korea, Republic of'], geoSubjects: [],
      summary: 'The United States and its allies — bound together in NATO (1949) and a web of Pacific pacts — defending liberal-capitalist democracy and "containing" the spread of communism. Its advantages in wealth, alliances and, eventually, technology outlasted the Soviet system.',
      objectives: ['Contain the spread of communism (the Truman Doctrine)', 'Rebuild and bind Western Europe and Japan (Marshall Plan, NATO)', 'Deter Soviet attack through nuclear and conventional strength'],
      facts: [
        { attr: 'alliance', value: 'NATO — the North Atlantic Treaty Organization (from 1949)', from: 1949, to: 1991, confidence: 'high', sources: ['src:gaddis'] },
        { attr: 'leader', value: 'The President of the United States (Truman → Bush)', from: 1947, to: 1991, confidence: 'high', sources: ['src:gaddis'] },
        { attr: 'doctrine', value: 'Containment of communism (Truman Doctrine, 1947)', from: 1947, to: 1991, confidence: 'high', sources: ['src:gaddis'] },
        { attr: 'population', value: r(400000000, 700000000), from: 1947, to: 1991, confidence: 'low', sources: ['src:britannica-cw2'], note: 'NATO members + close Pacific allies; grew with the alliance.' }
      ]
    },
    {
      id: 'nation:east', type: 'nation', name: 'The Eastern bloc', short: 'East',
      side: 'east', entered: 1947, exited: 1991, factionKey: 'east',
      capital: { name: 'Moscow', lon: 37.62, lat: 55.75 },
      /* 'USSR' (1960) → 'Russia' (1994) shows the collapse; the former republics
         and Warsaw Pact satellites keep their own names and mostly turn neutral
         on the 1994 map. Warsaw Pact members are shown at their Cold War extent. */
      geoNames: ['USSR', 'Russia', 'East Germany', 'Poland', 'Czechoslovakia', 'Hungary', 'Romania', 'Bulgaria',
        'Albania', 'Mongolia', 'China', 'Cuba', 'Korea, Democratic People\'s Republic of', 'Vietnam', 'Laos'], geoSubjects: [],
      summary: 'The Soviet Union and the communist states aligned with it — the Warsaw Pact satellites of Eastern Europe, plus Maoist China (until the Sino-Soviet split), North Korea, North Vietnam and Cuba. A command-economy world behind what Churchill called the "Iron Curtain".',
      objectives: ['Secure a buffer of friendly communist states in Eastern Europe', 'Advance world revolution and support fellow communist movements', 'Achieve strategic (nuclear) parity with the United States'],
      facts: [
        { attr: 'alliance', value: 'The Warsaw Pact (from 1955)', from: 1955, to: 1991, confidence: 'high', sources: ['src:gaddis'] },
        { attr: 'leader', value: 'The Soviet leader (Stalin → Khrushchev → Brezhnev → Gorbachev)', from: 1947, to: 1991, confidence: 'high', sources: ['src:westad'] },
        { attr: 'ideology', value: 'Marxism-Leninism; a state-run command economy', from: 1947, to: 1991, confidence: 'high', sources: ['src:westad'] },
        { attr: 'population', value: r(300000000, 400000000), from: 1947, to: 1991, confidence: 'low', sources: ['src:britannica-cw2'], note: 'USSR + Eastern Europe; China alone added ~600m but split from Moscow.' }
      ]
    },
    {
      id: 'nation:nonaligned', type: 'nation', name: 'The Non-Aligned Movement', short: 'Non-aligned',
      side: 'nonaligned', entered: 1961, exited: 1991, factionKey: 'nonaligned',
      capital: { name: '(Belgrade Conference, 1961)', lon: 20.46, lat: 44.82 },
      geoNames: ['Yugoslavia', 'India', 'Egypt', 'Indonesia', 'Ghana'], geoSubjects: [],
      summary: 'States that refused to line up behind either superpower. Founded at Belgrade in 1961 by leaders such as Tito, Nehru and Nasser, the movement gave the decolonising "Third World" a collective voice between the blocs — though many members still leaned one way in practice.',
      objectives: ['Stay independent of both superpower blocs', 'Champion decolonisation and the developing world', 'Reduce Cold War tensions from the outside'],
      facts: [
        { attr: 'founded', value: 'Belgrade Conference, 1961 (Tito, Nehru, Nasser, Sukarno, Nkrumah)', from: 1961, to: 1991, confidence: 'high', sources: ['src:westad'] },
        { attr: 'principle', value: 'Non-alignment — no permanent military pact with either bloc', from: 1961, to: 1991, confidence: 'high', sources: ['src:westad'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:truman', name: 'Harry S. Truman', nationId: 'nation:west', role: 'President of the United States (1945–53)', years: '1884–1972', side: 'west',
      bio: 'Set the course of American Cold War policy: the Truman Doctrine of containment, the Marshall Plan, the Berlin Airlift, NATO and the decision to fight in Korea.',
      relatedBattles: ['battle:inchon'], confidence: 'high', sources: ['src:gaddis'] },
    { id: 'person:kennedy', name: 'John F. Kennedy', nationId: 'nation:west', role: 'President of the United States (1961–63)', years: '1917–1963', side: 'west',
      bio: 'Faced down the Soviets in the Cuban Missile Crisis of 1962 — the closest the Cold War came to nuclear war — and deepened American involvement in Vietnam before his assassination.',
      relatedBattles: ['battle:bay-of-pigs'], confidence: 'high', sources: ['src:gaddis'] },
    { id: 'person:reagan', name: 'Ronald Reagan', nationId: 'nation:west', role: 'President of the United States (1981–89)', years: '1911–2004', side: 'west',
      bio: 'Escalated the arms race and pressure on the "Evil Empire," then negotiated deep cuts with Gorbachev (the INF Treaty), helping bring the Cold War to a peaceful close.', confidence: 'high', sources: ['src:service'] },
    { id: 'person:stalin', name: 'Joseph Stalin', nationId: 'nation:east', role: 'Leader of the Soviet Union (1924–53)', years: '1878–1953', side: 'east',
      bio: 'Imposed communist regimes across Eastern Europe after 1945, blockaded Berlin, and built the Soviet atomic bomb — cementing the division of Europe and the Cold War itself.', confidence: 'high', sources: ['src:westad'] },
    { id: 'person:khrushchev', name: 'Nikita Khrushchev', nationId: 'nation:east', role: 'Leader of the Soviet Union (1953–64)', years: '1894–1971', side: 'east',
      bio: 'Denounced Stalin, crushed the 1956 Hungarian uprising, launched Sputnik, built the Berlin Wall and gambled on missiles in Cuba — then blinked in 1962.',
      relatedBattles: ['battle:budapest-1956'], confidence: 'high', sources: ['src:gaddis'] },
    { id: 'person:brezhnev', name: 'Leonid Brezhnev', nationId: 'nation:east', role: 'Leader of the Soviet Union (1964–82)', years: '1906–1982', side: 'east',
      bio: 'Presided over détente and nuclear-arms treaties abroad while enforcing the "Brezhnev Doctrine" at home — crushing the Prague Spring (1968) and invading Afghanistan (1979).', confidence: 'high', sources: ['src:westad'] },
    { id: 'person:gorbachev', name: 'Mikhail Gorbachev', nationId: 'nation:east', role: 'Leader of the Soviet Union (1985–91)', years: '1931–2022', side: 'east',
      bio: 'His reforms — glasnost and perestroika — and his refusal to hold Eastern Europe by force let the Iron Curtain fall peacefully in 1989 and the Soviet Union dissolve in 1991.', confidence: 'high', sources: ['src:service'] },
    { id: 'person:mao', name: 'Mao Zedong', nationId: 'nation:east', role: 'Chairman of the People’s Republic of China', years: '1893–1976', side: 'east',
      bio: 'Led communist China from 1949, fought UN forces to a standstill in Korea, then broke with Moscow in the Sino-Soviet split — turning the bipolar contest into a three-way one.', confidence: 'high', sources: ['src:westad'] },
    { id: 'person:tito', name: 'Josip Broz Tito', nationId: 'nation:nonaligned', role: 'Leader of Yugoslavia', years: '1892–1980', side: 'nonaligned',
      bio: 'Broke with Stalin in 1948 and steered communist Yugoslavia between the blocs, becoming a founding leader of the Non-Aligned Movement.', confidence: 'high', sources: ['src:westad'] }
  ];

  /* ---- BATTLES (the proxy "hot wars") ----------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'high', sources: ['src:britannica-cw2'] }, opts || {});
  const battles = [
    B('battle:inchon', 'Inchon Landing', 1950, 9, 15, 126.63, 37.46, 'Inchon, Korea', 'Western (UN)', 'MacArthur’s daring amphibious landing turned the Korean War, cutting off the North Korean army and retaking Seoul.', { commanders: ['person:truman'], casualties: { west: r(500, 3500), east: r(30000, 35000) } }),
    B('battle:chosin', 'Chosin Reservoir', 1950, 11, 27, 127.10, 40.48, 'North Korea', 'Eastern (China, strategic)', 'Chinese entry into the war trapped UN forces in the frozen mountains; their fighting retreat saved the army but ceded the North.', { date: { y: 1950, m: 11, d: 27, end: { y: 1950, m: 12, d: 13 } }, casualties: { west: r(17800, 18000), east: r(48000, 60000) } }),
    B('battle:dien-bien-phu', 'Dien Bien Phu', 1954, 5, 7, 103.02, 21.38, 'northern Vietnam', 'Eastern (Viet Minh)', 'The Viet Minh’s siege shattered French colonial power in Indochina and split Vietnam at the 17th parallel — setting up the American war to come.', { decisive: true, casualties: { west: r(7000, 11000), east: r(23000, 25000) } }),
    B('battle:budapest-1956', 'Hungarian Uprising', 1956, 11, 4, 19.04, 47.50, 'Budapest, Hungary', 'Eastern (USSR)', 'Soviet tanks crushed Hungary’s revolt against communist rule, showing the West would not intervene behind the Iron Curtain.', { commanders: ['person:khrushchev'], casualties: { east: r(2500, 3000) } }),
    B('battle:bay-of-pigs', 'Bay of Pigs', 1961, 4, 17, -81.10, 22.10, 'Cuba', 'Eastern (Cuba)', 'A CIA-backed exile invasion to topple Castro failed within days, humiliating the new Kennedy administration and pushing Cuba toward Moscow.', { commanders: ['person:kennedy'], casualties: { west: { captured: 1200 } } }),
    B('battle:tet', 'Tet Offensive', 1968, 1, 31, 106.66, 10.82, 'across South Vietnam', 'Western (tactical) / turning point', 'A massive surprise assault on South Vietnam’s cities. Militarily repelled, it shattered American confidence and turned US opinion against the war.', { date: { y: 1968, m: 1, d: 31, end: { y: 1968, m: 9, d: 23 } }, casualties: { west: r(9000, 12000), east: r(45000, 58000) } }),
    B('battle:saigon-1975', 'Fall of Saigon', 1975, 4, 30, 106.70, 10.78, 'Saigon, South Vietnam', 'Eastern (North Vietnam)', 'North Vietnamese tanks entered Saigon, reuniting Vietnam under communism and ending the longest hot war of the Cold War in an American defeat.', { decisive: true }),
    B('battle:panjshir', 'Soviet War in Afghanistan', 1980, 5, 1, 69.60, 35.32, 'Panjshir Valley, Afghanistan', 'Western-backed (Mujahideen)', 'A decade-long Soviet quagmire against US- and Pakistan-backed guerrillas — "the Soviet Union’s Vietnam" — that bled Moscow and helped end the Cold War.', { commanders: ['person:brezhnev'], date: { y: 1979, m: 12, d: 24, end: { y: 1989, m: 2, d: 15 } } })
  ];

  /* ---- "TREATIES" / defining agreements ---------------------------------- */
  const treaties = [
    { id: 'treaty:nato', type: 'treaty', name: 'The North Atlantic Treaty (NATO)', date: { y: 1949, m: 4, d: 4 },
      signatories: ['nation:west'], summary: 'Twelve Western nations pledged that an attack on one was an attack on all, binding North America to the defence of Western Europe and institutionalising the Western bloc.', confidence: 'high', sources: ['src:gaddis'] },
    { id: 'treaty:warsaw-pact', type: 'treaty', name: 'The Warsaw Pact', date: { y: 1955, m: 5, d: 14 },
      signatories: ['nation:east'], summary: 'The Soviet Union’s answer to NATO — a mutual-defence alliance binding the communist states of Eastern Europe under Moscow’s military command.', confidence: 'high', sources: ['src:gaddis'] },
    { id: 'treaty:dissolution-ussr', type: 'treaty', name: 'Dissolution of the Soviet Union', date: { y: 1991, m: 12, d: 26 },
      signatories: ['nation:east', 'nation:west'], summary: 'The USSR was formally dissolved into fifteen independent republics, ending the Cold War. There was no peace treaty — one of the two superpowers simply ceased to exist, and the West had, in effect, won.', confidence: 'high', sources: ['src:service'] }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:washington-cw', name: 'Washington, D.C.', lon: -77.04, lat: 38.91, capitalOf: 'nation:west', note: 'Capital of the leading Western power and the hub of NATO.' },
    { id: 'city:moscow', name: 'Moscow', lon: 37.62, lat: 55.75, capitalOf: 'nation:east', note: 'Capital of the Soviet Union and command centre of the Eastern bloc.' },
    { id: 'city:berlin-cw', name: 'Berlin', lon: 13.40, lat: 52.52, note: 'The divided city at the Cold War’s front line — blockaded in 1948, walled in 1961, and reopened in 1989.' },
    { id: 'city:beijing-cw', name: 'Beijing', lon: 116.40, lat: 39.90, note: 'Capital of communist China — a Soviet ally until the Sino-Soviet split of the 1960s.' },
    { id: 'city:havana', name: 'Havana', lon: -82.38, lat: 23.13, note: 'Castro’s Cuba — a Soviet ally 90 miles from Florida and the focus of the 1962 missile crisis.' },
    { id: 'city:seoul', name: 'Seoul', lon: 126.98, lat: 37.57, note: 'Capital of South Korea, fought over four times in the Korean War.' },
    { id: 'city:saigon', name: 'Saigon', lon: 106.70, lat: 10.78, note: 'Capital of South Vietnam; its fall in 1975 ended the Vietnam War.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:cold-${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1947, 3, 12, 'political', 'Truman Doctrine', 'The US pledges to contain communism, marking the Cold War’s start.'),
    T(1948, 6, 24, 'political', 'Berlin Blockade & Airlift', 'The West flies supplies into blockaded West Berlin for eleven months.'),
    T(1949, 4, 4, 'treaty', 'NATO founded', 'Twelve Western nations form a mutual-defence alliance.'),
    T(1949, 8, 29, 'political', 'Soviets test the atomic bomb', 'The nuclear arms race — and the balance of terror — begins.'),
    T(1950, 6, 25, 'battle', 'Korean War begins', 'North Korea invades the South; UN forces intervene.'),
    T(1955, 5, 14, 'treaty', 'Warsaw Pact formed', 'The Soviet bloc answers NATO with its own alliance.'),
    T(1957, 10, 4, 'political', 'Sputnik launched', 'The USSR opens the Space Race with the first satellite.'),
    T(1961, 8, 13, 'political', 'Berlin Wall built', 'East Germany walls off West Berlin, sealing the Iron Curtain.'),
    T(1962, 10, 16, 'political', 'Cuban Missile Crisis', 'Thirteen days that bring the world to the brink of nuclear war.'),
    T(1968, 1, 31, 'battle', 'Tet Offensive', 'A turning point that sours America on the Vietnam War.'),
    T(1972, 5, 26, 'treaty', 'Détente & SALT I', 'The superpowers sign the first strategic arms-limitation treaty.'),
    T(1975, 4, 30, 'battle', 'Fall of Saigon', 'Vietnam is reunified under communism; America withdraws.'),
    T(1979, 12, 24, 'battle', 'Soviet invasion of Afghanistan', 'Moscow enters a decade-long war that helps exhaust it.'),
    T(1987, 12, 8, 'treaty', 'INF Treaty', 'Reagan and Gorbachev agree to scrap intermediate-range missiles.'),
    T(1989, 11, 9, 'political', 'Fall of the Berlin Wall', 'East Germans breach the Wall; communism collapses across Europe.'),
    T(1991, 12, 26, 'treaty', 'Soviet Union dissolved', 'The USSR breaks into fifteen states; the Cold War ends.')
  ];

  /* ---- WORLD AT THIS TIME ----------------------------------------------- */
  const worldContext = {
    _default: {
      worldPopulation: { low: 2500000000, high: 5400000000, confidence: 'low' },
      largestEmpires: ['United States (superpower)', 'Soviet Union (superpower)', 'British Empire (decolonising)', 'People’s Republic of China'],
      largestCities: ['New York', 'Tokyo', 'London', 'Moscow', 'Shanghai'],
      otherConflicts: ['Wars of decolonisation across Africa and Asia', 'Arab–Israeli wars', 'The Chinese Civil War’s aftermath'],
      science: ['The Space Race — Sputnik (1957) to Apollo 11 (1969)', 'The nuclear age and the hydrogen bomb', 'The rise of computing and the early internet'],
      culture: ['Rock ’n’ roll and a global youth culture', 'Television reshapes politics and daily life', 'Decolonisation remakes the world map']
    },
    1957: { science: ['Sputnik 1 becomes the first artificial satellite'] },
    1969: { science: ['Apollo 11 lands the first humans on the Moon'] },
    1989: { culture: ['Revolutions sweep Eastern Europe; the Wall falls'], science: ['The World Wide Web is proposed at CERN'] }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:cold-wall', type: 'set-year', prompt: 'Move the timeline to the year the Berlin Wall fell.', accept: { year: 1989 }, feedback: { correct: 'Correct — the Wall was breached in November 1989.', incorrect: 'Try the year the revolutions swept Eastern Europe.' } },
    { id: 'quiz:cold-cuba', type: 'multiple-choice', prompt: 'Which 1962 crisis brought the world closest to nuclear war?', options: ['The Berlin Blockade', 'The Cuban Missile Crisis', 'The Suez Crisis', 'The Korean War'], accept: { option: 'The Cuban Missile Crisis' }, feedback: { correct: 'Correct — thirteen days in October 1962.', incorrect: 'Think of the missiles the USSR placed 90 miles from Florida.' } },
    { id: 'quiz:cold-east', type: 'click-map', prompt: 'Click a country in the Soviet-led Eastern bloc.', accept: { entityId: 'nation:east' }, feedback: { correct: 'Correct — that state was aligned with Moscow.', incorrect: 'Look behind the Iron Curtain — try the USSR or Eastern Europe.' } },
    { id: 'quiz:cold-end', type: 'set-year', prompt: 'Set the timeline to the year the Soviet Union dissolved.', accept: { year: 1991 }, feedback: { correct: 'Correct — the USSR broke apart in December 1991.', incorrect: 'Move to the very end of the Cold War.' } },
    { id: 'quiz:cold-west', type: 'click-map', prompt: 'Click a country in the US-led Western bloc.', accept: { entityId: 'nation:west' }, feedback: { correct: 'Correct — that state was a NATO or Western ally.', incorrect: 'Try the United States, Western Europe or Japan.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['cold-war'] = {
    id: 'war:cold-war', schemaVersion: 1,
    meta: {
      name: 'The Cold War',
      altNames: ['US–Soviet rivalry', 'The bipolar era'],
      years: { start: 1947, end: 1991 }, defaultYear: 1962,
      duration: '44 years (1947–1991)',
      summary: 'A four-decade global standoff between a US-led capitalist West and a Soviet-led communist East. Never a direct war between the superpowers, it was fought through proxy wars (Korea, Vietnam, Afghanistan), an arms and space race, espionage and the ever-present threat of nuclear annihilation.',
      background: 'The wartime alliance against Nazi Germany collapsed almost as soon as the war ended. As the Soviet Union imposed communist rule across Eastern Europe and the United States moved to contain it, an "Iron Curtain" fell across the continent and the world divided into two armed camps.',
      causesLong: ['Ideological clash between capitalism and communism', 'The power vacuum left by a shattered Europe in 1945', 'Mutual fear and mistrust between Washington and Moscow'],
      causesImmediate: ['Soviet domination of Eastern Europe after 1945', 'The Truman Doctrine and Marshall Plan (1947–48)', 'The Berlin Blockade (1948–49)'],
      turningPoints: ['The Cuban Missile Crisis (1962) — and the step back from the brink', 'The Vietnam War and the era of détente', 'Gorbachev’s reforms and the revolutions of 1989'],
      outcome: 'A peaceful Western victory: communism collapsed in Europe and the Soviet Union dissolved into fifteen states in 1991.',
      victor: 'west', peaceTreaty: 'treaty:dissolution-ussr',
      territorialChanges: 'No superpower territory changed hands by direct war, but the political map was remade: a divided then reunified Germany, communist regimes across Eastern Europe that fell in 1989, and the break-up of the USSR into fifteen independent republics in 1991.',
      significance: 'Defined world politics for two generations, spread proxy wars across the globe, drove the Space Race and the nuclear arms build-up, and ended — remarkably — without the superpowers ever fighting each other directly.',
      humanCost: 'The superpowers never fought directly, but the proxy wars were devastating: on the order of <strong>3 million</strong> dead in Korea and <strong>2–3 million</strong> in Vietnam, plus millions more in Afghanistan, Africa and Latin America <span class="conf low">low confidence</span> — all under the constant shadow of nuclear war.',
      consequences: ['The United States left as the sole superpower', 'A reunified Germany and a democratic Eastern Europe', 'Fifteen successor states from the former USSR', 'A vast nuclear arsenal — and arms-control regime — that still shapes the world']
    },
    factions: {
      west: { label: 'Western bloc (NATO & allies)', colorVar: '--west' },
      east: { label: 'Eastern bloc (USSR & allies)', colorVar: '--east' },
      nonaligned: { label: 'Non-Aligned Movement', colorVar: '--nonaligned' },
      neutral: { label: 'Other / uncommitted', colorVar: '--neutral' }
    },
    legendOrder: ['west', 'east', 'nonaligned', 'neutral'],
    sides: {
      west: { label: 'Western bloc', factionKey: 'west' },
      east: { label: 'Eastern bloc', factionKey: 'east' },
      nonaligned: { label: 'Non-aligned', factionKey: 'nonaligned' }
    },
    sources: S, nations, leaders, battles, treaties, cities, timeline, worldContext, quizzes,
    /* Borders: a ~1960 basemap (divided Germany, one USSR, two Koreas) for
       1947–1990, then a 1994 basemap from 1991 — so the Soviet Union’s collapse
       is visible as its red mass breaks apart. `fit:'sphere'` shows the whole
       globe, the natural frame for a worldwide contest. */
    geo: {
      borderSnapshots: {
        1947: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1960.geojson',
        1991: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1994.geojson'
      },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson',
      note: 'Bloc alignments shown at their Cold War extent on a ~1960 map, switching to 1994 at the Soviet collapse; the two Vietnams and shifting memberships are simplified.'
    }
  };
})();
