import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Coins,
  Percent,
  Share2,
  Shield,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface SetupGuideProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    icon: User,
    title: "Login Karein",
    description:
      "Navbar mein 'Login' button dabayein. Internet Identity window khulegi -- apna account se login karein. Browser popup allow karein.",
    color: "cyan",
  },
  {
    number: 2,
    icon: Shield,
    title: "Admin Access Claim Karein",
    description:
      "Login ke baad navbar mein 'Control Panel' button aayega. Kholein aur 'Claim Admin Access' button dabayein -- sirf pehli baar, aap permanent admin ban jayenge.",
    color: "green",
  },
  {
    number: 3,
    icon: Percent,
    title: "Tax Account Set Karein",
    description:
      "Control Panel > Tax Settings tab mein jayein. 'Use My Principal as Tax Account' button dabayein aur save karein. Ab har transfer ka 3% aapko milega.",
    color: "purple",
  },
  {
    number: 4,
    icon: Coins,
    title: "Tokens Mint Karein",
    description:
      "Control Panel > Mint Tokens tab mein jayein. Apna Principal ID daalen, amount likhen, aur 'Mint Tokens' dabayein. DR tokens aapke wallet mein aa jayenge.",
    color: "yellow",
  },
  {
    number: 5,
    icon: Share2,
    title: "Token Share Karein",
    description:
      "Apna app link share karein. Doosron ko Wallet button se apna Principal ID copy karke aapko bhejna hoga taaki aap unhe tokens transfer kar sakein.",
    color: "orange",
  },
];

const colorMap: Record<
  string,
  { badge: string; icon: string; glow: string; border: string }
> = {
  cyan: {
    badge: "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40",
    icon: "text-neon-cyan",
    glow: "shadow-[0_0_12px_rgba(0,240,255,0.15)]",
    border: "border-neon-cyan/20 hover:border-neon-cyan/40",
  },
  green: {
    badge: "bg-neon-green/20 text-neon-green border border-neon-green/40",
    icon: "text-neon-green",
    glow: "shadow-[0_0_12px_rgba(57,255,20,0.12)]",
    border: "border-neon-green/20 hover:border-neon-green/40",
  },
  purple: {
    badge: "bg-purple-400/20 text-purple-300 border border-purple-400/40",
    icon: "text-purple-300",
    glow: "shadow-[0_0_12px_rgba(192,132,252,0.12)]",
    border: "border-purple-400/20 hover:border-purple-400/40",
  },
  yellow: {
    badge: "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40",
    icon: "text-yellow-300",
    glow: "shadow-[0_0_12px_rgba(250,204,21,0.12)]",
    border: "border-yellow-400/20 hover:border-yellow-400/40",
  },
  orange: {
    badge: "bg-orange-400/20 text-orange-300 border border-orange-400/40",
    icon: "text-orange-300",
    glow: "shadow-[0_0_12px_rgba(251,146,60,0.12)]",
    border: "border-orange-400/20 hover:border-orange-400/40",
  },
};

export default function SetupGuide({ open, onClose }: SetupGuideProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            data-ocid="setup_guide.modal"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg pointer-events-auto rounded-2xl border border-border/60 bg-[#0B0F14] shadow-2xl"
              style={{
                boxShadow:
                  "0 0 60px rgba(0,240,255,0.08), 0 24px 64px rgba(0,0,0,0.7)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground leading-tight">
                      Setup Guide — Sab Steps
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Yeh steps follow karein apna @dr coin setup karne ke liye
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg h-8 w-8 shrink-0"
                  data-ocid="setup_guide.close_button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Steps */}
              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 flex flex-col gap-3">
                  {steps.map((step, idx) => {
                    const colors = colorMap[step.color];
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className={`rounded-xl border bg-white/[0.02] p-4 transition-all ${colors.border} ${colors.glow}`}
                        data-ocid={`setup_guide.item.${step.number}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Step badge + icon */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}
                            >
                              {step.number}
                            </span>
                            <div
                              className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${colors.glow}`}
                            >
                              <Icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-foreground">
                                {step.title}
                              </h3>
                              <span className="flex items-center gap-1 text-xs text-yellow-400 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                Action Required
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Tip */}
                  <div className="mt-1 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">
                    <p className="text-xs text-neon-cyan/80 leading-relaxed">
                      <span className="font-semibold text-neon-cyan">
                        💡 Tip:
                      </span>{" "}
                      Control Panel mein jaane ke liye pehle login karein, phir
                      navbar mein{" "}
                      <span className="font-semibold text-neon-cyan">
                        'Control Panel'
                      </span>{" "}
                      button dabayein.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border/40">
                <Button
                  className="w-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 rounded-full font-semibold text-sm"
                  variant="outline"
                  onClick={onClose}
                  data-ocid="setup_guide.close_button"
                >
                  Samajh Gaye ✓
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
