"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  // TODO - values from config
  return (
    <PrivyProvider
      appId="cmaog1m900046id0mzm9wzk8x"
      clientId="client-WY6LJbDNcnWpoxCb6PwA8JS1mhxtPbWW24Qp2LMjF5fWz"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
