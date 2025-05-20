"use client";

import { PrivyProvider as Provider } from "@privy-io/react-auth";
import React from "react";

import { getEnvVariable } from "config";

/**
 * PrivyProvider with values from env.
 */
export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = getEnvVariable("NEXT_PUBLIC_PRIVY_APP_ID");
  const clientId = getEnvVariable("NEXT_PUBLIC_PRIVY_CLIENT_ID");
  return (
    <Provider
      appId={appId}
      clientId={clientId}
      config={{
        // create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </Provider>
  );
}
