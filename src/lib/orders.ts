import type { Stamp } from "@/lib/stamps";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type OrderItem = {
  id: string;
  orderNumber?: string;
  stampId?: string;
  item: string;
  date: string;
  status: "Processing" | "Paid" | "COD Requested" | "Cancelled" | "Return Requested" | "Returned" | "Pending" | "Failed" | "placed" | "confirmed" | "shipped" | "delivered";
  amount: number;
  paymentMethod: string;
  paymentStatus?: string;
  trackingStep: "Order Placed" | "Confirmed" | "Packed" | "Shipped" | "Out for delivery" | "Delivered" | "Cancelled" | "Return Requested" | "Returned";
  address?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryFee?: number;
  upiId?: string;
  utrNumber?: string;
  paymentProofUrl?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
};

const ORDERS_KEY = "stampSafar.orders";
export const ORDERS_UPDATED_EVENT = "stampSafar:orders-updated";

/**
 * Helper: get the current access token from the Supabase session.
 * Returns empty string if no session exists.
 */
async function getAccessToken(): Promise<string> {
  if (!supabase || !isSupabaseConfigured) return "";
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  } catch {
    return "";
  }
}

/**
 * Helper: build Authorization headers using the current session token.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function readOrders(): OrderItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(ORDERS_KEY);
    return value ? (JSON.parse(value) as OrderItem[]) : [];
  } catch {
    return [];
  }
}

export function addOrder(
  stamp: Stamp | { id: string; name: string; price: number },
  amount: number,
  paymentMethod: string,
  customId?: string,
  extra?: { utrNumber?: string; paymentProofUrl?: string; address?: string; email?: string; status?: OrderItem["status"] }
) {
  if (typeof window === "undefined") return;

  const order: OrderItem = {
    id: customId || `SS-${Date.now().toString().slice(-6)}`,
    orderNumber: customId || `SS-${Date.now().toString().slice(-6)}`,
    stampId: stamp.id,
    item: stamp.name,
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: extra?.status || (paymentMethod === "cod" ? "COD Requested" : paymentMethod === "upi_qr" ? "Pending" : "Paid"),
    amount,
    paymentMethod,
    trackingStep: paymentMethod === "cod" ? "Confirmed" : paymentMethod === "upi_qr" ? "Order Placed" : "Packed",
    address: extra?.address,
    email: extra?.email,
    utrNumber: extra?.utrNumber,
    paymentProofUrl: extra?.paymentProofUrl,
  };

  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...readOrders()]));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
}

export async function readOrdersFromSupabase(): Promise<OrderItem[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching orders from Supabase:", error);
      return [];
    }

    return data ? data.map((item: any) => ({
      id: item.id || item.order_number,
      orderNumber: item.order_number || item.id,
      stampId: item.stamp_id || "",
      item: item.item || "Stamp Safar Item",
      date: item.date || new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: item.status,
      amount: Number(item.total || item.amount || 0),
      paymentMethod: item.payment_method,
      paymentStatus: item.payment_status,
      trackingStep: item.tracking_step || (item.status === "paid" ? "Confirmed" : "Order Placed"),
      address: item.address || item.shipping_address?.line1 || "",
      email: item.email || item.customer_email || "",
      utrNumber: item.utr_number,
      paymentProofUrl: item.proof_url
    })) : [];
  } catch (err) {
    console.error("Supabase orders read failed:", err);
    return [];
  }
}

export async function addOrderToSupabase(
  stamp: Stamp | { id: string; name: string; price: number },
  amount: number,
  paymentMethod: string,
  customId?: string,
  extra?: {
    utrNumber?: string;
    paymentProofUrl?: string;
    address?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    deliveryFee?: number;
    paymentStatus?: string;
    status?: OrderItem["status"];
  }
): Promise<string> {
  const generatedId = customId || `SS-${Date.now().toString().slice(-6)}`;
  // First save locally
  addOrder(stamp, amount, paymentMethod, generatedId, extra);

  if (!supabase || !isSupabaseConfigured) return generatedId;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    const userEmail = extra?.email || session?.user?.email || "";

    const orderRow = {
      id: generatedId,
      order_number: generatedId,
      user_id: userId,
      stamp_id: stamp.id,
      item: stamp.name,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: extra?.status || (paymentMethod === "cod" ? "placed" : paymentMethod === "upi_qr" ? "placed" : "confirmed"),
      amount: amount,
      total: amount,
      subtotal: stamp.price,
      delivery_fee: extra?.deliveryFee || 0,
      payment_method: paymentMethod,
      payment_status: extra?.paymentStatus || (paymentMethod === "cod" ? "created" : paymentMethod === "upi_qr" ? "pending_verification" : "paid"),
      tracking_step: paymentMethod === "cod" ? "Confirmed" : paymentMethod === "upi_qr" ? "Order Placed" : "Packed",
      address: extra?.address || "",
      email: userEmail,
      customer_email: userEmail,
      customer_name: userEmail ? userEmail.split("@")[0] : "Customer",
      utr_number: extra?.utrNumber || null,
      proof_url: extra?.paymentProofUrl || null,
      latitude: extra?.latitude ? Number(extra.latitude) : null,
      longitude: extra?.longitude ? Number(extra.longitude) : null,
      shipping_address: extra?.address ? { line1: extra.address } : {},
    };

    await supabase.from("orders").insert(orderRow);

    // If UPI QR or Razorpay, record in payments table
    if (extra?.utrNumber || paymentMethod === "upi_qr") {
      await supabase.from("payments").insert({
        order_id: generatedId,
        provider: "upi_qr",
        upi_utr: extra?.utrNumber || null,
        proof_url: extra?.paymentProofUrl || null,
        amount: amount,
        status: "pending_verification"
      });
    }
  } catch (err) {
    console.error("Supabase order save failed:", err);
  }
  return generatedId;
}

export async function syncOrdersWithSupabase(): Promise<OrderItem[]> {
  if (!supabase || !isSupabaseConfigured) return readOrders();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return readOrders();

    const supabaseOrders = await readOrdersFromSupabase();
    const localOrders = readOrders();

    // Merge by order ID
    const mergedOrdersMap = new Map<string, OrderItem>();

    // Add local ones first
    localOrders.forEach((o) => mergedOrdersMap.set(o.id, o));
    // Overwrite/add with Supabase ones
    supabaseOrders.forEach((o) => mergedOrdersMap.set(o.id, o));

    const combinedOrders = Array.from(mergedOrdersMap.values());

    // Save to local storage for quick access
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(combinedOrders));
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));

    // Upload local orders that are missing in Supabase
    const missingInSupabase = localOrders.filter((lo) => !supabaseOrders.some((so) => so.id === lo.id));
    if (missingInSupabase.length > 0) {
      const inserts = missingInSupabase.map((o) => ({
        id: o.id,
        user_id: session.user.id,
        stamp_id: o.stampId,
        item: o.item,
        date: o.date,
        status: o.status,
        amount: o.amount,
        payment_method: o.paymentMethod,
        tracking_step: o.trackingStep
      }));
      await supabase.from("orders").insert(inserts);
    }

    return combinedOrders;
  } catch (err) {
    console.error("Orders sync failed:", err);
    return readOrders();
  }
}

export async function cancelOrderInBackend(orderId: string, reason: string): Promise<boolean> {
  // Update locally first for instant feedback (or fallback)
  const localOrders = readOrders();
  const updatedOrders = localOrders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: "Cancelled" as const,
        trackingStep: "Cancelled" as const,
      };
    }
    return o;
  });
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/cancel-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orderId, reason }),
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (err) {
    console.error("Failed to cancel order on backend:", err);
    // If backend fails but Supabase is connected, update Supabase directly
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "Cancelled", tracking_step: "Cancelled" })
          .eq("id", orderId);
        return !error;
      } catch (dbErr) {
        console.error("Direct Supabase update failed:", dbErr);
      }
    }
    return true; // Return true as local state has been updated
  }
}

export async function returnOrderInBackend(orderId: string, reason: string): Promise<boolean> {
  // Update locally first for instant feedback (or fallback)
  const localOrders = readOrders();
  const updatedOrders = localOrders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: "Return Requested" as const,
        trackingStep: "Return Requested" as const,
      };
    }
    return o;
  });
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/return-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orderId, reason }),
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (err) {
    console.error("Failed to return order on backend:", err);
    // If backend fails but Supabase is connected, update Supabase directly
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "Return Requested", tracking_step: "Return Requested" })
          .eq("id", orderId);
        return !error;
      } catch (dbErr) {
        console.error("Direct Supabase update failed:", dbErr);
      }
    }
    return true; // Return true as local state has been updated
  }
}

/**
 * Admin: Fetch ALL orders from backend or Supabase directly.
 */
export async function readAllOrdersFromSupabase(): Promise<OrderItem[]> {
  // 1. Try backend API first
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/admin/orders`, { headers });
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.orders)) {
      return data.orders.map((item: any) => ({
        id: item.id || item.order_number,
        orderNumber: item.order_number || item.id,
        stampId: item.stamp_id || "",
        item: item.item || "Stamp Safar Item",
        date: item.date || new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: item.status,
        amount: Number(item.total || item.amount || 0),
        paymentMethod: item.payment_method,
        paymentStatus: item.payment_status,
        trackingStep: item.tracking_step || (item.status === "paid" ? "Confirmed" : "Order Placed"),
        address: item.address || item.shipping_address?.line1 || "",
        email: item.email || item.customer_email || "",
        latitude: item.latitude ? Number(item.latitude) : null,
        longitude: item.longitude ? Number(item.longitude) : null,
        deliveryFee: item.delivery_fee ? Number(item.delivery_fee) : 0,
        upiId: item.upi_id || "",
        utrNumber: item.utr_number,
        paymentProofUrl: item.proof_url,
        razorpayPaymentId: item.razorpay_payment_id || "",
        razorpayOrderId: item.razorpay_order_id || ""
      }));
    }
  } catch (err) {
    console.warn("Backend admin/orders failed, falling back to direct Supabase query:", err);
  }

  // 2. Direct Supabase Query fallback
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || item.order_number,
          orderNumber: item.order_number || item.id,
          stampId: item.stamp_id || "",
          item: item.item || "Stamp Safar Item",
          date: item.date || new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: item.status,
          amount: Number(item.total || item.amount || 0),
          paymentMethod: item.payment_method,
          paymentStatus: item.payment_status,
          trackingStep: item.tracking_step || (item.status === "paid" ? "Confirmed" : "Order Placed"),
          address: item.address || item.shipping_address?.line1 || "",
          email: item.email || item.customer_email || "",
          latitude: item.latitude ? Number(item.latitude) : null,
          longitude: item.longitude ? Number(item.longitude) : null,
          deliveryFee: item.delivery_fee ? Number(item.delivery_fee) : 0,
          upiId: item.upi_id || "",
          utrNumber: item.utr_number,
          paymentProofUrl: item.proof_url,
          razorpayPaymentId: item.razorpay_payment_id || "",
          razorpayOrderId: item.razorpay_order_id || ""
        }));
      }
    } catch (dbErr) {
      console.warn("Direct Supabase query failed:", dbErr);
    }
  }

  // 3. Fallback to localStorage orders
  return readOrders();
}

/**
 * Admin: Update order tracking step and/or status (requires owner token or admin).
 */
export async function adminUpdateOrderStatusInBackend(
  orderId: string,
  trackingStep: string,
  status?: string
): Promise<boolean> {
  // Update locally first
  const localOrders = readOrders();
  const updatedOrders = localOrders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        trackingStep: trackingStep as any,
        status: (status || o.status) as any,
        paymentStatus: status === "Paid" || status === "paid" || trackingStep === "Confirmed" ? "paid" : o.paymentStatus,
      };
    }
    return o;
  });
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));

  // Update Supabase directly
  if (supabase && isSupabaseConfigured) {
    try {
      const updatePayload: Record<string, any> = {
        tracking_step: trackingStep,
        updated_at: new Date().toISOString(),
      };
      if (status) {
        updatePayload.status = status;
        if (status === "Paid" || status === "paid") {
          updatePayload.payment_status = "paid";
        }
      }
      await supabase.from("orders").update(updatePayload).eq("id", orderId);
    } catch (dbErr) {
      console.warn("Direct Supabase order status update error:", dbErr);
    }
  }

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/admin/update-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orderId, trackingStep, status }),
    });
    const data = await response.json();
    return response.ok && data.success;
  } catch (err) {
    console.warn("Backend update-order failed:", err);
    return true; // Succeeded locally and in Supabase
  }
}

export async function readPaymentSettings(): Promise<{ upi_id: string; qr_code_url: string }> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const response = await fetch(`${backendUrl}/payment-settings`);
    const data = await response.json();
    if (response.ok && data.success && data.settings?.upi_id) {
      return data.settings;
    }
  } catch (err) {
    // console.log("Using default payment settings");
  }
  return {
    upi_id: "7980797454@slc",
    qr_code_url: "/upi-qr.png",
  };
}

/**
 * Admin: Update UPI payment settings (requires owner token).
 */
export async function updatePaymentSettingsInBackend(upiId: string, qrCodeUrl: string): Promise<boolean> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/admin/update-settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ upiId, qrCodeUrl }),
    });
    const data = await response.json();
    return response.ok && data.success;
  } catch (err) {
    console.error("Failed to update payment settings in backend:", err);
    return false;
  }
}

/**
 * Admin: Fetch registered users from backend (requires owner token).
 */
export async function readAllUsersFromBackend(): Promise<
  { id: string; email: string; name: string; role: string; created_at: string; last_sign_in_at: string }[]
> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
    const headers = await authHeaders();
    const response = await fetch(`${backendUrl}/admin/users`, { headers });
    const data = await response.json();
    if (response.ok && data.success) {
      return data.users;
    }
  } catch (err) {
    console.error("Failed to fetch users from backend:", err);
  }
  return [];
}
