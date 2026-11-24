import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  User,
  Mail,
  MapPin,
  Phone,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Trash2,
  Map,
  Compass,
  ShoppingBag,
  UserCheck,
  Sun,
  Moon,
  DownloadCloud,
  Globe,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FloatingDakBot } from "@/components/FloatingDakBot";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  CART_ITEM_ADDED_EVENT,
  CART_UPDATED_EVENT,
  readCart,
  removeFromCart,
  type CartItem,
} from "@/lib/cart";
import {
  markNotificationsRead,
  NOTIFICATIONS_UPDATED_EVENT,
  readNotifications,
  type AppNotification,
  syncNotificationsWithSupabase,
} from "@/lib/notifications";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  applyTheme,
  readTheme,
  readThemePreference,
  saveThemePreference,
  THEME_CHANGED_EVENT,
  type ResolvedTheme,
} from "@/lib/theme";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation, LANGUAGE_OPTIONS, type SupportedLanguage } from "@/lib/i18n";
import { IMPACT_CONFIG } from "@/lib/impact-config";

const navLinks = [
  { to: "/", labelKey: "nav.home", fallback: "Home" },
  { to: "/stamps", labelKey: "nav.stamps", fallback: "Stamps" },
  { to: "/heritage", labelKey: "nav.heritage", fallback: "Heritage" },
  { to: "/explore", labelKey: "nav.explore", fallback: "Explore India" },
  { to: "/handicrafts", labelKey: "nav.handicrafts", fallback: "Handicrafts" },
  { to: "/guides", labelKey: "nav.guides", fallback: "Guides" },
  { to: "/homestays", labelKey: "nav.homestays", fallback: "Homestays" },
  { to: "/impact", labelKey: "nav.impact", fallback: "Impact" },
  { to: "/about", labelKey: "nav.about", fallback: "About" },
  { to: "/onboard", labelKey: "nav.onboard", fallback: "Join Community" },
  { to: "/dashboard", labelKey: "nav.dashboard", fallback: "Dashboard" },
] as const;

const brandLogo = "/stamp-safar-logo.jpeg";

export function SiteLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cartPulse, setCartPulse] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [cartToast, setCartToast] = useState<{
    item: CartItem;
    alreadyInCart: boolean;
    key: number;
  } | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ResolvedTheme>(() => readTheme());

  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Collector";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    applyTheme(readThemePreference());
    setCurrentTheme(readTheme());

    const handleThemeChange = () => {
      setCurrentTheme(readTheme());
    };

    window.addEventListener(THEME_CHANGED_EVENT, handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = () => {
      if (readThemePreference() === "system") {
        applyTheme("system");
        setCurrentTheme(readTheme());
      }
    };
    media.addEventListener("change", handleMedia);

    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
      media.removeEventListener("change", handleMedia);
    };
  }, []);

  const toggleTheme = () => {
    const next: ResolvedTheme = currentTheme === "dark" ? "light" : "dark";
    saveThemePreference(next);
    setCurrentTheme(next);
  };

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      syncNotificationsWithSupabase();
    }
  }, [user]);

  useEffect(() => {
    const syncNotifications = () => setNotifications(readNotifications());
    syncNotifications();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, syncNotifications);
    window.addEventListener("storage", syncNotifications);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, syncNotifications);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  useEffect(() => {
    const syncCart = () => setCartItems(readCart());
    const showCartFeedback = (event: Event) => {
      const detail = (event as CustomEvent<{ item: CartItem; alreadyInCart: boolean }>).detail;
      if (!detail?.item) return;

      setCartPulse(false);
      window.setTimeout(() => setCartPulse(true), 0);
      setCartToast({ ...detail, key: Date.now() });
      window.setTimeout(() => setCartPulse(false), 650);
    };

    syncCart();
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener(CART_ITEM_ADDED_EVENT, showCartFeedback);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener(CART_ITEM_ADDED_EVENT, showCartFeedback);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    if (!cartToast) return;

    const timeout = window.setTimeout(() => setCartToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [cartToast]);

  const signOut = async () => {
    setProfileOpen(false);
    setOpen(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    navigate({ to: "/auth" });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const cartProtectionFee = cartItems.length ? Math.max(25, Math.round(cartTotal * 0.03)) : 0;
  const cartDeliveryFee = cartItems.length && cartTotal < 1000 ? 49 : 0;
  const cartGrandTotal = cartTotal + cartProtectionFee + cartDeliveryFee;
  const checkoutItem = cartItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* WCAG AA Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 z-50 px-4 py-2 bg-[#F47721] text-white font-bold rounded-lg shadow-2xl outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#121316]/90 border-b border-[#F1D8C5] dark:border-white/10 transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 h-16 py-2 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#F47721]/40 bg-white dark:bg-zinc-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src={brandLogo}
                alt="LokSetu logo"
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base">
                <span className="text-[#F47721]">Lok</span><span className="text-[#252525] dark:text-white">Setu</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#777777] dark:text-zinc-400">
                SFIC East · Heritage
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 ml-2 overflow-x-auto">
            {navLinks.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              const label = t(n.labelKey, n.fallback);

              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    active
                      ? "text-white bg-[#F47721]"
                      : "text-[#252525] dark:text-zinc-200 hover:text-[#F47721] hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher Pill (EN | বাংলা | हिन्दी) */}
            <div className="hidden xs:flex items-center rounded-full border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] p-0.5 text-xs shadow-xs">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLang(opt.code)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                    lang === opt.code
                      ? "bg-[#F47721] text-white shadow-xs"
                      : "text-[#777777] dark:text-zinc-300 hover:text-[#F47721]"
                  }`}
                  aria-label={`Switch language to ${opt.label}`}
                >
                  {opt.nativeLabel}
                </button>
              ))}
            </div>

            {/* Install PWA Prompt Button */}
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F47721]/40 bg-[#FFF0E5] dark:bg-[#F47721]/15 text-[#F47721] text-xs font-semibold hover:bg-[#F47721] hover:text-white transition"
                aria-label="Install LokSetu App"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{t("common.installApp", "Install App")}</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] text-[#777777] dark:text-zinc-300 transition hover:border-[#F47721] hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
              aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
            >
              {currentTheme === "dark" ? (
                <Sun className="h-4 w-4 text-[#F47721]" />
              ) : (
                <Moon className="h-4 w-4 text-[#777777]" />
              )}
            </button>

            {/* Notifications Button */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  markNotificationsRead();
                }}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] transition hover:border-[#F47721] hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4 text-[#777777] dark:text-zinc-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#F47721] px-1 text-[9px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] shadow-xl">
                  <div className="border-b border-[#F1D8C5] dark:border-white/10 px-4 py-3 font-semibold text-sm text-[#252525] dark:text-zinc-100">
                    Notifications
                  </div>
                  {notifications.length ? (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="border-b border-[#F1D8C5] dark:border-white/10 px-4 py-3">
                          <div className="text-sm font-semibold text-[#252525] dark:text-zinc-100">{notification.title}</div>
                          <div className="mt-1 text-xs text-[#777777] dark:text-zinc-400">
                            {notification.message}
                          </div>
                          <div className="mt-2 text-[10px] uppercase tracking-wide text-[#777777] dark:text-zinc-500">
                            {notification.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#777777] dark:text-zinc-400">
                      No notifications yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#F47721]/40 bg-[#FFF0E5] dark:bg-[#F47721]/15 px-3 text-xs font-semibold text-[#F47721] shadow-sm transition hover:bg-[#F47721] hover:text-white ${cartPulse ? "animate-cart-pop" : ""
                }`}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#F47721] text-white px-1 text-[9px] font-bold">
                {cartItems.length}
              </span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#F47721]/60 bg-[#FFF0E5] dark:bg-[#F47721]/15 shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#F47721]/40"
                  aria-label="Open account menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-[#F47721] text-sm font-semibold text-white">
                      {initials || <User className="h-4 w-4" />}
                    </span>
                  )}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <div className="text-sm font-semibold text-[#252525] dark:text-zinc-100">{displayName}</div>
                      <div className="truncate text-xs text-[#777777] dark:text-zinc-400">{user.email}</div>
                    </div>
                    <div className="my-1 h-px bg-[#F1D8C5] dark:bg-white/10" />
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#252525] dark:text-zinc-200 hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 hover:text-[#F47721]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#252525] dark:text-zinc-200 hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 hover:text-[#F47721]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-[#252525] dark:text-zinc-200 hover:text-[#F47721] hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
                >
                  <Link to="/auth">
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#F47721] text-white hover:bg-[#E85D04]"
                >
                  <Link to="/auth">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="xl:hidden p-2 rounded-md hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 text-[#252525] dark:text-zinc-200"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5 text-[#F47721]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {open && (
          <div className="xl:hidden border-t border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {/* Mobile Language Switcher Row */}
              <div className="flex items-center justify-between py-2 border-b border-[#F1D8C5] dark:border-white/10 mb-1">
                <span className="text-xs font-medium text-muted-foreground">Language:</span>
                <div className="flex items-center rounded-full border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] p-0.5 text-xs">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setLang(opt.code)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                        lang === opt.code
                          ? "bg-[#F47721] text-white shadow-xs"
                          : "text-[#777777] dark:text-zinc-300 hover:text-[#F47721]"
                      }`}
                    >
                      {opt.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>

              {navLinks.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-[#252525] dark:text-zinc-200 hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 hover:text-[#F47721]"
                >
                  {t(n.labelKey, n.fallback)}
                </Link>
              ))}

              {installPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    handleInstallClick();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#F47721] font-semibold hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
                >
                  <DownloadCloud className="h-4 w-4" />
                  {t("common.installApp", "Install LokSetu App")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCartOpen(true);
                  setOpen(false);
                }}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[#252525] dark:text-zinc-200 hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-[#F47721]" />
                  Cart
                </span>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#F47721] px-1 text-[10px] font-bold text-white">
                  {cartItems.length}
                </span>
              </button>
              {user ? (
                <div className="pt-2">
                  <div className="mb-2 flex items-center gap-3 rounded-lg border border-[#F1D8C5] dark:border-white/10 bg-[#FFF0E5] dark:bg-[#F47721]/15 p-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-[#F47721]/40 bg-[#F47721] text-white">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-sm font-semibold">
                          {initials || "DS"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#252525] dark:text-zinc-100">{displayName}</div>
                      <div className="truncate text-xs text-[#777777] dark:text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 border-[#F1D8C5] dark:border-white/10">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 bg-[#F47721] text-white hover:bg-[#E85D04]">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">{children}</main>
      <FloatingDakBot />

      {/* Floating Cart Trigger */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-5 left-4 sm:left-5 z-40 inline-flex h-11 sm:h-12 items-center gap-1.5 sm:gap-2 rounded-full border border-[#F47721]/40 bg-white dark:bg-[#181A20] px-3.5 sm:px-4 text-xs sm:text-sm font-semibold shadow-xl transition hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 ${cartPulse ? "animate-cart-pop" : ""
          }`}
        aria-label="Open cart"
      >
        <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 text-[#F47721]" />
        <span className="text-[#252525] dark:text-zinc-100">Cart</span>
        <span className="grid h-4 sm:h-5 min-w-4 sm:min-w-5 place-items-center rounded-full bg-[#F47721] px-1 text-[9px] sm:text-[10px] font-bold text-white">
          {cartItems.length}
        </span>
      </button>

      {/* Cart Toast Feedback */}
      {cartToast && (
        <div
          key={cartToast.key}
          className="fixed bottom-20 left-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] items-center gap-3 rounded-2xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] p-3 shadow-2xl animate-cart-toast"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#FFF0E5] dark:bg-[#F47721]/20">
            <img
              src={cartToast.item.image}
              alt={cartToast.item.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[#252525] dark:text-zinc-100">
              {cartToast.alreadyInCart ? "Already in cart" : "Added to cart"}
            </div>
            <div className="truncate text-xs text-[#777777] dark:text-zinc-400">{cartToast.item.name}</div>
          </div>
          <span className="rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/20 px-2 py-1 text-xs font-bold text-[#F47721]">
            ₹{cartToast.item.price.toLocaleString("en-IN")}
          </span>
        </div>
      )}

      {/* Cart Slide-Out Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#181A20] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1D8C5] dark:border-white/10 p-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#252525] dark:text-zinc-100">
                  <ShoppingCart className="h-5 w-5 text-[#F47721]" />
                  Cart
                </h2>
                <p className="text-xs text-[#777777] dark:text-zinc-400">
                  {cartItems.length} stamp{cartItems.length === 1 ? "" : "s"} selected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#FFF0E5] dark:hover:bg-[#F47721]/15 text-[#777777] dark:text-zinc-300"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="grid h-full place-items-center rounded-xl border border-dashed border-[#F1D8C5] dark:border-white/10 bg-[#FFF0E5]/40 dark:bg-[#F47721]/5 p-6 text-center">
                  <div>
                    <ShoppingCart className="mx-auto h-10 w-10 text-[#F47721]/40" />
                    <div className="mt-3 font-semibold text-[#252525] dark:text-zinc-100">Cart is empty</div>
                    <p className="mt-1 text-sm text-[#777777] dark:text-zinc-400">
                      Add any stamp to see it here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-[#F1D8C5] dark:border-white/10 bg-white dark:bg-[#20232B] p-3">
                      <Link
                        to="/stamps/$stampId"
                        params={{ stampId: item.id }}
                        onClick={() => setCartOpen(false)}
                        className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-[#FFF0E5] dark:bg-[#F47721]/10 transition hover:ring-2 hover:ring-[#F47721]/50"
                        aria-label={`View details for ${item.name}`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/stamps/$stampId"
                          params={{ stampId: item.id }}
                          onClick={() => setCartOpen(false)}
                          className="block truncate font-semibold text-[#252525] dark:text-zinc-100 transition hover:text-[#F47721]"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 text-xs text-[#777777] dark:text-zinc-400">
                          {item.year} · {item.category}
                        </div>
                        <div className="mt-2 font-bold text-[#F47721]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <Link
                            to="/stamps/$stampId"
                            params={{ stampId: item.id }}
                            onClick={() => setCartOpen(false)}
                            className="text-xs font-semibold text-[#F47721] hover:underline"
                          >
                            View info
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#F1D8C5] dark:border-white/10 p-4">
              <div className="space-y-2 rounded-xl bg-[#FFF0E5]/60 dark:bg-white/5 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777] dark:text-zinc-400">Subtotal</span>
                  <span className="text-[#252525] dark:text-zinc-100">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777] dark:text-zinc-400">Protection fee</span>
                  <span className="text-[#252525] dark:text-zinc-100">₹{cartProtectionFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777] dark:text-zinc-400">Delivery</span>
                  <span className="text-[#252525] dark:text-zinc-100">{cartDeliveryFee ? `₹${cartDeliveryFee}` : "Free"}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#F1D8C5] dark:border-white/10 pt-2 font-bold">
                  <span className="text-[#252525] dark:text-zinc-100">Total</span>
                  <span className="text-[#F47721]">₹{cartGrandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              {checkoutItem ? (
                <Button asChild className="mt-4 w-full gap-2 bg-[#F47721] hover:bg-[#E85D04] text-white">
                  <Link
                    to="/stamps/$stampId/buy"
                    params={{ stampId: checkoutItem.id }}
                    onClick={() => setCartOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Checkout
                  </Link>
                </Button>
              ) : (
                <Button className="mt-4 w-full gap-2 bg-[#F47721] hover:bg-[#E85D04] text-white" disabled>
                  <ShoppingCart className="h-4 w-4" />
                  Checkout
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Footer */}
      {/* FOOTER */}
      <footer className="mt-16 border-t border-[#F1D8C5] dark:border-white/10 bg-[#FFF0E5] dark:bg-[#121316] transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 py-12 grid gap-8 grid-cols-2 md:grid-cols-5">
          {/* Col 1: Brand & Challenge */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-[#F47721]/40 bg-white dark:bg-zinc-800">
                <img
                  src={brandLogo}
                  alt="LokSetu logo"
                  className="h-full w-full object-cover"
                  width={36}
                  height={36}
                />
              </div>
              <span className="font-bold text-lg">
                <span className="text-[#F47721]">Lok</span><span className="text-[#252525] dark:text-white">Setu</span>
              </span>
            </div>
            <p className="text-xs text-[#777777] dark:text-zinc-400 leading-relaxed mb-3">
              Entry for the <strong>Seva First Innovation Challenge – Eastern Zone</strong>. Connecting postal heritage to living cultural destinations and rural artisan livelihoods across West Bengal, Bihar, and Jharkhand.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F47721]/10 text-[#F47721] text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              90% Direct Community Payout
            </div>
          </div>

          {/* Col 2: Mission & Impact */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-[#252525] dark:text-zinc-100">Mission &amp; Impact</h4>
            <ul className="space-y-2 text-xs text-[#777777] dark:text-zinc-400">
              <li>
                <Link to="/about" className="hover:text-[#F47721]">
                  About &amp; Impact Story
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-[#F47721]">
                  Live Impact Dashboard
                </Link>
              </li>
              <li>
                <Link to="/onboard" className="hover:text-[#F47721] text-[#F47721] font-medium">
                  + Join as Artisan / Host
                </Link>
              </li>
              <li>
                <a
                  href="https://sficeast.wb.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F47721]"
                >
                  SFIC East Challenge ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Explore Heritage */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-[#252525] dark:text-zinc-100">Explore Heritage</h4>
            <ul className="space-y-2 text-xs text-[#777777] dark:text-zinc-400">
              <li>
                <Link to="/heritage" className="hover:text-[#F47721]">
                  Heritage Explorer
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#F47721]">
                  Explore India
                </Link>
              </li>
              <li>
                <Link to="/handicrafts" className="hover:text-[#F47721]">
                  Rural Handicrafts
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#F47721]">
                  Local Youth Guides
                </Link>
              </li>
              <li>
                <Link to="/homestays" className="hover:text-[#F47721]">
                  Cultural Homestays
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Stamps & Marketplace */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-[#252525] dark:text-zinc-100">Philately &amp; Trade</h4>
            <ul className="space-y-2 text-xs text-[#777777] dark:text-zinc-400">
              <li>
                <Link to="/stamps" className="hover:text-[#F47721]">
                  All Stamps
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-[#F47721]">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/ai" className="hover:text-[#F47721]">
                  AI Stamp Identifier
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#F47721]">
                  My Collector Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Grievance */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-semibold mb-3 text-[#252525] dark:text-zinc-100">Contact &amp; Trust</h4>
            <ul className="space-y-2 text-xs text-[#777777] dark:text-zinc-400">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
                <span className="truncate">{IMPACT_CONFIG.contact.primaryEmail}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
                <span>{IMPACT_CONFIG.contact.helplinePhone}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F47721] shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal</span>
              </li>
              <li className="pt-1.5 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
                <Link to="/privacy" className="hover:text-[#F47721]">Privacy</Link>
                <span>·</span>
                <Link to="/terms" className="hover:text-[#F47721]">Terms</Link>
                <span>·</span>
                <Link to="/refunds" className="hover:text-[#F47721]">Refunds</Link>
                <span>·</span>
                <Link to="/shipping" className="hover:text-[#F47721]">Shipping</Link>
                <span>·</span>
                <Link to="/contact" className="hover:text-[#F47721]">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F1D8C5] dark:border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-4 text-xs text-[#777777] dark:text-zinc-400 flex flex-wrap justify-between items-center gap-2">
            <span>© {new Date().getFullYear()} LokSetu. Developed for Seva First Innovation Challenge (SFIC East).</span>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/about" className="hover:text-[#F47721]">Impact Story</Link>
              <Link to="/impact" className="hover:text-[#F47721]">Public Dashboard</Link>
              <Link to="/privacy" className="hover:text-[#F47721]">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-[#F47721]">Help &amp; Grievance</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
