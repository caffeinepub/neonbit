import { Button } from "@/components/ui/button";
import { Activity, Brain, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCoinProfile, useMarketStats } from "../hooks/useQueries";
import { formatPercent, formatPrice } from "../utils/format";

const chainTags = [
  { label: "BTC", color: "#F7931A" },
  { label: "ETH", color: "#627EEA" },
  { label: "SOL", color: "#9945FF" },
  { label: "AI", color: "#18D6E5" },
];

export default function HeroSection() {
  const { data: profile } = useCoinProfile();
  const { data: stats } = useMarketStats();
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState(false);
  const basePrice = useRef<number>(2.47);

  useEffect(() => {
    if (stats?.currentPrice) {
      basePrice.current = stats.currentPrice;
      setLivePrice(stats.currentPrice);
    }
  }, [stats?.currentPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.01 * basePrice.current;
      basePrice.current = Math.max(0.01, basePrice.current + change);
      setLivePrice(basePrice.current);
      setPriceFlash(true);
      setTimeout(() => setPriceFlash(false), 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const price = livePrice ?? stats?.currentPrice ?? 2.47;
  const change = stats?.priceChange24h ?? 6.82;
  const isPositive = change >= 0;

  return (
    <section id="explore" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-neon-green/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 fade-in-up">
          {/* Left: Coin Info */}
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0">
              <img
                src="/assets/generated/dr-coin-logo-transparent.dim_200x200.png"
                alt="@dr Logo"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full coin-glow object-cover bg-[#141A22]"
              />
            </div>
            <div className="flex flex-col gap-2">
              {/* AI-Powered badge */}
              <div className="flex items-center gap-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full px-3 py-1 w-fit text-xs text-neon-cyan font-semibold">
                <Brain className="w-3 h-3" />
                AI-Powered
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {profile?.name ?? "@dr"}
                <span className="text-neon-cyan ml-3">
                  ({profile?.symbol ?? "DR"})
                </span>
              </h1>
              {/* Multi-chain tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {chainTags.map((tag) => (
                  <span
                    key={tag.label}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${tag.color}18`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div
                className={`text-3xl md:text-4xl font-bold font-mono text-foreground ${priceFlash ? "price-flash" : ""}`}
              >
                ${formatPrice(price)}{" "}
                <span className="text-lg font-normal text-muted-foreground">
                  USD
                </span>
              </div>
              <div
                className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? "text-neon-green" : "text-neon-red"}`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>{formatPercent(change)}</span>
                <span className="text-sm text-muted-foreground font-normal ml-1">
                  24h
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full px-4 py-2 text-sm text-neon-cyan">
              <Activity className="w-4 h-4" />
              <span>Live chart</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </div>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary rounded-full"
              data-ocid="hero.secondary_button"
            >
              Track DR
            </Button>
            <Button
              className="bg-neon-green text-black hover:bg-neon-green/90 font-bold rounded-full shadow-glow-green"
              data-ocid="hero.primary_button"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
