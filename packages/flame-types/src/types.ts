import type {
  Asset,
  AssetList,
  Chain as CosmosKitChain,
  DenomUnit,
} from "@chain-registry/types";
import type { Chain } from "@rainbow-me/rainbowkit";
import Big from "big.js";
import JSBI from "jsbi";
import React from "react";
import { type Address, ChainContract, parseUnits } from "viem";

/**
 * ChainType describes the type of chain.
 *
 * There are three types of chain. Astria, Cosmos, and Evm.
 * Plans to add a fourth, Solana.
 *
 * An Astria chain is technically an EVM chain, but it is useful
 * to have a mechanism to distinguish between Astria (fka Flame) and
 * other EVM based chains (Arbitrum, Base, Optimism).
 */
export enum ChainType {
  ASTRIA = "astria",
  COSMOS = "cosmos",
  EVM = "evm",
}

/**
 * GenericChain is the base chain type that other chain types extend
 */
export interface GenericChain {
  // the type of the chain
  chainType: ChainType;
  // the name of the chain
  chainName: string;
  // a component to be displayed with the chain
  IconComponent?: React.FC;
}

/**
 * IconProps passed to Icon component for styling
 */
export interface IconProps {
  className?: string;
  size?: number;
}

export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

export interface BIP44 {
  readonly coinType: number;
}

/**
 * Represents information about a Cosmos chain.
 */
export interface CosmosChainInfo extends GenericChain {
  readonly chainType: ChainType.COSMOS;
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency?: BaseCurrency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config?: Bech32Config;

  readonly currencies: IbcCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: CosmosFeeCurrency[];
}

/**
 * Returns the chain name from the chain ID.
 * e.g. "noble" from "noble-1"
 */
export function cosmosChainNameFromId(chainId: string) {
  // FIXME - the || "" is just a stop gap to get things to build while im refactoring to nextjs app
  return chainId.split("-")[0] || "";
}

/**
 * Converts an CosmosChainInfo object to a CosmosChain object for use with CosmosKit.
 */
function cosmosChainInfoToCosmosKitChain(
  chain: CosmosChainInfo,
): CosmosKitChain {
  return {
    // TODO - add more fields from CosmosChain?
    ...chain,
    chain_name: cosmosChainNameFromId(chain.chainId),
    // fees: {
    // TODO - fee_tokens
    //   fee_tokens: chain.feeCurrencies,
    // },
    // staking: {
    // TODO - staking_tokens
    //   staking_tokens: [chain.stakeCurrency]
    // },
    pretty_name: chain.chainName,
    chain_id: chain.chainId,
    chain_type: "cosmos",
    bech32_prefix: chain.bech32Config?.bech32PrefixAccAddr,
    bech32_config: chain.bech32Config,
    apis: {
      rpc: [
        {
          address: chain.rpc,
        },
      ],
      rest: [
        {
          address: chain.rest,
        },
      ],
    },
  };
}

/**
 * Converts a map of IBC chains to an array of CosmosChain objects for use with CosmosKit.
 */
export function cosmosChainInfosToCosmosKitChains(
  cosmosChains: CosmosChainInfo[],
): [CosmosKitChain, ...CosmosKitChain[]] {
  if (cosmosChains.length === 0) {
    throw new Error("At least one chain must be provided.");
  }
  return cosmosChains.map((cosmosChain) =>
    cosmosChainInfoToCosmosKitChain(cosmosChain),
  ) as [CosmosKitChain, ...CosmosKitChain[]];
}

// CosmosChains type maps labels to CosmosChainInfo objects
export type CosmosChains = {
  [label: string]: CosmosChainInfo;
};

// Adds gas price step to a type
// FIXME - this doesn't implement everything needed for FeeToken
export type WithGasPriceStep<T> = T & {
  readonly gasPriceStep?: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
};

/**
 * Minimal description of a currency.
 */
export interface BaseCurrency {
  /** Symbol of the token */
  readonly coinDenom: string;
  /** Minimal denomination of the token */
  readonly coinMinimalDenom: string;
  /** Number of decimal places the token uses */
  readonly coinDecimals: number;

  /** Used to fetch asset's fiat value from coingecko */
  readonly coinGeckoId?: string;
  /** URL for the coin's image */
  readonly coinImageUrl?: string;
}

/**
 * Describes a generic currency for use in the Astria app
 */
export interface GenericCurrency extends BaseCurrency {
  /** Display name of the token */
  readonly title: string;
  /** Chain id of the chain the currency belongs to */
  readonly chainId: string | number;
  /** True if this is the native token (e.g., TIA) */
  readonly isNative: boolean;
  /** True if this token should be shown in bridge page dropdowns */
  readonly isBridgeable: boolean;
  /** Component to render the token's icon */
  readonly IconComponent?: React.FC<IconProps>;
}

// Represents information about a currency used for fees.
export type CosmosFeeCurrency = WithGasPriceStep<BaseCurrency>;

/**
 * Represents information about a currency that uses IBC.
 */
export class IbcCurrency implements GenericCurrency {
  public readonly title: string;
  public readonly chainId: string;
  public readonly isNative: boolean;
  public readonly isBridgeable: boolean;
  public readonly IconComponent?: React.FC<IconProps>;
  public readonly coinGeckoId?: string;
  public readonly coinImageUrl?: string;
  public readonly coinDenom: string;
  public readonly coinMinimalDenom: string;
  public readonly coinDecimals: number;

  /** The IBC channel used to send this currency */
  public readonly ibcChannel?: string;

  /** The sequencer bridge account used to bridge this currency to the EVM */
  public readonly sequencerBridgeAccount?: string;

  constructor(params: {
    title: string;
    chainId: string;
    isNative: boolean;
    isBridgeable: boolean;
    IconComponent?: React.FC<IconProps>;
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    coinGeckoId?: string;
    coinImageUrl?: string;
    ibcChannel?: string;
    sequencerBridgeAccount?: string;
  }) {
    this.title = params.title;
    this.chainId = params.chainId;
    this.coinDenom = params.coinDenom;
    this.coinMinimalDenom = params.coinMinimalDenom;
    this.coinDecimals = params.coinDecimals;
    this.isNative = params.isNative;
    this.isBridgeable = params.isBridgeable;
    this.coinGeckoId = params.coinGeckoId;
    this.coinImageUrl = params.coinImageUrl;
    this.ibcChannel = params.ibcChannel;
    this.sequencerBridgeAccount = params.sequencerBridgeAccount;
    this.IconComponent = params.IconComponent;
  }

  /**
   * Converts this IbcCurrency to an Asset object for use with CosmosKit.
   *
   * @returns An Asset object compatible with CosmosKit
   */
  public toCosmosKitAsset(): Asset {
    // Create denomination units - one for the base denom and one for the display denom
    const denomUnits: DenomUnit[] = [
      {
        denom: this.coinMinimalDenom,
        exponent: 0,
      },
      {
        denom: this.coinDenom,
        exponent: this.coinDecimals,
      },
    ];

    // sdk.coin for native assets, ics20 for IBC tokens
    const typeAsset = this.isNative ? "sdk.coin" : "ics20";
    const asset: Asset = {
      denom_units: denomUnits,
      type_asset: typeAsset,
      base: this.coinMinimalDenom,
      name: this.coinDenom,
      display: this.title,
      symbol: this.coinDenom,
    };

    // Add IBC info if channel exists
    if (this.ibcChannel) {
      asset.ibc = {
        source_channel: this.ibcChannel,
        dst_channel: "", // TODO
        source_denom: this.coinMinimalDenom,
      };
    }

    return asset;
  }
}

/**
 * Converts a map of cosmos chains to an array of AssetList objects for use with CosmosKit.
 */
export function cosmosChainInfosToCosmosKitAssetLists(
  cosmosChains: CosmosChainInfo[],
): AssetList[] {
  return cosmosChains.map((chain) => {
    return ibcCurrenciesToCosmosKitAssetList(
      cosmosChainNameFromId(chain.chainId),
      chain.currencies,
    );
  });
}

/**
 * Converts a list of IBC currencies to an AssetList object for use with CosmosKit.
 */
export function ibcCurrenciesToCosmosKitAssetList(
  chainName: string,
  currencies: IbcCurrency[],
): AssetList {
  return {
    chain_name: chainName,
    assets: currencies.map((currency) => {
      return currency.toCosmosKitAsset();
    }),
  };
}

/**
 * Represents a currency on an EVM chain, which can be either a native token or an ERC-20 token.
 */
export class EvmCurrency implements GenericCurrency {
  public readonly title: string;
  public readonly chainId: number;
  public readonly isNative: boolean;
  public readonly isBridgeable: boolean;
  public readonly IconComponent?: React.FC<IconProps>;
  public readonly coinDenom: string;
  public readonly coinMinimalDenom: string;
  public readonly coinDecimals: number;

  /** Fee required for IBC withdrawal, in wei (18 decimals) */
  public readonly ibcWithdrawalFeeWei?: string;

  /** ERC-20 contract address if this is a token, undefined for native currencies */
  public readonly erc20ContractAddress?: Address;

  /** Contract address for native token withdrawer, undefined for ERC-20 tokens */
  public readonly nativeTokenWithdrawerContractAddress?: Address;

  /** Contract address for intent bridge **/
  public readonly astriaIntentBridgeAddress?: Address;

  /** True if this is a wrapped native token (e.g., wTIA) */
  public readonly isWrappedNative: boolean;

  constructor(params: {
    title: string;
    chainId: number;
    isNative: boolean;
    isBridgeable: boolean;
    IconComponent?: React.FC<IconProps>;
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    ibcWithdrawalFeeWei?: string;
    erc20ContractAddress?: Address;
    nativeTokenWithdrawerContractAddress?: Address;
    astriaIntentBridgeAddress?: Address;
    isWrappedNative: boolean;
  }) {
    this.title = params.title;
    this.chainId = params.chainId;
    this.coinDenom = params.coinDenom;
    this.coinMinimalDenom = params.coinMinimalDenom;
    this.coinDecimals = params.coinDecimals;
    this.ibcWithdrawalFeeWei = params.ibcWithdrawalFeeWei;
    this.erc20ContractAddress = params.erc20ContractAddress;
    this.nativeTokenWithdrawerContractAddress =
      params.nativeTokenWithdrawerContractAddress;
    this.astriaIntentBridgeAddress = params.astriaIntentBridgeAddress;
    this.isWrappedNative = params.isWrappedNative;
    this.isNative = params.isNative;
    this.isBridgeable = params.isBridgeable;
    this.IconComponent = params.IconComponent;
  }

  /**
   * Checks if this currency is equal to another currency.
   *
   * Two currencies are considered equal if they have the same coin denom and either:
   * - Both are native currencies
   * - Both are ERC-20 tokens with the same contract address
   *
   * @param other The other currency to compare with
   * @returns true if the currencies are equal, false otherwise
   */
  public equals(other?: EvmCurrency | null): boolean {
    if (!other) {
      return false;
    }

    // compare basic properties
    if (this.coinDenom !== other.coinDenom) {
      return false;
    }

    // for ERC-20 tokens, compare contract addresses
    if (this.erc20ContractAddress && other.erc20ContractAddress) {
      return (
        this.erc20ContractAddress.toLowerCase() ===
        other.erc20ContractAddress.toLowerCase()
      );
    }

    // for native tokens, compare by coinMinimalDenom
    if (this.isNative && other.isNative) {
      return this.coinMinimalDenom === other.coinMinimalDenom;
    }

    // if one is native and the other is an ERC-20 token, they are not equal
    return false;
  }
}

/**
 * Represents information about an EVM compatible chain.
 */
export interface EvmChainInfo extends GenericChain {
  readonly chainId: number;
  readonly rpcUrls: string[];
  readonly blockExplorerUrl?: string;
  readonly contracts: {
    [label: string]: ChainContract;
  };
  readonly currencies: [EvmCurrency, ...EvmCurrency[]];
}

/**
 * Represents an Astria (fka Flame) chain. This is just an evm
 * chain with specific contracts guaranteed to be defined.
 */
export interface AstriaChain extends EvmChainInfo {
  contracts: {
    [label: string]: ChainContract;
    wrappedNativeToken: ChainContract;
    swapRouter: ChainContract;
    nonfungiblePositionManager: ChainContract;
    poolFactory: ChainContract;
    poolContract: ChainContract;
    multicall3: ChainContract;
  };
}

// CoinbaseChains type maps labels to CoinbaseChain objects
export type CoinbaseChains = {
  [label: string]: EvmChainInfo;
};

/**
 * Converts an EvmChainInfo object to a Chain object for use with RainbowKit.
 * @param evmChain
 */
export function evmChainToRainbowKitChain(evmChain: EvmChainInfo): Chain {
  const nativeCurrency = evmChain.currencies.find(
    (currency) => currency.isNative,
  );
  if (!nativeCurrency) {
    throw new Error("EVM chain must define native currency.");
  }
  const chain: Chain = {
    id: evmChain.chainId,
    name: evmChain.chainName,
    rpcUrls: {
      default: { http: evmChain.rpcUrls },
    },
    nativeCurrency: {
      name: nativeCurrency.title,
      symbol: nativeCurrency.coinDenom,
      decimals: nativeCurrency.coinDecimals,
    },
  };

  if (evmChain.contracts) {
    chain.contracts = evmChain.contracts;
  }

  if (evmChain.blockExplorerUrl) {
    chain.blockExplorers = {
      default: {
        name: evmChain.chainName,
        url: evmChain.blockExplorerUrl,
      },
    };
  }

  return chain;
}

/**
 * Converts a map of EVM chains to an array of Chain objects for use with RainbowKit.
 * @param evmChains
 */
export function evmChainsToRainbowKitChains(
  evmChains: EvmChainInfo[],
): readonly [Chain, ...Chain[]] {
  if (evmChains.length === 0) {
    throw new Error("At least one chain must be provided");
  }
  return evmChains.map((evmChain) => evmChainToRainbowKitChain(evmChain)) as [
    Chain,
    ...Chain[],
  ];
}

// Map of environment labels to their chain configurations
// AstriaChains type maps labels to AstriaChain objects
export type AstriaChains = {
  [label: string]: AstriaChain;
};

// TODO - consolidate with `TokenAmount` type
export interface TokenInputState {
  token?: EvmCurrency;
  value: string;
  isQuoteValue?: boolean;
}

/**
 * Converts a TokenInputState to a TokenAmount
 * @param state The TokenInputState to convert
 * @param chainId
 * @returns A TokenAmount instance, or null if the token is not set
 */
export function tokenInputStateToTokenAmount(
  state: TokenInputState,
  chainId: number,
): TokenAmount | null {
  // Return null if token is not set
  if (!state.token) {
    return null;
  }

  // Return zero amount if value is empty
  if (!state.value || state.value === "") {
    const token = new Token(
      chainId,
      state.token.erc20ContractAddress || "0x0", // Use contract address or placeholder
      state.token.coinDecimals,
      state.token.coinDenom,
    );
    return new TokenAmount(token, "0");
  }

  // Create Token object
  const token = new Token(
    chainId,
    state.token.erc20ContractAddress || "0x0", // Use contract address or placeholder
    state.token.coinDecimals,
    state.token.coinDenom,
  );

  // Create TokenAmount from human-readable value
  return TokenAmount.fromReadable(token, state.value);
}

/**
 * Converts a TokenInputState to a Big number in its raw blockchain representation (with scaled decimals)
 * For example, if token.value is "1.5" and token decimals is 18, this returns 1.5 × 10^18
 */
export const tokenStateToBig = (token: TokenInputState): Big => {
  if (!token.value || !token.token) return new Big(0);
  const decimals = token.token.coinDecimals;
  // Convert the human-readable value to raw blockchain units by multiplying by 10^decimals
  return new Big(token.value).mul(new Big(10).pow(decimals));
};

export enum ChainId {
  MAINNET = 253368190,
  FLAME_DEVNET = 912559,
  FLAME_TESTNET = 16604737732183,
}

export interface GetQuoteParams {
  // no cross chain swaps yet, so we only need to specify one chain right now,
  // which will be one of the Flame networks
  chainId: ChainId;
  tokenInAddress: string;
  tokenInDecimals: number;
  tokenInSymbol: string;
  tokenOutAddress: string;
  tokenOutDecimals: number;
  tokenOutSymbol: string;
  amount: string;
  type: "exactIn" | "exactOut";
}

export interface GetQuoteResult {
  quoteId?: string;
  blockNumber: string;
  amount: string;
  amountDecimals: string;
  gasPriceWei: string;
  gasUseEstimate: string;
  gasUseEstimateQuote: string;
  gasUseEstimateQuoteDecimals: string;
  gasUseEstimateUSD: string;
  methodParameters?: { calldata: string; value: string };
  quote: string;
  quoteDecimals: string;
  quoteGasAdjusted: string;
  quoteGasAdjustedDecimals: string;
  route: Array<V3PoolInRoute[]>;
  routeString: string;
}

export class Token {
  readonly chainId: number;
  readonly address: string;
  readonly decimals: number;
  readonly symbol: string;

  constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
  ) {
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
  }

  equals(other: Token): boolean {
    return (
      this.chainId === other.chainId &&
      this.address.toLowerCase() === other.address.toLowerCase()
    );
  }
}

// 100% in basis points
const BASIS_POINTS_DIVISOR = JSBI.BigInt(10000);

/**
 * Converts a slippage tolerance percentage to basis points.
 * Ensures that the slippage tolerance is less than 99.99% and has no more than 2 decimal points of precision.
 * @param slippageTolerancePercent
 */
function convertSlippageToBasisPoints(slippageTolerancePercent: number): JSBI {
  if (parseFloat(slippageTolerancePercent.toString()) > 99.99) {
    throw new Error("Slippage tolerance must be less than 99.99 or less.");
  }
  const parts = slippageTolerancePercent.toString().split(".");
  if (parts[1]?.length !== undefined && parts[1].length > 2) {
    throw new Error(
      "Slippage tolerance must not have more than 2 decimal points of precision.",
    );
  }
  return JSBI.BigInt(slippageTolerancePercent * 100);
}

/**
 * Represents an ERC-20 token allowance granted to a spender.
 * Contains the token symbol and the approved amount as a string.
 */
export interface TokenAllowance {
  /** The symbol of the token (e.g., "USDC", "TIA") */
  symbol: string;
  /** The allowance amount as a string */
  value: string;
}

/**
 * A token amount represents an amount of a token.
 * TODO - consolidate this type with `TokenState` type
 */
export class TokenAmount {
  readonly token: Token;
  readonly raw: JSBI;
  readonly decimalScale: JSBI;

  constructor(token: Token, amount: string | JSBI) {
    this.token = token;
    this.decimalScale = JSBI.exponentiate(
      JSBI.BigInt(10),
      JSBI.BigInt(token.decimals),
    );
    this.raw = typeof amount === "string" ? JSBI.BigInt(amount) : amount;
  }

  amountAsBigInt(): bigint {
    return BigInt(this.raw.toString());
  }

  /**
   * Converts a human-readable amount string to a TokenAmount
   * @param token The token
   * @param humanReadableAmount The amount as a human-readable string (e.g. "1.5")
   * @returns A new TokenAmount instance
   */
  static fromReadable(token: Token, humanReadableAmount: string): TokenAmount {
    // Use parseUnits from viem to handle decimals correctly
    const parsedAmount = parseUnits(humanReadableAmount, token.decimals);
    return new TokenAmount(token, parsedAmount.toString());
  }

  withSlippage(
    slippageTolerancePercent: number,
    isMinimum: boolean,
  ): TokenAmount {
    // convert % -> basis points
    const slippageBasisPoints = convertSlippageToBasisPoints(
      slippageTolerancePercent,
    );

    // adjust basis points based on if we want minimum or maximum
    let adjustedBasisPoints: JSBI;
    if (isMinimum) {
      adjustedBasisPoints = JSBI.subtract(
        BASIS_POINTS_DIVISOR,
        slippageBasisPoints,
      );
    } else {
      adjustedBasisPoints = JSBI.add(BASIS_POINTS_DIVISOR, slippageBasisPoints);
    }

    // scale result back down
    const adjustedAmount = JSBI.divide(
      JSBI.multiply(this.raw, adjustedBasisPoints),
      BASIS_POINTS_DIVISOR,
    );

    return new TokenAmount(this.token, adjustedAmount);
  }

  /**
   * Creates a TokenAmount from individual token parameters
   * @param chainId The chain ID the token exists on
   * @param tokenAddress The token contract address
   * @param decimals The token decimals
   * @param symbol The token symbol
   * @param humanReadableAmount The token amount as a string or JSBI
   * @returns A new TokenAmount instance
   */
  static fromArgs(
    chainId: number,
    tokenAddress: Address,
    decimals: number,
    symbol: string,
    humanReadableAmount: string,
  ): TokenAmount {
    const token = new Token(chainId, tokenAddress, decimals, symbol);
    return TokenAmount.fromReadable(token, humanReadableAmount);
  }
}

export type V3PoolInRoute = {
  type: "v3-pool";
  tokenIn: Token;
  tokenOut: Token;
  sqrtRatioX96: string;
  liquidity: string;
  tickCurrent: string;
  fee: string;
  amountIn?: string;
  amountOut?: string;

  // not used in the interface
  address?: string;
};

export enum FlameNetwork {
  LOCAL = "local",
  DUSK = "dusk",
  DAWN = "dawn",
  MAINNET = "mainnet",
}

export enum TRADE_TYPE {
  EXACT_IN = "exactIn",
  EXACT_OUT = "exactOut",
}

export const TRADE_TYPE_OPPOSITES: Record<TRADE_TYPE, TRADE_TYPE> = {
  [TRADE_TYPE.EXACT_IN]: TRADE_TYPE.EXACT_OUT,
  [TRADE_TYPE.EXACT_OUT]: TRADE_TYPE.EXACT_IN,
};

/**
 * @deprecated
 * Use `TransactionStatus` instead.
 */
export enum TXN_STATUS {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export type TxnFailedProps = {
  txnMsg?: string;
};

export type Balance = {
  value: string;
  symbol: string;
};

export enum TransactionStatus {
  IDLE = "Idle",
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILED = "Failed",
}

export enum ApproveStatus {
  PENDING = "Pending",
  REQUIRED = "Required",
  SUCCESS = "Success",
  FAILED = "Failed",
}
