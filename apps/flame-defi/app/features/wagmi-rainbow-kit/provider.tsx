import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ReactNode, useMemo } from "react";
import { http } from "viem";

import { evmChainsToRainbowKitChains } from "@repo/flame-types";
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

  // TODO - remove when removing rainbowkit
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
      transports,
      // content from the external stores will be hydrated on the client after the initial mount
      ssr: true,
      // privy overrides this to false because privy handles the injected wallets
      multiInjectedProviderDiscovery: false,
    });
  }, [chains, connectors, transports]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider initialChain={astriaChains[0]?.chainId}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
