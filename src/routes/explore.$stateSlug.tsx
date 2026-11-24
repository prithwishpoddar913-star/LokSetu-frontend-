import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  ArrowLeft,
  Search,
  ArrowRight,
  Stamp as StampIcon,
  ShoppingBag,
  UserCheck,
  Home as HomeIcon,
  Sparkles,
  Star,
  CheckCircle,
  Calendar,
  Languages,
  Compass,
  Utensils,
  Plane,
  Train,
  Car,
  Landmark,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { destinations, type Destination } from "@/lib/destinations";
import {
  localProducts,
  guides,
  homestays,
  type LocalProduct,
  type Guide,
  type Homestay,
} from "@/lib/heritage-data";
import { stamps, type Stamp } from "@/lib/stamps";
import { statesData, type StateData } from "@/lib/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import { EnquiryModal } from "@/components/EnquiryModal";
import {
  getDestinationAsset,
  getProductAsset,
  getGuideAsset,
  getHomestayAssets,
} from "@/lib/assets";

export const Route = createFileRoute("/explore/$stateSlug")({
  head: ({ params }) => {
    const stateData = statesData[params.stateSlug];
    const stateName = stateData?.name ?? "Destinations";
    return {
      meta: [
        { title: `${stateName} — Explore India | LokSetu` },
        {
          name: "description",
          content: `Explore heritage destinations, postage stamps, handicrafts, homestays, and tour guides in ${stateName}.`,
        },
      ],
    };
  },
  component: StateDestinationsPage,
});

function StateDestinationsPage() {
  const { stateSlug } = Route.useParams();
  const stateInfo: StateData | undefined = statesData[stateSlug];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState("");

  if (!stateInfo) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#252525] dark:text-zinc-100 mb-2">State Not Found</h1>
          <p className="text-sm text-[#777777] dark:text-zinc-400 mb-6">
            The state "{stateSlug}" is not currently in our Eastern India exploration scope.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F47721] text-white font-semibold text-sm hover:bg-[#E85D04] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const stateName = stateInfo.name;

  // State-specific destinations
  const stateDests = destinations.filter((d) => d.state === stateName);

  // Available categories for this state
  const categories = ["All", ...Array.from(new Set(stateDests.map((d) => d.category)))];

  // Filtered destinations
  const filtered = stateDests.filter((d) => {
    const matchCat = selectedCategory === "All" || d.category === selectedCategory;
    const matchSearch =
      search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.district.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // State-filtered related stamps
  const stateStamps: Stamp[] = stamps
    .filter(
      (s) =>
        s.state.toLowerCase() === stateName.toLowerCase() ||
        s.description.toLowerCase().includes(stateName.toLowerCase()) ||
        stateDests.some(
          (d) =>
            s.city.toLowerCase() === d.name.toLowerCase() ||
            s.city.toLowerCase() === d.district.toLowerCase(),
        ),
    )
    .slice(0, 6);

  // State-filtered handicrafts
  const stateProducts: LocalProduct[] = localProducts.filter((p) => p.state === stateName);

  // State-filtered guides
  const stateGuides: Guide[] = guides.filter((g) => g.state === stateName);

  // State-filtered homestays
  const stateHomestays: Homestay[] = homestays.filter((h) => h.state === stateName);

  const openEnquiry = (subject: string) => {
    setEnquirySubject(subject);
    setEnquiryOpen(true);
  };

  return (
    <SiteLayout>
      {/* ===================== HERO SECTION ===================== */}
      <div className="relative min-h-[420px] lg:h-[450px] overflow-hidden flex items-end">
        <SafeImage
          src={stateInfo.image}
          alt={stateName}
          fallbackIcon="landmark"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
        <div className="relative w-full p-6 sm:p-10 z-10">
          <div className="container mx-auto">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Explore India by State
            </Link>
            <div className="text-white/75 text-xs uppercase tracking-widest font-semibold mb-1">
              {stateInfo.tagline}
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 tracking-tight">{stateName}</h1>
            <p className="text-white/85 text-sm sm:text-base max-w-3xl leading-relaxed mb-6 font-normal">
              {stateInfo.description}
            </p>

            {/* Quick Facts Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 max-w-4xl">
              <div className="rounded-xl backdrop-blur-md bg-white/10 border border-white/20 p-2.5 text-center">
                <div className="text-xs text-white/70">Capital</div>
                <div className="text-sm sm:text-base font-bold text-white">{stateInfo.capital}</div>
              </div>
              <div className="rounded-xl backdrop-blur-md bg-white/10 border border-white/20 p-2.5 text-center">
                <div className="text-xs text-white/70">Best Time</div>
                <div className="text-sm sm:text-base font-bold text-[#F47721]">{stateInfo.bestTimeToVisit}</div>
              </div>
              {stateInfo.facts.map((st) => (
                <div
                  key={st.label}
                  className="rounded-xl backdrop-blur-md bg-white/10 border border-white/20 p-2.5 text-center"
                >
                  <div className="text-xs text-white/70">{st.label}</div>
                  <div className="text-sm sm:text-base font-bold text-white">{st.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="bg-[#FFF0E5] dark:bg-[#181A20] border-b border-[#F1D8C5] dark:border-white/10 py-4 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-zinc-400 mr-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F47721]" />
              Highlights:
            </span>
            {stateInfo.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-zinc-800/80 border border-[#F1D8C5] dark:border-white/10 text-xs font-medium text-[#252525] dark:text-zinc-200"
              >
                <MapPin className="w-3 h-3 text-[#F47721]" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== MUST-VISIT PLACES ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#F47721] mb-1">Signature Destinations</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#252525] dark:text-zinc-100">
            Must-Visit Places in {stateName}
          </h2>
          <p className="text-sm text-[#777777] dark:text-zinc-400 mt-1">
            The landmark destinations that define the cultural and natural soul of the state.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stateInfo.mustVisitPlaces.map((place) => {
            const destAsset = getDestinationAsset(place.name) || getDestinationAsset(place.id);
            return (
              <div
                key={place.id}
                className="group bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <SafeImage
                    src={destAsset}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackType="landmark"
                    label={place.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#F47721] border border-[#F47721]/30">
                    {place.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-lg mb-2 group-hover:text-[#F47721] transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#777777] dark:text-zinc-400 leading-relaxed mb-4 flex-1">
                    {place.description}
                  </p>
                  <Link
                    to="/heritage/$destinationId"
                    params={{ destinationId: place.destinationId }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F47721] hover:text-[#E85D04] transition-colors mt-auto pt-3 border-t border-[#F1D8C5]/50 dark:border-white/5"
                  >
                    Explore Destination Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== FAMOUS ATTRACTIONS ===================== */}
      <section className="bg-[#FFF7F0] dark:bg-[#121316] border-y border-[#F1D8C5] dark:border-white/10 py-12 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-[#F47721] mb-1">Flora, Fauna & Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252525] dark:text-zinc-100">
              Famous Attractions & Sanctuaries
            </h2>
            <p className="text-sm text-[#777777] dark:text-zinc-400 mt-1">
              Zoos, tiger reserves, national parks, waterfalls, hill stations, and sacred monuments.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stateInfo.famousAttractions.map((att) => (
              <div
                key={att.name}
                className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] border border-transparent dark:border-[#F47721]/20">
                    {att.type}
                  </span>
                  <span className="text-[11px] text-[#777777] dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F47721]" />
                    {att.location}
                  </span>
                </div>
                <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-base mb-1.5">{att.name}</h3>
                <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed">{att.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CULTURE, FOOD & TRAVEL INFO ===================== */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Festivals & Culture */}
          <div className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#F47721]" />
              <h3 className="font-bold text-lg text-[#252525] dark:text-zinc-100">Festivals & Traditions</h3>
            </div>
            <div className="space-y-4">
              {stateInfo.festivalsAndCulture.map((f) => (
                <div key={f.name} className="border-b border-[#F1D8C5]/50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-[#252525] dark:text-zinc-200">{f.name}</h4>
                    <span className="text-[10px] text-[#F47721] font-semibold">{f.month}</span>
                  </div>
                  <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Local Food to Try */}
          <div className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-[#F47721]" />
              <h3 className="font-bold text-lg text-[#252525] dark:text-zinc-100">Local Cuisine to Try</h3>
            </div>
            <div className="space-y-4">
              {stateInfo.localFoods.map((food) => (
                <div key={food.name} className="border-b border-[#F1D8C5]/50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-[#252525] dark:text-zinc-200">{food.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-medium">
                      {food.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed">{food.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to Reach */}
          <div className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-[#F47721]" />
                <h3 className="font-bold text-lg text-[#252525] dark:text-zinc-100">Travel & Connectivity</h3>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Plane className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252525] dark:text-zinc-200">By Air</div>
                    <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed mt-0.5">{stateInfo.howToReach.air}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Train className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252525] dark:text-zinc-200">By Train</div>
                    <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed mt-0.5">{stateInfo.howToReach.rail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Car className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252525] dark:text-zinc-200">By Road</div>
                    <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed mt-0.5">{stateInfo.howToReach.road}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-[#FFF0E5] dark:bg-white/5 border border-[#F1D8C5] dark:border-white/10 text-center">
              <span className="text-xs font-semibold text-[#F47721]">Best Season to Visit:</span>
              <p className="text-xs text-[#777777] dark:text-zinc-300 font-medium mt-0.5">{stateInfo.bestTimeToVisit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SEARCHABLE DESTINATION GRID ===================== */}
      <section className="bg-zinc-50 dark:bg-[#121316] border-t border-[#F1D8C5] dark:border-white/10 py-12 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100">
                Explore Destinations in {stateName}
              </h2>
              <p className="text-xs text-[#777777] dark:text-zinc-400 mt-1">
                {filtered.length} destination{filtered.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777] dark:text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city, name or tag..."
                className="pl-9 border-[#F1D8C5] dark:border-white/15 bg-white dark:bg-[#181A20] text-[#252525] dark:text-zinc-100 focus-visible:ring-[#F47721] h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dest) => {
              const destAsset = getDestinationAsset(dest.name) || dest.image;
              return (
                <div
                  key={dest.id}
                  className="group bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <SafeImage
                      src={destAsset}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackType="landmark"
                      label={dest.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#F47721] border border-[#F47721]/30">
                      {dest.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-base leading-tight group-hover:text-[#F47721] transition-colors">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-[#777777] dark:text-zinc-400 shrink-0">
                        <MapPin className="w-3 h-3 text-[#F47721]" />
                        {dest.district}
                      </div>
                    </div>
                    <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {dest.description}
                    </p>
                    <Link
                      to="/heritage/$destinationId"
                      params={{ destinationId: dest.id }}
                      className="flex items-center gap-2 text-xs font-semibold text-[#F47721] hover:text-[#E85D04] transition-colors group/link mt-auto pt-2 border-t border-[#F1D8C5]/40 dark:border-white/5"
                    >
                      Explore Destination
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== RELATED POSTAGE STAMPS ===================== */}
      {stateStamps.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#F47721] mb-1">Philatelic Archive</div>
              <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100">
                Stamps of {stateName}
              </h2>
            </div>
            <Link
              to="/stamps"
              className="text-xs font-semibold text-[#F47721] hover:underline flex items-center gap-1"
            >
              Browse All Archive <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stateStamps.map((stamp) => (
              <Link
                key={stamp.id}
                to="/stamps/$stampId"
                params={{ stampId: stamp.id }}
                className="group bg-white dark:bg-[#181A20] rounded-xl border border-[#F1D8C5] dark:border-white/10 p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block text-center"
              >
                <div className="aspect-square rounded-lg bg-[#FFF0E5] dark:bg-zinc-800/80 p-2 flex items-center justify-center mb-2 overflow-hidden">
                  <SafeImage
                    src={stamp.image}
                    alt={stamp.name}
                    fallbackType="stamp"
                    className="max-h-full object-contain group-hover:scale-105 transition-transform"
                    label={stamp.name}
                  />
                </div>
                <div className="font-bold text-xs text-[#252525] dark:text-zinc-100 truncate">{stamp.name}</div>
                <div className="text-[10px] text-[#777777] dark:text-zinc-400 mt-0.5">
                  {stamp.year} · ₹{stamp.price}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===================== HANDICRAFTS ===================== */}
      {stateProducts.length > 0 && (
        <section className="bg-[#FFF7F0] dark:bg-[#121316] border-y border-[#F1D8C5] dark:border-white/10 py-12 transition-colors">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#F47721] mb-1">Local Livelihood</div>
                <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100">
                  Artisans & Handicrafts from {stateName}
                </h2>
              </div>
              <Link
                to="/handicrafts"
                className="text-xs font-semibold text-[#F47721] hover:underline flex items-center gap-1"
              >
                View Marketplace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {stateProducts.map((prod) => {
                const prodAsset = getProductAsset(prod, prod.image);
                return (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative h-40 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <SafeImage
                        src={prodAsset}
                        alt={prod.name}
                        fallbackType="bag"
                        className="w-full h-full object-cover"
                        label={prod.name}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-[#F47721] border border-[#F47721]/30">
                        {prod.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-[#252525] dark:text-zinc-100 text-sm mb-1">{prod.name}</h4>
                      <div className="text-xs text-[#F47721] mb-1 font-medium">{prod.artisanName}</div>
                      <p className="text-xs text-[#777777] dark:text-zinc-400 line-clamp-2 mb-3 flex-1">
                        {prod.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F1D8C5]/50 dark:border-white/5">
                        <span className="font-bold text-[#F47721] text-sm">₹{prod.price.toLocaleString("en-IN")}</span>
                        <Button
                          size="sm"
                          onClick={() => openEnquiry(`Product Enquiry: ${prod.name} from ${stateName}`)}
                          className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs h-7 px-3"
                        >
                          Enquire
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== GUIDES & HOMESTAYS ===================== */}
      {(stateGuides.length > 0 || stateHomestays.length > 0) && (
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Guides */}
            {stateGuides.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#252525] dark:text-zinc-100">
                    Local Guides in {stateName}
                  </h3>
                  <Link to="/guides" className="text-xs text-[#F47721] font-semibold hover:underline">
                    All Guides →
                  </Link>
                </div>
                <div className="space-y-3">
                  {stateGuides.map((guide) => (
                    <div
                      key={guide.id}
                      className="bg-white dark:bg-[#181A20] rounded-xl border border-[#F1D8C5] dark:border-white/10 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0">
                          <UserCheck className="w-5 h-5 text-[#F47721]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#252525] dark:text-zinc-100 truncate">{guide.name}</h4>
                          <div className="text-xs text-[#777777] dark:text-zinc-400">
                            {guide.district} · {guide.languages.join(", ")}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openEnquiry(`Guide Booking: ${guide.name} (${stateName})`)}
                        className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs shrink-0"
                      >
                        Contact
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homestays */}
            {stateHomestays.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#252525] dark:text-zinc-100">
                    Homestays in {stateName}
                  </h3>
                  <Link to="/homestays" className="text-xs text-[#F47721] font-semibold hover:underline">
                    All Homestays →
                  </Link>
                </div>
                <div className="space-y-3">
                  {stateHomestays.map((hs) => {
                    const photos = getHomestayAssets(hs, hs.images);
                    return (
                      <div
                        key={hs.id}
                        className="bg-white dark:bg-[#181A20] rounded-xl border border-[#F1D8C5] dark:border-white/10 p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                            <SafeImage
                              src={photos[0]}
                              alt={hs.name}
                              fallbackType="home"
                              className="w-full h-full object-cover"
                              label={hs.name}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#252525] dark:text-zinc-100 truncate">{hs.name}</h4>
                            <div className="text-xs text-[#777777] dark:text-zinc-400">{hs.location}</div>
                            <div className="text-xs font-bold text-[#F47721]">₹{hs.pricePerNight} / night</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openEnquiry(`Homestay Booking: ${hs.name} (${stateName})`)}
                          className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs shrink-0"
                        >
                          Book Stay
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Back to Explore */}
      <section className="bg-[#FFF0E5] dark:bg-[#181A20] border-t border-[#F1D8C5] dark:border-white/10 py-10 text-center">
        <div className="container mx-auto px-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#252525] dark:bg-white text-white dark:text-zinc-900 font-semibold hover:bg-[#F47721] dark:hover:bg-[#F47721] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Another State
          </Link>
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
