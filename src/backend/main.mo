import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    userProfiles.add(caller, profile);
  };

  type CoinProfile = { name : Text; symbol : Text; description : Text; logoUrl : Text };
  type MarketStats = { currentPrice : Float; marketCap : Float; circulatingSupply : Float; totalSupply : Float; volume24h : Float; allTimeHigh : Float; priceChange24h : Float };
  type PricePoint = { timestamp : Int; price : Float };

  var coinProfile : CoinProfile = {
    name = "@dr";
    symbol = "DR";
    description = "Exponential coins, high speed, low fees. Transfer coins between pools, provide liquidity and farm incentives";
    logoUrl = "https://cdn.zuesser.com/neonbit/logo/favicon.png";
  };

  var marketStats : MarketStats = { currentPrice = 0.00125; marketCap = 500_000.0; circulatingSupply = 400_000_000.0; totalSupply = 1_000_000_000.0; volume24h = 50_000.0; allTimeHigh = 0.0025; priceChange24h = -0.05 };
  var priceHistory : [PricePoint] = [];
  let maxHistoryPoints = 200;

  public shared ({ caller }) func updateCoinProfile(profile : CoinProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    coinProfile := profile;
  };

  public shared ({ caller }) func updateMarketStats(stats : MarketStats) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    marketStats := stats;
  };

  public shared ({ caller }) func addPricePoint(pricePoint : PricePoint) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    if (priceHistory.size() >= maxHistoryPoints) {
      priceHistory := Array.tabulate<PricePoint>(priceHistory.size() - 1, func(i : Nat) : PricePoint { priceHistory[i + 1] });
    };
    priceHistory := priceHistory.concat([pricePoint]);
  };

  public query func getCoinProfile() : async CoinProfile { coinProfile };
  public query func getMarketStats() : async MarketStats { marketStats };
  public query func getPriceHistory() : async [PricePoint] { priceHistory };

  public shared ({ caller }) func clearPriceHistory() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    priceHistory := [];
  };

  public shared ({ caller }) func updateCoinProfileAndMarketStats(profile : CoinProfile, stats : MarketStats) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    coinProfile := profile;
    marketStats := stats;
  };

  public query func getLatestPricePoint() : async ?PricePoint {
    if (priceHistory.size() == 0) null else ?priceHistory[priceHistory.size() - 1];
  };
};
