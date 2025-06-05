"use client";

import { PrivyProvider as Provider } from "@privy-io/react-auth";
import React, { useMemo } from "react";

import { evmChainsToViemChains } from "@repo/flame-types";
import { getEnvVariable, useConfig } from "config";
import { WALLET_CONNECT_PROJECT_ID } from "features/wallet-connect";

/**
 * PrivyProvider with values from env.
 */
export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = getEnvVariable("NEXT_PUBLIC_PRIVY_APP_ID");
  const clientId = getEnvVariable("NEXT_PUBLIC_PRIVY_CLIENT_ID");
  const { astriaChains } = useConfig();

  const supportedChains = useMemo(() => {
    return evmChainsToViemChains([
      ...Object.values(astriaChains),
    ]);
  }, [astriaChains]);

  const defaultChain = useMemo(() => {
    return supportedChains[0] ?? undefined;
  }, [supportedChains]);

  console.log("defaultChain", defaultChain);

  return (
    <Provider
      appId={appId}
      clientId={clientId}
      config={{
        // create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        appearance: {
          walletChainType: "ethereum-only",
          showWalletLoginFirst: true,
          // FIXME - is there a way to remove phantom? i don't think it works
          //  with our app.
          //  we could define an explicit list but then it wouldn't show
          //  injected wallets that aren't defined in privy e.g. keplr
          walletList: [
            "metamask",
            "wallet_connect",
            "detected_ethereum_wallets",
          ],
        },
        loginMethods: ["email", "sms", "wallet"],
        walletConnectCloudProjectId: WALLET_CONNECT_PROJECT_ID,
        // NOTE - privy provider takes Chain[], not [Chain, ...Chain[]]
        supportedChains: [...supportedChains],
        defaultChain,
      }}
    >
      {children}
    </Provider>
  );
}
