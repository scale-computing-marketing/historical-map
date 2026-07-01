/* Historical Wars Explorer — shared dataset: other wars around the globe.
   Unlike the per-war files, this is GLOBAL context: a curated timeline of major
   conflicts that were under way elsewhere in the world. The engine filters it by
   the current year so the "World at this time" panel can answer "what other wars
   were going on at the same time?" for any featured war. Loaded as a classic
   script; it registers window.HWE.globalConflicts.                            */
(function () {
  window.HWE = window.HWE || { wars: {} };

  /* Each entry: name, region, start–end years, and a one-line note. Kept concise
     and bracketing the eras of the featured wars (1750s–1940s). Dates follow the
     conventional span of each conflict; some are debated at the edges.          */
  window.HWE.globalConflicts = [
    // ---- mid-18th century (French & Indian War era) ----
    { name: 'Seven Years’ War', region: 'Europe & global', start: 1756, end: 1763, note: 'The first truly global war — fought across Europe, the Americas, India and the seas.' },
    { name: 'Third Carnatic War', region: 'India', start: 1756, end: 1763, note: 'Britain and France, with Indian allies, fought for supremacy in southern India.' },
    { name: 'Anglo-Cherokee War', region: 'North America', start: 1758, end: 1761, note: 'British colonists and the Cherokee fought along the southern frontier.' },
    { name: 'Pontiac’s War', region: 'North America', start: 1763, end: 1766, note: 'Great Lakes nations resisted British rule after the fall of New France.' },

    // ---- 1770s–80s (American Revolution era) ----
    { name: 'Russo-Turkish War', region: 'Eastern Europe', start: 1768, end: 1774, note: 'Russia’s victory over the Ottomans opened the Black Sea coast to Russian power.' },
    { name: 'First Anglo-Maratha War', region: 'India', start: 1775, end: 1782, note: 'The British East India Company fought the Maratha Confederacy in western India.' },
    { name: 'War of the Bavarian Succession', region: 'Central Europe', start: 1778, end: 1779, note: 'Prussia and Austria faced off over Bavaria with little actual fighting.' },
    { name: 'Second Anglo-Mysore War', region: 'India', start: 1780, end: 1784, note: 'Mysore, allied with France, inflicted heavy defeats on the East India Company.' },
    { name: 'Fourth Anglo-Dutch War', region: 'Global (naval)', start: 1780, end: 1784, note: 'Dutch trade with the American rebels drew Britain and the Dutch Republic into war.' },

    // ---- mid-19th century (American Civil War era) ----
    { name: 'Taiping Rebellion', region: 'China', start: 1850, end: 1864, note: 'A vast civil war in Qing China — among the deadliest conflicts in all of history.' },
    { name: 'Crimean War', region: 'Black Sea & Russia', start: 1853, end: 1856, note: 'Britain, France and the Ottomans checked Russian expansion.' },
    { name: 'Indian Rebellion of 1857', region: 'India', start: 1857, end: 1858, note: 'A major uprising against Company rule that led to direct British Crown rule.' },
    { name: 'French intervention in Mexico', region: 'Mexico', start: 1861, end: 1867, note: 'France installed Emperor Maximilian; Mexican republicans fought back.' },
    { name: 'Second Schleswig War', region: 'Denmark & Germany', start: 1864, end: 1864, note: 'Prussia and Austria seized Schleswig-Holstein from Denmark.' },
    { name: 'Paraguayan War', region: 'South America', start: 1864, end: 1870, note: 'Paraguay against Brazil, Argentina and Uruguay — proportionally devastating.' },

    // ---- early 20th century (World War I era) ----
    { name: 'Mexican Revolution', region: 'Mexico', start: 1910, end: 1920, note: 'A decade of revolution and civil war remade Mexico.' },
    { name: 'Balkan Wars', region: 'Balkans', start: 1912, end: 1913, note: 'Two wars over Ottoman Europe that helped set the stage for 1914.' },
    { name: 'Russian Civil War', region: 'Russia', start: 1917, end: 1922, note: 'Bolshevik “Reds” against the “Whites” after the Russian Revolution.' },
    { name: 'Irish War of Independence', region: 'Ireland', start: 1919, end: 1921, note: 'A guerrilla war that led to the Irish Free State.' },

    // ---- 1930s–40s (World War II era) ----
    { name: 'Spanish Civil War', region: 'Spain', start: 1936, end: 1939, note: 'A rehearsal for WWII, with fascist and republican forces backed by foreign powers.' },
    { name: 'Second Sino-Japanese War', region: 'China', start: 1937, end: 1945, note: 'Japan’s invasion of China, which merged into the wider Second World War.' },
    { name: 'Winter War', region: 'Finland', start: 1939, end: 1940, note: 'The Soviet Union invaded Finland in the opening months of WWII.' },
    { name: 'Greek Civil War', region: 'Greece', start: 1943, end: 1949, note: 'Communist and government forces fought during and after the German occupation.' }
  ];
})();
