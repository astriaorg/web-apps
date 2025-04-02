"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets, chains } from "chain-registry";
import { IntlProvider } from "react-intl";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";

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
import { CoinbaseWalletProvider } from "./features/coinbase-wallet";
import { CosmosWalletProvider } from "./features/cosmos-wallet";
import { EvmWalletProvider } from "./features/evm-wallet";
import { NotificationsContextProvider } from "./features/notifications";

const WALLET_CONNECT_PROJECT_ID = getEnvVariable(
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
);

const ONCHAINKIT_API_KEY = getEnvVariable("NEXT_PUBLIC_ONCHAINKIT_API_KEY");
const CDP_PROJECT_ID = getEnvVariable("NEXT_PUBLIC_CDP_PROJECT_ID");

const queryClient = new QueryClient();

const { evmChains, cosmosChains } = getAllChainConfigs();

// wagmi and rainbowkit config, for evm chains
const rainbowKitConfig = getDefaultConfig({
  appName: "Flame Bridge",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: evmChainsToRainbowKitChains(evmChains),
});

const cosmosKitChains = cosmosChainInfosToCosmosKitChains(cosmosChains);
const cosmosKitAssetLists = cosmosChainInfosToCosmosKitAssetLists(cosmosChains);

export function Providers({ children }: { children: React.ReactNode }) {
  // cosmoskit config
  const cosmosWalletConnectOptions = {
    signClient: {
      projectId: WALLET_CONNECT_PROJECT_ID,
    },
  };

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
                  <OnchainKitProvider
                    apiKey={ONCHAINKIT_API_KEY}
                    projectId={CDP_PROJECT_ID}
                    chain={base}
                  >
                    <CosmosWalletProvider>
                      <EvmWalletProvider>
                        <CoinbaseWalletProvider>
                          {children}
                        </CoinbaseWalletProvider>
                      </EvmWalletProvider>
                    </CosmosWalletProvider>
                  </OnchainKitProvider>
                </ChainProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </NotificationsContextProvider>
      </IntlProvider>
    </ConfigContextProvider>
  );
}
