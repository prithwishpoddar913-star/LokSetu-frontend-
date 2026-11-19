export interface Destination {
  id: string;
  name: string;
  state: 'West Bengal' | 'Bihar' | 'Jharkhand';
  district: string;
  category: 'Heritage' | 'Nature' | 'Spiritual' | 'Cultural' | 'Wildlife';
  description: string;
  historicalBackground: string;
  culturalSignificance: string;
  interestingFacts: string[];
  nearbyAttractions: string[];
  localHandicrafts: string[];
  travelInfo: {
    nearestRailway: string;
    nearestAirport: string;
    bestTimeToVisit: string;
  };
  relatedStampIds: string[];
  image: string;
  heroImage: string;
  tags: string[];
}

// ================= AUTO-LOAD IMAGES FROM src/assets =================
// src/assets e photo er naam destination er id ba naam er moto dile
// (jemon kolkata.jpeg, darjeeling.jpeg, bishnupur.jpg, sundarbans.png,
//  shantiniketan.jpeg, murshidabad.jpeg, nalanda.jpeg, bodh-gaya.jpeg,
//  rajgir.jpeg, madhubani.jpeg, vaishali.jpeg, patna.jpeg, netarhat.jpeg,
//  betla.jpeg, deoghar.jpeg, hundru-falls.jpeg, dassam-falls.jpeg, ranchi.jpeg)
// oi photo automatic boshbe. Match na hole ager Unsplash link fallback thakbe.
// Capital/small letter, space, dash, underscore matter korbe na.
const assetImages = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const localImages: Record<string, string> = {};
for (const [path, url] of Object.entries(assetImages)) {
  const file = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  localImages[normalize(file)] = url;
}

const pickImage = (d: { id: string; name: string }, fallback: string): string =>
  localImages[normalize(d.id)] ?? localImages[normalize(d.name)] ?? fallback;

const rawDestinations: Destination[] = [
  // ============ WEST BENGAL ============
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    district: 'Kolkata',
    category: 'Heritage',
    description: 'The City of Joy, former capital of British India, known for its colonial architecture, vibrant culture, and intellectual legacy.',
    historicalBackground: 'Kolkata (formerly Calcutta) was founded by the English East India Company in the late 17th century and served as the capital of British India until 1911. The city was the epicenter of the Bengal Renaissance and Indian independence movement. The iconic Howrah Bridge, completed in 1943, connects Kolkata to Howrah across the Hooghly River and remains one of the world\'s busiest cantilever bridges, carrying over 100,000 vehicles and countless pedestrians daily.',
    culturalSignificance: 'Kolkata is the cultural capital of India, home to Nobel laureates Rabindranath Tagore and Mother Teresa. The city is renowned for its Durga Puja celebrations — a UNESCO-recognized Intangible Cultural Heritage — where thousands of elaborately decorated pandals transform the city into an open-air art exhibition. Victoria Memorial stands as one of the finest examples of Indo-Saracenic architecture.',
    interestingFacts: [
      'The Howrah Bridge uses no nuts or bolts — it is entirely held together by rivets',
      'Kolkata has the only hand-pulled rickshaws still operating in India',
      'Victoria Memorial houses over 25,000 artifacts including paintings and sculptures',
      'The city hosts the oldest tram network in Asia, operational since 1873',
      'Kolkata\'s Rabindra Sarobar is one of the largest artificial lakes in India',
    ],
    nearbyAttractions: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Temple', 'Belur Math', 'Indian Museum'],
    localHandicrafts: ['Kantha embroidery', 'Terracotta work', 'Baluchari sarees', 'Dokra metal craft', 'Shola craft'],
    travelInfo: {
      nearestRailway: 'Howrah Station / Sealdah Station',
      nearestAirport: 'Netaji Subhas Chandra Bose International Airport (CCU)',
      bestTimeToVisit: 'October to February (pleasant weather; Durga Puja in October)',
    },
    relatedStampIds: ['wb-howrah-bridge', 'wb-victoria-memorial', 'wb-durga-puja'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
    tags: ['colonial', 'architecture', 'culture', 'bridge', 'city'],
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    district: 'Darjeeling',
    category: 'Nature',
    description: 'The Queen of Hills, famous for its tea gardens, Darjeeling Himalayan Railway, and stunning views of Kangchenjunga.',
    historicalBackground: 'Darjeeling was a small hill station leased to the British East India Company in 1835 from the Kingdom of Sikkim. The British developed it as a sanatorium and later as a major hill resort. The Darjeeling Himalayan Railway, popularly known as the "Toy Train," was constructed between 1879 and 1881 and was declared a UNESCO World Heritage Site in 1999. Tea cultivation began in the 1840s when the British introduced Camellia sinensis plants from China.',
    culturalSignificance: 'Darjeeling is a melting pot of Nepali, Tibetan, Lepcha, and Bengali cultures. The region is home to some of the world\'s finest tea estates producing the legendary "Champagne of Teas." Tiger Hill offers one of the most spectacular sunrise views over Kangchenjunga, the world\'s third-highest mountain. The town has been a center of Gorkha cultural identity.',
    interestingFacts: [
      'Darjeeling tea is a GI-tagged product and one of India\'s most valuable exports',
      'The Toy Train climbs from 73m to 2,203m over just 88 kilometers',
      'Tiger Hill at 2,590m offers views of Mt. Everest on clear days',
      'The Himalayan Zoological Park is home to endangered Red Pandas',
      'Darjeeling has over 87 tea estates covering more than 17,000 hectares',
    ],
    nearbyAttractions: ['Tiger Hill', 'Batasia Loop', 'Peace Pagoda', 'Ghoom Monastery', 'Mirik Lake'],
    localHandicrafts: ['Thanka paintings', 'Handmade carpets', 'Wooden toys', 'Tibetan handicrafts', 'Tea souvenirs'],
    travelInfo: {
      nearestRailway: 'New Jalpaiguri (NJP) Station (88 km away)',
      nearestAirport: 'Bagdogra Airport (BGP) — 90 km away',
      bestTimeToVisit: 'March to May and October to December',
    },
    relatedStampIds: ['wb-toy-train', 'wb-darjeeling-tea', 'wb-kangchenjunga'],
    image: 'https://images.unsplash.com/photo-1544568100-847a19cae382?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1544568100-847a19cae382?w=1600&q=80',
    tags: ['hill station', 'tea', 'railway', 'himalaya', 'nature'],
  },
  {
    id: 'bishnupur',
    name: 'Bishnupur',
    state: 'West Bengal',
    district: 'Bankura',
    category: 'Heritage',
    description: 'A medieval temple town famous for its exquisite terracotta temples, Baluchari silk sarees, and classical music tradition.',
    historicalBackground: 'Bishnupur was the capital of the Malla dynasty, which ruled the region from the 7th to 19th century. The Malla kings were great patrons of art, music, and temple architecture. Between the 17th and 18th centuries, they built a series of magnificent temples using terracotta bricks — a technique born of necessity since stone was scarce in the region. The temples are adorned with intricate panels depicting scenes from the Ramayana, Mahabharata, and the life of Krishna.',
    culturalSignificance: 'Bishnupur gave birth to the Bishnupur Gharana of classical music, one of the most renowned Hindustani classical music traditions. The terracotta temples — including Rasmancha (1600 CE), Jor Bangla (1655 CE), and Shyam Rai Temple — are masterpieces of Bengali architecture. Baluchari silk sarees woven here feature elaborate pallus depicting mythological stories and are prized across India.',
    interestingFacts: [
      'The Rasmancha temple (1600 CE) is the oldest terracotta structure in West Bengal',
      'Bishnupur\'s Dalmadal cannon is a 400-year-old cannon weighing 3.5 tonnes',
      'The terracotta work here uses locally sourced clay from the red-soil region',
      'Bishnupur Gharana\'s music style blends Dhrupad with folk forms',
      'Baluchari silk takes 2–3 weeks per saree to weave on traditional handlooms',
    ],
    nearbyAttractions: ['Rasmancha', 'Jor Bangla Temple', 'Shyam Rai Temple', 'Dalmadal Cannon', 'Mrinmoyee Temple'],
    localHandicrafts: ['Terracotta idols', 'Baluchari sarees', 'Bankura horses', 'Conch shell crafts', 'Dhokra metal art'],
    travelInfo: {
      nearestRailway: 'Bishnupur Railway Station (direct trains from Kolkata)',
      nearestAirport: 'Netaji Subhas Chandra Bose International Airport (CCU) — 150 km',
      bestTimeToVisit: 'October to March',
    },
    relatedStampIds: ['wb-terracotta-temples', 'wb-bishnupur', 'wb-baluchari'],
    image: 'https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=1600&q=80',
    tags: ['temples', 'terracotta', 'heritage', 'silk', 'medieval'],
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    state: 'West Bengal',
    district: 'South 24 Parganas',
    category: 'Wildlife',
    description: 'The world\'s largest mangrove delta, a UNESCO World Heritage Site and home to the Royal Bengal Tiger.',
    historicalBackground: 'The Sundarbans, meaning "beautiful forest," form the largest tidal halophytic mangrove forest in the world, spanning Bangladesh and India. The Indian portion became a Tiger Reserve in 1973, a National Park in 1984, and a UNESCO World Heritage Site in 1987. The delta is formed by the confluence of the Ganges, Brahmaputra, and Meghna rivers. Historical records mention human settlement in the region as early as the 13th century.',
    culturalSignificance: 'The Sundarbans is deeply woven into Bengali folklore through stories of Bonbibi — the forest goddess who protects honey collectors and fishermen from tigers. Local communities maintain a unique coexistence with nature. The Royal Bengal Tiger here has adapted to swimming long distances in saline water, making Sundarbans tigers uniquely dangerous compared to their counterparts elsewhere.',
    interestingFacts: [
      'The Sundarbans has the highest density of tigers in the world',
      'Tigers here swim up to 15 km between islands',
      'The mangrove roots create a unique breathing system called pneumatophores',
      'Over 400 species of birds including the rare Masked Finfoot are found here',
      'Honey from Sundarbans (Mohubon) is famous for its medicinal properties',
    ],
    nearbyAttractions: ['Sajnekhali Wildlife Sanctuary', 'Sudhanyakhali Watch Tower', 'Bonnie Camp', 'Bali Island', 'Henry Island'],
    localHandicrafts: ['Honey products', 'Fishing nets', 'Bamboo crafts', 'Crabs and shrimp products (food souvenirs)'],
    travelInfo: {
      nearestRailway: 'Canning Railway Station (entry point for boats)',
      nearestAirport: 'Netaji Subhas Chandra Bose International Airport (CCU) — 90 km',
      bestTimeToVisit: 'November to February (cool and dry season)',
    },
    relatedStampIds: ['wb-royal-bengal-tiger', 'wb-sundarbans', 'wb-mangrove'],
    image: 'https://images.unsplash.com/photo-1591017403288-9e8d6a99c0e3?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1591017403288-9e8d6a99c0e3?w=1600&q=80',
    tags: ['wildlife', 'tiger', 'mangrove', 'UNESCO', 'delta'],
  },
  {
    id: 'shantiniketan',
    name: 'Shantiniketan',
    state: 'West Bengal',
    district: 'Birbhum',
    category: 'Cultural',
    description: 'Rabindranath Tagore\'s abode of peace — a UNESCO World Heritage Site and center of Bengali arts and literature.',
    historicalBackground: 'Shantiniketan (Abode of Peace) was established by Maharshi Debendranath Tagore in 1863 as a place of retreat and meditation. His son, Nobel laureate Rabindranath Tagore, transformed it into a unique open-air school Patha Bhavana in 1901, and later founded Visva-Bharati University in 1921. Tagore\'s educational philosophy emphasized learning in nature, connecting students with their environment and Indian cultural traditions. UNESCO inscribed Shantiniketan as a World Heritage Site in 2023.',
    culturalSignificance: 'Shantiniketan is the soul of the Bengal Renaissance. It is where Tagore wrote some of his greatest works, composed Rabindra Sangeet, developed the Rabindranath dance form, and where artists like Nandalal Bose revolutionized Indian art. The Poush Mela (December fair) and Basanta Utsav (Holi celebration) here are legendary cultural festivals attracting visitors from across the world.',
    interestingFacts: [
      'Visva-Bharati University was established before India gained independence',
      'The Uttarayan complex where Tagore lived has been preserved as a museum',
      'Tagore composed India\'s national anthem "Jana Gana Mana" here',
      'The Sangit Bhavana here is one of India\'s leading music institutions',
      'Shantiniketan artisans are famous for batik printing and leather crafts',
    ],
    nearbyAttractions: ['Visva-Bharati University', 'Rabindra Bhavana Museum', 'Khoai Laterite Landscape', 'Sriniketan', 'Poush Mela Grounds'],
    localHandicrafts: ['Batik fabrics', 'Leather goods', 'Kantha stitch', 'Baul music instruments', 'Folk art paintings'],
    travelInfo: {
      nearestRailway: 'Bolpur-Shantiniketan Station (2 km from campus)',
      nearestAirport: 'Netaji Subhas Chandra Bose International Airport (CCU) — 160 km',
      bestTimeToVisit: 'October to March; December for Poush Mela',
    },
    relatedStampIds: ['wb-tagore', 'wb-shantiniketan', 'wb-visva-bharati'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
    tags: ['tagore', 'university', 'arts', 'culture', 'UNESCO'],
  },
  {
    id: 'murshidabad',
    name: 'Murshidabad',
    state: 'West Bengal',
    district: 'Murshidabad',
    category: 'Heritage',
    description: 'The former capital of the Nawabs of Bengal, home to the magnificent Hazarduari Palace and rich Mughal heritage.',
    historicalBackground: 'Murshidabad was established as the capital of Bengal by Nawab Murshid Quli Khan in the early 18th century. It became one of the most prosperous cities in the world, described by European travelers as a city rivaling London in size and trade. The Battle of Plassey (1757), fought nearby, marked the beginning of British colonial rule in India. Nawab Siraj ud-Daulah, the last independent Nawab, was defeated here by Robert Clive.',
    culturalSignificance: 'Murshidabad represents a unique blend of Mughal and British colonial influences. The Hazarduari Palace (Palace of a Thousand Doors), built in 1837, houses 1,000 doors (900 real, 100 false) and an extraordinary collection of Nawabi art and weapons. The city is famous for Murshidabad silk — once considered among the finest in the world — and is an important center of Bengali Muslim culture.',
    interestingFacts: [
      'Hazarduari has 1,000 doors — 100 of which are false doors to confuse intruders',
      'The palace contains Napoleon Bonaparte\'s personal coach',
      'Murshidabad silk was once exported to European royalty',
      'The city has 200+ heritage structures and monuments',
      'The Imambara here is one of the finest in eastern India',
    ],
    nearbyAttractions: ['Hazarduari Palace', 'Katra Mosque', 'Nashipur Palace', 'Plassey Battlefield', 'Khosh Bagh (Garden of Bliss)'],
    localHandicrafts: ['Murshidabad silk sarees', 'Ivory crafts', 'Bell metal work', 'Zardozi embroidery', 'Terracotta'],
    travelInfo: {
      nearestRailway: 'Berhampore Court Railway Station / Murshidabad Station',
      nearestAirport: 'Netaji Subhas Chandra Bose International Airport (CCU) — 240 km',
      bestTimeToVisit: 'October to March',
    },
    relatedStampIds: ['wb-nawab', 'wb-hazarduari', 'wb-plassey'],
    image: 'https://images.unsplash.com/photo-1584697964154-3a05b5b0e16a?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1584697964154-3a05b5b0e16a?w=1600&q=80',
    tags: ['nawab', 'palace', 'mughal', 'silk', 'heritage'],
  },

  // ============ BIHAR ============
  {
    id: 'nalanda',
    name: 'Nalanda',
    state: 'Bihar',
    district: 'Nalanda',
    category: 'Heritage',
    description: 'Site of the ancient Nalanda University, one of the greatest seats of learning in the ancient world.',
    historicalBackground: 'Nalanda was home to the most celebrated university of the ancient world, flourishing from the 5th to 12th century CE. At its peak, Nalanda housed over 10,000 students and 2,000 teachers from across Asia. It had extensive libraries called Dharmaganja — including the Ratnasagara (Ocean of Jewels), Ratnadadhi (Sea of Jewels), and Ratnaranjaka. The Chinese scholar Xuanzang spent 15 years here in the 7th century. The university was destroyed by Bakhtiyar Khilji\'s forces around 1193 CE, an event that symbolizes one of history\'s greatest losses of knowledge.',
    culturalSignificance: 'Nalanda represents India\'s ancient tradition of knowledge and scholastic excellence. The ruins, now a UNESCO World Heritage Site (2016), include monasteries, temples, and lecture halls spanning 14 hectares. Modern Nalanda University was revived nearby in 2014 as a tribute to this legacy. The site is sacred to Buddhists, Jains, and Hindus alike.',
    interestingFacts: [
      'Nalanda\'s library reportedly burned for 3 months when set on fire',
      'Students came from Korea, Japan, China, Tibet, Mongolia, and Southeast Asia',
      'The site covers 14 hectares but the original campus was thought to be much larger',
      'Xuanzang\'s accounts remain the most detailed historical records of ancient India',
      'Nalanda had specialization in logic, grammar, astronomy, and medicine',
    ],
    nearbyAttractions: ['Nalanda Archaeological Museum', 'Xuanzang Memorial Hall', 'Surya Mandir (Deo Sun Temple)', 'Silao (famous for Khaja sweets)', 'Pawapuri Jain Temple'],
    localHandicrafts: ['Stone carvings', 'Sikki grass work', 'Madhubani paintings', 'Brass statues (Buddhist)', 'Terracotta figurines'],
    travelInfo: {
      nearestRailway: 'Nalanda Railway Station / Bihar Sharif Station (13 km)',
      nearestAirport: 'Patna Airport (JAY) — 95 km',
      bestTimeToVisit: 'October to March',
    },
    relatedStampIds: ['bh-nalanda', 'bh-ancient-university', 'bh-buddhism'],
    image: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=1600&q=80',
    tags: ['ancient', 'university', 'UNESCO', 'buddhism', 'ruins'],
  },
  {
    id: 'bodh-gaya',
    name: 'Bodh Gaya',
    state: 'Bihar',
    district: 'Gaya',
    category: 'Spiritual',
    description: 'The holiest site in Buddhism — where Siddhartha Gautama attained enlightenment under the Bodhi Tree.',
    historicalBackground: 'Bodh Gaya is considered the most important pilgrimage site in Buddhism. It is here that Siddhartha Gautama sat in meditation under a Ficus religiosa tree (Bodhi Tree) and attained enlightenment around 528 BCE, becoming the Buddha. The Mahabodhi Temple, built over the original Bodhi Tree site, was first constructed by Emperor Ashoka in the 3rd century BCE. The current structure dates to the 5th–6th century CE and was inscribed as a UNESCO World Heritage Site in 2002.',
    culturalSignificance: 'Bodh Gaya attracts millions of Buddhist pilgrims annually from Thailand, Japan, Myanmar, Sri Lanka, Tibet, Bhutan, and Korea. The site has monasteries from virtually every Buddhist-majority nation. The Mahabodhi Temple complex houses a descendant of the original Bodhi Tree. The 25-meter statue of the Great Buddha is one of the tallest Buddha statues in India.',
    interestingFacts: [
      'The Bodhi Tree is a direct descendant of the tree under which Buddha meditated',
      'The Mahabodhi Temple spire reaches 55 meters into the sky',
      'Bodh Gaya hosts temples from 14+ Buddhist nations',
      'Emperor Ashoka built the first temple here in 250 BCE',
      'The Diamond Throne (Vajrasana) marks the exact spot of enlightenment',
    ],
    nearbyAttractions: ['Mahabodhi Temple', 'Bodhi Tree', 'Royal Bhutan Monastery', 'Thai Monastery', 'Dungeshwari Cave Temples'],
    localHandicrafts: ['Buddhist thangka paintings', 'Stone Buddha sculptures', 'Prayer wheels', 'Incense sticks', 'Bodhi leaf products'],
    travelInfo: {
      nearestRailway: 'Gaya Junction (16 km from Bodh Gaya)',
      nearestAirport: 'Gaya International Airport (GAY) — 17 km',
      bestTimeToVisit: 'October to March; Buddha Purnima (May) is especially sacred',
    },
    relatedStampIds: ['bh-bodh-gaya', 'bh-mahabodhi-temple', 'bh-buddha'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80',
    tags: ['buddhism', 'spiritual', 'UNESCO', 'pilgrimage', 'temple'],
  },
  {
    id: 'rajgir',
    name: 'Rajgir',
    state: 'Bihar',
    district: 'Nalanda',
    category: 'Spiritual',
    description: 'An ancient city of spiritual significance — first capital of Magadha Empire with hot springs and Buddhist heritage.',
    historicalBackground: 'Rajgir (Royal Abode) was the first capital of the Magadha Empire, one of the most powerful kingdoms of ancient India. The city has strong associations with both Buddhism and Jainism. It was here that Lord Buddha spent several years meditating and teaching, and Lord Mahavira also spent significant time in the city. The First Buddhist Council was held in the Saptaparni Cave near Rajgir after Buddha\'s death. King Bimbisara and his son Ajatashatru were the most famous rulers.',
    culturalSignificance: 'Rajgir is a convergence point of three great world religions — Hinduism, Buddhism, and Jainism. The Gridhakuta Hill (Vulture\'s Peak) is where Buddha delivered many of his most important sermons. The Vishwa Shanti Stupa (World Peace Pagoda), built by Japanese Buddhists, offers panoramic views. The natural hot springs here — Brahma Kund — are believed to have medicinal properties and are visited by thousands daily.',
    interestingFacts: [
      'Rajgir has cyclopean walls — stone walls built without mortar, up to 40 km long',
      'The hot springs maintain a consistent temperature of 45°C year-round',
      'Lord Buddha delivered the Lotus Sutra at Gridhakuta Hill',
      'The Saptaparni Cave hosted the First Buddhist Council (483 BCE)',
      'Rajgir features India\'s first ropeway built in modern times (1969)',
    ],
    nearbyAttractions: ['Vishwa Shanti Stupa', 'Gridhakuta Hill', 'Brahma Kund Hot Springs', 'Venu Vana', 'Son Bhandar Caves'],
    localHandicrafts: ['Sikki grass crafts', 'Stone Buddhist sculptures', 'Mineral water products', 'Local weaving'],
    travelInfo: {
      nearestRailway: 'Rajgir Railway Station (direct trains from Patna)',
      nearestAirport: 'Patna Airport (JAY) — 110 km; Gaya Airport (GAY) — 78 km',
      bestTimeToVisit: 'October to March; Rajgir Mahotsav (October) is special',
    },
    relatedStampIds: ['bh-rajgir', 'bh-magadha', 'bh-hot-springs'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80',
    tags: ['ancient', 'hot springs', 'buddhism', 'magadha', 'spiritual'],
  },
  {
    id: 'madhubani',
    name: 'Madhubani',
    state: 'Bihar',
    district: 'Madhubani',
    category: 'Cultural',
    description: 'Birthplace of the world-famous Madhubani (Mithila) painting tradition — a living art form practiced by village women.',
    historicalBackground: 'Madhubani painting (also called Mithila painting) has been practiced in the Mithila region of Bihar for millennia. Traditionally painted by women on the walls and floors of homes during festivals and rites of passage, the art gained international recognition after a drought in 1934 led an Indian civil servant to encourage women to paint on paper to earn income. The 2003 earthquake revived international interest in this ancient form. Madhubani art is now a GI-tagged product of India.',
    culturalSignificance: 'Madhubani paintings are characterized by complex geometrical patterns and depictions of Hindu gods, mythology, nature, and social events. Each region of Mithila has its own distinct style — Bharni, Kachni, Tantrik, Godna, and Kohbar. The art form uses natural dyes and pigments, with charcoal and turmeric among the base colors. Artists like Sita Devi and Jagdamba Devi elevated the art to global recognition.',
    interestingFacts: [
      'Madhubani painting was given GI Geographical Indication status in 2007',
      'Indian Railways painted entire trains in Madhubani style (2016)',
      'Natural colors like turmeric, pollen, leaves, and indigo are traditionally used',
      'Each painting tells a complete story from Hindu mythology',
      'Madhubani artists have won multiple national and international awards',
    ],
    nearbyAttractions: ['Kapileshwar Sthan', 'Uchaitha Temple', 'Saurath Sabha Ground', 'Janak Mandir (Sitamarhi)', 'Darbhanga Royal Palace'],
    localHandicrafts: ['Madhubani paintings', 'Sikki grass baskets', 'Manjusha art boxes', 'Sujni embroidery', 'Pag (traditional headwear)'],
    travelInfo: {
      nearestRailway: 'Madhubani Railway Station (connected to Darbhanga and Patna)',
      nearestAirport: 'Darbhanga Airport (DBR) — 60 km; Patna Airport (JAY) — 190 km',
      bestTimeToVisit: 'October to March',
    },
    relatedStampIds: ['bh-madhubani-art', 'bh-mithila', 'bh-folk-art'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
    tags: ['art', 'folk painting', 'mithila', 'culture', 'GI tag'],
  },
  {
    id: 'vaishali',
    name: 'Vaishali',
    state: 'Bihar',
    district: 'Vaishali',
    category: 'Heritage',
    description: 'One of the world\'s first democratic republics — birthplace of Lord Mahavira and an important Buddhist site.',
    historicalBackground: 'Vaishali is considered one of the world\'s earliest examples of a republican form of government, as the Vajjian Confederacy that ruled here in the 6th century BCE is considered one of the first republics in history. It was the birthplace of Lord Mahavira, the 24th Tirthankara of Jainism, in 599 BCE. Lord Buddha visited Vaishali several times and delivered important teachings here. It was in Vaishali that Buddha announced his approaching Mahaparinirvana (death).',
    culturalSignificance: 'Vaishali has profound significance for both Jainism and Buddhism. The Ashoka Pillar here is one of the finest examples of Mauryan engineering — a single sandstone column topped with a lion capital that still stands after 2,300 years. The Abhishek Pushkarini (Coronation Tank) was used to anoint Licchavi rulers. The site also contains a stupa believed to hold one of the eight portions of the Buddha\'s relics.',
    interestingFacts: [
      'The Vaishali republic is considered one of the earliest democracies (600 BCE)',
      'Lord Mahavira was born in Vaishali (599 BCE)',
      'The Ashoka Pillar at Vaishali is 18.3 meters tall, made of a single sandstone block',
      'Buddha delivered his last sermon here before attaining Parinirvana',
      'The site has remained continuously inhabited for over 2,500 years',
    ],
    nearbyAttractions: ['Ashoka Pillar', 'Abhishek Pushkarini', 'World Peace Pagoda', 'Buddha Relic Stupa', 'Vaishali Museum'],
    localHandicrafts: ['Wheat straw art', 'Bamboo baskets', 'Silk weaving', 'Stone carvings', 'Litti-chokha (food souvenir)'],
    travelInfo: {
      nearestRailway: 'Hajipur Junction (35 km) / Patna Junction (55 km)',
      nearestAirport: 'Patna Airport (JAY) — 55 km',
      bestTimeToVisit: 'October to March; Vaishali Mahotsav (April)',
    },
    relatedStampIds: ['bh-vaishali', 'bh-mahavira', 'bh-ashoka-pillar'],
    image: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=1600&q=80',
    tags: ['ancient', 'republic', 'jainism', 'buddhism', 'ashoka'],
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    district: 'Patna',
    category: 'Heritage',
    description: 'Bihar\'s capital, ancient Pataliputra — once the seat of the Maurya and Gupta empires.',
    historicalBackground: 'Patna, known in antiquity as Pataliputra, was founded by the Magadha king Ajatashatru around 490 BCE. It became the capital of the Maurya Empire under Chandragupta Maurya and his grandson Ashoka the Great. At its peak, Pataliputra was one of the largest cities in the world with a population of over 400,000. The Greek envoy Megasthenes described it as an extraordinary city. The Golghar granary was built in 1786 by Captain John Garstin for the British Army.',
    culturalSignificance: 'Patna is a major center of Sikh pilgrimage as the birthplace of Guru Gobind Singh, the tenth Sikh Guru. The Patna Sahib Gurudwara is one of the five Takhts (seats of temporal authority) in Sikhism. The Patna Museum houses an extraordinary collection of Mauryan and Gupta artifacts including the Didarganj Yakshi — a stunning 3rd century BCE polished stone sculpture.',
    interestingFacts: [
      'Patna is one of the oldest continuously inhabited cities in the world (600+ BCE)',
      'Golghar\'s double staircase has an unusual design — you go up one side, down the other',
      'Patna Museum has the largest collection of Mauryan stone pillars',
      'The city sits on the Ganges and faces floods periodically',
      'Guru Gobind Singh was born in Patna Sahib in 1666',
    ],
    nearbyAttractions: ['Golghar', 'Patna Museum', 'Patna Sahib Gurudwara', 'Agam Kuan', 'Mahavir Mandir'],
    localHandicrafts: ['Tikuli art', 'Manjusha craft', 'Jute products', 'Lacquerware', 'Sujni embroidery'],
    travelInfo: {
      nearestRailway: 'Patna Junction (central station)',
      nearestAirport: 'Patna Airport (JAY) — 5 km from city center',
      bestTimeToVisit: 'October to March; Chhath Puja (October/November)',
    },
    relatedStampIds: ['bh-patna', 'bh-maurya-empire', 'bh-golghar'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
    tags: ['ancient', 'capital', 'maurya', 'gupta', 'museum'],
  },

  // ============ JHARKHAND ============
  {
    id: 'netarhat',
    name: 'Netarhat',
    state: 'Jharkhand',
    district: 'Latehar',
    category: 'Nature',
    description: 'The Queen of Chotanagpur plateau — a pristine hill station known for spectacular sunrises and sunsets.',
    historicalBackground: 'Netarhat is located at an altitude of about 3,700 feet on the Chotanagpur Plateau. During British rule, it was developed as a hill resort and is home to the famous Netarhat Residential School, established in 1954 — considered one of India\'s finest residential schools, often called the Eton of India. The region has historically been home to Munda, Oraon, and other Adivasi communities whose traditions continue to shape local culture.',
    culturalSignificance: 'Netarhat is known for being surrounded by dense Sal forests and offering some of the most spectacular sunrises and sunsets in India. The Ghaghari Falls and the Sadni Falls are within reach. The region is home to rich Adivasi (tribal) culture with their unique traditions of Sarhul (spring festival), dance forms like Jhumur, and intricate tribal jewelry and crafts.',
    interestingFacts: [
      'Netarhat is called "Queen of Chotanagpur" due to its pristine natural beauty',
      'Netarhat Residential School alumni include many prominent Indians',
      'Sunrise and sunset here are considered among the most beautiful in Jharkhand',
      'The area has significant Sal (Shorea robusta) forests',
      'Local tribal communities practice unique traditions unchanged for centuries',
    ],
    nearbyAttractions: ['Magnolia Point (Sunrise/Sunset viewpoint)', 'Netarhat Dam', 'Lodh Falls', 'Ghaghari Falls', 'Sadni Falls'],
    localHandicrafts: ['Tribal jewelry', 'Bamboo baskets', 'Paitkar folk paintings', 'Dokra metal art', 'Lac bangles'],
    travelInfo: {
      nearestRailway: 'Latehar Railway Station (60 km) / Ranchi Station (155 km)',
      nearestAirport: 'Birsa Munda Airport, Ranchi (HJR) — 155 km',
      bestTimeToVisit: 'October to February; Avoid monsoon (June–September)',
    },
    relatedStampIds: ['jh-netarhat', 'jh-chotanagpur', 'jh-tribal'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    tags: ['hill station', 'nature', 'plateau', 'tribal', 'sunrise'],
  },
  {
    id: 'betla',
    name: 'Betla National Park',
    state: 'Jharkhand',
    district: 'Latehar',
    category: 'Wildlife',
    description: 'Jharkhand\'s premier wildlife sanctuary and one of India\'s first National Parks, home to elephants and tigers.',
    historicalBackground: 'Betla National Park, located in the Palamu district, was declared one of the first nine Tiger Reserves under Project Tiger in 1974. The area has historical significance as the site of the Palamu Fort, built by the Chero dynasty in the 17th century. During British rule, the park area was under the jurisdiction of the Palamu zamindars. The name "Betla" comes from the tribal word for the forest region.',
    culturalSignificance: 'Betla is part of the Palamu Tiger Reserve, one of the world\'s first tiger conservation areas. The reserve is home to elephants, tigers, leopards, gaurs, chitals, and over 174 species of birds. The Palamu Fort ruins within the park add archaeological interest to the wildlife experience. Local tribal communities — Oraon, Munda, Ho, and Birjia — have lived in coexistence with this forest for centuries.',
    interestingFacts: [
      'Betla was one of India\'s nine original Tiger Reserves (1974)',
      'The Palamu Fort inside the reserve dates to the 17th century',
      'The reserve has two historic forts — Old and New Palamu Fort',
      'Wild elephants here belong to one of India\'s largest natural populations',
      'The Koel and Auranga rivers flow through the reserve',
    ],
    nearbyAttractions: ['Old Palamu Fort', 'New Palamu Fort', 'Betla Safari Zone', 'Lodh Falls (144m — tallest in Jharkhand)', 'Van Vihar'],
    localHandicrafts: ['Tribal wood carvings', 'Bamboo products', 'Paitkar paintings', 'Tribal fabric weaving', 'Honey products'],
    travelInfo: {
      nearestRailway: 'Daltonganj Railway Station (25 km)',
      nearestAirport: 'Birsa Munda Airport, Ranchi (HJR) — 170 km',
      bestTimeToVisit: 'November to April (safaris operational)',
    },
    relatedStampIds: ['jh-betla', 'jh-elephant', 'jh-tiger-reserve'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    tags: ['wildlife', 'tiger', 'elephant', 'national park', 'forest'],
  },
  {
    id: 'deoghar',
    name: 'Deoghar',
    state: 'Jharkhand',
    district: 'Deoghar',
    category: 'Spiritual',
    description: 'Home to the Baidyanath Temple — one of the 12 Jyotirlingas of Shiva, attracting millions of devotees annually.',
    historicalBackground: 'Deoghar (Abode of Gods) is one of the most sacred cities in India for Hindus. The Baidyanath Dham here is considered one of the 12 Jyotirlingas — the most sacred abodes of Lord Shiva. Historical records suggest the temple dates back several centuries, though its present structure has been renovated over time by the Giridih Raj family. During Shravan (July–August), millions of devotees called Kanwariyas carry sacred Ganges water from Sultanganj to offer at this temple in one of the world\'s largest religious processions.',
    culturalSignificance: 'The Shravan Mela at Deoghar is one of the largest religious gatherings in the world, drawing over 5 million pilgrims annually. The 109 km pilgrimage walk from Sultanganj to Deoghar is one of India\'s most demanding religious journeys. The temple complex houses 22 temples within its premises. Deoghar is also associated with stories of King Ravana who worshipped the Shivalinga here.',
    interestingFacts: [
      'Deoghar\'s Shravan Mela is one of the world\'s largest annual religious gatherings',
      'Pilgrims walk 109 km from Sultanganj carrying Ganga water on foot',
      'The temple complex contains 22 temples in total',
      'The main Shivalinga is said to be "Swayambhu" (self-manifested)',
      'Even Maa Parvati has a temple (Basukinath) on the route to Deoghar',
    ],
    nearbyAttractions: ['Baidyanath Temple', 'Naulakha Temple', 'Satsang Ashram', 'Trikut Hill (ropeways)', 'Basukinath Temple'],
    localHandicrafts: ['Religious idols', 'Lac bangles', 'Paitkar paintings', 'Sacred thread work', 'Stone carvings'],
    travelInfo: {
      nearestRailway: 'Deoghar Railway Station / Jasidih Junction (7 km)',
      nearestAirport: 'Deoghar Airport (opened 2022) — 8 km from city; Ranchi Airport 250 km',
      bestTimeToVisit: 'Winter (October–March); Shravan (July–August) for Mela',
    },
    relatedStampIds: ['jh-deoghar', 'jh-jyotirlinga', 'jh-shiva'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
    tags: ['temple', 'shiva', 'pilgrimage', 'jyotirlinga', 'spiritual'],
  },
  {
    id: 'hundru-falls',
    name: 'Hundru Falls',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'Nature',
    description: 'A spectacular 98-meter waterfall formed by the Subarnarekha River — Jharkhand\'s most popular natural attraction.',
    historicalBackground: 'Hundru Falls is formed by the Subarnarekha River as it plunges over the edge of a basalt cliff, creating a 98-meter cascade. The surrounding area has long been home to Munda tribal communities, and the falls are part of local folklore and spiritual beliefs. The region became known to outsiders during British rule when surveyors mapped the Chota Nagpur plateau\'s river systems.',
    culturalSignificance: 'Hundru Falls holds cultural significance for the Munda and Oraon tribal communities who consider it a sacred site. The waterfall is at its most spectacular during and after monsoon season (July–October) when the Subarnarekha swells. The surrounding jungle provides habitat for wildlife including leopards, deer, and various bird species. Local tribal festivals are often celebrated near natural landmarks like this waterfall.',
    interestingFacts: [
      'Hundru Falls drops from a height of 98 meters (320 feet)',
      'The word "Hundru" means "to fall" in the local tribal language',
      'The waterfall is most dramatic between July and October',
      'A natural pool at the base allows swimming (safe access provided)',
      'The surrounding forest is part of the Chota Nagpur Plateau ecosystem',
    ],
    nearbyAttractions: ['Jonha Falls (Gautamdhara)', 'Dassam Falls', 'Hirni Falls', 'Subarnarekha River banks', 'Sita Falls'],
    localHandicrafts: ['Bamboo products', 'Tribal jewelry', 'Stone carving', 'Handloom fabrics', 'Wild honey'],
    travelInfo: {
      nearestRailway: 'Ranchi Railway Station (45 km)',
      nearestAirport: 'Birsa Munda Airport, Ranchi (HJR) — 50 km',
      bestTimeToVisit: 'August to November (peak flow); October onwards for pleasant weather',
    },
    relatedStampIds: ['jh-hundru', 'jh-waterfall', 'jh-subarnarekha'],
    image: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=1600&q=80',
    tags: ['waterfall', 'nature', 'river', 'tribal', 'plateau'],
  },
  {
    id: 'dassam-falls',
    name: 'Dassam Falls',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'Nature',
    description: 'A stunning 44-meter wide waterfall formed by the Kanchi River, known for its unique broad spread.',
    historicalBackground: 'Dassam Falls (also spelled "Dasam") is formed by the Kanchi River as it drops 44 meters over a rocky escarpment. The name "Dassam" refers to the number "10" in some tribal dialects, possibly referring to the multiple streams the waterfall creates. The surrounding Chota Nagpur plateau landscape has been home to Oraon and Munda communities for centuries, and local legends associate the falls with nature spirits.',
    culturalSignificance: 'Dassam Falls is unique for its width — unlike Hundru which drops straight, Dassam spreads across a wide rocky face, creating a distinctive visual effect that changes dramatically with rainfall. The falls are surrounded by dense forest and are an important picnic destination for locals and tourists alike. The Kanchi River below the falls is a popular spot for swimming and bathing among locals.',
    interestingFacts: [
      'Dassam Falls is 44 meters high and notably wider than most falls in the region',
      'The name may derive from tribal words meaning "ten streams"',
      'The surrounding plateau ecosystem supports diverse bird species',
      'Local communities use the river for fishing and bathing rituals',
      'The falls are located just 40 km from Ranchi, making it highly accessible',
    ],
    nearbyAttractions: ['Hundru Falls', 'Jonha Falls', 'Subarnarekha River valley', 'Tagore Hill (Ranchi)', 'Pahari Mandir (Ranchi)'],
    localHandicrafts: ['Tribal beaded jewelry', 'Bamboo woven goods', 'Paitkar paintings', 'Dhokra metal casting', 'Lac work'],
    travelInfo: {
      nearestRailway: 'Ranchi Railway Station (40 km)',
      nearestAirport: 'Birsa Munda Airport, Ranchi (HJR) — 45 km',
      bestTimeToVisit: 'August to November',
    },
    relatedStampIds: ['jh-dassam', 'jh-kanchi-river', 'jh-chota-nagpur'],
    image: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=1600&q=80',
    tags: ['waterfall', 'nature', 'river', 'plateau', 'scenic'],
  },
  {
    id: 'ranchi',
    name: 'Ranchi',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'Cultural',
    description: 'Capital of Jharkhand — the City of Waterfalls, with Pahari Mandir, tribal culture and natural beauty.',
    historicalBackground: 'Ranchi served as the summer capital of the Bihar and Orissa Province during British rule, chosen for its pleasant climate at an altitude of 651 meters. It became the capital of the newly formed Jharkhand state in November 2000, carved out of Bihar to give the region\'s predominantly tribal population self-governance. Ranchi is associated with cricket legend MS Dhoni, who was born here. The city name is believed to derive from "Rachi" — the name of a type of bamboo.',
    culturalSignificance: 'Ranchi is the cultural hub of Jharkhand\'s tribal communities. The Jharkhand tribal museum here documents the traditions of 32 Scheduled Tribes of the state. The Pahari Mandir (Hill Temple) on a granite hilltop is the most important temple in the city. Ranchi is known for its proximity to natural attractions — Hundru Falls, Dassam Falls, and Jonha Falls — and its vibrant tribal cultural traditions including the Sohrai and Jitia festivals.',
    interestingFacts: [
      'Ranchi is nicknamed "City of Waterfalls" due to numerous cascades nearby',
      'Cricket superstar MS Dhoni was born in Ranchi in 1981',
      'The city is at 651m altitude giving it a pleasant climate year-round',
      'Birsa Munda, the tribal freedom fighter, was born near Ranchi',
      'Jharkhand has 32 Scheduled Tribes — one of the highest in any Indian state',
    ],
    nearbyAttractions: ['Pahari Mandir', 'Tagore Hill', 'Rock Garden', 'Nakshatra Van', 'Birsa Munda Zoological Park'],
    localHandicrafts: ['Paitkar folk paintings', 'Dokra metal art', 'Tribal jewelry', 'Bamboo craft', 'Sohrai art'],
    travelInfo: {
      nearestRailway: 'Ranchi Railway Station (Hatia Station for major trains)',
      nearestAirport: 'Birsa Munda Airport (HJR) — 7 km from city center',
      bestTimeToVisit: 'October to March',
    },
    relatedStampIds: ['jh-ranchi', 'jh-jharkhand', 'jh-tribal-culture'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    tags: ['capital', 'tribal', 'nature', 'temple', 'city'],
  },
];

// Local asset photo thakle oita boshbe, na thakle ager Unsplash link
export const destinations: Destination[] = rawDestinations.map((d) => ({
  ...d,
  image: pickImage(d, d.image),
  heroImage: pickImage(d, d.heroImage),
}));

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getDestinationsByState(state: Destination['state']): Destination[] {
  return destinations.filter((d) => d.state === state);
}

export function getDestinationsByCategory(category: Destination['category']): Destination[] {
  return destinations.filter((d) => d.category === category);
}
