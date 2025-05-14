import { connectorsForWallets } from "@getpara/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { getAllChainConfigs } from "config";
import { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider as Wagmi } from "wagmi";

import { ChainId, evmChainsToRainbowKitChains } from "@repo/flame-types";
import { WALLET_CONNECT_PROJECT_ID } from "features/evm-wallet/providers/wallet-connect";
import { paraWallet } from "features/para/providers/para";

// could add more chain types here in the future if needed
const { astriaChains, coinbaseChains } = getAllChainConfigs();

// rainbowkit chain type is compatible with wagmi
export const chains = evmChainsToRainbowKitChains([
  ...astriaChains,
  ...coinbaseChains,
]);

// integrating rainbowkit + para w/ wagmi
const connectors = connectorsForWallets(
  [
    {
      groupName: "Social Login",
      wallets: [paraWallet],
    },
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet],
    },
  ],
  {
    appName: "Flame Defi",
    projectId: WALLET_CONNECT_PROJECT_ID,
  },
);

// transports for each chain
// FIXME - causing issues trying to hit localhost:8545?
const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, http()]),
);

// wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  ssr: false,
  transports,
});

// Combine WagmiProvider and RainbowKitProvider
export function WagmiRainbowKitProvider({ children }: { children: ReactNode }) {
  return (
    <Wagmi config={wagmiConfig}>
      <RainbowKitProvider initialChain={ChainId.MAINNET}>
        {children}
      </RainbowKitProvider>
    </Wagmi>
  );
}
