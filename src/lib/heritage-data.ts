// NOTE: All products, guides, and homestays in this file are DEMO DATA.
// They are for demonstration purposes only and do not represent real listings.
// Real artisan, guide, and homestay data will be populated once the platform is live.

export interface LocalProduct {
  id: string;
  name: string;
  artisanName: string;
  state: string;
  district: string;
  category: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  isDemoData: boolean;
}

export interface Guide {
  id: string;
  name: string;
  state: string;
  district: string;
  languages: string[];
  expertise: string[];
  destinations: string[];
  experience: string;
  description: string;
  contactInfo: string;
  image: string;
  isDemoData: boolean;
}

export interface Homestay {
  id: string;
  name: string;
  ownerName: string;
  state: string;
  district: string;
  location: string;
  description: string;
  facilities: string[];
  pricePerNight: number;
  images: string[];
  contactInfo: string;
  isDemoData: boolean;
}

// ============================================================
// DEMO LOCAL PRODUCTS
// ============================================================
export const localProducts: LocalProduct[] = [
  // --- West Bengal ---
  {
    id: 'wb-terracotta-bishnupur',
    name: 'Terracotta Temple Panel (Bishnupur)',
    artisanName: 'Ramkrishna Pal (Demo)',
    state: 'West Bengal',
    district: 'Bankura',
    category: 'Terracotta',
    description: 'Hand-crafted terracotta panel depicting scenes from the Mahabharata, made using traditional techniques of Bishnupur.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'wb-baluchari-saree',
    name: 'Baluchari Silk Saree (Bishnupur)',
    artisanName: 'Meera Basak Weaves (Demo)',
    state: 'West Bengal',
    district: 'Bankura',
    category: 'Handloom',
    description: 'Authentic Baluchari saree with intricate mythological motifs woven on the pallu using traditional shuttle looms.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1584697964154-3a05b5b0e16a?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'wb-kantha-embroidery',
    name: 'Kantha Embroidered Dupatta',
    artisanName: 'Supriya Dey Crafts (Demo)',
    state: 'West Bengal',
    district: 'Murshidabad',
    category: 'Textiles',
    description: 'Hand-stitched Kantha work dupatta featuring traditional fish, floral, and peacock motifs using running stitch technique.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'wb-darjeeling-tea-gift',
    name: 'Darjeeling First Flush Tea Gift Box',
    artisanName: 'Himalayan Tea Co. (Demo)',
    state: 'West Bengal',
    district: 'Darjeeling',
    category: 'Food & Beverage',
    description: 'Premium Darjeeling First Flush tea from select estates, packaged in a traditional wooden gift box with stamp motifs.',
    price: 850,
    image: 'https://images.unsplash.com/photo-1544568100-847a19cae382?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'wb-murshidabad-silk',
    name: 'Murshidabad Pure Silk Stole',
    artisanName: 'Nasreen Silk House (Demo)',
    state: 'West Bengal',
    district: 'Murshidabad',
    category: 'Handloom',
    description: 'Lustrous Murshidabad silk stole with delicate zari border, woven on traditional jacquard looms by master weavers.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1584697964154-3a05b5b0e16a?w=400&q=80',
    available: true,
    isDemoData: true,
  },

  // --- Bihar ---
  {
    id: 'bh-madhubani-painting',
    name: 'Madhubani Painting — Kohbar',
    artisanName: 'Rambharos Jha Studio (Demo)',
    state: 'Bihar',
    district: 'Madhubani',
    category: 'Paintings',
    description: 'Original Madhubani Kohbar painting on handmade paper depicting the sacred wedding chamber scene with fish, lotus, and bamboo motifs.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'bh-sikki-grass-basket',
    name: 'Sikki Grass Jewellery Box',
    artisanName: 'Kiran Devi Artisans (Demo)',
    state: 'Bihar',
    district: 'Sitamarhi',
    category: 'Bamboo & Grass',
    description: 'Intricate jewellery box made from golden Sikki grass, featuring traditional Mithila geometric patterns. Fully handmade.',
    price: 650,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'bh-manjusha-art-box',
    name: 'Manjusha Art Lacquered Box',
    artisanName: 'Bhagalpur Craft Guild (Demo)',
    state: 'Bihar',
    district: 'Bhagalpur',
    category: 'Paintings',
    description: 'Lacquered wooden box decorated with Manjusha folk art — a unique narrative art form depicting the story of Bihula-Bishahari.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=400&q=80',
    available: true,
    isDemoData: true,
  },

  // --- Jharkhand ---
  {
    id: 'jh-bamboo-craft-tribal',
    name: 'Tribal Bamboo Fruit Basket',
    artisanName: 'Santosh Munda Crafts (Demo)',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'Bamboo',
    description: 'Hand-woven tribal bamboo basket with natural dye patterns. Each piece is unique, following traditional Munda weaving techniques.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'jh-dokra-metal-elephant',
    name: 'Dokra Metal Elephant Figurine',
    artisanName: 'Dhokra Craft Center (Demo)',
    state: 'Jharkhand',
    district: 'West Singhbhum',
    category: 'Metal Art',
    description: 'Lost-wax cast Dokra metal elephant using 4,000-year-old technique. Each piece is unique and handmade by tribal artisans.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    available: true,
    isDemoData: true,
  },
  {
    id: 'jh-paitkar-painting',
    name: 'Paitkar Scroll Painting',
    artisanName: 'Dukhushyam Chitrakar (Demo)',
    state: 'Jharkhand',
    district: 'East Singhbhum',
    category: 'Paintings',
    description: 'Traditional Paitkar scroll painting used by chitrakar (painter) community for ritual storytelling. Features life, death, and rebirth narratives.',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    available: true,
    isDemoData: true,
  },
];

// ============================================================
// DEMO GUIDES
// ============================================================
export const guides: Guide[] = [
  // --- West Bengal ---
  {
    id: 'guide-wb-01',
    name: 'Arnab Chatterjee (Demo)',
    state: 'West Bengal',
    district: 'Kolkata',
    languages: ['English', 'Bengali', 'Hindi'],
    expertise: ['Heritage walks', 'Colonial architecture', 'Bengali cuisine tours', 'Stamp & philately'],
    destinations: ['Kolkata', 'Howrah', 'Belur Math', 'Dakshineswar'],
    experience: '8 years',
    description: 'Government-certified heritage guide specializing in Kolkata\'s colonial architecture, Durga Puja pandal hopping, and Bengali cultural experiences. Expert in philatelic tours of India Post offices.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: '',
    isDemoData: true,
  },
  {
    id: 'guide-wb-02',
    name: 'Priya Bhattacharyya (Demo)',
    state: 'West Bengal',
    district: 'Darjeeling',
    languages: ['English', 'Bengali', 'Nepali', 'Hindi'],
    expertise: ['Himalayan treks', 'Tea estate tours', 'Buddhist monasteries', 'Toy train journeys'],
    destinations: ['Darjeeling', 'Tiger Hill', 'Ghoom', 'Mirik', 'Sandakphu'],
    experience: '12 years',
    description: 'Born and raised in Darjeeling, Priya brings deep local knowledge of the hills. Specialist in Himalayan heritage, tea garden tours, and Buddhist culture of the Darjeeling region.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1544568100-847a19cae382?w=200&q=80',
    isDemoData: true,
  },
  {
    id: 'guide-wb-03',
    name: 'Subhash Mondal (Demo)',
    state: 'West Bengal',
    district: 'Bankura',
    languages: ['Bengali', 'Hindi', 'English'],
    expertise: ['Terracotta temples', 'Rural Bengal', 'Bishnupur music', 'Handicraft villages'],
    destinations: ['Bishnupur', 'Bankura', 'Mukutmanipur', 'Jhilimili'],
    experience: '6 years',
    description: 'Local guide from Bishnupur with expertise in terracotta temple architecture, Bishnupur Gharana classical music, and connections with local artisan communities making Baluchari sarees and Bankura horses.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=200&q=80',
    isDemoData: true,
  },

  // --- Bihar ---
  {
    id: 'guide-bh-01',
    name: 'Rajan Kumar Singh (Demo)',
    state: 'Bihar',
    district: 'Nalanda',
    languages: ['Hindi', 'English', 'Japanese'],
    expertise: ['Buddhist circuit', 'Ancient ruins', 'Archaeological sites', 'Spiritual tourism'],
    destinations: ['Nalanda', 'Rajgir', 'Bodh Gaya', 'Pawapuri', 'Vaishali'],
    experience: '15 years',
    description: 'Specialist in Bihar\'s Buddhist heritage trail. Rajan works with international Buddhist pilgrims and academic researchers. Fluent in Japanese from years of guiding Japanese pilgrims.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=200&q=80',
    isDemoData: true,
  },
  {
    id: 'guide-bh-02',
    name: 'Sunita Devi (Demo)',
    state: 'Bihar',
    district: 'Madhubani',
    languages: ['Hindi', 'Maithili', 'English'],
    expertise: ['Madhubani art', 'Village craft tours', 'Women artisan collectives', 'Folk traditions'],
    destinations: ['Madhubani', 'Sitamarhi', 'Darbhanga', 'Jankpur (Nepal border)'],
    experience: '7 years',
    description: 'A Madhubani artist herself, Sunita conducts immersive tours of artisan villages, connects visitors with master painters, and facilitates hands-on Madhubani painting workshops.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    isDemoData: true,
  },
  {
    id: 'guide-bh-03',
    name: 'Amit Kumar Sharma (Demo)',
    state: 'Bihar',
    district: 'Patna',
    languages: ['Hindi', 'English', 'Bhojpuri'],
    expertise: ['Patna heritage', 'Ganga ghats', 'Chhath Puja', 'Mughal-era monuments'],
    destinations: ['Patna', 'Vaishali', 'Sonepur', 'Buxar'],
    experience: '10 years',
    description: 'Certified government guide specializing in Patna\'s ancient history from Mauryan Pataliputra to British-era. Expert in Chhath Puja ceremonies and Ganga ghat rituals.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=200&q=80',
    isDemoData: true,
  },

  // --- Jharkhand ---
  {
    id: 'guide-jh-01',
    name: 'Birendra Munda (Demo)',
    state: 'Jharkhand',
    district: 'Ranchi',
    languages: ['Hindi', 'Mundari', 'English', 'Ho'],
    expertise: ['Tribal culture', 'Adivasi rituals', 'Forest treks', 'Traditional crafts'],
    destinations: ['Ranchi', 'Netarhat', 'Hundru Falls', 'Betla'],
    experience: '9 years',
    description: 'A member of the Munda tribal community, Birendra offers authentic insight into Jharkhand\'s indigenous culture, Sohrai paintings, Karma festival, and tribal forest knowledge.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=200&q=80',
    isDemoData: true,
  },
  {
    id: 'guide-jh-02',
    name: 'Puja Topno (Demo)',
    state: 'Jharkhand',
    district: 'Latehar',
    languages: ['Hindi', 'Oraon', 'English'],
    expertise: ['Wildlife safaris', 'Nature walks', 'Waterfall treks', 'Palamu heritage'],
    destinations: ['Betla National Park', 'Netarhat', 'Lodh Falls', 'Palamu Fort'],
    experience: '5 years',
    description: 'Naturalist and jungle guide with expertise in Betla\'s wildlife. Puja has tracked tigers and elephants in Palamu Tiger Reserve and leads birdwatching tours for enthusiasts.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80',
    isDemoData: true,
  },
  {
    id: 'guide-jh-03',
    name: 'Suresh Oraon (Demo)',
    state: 'Jharkhand',
    district: 'Deoghar',
    languages: ['Hindi', 'Oraon', 'Bengali', 'Sanskrit'],
    expertise: ['Temple rituals', 'Jyotirlinga pilgrimage', 'Kanwar Yatra', 'Tantric traditions'],
    destinations: ['Deoghar', 'Basukinath', 'Trikut Hill', 'Sultanganj'],
    experience: '11 years',
    description: 'Specialist in Deoghar\'s Baidyanath Dham pilgrimage circuit. Suresh has guided thousands of devotees through the Shravan Mela and understands the spiritual significance of each ritual.',
    contactInfo: 'Demo contact — enquiry via platform',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    isDemoData: true,
  },
];

// ============================================================
// DEMO HOMESTAYS
// ============================================================
export const homestays: Homestay[] = [
  // --- West Bengal ---
  {
    id: 'hs-wb-01',
    name: 'Bishnupur Heritage Home (Demo)',
    ownerName: 'Tarapada Mondal Family (Demo)',
    state: 'West Bengal',
    district: 'Bankura',
    location: 'Near Rasmancha Temple, Bishnupur',
    description: 'A traditional Bengali family home in the heritage district of Bishnupur, offering authentic home-cooked Bengali meals, guided temple walks, and terracotta art demonstrations by local artisans.',
    facilities: ['Home-cooked meals', 'Temple visit guidance', 'Artisan workshop access', 'WiFi', 'Attached bathroom', 'Air cooling'],
    pricePerNight: 1800,
    images: ['https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },
  {
    id: 'hs-wb-02',
    name: 'Darjeeling Valley View Homestay (Demo)',
    ownerName: 'Pemba Sherpa Family (Demo)',
    state: 'West Bengal',
    district: 'Darjeeling',
    location: 'Happy Valley, Darjeeling',
    description: 'A warm Lepcha family homestay with stunning Kangchenjunga views. Includes traditional Tibetan breakfast, tea estate visit, and guided monk tours of Ghoom Monastery.',
    facilities: ['Kangchenjunga views', 'Tibetan breakfast', 'Tea estate access', 'Warm blankets', 'WiFi', 'Attached bath', 'Bonfire evenings'],
    pricePerNight: 2500,
    images: ['https://images.unsplash.com/photo-1544568100-847a19cae382?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },

  // --- Bihar ---
  {
    id: 'hs-bh-01',
    name: 'Nalanda Scholar\'s Retreat (Demo)',
    ownerName: 'Prof. Raghunath Sharma Family (Demo)',
    state: 'Bihar',
    district: 'Nalanda',
    location: 'Near Nalanda Archaeological Site',
    description: 'A peaceful retreat near the UNESCO ruins of Nalanda University. The host is a retired professor of ancient Indian history offering evening lectures on Nalanda\'s significance. Pure vegetarian meals.',
    facilities: ['Historical lectures', 'Vegetarian meals', 'Garden', 'WiFi', 'Library', 'Bicycle rental', 'Sunrise site visit'],
    pricePerNight: 1200,
    images: ['https://images.unsplash.com/photo-1583484963903-3d65c99f86de?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },
  {
    id: 'hs-bh-02',
    name: 'Mithila Art Homestay, Madhubani (Demo)',
    ownerName: 'Kamla Devi & Family (Demo)',
    state: 'Bihar',
    district: 'Madhubani',
    location: 'Artisan Village, Madhubani',
    description: 'Stay with a master Madhubani artist family. Learn the painting style during your stay, witness the creation process, and visit village artisan cooperatives. Authentic Maithili cuisine included.',
    facilities: ['Painting workshop included', 'Maithili meals', 'Village walk', 'Art buying support', 'WiFi', 'Private room'],
    pricePerNight: 1500,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },

  // --- Jharkhand ---
  {
    id: 'hs-jh-01',
    name: 'Netarhat Forest Cottage (Demo)',
    ownerName: 'Hemant Oraon & Family (Demo)',
    state: 'Jharkhand',
    district: 'Latehar',
    location: 'Magnolia Point area, Netarhat',
    description: 'A serene cottage in the Sal forests of Netarhat offering spectacular sunrise views and tribal cultural experiences. Home-cooked tribal cuisine, forest walks, and bonfire evenings.',
    facilities: ['Sunrise viewpoint access', 'Tribal cuisine', 'Forest walks', 'Bonfire', 'Blankets', 'Private bathroom', 'Generator backup'],
    pricePerNight: 2000,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },
  {
    id: 'hs-jh-02',
    name: 'Ranchi Tribal Heritage Stay (Demo)',
    ownerName: 'Suresh Munda Family (Demo)',
    state: 'Jharkhand',
    district: 'Ranchi',
    location: 'Kanke, Ranchi',
    description: 'An Adivasi family home offering immersive tribal culture experience in the outskirts of Ranchi. Includes traditional Munda meal, tribal dance performance, Sohrai art workshop, and jungle walk.',
    facilities: ['Tribal dance performance', 'Munda meals', 'Sohrai art workshop', 'Jungle walk', 'WiFi', 'AC room', 'Transport to waterfalls'],
    pricePerNight: 1600,
    images: ['https://images.unsplash.com/photo-1565073624-4e30d82d2e1f?w=400&q=80'],
    contactInfo: 'Demo — enquiry via platform',
    isDemoData: true,
  },
];

export function getProductsByState(state: string): LocalProduct[] {
  return localProducts.filter((p) => p.state === state);
}

export function getGuidesByState(state: string): Guide[] {
  return guides.filter((g) => g.state === state);
}

export function getHomestaysByState(state: string): Homestay[] {
  return homestays.filter((h) => h.state === state);
}
