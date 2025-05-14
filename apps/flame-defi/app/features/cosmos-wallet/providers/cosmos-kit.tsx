import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { assets, chains as cosmosRegistryChains } from "chain-registry";
import { getAllChainConfigs } from "config";
import { ReactNode } from "react";

import {
  cosmosChainInfosToCosmosKitAssetLists,
  cosmosChainInfosToCosmosKitChains,
} from "@repo/flame-types";
import { WALLET_CONNECT_PROJECT_ID } from "features/evm-wallet/providers/wallet-connect";

// Get cosmos chains from app config
const { cosmosChains } = getAllChainConfigs();

// Convert to cosmos-kit compatible format
export const cosmosKitChains = cosmosChainInfosToCosmosKitChains(cosmosChains);
export const cosmosKitAssetLists =
  cosmosChainInfosToCosmosKitAssetLists(cosmosChains);

// Export the ChainProvider component
export function CosmosKitChainProvider({ children }: { children: ReactNode }) {
  return (
    <ChainProvider
      assetLists={[...assets, ...cosmosKitAssetLists]}
      chains={[...cosmosRegistryChains, ...cosmosKitChains]}
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
      {children}
    </ChainProvider>
  );
}
