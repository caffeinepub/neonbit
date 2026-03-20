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
import {
  AlertTriangle,
  Coins,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Percent,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CoinProfile, MarketStats } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimInitialAdmin,
  useCoinProfile,
  useGetTaxAccount,
  useIsAdmin,
  useMarketStats,
  useMintTokens,
  useSetTaxAccount,
  useTotalMinted,
  useUpdateCoinProfile,
  useUpdateMarketStats,
} from "../hooks/useQueries";

const FIXED_TOTAL_SUPPLY = 1_000_000_000;
const ADMIN_PASSWORD_KEY = "neonbit_admin_pw";
const DEFAULT_PASSWORD = "admin123";

function getStoredPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

function e8sToDr(e8s: bigint): string {
  const dr = Number(e8s) / 1e8;
  return dr.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const {
    data: isAdmin,
    isLoading: adminLoading,
    refetch: refetchAdmin,
  } = useIsAdmin();
  const claimAdmin = useClaimInitialAdmin();
  const { data: profile } = useCoinProfile();
  const { data: stats } = useMarketStats();
  const { data: totalMinted } = useTotalMinted();
  const { data: taxAccount, isLoading: taxLoading } = useGetTaxAccount();
  const updateProfile = useUpdateCoinProfile();
  const updateStats = useUpdateMarketStats();
  const mintTokens = useMintTokens();
  const setTaxAccount = useSetTaxAccount();

  // Password gate state
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const [profileForm, setProfileForm] = useState<CoinProfile>({
    name: "@dr",
    symbol: "DR",
    description: "@dr is a limited-supply AI-powered coin.",
    logoUrl: "/assets/generated/neonbit-logo-transparent.dim_200x200.png",
  });

  const [statsForm, setStatsForm] = useState<MarketStats>({
    currentPrice: 0.00125,
    priceChange24h: -0.05,
    marketCap: 1_250_000,
    volume24h: 50_000,
    circulatingSupply: 1_000_000_000,
    totalSupply: FIXED_TOTAL_SUPPLY,
    allTimeHigh: 0.0025,
  });

  const [mintRecipient, setMintRecipient] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintError, setMintError] = useState("");

  const [taxInput, setTaxInput] = useState("");
  const [taxError, setTaxError] = useState("");

  // Reset password unlock when dialog closes
  useEffect(() => {
    if (!open) {
      setPasswordUnlocked(false);
      setPasswordInput("");
      setPasswordError("");
    }
  }, [open]);

  useEffect(() => {
    if (profile) setProfileForm(profile);
  }, [profile]);

  useEffect(() => {
    if (stats) setStatsForm({ ...stats, totalSupply: FIXED_TOTAL_SUPPLY });
  }, [stats]);

  const handlePasswordSubmit = () => {
    if (passwordInput === getStoredPassword()) {
      setPasswordUnlocked(true);
      setPasswordError("");
      setPasswordInput("");
    } else {
      setPasswordError("Galat password hai. Dobara try karein.");
    }
  };

  const handleChangePassword = () => {
    if (!newPassword.trim()) {
      toast.error("Naya password enter karein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords match nahi kar rahe.");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password kam se kam 4 characters ka hona chahiye.");
      return;
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password successfully change ho gaya!");
  };

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
      await updateStats.mutateAsync({
        ...statsForm,
        totalSupply: FIXED_TOTAL_SUPPLY,
      });
      toast.success("Market stats updated successfully!");
    } catch {
      toast.error("Failed to update market stats.");
    }
  };

  const handleMint = async () => {
    setMintError("");
    if (!mintRecipient.trim()) {
      setMintError("Recipient principal is required.");
      return;
    }
    const amountNum = Number.parseFloat(mintAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setMintError("Enter a valid amount.");
      return;
    }
    try {
      const e8s = BigInt(Math.round(amountNum * 1e8));
      await mintTokens.mutateAsync({ to: mintRecipient.trim(), amount: e8s });
      toast.success(
        `Minted ${amountNum} DR to ${mintRecipient.slice(0, 10)}...`,
      );
      setMintRecipient("");
      setMintAmount("");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Mint failed";
      setMintError(
        msg.includes("Principal") || msg.includes("principal")
          ? "Invalid recipient principal address."
          : msg,
      );
    }
  };

  const handleSetTax = async () => {
    setTaxError("");
    if (!taxInput.trim()) {
      setTaxError("Principal address required.");
      return;
    }
    try {
      await setTaxAccount.mutateAsync(taxInput.trim());
      toast.success(
        "Tax account updated! 3% of every transfer will go to this address.",
      );
      setTaxInput("");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? "Failed to set tax account";
      setTaxError(
        msg.includes("Principal") || msg.includes("principal")
          ? "Invalid principal address."
          : msg,
      );
    }
  };

  const handleClaimAdmin = async () => {
    try {
      await claimAdmin.mutateAsync();
      toast.success("Admin access claimed! Welcome, Admin.");
      await refetchAdmin();
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ??
          "Failed to claim admin access.",
      );
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

        {/* PASSWORD GATE */}
        {!passwordUnlocked ? (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border-2 border-neon-cyan/40 flex items-center justify-center">
              <KeyRound className="w-9 h-9 text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Admin Password
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Control Panel access ke liye password darj karein.
              </p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-3">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password enter karein..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  className="bg-input border-border text-foreground pr-10"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2"
                  data-ocid="admin.error_state"
                >
                  {passwordError}
                </p>
              )}
              <Button
                onClick={handlePasswordSubmit}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold w-full gap-2"
                data-ocid="admin.primary_button"
              >
                <Lock className="w-4 h-4" />
                Unlock
              </Button>
              <p className="text-xs text-muted-foreground/60">
                Default password:{" "}
                <span className="font-mono text-neon-cyan/70">admin123</span>
              </p>
            </div>
          </div>
        ) : !isLoggedIn ? (
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
            className="flex flex-col items-center gap-5 py-10 text-center"
            data-ocid="admin.panel"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-neon-green/10 border-2 border-neon-green/40 flex items-center justify-center">
                <Crown className="w-9 h-9 text-neon-green" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-green animate-ping opacity-60" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Claim Admin Access
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Press the button below to claim admin access for your account.
              </p>
            </div>
            <Button
              onClick={handleClaimAdmin}
              disabled={claimAdmin.isPending}
              className="bg-neon-green text-black hover:bg-neon-green/90 font-bold px-8 py-2 gap-2 text-base"
              data-ocid="admin.primary_button"
            >
              {claimAdmin.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Claim Admin Access
                </>
              )}
            </Button>
            {claimAdmin.isError && (
              <p
                className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2"
                data-ocid="admin.error_state"
              >
                {(claimAdmin.error as { message?: string })?.message ??
                  "Failed to claim admin."}
              </p>
            )}
          </div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="bg-secondary border border-border w-full flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger
                value="profile"
                className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-xs"
                data-ocid="admin.tab"
              >
                Coin Profile
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-xs"
                data-ocid="admin.tab"
              >
                Market Stats
              </TabsTrigger>
              <TabsTrigger
                value="mint"
                className="flex-1 data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green text-xs"
                data-ocid="admin.tab"
              >
                Mint Tokens
              </TabsTrigger>
              <TabsTrigger
                value="tax"
                className="flex-1 data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400 text-xs"
                data-ocid="admin.tab"
              >
                Tax Settings
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 data-[state=active]:bg-red-400/20 data-[state=active]:text-red-400 text-xs"
                data-ocid="admin.tab"
              >
                Security
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
              <div className="flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg px-3 py-2">
                <Lock className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span className="text-xs text-neon-cyan font-semibold">
                  Total Supply is permanently locked at 1,000,000,000 DR coins.
                  This cannot be changed.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "currentPrice", label: "Current Price ($)" },
                    { key: "priceChange24h", label: "24h Change (%)" },
                    { key: "marketCap", label: "Market Cap ($)" },
                    { key: "volume24h", label: "24h Volume ($)" },
                    { key: "circulatingSupply", label: "Circulating Supply" },
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
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-neon-cyan" />
                    Total Supply (Locked)
                  </Label>
                  <Input
                    type="text"
                    value="1,000,000,000"
                    disabled
                    className="bg-neon-cyan/5 border-neon-cyan/30 text-neon-cyan font-bold cursor-not-allowed"
                  />
                </div>
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

            <TabsContent value="mint" className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-neon-green/10 border border-neon-green/30 px-4 py-3">
                <Coins className="w-5 h-5 text-neon-green flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Minted So Far
                  </p>
                  <p className="text-lg font-bold text-neon-green font-mono">
                    {totalMinted !== undefined ? e8sToDr(totalMinted) : "..."}{" "}
                    DR
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Recipient Principal
                </Label>
                <Input
                  placeholder="Principal ID of recipient"
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Amount to Mint (DR)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  min="0"
                  step="1"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-ocid="admin.input"
                />
              </div>

              {mintError && (
                <p
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2"
                  data-ocid="admin.error_state"
                >
                  {mintError}
                </p>
              )}

              <Button
                onClick={handleMint}
                disabled={mintTokens.isPending}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-bold w-full gap-2"
                data-ocid="admin.submit_button"
              >
                {mintTokens.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Mint DR Tokens
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="tax" className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3">
                <Percent className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-400">
                    3% Transfer Tax
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Har coin transfer par automatically 3% tax aapke designated
                    account mein aayega. Remaining 97% recipient ko milega.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Current Tax Account
                </p>
                {taxLoading ? (
                  <div
                    className="flex items-center gap-2"
                    data-ocid="admin.loading_state"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : taxAccount ? (
                  <p className="text-sm font-mono text-amber-400 break-all">
                    {taxAccount}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    Not set yet
                  </p>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  New Tax Account Principal
                </Label>
                <Input
                  placeholder="Principal ID e.g. aaaaa-aa or rrkah-fqaaa-..."
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                  data-ocid="admin.input"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTaxInput(identity?.getPrincipal().toString() ?? "")
                }
                className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10 gap-2 w-full"
                data-ocid="admin.secondary_button"
              >
                <User className="w-4 h-4" />
                Use My Principal as Tax Account
              </Button>

              {taxError && (
                <p
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2"
                  data-ocid="admin.error_state"
                >
                  {taxError}
                </p>
              )}

              <Button
                onClick={handleSetTax}
                disabled={setTaxAccount.isPending}
                className="bg-amber-400 text-black hover:bg-amber-400/90 font-bold w-full gap-2"
                data-ocid="admin.submit_button"
              >
                {setTaxAccount.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Percent className="w-4 h-4" />
                    Set Tax Account
                  </>
                )}
              </Button>
            </TabsContent>

            {/* SECURITY TAB - Change Password */}
            <TabsContent value="security" className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3">
                <KeyRound className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Admin Panel Password
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Yeh password har baar Control Panel kholne par maanga
                    jaayega. Ise safe jagah save karein.
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Naya Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    placeholder="Naya password darj karein"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-input border-border text-foreground pr-10"
                    data-ocid="admin.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Password Confirm Karein
                </Label>
                <Input
                  type="password"
                  placeholder="Wahi password dobara darj karein"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-ocid="admin.input"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                className="bg-red-500 text-white hover:bg-red-500/90 font-bold w-full gap-2"
                data-ocid="admin.submit_button"
              >
                <KeyRound className="w-4 h-4" />
                Password Change Karein
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
