import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "00000000000000000000000000000001";

// Injected/MetaMask only — avoids Reown allowlist errors on localhost.
// Set NEXT_PUBLIC_USE_WALLETCONNECT=true and add http://localhost:3000 at cloud.reown.com for full wallet list.
const useWalletConnect = process.env.NEXT_PUBLIC_USE_WALLETCONNECT === "true";

const recommendedWallets = useWalletConnect
  ? [injectedWallet, metaMaskWallet, walletConnectWallet]
  : [injectedWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: recommendedWallets,
    },
  ],
  {
    appName: "Prediction Market",
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"),
  },
  ssr: true,
});
