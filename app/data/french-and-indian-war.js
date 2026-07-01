/* Historical Wars Explorer — dataset: French and Indian War (1754–1763)
   The North American theatre of the global Seven Years' War, and the direct
   prelude to the American Revolution. PURE DATA — the engine is war-agnostic;
   this file registers itself on window.HWE.wars, exactly like the others.

   Map note: the best-fitting public basemap for this era is world_1715, which
   shows New France (as "Louisiana"), the British seaboard colonies, Spanish
   Florida and the Indigenous nations — but NOT the 1763 cession itself. The
   transfer of Canada and everything east of the Mississippi to Britain is told
   through the timeline, treaties and panel text rather than a second (and, for
   1763, anachronistic) snapshot. See geo.note.                                 */
(function () {
  window.HWE = window.HWE || { wars: {} };

  const S = {  // sources — every fact references one of these
    anderson: { id: 'src:anderson', type: 'book', citation: 'Fred Anderson, Crucible of War: The Seven Years’ War and the Fate of Empire in British North America, 1754–1766 (Knopf)', reliability: 'high' },
    fowler: { id: 'src:fowler', type: 'book', citation: 'William M. Fowler Jr., Empires at War: The French and Indian War and the Struggle for North America (Walker)', reliability: 'high' },
    borneman: { id: 'src:borneman', type: 'book', citation: 'Walter R. Borneman, The French and Indian War: Deciding the Fate of North America (HarperCollins)', reliability: 'medium' },
    parkman: { id: 'src:parkman', type: 'book', citation: 'Francis Parkman, Montcalm and Wolfe (classic narrative history)', reliability: 'medium' },
    loc: { id: 'src:loc', type: 'archive', citation: 'U.S. Library of Congress — Primary Documents in American History', url: 'https://guides.loc.gov/', reliability: 'high' },
    britannica: { id: 'src:britannica', type: 'reference', citation: 'Encyclopædia Britannica', url: 'https://www.britannica.com/', reliability: 'medium' },
    ne: { id: 'src:naturalearth', type: 'archive', citation: 'Natural Earth — public-domain map data', url: 'https://www.naturalearthdata.com/', reliability: 'high' },
    hbm: { id: 'src:historical-basemaps', type: 'archive', citation: 'aourednik/historical-basemaps (world_1715), curated', url: 'https://github.com/aourednik/historical-basemaps', reliability: 'medium' }
  };

  const r = (low, high) => ({ low, high });   // a range
  const v = (value) => ({ value });           // a single value

  /* ---- NATIONS / POLITIES --------------------------------------------------
     `side` + `entered`/`exited` drive year-aware allegiance coloring.
     `geoNames`/`geoSubjects` are the polygon labels in the 1715 basemap that
     belong to each polity. New France carries the huge "Louisiana" polygon so
     France's North American empire is visible; the St-Lawrence heartland it
     lost in 1763 is described in text (the era's basemap has no polygon for it). */
  const nations = [
    {
      id: 'nation:great-britain', type: 'nation', name: 'Great Britain', short: 'Britain',
      side: 'british', entered: 1754, exited: 1763, factionKey: 'britain',
      capital: { name: 'London', lon: -0.13, lat: 51.5 },
      geoNames: ['United Kingdom', 'Kingdom of Ireland', "Rupert's Land", 'Jamaica (UK)', 'Barbados (UK)', 'Belize', 'Mosquito Coast', 'Saint Kitts and Nevis (UK)', 'Virgin Islands (UK)', 'Antigua and Barbuda', 'Montserrat', 'Anguilla'],
      geoSubjects: [],
      summary: 'The rising maritime and colonial power. After early disasters, William Pitt poured money and men into North America, and from 1758 Britain systematically captured France’s forts and cities, conquering all of New France by 1760.',
      objectives: ['Break French power in the Ohio Valley and Canada', 'Secure the American colonies and their westward expansion', 'Win the wider Seven Years’ War against France and (from 1762) Spain'],
      facts: [
        { attr: 'government', value: 'Constitutional monarchy', from: 1754, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King George II (r. 1727–1760)', from: 1754, to: 1760, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King George III (r. 1760–1820)', from: 1760, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'warLeader', value: 'William Pitt the Elder directs the war effort (from 1757)', from: 1757, to: 1761, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'commander', value: 'Gen. Jeffery Amherst, C-in-C in North America (from 1758)', from: 1758, to: 1763, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'navy', value: 'Royal Navy blockaded France, cutting reinforcements to Canada', from: 1755, to: 1763, confidence: 'high', sources: ['src:fowler'] }
      ]
    },
    {
      id: 'nation:british-colonies', type: 'nation', name: 'British American Colonies', short: 'Thirteen Colonies',
      side: 'british', entered: 1754, exited: 1763, factionKey: 'britain',
      capital: { name: 'Boston', lon: -71.06, lat: 42.36 },
      geoNames: ['British American colonies'], geoSubjects: [],
      summary: 'The British seaboard colonies supplied the militia, rangers and provincial regiments that fought alongside the redcoats. Their westward land hunger — colliding with New France in the Ohio Country — helped start the war, and the war’s debts and frictions would help start the Revolution a decade later.',
      objectives: ['Secure the Ohio Valley for colonial settlement', 'Defend the frontier against French and allied raids', 'Support the British regulars'],
      facts: [
        { attr: 'government', value: 'Separate British colonies, each with its own assembly', from: 1754, to: 1763, confidence: 'high', sources: ['src:loc'] },
        { attr: 'milestone', value: 'Albany Congress proposes an intercolonial union (1754) — rejected', from: 1754, to: 1763, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'notableOfficer', value: 'Lt. Col. George Washington of the Virginia Regiment', from: 1754, to: 1758, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'population', value: r(1400000, 1600000), from: 1754, to: 1763, confidence: 'medium', sources: ['src:loc'], note: 'the thirteen colonies, incl. enslaved people' }
      ]
    },
    {
      id: 'nation:new-france', type: 'nation', name: 'New France', short: 'New France',
      side: 'french', entered: 1754, exited: 1763, factionKey: 'france',
      capital: { name: 'Quebec', lon: -71.21, lat: 46.81 },
      geoNames: ['Louisiana'], geoSubjects: ['Louisiana'],
      summary: 'France’s vast but thinly-settled North American empire — the St-Lawrence valley (Canada), the Great Lakes, and Louisiana down the Mississippi. Perhaps 70,000 French colonists faced over a million British colonists, and relied on alliances with Indigenous nations. Britain conquered it between 1758 and 1760, and France ceded it in 1763.',
      objectives: ['Hold the Ohio Valley to link Canada with Louisiana', 'Defend Quebec, Montreal and the fur-trade interior', 'Preserve alliances with Indigenous nations'],
      facts: [
        { attr: 'government', value: 'Royal French colony under a Governor-General', from: 1754, to: 1760, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'governor', value: 'Marquis de Vaudreuil, Governor-General of New France', from: 1755, to: 1760, confidence: 'high', sources: ['src:parkman'] },
        { attr: 'commander', value: 'Marquis de Montcalm, field commander (1756–1759)', from: 1756, to: 1759, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'population', value: r(60000, 75000), from: 1754, to: 1760, confidence: 'medium', sources: ['src:fowler'], note: 'French colonists in Canada — vastly outnumbered by the British colonies' },
        { attr: 'fate', value: 'Montreal surrendered September 1760; ceded to Britain in 1763', from: 1760, to: 1763, confidence: 'high', sources: ['src:anderson'] }
      ]
    },
    {
      id: 'nation:france', type: 'nation', name: 'Kingdom of France', short: 'France',
      side: 'french', entered: 1754, exited: 1763, factionKey: 'france',
      capital: { name: 'Versailles', lon: 2.12, lat: 48.80 },
      geoNames: ['France', 'Guadeloupe', 'Martinique', 'Saint Lucia', 'Haiti', 'Dominica'], geoSubjects: ['France'],
      summary: 'The greatest land power in Europe, but stretched across a global war. Prioritising the European and Caribbean theatres and unable to break the Royal Navy’s blockade, France could not save Canada — and lost most of its North American and Indian empire in the peace.',
      objectives: ['Defend New France and the sugar islands', 'Win the continental war in Europe', 'Preserve overseas trade and colonies'],
      facts: [
        { attr: 'government', value: 'Absolute (Bourbon) monarchy', from: 1754, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King Louis XV (r. 1715–1774)', from: 1754, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'population', value: r(24000000, 26000000), from: 1754, to: 1763, confidence: 'medium', sources: ['src:britannica'] },
        { attr: 'navy', value: 'French fleet crippled by the British blockade; Quiberon Bay defeat (1759)', from: 1759, to: 1763, confidence: 'high', sources: ['src:fowler'] }
      ]
    },
    {
      id: 'nation:spain', type: 'nation', name: 'Spain', short: 'Spain',
      side: 'french', entered: 1762, exited: 1763, factionKey: 'spain',
      capital: { name: 'Madrid', lon: -3.70, lat: 40.42 },
      geoNames: ['Spain', 'Florida (Spain)', 'Cuba (Spain)', 'Vice-Royalty of New Spain', 'Santo Domingo (Spain)'], geoSubjects: ['Spain'],
      summary: 'Bourbon Spain joined France late (the Family Compact, 1762) — just in time to lose Havana and Manila to British expeditions. At the peace it ceded Florida to Britain, but received French Louisiana west of the Mississippi as compensation.',
      objectives: ['Support Bourbon France against Britain', 'Protect its Caribbean and Pacific possessions'],
      facts: [
        { attr: 'government', value: 'Absolute (Bourbon) monarchy', from: 1754, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'monarch', value: 'King Charles III (r. 1759–1788)', from: 1759, to: 1763, confidence: 'high', sources: ['src:britannica'] },
        { attr: 'entryEvent', value: 'Third Family Compact with France; entered the war January 1762', from: 1762, to: 1763, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'losses', value: 'Britain captured Havana and Manila in 1762', from: 1762, to: 1763, confidence: 'high', sources: ['src:fowler'] }
      ]
    },
    {
      id: 'nation:iroquois', type: 'nation', name: 'Iroquois Confederacy', short: 'Haudenosaunee',
      side: 'british', entered: 1754, exited: 1763, factionKey: 'native',
      capital: { name: 'Onondaga', lon: -76.10, lat: 43.00 },
      geoNames: ['Iroquois'], geoSubjects: ['Iroquois'],
      summary: 'The Six Nations of the Haudenosaunee tried to stay neutral and play the empires against each other, but the Covenant Chain and the diplomacy of Sir William Johnson tilted many — especially the Mohawk — toward Britain. Their choices helped decide control of the New York frontier.',
      objectives: ['Preserve Haudenosaunee independence and lands', 'Balance French and British power', 'Control trade and the western nations'],
      facts: [
        { attr: 'polity', value: 'Confederacy of Six Nations (Mohawk, Oneida, Onondaga, Cayuga, Seneca, Tuscarora)', from: 1754, to: 1763, confidence: 'high', sources: ['src:anderson'] },
        { attr: 'leader', value: 'Chief Hendrick (Theyanoguin) allied with Britain; killed at Lake George (1755)', from: 1754, to: 1755, confidence: 'medium', sources: ['src:anderson'] },
        { attr: 'diplomacy', value: 'Sir William Johnson cultivated the British–Mohawk alliance', from: 1755, to: 1763, confidence: 'high', sources: ['src:anderson'] }
      ]
    },
    {
      id: 'nation:french-allied-nations', type: 'nation', name: 'French-allied Indigenous Nations', short: 'French-allied nations',
      side: 'french', entered: 1754, exited: 1760, factionKey: 'native',
      capital: null,
      geoNames: ['Illinnois', 'Menomini', 'Fox', 'Montagnais Innu', 'Naskapi Innu', "Mi'kma'ki"], geoSubjects: [],
      summary: 'Many Great Lakes, Illinois-country and Wabanaki nations — Odawa, Ojibwe, Potawatomi, Huron-Wendat, Abenaki, Mi’kmaq and others — allied with France, whose traders and missionaries they preferred to land-hungry British settlers. Their warriors were central to French victories like the Monongahela. The alliances frayed as New France collapsed after 1758.',
      objectives: ['Resist British colonial expansion into their lands', 'Sustain the French trade and gift-giving alliance', 'Defend the pays d’en haut (the upper country)'],
      facts: [
        { attr: 'note', value: 'A simplified grouping of many distinct nations with their own aims; alignments shifted through the war', from: 1754, to: 1760, confidence: 'medium', sources: ['src:anderson'] },
        { attr: 'aftermath', value: 'Pontiac’s War (1763) resisted British rule after the French defeat', from: 1763, to: 1763, confidence: 'high', sources: ['src:anderson'] }
      ]
    }
  ];

  /* ---- LEADERS ---------------------------------------------------------- */
  const leaders = [
    { id: 'person:washington-fiw', name: 'George Washington', nationId: 'nation:british-colonies', role: 'Lt. Colonel, Virginia Regiment', years: '1732–1799', side: 'british',
      bio: 'A 22-year-old Virginia officer whose 1754 skirmish at Jumonville Glen helped ignite the war, and whose surrender at Fort Necessity was his only battlefield capitulation. He survived Braddock’s disaster at the Monongahela and learned the soldiering he would later use to lead the American Revolution.',
      relatedBattles: ['battle:jumonville', 'battle:fort-necessity', 'battle:monongahela'], confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:pitt', name: 'William Pitt the Elder', nationId: 'nation:great-britain', role: 'Secretary of State; war leader', years: '1708–1778', side: 'british',
      bio: 'The minister who reorganised the British war effort from 1757, subsidising allies in Europe while concentrating money, ships and troops on conquering North America. His strategy delivered the “year of victories” in 1759.',
      confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:amherst', name: 'Jeffery Amherst', nationId: 'nation:great-britain', role: 'Commander-in-Chief, North America', years: '1717–1797', side: 'british',
      bio: 'Captured the great fortress of Louisbourg in 1758 and, as overall commander, directed the three-pronged advance that took Montreal and completed the conquest of Canada in 1760.',
      relatedBattles: ['battle:louisbourg', 'battle:montreal'], confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:wolfe', name: 'James Wolfe', nationId: 'nation:great-britain', role: 'Major General', years: '1727–1759', side: 'british',
      bio: 'Led the daring 1759 assault on Quebec, scaling the cliffs to the Plains of Abraham. He was killed in the moment of victory that decided the fate of Canada — becoming a British national hero.',
      relatedBattles: ['battle:quebec-1759'], confidence: 'high', sources: ['src:parkman'] },
    { id: 'person:johnson', name: 'Sir William Johnson', nationId: 'nation:great-britain', role: 'Superintendent of Indian Affairs', years: '1715–1774', side: 'british',
      bio: 'Irish-born frontier magnate whose close ties to the Mohawk secured Iroquois support for Britain. He won the Battle of Lake George (1755) and later took Fort Niagara (1759).',
      relatedBattles: ['battle:niagara'], confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:braddock', name: 'Edward Braddock', nationId: 'nation:great-britain', role: 'General; C-in-C (1755)', years: '1695–1755', side: 'british',
      bio: 'Commanded the ambitious 1755 expedition against Fort Duquesne. His column was ambushed and shattered on the Monongahela, and he was mortally wounded — one of Britain’s worst early defeats.',
      relatedBattles: ['battle:monongahela'], confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:montcalm', name: 'Marquis de Montcalm', nationId: 'nation:new-france', role: 'French field commander', years: '1712–1759', side: 'french',
      bio: 'France’s commander in Canada, who won brilliant defensive victories at Oswego, Fort William Henry and Carillon (Ticonderoga) before being defeated and killed defending Quebec in 1759.',
      relatedBattles: ['battle:william-henry', 'battle:carillon', 'battle:quebec-1759'], confidence: 'high', sources: ['src:parkman'] },
    { id: 'person:vaudreuil', name: 'Marquis de Vaudreuil', nationId: 'nation:new-france', role: 'Governor-General of New France', years: '1698–1778', side: 'french',
      bio: 'Canadian-born Governor-General who favoured frontier and Indigenous-alliance warfare and often clashed with Montcalm. He signed the capitulation of Montreal in 1760, surrendering all of New France.',
      relatedBattles: ['battle:montreal'], confidence: 'high', sources: ['src:anderson'] },
    { id: 'person:louis-xv', name: 'King Louis XV', nationId: 'nation:france', role: 'King of France', years: '1710–1774', side: 'french',
      bio: 'Presided over a France that prioritised Europe and the Caribbean over Canada. The loss of New France and much of France’s Indian empire in 1763 was the great strategic failure of his reign.',
      confidence: 'high', sources: ['src:britannica'] },
    { id: 'person:pontiac', name: 'Pontiac', nationId: 'nation:french-allied-nations', role: 'Odawa (Ottawa) war leader', years: 'c.1720–1769', side: 'french',
      bio: 'Odawa leader who, after the French defeat, rallied a broad Indigenous uprising against British rule in 1763 (Pontiac’s War) — helping prompt the Royal Proclamation that limited colonial expansion west of the Appalachians.',
      confidence: 'medium', sources: ['src:anderson'] }
  ];

  /* ---- BATTLES ---------------------------------------------------------- */
  const B = (id, name, y, m, d, lon, lat, place, victor, sig, opts) => Object.assign(
    { id, type: 'battle', name, date: { y, m, d }, location: { lon, lat, place }, victor, significance: sig, confidence: 'high', sources: ['src:anderson'] }, opts || {});
  const battles = [
    B('battle:jumonville', 'Jumonville Glen', 1754, 5, 28, -79.63, 39.86, 'Pennsylvania', 'British (colonial)', 'Washington’s ambush of a French party — the skirmish that set the war in motion.', { commanders: ['person:washington-fiw'], casualties: { french: r(13, 14) } }),
    B('battle:fort-necessity', 'Fort Necessity', 1754, 7, 3, -79.59, 39.82, 'Great Meadows, Pennsylvania', 'French', 'Washington, besieged in a hasty stockade, surrendered — his only capitulation.', { commanders: ['person:washington-fiw'] }),
    B('battle:monongahela', 'Battle of the Monongahela (Braddock’s Defeat)', 1755, 7, 9, -79.90, 40.39, 'near Fort Duquesne (Pittsburgh)', 'French', 'A French-and-Indigenous force ambushed and destroyed Braddock’s column; the general was killed.', { commanders: ['person:braddock', 'person:washington-fiw'], casualties: { british: r(850, 900) } }),
    B('battle:lake-george', 'Battle of Lake George', 1755, 9, 8, -73.71, 43.42, 'New York', 'British', 'Johnson’s colonials and Mohawk allies checked a French advance and captured its commander.', { commanders: ['person:johnson'] }),
    B('battle:oswego', 'Battle of Fort Oswego', 1756, 8, 14, -76.51, 43.46, 'New York', 'French', 'Montcalm captured Britain’s key post on Lake Ontario, dominating the frontier.', { commanders: ['person:montcalm'] }),
    B('battle:william-henry', 'Siege of Fort William Henry', 1757, 8, 9, -73.71, 43.42, 'New York', 'French', 'Montcalm took the fort; the killing of surrendered prisoners by his allies became infamous.', { commanders: ['person:montcalm'] }),
    B('battle:louisbourg', 'Siege of Louisbourg', 1758, 7, 26, -59.98, 45.89, 'Île-Royale (Cape Breton)', 'British', 'The fall of the great fortress opened the St-Lawrence and the road to Quebec.', { commanders: ['person:amherst', 'person:wolfe'] }),
    B('battle:carillon', 'Battle of Carillon (Ticonderoga)', 1758, 7, 8, -73.39, 43.84, 'New York', 'French', 'Montcalm’s outnumbered troops crushed a frontal British assault — France’s greatest victory of the war.', { commanders: ['person:montcalm'], casualties: { british: r(1900, 2600) } }),
    B('battle:fort-duquesne', 'Forbes Expedition — Fort Duquesne', 1758, 11, 25, -80.01, 40.44, 'Forks of the Ohio (Pittsburgh)', 'British', 'The French abandoned and burned the fort; Britain rebuilt it as Fort Pitt, winning the Ohio Valley.', {}),
    B('battle:niagara', 'Siege of Fort Niagara', 1759, 7, 26, -79.06, 43.26, 'New York', 'British', 'Cut the link between Canada and the western forts; part of the 1759 tide of victories.', { commanders: ['person:johnson'] }),
    B('battle:ticonderoga-1759', 'Capture of Ticonderoga & Crown Point', 1759, 7, 26, -73.39, 43.84, 'New York', 'British', 'Amherst’s advance up Lake Champlain forced the French to fall back on Canada.', { commanders: ['person:amherst'] }),
    B('battle:quebec-1759', 'Battle of the Plains of Abraham (Quebec)', 1759, 9, 13, -71.22, 46.81, 'Quebec', 'British', 'The decisive battle: Wolfe defeated Montcalm outside Quebec. Both commanders died; the city fell.', { decisive: true, commanders: ['person:wolfe', 'person:montcalm'], casualties: { british: r(600, 660), french: r(640, 700) } }),
    B('battle:sainte-foy', 'Battle of Sainte-Foy', 1760, 4, 28, -71.29, 46.78, 'near Quebec', 'French', 'A French victory that failed to retake Quebec once the Royal Navy arrived before French ships.', {}),
    B('battle:montreal', 'Capitulation of Montreal', 1760, 9, 8, -73.57, 45.50, 'Montreal', 'British', 'Vaudreuil surrendered New France to three converging British armies — the conquest of Canada complete.', { decisive: true, commanders: ['person:amherst', 'person:vaudreuil'] }),
    B('battle:havana', 'Siege of Havana', 1762, 8, 13, -82.36, 23.14, 'Cuba', 'British', 'A British expedition captured Spain’s great Caribbean port and fleet base soon after Spain entered the war.', {}),
    B('battle:manila', 'Capture of Manila', 1762, 10, 6, 120.98, 14.60, 'Philippines', 'British', 'Britain seized Spain’s Pacific capital — one of the war’s most distant conquests.', {}),
    B('battle:signal-hill', 'Battle of Signal Hill', 1762, 9, 15, -52.68, 47.57, 'St. John’s, Newfoundland', 'British', 'The last North American battle of the war, recapturing St. John’s from a French raid.', {})
  ];

  /* ---- TREATIES --------------------------------------------------------- */
  const treaties = [
    { id: 'treaty:fontainebleau-1762', type: 'treaty', name: 'Treaty of Fontainebleau (secret)', date: { y: 1762, m: 11, d: 3 },
      signatories: ['nation:france', 'nation:spain'], summary: 'A secret agreement in which France ceded Louisiana west of the Mississippi (and New Orleans) to Spain — compensating its ally and keeping the territory out of British hands.', confidence: 'high', sources: ['src:anderson'] },
    { id: 'treaty:paris-1763', type: 'treaty', name: 'Treaty of Paris (1763)', date: { y: 1763, m: 2, d: 10 },
      signatories: ['nation:great-britain', 'nation:france', 'nation:spain'], summary: 'Ended the war. France ceded Canada and all its territory east of the Mississippi to Britain, and Spain ceded Florida to Britain (recovering it, plus Havana and Manila, in exchange). France was nearly expelled from mainland North America. Britain’s huge new war debt — and the costs of governing the conquests — set the stage for taxing the colonies, and the American Revolution.', confidence: 'high', sources: ['src:anderson'] }
  ];

  /* ---- CITIES ----------------------------------------------------------- */
  const cities = [
    { id: 'city:london', name: 'London', lon: -0.13, lat: 51.5, capitalOf: 'nation:great-britain', note: 'British capital; Pitt directed the global war from here.' },
    { id: 'city:versailles', name: 'Versailles', lon: 2.12, lat: 48.80, capitalOf: 'nation:france', note: 'Seat of Louis XV’s court and French war strategy.' },
    { id: 'city:madrid', name: 'Madrid', lon: -3.70, lat: 40.42, capitalOf: 'nation:spain', note: 'Capital of Bourbon Spain, which entered the war in 1762.' },
    { id: 'city:quebec', name: 'Quebec', lon: -71.21, lat: 46.81, capitalOf: 'nation:new-france', note: 'Capital of New France; fell to Wolfe on the Plains of Abraham in 1759.' },
    { id: 'city:montreal', name: 'Montreal', lon: -73.57, lat: 45.50, note: 'Last stronghold of New France; its 1760 surrender ended French Canada.' },
    { id: 'city:louisbourg', name: 'Louisbourg', lon: -59.98, lat: 45.89, note: 'Fortress guarding the Gulf of St. Lawrence; captured by Britain in 1758.' },
    { id: 'city:fort-duquesne', name: 'Fort Duquesne / Pittsburgh', lon: -80.01, lat: 40.44, note: 'French fort at the forks of the Ohio; taken and rebuilt as Fort Pitt in 1758.' },
    { id: 'city:boston', name: 'Boston', lon: -71.06, lat: 42.36, capitalOf: 'nation:british-colonies', note: 'Major colonial port and recruiting centre for provincial troops.' },
    { id: 'city:new-york', name: 'New York', lon: -74.01, lat: 40.71, note: 'Key British base and supply hub for the northern campaigns.' },
    { id: 'city:philadelphia', name: 'Philadelphia', lon: -75.16, lat: 39.95, note: 'Largest colonial city; site of the 1754 Albany Plan debates over colonial union.' },
    { id: 'city:albany', name: 'Albany', lon: -73.75, lat: 42.65, note: 'Forward base for the Lake George / Lake Champlain front; site of the 1754 Albany Congress.' },
    { id: 'city:havana', name: 'Havana', lon: -82.36, lat: 23.14, note: 'Spanish Caribbean stronghold captured by Britain in 1762.' }
  ];

  /* ---- TIMELINE --------------------------------------------------------- */
  const T = (y, m, d, type, title, desc) => ({ id: `event:${y}-${m}-${d}-${type}`, date: { y, m, d }, type, title, desc });
  const timeline = [
    T(1754, 5, 28, 'battle', 'Jumonville Glen', 'Washington’s frontier skirmish sparks the war in the Ohio Country.'),
    T(1754, 7, 3, 'battle', 'Fort Necessity', 'Washington surrenders to the French — the war is on.'),
    T(1755, 7, 9, 'battle', 'Braddock’s Defeat', 'A British army is ambushed and destroyed on the Monongahela.'),
    T(1756, 5, 17, 'political', 'Britain declares war', 'The conflict widens into the global Seven Years’ War in Europe.'),
    T(1756, 8, 14, 'battle', 'Fort Oswego falls', 'Montcalm seizes Britain’s post on Lake Ontario.'),
    T(1757, 8, 9, 'battle', 'Fort William Henry', 'Montcalm captures the fort; the aftermath becomes notorious.'),
    T(1757, 12, 1, 'political', 'Pitt takes charge', 'William Pitt reorganises Britain’s war effort toward conquering Canada.'),
    T(1758, 7, 8, 'battle', 'Carillon (Ticonderoga)', 'Montcalm wins France’s greatest victory of the war.'),
    T(1758, 7, 26, 'battle', 'Louisbourg falls', 'Britain opens the sea road to Quebec.'),
    T(1758, 11, 25, 'battle', 'Fort Duquesne taken', 'Britain wins the Ohio Valley and founds Pittsburgh.'),
    T(1759, 7, 26, 'battle', 'Niagara & Ticonderoga', 'The “year of victories” — French forts fall across the frontier.'),
    T(1759, 9, 13, 'battle', 'Plains of Abraham', 'Wolfe defeats Montcalm at Quebec; both generals die.'),
    T(1760, 9, 8, 'battle', 'Montreal surrenders', 'The conquest of New France is complete.'),
    T(1762, 1, 4, 'political', 'Spain enters the war', 'The Bourbon Family Compact brings Spain in against Britain.'),
    T(1762, 8, 13, 'battle', 'Havana captured', 'Britain seizes Spain’s Caribbean stronghold.'),
    T(1762, 11, 3, 'treaty', 'Treaty of Fontainebleau', 'France secretly cedes western Louisiana to Spain.'),
    T(1763, 2, 10, 'treaty', 'Treaty of Paris', 'France cedes Canada and the east to Britain; the war ends.'),
    T(1763, 5, 7, 'political', 'Pontiac’s War', 'Indigenous nations rise against British rule; the Royal Proclamation follows.')
  ];

  /* ---- WORLD AT THIS TIME ---------------------------------------------- */
  const worldContext = {
    _default: {
      worldPopulation: { low: 750000000, high: 900000000, confidence: 'low' },
      largestEmpires: ['Qing China', 'Mughal Empire (declining)', 'Russian Empire', 'Ottoman Empire'],
      largestCities: ['Beijing', 'Edo (Tokyo)', 'London', 'Constantinople'],
      otherConflicts: ['Seven Years’ War in Europe (1756–63)', 'Third Carnatic War in India (1757–63)'],
      science: ['Franklin’s experiments on electricity', 'Linnaeus’s system of classification'],
      culture: ['The French Enlightenment — Diderot’s Encyclopédie, Voltaire, Rousseau', 'Bach’s late works; the young Mozart']
    },
    1756: { culture: ['Wolfgang Amadeus Mozart is born (27 January 1756)'] },
    1757: { otherConflicts: ['Battle of Plassey (1757) gives Britain’s East India Company control of Bengal'] },
    1759: { science: ['The predicted return of Halley’s Comet confirms Newtonian astronomy'], otherConflicts: ['Britain’s “Annus Mirabilis” — victories at Quebec, Minden and Quiberon Bay'] },
    1762: { political: ['Catherine the Great seizes the Russian throne'] }
  };

  /* ---- QUIZZES ---------------------------------------------------------- */
  const quizzes = [
    { id: 'quiz:fiw-start', type: 'set-year', prompt: 'Set the timeline to the year the fighting began, with Washington’s clash in the Ohio Country.', accept: { year: 1754 }, feedback: { correct: 'Correct — Jumonville Glen and Fort Necessity, 1754.', incorrect: 'Move earlier — before the formal European declaration of war.' } },
    { id: 'quiz:fiw-newfrance', type: 'click-map', prompt: 'Click France’s North American empire (its Louisiana and Canada claims).', accept: { entityId: 'nation:new-france' }, feedback: { correct: 'Correct — New France stretched from the St. Lawrence down the Mississippi.', incorrect: 'Look at the vast French-claimed interior of North America.' } },
    { id: 'quiz:fiw-quebec', type: 'multiple-choice', prompt: 'Which 1759 battle decided the fate of Canada, killing both opposing commanders?', options: ['Carillon', 'Plains of Abraham', 'Fort Necessity', 'Havana'], accept: { option: 'Plains of Abraham' }, feedback: { correct: 'Correct — Wolfe and Montcalm both died at Quebec in 1759.', incorrect: 'Not that one — it was the fall of Quebec.' } },
    { id: 'quiz:fiw-spain', type: 'set-year', prompt: 'Move the timeline to the year Spain entered the war on France’s side.', accept: { year: 1762 }, feedback: { correct: 'Right — Spain joined via the Family Compact in 1762.', incorrect: 'Try later in the war — near its end.' } },
    { id: 'quiz:fiw-peace', type: 'set-year', prompt: 'Set the timeline to the year the Treaty of Paris ended the war.', accept: { year: 1763 }, feedback: { correct: 'Correct — the 1763 Treaty of Paris remade North America.', incorrect: 'Move to the final year of the war.' } }
  ];

  /* ---- ASSEMBLED WAR ---------------------------------------------------- */
  window.HWE.wars['french-and-indian-war'] = {
    id: 'war:french-and-indian-war', schemaVersion: 1,
    meta: {
      name: 'French and Indian War',
      altNames: ['Seven Years’ War (North America)', 'Fourth Intercolonial War', 'The War that Made America'],
      years: { start: 1754, end: 1763 }, defaultYear: 1759,
      duration: '9 years (1754–1763)',
      summary: 'The North American theatre of the global Seven Years’ War, fought between Britain and its colonies (with Iroquois allies) and France and New France (with many Indigenous allies), later joined by Spain. Britain conquered Canada and, in 1763, drove France almost entirely off the continent.',
      background: 'British colonial and French claims collided in the Ohio Valley. A 1754 skirmish led by a young George Washington escalated into a continental — then global — war.',
      causesLong: ['Rival British and French claims to the Ohio Valley and the interior', 'British colonial population and settlement pressing westward', 'A century of imperial rivalry over the North American fur trade and frontier'],
      causesImmediate: ['The contest for the forks of the Ohio (Fort Duquesne)', 'Washington’s clash at Jumonville Glen (May 1754)'],
      turningPoints: ['Pitt’s reorganisation of the war effort (1757)', 'The fall of Louisbourg (1758) opening the St. Lawrence', 'The “year of victories” and Quebec (1759)'],
      outcome: 'Decisive British victory; the conquest of New France.',
      victor: 'british', peaceTreaty: 'treaty:paris-1763',
      territorialChanges: 'France ceded Canada and all territory east of the Mississippi to Britain, and (secretly) Louisiana west of the Mississippi to Spain; Spain ceded Florida to Britain. France was nearly expelled from mainland North America.',
      significance: 'Made Britain the dominant power in North America — but its war debt and the cost of governing the conquests led Parliament to tax the colonies, igniting the disputes that produced the American Revolution a decade later.',
      humanCost: 'Reliable totals are scarce. Combined military and civilian deaths in the North American theatre likely ran into the <strong>tens of thousands</strong> <span class="conf low">low confidence</span>, with disease, frontier raids and the disruption of Indigenous nations adding heavily to the toll.',
      consequences: ['British dominance of eastern North America', 'A war debt that drove colonial taxation — and the road to 1776', 'The expulsion of the Acadians and upheaval for Indigenous nations', 'Pontiac’s War (1763) and the Royal Proclamation limiting western settlement']
    },
    factions: {
      britain: { label: 'Britain & colonies', colorVar: '--britain' },
      france: { label: 'France & New France', colorVar: '--france' },
      spain: { label: 'Spain (from 1762)', colorVar: '--spain' },
      native: { label: 'Indigenous nations', colorVar: '--aux' },
      neutral: { label: 'Uninvolved', colorVar: '--neutral' }
    },
    legendOrder: ['britain', 'france', 'spain', 'native', 'neutral'],
    sides: {
      british: { label: 'British & colonial forces', factionKey: 'britain' },
      french: { label: 'French & allied forces', factionKey: 'france' }
    },
    sources: S, nations, leaders, battles, treaties, cities, timeline, worldContext, quizzes,
    /* One snapshot: world_1715, the closest era-appropriate basemap. It shows
       New France (as "Louisiana"), the British colonies, Spanish Florida and the
       Indigenous nations — but not the 1763 cession, which is told in the
       timeline and treaties (a 1763-accurate world basemap isn't available, and
       the next snapshot, 1783, wrongly shows an independent United States). */
    geo: {
      borderSnapshots: { 1715: 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_1715.geojson' },
      nameProp: 'NAME', subjectProp: 'SUBJECTO', fit: 'sphere', projection: 'robinson',
      note: 'Borders shown are mid-18th-century colonial claims (world_1715 basemap). The 1763 transfer of Canada and the east to Britain is described in the timeline and treaties rather than drawn, as no 1763-accurate world basemap is available.'
    }
  };
})();
