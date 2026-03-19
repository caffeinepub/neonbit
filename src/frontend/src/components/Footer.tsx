import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Twitter, Zap } from "lucide-react";

interface FooterProps {
  onAdminClick: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  const navLinks = ["Explore", "Tracker", "Learn", "Community"];

  return (
    <footer className="border-t border-border/50 bg-[#0D1117] mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-bold text-lg tracking-wider text-foreground">
              NEONBIT
            </span>
          </div>

          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                data-ocid="footer.link"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
              data-ocid="footer.button"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
              data-ocid="footer.button"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
              data-ocid="footer.button"
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline"
            >
              caffeine.ai
            </a>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdminClick}
            className="text-muted-foreground hover:text-neon-cyan text-xs h-7"
            data-ocid="footer.open_modal_button"
          >
            Admin Panel
          </Button>
        </div>
      </div>
    </footer>
  );
}
