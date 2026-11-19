/**
 * State Data for Stamp Safar (SFIC East Region)
 * West Bengal, Bihar, and Jharkhand
 */

import artAndCulture from "@/assets/art and culture.jpeg";
import BiharImg from "@/assets/bihar.jpeg";
import JharkhandImg from "@/assets/jharkhand.jpeg";

export interface Attraction {
  name: string;
  type: "Zoo" | "National Park" | "Tiger Reserve" | "Waterfall" | "Hill Station" | "Museum" | "Temple" | "Monument";
  description: string;
  location: string;
}

export interface MustVisitPlace {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  category: string;
  image?: string;
}

export interface Festival {
  name: string;
  description: string;
  month: string;
}

export interface LocalFood {
  name: string;
  description: string;
  type: "Sweet" | "Savory" | "Beverage" | "Main";
}

export interface StateData {
  name: "West Bengal" | "Bihar" | "Jharkhand";
  slug: "west-bengal" | "bihar" | "jharkhand";
  tagline: string;
  capital: string;
  languages: string[];
  bestTimeToVisit: string;
  description: string;
  image: string;
  color: string;
  highlights: string[];
  facts: { label: string; value: string }[];
  mustVisitPlaces: MustVisitPlace[];
  famousAttractions: Attraction[];
  festivalsAndCulture: Festival[];
  localFoods: LocalFood[];
  famousHandicrafts: { name: string; description: string; craftType: string }[];
  howToReach: {
    air: string;
    rail: string;
    road: string;
  };
}

export const statesData: Record<string, StateData> = {
  "west-bengal": {
    name: "West Bengal",
    slug: "west-bengal",
    tagline: "Where Culture Meets Heritage",
    capital: "Kolkata",
    languages: ["Bengali", "English", "Hindi"],
    bestTimeToVisit: "October to March",
    description:
      "From the colonial grandeur and intellectual pulse of Kolkata to the tea-cloaked Himalayas of Darjeeling, the terracotta temples of Bishnupur, and the mystical mangrove waterways of the Sundarbans — West Bengal is a living mosaic of literature, art, and timeless heritage.",
    image: artAndCulture,
    color: "from-amber-900/80 to-orange-800/60",
    highlights: [
      "Kolkata Heritage",
      "Darjeeling Himalayan Railway",
      "Sundarbans Mangrove Forest",
      "Bishnupur Terracotta Temples",
      "Tagore's Shantiniketan",
      "Murshidabad Nawabi Palaces",
    ],
    facts: [
      { label: "Destinations", value: "6" },
      { label: "UNESCO Sites", value: "3" },
      { label: "GI-Tagged Crafts", value: "10+" },
      { label: "State Capital", value: "Kolkata" },
    ],
    mustVisitPlaces: [
      {
        id: "kolkata",
        name: "Kolkata — City of Joy",
        destinationId: "kolkata",
        description: "Colonial marvels like Victoria Memorial and Howrah Bridge beside historic coffee houses and book alleys.",
        category: "Heritage",
      },
      {
        id: "darjeeling",
        name: "Darjeeling — Queen of the Hills",
        destinationId: "darjeeling",
        description: "World-famous toy train, sprawling tea estates, and dawn views of Kanchenjunga from Tiger Hill.",
        category: "Nature",
      },
      {
        id: "sundarbans",
        name: "Sundarbans National Park",
        destinationId: "sundarbans",
        description: "The world's largest mangrove forest and home of the Royal Bengal Tiger, accessible by winding river boats.",
        category: "Wildlife",
      },
      {
        id: "bishnupur",
        name: "Bishnupur Terracotta Town",
        destinationId: "bishnupur",
        description: "17th-century terracotta temples, Baluchari silk weaving traditions, and ancient Malla dynasty lore.",
        category: "Cultural",
      },
      {
        id: "shantiniketan",
        name: "Shantiniketan — Abode of Peace",
        destinationId: "shantiniketan",
        description: "Rabindranath Tagore's open-air university town and UNESCO World Heritage cultural sanctuary.",
        category: "Cultural",
      },
      {
        id: "murshidabad",
        name: "Murshidabad Nawabi Heritage",
        destinationId: "murshidabad",
        description: "Hazarduari Palace with a thousand doors, historic mosques, and pure silk weaving heritage along the Bhagirathi.",
        category: "Heritage",
      },
    ],
    famousAttractions: [
      {
        name: "Victoria Memorial & Howrah Bridge",
        type: "Monument",
        location: "Kolkata",
        description: "Iconic white marble monument and the legendary cantilever bridge that symbolize India's cultural capital.",
      },
      {
        name: "Alipore Zoological Gardens",
        type: "Zoo",
        location: "Kolkata",
        description: "India's oldest formal zoological park established in 1876, home to diverse wildlife and migratory winter birds.",
      },
      {
        name: "Padmaja Naidu Himalayan Zoological Park",
        type: "Zoo",
        location: "Darjeeling",
        description: "Internationally acclaimed high-altitude zoo specializing in breeding red pandas, snow leopards, and Himalayan wolves.",
      },
      {
        name: "Sundarbans Tiger Reserve",
        type: "Tiger Reserve",
        location: "South 24 Parganas",
        description: "UNESCO World Heritage mangrove ecosystem with swimming Royal Bengal Tigers, saltwater crocodiles, and mudskippers.",
      },
      {
        name: "Jaldapara & Gorumara National Parks",
        type: "National Park",
        location: "Dooars Region",
        description: "Dense foothill grasslands sheltering India's largest population of the great Indian one-horned rhinoceros outside Assam.",
      },
      {
        name: "Tiger Hill & Batasia Loop",
        type: "Hill Station",
        location: "Darjeeling",
        description: "Scenic vantage point offering panoramic sunrise reflections on Mt. Everest and Kanchenjunga.",
      },
    ],
    festivalsAndCulture: [
      {
        name: "Durga Puja",
        month: "September/October",
        description: "UNESCO Intangible Cultural Heritage — a monumental multi-day public art and devotional carnival transforming the state.",
      },
      {
        name: "Poush Mela & Basanta Utsav",
        month: "December / March",
        description: "Shantiniketan's legendary folk fairs celebrating Baul music, tribal dances, and spring Holi with song and flowers.",
      },
      {
        name: "Kolkata International Book Fair",
        month: "January/February",
        description: "The world's largest non-trade book fair attracting millions of avid bibliophiles and literary thinkers.",
      },
    ],
    localFoods: [
      { name: "Rosogolla & Sandesh", type: "Sweet", description: "Iconic chhena sweets crafted by Bengal's legendary confectioners." },
      { name: "Kolkata Biryani", type: "Main", description: "Fragrant Awadhi-style rice delicacy cooked with marinated meat, saffron, and tender potato." },
      { name: "Macher Jhol & Shorshe Ilish", type: "Main", description: "Fresh river fish simmered with pungent mustard paste and green chillies." },
      { name: "Darjeeling First Flush Tea", type: "Beverage", description: "The 'Champagne of Teas' with delicate floral aroma and light muscatel notes." },
    ],
    famousHandicrafts: [
      { name: "Terracotta Panels & Horses", craftType: "Terracotta", description: "Folk figurines and temple carvings burnt in natural wood kilns in Bankura." },
      { name: "Baluchari & Swarnachari Sarees", craftType: "Handloom", description: "GI-tagged mulberry silk sarees with woven epic scenes from the Ramayana." },
      { name: "Kantha Hand Embroidery", craftType: "Textiles", description: "Intricate running stitch embroidery created by women artisans in rural Bengal." },
    ],
    howToReach: {
      air: "Netaji Subhash Chandra Bose International Airport (CCU) in Kolkata; Bagdogra Airport (IXB) for Darjeeling and Dooars.",
      rail: "Howrah and Sealdah railway stations connect Kolkata to all corners of India; New Jalpaiguri (NJP) connects North Bengal.",
      road: "Extensive National Highways (NH 19, NH 12, NH 27) connecting neighbor states with overnight luxury buses.",
    },
  },

  bihar: {
    name: "Bihar",
    slug: "bihar",
    tagline: "Cradle of Civilizations",
    capital: "Patna",
    languages: ["Hindi", "Bhojpuri", "Maithili", "Magahi"],
    bestTimeToVisit: "October to March",
    description:
      "Ancient Bihar is the birth soil of Buddhism, Jainism, and India's first great republics. From the enlightenment Bodhi Tree at Bodh Gaya and the ancient monastic ruins of Nalanda University to the sacred hills of Rajgir and the vibrant lines of Madhubani art — Bihar holds the spiritual memory of humanity.",
    image: BiharImg,
    color: "from-blue-900/80 to-indigo-800/60",
    highlights: [
      "Bodh Gaya UNESCO Mahabodhi Temple",
      "Nalanda University Ruins",
      "Rajgir Gridhakuta Peak & Hot Springs",
      "Madhubani Folk Art Villages",
      "Vaishali World's First Republic",
      "Patna Sahib & Golghar Heritage",
    ],
    facts: [
      { label: "Destinations", value: "6" },
      { label: "UNESCO Sites", value: "2" },
      { label: "Ancient Universities", value: "1st Global" },
      { label: "State Capital", value: "Patna" },
    ],
    mustVisitPlaces: [
      {
        id: "bodh-gaya",
        name: "Bodh Gaya — Enlightenment Sanctuary",
        destinationId: "bodh-gaya",
        description: "The sacred Mahabodhi Temple and holy Bodhi Tree where Siddhartha Gautama attained Supreme Enlightenment.",
        category: "Spiritual",
      },
      {
        id: "nalanda",
        name: "Nalanda — Ancient Global Academy",
        destinationId: "nalanda",
        description: "Ruins of the 5th-century residential university that housed 10,000 students and scholars from across Asia.",
        category: "Heritage",
      },
      {
        id: "rajgir",
        name: "Rajgir — Capital of Magadha",
        destinationId: "rajgir",
        description: "Peace Pagoda (Vishwa Shanti Stupa), ancient hot sulfur springs, and King Bimbisara's cyclopean walls.",
        category: "Spiritual",
      },
      {
        id: "madhubani",
        name: "Madhubani — Living Art Haven",
        destinationId: "madhubani",
        description: "Traditional village courtyards where women master artists paint Mithila murals using natural twigs and pigments.",
        category: "Cultural",
      },
      {
        id: "vaishali",
        name: "Vaishali — The First Republic",
        destinationId: "vaishali",
        description: "The ancient Lichchhavi republic capital where Buddha delivered his last sermon and Ashoka built a polished pillar.",
        category: "Heritage",
      },
      {
        id: "patna",
        name: "Patna — Ancient Pataliputra",
        destinationId: "patna",
        description: "Historic Golghar granary, Bihar Museum, and Takht Sri Patna Sahib, birthplace of Guru Gobind Singh.",
        category: "Cultural",
      },
    ],
    famousAttractions: [
      {
        name: "Mahabodhi Temple Complex",
        type: "Temple",
        location: "Bodh Gaya",
        description: "UNESCO World Heritage 50-meter grand pyramidal temple standing beside the sacred diamond throne (Vajrasana).",
      },
      {
        name: "Sanjay Gandhi Biological Park (Patna Zoo)",
        type: "Zoo",
        location: "Patna",
        description: "Sprawling 150-acre biological park, botanical garden, and premier breeding sanctuary for greater one-horned rhinos.",
      },
      {
        name: "Valmiki National Park & Tiger Reserve",
        type: "Tiger Reserve",
        location: "West Champaran",
        description: "Located along the Himalayan foothills on the Indo-Nepal border, sheltering Royal Bengal tigers, leopards, and wild dogs.",
      },
      {
        name: "Vishwa Shanti Stupa & Ropeway",
        type: "Monument",
        location: "Rajgir",
        description: "Gleaming white peace pagoda atop Ratnagiri Hill accessed by scenic aerial chairlift ropeway.",
      },
      {
        name: "Golghar & Bihar Museum",
        type: "Museum",
        location: "Patna",
        description: "Architectural hive-shaped 1786 granary with panoramic Ganges views and world-class artifacts museum.",
      },
      {
        name: "Ashokan Pillar & Relic Stupa",
        type: "Monument",
        location: "Vaishali",
        description: "Single-block polished sandstone pillar crowned by a life-sized lion facing north towards the Buddha's journey.",
      },
    ],
    festivalsAndCulture: [
      {
        name: "Chhath Puja",
        month: "October/November",
        description: "Ancient Vedic sun worship festival where millions gather on riverbanks at dawn and dusk with bamboo arghya.",
      },
      {
        name: "Sonepur Mela",
        month: "November/December",
        description: "Asia's largest historic cattle and cultural fair held at the holy confluence of the Ganga and Gandak rivers.",
      },
      {
        name: "Buddha Jayanti",
        month: "May",
        description: "World gathering of Buddhist pilgrims and monks chanting under the holy Bodhi Tree in Bodh Gaya.",
      },
    ],
    localFoods: [
      { name: "Litti Chokha", type: "Main", description: "Roasted whole-wheat dumplings stuffed with spiced roasted gram flour (sattu), served with ghee and roasted eggplant-tomato mash." },
      { name: "Thekua", type: "Sweet", description: "Traditional deep-fried prasad made with whole wheat, jaggery, cardamom, and ghee." },
      { name: "Khaja", type: "Sweet", description: "Crisp multi-layered sweet pastry from Silao near Nalanda with a GI tag." },
      { name: "Sattu Sharbat", type: "Beverage", description: "Nutritious roasted gram flour beverage tempered with roasted cumin, mint, and black salt." },
    ],
    famousHandicrafts: [
      { name: "Madhubani Painting", craftType: "Paintings", description: "GI-tagged Mithila folk painting characterized by eye-catching geometrical patterns and mythological themes." },
      { name: "Sikki Grass Crafts", craftType: "Bamboo & Grass", description: "Lacquered golden grass craft turned into ornamental boxes, coasters, and idols by rural women." },
      { name: "Manjusha Folk Art", craftType: "Paintings", description: "Ancient Angika narrative painting done in strict pink, green, and yellow on handmade boxes and paper." },
    ],
    howToReach: {
      air: "Jay Prakash Narayan Airport (PAT) in Patna and Gaya International Airport (GAY) connecting domestic and Buddhist charter flights.",
      rail: "Patna Junction, Gaya Junction, and Pt. Deen Dayal Upadhyaya Junction connect directly to all Indian rail arteries.",
      road: "Well-connected state expressways and Grand Trunk Road (NH 19) cross the heart of Bihar.",
    },
  },

  jharkhand: {
    name: "Jharkhand",
    slug: "jharkhand",
    tagline: "Land of Forests & Waterfalls",
    capital: "Ranchi",
    languages: ["Hindi", "Santhali", "Mundari", "Nagpuri", "Ho"],
    bestTimeToVisit: "October to March",
    description:
      "Jharkhand is an enchanted wonderland of virgin sal forests, thunderous cascading waterfalls, and sacred plateaus. Home to 32 indigenous tribal communities whose harmony with nature is preserved in sacred groves, Dokra metal art, Sohrai wall murals, and the holy Baidyanath Jyotirlinga shrine.",
    image: JharkhandImg,
    color: "from-green-900/80 to-emerald-800/60",
    highlights: [
      "City of Waterfalls Ranchi",
      "Netarhat Queen of Chotanagpur",
      "Betla National Park & Tiger Reserve",
      "Baidyanath Dham Deoghar Jyotirlinga",
      "Hundru, Dassam & Jonha Waterfalls",
      "Tribal Sohrai & Dokra Art Traditions",
    ],
    facts: [
      { label: "Destinations", value: "6" },
      { label: "Tribal Communities", value: "32" },
      { label: "Waterfalls", value: "15+" },
      { label: "State Capital", value: "Ranchi" },
    ],
    mustVisitPlaces: [
      {
        id: "netarhat",
        name: "Netarhat — Queen of Chotanagpur",
        destinationId: "netarhat",
        description: "Cool hill retreat enveloped in pine and cypress trees, famed for spectacular sunrise and sunset vistas at Magnolia Point.",
        category: "Nature",
      },
      {
        id: "betla",
        name: "Betla National Park",
        destinationId: "betla",
        description: "One of India's earliest Project Tiger reserves, home to wild elephant herds, sloth bears, and 16th-century Chero forts.",
        category: "Wildlife",
      },
      {
        id: "deoghar",
        name: "Baidyanath Dham Deoghar",
        destinationId: "deoghar",
        description: "One of the revered 12 Jyotirlingas of Lord Shiva, destination of millions of barefoot Kanwariya pilgrims.",
        category: "Spiritual",
      },
      {
        id: "hundru-falls",
        name: "Hundru Falls",
        destinationId: "hundru-falls",
        description: "Spectacular 98-meter waterfall where the Subarnarekha River plunges over eroded metamorphic rocks into natural pools.",
        category: "Nature",
      },
      {
        id: "dassam-falls",
        name: "Dassam Falls",
        destinationId: "dassam-falls",
        description: "Ten-stream waterfall dropping 44 meters amidst lush green forests and granite boulders along Kanchi River.",
        category: "Nature",
      },
      {
        id: "ranchi",
        name: "Ranchi — Waterfalls & Tribal Hub",
        destinationId: "ranchi",
        description: "The City of Waterfalls, Tagore Hill, Rock Garden, and state tribal research museums celebrating Birsa Munda.",
        category: "Cultural",
      },
    ],
    famousAttractions: [
      {
        name: "Betla National Park & Palamau Forts",
        type: "National Park",
        location: "Latehar",
        description: "Wildlife sanctuary with sal forests, wild elephants, gaur, and twin mysterious forts of the medieval Chero kings.",
      },
      {
        name: "Birsa Munda Zoological Park (Birsa Zoo)",
        type: "Zoo",
        location: "Ormanjhi, Ranchi",
        description: "Expansive 104-hectare semi-natural ecological zoo housing tigers, leopards, bears, and native birds along Sapahi river.",
      },
      {
        name: "Hundru & Dassam Waterfalls",
        type: "Waterfall",
        location: "Ranchi District",
        description: "Thundering natural waterfalls surrounded by pristine forests, beloved by trekkers and photographers.",
      },
      {
        name: "Baba Baidyanath Temple Complex",
        type: "Temple",
        location: "Deoghar",
        description: "Ancient stone temple holding the sacred Kamna Lingam, adorned with gold spires and sacred ponds.",
      },
      {
        name: "Magnolia Point & Koel View Point",
        type: "Hill Station",
        location: "Netarhat",
        description: "Romantic panoramic sunset cliffs 3,700 feet above sea level overlooking deep valleys and tribal hamlets.",
      },
      {
        name: "Dalma Wildlife Sanctuary",
        type: "National Park",
        location: "Jamshedpur",
        description: "Famous elephant sanctuary sprawling along the Dalma mountain range with views of the Subarnarekha basin.",
      },
    ],
    festivalsAndCulture: [
      {
        name: "Sarhul",
        month: "March/April",
        description: "Vibrant spring festival worshiping mother earth and the blooming Sal trees, celebrated with drums and flowers.",
      },
      {
        name: "Karma Festival",
        month: "August/September",
        description: "Celebration of youth, nature, and karma tree branches planted in village courtyards with all-night dancing.",
      },
      {
        name: "Shravani Mela",
        month: "July/August",
        description: "World's longest human pilgrimage where millions carry holy Ganga water from Sultanganj to Deoghar over 105 km.",
      },
    ],
    localFoods: [
      { name: "Dhuska with Ghugni", type: "Main", description: "Deep-fried rice and chana dal savory pancake served hot with spicy black chickpea curry." },
      { name: "Chilka Roti", type: "Main", description: "Soft pancake prepared from rice and soaked chana dal, paired with tomato-chilli chutney." },
      { name: "Russa (Rugra / Khukri)", type: "Savory", description: "Wild edible forest mushroom prized for earthy flavor, cooked into rich seasonal curry." },
      { name: "Arsa Roti & Pitha", type: "Sweet", description: "Traditional festive sweet bread made of fermented rice flour, jaggery, and sesame seeds." },
    ],
    famousHandicrafts: [
      { name: "Dokra Lost-Wax Metal Art", craftType: "Metal Art", description: "Non-ferrous metal casting practiced for over 4,000 years by tribal artisans, creating figurines and lamps." },
      { name: "Sohrai & Khovar Murals", craftType: "Paintings", description: "GI-tagged indigenous wall art painted by tribal women with natural ochre, white mud, and chewed twigs." },
      { name: "Tribal Bamboo & Woodcraft", craftType: "Bamboo", description: "Baskets, storage vessels, and fishing traps handcrafted from mature river bamboo." },
    ],
    howToReach: {
      air: "Birsa Munda Airport (IXR) in Ranchi and Deoghar Airport (DGH) offering direct flights to major Indian metros.",
      rail: "Ranchi, Dhanbad, and Jamshedpur (Tatanagar) are major junctions on Howrah-Delhi and Howrah-Mumbai lines.",
      road: "National Highways NH 20, NH 33, and NH 43 provide scenic highland driving routes through forests and plateaus.",
    },
  },
};
