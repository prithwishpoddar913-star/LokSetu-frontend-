import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShoppingBag, Filter, MapPin, IndianRupee, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { localProducts, type LocalProduct } from "@/lib/heritage-data";
import { EnquiryModal } from "@/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/SafeImage";
import { getProductAsset } from "@/lib/assets";
import { supabase } from "@/lib/supabase";
import { calculateCommunitySplit } from "@/lib/impact-config";

export const Route = createFileRoute("/handicrafts")({
  head: () => ({
    meta: [
      { title: "Local Handicrafts — Stamp Safar" },
      {
        name: "description",
        content:
          "Discover authentic handicrafts from West Bengal, Bihar, and Jharkhand. Connect with local artisans and explore India's rich craft traditions.",
      },
    ],
  }),
  component: HandicraftsPage,
});

type StateFilter = "All" | "West Bengal" | "Bihar" | "Jharkhand";
type CategoryFilter = "All" | string;

const categoryList = [
  "All",
  "Terracotta",
  "Handloom",
  "Textiles",
  "Paintings",
  "Bamboo & Grass",
  "Metal Art",
  "Food & Beverage",
  "Bamboo",
  "Souvenirs",
];

function HandicraftsPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState("");
  const [liveArtisans, setLiveArtisans] = useState<LocalProduct[]>([]);

  useEffect(() => {
    async function loadApprovedArtisans() {
      try {
        const { data, error } = await supabase
          .from("artisans")
          .select("*")
          .eq("status", "approved");

        if (!error && data && data.length > 0) {
          const mapped: LocalProduct[] = data.map((a: any) => ({
            id: `sb-artisan-${a.id}`,
            name: a.craft || "Handcrafted Heritage Art",
            artisanName: a.name,
            state: a.state as any,
            district: a.district || a.state,
            category: "Traditional Craft",
            price: 1450,
            description: a.story || `Master traditional artisan specializing in ${a.craft}. Handcrafted with indigenous materials.`,
            image: a.image || "",
            isDemoData: false,
          }));
          setLiveArtisans(mapped);
        }
      } catch (e) {
        console.warn("Failed to load approved artisans:", e);
      }
    }
    loadApprovedArtisans();
  }, []);

  const allProducts = [...liveArtisans, ...localProducts];

  const filtered = allProducts.filter((p) => {
    const stateMatch = stateFilter === "All" || p.state === stateFilter;
    const catMatch = categoryFilter === "All" || p.category === categoryFilter;
    return stateMatch && catMatch;
  });

  const openEnquiry = (productName: string, artisan: string) => {
    setEnquirySubject(`Handicraft Enquiry: ${productName} by ${artisan}`);
    setEnquiryOpen(true);
  };

  const states: StateFilter[] = ["All", "West Bengal", "Bihar", "Jharkhand"];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#252525] to-[#E85D04]/70 py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <ShoppingBag className="w-3.5 h-3.5 text-[#F47721]" />
            Artisan Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover Authentic{" "}
            <span className="text-[#F47721]">Indian Handicrafts</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Connect with master artisans from West Bengal, Bihar, and Jharkhand. Each piece carries centuries of tradition and skill.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F47721]" />
              Verified local artisans & GI-tagged crafts
            </div>
            <Link to="/onboard">
              <Button size="sm" className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                Artisan? Apply to Join Network
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pilot Catalog & Fair-Trade Notice */}
      <section className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="container mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
            <span>
              <strong>Fair-Trade Guarantee:</strong> Exactly 90% of every sale goes directly to the master artisan. Demo listings below illustrate our curated regional craft catalogue while real artisans complete onboarding.
            </span>
          </div>
          <Link to="/impact" className="underline font-semibold hover:text-[#F47721] shrink-0">
            View Live Impact Data →
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-md border-b border-[#F1D8C5] dark:border-white/10 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter className="w-4 h-4 text-[#777777] dark:text-zinc-400" />
              <span className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider">State</span>
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
            <div className="hidden sm:block w-px h-5 bg-[#F1D8C5] dark:bg-white/10 mx-1" />
            <div className="flex items-center gap-1.5 mr-1">
              <span className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider">Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${categoryFilter === c
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

      {/* Products Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-10">
        <div className="mb-5">
          <p className="text-sm text-[#777777] dark:text-zinc-400 font-medium">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#777777] dark:text-zinc-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No products match the selected filters.</p>
            <button
              onClick={() => { setStateFilter("All"); setCategoryFilter("All"); }}
              className="mt-3 text-[#F47721] text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const imageSrc = getProductAsset(product, product.image);

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <SafeImage
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      fallbackType="bag"
                      label={product.name}
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 pointer-events-none">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#F47721] border border-[#F47721]/30">
                        {product.category}
                      </span>
                      {product.isDemoData ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                          Demo · Pilot Catalog
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Artisan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-sm leading-tight mb-1">
                      {product.name}
                    </h3>
                    <div className="text-xs text-[#F47721] font-medium mb-1">{product.artisanName}</div>
                    <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400 mb-2">
                      <MapPin className="w-3 h-3 text-[#F47721]" />
                      {product.district}, {product.state}
                    </div>
                    <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed mb-3 flex-1 line-clamp-3">
                      {product.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-[#F1D8C5]/60 dark:border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 font-bold text-[#F47721]">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{product.price.toLocaleString("en-IN")}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openEnquiry(product.name, product.artisanName)}
                          className="bg-[#F47721] hover:bg-[#E85D04] text-white h-7 text-xs px-3 shadow-sm"
                        >
                          Enquire
                        </Button>
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        90% (₹{Math.round(product.price * 0.9).toLocaleString("en-IN")}) direct to artisan
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Demo notice */}
      <section className="container mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-2xl bg-[#FFF0E5] dark:bg-[#181A20] border border-[#F1D8C5] dark:border-white/10 p-5 text-center">
          <p className="text-sm text-[#777777] dark:text-zinc-300">
            <span className="font-semibold text-[#F47721]">Artisan Network:</span>{" "}
            Every craft represents generations of artistic mastery from West Bengal, Bihar, and Jharkhand. You can enquire directly with our regional craft collectives and artisans.
          </p>
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
