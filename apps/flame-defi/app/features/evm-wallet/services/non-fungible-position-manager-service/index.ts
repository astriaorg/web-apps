import { Config } from "@wagmi/core";
import {
  Abi,
  type Address,
  encodeFunctionData,
  type Hash,
  maxUint128,
} from "viem";

import {
  AstriaChain,
  type EvmCurrency,
  TokenInputState,
  tokenInputStateToTokenAmount,
} from "@repo/flame-types";
import { Position, PositionWithPositionId } from "pool/types";

import { GenericContractService } from "../generic-contract-service";
import {
  needToReverseTokenOrder,
  shouldReverseTokenOrder,
} from "../services.utils";
import NON_FUNGIBLE_POSITION_MANAGER_ABI from "./non-fungible-position-manager-abi.json";

export interface CreateAndInitializePoolIfNecessaryAndMintParams {
  chainId: number;
  token0: EvmCurrency;
  token1: EvmCurrency;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  recipient: Address;
  deadline: bigint;
  sqrtPriceX96: bigint | null;
}

export interface CreateAndInitializePoolIfNecessaryParams {
  token0: Address;
  token1: Address;
  fee: number;
  sqrtPriceX96: bigint;
}

export interface MintParams {
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  recipient: Address;
  deadline: bigint;
}

export interface IncreaseLiquidityParams {
  chainId: number;
  token0: EvmCurrency;
  token1: EvmCurrency;
  tokenId: string;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
}

/**
 * @deprecated
 */
export interface DecreaseLiquidityParams {
  chainId: number;
  liquidity: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
}

/**
 * @deprecated
 */
export interface DecreaseLiquidityAndCollectParams {
  chainId: number;
  tokenId: string;
  liquidity: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
  recipient: Address;
  isCollectAsWrappedNative: boolean;
  isCollectNonNativeTokens: boolean;
  isToken0Native: boolean;
  isToken1Native: boolean;
}

export interface DecreaseLiquidityAndCollectV2Params {
  chainId: number;
  tokenId: string;
  token0: EvmCurrency;
  token1: EvmCurrency;
  liquidity: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
  recipient: Address;
  position: Position;
  options: {
    isCollectAsWrappedNative: boolean;
  };
}

/**
 * @deprecated
 */
export interface CollectFeesParams {
  calls?: string[];
  chainId: number;
  tokenId: string;
  recipient: Address;
  isCollectAsWrappedNative: boolean;
  isCollectNonNativeTokens: boolean;
  isToken0Native: boolean;
  isToken1Native: boolean;
  gasLimit?: bigint;
}

export interface CollectFeesV2Params {
  chainId: number;
  tokenId: string;
  token0: EvmCurrency;
  token1: EvmCurrency;
  recipient: Address;
  position: Position;
  calls?: string[];
  options: {
    isCollectAsWrappedNative: boolean;
  };
}

export class NonfungiblePositionManagerService extends GenericContractService {
  constructor(config: Config, address: Address) {
    super(config, address, NON_FUNGIBLE_POSITION_MANAGER_ABI as Abi);
  }

  /**
   * Get position information for a given position NFT ID.
   */
  async positions(chainId: number, tokenId: string): Promise<Position> {
    const response = await this.readContractMethod<
      [
        bigint, // nonce
        string, // operator
        Address, // token0
        Address, // token1
        bigint, // fee
        bigint, // tickLower
        bigint, // tickUpper
        bigint, // liquidity
        bigint, // feeGrowthInside0LastX128
        bigint, // feeGrowthInside1LastX128
        bigint, // tokensOwed0
        bigint, // tokensOwed1
      ]
    >(chainId, "positions", [tokenId]);

    const position: Position = {
      nonce: response[0],
      operator: response[1],
      token0: response[2],
      token1: response[3],
      fee: Number(response[4]),
      tickLower: Number(response[5]),
      tickUpper: Number(response[6]),
      liquidity: response[7],
      feeGrowthInside0LastX128: response[8],
      feeGrowthInside1LastX128: response[9],
      tokensOwed0: response[10],
      tokensOwed1: response[11],
    };

    return position;
  }

  async createAndInitializePoolIfNecessary(
    chainId: number,
    params: CreateAndInitializePoolIfNecessaryParams,
    value?: bigint,
  ): Promise<Hash> {
    return await this.writeContractMethod(
      chainId,
      "createAndInitializePoolIfNecessary",
      [params],
      value,
    );
  }

  private encodeCreateAndInitializePoolIfNecessary = (
    token0: Address,
    token1: Address,
    fee: number,
    sqrtPriceX96: bigint,
  ): string => {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "createAndInitializePoolIfNecessary",
      args: [token0, token1, fee, sqrtPriceX96],
    });
  };

  async mint(chainId: number, params: MintParams, value?: bigint) {
    return await this.writeContractMethod(chainId, "mint", [params], value);
  }

  private encodeMint(params: MintParams) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "mint",
      args: [params],
    });
  }

  /**
   * Creates a new pool if necessary and mints a new position in a single transaction.
   */
  async createAndInitializePoolIfNecessaryAndMint({
    chainId,
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    recipient,
    deadline,
    sqrtPriceX96,
  }: CreateAndInitializePoolIfNecessaryAndMintParams): Promise<unknown> {
    const calls: string[] = [];

    const token0Address = token0.asToken().address as Address;
    const token1Address = token1.asToken().address as Address;

    let sortedToken0 = token0;
    let sortedToken1 = token1;
    let sortedToken0Address = token0Address;
    let sortedToken1Address = token1Address;
    let sortedAmount0Desired = amount0Desired;
    let sortedAmount1Desired = amount1Desired;
    let sortedAmount0Min = amount0Min;
    let sortedAmount1Min = amount1Min;

    if (shouldReverseTokenOrder({ tokenA: token0, tokenB: token1 })) {
      sortedToken0 = token1;
      sortedToken1 = token0;
      sortedToken0Address = token1Address;
      sortedToken1Address = token0Address;
      sortedAmount0Desired = amount1Desired;
      sortedAmount1Desired = amount0Desired;
      sortedAmount0Min = amount1Min;
      sortedAmount1Min = amount0Min;
    }

    let value: bigint = 0n;
    if (sortedToken0.isNative) {
      value = sortedAmount0Desired;
    }
    if (sortedToken1.isNative) {
      value = sortedAmount1Desired;
    }

    if (sqrtPriceX96) {
      const createPoolCall = this.encodeCreateAndInitializePoolIfNecessary(
        sortedToken0Address,
        sortedToken1Address,
        fee,
        sqrtPriceX96,
      );
      calls.push(createPoolCall);
    }

    const mintCall = this.encodeMint({
      token0: sortedToken0Address,
      token1: sortedToken1Address,
      fee,
      tickLower,
      tickUpper,
      amount0Desired: sortedAmount0Desired,
      amount1Desired: sortedAmount1Desired,
      amount0Min: sortedAmount0Min,
      amount1Min: sortedAmount1Min,
      recipient,
      deadline,
    });
    calls.push(mintCall);

    if (token0.isNative || token1.isNative) {
      // Pass 0 to unwrap all available WTIA to TIA with no minimum amount requirement.
      const unwrapCall = this.encodeUnwrapWETH9(0n, recipient);
      calls.push(unwrapCall);
    }

    const gasLimit = await this.estimateContractGasWithBuffer(
      chainId,
      calls,
      value,
    );

    return await this.writeContractMethod(
      chainId,
      "multicall",
      [calls],
      value,
      gasLimit,
    );
  }

  /**
   * Collect fees and tokens from a position with support for wrapped native tokens and multicall operations.
   *
   * This method handles both wrapped native token collection and non-native token collection scenarios.
   */
  async collectFeesV2({
    chainId,
    tokenId,
    token0,
    token1,
    position,
    recipient,
    options,
    calls = [],
  }: CollectFeesV2Params): Promise<Hash> {
    let sortedToken0 = token0;
    let sortedToken1 = token1;

    // Sorted tokens should match the order of tokens in the position.
    if (shouldReverseTokenOrder({ tokenA: token0, tokenB: token1 })) {
      sortedToken0 = token1;
      sortedToken1 = token0;
    }

    const isCollectNativeTokens =
      sortedToken0.isNative ||
      sortedToken1.isNative ||
      sortedToken0.isWrappedNative ||
      sortedToken1.isWrappedNative;

    if (options.isCollectAsWrappedNative || !isCollectNativeTokens) {
      // Collects the wrapped native token and other token values to recipient directly since unwrapping to native token is not needed.
      const collectCall = this.encodeCollect(
        tokenId,
        recipient,
        maxUint128,
        maxUint128,
      );

      calls.push(collectCall);
    } else {
      // Collects the wrapped native token and other token values to contract so we can unwrap the values after.
      const collectCall = this.encodeCollect(
        tokenId,
        this.address, // Collect to the contract itself.
        maxUint128,
        maxUint128,
      );

      calls.push(collectCall);

      // Unwraps the wrapped native token to native token and sends it to the recipient.
      const unwrapCall = this.encodeUnwrapWETH9(1n, recipient);
      calls.push(unwrapCall);

      // Sweeps non-native tokens to the recipient.
      if (!sortedToken0.isNative) {
        const sweepToken0Call = this.encodeSweepToken(
          position.token0,
          0n,
          recipient,
        );
        calls.push(sweepToken0Call);
      }

      if (!sortedToken1.isNative) {
        const sweepToken1Call = this.encodeSweepToken(
          position.token1,
          0n,
          recipient,
        );
        calls.push(sweepToken1Call);
      }
    }

    const gasLimit = await this.estimateContractGasWithBuffer(
      chainId,
      calls,
      0n,
    );

    return await this.writeContractMethod(
      chainId,
      "multicall",
      [calls],
      undefined,
      gasLimit,
    );
  }

  /**
   * Increases liquidity for an existing position.
   */
  async increaseLiquidity({
    chainId,
    token0,
    token1,
    tokenId,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    deadline,
  }: IncreaseLiquidityParams): Promise<Hash> {
    let sortedToken0 = token0;
    let sortedToken1 = token1;
    let sortedAmount0Desired = amount0Desired;
    let sortedAmount1Desired = amount1Desired;
    let sortedAmount0Min = amount0Min;
    let sortedAmount1Min = amount1Min;

    if (shouldReverseTokenOrder({ tokenA: token0, tokenB: token1 })) {
      sortedToken0 = token1;
      sortedToken1 = token0;
      sortedAmount0Desired = amount1Desired;
      sortedAmount1Desired = amount0Desired;
      sortedAmount0Min = amount1Min;
      sortedAmount1Min = amount0Min;
    }

    let value: bigint = 0n;
    if (sortedToken0.isNative) {
      value = sortedAmount0Desired;
    }
    if (sortedToken1.isNative) {
      value = sortedAmount1Desired;
    }

    return await this.writeContractMethod(
      chainId,
      "increaseLiquidity",
      [
        {
          tokenId: BigInt(tokenId),
          amount0Desired: sortedAmount0Desired,
          amount1Desired: sortedAmount1Desired,
          amount0Min: sortedAmount0Min,
          amount1Min: sortedAmount1Min,
          deadline,
        },
      ],
      value,
    );
  }

  public static getDecreaseLiquidityParams(
    liquidity: bigint,
    tokenInput0: TokenInputState,
    tokenInput1: TokenInputState,
    slippageTolerance: number,
    chain: AstriaChain,
  ): DecreaseLiquidityParams {
    const token0Address = tokenInput0.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput0.token?.erc20ContractAddress;
    const token1Address = tokenInput1.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput1.token?.erc20ContractAddress;

    if (!token0Address || !token1Address) {
      throw new Error("Token addresses are missing.");
    }

    const shouldReverseOrder = needToReverseTokenOrder(
      token0Address,
      token1Address,
    );

    let tokens = [
      tokenInputStateToTokenAmount(tokenInput0, chain.chainId),
      tokenInputStateToTokenAmount(tokenInput1, chain.chainId),
    ];
    if (shouldReverseOrder) {
      tokens = tokens.reverse();
    }

    if (!tokens[0] || !tokens[1]) {
      throw new Error("Must have both tokens set.");
    }

    return {
      chainId: chain.chainId,
      liquidity,
      amount0Min: tokens[0].withSlippage(slippageTolerance, true).toBigInt(),
      amount1Min: tokens[1].withSlippage(slippageTolerance, true).toBigInt(),
      deadline: Math.floor(Date.now() / 1000) + 10 * 60,
    };
  }

  /**
   * Collect fees and tokens from a position with support for wrapped native tokens and multicall operations.
   * This method handles both wrapped native token collection and non-native token collection scenarios.
   *
   * @param params - Parameters for the collect fees operation
   * @returns Transaction hash if successful
   *
   * @deprecated TODO: Remove this method and use collectFeesV2 instead.
   */
  async collectFees(params: CollectFeesParams): Promise<Hash> {
    const {
      calls,
      chainId,
      tokenId,
      recipient,
      isCollectAsWrappedNative,
      isCollectNonNativeTokens,
      isToken0Native,
      isToken1Native,
    } = params;

    const position = await this.positions(chainId, tokenId);
    const MAX_UINT128 = BigInt("0xffffffffffffffffffffffffffffffff");
    const collectCalls: string[] = calls ?? [];

    if (isCollectAsWrappedNative || isCollectNonNativeTokens) {
      // Collects wrappedNativeToken and other token values to recipient directly since unwrapping to native token is not needed
      const collectCall = this.encodeCollect(
        tokenId,
        recipient,
        MAX_UINT128,
        MAX_UINT128,
      );
      collectCalls.push(collectCall);
    } else {
      // Collects wrappedNativeToken and other token values to contract so we can unwrap the values after
      const collectCall = this.encodeCollect(
        tokenId,
        this.address, // Collect to the contract itself
        MAX_UINT128,
        MAX_UINT128,
      );
      collectCalls.push(collectCall);

      // Unwraps wrappedNativeToken to nativeToken and sends it to the recipient
      const unwrapCall = this.encodeUnwrapWETH9(1n, recipient);
      collectCalls.push(unwrapCall);

      // Sweeps non-native tokens to the recipient
      if (!isToken0Native) {
        const sweepToken0Call = this.encodeSweepToken(
          position.token0,
          0n,
          recipient,
        );
        collectCalls.push(sweepToken0Call);
      }

      // Sweeps non-native tokens to the recipient
      if (!isToken1Native) {
        const sweepToken1Call = this.encodeSweepToken(
          position.token1,
          0n,
          recipient,
        );
        collectCalls.push(sweepToken1Call);
      }
    }

    const gasLimit = await this.estimateContractGasWithBuffer(
      chainId,
      collectCalls,
      0n,
    );

    return await this.writeContractMethod(
      chainId,
      "multicall",
      [collectCalls],
      undefined,
      gasLimit,
    );
  }

  /**
   * Helper method to generate parameters for collecting fees from a position
   * Determines if native tokens are involved and sets the appropriate flags
   * to handle automatic unwrapping of wrapped native token to native token and proper token collection.
   *
   * @deprecated TODO: Remove this method and use collectFeesV2 instead.
   */
  public static getCollectFeesParams(
    chain: AstriaChain,
    tokenId: string,
    tokenInput0: TokenInputState,
    tokenInput1: TokenInputState,
    recipient: Address,
    isCollectAsWrappedNative: boolean = false,
  ): CollectFeesParams {
    if (!tokenInput0.token || !tokenInput1.token) {
      throw new Error("Token input is null.");
    }

    const token0Address = tokenInput0.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput0.token?.erc20ContractAddress;
    const token1Address = tokenInput1.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput1.token?.erc20ContractAddress;

    if (!token0Address || !token1Address) {
      throw new Error("Token addresses are missing.");
    }

    const shouldReverseOrder = needToReverseTokenOrder(
      token0Address,
      token1Address,
    );

    let tokens = [tokenInput0, tokenInput1];

    if (shouldReverseOrder) {
      tokens = tokens.reverse();
    }

    if (!tokens[0] || !tokens[1] || !tokens[0].token || !tokens[1].token) {
      throw new Error("Must have both tokens set.");
    }

    const isToken0Native = tokens[0].token.isNative;
    const isToken1Native = tokens[1].token.isNative;

    let isCollectNonNativeTokens = true;

    tokens.forEach((token) => {
      if (token.token?.isNative) {
        isCollectNonNativeTokens = false;
      } else if (token.token?.isWrappedNative) {
        isCollectNonNativeTokens = false;
      }
    });

    return {
      chainId: chain.chainId,
      tokenId,
      recipient,
      isCollectAsWrappedNative,
      isCollectNonNativeTokens,
      isToken0Native,
      isToken1Native,
    };
  }

  /**
   * Get the number of NFTs owned by an address.
   */
  async balanceOf(chainId: number, owner: Address): Promise<bigint> {
    return await this.readContractMethod<bigint>(chainId, "balanceOf", [owner]);
  }

  /**
   * Get the token ID at a given index of the owner's token list.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param owner - The address of the NFT owner.
   * @param index - The index in the owner's token list.
   * @returns The token ID at the specified index.
   */
  async tokenOfOwnerByIndex(
    chainId: number,
    owner: Address,
    index: number,
  ): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "tokenOfOwnerByIndex",
      [owner, index],
    );
  }

  /**
   * Get all NFT positions owned by an address.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param owner - The address to get positions for.
   * @returns An array of position data for all NFTs owned by the address.
   */
  async getPositions(
    chainId: number,
    owner: Address,
  ): Promise<PositionWithPositionId[]> {
    const nftCount = await this.balanceOf(chainId, owner);
    const positions: PositionWithPositionId[] = [];

    for (let i = 0; i < Number(nftCount); i++) {
      const key = await this.tokenOfOwnerByIndex(chainId, owner, i);
      const position = await this.positions(chainId, key.toString());
      positions.push({ ...position, positionId: key.toString() });
    }

    return positions;
  }

  /**
   * Encodes a `decreaseLiquidity` function call to be used in a multicall transaction.
   */
  private encodeDecreaseLiquidity(
    tokenId: string,
    liquidity: bigint,
    amount0Min: bigint,
    amount1Min: bigint,
    deadline: number,
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "decreaseLiquidity",
      args: [
        {
          tokenId: BigInt(tokenId),
          liquidity,
          amount0Min,
          amount1Min,
          deadline,
        },
      ],
    });
  }

  /**
   * Encodes a collect function call to be used in a multicall transaction.
   */
  private encodeCollect(
    tokenId: string,
    recipient: Address,
    amount0Max: bigint,
    amount1Max: bigint,
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "collect",
      args: [
        {
          tokenId: BigInt(tokenId),
          recipient,
          amount0Max,
          amount1Max,
        },
      ],
    });
  }

  /**
   * Encodes an `unwrapWETH9` function call to be used in a multicall transaction.
   * This method is used to unwrap WETH (wrapped native token) back to the native token (e.g., ETH).
   */
  private encodeUnwrapWETH9(amountMinimum: bigint, recipient: Address): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "unwrapWETH9",
      args: [amountMinimum, recipient],
    });
  }

  /**
   * Encodes a `sweepToken` function call to be used in a multicall transaction.
   * This method sweeps all of the specified token from the contract to the recipient.
   */
  private encodeSweepToken(
    token: Address,
    amountMinimum: bigint,
    recipient: Address,
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "sweepToken",
      args: [token, amountMinimum, recipient],
    });
  }

  /**
   * Performs a multicall that combines decreaseLiquidity, collect, unwrap, and sweep operations in a single transaction.
   * By default, it will collect all available fees and tokens released by decreaseLiquidity.
   *
   * @param params - Parameters for the multicall operation
   * @returns The transaction hash
   */
  async decreaseLiquidityAndCollectV2({
    chainId,
    tokenId,
    token0,
    token1,
    liquidity,
    amount0Min,
    amount1Min,
    deadline,
    recipient,
    position,
    options,
  }: DecreaseLiquidityAndCollectV2Params): Promise<Hash> {
    let sortedToken0 = token0;
    let sortedToken1 = token1;
    let sortedAmount0Min = amount0Min;
    let sortedAmount1Min = amount1Min;

    if (shouldReverseTokenOrder({ tokenA: token0, tokenB: token1 })) {
      sortedToken0 = token1;
      sortedToken1 = token0;
      sortedAmount0Min = amount1Min;
      sortedAmount1Min = amount0Min;
    }

    const calls: string[] = [];
    const decreaseCall = this.encodeDecreaseLiquidity(
      tokenId,
      liquidity,
      sortedAmount0Min,
      sortedAmount1Min,
      deadline,
    );

    calls.push(decreaseCall);

    return await this.collectFeesV2({
      chainId,
      tokenId,
      token0: sortedToken0,
      token1: sortedToken1,
      position,
      recipient,
      options,
      calls,
    });
  }

  /**
   * Performs a multicall that combines decreaseLiquidity, collect, unwrap, and sweep operations in a single transaction.
   * By default, it will collect all available fees and tokens released by decreaseLiquidity.
   *
   * @param params - Parameters for the multicall operation
   * @returns The transaction hash
   */
  async decreaseLiquidityAndCollect(
    params: DecreaseLiquidityAndCollectParams,
  ): Promise<Hash> {
    const {
      chainId,
      tokenId,
      liquidity,
      amount0Min,
      amount1Min,
      deadline,
      recipient,
      isCollectAsWrappedNative,
      isToken0Native,
      isToken1Native,
      isCollectNonNativeTokens,
    } = params;

    const calls: string[] = [];
    const decreaseCall = this.encodeDecreaseLiquidity(
      tokenId,
      liquidity,
      amount0Min,
      amount1Min,
      deadline,
    );

    calls.push(decreaseCall);

    return await this.collectFees({
      calls,
      chainId,
      tokenId,
      recipient,
      isCollectAsWrappedNative,
      isCollectNonNativeTokens,
      isToken0Native,
      isToken1Native,
    });
  }

  /**
   * Helper method to generate parameters for a decreaseLiquidityAndCollect operation
   * Combines decreaseLiquidityParams and collectFeesParams
   */
  public static getDecreaseLiquidityAndCollectParams(
    tokenId: string,
    liquidity: bigint,
    tokenInput0: TokenInputState,
    tokenInput1: TokenInputState,
    recipient: Address,
    slippageTolerance: number,
    chain: AstriaChain,
    isCollectAsWrappedNative: boolean = false,
  ): DecreaseLiquidityAndCollectParams {
    if (!tokenInput0.token || !tokenInput1.token) {
      throw new Error("Token input is null.");
    }

    const decreaseParams = this.getDecreaseLiquidityParams(
      liquidity,
      tokenInput0,
      tokenInput1,
      slippageTolerance,
      chain,
    );

    const collectFeesParams = this.getCollectFeesParams(
      chain,
      tokenId,
      tokenInput0,
      tokenInput1,
      recipient,
    );

    return {
      chainId: decreaseParams.chainId,
      tokenId,
      liquidity: decreaseParams.liquidity,
      amount0Min: decreaseParams.amount0Min,
      amount1Min: decreaseParams.amount1Min,
      deadline: decreaseParams.deadline,
      recipient,
      isCollectAsWrappedNative,
      isCollectNonNativeTokens: collectFeesParams.isCollectNonNativeTokens,
      isToken0Native: collectFeesParams.isToken0Native,
      isToken1Native: collectFeesParams.isToken1Native,
    };
  }
}

export function createNonfungiblePositionManagerService(
  config: Config,
  address: Address,
): NonfungiblePositionManagerService {
  return new NonfungiblePositionManagerService(config, address);
}
