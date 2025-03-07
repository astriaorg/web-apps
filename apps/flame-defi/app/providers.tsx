"use client";

import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { IntlProvider } from "@repo/libs/react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets, chains } from "chain-registry";
import { WagmiProvider } from "wagmi";

import {
  cosmosChainInfosToCosmosKitAssetLists,
  cosmosChainInfosToCosmosKitChains,
  evmChainsToRainbowKitChains,
} from "@repo/flame-types";
import {
  ConfigContextProvider,
  getAllChainConfigs,
  getEnvVariable,
} from "./config";
import { CosmosWalletProvider } from "./features/cosmos-wallet";
import { EvmWalletProvider } from "./features/evm-wallet";
import { NotificationsContextProvider } from "./features/notifications";

const WALLET_CONNECT_PROJECT_ID = getEnvVariable(
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const { evmChains, cosmosChains } = getAllChainConfigs();

  // wagmi and rainbowkit config, for evm chains
  const rainbowKitConfig = getDefaultConfig({
    appName: "Flame Bridge",
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: evmChainsToRainbowKitChains(evmChains),
  });

  // cosmoskit config
  const cosmosWalletConnectOptions = {
    signClient: {
      projectId: WALLET_CONNECT_PROJECT_ID,
    },
  };

  const cosmosKitChains = cosmosChainInfosToCosmosKitChains(cosmosChains);
  const cosmosKitAssetLists =
    cosmosChainInfosToCosmosKitAssetLists(cosmosChains);

  return (
    <ConfigContextProvider>
      <IntlProvider locale="en">
        <NotificationsContextProvider>
          <WagmiProvider config={rainbowKitConfig}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <ChainProvider
                  assetLists={[...assets, ...cosmosKitAssetLists]}
                  chains={[...chains, ...cosmosKitChains]}
                  wallets={[...keplrWallets, ...leapWallets]}
                  walletConnectOptions={cosmosWalletConnectOptions}
                  signerOptions={{
                    preferredSignType: () => {
                      return "amino";
                    },
                  }}
                >
                  <CosmosWalletProvider>
                    <EvmWalletProvider>{children}</EvmWalletProvider>
                  </CosmosWalletProvider>
                </ChainProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </NotificationsContextProvider>
      </IntlProvider>
    </ConfigContextProvider>
  );
}
