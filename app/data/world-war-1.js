/* Historical Wars Explorer — dataset: World War I (1914–1918)
   PURE DATA, same shape as the other wars. Registers itself on window.HWE.wars;
   the engine and app need no changes. A world conflict, so it colors world
   polities by alliance (like the Revolution) over the 1914 historical basemap.

   Allegiance is resolved per year: Italy is neutral until 1915, the United States
   until 1917, and Russia drops back to neutral after its 1917 revolution.        */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {
    strachan: { id: 'src:strachan', type: 'book', citation: 'Hew Strachan, The First World War (Viking)', reliability: 'high' },
    keegan: { id: 'src:keegan', type: 'book', citation: 'John Keegan, The First World War (Hutchinson)', reliability: 'high' },
    macmillan: { id: 'src:macmillan', type: 'book', citation: 'Margaret MacMillan, The War That Ended Peace (Random House)', reliability: 'high' },
    gilbert: { id: 'src:gilbert', type: 'book', citation: 'Martin Gilbert, The First World War: A Complete History', reliability: 'medium' },
    iwm: { id: 'src:iwm', type: 'museum', citation: 'Imperial War Museum — First World War collections', url: 'https://www.iwm.org.uk/history/first-world-war', reliability: 'high' },
    loc: { id: 'src:loc-ww1', type: 'archive', citation: 'U.S. Library of Congress — World War I', url: 'https://www.loc.gov/', reliability: 'high' },
    britannica: { id: 'src:britannica-ww1', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    hbm: { id: 'src:historical-basemaps-1914', type: 'archive', citation: 'aourednik/historical-basemaps (world_1914), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });
  const v = (value) => ({ value });

  /* ---- NATIONS ---------------------------------------------------------- */
  /* British Empire is listed first so its colonies resolve before anything else.
     geoNames/geoSubjects are the 1914 basemap labels (note the data's own
     spellings: "Kingfom of Italy", "Anglo-Egyption Sudan"). */
  const nations = [
    {
      id: 'nation:british-empire', type: 'nation', name: 'British Empire', short: 'Britain',
      side: 'allied', entered: 1914, exited: 1918, factionKey: 'allied',
      capital: { name: 'London', lon: -0.13, lat: 51.5 },
      geoNames: ['United Kingdom of Great Britain and Ireland', 'Canada', 'Australia', 'New Zealand', 'South Africa',
        'British Raj', 'British East Africa', 'British Somaliland', 'British Protectorate', 'Anglo-Egyption Sudan',
        'Egypt', 'Nigeria', 'Gold Coast', 'Sierra Leone', 'Gambia, The', 'Rhodesia', 'Uganda', 'Malawi',
        'Botswana', 'Lesotho', 'Swaziland', 'Ceylon', 'Malaya', 'Hong Kong', 'Malta', 'Brunei', 'Kuwait', 'Qatar',
        'Guyana', 'Belize', 'Fiji', 'Papua New Guinea'],
      geoSubjects: ['United Kingdom', 'United Kingdom of Great Britain and Ireland'],
      summary: 'The world’s largest empire entered the war when Germany invaded Belgium in August 1914. Its navy, finance, manpower and global dominions made it central to the Allied war effort on every front.',
      objectives: ['Honour the guarantee of Belgian neutrality', 'Preserve the balance of power against German hegemony', 'Protect the empire, sea lanes and trade'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy & empire', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'monarch', value: 'King George V (r. 1910–1936)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'headOfGovernment', value: 'H. H. Asquith (PM)', from: 1914, to: 1916, confidence: 'high', sources: ['src:strachan'] },
        { attr: 'headOfGovernment', value: 'David Lloyd George (PM)', from: 1916, to: 1918, confidence: 'high', sources: ['src:strachan'] },
        { attr: 'population', value: r(420000000, 440000000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'], note: 'Empire-wide; the United Kingdom itself was ~46 million' },
        { attr: 'army', value: 'British & imperial forces — ~8.5 million mobilised over the war', from: 1914, to: 1918, confidence: 'medium', sources: ['src:iwm'] },
        { attr: 'navy', value: 'Royal Navy — the world’s largest; enforced the blockade of Germany', from: 1914, to: 1918, confidence: 'high', sources: ['src:keegan'] }
      ]
    },
    {
      id: 'nation:france', type: 'nation', name: 'France', short: 'France',
      side: 'allied', entered: 1914, exited: 1918, factionKey: 'allied',
      capital: { name: 'Paris', lon: 2.35, lat: 48.85 },
      geoNames: ['France', 'Algeria', 'Tunisia', 'Morocco', 'French West Africa', 'French Equatorial Africa',
        'French Indochina', 'Madagascar (France)', 'French Guiana', 'Djibouti', 'Guadeloupe', 'Martinique',
        'Wallis and Futuna Islands', 'Saint Barthelemy', 'Saint Martin'],
      geoSubjects: ['France'],
      summary: 'Invaded in 1914 and fighting on its own soil for the entire war, France bore the heaviest Western Front burden. Verdun became the symbol of its endurance, and Marshal Foch ended the war as supreme Allied commander.',
      objectives: ['Repel the German invasion and liberate occupied territory', 'Recover Alsace-Lorraine, lost in 1871', 'Break German military power'],
      facts: [
        { attr: 'government', value: 'Republic (Third Republic)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'leader', value: 'President Raymond Poincaré', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'headOfGovernment', value: 'Georges Clemenceau (PM from Nov 1917)', from: 1917, to: 1918, confidence: 'high', sources: ['src:strachan'] },
        { attr: 'population', value: r(39000000, 40000000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'], note: 'Metropolitan France; the colonial empire added tens of millions' },
        { attr: 'army', value: 'French Army — ~8.4 million mobilised; ~1.4 million dead', from: 1914, to: 1918, confidence: 'medium', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:russia', type: 'nation', name: 'Russian Empire', short: 'Russia',
      side: 'allied', entered: 1914, exited: 1917, factionKey: 'allied',
      capital: { name: 'Petrograd', lon: 30.31, lat: 59.94 },
      geoNames: ['Russian Empire', 'Finland', 'Sakhalin (RU)', 'Georgia', 'Armenia', 'Azerbaijan'],
      geoSubjects: ['Russia'],
      summary: 'The largest Allied army by numbers, Russia fought Germany and Austria-Hungary on the vast Eastern Front. Catastrophic losses and strain helped topple the Tsar in 1917; the Bolsheviks then pulled Russia out of the war.',
      objectives: ['Defend against the Central Powers in the east', 'Support Serbia and Slavic interests in the Balkans', 'Seize Constantinople and the Straits (a secret war aim)'],
      facts: [
        { attr: 'government', value: 'Absolute monarchy (Tsarist empire)', from: 1914, to: 1917, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'monarch', value: 'Tsar Nicholas II (r. 1894–1917)', from: 1914, to: 1917, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(165000000, 175000000), from: 1914, to: 1917, confidence: 'medium', sources: ['src:britannica-ww1'] },
        { attr: 'army', value: 'Imperial Russian Army — ~12 million mobilised, the largest of the war', from: 1914, to: 1917, confidence: 'medium', sources: ['src:strachan'] },
        { attr: 'entryEvent', value: 'Left the war: revolution (1917), then the Treaty of Brest-Litovsk (Mar 1918)', from: 1917, to: 1918, confidence: 'high', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:italy', type: 'nation', name: 'Kingdom of Italy', short: 'Italy',
      side: 'allied', entered: 1915, exited: 1918, factionKey: 'allied',
      capital: { name: 'Rome', lon: 12.50, lat: 41.90 },
      geoNames: ['Kingfom of Italy', 'Libya', 'Eritrea', 'Italian Somaliland'],
      geoSubjects: ['Italy'],
      summary: 'Though nominally allied to the Central Powers before the war, Italy stayed neutral in 1914 and joined the Allies in 1915 under the Treaty of London, opening a brutal mountain front against Austria-Hungary.',
      objectives: ['Gain Italian-speaking lands from Austria-Hungary (Trentino, Trieste)', 'Expand influence in the Adriatic', 'Honour the 1915 Treaty of London'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'monarch', value: 'King Victor Emmanuel III (r. 1900–1946)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(35000000, 37000000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Joined the Allies via the Treaty of London (May 1915)', from: 1915, to: 1918, confidence: 'high', sources: ['src:macmillan'] }
      ]
    },
    {
      id: 'nation:united-states', type: 'nation', name: 'United States', short: 'United States',
      side: 'allied', entered: 1917, exited: 1918, factionKey: 'allied',
      capital: { name: 'Washington, D.C.', lon: -77.04, lat: 38.91 },
      geoNames: ['United States', 'Philippines', 'Puerto Rico', 'American Samoa', 'United States Virgin Islands'],
      geoSubjects: ['United States'],
      summary: 'Neutral for most of the war, the United States entered in April 1917 after unrestricted submarine warfare and the Zimmermann Telegram. Its fresh manpower and industry tipped the balance decisively to the Allies in 1918.',
      objectives: ['Respond to unrestricted submarine warfare', 'Make the world “safe for democracy” (Wilson)', 'Shape a lasting peace via the Fourteen Points'],
      facts: [
        { attr: 'government', value: 'Federal republic', from: 1914, to: 1918, confidence: 'high', sources: ['src:loc-ww1'] },
        { attr: 'leader', value: 'President Woodrow Wilson (r. 1913–1921)', from: 1914, to: 1918, confidence: 'high', sources: ['src:loc-ww1'] },
        { attr: 'population', value: r(99000000, 103000000), from: 1914, to: 1918, confidence: 'high', sources: ['src:loc-ww1'] },
        { attr: 'army', value: 'American Expeditionary Forces — ~2 million sent to France by late 1918', from: 1917, to: 1918, confidence: 'high', sources: ['src:loc-ww1'] },
        { attr: 'entryEvent', value: 'Declared war on Germany, 6 April 1917', from: 1917, to: 1918, confidence: 'high', sources: ['src:loc-ww1'] }
      ]
    },
    {
      id: 'nation:japan', type: 'nation', name: 'Empire of Japan', short: 'Japan',
      side: 'allied', entered: 1914, exited: 1918, factionKey: 'allied',
      capital: { name: 'Tokyo', lon: 139.69, lat: 35.69 },
      geoNames: ['Empire of Japan'], geoSubjects: ['Empire of Japan'],
      summary: 'Bound to Britain by alliance, Japan declared war on Germany in 1914 and seized Germany’s Pacific island colonies and its concession at Qingdao in China, expanding its power in East Asia.',
      objectives: ['Honour the Anglo-Japanese Alliance', 'Seize German holdings in the Pacific and China', 'Expand influence in East Asia'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy (empire)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(52000000, 56000000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Declared war on Germany, August 1914', from: 1914, to: 1918, confidence: 'high', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:serbia', type: 'nation', name: 'Serbia', short: 'Serbia',
      side: 'allied', entered: 1914, exited: 1918, factionKey: 'allied',
      capital: { name: 'Belgrade', lon: 20.46, lat: 44.82 },
      geoNames: ['Serbia'], geoSubjects: ['Serbia'],
      summary: 'The war’s flashpoint: Austria-Hungary’s ultimatum after the Sarajevo assassination fell on Serbia. Invaded and overrun by 1915, Serbia suffered proportionally some of the war’s heaviest losses.',
      objectives: ['Resist Austro-Hungarian domination', 'Defend independence', 'Unite the South Slavs'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy', from: 1914, to: 1918, confidence: 'high', sources: ['src:macmillan'] },
        { attr: 'population', value: r(4500000, 4900000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] }
      ]
    },
    {
      id: 'nation:belgium', type: 'nation', name: 'Belgium', short: 'Belgium',
      side: 'allied', entered: 1914, exited: 1918, factionKey: 'allied',
      capital: { name: 'Brussels', lon: 4.35, lat: 50.85 },
      geoNames: ['Belgium', 'Belgian Congo'], geoSubjects: ['Belgium'],
      summary: 'Germany’s invasion of neutral Belgium in August 1914 brought Britain into the war. Most of the country was occupied for the duration, but a sliver behind the Yser held out beside the Allies.',
      objectives: ['Defend its guaranteed neutrality and independence', 'Resist occupation'],
      facts: [
        { attr: 'monarch', value: 'King Albert I (r. 1909–1934)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(7400000, 7700000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'] }
      ]
    },
    {
      id: 'nation:romania', type: 'nation', name: 'Romania', short: 'Romania',
      side: 'allied', entered: 1916, exited: 1918, factionKey: 'allied',
      capital: { name: 'Bucharest', lon: 26.10, lat: 44.43 },
      geoNames: ['Romania'], geoSubjects: ['Romania'],
      summary: 'Romania joined the Allies in 1916 hoping to gain Transylvania, but was largely overrun by the Central Powers within months and forced to a separate peace in 1918.',
      objectives: ['Acquire Transylvania from Austria-Hungary', 'Unite ethnic Romanians'],
      facts: [
        { attr: 'population', value: r(7500000, 7700000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Joined the Allies, August 1916', from: 1916, to: 1918, confidence: 'high', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:portugal', type: 'nation', name: 'Portugal', short: 'Portugal',
      side: 'allied', entered: 1916, exited: 1918, factionKey: 'allied',
      capital: { name: 'Lisbon', lon: -9.14, lat: 38.72 },
      geoNames: ['Portugal', 'Angola', 'Mozambique', 'Portuguese Guinea'], geoSubjects: ['Portugal'],
      summary: 'Portugal sided with the Allies and, after clashes in Africa, formally entered the war in 1916, sending an expeditionary corps to the Western Front.',
      objectives: ['Protect its African colonies', 'Maintain the long-standing alliance with Britain'],
      facts: [
        { attr: 'population', value: r(5900000, 6100000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'At war with Germany from March 1916', from: 1916, to: 1918, confidence: 'medium', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:greece', type: 'nation', name: 'Greece', short: 'Greece',
      side: 'allied', entered: 1917, exited: 1918, factionKey: 'allied',
      capital: { name: 'Athens', lon: 23.73, lat: 37.98 },
      geoNames: ['Greece'], geoSubjects: ['Greece'],
      summary: 'Divided between a pro-Allied government and a neutral king, Greece formally joined the Allies in 1917 and contributed to the Salonika front in the Balkans.',
      objectives: ['Expand at the expense of Bulgaria and the Ottomans', 'Back the Allied Salonika front'],
      facts: [
        { attr: 'population', value: r(4800000, 5000000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Entered the war on the Allied side, 1917', from: 1917, to: 1918, confidence: 'medium', sources: ['src:gilbert'] }
      ]
    },
    {
      id: 'nation:german-empire', type: 'nation', name: 'German Empire', short: 'Germany',
      side: 'central', entered: 1914, exited: 1918, factionKey: 'central',
      capital: { name: 'Berlin', lon: 13.40, lat: 52.52 },
      geoNames: ['German Empire', 'German E. Africa (Tanganyika)', 'German South-West Africa', 'Kamerun', 'Togoland'],
      geoSubjects: ['German Empire'],
      summary: 'The principal Central Power: Europe’s leading industrial and military state. It fought on two fronts, nearly won in 1914 and again in 1918, but was worn down by blockade, attrition and the arrival of American power.',
      objectives: ['Defeat France quickly, then Russia (the Schlieffen plan)', 'Break the British blockade', 'Secure German power on the continent'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy (empire)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'monarch', value: 'Kaiser Wilhelm II (r. 1888–1918)', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(65000000, 68000000), from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'army', value: 'German Army — ~13 million mobilised; the most effective army of the war', from: 1914, to: 1918, confidence: 'medium', sources: ['src:strachan'] },
        { attr: 'navy', value: 'High Seas Fleet — challenged the Royal Navy at Jutland; U-boat campaign', from: 1914, to: 1918, confidence: 'high', sources: ['src:keegan'] }
      ]
    },
    {
      id: 'nation:austria-hungary', type: 'nation', name: 'Austria-Hungary', short: 'Austria-Hungary',
      side: 'central', entered: 1914, exited: 1918, factionKey: 'central',
      capital: { name: 'Vienna', lon: 16.37, lat: 48.21 },
      geoNames: ['Austro-Hungarian Empire'], geoSubjects: ['Austro-Hungarian Empire'],
      summary: 'The multi-ethnic Habsburg empire whose ultimatum to Serbia began the war. Strained by its many nationalities and repeated defeats, it disintegrated entirely in 1918.',
      objectives: ['Punish Serbia and curb Slav nationalism', 'Hold the empire together', 'Support its German ally'],
      facts: [
        { attr: 'government', value: 'Dual monarchy', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'monarch', value: 'Emperor Franz Joseph I (to 1916), then Karl I', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(50000000, 53000000), from: 1914, to: 1918, confidence: 'medium', sources: ['src:britannica-ww1'] }
      ]
    },
    {
      id: 'nation:ottoman-empire', type: 'nation', name: 'Ottoman Empire', short: 'Ottoman Empire',
      side: 'central', entered: 1914, exited: 1918, factionKey: 'central',
      capital: { name: 'Constantinople', lon: 28.98, lat: 41.01 },
      geoNames: ['Ottoman Empire'], geoSubjects: ['Ottoman Empire'],
      summary: 'The Ottoman Empire joined the Central Powers in late 1914, fighting at Gallipoli, in the Caucasus and across the Middle East. Defeat ended six centuries of Ottoman rule and partitioned its Arab lands.',
      objectives: ['Recover ground lost to Russia and the Balkan states', 'Defend the empire and the Straits', 'Proclaim jihad against the Allies'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy under the Young Turks', from: 1914, to: 1918, confidence: 'high', sources: ['src:britannica-ww1'] },
        { attr: 'population', value: r(21000000, 23000000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Entered the war alongside Germany, November 1914', from: 1914, to: 1918, confidence: 'high', sources: ['src:strachan'] }
      ]
    },
    {
      id: 'nation:bulgaria', type: 'nation', name: 'Bulgaria', short: 'Bulgaria',
      side: 'central', entered: 1915, exited: 1918, factionKey: 'central',
      capital: { name: 'Sofia', lon: 23.32, lat: 42.70 },
      geoNames: ['Bulgaria'], geoSubjects: ['Bulgaria'],
      summary: 'Seeking Macedonian lands lost in 1913, Bulgaria joined the Central Powers in 1915 and helped overrun Serbia. It was the first Central Power to surrender, in September 1918.',
      objectives: ['Regain Macedonia from Serbia and Greece', 'Reverse the Balkan Wars settlement'],
      facts: [
        { attr: 'population', value: r(4700000, 5000000), from: 1914, to: 1918, confidence: 'low', sources: ['src:britannica-ww1'] },
        { attr: 'entryEvent', value: 'Joined the Central Powers, October 1915', from: 1915, to: 1918, confidence: 'high', sources: ['src:gilbert'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:wilson', name: 'Woodrow Wilson', nationId: 'nation:united-states', role: 'President of the United States', years: '1856–1924', side: 'allied',
      bio: 'Kept the U.S. neutral until 1917, then led it into the war and framed Allied war aims in his Fourteen Points. He championed the League of Nations at the 1919 peace conference.', confidence: 'high', sources: ['src:loc-ww1'] },
    { id: 'person:clemenceau', name: 'Georges Clemenceau', nationId: 'nation:france', role: 'Prime Minister of France (1917–1920)', years: '1841–1929', side: 'allied',
      bio: 'Nicknamed “the Tiger,” he took office in the dark days of 1917 and rallied France to victory with relentless determination, then drove a hard bargain at Versailles.', confidence: 'high', sources: ['src:strachan'] },
    { id: 'person:lloyd-george', name: 'David Lloyd George', nationId: 'nation:british-empire', role: 'Prime Minister of the United Kingdom (1916–1922)', years: '1863–1945', side: 'allied',
      bio: 'Energised Britain’s war effort as munitions minister and then prime minister, pressing for unified Allied command and the convoy system against the U-boats.', confidence: 'high', sources: ['src:strachan'] },
    { id: 'person:foch', name: 'Ferdinand Foch', nationId: 'nation:france', role: 'Supreme Allied Commander (1918)', years: '1851–1929', side: 'allied',
      bio: 'Appointed to coordinate all Allied armies in 1918, he directed the counter-offensives of the Hundred Days that broke the German army and accepted the November armistice.',
      relatedBattles: ['battle:marne-1', 'battle:amiens', 'battle:meuse-argonne'], confidence: 'high', sources: ['src:keegan'] },
    { id: 'person:haig', name: 'Douglas Haig', nationId: 'nation:british-empire', role: 'Commander, British Expeditionary Force', years: '1861–1928', side: 'allied',
      bio: 'Led the BEF from 1915 through the costly battles of the Somme and Passchendaele to final victory in 1918. His attritional methods remain fiercely debated.',
      relatedBattles: ['battle:somme', 'battle:passchendaele', 'battle:amiens'], confidence: 'high', sources: ['src:gilbert'] },
    { id: 'person:nicholas-ii', name: 'Tsar Nicholas II', nationId: 'nation:russia', role: 'Emperor of Russia', years: '1868–1918', side: 'allied',
      bio: 'Russia’s last tsar took personal command of the army in 1915, tying his throne to its failures. He abdicated in the 1917 revolution and was later executed by the Bolsheviks.', confidence: 'high', sources: ['src:britannica-ww1'] },
    { id: 'person:wilhelm-ii', name: 'Kaiser Wilhelm II', nationId: 'nation:german-empire', role: 'German Emperor', years: '1859–1941', side: 'central',
      bio: 'Germany’s last emperor, whose bombast and naval ambitions helped poison pre-war diplomacy. Increasingly sidelined by his generals, he abdicated and fled as the war ended in 1918.', confidence: 'high', sources: ['src:macmillan'] },
    { id: 'person:hindenburg', name: 'Paul von Hindenburg', nationId: 'nation:german-empire', role: 'Chief of the German General Staff', years: '1847–1934', side: 'central',
      bio: 'The victor of Tannenberg who, with Ludendorff, ran Germany as a virtual military dictatorship from 1916. Later president of the Weimar Republic.',
      relatedBattles: ['battle:tannenberg'], confidence: 'high', sources: ['src:strachan'] },
    { id: 'person:ludendorff', name: 'Erich Ludendorff', nationId: 'nation:german-empire', role: 'First Quartermaster-General', years: '1865–1937', side: 'central',
      bio: 'Germany’s de facto military commander in the war’s later years. He launched the all-or-nothing 1918 Spring Offensive, and its failure broke German hopes of victory.',
      relatedBattles: ['battle:tannenberg', 'battle:spring-offensive'], confidence: 'high', sources: ['src:keegan'] },
    { id: 'person:franz-joseph', name: 'Emperor Franz Joseph I', nationId: 'nation:austria-hungary', role: 'Emperor of Austria-Hungary', years: '1830–1916', side: 'central',
      bio: 'The aged Habsburg emperor whose ultimatum to Serbia after Sarajevo set the war in motion. He died in 1916, two years before his empire dissolved.', confidence: 'high', sources: ['src:macmillan'] },
    { id: 'person:mustafa-kemal', name: 'Mustafa Kemal (Atatürk)', nationId: 'nation:ottoman-empire', role: 'Ottoman commander', years: '1881–1938', side: 'central',
      bio: 'The Ottoman commander whose defence of the Gallipoli peninsula in 1915 thwarted the Allied invasion and made his reputation. He later founded modern Turkey.',
      relatedBattles: ['battle:gallipoli'], confidence: 'high', sources: ['src:gilbert'] }
  ];

  /* ---- BATTLES ---------------------------------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'medium', sources: ['src:keegan'] }, opts || {});
  const battles = [
    B('battle:tannenberg', 'Tannenberg', 1914, 8, 30, 20.13, 53.50, 'East Prussia', 'Central (German)', 'A crushing German victory that destroyed a Russian army and made Hindenburg and Ludendorff national heroes.', { commanders: ['person:hindenburg', 'person:ludendorff'], casualties: { allied: r(150000, 170000), central: r(12000, 20000) }, note: 'Most Russian losses were prisoners' }),
    B('battle:marne-1', 'First Battle of the Marne', 1914, 9, 9, 3.10, 48.90, 'Marne, France', 'Allied', 'The Allied counter-attack that halted the German drive on Paris and ended hopes of a short war — the trenches followed.', { decisive: true, casualties: { allied: r(250000, 263000), central: r(220000, 250000) } }),
    B('battle:gallipoli', 'Gallipoli', 1915, 4, 25, 26.25, 40.20, 'Dardanelles, Ottoman Empire', 'Central (Ottoman)', 'An Allied amphibious campaign to knock out the Ottomans failed bloodily over eight months, forging the Anzac legend.', { commanders: ['person:mustafa-kemal'], date: { y: 1915, m: 4, d: 25, end: { y: 1916, m: 1, d: 9 } }, casualties: { allied: r(250000, 302000), central: r(250000, 290000) } }),
    B('battle:verdun', 'Verdun', 1916, 2, 21, 5.38, 49.16, 'Verdun, France', 'Allied (French)', 'A ten-month German attempt to “bleed France white.” France held — “They shall not pass” — at a cost of around 700,000 casualties on both sides.', { date: { y: 1916, m: 2, d: 21, end: { y: 1916, m: 12, d: 18 } }, casualties: { allied: r(370000, 400000), central: r(330000, 360000) } }),
    B('battle:jutland', 'Jutland', 1916, 5, 31, 5.70, 56.90, 'North Sea (naval)', 'Inconclusive', 'The war’s largest naval battle. Tactically indecisive, but the German fleet returned to port and never again seriously challenged the British blockade.', { naval: true, casualties: { allied: r(6000, 6100), central: r(2500, 3100) } }),
    B('battle:somme', 'The Somme', 1916, 7, 1, 2.70, 50.00, 'Somme, France', 'Inconclusive', 'A vast Anglo-French offensive. The British suffered ~57,000 casualties on the first day alone; over five months it became a symbol of industrial slaughter.', { commanders: ['person:haig'], date: { y: 1916, m: 7, d: 1, end: { y: 1916, m: 11, d: 18 } }, casualties: { allied: r(620000, 650000), central: r(450000, 600000) } }),
    B('battle:brusilov', 'Brusilov Offensive', 1916, 6, 4, 25.30, 49.80, 'Galicia, Eastern Front', 'Allied (Russian)', 'Russia’s most successful offensive shattered Austro-Hungarian armies in the east — but the enormous losses also hastened Russia’s own collapse.', { date: { y: 1916, m: 6, d: 4, end: { y: 1916, m: 9, d: 20 } }, casualties: { allied: r(500000, 1000000), central: r(1000000, 1500000) } }),
    B('battle:passchendaele', 'Passchendaele (Third Ypres)', 1917, 7, 31, 3.02, 50.90, 'Flanders, Belgium', 'Inconclusive', 'A British offensive that ground forward through mud for tiny gains, becoming a byword for the futility of attritional warfare.', { commanders: ['person:haig'], date: { y: 1917, m: 7, d: 31, end: { y: 1917, m: 11, d: 10 } }, casualties: { allied: r(240000, 448000), central: r(217000, 410000) } }),
    B('battle:caporetto', 'Caporetto', 1917, 10, 24, 13.48, 46.25, 'Caporetto, Italian Front', 'Central', 'A stunning Austro-German breakthrough that routed the Italian army and drove it back ~100 km to the Piave — Italy barely held on.', { date: { y: 1917, m: 10, d: 24, end: { y: 1917, m: 11, d: 19 } }, casualties: { allied: { captured: 265000 }, central: r(50000, 70000) } }),
    B('battle:spring-offensive', 'German Spring Offensive', 1918, 3, 21, 2.90, 49.90, 'Picardy, France', 'Inconclusive', 'Germany’s last great gamble, using troops freed from the east. It gained ground but no decisive breakthrough — and exhausted the German army.', { commanders: ['person:ludendorff'], date: { y: 1918, m: 3, d: 21, end: { y: 1918, m: 7, d: 18 } }, casualties: { allied: r(700000, 850000), central: r(680000, 690000) } }),
    B('battle:amiens', 'Amiens (start of the Hundred Days)', 1918, 8, 8, 2.30, 49.90, 'Amiens, France', 'Allied', 'A coordinated tank-and-artillery assault that Ludendorff called “the black day of the German Army.” It opened the advance that won the war.', { decisive: true, commanders: ['person:foch', 'person:haig'], casualties: { central: { captured: 50000 } } }),
    B('battle:meuse-argonne', 'Meuse-Argonne Offensive', 1918, 9, 26, 5.00, 49.20, 'Argonne, France', 'Allied', 'The largest U.S. battle of the war and part of the final Allied push that forced Germany to the armistice in November 1918.', { commanders: ['person:foch'], date: { y: 1918, m: 9, d: 26, end: { y: 1918, m: 11, d: 11 } }, casualties: { allied: r(122000, 130000), central: r(100000, 120000) } })
  ];

  /* ---- TREATIES --------------------------------------------------------- */
  const treaties = [
    { id: 'treaty:armistice-1918', type: 'treaty', name: 'Armistice of 11 November 1918', date: { y: 1918, m: 11, d: 11 },
      signatories: ['nation:france', 'nation:british-empire', 'nation:german-empire'], summary: 'Signed in a railway carriage at Compiègne, the armistice ended the fighting on the Western Front at 11 a.m. on 11 November 1918. Germany, already cut off from its collapsed allies, accepted terms amounting to surrender.', confidence: 'high', sources: ['src:gilbert'] },
    { id: 'treaty:versailles-1919', type: 'treaty', name: 'Treaty of Versailles', date: { y: 1919, m: 6, d: 28 },
      signatories: ['nation:german-empire', 'nation:france', 'nation:british-empire', 'nation:united-states'], summary: 'The 1919 peace settlement imposed on Germany: territorial losses, disarmament, reparations and the “war guilt” clause. It redrew the map of Europe and created the League of Nations — and its resentments helped sow the next war.', confidence: 'high', sources: ['src:macmillan'] }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:london-ww1', name: 'London', lon: -0.13, lat: 51.5, capitalOf: 'nation:british-empire', note: 'Capital of the British Empire and hub of Allied finance and sea power.' },
    { id: 'city:paris-ww1', name: 'Paris', lon: 2.35, lat: 48.85, capitalOf: 'nation:france', note: 'Threatened in 1914 and again in 1918, but never taken; the Allied nerve-centre in the west.' },
    { id: 'city:berlin', name: 'Berlin', lon: 13.40, lat: 52.52, capitalOf: 'nation:german-empire', note: 'Capital of Imperial Germany; site of the 1918 revolution that ended the monarchy.' },
    { id: 'city:vienna', name: 'Vienna', lon: 16.37, lat: 48.21, capitalOf: 'nation:austria-hungary', note: 'Capital of Austria-Hungary, whose ultimatum to Serbia began the war.' },
    { id: 'city:petrograd', name: 'Petrograd', lon: 30.31, lat: 59.94, capitalOf: 'nation:russia', note: 'Russia’s capital (renamed from St. Petersburg in 1914); cradle of the 1917 revolutions.' },
    { id: 'city:rome-ww1', name: 'Rome', lon: 12.50, lat: 41.90, capitalOf: 'nation:italy', note: 'Capital of Italy, which joined the Allies in 1915.' },
    { id: 'city:constantinople-ww1', name: 'Constantinople', lon: 28.98, lat: 41.01, capitalOf: 'nation:ottoman-empire', note: 'Ottoman capital and the prize behind the Gallipoli campaign.' },
    { id: 'city:washington-ww1', name: 'Washington, D.C.', lon: -77.04, lat: 38.91, capitalOf: 'nation:united-states', note: 'Capital of the United States, neutral until April 1917.' },
    { id: 'city:belgrade', name: 'Belgrade', lon: 20.46, lat: 44.82, capitalOf: 'nation:serbia', note: 'Serbian capital, shelled on the war’s first day.' },
    { id: 'city:sarajevo', name: 'Sarajevo', lon: 18.41, lat: 43.85, note: 'Where Archduke Franz Ferdinand was assassinated on 28 June 1914 — the spark of the war.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:ww1-${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1914, 6, 28, 'political', 'Assassination in Sarajevo', 'Archduke Franz Ferdinand is killed; the crisis that starts the war begins.'),
    T(1914, 7, 28, 'political', 'War declared', 'Austria-Hungary declares war on Serbia; the alliance system pulls in the great powers.'),
    T(1914, 8, 4, 'political', 'Germany invades Belgium', 'Britain enters the war to defend Belgian neutrality.'),
    T(1914, 8, 30, 'battle', 'Tannenberg', 'Germany destroys a Russian army in the east.'),
    T(1914, 9, 9, 'battle', 'First Marne', 'The German advance on Paris is halted; trench warfare sets in.'),
    T(1915, 4, 25, 'battle', 'Gallipoli landings', 'The Allied campaign against the Ottomans begins.'),
    T(1915, 5, 23, 'political', 'Italy joins the Allies', 'A new front opens against Austria-Hungary.'),
    T(1916, 2, 21, 'battle', 'Verdun', 'A ten-month battle of attrition begins in France.'),
    T(1916, 7, 1, 'battle', 'The Somme', 'A vast Anglo-French offensive opens with ~57,000 British casualties on day one.'),
    T(1917, 4, 6, 'political', 'United States enters the war', 'American manpower and industry tip the balance to the Allies.'),
    T(1917, 11, 7, 'political', 'Russian Revolution', 'The Bolsheviks seize power; Russia leaves the war.'),
    T(1918, 3, 21, 'battle', 'German Spring Offensive', 'Germany’s last great gamble in the west.'),
    T(1918, 8, 8, 'battle', 'Amiens — the Hundred Days', 'The Allied advance that will end the war begins.'),
    T(1918, 11, 11, 'treaty', 'Armistice', 'Fighting ends on the Western Front at 11 a.m.')
  ];

  /* ---- WORLD AT THIS TIME ----------------------------------------------- */
  const worldContext = {
    _default: {
      worldPopulation: { low: 1750000000, high: 1900000000, confidence: 'low' },
      largestEmpires: ['British Empire', 'Russian Empire', 'French colonial empire', 'Republic of China'],
      largestCities: ['London', 'New York', 'Paris', 'Tokyo'],
      otherConflicts: ['Mexican Revolution (1910–20)', 'Arab Revolt against the Ottomans (1916–18)', 'Easter Rising in Ireland (1916)'],
      science: ['Einstein’s general theory of relativity (1915)', 'First mass use of aircraft, tanks, and chemical weapons in war'],
      culture: ['Modernism reshapes art and literature', 'Jazz emerges in the United States']
    },
    1916: { otherConflicts: ['Arab Revolt against the Ottomans begins (1916)', 'Easter Rising in Ireland (1916)', 'Mexican Revolution (1910–20)'] },
    1917: { otherConflicts: ['Russian Revolution and the start of the Russian Civil War', 'Arab Revolt (1916–18)', 'Mexican Revolution (1910–20)'] },
    1918: { otherConflicts: ['The 1918 influenza pandemic begins, killing tens of millions worldwide', 'Russian Civil War (1917–22)'], culture: ['War-weary modernism; the pandemic empties theatres and streets'] }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:ww1-spark', type: 'multiple-choice', prompt: 'Which event is usually called the spark that began World War I?', options: ['The sinking of the Lusitania', 'The assassination of Archduke Franz Ferdinand', 'The invasion of Poland', 'The Zimmermann Telegram'], accept: { option: 'The assassination of Archduke Franz Ferdinand' }, feedback: { correct: 'Correct — the Sarajevo assassination in June 1914 set off the crisis.', incorrect: 'Not that one — look to Sarajevo, June 1914.' } },
    { id: 'quiz:ww1-us', type: 'set-year', prompt: 'Move the timeline to the year the United States entered the war.', accept: { year: 1917 }, feedback: { correct: 'Correct — the U.S. declared war on Germany in April 1917.', incorrect: 'Try again — it was the year of the Russian Revolution, too.' } },
    { id: 'quiz:ww1-belgium', type: 'click-map', prompt: 'Click the Central Power that invaded Belgium in 1914, bringing Britain into the war.', accept: { entityId: 'nation:german-empire' }, feedback: { correct: 'Correct — Germany’s invasion of Belgium brought Britain in.', incorrect: 'Look to central Europe — the largest Central Power.' } },
    { id: 'quiz:ww1-end', type: 'set-year', prompt: 'Set the timeline to the year the armistice ended the fighting.', accept: { year: 1918 }, feedback: { correct: 'Correct — the armistice took effect on 11 November 1918.', incorrect: 'Move to the final year of the war.' } },
    { id: 'quiz:ww1-russia', type: 'click-map', prompt: 'Click the Allied power that left the war after its 1917 revolution.', accept: { entityId: 'nation:russia' }, feedback: { correct: 'Correct — Russia withdrew after the Bolsheviks took power.', incorrect: 'Look to the vast empire in the east.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['world-war-1'] = {
    id: 'war:world-war-1', schemaVersion: 1,
    meta: {
      name: 'World War I',
      altNames: ['The Great War', 'First World War', 'WWI'],
      years: { start: 1914, end: 1918 }, defaultYear: 1916,
      duration: '4 years (1914–1918)',
      summary: 'A global war between the Allied Powers (France, the British Empire, Russia, Italy, the United States and others) and the Central Powers (Germany, Austria-Hungary, the Ottoman Empire and Bulgaria). Industrial-scale slaughter killed millions and toppled four empires.',
      background: 'Decades of imperial rivalry, an arms race, rigid alliance blocs and Balkan instability primed Europe for war. The assassination of Archduke Franz Ferdinand in June 1914 lit the fuse.',
      causesLong: ['Rival alliance systems (Triple Entente vs Triple Alliance)', 'Imperial and naval rivalry, especially Britain vs Germany', 'Militarism and rigid mobilisation plans', 'Nationalism and instability in the Balkans'],
      causesImmediate: ['The assassination of Archduke Franz Ferdinand at Sarajevo (28 June 1914)', 'Austria-Hungary’s ultimatum to Serbia', 'Germany’s invasion of neutral Belgium'],
      turningPoints: ['First Marne (1914) ends the war of movement', 'U.S. entry and Russia’s exit (1917)', 'The Hundred Days offensive (1918)'],
      outcome: 'Allied victory; the German, Austro-Hungarian, Russian and Ottoman empires all collapsed.',
      victor: 'allied', peaceTreaty: 'treaty:versailles-1919',
      territorialChanges: 'Empires dissolved and new states emerged — Poland, Czechoslovakia, Yugoslavia, the Baltic states; the Ottoman Middle East was partitioned under British and French mandates.',
      significance: 'Killed millions, ended four empires, redrew the maps of Europe and the Middle East, triggered the Russian Revolution, and left grievances that fed the Second World War.',
      humanCost: 'Around <strong>9–11 million</strong> military and <strong>6–13 million</strong> civilian deaths <span class="conf low">low confidence</span> — figures are debated and overlap with the 1918 influenza pandemic, which killed tens of millions more.',
      consequences: ['The fall of the German, Russian, Austro-Hungarian and Ottoman empires', 'The Russian Revolution and the rise of the Soviet Union', 'The League of Nations and a redrawn world map', 'Economic ruin and resentments that helped cause World War II']
    },
    factions: {
      allied: { label: 'Allied Powers', colorVar: '--allied' },
      central: { label: 'Central Powers', colorVar: '--central' },
      neutral: { label: 'Neutral', colorVar: '--neutral' }
    },
    legendOrder: ['allied', 'central', 'neutral'],
    sides: {
      allied: { label: 'Allied Powers', factionKey: 'allied' },
      central: { label: 'Central Powers', factionKey: 'central' }
    },
    sources: S, nations, leaders, battles, treaties, cities, timeline, worldContext, quizzes,
    geo: {
      borderSnapshots: { 1914: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1914.geojson' },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson'
    }
  };
})();
