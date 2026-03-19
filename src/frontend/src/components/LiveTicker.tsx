import { useEffect, useState } from "react";
import { formatPercent, formatPrice } from "../utils/format";

const COINS = [
  { symbol: "NBT", name: "NEONBIT", basePrice: 2.47, change: 6.82 },
  { symbol: "BTC", name: "Bitcoin", basePrice: 67_432.1, change: 1.24 },
  { symbol: "ETH", name: "Ethereum", basePrice: 3_521.8, change: -0.87 },
  { symbol: "SOL", name: "Solana", basePrice: 178.42, change: 3.51 },
  { symbol: "BNB", name: "BNB", basePrice: 412.33, change: 0.62 },
  { symbol: "XRP", name: "Ripple", basePrice: 0.6124, change: -1.33 },
];

type TickerCoin = {
  symbol: string;
  name: string;
  price: number;
  change: number;
};

export default function LiveTicker() {
  const [tickers, setTickers] = useState<TickerCoin[]>(
    COINS.map((c) => ({ ...c, price: c.basePrice })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((coin) => ({
          ...coin,
          price: Math.max(
            0.0001,
            coin.price * (1 + (Math.random() - 0.5) * 0.004),
          ),
          change: coin.change + (Math.random() - 0.5) * 0.1,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickers, ...tickers];

  return (
    <section
      className="border-y border-border/50 bg-[#0D1117] py-3 overflow-hidden"
      id="tracker"
    >
      <div className="flex items-center gap-4 mb-2 px-4 sm:px-6">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Live Price Ticker
        </span>
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse flex-shrink-0" />
      </div>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((coin, i) => (
            <span
              key={`${coin.symbol}-${i}`}
              className="inline-flex items-center gap-3 mx-6"
            >
              <span className="font-bold text-sm text-foreground">
                {coin.symbol}
              </span>
              <span className="font-mono text-sm text-foreground">
                ${formatPrice(coin.price)}
              </span>
              <span
                className={`text-xs font-semibold ${coin.change >= 0 ? "text-neon-green" : "text-neon-red"}`}
              >
                {formatPercent(coin.change)}
              </span>
              <span className="text-border">•</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
