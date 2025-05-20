import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ReactNode, useMemo } from "react";
import { http } from "viem";

import { ChainId, evmChainsToRainbowKitChains } from "@repo/flame-types";
import { useConfig } from "config";
import { WALLET_CONNECT_PROJECT_ID } from "features/wallet-connect";

/**
 * Provider for Wagmi and RainbowKit functionality
 */
export function WagmiRainbowKitProvider({ children }: { children: ReactNode }) {
  // could add more chain types here in the future if needed, e.g. arbitrum, optimism
  const { astriaChains, coinbaseChains } = useConfig();

  const chains = useMemo(() => {
    return evmChainsToRainbowKitChains([
      ...Object.values(astriaChains),
      ...Object.values(coinbaseChains),
    ]);
  }, [astriaChains, coinbaseChains]);

  const connectors = useMemo(() => {
    return connectorsForWallets(
      [
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
  }, []);

  const transports = useMemo(() => {
    return Object.fromEntries(chains.map((chain) => [chain.id, http()]));
  }, [chains]);

  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains,
      connectors,
      ssr: false,
      transports,
    });
  }, [chains, connectors, transports]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider initialChain={ChainId.MAINNET}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
