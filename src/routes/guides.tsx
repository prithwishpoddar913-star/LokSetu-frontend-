import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  UserCheck,
  MapPin,
  Filter,
  Languages,
  Star,
  ArrowRight,
  MessageCircle,
  Clock,
  Info,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { guides, type Guide } from "@/lib/heritage-data";
import { EnquiryModal } from "@/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import { getGuideAsset } from "@/lib/assets";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Local Tour Guides — LokSetu" },
      {
        name: "description",
        content:
          "Connect with experienced local tour guides across West Bengal, Bihar, and Jharkhand. Discover authentic heritage experiences guided by locals who know the land.",
      },
    ],
  }),
  component: GuidesPage,
});

type StateFilter = "All" | "West Bengal" | "Bihar" | "Jharkhand";

const stateColors: Record<string, string> = {
  "West Bengal": "bg-[#FFF0E5] dark:bg-[#F47721]/20 text-[#F47721] border border-[#F47721]/30",
  Bihar: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40",
  Jharkhand: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40",
};

function GuidesPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState("");
  const [liveGuides, setLiveGuides] = useState<Guide[]>([]);

  useEffect(() => {
    async function loadApprovedGuides() {
      try {
        const { data, error } = await supabase
          .from("guides")
          .select("*")
          .eq("status", "approved");

        if (!error && data && data.length > 0) {
          const mapped: Guide[] = data.map((g: any) => ({
            id: `sb-guide-${g.id}`,
            name: g.name,
            state: g.state as any,
            district: g.state,
            languages: typeof g.languages === "string" ? g.languages.split(",").map((l: string) => l.trim()) : ["Bengali", "Hindi", "English"],
            experience: `${g.experience_years || 3} years`,
            expertise: [g.expertise || "Historical Heritage Tour"],
            destinations: Array.isArray(g.destinations) ? g.destinations : ["Heritage Sites"],
            description: `Certified local storyteller and cultural guide for ${g.state}. Dedicated to authentic community tourism.`,
            isDemoData: false,
          }));
          setLiveGuides(mapped);
        }
      } catch (e) {
        console.warn("Failed to load approved guides:", e);
      }
    }
    loadApprovedGuides();
  }, []);

  const allGuides = [...liveGuides, ...guides];

  const filtered = allGuides.filter(
    (g) => stateFilter === "All" || g.state === stateFilter,
  );

  const states: StateFilter[] = ["All", "West Bengal", "Bihar", "Jharkhand"];

  const openEnquiry = (guide: Guide) => {
    setEnquirySubject(`Guide Booking Enquiry: ${guide.name} — ${guide.state}`);
    setEnquiryOpen(true);
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#252525] via-[#3a2a1a] to-[#E85D04] py-20 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#252525]/90 to-[#E85D04]/70" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <UserCheck className="w-3.5 h-3.5 text-[#F47721]" />
            Local Expert Guides
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            Discover with{" "}
            <span className="text-[#F47721]">Local Guides</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Our independent local guides bring destinations to life with authentic stories, cultural insights and connections to the communities that make Eastern India extraordinary.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F47721]" />
              Verified guide profiles for authentic cultural tours
            </div>
            <Link to="/onboard">
              <Button size="sm" className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                Guide? Apply to Join Network
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pilot Catalog Notice */}
      <section className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="container mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
            <span>
              <strong>Fair-Trade Guarantee:</strong> Exactly 90% of guiding tour fees go directly to the youth guides. Demo profiles below illustrate regional destinations while real guides complete verification.
            </span>
          </div>
          <Link to="/impact" className="underline font-semibold hover:text-[#F47721] shrink-0">
            View Live Impact Data →
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-[#FFF7F0] dark:bg-[#121316] border-b border-[#F1D8C5] dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              {
                step: "1",
                title: "Browse Guides",
                desc: "Explore profiles filtered by state, language, and expertise",
              },
              {
                step: "2",
                title: "Send Enquiry",
                desc: "Contact your preferred guide directly through the platform",
              },
              {
                step: "3",
                title: "Plan Your Visit",
                desc: "Work with the guide to create your personalised experience",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#F47721] text-white font-bold text-lg flex items-center justify-center mb-3 shadow-sm">
                  {item.step}
                </div>
                <div className="font-semibold text-[#252525] dark:text-zinc-100 mb-1">
                  {item.title}
                </div>
                <p className="text-xs text-[#777777] dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-md border-b border-[#F1D8C5] dark:border-white/10 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4 text-[#777777] dark:text-zinc-400" />
              <span className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider">
                Filter by State
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {states.map((s) => (
                <button
                  key={s}
                  onClick={() => setStateFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${stateFilter === s
                      ? "bg-[#F47721] text-white shadow-sm"
                      : "bg-[#FFF0E5] dark:bg-white/5 text-[#F47721] dark:text-zinc-300 hover:bg-[#F47721] hover:text-white"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100">
            {filtered.length} Guide{filtered.length !== 1 ? "s" : ""}
            {stateFilter !== "All" && ` in ${stateFilter}`}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#777777] dark:text-zinc-400">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No guides found for the selected filter.</p>
            <button
              onClick={() => setStateFilter("All")}
              className="mt-3 text-[#F47721] text-sm font-medium hover:underline"
            >
              Show all guides
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide) => (
              <GuideCard key={guide.id} guide={guide} onEnquire={openEnquiry} />
            ))}
          </div>
        )}
      </section>

      {/* Register as Guide CTA */}
      <section className="bg-[#FFF0E5] dark:bg-[#121316] border-t border-[#F1D8C5] dark:border-white/10 py-14 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-[#F47721] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
              Are You a Local Guide?
            </h2>
            <p className="text-[#777777] dark:text-zinc-400 mb-6 leading-relaxed">
              Join LokSetu as an independent tour guide. Create your profile,
              showcase your expertise, and connect with tourists who want authentic
              local experiences across Eastern India.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/onboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold text-sm hover:bg-[#E85D04] transition-colors shadow-sm"
              >
                Register as Guide
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/heritage"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F47721] text-[#F47721] dark:text-[#F47721] font-semibold text-sm hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 transition-colors"
              >
                Explore Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        subject={enquirySubject}
      />
    </SiteLayout>
  );
}

function GuideCard({
  guide,
  onEnquire,
}: {
  guide: Guide;
  onEnquire: (guide: Guide) => void;
}) {
  const guideAsset = getGuideAsset(guide.name);

  return (
    <div className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Header with image placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-[#FFF0E5] to-[#F1D8C5] dark:from-[#252525] dark:to-[#181A20] flex items-center justify-center">
        {guideAsset ? (
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-[#181A20] shadow-md">
            <SafeImage
              src={guideAsset}
              alt={guide.name}
              className="w-full h-full object-cover"
              fallbackType="user"
              label={guide.name}
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white dark:bg-[#181A20] border-4 border-[#F47721]/20 dark:border-[#F47721]/40 flex items-center justify-center shadow-md">
            <UserCheck className="w-10 h-10 text-[#F47721]" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${stateColors[guide.state]}`}
          >
            {guide.state}
          </span>
          {guide.isDemoData ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
              Demo · Pilot Profile
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Guide
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Name & Location */}
        <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-base mb-1 leading-tight">
          {guide.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-zinc-400 mb-3">
          <MapPin className="w-3 h-3 text-[#F47721]" />
          {guide.district}, {guide.state}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400">
            <Clock className="w-3 h-3 text-[#F47721]" />
            {guide.experience}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            Expert Guide
          </div>
        </div>

        {/* Languages */}
        <div className="mb-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            <Languages className="w-3 h-3" /> Languages
          </div>
          <div className="flex flex-wrap gap-1.5">
            {guide.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-[10px] font-medium rounded-full border border-transparent dark:border-[#F47721]/20"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Expertise */}
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Expertise
          </div>
          <div className="flex flex-wrap gap-1.5">
            {guide.expertise.slice(0, 3).map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-[#777777] dark:text-zinc-300 text-[10px] rounded-full border border-transparent dark:border-white/10"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-3 mb-4 flex-1">
          {guide.description}
        </p>

        {/* Destinations covered */}
        <div className="mb-4 p-3 bg-[#FFF7F0] dark:bg-[#121316] rounded-xl border border-[#F1D8C5] dark:border-white/10">
          <div className="text-[10px] font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Destinations Covered
          </div>
          <div className="flex flex-wrap gap-1">
            {guide.destinations.slice(0, 4).map((dest) => (
              <span
                key={dest}
                className="text-[10px] text-[#F47721] font-medium"
              >
                {dest}
                {guide.destinations.indexOf(dest) <
                  Math.min(guide.destinations.length, 4) - 1 && " · "}
              </span>
            ))}
          </div>
        </div>

        {/* Fair-Trade Payout Note */}
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-3">
          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
          90% (₹1,080/day) remitted directly to local guide
        </p>

        {/* CTA */}
        <Button
          onClick={() => onEnquire(guide)}
          className="w-full bg-[#F47721] hover:bg-[#E85D04] text-white gap-2 shadow-sm"
          size="sm"
        >
          <MessageCircle className="w-4 h-4" />
          Send Booking Enquiry
        </Button>
      </div>
    </div>
  );
}

