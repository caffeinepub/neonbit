import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Info,
  Loader2,
  Send,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerBalance,
  useTransactionHistory,
  useTransfer,
} from "../hooks/useQueries";

function e8sToDr(e8s: bigint): string {
  const dr = Number(e8s) / 1e8;
  return dr.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

function truncatePrincipal(p: string): string {
  if (p.length <= 17) return p;
  return `${p.slice(0, 10)}...${p.slice(-5)}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface WalletPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletPanel({ open, onClose }: WalletPanelProps) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const { data: balance, isLoading: balanceLoading } = useCallerBalance();
  const { data: txHistory, isLoading: txLoading } = useTransactionHistory();
  const transfer = useTransfer();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sendError, setSendError] = useState("");

  const amountNum = Number.parseFloat(amount);
  const validAmount = !Number.isNaN(amountNum) && amountNum > 0;
  const taxAmount = validAmount ? amountNum * 0.03 : 0;
  const recipientAmount = validAmount ? amountNum * 0.97 : 0;

  const handleSend = async () => {
    setSendError("");
    if (!recipient.trim()) {
      setSendError("Recipient principal is required.");
      return;
    }
    if (!validAmount) {
      setSendError("Enter a valid amount.");
      return;
    }
    const balanceNum = balance ? Number(balance) / 1e8 : 0;
    if (amountNum > balanceNum) {
      setSendError("Insufficient balance.");
      return;
    }
    try {
      const e8s = BigInt(Math.round(amountNum * 1e8));
      await transfer.mutateAsync({ to: recipient.trim(), amount: e8s });
      toast.success(`Sent ${amountNum} DR successfully!`);
      setRecipient("");
      setAmount("");
      setMemo("");
    } catch (err: any) {
      const msg = err?.message ?? "Transfer failed";
      setSendError(
        msg.includes("invalid principal") || msg.includes("Principal")
          ? "Invalid recipient principal address."
          : msg,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-xl max-h-[90vh] flex flex-col gap-0 p-0"
        data-ocid="wallet.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5 text-neon-green" />
            DR Wallet
          </DialogTitle>
        </DialogHeader>

        {/* Balance Card */}
        <div className="mx-6 mb-4 rounded-xl bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 border border-neon-green/30 p-5">
          <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
          {balanceLoading ? (
            <div
              className="flex items-center gap-2"
              data-ocid="wallet.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-neon-green font-mono tracking-tight">
              {e8sToDr(balance ?? BigInt(0))}{" "}
              <span className="text-lg text-neon-green/60">DR</span>
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-mono">
              {truncatePrincipal(myPrincipal)}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(myPrincipal);
                toast.success("Principal copied!");
              }}
              className="text-muted-foreground hover:text-neon-cyan transition-colors"
              data-ocid="wallet.secondary_button"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="send" className="flex flex-col h-full">
            <TabsList className="mx-6 bg-secondary border border-border">
              <TabsTrigger
                value="send"
                className="flex-1 data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green"
                data-ocid="wallet.tab"
              >
                Send DR
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
                data-ocid="wallet.tab"
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="send"
              className="px-6 pb-6 pt-4 flex flex-col gap-4"
            >
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Recipient Principal
                </Label>
                <Input
                  placeholder="e.g. aaaaa-aa or rrkah-fqaaa-..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                  data-ocid="wallet.input"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Amount (DR)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0000"
                    min="0"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-input border-border text-foreground pr-16"
                    data-ocid="wallet.input"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        balance ? (Number(balance) / 1e8).toFixed(4) : "0",
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neon-green hover:text-neon-green/80 font-semibold"
                  >
                    MAX
                  </button>
                </div>

                {/* Tax breakdown info */}
                {validAmount ? (
                  <div className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-amber-400">
                        3% Tax automatically deducted
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="flex flex-col items-center rounded bg-secondary/60 px-2 py-1.5">
                        <span className="text-muted-foreground mb-0.5">
                          You send
                        </span>
                        <span className="font-bold text-foreground font-mono">
                          {amountNum.toFixed(4)}
                        </span>
                        <span className="text-muted-foreground/70 text-[10px]">
                          DR
                        </span>
                      </div>
                      <div className="flex flex-col items-center rounded bg-neon-green/10 border border-neon-green/20 px-2 py-1.5">
                        <span className="text-muted-foreground mb-0.5">
                          Recipient gets
                        </span>
                        <span className="font-bold text-neon-green font-mono">
                          {recipientAmount.toFixed(4)}
                        </span>
                        <span className="text-neon-green/60 text-[10px]">
                          DR (97%)
                        </span>
                      </div>
                      <div className="flex flex-col items-center rounded bg-amber-400/10 border border-amber-400/20 px-2 py-1.5">
                        <span className="text-muted-foreground mb-0.5">
                          Tax (3%)
                        </span>
                        <span className="font-bold text-amber-400 font-mono">
                          {taxAmount.toFixed(4)}
                        </span>
                        <span className="text-amber-400/60 text-[10px]">
                          DR
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground/70 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    3% tax will be deducted automatically. Recipient receives
                    97% of the amount.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  Memo (optional)
                </Label>
                <Input
                  placeholder="Transfer note..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-ocid="wallet.input"
                />
              </div>

              {sendError && (
                <p
                  className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2"
                  data-ocid="wallet.error_state"
                >
                  {sendError}
                </p>
              )}

              <Button
                onClick={handleSend}
                disabled={transfer.isPending}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-bold w-full gap-2"
                data-ocid="wallet.submit_button"
              >
                {transfer.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send DR
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="history" className="px-0 pb-6 pt-0 flex-1">
              {txLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="wallet.loading_state"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                </div>
              ) : !txHistory || txHistory.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 py-10 text-center"
                  data-ocid="wallet.empty_state"
                >
                  <p className="text-muted-foreground text-sm">
                    No transactions yet
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    Your DR transfers will appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64 px-6">
                  <div className="flex flex-col gap-2 pt-4">
                    {txHistory.map((tx, i) => {
                      const isSent = tx.from.toString() === myPrincipal;
                      return (
                        <div
                          key={String(tx.id)}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
                          data-ocid={`wallet.item.${i + 1}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isSent
                                  ? "bg-red-400/10 text-red-400"
                                  : "bg-neon-green/10 text-neon-green"
                              }`}
                            >
                              {isSent ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-foreground font-medium">
                                {isSent ? "Sent to" : "Received from"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {truncatePrincipal(
                                  isSent
                                    ? tx.to.toString()
                                    : tx.from.toString(),
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold font-mono ${
                                isSent ? "text-red-400" : "text-neon-green"
                              }`}
                            >
                              {isSent ? "-" : "+"}
                              {e8sToDr(tx.amount)} DR
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="bg-border" />
        <div className="px-6 py-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-border text-muted-foreground rounded-full"
            data-ocid="wallet.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
