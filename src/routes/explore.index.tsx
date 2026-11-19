import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Stamp, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { statesData } from "@/lib/states";

export const Route = createFileRoute("/explore/")({
  head: () => ({
    meta: [
      { title: "Explore India — Stamp Safar" },
      {
        name: "description",
        content:
          "Explore India's eastern states — West Bengal, Bihar, and Jharkhand — through their stamps, heritage, and cultural traditions.",
      },
    ],
  }),
  component: ExploreIndexPage,
});

function ExploreIndexPage() {
  const states = Object.values(statesData);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#252525] to-[#3a2010] py-16 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <Stamp className="w-3.5 h-3.5 text-[#F47721]" />
            Eastern India Region
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Explore <span className="text-[#F47721]">India by State</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-base">
            Three states, countless stories. Dive deep into the heritage, nature, and living culture of Eastern India — one stamp at a time.
          </p>
        </div>
      </section>

      {/* State Cards */}
      <section className="container mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-10">
          {states.map((state, idx) => (
            <div
              key={state.slug}
              className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 rounded-3xl overflow-hidden border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] shadow-sm hover:shadow-lg transition-all`}
            >
              {/* Image */}
              <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                <img
                  src={state.image}
                  alt={state.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${state.color}`} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white/80 text-xs uppercase tracking-wider mb-1 font-semibold">{state.tagline}</div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-sm">{state.name}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 p-7 flex flex-col justify-center">
                <p className="text-[#777777] dark:text-zinc-300 leading-relaxed mb-5">{state.description}</p>

                {/* Highlights */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider mb-2">Highlights</div>
                  <div className="flex flex-wrap gap-2">
                    {state.highlights.map((h) => (
                      <span key={h} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-xs font-medium rounded-full border border-transparent dark:border-[#F47721]/30">
                        <MapPin className="w-3 h-3" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-6">
                  {state.facts.map((f) => (
                    <div key={f.label}>
                      <div className="text-2xl font-bold text-[#F47721]">{f.value}</div>
                      <div className="text-xs text-[#777777] dark:text-zinc-400">{f.label}</div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/explore/$stateSlug"
                  params={{ stateSlug: state.slug }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold text-sm hover:bg-[#E85D04] transition-colors self-start shadow-sm"
                >
                  Explore {state.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FFF0E5] dark:bg-[#121316] border-t border-[#F1D8C5] dark:border-white/10 py-14">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100 mb-3">Want to Find the Stamps?</h2>
          <p className="text-[#777777] dark:text-zinc-400 mb-6 max-w-md mx-auto">
            Every destination here has stamps celebrating its heritage. Browse our philatelic archive.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/stamps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#252525] dark:bg-white text-white dark:text-zinc-900 font-semibold hover:bg-[#F47721] dark:hover:bg-[#F47721] dark:hover:text-white transition-colors"
            >
              Browse All Stamps
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/heritage"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F47721] text-[#F47721] font-semibold hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              All Heritage Sites
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
