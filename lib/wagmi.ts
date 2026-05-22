import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const chain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 11155111 ? sepolia : hardhat;

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

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

export const config = createConfig({
  connectors,
  chains: [chain],
  transports: {
    [hardhat.id]: http(
      chain.id === hardhat.id ? (rpcUrl ?? "http://127.0.0.1:8545") : "http://127.0.0.1:8545"
    ),
    [sepolia.id]: http(
      chain.id === sepolia.id ? (rpcUrl ?? sepolia.rpcUrls.default.http[0]) : sepolia.rpcUrls.default.http[0]
    ),
  },
  ssr: true,
});
