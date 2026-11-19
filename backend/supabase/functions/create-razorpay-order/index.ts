import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItemInput {
  productType: "stamp" | "handicraft";
  productId: string;
  quantity?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay API secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not set in Edge Function secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { items, shippingAddress, customerName, customerPhone, customerEmail, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Recalculate Subtotal from Database (NEVER trust client price)
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items as CartItemInput[]) {
      const qty = Math.max(1, item.quantity || 1);

      if (item.productType === "stamp") {
        const { data: stampData, error } = await supabase
          .from("stamps")
          .select("id, name, price")
          .eq("id", item.productId)
          .single();

        if (error || !stampData) {
          throw new Error(`Stamp ID ${item.productId} not found.`);
        }

        const lineTotal = Number(stampData.price) * qty;
        calculatedSubtotal += lineTotal;
        validatedItems.push({
          productType: "stamp",
          productId: stampData.id,
          name: stampData.name,
          unitPrice: Number(stampData.price),
          quantity: qty,
          lineTotal,
        });
      } else {
        const { data: craftData, error } = await supabase
          .from("handicraft_products")
          .select("id, name, price")
          .eq("id", item.productId)
          .single();

        if (error || !craftData) {
          throw new Error(`Handicraft product ID ${item.productId} not found.`);
        }

        const lineTotal = Number(craftData.price) * qty;
        calculatedSubtotal += lineTotal;
        validatedItems.push({
          productType: "handicraft",
          productId: craftData.id,
          name: craftData.name,
          unitPrice: Number(craftData.price),
          quantity: qty,
          lineTotal,
        });
      }
    }

    // 2. Calculate Shipping & Protection Fee
    const shipping = calculatedSubtotal >= 1000 ? 0 : 49;
    const protectionFee = Math.max(25, Math.round(calculatedSubtotal * 0.03));
    const grandTotal = calculatedSubtotal + shipping + protectionFee;
    const amountInPaise = Math.round(grandTotal * 100);

    const orderNumber = `SS-${Date.now().toString().slice(-6)}`;

    // 3. Create Order on Razorpay Orders API
    const authHeader = "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          platform: "Stamp Safar",
          orderNumber,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errBody = await rzpResponse.text();
      throw new Error(`Razorpay API error: ${errBody}`);
    }

    const rzpOrder = await rzpResponse.json();

    // 4. Record Order in Supabase with status 'placed', payment_status 'created'
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "placed",
        payment_method: "razorpay",
        payment_status: "created",
        subtotal: calculatedSubtotal,
        shipping,
        protection_fee: protectionFee,
        total: grandTotal,
        shipping_address: shippingAddress || {},
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Insert order items
    for (const vi of validatedItems) {
      await supabase.from("order_items").insert({
        order_id: orderRow.id,
        product_type: vi.productType,
        product_id: vi.productId,
        name: vi.name,
        unit_price: vi.unitPrice,
        quantity: vi.quantity,
        line_total: vi.lineTotal,
      });
    }

    // 6. Record Initial Payment Entry
    await supabase.from("payments").insert({
      order_id: orderRow.id,
      provider: "razorpay",
      razorpay_order_id: rzpOrder.id,
      amount: grandTotal,
      status: "created",
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderRow.id,
        orderNumber,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency,
        keyId: razorpayKeyId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to create order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
