# NEONBIT

## Current State
Admin Control Panel has tabs: Coin Details, Market Stats, Mint Tokens, Tax Settings, Security. Backend has getTopHolders, getRecentTransactions, getTransactionHistory. No unified per-user stats view exists for admin.

## Requested Changes (Diff)

### Add
- New backend query `getAllUserStats()` (admin only) returning array of UserStats: { principal, balance, totalSent, totalReceived, transferCount }
- New "User Stats" tab in Admin Control Panel showing a table: User ID (Principal), Token Holding, Total Sent, Total Received, Transfer Count
- Search/filter by Principal ID in the table

### Modify
- Backend: compute per-user stats from existing transactions + balances arrays
- Admin Control Panel: add "User Stats" tab alongside existing tabs

### Remove
- Nothing

## Implementation Plan
1. Add `getAllUserStats` query to backend (admin-only), iterating balances map and transactions to aggregate per-user stats
2. Regenerate backend bindings
3. Add User Stats tab to Admin Control Panel in frontend with sortable table, search, and copy Principal ID button
