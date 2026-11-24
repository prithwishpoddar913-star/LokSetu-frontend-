import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

// Browser SpeechRecognition type augmentation
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined;
    webkitSpeechRecognition: typeof SpeechRecognition | undefined;
  }
}
import {
  Search,
  Landmark,
  Bird,
  Music2,
  Sparkles,
  ArrowRight,
  Mic,
  MapPin,
  ShoppingBag,
  UserCheck,
  Home as HomeIcon,
  Stamp,
  Star,
  Users,
  Map,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Building,
  Compass,
} from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImpactStats } from "@/components/ImpactStats";
import { SafeImage } from "@/components/SafeImage";
import { stamps } from "@/lib/stamps";
import { destinations } from "@/lib/destinations";
import { localProducts, guides, homestays } from "@/lib/heritage-data";
import {
  getDestinationAsset,
  getProductAsset,
  getGuideAsset,
  getHomestayAssets,
} from "@/lib/assets";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { trackEvent } from "@/lib/analytics";

import hero from "@/assets/hero-stamps.jpg";
import bgVideo from "@/assets/stamp-bg.mp4";
import westBengalImg from "@/assets/art and culture.jpeg";
import Bihar from "@/assets/bihar.jpeg";
import Jharkhand from "@/assets/jharkhand.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "LokSetu — From Stamps to Destinations, From Heritage to Livelihood",
      },
      {
        name: "description",
        content:
          "Discover the stories behind India's postage stamps, explore its cultural heritage and connect with local communities across West Bengal, Bihar and Jharkhand.",
      },
    ],
  }),
  component: Home,
});

const stampCategories = [
  {
    name: "History",
    icon: Landmark,
    desc: "Freedom, leaders & monuments",
  },
  {
    name: "Wildlife",
    icon: Bird,
    desc: "Tigers, birds & biodiversity",
  },
  {
    name: "Culture",
    icon: Music2,
    desc: "Dance, music & traditions",
  },
  {
    name: "Festivals",
    icon: Sparkles,
    desc: "Diwali, Holi & celebrations",
  },
];

const easternStates = [
  {
    name: "West Bengal" as const,
    slug: "west-bengal",
    tagline: "Where Culture Meets Heritage",
    emoji: "🎨",
    highlights: ["Kolkata", "Darjeeling", "Sundarbans", "Bishnupur"],
    color: "from-amber-900/80 to-orange-800/60",
    image: westBengalImg,
  },
  {
    name: "Bihar" as const,
    slug: "bihar",
    tagline: "Cradle of Civilizations",
    emoji: "🏛️",
    highlights: ["Bodh Gaya", "Nalanda", "Madhubani", "Vaishali"],
    color: "from-blue-900/80 to-indigo-800/60",
    image: Bihar,
  },
  {
    name: "Jharkhand" as const,
    slug: "jharkhand",
    tagline: "Land of Forests & Waterfalls",
    emoji: "🌿",
    highlights: ["Netarhat", "Betla", "Deoghar", "Hundru Falls"],
    color: "from-green-900/80 to-emerald-800/60",
    image: Jharkhand,
  },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [heroSearch, setHeroSearch] = useState("");
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(false);

  // Dynamic live impact metrics fetched from Supabase view, falling back to real catalogue lengths
  const [liveImpact, setLiveImpact] = useState<{
    artisans: number;
    guides: number;
    homestays: number;
    orders: number;
    communityPayout: number;
    destinations: number;
    stampsCount: number;
  }>({
    artisans: localProducts.length,
    guides: guides.length,
    homestays: homestays.length,
    orders: 0,
    communityPayout: 0,
    destinations: destinations.length,
    stampsCount: stamps.length,
  });

  useEffect(() => {
    trackEvent("page_view", { resourceId: "home" });

    const loadLiveImpact = async () => {
      if (supabase && isSupabaseConfigured) {
        try {
          const { data } = await supabase.from("v_public_impact").select("*").maybeSingle();
          if (data) {
            setLiveImpact({
              artisans: Math.max(localProducts.length, Number(data.approved_artisans_count || 0)),
              guides: Math.max(guides.length, Number(data.approved_guides_count || 0)),
              homestays: Math.max(homestays.length, Number(data.approved_hosts_count || 0)),
              orders: Number(data.total_orders_count || 0),
              communityPayout: Number(data.total_community_payout || 0),
              destinations: Number(data.total_destinations_mapped || destinations.length),
              stampsCount: Math.max(stamps.length, Number(data.total_stamps_count || 0)),
            });
          }
        } catch (e) {
          console.warn("Live impact query failed, using catalogue baselines:", e);
        }
      }
    };
    loadLiveImpact();
  }, []);

  // ================= VOICE SEARCH =================

  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      alert("Voice search is not supported in your browser");
      return;
    }

    const recognition = new SR();

    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;

      setHeroSearch(transcript);

      submitHeroSearch(transcript);
    };

    recognition.start();
  };

  const heroSuggestions = heroSearch.trim()
    ? stamps
      .filter((stamp) =>
        `${stamp.name} ${stamp.year} ${stamp.category} ${stamp.rarity} ${stamp.origin} ${stamp.state}`
          .toLowerCase()
          .includes(heroSearch.trim().toLowerCase()),
      )
      .slice(0, 5)
    : [];

  const submitHeroSearch = (query = heroSearch) => {
    const q = query.trim();

    setHeroDropdownOpen(false);

    navigate({
      to: "/stamps",
      search: {
        category: "",
        q,
      },
    });
  };

  const featuredDestinations = destinations.slice(0, 6);
  const featuredProducts = localProducts.slice(0, 4);
  const featuredGuides = guides.slice(0, 3);

  return (
    <SiteLayout>
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* VIDEO BACKGROUND */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.play().catch(() => { });
              }
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={bgVideo}
            className="w-full h-full object-cover"
          >
            <source src={bgVideo} type="video/mp4" />
          </video>

          {/* DARK OVERLAY (Ensures contrast in both Dark and Light modes) */}
          <div className="absolute inset-0 bg-neutral-950/75 dark:bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        {/* ANIMATED BLOBS */}
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 -left-20 w-[28rem] h-[28rem] rounded-full bg-[#F47721]/20 blur-3xl animate-blob" />

          <div
            className="absolute -bottom-20 right-0 w-[32rem] h-[32rem] rounded-full bg-[#F47721]/15 blur-3xl animate-blob"
            style={{ animationDelay: "-6s" }}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-center">
          {/* LEFT SIDE */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-xs font-medium animate-fade-in text-white">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[#F47721] animate-ping opacity-60" />

                <span className="relative w-2 h-2 rounded-full bg-[#F47721]" />
              </span>

              SFIC East — Eastern India Heritage Platform
            </div>

            <h1 className="mt-6 text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-tight animate-fade-in-up">
              From Stamps to{" "}
              <span className="text-[#F47721]">Destinations</span>
              <span className="block text-white/90 mt-1">
                From Heritage to{" "}
                <span className="text-[#F47721]">Livelihood</span>
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed animate-fade-in-up delay-100">
              Discover the stories behind India's postage stamps, explore its
              cultural heritage and connect with the local communities that keep
              traditions alive across West Bengal, Bihar and Jharkhand.
            </p>

            {/* SEARCH BOX */}
            <form
              onSubmit={(event) => {
                event.preventDefault();

                submitHeroSearch();
              }}
              className="mt-10 animate-fade-in-up delay-200"
            >
              <div className="rounded-2xl backdrop-blur-xl bg-white/10 border border-white/10 p-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  {/* SEARCH INPUT */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />

                    <Input
                      value={heroSearch}
                      onChange={(event) => {
                        setHeroSearch(event.target.value);

                        setHeroDropdownOpen(true);
                      }}
                      onFocus={() => setHeroDropdownOpen(true)}
                      onBlur={() =>
                        window.setTimeout(
                          () => setHeroDropdownOpen(false),
                          140,
                        )
                      }
                      placeholder="Search stamps, destinations, heritage…"
                      className="pl-10 pr-12 border-0 bg-transparent focus-visible:ring-0 h-12 text-base text-white placeholder:text-white/50"
                    />

                    {/* MIC BUTTON */}
                    <button
                      type="button"
                      onClick={startVoiceSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-[#F47721] transition"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {/* SEARCH BUTTON */}
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-6 bg-[#F47721] text-white hover:bg-[#E85D04] group sm:w-auto w-full"
                  >
                    Search

                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* DROPDOWN */}
              {heroDropdownOpen && heroSearch.trim() && (
                <div className="mt-3 max-h-[360px] overflow-y-auto rounded-2xl border border-white/15 bg-background text-foreground shadow-2xl">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent"
                  >
                    <Search className="h-4 w-4 text-[#F47721]" />

                    Search for{" "}
                    <span className="font-semibold">
                      "{heroSearch.trim()}"
                    </span>
                  </button>

                  {heroSuggestions.length > 0 ? (
                    <div className="border-t border-border">
                      {heroSuggestions.map((stamp) => (
                        <Link
                          key={stamp.id}
                          to="/stamps/$stampId"
                          params={{ stampId: stamp.id }}
                          onClick={() => {
                            setHeroDropdownOpen(false);

                            setHeroSearch("");
                          }}
                          className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-accent"
                        >
                          <img
                            src={stamp.image}
                            alt={stamp.name}
                            className="h-14 w-14 rounded-lg bg-secondary object-contain"
                          />

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {stamp.name}
                            </span>

                            <span className="block text-xs text-muted-foreground">
                              {stamp.year} · {stamp.category} ·{" "}
                              {stamp.state} · {stamp.rarity}
                            </span>
                          </span>

                          <span className="text-sm font-semibold">
                            ₹{stamp.price.toLocaleString("en-IN")}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                      No direct match. Press Search to browse the archive.
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* QUICK TAGS */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70 animate-fade-in-up delay-300">
              <span className="font-medium">Explore:</span>

              <Link
                to="/explore/$stateSlug"
                params={{ stateSlug: "west-bengal" }}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 hover:border-[#F47721] hover:bg-[#F47721]/20 transition-colors text-white"
              >
                West Bengal
              </Link>
              <Link
                to="/heritage/$destinationId"
                params={{ destinationId: "bodh-gaya" }}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 hover:border-[#F47721] hover:bg-[#F47721]/20 transition-colors text-white"
              >
                Bodh Gaya
              </Link>
              <Link
                to="/heritage/$destinationId"
                params={{ destinationId: "bishnupur" }}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 hover:border-[#F47721] hover:bg-[#F47721]/20 transition-colors text-white"
              >
                Bishnupur
              </Link>
              <Link
                to="/heritage/$destinationId"
                params={{ destinationId: "madhubani" }}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 hover:border-[#F47721] hover:bg-[#F47721]/20 transition-colors text-white"
              >
                Madhubani Art
              </Link>
            </div>

            {/* CTA BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-400">
              <Link
                to="/heritage"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold hover:bg-[#E85D04] transition-colors"
              >
                <Landmark className="w-4 h-4" />
                Explore Heritage
              </Link>
              <Link
                to="/stamps"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                <Stamp className="w-4 h-4" />
                Discover Stamps
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md animate-fade-in-up delay-500">
              {[
                { n: "18", l: "Destinations" },
                { n: "150+", l: "Heritage Stamps" },
                { n: "3", l: "Eastern States" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-[#F47721]">
                    {s.n}
                  </div>

                  <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative animate-scale-in delay-200">
            <div className="absolute -inset-8 bg-gradient-to-tr from-[#F47721]/30 via-transparent to-[#F47721]/20 blur-3xl rounded-full" />

            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl animate-float">
              <img
                src={hero}
                alt="Curated Indian postage stamps"
                width={1536}
                height={1024}
                className="w-full h-auto"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* EASTERN INDIA BADGE */}
            <div className="absolute -bottom-6 -left-6 backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-4 shadow-xl hidden sm:flex items-center gap-3 animate-fade-in-up delay-500">
              <div className="w-10 h-10 rounded-xl bg-[#F47721]/20 grid place-items-center">
                <MapPin className="w-5 h-5 text-[#F47721]" />
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Eastern India
                </div>

                <div className="text-xs text-white/60">
                  WB · Bihar · Jharkhand
                </div>
              </div>
            </div>

            {/* COMMUNITY BADGE */}
            <div className="absolute -top-4 -right-4 backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-2 animate-fade-in-up delay-300">
              <div className="w-8 h-8 rounded-lg bg-[#F47721] text-white grid place-items-center text-xs font-bold">
                <Heart className="w-4 h-4" />
              </div>

              <div className="text-xs">
                <div className="font-semibold text-white">
                  Local Communities
                </div>

                <div className="text-white/60">{liveImpact.guides} guides · {liveImpact.homestays} homestays</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROBLEM -> SOLUTION -> IMPACT STORYTELLING (TASK 8) ===================== */}
      <section className="bg-linear-to-b from-transparent via-[#FFF0E5]/50 to-transparent dark:via-[#181A20]/60 py-16 border-y border-[#F1D8C5]/50 dark:border-white/5 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F47721]/10 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t("storytelling.badge", "Seva First Innovation Challenge — Eastern Zone")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-zinc-100 tracking-tight">
              {t("storytelling.title", "Why LokSetu?")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777777] dark:text-zinc-400 leading-relaxed">
              {t("storytelling.subtitle", "Bridging philatelic heritage with rural livelihood transformation across West Bengal, Bihar, and Jharkhand.")}
            </p>
          </div>

          {/* 3 Connected Cards */}
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* 1. Problem Card */}
            <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#1A1C23] p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-5 font-bold">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                  01 · Challenge
                </span>
                <h3 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
                  {t("storytelling.problemTitle", "The Problem")}
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] dark:text-zinc-300 leading-relaxed">
                  {t("storytelling.problemDesc", "Traditional artisans, youth tour guides, and rural homestay hosts across Eastern India struggle to reach travelers and collectors. Trapped by exploitative middlemen, they receive less than 30% of fair value, while historic philatelic treasures and rural heritage remain forgotten.")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-950/60 text-[11px] font-semibold text-red-700 dark:text-red-400">
                ⚠️ Exploitative Middlemen · Forgotten Heritage
              </div>
            </div>

            {/* 2. Solution Card */}
            <div className="rounded-3xl border-2 border-[#F47721] bg-white dark:bg-[#1A1C23] p-6 sm:p-7 shadow-lg shadow-[#F47721]/10 hover:shadow-xl transition flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-[#F47721] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Our Innovation
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E5] dark:bg-[#F47721]/20 text-[#F47721] flex items-center justify-center mb-5 font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F47721] block mb-1">
                  02 · Approach
                </span>
                <h3 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
                  {t("storytelling.solutionTitle", "Our Solution")}
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] dark:text-zinc-300 leading-relaxed">
                  {t("storytelling.solutionDesc", "A unified platform connecting postage stamps -> living destinations -> rural communities. LokSetu enables zero-middlemen direct bookings, verified handicraft sales, and 90% direct payouts to local craftspeople and homestays.")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F1D8C5] dark:border-white/10 text-[11px] font-semibold text-[#F47721]">
                ✨ Stamps → Destinations → Community Linkage
              </div>
            </div>

            {/* 3. Impact Card */}
            <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-[#1A1C23] p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  03 · Proof
                </span>
                <h3 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
                  {t("storytelling.impactTitle", "The Impact")}
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] dark:text-zinc-300 leading-relaxed">
                  {t("storytelling.impactDesc", "Measurable, transparent economic empowerment. Direct digital payments via UPI, revival of endangered crafts, and sustainable livelihood security for artisan cooperatives across Eastern India.")}
                </p>

                {/* Mini Impact Ticker */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <div>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">90%</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Direct to Makers</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[#F47721]">
                      {liveImpact.artisans + liveImpact.guides + liveImpact.homestays}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Local Partners</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-950/60 flex items-center justify-between">
                <Link
                  to="/impact"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Live Data</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-muted-foreground font-mono">SFIC Eastern Zone</span>
              </div>
            </div>
          </div>

          {/* CTA Row */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Button asChild size="lg" className="bg-[#F47721] hover:bg-[#E85D04] text-white px-6 font-semibold shadow-md">
              <Link to="/about">
                {t("storytelling.exploreStoryButton", "Read Full Impact Story →")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#F1D8C5] dark:border-white/10 px-6 font-semibold">
              <Link to="/impact">
                <TrendingUp className="w-4 h-4 mr-1 text-[#F47721]" />
                {t("storytelling.viewImpactData", "View Live Impact Dashboard")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== EXPLORE EASTERN INDIA ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
            <Map className="w-3.5 h-3.5" />
            Explore India by State
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
            Three States, Countless{" "}
            <span className="text-[#F47721]">Stories</span>
          </h2>
          <p className="text-[#777777] dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Dive deep into the heritage, nature, and culture of Eastern India —
            one stamp at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {easternStates.map((state) => (
            <Link
              key={state.slug}
              to="/explore/$stateSlug"
              params={{ stateSlug: state.slug }}
              className="group relative rounded-3xl overflow-hidden h-80 block hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={state.image}
                alt={state.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${state.color}`}
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="text-3xl mb-2">{state.emoji}</div>
                <div className="text-white/70 text-xs uppercase tracking-wider mb-1">
                  {state.tagline}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {state.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {state.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
                  Explore {state.name}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== DISCOVER HERITAGE THROUGH STAMPS ===================== */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] py-20 border-t border-b border-[#F1D8C5] dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
                <Stamp className="w-3.5 h-3.5" />
                Stamp to Destination
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-2">
                Every Stamp Tells a{" "}
                <span className="text-[#F47721]">Story</span>
              </h2>
              <p className="text-[#777777] dark:text-zinc-400 max-w-lg leading-relaxed">
                Browse by category and discover the heritage, history, and
                places behind India's postage stamps.
              </p>
            </div>
            <Link
              to="/stamps"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors whitespace-nowrap"
            >
              View all stamps
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stampCategories.map((c, i) => (
              <Link
                key={c.name}
                to="/stamps"
                search={{ category: c.name }}
                className="p-6 rounded-2xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] hover:shadow-2xl transition-all duration-300 group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E5] dark:bg-[#F47721]/15 grid place-items-center mb-5 group-hover:scale-110 group-hover:bg-[#F47721] transition-all duration-500">
                  <c.icon className="w-5 h-5 text-[#F47721] group-hover:text-white transition-colors" />
                </div>

                <h3 className="font-semibold text-lg text-[#252525] dark:text-zinc-100">
                  {c.name}
                </h3>

                <p className="text-sm text-[#777777] dark:text-zinc-400 mt-1.5">{c.desc}</p>

                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#F47721] opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== POPULAR HERITAGE DESTINATIONS ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Heritage Destinations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-2">
              Popular <span className="text-[#F47721]">Destinations</span>
            </h2>
            <p className="text-[#777777] dark:text-zinc-400 max-w-lg leading-relaxed">
              Explore iconic heritage sites across West Bengal, Bihar, and
              Jharkhand — each with related stamps, local guides, and
              artisan experiences.
            </p>
          </div>
          <Link
            to="/heritage"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors whitespace-nowrap"
          >
            All destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => {
            const stateTag: Record<string, string> = {
              "West Bengal":
                "bg-[#FFF0E5] text-[#F47721] border border-[#F47721]/20 dark:bg-[#F47721]/15",
              Bihar: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40",
              Jharkhand: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800/40",
            };
            const categoryTag: Record<string, string> = {
              Heritage: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
              Nature: "bg-green-100 text-green-900 dark:bg-green-950/60 dark:text-green-300",
              Spiritual: "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300",
              Cultural: "bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300",
              Wildlife: "bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300",
            };
            const destImg = getDestinationAsset(dest, dest.image);
            return (
              <Link
                key={dest.id}
                to="/heritage/$destinationId"
                params={{ destinationId: dest.id }}
                className="group bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="relative h-48 overflow-hidden">
                  <SafeImage
                    src={destImg}
                    alt={dest.name}
                    fallbackIcon="landmark"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${stateTag[dest.state]}`}
                    >
                      {dest.state}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${categoryTag[dest.category]}`}
                    >
                      {dest.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-lg leading-tight">
                      {dest.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400 shrink-0">
                      <MapPin className="w-3 h-3 text-[#F47721]" />
                      {dest.district}
                    </div>
                  </div>
                  <p className="text-sm text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                    {dest.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dest.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-[10px] font-medium rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F47721] group-hover:text-[#E85D04] transition-colors">
                    Explore Destination
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===================== LOCAL HANDICRAFTS ===================== */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] py-20 border-t border-b border-[#F1D8C5] dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
                <ShoppingBag className="w-3.5 h-3.5" />
                Artisan Marketplace
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-2">
                Explore Local{" "}
                <span className="text-[#F47721]">Handicrafts</span>
              </h2>
              <p className="text-[#777777] dark:text-zinc-400 max-w-lg leading-relaxed">
                Directly support local artisans from West Bengal, Bihar, and
                Jharkhand by discovering and enquiring about their handmade
                products.
              </p>
            </div>
            <Link
              to="/handicrafts"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors whitespace-nowrap"
            >
              Browse all handicrafts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => {
              const productImg = getProductAsset(product, product.image);
              return (
                <Link
                  key={product.id}
                  to="/handicrafts"
                  className="group bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className="relative h-44 overflow-hidden bg-[#FFF0E5] dark:bg-zinc-800">
                    <SafeImage
                      src={productImg}
                      alt={product.name}
                      fallbackIcon="craft"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#F47721] border border-[#F47721]/20">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-sm leading-tight mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-xs text-[#F47721] font-medium mb-1">
                      {product.artisanName}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400 mb-3">
                      <MapPin className="w-3 h-3 text-[#F47721]" />
                      {product.district}, {product.state}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#F47721]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                      <span className="text-xs text-[#F47721] font-semibold hover:underline">
                        Enquire →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== MEET LOCAL GUIDES ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
              <UserCheck className="w-3.5 h-3.5" />
              Local Guides
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-2">
              Meet Your <span className="text-[#F47721]">Local Guides</span>
            </h2>
            <p className="text-[#777777] dark:text-zinc-400 max-w-lg leading-relaxed">
              Independent local guides who bring destinations to life with
              authentic stories and genuine cultural connections.
            </p>
          </div>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors whitespace-nowrap"
          >
            All guides
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {featuredGuides.map((guide) => {
            const guideImg = getGuideAsset(guide, guide.image);
            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F47721]/30 shrink-0">
                    <SafeImage
                      src={guideImg}
                      alt={guide.name}
                      fallbackIcon="guide"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-sm leading-tight mb-1">
                      {guide.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400">
                      <MapPin className="w-3 h-3 text-[#F47721]" />
                      {guide.district}, {guide.state}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {guide.languages.slice(0, 3).map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-[10px] font-medium rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between text-xs text-[#777777] dark:text-zinc-400 pt-2 border-t border-[#F1D8C5]/50 dark:border-white/5">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#F47721]" />
                    {guide.experience} exp
                  </span>
                  <Link
                    to="/guides"
                    className="text-xs font-semibold text-[#F47721] hover:underline"
                  >
                    Contact →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== HOMESTAYS ===================== */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] py-20 border-t border-b border-[#F1D8C5] dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-5">
                <HomeIcon className="w-3.5 h-3.5" />
                Stay Local
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-4">
                Stay Local,{" "}
                <span className="text-[#F47721]">Experience More</span>
              </h2>
              <p className="text-[#777777] dark:text-zinc-400 leading-relaxed mb-6">
                Go beyond hotels. Stay with local families, taste home-cooked
                regional cuisines, and immerse yourself in the living culture of
                Eastern India.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Authentic home-cooked meals included",
                  "Cultural experiences and workshops",
                  "Direct connection with local families",
                  "Enquiry-based booking — no fake confirmations",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#F47721]/10 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#F47721]" />
                    </div>
                    <span className="text-sm text-[#777777] dark:text-zinc-300">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/homestays"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold text-sm hover:bg-[#E85D04] transition-colors shadow-md"
              >
                Explore Homestays
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Homestay cards preview with auto-matched assets & SafeImage */}
            <div className="grid grid-cols-2 gap-4">
              {homestays.slice(0, 4).map((hs) => {
                const photos = getHomestayAssets(hs, hs.images);
                const cover = photos[0];
                return (
                  <Link
                    key={hs.id}
                    to="/homestays"
                    className="group rounded-xl overflow-hidden border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] hover:shadow-xl transition-all"
                  >
                    <div className="h-32 overflow-hidden relative">
                      <SafeImage
                        src={cover}
                        alt={hs.name}
                        fallbackIcon="home"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-[#252525] dark:text-zinc-100 text-xs leading-tight mb-0.5 line-clamp-1">
                        {hs.name}
                      </div>
                      <div className="text-[10px] text-[#777777] dark:text-zinc-400 mb-1.5 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#F47721]" />
                        <span className="truncate">{hs.location}</span>
                      </div>
                      <div className="text-xs font-bold text-[#F47721]">
                        ₹{hs.pricePerNight.toLocaleString("en-IN")}/night
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW STAMP SAFAR WORKS ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 text-[#F47721] text-xs font-semibold uppercase tracking-wider mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
            How LokSetu <span className="text-[#F47721]">Works</span>
          </h2>
          <p className="text-[#777777] dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From a postage stamp to a living cultural experience — here's how
            our platform connects heritage with community.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              icon: Stamp,
              title: "Discover a Stamp",
              desc: "Browse our archive of Indian commemorative stamps covering heritage, wildlife, festivals, and history.",
            },
            {
              step: "02",
              icon: MapPin,
              title: "Explore the Destination",
              desc: "Every stamp links to its cultural destination — explore the historical background, significance, and attractions.",
            },
            {
              step: "03",
              icon: Users,
              title: "Connect with Community",
              desc: "Find local artisans, tour guides, and homestay hosts who make the destination come alive.",
            },
            {
              step: "04",
              icon: Heart,
              title: "Support Livelihoods",
              desc: "Your enquiries and purchases directly support local communities preserving India's cultural heritage.",
            },
          ].map((item, i) => (
            <div key={item.step} className="relative">
              {i < 3 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[#F47721]/30 to-transparent z-0 -ml-6" />
              )}
              <div className="relative bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-[11px] font-bold text-[#F47721]/60 uppercase tracking-widest mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-[#F47721]" />
                </div>
                <h3 className="font-bold text-[#252525] dark:text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-sm text-[#777777] dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== COMMUNITY IMPACT ===================== */}
      <ImpactStats />

      {/* ===================== FINAL CTA ===================== */}
      <section className="bg-[#FFF0E5] dark:bg-[#181A20] border-t border-[#F1D8C5] dark:border-white/10 py-20 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-4xl mb-5">🏛️</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] dark:text-zinc-100 mb-4">
              Ready to Explore{" "}
              <span className="text-[#F47721]">Eastern India?</span>
            </h2>
            <p className="text-[#777777] dark:text-zinc-300 mb-8 leading-relaxed text-lg">
              Start your journey with a stamp. Discover a destination. Connect
              with a community. Support a livelihood.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/heritage"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#F47721] text-white font-semibold hover:bg-[#E85D04] transition-colors shadow-lg shadow-[#F47721]/30"
              >
                <Landmark className="w-5 h-5" />
                Explore Heritage
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#F47721] text-[#F47721] font-semibold hover:bg-[#F47721] hover:text-white transition-colors"
              >
                <Map className="w-5 h-5" />
                Discover States
              </Link>
              <Link
                to="/handicrafts"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#252525] dark:border-white/30 text-[#252525] dark:text-zinc-100 font-semibold hover:bg-[#252525] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Handicrafts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
