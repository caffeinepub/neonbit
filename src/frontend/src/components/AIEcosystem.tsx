import { Bitcoin, Brain, Layers, Zap } from "lucide-react";

const ecosystems = [
  {
    icon: <Bitcoin className="w-7 h-7" />,
    symbol: "BTC",
    title: "Bitcoin Bridge",
    description:
      "DR coin bridges Bitcoin liquidity using AI-powered cross-chain routing. Trade BTC pairs with zero slippage.",
    color: "#F7931A",
    colorClass: "btc",
  },
  {
    icon: <Layers className="w-7 h-7" />,
    symbol: "ETH",
    title: "Ethereum Smart Contracts",
    description:
      "Built on Ethereum-compatible smart contracts. DR leverages ETH's DeFi ecosystem with AI optimization.",
    color: "#627EEA",
    colorClass: "eth",
  },
  {
    icon: <Zap className="w-7 h-7" />,
    symbol: "SOL",
    title: "Solana Speed",
    description:
      "Ultra-fast transactions powered by Solana's speed. AI algorithms execute trades in milliseconds.",
    color: "#9945FF",
    colorClass: "sol",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    symbol: "AI",
    title: "AI Trading Engine",
    description:
      "Machine learning models analyze BTC, ETH, SOL patterns in real-time to maximize DR coin performance.",
    color: "#18D6E5",
    colorClass: "ai",
  },
];

export default function AIEcosystem() {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-2 mb-8">
        <div className="flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full px-3 py-1 text-xs text-neon-cyan font-semibold">
          <Brain className="w-3.5 h-3.5" />
          Multi-Chain AI Network
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          AI-Powered Ecosystem <span className="text-neon-cyan">(DR)</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl">
          @dr coin is deeply integrated with the world's leading blockchains,
          powered by real-time AI models that optimize every transaction.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        data-ocid="ecosystem.panel"
      >
        {ecosystems.map((item, i) => (
          <div
            key={item.symbol}
            className="group bg-card border border-border rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 cursor-default"
            style={{
              // @ts-ignore
              "--glow-color": item.color,
            }}
            data-ocid={`ecosystem.card.${i + 1}`}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                `${item.color}55`;
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 24px 0 ${item.color}22`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: `${item.color}18`,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${item.color}18`,
                  color: item.color,
                  border: `1px solid ${item.color}40`,
                }}
              >
                {item.symbol}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
