import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta.env !== "undefined" && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  "https://klfmrtjftmaovafovqwz.supabase.co";

const supabasePublishableKey =
  (typeof import.meta.env !== "undefined" &&
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  "sb_publishable_C58mMkPiALs_CY7_upxmXQ_F5Kon1pR";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  !supabaseUrl.includes("your-") &&
  Boolean(supabasePublishableKey) &&
  !supabasePublishableKey.includes("your-");
