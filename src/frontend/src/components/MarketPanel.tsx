import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
  ShoppingCart,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Listing } from "../backend";
import { ListingStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminResolve,
  useCallerBalance,
  useCancelListing,
  useConfirmSale,
  useCreateListing,
  useInitiatePurchase,
  useIsAdmin,
  useListings,
  useMyListings,
} from "../hooks/useQueries";

const DR_DECIMALS = 100_000_000;

function formatDR(e8s: bigint): string {
  const val = Number(e8s) / DR_DECIMALS;
  return `${val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })} DR`;
}

function formatICP(icp: number): string {
  return `${icp.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })} ICP`;
}

function truncatePrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}...${p.slice(-6)}`;
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const styles: Record<ListingStatus, string> = {
    [ListingStatus.Open]:
      "border-neon-green/60 text-neon-green bg-neon-green/10 shadow-[0_0_8px_rgba(0,255,136,0.3)]",
    [ListingStatus.Pending]:
      "border-yellow-400/60 text-yellow-400 bg-yellow-400/10 shadow-[0_0_8px_rgba(250,204,21,0.3)]",
    [ListingStatus.Completed]:
      "border-muted-foreground/40 text-muted-foreground bg-muted/20",
    [ListingStatus.Cancelled]:
      "border-red-500/60 text-red-400 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2 py-0.5 ${styles[status]}`}
    >
      {status}
    </Badge>
  );
}

interface CreateListingModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateListingModal({ open, onClose }: CreateListingModalProps) {
  const [drAmount, setDrAmount] = useState("");
  const [icpPrice, setIcpPrice] = useState("");
  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useCallerBalance();
  const createListing = useCreateListing();

  useEffect(() => {
    if (open) refetchBalance();
  }, [open, refetchBalance]);

  const balanceDR = balance ? Number(balance) / DR_DECIMALS : 0;

  async function handleSubmit() {
    const amtDR = Number.parseFloat(drAmount);
    const price = Number.parseFloat(icpPrice);
    if (!amtDR || amtDR <= 0) {
      toast.error("Enter a valid DR amount");
      return;
    }
    if (!price || price <= 0) {
      toast.error("Enter a valid ICP price");
      return;
    }
    if (amtDR > balanceDR) {
      toast.error("Insufficient DR balance");
      return;
    }

    const amtE8s = BigInt(Math.floor(amtDR * DR_DECIMALS));
    try {
      await createListing.mutateAsync({ amount: amtE8s, priceICP: price });
      toast.success("Listing created! DR locked in escrow.");
      setDrAmount("");
      setIcpPrice("");
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create listing");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#0D1118] border border-neon-cyan/30 text-foreground max-w-md"
        data-ocid="market.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-neon-cyan text-lg font-bold">
            Create Sell Listing
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Set how many DR tokens to sell and your asking price in ICP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your DR Balance</span>
            <span className="text-neon-green font-semibold font-mono flex items-center gap-1">
              {balanceLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-green" />
              ) : (
                <>
                  {balanceDR.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  DR
                </>
              )}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="dr-amount"
              className="text-muted-foreground text-xs uppercase tracking-widest"
            >
              Amount (DR)
            </Label>
            <Input
              id="dr-amount"
              type="number"
              placeholder="e.g. 1000"
              value={drAmount}
              onChange={(e) => setDrAmount(e.target.value)}
              className="bg-[#111827] border-border/60 focus:border-neon-cyan/60 font-mono"
              data-ocid="market.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="icp-price"
              className="text-muted-foreground text-xs uppercase tracking-widest"
            >
              Price (ICP)
            </Label>
            <Input
              id="icp-price"
              type="number"
              placeholder="e.g. 0.5"
              value={icpPrice}
              onChange={(e) => setIcpPrice(e.target.value)}
              className="bg-[#111827] border-border/60 focus:border-neon-cyan/60 font-mono"
              data-ocid="market.input"
            />
          </div>

          <div className="flex items-start gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-400/80">
              DR tokens will be locked in escrow until the sale is completed or
              you cancel the listing.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/60 text-muted-foreground hover:bg-secondary"
            data-ocid="market.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createListing.isPending}
            className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-semibold shadow-glow-cyan"
            data-ocid="market.submit_button"
          >
            {createListing.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {createListing.isPending ? "Creating..." : "Create Listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BuyDialogProps {
  listing: Listing | null;
  onClose: () => void;
}

function BuyDialog({ listing, onClose }: BuyDialogProps) {
  const initiatePurchase = useInitiatePurchase();

  if (!listing) return null;

  const sellerStr = listing.seller.toString();

  async function handleBuy() {
    try {
      await initiatePurchase.mutateAsync(listing!.id);
      toast.success("Purchase initiated! Now send ICP to the seller.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to initiate purchase");
    }
  }

  return (
    <Dialog open={!!listing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#0D1118] border border-neon-green/30 text-foreground max-w-md"
        data-ocid="market.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-neon-green text-lg font-bold">
            Buy DR Tokens
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Follow these steps to complete your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-neon-green font-semibold font-mono text-sm">
                {formatDR(listing.amount)}
              </p>
            </div>
            <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-neon-cyan font-semibold font-mono text-sm">
                {formatICP(listing.priceICP)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                step: 1,
                title: 'Click "Initiate Purchase"',
                desc: "This locks your intent to buy on-chain.",
              },
              {
                step: 2,
                title: "Send ICP to seller",
                desc: null,
              },
              {
                step: 3,
                title: "Ask seller to confirm",
                desc: "Once the seller confirms receipt, DR tokens will be transferred to you automatically.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-2 bg-[#111827] border border-border/50 rounded-lg p-3"
              >
                <span className="w-5 h-5 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {step === 2 ? (
                    <>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Send{" "}
                        <span className="text-neon-cyan font-mono">
                          {formatICP(listing.priceICP)}
                        </span>{" "}
                        to:
                      </p>
                      <p className="text-xs font-mono text-foreground bg-muted/20 rounded px-2 py-1 mt-1 break-all select-all">
                        {sellerStr}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/60 text-muted-foreground hover:bg-secondary"
            data-ocid="market.cancel_button"
          >
            Cancel
          </Button>
          {listing.status === ListingStatus.Open && (
            <Button
              onClick={handleBuy}
              disabled={initiatePurchase.isPending}
              className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold shadow-glow-green"
              data-ocid="market.confirm_button"
            >
              {initiatePurchase.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {initiatePurchase.isPending
                ? "Processing..."
                : "Initiate Purchase"}
            </Button>
          )}
          {listing.status === ListingStatus.Pending && (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Awaiting seller confirmation
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ListingCardProps {
  listing: Listing;
  myPrincipal: string | null;
  isAdmin: boolean;
  onBuyClick: (l: Listing) => void;
}

function ListingCard({
  listing,
  myPrincipal,
  isAdmin,
  onBuyClick,
}: ListingCardProps) {
  const confirmSale = useConfirmSale();
  const cancelListing = useCancelListing();
  const adminResolve = useAdminResolve();

  const sellerStr = listing.seller.toString();
  const isMine = myPrincipal && sellerStr === myPrincipal;

  async function handleConfirm() {
    try {
      await confirmSale.mutateAsync(listing.id);
      toast.success("Sale confirmed! DR tokens released to buyer.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to confirm sale");
    }
  }

  async function handleCancel() {
    try {
      await cancelListing.mutateAsync(listing.id);
      toast.success("Listing cancelled. DR returned to your wallet.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel listing");
    }
  }

  async function handleAdminRelease(releaseToBuyer: boolean) {
    try {
      await adminResolve.mutateAsync({ listingId: listing.id, releaseToBuyer });
      toast.success(
        releaseToBuyer ? "Released to buyer." : "Returned to seller.",
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Admin resolve failed");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-[#0D1118]/80 border border-border/40 hover:border-neon-cyan/30 transition-colors backdrop-blur-sm p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatDR(listing.amount)}
            </p>
            <p className="text-neon-cyan font-semibold font-mono text-sm mt-0.5">
              {formatICP(listing.priceICP)}
            </p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">
            {isMine ? "You" : truncatePrincipal(sellerStr)}
          </span>
          <span>
            {new Date(
              Number(listing.createdAt) / 1_000_000,
            ).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {listing.status === ListingStatus.Open && !isMine && (
            <Button
              size="sm"
              onClick={() => onBuyClick(listing)}
              className="bg-neon-green/15 border border-neon-green/40 text-neon-green hover:bg-neon-green/25 text-xs h-7 px-3 font-semibold"
              data-ocid="market.primary_button"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
            </Button>
          )}
          {listing.status === ListingStatus.Pending && isMine && (
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={confirmSale.isPending}
              className="bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/25 text-xs h-7 px-3 font-semibold"
              data-ocid="market.confirm_button"
            >
              {confirmSale.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              Confirm Sale
            </Button>
          )}
          {(listing.status === ListingStatus.Open ||
            listing.status === ListingStatus.Pending) &&
            isMine && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelListing.isPending}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-7 px-3"
                data-ocid="market.delete_button"
              >
                {cancelListing.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                Cancel
              </Button>
            )}
          {isAdmin && listing.status === ListingStatus.Pending && (
            <>
              <Button
                size="sm"
                onClick={() => handleAdminRelease(true)}
                disabled={adminResolve.isPending}
                className="bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 text-xs h-7 px-2"
                data-ocid="market.confirm_button"
              >
                Release to Buyer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAdminRelease(false)}
                disabled={adminResolve.isPending}
                className="border-orange-400/40 text-orange-400 hover:bg-orange-400/10 text-xs h-7 px-2"
                data-ocid="market.secondary_button"
              >
                Return to Seller
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface MarketPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function MarketPanel({ open, onClose }: MarketPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [buyListing, setBuyListing] = useState<Listing | null>(null);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? null;

  const {
    data: allListings = [],
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useListings();
  const {
    data: myListings = [],
    isLoading: loadingMine,
    refetch: refetchMine,
  } = useMyListings();
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      refetchAll();
      refetchMine();
    }, 15000);
    return () => clearInterval(interval);
  }, [open, refetchAll, refetchMine]);

  function handleRefresh() {
    refetchAll();
    refetchMine();
  }

  const activeListings = allListings.filter(
    (l) =>
      l.status === ListingStatus.Open || l.status === ListingStatus.Pending,
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="market-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl bg-[#0B0F14] border border-border/50 rounded-2xl overflow-hidden shadow-2xl"
              data-ocid="market.panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-neon-cyan/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground tracking-wide">
                      DR Market
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      P2P Buy &amp; Sell DR Tokens
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="border-border/60 text-muted-foreground hover:text-neon-cyan h-8 w-8 p-0"
                    data-ocid="market.secondary_button"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-semibold h-8 px-3 text-xs shadow-glow-cyan gap-1.5"
                    data-ocid="market.open_modal_button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Sell DR
                  </Button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close market"
                    data-ocid="market.close_button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <Tabs defaultValue="active">
                  <TabsList className="bg-[#111827] border border-border/40 mb-5">
                    <TabsTrigger
                      value="active"
                      className="data-[state=active]:bg-neon-cyan/15 data-[state=active]:text-neon-cyan text-xs"
                      data-ocid="market.tab"
                    >
                      Active Listings
                      {activeListings.length > 0 && (
                        <span className="ml-1.5 bg-neon-cyan/20 text-neon-cyan text-[10px] rounded-full px-1.5 py-0">
                          {activeListings.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="mine"
                      className="data-[state=active]:bg-neon-green/15 data-[state=active]:text-neon-green text-xs"
                      data-ocid="market.tab"
                    >
                      My Listings
                      {myListings.length > 0 && (
                        <span className="ml-1.5 bg-neon-green/20 text-neon-green text-[10px] rounded-full px-1.5 py-0">
                          {myListings.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active">
                    {loadingAll ? (
                      <div
                        className="flex items-center justify-center py-16 gap-2 text-muted-foreground"
                        data-ocid="market.loading_state"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading listings...</span>
                      </div>
                    ) : activeListings.length === 0 ? (
                      <div
                        className="text-center py-16"
                        data-ocid="market.empty_state"
                      >
                        <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          No active listings right now.
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                          Be the first to sell DR tokens!
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setCreateOpen(true)}
                          className="mt-4 bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/25 text-xs"
                          data-ocid="market.primary_button"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Create Listing
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[480px] pr-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <AnimatePresence mode="popLayout">
                            {activeListings.map((listing, idx) => (
                              <div
                                key={String(listing.id)}
                                data-ocid={`market.item.${idx + 1}`}
                              >
                                <ListingCard
                                  listing={listing}
                                  myPrincipal={myPrincipal}
                                  isAdmin={!!isAdmin}
                                  onBuyClick={(l) => setBuyListing(l)}
                                />
                              </div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="mine">
                    {loadingMine ? (
                      <div
                        className="flex items-center justify-center py-16 gap-2 text-muted-foreground"
                        data-ocid="market.loading_state"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">
                          Loading your listings...
                        </span>
                      </div>
                    ) : myListings.length === 0 ? (
                      <div
                        className="text-center py-16"
                        data-ocid="market.empty_state"
                      >
                        <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          You have no listings yet.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setCreateOpen(true)}
                          className="mt-4 bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/25 text-xs"
                          data-ocid="market.primary_button"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Create Your First Listing
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[480px] pr-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <AnimatePresence mode="popLayout">
                            {myListings.map((listing, idx) => (
                              <div
                                key={String(listing.id)}
                                data-ocid={`market.item.${idx + 1}`}
                              >
                                <ListingCard
                                  listing={listing}
                                  myPrincipal={myPrincipal}
                                  isAdmin={!!isAdmin}
                                  onBuyClick={(l) => setBuyListing(l)}
                                />
                              </div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateListingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <BuyDialog listing={buyListing} onClose={() => setBuyListing(null)} />
    </>
  );
}
