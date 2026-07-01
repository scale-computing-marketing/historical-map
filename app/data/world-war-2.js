/* Historical Wars Explorer — dataset: World War II (1939–1945)
   PURE DATA, same shape as the other wars. Registers itself on window.HWE.wars;
   the engine and app need no changes. A world conflict, so it colors world
   polities by alliance (Allied vs Axis) over the 1938 historical basemap.

   Allegiance is resolved per year: Italy is neutral until 1940; the Soviet
   Union, the United States, Japan and the eastern Axis satellites until 1941.
   The final-year (1945) view uses the post-war basemap, so the Axis collapse —
   Germany and Japan carved into Allied occupation zones — becomes visible.     */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {
    beevor: { id: 'src:beevor', type: 'book', citation: 'Antony Beevor, The Second World War (Weidenfeld & Nicolson)', reliability: 'high' },
    keegan: { id: 'src:keegan-ww2', type: 'book', citation: 'John Keegan, The Second World War (Hutchinson)', reliability: 'high' },
    weinberg: { id: 'src:weinberg', type: 'book', citation: 'Gerhard L. Weinberg, A World at Arms (Cambridge University Press)', reliability: 'high' },
    shirer: { id: 'src:shirer', type: 'book', citation: 'William L. Shirer, The Rise and Fall of the Third Reich', reliability: 'medium' },
    iwm: { id: 'src:iwm-ww2', type: 'museum', citation: 'Imperial War Museum — Second World War collections', url: 'https://www.iwm.org.uk/history/second-world-war', reliability: 'high' },
    nww2m: { id: 'src:nationalww2', type: 'museum', citation: 'The National WWII Museum, New Orleans', url: 'https://www.nationalww2museum.org/', reliability: 'high' },
    britannica: { id: 'src:britannica-ww2', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    hbm: { id: 'src:historical-basemaps-1938', type: 'archive', citation: 'aourednik/historical-basemaps (world_1938 / world_1945), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });
  const v = (value) => ({ value });

  /* ---- NATIONS ---------------------------------------------------------- */
  /* British Empire is listed first so its many colonies (SUBJECTO "United
     Kingdom") resolve before anything else. geoNames/geoSubjects use the 1938
     basemap labels and the post-war (1945) labels where they differ. */
  const nations = [
    {
      id: 'nation:british-empire', type: 'nation', name: 'British Empire', short: 'Britain',
      side: 'allied', entered: 1939, exited: 1945, factionKey: 'allied',
      capital: { name: 'London', lon: -0.13, lat: 51.5 },
      geoNames: ['United Kingdom', 'Canada', 'Australia', 'New Zealand', 'Union of South Africa', 'British Raj', 'India',
        'British Somaliland', 'Egypt', 'Sudan', 'Nigeria', 'Gold Coast', 'Sierra Leone', 'Gambia, The', 'Kenya', 'Uganda',
        'Malawi', 'Northern Rhodesia', 'Southern Rhodesia', 'Rhodesia', 'Nyasaland', 'Botswana', 'Lesotho', 'Swaziland',
        'Tanzania, United Republic of', 'Somalia', 'Ceylon', 'Malaysia', 'Hong Kong', 'Malta', 'Brunei', 'Guyana', 'Belize',
        'Fiji', 'Gilbert and Elice Islands', 'Mandatory Palestine (GB)', 'Mesopotamia (GB)', 'Dominion of Newfoundland',
        'Cyraneica (UK Lybia)', 'Tripolitana (UK Lybia)', 'Eritrea', 'Jamaica (UK)', 'Southern Cameroon', 'Walbis Bay',
        'Yemen (UK)', 'Oman (British Raj)'],
      geoSubjects: ['United Kingdom', 'United Kingdom of Great Britain and Ireland'],
      summary: 'Britain and its empire declared war after the invasion of Poland in September 1939, and after the fall of France in 1940 stood alone against Nazi Germany. Its navy, air force, industry and global manpower made it a pillar of the Allied coalition to the end.',
      objectives: ['Halt German (and later Japanese) expansion', 'Survive the 1940–41 assault and keep sea lanes open', 'Defeat the Axis in alliance with the USSR and United States'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy & empire', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'monarch', value: 'King George VI (r. 1936–1952)', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'headOfGovernment', value: 'Neville Chamberlain (PM)', from: 1939, to: 1940, confidence: 'high', sources: ['src:beevor'] },
        { attr: 'headOfGovernment', value: 'Winston Churchill (PM)', from: 1940, to: 1945, confidence: 'high', sources: ['src:beevor'] },
        { attr: 'population', value: r(490000000, 540000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'], note: 'Empire-wide; the United Kingdom itself was ~48 million' },
        { attr: 'army', value: 'British & Commonwealth forces — ~8.6 million mobilised across all services', from: 1939, to: 1945, confidence: 'medium', sources: ['src:iwm-ww2'] },
        { attr: 'navy', value: 'Royal Navy — fought the Battle of the Atlantic and escorted global convoys', from: 1939, to: 1945, confidence: 'high', sources: ['src:keegan-ww2'] }
      ]
    },
    {
      id: 'nation:soviet-union', type: 'nation', name: 'Soviet Union', short: 'USSR',
      side: 'allied', entered: 1941, exited: 1945, factionKey: 'allied',
      capital: { name: 'Moscow', lon: 37.62, lat: 55.75 },
      geoNames: ['USSR'], geoSubjects: ['USSR'],
      summary: 'Bound to Germany by a 1939 non-aggression pact, the USSR was invaded in June 1941 and bore the largest share of the fighting and the dead. From Stalingrad onward the Red Army rolled the Wehrmacht back across Eastern Europe to Berlin.',
      objectives: ['Survive the German invasion of 1941', 'Destroy Nazi Germany and secure the Soviet state', 'Extend Soviet control over Eastern Europe'],
      facts: [
        { attr: 'government', value: 'One-party communist state', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'leader', value: 'Joseph Stalin (General Secretary)', from: 1939, to: 1945, confidence: 'high', sources: ['src:beevor'] },
        { attr: 'population', value: r(168000000, 196000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'] },
        { attr: 'army', value: 'Red Army — over 34 million served; the war’s decisive land force', from: 1941, to: 1945, confidence: 'medium', sources: ['src:beevor'] },
        { attr: 'entryEvent', value: 'Invaded by Germany (Operation Barbarossa), 22 June 1941', from: 1941, to: 1945, confidence: 'high', sources: ['src:weinberg'] }
      ]
    },
    {
      id: 'nation:united-states', type: 'nation', name: 'United States', short: 'United States',
      side: 'allied', entered: 1941, exited: 1945, factionKey: 'allied',
      capital: { name: 'Washington, D.C.', lon: -77.04, lat: 38.91 },
      geoNames: ['United States', 'Philippines', 'Puerto Rico', 'Guam', 'American Samoa', 'United States Virgin Islands',
        'Germany (USA)', 'Japan (USA)', 'Korea (USA)'],
      geoSubjects: ['United States', 'USA'],
      summary: 'Neutral until the Japanese attack on Pearl Harbor in December 1941, the United States then mobilised its unmatched industry across two oceans. Its production, manpower and finance underwrote Allied victory in both Europe and the Pacific.',
      objectives: ['Answer the attack on Pearl Harbor', 'Defeat Germany first, then Japan', 'Serve as the “arsenal of democracy” and shape the postwar order'],
      facts: [
        { attr: 'government', value: 'Federal republic', from: 1939, to: 1945, confidence: 'high', sources: ['src:nationalww2'] },
        { attr: 'leader', value: 'President Franklin D. Roosevelt', from: 1939, to: 1945, confidence: 'high', sources: ['src:nationalww2'] },
        { attr: 'leader', value: 'President Harry S. Truman (from April 1945)', from: 1945, to: 1945, confidence: 'high', sources: ['src:nationalww2'] },
        { attr: 'population', value: r(131000000, 140000000), from: 1939, to: 1945, confidence: 'high', sources: ['src:nationalww2'] },
        { attr: 'army', value: 'U.S. armed forces — ~16 million served during the war', from: 1941, to: 1945, confidence: 'high', sources: ['src:nationalww2'] },
        { attr: 'entryEvent', value: 'Entered the war after Pearl Harbor, 7–8 December 1941', from: 1941, to: 1945, confidence: 'high', sources: ['src:nationalww2'] }
      ]
    },
    {
      id: 'nation:france', type: 'nation', name: 'France', short: 'France',
      side: 'allied', entered: 1939, exited: 1945, factionKey: 'allied',
      capital: { name: 'Paris', lon: 2.35, lat: 48.85 },
      geoNames: ['France', 'Algeria', 'Algeria (France)', 'Tunisia', 'Morocco', 'Morocco (France)', 'French West Africa',
        'French Equatorial Africa', 'French Indo-China', 'Madagascar (France)', 'French Guiana', 'Syria (France)',
        'French Cameroons', 'French Somaliland', 'New Caledonia', 'New Hebrides', 'Guadeloupe', 'Martinique',
        'Chad', 'Niger', 'Mali', 'Mauritania', 'Senegal', 'Guinea', 'Ivory Coast',
        'Germany (France)', 'Saar Protectorate', 'Fezzan (Frech Lybia)'],
      geoSubjects: ['France'],
      summary: 'France declared war in 1939 but was overwhelmed in six weeks in 1940, splitting into German-occupied territory, the collaborationist Vichy state, and Charles de Gaulle’s Free French. Liberated in 1944, it ended the war among the victors.',
      objectives: ['Contain German aggression alongside Britain', 'After 1940: liberate France (Free French)', 'Restore the Republic and its empire'],
      facts: [
        { attr: 'government', value: 'Republic (Third Republic)', from: 1939, to: 1940, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'government', value: 'Fall of France; Vichy régime & Free French', from: 1940, to: 1944, confidence: 'high', sources: ['src:beevor'] },
        { attr: 'leader', value: 'Gen. Charles de Gaulle (Free France)', from: 1940, to: 1945, confidence: 'high', sources: ['src:beevor'] },
        { attr: 'population', value: r(41000000, 42000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'], note: 'Metropolitan France' },
        { attr: 'entryEvent', value: 'Defeated in the Battle of France, June 1940; liberated 1944', from: 1940, to: 1944, confidence: 'high', sources: ['src:beevor'] }
      ]
    },
    {
      id: 'nation:china', type: 'nation', name: 'Republic of China', short: 'China',
      side: 'allied', entered: 1939, exited: 1945, factionKey: 'allied',
      capital: { name: 'Chongqing', lon: 106.55, lat: 29.56 },
      geoNames: ['Chinese warlords', 'China'], geoSubjects: ['Chinese warlords', 'China'],
      summary: 'China had been fighting Japan since 1937 and tied down large Japanese armies throughout the war. Despite staggering losses and internal division between Nationalists and Communists, it remained in the field and joined the Allied “Big Four”.',
      objectives: ['Resist and expel the Japanese invasion', 'Preserve Chinese sovereignty', 'Secure great-power recognition'],
      facts: [
        { attr: 'government', value: 'Nationalist republic (Kuomintang)', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'leader', value: 'Generalissimo Chiang Kai-shek', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'population', value: r(500000000, 540000000), from: 1939, to: 1945, confidence: 'low', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'At war with Japan since the 1937 Marco Polo Bridge Incident', from: 1939, to: 1945, confidence: 'high', sources: ['src:weinberg'] }
      ]
    },
    {
      id: 'nation:poland', type: 'nation', name: 'Poland', short: 'Poland',
      side: 'allied', entered: 1939, exited: 1945, factionKey: 'allied',
      capital: { name: 'Warsaw', lon: 21.01, lat: 52.23 },
      geoNames: ['Poland'], geoSubjects: ['Poland'],
      summary: 'The invasion of Poland by Germany on 1 September 1939 began the war in Europe; the Soviet Union invaded from the east weeks later. Occupied and brutalised for the whole war, Poland fought on through a government-in-exile, the Home Army and forces abroad.',
      objectives: ['Defend national independence', 'Continue the fight in exile and underground', 'Restore a free Poland'],
      facts: [
        { attr: 'government', value: 'Republic (later a government-in-exile)', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'population', value: r(34000000, 35000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Invaded by Germany, 1 September 1939 — the war begins', from: 1939, to: 1945, confidence: 'high', sources: ['src:shirer'] }
      ]
    },
    {
      id: 'nation:germany', type: 'nation', name: 'Nazi Germany', short: 'Germany',
      side: 'axis', entered: 1939, exited: 1945, factionKey: 'axis',
      capital: { name: 'Berlin', lon: 13.40, lat: 52.52 },
      geoNames: ['Germany', 'Austria'], geoSubjects: ['Germany'],
      summary: 'The Third Reich launched the war in Europe with the invasion of Poland and conquered most of the continent by 1941. Overreach in the Soviet Union, the weight of the Grand Alliance and relentless bombing ground it down to total defeat and unconditional surrender in May 1945.',
      objectives: ['Overturn the Versailles settlement and expand German “living space”', 'Dominate the European continent', 'Wage a war of annihilation in the east'],
      facts: [
        { attr: 'government', value: 'Nazi one-party dictatorship', from: 1939, to: 1945, confidence: 'high', sources: ['src:shirer'] },
        { attr: 'leader', value: 'Adolf Hitler (Führer)', from: 1939, to: 1945, confidence: 'high', sources: ['src:shirer'] },
        { attr: 'population', value: r(69000000, 80000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'], note: 'Greater Germany, incl. annexed Austria' },
        { attr: 'army', value: 'Wehrmacht — ~13–18 million served; pioneered Blitzkrieg', from: 1939, to: 1945, confidence: 'medium', sources: ['src:beevor'] },
        { attr: 'entryEvent', value: 'Surrendered unconditionally, 7–8 May 1945', from: 1945, to: 1945, confidence: 'high', sources: ['src:beevor'] }
      ]
    },
    {
      id: 'nation:japan', type: 'nation', name: 'Empire of Japan', short: 'Japan',
      side: 'axis', entered: 1941, exited: 1945, factionKey: 'axis',
      capital: { name: 'Tokyo', lon: 139.69, lat: 35.69 },
      geoNames: ['Empire of Japan'], geoSubjects: ['Empire of Japan'],
      summary: 'Already at war in China, Japan struck Pearl Harbor and swept across Southeast Asia and the Pacific in 1941–42. The United States rolled it back island by island; after Hiroshima and Nagasaki and the Soviet entry, Japan surrendered in September 1945.',
      objectives: ['Build the Greater East Asia Co-Prosperity Sphere', 'Secure oil and resources by conquest', 'Cripple U.S. power in the Pacific'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy under military dominance', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'monarch', value: 'Emperor Hirohito (Shōwa)', from: 1939, to: 1945, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'population', value: r(71000000, 74000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'], note: 'Home islands' },
        { attr: 'entryEvent', value: 'Attacked Pearl Harbor, 7 December 1941; surrendered 2 September 1945', from: 1941, to: 1945, confidence: 'high', sources: ['src:nationalww2'] }
      ]
    },
    {
      id: 'nation:italy', type: 'nation', name: 'Kingdom of Italy', short: 'Italy',
      side: 'axis', entered: 1940, exited: 1945, factionKey: 'axis',
      capital: { name: 'Rome', lon: 12.50, lat: 41.90 },
      geoNames: ['Italy', 'Libya', 'Eritrea (Italy)', 'Ethiopia (Italy)', 'Italian Somaliland'], geoSubjects: ['Italy'],
      summary: 'Mussolini’s Italy entered the war in June 1940 to share in Germany’s expected spoils, but suffered defeats in Greece, North Africa and East Africa. Invaded by the Allies in 1943, it surrendered and switched sides as Germany occupied the north.',
      objectives: ['Build a new Roman empire around the Mediterranean', 'Expand in North and East Africa', 'Support its German ally'],
      facts: [
        { attr: 'government', value: 'Fascist monarchy', from: 1939, to: 1943, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'leader', value: 'Benito Mussolini (Il Duce)', from: 1939, to: 1943, confidence: 'high', sources: ['src:britannica-ww2'] },
        { attr: 'population', value: r(44000000, 45000000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Declared war on Britain and France, 10 June 1940; armistice with the Allies, Sept 1943', from: 1940, to: 1943, confidence: 'high', sources: ['src:beevor'] }
      ]
    },
    {
      id: 'nation:hungary', type: 'nation', name: 'Hungary', short: 'Hungary',
      side: 'axis', entered: 1941, exited: 1945, factionKey: 'axis',
      capital: { name: 'Budapest', lon: 19.04, lat: 47.50 },
      geoNames: ['Hungary'], geoSubjects: ['Hungary'],
      summary: 'Hungary joined the Axis to recover territory lost after World War I and sent troops to the Eastern Front, where its army was shattered at Stalingrad. It was occupied by Germany in 1944 and overrun by the Red Army in 1945.',
      objectives: ['Regain lands lost by the Treaty of Trianon', 'Support the German war in the east'],
      facts: [
        { attr: 'population', value: r(9000000, 14000000), from: 1939, to: 1945, confidence: 'low', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Joined the Axis war on the USSR, 1941', from: 1941, to: 1945, confidence: 'medium', sources: ['src:weinberg'] }
      ]
    },
    {
      id: 'nation:romania', type: 'nation', name: 'Romania', short: 'Romania',
      side: 'axis', entered: 1941, exited: 1944, factionKey: 'axis',
      capital: { name: 'Bucharest', lon: 26.10, lat: 44.43 },
      geoNames: ['Romania'], geoSubjects: ['Romania'],
      summary: 'Romania joined the Axis and supplied Germany with vital oil and large armies for the invasion of the USSR. After heavy losses it switched to the Allies in August 1944 as the Red Army arrived.',
      objectives: ['Recover Bessarabia from the USSR', 'Secure German backing against its neighbours'],
      facts: [
        { attr: 'population', value: r(13000000, 20000000), from: 1939, to: 1945, confidence: 'low', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Joined the Axis invasion of the USSR (1941); changed sides Aug 1944', from: 1941, to: 1944, confidence: 'medium', sources: ['src:weinberg'] }
      ]
    },
    {
      id: 'nation:bulgaria', type: 'nation', name: 'Bulgaria', short: 'Bulgaria',
      side: 'axis', entered: 1941, exited: 1944, factionKey: 'axis',
      capital: { name: 'Sofia', lon: 23.32, lat: 42.70 },
      geoNames: ['Bulgaria'], geoSubjects: ['Bulgaria'],
      summary: 'Bulgaria joined the Axis in 1941 and occupied parts of Greece and Yugoslavia, but avoided sending troops against the USSR. It switched to the Allies in September 1944 as Soviet forces approached.',
      objectives: ['Regain territory in Macedonia and Thrace', 'Stay out of the war with the USSR'],
      facts: [
        { attr: 'population', value: r(6300000, 6800000), from: 1939, to: 1945, confidence: 'low', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Joined the Axis, March 1941; changed sides Sept 1944', from: 1941, to: 1944, confidence: 'medium', sources: ['src:weinberg'] }
      ]
    },
    {
      id: 'nation:finland', type: 'nation', name: 'Finland', short: 'Finland',
      side: 'axis', entered: 1941, exited: 1944, factionKey: 'axis',
      capital: { name: 'Helsinki', lon: 24.94, lat: 60.17 },
      geoNames: ['Finland'], geoSubjects: ['Finland'],
      summary: 'Attacked by the USSR in the 1939–40 Winter War, Finland later fought alongside Germany as a co-belligerent from 1941 to recover its losses. It made a separate peace with the Soviets in 1944.',
      objectives: ['Recover territory lost in the Winter War', 'Preserve Finnish independence'],
      facts: [
        { attr: 'population', value: r(3700000, 3900000), from: 1939, to: 1945, confidence: 'medium', sources: ['src:britannica-ww2'] },
        { attr: 'entryEvent', value: 'Co-belligerent with Germany (Continuation War), 1941–44', from: 1941, to: 1944, confidence: 'medium', sources: ['src:weinberg'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:churchill', name: 'Winston Churchill', nationId: 'nation:british-empire', role: 'Prime Minister of the United Kingdom (1940–1945)', years: '1874–1965', side: 'allied',
      bio: 'Took office as France fell in 1940 and rallied Britain through its darkest year with defiant oratory. A driving force of the Grand Alliance with Roosevelt and Stalin.', confidence: 'high', sources: ['src:beevor'] },
    { id: 'person:roosevelt', name: 'Franklin D. Roosevelt', nationId: 'nation:united-states', role: 'President of the United States (1933–1945)', years: '1882–1945', side: 'allied',
      bio: 'Guided the U.S. from neutrality to the “arsenal of democracy” and then to full belligerency after Pearl Harbor. He shaped Allied grand strategy but died weeks before victory in Europe.', confidence: 'high', sources: ['src:nationalww2'] },
    { id: 'person:stalin', name: 'Joseph Stalin', nationId: 'nation:soviet-union', role: 'Leader of the Soviet Union', years: '1878–1953', side: 'allied',
      bio: 'Signed a pact with Hitler in 1939, was caught off guard by the 1941 invasion, then marshalled the USSR’s vast resources and manpower to break the Wehrmacht and drive to Berlin.',
      relatedBattles: ['battle:stalingrad', 'battle:kursk', 'battle:berlin'], confidence: 'high', sources: ['src:beevor'] },
    { id: 'person:eisenhower', name: 'Dwight D. Eisenhower', nationId: 'nation:united-states', role: 'Supreme Allied Commander, Europe', years: '1890–1969', side: 'allied',
      bio: 'Commanded the Allied landings in North Africa, Sicily and Italy, then directed the D-Day invasion and the campaign that liberated Western Europe.',
      relatedBattles: ['battle:normandy', 'battle:bulge'], confidence: 'high', sources: ['src:nationalww2'] },
    { id: 'person:montgomery', name: 'Bernard Montgomery', nationId: 'nation:british-empire', role: 'British Field Marshal', years: '1887–1976', side: 'allied',
      bio: 'Victor of El Alamein, which turned the tide in North Africa, he went on to command Allied ground forces in Normandy and the drive into Germany.',
      relatedBattles: ['battle:el-alamein', 'battle:normandy'], confidence: 'high', sources: ['src:beevor'] },
    { id: 'person:zhukov', name: 'Georgy Zhukov', nationId: 'nation:soviet-union', role: 'Marshal of the Soviet Union', years: '1896–1974', side: 'allied',
      bio: 'The Red Army’s foremost commander: he held Moscow, encircled the Germans at Stalingrad, won at Kursk and led the final assault on Berlin.',
      relatedBattles: ['battle:stalingrad', 'battle:kursk', 'battle:berlin'], confidence: 'high', sources: ['src:beevor'] },
    { id: 'person:chiang', name: 'Chiang Kai-shek', nationId: 'nation:china', role: 'Leader of Nationalist China', years: '1887–1975', side: 'allied',
      bio: 'Led China’s long resistance to Japan from the wartime capital of Chongqing, holding the country in the war despite defeats and the strains of civil conflict with the Communists.', confidence: 'high', sources: ['src:britannica-ww2'] },
    { id: 'person:hitler', name: 'Adolf Hitler', nationId: 'nation:germany', role: 'Führer of Germany', years: '1889–1945', side: 'axis',
      bio: 'The Nazi dictator who launched the war and its genocidal “new order”. His refusal to yield ground doomed German armies from Stalingrad on; he killed himself in Berlin in April 1945.',
      relatedBattles: ['battle:poland', 'battle:barbarossa', 'battle:stalingrad'], confidence: 'high', sources: ['src:shirer'] },
    { id: 'person:mussolini', name: 'Benito Mussolini', nationId: 'nation:italy', role: 'Prime Minister of Italy (Il Duce)', years: '1883–1945', side: 'axis',
      bio: 'The Fascist dictator who took Italy into the war in 1940 seeking a Mediterranean empire. Deposed in 1943 after Allied invasion, he was propped up in the north by Germany and killed in 1945.', confidence: 'high', sources: ['src:britannica-ww2'] },
    { id: 'person:hirohito', name: 'Emperor Hirohito', nationId: 'nation:japan', role: 'Emperor of Japan', years: '1901–1989', side: 'axis',
      bio: 'Japan’s wartime emperor, in whose name the empire fought across Asia and the Pacific. He broke the deadlock in his cabinet to announce Japan’s surrender in August 1945.', confidence: 'medium', sources: ['src:britannica-ww2'] },
    { id: 'person:tojo', name: 'Hideki Tōjō', nationId: 'nation:japan', role: 'Prime Minister of Japan (1941–1944)', years: '1884–1948', side: 'axis',
      bio: 'The general and prime minister who presided over the attack on Pearl Harbor and the early conquests. He resigned after the fall of Saipan in 1944 and was later executed for war crimes.',
      relatedBattles: ['battle:pearl-harbor'], confidence: 'high', sources: ['src:britannica-ww2'] },
    { id: 'person:rommel', name: 'Erwin Rommel', nationId: 'nation:germany', role: 'German Field Marshal', years: '1891–1944', side: 'axis',
      bio: 'The “Desert Fox” who led the Afrika Korps in North Africa and later commanded the Atlantic defences against the D-Day invasion. Implicated in the 1944 plot against Hitler, he was forced to take his own life.',
      relatedBattles: ['battle:el-alamein', 'battle:normandy'], confidence: 'high', sources: ['src:beevor'] },
    { id: 'person:yamamoto', name: 'Isoroku Yamamoto', nationId: 'nation:japan', role: 'Commander-in-Chief, Japanese Combined Fleet', years: '1884–1943', side: 'axis',
      bio: 'The admiral who planned the Pearl Harbor attack while doubting Japan could win a long war. His gamble at Midway ended in disaster; he was killed when U.S. fighters ambushed his aircraft in 1943.',
      relatedBattles: ['battle:pearl-harbor', 'battle:midway'], confidence: 'high', sources: ['src:nationalww2'] }
  ];

  /* ---- BATTLES ---------------------------------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'medium', sources: ['src:keegan-ww2'] }, opts || {});
  const battles = [
    B('battle:poland', 'Invasion of Poland', 1939, 9, 1, 21.01, 52.23, 'Poland', 'Axis (German/Soviet)', 'Germany’s Blitzkrieg into Poland — followed by a Soviet invasion from the east — began the war in Europe and demonstrated a new kind of mechanised warfare.', { date: { y: 1939, m: 9, d: 1, end: { y: 1939, m: 10, d: 6 } }, commanders: ['person:hitler'] }),
    B('battle:france-1940', 'Battle of France', 1940, 5, 10, 2.35, 49.50, 'France & the Low Countries', 'Axis (German)', 'A stunning six-week campaign that overran the Netherlands, Belgium and France, drove Britain from the continent at Dunkirk and left Germany dominant in Western Europe.', { date: { y: 1940, m: 5, d: 10, end: { y: 1940, m: 6, d: 25 } } }),
    B('battle:britain', 'Battle of Britain', 1940, 7, 10, 0.20, 51.30, 'Skies over Britain', 'Allied (British)', 'The first major battle fought entirely in the air. The RAF held off the Luftwaffe, denying Germany the air supremacy it needed to invade Britain.', { air: true, date: { y: 1940, m: 7, d: 10, end: { y: 1940, m: 10, d: 31 } } }),
    B('battle:barbarossa', 'Operation Barbarossa', 1941, 6, 22, 30.52, 52.10, 'Western USSR', 'Inconclusive', 'The largest land invasion in history opened the Eastern Front. Germany drove deep into the USSR but failed to knock it out — and turned a European war into a global one of attrition.', { date: { y: 1941, m: 6, d: 22, end: { y: 1941, m: 12, d: 5 } }, commanders: ['person:hitler'] }),
    B('battle:pearl-harbor', 'Attack on Pearl Harbor', 1941, 12, 7, -157.95, 21.36, 'Hawaii', 'Axis (Japanese)', 'A surprise carrier strike on the U.S. Pacific Fleet that brought the United States into the war and opened the Pacific conflict.', { naval: true, air: true, commanders: ['person:yamamoto', 'person:tojo'] }),
    B('battle:midway', 'Battle of Midway', 1942, 6, 4, -177.37, 28.21, 'Central Pacific', 'Allied (American)', 'A decisive carrier battle in which the U.S. Navy sank four Japanese carriers, halting Japanese expansion and turning the tide in the Pacific.', { naval: true, decisive: true, commanders: ['person:yamamoto'] }),
    B('battle:el-alamein', 'Second Battle of El Alamein', 1942, 10, 23, 28.95, 30.83, 'Egypt', 'Allied (British)', 'Montgomery’s Eighth Army broke Rommel’s Afrika Korps, ending the Axis threat to Egypt and the Suez Canal and turning the tide in North Africa.', { date: { y: 1942, m: 10, d: 23, end: { y: 1942, m: 11, d: 11 } }, commanders: ['person:montgomery', 'person:rommel'] }),
    B('battle:guadalcanal', 'Guadalcanal Campaign', 1942, 8, 7, 160.00, -9.50, 'Solomon Islands', 'Allied (American)', 'The first major Allied offensive in the Pacific. Months of grinding land, sea and air combat seized the initiative from Japan for good.', { date: { y: 1942, m: 8, d: 7, end: { y: 1943, m: 2, d: 9 } } }),
    B('battle:stalingrad', 'Battle of Stalingrad', 1942, 8, 23, 44.42, 48.71, 'Stalingrad, USSR', 'Allied (Soviet)', 'The bloodiest battle of the war. The encirclement and destruction of a German army marked the great turning point on the Eastern Front.', { decisive: true, date: { y: 1942, m: 8, d: 23, end: { y: 1943, m: 2, d: 2 } }, commanders: ['person:zhukov'], casualties: { allied: r(1100000, 1130000), axis: r(800000, 850000) } }),
    B('battle:kursk', 'Battle of Kursk', 1943, 7, 5, 36.19, 51.73, 'Kursk, USSR', 'Allied (Soviet)', 'The largest tank battle in history. The failure of Germany’s last major eastern offensive left the strategic initiative permanently with the Red Army.', { date: { y: 1943, m: 7, d: 5, end: { y: 1943, m: 8, d: 23 } }, commanders: ['person:zhukov'] }),
    B('battle:normandy', 'D-Day & the Normandy Invasion', 1944, 6, 6, -0.86, 49.34, 'Normandy, France', 'Allied', 'The largest amphibious invasion in history opened the Western Front in force, beginning the liberation of Western Europe.', { decisive: true, date: { y: 1944, m: 6, d: 6, end: { y: 1944, m: 8, d: 30 } }, commanders: ['person:eisenhower', 'person:montgomery', 'person:rommel'] }),
    B('battle:bulge', 'Battle of the Bulge', 1944, 12, 16, 5.80, 50.20, 'Ardennes, Belgium', 'Allied', 'Germany’s last great offensive in the west. Its failure exhausted German reserves and opened the road into Germany itself.', { date: { y: 1944, m: 12, d: 16, end: { y: 1945, m: 1, d: 25 } }, commanders: ['person:eisenhower'] }),
    B('battle:iwo-jima', 'Battle of Iwo Jima', 1945, 2, 19, 141.32, 24.78, 'Iwo Jima, Pacific', 'Allied (American)', 'A ferocious island assault that secured airfields close to Japan and produced one of the war’s most iconic images — the flag-raising on Mount Suribachi.', { date: { y: 1945, m: 2, d: 19, end: { y: 1945, m: 3, d: 26 } } }),
    B('battle:berlin', 'Battle of Berlin', 1945, 4, 16, 13.40, 52.52, 'Berlin, Germany', 'Allied (Soviet)', 'The Red Army’s final assault on the German capital. Hitler killed himself as the city fell, and Germany surrendered days later.', { decisive: true, date: { y: 1945, m: 4, d: 16, end: { y: 1945, m: 5, d: 2 } }, commanders: ['person:zhukov'] })
  ];

  /* ---- TREATIES / AGREEMENTS -------------------------------------------- */
  const treaties = [
    { id: 'treaty:molotov-ribbentrop', type: 'treaty', name: 'Molotov–Ribbentrop Pact', date: { y: 1939, m: 8, d: 23 },
      signatories: ['nation:germany', 'nation:soviet-union'], summary: 'A German–Soviet non-aggression pact with a secret protocol carving up Eastern Europe. It cleared the way for the invasion of Poland a week later and held until Germany turned on the USSR in 1941.', confidence: 'high', sources: ['src:shirer'] },
    { id: 'treaty:german-surrender-1945', type: 'treaty', name: 'German Instrument of Surrender', date: { y: 1945, m: 5, d: 8 },
      signatories: ['nation:germany', 'nation:soviet-union', 'nation:united-states', 'nation:british-empire'], summary: 'Germany’s unconditional surrender ended the war in Europe. The guns fell silent on 8 May 1945 — Victory in Europe (V-E) Day.', confidence: 'high', sources: ['src:beevor'] },
    { id: 'treaty:japanese-surrender-1945', type: 'treaty', name: 'Japanese Instrument of Surrender', date: { y: 1945, m: 9, d: 2 },
      signatories: ['nation:japan', 'nation:united-states', 'nation:british-empire', 'nation:soviet-union'], summary: 'Signed aboard USS Missouri in Tokyo Bay after the atomic bombings and the Soviet declaration of war, Japan’s surrender ended World War II.', confidence: 'high', sources: ['src:nationalww2'] }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:london-ww2', name: 'London', lon: -0.13, lat: 51.5, capitalOf: 'nation:british-empire', note: 'Capital of the British Empire; endured the Blitz of 1940–41.' },
    { id: 'city:moscow', name: 'Moscow', lon: 37.62, lat: 55.75, capitalOf: 'nation:soviet-union', note: 'Soviet capital; the German advance was halted at its gates in December 1941.' },
    { id: 'city:washington-ww2', name: 'Washington, D.C.', lon: -77.04, lat: 38.91, capitalOf: 'nation:united-states', note: 'Capital of the United States, the Allied “arsenal of democracy”.' },
    { id: 'city:paris-ww2', name: 'Paris', lon: 2.35, lat: 48.85, capitalOf: 'nation:france', note: 'Occupied by Germany in 1940 and liberated in August 1944.' },
    { id: 'city:chongqing', name: 'Chongqing', lon: 106.55, lat: 29.56, capitalOf: 'nation:china', note: 'China’s wartime capital, heavily bombed by Japan.' },
    { id: 'city:berlin-ww2', name: 'Berlin', lon: 13.40, lat: 52.52, capitalOf: 'nation:germany', note: 'Capital of Nazi Germany; stormed by the Red Army in 1945.' },
    { id: 'city:rome-ww2', name: 'Rome', lon: 12.50, lat: 41.90, capitalOf: 'nation:italy', note: 'Capital of Fascist Italy; liberated by the Allies in June 1944.' },
    { id: 'city:tokyo', name: 'Tokyo', lon: 139.69, lat: 35.69, capitalOf: 'nation:japan', note: 'Capital of Imperial Japan; devastated by firebombing in 1945.' },
    { id: 'city:warsaw', name: 'Warsaw', lon: 21.01, lat: 52.23, capitalOf: 'nation:poland', note: 'Polish capital; site of the 1943 Ghetto Uprising and the 1944 Warsaw Uprising.' },
    { id: 'city:hiroshima', name: 'Hiroshima', lon: 132.46, lat: 34.39, note: 'Destroyed by the first atomic bomb used in war, 6 August 1945.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:ww2-${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1939, 8, 23, 'treaty', 'Molotov–Ribbentrop Pact', 'Germany and the USSR agree not to fight and secretly divide Eastern Europe.'),
    T(1939, 9, 1, 'battle', 'Germany invades Poland', 'The war in Europe begins; Britain and France declare war two days later.'),
    T(1940, 5, 10, 'battle', 'Germany strikes west', 'The invasion of France and the Low Countries begins.'),
    T(1940, 7, 10, 'battle', 'Battle of Britain', 'The RAF fights off the Luftwaffe over southern England.'),
    T(1941, 6, 22, 'battle', 'Operation Barbarossa', 'Germany invades the Soviet Union, opening the Eastern Front.'),
    T(1941, 12, 7, 'battle', 'Pearl Harbor', 'Japan attacks the U.S. fleet; the United States enters the war.'),
    T(1942, 6, 4, 'battle', 'Midway', 'The U.S. Navy turns the tide in the Pacific.'),
    T(1942, 8, 23, 'battle', 'Stalingrad', 'The decisive battle of the Eastern Front begins.'),
    T(1943, 7, 5, 'battle', 'Kursk', 'Germany’s last great eastern offensive fails.'),
    T(1944, 6, 6, 'battle', 'D-Day', 'The Allies land in Normandy and open the Western Front.'),
    T(1945, 5, 8, 'treaty', 'Victory in Europe', 'Germany surrenders unconditionally.'),
    T(1945, 8, 6, 'political', 'Atomic bombing of Hiroshima', 'The first atomic bomb used in war; Nagasaki follows on 9 August.'),
    T(1945, 9, 2, 'treaty', 'Japan surrenders', 'The formal surrender aboard USS Missouri ends World War II.')
  ];

  /* ---- WORLD AT THIS TIME ----------------------------------------------- */
  const worldContext = {
    _default: {
      worldPopulation: { low: 2300000000, high: 2500000000, confidence: 'low' },
      largestEmpires: ['British Empire', 'Soviet Union', 'French colonial empire', 'Empire of Japan'],
      largestCities: ['London', 'New York', 'Tokyo', 'Berlin'],
      otherConflicts: ['Second Sino-Japanese War (1937–45)', 'Chinese Civil War (paused during the war)'],
      science: ['Radar comes of age', 'Jet and rocket propulsion (Me 262, V-2)', 'The Manhattan Project develops the atomic bomb'],
      culture: ['Big-band swing and wartime cinema', 'Mass propaganda and rationing on the home fronts']
    },
    1941: { otherConflicts: ['Second Sino-Japanese War (1937–45)', 'The Holocaust: systematic mass murder begins across occupied Europe'] },
    1942: { otherConflicts: ['Second Sino-Japanese War (1937–45)', 'The Holocaust across occupied Europe'] },
    1945: {
      otherConflicts: ['The Holocaust’s death camps are liberated', 'Beginnings of the Cold War between the USSR and the West'],
      science: ['Atomic bombs dropped on Hiroshima and Nagasaki', 'ENIAC and wartime computing (Colossus)'],
      culture: ['The United Nations is founded (June 1945)', 'A shattered world begins to reckon with the war’s toll']
    }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:ww2-start', type: 'click-map', prompt: 'Click the Axis power that invaded Poland in September 1939, starting the war in Europe.', accept: { entityId: 'nation:germany' }, feedback: { correct: 'Correct — Germany’s invasion of Poland began the war.', incorrect: 'Look to central Europe — the largest Axis power.' } },
    { id: 'quiz:ww2-pearl', type: 'multiple-choice', prompt: 'Which event brought the United States into World War II?', options: ['The fall of France', 'The attack on Pearl Harbor', 'The invasion of Poland', 'The Battle of Britain'], accept: { option: 'The attack on Pearl Harbor' }, feedback: { correct: 'Correct — Japan’s attack on Pearl Harbor in December 1941 brought the U.S. in.', incorrect: 'Not that one — think of December 1941 in the Pacific.' } },
    { id: 'quiz:ww2-barbarossa', type: 'set-year', prompt: 'Move the timeline to the year Germany invaded the Soviet Union.', accept: { year: 1941 }, feedback: { correct: 'Correct — Operation Barbarossa began in June 1941.', incorrect: 'Try the same year as Pearl Harbor.' } },
    { id: 'quiz:ww2-us', type: 'click-map', prompt: 'Click the Allied power that entered the war after Pearl Harbor and became the “arsenal of democracy”.', accept: { entityId: 'nation:united-states' }, feedback: { correct: 'Correct — the United States entered the war in December 1941.', incorrect: 'Look to North America.' } },
    { id: 'quiz:ww2-end', type: 'set-year', prompt: 'Set the timeline to the year the war ended in both Europe and the Pacific.', accept: { year: 1945 }, feedback: { correct: 'Correct — Germany surrendered in May and Japan in September 1945.', incorrect: 'Move to the final year of the war.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['world-war-2'] = {
    id: 'war:world-war-2', schemaVersion: 1,
    meta: {
      name: 'World War II',
      altNames: ['The Second World War', 'WWII', 'WW2'],
      years: { start: 1939, end: 1945 }, defaultYear: 1942,
      duration: '6 years (1939–1945)',
      summary: 'The deadliest conflict in human history, fought between the Allies (led by the British Empire, the Soviet Union, the United States and China) and the Axis (Germany, Japan, Italy and their satellites). It spanned Europe, Asia, Africa and the Pacific and killed an estimated 70–85 million people.',
      background: 'Resentment of the 1919 peace settlement, the Great Depression, and the rise of aggressive fascist and militarist regimes in Germany, Italy and Japan destabilised the 1930s. Appeasement failed to check German and Japanese expansion.',
      causesLong: ['Grievances left by the Treaty of Versailles', 'The rise of Nazi Germany, Fascist Italy and militarist Japan', 'The Great Depression and collapse of collective security', 'Aggressive expansion: Japan in China, Italy in Africa, Germany in Europe'],
      causesImmediate: ['Germany’s invasion of Poland (1 September 1939)', 'The Molotov–Ribbentrop Pact clearing the way', 'Japan’s attack on Pearl Harbor (December 1941), globalising the war'],
      turningPoints: ['Midway and Stalingrad (1942–43)', 'Kursk and the Italian surrender (1943)', 'D-Day and the drive into Germany (1944)'],
      outcome: 'Total Allied victory; the unconditional surrender of Germany (May 1945) and Japan (September 1945).',
      victor: 'allied', peaceTreaty: 'treaty:japanese-surrender-1945',
      territorialChanges: 'Germany was divided into occupation zones; the USSR extended its control across Eastern Europe; Japan lost its empire; borders shifted west in Poland, and the map of Asia began to decolonise.',
      significance: 'Killed more people than any other war, exposed the Holocaust, ushered in the nuclear age and the United Nations, and left the United States and the Soviet Union as rival superpowers at the dawn of the Cold War.',
      humanCost: 'An estimated <strong>70–85 million</strong> deaths <span class="conf low">low confidence</span> — the deadliest conflict in history — including some <strong>6 million</strong> Jews murdered in the Holocaust and tens of millions of civilians.',
      consequences: ['The Holocaust and the murder of millions of civilians', 'The dawn of the nuclear age', 'The founding of the United Nations', 'The division of Europe and the start of the Cold War', 'The decline of European empires and the beginning of decolonisation']
    },
    factions: {
      allied: { label: 'Allied Powers', colorVar: '--allied' },
      axis: { label: 'Axis Powers', colorVar: '--axis' },
      neutral: { label: 'Neutral', colorVar: '--neutral' }
    },
    legendOrder: ['allied', 'axis', 'neutral'],
    sides: {
      allied: { label: 'Allied Powers', factionKey: 'allied' },
      axis: { label: 'Axis Powers', factionKey: 'axis' }
    },
    sources: S, nations, leaders, battles, treaties, cities, timeline, worldContext, quizzes,
    /* Two border snapshots: 1938 borders serve 1939–1944, then the post-war
       (1945) boundaries from 1945 — the nearest available snapshot — so the Axis
       collapse (Germany and Japan carved into Allied occupation zones) becomes
       visible as you scrub to the war's end. */
    geo: {
      borderSnapshots: {
        1939: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1938.geojson',
        1945: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1945.geojson'
      },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson',
      note: 'Borders: the 1938 map through 1944; the 1945 view uses post-war boundaries — the nearest snapshot — so the Axis collapse into occupation zones is visible.'
    }
  };
})();
