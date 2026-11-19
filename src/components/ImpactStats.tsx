import { useEffect, useRef, useState } from "react";
import { Map, Stamp, Users, Package, Compass, Home } from "lucide-react";

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  note?: string;
  color: string;
}

const stats: StatItem[] = [
  {
    icon: Map,
    value: 18,
    suffix: "",
    label: "Destinations Listed",
    note: "Demo",
    color: "#F47721",
  },
  {
    icon: Stamp,
    value: 150,
    suffix: "+",
    label: "Heritage Stamps Documented",
    note: "Demo",
    color: "#E85D04",
  },
  {
    icon: Users,
    value: 11,
    suffix: "",
    label: "Local Artisans Listed",
    note: "Demo",
    color: "#F47721",
  },
  {
    icon: Package,
    value: 11,
    suffix: "",
    label: "Handicraft Products",
    note: "Demo",
    color: "#E85D04",
  },
  {
    icon: Compass,
    value: 9,
    suffix: "",
    label: "Guides Registered",
    note: "Demo",
    color: "#F47721",
  },
  {
    icon: Home,
    value: 6,
    suffix: "",
    label: "Homestay Partners",
    note: "Demo",
    color: "#E85D04",
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 50;
          const stepTime = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            setCount(Math.round(target * eased));
            if (step >= steps) {
              clearInterval(timer);
              setCount(target);
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

interface ImpactStatsProps {
  className?: string;
}

export function ImpactStats({ className = "" }: ImpactStatsProps) {
  return (
    <section className={`py-16 bg-[#252525] text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F47721]/20 border border-[#F47721]/30 text-[#F47721] text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F47721]" />
            Platform Demo Data
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Growing Community</h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm">
            These figures represent our platform demonstration. Real metrics will be tracked and updated once deployed with live data.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              {stat.note && (
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#F47721]/20 text-[#F47721] border border-[#F47721]/30">
                  {stat.note}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center rounded-xl border border-[#F47721]/20 bg-[#F47721]/10 p-4">
          <p className="text-sm text-white/70">
            <span className="font-semibold text-[#F47721]">📊 Important Note:</span>{" "}
            All statistics above are based on demo/sample data loaded for platform demonstration purposes. These figures represent our initial dataset and projected community size. Real metrics will be tracked once the platform is deployed with actual user data and partnerships.
          </p>
        </div>
      </div>
    </section>
  );
}
