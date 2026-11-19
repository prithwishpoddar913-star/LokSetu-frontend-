/**
 * Central Configuration for Stamp Safar
 * UPI, Razorpay, Shipping, and Business Rules
 */

export const CONFIG = {
  // UPI Merchant Settings
  upi: {
    id: (typeof import.meta.env !== "undefined" && import.meta.env.VITE_MERCHANT_UPI_ID) || "7980797454@slc",
    merchantName: "Stamp Safar",
    // Local asset reference for the UPI QR
    qrAssetPath: "/upi-qr.png",
  },

  // Razorpay Public Client Key (TEST MODE)
  razorpay: {
    keyId: (typeof import.meta.env !== "undefined" && import.meta.env.VITE_RAZORPAY_KEY_ID) || "rzp_test_SwjXZw1YyTeEtJ",
    currency: "INR",
  },

  // Shipping & Platform Fee calculations
  order: {
    freeShippingThreshold: 1000,
    standardShippingFee: 49,
    minProtectionFee: 25,
    protectionFeeRate: 0.03, // 3%
  },

  // Supabase connection
  supabase: {
    url: (typeof import.meta.env !== "undefined" && import.meta.env.VITE_SUPABASE_URL) || "https://klfmrtjftmaovafovqwz.supabase.co",
    publishableKey: (typeof import.meta.env !== "undefined" && (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) || "sb_publishable_C58mMkPiALs_CY7_upxmXQ_F5Kon1pR",
  },
};

/**
 * Generate standard mobile UPI intent deep link
 * Format: upi://pay?pa={upiId}&pn={merchantName}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiIntentUrl(params: {
  upiId?: string;
  name?: string;
  amount: number;
  orderNumber?: string;
}): string {
  const pa = encodeURIComponent(params.upiId || CONFIG.upi.id);
  const pn = encodeURIComponent(params.name || CONFIG.upi.merchantName);
  const am = encodeURIComponent(params.amount.toFixed(2));
  const tn = encodeURIComponent(`Stamp Safar Order ${params.orderNumber || Date.now()}`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}
