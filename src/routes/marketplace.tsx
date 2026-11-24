import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { stamps, useStampAvailability, type Stamp } from "@/lib/stamps";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Star,
  MapPin,
  Upload,
  ShoppingCart,
} from "lucide-react";

import { addStampToCartForSignedInUser } from "@/lib/cart";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      {
        title: "Marketplace — Buy Verified Stamps · LokSetu",
      },
      {
        name: "description",
        content:
          "Buy verified rare stamps from trusted collectors across India.",
      },
    ],
  }),

  component: Marketplace,
});

function Marketplace() {
  const navigate = useNavigate();

  const listings = stamps.filter((s) => s.seller);

  // ✅ SAFE ADD TO CART (BLOCK SOLD ITEMS)
  const addToCart = async (
    stamp: (typeof stamps)[number],
  ) => {
    if (!stamp.available) return;

    const added =
      await addStampToCartForSignedInUser(stamp);

    if (!added) {
      navigate({ to: "/auth" });
    }
  };

  return (
    <SiteLayout>
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/Indian Stamps bg image for marketplace.jpg"
          alt="Marketplace Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* HERO */}
      <section className="container mx-auto px-4 sm:px-6 pt-10">
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-black/50 dark:bg-black/40 backdrop-blur-md p-8 lg:p-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <div className="flex-1">
            <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/40">
              Marketplace
            </Badge>

            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-white">
              Buy verified stamps from trusted collectors
            </h1>

            <p className="text-zinc-200 mt-2 max-w-xl">
              Every listing is reviewed by our expert panel.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="gap-2 bg-[#F47721] text-white hover:bg-[#E85D04] font-semibold shadow-md"
          >
            <Link to="/sell">
              <Upload className="h-4 w-4" />
              Sell your stamp
            </Link>
          </Button>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="container mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Live Listings
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {listings.map((s) => (
            <MarketplaceCard key={s.id} s={s} addToCart={addToCart} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function MarketplaceCard({ s, addToCart }: { s: Stamp; addToCart: (s: Stamp) => void }) {
  const available = useStampAvailability(s.id);

  return (
    <article
      className="p-4 flex gap-4 group rounded-3xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
    >
      {/* IMAGE */}
      <div className="w-28 sm:w-32 shrink-0 aspect-[4/5] bg-secondary/30 rounded-lg grid place-items-center p-2 relative">
        {!available && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 rounded-lg">
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
              SOLD OUT
            </span>
          </div>
        )}

        <img
          src={s.image}
          alt={s.name}
          className={`w-full h-full object-contain transition ${
            available ? "group-hover:scale-105" : "grayscale opacity-60"
          }`}
        />
      </div>

      {/* INFO */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-foreground font-semibold line-clamp-1">{s.name}</h3>

          <Badge variant="outline" className="text-[10px] shrink-0">
            {s.rarity}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {s.year} · {s.category}
        </p>

        <div className="mt-auto pt-3 flex justify-between items-end">
          <div>
            <div className="text-xs text-foreground font-medium">{s.seller!.name}</div>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-current" />
                {s.seller!.rating}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F47721]" />
                {s.seller!.location}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-foreground font-bold">₹{s.price.toLocaleString("en-IN")}</div>

            <div className={`text-[10px] font-medium ${available ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {available ? "● Available" : "● Sold Out"}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-border hover:bg-muted text-foreground"
          >
            <Link to="/stamps/$stampId" params={{ stampId: s.id }}>
              Details
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!available}
            className={`gap-1 ${
              available
                ? "bg-[#F47721] text-white hover:bg-[#E85D04]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={() => {
              if (available) addToCart(s);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {available ? "Add Cart" : "Sold Out"}
          </Button>
        </div>
      </div>
    </article>
  );
}