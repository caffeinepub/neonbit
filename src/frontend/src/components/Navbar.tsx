import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Check,
  Copy,
  Menu,
  Settings,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function useCanisterId() {
  const [canisterId, setCanisterId] = useState("");
  useEffect(() => {
    loadConfig()
      .then((cfg) => {
        if (cfg.backend_canister_id) setCanisterId(cfg.backend_canister_id);
      })
      .catch(() => {});
  }, []);
  return canisterId;
}

function CanisterIdBadge({ canisterId }: { canisterId: string }) {
  const [copied, setCopied] = useState(false);
  if (!canisterId) return null;

  const short = `${canisterId.slice(0, 5)}...${canisterId.slice(-3)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(canisterId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Canister ID: ${canisterId} (click to copy)`}
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/15 hover:border-neon-cyan/60 transition-all text-neon-cyan"
    >
      <span className="text-[10px] font-mono leading-none">{short}</span>
      {copied ? (
        <Check className="w-3 h-3 text-neon-green" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}

function MobileCanisterIdBadge({ canisterId }: { canisterId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(canisterId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all text-neon-cyan w-full"
    >
      <span className="text-xs font-mono truncate">{canisterId}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 flex-shrink-0" />
      )}
    </button>
  );
}

interface NavbarProps {
  onGetStarted?: () => void;
  onAdminClick?: () => void;
  onWalletClick?: () => void;
  onSetupClick?: () => void;
  onMarketClick?: () => void;
}

export default function Navbar({
  onGetStarted,
  onAdminClick,
  onWalletClick,
  onSetupClick,
  onMarketClick,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const registeredRef = useRef(false);
  const canisterId = useCanisterId();

  useEffect(() => {
    if (isLoggedIn && actor && !registeredRef.current) {
      registeredRef.current = true;
      (actor as any).registerUser?.().catch(() => {});
    }
    if (!isLoggedIn) {
      registeredRef.current = false;
    }
  }, [isLoggedIn, actor]);

  const navLinks = ["Explore", "Tracker", "Learn", "Community"];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-[#0B0F14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2" data-ocid="nav.link">
            <img
              src="/assets/generated/dr-coin-logo-transparent.dim_200x200.png"
              alt="@dr logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-lg tracking-wider text-foreground">
              @dr
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-neon-cyan transition-colors rounded-lg hover:bg-neon-cyan/10"
                data-ocid="nav.link"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <CanisterIdBadge canisterId={canisterId} />
            <Button
              variant="outline"
              size="sm"
              onClick={onSetupClick}
              className="border-border/60 text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 hover:bg-neon-cyan/5 rounded-full px-4 gap-1.5"
              data-ocid="nav.open_modal_button"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Setup Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarketClick}
              className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 rounded-full px-4 gap-1.5"
              data-ocid="nav.open_modal_button"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Market
            </Button>
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onWalletClick}
                className="border-neon-green/40 text-neon-green hover:bg-neon-green/10 rounded-full px-4 gap-1.5"
                data-ocid="nav.open_modal_button"
              >
                <Wallet className="w-3.5 h-3.5" />
                Wallet
              </Button>
            )}
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAdminClick}
                className="border-border/60 text-muted-foreground hover:bg-secondary/50 rounded-full px-4 gap-1.5"
                data-ocid="nav.open_modal_button"
              >
                <Settings className="w-3.5 h-3.5" />
                Control Panel
              </Button>
            )}
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-border text-foreground hover:bg-secondary rounded-full px-5"
                data-ocid="nav.secondary_button"
              >
                Log Out
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="border-border text-foreground hover:bg-secondary rounded-full px-5"
                data-ocid="nav.secondary_button"
              >
                Log In
              </Button>
            )}
            <Button
              size="sm"
              onClick={onGetStarted}
              className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold rounded-full px-5 shadow-glow-green"
              data-ocid="nav.primary_button"
            >
              Get Started
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-ocid="nav.toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                data-ocid="nav.link"
              >
                {link}
              </a>
            ))}
            <div className="flex flex-col gap-2 px-4 pt-2">
              {canisterId && <MobileCanisterIdBadge canisterId={canisterId} />}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSetupClick?.();
                  setMobileOpen(false);
                }}
                className="border-border/60 text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 rounded-full gap-1.5"
                data-ocid="nav.open_modal_button"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Setup Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onMarketClick?.();
                  setMobileOpen(false);
                }}
                className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 rounded-full gap-1.5"
                data-ocid="nav.open_modal_button"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Market
              </Button>
              {isLoggedIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onWalletClick?.();
                    setMobileOpen(false);
                  }}
                  className="border-neon-green/40 text-neon-green hover:bg-neon-green/10 rounded-full gap-1.5"
                  data-ocid="nav.open_modal_button"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Wallet
                </Button>
              )}
              {isLoggedIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAdminClick?.();
                    setMobileOpen(false);
                  }}
                  className="border-border/60 text-muted-foreground hover:bg-secondary/50 rounded-full gap-1.5"
                  data-ocid="nav.open_modal_button"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Control Panel
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isLoggedIn ? clear : login}
                  className="border-border rounded-full flex-1"
                  data-ocid="nav.secondary_button"
                >
                  {isLoggedIn ? "Log Out" : "Log In"}
                </Button>
                <Button
                  size="sm"
                  onClick={onGetStarted}
                  className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold rounded-full flex-1"
                  data-ocid="nav.primary_button"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
