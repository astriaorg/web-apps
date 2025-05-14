import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { assets, chains as cosmosRegistryChains } from "chain-registry";
import { useConfig } from "config";
import { ReactNode, useMemo } from "react";

import {
  cosmosChainInfosToCosmosKitAssetLists,
  cosmosChainInfosToCosmosKitChains,
} from "@repo/flame-types";
import { WALLET_CONNECT_PROJECT_ID } from "features/evm-wallet/providers/wallet-connect";

/**
 * Provider for CosmosKit functionality
 */
export function CosmosKitChainProvider({ children }: { children: ReactNode }) {
  const { cosmosChains } = useConfig();

  const { cosmosKitChains, cosmosKitAssetLists } = useMemo(() => {
    const chainValues = Object.values(cosmosChains);
    return {
      cosmosKitChains: cosmosChainInfosToCosmosKitChains(chainValues),
      cosmosKitAssetLists: cosmosChainInfosToCosmosKitAssetLists(chainValues),
    };
  }, [cosmosChains]);

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
