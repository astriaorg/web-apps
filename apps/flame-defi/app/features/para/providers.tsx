import {
  coinbaseWallet,
  metaMaskWallet,
  ParaEvmProvider,
  walletConnectWallet,
} from "@getpara/evm-wallet-connectors";
import { ParaModal, ParaProvider } from "@getpara/react-sdk";
import { ReactNode, useMemo, useState } from "react";

import { evmChainsToRainbowKitChains } from "@repo/flame-types";
import { useConfig } from "config";
import { WALLET_CONNECT_PROJECT_ID } from "features/evm-wallet/providers/wallet-connect";
import { para, PARA_API_KEY, PARA_ENV } from "features/para/client";

/**
 * Provider for Para functionality
 */
export function ParaClientProvider({ children }: { children: ReactNode }) {
  const { astriaChains, coinbaseChains } = useConfig();

  const chains = useMemo(() => {
    return evmChainsToRainbowKitChains([
      ...Object.values(astriaChains),
      ...Object.values(coinbaseChains),
    ]);
  }, [astriaChains, coinbaseChains]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ParaProvider
      paraClientConfig={{
        env: PARA_ENV,
        apiKey: PARA_API_KEY,
      }}
      config={undefined}
    >
      <ParaEvmProvider
        config={{
          projectId: WALLET_CONNECT_PROJECT_ID,
          appName: "Flame Defi",
          chains,
          wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
          para,
        }}
      >
        <ParaModal
          isOpen={true}
          onClose={closeModal}
          externalWallets={[
            // EVM wallets
            "METAMASK",
            "COINBASE",
            // Cosmos wallets
            // "KEPLR",
            // "LEAP",
          ]}
          para={para}
        />
        {children}
      </ParaEvmProvider>
    </ParaProvider>
  );
}
