import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SubtleCrypto HMAC SHA-256 helper
async function verifyHmacSha256(data: string, key: string, expectedHex: string): Promise<boolean> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hexSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hexSignature.toLowerCase() === expectedHex.toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    if (!razorpayKeySecret) {
      throw new Error("RAZORPAY_KEY_SECRET not set in Edge Function secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Verify HMAC SHA-256 signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await verifyHmacSha256(payload, razorpayKeySecret, razorpay_signature);

    if (!isValid) {
      // Record failed payment attempt
      await supabase
        .from("payments")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "failed",
        })
        .eq("razorpay_order_id", razorpay_order_id);

      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Mark order as PAID and CONFIRMED
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", order_number)
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Mark payment as CAPTURED
    await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "captured",
      })
      .eq("razorpay_order_id", razorpay_order_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully.",
        orderId: orderData.id,
        orderNumber: orderData.order_number,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Payment verification error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
