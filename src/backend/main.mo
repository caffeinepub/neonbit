import Array "mo:core/Array";
import Float "mo:core/Float";
import VarArray "mo:core/VarArray";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func claimInitialAdmin() : async () {
    if (caller.isAnonymous()) Runtime.trap("Must be logged in");
    accessControlState.userRoles.clear();
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  public shared ({ caller }) func registerUser() : async () {
    if (caller.isAnonymous()) Runtime.trap("Must be logged in");
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (_) {
        accessControlState.userRoles.add(caller, #user);
      };
    };
  };

  public query func hasAdminBeenClaimed() : async Bool {
    accessControlState.adminAssigned;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type CoinProfile = { name : Text; symbol : Text; description : Text; logoUrl : Text };
  type MarketStats = { currentPrice : Float; marketCap : Float; circulatingSupply : Float; totalSupply : Float; volume24h : Float; allTimeHigh : Float; priceChange24h : Float };
  type PricePoint = { timestamp : Int; price : Float };

  type Transaction = { id : Nat; from : Principal; to : Principal; amount : Nat; timestamp : Int; memo : Text };

  type UserStats = {
    principal : Principal;
    balance : Nat;
    totalSent : Nat;
    totalReceived : Nat;
    transferCount : Nat;
  };

  // Marketplace types
  type ListingStatus = { #Open; #Pending; #Completed; #Cancelled };

  type Listing = {
    id : Nat;
    seller : Principal;
    buyer : ?Principal;
    amount : Nat;       // DR tokens (in e8s)
    priceICP : Float;   // Price in ICP
    status : ListingStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  let balances = Map.empty<Principal, Nat>();
  var totalMinted = 0;
  var nextTxId = 0;
  var transactions : [Transaction] = [];

  // Marketplace state
  var listings : [Listing] = [];
  var nextListingId = 0;
  let escrowAccount = Principal.fromText("2vxsx-fae"); // placeholder, escrow tracked by listing
  let escrowBalances = Map.empty<Nat, Nat>(); // listingId -> escrowed DR amount

  var taxAccount : ?Principal = null;
  let TAX_PERCENT = 3;

  let FIXED_TOTAL_SUPPLY : Float = 1_000_000_000.0;
  let FIXED_TOTAL_SUPPLY_E8S = 1_000_000_000 * 100_000_000;

  var coinProfile : CoinProfile = {
    name = "@dr";
    symbol = "DR";
    description = "@dr is a limited-supply AI-powered coin with a fixed total of 1 Billion DR coins. Built on BTC, ETH, SOL infrastructure with AI-driven technology.";
    logoUrl = "https://cdn.zuesser.com/neonbit/logo/favicon.png";
  };

  var marketStats : MarketStats = {
    currentPrice = 0.00125;
    marketCap = 1_250_000.0;
    circulatingSupply = 1_000_000_000.0;
    totalSupply = 1_000_000_000.0;
    volume24h = 50_000.0;
    allTimeHigh = 0.0025;
    priceChange24h = -0.05;
  };
  var priceHistory : [PricePoint] = [];
  let maxHistoryPoints = 200;
  let maxTransactions = 1000;

  public shared ({ caller }) func updateCoinProfile(profile : CoinProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    coinProfile := profile;
  };

  public shared ({ caller }) func updateMarketStats(stats : MarketStats) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let enforcedStats : MarketStats = {
      currentPrice = stats.currentPrice;
      marketCap = stats.marketCap;
      circulatingSupply = Float.min(stats.circulatingSupply, FIXED_TOTAL_SUPPLY);
      totalSupply = FIXED_TOTAL_SUPPLY;
      volume24h = stats.volume24h;
      allTimeHigh = stats.allTimeHigh;
      priceChange24h = stats.priceChange24h;
    };
    marketStats := enforcedStats;
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

  public query func getFixedTotalSupplyNat() : async Nat { FIXED_TOTAL_SUPPLY_E8S };
  public query func getFixedTotalSupply() : async Float { FIXED_TOTAL_SUPPLY };

  public shared ({ caller }) func clearPriceHistory() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    priceHistory := [];
  };

  public shared ({ caller }) func updateCoinProfileAndMarketStats(profile : CoinProfile, stats : MarketStats) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    coinProfile := profile;
    let enforcedStats : MarketStats = {
      currentPrice = stats.currentPrice;
      marketCap = stats.marketCap;
      circulatingSupply = Float.min(stats.circulatingSupply, FIXED_TOTAL_SUPPLY);
      totalSupply = FIXED_TOTAL_SUPPLY;
      volume24h = stats.volume24h;
      allTimeHigh = stats.allTimeHigh;
      priceChange24h = stats.priceChange24h;
    };
    marketStats := enforcedStats;
  };

  public query func getLatestPricePoint() : async ?PricePoint {
    if (priceHistory.size() == 0) null else ?priceHistory[priceHistory.size() - 1];
  };

  public shared ({ caller }) func setTaxAccount(account : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    taxAccount := ?account;
  };

  public query func getTaxAccount() : async ?Principal {
    taxAccount;
  };

  public shared ({ caller }) func mintTokens(to : Principal, amount : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    if (amount == 0) Runtime.trap("Amount must be greater than 0");
    if (totalMinted + amount > FIXED_TOTAL_SUPPLY_E8S) Runtime.trap("Exceeds total supply");

    let currentBalance = switch (balances.get(to)) { case (null) { 0 }; case (?b) { b } };
    balances.add(to, currentBalance + amount);
    totalMinted += amount;

    let tx : Transaction = {
      id = nextTxId;
      from = Principal.fromText("2vxsx-fae");
      to;
      amount;
      timestamp = Time.now();
      memo = "Mint";
    };
    nextTxId += 1;
    addTransaction(tx);
  };

  public shared ({ caller }) func transfer(to : Principal, amount : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can transfer tokens");
    };
    if (amount == 0) Runtime.trap("Amount must be greater than 0");

    let senderBalance = switch (balances.get(caller)) {
      case (null) { 0 };
      case (?b) { b };
    };

    if (senderBalance < amount) Runtime.trap("Insufficient balance");

    let taxAmount = (amount * TAX_PERCENT) / 100;
    let receiverAmount = amount - taxAmount;

    balances.add(caller, senderBalance - amount);

    let receiverBalance = switch (balances.get(to)) {
      case (null) { 0 };
      case (?b) { b };
    };
    balances.add(to, receiverBalance + receiverAmount);

    switch (taxAccount) {
      case (?taxAddr) {
        if (taxAmount > 0) {
          let taxBalance = switch (balances.get(taxAddr)) {
            case (null) { 0 };
            case (?b) { b };
          };
          balances.add(taxAddr, taxBalance + taxAmount);

          let taxTx : Transaction = {
            id = nextTxId;
            from = caller;
            to = taxAddr;
            amount = taxAmount;
            timestamp = Time.now();
            memo = "Tax (3%)";
          };
          nextTxId += 1;
          addTransaction(taxTx);
        };
      };
      case (null) {};
    };

    let tx : Transaction = {
      id = nextTxId;
      from = caller;
      to;
      amount = receiverAmount;
      timestamp = Time.now();
      memo = "Transfer (after 3% tax)";
    };
    nextTxId += 1;
    addTransaction(tx);
  };

  public query ({ caller }) func getBalance(principal : Principal) : async Nat {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (balances.get(principal)) {
      case (null) { 0 };
      case (?b) { b };
    };
  };

  public query ({ caller }) func getCallerBalance() : async Nat {
    switch (balances.get(caller)) {
      case (null) { 0 };
      case (?b) { b };
    };
  };

  public query ({ caller }) func getTotalMinted() : async Nat {
    ignore caller;
    totalMinted;
  };

  public query ({ caller }) func getTransactionHistory(principal : Principal) : async [Transaction] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let filtered = transactions.filter(
      func(tx) { tx.from == principal or tx.to == principal }
    );
    let size = Nat.min(50, filtered.size());
    if (size == 0) return [];
    if (size >= filtered.size()) {
      // Defensive check to prevent out-of-bounds
      if (size > filtered.size()) {
        return [];
      };
      return filtered;
    };
    if (filtered.size() - size >= filtered.size()) { return [] };
    filtered.sliceToArray(filtered.size() - size, filtered.size());
  };

  public query ({ caller }) func getRecentTransactions() : async [Transaction] {
    ignore caller;
    let size = Nat.min(20, transactions.size());
    if (size == 0) return [];
    if (size >= transactions.size()) {
      // Defensive check to prevent out-of-bounds
      if (size > transactions.size()) {
        return [];
      };
      return transactions;
    };
    if (transactions.size() - size >= transactions.size()) { return [] };
    transactions.sliceToArray(transactions.size() - size, transactions.size());
  };

  public query ({ caller }) func getTopHolders(limit : Nat) : async [(Principal, Nat)] {
    ignore caller;
    let sorted = balances.toArray().sort(
      func(a, b) { Nat.compare(b.1, a.1) }
    );
    let size = Nat.min(Nat.min(limit, 100), sorted.size());
    if (size == 0) return [];
    if (size >= sorted.size()) {
      // Defensive check to prevent out-of-bounds
      if (size > sorted.size()) {
        return [];
      };
      return sorted;
    };
    sorted.sliceToArray(0, size);
  };

  public query ({ caller }) func getAllUserStats() : async [UserStats] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };

    let balanceArray = balances.toArray();
    let allStats = balanceArray.map(
      func((principal, balance)) {
        let userTxs = transactions.filter(
          func(tx) { tx.from == principal or tx.to == principal }
        );
        var totalSent = 0;
        var totalReceived = 0;
        let transferCount = userTxs.size();

        let transferTxs = userTxs.filter(
          func(tx) { tx.memo != "Mint" and tx.memo != "Tax (3%)" }
        );

        for (tx in transferTxs.values()) {
          if (tx.from == principal) {
            totalSent += tx.amount;
          } else if (tx.to == principal) {
            totalReceived += tx.amount;
          };
        };

        {
          principal;
          balance;
          totalSent;
          totalReceived;
          transferCount;
        };
      }
    );

    allStats;
  };

  // ===== MARKETPLACE FUNCTIONS =====

  // Create a sell listing -- locks DR tokens from seller's balance
  public shared ({ caller }) func createListing(amount : Nat, priceICP : Float) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    if (amount == 0) Runtime.trap("Amount must be greater than 0");
    if (priceICP <= 0.0) Runtime.trap("Price must be greater than 0");

    let sellerBalance = switch (balances.get(caller)) {
      case (null) { 0 };
      case (?b) { b };
    };
    if (sellerBalance < amount) Runtime.trap("Insufficient DR balance");

    // Lock DR tokens from seller
    balances.add(caller, sellerBalance - amount);
    escrowBalances.add(nextListingId, amount);

    let listing : Listing = {
      id = nextListingId;
      seller = caller;
      buyer = null;
      amount;
      priceICP;
      status = #Open;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    listings := listings.concat([listing]);
    let id = nextListingId;
    nextListingId += 1;
    id;
  };

  // Buyer initiates purchase -- marks listing as Pending
  public shared ({ caller }) func initiatePurchase(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can initiate purchases");
    };

    var found = false;
    listings := listings.map(func(l : Listing) : Listing {
      if (l.id == listingId) {
        if (l.status != #Open) Runtime.trap("Listing is not open");
        if (l.seller == caller) Runtime.trap("Cannot buy your own listing");
        found := true;
        { l with buyer = ?caller; status = #Pending; updatedAt = Time.now() };
      } else { l };
    });
    if (not found) Runtime.trap("Listing not found");
  };

  // Seller confirms ICP payment received -- releases DR to buyer
  public shared ({ caller }) func confirmSale(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can confirm sales");
    };

    var buyerOpt : ?Principal = null;
    var foundAndValid = false;

    listings := listings.map(func(l : Listing) : Listing {
      if (l.id == listingId) {
        if (l.seller != caller) Runtime.trap("Only seller can confirm");
        if (l.status != #Pending) Runtime.trap("Listing not in Pending state");
        buyerOpt := l.buyer;
        foundAndValid := true;
        { l with status = #Completed; updatedAt = Time.now() };
      } else { l };
    });

    if (not foundAndValid) Runtime.trap("Listing not found or unauthorized");

    switch (buyerOpt) {
      case (?buyer) {
        let escrowed = switch (escrowBalances.get(listingId)) {
          case (null) { 0 };
          case (?b) { b };
        };
        let buyerBalance = switch (balances.get(buyer)) {
          case (null) { 0 };
          case (?b) { b };
        };
        balances.add(buyer, buyerBalance + escrowed);
        escrowBalances.add(listingId, 0);
      };
      case (null) { Runtime.trap("No buyer assigned") };
    };

    let completedListingOpt = listings.find(func(l : Listing) : Bool { l.id == listingId });
    switch (completedListingOpt) {
      case (?listing) {
        if (listing.amount > 0) {
          let drAmount : Float = listing.amount.toFloat() / 100_000_000.0;
          let newPrice : Float = listing.priceICP / drAmount;
          let oldPrice : Float = marketStats.currentPrice;
          let priceChange : Float = if (oldPrice > 0.0) { (newPrice - oldPrice) / oldPrice } else { 0.0 };
          let newATH : Float = if (newPrice > marketStats.allTimeHigh) newPrice else marketStats.allTimeHigh;
          let newVolume = marketStats.volume24h + listing.priceICP;
          marketStats := {
            currentPrice = newPrice;
            marketCap = newPrice * FIXED_TOTAL_SUPPLY;
            circulatingSupply = marketStats.circulatingSupply;
            totalSupply = FIXED_TOTAL_SUPPLY;
            volume24h = newVolume;
            allTimeHigh = newATH;
            priceChange24h = priceChange;
          };
          let newPoint : PricePoint = { timestamp = Time.now(); price = newPrice };
          if (priceHistory.size() >= maxHistoryPoints) {
            priceHistory := Array.tabulate<PricePoint>(priceHistory.size() - 1, func(i : Nat) : PricePoint { priceHistory[i + 1] });
          };
          priceHistory := priceHistory.concat([newPoint]);
        };
      };
      case (null) {};
    };
  };

  // Cancel a listing -- returns DR to seller
  public shared ({ caller }) func cancelListing(listingId : Nat) : async () {
    var sellerPrincipal : ?Principal = null;
    var validCancel = false;

    listings := listings.map(func(l : Listing) : Listing {
      if (l.id == listingId) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        let isSeller = l.seller == caller;
        
        if (isSeller and not AccessControl.hasPermission(accessControlState, caller, #user)) {
          Runtime.trap("Unauthorized: Only users can cancel listings");
        };
        
        if (not isSeller and not isAdmin) {
          Runtime.trap("Unauthorized: Only seller or admin can cancel");
        };
        
        if (l.status == #Completed or l.status == #Cancelled) {
          Runtime.trap("Cannot cancel a completed or already cancelled listing");
        };
        
        sellerPrincipal := ?l.seller;
        validCancel := true;
        { l with status = #Cancelled; updatedAt = Time.now() };
      } else { l };
    });

    if (not validCancel) Runtime.trap("Listing not found or unauthorized");

    switch (sellerPrincipal) {
      case (?seller) {
        let escrowed = switch (escrowBalances.get(listingId)) {
          case (null) { 0 };
          case (?b) { b };
        };
        let sellerBalance = switch (balances.get(seller)) {
          case (null) { 0 };
          case (?b) { b };
        };
        balances.add(seller, sellerBalance + escrowed);
        escrowBalances.add(listingId, 0);
      };
      case (null) {};
    };
  };

  // Admin force-resolve: release to buyer or return to seller
  public shared ({ caller }) func adminResolve(listingId : Nat, releaseToBuyer : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    var targetPrincipal : ?Principal = null;

    listings := listings.map(func(l : Listing) : Listing {
      if (l.id == listingId) {
        if (l.status == #Completed or l.status == #Cancelled) Runtime.trap("Already resolved");
        targetPrincipal := if (releaseToBuyer) { l.buyer } else { ?l.seller };
        { l with status = if (releaseToBuyer) { #Completed } else { #Cancelled }; updatedAt = Time.now() };
      } else { l };
    });

    switch (targetPrincipal) {
      case (?target) {
        let escrowed = switch (escrowBalances.get(listingId)) {
          case (null) { 0 };
          case (?b) { b };
        };
        let targetBalance = switch (balances.get(target)) {
          case (null) { 0 };
          case (?b) { b };
        };
        balances.add(target, targetBalance + escrowed);
        escrowBalances.add(listingId, 0);
      };
      case (null) { Runtime.trap("No target principal") };
    };
  };

  // Get all listings (public)
  public query func getListings() : async [Listing] {
    listings;
  };

  // Get listings for a specific seller
  public query ({ caller }) func getMyListings() : async [Listing] {
    listings.filter(func(l : Listing) : Bool { l.seller == caller });
  };

  func addTransaction(tx : Transaction) {
    let currentSize = transactions.size();
    if (currentSize >= maxTransactions) {
      let trimmed = VarArray.tabulate<Transaction>(currentSize - 1, func(i) { transactions[i + 1] }).toArray();
      transactions := trimmed.concat([tx]);
    } else {
      transactions := transactions.concat([tx]);
    };
  };
};
