# Rather Labs — Home Task Submission

**Candidate:** Abel  
**Repository:** https://github.com/SoftDev0125-hub/home-task-smart-contract-engineer  
**Implementation:** `contracts/contracts/WorldCupBetting.sol`

---

## Brief explanation — approach and key decisions

I implemented `WorldCupBetting.sol` as a **pari-mutuel prediction market** supporting binary and multi-outcome events (e.g. 1X2 match results), with **ETH or ERC20** collateral.

### How it works

1. **Create market** — Creator sets question, outcomes, resolution time, arbitrator, and token (`address(0)` = ETH).
2. **Place bet** — Users stake on an outcome; collateral enters that outcome’s pool; the contract mints **shares** via `calculateShares` (more shares when betting into a smaller pool).
3. **Resolve** — Only the market **arbitrator** may resolve after `resolutionTime`.
4. **Claim** — Winners receive `(shares / totalWinningShares) × totalPool` minus a **2% platform fee**. Losers call `claimWinnings` to record reputation only.
5. **Trade positions** — Before resolution, a bettor can **list** a position; another user **buys** it, becoming the new `bettor` and paying the seller directly.

### Key decisions

| Decision | Rationale |
|----------|-----------|
| Pari-mutuel + dynamic shares | Fair pool-based payouts; matches assessment scenarios and in-repo reference design |
| 2% fee on gross winning payout | Required by tests; tracked per token in `collectedFees`, withdrawn by owner |
| OpenZeppelin `ReentrancyGuard` + `Ownable` | Protect ETH/ERC20 transfers; restrict fee withdrawal |
| Explicit revert messages | Tests assert exact strings (`Too early`, `Only arbitrator`, `Market closed`, etc.) |
| Reference `PredictionMarket.sol` (read-only) | Proven patterns; keeps solution simple and correct without over-engineering |

### Security highlights

- `nonReentrant` on functions that move value  
- Bets only while `block.timestamp < resolutionTime`  
- Slippage protection: `placeBet(..., minShares)`  
- Access control: arbitrator resolves, owner withdraws fees, only bet owner lists/claims  

---

## Setup and run instructions

### Prerequisites

- **Node.js** 18 or later  
- **npm**

### 1. Clone and install

```bash
git clone https://github.com/SoftDev0125-hub/home-task-smart-contract-engineer.git
cd home-task-smart-contract-engineer/contracts
npm install --legacy-peer-deps
```

> Use `--legacy-peer-deps` if npm reports a `chai` peer dependency conflict.

### 2. Compile (optional)

```bash
npx hardhat compile
```

### 3. Run tests

**Full suite:**

```bash
npx hardhat test
```

**Expected:** `11 passing` (9 World Cup assessment scenarios + 2 `PredictionMarket` tests).

**Assessment only:**

```bash
npx hardhat test test/WorldCupBetting.assessment.test.ts
```

**Expected:** `9 passing`.

---

## Assessment coverage (scenarios A–I)

| Scenario | Verified behavior |
|----------|-------------------|
| A | Three-outcome (1X2) market create & resolve |
| B | Winner paid net of 2% fee; owner withdraws fees |
| C | Cannot resolve before `resolutionTime` |
| D | Only arbitrator can resolve |
| E | No bets at/after resolution time |
| F | Slippage (`minShares`) enforced |
| G | List position → buy → buyer claims winnings |
| H | Full lifecycle with ERC20 collateral |
| I | Loser claims for reputation; no double claim |

---

## Additional documentation

- Task spec: `assessment/instructions.md`  
- Extended write-up: `assessment/SUBMISSION.md`
