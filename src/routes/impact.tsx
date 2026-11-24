import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Users,
  Compass,
  Home,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
  MapPin,
  HeartHandshake,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { IMPACT_CONFIG, calculateCommunitySplit } from "@/lib/impact-config";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      {
        title: "Public Impact Dashboard — LokSetu | SFIC East",
      },
      {
        name: "description",
        content:
          "Real-time transparent metrics on community payouts, verified artisans, local guides, and homestays across West Bengal, Bihar, and Jharkhand. Zero PII exposed.",
      },
    ],
  }),
  component: ImpactDashboardPage,
});

interface PublicMetrics {
  approved_artisans_count: number;
  approved_guides_count: number;
  approved_hosts_count: number;
  total_community_members: number;
  total_orders_count: number;
  total_order_value: number;
  total_community_payout: number;
  total_homestay_bookings: number;
  total_homestay_value: number;
  total_enquiries_count: number;
  total_stamps_count: number;
  total_destinations_mapped: number;
  total_states_covered: number;
  last_updated_at: string;
}

interface StateBreakdown {
  state: string;
  artisans: number;
  guides: number;
  hosts: number;
  total: number;
}

interface ActivityPoint {
  date: string;
  enquiries: number;
  orders: number;
  bookings: number;
}

function ImpactDashboardPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [stateBreakdown, setStateBreakdown] = useState<StateBreakdown[]>([]);
  const [timeSeries, setTimeSeries] = useState<ActivityPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [calculatorAmount, setCalculatorAmount] = useState<number>(1500);

  const fetchLiveMetrics = async () => {
    setIsLoading(true);
    try {
      // 1. Query public aggregated view
      const { data: viewData, error: viewError } = await supabase
        .from("v_public_impact")
        .select("*")
        .single();

      if (!viewError && viewData) {
        setMetrics(viewData as PublicMetrics);
      } else {
        // Fallback: Query tables directly with count aggregation if view is not yet created
        const [
          { count: artisansCount },
          { count: guidesCount },
          { count: hostsCount },
          { count: ordersCount, data: ordersData },
          { count: enquiriesCount },
        ] = await Promise.all([
          supabase.from("artisans").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("guides").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("hosts").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("orders").select("total, status").neq("status", "cancelled"),
          supabase.from("enquiries").select("*", { count: "exact", head: true }),
        ]);

        const totalOrders = ordersCount || 0;
        const totalValue = (ordersData || []).reduce((acc: number, cur: { total?: number }) => acc + (Number(cur.total) || 0), 0);
        const communityPayout = Math.round(totalValue * 0.9);

        setMetrics({
          approved_artisans_count: artisansCount || 0,
          approved_guides_count: guidesCount || 0,
          approved_hosts_count: hostsCount || 0,
          total_community_members: (artisansCount || 0) + (guidesCount || 0) + (hostsCount || 0),
          total_orders_count: totalOrders,
          total_order_value: totalValue,
          total_community_payout: communityPayout,
          total_homestay_bookings: 0,
          total_homestay_value: 0,
          total_enquiries_count: enquiriesCount || 0,
          total_stamps_count: 160,
          total_destinations_mapped: 18,
          total_states_covered: 3,
          last_updated_at: new Date().toISOString(),
        });
      }

      // 2. Query state breakdown
      const { data: stateData } = await supabase.from("v_impact_by_state").select("*");
      if (stateData && stateData.length > 0) {
        setStateBreakdown(
          stateData.map((row: any) => ({
            state: row.state,
            artisans: Number(row.artisans) || 0,
            guides: Number(row.guides) || 0,
            hosts: Number(row.hosts) || 0,
            total: (Number(row.artisans) || 0) + (Number(row.guides) || 0) + (Number(row.hosts) || 0),
          }))
        );
      } else {
        // Default clean state rows
        setStateBreakdown([
          { state: "West Bengal", artisans: 0, guides: 0, hosts: 0, total: 0 },
          { state: "Bihar", artisans: 0, guides: 0, hosts: 0, total: 0 },
          { state: "Jharkhand", artisans: 0, guides: 0, hosts: 0, total: 0 },
        ]);
      }

      // 3. Query or build 14-day activity series
      const { data: seriesData } = await supabase.from("v_impact_timeseries").select("*").limit(14);
      if (seriesData && seriesData.length > 0) {
        setTimeSeries(
          seriesData.map((r: any) => ({
            date: new Date(r.activity_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            enquiries: Number(r.enquiries) || 0,
            orders: Number(r.orders) || 0,
            bookings: Number(r.bookings) || 0,
          }))
        );
      } else {
        // Empty 7-day timeline showing real date slots with 0 values
        const days: ActivityPoint[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push({
            date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            enquiries: 0,
            orders: 0,
            bookings: 0,
          });
        }
        setTimeSeries(days);
      }

      setLastSynced(new Date());
    } catch (err) {
      console.warn("Public impact metrics fetch error:", err);
      // Fallback baseline for pilot
      setMetrics({
        approved_artisans_count: 0,
        approved_guides_count: 0,
        approved_hosts_count: 0,
        total_community_members: 0,
        total_orders_count: 0,
        total_order_value: 0,
        total_community_payout: 0,
        total_homestay_bookings: 0,
        total_homestay_value: 0,
        total_enquiries_count: 0,
        total_stamps_count: 160,
        total_destinations_mapped: 18,
        total_states_covered: 3,
        last_updated_at: new Date().toISOString(),
      });
      setStateBreakdown([
        { state: "West Bengal", artisans: 0, guides: 0, hosts: 0, total: 0 },
        { state: "Bihar", artisans: 0, guides: 0, hosts: 0, total: 0 },
        { state: "Jharkhand", artisans: 0, guides: 0, hosts: 0, total: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  const split = useMemo(() => {
    return calculateCommunitySplit(calculatorAmount);
  }, [calculatorAmount]);

  const isPilotEarlyStage = (metrics?.total_community_members || 0) === 0;

  return (
    <SiteLayout>
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-b from-[#FFF7F0] to-white dark:from-[#1E1E1E] dark:to-[#121212] py-12 lg:py-16 border-b border-[#F1D8C5] dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E5] dark:bg-neutral-800 border border-[#F47721]/30 text-[#F47721] text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Seva First Innovation Challenge · Live Public Telemetry
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#252525] dark:text-white tracking-tight">
                Public Impact <span className="text-[#F47721]">Dashboard</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-[#777777] dark:text-neutral-400 max-w-2xl">
                Real-time measurable verification of direct community earnings, verified artisans, rural homestays, and cultural tourism across Eastern India.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-[#777777] dark:text-neutral-400">Last synchronized</p>
                <p className="text-xs font-semibold text-[#252525] dark:text-neutral-200">
                  {lastSynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveMetrics}
                disabled={isLoading}
                className="gap-2 border-[#F47721]/30 hover:border-[#F47721] text-[#F47721] hover:bg-[#FFF7F0] dark:hover:bg-neutral-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ZERO-PII & DATA SOURCE BADGE */}
      <section className="bg-[#FFF0E5]/60 dark:bg-neutral-900/60 border-b border-[#F1D8C5]/70 dark:border-neutral-800 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[#252525] dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Data Integrity Protocol:</strong> Aggregated live from verified Supabase transactions. Zero PII (Personally Identifiable Information) is exposed.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#777777] dark:text-neutral-400">
              <Info className="w-3.5 h-3.5" />
              <span>Pilot zone: West Bengal, Bihar, Jharkhand</span>
            </div>
          </div>
        </div>
      </section>

      {/* PILOT LAUNCH NOTIFICATION IF DATABASE HAS 0 MEMBERS */}
      {isPilotEarlyStage && (
        <section className="container mx-auto px-4 sm:px-6 mt-8 max-w-6xl">
          <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-500/10 via-[#F47721]/10 to-transparent border border-amber-500/30 dark:border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                  Pilot Phase Active — Community Onboarding in Progress
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl">
                We are actively recruiting master artisans, youth heritage guides, and homestay hosts across Bengal, Bihar, and Jharkhand.
                In adherence to our strict integrity rule, statistics update live as real applications are submitted and verified.
              </p>
            </div>
            <Link to="/onboard">
              <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white shadow-md gap-2 shrink-0">
                <HeartHandshake className="w-4 h-4" />
                Join Community Network
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* CORE IMPACT METRICS GRID */}
      <section className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Direct Community Payout */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F47721]/10 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 text-xs font-semibold">
                90% Fair-Trade Share
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Direct Community Payout
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              ₹{(metrics?.total_community_payout || 0).toLocaleString("en-IN")}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              From ₹{(metrics?.total_order_value || 0).toLocaleString("en-IN")} gross volume. Paid directly to artisan & host accounts.
            </p>
          </div>

          {/* 2. Approved Artisans */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[#F47721] bg-[#FFF0E5] dark:bg-neutral-800 border-[#F47721]/30 text-xs">
                Verified Listings
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Verified Master Artisans
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              {metrics?.approved_artisans_count || 0}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              Kantha stitch, Dokra bell metal, Bishnupur Terracotta & Madhubani artists.
            </p>
          </div>

          {/* 3. Local Community Guides */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <Compass className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300 text-xs">
                Certified Heritage
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Local Heritage Guides
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              {metrics?.approved_guides_count || 0}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              Bilingual storytellers across Nalanda, Bodh Gaya, Bishnupur, and Netarhat.
            </p>
          </div>

          {/* 4. Heritage Homestays */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <Home className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300 text-xs">
                Village Stays
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Heritage Homestays Active
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              {metrics?.approved_hosts_count || 0}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              Authentic village stays keeping tourism revenue within local families.
            </p>
          </div>

          {/* 5. Orders & Bookings */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 text-xs">
                Fulfillment Tracked
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Total Orders & Bookings
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              {(metrics?.total_orders_count || 0) + (metrics?.total_homestay_bookings || 0)}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              Stamps, curated GI handicrafts, and homestay reservation requests.
            </p>
          </div>

          {/* 6. Enquiries Handled */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-[#F47721]/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E5] dark:bg-neutral-800 flex items-center justify-center text-[#F47721]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 text-xs">
                Direct Response
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#777777] dark:text-neutral-400">
              Tourism Enquiries Answered
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252525] dark:text-white mt-1">
              {metrics?.total_enquiries_count || 0}
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-2">
              Direct inquiries connected to local guides, postal history, and rural trips.
            </p>
          </div>
        </div>
      </section>

      {/* STATE-WISE DISTRIBUTION & ACTIVITY CHARTS */}
      <section className="container mx-auto px-4 sm:px-6 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: State Network Distribution */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#252525] dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F47721]" />
                  Eastern Zone Geographic Distribution
                </h3>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-1">
                  Verified community members across West Bengal, Bihar, and Jharkhand
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="state" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderRadius: "8px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="artisans" name="Artisans" fill="#F47721" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="guides" name="Guides" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hosts" name="Homestays" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#F1D8C5]/50 dark:border-neutral-800 text-center">
              <div className="p-2.5 rounded-lg bg-[#FFF7F0] dark:bg-neutral-800/60">
                <p className="text-xs font-semibold text-[#252525] dark:text-white">West Bengal</p>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">8 Destinations</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFF7F0] dark:bg-neutral-800/60">
                <p className="text-xs font-semibold text-[#252525] dark:text-white">Bihar</p>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">5 Destinations</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFF7F0] dark:bg-neutral-800/60">
                <p className="text-xs font-semibold text-[#252525] dark:text-white">Jharkhand</p>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">5 Destinations</p>
              </div>
            </div>
          </div>

          {/* Chart 2: Activity Over Time */}
          <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-[#F1D8C5] dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#252525] dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F47721]" />
                  Community Activity Trends (Last 14 Days)
                </h3>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-1">
                  Enquiries, orders, and homestay booking requests
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F47721" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F47721" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderRadius: "8px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="enquiries" name="Enquiries" stroke="#F47721" fillOpacity={1} fill="url(#colorEnq)" />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOrd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-center text-[#777777] dark:text-neutral-400 mt-6 pt-4 border-t border-[#F1D8C5]/50 dark:border-neutral-800">
              Aggregated daily from authentic visitor interactions and orders.
            </p>
          </div>
        </div>
      </section>

      {/* TRANSPARENT 90/10 FAIR-TRADE MODEL CALCULATOR */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-6xl">
        <div className="rounded-3xl p-8 lg:p-10 bg-gradient-to-br from-[#FFF7F0] via-white to-[#FFF0E5] dark:from-neutral-900 dark:via-neutral-900/90 dark:to-neutral-950 border border-[#F1D8C5] dark:border-neutral-800 shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-[#F47721] text-white hover:bg-[#F47721] mb-3">
              Fair-Trade Guarantee
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252525] dark:text-white">
              Transparent 90% Community Payout Model
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777777] dark:text-neutral-400 leading-relaxed">
              Unlike commercial booking aggregators and souvenir retail chains that charge 30% to 50% in middleman commissions,
              <strong> LokSetu remits 90% of every sale directly to the artisan or host.</strong> The remaining 10% strictly maintains
              cloud infrastructure, payment gateway processing, and verified craft authentications.
            </p>
          </div>

          {/* Interactive Calculator Slider */}
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-neutral-800/80 border border-[#F1D8C5] dark:border-neutral-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="calc-amount" className="text-xs font-bold uppercase tracking-wider text-[#252525] dark:text-white">
                Simulate Order / Booking Amount:
              </label>
              <span className="text-xl font-extrabold text-[#F47721]">
                ₹{calculatorAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <input
              id="calc-amount"
              type="range"
              min="200"
              max="15000"
              step="100"
              value={calculatorAmount}
              aria-label="Simulate Order or Booking Amount"
              onChange={(e) => setCalculatorAmount(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#F47721]"
            />

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Direct to Artisan (90%)
                </div>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  ₹{split.artisanAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                  Paid directly via UPI / Bank NEFT
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF7F0] dark:bg-neutral-800 border border-[#F1D8C5] dark:border-neutral-700">
                <div className="flex items-center gap-1.5 text-[#252525] dark:text-neutral-300 font-bold text-xs uppercase">
                  <Layers className="w-3.5 h-3.5 text-[#F47721]" />
                  Platform Operation (10%)
                </div>
                <p className="text-2xl font-black text-[#F47721] mt-1">
                  ₹{split.platformAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-[#777777] dark:text-neutral-400 mt-0.5">
                  Payment gateway & SMS verification
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/onboard">
              <Button className="bg-[#F47721] hover:bg-[#E85D04] text-white gap-2">
                <HeartHandshake className="w-4 h-4" />
                Apply for Onboarding
              </Button>
            </Link>
            <Link to="/handicrafts">
              <Button variant="outline" className="border-[#F47721]/30 hover:bg-[#FFF7F0] dark:hover:bg-neutral-800 text-[#F47721]">
                Browse GI Handicrafts
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" className="text-[#777777] dark:text-neutral-400 hover:text-[#252525] dark:hover:text-white">
                Read Problem & Solution Story <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
