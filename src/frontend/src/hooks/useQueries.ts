import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CoinProfile, MarketStats } from "../backend";
import { useActor } from "./useActor";

export function useCoinProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<CoinProfile>({
    queryKey: ["coinProfile"],
    queryFn: async () => {
      if (!actor)
        return {
          name: "NEONBIT",
          symbol: "NBT",
          description: "The future of decentralized finance.",
          logoUrl: "/assets/generated/neonbit-logo-transparent.dim_200x200.png",
        };
      return actor.getCoinProfile();
    },
    enabled: !isFetching,
  });
}

export function useMarketStats() {
  const { actor, isFetching } = useActor();
  return useQuery<MarketStats>({
    queryKey: ["marketStats"],
    queryFn: async () => {
      if (!actor)
        return {
          currentPrice: 2.47,
          priceChange24h: 6.82,
          marketCap: 247_000_000,
          volume24h: 18_500_000,
          circulatingSupply: 100_000_000,
          totalSupply: 200_000_000,
          allTimeHigh: 4.89,
        };
      return actor.getMarketStats();
    },
    enabled: !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !isFetching,
  });
}

export function useUpdateCoinProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: CoinProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateCoinProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coinProfile"] });
    },
  });
}

export function useUpdateMarketStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stats: MarketStats) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMarketStats(stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketStats"] });
    },
  });
}
