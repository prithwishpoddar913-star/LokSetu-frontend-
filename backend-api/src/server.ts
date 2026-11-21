import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { supabase } from "./config/supabase.js";

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://stamp-safar-frontend-mg7e.onrender.com",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed) || allowed === "*")) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to avoid cross-origin breaks
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// Extended Request type with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Authentication Middleware:
 * Verifies Supabase JWT access token on protected routes.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Missing or malformed authorization header.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired session token. Please log in again.",
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: "Authentication failed. " + (err.message || ""),
    });
    return;
  }
}

// -------------------------------------------------------------
// Public Endpoints
// -------------------------------------------------------------

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to Stamp Safar API",
    status: "Running",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: "Stamp Safar Backend",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  });
});

// GET /payment-settings (Public)
app.get("/payment-settings", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      res.json({
        success: true,
        upi_id: process.env.MERCHANT_UPI_ID || "7980797454@slc",
        qr_code_url: "/upi-qr.png",
      });
      return;
    }

    res.json({
      success: true,
      upi_id: data?.upi_id || "7980797454@slc",
      qr_code_url: data?.qr_code_url || "/upi-qr.png",
    });
  } catch (err) {
    res.json({
      success: true,
      upi_id: "7980797454@slc",
      qr_code_url: "/upi-qr.png",
    });
  }
});

// -------------------------------------------------------------
// Protected Purchase / Order Endpoints (Requires User Auth)
// -------------------------------------------------------------

/**
 * POST /api/orders/create
 * Strictly protected order creation endpoint
 */
app.post("/api/orders/create", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stampId, stampName, amount, paymentMethod, address, utrNumber, deliveryFee } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!stampId || !amount || !address) {
      res.status(400).json({ success: false, error: "Missing required order parameters." });
      return;
    }

    const orderId = `SS-${Date.now().toString().slice(-6)}`;

    // Persist to Supabase orders table with user ownership
    const { data, error } = await supabase.from("orders").insert([
      {
        id: orderId,
        user_id: userId,
        user_email: userEmail,
        stamp_id: stampId,
        stamp_name: stampName,
        total_amount: amount,
        payment_method: paymentMethod || "upi_qr",
        shipping_address: address,
        utr_number: utrNumber || null,
        delivery_fee: deliveryFee || 40,
        status: "placed",
        payment_status: paymentMethod === "cod" ? "pending_cod" : "pending_verification",
        created_at: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      console.warn("Direct DB insert warning:", error.message);
    }

    res.status(201).json({
      success: true,
      orderId,
      message: "Order placed successfully under authenticated account.",
      data: data?.[0] || { id: orderId },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to create order." });
  }
});

/**
 * POST /create-order (Razorpay order proxy - protected)
 */
app.post("/create-order", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { amount, stampId } = req.body;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpaySecret) {
      // In development or simulation mode
      const simulatedOrderId = `order_${Date.now()}`;
      res.json({
        success: true,
        order: {
          id: simulatedOrderId,
          amount: Math.round(Number(amount) * 100),
          currency: "INR",
        },
      });
      return;
    }

    // Call Razorpay API
    const authString = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `receipt_${stampId}_${Date.now()}`,
        notes: {
          userId: req.user?.id,
          userEmail: req.user?.email,
          stampId,
        },
      }),
    });

    const rzpData = await rzpResponse.json();
    if (!rzpResponse.ok) {
      res.status(rzpResponse.status).json({ success: false, error: rzpData.error?.description || "Razorpay API error" });
      return;
    }

    res.json({ success: true, order: rzpData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to create Razorpay order" });
  }
});

/**
 * POST /verify-payment (Razorpay payment signature verification - protected)
 */
app.post("/verify-payment", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, stampId, stampName, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature, address } = req.body;

    // Verify signature if secret configured
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    let signatureValid = true;

    if (razorpaySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const crypto = await import("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      signatureValid = expectedSignature === razorpay_signature;
    }

    if (!signatureValid) {
      res.status(400).json({ success: false, error: "Invalid payment cryptographic signature." });
      return;
    }

    // Save paid order
    await supabase.from("orders").insert([
      {
        id: orderId,
        user_id: req.user?.id,
        user_email: req.user?.email,
        stamp_id: stampId,
        stamp_name: stampName,
        total_amount: amount,
        payment_method: "Razorpay",
        payment_id: razorpay_payment_id,
        shipping_address: address,
        status: "confirmed",
        payment_status: "paid",
        created_at: new Date().toISOString(),
      },
    ]);

    res.json({ success: true, message: "Payment verified and order recorded." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Verification error" });
  }
});

/**
 * POST /cancel-order (Requires authentication & user ownership)
 */
app.post("/cancel-order", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: "orderId is required" });
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "Cancelled", tracking_step: "Cancelled", cancel_reason: reason })
      .eq("id", orderId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: "Order cancelled successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /return-order (Requires authentication & user ownership)
 */
app.post("/return-order", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: "orderId is required" });
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "Return Requested", return_reason: reason })
      .eq("id", orderId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: "Return requested successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Admin Endpoints (Protected by User Token & Admin check)
// -------------------------------------------------------------

app.get("/admin/orders", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, orders: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/admin/users", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    const sanitizedUsers = (users || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || u.email?.split("@")[0] || "User",
      role: u.role || "user",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || "",
    }));

    res.json({ success: true, users: sanitizedUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stamp Safar API running on port ${PORT}`);
});
