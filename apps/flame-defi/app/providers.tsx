"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets, chains } from "chain-registry";
import {
  ConfigContextProvider,
  getAllChainConfigs,
  getEnvVariable,
} from "config";
import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";

import {
  ChainId,
  cosmosChainInfosToCosmosKitAssetLists,
  cosmosChainInfosToCosmosKitChains,
  evmChainsToRainbowKitChains,
} from "@repo/flame-types";
import { CosmosWalletProvider } from "features/cosmos-wallet";
import {
  AstriaWalletContextProvider,
  EvmWalletProvider,
} from "features/evm-wallet";
import { NotificationsContextProvider } from "features/notifications";

const WALLET_CONNECT_PROJECT_ID = getEnvVariable(
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
);

const ONCHAINKIT_API_KEY = getEnvVariable("NEXT_PUBLIC_ONCHAINKIT_API_KEY");
const CDP_PROJECT_ID = getEnvVariable("NEXT_PUBLIC_CDP_PROJECT_ID");

const queryClient = new QueryClient();

// FIXME - getting chains across ALL Astria networks (dusk, dawn, mainnet)
//  so we only have to generate wagmi, rainbowKitConfig, and cosmos kit config once,
//  BUT this could be avoided if we defined these providers a level under ConfigContextProvider,
//  so the wagmi, rainbowkit, and cosmoskit providers would rerender with up to date chains
//  when the selected network (dusk, dawn, mainnet) was changed.
const { astriaChains, cosmosChains, coinbaseChains } = getAllChainConfigs();

// for the wagmi and rainbowkit config
const allEvmChains = [...astriaChains, ...coinbaseChains];
// wagmi and rainbowkit config, for evm chains
const rainbowKitConfig = getDefaultConfig({
  appName: "Flame Bridge",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: evmChainsToRainbowKitChains(allEvmChains),
});

// TODO - refactor ChainProvider to same level as the cosmos wallet context provider
//  because they are only used for Bridge
const cosmosKitChains = cosmosChainInfosToCosmosKitChains(cosmosChains);
const cosmosKitAssetLists = cosmosChainInfosToCosmosKitAssetLists(cosmosChains);

// Common providers for the entire app
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigContextProvider>
      <IntlProvider locale="en">
        <NotificationsContextProvider>
          <WagmiProvider config={rainbowKitConfig}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider initialChain={ChainId.MAINNET}>
                <ChainProvider
                  assetLists={[...assets, ...cosmosKitAssetLists]}
                  chains={[...chains, ...cosmosKitChains]}
                  wallets={[...keplrWallets, ...leapWallets]}
                  walletConnectOptions={{
                    signClient: {
                      projectId: WALLET_CONNECT_PROJECT_ID,
                    },
                  }}
                  signerOptions={{
                    preferredSignType: () => "amino",
                  }}
                  throwErrors={false}
                >
                  <OnchainKitProvider
                    apiKey={ONCHAINKIT_API_KEY}
                    projectId={CDP_PROJECT_ID}
                    chain={base}
                  >
                    <AstriaWalletContextProvider>
                      {/* Bridge specific providers moved here from bridge/layout.tsx to
                          prevent re-initialization during page navigation */}
                      <EvmWalletProvider>
                        <CosmosWalletProvider>{children}</CosmosWalletProvider>
                      </EvmWalletProvider>
                    </AstriaWalletContextProvider>
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
