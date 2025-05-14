"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigContextProvider } from "config";
import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { CosmosWalletProvider } from "features/cosmos-wallet";
import { CosmosKitChainProvider } from "features/cosmos-wallet/providers/cosmos-kit";
import {
  AstriaWalletContextProvider,
  EvmWalletProvider,
} from "features/evm-wallet";
import { OnchainKitProvider } from "features/evm-wallet/providers/onchainkit";
import { WagmiRainbowKitProvider } from "features/evm-wallet/providers/wagmi-rainbowkit";
import { NotificationsContextProvider } from "features/notifications";
import { ParaClientProvider } from "features/para/providers";

// tanstack
const queryClient = new QueryClient();

// Common providers for the entire app
export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en">
      <NotificationsContextProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigContextProvider>
            <WagmiRainbowKitProvider>
              <CosmosKitChainProvider>
                <OnchainKitProvider>
                  <AstriaWalletContextProvider>
                    {/* Bridge specific providers moved here from bridge/layout.tsx to
                        prevent re-initialization during page navigation */}
                    <EvmWalletProvider>
                      <CosmosWalletProvider>{children}</CosmosWalletProvider>
                    </EvmWalletProvider>
                  </AstriaWalletContextProvider>
                </OnchainKitProvider>
              </CosmosKitChainProvider>
            </WagmiRainbowKitProvider>
          </ConfigContextProvider>
        </QueryClientProvider>
      </NotificationsContextProvider>
    </IntlProvider>
  );
}
