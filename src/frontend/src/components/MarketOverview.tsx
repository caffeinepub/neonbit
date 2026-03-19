import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  formatLargeNumber,
  formatPercent,
  formatPrice,
  formatSupply,
} from "../utils/format";

const MARKET_DATA = [
  {
    rank: 1,
    name: "NEONBIT",
    symbol: "NBT",
    price: 2.47,
    change: 6.82,
    volume: 18_500_000,
    supply: 100_000_000,
    ath: 4.89,
    color: "#18D6E5",
  },
  {
    rank: 2,
    name: "Bitcoin",
    symbol: "BTC",
    price: 67432.1,
    change: 1.24,
    volume: 28_900_000_000,
    supply: 19_700_000,
    ath: 73_750,
    color: "#F7931A",
  },
  {
    rank: 3,
    name: "Ethereum",
    symbol: "ETH",
    price: 3521.8,
    change: -0.87,
    volume: 14_200_000_000,
    supply: 120_200_000,
    ath: 4878,
    color: "#627EEA",
  },
  {
    rank: 4,
    name: "Solana",
    symbol: "SOL",
    price: 178.42,
    change: 3.51,
    volume: 3_800_000_000,
    supply: 455_000_000,
    ath: 260.06,
    color: "#9945FF",
  },
  {
    rank: 5,
    name: "BNB",
    symbol: "BNB",
    price: 412.33,
    change: 0.62,
    volume: 1_950_000_000,
    supply: 153_500_000,
    ath: 686.31,
    color: "#F3BA2F",
  },
  {
    rank: 6,
    name: "XRP",
    symbol: "XRP",
    price: 0.6124,
    change: -1.33,
    volume: 2_100_000_000,
    supply: 54_300_000_000,
    ath: 3.84,
    color: "#00AAE4",
  },
  {
    rank: 7,
    name: "Cardano",
    symbol: "ADA",
    price: 0.4821,
    change: 2.17,
    volume: 820_000_000,
    supply: 35_600_000_000,
    ath: 3.09,
    color: "#0033AD",
  },
  {
    rank: 8,
    name: "Avalanche",
    symbol: "AVAX",
    price: 38.74,
    change: -2.44,
    volume: 680_000_000,
    supply: 408_000_000,
    ath: 146.22,
    color: "#E84142",
  },
];

export default function MarketOverview() {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Market Overview
      </h2>
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="market.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs w-12">
                #
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Top Coin
              </TableHead>
              <TableHead className="text-muted-foreground text-xs text-right">
                Price
              </TableHead>
              <TableHead className="text-muted-foreground text-xs text-right hidden sm:table-cell">
                24h Volume
              </TableHead>
              <TableHead className="text-muted-foreground text-xs text-right hidden md:table-cell">
                Circulating
              </TableHead>
              <TableHead className="text-muted-foreground text-xs text-right hidden lg:table-cell">
                ATH
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MARKET_DATA.map((coin, i) => (
              <TableRow
                key={coin.symbol}
                className="border-border hover:bg-secondary/50 transition-colors"
                data-ocid={`market.item.${i + 1}`}
              >
                <TableCell className="text-muted-foreground text-sm">
                  {coin.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: `${coin.color}22`,
                        color: coin.color,
                        border: `1px solid ${coin.color}44`,
                      }}
                    >
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {coin.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-mono text-sm text-foreground">
                    ${formatPrice(coin.price)}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-xs font-semibold ${coin.change >= 0 ? "text-neon-green" : "text-neon-red"}`}
                  >
                    {coin.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercent(coin.change)}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                  {formatLargeNumber(coin.volume)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                  {formatSupply(coin.supply)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground hidden lg:table-cell">
                  ${formatPrice(coin.ath)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
