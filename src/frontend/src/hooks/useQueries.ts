import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CoinProfile, MarketStats } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

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

export function useCallerBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<bigint>({
    queryKey: ["callerBalance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCallerBalance();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["txHistory"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getTransactionHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useTopHolders(limit = 10) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topHolders", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopHolders(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useTotalMinted() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalMinted"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalMinted();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useGetTaxAccount() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["taxAccount"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getTaxAccount();
        if (result === undefined || result === null) return null;
        return result.toString();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetTaxAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const p = Principal.fromText(principal);
      await actor.setTaxAccount(p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxAccount"] });
    },
  });
}

export function useTransfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const toPrincipal = Principal.fromText(to);
      await actor.transfer(toPrincipal, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
      queryClient.invalidateQueries({ queryKey: ["txHistory"] });
      queryClient.invalidateQueries({ queryKey: ["topHolders"] });
    },
  });
}

export function useMintTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const toPrincipal = Principal.fromText(to);
      await actor.mintTokens(toPrincipal, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totalMinted"] });
      queryClient.invalidateQueries({ queryKey: ["topHolders"] });
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
    },
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

export function useHasAdminBeenClaimed() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasAdminBeenClaimed"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.hasAdminBeenClaimed();
      } catch {
        return false;
      }
    },
    enabled: !isFetching,
  });
}

export function useClaimInitialAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.claimInitialAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["hasAdminBeenClaimed"] });
    },
  });
}

export function useResetAndClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.resetAndClaimAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["hasAdminBeenClaimed"] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // registerUser is available in backend but may not be in generated types
      await (actor as any).registerUser();
    },
  });
}
