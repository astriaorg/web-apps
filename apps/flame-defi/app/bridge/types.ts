import { ChainType, GenericChain } from "@repo/flame-types";

export enum BRIDGE_TYPE {
  IBC = "ibc",
  INTENT = "intent",
}

export interface BridgeInfo {
  type: BRIDGE_TYPE;
  sourceChainType: ChainType;
  targetChainType: ChainType;
  isSupported: boolean;
}

export type BridgeMap = Record<string, BridgeInfo>;

/**
 * Map of supported bridge types between different chain types
 */
export const SUPPORTED_BRIDGES: Record<
  ChainType,
  Record<ChainType, BRIDGE_TYPE[]>
> = {
  cosmos: {
    // deposit to astria
    astria: [BRIDGE_TYPE.IBC],
    cosmos: [],
    coinbase: [],
  },
  astria: {
    astria: [],
    // withdraw to cosmos
    cosmos: [BRIDGE_TYPE.IBC],
    // TODO - withdraw to coinbase?
    coinbase: [],
  },
  coinbase: {
    // deposit to astria
    astria: [BRIDGE_TYPE.INTENT],
    cosmos: [],
    coinbase: [],
  },
};

/**
 * Gets the supported bridge types between two chains.
 */
export function getSupportedBridgeTypes(
  sourceChain: GenericChain,
  targetChain: GenericChain,
): BRIDGE_TYPE[] {
  return SUPPORTED_BRIDGES[sourceChain.chainType][targetChain.chainType];
}

/**
 * Checks if a specific bridge type is supported between two chains.
 */
export function isBridgeTypeSupported(
  sourceChain: GenericChain,
  targetChain: GenericChain,
  bridgeType: BRIDGE_TYPE,
): boolean {
  const supportedTypes = getSupportedBridgeTypes(sourceChain, targetChain);
  return supportedTypes.includes(bridgeType);
}

/**
 * Creates a unique bridge key for a source and target chain pairing.
 */
export function createBridgeKey(
  sourceChain: GenericChain,
  targetChain: GenericChain,
): string {
  return `${sourceChain.chainType}-${sourceChain.chainName}-to-${targetChain.chainType}-${targetChain.chainName}`;
}
