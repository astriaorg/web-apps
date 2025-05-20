"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { ConfigContextProvider } from "config";
import { CosmosKitProvider } from "features/cosmos-kit";
import { CosmosWalletProvider } from "features/cosmos-wallet";
import {
  AstriaWalletContextProvider,
  EvmWalletProvider,
} from "features/evm-wallet";
import { NotificationsContextProvider } from "features/notifications";
import { OnchainKitProvider } from "features/onchain-kit";
import { PrivyProvider, PrivyWalletProvider } from "features/privy";
import { WagmiProvider } from "features/wagmi";

// tanstack
const queryClient = new QueryClient();

// Common providers for the entire app
export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en">
      <NotificationsContextProvider>
        <ConfigContextProvider>
          <PrivyProvider>
            <QueryClientProvider client={queryClient}>
              <WagmiProvider>
                <CosmosKitProvider>
                  <OnchainKitProvider>
                    <AstriaWalletContextProvider>
                      {/* Bridge specific providers moved here from bridge/layout.tsx to
                          prevent re-initialization during page navigation */}
                      <EvmWalletProvider>
                        <PrivyWalletProvider>
                          <CosmosWalletProvider>
                            {children}
                          </CosmosWalletProvider>
                        </PrivyWalletProvider>
                      </EvmWalletProvider>
                    </AstriaWalletContextProvider>
                  </OnchainKitProvider>
                </CosmosKitProvider>
              </WagmiProvider>
            </QueryClientProvider>
          </PrivyProvider>
        </ConfigContextProvider>
      </NotificationsContextProvider>
    </IntlProvider>
  );
}
