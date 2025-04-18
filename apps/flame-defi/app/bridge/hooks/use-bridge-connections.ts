"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { useEvmWallet } from "features/evm-wallet/hooks/use-evm-wallet";
import { useCosmosWallet } from "features/cosmos-wallet/hooks/use-cosmos-wallet";

export interface ChainConnection {
  chain: EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
  isConnected: boolean;
}

export interface BridgeConnections {
  // Chain connections
  sourceConnection: ChainConnection;
  destinationConnection: ChainConnection;

  // Connection management
  connectSource: (chain: CosmosChainInfo | EvmChainInfo) => void;
  connectDestination: (chain: CosmosChainInfo | EvmChainInfo) => void;

  // Currency selection
  setSourceCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
  setDestinationCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;

  // Manual destination address management
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  isManualAddressMode: boolean;
  enableManualAddressMode: () => void;
  disableManualAddressMode: () => void;

  // Status
  isSourceConnecting: boolean;
  isDestinationConnecting: boolean;

  // Validation
  areConnectionsValid: boolean;
  areCurrenciesValid: boolean;

  // Access to wallet contexts (for compatibility with current implementation)
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
}

export function useBridgeConnections(): BridgeConnections {
  // Access all wallet contexts
  const evmWallet = useEvmWallet();
  const cosmosWallet = useCosmosWallet();

  // Connection state
  const [sourceConnection, setSourceConnection] = useState<ChainConnection>({
    chain: null,
    currency: null,
    address: null,
    isConnected: false,
  });

  const [destinationConnection, setDestinationConnection] =
    useState<ChainConnection>({
      chain: null,
      currency: null,
      address: null,
      isConnected: false,
    });

  // Manual address mode
  const [isManualAddressMode, setIsManualAddressMode] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");

  // Loading states
  const [isSourceConnecting, setIsSourceConnecting] = useState(false);
  const [isDestinationConnecting, setIsDestinationConnecting] = useState(false);

  // Handle source chain connection
  const connectSource = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo) => {
      // Skip if already connecting to avoid infinite loops
      if (isSourceConnecting) {
        console.log("Already connecting source, skipping");
        return;
      }

      setIsSourceConnecting(true);

      // Determine connection details up front
      let address = null;
      let isConnected = false;
      let needsWalletConnection = false;

      if (chain.chainType === ChainType.COSMOS) {
        // Connect Cosmos wallet
        cosmosWallet.selectCosmosChain(chain as CosmosChainInfo);

        if (cosmosWallet.cosmosAccountAddress) {
          address = cosmosWallet.cosmosAccountAddress;
          isConnected = true;
        } else {
          needsWalletConnection = true;
        }
      } else if (
        chain.chainType === ChainType.EVM ||
        chain.chainType === ChainType.ASTRIA
      ) {
        if (
          evmWallet.evmAccountAddress &&
          evmWallet.selectedEvmChain?.chainId === chain.chainId
        ) {
          address = evmWallet.evmAccountAddress;
          isConnected = true;
        } else {
          needsWalletConnection = true;
        }
      }

      // Always update the chain selection first
      setSourceConnection((prev) => ({
        ...prev,
        chain,
        address,
        isConnected,
      }));

      // After setting state, initiate wallet connection if needed
      if (needsWalletConnection) {
        if (chain.chainType === ChainType.COSMOS) {
          cosmosWallet.connectCosmosWallet();
        } else {
          evmWallet.connectToSpecificChain(chain.chainId);
        }
      }

      setIsSourceConnecting(false);
    },
    [isSourceConnecting, cosmosWallet, evmWallet],
  );

  // Handle destination chain connection
  const connectDestination = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo) => {
      // Skip if already connecting to avoid infinite loops
      if (isDestinationConnecting) {
        console.log("Already connecting destination, skipping");
        return;
      }

      setIsDestinationConnecting(true);

      let address = null;
      let isConnected = false;
      let needsWalletConnection = false;

      if (chain.chainType === ChainType.COSMOS) {
        // For Cosmos chains
        cosmosWallet.selectCosmosChain(chain as CosmosChainInfo);

        if (cosmosWallet.cosmosAccountAddress) {
          address = cosmosWallet.cosmosAccountAddress;
          isConnected = true;
        } else {
          needsWalletConnection = true;
        }
      } else if (
        chain.chainType === ChainType.ASTRIA ||
        chain.chainType === ChainType.EVM
      ) {
        if (chain.chainType === ChainType.EVM && evmWallet.evmAccountAddress) {
          address = evmWallet.evmAccountAddress;
          isConnected = true;
        } else {
          needsWalletConnection = true;
        }
      }

      setDestinationConnection((prev) => ({
        ...prev,
        chain,
        address,
        isConnected,
      }));

      // After setting state, initiate wallet connection if needed
      if (needsWalletConnection) {
        if (chain.chainType === ChainType.COSMOS) {
          cosmosWallet.connectCosmosWallet();
        } else {
          evmWallet.connectEvmWallet(chain);
        }
      }

      setIsDestinationConnecting(false);
    },
    [isDestinationConnecting, cosmosWallet, evmWallet],
  );

  // Update connections when wallet states change
  useEffect(() => {
    if (
      sourceConnection.chain?.chainType === ChainType.COSMOS &&
      cosmosWallet.cosmosAccountAddress
    ) {
      setSourceConnection((prev) => ({
        ...prev,
        address: cosmosWallet.cosmosAccountAddress,
        isConnected: true,
      }));
    }

    if (
      (sourceConnection.chain?.chainType === ChainType.EVM ||
        sourceConnection.chain?.chainType === ChainType.ASTRIA) &&
      evmWallet.evmAccountAddress
    ) {
      setSourceConnection((prev) => ({
        ...prev,
        address: evmWallet.evmAccountAddress,
        isConnected: true,
      }));
    }
  }, [
    cosmosWallet.cosmosAccountAddress,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmChain?.chainId,
    sourceConnection.chain,
  ]);

  useEffect(() => {
    if (
      destinationConnection.chain?.chainType === ChainType.COSMOS &&
      cosmosWallet.cosmosAccountAddress
    ) {
      setDestinationConnection((prev) => ({
        ...prev,
        address: cosmosWallet.cosmosAccountAddress,
        isConnected: true,
      }));
    }

    if (
      (destinationConnection.chain?.chainType === ChainType.EVM ||
        destinationConnection.chain?.chainType === ChainType.ASTRIA) &&
      evmWallet.evmAccountAddress
    ) {
      setDestinationConnection((prev) => ({
        ...prev,
        address: evmWallet.evmAccountAddress,
        isConnected: true,
      }));
    }
  }, [
    cosmosWallet.cosmosAccountAddress,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmChain?.chainId,
    destinationConnection.chain,
  ]);

  // Currency selection
  const setSourceCurrency = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setSourceConnection((prev) => ({
        ...prev,
        currency,
      }));
    },
    [],
  );

  const setDestinationCurrency = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setDestinationConnection((prev) => ({
        ...prev,
        currency,
      }));
    },
    [],
  );

  // Manual address mode
  const enableManualAddressMode = useCallback(() => {
    setIsManualAddressMode(true);
    // clear destination address
    setDestinationConnection((prev) => ({
      ...prev,
      address: null,
    }));
  }, []);

  const disableManualAddressMode = useCallback(() => {
    setIsManualAddressMode(false);
    setRecipientAddress("");
  }, []);

  // Validation
  const areConnectionsValid = useMemo(() => {
    if (isManualAddressMode) {
      return !!sourceConnection.address && !!recipientAddress;
    }
    return !!sourceConnection.address && !!destinationConnection.address;
  }, [
    isManualAddressMode,
    recipientAddress,
    sourceConnection.address,
    destinationConnection.address,
  ]);

  const areCurrenciesValid = useMemo(() => {
    if (!sourceConnection.currency || !destinationConnection.currency) {
      return false;
    }

    // For valid currencies, they should have matching symbols
    return (
      sourceConnection.currency.coinDenom ===
      destinationConnection.currency.coinDenom
    );
  }, [sourceConnection.currency, destinationConnection.currency]);

  return {
    sourceConnection,
    destinationConnection,
    connectSource,
    connectDestination,
    setSourceCurrency,
    setDestinationCurrency,
    recipientAddress,
    setRecipientAddress,
    isManualAddressMode,
    enableManualAddressMode,
    disableManualAddressMode,
    isSourceConnecting,
    isDestinationConnecting,
    areConnectionsValid,
    areCurrenciesValid,
    cosmosWallet,
    evmWallet,
  };
}
