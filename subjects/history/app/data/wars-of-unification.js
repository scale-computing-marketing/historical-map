/* Historical Wars Explorer — dataset: Wars of German & Italian Unification (1859–1871)
   PURE DATA in the same shape as the other war files. Registers itself on
   window.HWE.wars; the engine is war-agnostic and reads factions, sides and
   geometry from this object with no code changes.

   This is not one war but a linked SERIES: the Second Italian War of Independence
   (1859), Garibaldi's conquest of the south (1860), the Austro-Prussian War
   (1866) and the Franco-Prussian War (1870–71) — the wars through which a
   fragmented Germany and Italy each became a single nation-state. Alliances
   shifted (France helped Italy in 1859, then fought Prussia in 1870), so each
   nation is placed on the side it is best remembered for; see meta.background.

   Geometry note: borders switch from the pre-unification ~1815 basemap (used for
   1859–1870, when Germany was ~39 states and Italy was a patchwork) to the
   post-unification 1880 basemap from 1871, so the moment the German Empire and
   the Kingdom of Italy consolidate is visible on the map. Intermediate cessions
   (Lombardy 1859, Venetia 1866, Rome 1870) are a deliberate simplification —
   the map snaps to the unified result rather than animating each transfer.   */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {
    wawro66: { id: 'src:wawro66', type: 'book', citation: 'Geoffrey Wawro, The Austro-Prussian War (Cambridge University Press, 1996)', reliability: 'high' },
    wawro70: { id: 'src:wawro70', type: 'book', citation: 'Geoffrey Wawro, The Franco-Prussian War (Cambridge University Press, 2003)', reliability: 'high' },
    clark: { id: 'src:clark', type: 'book', citation: 'Christopher Clark, Iron Kingdom: The Rise and Downfall of Prussia (Harvard University Press, 2006)', reliability: 'high' },
    riall: { id: 'src:riall', type: 'book', citation: 'Lucy Riall, The Italian Risorgimento: State, Society and National Unification', reliability: 'high' },
    smith: { id: 'src:smith', type: 'book', citation: 'Denis Mack Smith, The Making of Italy, 1796–1866', reliability: 'high' },
    britannica: { id: 'src:britannica-un', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    hbm: { id: 'src:historical-basemaps-un', type: 'archive', citation: 'aourednik/historical-basemaps (world_1815, world_1880), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });
  const v = (value) => ({ value });

  /* ---- NATIONS (factions) ------------------------------------------------
     geoNames list the polity NAMEs each nation owns. They cover BOTH basemaps:
     e.g. Prussia holds 'Prussia' on the 1815 map and 'Germany' on the 1880 map,
     so a single nation colours the fragmented kingdom AND the unified empire.
     The many small states are grouped into two muted "independent states"
     factions that vanish once absorbed (their names are gone from the 1880 map). */
  const nations = [
    {
      id: 'nation:prussia', type: 'nation', name: 'Prussia / German Empire', short: 'Prussia',
      side: 'prussia', entered: 1859, exited: 1871, factionKey: 'prussia',
      capital: { name: 'Berlin', lon: 13.40, lat: 52.52 },
      geoNames: ['Prussia', 'Germany'], geoSubjects: [],
      summary: 'The dominant German kingdom. Under Minister-President Otto von Bismarck and the reformed army of Helmuth von Moltke, Prussia unified Germany by defeating Denmark (1864), Austria (1866) and France (1870–71), and proclaimed the German Empire at Versailles in January 1871.',
      objectives: ['Unify the German states under Prussian leadership', 'Exclude Austria from German affairs (Kleindeutschland)', 'Break French opposition to a united Germany'],
      facts: [
        { attr: 'government', value: 'Kingdom of Prussia; German Empire from 1871', from: 1859, to: 1871, confidence: 'high', sources: ['src:clark'] },
        { attr: 'monarch', value: 'King Wilhelm I (German Emperor from 1871)', from: 1861, to: 1871, confidence: 'high', sources: ['src:clark'] },
        { attr: 'headOfGovernment', value: 'Otto von Bismarck, Minister-President (from 1862)', from: 1862, to: 1871, confidence: 'high', sources: ['src:clark'] },
        { attr: 'army', value: 'Prussian Army — conscription, railways and the General Staff under Moltke', from: 1859, to: 1871, confidence: 'high', sources: ['src:wawro66'] },
        { attr: 'population', value: r(19000000, 25000000), from: 1859, to: 1871, confidence: 'medium', sources: ['src:britannica-un'], note: 'Prussia proper; the Empire of 1871 counted ~41 million.' }
      ]
    },
    {
      id: 'nation:italy', type: 'nation', name: 'Sardinia / Kingdom of Italy', short: 'Sardinia–Italy',
      side: 'italy', entered: 1859, exited: 1871, factionKey: 'italy',
      capital: { name: 'Turin (later Florence, then Rome)', lon: 7.69, lat: 45.07 },
      geoNames: ['Kingdom of Sardinia', 'Italy'], geoSubjects: [],
      summary: 'The Kingdom of Sardinia-Piedmont, under Prime Minister Cavour and King Victor Emmanuel II, led the drive for Italian unity. With French help it took Lombardy (1859); Garibaldi delivered the south (1860); the Kingdom of Italy was proclaimed in 1861, gaining Venetia (1866) and finally Rome (1870).',
      objectives: ['Unite the Italian peninsula under the House of Savoy', 'Expel Austria from northern Italy', 'Make Rome the capital of a united Italy'],
      facts: [
        { attr: 'government', value: 'Kingdom of Sardinia; Kingdom of Italy from 1861', from: 1859, to: 1871, confidence: 'high', sources: ['src:riall'] },
        { attr: 'monarch', value: 'Victor Emmanuel II (King of Italy from 1861)', from: 1859, to: 1871, confidence: 'high', sources: ['src:smith'] },
        { attr: 'headOfGovernment', value: 'Count Camillo di Cavour (to 1861), then successors', from: 1859, to: 1861, confidence: 'high', sources: ['src:smith'] },
        { attr: 'population', value: r(22000000, 27000000), from: 1861, to: 1871, confidence: 'medium', sources: ['src:britannica-un'], note: 'Kingdom of Italy after 1861 unification.' },
        { attr: 'entryEvent', value: 'Kingdom of Italy proclaimed, March 1861', from: 1861, to: 1871, confidence: 'high', sources: ['src:riall'] }
      ]
    },
    {
      id: 'nation:austria', type: 'nation', name: 'Austrian Empire', short: 'Austria',
      side: 'austria', entered: 1859, exited: 1871, factionKey: 'austria',
      capital: { name: 'Vienna', lon: 16.37, lat: 48.21 },
      /* Lombardy & Venetia are the Austrian-ruled northern-Italian lands on the
         1815 map; coloured Austrian for the pre-1871 period (a simplification —
         Lombardy was ceded in 1859, Venetia in 1866). */
      geoNames: ['Austrian Empire', 'Austria Hungary', 'Lombardy', 'Venetia'], geoSubjects: [],
      summary: 'The Habsburg Empire was the great obstacle to both unifications — the dominant power in the German Confederation and the ruler of northern Italy. Defeated by France and Sardinia in 1859 and decisively by Prussia in 1866, it was pushed out of both Germany and Italy and reorganised as Austria-Hungary in 1867.',
      objectives: ['Preserve Habsburg leadership of the German Confederation', 'Hold Austrian territory in northern Italy', 'Block a Prussian- or Savoy-led unification'],
      facts: [
        { attr: 'government', value: 'Habsburg Empire; Austria-Hungary from 1867', from: 1859, to: 1871, confidence: 'high', sources: ['src:britannica-un'] },
        { attr: 'monarch', value: 'Emperor Franz Joseph I', from: 1859, to: 1871, confidence: 'high', sources: ['src:britannica-un'] },
        { attr: 'army', value: 'Austrian (Austro-Hungarian) Army — outmanoeuvred by Prussia in 1866', from: 1859, to: 1871, confidence: 'high', sources: ['src:wawro66'] },
        { attr: 'population', value: r(32000000, 36000000), from: 1859, to: 1871, confidence: 'medium', sources: ['src:britannica-un'] }
      ]
    },
    {
      id: 'nation:france', type: 'nation', name: 'French Empire (Second Empire)', short: 'France',
      side: 'france', entered: 1859, exited: 1871, factionKey: 'france',
      capital: { name: 'Paris', lon: 2.35, lat: 48.85 },
      geoNames: ['France'], geoSubjects: [],
      summary: 'Napoleon III’s Second Empire helped Sardinia defeat Austria in 1859 (gaining Nice and Savoy), but came to fear a strong united Germany. The Franco-Prussian War of 1870–71 ended in catastrophe: the Emperor was captured at Sedan, the Empire fell, and France ceded Alsace-Lorraine.',
      objectives: ['Weaken Austria and pose as patron of Italian nationalism (1859)', 'Preserve French pre-eminence in Europe', 'Prevent a united Germany on France’s frontier (1870)'],
      facts: [
        { attr: 'government', value: 'Second Empire (to Sept 1870), then Third Republic', from: 1859, to: 1871, confidence: 'high', sources: ['src:wawro70'] },
        { attr: 'monarch', value: 'Emperor Napoleon III (captured at Sedan, Sept 1870)', from: 1859, to: 1870, confidence: 'high', sources: ['src:wawro70'] },
        { attr: 'army', value: 'French Imperial Army — chassepot rifle, but outnumbered and outmanoeuvred in 1870', from: 1859, to: 1871, confidence: 'high', sources: ['src:wawro70'] },
        { attr: 'population', value: r(37000000, 38000000), from: 1859, to: 1871, confidence: 'medium', sources: ['src:britannica-un'] }
      ]
    },
    {
      id: 'nation:german-states', type: 'nation', name: 'Independent German states', short: 'German states',
      side: 'german-state', entered: 1859, exited: 1871, factionKey: 'german-states',
      capital: { name: '(Bavaria, Saxony, Hanover, Baden, Hesse…)', lon: 11.58, lat: 48.14 },
      geoNames: ['Bavaria', 'Saxony', 'Hanover', 'Baden', 'Electoral Hesse', 'Grand Duchy of Hesse', 'Holstein', 'Schleswig'], geoSubjects: [],
      summary: 'The dozens of other members of the German Confederation. Several (Hanover, Saxony, Bavaria) sided with Austria in 1866; the northern states were absorbed into the Prussian-led North German Confederation, and all joined the German Empire in 1871.',
      objectives: ['Preserve their sovereignty within a loose confederation', 'Balance between Austrian and Prussian leadership'],
      facts: [
        { attr: 'government', value: 'Sovereign kingdoms, duchies and free cities of the German Confederation', from: 1859, to: 1866, confidence: 'high', sources: ['src:clark'] },
        { attr: 'entryEvent', value: 'North German states join Prussia (1867); all join the Empire (1871)', from: 1867, to: 1871, confidence: 'high', sources: ['src:clark'] }
      ]
    },
    {
      id: 'nation:italian-states', type: 'nation', name: 'Independent Italian states', short: 'Italian states',
      side: 'italian-state', entered: 1859, exited: 1871, factionKey: 'italian-states',
      capital: { name: '(Two Sicilies, Papal States, Tuscany…)', lon: 12.50, lat: 41.90 },
      geoNames: ['Kingdom of the Two Sicilies', 'Papal States', 'Tuscany', 'Modena', 'Parma'], geoSubjects: [],
      summary: 'The other states of the peninsula. The central duchies and Tuscany voted to join Sardinia in 1860; Garibaldi’s Thousand toppled the Kingdom of the Two Sicilies that year; the Papal States shrank to Rome until 1870, when Italian troops completed unification.',
      objectives: ['Preserve independent rule (the Bourbons in the south, the Pope in Rome)', 'Resist absorption into a Savoyard Italy'],
      facts: [
        { attr: 'government', value: 'The Bourbon south, the Papal States and the central duchies', from: 1859, to: 1860, confidence: 'high', sources: ['src:smith'] },
        { attr: 'entryEvent', value: 'Most annexed to Italy 1860–61; Rome taken 1870', from: 1860, to: 1870, confidence: 'high', sources: ['src:riall'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:bismarck', name: 'Otto von Bismarck', nationId: 'nation:prussia', role: 'Minister-President of Prussia', years: '1815–1898', side: 'prussia',
      bio: 'The architect of German unification. Through "blood and iron" and a cold mastery of Realpolitik, he engineered three short wars — against Denmark, Austria and France — that made Prussia the core of a united German Empire, of which he became the first Chancellor.',
      relatedBattles: ['battle:koniggratz', 'battle:sedan'], confidence: 'high', sources: ['src:clark'] },
    { id: 'person:wilhelm1', name: 'Wilhelm I', nationId: 'nation:prussia', role: 'King of Prussia; German Emperor', years: '1797–1888', side: 'prussia',
      bio: 'King of Prussia from 1861, he backed army reform and Bismarck’s policy despite misgivings, and was proclaimed German Emperor in the Hall of Mirrors at Versailles on 18 January 1871.', confidence: 'high', sources: ['src:clark'] },
    { id: 'person:moltke', name: 'Helmuth von Moltke', nationId: 'nation:prussia', role: 'Chief of the Prussian General Staff', years: '1800–1891', side: 'prussia',
      bio: 'The military brain of unification. He turned railways, the telegraph and the General Staff into a war-winning machine, encircling the Austrians at Königgrätz and the French at Sedan.',
      relatedBattles: ['battle:koniggratz', 'battle:sedan'], confidence: 'high', sources: ['src:wawro66'] },
    { id: 'person:cavour', name: 'Camillo di Cavour', nationId: 'nation:italy', role: 'Prime Minister of Sardinia-Piedmont', years: '1810–1861', side: 'italy',
      bio: 'The diplomatic architect of Italian unity. He secured the French alliance that beat Austria in 1859 and steered the annexations of 1860, but died suddenly in 1861, months after the Kingdom of Italy was proclaimed.', confidence: 'high', sources: ['src:smith'] },
    { id: 'person:garibaldi', name: 'Giuseppe Garibaldi', nationId: 'nation:italy', role: 'General; leader of the Expedition of the Thousand', years: '1807–1882', side: 'italy',
      bio: 'The soldier-hero of the Risorgimento. In 1860 his thousand red-shirted volunteers conquered Sicily and Naples and handed the south to Victor Emmanuel II, all but completing Italian unification.',
      relatedBattles: ['battle:calatafimi', 'battle:volturno'], confidence: 'high', sources: ['src:riall'] },
    { id: 'person:victor-emmanuel', name: 'Victor Emmanuel II', nationId: 'nation:italy', role: 'King of Sardinia, then of Italy', years: '1820–1878', side: 'italy',
      bio: 'King of Sardinia who became the first King of a united Italy in 1861. A pragmatic figurehead of the Risorgimento, he presided over the gains of Venetia (1866) and Rome (1870).', confidence: 'high', sources: ['src:smith'] },
    { id: 'person:napoleon3', name: 'Napoleon III', nationId: 'nation:france', role: 'Emperor of the French', years: '1808–1873', side: 'france',
      bio: 'Nephew of Napoleon I. He allied with Sardinia to defeat Austria in 1859, but his fear of a united Germany drew France into the disastrous war of 1870, where he was captured at Sedan — ending the Second Empire.',
      relatedBattles: ['battle:magenta', 'battle:sedan'], confidence: 'high', sources: ['src:wawro70'] },
    { id: 'person:franz-joseph', name: 'Franz Joseph I', nationId: 'nation:austria', role: 'Emperor of Austria', years: '1830–1916', side: 'austria',
      bio: 'Habsburg emperor who lost Lombardy to France and Sardinia in 1859 and was decisively beaten by Prussia at Königgrätz in 1866, forcing Austria out of Germany and Italy and into the Austro-Hungarian Compromise of 1867.',
      relatedBattles: ['battle:solferino', 'battle:koniggratz'], confidence: 'high', sources: ['src:wawro66'] }
  ];

  /* ---- BATTLES ---------------------------------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'high', sources: ['src:britannica-un'] }, opts || {});
  const battles = [
    B('battle:magenta', 'Magenta', 1859, 6, 4, 8.88, 45.47, 'Lombardy', 'French–Sardinian', 'A Franco-Sardinian victory that forced the Austrians out of Milan and much of Lombardy.', { commanders: ['person:napoleon3'], casualties: { french: r(4500, 4600), austrian: r(9700, 10200) } }),
    B('battle:solferino', 'Solferino', 1859, 6, 24, 10.57, 45.37, 'Lombardy', 'French–Sardinian', 'The huge, bloody battle that decided the 1859 war; its carnage inspired Henri Dunant to found the Red Cross.', { decisive: true, commanders: ['person:napoleon3', 'person:franz-joseph'], casualties: { french: r(17000, 17200), austrian: r(22000, 22500) } }),
    B('battle:calatafimi', 'Calatafimi', 1860, 5, 15, 12.87, 37.91, 'Sicily', 'Italian (Garibaldi)', 'Garibaldi’s first victory in Sicily, opening the way to Palermo and the fall of the Bourbon south.', { commanders: ['person:garibaldi'], casualties: { italian: r(30, 60), sicilian: r(30, 40) } }),
    B('battle:volturno', 'Volturnus (Volturno)', 1860, 10, 1, 14.15, 41.10, 'near Capua, Naples', 'Italian (Garibaldi)', 'Garibaldi’s volunteers held off the last Bourbon counter-attack, securing the south for a united Italy.', { commanders: ['person:garibaldi'], casualties: { italian: r(1900, 2000), sicilian: r(1300, 2000) } }),
    B('battle:koniggratz', 'Königgrätz (Sadowa)', 1866, 7, 3, 15.75, 50.30, 'Bohemia', 'Prussian', 'The decisive battle of the Austro-Prussian War: Moltke’s converging armies destroyed Austria’s hopes and settled who would lead Germany.', { decisive: true, commanders: ['person:moltke', 'person:franz-joseph'], casualties: { prussian: r(9000, 9200), austrian: r(41000, 44000) } }),
    B('battle:custoza', 'Custoza', 1866, 6, 24, 10.78, 45.35, 'Venetia', 'Austrian', 'An Austrian victory over the Italian army — but Prussia’s win in the north still delivered Venetia to Italy at the peace.', { casualties: { italian: r(8000, 8100), austrian: r(5600, 5700) } }),
    B('battle:lissa', 'Lissa', 1866, 7, 20, 16.18, 43.16, 'Adriatic Sea', 'Austrian', 'A rare modern ironclad fleet action; the outnumbered Austrian navy defeated the Italians off the Dalmatian coast.', { naval: true, casualties: { italian: r(600, 650), austrian: v(38) } }),
    B('battle:gravelotte', 'Gravelotte–St. Privat', 1870, 8, 18, 6.01, 49.15, 'near Metz, Lorraine', 'Prussian (strategic)', 'The war’s largest battle; costly for Prussia but it bottled up the main French army inside Metz.', { commanders: ['person:moltke'], casualties: { prussian: r(20000, 20200), french: r(12000, 13000) } }),
    B('battle:sedan', 'Sedan', 1870, 9, 1, 4.94, 49.70, 'Ardennes', 'Prussian', 'The catastrophe that decided the Franco-Prussian War: an entire French army and Napoleon III himself were captured, toppling the Second Empire.', { decisive: true, commanders: ['person:moltke', 'person:napoleon3'], casualties: { prussian: r(9000, 9100), french: { captured: 104000 } } }),
    B('battle:paris-1870', 'Siege of Paris', 1871, 1, 28, 2.35, 48.85, 'Paris', 'Prussian', 'After a four-month siege and bombardment, Paris capitulated, ending the war days after the German Empire was proclaimed at Versailles.', { commanders: ['person:moltke'], date: { y: 1870, m: 9, d: 19, end: { y: 1871, m: 1, d: 28 } } })
  ];

  /* ---- TREATIES --------------------------------------------------------- */
  const treaties = [
    { id: 'treaty:zurich', type: 'treaty', name: 'Peace of Zürich', date: { y: 1859, m: 11, d: 10 },
      signatories: ['nation:france', 'nation:austria', 'nation:italy'], summary: 'Ended the 1859 war: Austria ceded most of Lombardy (via France) to Sardinia. It fell short of Italian hopes — Venetia stayed Austrian — but it was the first great step toward a united Italy.', confidence: 'high', sources: ['src:smith'] },
    { id: 'treaty:prague', type: 'treaty', name: 'Peace of Prague', date: { y: 1866, m: 8, d: 23 },
      signatories: ['nation:prussia', 'nation:austria'], summary: 'Ended the Austro-Prussian War. Austria was excluded from German affairs, the German Confederation was dissolved in favour of a Prussian-led North German Confederation, and Venetia passed to Italy.', confidence: 'high', sources: ['src:wawro66'] },
    { id: 'treaty:frankfurt', type: 'treaty', name: 'Treaty of Frankfurt', date: { y: 1871, m: 5, d: 10 },
      signatories: ['nation:prussia', 'nation:france'], summary: 'Ended the Franco-Prussian War. France ceded Alsace and most of Lorraine to the new German Empire and paid a five-billion-franc indemnity — a settlement that poisoned Franco-German relations for decades.', confidence: 'high', sources: ['src:wawro70'] }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:berlin-un', name: 'Berlin', lon: 13.40, lat: 52.52, capitalOf: 'nation:prussia', note: 'Prussian capital and, from 1871, capital of the German Empire.' },
    { id: 'city:turin', name: 'Turin', lon: 7.69, lat: 45.07, capitalOf: 'nation:italy', note: 'Capital of Sardinia-Piedmont and first capital of the Kingdom of Italy (1861–65).' },
    { id: 'city:rome-un', name: 'Rome', lon: 12.50, lat: 41.90, note: 'Seat of the Papal States; taken by Italian troops in 1870 and made the capital of a united Italy.' },
    { id: 'city:vienna-un', name: 'Vienna', lon: 16.37, lat: 48.21, capitalOf: 'nation:austria', note: 'Habsburg capital; leader of the German Confederation until 1866.' },
    { id: 'city:paris-un', name: 'Paris', lon: 2.35, lat: 48.85, capitalOf: 'nation:france', note: 'Besieged and bombarded in 1870–71; its fall ended the war and the Second Empire.' },
    { id: 'city:versailles', name: 'Versailles', lon: 2.13, lat: 48.80, note: 'Where the German Empire was proclaimed in the Hall of Mirrors on 18 January 1871.' },
    { id: 'city:naples-un', name: 'Naples', lon: 14.27, lat: 40.85, note: 'Capital of the Kingdom of the Two Sicilies, taken by Garibaldi in 1860.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:un-${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1859, 6, 24, 'battle', 'Solferino', 'France and Sardinia beat Austria; Lombardy is lost to the Habsburgs.'),
    T(1860, 5, 11, 'political', 'The Thousand land in Sicily', 'Garibaldi’s red-shirted volunteers begin the conquest of the south.'),
    T(1860, 10, 1, 'battle', 'Volturno', 'Garibaldi secures Naples; the Bourbon kingdom collapses.'),
    T(1861, 3, 17, 'political', 'Kingdom of Italy proclaimed', 'Victor Emmanuel II is declared King of Italy — unity all but Rome and Venetia.'),
    T(1862, 9, 23, 'political', 'Bismarck takes office', 'Appointed Minister-President of Prussia, he pledges "blood and iron".'),
    T(1864, 10, 30, 'treaty', 'Second Schleswig War won', 'Prussia and Austria seize Schleswig-Holstein from Denmark.'),
    T(1866, 7, 3, 'battle', 'Königgrätz', 'Prussia crushes Austria, deciding the leadership of Germany.'),
    T(1866, 8, 23, 'treaty', 'Peace of Prague', 'Austria is expelled from Germany; Italy gains Venetia.'),
    T(1870, 9, 1, 'battle', 'Sedan', 'Napoleon III is captured; the French Second Empire falls.'),
    T(1870, 9, 20, 'political', 'Rome taken', 'Italian troops enter Rome, completing Italian unification.'),
    T(1871, 1, 18, 'political', 'German Empire proclaimed', 'Wilhelm I is crowned German Emperor at Versailles.'),
    T(1871, 5, 10, 'treaty', 'Treaty of Frankfurt', 'France cedes Alsace-Lorraine; a united Germany dominates the continent.')
  ];

  /* ---- WORLD AT THIS TIME ----------------------------------------------- */
  const worldContext = {
    _default: {
      worldPopulation: { low: 1250000000, high: 1350000000, confidence: 'low' },
      largestEmpires: ['British Empire', 'Qing China', 'Russian Empire', 'French Second Empire'],
      largestCities: ['London', 'Beijing', 'Paris', 'Guangzhou (Canton)'],
      otherConflicts: ['American Civil War (1861–65)', 'Taiping Rebellion in China (1850–64)', 'French intervention in Mexico (1861–67)'],
      science: ['Darwin’s On the Origin of Species (1859)', 'Maxwell formulates the theory of electromagnetism', 'Mendel’s laws of inheritance (1865)'],
      culture: ['Verdi’s operas become anthems of the Risorgimento', 'Wagner remakes German opera', 'Tolstoy writes War and Peace']
    },
    1861: { culture: ['Dickens publishes Great Expectations'] },
    1869: { science: ['Suez Canal opens', 'Mendeleev publishes the periodic table'] },
    1871: { culture: ['Verdi’s Aida premieres'], science: ['Darwin’s The Descent of Man'] }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:un-germany', type: 'set-year', prompt: 'Move the timeline to the year the German Empire was proclaimed at Versailles.', accept: { year: 1871 }, feedback: { correct: 'Correct — Wilhelm I was proclaimed German Emperor in January 1871.', incorrect: 'Try the very end of the Franco-Prussian War.' } },
    { id: 'quiz:un-bismarck', type: 'multiple-choice', prompt: 'Which Prussian statesman engineered German unification through three short wars?', options: ['Klemens von Metternich', 'Otto von Bismarck', 'Helmuth von Moltke', 'Napoleon III'], accept: { option: 'Otto von Bismarck' }, feedback: { correct: 'Correct — Bismarck, the "Iron Chancellor".', incorrect: 'Not quite — think of the "Iron Chancellor" and "blood and iron".' } },
    { id: 'quiz:un-italy-year', type: 'set-year', prompt: 'Set the timeline to the year the Kingdom of Italy was proclaimed.', accept: { year: 1861 }, feedback: { correct: 'Correct — Victor Emmanuel II became King of Italy in March 1861.', incorrect: 'Look for the year after Garibaldi took the south.' } },
    { id: 'quiz:un-prussia', type: 'click-map', prompt: 'Click the kingdom that led German unification.', accept: { entityId: 'nation:prussia' }, feedback: { correct: 'Correct — Prussia, the core of the new German Empire.', incorrect: 'Try the large state in the north — Prussia.' } },
    { id: 'quiz:un-italy', type: 'click-map', prompt: 'Click the kingdom that led Italian unification.', accept: { entityId: 'nation:italy' }, feedback: { correct: 'Correct — Sardinia-Piedmont, which became the Kingdom of Italy.', incorrect: 'Look to the north-west of Italy — Sardinia-Piedmont.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['wars-of-unification'] = {
    id: 'war:wars-of-unification', schemaVersion: 1,
    meta: {
      name: 'Wars of German & Italian Unification',
      altNames: ['The Risorgimento', 'German Unification', 'Wars of Unification'],
      years: { start: 1859, end: 1871 }, defaultYear: 1866,
      duration: '12 years (1859–1871)',
      summary: 'A linked series of wars through which two new great powers were forged: the Kingdom of Italy (1861) under the House of Savoy, and the German Empire (1871) under Prussia. Austria was driven out of both Germany and Italy, and France’s defeat in 1870–71 remade the balance of Europe.',
      background: 'In 1859 "Germany" was a confederation of ~39 states and "Italy" a patchwork of kingdoms, duchies and Austrian provinces. Two parallel national movements — led by Sardinia-Piedmont and by Prussia — used war and diplomacy to unite each into a single state. Alliances shifted along the way: France fought for Italy against Austria in 1859, then against Prussia in 1870.',
      causesLong: ['Rising nationalism after 1848 across Germany and Italy', 'Austrian dominance blocking both unifications', 'The rivalry of Prussia and Austria for German leadership'],
      causesImmediate: ['Cavour’s alliance with France against Austria (1859)', 'Bismarck’s appointment and army reform in Prussia (1862)', 'The disputed Hohenzollern candidacy for the Spanish throne (1870)'],
      turningPoints: ['Solferino (1859) → Lombardy lost by Austria', 'Königgrätz (1866) → Austria expelled from Germany', 'Sedan (1870) → fall of the Second Empire'],
      outcome: 'A united Kingdom of Italy (1861, completed 1870) and a united German Empire (1871); Austria and France decisively weakened.',
      victor: 'prussia', peaceTreaty: 'treaty:frankfurt',
      territorialChanges: 'Germany consolidated from ~39 states into one empire; Italy united the peninsula from many states into one kingdom. France lost Alsace-Lorraine; Austria lost Lombardy, Venetia and its leadership of Germany.',
      significance: 'Created the two nation-states that would dominate 20th-century European history and shattered the balance of power settled at Vienna in 1815 — setting the stage for the alliance system and, ultimately, the First World War.',
      humanCost: 'Far less costly than the total wars that followed: the four conflicts together caused on the order of <strong>200,000–300,000</strong> military and civilian deaths <span class="conf low">low confidence</span>, concentrated in the campaigns of 1866 and 1870–71.',
      consequences: ['A united Germany becomes the strongest land power in Europe', 'A united Italy, though poorer and internally divided', 'French desire to recover Alsace-Lorraine (revanchism)', 'The Habsburgs turn to the Balkans as Austria-Hungary']
    },
    factions: {
      prussia: { label: 'Prussia / Germany', colorVar: '--prussia' },
      'german-states': { label: 'Independent German states', colorVar: '--german-states' },
      italy: { label: 'Sardinia / Italy', colorVar: '--italy' },
      'italian-states': { label: 'Independent Italian states', colorVar: '--italian-states' },
      austria: { label: 'Austrian Empire', colorVar: '--austria' },
      france: { label: 'French Empire', colorVar: '--france' },
      neutral: { label: 'Other states', colorVar: '--neutral' }
    },
    legendOrder: ['prussia', 'german-states', 'italy', 'italian-states', 'austria', 'france', 'neutral'],
    sides: {
      prussia: { label: 'Prussia / Germany', factionKey: 'prussia' },
      italy: { label: 'Sardinia / Italy', factionKey: 'italy' },
      austria: { label: 'Austria', factionKey: 'austria' },
      france: { label: 'France', factionKey: 'france' },
      'german-state': { label: 'German state', factionKey: 'german-states' },
      'italian-state': { label: 'Italian state', factionKey: 'italian-states' }
    },
    sources: S, nations, leaders, battles, treaties, cities, timeline, worldContext, quizzes,
    /* Borders: the ~1815 basemap (fragmented Germany & Italy) for 1859–1870, then
       the 1880 basemap (unified Germany & Italy) from 1871 — so unification is
       visible as the map consolidates. `fit:'sphere'` shows the whole globe (the
       convention for world-basemap wars), with the action concentrated in Europe. */
    geo: {
      borderSnapshots: {
        1859: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1815.geojson',
        1871: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1880.geojson'
      },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson',
      note: 'Borders switch from an ~1815 map (fragmented) to an 1880 map (unified) in 1871; intermediate cessions are simplified.'
    }
  };
})();
