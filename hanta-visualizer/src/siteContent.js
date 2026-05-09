export const MENU_ITEMS = [
  {
    id: 'map',
    label: 'Map',
    eyebrow: 'Live view',
    description: 'Open the global signal atlas with active alerts, context layers and live drawers.',
  },
  {
    id: 'outbreak',
    label: 'Outbreak dossier',
    eyebrow: 'Featured event',
    description: 'Read the cruise-linked cluster summary, route markers and related reports.',
  },
  {
    id: 'hantavirus',
    label: 'Hantavirus guide',
    eyebrow: 'Disease overview',
    description: 'Understand the two syndromes, transmission, prevention and where risk is established.',
  },
  {
    id: 'symptoms',
    label: 'Symptoms timeline',
    eyebrow: 'Clinical guide',
    description: 'Review incubation, HPS, HFRS, warning signs and how diagnosis is confirmed.',
  },
  {
    id: 'about',
    label: 'About the tracker',
    eyebrow: 'Method',
    description: 'See how signals are collected, layered and kept transparent.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    eyebrow: 'Reference',
    description: 'Common questions about contagion, severity, incubation and data freshness.',
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: 'Corrections',
    description: 'Reach the project for feedback, data fixes and press requests.',
  },
];

export const INTRO_STEPS = [
  {
    title: 'Endemic footprint',
    description: 'Soft polygons show long-running hantavirus circulation zones so recent alerts have historical context.',
  },
  {
    title: 'Historical burden',
    description: 'Reference circles summarize published case counts by region. Size reflects the scale of prior reporting.',
  },
  {
    title: 'Active signals',
    description: 'Pulsing pins mark the current signal stream built from outbreak reports, public surveillance and news updates.',
  },
];

export const ALERT_TYPE_META = {
  local: {
    label: 'Local',
    shortLabel: 'Local',
    description: 'A case, death or outbreak was reported in the affected area.',
  },
  imported: {
    label: 'Imported',
    shortLabel: 'Imported',
    description: 'A traveler, returnee or transferred patient appears in the reporting chain.',
  },
  response: {
    label: 'Response',
    shortLabel: 'Response',
    description: 'Travel advice, contact tracing, quarantine or screening action is the main signal.',
  },
};

export const FEATURED_OUTBREAK = {
  id: 'mv-hondius-2026',
  routeHash: '#/outbreaks/mv-hondius-2026',
  title: 'MV Hondius cluster',
  shortTitle: 'MV Hondius',
  cases: 8,
  deaths: 3,
  eta: 'May 11, 2026',
  summary:
    'A cruise-linked Andes hantavirus cluster is generating intense signal volume across Spain, Argentina, the United Kingdom and the United States. Screening, hospital isolation and contact tracing are expanding alongside the voyage route.',
  bulletPoints: [
    'Signals point to cross-border contact tracing and multiple secondary exposure investigations.',
    'Most coverage is concentrated around Tenerife, Spain, Ushuaia, Argentina and passengers returning home.',
    'Use the route markers to see where departure, voyage and medical response intersect.',
  ],
};

export const ROUTE_ALERT = {
  title: 'Cruise route alert',
  summary:
    'This route layer is a navigation aid for the featured outbreak. It is not a transmission model and should be read together with official health notices.',
  stops: [
    {
      id: 'ushuaia',
      type: 'departure',
      title: 'Ushuaia, Argentina',
      description: 'Departure and early exposure window for the featured cruise cluster.',
      coordinates: [-54.8019, -68.303],
    },
    {
      id: 'antarctic-peninsula',
      type: 'stopover',
      title: 'Antarctic Peninsula',
      description: 'Voyage segment referenced in multiple reports tied to the cluster timeline.',
      coordinates: [-64.6, -61.0],
    },
    {
      id: 'tenerife',
      type: 'hospital',
      title: 'Tenerife, Spain',
      description: 'Port arrival, isolation and hospital response hub for the current event.',
      coordinates: [28.4636, -16.2518],
    },
  ],
};

export const ENDEMIC_ZONES = [
  {
    id: 'southwest-us',
    name: 'Southwest North America',
    description: 'Rodent-borne hantavirus circulation with repeated HPS reporting in the US Southwest and northern Mexico.',
    coordinates: [
      [28, -124],
      [49, -124],
      [49, -98],
      [28, -98],
    ],
  },
  {
    id: 'southern-cone',
    name: 'Southern Cone',
    description: 'Persistent Andes virus activity across Patagonia and neighboring parts of Chile and Argentina.',
    coordinates: [
      [-56, -76],
      [-25, -76],
      [-25, -55],
      [-56, -55],
    ],
  },
  {
    id: 'central-europe',
    name: 'Central Europe',
    description: 'Puumala and related hantaviruses remain established in parts of Germany, Belgium, France and nearby regions.',
    coordinates: [
      [45, 2],
      [56, 2],
      [56, 17],
      [45, 17],
    ],
  },
  {
    id: 'balkans',
    name: 'Balkans',
    description: 'A long-standing HFRS zone shaped by Dobrava-Belgrade circulation and rural exposure patterns.',
    coordinates: [
      [38, 17],
      [47, 17],
      [47, 29],
      [38, 29],
    ],
  },
  {
    id: 'scandinavia',
    name: 'Scandinavia',
    description: 'Northern Europe remains one of the clearest Puumala reporting zones, especially in Finland and Sweden.',
    coordinates: [
      [57, 4],
      [71, 4],
      [71, 31],
      [57, 31],
    ],
  },
  {
    id: 'east-asia',
    name: 'East Asia',
    description: 'Large HFRS burden persists across northeastern China and the Korean peninsula.',
    coordinates: [
      [28, 104],
      [48, 104],
      [48, 145],
      [28, 145],
    ],
  },
];

export const HISTORICAL_CASES = [
  { id: 'us-four-corners', label: 'US Four Corners', cases: 728, coordinates: [36.998, -109.045] },
  { id: 'california', label: 'California, USA', cases: 105, coordinates: [36.7783, -119.4179] },
  { id: 'texas', label: 'Texas, USA', cases: 73, coordinates: [31.0, -99.0] },
  { id: 'nebraska', label: 'Nebraska, USA', cases: 45, coordinates: [41.5, -99.7] },
  { id: 'arizona', label: 'Arizona, USA', cases: 119, coordinates: [34.2744, -111.6602] },
  { id: 'new-mexico', label: 'New Mexico, USA', cases: 122, coordinates: [34.5199, -105.8701] },
  { id: 'canada-prairies', label: 'Canada Prairies', cases: 28, coordinates: [53.9333, -106.0] },
  { id: 'argentina-patagonia', label: 'Patagonia, Argentina', cases: 162, coordinates: [-44.0, -71.0] },
  { id: 'argentina-buenos-aires', label: 'Buenos Aires Province', cases: 48, coordinates: [-37.2, -59.8] },
  { id: 'chile-biobio', label: 'Bio Bio, Chile', cases: 37, coordinates: [-37.5, -72.4] },
  { id: 'chile-aysen', label: 'Aysen, Chile', cases: 26, coordinates: [-45.4, -72.7] },
  { id: 'bolivia-la-paz', label: 'La Paz, Bolivia', cases: 19, coordinates: [-16.4897, -68.1193] },
  { id: 'paraguay-chaco', label: 'Boqueron, Paraguay', cases: 12, coordinates: [-22.3, -60.7] },
  { id: 'brazil-para', label: 'Para, Brazil', cases: 21, coordinates: [-3.4, -52.2] },
  { id: 'brazil-south', label: 'South Brazil', cases: 33, coordinates: [-27.0, -51.0] },
  { id: 'germany-bavaria', label: 'Bavaria, Germany', cases: 112, coordinates: [48.7904, 11.4979] },
  { id: 'germany-baden', label: 'Baden-Wurttemberg, Germany', cases: 154, coordinates: [48.6616, 9.3501] },
  { id: 'belgium', label: 'Belgium', cases: 8, coordinates: [50.5039, 4.4699] },
  { id: 'france-ardennes', label: 'Ardennes, France', cases: 17, coordinates: [49.76, 4.72] },
  { id: 'netherlands', label: 'Netherlands', cases: 6, coordinates: [52.1326, 5.2913] },
  { id: 'sweden', label: 'Northern Sweden', cases: 244, coordinates: [64.8, 20.3] },
  { id: 'finland', label: 'Finland', cases: 681, coordinates: [64.5, 26.0] },
  { id: 'norway', label: 'Norway', cases: 32, coordinates: [62.8, 10.7] },
  { id: 'slovenia', label: 'Slovenia', cases: 95, coordinates: [46.1512, 14.9955] },
  { id: 'croatia', label: 'Croatia', cases: 47, coordinates: [45.1, 15.2] },
  { id: 'bosnia', label: 'Bosnia and Herzegovina', cases: 26, coordinates: [43.9159, 17.6791] },
  { id: 'serbia', label: 'Serbia', cases: 40, coordinates: [44.0165, 21.0059] },
  { id: 'greece', label: 'Northern Greece', cases: 13, coordinates: [40.6, 23.0] },
  { id: 'turkey-black-sea', label: 'Black Sea Turkey', cases: 28, coordinates: [41.2, 35.3] },
  { id: 'russia-far-east', label: 'Russia Far East', cases: 209, coordinates: [48.4827, 135.0838] },
  { id: 'china-northeast', label: 'Northeast China', cases: 1680, coordinates: [43.8, 125.3] },
  { id: 'south-korea', label: 'South Korea', cases: 412, coordinates: [36.5, 127.9] },
  { id: 'india', label: 'India', cases: 11, coordinates: [20.5937, 78.9629] },
];

export const LOCATION_ALIASES = [
  {
    locationName: 'Tenerife, Spain',
    country: 'Spain',
    coordinates: [28.4636, -16.2518],
    patterns: [/tenerife/i],
  },
  {
    locationName: 'Canary Islands, Spain',
    country: 'Spain',
    coordinates: [28.2916, -16.6291],
    patterns: [/canary islands/i, /canarias/i, /gran canaria/i, /las palmas/i],
  },
  {
    locationName: 'Catalonia, Spain',
    country: 'Spain',
    coordinates: [41.5912, 1.5209],
    patterns: [/catalonia/i, /catalunya/i],
  },
  {
    locationName: 'Barcelona, Spain',
    country: 'Spain',
    coordinates: [41.3874, 2.1686],
    patterns: [/barcelona/i, /clinic hospital/i],
  },
  {
    locationName: 'Mallorca, Spain',
    country: 'Spain',
    coordinates: [39.6953, 3.0176],
    patterns: [/mallorca/i],
  },
  {
    locationName: 'Galicia, Spain',
    country: 'Spain',
    coordinates: [42.5751, -8.1339],
    patterns: [/galicia/i],
  },
  {
    locationName: 'Alicante, Spain',
    country: 'Spain',
    coordinates: [38.3452, -0.481],
    patterns: [/alicante/i],
  },
  {
    locationName: 'Spain',
    country: 'Spain',
    coordinates: [40.4168, -3.7038],
    patterns: [/spain/i, /españa/i],
  },
  {
    locationName: 'Ushuaia, Argentina',
    country: 'Argentina',
    coordinates: [-54.8019, -68.303],
    patterns: [/ushuaia/i],
  },
  {
    locationName: 'Jujuy, Argentina',
    country: 'Argentina',
    coordinates: [-24.1858, -65.2995],
    patterns: [/jujuy/i],
  },
  {
    locationName: 'Salta, Argentina',
    country: 'Argentina',
    coordinates: [-24.7821, -65.4232],
    patterns: [/salta/i],
  },
  {
    locationName: 'Argentina',
    country: 'Argentina',
    coordinates: [-34.6037, -58.3816],
    patterns: [/argentina/i, /epuy[eé]n/i],
  },
  {
    locationName: 'California, USA',
    country: 'United States',
    coordinates: [36.7783, -119.4179],
    patterns: [/california/i],
  },
  {
    locationName: 'Florida, USA',
    country: 'United States',
    coordinates: [27.6648, -81.5158],
    patterns: [/florida/i],
  },
  {
    locationName: 'Texas, USA',
    country: 'United States',
    coordinates: [31.0, -99.0],
    patterns: [/texas/i],
  },
  {
    locationName: 'Nebraska, USA',
    country: 'United States',
    coordinates: [41.4925, -99.9018],
    patterns: [/nebraska/i],
  },
  {
    locationName: 'Arizona, USA',
    country: 'United States',
    coordinates: [34.0489, -111.0937],
    patterns: [/arizona/i, /four corners/i],
  },
  {
    locationName: 'United States',
    country: 'United States',
    coordinates: [38.8951, -77.0364],
    patterns: [/united states/i, /u\.s\./i, /usa/i, /new jersey/i],
  },
  {
    locationName: 'Northern Ireland, UK',
    country: 'United Kingdom',
    coordinates: [54.7877, -6.4923],
    patterns: [/northern ireland/i],
  },
  {
    locationName: 'United Kingdom',
    country: 'United Kingdom',
    coordinates: [55.3781, -3.436],
    patterns: [/united kingdom/i, /britons/i, /uk/i, /britain/i],
  },
  {
    locationName: 'Para, Brazil',
    country: 'Brazil',
    coordinates: [-3.4168, -52.2432],
    patterns: [/para\b/i, /pará/i],
  },
  {
    locationName: 'Brazil',
    country: 'Brazil',
    coordinates: [-14.235, -51.9253],
    patterns: [/brazil/i, /brasil/i],
  },
  {
    locationName: 'India',
    country: 'India',
    coordinates: [20.5937, 78.9629],
    patterns: [/india/i, /delhi/i],
  },
  {
    locationName: 'Germany',
    country: 'Germany',
    coordinates: [51.1657, 10.4515],
    patterns: [/germany/i, /deutschland/i],
  },
  {
    locationName: 'Bavaria, Germany',
    country: 'Germany',
    coordinates: [48.7904, 11.4979],
    patterns: [/bavaria/i],
  },
  {
    locationName: 'Italy',
    country: 'Italy',
    coordinates: [41.8719, 12.5674],
    patterns: [/italy/i],
  },
  {
    locationName: 'Canada',
    country: 'Canada',
    coordinates: [56.1304, -106.3468],
    patterns: [/canada/i],
  },
  {
    locationName: 'Mexico',
    country: 'Mexico',
    coordinates: [23.6345, -102.5528],
    patterns: [/mexico/i],
  },
  {
    locationName: 'Peru',
    country: 'Peru',
    coordinates: [-9.19, -75.0152],
    patterns: [/peru/i],
  },
  {
    locationName: 'Netherlands',
    country: 'Netherlands',
    coordinates: [52.1326, 5.2913],
    patterns: [/netherlands/i, /dutch/i],
  },
  {
    locationName: 'Switzerland',
    country: 'Switzerland',
    coordinates: [46.8182, 8.2275],
    patterns: [/switzerland/i, /swiss/i],
  },
  {
    locationName: 'Austria',
    country: 'Austria',
    coordinates: [47.5162, 14.5501],
    patterns: [/austria/i],
  },
  {
    locationName: 'Chile',
    country: 'Chile',
    coordinates: [-35.6751, -71.543],
    patterns: [/chile/i],
  },
  {
    locationName: 'Aysen, Chile',
    country: 'Chile',
    coordinates: [-45.5752, -72.0662],
    patterns: [/ays[eé]n/i],
  },
  {
    locationName: 'Bio Bio, Chile',
    country: 'Chile',
    coordinates: [-37.4697, -72.3537],
    patterns: [/b[íi]o b[íi]o/i],
  },
  {
    locationName: 'China',
    country: 'China',
    coordinates: [35.8617, 104.1954],
    patterns: [/china/i],
  },
  {
    locationName: 'South Africa',
    country: 'South Africa',
    coordinates: [-30.5595, 22.9375],
    patterns: [/south africa/i, /johannesburg/i],
  },
  {
    locationName: 'Kenya',
    country: 'Kenya',
    coordinates: [-0.0236, 37.9062],
    patterns: [/kenya/i],
  },
  {
    locationName: 'Australia',
    country: 'Australia',
    coordinates: [-25.2744, 133.7751],
    patterns: [/australia/i],
  },
  {
    locationName: 'Indonesia',
    country: 'Indonesia',
    coordinates: [-0.7893, 113.9213],
    patterns: [/indonesia/i],
  },
  {
    locationName: 'Thailand',
    country: 'Thailand',
    coordinates: [15.87, 100.9925],
    patterns: [/thailand/i],
  },
  {
    locationName: 'La Paz, Bolivia',
    country: 'Bolivia',
    coordinates: [-16.4897, -68.1193],
    patterns: [/la paz/i],
  },
  {
    locationName: 'Tarija, Bolivia',
    country: 'Bolivia',
    coordinates: [-21.5355, -64.7296],
    patterns: [/tarija/i],
  },
  {
    locationName: 'Boqueron, Paraguay',
    country: 'Paraguay',
    coordinates: [-22.3, -60.7],
    patterns: [/boquer[oó]n/i, /paraguay/i],
  },
  {
    locationName: 'Antarctic Peninsula',
    country: 'Antarctica',
    coordinates: [-64.6, -61.0],
    patterns: [/antarctic peninsula/i],
  },
  {
    locationName: 'Cape Verde',
    country: 'Cape Verde',
    coordinates: [16.5388, -23.0418],
    patterns: [/cape verde/i],
  },
  {
    locationName: 'Multiple countries',
    country: 'Multiple countries',
    coordinates: [20.0, 10.0],
    patterns: [/multiple countries/i, /across the world/i, /worldwide/i],
  },
];

export const HANTAVIRUS_PAGE = {
  eyebrow: 'Disease overview',
  title: 'What hantavirus means in practice',
  intro:
    'Hantaviruses are rodent-borne viruses that can cause severe human disease. The pattern of illness depends strongly on geography and the strain involved, so context matters as much as the headline.',
  updated: 'Updated May 2026',
  highlights: [
    {
      title: 'HPS',
      description: 'Pulmonary disease seen mainly in the Americas, often marked by a rapid shift from fever and muscle pain to breathing failure.',
    },
    {
      title: 'HFRS',
      description: 'A kidney-focused syndrome described more often in Europe and Asia, with severity ranging from mild to life-threatening.',
    },
  ],
  sections: [
    {
      title: 'Transmission',
      body:
        'Human infection is usually linked to inhaling dust contaminated with rodent urine, droppings or saliva. Direct rodent contact and bites are less common routes. Sustained person-to-person spread is not typical, with Andes virus remaining the main exception documented in South America.',
      bullets: [
        'Cleaning enclosed sheds, barns, cabins and storage rooms is a classic exposure setting.',
        'Risk rises when dry material is swept or vacuumed before being disinfected.',
        'Environmental exposure matters more than age or general health.',
      ],
    },
    {
      title: 'Who is more exposed',
      body:
        'Most reported cases involve people who live, travel or work in rodent habitats. Rural housing, farming, forestry work and backcountry travel all increase the chance of contact with contaminated dust.',
      bullets: [
        'Agricultural and grain-handling workers',
        'Campers, hikers and people reopening seasonal cabins',
        'Pest-control staff and field researchers',
        'Communities facing habitat disruption after floods, drought or land-use change',
      ],
    },
    {
      title: 'Prevention',
      body:
        'There is no broadly available curative antiviral treatment, so prevention is environmental: limit rodent access, ventilate closed spaces and clean contaminated material wet, never dry.',
      bullets: [
        'Seal openings larger than about 6 mm around utility penetrations and foundations.',
        'Store food, pet food and bedding in rodent-proof containers.',
        'Ventilate closed spaces before cleanup, then disinfect before handling debris.',
        'Wear gloves and a well-fitted respirator when risk is elevated.',
      ],
    },
    {
      title: 'Testing and treatment',
      body:
        'Diagnosis usually combines exposure history, clinical suspicion and laboratory confirmation with serology or PCR. Early supportive care matters: oxygen and intensive monitoring for HPS, and fluid or kidney support for HFRS.',
    },
    {
      title: 'Vaccine status',
      body:
        'No vaccine is routinely available in the United States or the European Union. Inactivated vaccines are used in limited settings in parts of Asia, while broader vaccine programs remain in development.',
    },
  ],
};

export const SYMPTOMS_PAGE = {
  eyebrow: 'Clinical guide',
  title: 'Symptoms timeline and escalation points',
  intro:
    'Early hantavirus illness can look deceptively ordinary. The important pattern is what happens after a known rodent exposure: fever and body pain first, then sudden lung or kidney failure depending on the syndrome.',
  updated: 'Updated May 2026',
  warning:
    'Shortness of breath, rapidly worsening pulse, severe back pain, low blood pressure or dropping urine output after rodent exposure needs urgent medical assessment.',
  timelines: [
    {
      title: 'Incubation',
      subtitle: 'Usually 1 to 8 weeks',
      body:
        'Most people who become ill do so within 2 to 4 weeks of exposure. That delay is why clinicians may miss the rodent link unless it is mentioned explicitly.',
    },
    {
      title: 'HPS progression',
      subtitle: 'Early phase to cardiopulmonary collapse',
      body:
        'Fever, intense muscle aches, headache and stomach symptoms often come first. Breathing difficulty can follow quickly once fluid begins to accumulate in the lungs.',
      bullets: [
        'Days 1-5: fever, fatigue, myalgia, headache, nausea, diarrhea or abdominal pain',
        'Days 4-10: cough, fast breathing, falling oxygen and need for hospital care',
        'Recovery may take weeks to months even after discharge',
      ],
    },
    {
      title: 'HFRS progression',
      subtitle: 'Fever to kidney injury',
      body:
        'The kidney-focused syndrome often begins with sudden fever, flushing, headache and back pain, then may progress through low blood pressure, reduced urine output and bleeding signs in more severe cases.',
      bullets: [
        'Febrile phase: chills, fever, blurred vision, rash or facial flushing',
        'Hypotensive phase: blood pressure can fall abruptly and shock may develop',
        'Oliguric phase: kidney failure and bleeding risk rise as urine output drops',
        'Recovery extends over weeks and sometimes months',
      ],
    },
  ],
  diagnosis:
    'Laboratory testing usually relies on antibodies or PCR rather than a rapid point-of-care test. Mentioning rodent exposure helps clinicians order the right workup sooner.',
};

export const ABOUT_PAGE = {
  eyebrow: 'Method',
  title: 'How the tracker is put together',
  intro:
    'HantaWatch combines automated signal collection with a map-first reading experience. The goal is transparency: show what is known, show what is uncertain, and link people back to the underlying sources.',
  steps: [
    {
      step: 'Collect',
      title: 'Public feeds are monitored continuously',
      description: 'Outbreak reports, surveillance summaries and news monitoring are pulled into a single working stream.',
    },
    {
      step: 'Resolve',
      title: 'Locations and story types are inferred',
      description: 'Signals are grouped by place, tagged as local, imported or response-led, and surfaced on the map.',
    },
    {
      step: 'Review',
      title: 'The interface favors clarity over false precision',
      description: 'Historical context, outbreak route notes and source links stay visible so readers can judge the signal quality for themselves.',
    },
  ],
  layers: [
    'Endemic zones show where hantaviruses are known to circulate over longer periods.',
    'Historical circles summarize published case burden by region.',
    'Active pins represent recent signal volume rather than confirmed case counts.',
  ],
  sources: [
    'WHO Disease Outbreak News and national public-health bulletins',
    'CDC, ECDC and PAHO reporting',
    'News monitoring used as supplemental intelligence, never as sole authority',
  ],
  limitations: [
    'Public surveillance often lags real events by days or weeks.',
    'Many reports do not provide exact coordinates, so some locations remain approximate.',
    'National endemic polygons simplify a reality that is much more local and ecological.',
  ],
};

export const FAQ_ITEMS = [
  {
    question: 'Can hantavirus spread from one person to another?',
    answer:
      'In most settings, no. The best documented exception is Andes virus in parts of South America, where limited person-to-person transmission has been described.',
  },
  {
    question: 'How dangerous is it?',
    answer:
      'Severity depends on the strain and how quickly medical care begins. HPS can become critical very fast because of lung involvement, while HFRS ranges from mild disease to shock and kidney failure.',
  },
  {
    question: 'When do symptoms usually start?',
    answer:
      'A delay of 1 to 8 weeks is typical after exposure, with many cases emerging within 2 to 4 weeks.',
  },
  {
    question: 'Is there a vaccine?',
    answer:
      'Not one that is routinely available across the US or EU. Some inactivated vaccines are used in selected Asian settings, but wide access remains limited.',
  },
  {
    question: 'What is the safest way to clean rodent droppings?',
    answer:
      'Ventilate first, wet the material with disinfectant, then remove it with gloves. Avoid dry sweeping or vacuuming because that can aerosolize contaminated dust.',
  },
  {
    question: 'Why do the pins represent signals instead of confirmed cases?',
    answer:
      'The live layer tracks reporting intensity. Many updates describe policy response, contact tracing or suspected cases before a formal case count is published.',
  },
  {
    question: 'How fresh is the data here?',
    answer:
      'The outbreak feed refreshes automatically from the local dataset every 30 minutes. The historical and endemic layers are slower-moving context layers.',
  },
];

export const CONTACT_PAGE = {
  eyebrow: 'Corrections and feedback',
  title: 'Contact the project',
  intro:
    'Use the project channels for data corrections, press requests, feature feedback or general questions about how the tracker works.',
  email: 'valentinaschiavon99@gmail.com',
  bullets: [
    'Report a missing location or a misleading grouping',
    'Send a better primary source for an item already in the feed',
    'Ask about collaboration, embeds or data exports',
  ],
  disclaimer:
    'This tracker is informational and cannot provide personal medical advice. For symptoms, diagnosis or treatment, contact a clinician or emergency service in your region.',
};

export const SUPPORT_LINKS = {
  github: 'https://github.com/valentinaschiavon99',
  telegram: 'https://t.me/hantavirus_watch_bot',
  support: 'https://ko-fi.com/hantaviruswatch',
  shareText: 'Track hantavirus signals worldwide with HantaWatch.',
};