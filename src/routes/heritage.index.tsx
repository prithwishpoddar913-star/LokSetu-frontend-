import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ArrowRight, Filter, Stamp } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { destinations, type Destination } from "@/lib/destinations";
import { SafeImage } from "@/components/SafeImage";
import { getDestinationAsset } from "@/lib/assets";

export const Route = createFileRoute("/heritage/")({
  head: () => ({
    meta: [
      { title: "Heritage Explorer — Stamp Safar" },
      {
        name: "description",
        content:
          "Discover the cultural and historical destinations of Eastern India — West Bengal, Bihar, and Jharkhand — through the lens of India's stamps.",
      },
    ],
  }),
  component: HeritageIndexPage,
});

const categoryColors: Record<Destination["category"], string> = {
  Heritage: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40",
  Nature: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/40",
  Spiritual: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40",
  Cultural: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40",
  Wildlife: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700/40",
};

const stateColors: Record<string, string> = {
  "West Bengal": "bg-[#FFF0E5] dark:bg-[#F47721]/20 text-[#F47721] border border-[#F47721]/30",
  Bihar: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40",
  Jharkhand: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40",
};

type StateFilter = "All" | "West Bengal" | "Bihar" | "Jharkhand";
type CategoryFilter = "All" | Destination["category"];

function HeritageIndexPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

  const filtered = destinations.filter((d) => {
    const stateMatch = stateFilter === "All" || d.state === stateFilter;
    const categoryMatch = categoryFilter === "All" || d.category === categoryFilter;
    return stateMatch && categoryMatch;
  });

  const states: StateFilter[] = ["All", "West Bengal", "Bihar", "Jharkhand"];
  const categories: CategoryFilter[] = ["All", "Heritage", "Nature", "Spiritual", "Cultural", "Wildlife"];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#252525] via-[#3a2a1a] to-[#E85D04] py-20 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1584697964154-3a05b5b0e16a?w=1600&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#252525]/90 to-[#E85D04]/70" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <Stamp className="w-3.5 h-3.5 text-[#F47721]" />
            Eastern India Heritage
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            Discover India{" "}
            <span className="text-[#F47721]">Through Stamps</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Every postage stamp tells a story. Explore the cultural heritage, historical wonders, and natural beauty of West Bengal, Bihar, and Jharkhand — connected by the stamps that celebrated them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold hover:bg-[#E85D04] transition-colors shadow-md"
            >
              Explore by State
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/stamps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Browse Stamps
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-md border-b border-[#F1D8C5] dark:border-white/10 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4 text-[#777777] dark:text-zinc-400" />
              <span className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider">Filter</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {states.map((s) => (
                <button
                  key={s}
                  onClick={() => setStateFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    stateFilter === s
                      ? "bg-[#F47721] text-white shadow-sm"
                      : "bg-[#FFF0E5] dark:bg-white/5 text-[#F47721] dark:text-zinc-300 hover:bg-[#F47721] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#F1D8C5] dark:bg-white/10 mx-1" />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    categoryFilter === c
                      ? "bg-[#252525] dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                      : "bg-gray-100 dark:bg-white/5 text-[#777777] dark:text-zinc-400 hover:bg-[#252525] hover:text-white dark:hover:bg-white dark:hover:text-zinc-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destination Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100">
            {filtered.length} Destination{filtered.length !== 1 ? "s" : ""}
            {stateFilter !== "All" && ` in ${stateFilter}`}
            {categoryFilter !== "All" && ` · ${categoryFilter}`}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#777777] dark:text-zinc-400">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No destinations match the selected filters.</p>
            <button
              onClick={() => { setStateFilter("All"); setCategoryFilter("All"); }}
              className="mt-3 text-[#F47721] text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function DestinationCard({ destination: d }: { destination: Destination }) {
  const imageSrc = getDestinationAsset(d.name) || d.image;

  return (
    <div className="group bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <SafeImage
          src={imageSrc}
          alt={d.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackType="landmark"
          label={d.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${stateColors[d.state] || "bg-zinc-100 text-zinc-800"}`}>
            {d.state}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${categoryColors[d.category]}`}>
            {d.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-lg leading-tight group-hover:text-[#F47721] transition-colors">
            {d.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400 shrink-0">
            <MapPin className="w-3 h-3 text-[#F47721]" />
            {d.district}
          </div>
        </div>
        <p className="text-sm text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4 flex-1">
          {d.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {d.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-[10px] font-medium rounded-full border border-transparent dark:border-[#F47721]/20"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          to="/heritage/$destinationId"
          params={{ destinationId: d.id }}
          className="flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors group/link mt-auto pt-2 border-t border-[#F1D8C5]/40 dark:border-white/5"
        >
          Explore Destination
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
