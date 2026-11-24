import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck, ShieldAlert, HeartHandshake, CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      {
        title: "Terms of Service & Community Guidelines — LokSetu",
      },
      {
        name: "description",
        content:
          "Terms of Service, Fair-Trade 90% community remittance charter, authentic craft pledge, and guest hospitality standards for LokSetu.",
      },
    ],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-neutral-800 border border-[#F47721]/30 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-4">
            <FileCheck className="w-3.5 h-3.5" />
            Fair-Trade & Community Trust Charter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white tracking-tight">
            Terms of Service & Community Standards
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#777777] dark:text-neutral-400">
            Last Updated: November 19, 2026 · Seva First Innovation Challenge Framework
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[#252525] dark:text-neutral-300">
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-[#F47721]" />
              The Fair-Trade Charter
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 m-0">
              By accessing LokSetu, buying handcrafted items, or booking certified community guides and homestays, you actively support our verified 90% direct payout model that revitalizes rural economies across West Bengal, Bihar, and Jharkhand.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              1. Commercial Architecture & Transparent 90/10 Split
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>90% Direct Remittance:</strong> For all handicraft sales, homestay accommodations, and guided walking tours, exactly 90% of the customer order price is transferred directly to the verified artisan or host.
              </li>
              <li>
                <strong>10% Platform Operation:</strong> LokSetu retains 10% strictly to defray payment gateway fees, cloud server hosting, SMS dispatch, and physical inspection verifications. No hidden markups or predatory commissions are applied.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              2. Authentic Handicraft Guarantee & Anti-Counterfeit Pledge
            </h2>
            <p>
              Every artisan onboarded on LokSetu signs a solemn pledge that items listed (Bishnupur Terracotta, Dokra bell metal, Bolpur Kantha, Madhubani folk paintings, Manjusha art, etc.) are authentic, hand-crafted products originating from indigenous artisans.
            </p>
            <p>
              Listing machine-replicated polymer casts or factory copies under the guise of indigenous crafts results in immediate disqualification, forfeiture of verified status, and delisting from the network.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              3. Philatelic Stamp Condition & Historical Verification
            </h2>
            <p>
              All postage stamps and philatelic first day covers listed on LokSetu are verified for authenticity, perforation integrity, and catalog condition (Mint Never Hinged, Fine Used, or Lightly Hinged). Clear archival high-resolution scans are provided for individual collectible issues.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              4. Homestay Host & Guest Respect Code
            </h2>
            <p>
              Guests staying at registered rural homestays agree to respect the cultural sanctity, family traditions, and local ecosystem of rural villages. Homestay hosts commit to hygienic amenities, authentic home-cooked meals, and transparent pricing without on-spot surcharges.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or proceeding arising out of or related to LokSetu shall be subject to the exclusive jurisdiction of the competent courts in Kolkata, West Bengal.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F1D8C5] dark:border-neutral-800 flex justify-between items-center">
          <Link to="/privacy">
            <Button variant="outline" className="border-[#F47721]/30 text-[#F47721]">
              Privacy Policy
            </Button>
          </Link>
          <Link to="/refunds">
            <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white">
              Cancellation & Refund Policy
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
