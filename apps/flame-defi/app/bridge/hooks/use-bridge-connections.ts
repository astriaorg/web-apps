"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";

import {
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { useEvmWallet } from "features/evm-wallet/hooks/use-evm-wallet";
import { useCosmosWallet } from "features/cosmos-wallet/hooks/use-cosmos-wallet";

import { ChainConnection } from "bridge/types";

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

  // Status
  isSourceConnecting: boolean;
  isDestinationConnecting: boolean;

  // Validation
  areConnectionsValid: boolean;
  areCurrenciesValid: boolean;
}

export function useBridgeConnections(): BridgeConnections {
  const evmWallet = useEvmWallet();
  const cosmosWallet = useCosmosWallet();
  const connectedEvmChainId = useChainId();

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

      // don't do anything if they select the same chain
      if (sourceConnection.chain === chain) {
        console.log("selecting same chain");
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
        // NOTE - always trigger reconnect here even if we have an evmAccountAddress,
        //  because triggering connect will ensure the chain is switched correctly
        needsWalletConnection = true;
      }

      // Always update the chain selection first
      setSourceConnection((prev) => ({
        ...prev,
        chain,
        address,
        isConnected,
      }));
      // set destination address manually when source is evm type
      if (chain?.chainType === ChainType.EVM) {
        console.log("setting destination address, clearing destination chain");
        setDestinationConnection((prev) => ({
          ...prev,
          address: evmWallet.evmAccountAddress,
          isConnected: false,
        }));
      }
      // if they select astria as source and destination is an evm chain, keep the address
      // but disconnect the wallet
      if (
        chain?.chainType === ChainType.ASTRIA &&
        destinationConnection.chain?.chainType === ChainType.EVM
      ) {
        console.log("set destination connection false");
        setDestinationConnection((prev) => ({
          ...prev,
          address: evmWallet.evmAccountAddress,
          isConnected: false,
        }));
      }

      // After setting state, initiate wallet connection if needed
      if (needsWalletConnection) {
        if (chain.chainType === ChainType.COSMOS) {
          cosmosWallet.connectCosmosWallet();
        } else {
          console.log("connect to specific chain");
          evmWallet.connectToSpecificChain(chain.chainId);
        }
      }

      setIsSourceConnecting(false);
    },
    [
      isSourceConnecting,
      sourceConnection.chain,
      destinationConnection.chain?.chainType,
      cosmosWallet,
      evmWallet,
    ],
  );

  // Handle destination chain connection
  const connectDestination = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo) => {
      // Skip if already connecting to avoid infinite loops
      if (isDestinationConnecting) {
        console.log("Already connecting destination, skipping");
        return;
      }

      // don't do anything if they select the same chain
      if (destinationConnection.chain === chain) {
        return;
      }

      setIsDestinationConnecting(true);

      let address = null;
      let isConnected = false;
      let needsWalletConnection = false;

      if (chain.chainType === ChainType.COSMOS) {
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
        // NOTE - always trigger reconnect here even if we have an evmAccountAddress,
        //  because triggering connect will ensure the chain is switched correctly
        needsWalletConnection = true;
      }

      // set isConnected false if chains are a combo of evm and astria types.
      // we still want to keep the address though
      if (
        (sourceConnection.chain?.chainType === ChainType.EVM &&
          chain?.chainType === ChainType.ASTRIA) ||
        (sourceConnection.chain?.chainType === ChainType.ASTRIA &&
          chain?.chainType === ChainType.EVM)
      ) {
        console.log("set dest conn false");
        setDestinationConnection((prev) => ({
          ...prev,
          chain,
          address: evmWallet.evmAccountAddress,
          isConnected: false,
        }));
        // don't trigger wallet connection if chains are combo of astria/evm
        needsWalletConnection = false;
      } else {
        setDestinationConnection((prev) => ({
          ...prev,
          chain,
          address: evmWallet.evmAccountAddress,
          isConnected,
        }));
      }

      // After setting state, initiate wallet connection if needed
      if (needsWalletConnection) {
        if (chain.chainType === ChainType.COSMOS) {
          cosmosWallet.connectCosmosWallet();
        } else {
          evmWallet.connectToSpecificChain(chain.chainId);
        }
      }

      setIsDestinationConnecting(false);
    },
    [
      isDestinationConnecting,
      destinationConnection.chain,
      sourceConnection.chain?.chainType,
      cosmosWallet,
      evmWallet,
    ],
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
      console.log("setting source from useEffect");
      setSourceConnection((prev) => ({
        ...prev,
        address: evmWallet.evmAccountAddress,
        isConnected: true,
      }));
    }
  }, [
    cosmosWallet.cosmosAccountAddress,
    evmWallet.evmAccountAddress,
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
      // TODO - only set if destinationConnection.chain.chainId == chainId from useChainId?
      if (destinationConnection.chain?.chainId === connectedEvmChainId) {
        console.log(
          "setting destination from useEffect",
          destinationConnection.chain,
        );
        setDestinationConnection((prev) => ({
          ...prev,
          address: evmWallet.evmAccountAddress,
          isConnected: true,
        }));
      }
    }
  }, [cosmosWallet.cosmosAccountAddress, evmWallet.evmAccountAddress, destinationConnection.chain, connectedEvmChainId]);

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

  // Validation
  const areConnectionsValid = useMemo(() => {
    return (
      Boolean(sourceConnection.address) &&
      Boolean(destinationConnection.address)
    );
  }, [sourceConnection.address, destinationConnection.address]);

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
    isSourceConnecting,
    isDestinationConnecting,
    areConnectionsValid,
    areCurrenciesValid,
  };
}
