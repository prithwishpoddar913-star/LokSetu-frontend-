import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  ArrowLeft,
  Train,
  Plane,
  Calendar,
  Info,
  Star,
  Compass,
  ShoppingBag,
  UserCheck,
  ArrowRight,
  CheckCircle,
  QrCode,
  Share2,
  Copy,
  Check,
  Stamp as StampIcon,
  Home as HomeIcon,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { getDestinationById, type Destination } from "@/lib/destinations";
import { localProducts, guides, homestays } from "@/lib/heritage-data";
import { stamps, type Stamp } from "@/lib/stamps";
import { EnquiryModal } from "@/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import {
  getDestinationAsset,
  getProductAsset,
  getGuideAsset,
  getHomestayAssets,
} from "@/lib/assets";

export const Route = createFileRoute("/heritage/$destinationId")({
  head: ({ params }) => {
    const dest = getDestinationById(params.destinationId);
    return {
      meta: [
        { title: dest ? `${dest.name} — Heritage Explorer | Stamp Safar` : "Destination | Stamp Safar" },
        {
          name: "description",
          content: dest?.description ?? "Explore India's heritage destinations through stamps.",
        },
      ],
    };
  },
  component: DestinationDetailPage,
});

function resolveRelatedStamps(destination: Destination): Stamp[] {
  const result: Stamp[] = [];
  const addedIds = new Set<string>();

  // 1. Direct ID match
  for (const rid of destination.relatedStampIds || []) {
    const direct = stamps.find((s) => s.id === rid);
    if (direct && !addedIds.has(direct.id)) {
      result.push(direct);
      addedIds.add(direct.id);
    }
  }

  // 2. Keyword match from relatedStampIds
  for (const rid of destination.relatedStampIds || []) {
    const keywords = rid.replace(/^[a-z]{2}-/, "").split("-").filter((k) => k.length > 2);
    for (const kw of keywords) {
      for (const stamp of stamps) {
        if (!addedIds.has(stamp.id)) {
          const text = `${stamp.name} ${stamp.description} ${stamp.city} ${stamp.state}`.toLowerCase();
          if (text.includes(kw.toLowerCase())) {
            result.push(stamp);
            addedIds.add(stamp.id);
            break;
          }
        }
      }
    }
  }

  // 3. Fallback match by destination name, district or state
  if (result.length < 4) {
    for (const stamp of stamps) {
      if (!addedIds.has(stamp.id)) {
        const matchName = stamp.city.toLowerCase() === destination.name.toLowerCase() ||
          stamp.description.toLowerCase().includes(destination.name.toLowerCase()) ||
          stamp.state.toLowerCase() === destination.state.toLowerCase();
        if (matchName) {
          result.push(stamp);
          addedIds.add(stamp.id);
          if (result.length >= 4) break;
        }
      }
    }
  }

  return result.slice(0, 4);
}

function DestinationDetailPage() {
  const { destinationId } = Route.useParams();
  const destination = getDestinationById(destinationId);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState("");
  const [copied, setCopied] = useState(false);

  if (!destination) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-[#F47721]/40" />
          <h1 className="text-2xl font-bold text-[#252525] dark:text-zinc-100 mb-2">Destination Not Found</h1>
          <p className="text-[#777777] dark:text-zinc-400 mb-6">The destination you're looking for doesn't exist.</p>
          <Link
            to="/heritage"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F47721] text-white font-semibold hover:bg-[#E85D04]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const d = destination;
  const heroImageSrc = getDestinationAsset(d, d.heroImage || d.image);

  // Related stamps, guides, homestays, handicrafts
  const relatedStamps = resolveRelatedStamps(d);

  const stateGuides = guides.filter(
    (g) => g.district === d.district || g.destinations.includes(d.name) || g.state === d.state,
  ).slice(0, 2);

  const relatedHomestays = homestays.filter(
    (h) => h.district === d.district || h.location.toLowerCase().includes(d.name.toLowerCase()) || h.state === d.state,
  ).slice(0, 2);

  const relatedCrafts = localProducts.filter(
    (p) => p.district === d.district || p.state === d.state,
  ).slice(0, 3);

  const openEnquiry = (subject: string) => {
    setEnquirySubject(subject);
    setEnquiryOpen(true);
  };

  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/heritage/${destinationId}`
    : `https://stampsafar.in/heritage/${destinationId}`;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl)}&color=F47721&bgcolor=FFFFFF&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[420px] overflow-hidden flex items-end">
        <SafeImage
          src={heroImageSrc}
          alt={d.name}
          fallbackIcon="landmark"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="relative w-full p-6 sm:p-10">
          <div className="container mx-auto">
            <Link
              to="/heritage"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Destinations
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#F47721] text-white text-xs font-semibold shadow-xs">
                {d.state}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-medium">
                {d.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white/90 text-xs font-medium">
                {d.district} District
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{d.name}</h1>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4 text-[#F47721]" />
              <span>{d.district}, {d.state}, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview / Description */}
            <div className="bg-white dark:bg-[#181A20] rounded-2xl p-6 border border-[#F1D8C5] dark:border-white/10 shadow-xs">
              <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#F47721]" />
                About {d.name}
              </h2>
              <p className="text-[#252525] dark:text-zinc-200 text-base leading-relaxed">{d.description}</p>
            </div>

            {/* Historical Background */}
            <div className="bg-[#FFF0E5] dark:bg-[#181A20] rounded-2xl p-6 border border-[#F1D8C5] dark:border-white/10 shadow-xs">
              <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#F47721]" />
                Historical Background
              </h2>
              <p className="text-[#252525]/90 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                {d.historicalBackground}
              </p>
            </div>

            {/* Cultural Significance */}
            <div className="bg-white dark:bg-[#181A20] rounded-2xl p-6 border border-[#F1D8C5] dark:border-white/10 shadow-xs">
              <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#F47721]" />
                Cultural Significance
              </h2>
              <p className="text-[#252525]/90 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                {d.culturalSignificance}
              </p>
            </div>

            {/* Interesting Facts */}
            {d.interestingFacts && d.interestingFacts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#F47721]" />
                  Interesting Facts
                </h2>
                <div className="space-y-3">
                  {d.interestingFacts.map((fact, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-[#181A20] rounded-xl border border-[#F1D8C5] dark:border-white/10 shadow-xs"
                    >
                      <CheckCircle className="w-5 h-5 text-[#F47721] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#252525] dark:text-zinc-300 leading-relaxed">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Attractions */}
            {d.nearbyAttractions && d.nearbyAttractions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#F47721]" />
                  Nearby Attractions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {d.nearbyAttractions.map((attr) => (
                    <span
                      key={attr}
                      className="px-3.5 py-1.5 bg-white dark:bg-[#181A20] border border-[#F1D8C5] dark:border-white/10 text-sm font-medium text-[#252525] dark:text-zinc-200 rounded-full shadow-xs"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Postage Stamps */}
            <div className="rounded-2xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 flex items-center gap-2">
                    <StampIcon className="w-5 h-5 text-[#F47721]" />
                    Related Commemorative Stamps
                  </h2>
                  <p className="text-xs text-[#777777] dark:text-zinc-400 mt-1">
                    Stamps celebrating {d.name} in India's philatelic archive
                  </p>
                </div>
                <Link
                  to="/stamps"
                  search={{ q: d.name, category: "" }}
                  className="text-xs font-semibold text-[#F47721] hover:underline hidden sm:inline"
                >
                  Search all stamps →
                </Link>
              </div>

              {relatedStamps.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {relatedStamps.map((st) => (
                    <Link
                      key={st.id}
                      to="/stamps/$stampId"
                      params={{ stampId: st.id }}
                      className="group rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-[#FFF7F0] dark:bg-zinc-800/40 p-3 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
                    >
                      <div className="h-28 overflow-hidden rounded-lg bg-white dark:bg-zinc-900 mb-2 flex items-center justify-center p-1">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#252525] dark:text-zinc-100 line-clamp-1 group-hover:text-[#F47721] transition-colors">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-[#777777] dark:text-zinc-400">
                          {st.year} · {st.rarity}
                        </div>
                        <div className="text-xs font-bold text-[#F47721] mt-1">
                          ₹{st.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#777777] dark:text-zinc-400 text-sm">
                  Explore our marketplace to discover stamps from {d.state}.
                </div>
              )}
            </div>

            {/* Local Handicrafts & Products */}
            {relatedCrafts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#F47721]" />
                    Local Handicrafts of {d.name} &amp; {d.state}
                  </h2>
                  <Link to="/handicrafts" className="text-xs font-semibold text-[#F47721] hover:underline">
                    View Marketplace
                  </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedCrafts.map((craft) => {
                    const img = getProductAsset(craft, craft.image);
                    return (
                      <div
                        key={craft.id}
                        className="rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="h-36 overflow-hidden">
                          <SafeImage
                            src={img}
                            alt={craft.name}
                            fallbackIcon="craft"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#F47721]">
                              {craft.category}
                            </span>
                            <h4 className="font-semibold text-xs text-[#252525] dark:text-zinc-100 line-clamp-1 mt-0.5">
                              {craft.name}
                            </h4>
                            <div className="text-[11px] text-[#777777] dark:text-zinc-400">
                              By {craft.artisanName}
                            </div>
                            <div className="text-xs font-bold text-[#F47721] mt-1.5">
                              ₹{craft.price.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openEnquiry(`Enquiry for ${craft.name}`)}
                            className="mt-3 w-full bg-[#F47721] hover:bg-[#E85D04] text-white text-xs h-7"
                          >
                            Enquire Craft
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Local Tour Guides */}
            {stateGuides.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#F47721]" />
                    Local Guides for {d.name}
                  </h2>
                  <Link to="/guides" className="text-xs font-semibold text-[#F47721] hover:underline">
                    View All Guides
                  </Link>
                </div>

                <div className="space-y-3">
                  {stateGuides.map((guide) => {
                    const img = getGuideAsset(guide, guide.image);
                    return (
                      <div
                        key={guide.id}
                        className="p-4 bg-white dark:bg-[#181A20] rounded-xl border border-[#F1D8C5] dark:border-white/10 flex items-start gap-4 shadow-xs"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#F47721]/30">
                          <SafeImage
                            src={img}
                            alt={guide.name}
                            fallbackIcon="guide"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[#252525] dark:text-zinc-100 text-sm">{guide.name}</h3>
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                              Demo Guide
                            </span>
                          </div>
                          <p className="text-xs text-[#777777] dark:text-zinc-400 mb-2">
                            {guide.experience} · Speaks: {guide.languages.join(", ")}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {guide.expertise.slice(0, 3).map((e) => (
                              <span
                                key={e}
                                className="px-2 py-0.5 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-[10px] rounded-full"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEnquiry(`Guide Enquiry: ${guide.name} for ${d.name}`)}
                            className="border-[#F47721] text-[#F47721] hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 h-7 text-xs"
                          >
                            Send Booking Enquiry
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Homestays & Stays */}
            {relatedHomestays.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100 flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-[#F47721]" />
                    Homestays in {d.name} &amp; Nearby
                  </h2>
                  <Link to="/homestays" className="text-xs font-semibold text-[#F47721] hover:underline">
                    View All Homestays
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedHomestays.map((hs) => {
                    const photos = getHomestayAssets(hs, hs.images);
                    return (
                      <div
                        key={hs.id}
                        className="rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="h-36 overflow-hidden">
                          <SafeImage
                            src={photos[0]}
                            alt={hs.name}
                            fallbackIcon="home"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-[#252525] dark:text-zinc-100 line-clamp-1">
                              {hs.name}
                            </h4>
                            <p className="text-xs text-[#777777] dark:text-zinc-400 mt-1 line-clamp-2">
                              {hs.description}
                            </p>
                            <div className="text-xs font-bold text-[#F47721] mt-2">
                              ₹{hs.pricePerNight.toLocaleString("en-IN")}/night
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openEnquiry(`Homestay Booking Enquiry: ${hs.name}`)}
                            className="mt-3 w-full bg-[#F47721] hover:bg-[#E85D04] text-white text-xs h-7"
                          >
                            Enquire Stay
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-6 border-t border-[#F1D8C5] dark:border-white/10 flex justify-between items-center">
              <Link
                to="/heritage"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Destinations
              </Link>
              <Link
                to="/explore/$stateSlug"
                params={{ stateSlug: d.state.toLowerCase().replace(/ /g, "-") }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F47721] hover:underline"
              >
                More in {d.state} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Travel Info */}
            <div className="bg-white dark:bg-[#181A20] rounded-2xl p-5 border border-[#F1D8C5] dark:border-white/10 sticky top-24 shadow-xs">
              <h3 className="font-bold text-[#252525] dark:text-zinc-100 mb-4 text-base">Travel Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0">
                    <Train className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                      Nearest Railway
                    </div>
                    <div className="text-sm font-medium text-[#252525] dark:text-zinc-200">
                      {d.travelInfo.nearestRailway}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                      Nearest Airport
                    </div>
                    <div className="text-sm font-medium text-[#252525] dark:text-zinc-200">
                      {d.travelInfo.nearestAirport}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/15 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#F47721]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                      Best Time to Visit
                    </div>
                    <div className="text-sm font-medium text-[#252525] dark:text-zinc-200">
                      {d.travelInfo.bestTimeToVisit}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-[#F1D8C5] dark:border-white/10">
                <Button
                  onClick={() => openEnquiry(`Destination Visit Enquiry: ${d.name}`)}
                  className="w-full bg-[#F47721] hover:bg-[#E85D04] text-white font-semibold"
                >
                  Plan My Visit
                </Button>
              </div>
            </div>

            {/* QR Code Share Card */}
            <div className="bg-white dark:bg-[#181A20] rounded-2xl p-5 border border-[#F1D8C5] dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-[#F47721]" />
                <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-sm">Share via QR</h3>
              </div>
              <p className="text-xs text-[#777777] dark:text-zinc-400 mb-4">
                Scan to explore {d.name} on mobile or share with fellow travelers.
              </p>
              <div className="flex justify-center mb-4">
                <img
                  src={qrSrc}
                  alt={`QR code for ${d.name}`}
                  className="w-36 h-36 rounded-xl border border-[#F1D8C5] dark:border-white/10 p-1 bg-white"
                  loading="lazy"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#F1D8C5] dark:border-white/10 text-xs font-medium text-[#252525] dark:text-zinc-200 hover:border-[#F47721] hover:text-[#F47721] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Discover ${d.name} on Stamp Safar: ${pageUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-xs font-medium text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Tags */}
            {d.tags && d.tags.length > 0 && (
              <div className="bg-[#FFF0E5] dark:bg-[#181A20] rounded-2xl p-5 border border-[#F1D8C5] dark:border-white/10 shadow-xs">
                <h3 className="font-bold text-[#252525] dark:text-zinc-100 mb-3 text-sm">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-[#777777] dark:text-zinc-300 text-xs rounded-full border border-[#F1D8C5] dark:border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EnquiryModal
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        subject={enquirySubject}
      />
    </SiteLayout>
  );
}
