import { Button } from "@/components/ui/button";
import { Menu, Settings, X, Zap } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  onGetStarted?: () => void;
  onAdminClick?: () => void;
}

export default function Navbar({ onGetStarted, onAdminClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const navLinks = ["Explore", "Tracker", "Learn", "Community"];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-[#0B0F14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2" data-ocid="nav.link">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-neon-cyan" />
            </div>
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
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAdminClick}
                className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 rounded-full px-4 gap-1.5"
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
              {isLoggedIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAdminClick?.();
                    setMobileOpen(false);
                  }}
                  className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 rounded-full gap-1.5"
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
