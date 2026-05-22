import { ethers } from "hardhat";

async function main() {
  const marketAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const PredictionMarket = await ethers.getContractAt("PredictionMarket", marketAddress);

  const provider = ethers.provider;
  const seller = new ethers.Wallet(
    "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897",
    provider
  );
  const buyer = new ethers.Wallet(
    "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
    provider
  );

  const betId = 1n;
  const price = ethers.parseEther("0.00012");

  await (await PredictionMarket.connect(seller).listPosition(betId, price)).wait();
  console.log(`Listed bet #${betId} for ${ethers.formatEther(price)} ETH`);

  await (await PredictionMarket.connect(buyer).buyPosition(betId, { value: price })).wait();
  console.log(`Buyer ${buyer.address} purchased bet #${betId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
