# NEONBIT

## Current State
Admin claim works once. If admin was claimed before with a different principal, user sees no-privileges error with no recovery path.

## Requested Changes (Diff)

### Add
- resetAndClaimAdmin() backend function: clears admin state and claims for caller
- Recovery UI in AdminPanel when adminClaimed=true but isAdmin=false

### Modify  
- AdminPanel: show Reset & Reclaim Admin button in no-privileges block

### Remove
Nothing.

## Implementation Plan
1. Add resetAndClaimAdmin() to main.mo
2. Add useResetAndClaimAdmin mutation hook
3. Update AdminPanel recovery section
