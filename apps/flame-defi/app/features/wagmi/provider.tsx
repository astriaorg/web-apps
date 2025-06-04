import { createConfig, WagmiProvider as Provider } from "@privy-io/wagmi";
import { ReactNode, useMemo } from "react";
import { http } from "viem";

import { evmChainsToViemChains } from "@repo/flame-types";
import { useConfig } from "config";

/**
 * Provider for Wagmi functionality
 */
export function WagmiProvider({ children }: { children: ReactNode }) {
  // could add more chain types here in the future if needed, e.g. arbitrum, optimism
  const { astriaChains, coinbaseChains } = useConfig();

  const chains = useMemo(() => {
    return evmChainsToViemChains([
      ...Object.values(astriaChains),
      ...Object.values(coinbaseChains),
    ]);
  }, [astriaChains, coinbaseChains]);

  const transports = useMemo(() => {
    return Object.fromEntries(chains.map((chain) => [chain.id, http()]));
  }, [chains]);

  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains,
      transports,
      // content from the external stores will be hydrated on the client after the initial mount
      ssr: true,
      // privy overrides this to false because privy handles the injected wallets
      multiInjectedProviderDiscovery: false,
    });
  }, [chains, transports]);

  return <Provider config={wagmiConfig}>{children}</Provider>;
}
