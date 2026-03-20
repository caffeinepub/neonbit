/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface CoinProfile {
  'name' : string,
  'description' : string,
  'logoUrl' : string,
  'symbol' : string,
}
export interface MarketStats {
  'currentPrice' : number,
  'circulatingSupply' : number,
  'marketCap' : number,
  'volume24h' : number,
  'totalSupply' : number,
  'priceChange24h' : number,
  'allTimeHigh' : number,
}
export interface PricePoint { 'timestamp' : bigint, 'price' : number }
export interface Transaction {
  'id' : bigint,
  'to' : Principal,
  'from' : Principal,
  'memo' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'addPricePoint' : ActorMethod<[PricePoint], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'claimInitialAdmin' : ActorMethod<[], undefined>,
  'resetAndClaimAdmin' : ActorMethod<[], undefined>,
  'clearPriceHistory' : ActorMethod<[], undefined>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getCallerBalance' : ActorMethod<[], bigint>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCoinProfile' : ActorMethod<[], CoinProfile>,
  'getFixedTotalSupply' : ActorMethod<[], number>,
  'getFixedTotalSupplyNat' : ActorMethod<[], bigint>,
  'getLatestPricePoint' : ActorMethod<[], [] | [PricePoint]>,
  'getMarketStats' : ActorMethod<[], MarketStats>,
  'getPriceHistory' : ActorMethod<[], Array<PricePoint>>,
  'getRecentTransactions' : ActorMethod<[], Array<Transaction>>,
  'getTaxAccount' : ActorMethod<[], [] | [Principal]>,
  'getTopHolders' : ActorMethod<[bigint], Array<[Principal, bigint]>>,
  'getTotalMinted' : ActorMethod<[], bigint>,
  'getTransactionHistory' : ActorMethod<[Principal], Array<Transaction>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'hasAdminBeenClaimed' : ActorMethod<[], boolean>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'mintTokens' : ActorMethod<[Principal, bigint], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setTaxAccount' : ActorMethod<[Principal], undefined>,
  'transfer' : ActorMethod<[Principal, bigint], undefined>,
  'updateCoinProfile' : ActorMethod<[CoinProfile], undefined>,
  'updateCoinProfileAndMarketStats' : ActorMethod<
    [CoinProfile, MarketStats],
    undefined
  >,
  'updateMarketStats' : ActorMethod<[MarketStats], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
