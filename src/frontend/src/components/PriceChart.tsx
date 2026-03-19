import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMarketStats } from "../hooks/useQueries";
import { formatPrice } from "../utils/format";

type Timeframe = "1D" | "1W" | "1M" | "1Y";

function generateHistory(
  basePrice: number,
  points: number,
  volatility: number,
  labelFn: (i: number) => string,
) {
  const data: { time: string; price: number; volume: number }[] = [];
  let price = basePrice * 0.85;
  for (let i = 0; i < points; i++) {
    price = Math.max(0.01, price * (1 + (Math.random() - 0.48) * volatility));
    data.push({
      time: labelFn(i),
      price: Number.parseFloat(price.toFixed(4)),
      volume: Math.random() * 5_000_000 + 1_000_000,
    });
  }
  if (data.length > 0) data[data.length - 1].price = basePrice;
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-neon-cyan font-bold">
          ${formatPrice(payload[0]?.value ?? 0)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const { data: stats } = useMarketStats();
  const basePrice = stats?.currentPrice ?? 2.47;

  const chartData = useMemo(() => {
    switch (timeframe) {
      case "1D":
        return generateHistory(basePrice, 24, 0.008, (i) => `${i}:00`);
      case "1W":
        return generateHistory(
          basePrice,
          7,
          0.03,
          (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        );
      case "1M":
        return generateHistory(basePrice, 30, 0.025, (i) => `Day ${i + 1}`);
      case "1Y":
        return generateHistory(
          basePrice,
          12,
          0.08,
          (i) =>
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ][i],
        );
    }
  }, [timeframe, basePrice]);

  const timeframes: Timeframe[] = ["1D", "1W", "1M", "1Y"];

  return (
    <section
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      id="tracker"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">
          DR Price Chart <span className="text-neon-cyan">(USD)</span>
        </h2>
        <div className="flex gap-1" data-ocid="chart.panel">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                timeframe === tf
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
              }`}
              data-ocid="chart.tab"
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18D6E5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#18D6E5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#242C36"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#9AA6B2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              tick={{ fill: "#9AA6B2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${formatPrice(v)}`}
              width={70}
            />
            <YAxis
              yAxisId="volume"
              orientation="left"
              tick={false}
              axisLine={false}
              tickLine={false}
              width={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="#242C36"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
              maxBarSize={12}
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#18D6E5"
              strokeWidth={2}
              fill="url(#cyanGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#18D6E5",
                stroke: "#0B0F14",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
