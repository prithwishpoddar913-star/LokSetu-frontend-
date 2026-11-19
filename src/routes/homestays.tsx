import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Home,
  MapPin,
  Filter,
  Star,
  IndianRupee,
  ArrowRight,
  MessageCircle,
  CheckCircle,
  CheckCircle2,
  Info,
  Users,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { homestays, type Homestay } from "@/lib/heritage-data";
import { EnquiryModal } from "@/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import { supabase } from "@/lib/supabase";

// ================= HOMESTAY PHOTOS FROM src/assets =================
// Homestay er photo src/assets e rakhun. File er naam homestay er naam (ba id) diye SHURU hole
// automatic match hobe. Ekta homestay te joto khushi photo dite paren:
//
//   "Bishnupur Heritage Home"
//       bishnupur-heritage-home.jpeg        (prothom photo, card e eta age dekhabe)
//       bishnupur-heritage-home-1.jpeg
//       bishnupur-heritage-home-2.jpeg
//       bishnupur-heritage-home-room.jpeg   (naam er por kichu likhleo cholbe)
//   "Darjeeling Valley View"   ->  darjeeling-valley-view.jpeg, darjeeling-valley-view-1.jpeg ...
//   "Nalanda Scholar's Retreat" ->  nalanda-scholars-retreat.jpeg, nalanda-scholars-retreat-1.jpeg ...
//   "Netarhat Forest Cottage"  ->  netarhat-forest-cottage.jpeg, netarhat-forest-cottage-1.jpeg ...
//
// Capital/small letter, space, dash, underscore, apostrophe matter korbe na.
// Extension: jpg, jpeg, png, webp. Match na hole ager photo (homestay.images) fallback hishebe thakbe.
const assetImages = import.meta.glob(
  "/src/assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" },
) as Record<string, string>;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// [normalizedFileName, url] list, naam onujayi sajano
const assetList: Array<[string, string]> = Object.entries(assetImages)
  .map(([path, url]): [string, string] => {
    const file = path.split("/").pop()!.replace(/\.[^.]+$/, "");
    return [normalize(file), url];
  })
  .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

const getHomestayImages = (
  homestay: { id: string; name: string },
  fallback: string[],
): string[] => {
  const nameKey = normalize(homestay.name.replace(/\(.*?\)/g, ""));
  const fullNameKey = normalize(homestay.name);
  const idKey = normalize(homestay.id);

  const found: string[] = [];
  const add = (url: string) => {
    if (!found.includes(url)) found.push(url);
  };

  // 1) Exact naam match prothome (main photo)
  for (const [key, url] of assetList) {
    if (key === nameKey || key === fullNameKey || key === idKey) add(url);
  }
  // 2) Naam diye shuru hoy emon photo (-1, -2, -room etc.)
  for (const [key, url] of assetList) {
    if (nameKey.length >= 6 && key.startsWith(nameKey)) add(url);
    else if (fullNameKey.length >= 6 && key.startsWith(fullNameKey)) add(url);
  }
  // 2b) Choto naam (jemon darjeeling-valley-view.jpeg) jodi homestay er naam er shurur ongsho hoy
  for (const [key, url] of assetList) {
    if (key.length >= 12 && (nameKey.startsWith(key) || fullNameKey.startsWith(key))) add(url);
  }
  // 3) id + number (jemon id-1, id-2)
  for (const [key, url] of assetList) {
    if (idKey.length >= 3 && key.startsWith(idKey) && /^\d+$/.test(key.slice(idKey.length))) add(url);
  }

  return found.length > 0 ? found : fallback;
};

export const Route = createFileRoute("/homestays")({
  head: () => ({
    meta: [
      { title: "Homestays & Local Experiences — Stamp Safar" },
      {
        name: "description",
        content:
          "Stay with local families across West Bengal, Bihar, and Jharkhand. Experience authentic culture, traditional food, and genuine hospitality through Stamp Safar's homestay network.",
      },
    ],
  }),
  component: HomestaysPage,
});

type StateFilter = "All" | "West Bengal" | "Bihar" | "Jharkhand";

const stateBadgeColors: Record<string, string> = {
  "West Bengal": "bg-[#FFF0E5] text-[#F47721] border-[#F47721]/30 dark:bg-[#F47721]/15 dark:border-[#F47721]/40",
  Bihar: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40",
  Jharkhand: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800/40",
};

function HomestaysPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState("");
  const [liveHomestays, setLiveHomestays] = useState<Homestay[]>([]);

  useEffect(() => {
    async function loadApprovedHosts() {
      try {
        const { data, error } = await supabase
          .from("hosts")
          .select("*")
          .eq("status", "approved");

        if (!error && data && data.length > 0) {
          const mapped: Homestay[] = data.map((h: any) => ({
            id: `sb-host-${h.id}`,
            name: h.property_name,
            ownerName: h.host_name,
            state: h.state as any,
            location: h.address || `${h.district || h.state}`,
            pricePerNight: Number(h.price_per_night) || 1500,
            description: h.house_rules || "Authentic family homestay offering organic regional meals and direct community cultural immersion.",
            facilities: Array.isArray(h.facilities) ? h.facilities : ["Traditional Meals", "Attached Bathroom"],
            images: Array.isArray(h.images) && h.images.length > 0 ? h.images : [],
            isDemoData: false,
          }));
          setLiveHomestays(mapped);
        }
      } catch (e) {
        console.warn("Failed to load approved homestays:", e);
      }
    }
    loadApprovedHosts();
  }, []);

  const allHomestays = [...liveHomestays, ...homestays];

  const filtered = allHomestays.filter(
    (h) => stateFilter === "All" || h.state === stateFilter,
  );

  const states: StateFilter[] = ["All", "West Bengal", "Bihar", "Jharkhand"];

  const openEnquiry = (homestay: Homestay) => {
    setEnquirySubject(
      `Homestay Enquiry: ${homestay.name} — ${homestay.location}`,
    );
    setEnquiryOpen(true);
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#252525] via-[#2a1f10] to-[#E85D04] py-20 text-white">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545601450-dae9fa90ec17?w=1600&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#252525]/90 to-[#E85D04]/70" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <Home className="w-3.5 h-3.5 text-[#F47721]" />
            Stay Local, Experience More
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            Authentic <span className="text-[#F47721]">Homestays</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Move beyond hotels. Stay with local families, taste authentic home cooking, and immerse yourself in the living culture of West Bengal, Bihar, and Jharkhand.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F47721]" />
              Verified local family hosts & cultural stays
            </div>
            <Link to="/onboard">
              <Button size="sm" className="bg-[#F47721] hover:bg-[#E85D04] text-white text-xs gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                Host a Homestay? Join Network
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pilot Notice */}
      <section className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="container mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
            <span>
              <strong>Fair-Trade Guarantee:</strong> Exactly 90% of homestay booking charges are remitted directly to rural host families. Demo listings below illustrate typical village stays while host verification proceeds.
            </span>
          </div>
          <Link to="/impact" className="underline font-semibold hover:text-[#F47721] shrink-0">
            View Live Impact Data →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#FFF7F0] dark:bg-[#14161C] border-b border-[#F1D8C5] dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-4 gap-5 text-center">
            {[
              {
                icon: Home,
                title: "Local Family Hosts",
                desc: "Genuine hospitality from local families",
              },
              {
                icon: Users,
                title: "Cultural Immersion",
                desc: "Live the local traditions first-hand",
              },
              {
                icon: Star,
                title: "Authentic Cuisine",
                desc: "Home-cooked regional food every day",
              },
              {
                icon: Wifi,
                title: "Enquiry-Based",
                desc: "Connect directly with hosts before booking",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/15 border border-[#F47721]/20 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-[#F47721]" />
                </div>
                <div className="font-semibold text-[#252525] dark:text-zinc-100 text-sm mb-1">
                  {item.title}
                </div>
                <p className="text-xs text-[#777777] dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md border-b border-[#F1D8C5] dark:border-white/10 shadow-xs transition-colors">
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    stateFilter === s
                      ? "bg-[#F47721] text-white shadow-xs"
                      : "bg-[#FFF0E5] dark:bg-zinc-800 text-[#F47721] dark:text-zinc-300 hover:bg-[#F47721] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Homestays Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#252525] dark:text-zinc-100">
            {filtered.length} Homestay{filtered.length !== 1 ? "s" : ""}
            {stateFilter !== "All" && ` in ${stateFilter}`}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#777777] dark:text-zinc-400 bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 p-8">
            <Home className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#F47721]" />
            <p className="font-semibold text-lg">No homestays found for the selected filter.</p>
            <button
              onClick={() => setStateFilter("All")}
              className="mt-3 text-[#F47721] text-sm font-medium hover:underline inline-block"
            >
              Show all homestays
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hs) => (
              <HomestayCard key={hs.id} homestay={hs} onEnquire={openEnquiry} />
            ))}
          </div>
        )}
      </section>

      {/* Register as Host CTA */}
      <section className="bg-[#FFF0E5] dark:bg-[#181A20] border-t border-[#F1D8C5] dark:border-white/10 py-14 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-[#F47721] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#252525] dark:text-zinc-100 mb-3">
              Host Travellers at Your Home
            </h2>
            <p className="text-[#777777] dark:text-zinc-300 mb-6 leading-relaxed text-sm sm:text-base">
              Are you a local family in West Bengal, Bihar, or Jharkhand who can offer authentic hospitality? Join Stamp Safar's homestay network and earn a sustainable income while sharing your culture with the world.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F47721] text-white font-semibold text-sm hover:bg-[#E85D04] transition-colors"
              >
                Register as Host
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F47721] text-[#F47721] font-semibold text-sm hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 transition-colors"
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

function HomestayCard({
  homestay,
  onEnquire,
}: {
  homestay: Homestay;
  onEnquire: (hs: Homestay) => void;
}) {
  const images = getHomestayImages(homestay, homestay.images);
  const [activeIdx, setActiveIdx] = useState(0);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((curr) => (curr === images.length - 1 ? 0 : curr + 1));
  };

  const currentPhoto = images[activeIdx] || images[0];

  return (
    <div className="bg-white dark:bg-[#181A20] rounded-2xl border border-[#F1D8C5] dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Multi-Photo Carousel / Image Box */}
      <div className="relative h-52 overflow-hidden group/img">
        <SafeImage
          src={currentPhoto}
          alt={homestay.name}
          fallbackIcon="home"
          label={homestay.name}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${stateBadgeColors[homestay.state] || ""}`}
          >
            {homestay.state}
          </span>
          {homestay.isDemoData ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
              Demo · Pilot Stay
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Host
            </span>
          )}
        </div>

        {/* Multi-photo controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Photo count indicator */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
              <ImageIcon className="w-3 h-3" />
              {activeIdx + 1}/{images.length}
            </div>

            {/* Thumbnail dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIdx === i ? "w-4 bg-[#F47721]" : "w-1.5 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Show photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-xs rounded-xl px-3 py-1 shadow-md border border-[#F1D8C5]/50 dark:border-white/10 z-10">
          <div className="flex items-center gap-0.5 text-[#F47721] font-bold text-sm">
            <IndianRupee className="w-3.5 h-3.5" />
            {homestay.pricePerNight.toLocaleString("en-IN")}
            <span className="text-[10px] text-[#777777] dark:text-zinc-400 font-normal ml-0.5">
              /night
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-[#252525] dark:text-zinc-100 text-base leading-tight mb-1">
            {homestay.name}
          </h3>
          <div className="text-xs text-[#F47721] font-medium mb-1">
            Hosted by {homestay.ownerName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-zinc-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#F47721]" />
            {homestay.location}
          </div>

          <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4">
            {homestay.description}
          </p>

          {/* Facilities */}
          <div className="mb-4">
            <div className="text-[10px] font-semibold text-[#777777] dark:text-zinc-400 uppercase tracking-wider mb-2">
              Included with Stay
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {homestay.facilities.slice(0, 4).map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-[#F47721] shrink-0" />
                  <span className="text-[10px] text-[#777777] dark:text-zinc-300 truncate">{f}</span>
                </div>
              ))}
            </div>
            {homestay.facilities.length > 4 && (
              <div className="text-[10px] text-[#F47721] font-medium mt-1.5">
                +{homestay.facilities.length - 4} more amenities
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Disclaimer */}
          <div className="text-[10px] text-[#777777] dark:text-zinc-400 mb-4 p-2.5 bg-[#FFF7F0] dark:bg-zinc-800/40 rounded-lg border border-[#F1D8C5] dark:border-white/10">
            ℹ️ Bookings are enquiry-based. Confirm availability with the host before planning your stay.
          </div>

          {/* Fair-Trade Payout Note */}
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-3">
            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
            90% (₹{Math.round(homestay.pricePerNight * 0.9).toLocaleString("en-IN")}/night) direct to host family
          </p>

          {/* CTA */}
          <Button
            onClick={() => onEnquire(homestay)}
            className="w-full bg-[#F47721] hover:bg-[#E85D04] text-white gap-2"
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
            Send Booking Enquiry
          </Button>
        </div>
      </div>
    </div>
  );
}
