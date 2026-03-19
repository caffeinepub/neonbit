import { Button } from "@/components/ui/button";
import { ArrowLeftRight, DollarSign, Wallet } from "lucide-react";

const steps = [
  {
    icon: <Wallet className="w-6 h-6 text-neon-cyan" />,
    step: "Step 1",
    title: "Create Wallet",
    description:
      "Download and set up a crypto wallet to securely store your DR and other crypto assets. Available on iOS, Android, and as a browser extension.",
    cta: "Download Wallet",
  },
  {
    icon: <DollarSign className="w-6 h-6 text-neon-green" />,
    step: "Step 2",
    title: "Get Crypto",
    description:
      "Purchase BTC, ETH, SOL, or USDT on any major exchange using your credit card, bank transfer, or other payment methods. These will be used to swap for DR.",
    cta: "Buy BTC/ETH/SOL",
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6 text-neon-cyan" />,
    step: "Step 3",
    title: "Exchange for DR",
    description:
      "Our AI-powered DEX routing automatically finds the best rate across BTC, ETH, and SOL chains. Swap any major coin for @dr with optimal slippage.",
    cta: "Use AI-DEX Router",
  },
];

export default function HowToBuy() {
  return (
    <section
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      id="learn"
    >
      <h2 className="text-2xl font-bold text-foreground mb-8">
        How to Buy <span className="text-neon-cyan">@dr (DR)</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-neon-cyan/30 transition-all hover:-translate-y-1 duration-200 fade-in-up"
            data-ocid={`howtobuy.card.${i + 1}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary">{step.icon}</div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {step.title}
                </h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
              {step.description}
            </p>
            <Button
              className="w-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 rounded-lg font-semibold text-sm"
              variant="outline"
              data-ocid={`howtobuy.primary_button.${i + 1}`}
            >
              {step.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
