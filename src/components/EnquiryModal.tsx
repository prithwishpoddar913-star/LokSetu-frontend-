import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { addNotification } from "@/lib/notifications";

export interface EnquiryData {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date?: string;
  subject: string;
  timestamp: string;
}

interface EnquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string;
  triggerLabel?: string;
}

const STORAGE_KEY = "stampSafar.enquiries";

async function saveEnquiry(enquiry: EnquiryData) {
  // Local storage fallback
  try {
    const existing: EnquiryData[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    existing.push(enquiry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn("Local storage save enquiry failed:", e);
  }

  // Supabase save
  if (supabase && isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // 1. Insert into general enquiries table
      await supabase.from("enquiries").insert({
        user_id: userId,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        subject: enquiry.subject,
        message: enquiry.message,
        status: "new",
      });

      // 2. If it's a homestay enquiry, also insert into homestay_bookings table
      if (enquiry.subject.toLowerCase().includes("homestay")) {
        const todayStr = new Date().toISOString().split("T")[0];
        const travelDate = enquiry.date || todayStr;
        await supabase.from("homestay_bookings").insert({
          user_id: userId,
          homestay_id: enquiry.subject.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase(),
          homestay_name: enquiry.subject,
          guest_name: enquiry.name,
          phone: enquiry.phone,
          email: enquiry.email,
          check_in: travelDate,
          check_out: travelDate,
          guests: 2,
          price_per_night: 1500,
          nights: 1,
          total: 1500,
          status: "enquiry",
          message: enquiry.message,
        });
      }
    } catch (err) {
      console.warn("Supabase enquiry insert failed:", err);
    }
  }

  try {
    addNotification("Enquiry Submitted", `Your enquiry for "${enquiry.subject}" has been sent.`);
  } catch {}
}

export function EnquiryModal({ open, onOpenChange, subject = "General Enquiry" }: EnquiryModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    date: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    // Simulate a small delay for UX
    setTimeout(() => {
      const enquiry: EnquiryData = {
        id: Date.now().toString(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        date: form.date,
        subject,
        timestamp: new Date().toISOString(),
      };
      saveEnquiry(enquiry);
      setSubmitted(true);
      setSubmitting(false);
    }, 600);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", phone: "", message: "", date: "" });
      setErrors({});
    }, 300);
  };

  const field = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#181A20] p-6 shadow-2xl border border-[#F1D8C5] dark:border-white/10 data-[state=open]:animate-scale-in transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-[#252525] dark:text-zinc-100">Send Enquiry</Dialog.Title>
              <Dialog.Description className="text-xs text-[#777777] dark:text-zinc-400 mt-0.5">{subject}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#FFF0E5] dark:hover:bg-white/10 text-[#777777] dark:text-zinc-400 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 border border-green-200 dark:border-green-800/50 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-[#252525] dark:text-zinc-100 mb-2">Enquiry Sent!</h3>
              <p className="text-sm text-[#777777] dark:text-zinc-300 mb-1">
                Thank you for your interest. Your enquiry has been saved.
              </p>
              <p className="text-xs text-[#777777] dark:text-zinc-400 mb-6 max-w-xs">
                This is a demo platform — enquiries are stored locally in your browser. Real connections will be enabled when the platform goes live.
              </p>
              <Button
                onClick={handleClose}
                className="bg-[#F47721] hover:bg-[#E85D04] text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] dark:text-zinc-200 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`bg-white dark:bg-[#121316] text-[#252525] dark:text-zinc-100 border-[#F1D8C5] dark:border-white/10 focus-visible:ring-[#F47721] ${errors.name ? "border-red-400" : ""}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] dark:text-zinc-200 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  placeholder="your@email.com"
                  className={`bg-white dark:bg-[#121316] text-[#252525] dark:text-zinc-100 border-[#F1D8C5] dark:border-white/10 focus-visible:ring-[#F47721] ${errors.email ? "border-red-400" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] dark:text-zinc-200 mb-1">
                  Phone Number (optional)
                </label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => field("phone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-white dark:bg-[#121316] text-[#252525] dark:text-zinc-100 border-[#F1D8C5] dark:border-white/10 focus-visible:ring-[#F47721]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] dark:text-zinc-200 mb-1">
                  Preferred Date (optional)
                </label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => field("date", e.target.value)}
                  className="bg-white dark:bg-[#121316] text-[#252525] dark:text-zinc-100 border-[#F1D8C5] dark:border-white/10 focus-visible:ring-[#F47721]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252525] dark:text-zinc-200 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => field("message", e.target.value)}
                  placeholder="Tell us about your interest, travel dates, or any specific requirements..."
                  rows={4}
                  className={`bg-white dark:bg-[#121316] text-[#252525] dark:text-zinc-100 border-[#F1D8C5] dark:border-white/10 focus-visible:ring-[#F47721] resize-none ${errors.message ? "border-red-400" : ""}`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              <p className="text-xs text-[#777777] dark:text-zinc-400 bg-[#FFF0E5] dark:bg-white/5 border border-transparent dark:border-white/10 rounded-lg p-2.5">
                📌 <strong>Demo platform:</strong> Enquiries are saved to your browser's local storage only. No real booking is processed.
              </p>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#F47721] hover:bg-[#E85D04] text-white gap-2 shadow-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Enquiry
                  </>
                )}
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
