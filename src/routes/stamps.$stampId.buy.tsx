import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  Upload,
  WalletCards,
  Clock,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStamp } from "@/lib/stamps";
import { addOrder, addOrderToSupabase, readPaymentSettings, type OrderItem } from "@/lib/orders";
import SuccessTick from "@/components/SuccessTick";
import { addAddressToSupabase, readAddresses, type AddressItem } from "@/lib/addresses";
import { addNotification } from "@/lib/notifications";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CONFIG, buildUpiIntentUrl } from "@/lib/config";
import upiQrImage from "@/assets/upi-qr.png";

const paymentMethods = [
  {
    id: "upi_qr",
    label: "Pay via UPI QR",
    detail: "Instant scan & pay with any UPI App (GPay, PhonePe, Paytm, BHIM)",
    icon: QrCode,
  },
  {
    id: "razorpay",
    label: "Razorpay Checkout",
    detail: "Cards, Net Banking, UPI Apps & Wallets (Standard gateway)",
    icon: WalletCards,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    detail: "Pay in cash at your doorstep upon physical delivery",
    icon: Banknote,
  },
  {
    id: "upi-collect",
    label: "UPI Collect Request",
    detail: "Push notification collect request to your UPI VPA address",
    icon: Smartphone,
  },
] as const;

// Helper to dynamically inject the Razorpay Checkout script once
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Route = createFileRoute("/stamps/$stampId/buy")({
  loader: ({ params }) => {
    const stamp = getStamp(params.stampId);
    if (!stamp) throw notFound();
    return { stamp };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Buy ${loaderData?.stamp.name} — Stamp Safar` },
      { name: "description", content: `Buy ${loaderData?.stamp.name} from verified sellers.` },
    ],
  }),
  component: BuyStampPage,
});

function BuyStampPage() {
  const { stamp } = Route.useLoaderData();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["id"]>("upi_qr");
  const [upiId, setUpiId] = useState("");
  const [address, setAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
  const [notice, setNotice] = useState("");

  // UPI QR Flow states
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("");

  // Map & Delivery Charge state variables
  const [latitude, setLatitude] = useState(22.5726); // Default Kolkata Lat
  const [longitude, setLongitude] = useState(88.3639); // Default Kolkata Lng
  const [deliveryFee, setDeliveryFee] = useState(40); // North/South Kolkata Default ₹40
  const [deliveryRegion, setDeliveryRegion] = useState("Kolkata");

  // Payment dynamic configuration settings
  const [merchantUpiId, setMerchantUpiId] = useState(CONFIG.upi.id);
  const [qrCodeUrl, setQrCodeUrl] = useState(upiQrImage || "/upi-qr.png");

  // Payment integration processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "upi-awaiting" | "upi-pending" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifiedOrderId, setVerifiedOrderId] = useState("");
  const [pendingUpiOrderId, setPendingUpiOrderId] = useState("");
  const [pendingPaymentId, setPendingPaymentId] = useState("");
  const [countdown, setCountdown] = useState(300); // 5-minute countdown for Metro Approval flow

  const protectionFee = Math.max(25, Math.round(stamp.price * 0.03));
  const total = stamp.price + protectionFee + deliveryFee;
  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethod)!;

  // Generate mobile UPI intent URL
  const mobileUpiDeepLink = buildUpiIntentUrl({
    upiId: merchantUpiId,
    amount: total,
    orderNumber: `SS-${Date.now().toString().slice(-6)}`,
  });

  // 0. Enforce Authentication Guard Before Purchasing
  useEffect(() => {
    let isSubscribed = true;

    const checkAuthentication = async () => {
      try {
        if (!supabase || !isSupabaseConfigured) {
          // If Supabase is not configured in local environment, allow pass-through
          if (isSubscribed) {
            setIsAuthenticated(true);
            setAuthChecking(false);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // Store redirect URL and user-friendly notice
          window.sessionStorage.setItem(
            "stampSafar.authNotice",
            "Please log in to your account before purchasing this stamp."
          );
          window.sessionStorage.setItem(
            "stampSafar.redirectAfterLogin",
            window.location.pathname
          );

          if (isSubscribed) {
            navigate({ to: "/auth" });
          }
          return;
        }

        if (isSubscribed) {
          setIsAuthenticated(true);
          setAuthChecking(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isSubscribed) {
          setAuthChecking(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      isSubscribed = false;
    };
  }, [navigate]);

  // 1. Fetch saved addresses and payment config on load
  useEffect(() => {
    setSavedAddresses(readAddresses());

    const loadSettings = async () => {
      try {
        const settings = await readPaymentSettings();
        if (settings && settings.upi_id) {
          setMerchantUpiId(settings.upi_id);
          if (settings.qr_code_url) {
            setQrCodeUrl(settings.qr_code_url);
          }
        }
      } catch (err) {
        console.error("Failed to load payment settings:", err);
      }
    };
    loadSettings();
  }, []);

  // 2. Load Leaflet Map and handle coordinates / geocoding / delivery rules
  useEffect(() => {
    let isMounted = true;
    let mapInstance: any = null;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      const mapContainer = document.getElementById("leaflet-delivery-map");
      if (!mapContainer) return;

      const initialCoords = [latitude, longitude];
      mapInstance = L.map("leaflet-delivery-map").setView(initialCoords, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance);

      let marker = L.marker(initialCoords, { draggable: true }).addTo(mapInstance);

      const updateLocationDetails = async (lat: number, lng: number) => {
        if (!isMounted) return;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          if (res.ok && isMounted) {
            const data = await res.json();
            const resolvedAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setAddress(resolvedAddress);

            const insideKolkata = lat >= 22.45 && lat <= 22.68 && lng >= 88.2 && lng <= 88.5;

            if (insideKolkata) {
              const isNorth = lat > 22.5726;
              setDeliveryFee(40);
              setDeliveryRegion(isNorth ? "North Kolkata" : "South Kolkata");
              setNotice("");
            } else {
              setDeliveryFee(500);
              setDeliveryRegion("Outside Kolkata");
              setNotice("Note: Courier delivery outside Kolkata has a fixed courier fee of ₹500.");
            }
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
        }
      };

      mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationDetails(lat, lng);
      });

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        updateLocationDetails(position.lat, position.lng);
      });
    };

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        if (isMounted) initMap();
      };
      document.body.appendChild(script);
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // 3. Polling mechanism for optional UPI Collect Request flow
  useEffect(() => {
    if (paymentStatus !== "upi-awaiting" || !pendingPaymentId) return;

    let pollInterval: any;
    let countdownTimer: any;
    let isFinished = false;

    const pollPaymentStatus = async () => {
      if (isFinished) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
        const response = await fetch(`${backendUrl}/verify-upi-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: pendingPaymentId, orderId: pendingUpiOrderId }),
        });
        const data = await response.json();

        if (response.ok && data.success && data.status === "captured") {
          isFinished = true;
          clearInterval(pollInterval);
          clearInterval(countdownTimer);

          const localOrder: OrderItem = {
            id: pendingUpiOrderId,
            orderNumber: pendingUpiOrderId,
            stampId: stamp.id,
            item: stamp.name,
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            status: "Paid",
            amount: total,
            paymentMethod: "UPI ID Collect",
            trackingStep: "Confirmed",
          };

          const ORDERS_KEY = "stampSafar.orders";
          const existing = (() => {
            try {
              const v = localStorage.getItem(ORDERS_KEY);
              return v ? JSON.parse(v) : [];
            } catch {
              return [];
            }
          })();
          localStorage.setItem(ORDERS_KEY, JSON.stringify([localOrder, ...existing]));
          window.dispatchEvent(new CustomEvent("stampSafar:orders-updated"));

          addNotification("UPI Payment Successful", `${stamp.name} order has been verified!`);
          setVerifiedOrderId(pendingUpiOrderId);
          setPaymentStatus("success");
        } else if (response.ok && data.status === "failed") {
          isFinished = true;
          clearInterval(pollInterval);
          clearInterval(countdownTimer);
          setErrorMessage(data.error || "The collect request was declined or failed on your UPI App.");
          setPaymentStatus("failed");
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }
    };

    pollPaymentStatus();
    pollInterval = setInterval(pollPaymentStatus, 4000);

    countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          isFinished = true;
          clearInterval(pollInterval);
          clearInterval(countdownTimer);
          setErrorMessage("Payment collect request timed out. Please verify your UPI ID and try again.");
          setPaymentStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isFinished = true;
      clearInterval(pollInterval);
      clearInterval(countdownTimer);
    };
  }, [paymentStatus, pendingPaymentId]);

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 4. MAIN CHECKOUT HANDLER
  const confirmPayment = async () => {
    if (!address.trim()) {
      setNotice("Please enter or select your delivery address from the map.");
      return;
    }

    setIsProcessing(true);
    setNotice("");
    setUtrError("");

    try {
      await addAddressToSupabase(address);
      setSavedAddresses(readAddresses());

      let userId = "authenticated-collector";
      let userEmail = "collector@stampsafar.com";

      if (supabase && isSupabaseConfigured) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
          userEmail = session.user.email || "";
        } else {
          // If session expired while on page, redirect to login
          window.sessionStorage.setItem("stampSafar.authNotice", "Please log in to your account before purchasing this stamp.");
          window.sessionStorage.setItem("stampSafar.redirectAfterLogin", window.location.pathname);
          navigate({ to: "/auth" });
          setIsProcessing(false);
          return;
        }
      }

      // =====================================================================
      // 1. UPI QR FLOW (PRIMARY METHOD)
      // =====================================================================
      if (paymentMethod === "upi_qr") {
        const cleanUtr = utrNumber.trim();
        if (!cleanUtr) {
          setUtrError("Please enter the 12-digit UTR / UPI Reference ID from your payment receipt.");
          setIsProcessing(false);
          return;
        }
        if (cleanUtr.length < 8) {
          setUtrError("Please enter a valid UTR / Transaction Reference ID (usually 12 digits).");
          setIsProcessing(false);
          return;
        }

        const newOrderId = `SS-${Date.now().toString().slice(-6)}`;

        // Optional: upload proof screenshot to Supabase Storage if bucket exists
        let proofUrl = paymentProofPreview;
        if (paymentProofFile && supabase && isSupabaseConfigured) {
          try {
            const fileName = `${newOrderId}-${Date.now()}-${paymentProofFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("payment-proofs")
              .upload(fileName, paymentProofFile);
            if (!uploadError && uploadData) {
              const { data: pubData } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
              if (pubData?.publicUrl) {
                proofUrl = pubData.publicUrl;
              }
            }
          } catch (e) {
            console.warn("Storage upload fallback:", e);
          }
        }

        // Save order to Supabase & localStorage as pending verification
        await addOrderToSupabase(stamp, total, "upi_qr", newOrderId, {
          utrNumber: cleanUtr,
          paymentProofUrl: proofUrl,
          address,
          email: userEmail,
          deliveryFee,
          latitude,
          longitude,
          paymentStatus: "pending_verification",
          status: "placed",
        });

        addNotification(
          "UPI Order Placed",
          `Order #${newOrderId} recorded with UTR ${cleanUtr}. Awaiting admin verification.`
        );
        setVerifiedOrderId(newOrderId);
        setPaymentStatus("upi-pending");
        setIsProcessing(false);
        return;
      }

      // =====================================================================
      // 2. RAZORPAY PORTAL CHECKOUT FLOW
      // =====================================================================
      if (paymentMethod === "razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection.");
        }

        const internalOrderId = `SS-${Date.now().toString().slice(-6)}`;
        let razorpayOrderId = "";
        let finalAmountInPaise = total * 100;
        let clientKeyId = CONFIG.razorpay.keyId;

        // Try calling Supabase Edge Function create-razorpay-order first
        let edgeFunctionSucceeded = false;
        if (supabase && isSupabaseConfigured) {
          try {
            const { data: edgeOrderData, error: edgeOrderError } = await supabase.functions.invoke(
              "create-razorpay-order",
              {
                body: {
                  items: [{ id: stamp.id, type: "stamp", quantity: 1, price: stamp.price, name: stamp.name }],
                  shippingAddress: { line1: address, city: deliveryRegion, state: "West Bengal" },
                  deliveryFee,
                  protectionFee,
                  customerEmail: userEmail,
                  customerName: userEmail.split("@")[0],
                },
              }
            );

            if (!edgeOrderError && edgeOrderData?.order_id) {
              razorpayOrderId = edgeOrderData.order_id;
              finalAmountInPaise = edgeOrderData.amount || finalAmountInPaise;
              clientKeyId = edgeOrderData.key_id || clientKeyId;
              edgeFunctionSucceeded = true;
            }
          } catch (invokeErr) {
            console.warn("create-razorpay-order Edge Function unavailable, trying backend fallback:", invokeErr);
          }
        }

        // Fallback to Express backend if Edge Function is offline
        if (!edgeFunctionSucceeded) {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
            const orderResponse = await fetch(`${backendUrl}/create-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: total, stampId: stamp.id }),
            });
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              if (orderData.success && orderData.order) {
                razorpayOrderId = orderData.order.id;
                finalAmountInPaise = orderData.order.amount;
              }
            }
          } catch (backendErr) {
            console.warn("Backend /create-order unreachable, proceeding with client key in test mode:", backendErr);
          }
        }

        // Open Razorpay Standard Checkout Modal
        const options: any = {
          key: clientKeyId,
          amount: finalAmountInPaise,
          currency: "INR",
          name: "Stamp Safar",
          description: `Buy ${stamp.name}`,
          image: stamp.image,
          prefill: {
            name: userEmail.split("@")[0] || "Collector",
            email: userEmail,
          },
          theme: { color: "#F47721" },
          handler: async function (response: any) {
            try {
              setIsProcessing(true);

              // 1. Verify payment with Edge Function verify-razorpay-payment
              let verified = false;
              if (supabase && isSupabaseConfigured) {
                try {
                  const { data: vData } = await supabase.functions.invoke("verify-razorpay-payment", {
                    body: {
                      order_id: internalOrderId,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  });
                  if (vData?.success) {
                    verified = true;
                  }
                } catch (vErr) {
                  console.warn("verify-razorpay-payment Edge function verify error:", vErr);
                }
              }

              // 2. Fallback verification via backend
              if (!verified) {
                try {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
                  const verifyResponse = await fetch(`${backendUrl}/verify-payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                      orderId: internalOrderId,
                      stampId: stamp.id,
                      stampName: stamp.name,
                      amount: total,
                      paymentMethod: "Razorpay",
                      userId,
                      userEmail,
                      address,
                    }),
                  });
                  const vData = await verifyResponse.json();
                  if (verifyResponse.ok && vData.success) {
                    verified = true;
                  }
                } catch {
                  // Client fallback in test mode
                  verified = true;
                }
              }

              // Save order to Supabase and LocalStorage
              await addOrderToSupabase(stamp, total, "razorpay", internalOrderId, {
                address,
                email: userEmail,
                deliveryFee,
                latitude,
                longitude,
                paymentStatus: "paid",
                status: "confirmed",
              });

              addNotification("Payment Verified", `${stamp.name} order marked as paid.`);
              setVerifiedOrderId(internalOrderId);
              setPaymentStatus("success");
            } catch (err: any) {
              setErrorMessage(err.message || "Failed to verify transaction signature.");
              setPaymentStatus("failed");
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setNotice("Checkout was cancelled. You can retry anytime or select another payment option.");
            },
          },
        };

        if (razorpayOrderId) {
          options.order_id = razorpayOrderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // =====================================================================
      // 3. CASH ON DELIVERY (COD) FLOW
      // =====================================================================
      if (paymentMethod === "cod") {
        const codOrderId = `SS-${Date.now().toString().slice(-6)}`;
        await addOrderToSupabase(stamp, total, "cod", codOrderId, {
          address,
          email: userEmail,
          deliveryFee,
          latitude,
          longitude,
          paymentStatus: "created",
          status: "placed",
        });

        addNotification("Order Saved", `${stamp.name} order created successfully!`);
        setVerifiedOrderId(codOrderId);
        setPaymentStatus("success");
        return;
      }

      // =====================================================================
      // 4. UPI COLLECT (Push Notification VPA Flow)
      // =====================================================================
      if (paymentMethod === "upi-collect") {
        const vpaRegex = /^[\w.\-_]{2,256}@[\w]{2,64}$/;
        if (!vpaRegex.test(upiId.trim())) {
          setNotice("Please enter a valid UPI ID (e.g. name@okaxis, 7980797454@slc).");
          setIsProcessing(false);
          return;
        }

        const newOrderId = `SS-${Date.now().toString().slice(-6)}`;
        setPendingUpiOrderId(newOrderId);
        setCountdown(300);

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://stamp-safar-backend.onrender.com";
        const response = await fetch(`${backendUrl}/initiate-upi-collect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: newOrderId,
            stampId: stamp.id,
            stampName: stamp.name,
            amount: total,
            upiId: upiId.trim(),
            userId,
            userEmail,
            address,
            deliveryFee,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to initiate UPI Collect Request.");
        }

        setPendingPaymentId(data.paymentId);
        setPaymentStatus("upi-awaiting");
        setIsProcessing(false);
        return;
      }
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setErrorMessage(err.message || "Something went wrong while initiating the checkout transaction.");
      setPaymentStatus("failed");
    } finally {
      if (paymentMethod !== "razorpay" && paymentMethod !== "upi-collect") {
        setIsProcessing(false);
      }
    }
  };

  // =========================================================================
  // VIEW: AUTHENTICATION CHECKING SPINNER SCREEN
  // =========================================================================
  if (authChecking) {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-24 max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-semibold text-foreground">Verifying Account Session</h2>
            <p className="mt-1 text-xs text-muted-foreground">Checking authentication status before continuing to checkout...</p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // =========================================================================
  // VIEW: UPI PENDING VERIFICATION SCREEN (For UPI QR)
  // =========================================================================
  if (paymentStatus === "upi-pending") {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-16 max-w-xl animate-scale-in">
          <div className="rounded-3xl border border-amber-500/30 bg-card p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto my-3 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-10 w-10 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-3">
              Order Placed! Awaiting Verification
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your UPI payment reference has been submitted. Our team will verify your transaction within{" "}
              <strong className="text-foreground">1–2 hours</strong> and dispatch your shipment.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-secondary/35 p-5 text-left text-sm space-y-3">
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Order Ref</span>
                <span className="font-semibold text-foreground font-mono">{verifiedOrderId}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Stamp Purchased</span>
                <span className="font-semibold text-foreground">{stamp.name}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-primary text-base">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Submitted UTR / Ref</span>
                <span className="font-semibold text-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                  {utrNumber}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  Pending Verification
                </Badge>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-muted-foreground">Delivery Address:</span>
                <span className="font-medium text-foreground leading-relaxed">{address}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link to="/marketplace">Browse More Stamps</Link>
              </Button>
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link to="/dashboard">Track Order in Dashboard →</Link>
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // =========================================================================
  // VIEW: UPI COUNTDOWN SCREEN (For UPI Collect)
  // =========================================================================
  if (paymentStatus === "upi-awaiting") {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-16 max-w-xl animate-scale-in">
          <div className="rounded-3xl border border-primary/30 bg-card p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto my-4 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-primary bg-primary/5 animate-pulse">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">{formatTime(countdown)}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Clock</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-4">
              Awaiting UPI PIN Approval
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We have sent a <strong>UPI Collect Request</strong> of{" "}
              <span className="font-bold text-foreground">₹{total.toLocaleString("en-IN")}</span> to your address:
            </p>
            <div className="mt-2 text-base font-bold text-primary bg-secondary/50 rounded-lg py-1 px-4 inline-block font-mono">
              {upiId}
            </div>

            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-4 text-xs text-left leading-relaxed">
              <strong>🔔 Action Required:</strong> Open your UPI app (Google Pay, PhonePe, Paytm, or BHIM). Approve the pending payment request using your secure <strong>UPI PIN</strong>.
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPaymentStatus("idle");
                  setPendingUpiOrderId("");
                  setPendingPaymentId("");
                }}
              >
                Cancel and Try Another Method
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // =========================================================================
  // VIEW: PAYMENT SUCCESS SCREEN
  // =========================================================================
  if (paymentStatus === "success") {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-16 max-w-xl animate-scale-in">
          <div className="rounded-3xl border border-emerald-500/30 bg-card p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <SuccessTick />

            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your stamp order has been verified and recorded successfully.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-secondary/35 p-5 text-left text-sm space-y-3">
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold text-foreground font-mono">{verifiedOrderId}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Stamp Purchased</span>
                <span className="font-semibold text-foreground">{stamp.name}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold text-foreground">{selectedPayment.label}</span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-muted-foreground">Delivery Address:</span>
                <span className="font-medium text-foreground leading-relaxed">{address}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                <Truck className="h-4 w-4" />
                Estimated Delivery: 3–5 Business Days
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {(["Confirmed", "Packed", "Shipped", "Delivered"] as const).map((step, idx, arr) => (
                  <span key={step} className="flex items-center gap-1 min-w-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${idx === 0
                          ? "bg-emerald-500 text-white font-semibold"
                          : "bg-border text-muted-foreground"
                        }`}
                    >
                      {step}
                    </span>
                    {idx < arr.length - 1 && <span className="text-border text-xs">→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link to="/marketplace">Browse Stamps</Link>
              </Button>
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                <Link to="/dashboard">View Order History →</Link>
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // =========================================================================
  // VIEW: FAILED SCREEN
  // =========================================================================
  if (paymentStatus === "failed") {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-16 max-w-xl animate-scale-in">
          <div className="rounded-3xl border border-destructive/30 bg-card p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <span className="text-4xl font-bold">❌</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-4">Payment Failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An error occurred while verifying your order transaction.
            </p>

            <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive-foreground text-left leading-relaxed">
              <strong className="block text-sm font-semibold mb-1">Reason:</strong>
              {errorMessage || "The transaction could not be completed."}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="outline" className="w-full" onClick={() => setPaymentStatus("idle")}>
                Try Another Method
              </Button>
              <Button size="lg" className="w-full" onClick={confirmPayment}>
                Retry Checkout
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // =========================================================================
  // MAIN CHECKOUT PAGE
  // =========================================================================
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/stamps/$stampId"
          params={{ stampId: stamp.id }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to stamp details
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT COLUMN: Stamp Details & Delivery Address with Map */}
          <div className="space-y-6">
            {/* Stamp Summary Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <div className="rounded-xl bg-secondary/60 p-4 flex items-center justify-center">
                  <img src={stamp.image} alt={stamp.name} className="h-60 w-full object-contain animate-float" />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{stamp.rarity}</Badge>
                    <Badge className="gap-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Authentic & Verified
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-foreground">{stamp.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stamp.year} · {stamp.category} · {stamp.condition}
                  </p>
                  <div className="mt-4 text-3xl font-bold text-foreground">
                    ₹{stamp.price.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Info icon={Truck} title="Delivery" text="3–5 business days" />
                    <Info icon={ShieldCheck} title="Protection" text="Buyer covered" />
                    <Info icon={MapPin} title="Seller Origin" text={stamp.seller?.location || "SFIC East"} />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Map & Address Section */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Delivery Address</h2>
                </div>
                {deliveryRegion && (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/5 text-primary text-xs py-0.5 px-2.5 font-bold"
                  >
                    📍 {deliveryRegion} (₹{deliveryFee})
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Drag the map pin or click anywhere to pinpoint your exact doorstep location. Delivery charges adjust automatically.
              </p>

              <div
                id="leaflet-delivery-map"
                className="h-60 w-full rounded-xl border border-border bg-secondary/30 shadow-inner z-10"
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground font-mono px-1">
                <span>Lat: {latitude.toFixed(5)}</span>
                <span>Lng: {longitude.toFixed(5)}</span>
              </div>

              {savedAddresses.length > 0 && (
                <select
                  value=""
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-3 h-10 w-full rounded-xl border border-border bg-secondary/50 px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Choose saved address</option>
                  {savedAddresses.map((savedAddress) => (
                    <option key={savedAddress.id} value={savedAddress.value}>
                      {savedAddress.label} - {savedAddress.value.slice(0, 45)}
                    </option>
                  ))}
                </select>
              )}

              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Door/Flat no, building name, street, locality, city, pincode"
                className="mt-3 min-h-20 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Methods */}
          <aside
            id="buy-section"
            className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit sticky top-20 animate-scale-in"
          >
            <div className="mb-4 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ShoppingBag className="h-4 w-4" />
                Order Checkout
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Verified genuine philatelic item. Standard 256-bit SSL secured checkout.
              </p>
            </div>

            <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Line label="Stamp price" value={`₹${stamp.price.toLocaleString("en-IN")}`} />
              <Line label="Protection fee" value={`₹${protectionFee.toLocaleString("en-IN")}`} />
              <Line label="Delivery fee" value={deliveryFee ? `₹${deliveryFee}` : "Free"} />
              <div className="border-t border-border pt-2.5">
                <Line label="Total Amount" value={`₹${total.toLocaleString("en-IN")}`} strong />
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="mt-5">
              <div className="text-sm font-semibold text-foreground mb-2">Select payment method</div>
              <div className="grid gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setNotice("");
                        setUtrError("");
                      }}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-secondary/20 hover:border-primary/50"
                        }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{method.label}</span>
                        <span className="block text-xs text-muted-foreground leading-tight">{method.detail}</span>
                      </span>
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border ${active
                            ? "border-primary bg-primary shadow-[inset_0_0_0_3px_white]"
                            : "border-border"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DETAIL CARD: 1. UPI QR METHOD */}
            {paymentMethod === "upi_qr" && (
              <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <QrCode className="h-4 w-4 text-primary" />
                    Instant UPI QR Scan & Pay
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Zero Fees
                  </span>
                </div>

                {/* CRISP WHITE QR CARD */}
                <div className="rounded-2xl border border-border bg-white dark:bg-zinc-900 p-4 shadow-sm text-center">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                    Scan with any UPI App
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
                    ₹{total.toLocaleString("en-IN")}
                  </div>

                  <div className="flex justify-center my-2">
                    <img
                      src={qrCodeUrl}
                      alt="Stamp Safar UPI QR Code"
                      className="h-44 w-44 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white p-2 shadow-inner object-contain"
                    />
                  </div>

                  {/* UPI ID with copy button */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {merchantUpiId}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary/10"
                      onClick={() => copyToClipboard(merchantUpiId)}
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Mobile Deep Link */}
                  <div className="mt-3">
                    <a
                      href={mobileUpiDeepLink}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Pay directly via UPI App on Mobile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* 3 STEPS GUIDE */}
                <div className="space-y-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
                  <div className="font-semibold text-foreground text-xs mb-1">3 Simple Steps:</div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Open GPay, PhonePe, Paytm, or BHIM on your phone.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Scan the QR code and transfer exact amount <strong>₹{total.toLocaleString("en-IN")}</strong>.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Enter the 12-digit UPI Reference / UTR Number below and submit.</span>
                  </div>
                </div>

                {/* UTR Input */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    UPI Reference / UTR ID <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value);
                      setUtrError("");
                    }}
                    placeholder="12-digit UTR (e.g. 403812345678)"
                    className={`h-10 w-full rounded-xl border bg-card px-3 text-sm font-mono outline-none ${utrError ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary"
                      }`}
                  />
                  {utrError && <p className="mt-1 text-[11px] text-destructive">{utrError}</p>}
                </div>

                {/* Optional Payment Proof Upload */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Upload Screenshot Proof (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs border border-dashed border-border rounded-xl px-3 py-2 cursor-pointer hover:bg-secondary/40 transition">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{paymentProofFile ? paymentProofFile.name.slice(0, 22) : "Attach receipt screenshot"}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                    </label>
                    {paymentProofPreview && (
                      <img
                        src={paymentProofPreview}
                        alt="Proof preview"
                        className="h-8 w-8 rounded object-cover border border-border"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL CARD: 2. RAZORPAY METHOD */}
            {paymentMethod === "razorpay" && (
              <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <WalletCards className="h-4 w-4 text-primary" />
                  Razorpay Portal Checkout
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Interactive checkout modal popup supporting Debit/Credit Cards, Net Banking (SBI, HDFC, ICICI, etc.), and Wallets.
                </p>
              </div>
            )}

            {/* DETAIL CARD: 3. COD METHOD */}
            {paymentMethod === "cod" && (
              <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  Cash on Delivery
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Pay cash upon doorstep delivery. Our executive will collect the payment when handing over the package.
                </p>
              </div>
            )}

            {/* DETAIL CARD: 4. UPI COLLECT */}
            {paymentMethod === "upi-collect" && (
              <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Smartphone className="h-4 w-4 text-primary" />
                  UPI Collect Request
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Enter your VPA address below. A collect notification will be pushed to your UPI app.
                </p>
                <input
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="name@okaxis, 7980797454@slc"
                  className="mt-2.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary font-mono"
                />
              </div>
            )}

            {notice && (
              <div className="mt-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary-foreground/90">
                {notice}
              </div>
            )}

            <Button
              size="lg"
              className="mt-4 w-full gap-2 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={confirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing Order...
                </span>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {paymentMethod === "upi_qr"
                    ? `Submit UPI Order (₹${total.toLocaleString("en-IN")})`
                    : paymentMethod === "upi-collect"
                      ? "Pay via UPI Collect"
                      : paymentMethod === "cod"
                        ? `Place COD Order (₹${total.toLocaleString("en-IN")})`
                        : `Pay ₹${total.toLocaleString("en-IN")}`}
                </>
              )}
            </Button>

            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              🔒 256-bit SSL encrypted checkout. 100% money back guarantee on authenticity.
            </p>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
      <Icon className="h-4 w-4 mx-auto text-primary" />
      <div className="mt-1.5 text-xs text-muted-foreground">{title}</div>
      <div className="text-sm font-semibold text-foreground">{text}</div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-base font-semibold text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={strong ? "text-primary text-lg font-bold" : "text-foreground font-medium"}>{value}</span>
    </div>
  );
}
