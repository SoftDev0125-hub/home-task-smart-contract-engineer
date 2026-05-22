import { ethers } from "hardhat";

/**
 * README Step 6 — on-chain equivalent (Account #0 = MetaMask test account).
 * UI/MetaMask connect must be done manually in the browser.
 */
async function main() {
  const [account0, account1] = await ethers.getSigners();
  const marketAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const pm = await ethers.getContractAt("PredictionMarket", marketAddress);

  console.log("6.1 Wallet (Account #0):", account0.address);

  const resolutionTime = Math.floor(Date.now() / 1000) + 600;
  const createTx = await pm.connect(account0).createMarket(
    "Will ETH reach $5000 by end of 2026?",
    "Resolves yes if ETH spot exceeds $5000 on any major exchange before 2027.",
    ["Yes", "No"],
    resolutionTime,
    account0.address,
    ethers.ZeroAddress
  );
  await createTx.wait();
  const marketId = await pm.marketCount();
  console.log("6.2 Market created — ID:", marketId.toString());

  const betAmount = ethers.parseEther("0.01");
  const betTx = await pm.connect(account0).placeBet(marketId, 0, betAmount, 0, { value: betAmount });
  await betTx.wait();
  const betId = await pm.betCount();
  console.log("6.3 Bet placed — ID:", betId.toString(), "| 0.01 ETH on Yes");

  const listPrice = ethers.parseEther("0.005");
  await (await pm.connect(account0).listPosition(betId, listPrice)).wait();
  console.log("6.4a Listed for sale —", ethers.formatEther(listPrice), "ETH");

  await (await pm.connect(account1).buyPosition(betId, { value: listPrice })).wait();
  console.log("6.4b Bought by Account #1:", account1.address);

  console.log("\nStep 6 on-chain flows complete. View at http://localhost:3000/markets/" + marketId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
