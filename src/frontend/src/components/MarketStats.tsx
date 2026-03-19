import {
  Award,
  BarChart3,
  DollarSign,
  Layers,
  Lock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMarketStats } from "../hooks/useQueries";
import { formatLargeNumber, formatPercent, formatPrice } from "../utils/format";

interface StatCardProps {
  label: string;
  value: string;
  subValue: string;
  subPositive: boolean;
  icon: React.ReactNode;
  delay: number;
  locked?: boolean;
}

function StatCard({
  label,
  value,
  subValue,
  subPositive,
  icon,
  delay,
  locked,
}: StatCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 fade-in-up hover:border-neon-cyan/30 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {locked && <Lock className="w-3 h-3 text-neon-cyan/60" />}
          <div className="text-neon-cyan/60">{icon}</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div
        className={`flex items-center gap-1 text-sm font-semibold ${subPositive ? "text-neon-green" : "text-neon-red"}`}
      >
        {subPositive ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        {subValue}
      </div>
    </div>
  );
}

export default function MarketStats() {
  const { data: stats } = useMarketStats();

  const s = stats ?? {
    currentPrice: 0.00125,
    marketCap: 1_250_000,
    volume24h: 50_000,
    circulatingSupply: 1_000_000_000,
    totalSupply: 1_000_000_000,
    allTimeHigh: 0.0025,
    priceChange24h: -0.05,
  };

  const cards = [
    {
      label: "Market Cap",
      value: formatLargeNumber(s.marketCap),
      subValue: formatPercent(s.priceChange24h),
      subPositive: s.priceChange24h >= 0,
      icon: <DollarSign className="w-4 h-4" />,
      delay: 0,
    },
    {
      label: "24h Volume",
      value: formatLargeNumber(s.volume24h),
      subValue: "+12.4% vs yesterday",
      subPositive: true,
      icon: <BarChart3 className="w-4 h-4" />,
      delay: 100,
    },
    {
      label: "Total Supply (Fixed)",
      value: "1B DR",
      subValue: "1,000,000,000 -- Hard Cap",
      subPositive: true,
      icon: <Layers className="w-4 h-4" />,
      delay: 200,
      locked: true,
    },
    {
      label: "All-Time High",
      value: `$${formatPrice(s.allTimeHigh)}`,
      subValue: `-${(((s.allTimeHigh - s.currentPrice) / s.allTimeHigh) * 100).toFixed(1)}% from ATH`,
      subPositive: false,
      icon: <Award className="w-4 h-4" />,
      delay: 300,
    },
  ];

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Market Statistics <span className="text-neon-cyan">(DR)</span>
        </h2>
        <span className="flex items-center gap-1 text-xs bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan px-2 py-1 rounded-full font-semibold">
          <Lock className="w-3 h-3" />
          1B Hard Cap
        </span>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="stats.panel"
      >
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
