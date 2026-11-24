import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Heart,
  HeartHandshake,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stamp,
  TrendingUp,
  Users,
  Award,
  Globe2,
  Mail,
  Phone,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About & Impact Story — LokSetu | SFIC East",
      },
      {
        name: "description",
        content:
          "Discover how LokSetu transforms postage stamps into tourism and rural livelihoods for traditional artisans and homestay hosts across West Bengal, Bihar, and Jharkhand.",
      },
      {
        property: "og:title",
        content: "LokSetu — From Stamps to Destinations, From Heritage to Livelihood",
      },
      {
        property: "og:description",
        content:
          "Seva First Innovation Challenge entry: Fair-trade digital empowerment for rural artisans and youth guides in Eastern India.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#252525] via-[#2D1F13] to-[#E85D04] py-20 lg:py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#F47721_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="container mx-auto px-4 sm:px-6 relative text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-6 text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#F47721]" />
            Seva First Innovation Challenge (SFIC East)
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            From Stamps to <span className="text-[#F47721]">Destinations</span>,
            <br />
            From Heritage to <span className="text-[#F47721]">Livelihood</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            A technology-driven social innovation connecting India's historic postal philately to living cultural destinations and direct fair-trade income for rural communities.
          </p>
        </div>
      </section>

      {/* 1. THE PROBLEM STATEMENT */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
              <AlertCircle className="w-3.5 h-3.5" />
              The Core Problem
            </div>
            <h2 className="text-3xl font-bold text-[#252525] dark:text-zinc-100 leading-snug">
              Why Traditional Heritage Fails to Support Rural Communities
            </h2>
            <div className="mt-5 space-y-4 text-sm sm:text-base text-[#777777] dark:text-zinc-300 leading-relaxed">
              <p>
                Across <strong>West Bengal, Bihar, and Jharkhand</strong>, thousands of master artisans (Bankura terracotta, Madhubani painting, Sohrai tribal murals) and local youth tour guides possess extraordinary cultural knowledge. Yet, they remain economically vulnerable.
              </p>
              <p>
                <strong>The Middleman Trap:</strong> In traditional handicraft sales, commercial middlemen and urban emporiums capture 60% to 75% of consumer retail value, leaving the rural creator with razor-thin subsistence wages.
              </p>
              <p>
                <strong>The Information Disconnect:</strong> While the Indian Postal Service has issued hundreds of magnificent commemorative stamps honoring monuments and folk arts, the stories behind them remain locked in collectors' albums rather than driving tourists to the actual villages and homestays.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-8 space-y-5">
            <h3 className="font-bold text-lg text-red-900 dark:text-red-200">Who Is Affected?</h3>
            <ul className="space-y-4 text-sm text-[#777777] dark:text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/80 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-foreground">Rural Master Artisans:</strong> Clay modelers in Kumartuli, Dokra metalcasters in Bikna, and Madhubani painters in Mithila who lack direct digital storefronts.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/80 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-foreground">Local Youth Guides:</strong> Knowledgeable regional youth in Nalanda, Bodh Gaya, and Purulia who miss out on organized tourism earnings.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/80 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-foreground">Village Homestay Hosts:</strong> Families opening their homes for authentic cultural stays in rural hills, forests, and handicraft clusters.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. OUR SOLUTION & HOW IT WORKS (4 STEPS) */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] border-y border-[#F1D8C5] dark:border-white/10 py-16 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F47721]/15 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Our Practical Solution
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-zinc-100">
              The 4-Step Cultural Livelihood Bridge
            </h2>
            <p className="mt-3 text-sm text-[#777777] dark:text-zinc-400">
              How LokSetu transforms a collectible stamp into income for an artisan family.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Philatelic Discovery",
                desc: "Every stamp tells a verified historical story—freedom fighters, national parks, temple terracotta, or tribal music.",
                icon: Stamp,
              },
              {
                step: "02",
                title: "Destination Geocoding",
                desc: "The stamp directly navigates users to its origin: 18 curated cultural clusters across West Bengal, Bihar, and Jharkhand.",
                icon: MapPin,
              },
              {
                step: "03",
                title: "Direct Community Link",
                desc: "Visitors explore authenticated handicraft products, contact verified local youth guides, or book authentic family homestays.",
                icon: Users,
              },
              {
                step: "04",
                title: "90% Direct Payouts",
                desc: "Direct digital UPI & banking payouts ensure 90% of order value goes straight to the creator, bypassing all commercial middlemen.",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-[#1A1C23] border border-[#F1D8C5] dark:border-white/10 rounded-2xl p-6 relative hover:shadow-lg transition"
              >
                <div className="text-3xl font-black text-[#F47721]/20 dark:text-[#F47721]/30 mb-2 font-mono">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-[#252525] dark:text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SUSTAINABLE DEVELOPMENT GOALS (SDGs) */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="border-[#F47721] text-[#F47721] mb-3">
            United Nations SDG Alignment
          </Badge>
          <h2 className="text-3xl font-bold text-[#252525] dark:text-zinc-100">
            Committed to Sustainable Development
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {IMPACT_CONFIG.sdgs.map((sdg) => (
            <div
              key={sdg.sdg}
              className="rounded-3xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#1A1C23] p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F47721] text-white flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                  {sdg.sdg}
                </div>
                <h3 className="font-bold text-base text-[#252525] dark:text-zinc-100 mb-2">
                  {sdg.title}
                </h3>
                <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed">
                  {sdg.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1D8C5]/60 dark:border-white/10 text-[11px] font-semibold text-[#F47721]">
                SDG Goal {sdg.sdg}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SUSTAINABILITY & BUSINESS MODEL (TASK 14) */}
      <section className="bg-[#FFF0E5]/60 dark:bg-[#16181E] border-y border-[#F1D8C5] dark:border-white/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F47721] block mb-2">
                Task 14 · Financial Viability
              </span>
              <h2 className="text-3xl font-bold text-[#252525] dark:text-zinc-100 mb-4">
                Sustainability &amp; Fair-Trade Economics
              </h2>
              <p className="text-sm text-[#777777] dark:text-zinc-300 leading-relaxed mb-4">
                To guarantee longevity beyond the hackathon, LokSetu implements a transparent, self-sustaining financial framework:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-[#777777] dark:text-zinc-300">
                <div className="flex gap-2.5">
                  <span className="text-[#F47721] font-bold">✓</span>
                  <span><strong>90% Community Share:</strong> Artisans and homestay hosts receive 90% of every rupee paid on the platform directly to their bank/UPI account.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[#F47721] font-bold">✓</span>
                  <span><strong>10% Platform Fee:</strong> A small 10% fee covers cloud hosting, Supabase database, payment gateway fees, and SMS notifications.</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[#F47721] font-bold">✓</span>
                  <span><strong>Zero Listing Fees:</strong> Registration and onboarding are 100% free for all rural artisans, guides, and homestays.</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#F47721]/30 bg-white dark:bg-[#1A1C23] p-8 shadow-card text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Fair-Trade Revenue Distribution
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="text-5xl font-extrabold text-[#F47721]">90%</div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-foreground text-sm">Direct to Artisan</div>
                  <div className="text-xs text-muted-foreground">Community Payout</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-4">
                Remaining 10% strictly fuels platform infrastructure and field verification tours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STRATEGIC ROADMAP (TASK 14) */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="border-border text-foreground mb-3">
            Expansion Plan
          </Badge>
          <h2 className="text-3xl font-bold text-[#252525] dark:text-zinc-100">
            Scalability Roadmap
          </h2>
        </div>

        <div className="space-y-6">
          {IMPACT_CONFIG.roadmap.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-2xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#1A1C23] p-6 shadow-sm hover:border-[#F47721]/50 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F47721] uppercase">
                    {phase.phase}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <h3 className="font-bold text-base text-[#252525] dark:text-zinc-100">
                    {phase.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{phase.timeline}</span>
                  <Badge
                    variant="outline"
                    className={
                      phase.status.includes("Current")
                        ? "border-[#F47721] bg-[#F47721]/10 text-[#F47721]"
                        : "border-border text-muted-foreground"
                    }
                  >
                    {phase.status}
                  </Badge>
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-[#777777] dark:text-zinc-300">
                {phase.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#F47721] font-bold">›</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TEAM SECTION */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] border-t border-[#F1D8C5] dark:border-white/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F47721] block mb-2">
              Seva First Innovation Team
            </span>
            <h2 className="text-3xl font-bold text-[#252525] dark:text-zinc-100">
              Meet the Project Architects
            </h2>
          </div>

          <div className="flex justify-center max-w-xl mx-auto">
            {IMPACT_CONFIG.team.map((member) => (
              <div
                key={member.name}
                className="w-full bg-white dark:bg-[#1A1C23] border border-[#F1D8C5] dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col justify-between text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F47721] to-[#E85D04] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-md">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="font-bold text-xl text-[#252525] dark:text-zinc-100">
                    {member.name}
                  </h3>
                  <div className="text-sm font-semibold text-[#F47721] mt-1 mb-3">{member.role}</div>
                  <p className="text-sm text-[#777777] dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                    {member.bio}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F1D8C5]/60 dark:border-white/10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 hover:text-[#F47721] transition-colors">
                      <Mail className="w-4 h-4 text-[#F47721]" />
                      {member.email}
                    </a>
                  )}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 hover:text-[#F47721] transition-colors">
                      <Phone className="w-4 h-4 text-[#F47721]" />
                      {member.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
