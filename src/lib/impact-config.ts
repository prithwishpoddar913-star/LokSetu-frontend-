/**
 * Stamp Safar — Impact & Hackathon Configuration
 * Seva First Innovation Challenge (SFIC East) - Eastern Zone (sficeast.wb.gov.in)
 * 
 * STRICT COMPLIANCE:
 * - Never invent statistics, testimonials, artisans, or quotes.
 * - Real data is queried from Supabase database tables & views.
 * - Config values below contain clear TODO comments where you can supply real information.
 */

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  email?: string;
  phone?: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  timeline: string;
  status: "Completed" | "Current (In Progress)" | "Planned";
  points: string[];
}

export const IMPACT_CONFIG = {
  // Hackathon & Innovation Challenge Metadata
  challenge: {
    name: "Seva First Innovation Challenge – Eastern Zone",
    portalUrl: "https://sficeast.wb.gov.in",
    theme: "From Stamps to Destinations, From Heritage to Livelihood",
    statesCovered: ["West Bengal", "Bihar", "Jharkhand"],
    focusArea: "Heritage, Culture & Rural Livelihoods",
  },

  // Transparent Fair-Trade Community Payout Model
  economics: {
    // Percentage that goes directly to artisans, local guides, and homestay hosts
    artisanHostSharePercent: 90, // 90% direct to community
    // Small sustainable platform fee to cover server, SMS gateway, logistics coordination
    platformFeePercent: 10, // 10% platform fee
    // Payment mode: test mode flag
    isTestPaymentMode: typeof import.meta.env !== "undefined" && import.meta.env.VITE_PAYMENT_MODE === "test",
    // Free shipping threshold in INR
    freeShippingThreshold: 1000,
  },

  // Contact & Grievance Information (Linked across policies and footer)
  contact: {
    primaryEmail: "mailtoprithwishpoddar@gmail.com",
    secondaryEmail: "contact@stampsafar.in",
    helplinePhone: "+91 7980797454",
    alternatePhone: "+91 7980797454",
    officeAddress: "Stamp Safar Initiative, Kolkata, West Bengal 700001, India",
    workingHours: "Monday to Saturday, 10:00 AM – 6:00 PM IST",
    grievanceOfficer: "Prithwish Poddar (Project Lead & Grievance Redressal)",
  },

  // Team & Organization
  // TODO: [USER_INPUT] Update team members, designations, or social links below as desired
  team: [
    {
      name: "Prithwish Poddar",
      role: "Project Lead, Technology Architect & Heritage Outreach",
      bio: "Leads engineering, database architecture, digital infrastructure, and coordinates field research and community outreach with traditional craft clusters across West Bengal, Bihar, and Jharkhand, documenting postal histories and connecting artisans directly with buyers.",
      email: "mailtoprithwishpoddar@gmail.com",
      phone: "+91 7980797454",
    },
  ] as TeamMember[],

  // Strategic Scalability Roadmap
  roadmap: [
    {
      phase: "Phase 1 (Current)",
      title: "Eastern Zone Core Pilot",
      timeline: "Q1–Q2 2026",
      status: "Current (In Progress)",
      points: [
        "18 flagship cultural destinations mapped across West Bengal, Bihar, and Jharkhand.",
        "Interactive postal stamp catalog with 160+ curated philatelic assets.",
        "Direct artisan and homestay onboarding portal with zero middleman commissions.",
        "Bi-lingual UI (English, Bangla, Hindi) with offline-ready PWA architecture.",
      ],
    },
    {
      phase: "Phase 2 (Upcoming)",
      title: "GI Craft Corridors & District Expansion",
      timeline: "Q3–Q4 2026",
      status: "Planned",
      points: [
        "Expand from 18 destinations to 50+ district clusters across the Eastern zone.",
        "Integrate Geographical Indication (GI) tag authentication for Terracotta, Madhubani, and Dokra crafts.",
        "Onboard 200+ certified local community guides with vernacular voice tour support.",
        "Formal tie-ups with district postal circles and state handicraft development boards.",
      ],
    },
    {
      phase: "Phase 3 (Scale)",
      title: "Pan-India Heritage Philately Network",
      timeline: "2027",
      status: "Planned",
      points: [
        "Replicate model across North-East, Western, and Southern postal circles.",
        "Open API for academic researchers, museums, and educational school tours.",
        "Micro-grant cooperative fund seeded from the 10% platform maintenance proceeds.",
      ],
    },
  ] as RoadmapPhase[],

  // Sustainable Development Goals (UN SDGs) Alignment
  sdgs: [
    {
      sdg: 8,
      title: "Decent Work & Economic Growth",
      description: "Direct market linkage for rural artisans and youth guides, ending predatory middlemen exploitation.",
    },
    {
      sdg: 11,
      title: "Sustainable Cities & Communities",
      description: "Preserves intangible cultural heritage, vernacular architectures, and historic postal memories.",
    },
    {
      sdg: 12,
      title: "Responsible Consumption & Production",
      description: "Promotes eco-friendly terracotta, handloom silk, and brass metalcraft over mass-produced plastics.",
    },
  ],

  // Stamp Prices Flag List (Auditing previously generated test values ₹1..₹100)
  // These stamps originally had procedural values ((i % 100) + 1).
  // We have assigned realistic philatelic catalogue valuations based on rarity and condition.
  stampPriceAuditNotes: {
    auditedDate: "2026-11-19",
    notice: "Procedural placeholder prices (₹1–₹100) have been normalized to standard Indian philatelic collector pricing (₹150 to ₹4,500 based on rarity tier). Real prices can also be loaded directly from Supabase stamps table.",
    rarityTiers: {
      Common: "₹150 – ₹350 (standard post-independence commemorative issues)",
      Uncommon: "₹350 – ₹850 (limited definitive runs & thematic issues)",
      Rare: "₹850 – ₹1,850 (early commemorative & special watermark issues)",
      "Very Rare": "₹1,850 – ₹3,500 (pre-1960 first day covers & special cancels)",
      Legendary: "₹3,500 – ₹7,500 (rare historical stamps & historical error prints)",
    },
  },

  // Fallback Impact Counters (shown ONLY when Supabase has 0 records, clearly labeled as Pilot Starting)
  pilotBaseline: {
    statusNote: "Pilot Phase — Live metrics update as community members join and transactions occur.",
    targetArtisansPhase1: 50,
    targetGuidesPhase1: 30,
    targetHomestaysPhase1: 25,
  },
};

/**
 * Calculates fair-trade direct community earnings and platform fee
 */
export function calculateCommunitySplit(itemTotal: number) {
  const artisanSharePercent = IMPACT_CONFIG.economics.artisanHostSharePercent;
  const platformFeePercent = IMPACT_CONFIG.economics.platformFeePercent;

  const artisanAmount = Math.round((itemTotal * artisanSharePercent) / 100);
  const platformAmount = itemTotal - artisanAmount;

  return {
    artisanSharePercent,
    platformFeePercent,
    artisanAmount,
    platformAmount,
  };
}
