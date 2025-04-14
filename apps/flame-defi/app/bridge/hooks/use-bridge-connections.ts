"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChainType, CosmosChainInfo, EvmChainInfo, EvmCurrency, IbcCurrency } from "@repo/flame-types";
import { BRIDGE_TYPE, getSupportedBridgeTypes } from "../types";
import { useAstriaWallet } from "features/evm-wallet/hooks/use-astria-wallet";
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

  // Bridge type
  bridgeType: BRIDGE_TYPE | null;

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
  astriaWallet: ReturnType<typeof useAstriaWallet>;
}

export function useBridgeConnections(): BridgeConnections {
  // Access all wallet contexts
  const astriaWallet = useAstriaWallet();
  const evmWallet = useEvmWallet();
  const cosmosWallet = useCosmosWallet();

  // Connection state
  const [sourceConnection, setSourceConnection] = useState<ChainConnection>({
    chain: null,
    currency: null,
    address: null,
    isConnected: false,
  });

  const [destinationConnection, setDestinationConnection] = useState<ChainConnection>({
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

  // Determine which bridge type is active based on source and destination chains
  const bridgeType = useMemo(() => {
    if (!sourceConnection.chain || !destinationConnection.chain) {
      return null;
    }

    const supportedTypes = getSupportedBridgeTypes(
      sourceConnection.chain,
      destinationConnection.chain,
    );

    if (supportedTypes.length > 0) {
      return supportedTypes[0] ?? null;
    }

    return null;
  }, [sourceConnection.chain, destinationConnection.chain]);

  // Handle source chain connection
  const connectSource = useCallback((chain: CosmosChainInfo | EvmChainInfo) => {
    console.log("connect source");
    setIsSourceConnecting(true);

    setSourceConnection(prev => ({
      ...prev,
      chain,
      address: null,
      isConnected: false,
    }));

    if (chain.chainType === ChainType.COSMOS) {
      // Connect Cosmos wallet
      cosmosWallet.selectCosmosChain(chain as CosmosChainInfo);

      if (!cosmosWallet.cosmosAccountAddress) {
        cosmosWallet.connectCosmosWallet();
      } else {
        setSourceConnection(prev => ({
          ...prev,
          address: cosmosWallet.cosmosAccountAddress,
          isConnected: true,
        }));
      }
    } else if (chain.chainType === ChainType.EVM || chain.chainType === ChainType.ASTRIA) {
      // Check if we can reuse the Astria wallet address for EVM connections
      if (astriaWallet.accountAddress) {
        setSourceConnection(prev => ({
          ...prev,
          address: astriaWallet.accountAddress,
          isConnected: true,
        }));
      }
      // If no Astria wallet connection, fall back to regular EVM wallet
      else if (evmWallet.evmAccountAddress &&
        evmWallet.selectedEvmChain?.chainId === chain.chainId) {
        setSourceConnection(prev => ({
          ...prev,
          address: evmWallet.evmAccountAddress,
          isConnected: true,
        }));
      } else {
        // No existing connections, connect to specific chain
        if (chain.chainType === ChainType.ASTRIA) {
          astriaWallet.connectWallet();
        } else {
          evmWallet.connectToSpecificChain(chain.chainId);
        }
      }
    }

    setIsSourceConnecting(false);
  }, [cosmosWallet, evmWallet, astriaWallet]);

  // Handle destination chain connection
  const connectDestination = useCallback((chain: CosmosChainInfo | EvmChainInfo) => {
    setIsDestinationConnecting(true);

    setDestinationConnection(prev => ({
      ...prev,
      chain,
      isConnected: false,
    }));

    if (chain.chainType === ChainType.COSMOS) {
      // For Cosmos chains
      cosmosWallet.selectCosmosChain(chain as CosmosChainInfo);

      if (!cosmosWallet.cosmosAccountAddress) {
        cosmosWallet.connectCosmosWallet();
      } else {
        setDestinationConnection(prev => ({
          ...prev,
          address: cosmosWallet.cosmosAccountAddress,
          isConnected: true,
        }));
      }
    } else if (chain.chainType === ChainType.ASTRIA || chain.chainType === ChainType.EVM) {
      // For Astria and EVM chains, prioritize Astria wallet if available
      if (astriaWallet.accountAddress) {
        setDestinationConnection(prev => ({
          ...prev,
          address: astriaWallet.accountAddress,
          isConnected: true,
        }));
      } 
      // For EVM chains, fall back to EVM wallet if Astria wallet not available
      else if (chain.chainType === ChainType.EVM && evmWallet.evmAccountAddress) {
        setDestinationConnection(prev => ({
          ...prev,
          address: evmWallet.evmAccountAddress,
          isConnected: true,
        }));
      }
      // No existing connection, connect appropriate wallet
      else {
        if (chain.chainType === ChainType.ASTRIA) {
          astriaWallet.connectWallet();
        } else {
          evmWallet.connectEvmWallet();
        }
      }
    }

    setIsDestinationConnecting(false);
  }, [astriaWallet, cosmosWallet, evmWallet]);

  // Update connections when wallet states change
  useEffect(() => {
    if (sourceConnection.chain?.chainType === ChainType.COSMOS &&
      cosmosWallet.cosmosAccountAddress) {
      setSourceConnection(prev => ({
        ...prev,
        address: cosmosWallet.cosmosAccountAddress,
        isConnected: true,
      }));
    }

    // For EVM and ASTRIA chains, prioritize Astria wallet if available
    if ((sourceConnection.chain?.chainType === ChainType.EVM || 
         sourceConnection.chain?.chainType === ChainType.ASTRIA) &&
        astriaWallet.accountAddress) {
      setSourceConnection(prev => ({
        ...prev,
        address: astriaWallet.accountAddress,
        isConnected: true,
      }));
    }
    // Fall back to regular EVM wallet if Astria wallet not available
    else if (sourceConnection.chain?.chainType === ChainType.EVM &&
      evmWallet.evmAccountAddress &&
      evmWallet.selectedEvmChain?.chainId === sourceConnection.chain.chainId) {
      setSourceConnection(prev => ({
        ...prev,
        address: evmWallet.evmAccountAddress,
        isConnected: true,
      }));
    }
  }, [
    cosmosWallet.cosmosAccountAddress,
    astriaWallet.accountAddress,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmChain?.chainId,
    sourceConnection.chain,
  ]);

  useEffect(() => {
    if (destinationConnection.chain?.chainType === ChainType.COSMOS &&
      cosmosWallet.cosmosAccountAddress) {
      setDestinationConnection(prev => ({
        ...prev,
        address: cosmosWallet.cosmosAccountAddress,
        isConnected: true,
      }));
    }

    // For EVM and ASTRIA chains, prioritize Astria wallet if available
    if ((destinationConnection.chain?.chainType === ChainType.EVM || 
         destinationConnection.chain?.chainType === ChainType.ASTRIA) &&
        astriaWallet.accountAddress) {
      setDestinationConnection(prev => ({
        ...prev,
        address: astriaWallet.accountAddress,
        isConnected: true,
      }));
    }
    // Fall back to regular EVM wallet if Astria wallet not available
    else if (destinationConnection.chain?.chainType === ChainType.EVM &&
      evmWallet.evmAccountAddress &&
      evmWallet.selectedEvmChain?.chainId === destinationConnection.chain.chainId) {
      setDestinationConnection(prev => ({
        ...prev,
        address: evmWallet.evmAccountAddress,
        isConnected: true,
      }));
    }
  }, [
    astriaWallet.accountAddress,
    cosmosWallet.cosmosAccountAddress,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmChain?.chainId,
    destinationConnection.chain,
  ]);

  // Currency selection
  const setSourceCurrency = useCallback((currency: EvmCurrency | IbcCurrency | null) => {
    setSourceConnection(prev => ({
      ...prev,
      currency,
    }));
  }, []);

  const setDestinationCurrency = useCallback((currency: EvmCurrency | IbcCurrency | null) => {
    setDestinationConnection(prev => ({
      ...prev,
      currency,
    }));
  }, []);

  // Manual address mode
  const enableManualAddressMode = useCallback(() => {
    setIsManualAddressMode(true);
    // Reset wallet states when switching to manual mode
    evmWallet.resetState();
  }, [evmWallet]);

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
    return sourceConnection.currency.coinDenom === destinationConnection.currency.coinDenom;
  }, [sourceConnection.currency, destinationConnection.currency]);

  return {
    sourceConnection,
    destinationConnection,
    connectSource,
    connectDestination,
    setSourceCurrency,
    setDestinationCurrency,
    bridgeType,
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
    astriaWallet,
  };
}