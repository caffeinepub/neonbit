import {
  Award,
  BarChart3,
  DollarSign,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMarketStats } from "../hooks/useQueries";
import {
  formatLargeNumber,
  formatPercent,
  formatPrice,
  formatSupply,
} from "../utils/format";

interface StatCardProps {
  label: string;
  value: string;
  subValue: string;
  subPositive: boolean;
  icon: React.ReactNode;
  delay: number;
}

function StatCard({
  label,
  value,
  subValue,
  subPositive,
  icon,
  delay,
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
        <div className="text-neon-cyan/60">{icon}</div>
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
    currentPrice: 2.47,
    marketCap: 247_000_000,
    volume24h: 18_500_000,
    circulatingSupply: 100_000_000,
    totalSupply: 200_000_000,
    allTimeHigh: 4.89,
    priceChange24h: 6.82,
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
      label: "Circulating Supply",
      value: `${formatSupply(s.circulatingSupply)} NBT`,
      subValue: `${((s.circulatingSupply / s.totalSupply) * 100).toFixed(1)}% of total`,
      subPositive: true,
      icon: <Layers className="w-4 h-4" />,
      delay: 200,
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
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Market Statistics <span className="text-neon-cyan">(NBT)</span>
      </h2>
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
