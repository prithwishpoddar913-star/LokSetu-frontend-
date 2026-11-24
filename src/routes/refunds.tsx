import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw, Clock, ShieldCheck, HelpCircle, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      {
        title: "Cancellation & Refund Policy — LokSetu",
      },
      {
        name: "description",
        content:
          "Clear cancellation and refund terms for philatelic stamps, handcrafted cultural artefacts, and rural homestay bookings on LokSetu.",
      },
    ],
  }),
  component: RefundsPolicyPage,
});

function RefundsPolicyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-neutral-800 border border-[#F47721]/30 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-4">
            <RotateCcw className="w-3.5 h-3.5" />
            Buyer Protection & Artisan Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#777777] dark:text-neutral-400">
            Fair, transparent rules that protect both cultural buyers and rural artisan livelihoods
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[#252525] dark:text-neutral-300">
          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              1. Stamps & Collectibles (7-Day Return Window)
            </h2>
            <p>
              We want every philatelist to be delighted with their acquisitions. If a stamp received has an undisclosed defect, torn perforation, or does not match the catalogue description, you are entitled to a full refund or replacement within <strong>7 days of delivery</strong>.
            </p>
            <p className="text-xs text-[#777777] dark:text-neutral-400">
              Note: The stamp must be returned in its original glassine archival envelope without damage or hinge removal.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              2. Fragile Handicrafts & Artisan Works
            </h2>
            <p>
              Handicrafts like Bishnupur Terracotta and Dokra metal sculptures are securely packed in multi-layer bubble wrap and rigid corrugated boxes. If an item arrives damaged or broken during transit:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Take a photograph or video of the unboxing showing the damaged packaging within <strong>48 hours of delivery</strong>.
              </li>
              <li>
                Send the photo along with your order ID to <strong>{IMPACT_CONFIG.contact.primaryEmail}</strong> or via WhatsApp at <strong>{IMPACT_CONFIG.contact.helplinePhone}</strong>.
              </li>
              <li>
                We will dispatch an immediate free replacement from the artisan or process a 100% full refund.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              3. Rural Homestay & Guide Booking Cancellations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-neutral-200 dark:border-neutral-700 text-xs my-4">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800">
                    <th className="p-3 border border-neutral-200 dark:border-neutral-700">Notice Period Before Check-in</th>
                    <th className="p-3 border border-neutral-200 dark:border-neutral-700">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700">48+ hours before check-in</td>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-semibold text-emerald-600 dark:text-emerald-400">100% Full Refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700">24 to 48 hours before check-in</td>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-semibold text-amber-600 dark:text-amber-400">50% Refund (to support host preparation)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700">Less than 24 hours or No-show</td>
                    <td className="p-3 border border-neutral-200 dark:border-neutral-700 text-red-600 dark:text-red-400">Non-refundable (remitted to rural host)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              4. Refund Processing Timelines
            </h2>
            <p>
              Once approved, refunds are credited back to the original payment source (UPI account or Card) within <strong>3 to 5 business days</strong> through our Razorpay settlement gateway. You will receive an SMS and email notification upon refund initiation.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F1D8C5] dark:border-neutral-800 flex justify-between items-center">
          <Link to="/shipping">
            <Button variant="outline" className="border-[#F47721]/30 text-[#F47721]">
              Shipping & Packaging Policy
            </Button>
          </Link>
          <Link to="/contact">
            <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white">
              Need Help? Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
