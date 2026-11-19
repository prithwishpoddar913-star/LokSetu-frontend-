import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    const rzpSignature = req.headers.get("x-razorpay-signature");
    if (!rzpSignature) {
      return new Response("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = await verifyHmacSha256(rawBody, webhookSecret, rzpSignature);

    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (event === "payment.captured") {
      // Find order by razorpay_order_id in payments
      const { data: payRow } = await supabase
        .from("payments")
        .select("order_id")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (payRow) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payRow.order_id);

        await supabase
          .from("payments")
          .update({
            razorpay_payment_id: razorpayPaymentId,
            status: "captured",
          })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    } else if (event === "payment.failed") {
      await supabase
        .from("payments")
        .update({
          razorpay_payment_id: razorpayPaymentId,
          status: "failed",
        })
        .eq("razorpay_order_id", razorpayOrderId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
