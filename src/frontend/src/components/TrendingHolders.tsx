import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useTopHolders } from "../hooks/useQueries";

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

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export default function TrendingHolders() {
  const { data: holders, isLoading } = useTopHolders(10);

  return (
    <section
      id="holders"
      className="py-16 px-4 max-w-5xl mx-auto"
      data-ocid="holders.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/30">
            <TrendingUp className="w-5 h-5 text-neon-green" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Top DR Holders</h2>
          <Badge
            variant="outline"
            className="border-neon-green/40 text-neon-green text-xs"
          >
            LIVE
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-6 ml-12">
          Real-time leaderboard of the largest @dr coin holders on the ICP
          blockchain
        </p>

        <div className="rounded-xl border border-border/60 overflow-hidden bg-card/50 backdrop-blur">
          <Table data-ocid="holders.table">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-muted-foreground w-16 pl-6">
                  #
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Principal
                </TableHead>
                <TableHead className="text-muted-foreground text-right pr-6">
                  Balance (DR)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => i).map((i) => (
                  <TableRow key={`skeleton-${i}`} className="border-border/40">
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-6 bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48 bg-secondary" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Skeleton className="h-4 w-28 bg-secondary ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !holders || holders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="holders.empty_state"
                  >
                    No holders yet — be the first to acquire DR tokens!
                  </TableCell>
                </TableRow>
              ) : (
                holders.map(([principal, balance], idx) => (
                  <motion.tr
                    key={principal.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-border/40 hover:bg-neon-green/5 transition-colors"
                    data-ocid={`holders.item.${idx + 1}`}
                  >
                    <TableCell className="pl-6 font-bold">
                      {idx < 3 ? (
                        <span
                          className={`flex items-center gap-1 ${RANK_COLORS[idx]}`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{idx + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-foreground/80">
                      {truncatePrincipal(principal.toString())}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-semibold text-neon-green">
                      {e8sToDr(balance)}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </section>
  );
}
