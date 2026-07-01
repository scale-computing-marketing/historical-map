/* Historical Wars Explorer — dataset: American Revolutionary War (1775–1783)
   This file is PURE DATA. The engine knows nothing war-specific; adding a future
   war means adding another file shaped like this one. Loaded as a classic script
   (works from file://) — it registers itself on window.HWE.wars.            */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {  // sources — every fact references one of these
    middlekauff: { id: 'src:middlekauff', type: 'book', citation: 'Robert Middlekauff, The Glorious Cause: The American Revolution 1763–1789 (Oxford University Press)', reliability: 'high' },
    ferling: { id: 'src:ferling', type: 'book', citation: 'John Ferling, Almost a Miracle: The American Victory in the War of Independence (Oxford University Press)', reliability: 'high' },
    mackesy: { id: 'src:mackesy', type: 'book', citation: 'Piers Mackesy, The War for America, 1775–1783 (Harvard University Press)', reliability: 'high' },
    black: { id: 'src:black', type: 'book', citation: 'Jeremy Black, War for America: The Fight for Independence 1775–1783', reliability: 'high' },
    loc: { id: 'src:loc', type: 'archive', citation: 'U.S. Library of Congress — Primary Documents in American History', url: 'https://guides.loc.gov/', reliability: 'high' },
    britannica: { id: 'src:britannica', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    ne: { id: 'src:naturalearth', type: 'archive', citation: 'Natural Earth — public-domain map data', url: 'https://www.naturalearthdata.com/', reliability: 'high' },
    hbm: { id: 'src:historical-basemaps', type: 'archive', citation: 'aourednik/historical-basemaps (world_1783), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });   // a range
  const v = (value) => ({ value });           // a single value

  /* ---- NATIONS ---------------------------------------------------------- */
  /* `side` + `entered`/`exited` drive year-aware allegiance coloring.
     `geoNames` / `geoSubjects` are the polygon labels in the 1783 basemap that
     belong to this polity (so colonies inherit the parent's allegiance color). */
  const nations = [
    {
      id: 'nation:great-britain', type: 'nation', name: 'Great Britain', short: 'Britain',
      side: 'british', entered: 1775, exited: 1783, factionKey: 'britain',
      capital: { name: 'London', lon: -0.13, lat: 51.5 },
      geoNames: ['United Kingdom', 'Kingdom of Ireland', 'Quebec', "Rupert's Land", 'Acadian Peninsula (UK)', 'Bahamas', 'Dominica', 'Anguilla', 'Turks and Caicos Islands', 'Carnatic', 'British Guiana'],
      geoSubjects: ['UK', 'United Kingdom', 'British East India Company'],
      summary: 'The world’s foremost naval and colonial power, fighting to keep its thirteen American colonies and, after 1778, defending a global empire against France, Spain and the Dutch.',
      objectives: ['Suppress the colonial rebellion', 'Preserve imperial authority and trade', 'Protect possessions in the Caribbean, India and Gibraltar'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King George III (r. 1760–1820)', from: 1775, to: 1783, confidence: 'high', sources: ['src:loc'] },
        { attr: 'headOfGovernment', value: 'Lord North (PM)', from: 1775, to: 1782, confidence: 'high', sources: ['src:mackesy'] },
        { attr: 'headOfGovernment', value: 'Rockingham, then Shelburne (PM)', from: 1782, to: 1783, confidence: 'high', sources: ['src:mackesy'] },
        { attr: 'population', value: r(8000000, 9000000), from: 1775, to: 1783, confidence: 'medium', sources: ['src:britannica'], note: 'Great Britain & Ireland, excluding colonies' },
        { attr: 'army', value: 'British regulars + ~30,000 hired German auxiliaries', from: 1776, to: 1783, confidence: 'medium', sources: ['src:mackesy', 'src:black'] },
        { attr: 'navy', value: 'Royal Navy — largest in the world', from: 1775, to: 1783, confidence: 'high', sources: ['src:mackesy'] }
      ]
    },
    {
      id: 'nation:united-states', type: 'nation', name: 'United States', short: 'United States',
      side: 'american', entered: 1775, exited: 1783, factionKey: 'usa',
      capital: { name: 'Philadelphia', lon: -75.16, lat: 39.95 },
      geoNames: ['United States of America'], geoSubjects: ['United States of America'],
      summary: 'Thirteen British colonies in rebellion that declared independence on 4 July 1776 and, with French, Spanish and Dutch help, won recognition as a sovereign nation in 1783.',
      objectives: ['Independence from Britain', 'Secure foreign alliances and recognition', 'Defend territory and the Continental Army'],
      facts: [
        { attr: 'government', value: 'Rebelling colonies under the Continental Congress', from: 1775, to: 1776, confidence: 'high', sources: ['src:loc'] },
        { attr: 'government', value: 'Confederation of independent states (Continental Congress)', from: 1776, to: 1783, confidence: 'high', sources: ['src:loc'] },
        { attr: 'leader', value: 'Gen. George Washington, Commander-in-Chief', from: 1775, to: 1783, confidence: 'high', sources: ['src:ferling'] },
        { attr: 'population', value: r(2400000, 2600000), from: 1775, to: 1783, confidence: 'medium', sources: ['src:loc'], note: 'incl. ~500,000 enslaved people' },
        { attr: 'army', value: v('Continental Army — peak field strength ~17,000, plus state militia'), from: 1776, to: 1783, confidence: 'medium', sources: ['src:ferling'] },
        { attr: 'milestone', value: 'Declaration of Independence (4 July 1776)', from: 1776, to: 1783, confidence: 'high', sources: ['src:loc'] }
      ]
    },
    {
      id: 'nation:france', type: 'nation', name: 'Kingdom of France', short: 'France',
      side: 'american', entered: 1778, exited: 1783, factionKey: 'france',
      capital: { name: 'Paris', lon: 2.35, lat: 48.85 },
      geoNames: ['France'], geoSubjects: ['France'],
      summary: 'After the American victory at Saratoga, France allied openly with the United States in February 1778, turning a colonial revolt into a global war and supplying the decisive army and fleet at Yorktown.',
      objectives: ['Weaken Britain and overturn the 1763 settlement', 'Restore French naval prestige', 'Support American independence'],
      facts: [
        { attr: 'government', value: 'Absolute (Bourbon) monarchy', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King Louis XVI (r. 1774–1792)', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'keyMinister', value: 'Comte de Vergennes, Foreign Minister', from: 1775, to: 1783, confidence: 'high', sources: ['src:black'] },
        { attr: 'population', value: r(27000000, 28000000), from: 1775, to: 1783, confidence: 'medium', sources: ['src:britannica'] },
        { attr: 'entryEvent', value: 'Treaty of Alliance with the United States (6 Feb 1778)', from: 1778, to: 1783, confidence: 'high', sources: ['src:loc'] },
        { attr: 'navy', value: 'Rebuilt French fleet — challenged British naval supremacy', from: 1778, to: 1783, confidence: 'high', sources: ['src:mackesy'] }
      ]
    },
    {
      id: 'nation:spain', type: 'nation', name: 'Spain', short: 'Spain',
      side: 'american', entered: 1779, exited: 1783, factionKey: 'spain',
      capital: { name: 'Madrid', lon: -3.70, lat: 40.42 },
      geoNames: ['Spain'], geoSubjects: ['Spain'],
      summary: 'Spain entered in 1779 as France’s ally (not formally allied to the U.S.), aiming to recover Gibraltar, Minorca and Florida. Its Gulf-coast campaigns and the siege of Gibraltar stretched British forces worldwide.',
      objectives: ['Recover Gibraltar and Minorca from Britain', 'Regain the Floridas', 'Weaken British power in the Americas'],
      facts: [
        { attr: 'government', value: 'Absolute (Bourbon) monarchy', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King Charles III (r. 1759–1788)', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'entryEvent', value: 'Entered war via the Treaty of Aranjuez with France (1779)', from: 1779, to: 1783, confidence: 'high', sources: ['src:black'] },
        { attr: 'population', value: r(10000000, 11000000), from: 1775, to: 1783, confidence: 'medium', sources: ['src:britannica'], note: 'Iberian Spain; the empire was far larger' }
      ]
    },
    {
      id: 'nation:dutch-republic', type: 'nation', name: 'Dutch Republic', short: 'Dutch Republic',
      side: 'american', entered: 1780, exited: 1783, factionKey: 'dutch',
      capital: { name: 'Amsterdam', lon: 4.90, lat: 52.37 },
      geoNames: ['Netherlands'], geoSubjects: ['Netherlands'],
      summary: 'Dutch trade with the rebels (and refusal to join Britain’s war effort) triggered the Fourth Anglo-Dutch War from December 1780. The conflict wrecked Dutch commerce but further dispersed British strength.',
      objectives: ['Protect neutral trade and shipping', 'Maintain the Republic’s commercial position'],
      facts: [
        { attr: 'government', value: 'Federal republic (States General) under Stadtholder William V', from: 1775, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'entryEvent', value: 'Fourth Anglo-Dutch War began December 1780', from: 1780, to: 1783, confidence: 'high', sources: ['src:black'] },
        { attr: 'population', value: r(1900000, 2100000), from: 1775, to: 1783, confidence: 'low', sources: ['src:britannica'] }
      ]
    },
    {
      id: 'nation:mysore', type: 'nation', name: 'Kingdom of Mysore', short: 'Mysore',
      side: 'american', entered: 1780, exited: 1783, factionKey: 'france',
      capital: { name: 'Seringapatam', lon: 76.70, lat: 12.42 },
      geoNames: ['Mysore'], geoSubjects: ['Mysore'],
      summary: 'In India the Kingdom of Mysore, allied with France, fought the British East India Company in the Second Anglo-Mysore War (1780–1784) — the war’s Asian theatre.',
      objectives: ['Resist British East India Company expansion', 'Cooperate with France against Britain'],
      facts: [
        { attr: 'leader', value: 'Hyder Ali, ruler of Mysore', from: 1775, to: 1782, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'leader', value: 'Tipu Sultan (from December 1782)', from: 1782, to: 1783, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'entryEvent', value: 'Second Anglo-Mysore War began 1780', from: 1780, to: 1783, confidence: 'high', sources: ['src:britannica'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:washington', name: 'George Washington', nationId: 'nation:united-states', role: 'Commander-in-Chief, Continental Army', years: '1732–1799', side: 'american',
      bio: 'Virginia planter and veteran of the Seven Years’ War who commanded the Continental Army for the whole conflict. His strategy of preserving the army, the winter crossing at Trenton, and the allied victory at Yorktown made him the indispensable figure of the Revolution.',
      relatedBattles: ['battle:trenton', 'battle:yorktown', 'battle:monmouth'], confidence: 'high', sources: ['src:ferling'] },
    { id: 'person:franklin', name: 'Benjamin Franklin', nationId: 'nation:united-states', role: 'Diplomat to France', years: '1706–1790', side: 'american',
      bio: 'Printer, scientist and statesman whose diplomacy in Paris secured the 1778 French alliance and helped negotiate the 1783 Treaty of Paris — arguably the war’s most important non-military contribution.',
      relatedTreaties: ['treaty:alliance-1778', 'treaty:paris-1783'], confidence: 'high', sources: ['src:middlekauff'] },
    { id: 'person:jefferson', name: 'Thomas Jefferson', nationId: 'nation:united-states', role: 'Author of the Declaration of Independence', years: '1743–1826', side: 'american',
      bio: 'Principal author of the 1776 Declaration of Independence, articulating the rebellion’s ideological case for natural rights and self-government.', confidence: 'high', sources: ['src:loc'] },
    { id: 'person:greene', name: 'Nathanael Greene', nationId: 'nation:united-states', role: 'General, Southern Department', years: '1742–1786', side: 'american',
      bio: 'Washington’s ablest subordinate, whose attritional southern campaign of 1780–81 wore down Cornwallis and set the stage for Yorktown.',
      relatedBattles: ['battle:guilford'], confidence: 'high', sources: ['src:ferling'] },
    { id: 'person:george-iii', name: 'King George III', nationId: 'nation:great-britain', role: 'King of Great Britain', years: '1738–1820', side: 'british',
      bio: 'Determined to retain the American colonies, he backed the war effort and Lord North’s ministry. The loss of America was the defining setback of his long reign.', confidence: 'high', sources: ['src:britannica'] },
    { id: 'person:north', name: 'Lord North', nationId: 'nation:great-britain', role: 'Prime Minister (1770–1782)', years: '1732–1792', side: 'british',
      bio: 'Headed the government through most of the war; resigned in 1782 after Yorktown made British victory appear impossible.', confidence: 'high', sources: ['src:mackesy'] },
    { id: 'person:cornwallis', name: 'Charles Cornwallis', nationId: 'nation:great-britain', role: 'General, Southern Campaign', years: '1738–1805', side: 'british',
      bio: 'Aggressive British commander in the Carolinas and Virginia whose surrender of ~7,000 troops at Yorktown in 1781 effectively ended the land war.',
      relatedBattles: ['battle:camden', 'battle:guilford', 'battle:yorktown'], confidence: 'high', sources: ['src:black'] },
    { id: 'person:louis-xvi', name: 'King Louis XVI', nationId: 'nation:france', role: 'King of France', years: '1754–1793', side: 'american',
      bio: 'Approved the 1778 alliance with the United States. French intervention proved decisive for American independence — but its enormous cost helped bankrupt the crown and hasten the French Revolution.', confidence: 'high', sources: ['src:black'] },
    { id: 'person:rochambeau', name: 'Comte de Rochambeau', nationId: 'nation:france', role: 'Commander, French expeditionary army', years: '1725–1807', side: 'american',
      bio: 'Led the French army in America and coordinated with Washington in the march on Yorktown — the campaign that won the war.',
      relatedBattles: ['battle:yorktown'], confidence: 'high', sources: ['src:ferling'] },
    { id: 'person:lafayette', name: 'Marquis de Lafayette', nationId: 'nation:france', role: 'Major General, Continental Army', years: '1757–1834', side: 'american',
      bio: 'Young French aristocrat who volunteered for the American cause, became a trusted general under Washington, and helped pin Cornwallis in Virginia before Yorktown.',
      relatedBattles: ['battle:yorktown'], confidence: 'high', sources: ['src:ferling'] },
    { id: 'person:hyder-ali', name: 'Hyder Ali', nationId: 'nation:mysore', role: 'Ruler of Mysore', years: 'c.1720–1782', side: 'american',
      bio: 'Ruler of Mysore who, allied with France, inflicted serious defeats on the British East India Company in southern India during the Second Anglo-Mysore War.', confidence: 'medium', sources: ['src:britannica'] }
  ];

  /* ---- BATTLES ---------------------------------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'high', sources: ['src:middlekauff'] }, opts || {});
  const battles = [
    B('battle:lexington', 'Lexington & Concord', 1775, 4, 19, -71.23, 42.45, 'Massachusetts', 'American', 'The “shot heard round the world” — the opening battle of the war.', { commanders: ['British regulars vs. colonial militia'], casualties: { american: r(90, 95), british: r(270, 275) } }),
    B('battle:bunker-hill', 'Bunker Hill', 1775, 6, 17, -71.06, 42.38, 'Boston, Massachusetts', 'British (Pyrrhic)', 'A costly British victory that proved the colonists would stand and fight.', { casualties: { american: r(400, 450), british: r(1000, 1054) } }),
    B('battle:quebec', 'Battle of Quebec', 1775, 12, 31, -71.21, 46.81, 'Quebec', 'British', 'Failed American invasion of Canada; ended hopes of a 14th colony.', { casualties: { american: r(400, 500), british: v(20) } }),
    B('battle:trenton', 'Trenton', 1776, 12, 26, -74.74, 40.22, 'New Jersey', 'American', 'Washington’s surprise crossing of the Delaware revived a collapsing cause.', { commanders: ['person:washington'], casualties: { american: v(5), british: r(900, 1000) } }),
    B('battle:princeton', 'Princeton', 1777, 1, 3, -74.66, 40.34, 'New Jersey', 'American', 'Followed Trenton, restoring momentum and morale to the Continental Army.', {}),
    B('battle:brandywine', 'Brandywine', 1777, 9, 11, -75.59, 39.87, 'Pennsylvania', 'British', 'British victory that opened the way to capture Philadelphia.', {}),
    B('battle:saratoga', 'Saratoga', 1777, 10, 17, -73.64, 43.01, 'New York', 'American', 'The decisive turning point: a British army surrendered, persuading France to enter the war.', { decisive: true, casualties: { british: r(6000, 6200) }, note: 'British surrender of Burgoyne’s army' }),
    B('battle:monmouth', 'Monmouth', 1778, 6, 28, -74.43, 40.26, 'New Jersey', 'Inconclusive', 'Showed a Continental Army much improved after Valley Forge.', { commanders: ['person:washington'] }),
    B('battle:savannah', 'Siege of Savannah', 1779, 10, 9, -81.09, 32.08, 'Georgia', 'British', 'A failed Franco-American assault; one of the war’s bloodiest single days.', {}),
    B('battle:charleston', 'Siege of Charleston', 1780, 5, 12, -79.93, 32.78, 'South Carolina', 'British', 'The worst American defeat of the war; ~5,000 troops surrendered.', { casualties: { american: r(5000, 5500) } }),
    B('battle:camden', 'Camden', 1780, 8, 16, -80.61, 34.25, 'South Carolina', 'British', 'A crushing British victory that nearly destroyed American forces in the South.', { commanders: ['person:cornwallis'] }),
    B('battle:kings-mountain', 'Kings Mountain', 1780, 10, 7, -81.38, 35.14, 'South Carolina', 'American', 'Frontier militia destroyed a Loyalist force, turning the southern tide.', {}),
    B('battle:cowpens', 'Cowpens', 1781, 1, 17, -81.81, 35.13, 'South Carolina', 'American', 'A tactical masterpiece that shattered Britain’s mobile southern army.', {}),
    B('battle:guilford', 'Guilford Court House', 1781, 3, 15, -79.84, 36.13, 'North Carolina', 'British (Pyrrhic)', 'Cornwallis won but was so weakened he marched to Virginia — and Yorktown.', { commanders: ['person:cornwallis', 'person:greene'] }),
    B('battle:chesapeake', 'Battle of the Chesapeake', 1781, 9, 5, -75.50, 37.00, 'Virginia Capes (naval)', 'French', 'A French naval victory that sealed off Yorktown by sea — the war’s decisive battle at sea.', { naval: true, decisive: true }),
    B('battle:yorktown', 'Siege of Yorktown', 1781, 10, 19, -76.51, 37.24, 'Virginia', 'American & French', 'Cornwallis surrendered ~7,000 troops; the last major land battle, leading directly to peace.', { decisive: true, commanders: ['person:washington', 'person:rochambeau', 'person:cornwallis'], casualties: { british: { captured: 7000 } } }),
    B('battle:gibraltar', 'Great Siege of Gibraltar', 1779, 6, 24, -5.35, 36.14, 'Gibraltar', 'British', 'Britain held Gibraltar through a 3½-year Franco-Spanish siege (1779–1783).', { date: { y: 1779, m: 6, d: 24, end: { y: 1783, m: 2, d: 7 } } }),
    B('battle:saintes', 'Battle of the Saintes', 1782, 4, 12, -61.55, 15.87, 'Caribbean (naval)', 'British', 'A British naval victory that restored Royal Navy dominance before the peace.', { naval: true }),
    B('battle:cuddalore', 'Battle of Cuddalore', 1783, 6, 20, 79.75, 11.74, 'India', 'Inconclusive', 'The final action of the war, fought in India before news of peace arrived.', { naval: false })
  ];

  /* ---- TREATIES --------------------------------------------------------- */
  const treaties = [
    { id: 'treaty:alliance-1778', type: 'treaty', name: 'Treaty of Alliance (Franco-American)', date: { y: 1778, m: 2, d: 6 },
      signatories: ['nation:france', 'nation:united-states'], summary: 'A formal military alliance: France recognized American independence and joined the war against Britain. It transformed the conflict into a global war.', confidence: 'high', sources: ['src:loc'] },
    { id: 'treaty:paris-1783', type: 'treaty', name: 'Treaty of Paris', date: { y: 1783, m: 9, d: 3 },
      signatories: ['nation:great-britain', 'nation:united-states'], summary: 'Britain recognized the independence of the United States and ceded territory east of the Mississippi. Companion treaties at Versailles settled accounts with France and Spain (which regained Florida and Minorca).', confidence: 'high', sources: ['src:loc'] }
  ];

  /* ---- FOUNDING DOCUMENTS ----------------------------------------------- */
  /* Charters the Revolution produced. The Constitution post-dates the fighting
     (1787) but is the constitutional order the war made possible, so it is
     included with a note to that effect.                                     */
  const documents = [
    {
      id: 'doc:declaration', name: 'Declaration of Independence', date: { y: 1776, m: 7, d: 4 },
      author: 'Drafted by Thomas Jefferson for the Second Continental Congress',
      excerpt: '“We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.”',
      summary: 'Adopted on 4 July 1776, the Declaration announced that the thirteen colonies regarded themselves as free and independent states, no longer under British rule. It set out a philosophy of natural rights and government by consent, then listed the colonists’ grievances against King George III to justify the break.',
      significance: 'It transformed a rebellion over taxation into a war for national independence and gave the cause a universal moral argument that would echo through later movements for liberty and equality worldwide.',
      url: 'https://www.archives.gov/founding-docs/declaration-transcript',
      confidence: 'high', sources: ['src:loc']
    },
    {
      id: 'doc:constitution', name: 'United States Constitution', date: { y: 1787, m: 9, d: 17 },
      author: 'Framed by the Constitutional Convention, Philadelphia',
      excerpt: '“We the People of the United States, in Order to form a more perfect Union … do ordain and establish this Constitution for the United States of America.”',
      summary: 'Signed on 17 September 1787 and effective in 1789, the Constitution replaced the weak Articles of Confederation with a federal government of three balanced branches. Ratified with the promise of a Bill of Rights (1791), it remains the framework of American government.',
      significance: 'It came four years after the fighting ended, but it was the durable political order the Revolution made possible — turning the wartime confederation of states into a lasting national government.',
      url: 'https://www.archives.gov/founding-docs/constitution-transcript',
      confidence: 'high', sources: ['src:loc'], note: 'Ratified 1787–88; took effect 1789 — after the war, but its direct outcome.'
    },
    {
      id: 'doc:amendments', name: 'The Bill of Rights & Amendments', date: { y: 1791, m: 12, d: 15 },
      author: 'Amendments to the U.S. Constitution',
      excerpt: '“Congress shall make no law … abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble.” — First Amendment',
      summary: 'The Constitution has been amended 27 times. The first ten — the Bill of Rights, ratified together on 15 December 1791 — answered demands during ratification for explicit guarantees of individual liberty. The remaining seventeen were added over the following two centuries.',
      significance: 'The Bill of Rights grew directly out of the Revolution’s distrust of concentrated power, fixing in law the freedoms the war had been fought to secure; later amendments extended those principles — abolishing slavery and broadening the vote.',
      url: 'https://www.archives.gov/founding-docs/bill-of-rights-transcript',
      confidence: 'high', sources: ['src:loc'],
      amendments: [
        { n: 1, year: 1791, text: 'Freedom of religion, speech, press, assembly, and petition' },
        { n: 2, year: 1791, text: 'Right to keep and bear arms' },
        { n: 3, year: 1791, text: 'No forced quartering of soldiers in private homes' },
        { n: 4, year: 1791, text: 'Protection against unreasonable searches and seizures' },
        { n: 5, year: 1791, text: 'Due process; no self-incrimination or double jeopardy' },
        { n: 6, year: 1791, text: 'Right to a speedy public jury trial and to legal counsel' },
        { n: 7, year: 1791, text: 'Right to a jury trial in civil cases' },
        { n: 8, year: 1791, text: 'No excessive bail, fines, or cruel and unusual punishment' },
        { n: 9, year: 1791, text: 'Rights not listed are still retained by the people' },
        { n: 10, year: 1791, text: 'Powers not given to the federal government are reserved to the states' },
        { n: 11, year: 1795, text: 'Limits federal-court suits against a state' },
        { n: 12, year: 1804, text: 'Separate electoral votes for President and Vice President' },
        { n: 13, year: 1865, text: 'Abolished slavery' },
        { n: 14, year: 1868, text: 'Citizenship and equal protection under the law' },
        { n: 15, year: 1870, text: 'Voting rights regardless of race' },
        { n: 16, year: 1913, text: 'Authorized a federal income tax' },
        { n: 17, year: 1913, text: 'Direct popular election of U.S. senators' },
        { n: 18, year: 1919, text: 'Prohibition of alcohol' },
        { n: 19, year: 1920, text: 'Women’s right to vote' },
        { n: 20, year: 1933, text: 'Sets start of terms; the “lame-duck” amendment' },
        { n: 21, year: 1933, text: 'Repealed Prohibition (the 18th)' },
        { n: 22, year: 1951, text: 'Two-term limit for the President' },
        { n: 23, year: 1961, text: 'Electoral votes for Washington, D.C.' },
        { n: 24, year: 1964, text: 'Abolished the poll tax in federal elections' },
        { n: 25, year: 1967, text: 'Presidential succession and disability' },
        { n: 26, year: 1971, text: 'Lowered the voting age to 18' },
        { n: 27, year: 1992, text: 'Delays congressional pay raises until after an election' }
      ]
    }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:london', name: 'London', lon: -0.13, lat: 51.5, capitalOf: 'nation:great-britain', note: 'British imperial capital and largest European city of the era.' },
    { id: 'city:paris', name: 'Paris', lon: 2.35, lat: 48.85, capitalOf: 'nation:france', note: 'Seat of the French monarchy; centre of American diplomacy under Franklin.' },
    { id: 'city:madrid', name: 'Madrid', lon: -3.70, lat: 40.42, capitalOf: 'nation:spain', note: 'Capital of Bourbon Spain.' },
    { id: 'city:amsterdam', name: 'Amsterdam', lon: 4.90, lat: 52.37, capitalOf: 'nation:dutch-republic', note: 'Commercial heart of the Dutch Republic.' },
    { id: 'city:philadelphia', name: 'Philadelphia', lon: -75.16, lat: 39.95, capitalOf: 'nation:united-states', note: 'Seat of the Continental Congress; independence declared here in 1776.' },
    { id: 'city:boston', name: 'Boston', lon: -71.06, lat: 42.36, note: 'Cradle of the rebellion; site of the 1775 siege.' },
    { id: 'city:new-york', name: 'New York', lon: -74.01, lat: 40.71, note: 'British headquarters in America for most of the war (from 1776).' },
    { id: 'city:charleston', name: 'Charleston', lon: -79.93, lat: 32.78, note: 'Key southern port; captured by Britain in 1780.' },
    { id: 'city:quebec', name: 'Quebec', lon: -71.21, lat: 46.81, note: 'Capital of British Quebec; held against American invasion in 1775.' },
    { id: 'city:gibraltar', name: 'Gibraltar', lon: -5.35, lat: 36.14, note: 'British fortress besieged by Spain and France, 1779–1783.' },
    { id: 'city:seringapatam', name: 'Seringapatam', lon: 76.70, lat: 12.42, capitalOf: 'nation:mysore', note: 'Capital of Mysore in the war’s Indian theatre.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1775, 4, 19, 'battle', 'Lexington & Concord', 'Fighting breaks out in Massachusetts; the war begins.'),
    T(1775, 6, 17, 'battle', 'Bunker Hill', 'A costly British victory near Boston.'),
    T(1775, 7, 3, 'political', 'Washington takes command', 'Washington assumes command of the Continental Army.'),
    T(1776, 7, 4, 'political', 'Declaration of Independence', 'The Thirteen Colonies declare independence.'),
    T(1776, 12, 26, 'battle', 'Trenton', 'Washington crosses the Delaware and wins a vital morale victory.'),
    T(1777, 10, 17, 'battle', 'Saratoga', 'A British army surrenders — the turning point of the war.'),
    T(1778, 2, 6, 'treaty', 'Franco-American Alliance', 'France allies with the U.S.; the war goes global.'),
    T(1778, 6, 28, 'battle', 'Monmouth', 'A hard-fought draw in New Jersey.'),
    T(1779, 6, 21, 'political', 'Spain enters the war', 'Spain declares war on Britain as France’s ally.'),
    T(1779, 6, 24, 'battle', 'Siege of Gibraltar begins', 'A 3½-year Franco-Spanish siege of Gibraltar opens.'),
    T(1780, 5, 12, 'battle', 'Fall of Charleston', 'Britain captures Charleston — America’s worst defeat.'),
    T(1780, 8, 16, 'battle', 'Camden', 'A crushing British win in the South.'),
    T(1780, 12, 20, 'political', 'Anglo-Dutch War', 'Britain declares war on the Dutch Republic.'),
    T(1781, 1, 17, 'battle', 'Cowpens', 'A brilliant American victory in South Carolina.'),
    T(1781, 9, 5, 'battle', 'Battle of the Chesapeake', 'A French fleet wins control of the sea off Yorktown.'),
    T(1781, 10, 19, 'battle', 'Yorktown', 'Cornwallis surrenders; the land war effectively ends.'),
    T(1782, 3, 20, 'political', 'Lord North resigns', 'Britain moves toward seeking peace.'),
    T(1783, 9, 3, 'treaty', 'Treaty of Paris', 'Britain recognizes American independence; the war ends.')
  ];

  /* ---- WORLD AT THIS TIME ---------------------------------------------- */
  /* A compact, sourced snapshot of the wider world. Population is given as a
     range with low confidence — historians estimate, they do not count.       */
  const worldContext = {
    _default: {
      worldPopulation: { low: 800000000, high: 950000000, confidence: 'low' },
      largestEmpires: ['Qing China', 'Russian Empire', 'British Empire', 'Spanish Empire'],
      largestCities: ['Beijing', 'Edo (Tokyo)', 'London', 'Constantinople'],
      otherConflicts: ['Second Anglo-Mysore War (1780–84)', 'Fourth Anglo-Dutch War (1780–84)'],
      science: ['Watt’s improved steam engine (1776)', 'Lavoisier’s work founding modern chemistry'],
      culture: ['Mozart at the height of his early fame', 'Neoclassicism in art and architecture']
    },
    1776: { science: ['Adam Smith publishes The Wealth of Nations', 'Watt’s steam engine enters commercial use'] },
    1781: { science: ['William Herschel discovers the planet Uranus'] },
    1783: { science: ['Montgolfier brothers fly the first hot-air balloons'], culture: ['First manned flight captivates Europe'] }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:declared', type: 'click-map', prompt: 'Click the territory that declared independence in 1776.', accept: { entityId: 'nation:united-states' }, feedback: { correct: 'Correct — the United States declared independence on 4 July 1776.', incorrect: 'Not quite — look for the thirteen colonies on the North American seaboard.' } },
    { id: 'quiz:france-year', type: 'set-year', prompt: 'Move the timeline to the year France formally allied with the United States.', accept: { year: 1778 }, feedback: { correct: 'Right — the Treaty of Alliance was signed in February 1778.', incorrect: 'Try again — it followed the American victory at Saratoga.' } },
    { id: 'quiz:turning-point', type: 'multiple-choice', prompt: 'Which battle is considered the turning point that brought France into the war?', options: ['Bunker Hill', 'Saratoga', 'Yorktown', 'Trenton'], accept: { option: 'Saratoga' }, feedback: { correct: 'Correct — Saratoga (1777) persuaded France to ally openly.', incorrect: 'Not that one — it was the 1777 surrender of a British army.' } },
    { id: 'quiz:paris-year', type: 'set-year', prompt: 'Set the timeline to the year the Treaty of Paris ended the war.', accept: { year: 1783 }, feedback: { correct: 'Correct — the Treaty of Paris was signed on 3 September 1783.', incorrect: 'Move further along — the war ended after Yorktown.' } },
    { id: 'quiz:spain', type: 'click-map', prompt: 'Click Britain’s Bourbon rival that entered the war in 1779 to recover Gibraltar.', accept: { entityId: 'nation:spain' }, feedback: { correct: 'Correct — Spain entered in 1779 as France’s ally.', incorrect: 'Look to the Iberian Peninsula.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['american-revolution'] = {
    id: 'war:american-revolution', schemaVersion: 1,
    meta: {
      name: 'American Revolutionary War',
      altNames: ['American War of Independence', 'Revolutionary War'],
      years: { start: 1775, end: 1783 }, defaultYear: 1778,
      duration: '8 years (1775–1783)',
      summary: 'A war in which thirteen British colonies in North America won independence as the United States, with decisive help from France, Spain and the Dutch Republic, transforming a colonial revolt into a global conflict.',
      background: 'A decade of disputes over taxation and self-government — “no taxation without representation” — turned colonial protest into armed rebellion in 1775.',
      causesLong: ['Colonial self-government colliding with imperial control', 'Mounting debt from the Seven Years’ War shifting onto the colonies', 'Enlightenment ideas of natural rights and consent'],
      causesImmediate: ['Taxes and the Coercive Acts', 'The clash at Lexington and Concord (April 1775)'],
      turningPoints: ['Declaration of Independence (1776)', 'Saratoga (1777) → French alliance (1778)', 'Yorktown (1781)'],
      outcome: 'American and allied victory; British recognition of U.S. independence.',
      victor: 'american', peaceTreaty: 'treaty:paris-1783',
      territorialChanges: 'U.S. independence with territory to the Mississippi; Spain regained Florida and Minorca; the global balance of empire shifted.',
      significance: 'Created the United States, drained French finances toward revolution, and reshaped the European balance of power.',
      humanCost: 'Total deaths are debated. Combined American military deaths are usually estimated at <strong>25,000–70,000</strong> <span class="conf low">low confidence</span>, the majority from disease rather than combat. Global figures (French, Spanish, British and Indian theatres) are far less certain.',
      consequences: ['Birth of the United States', 'Fiscal crisis contributing to the French Revolution (1789)', 'A reordered map of empire in the Americas']
    },
    /* Faction palette + side labels — presentation reads these, so nothing about
       this war is hardcoded in the app. A new war supplies its own. */
    factions: {
      usa: { label: 'United States', colorVar: '--usa' },
      france: { label: 'France & allies', colorVar: '--france' },
      spain: { label: 'Spain & possessions', colorVar: '--spain' },
      dutch: { label: 'Dutch Republic', colorVar: '--dutch' },
      britain: { label: 'British Empire', colorVar: '--britain' },
      neutral: { label: 'Uninvolved', colorVar: '--neutral' }
    },
    legendOrder: ['usa', 'france', 'spain', 'dutch', 'britain', 'neutral'],
    sides: {
      american: { label: 'American coalition', factionKey: 'usa' },
      british: { label: 'British side', factionKey: 'britain' }
    },
    sources: S, nations, leaders, battles, treaties, documents, cities, timeline, worldContext, quizzes,
    // geometry: one validated snapshot reused across the 1775–1783 window (see note in UI)
    geo: {
      borderSnapshots: { 1783: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1783.geojson' },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson'
    }
  };
})();
