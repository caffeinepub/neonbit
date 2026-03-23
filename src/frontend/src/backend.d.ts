import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
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
export interface Listing {
    id: bigint;
    status: ListingStatus;
    createdAt: bigint;
    seller: Principal;
    updatedAt: bigint;
    buyer?: Principal;
    priceICP: number;
    amount: bigint;
}
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
export interface UserStats {
    principal: Principal;
    totalReceived: bigint;
    balance: bigint;
    totalSent: bigint;
    transferCount: bigint;
}
export interface Transaction {
    id: bigint;
    to: Principal;
    from: Principal;
    memo: string;
    timestamp: bigint;
    amount: bigint;
}
export enum ListingStatus {
    Open = "Open",
    Cancelled = "Cancelled",
    Completed = "Completed",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPricePoint(pricePoint: PricePoint): Promise<void>;
    adminResolve(listingId: bigint, releaseToBuyer: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelListing(listingId: bigint): Promise<void>;
    claimInitialAdmin(): Promise<void>;
    clearPriceHistory(): Promise<void>;
    confirmSale(listingId: bigint): Promise<void>;
    createListing(amount: bigint, priceICP: number): Promise<bigint>;
    getAllUserStats(): Promise<Array<UserStats>>;
    getBalance(principal: Principal): Promise<bigint>;
    getCallerBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinProfile(): Promise<CoinProfile>;
    getFixedTotalSupply(): Promise<number>;
    getFixedTotalSupplyNat(): Promise<bigint>;
    getLatestPricePoint(): Promise<PricePoint | null>;
    getListings(): Promise<Array<Listing>>;
    getMarketStats(): Promise<MarketStats>;
    getMyListings(): Promise<Array<Listing>>;
    getPriceHistory(): Promise<Array<PricePoint>>;
    getRecentTransactions(): Promise<Array<Transaction>>;
    getTaxAccount(): Promise<Principal | null>;
    getTopHolders(limit: bigint): Promise<Array<[Principal, bigint]>>;
    getTotalMinted(): Promise<bigint>;
    getTransactionHistory(principal: Principal): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAdminBeenClaimed(): Promise<boolean>;
    initiatePurchase(listingId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    mintTokens(to: Principal, amount: bigint): Promise<void>;
    registerUser(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTaxAccount(account: Principal): Promise<void>;
    transfer(to: Principal, amount: bigint): Promise<void>;
    updateCoinProfile(profile: CoinProfile): Promise<void>;
    updateCoinProfileAndMarketStats(profile: CoinProfile, stats: MarketStats): Promise<void>;
    updateMarketStats(stats: MarketStats): Promise<void>;
}
