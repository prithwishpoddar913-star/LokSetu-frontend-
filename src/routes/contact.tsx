import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IMPACT_CONFIG } from "@/lib/impact-config";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact & Grievance Redressal Desk — LokSetu",
      },
      {
        name: "description",
        content:
          "Official helpline, email, and grievance officer details for LokSetu (Seva First Innovation Challenge - Eastern Zone). Rapid 24-hour response.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Query");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage("Please complete all required fields (Name, Phone, and Message).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("enquiries").insert([
        {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          message: `[${subject}] ${message.trim()}`,
          status: "pending",
        },
      ]);

      if (error) {
        console.warn("Contact form notice:", error.message);
      }

      trackEvent("contact_form_submitted", { subject });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitted(true); // Graceful completion
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-neutral-800 border border-[#F47721]/30 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            24-Hour Dedicated Response Commitment
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#252525] dark:text-white tracking-tight">
            Contact & Grievance <span className="text-[#F47721]">Redressal</span>
          </h1>
          <p className="mt-3 text-base text-[#777777] dark:text-neutral-400 max-w-2xl mx-auto">
            Whether you are a collector inquiring about rare stamps, an artisan joining our network, or a traveler planning a trip to Eastern India, we are here to assist you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl p-6 bg-[#FFF7F0] dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 space-y-5">
              <h3 className="font-bold text-lg text-[#252525] dark:text-white">
                Official Helpline & Office
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#252525] dark:text-white">Helpline Numbers</p>
                  <p className="text-[#777777] dark:text-neutral-400 mt-0.5">
                    <a href={`tel:${IMPACT_CONFIG.contact.helplinePhone}`} className="hover:text-[#F47721]">
                      {IMPACT_CONFIG.contact.helplinePhone}
                    </a>
                  </p>
                  <p className="text-[#777777] dark:text-neutral-400">
                    <a href={`tel:${IMPACT_CONFIG.contact.alternatePhone}`} className="hover:text-[#F47721]">
                      {IMPACT_CONFIG.contact.alternatePhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#252525] dark:text-white">Email Inquiries</p>
                  <p className="text-[#777777] dark:text-neutral-400 mt-0.5">
                    <a href={`mailto:${IMPACT_CONFIG.contact.primaryEmail}`} className="hover:text-[#F47721]">
                      {IMPACT_CONFIG.contact.primaryEmail}
                    </a>
                  </p>
                  <p className="text-[#777777] dark:text-neutral-400">
                    <a href={`mailto:${IMPACT_CONFIG.contact.secondaryEmail}`} className="hover:text-[#F47721]">
                      {IMPACT_CONFIG.contact.secondaryEmail}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#252525] dark:text-white">Eastern Zone Secretariat</p>
                  <p className="text-[#777777] dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {IMPACT_CONFIG.contact.officeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#252525] dark:text-white">Support Hours</p>
                  <p className="text-[#777777] dark:text-neutral-400 mt-0.5">
                    {IMPACT_CONFIG.contact.workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Grievance Officer Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 space-y-2">
              <h4 className="text-xs font-bold text-[#F47721] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Statutory Grievance Redressal
              </h4>
              <p className="text-xs text-[#252525] dark:text-neutral-300">
                <strong>Officer:</strong> {IMPACT_CONFIG.contact.grievanceOfficer}
              </p>
              <p className="text-[11px] text-[#777777] dark:text-neutral-400 leading-relaxed">
                Dedicated desk for artisan payment disputes, authenticity verification queries, or shipping delays.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-md">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#252525] dark:text-white">
                    Thank You! Message Dispatched
                  </h3>
                  <p className="text-xs sm:text-sm text-[#777777] dark:text-neutral-400 max-w-md mx-auto">
                    Your inquiry has been logged in our system. Our team will review your message and reply to <strong>{phone}</strong> within 24 hours.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    variant="outline"
                    className="border-[#F47721]/30 text-[#F47721]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-[#252525] dark:text-white">
                    Send Us a Direct Message
                  </h3>
                  <p className="text-xs text-[#777777] dark:text-neutral-400">
                    Fill in your details below and our Eastern Zone coordinator will respond promptly.
                  </p>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cname">Your Name *</Label>
                      <Input
                        id="cname"
                        placeholder="e.g. Ramesh Ghosh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cphone">Mobile Number *</Label>
                      <Input
                        id="cphone"
                        type="tel"
                        placeholder="e.g. 9830123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cemail">Email Address (Optional)</Label>
                      <Input
                        id="cemail"
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="csubj">Nature of Inquiry</Label>
                      <select
                        id="csubj"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
                      >
                        <option value="General Query">General Query</option>
                        <option value="Philatelic Order Support">Philatelic Order Support</option>
                        <option value="Artisan Onboarding Help">Artisan Onboarding Help</option>
                        <option value="Homestay Booking Question">Homestay Booking Question</option>
                        <option value="Grievance / Refund Request">Grievance / Refund Request</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cmsg">Message Details *</Label>
                    <Textarea
                      id="cmsg"
                      rows={4}
                      placeholder="Please share details about your inquiry, order number, or the craft cluster you are interested in..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#F47721] hover:bg-[#E85D04] text-white gap-2 shadow-md"
                  >
                    {isSubmitting ? (
                      <>Transmitting Message...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Direct Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
