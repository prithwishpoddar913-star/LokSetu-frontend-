import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      {
        title: "Privacy Policy & Zero-Tracking Charter — LokSetu",
      },
      {
        name: "description",
        content:
          "LokSetu's privacy policy: Zero advertising trackers, no personal data selling, Do Not Track (DNT) compliance, and encrypted Supabase data storage.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Tracking & Privacy-First Charter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white tracking-tight">
            Privacy Policy & Data Ethics
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#777777] dark:text-neutral-400">
            Last Updated: November 19, 2026 · Effective across Eastern Zone Operations
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[#252525] dark:text-neutral-300">
          {/* Commitment Summary */}
          <div className="p-6 rounded-2xl bg-[#FFF7F0] dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800">
            <h3 className="text-base font-bold text-[#F47721] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Our Core Privacy Commitment
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 m-0">
              LokSetu does not sell, rent, or monetize personal user information. We operate on a zero third-party advertising model. We collect only what is strictly required to fulfill philatelic orders, confirm homestay bookings, and remit 90% direct payouts to rural artisans and guides.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              1. Information We Collect & Why
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Customer Orders:</strong> Shipping name, delivery address, postal PIN code, and contact phone number are collected strictly to dispatch philatelic consignments and artisan handicrafts via India Post Speed Post.
              </li>
              <li>
                <strong>Community Onboarding:</strong> Artisans, guides, and homestay hosts provide identity details, bank/UPI account credentials for direct payout remittance, and proof of authentic craft tradition.
              </li>
              <li>
                <strong>Travel Enquiries:</strong> Name, phone, and trip dates submitted through destination enquiry forms are forwarded strictly to the assigned local guide or verified homestay.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              2. Zero Third-Party Advertising & Do Not Track (DNT)
            </h2>
            <p>
              We do not embed Facebook Pixel, Google AdSense, or third-party behavioral advertising SDKs.
              Our minimal internal telemetry logs aggregated counts (page visits and search terms) into an isolated database view without capturing IP addresses, fingerprinting hardware, or tracking across external websites.
            </p>
            <p>
              When your browser transmits a <code>Do Not Track (DNT: 1)</code> or <code>Global Privacy Control (GPC)</code> header, our client-side telemetry is automatically suppressed completely.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              3. Payment Security & Bank Information
            </h2>
            <p>
              LokSetu never stores full debit/credit card numbers or UPI MPINs on our servers.
              All payment transactions are handled through RBI-regulated payment gateways (Razorpay) or direct UPI dynamic QR deep-links using bank-grade 256-bit TLS encryption.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              4. Data Retention & Deletion Rights
            </h2>
            <p>
              Any user, artisan, or host may request complete erasure of their profile and order records by contacting our Grievance Officer. In compliance with statutory tax guidelines, invoice records are archived for the legally mandated period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#252525] dark:text-white mb-3">
              5. Grievance Officer & Official Contact
            </h2>
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1 text-xs">
              <p><strong>Grievance Redressal Officer:</strong> {IMPACT_CONFIG.contact.grievanceOfficer}</p>
              <p><strong>Email:</strong> {IMPACT_CONFIG.contact.primaryEmail}</p>
              <p><strong>Official Phone:</strong> {IMPACT_CONFIG.contact.helplinePhone}</p>
              <p><strong>Postal Address:</strong> {IMPACT_CONFIG.contact.officeAddress}</p>
              <p><strong>Response Time Commitment:</strong> Acknowledgement within 24 hours, resolution within 7 working days.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F1D8C5] dark:border-neutral-800 flex justify-between items-center">
          <Link to="/terms">
            <Button variant="outline" className="border-[#F47721]/30 text-[#F47721]">
              Read Terms of Service
            </Button>
          </Link>
          <Link to="/contact">
            <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white">
              Contact Grievance Desk
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
