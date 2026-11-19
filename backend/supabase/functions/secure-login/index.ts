import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const rawEmail = body.email;
    const password = body.password;

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("cf-connecting-ip") || "unknown";

    if (!rawEmail || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Check lockout status using synchronized atomic DB function
    // Note: passing p_success = NULL checks status without recording an outcome
    const { data: preCheck, error: preCheckErr } = await supabaseAdmin.rpc("check_and_record_login_attempt", {
      p_email: email,
      p_success: false,
      p_ip: clientIp,
    });

    if (preCheckErr) {
      console.error("Lockout pre-check error:", preCheckErr);
    }

    if (preCheck && preCheck.blocked) {
      const remainingSec = preCheck.remaining_seconds || 86400;
      const hours = Math.floor(remainingSec / 3600);
      const minutes = Math.floor((remainingSec % 3600) / 60);

      return new Response(
        JSON.stringify({
          error: `Too many failed login attempts. Try again in ${hours}h ${minutes}m.`,
          blocked: true,
          remaining_seconds: remainingSec,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Attempt Authentication with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    // 3. Handle Login Failure
    if (authError || !authData.session) {
      // Record failure atomically in locked database function
      const { data: failResult } = await supabaseAdmin.rpc("check_and_record_login_attempt", {
        p_email: email,
        p_success: false,
        p_ip: clientIp,
      });

      if (failResult?.blocked) {
        return new Response(
          JSON.stringify({
            error: "Too many failed login attempts. Account has been blocked for 24 hours.",
            blocked: true,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const attemptsLeft = failResult?.attempts_remaining ?? 4;
      return new Response(
        JSON.stringify({
          error: `Invalid email or password. (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before 24h lockout)`,
          attempts_remaining: attemptsLeft,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. Handle Login Success -> Reset Lockout
    await supabaseAdmin.rpc("check_and_record_login_attempt", {
      p_email: email,
      p_success: true,
      p_ip: clientIp,
    });

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal authentication error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
