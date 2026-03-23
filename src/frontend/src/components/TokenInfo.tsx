import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
import { useState } from "react";

// The backend canister ID is injected at build time via Vite env
const CANISTER_ID =
  (import.meta as any).env?.VITE_BACKEND_CANISTER_ID ||
  (import.meta as any).env?.CANISTER_ID_BACKEND ||
  "Check Caffeine Dashboard";

const TOKEN_DETAILS = [
  { label: "Token Name", value: "@dr" },
  { label: "Symbol", value: "DR" },
  { label: "Standard", value: "ICRC-1" },
  { label: "Blockchain", value: "Internet Computer (ICP)" },
  { label: "Total Supply", value: "1,000,000,000 DR" },
  { label: "Tax on Transfer", value: "3%" },
  { label: "Decimal Places", value: "8" },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2 bg-secondary/50 border border-border/60 rounded-lg px-3 py-2">
        <span className="text-sm text-neon-cyan font-mono flex-1 truncate">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground hover:text-neon-cyan transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className="w-4 h-4 text-neon-green" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function TokenInfo() {
  return (
    <section
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      id="token-info"
    >
      <div className="flex items-center gap-2 mb-8">
        <Info className="w-5 h-5 text-neon-cyan" />
        <h2 className="text-2xl font-bold text-foreground">
          Token <span className="text-neon-cyan">Info</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Canister ID Card */}
        <div className="bg-card border border-neon-cyan/20 rounded-xl p-6 flex flex-col gap-5 hover:border-neon-cyan/40 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <h3 className="font-bold text-foreground">Token Canister ID</h3>
          </div>
          <CopyField
            label="Canister ID (for DEX listing)"
            value={CANISTER_ID}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use this Canister ID to import @dr token on ICPSwap or Sonic DEX for
            real money trading.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 rounded-lg text-xs gap-1.5"
              variant="outline"
              onClick={() => window.open("https://icpswap.com", "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open ICPSwap
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 rounded-lg text-xs gap-1.5"
              variant="outline"
              onClick={() => window.open("https://sonic.ooo", "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Sonic DEX
            </Button>
          </div>
        </div>

        {/* Token Details Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-neon-cyan/20 transition-all">
          <h3 className="font-bold text-foreground">Token Details</h3>
          <div className="grid grid-cols-1 gap-3">
            {TOKEN_DETAILS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
