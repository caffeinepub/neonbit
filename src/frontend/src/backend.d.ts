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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPricePoint(pricePoint: PricePoint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearPriceHistory(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinProfile(): Promise<CoinProfile>;
    getLatestPricePoint(): Promise<PricePoint | null>;
    getMarketStats(): Promise<MarketStats>;
    getPriceHistory(): Promise<Array<PricePoint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCoinProfile(profile: CoinProfile): Promise<void>;
    updateCoinProfileAndMarketStats(profile: CoinProfile, stats: MarketStats): Promise<void>;
    updateMarketStats(stats: MarketStats): Promise<void>;
}
