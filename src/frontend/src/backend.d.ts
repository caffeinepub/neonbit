import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PricePoint {
    timestamp: bigint;
    price: number;
}
export interface CoinProfile {
    name: string;
    description: string;
    logoUrl: string;
    symbol: string;
}
export interface MarketStats {
    currentPrice: number;
    circulatingSupply: number;
    marketCap: number;
    volume24h: number;
    totalSupply: number;
    priceChange24h: number;
    allTimeHigh: number;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    to: Principal;
    from: Principal;
    memo: string;
    timestamp: bigint;
    amount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPricePoint(pricePoint: PricePoint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimInitialAdmin(): Promise<void>;
    clearPriceHistory(): Promise<void>;
    getBalance(principal: Principal): Promise<bigint>;
    getCallerBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinProfile(): Promise<CoinProfile>;
    getFixedTotalSupply(): Promise<number>;
    getFixedTotalSupplyNat(): Promise<bigint>;
    getLatestPricePoint(): Promise<PricePoint | null>;
    getMarketStats(): Promise<MarketStats>;
    getPriceHistory(): Promise<Array<PricePoint>>;
    getRecentTransactions(): Promise<Array<Transaction>>;
    getTaxAccount(): Promise<Principal | null>;
    getTopHolders(limit: bigint): Promise<Array<[Principal, bigint]>>;
    getTotalMinted(): Promise<bigint>;
    getTransactionHistory(principal: Principal): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAdminBeenClaimed(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    mintTokens(to: Principal, amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTaxAccount(account: Principal): Promise<void>;
    transfer(to: Principal, amount: bigint): Promise<void>;
    updateCoinProfile(profile: CoinProfile): Promise<void>;
    updateCoinProfileAndMarketStats(profile: CoinProfile, stats: MarketStats): Promise<void>;
    updateMarketStats(stats: MarketStats): Promise<void>;
}
