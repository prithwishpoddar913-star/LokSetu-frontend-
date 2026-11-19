import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, PackageCheck, ShieldCheck, Mail, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      {
        title: "Shipping & Philatelic Packaging Policy — Stamp Safar",
      },
      {
        name: "description",
        content:
          "How Stamp Safar packages rare postage stamps in acid-free archival sleeves and safely ships fragile rural handicrafts via India Post Speed Post.",
      },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-neutral-800 border border-[#F47721]/30 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-4">
            <Truck className="w-3.5 h-3.5" />
            Speed Post & Archival Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white tracking-tight">
            Shipping & Philatelic Packaging Policy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#777777] dark:text-neutral-400">
            Professional preservation packaging honoring India Post philatelic standards
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[#252525] dark:text-neutral-300">
          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              1. Archival Stamp Packaging Standards
            </h2>
            <p>
              Postage stamps and commemorative First Day Covers are delicate historical artefacts sensitive to humidity, fingerprint oils, and mechanical friction. Every philatelic order dispatched through Stamp Safar adheres to museum-grade packaging:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-xl bg-[#FFF7F0] dark:bg-neutral-800 border border-[#F1D8C5] dark:border-neutral-700">
                <h4 className="font-bold text-xs text-[#F47721] uppercase mb-1">Layer 1: Glassine</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Acid-free, pH-neutral glassine sleeve preventing gum adhesion and paper decay.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF7F0] dark:bg-neutral-800 border border-[#F1D8C5] dark:border-neutral-700">
                <h4 className="font-bold text-xs text-[#F47721] uppercase mb-1">Layer 2: Stiffener</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Rigid, heavy-duty chipboard backing sandwiching the stamp to prevent any bend during transit.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF7F0] dark:bg-neutral-800 border border-[#F1D8C5] dark:border-neutral-700">
                <h4 className="font-bold text-xs text-[#F47721] uppercase mb-1">Layer 3: Weatherproof</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Tamper-evident, waterproof bubble envelope bearing a &ldquo;DO NOT BEND&rdquo; warning label.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              2. Fragile Terracotta & Handicraft Crating
            </h2>
            <p>
              Handcrafted Dokra metal figurines, Terracotta panels from Panchmura, and Madhubani artwork on handmade paper are wrapped in 3 layers of high-density air-bubble film, secured within corrugated cardboard boxes reinforced with paper shredding cushioning.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              3. Delivery Timelines & Logistics Partners
            </h2>
            <p>
              We partner directly with <strong>India Post (Speed Post & Registered Insured Parcel)</strong> and accredited courier partners to reach every PIN code across Eastern India:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Eastern Zone (West Bengal, Bihar, Jharkhand):</strong> 2 to 4 business days.</li>
              <li><strong>Metro Cities & Regional Capitals:</strong> 3 to 5 business days.</li>
              <li><strong>Rest of India:</strong> 4 to 7 business days.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              4. Shipping Charges & Free Delivery
            </h2>
            <p>
              We charge a flat nominal shipping fee of <strong>₹60</strong> for orders within Eastern India to cover packaging materials. Orders totaling <strong>₹{IMPACT_CONFIG.economics.freeShippingThreshold} or above</strong> qualify for 100% Free Shipping.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F1D8C5] dark:border-neutral-800 flex justify-between items-center">
          <Link to="/refunds">
            <Button variant="outline" className="border-[#F47721]/30 text-[#F47721]">
              Refund Policy
            </Button>
          </Link>
          <Link to="/contact">
            <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white">
              Contact Dispatch Desk
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
