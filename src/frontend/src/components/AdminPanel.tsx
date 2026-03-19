import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CoinProfile, MarketStats } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCoinProfile,
  useIsAdmin,
  useMarketStats,
  useUpdateCoinProfile,
  useUpdateMarketStats,
} from "../hooks/useQueries";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: profile } = useCoinProfile();
  const { data: stats } = useMarketStats();
  const updateProfile = useUpdateCoinProfile();
  const updateStats = useUpdateMarketStats();

  const [profileForm, setProfileForm] = useState<CoinProfile>({
    name: "NEONBIT",
    symbol: "NBT",
    description: "The future of decentralized finance.",
    logoUrl: "/assets/generated/neonbit-logo-transparent.dim_200x200.png",
  });

  const [statsForm, setStatsForm] = useState<MarketStats>({
    currentPrice: 2.47,
    priceChange24h: 6.82,
    marketCap: 247_000_000,
    volume24h: 18_500_000,
    circulatingSupply: 100_000_000,
    totalSupply: 200_000_000,
    allTimeHigh: 4.89,
  });

  useEffect(() => {
    if (profile) setProfileForm(profile);
  }, [profile]);

  useEffect(() => {
    if (stats) setStatsForm(stats);
  }, [stats]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profileForm);
      toast.success("Coin profile updated successfully!");
    } catch {
      toast.error("Failed to update coin profile.");
    }
  };

  const handleSaveStats = async () => {
    try {
      await updateStats.mutateAsync(statsForm);
      toast.success("Market stats updated successfully!");
    } catch {
      toast.error("Failed to update market stats.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="admin.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-neon-cyan" />
            Admin Panel
          </DialogTitle>
        </DialogHeader>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-neon-cyan" />
            <p className="text-muted-foreground">
              You need to log in to access the admin panel.
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold"
              data-ocid="admin.primary_button"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging
                  in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </div>
        ) : adminLoading ? (
          <div className="flex justify-center py-8">
            <Loader2
              className="w-6 h-6 animate-spin text-neon-cyan"
              data-ocid="admin.loading_state"
            />
          </div>
        ) : !isAdmin ? (
          <div
            className="flex flex-col items-center gap-4 py-8 text-center"
            data-ocid="admin.error_state"
          >
            <AlertTriangle className="w-10 h-10 text-neon-red" />
            <p className="text-muted-foreground">
              You do not have admin privileges.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="admin.cancel_button"
            >
              Close
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="bg-secondary border border-border w-full">
              <TabsTrigger
                value="profile"
                className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
                data-ocid="admin.tab"
              >
                Coin Profile
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
                data-ocid="admin.tab"
              >
                Market Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs mb-1">
                    Coin Name
                  </Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="bg-input border-border text-foreground"
                    data-ocid="admin.input"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs mb-1">
                    Symbol
                  </Label>
                  <Input
                    value={profileForm.symbol}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, symbol: e.target.value })
                    }
                    className="bg-input border-border text-foreground"
                    data-ocid="admin.input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs mb-1">
                  Logo URL
                </Label>
                <Input
                  value={profileForm.logoUrl}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, logoUrl: e.target.value })
                  }
                  className="bg-input border-border text-foreground"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs mb-1">
                  Description
                </Label>
                <Textarea
                  value={profileForm.description}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-input border-border text-foreground min-h-[80px]"
                  data-ocid="admin.textarea"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-bold w-full"
                data-ocid="admin.submit_button"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="stats" className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "currentPrice", label: "Current Price ($)" },
                    { key: "priceChange24h", label: "24h Change (%)" },
                    { key: "marketCap", label: "Market Cap ($)" },
                    { key: "volume24h", label: "24h Volume ($)" },
                    { key: "circulatingSupply", label: "Circulating Supply" },
                    { key: "totalSupply", label: "Total Supply" },
                    { key: "allTimeHigh", label: "All-Time High ($)" },
                  ] as { key: keyof MarketStats; label: string }[]
                ).map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-muted-foreground text-xs mb-1">
                      {label}
                    </Label>
                    <Input
                      type="number"
                      value={statsForm[key]}
                      onChange={(e) =>
                        setStatsForm({
                          ...statsForm,
                          [key]: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-input border-border text-foreground"
                      data-ocid="admin.input"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSaveStats}
                disabled={updateStats.isPending}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-bold w-full"
                data-ocid="admin.submit_button"
              >
                {updateStats.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Stats"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
