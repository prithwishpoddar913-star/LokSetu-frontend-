/**
 * Stamp Safar — Privacy-Friendly Analytics
 * Feeds aggregated public impact counters without capturing PII or third-party cookies.
 * Honors browser Do-Not-Track headers.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type EventType =
  | "page_view"
  | "destination_view"
  | "stamp_view"
  | "handicraft_view"
  | "enquiry_sent"
  | "order_placed"
  | "booking_requested"
  | "lang_switch"
  | "pwa_install";

export interface AnalyticsEvent {
  event_type: EventType;
  resource_id?: string;
  state?: string;
  meta?: Record<string, any>;
}

export function isDoNotTrackEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    navigator.doNotTrack === "1" ||
    (window as any).doNotTrack === "1" ||
    (navigator as any).msDoNotTrack === "1"
  );
}

export async function trackEvent(
  eventType: EventType,
  details: { resourceId?: string; state?: string; meta?: Record<string, any> } = {}
) {
  if (isDoNotTrackEnabled()) {
    // Respect user privacy: Do Not Track is active
    return;
  }

  // Sanitize meta: never include personal identifiers
  const cleanMeta = { ...details.meta };
  delete cleanMeta.email;
  delete cleanMeta.phone;
  delete cleanMeta.name;
  delete cleanMeta.address;

  // Insert to Supabase events table if configured
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from("events").insert({
        event_type: eventType,
        resource_id: details.resourceId || null,
        state: details.state || null,
        meta: cleanMeta,
      });
    } catch {
      // Non-blocking
    }
  }
}
