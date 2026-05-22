# World Cup Betting — Assessment Submission

**Repository:** [https://github.com/SoftDev0125-hub/home-task-smart-contract-engineer](https://github.com/SoftDev0125-hub/home-task-smart-contract-engineer)

**Contract:** `contracts/contracts/WorldCupBetting.sol`

---

## Approach

The assessment requires a full prediction market in `WorldCupBetting.sol`, matching the behavior exercised in `test/WorldCupBetting.assessment.test.ts` (scenarios A–I).

I implemented a **pari-mutuel pool with dynamic share pricing**:

- Each bet deposits collateral (ETH or ERC20) into an outcome-specific pool.
- **Shares** are minted via `calculateShares`: early bettors on thin outcomes receive more shares relative to stake (constant-product-style logic referenced from `PredictionMarket.sol` in this repo).
- After resolution, winners claim proportional to `shares / totalWinningShares × totalPool`, minus a **2% platform fee** on the gross payout.
- Losers call `claimWinnings` to finalize reputation only (no payout).

**Key decisions:**

1. **Reuse proven patterns** — Same architecture as `PredictionMarket.sol` (read-only reference) to satisfy tests without inventing a new AMM model.
2. **OpenZeppelin guards** — `ReentrancyGuard` on ETH/ERC20 transfers; `Ownable` for fee withdrawal.
3. **Explicit revert strings** — Messages aligned with test expectations (`Too early`, `Only arbitrator`, `Market closed`, etc.).
4. **Secondary market** — Positions are bets (`betId`); listing updates a price map; `buyPosition` transfers ownership and payment peer-to-peer while the underlying shares stay tied to the bet record.

---

## Scenario B — How fees work

1. Two users bet on opposite outcomes (e.g. YES / NO) with ETH.
2. The arbitrator resolves the market to the winning outcome index.
3. The winner calls `claimWinnings(betId)`:
   - `payout = (bet.shares × getTotalPool(marketId)) / outcomeShares[winningOutcome]`
   - `fee = payout × 2 / 100`
   - `netPayout = payout - fee`
4. `fee` is added to `collectedFees[tokenAddress]` (`address(0)` for ETH).
5. The winner receives `netPayout` via `call{value: ...}`.
6. The contract **owner** calls `withdrawFees(address(0))` to pull accumulated ETH fees.

---

## Scenario G — How ownership moves

1. **fanBrazil** places a bet → receives `betId` (stored in `bets` and `userBets[fanBrazil]`).
2. **fanBrazil** calls `listPosition(betId, price)` → `positionsForSale[betId] = true`.
3. **neutralFan** calls `buyPosition(betId)` with `msg.value >= price`:
   - `bets[betId].bettor` changes from seller to **neutralFan**
   - Seller receives `price` in ETH
   - Listing flags cleared
4. Market resolves; winning outcome matches the bet’s `outcomeIndex`.
5. **neutralFan** (current `bettor`) calls `claimWinnings(betId)` and receives the net payout.

Ownership of the economic claim is **`bets[betId].bettor`**; listing does not transfer shares on-chain, only sale rights until bought.

---

## Setup and run instructions

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
cd contracts
npm install --legacy-peer-deps
```

### Compile (optional)

```bash
npx hardhat compile
```

### Run all tests

```bash
npx hardhat test
```

**Expected:** 11 passing (2 `PredictionMarket` + 9 World Cup assessment scenarios).

### Run assessment tests only

```bash
npx hardhat test test/WorldCupBetting.assessment.test.ts
```

**Expected:** 9 passing.

---

## Security notes

- **Reentrancy** — `nonReentrant` on `placeBet`, `claimWinnings`, `buyPosition`, `withdrawFees`.
- **Access control** — Only market `arbitrator` resolves; only `owner` withdraws fees; only `bettor` claims or lists their bet.
- **Time bounds** — Bets require `block.timestamp < resolutionTime`; resolution requires `block.timestamp >= resolutionTime`.
- **Slippage** — `placeBet` enforces `shares >= _minShares`.
- **ETH handling** — `msg.value` must equal stake on native markets; excess ETH refunded on `buyPosition`.
- **ERC20** — `transferFrom` on bet; `transfer` on claim; no ETH sent on token markets.

---

## Checklist (from `instructions.md`)

- [x] `WorldCupBetting.sol` implemented (stub removed)
- [x] `npx hardhat test test/WorldCupBetting.assessment.test.ts` passes
- [x] Scenarios A–I covered
- [x] Fees (B) and position ownership (G) documented above
