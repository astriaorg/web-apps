import { Config } from "@wagmi/core";
import { type Address, Abi, encodeFunctionData } from "viem";
import {
  AstriaChain, EvmChainInfo,
  HexString,
  TokenInputState,
  tokenInputStateToTokenAmount,
} from "@repo/flame-types";
import { GenericContractService } from "../generic-contract-service";
import NON_FUNGIBLE_POSITION_MANAGER_ABI from "./non-fungible-position-manager-abi.json";
import { GetAllPoolPositionsResponse, PoolPositionResponse } from "pool/types";
import { needToReverseTokenOrder } from "../services.utils";

type PositionResponseTuple = [
  bigint, // nonce
  string, // operator
  Address, // tokenAddress0
  Address, // tokenAddress1
  bigint, // fee
  bigint, // tickLower
  bigint, // tickUpper
  bigint, // liquidity
  bigint, // feeGrowthInside0LastX128
  bigint, // feeGrowthInside1LastX128
  bigint, // tokensOwed0
  bigint, // tokensOwed1
];

export interface IncreaseLiquidityParams {
  chainId: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
  value: bigint;
}

export interface DecreaseLiquidityParams {
  chainId: number;
  liquidity: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
}

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
  gasLimit?: bigint;
}

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

export class NonfungiblePositionManagerService extends GenericContractService {
  /**
   * Creates a new NonfungiblePositionManagerService instance
   *
   * @param wagmiConfig - The wagmi configuration object
   * @param contractAddress - The address of the NonFungiblePositionManager contract
   */
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(
      wagmiConfig,
      contractAddress,
      NON_FUNGIBLE_POSITION_MANAGER_ABI as Abi,
    );
  }

  /**
   * Get the pool positions of a user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the token
   * @returns Object containing position data including liquidity, ticks, and fees
   */
  async positions(
    chainId: number,
    tokenId: string,
  ): Promise<PoolPositionResponse> {
    const positionsArray = await this.readContractMethod<PositionResponseTuple>(
      chainId,
      "positions",
      [tokenId],
    );

    const position: PoolPositionResponse = {
      nonce: positionsArray[0],
      operator: positionsArray[1],
      tokenAddress0: positionsArray[2],
      tokenAddress1: positionsArray[3],
      fee: Number(positionsArray[4]),
      tickLower: Number(positionsArray[5]),
      tickUpper: Number(positionsArray[6]),
      liquidity: positionsArray[7],
      feeGrowthInside0LastX128: positionsArray[8],
      feeGrowthInside1LastX128: positionsArray[9],
      tokensOwed0: positionsArray[10],
      tokensOwed1: positionsArray[11],
    };

    return position;
  }

  /**
   * Creates a new position in a Uniswap V3 pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @param token0 - The address of the first token in the pair
   * @param token1 - The address of the second token in the pair
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%)
   * @param tickLower - The lower tick boundary of the position
   * @param tickUpper - The upper tick boundary of the position
   * @param amount0Desired - The desired amount of token0 to deposit
   * @param amount1Desired - The desired amount of token1 to deposit
   * @param amount0Min - The minimum amount of token0 to deposit
   * @param amount1Min - The minimum amount of token1 to deposit
   * @param recipient - The address that will receive the NFT
   * @param deadline - The timestamp by which the transaction must be executed
   * @param value
   * @returns Object containing transaction hash if successful
   */
  async mint(
    chainId: number,
    token0: Address,
    token1: Address,
    fee: number,
    tickLower: number,
    tickUpper: number,
    amount0Desired: bigint,
    amount1Desired: bigint,
    amount0Min: bigint,
    amount1Min: bigint,
    recipient: Address,
    deadline: number,
    value: bigint,
  ): Promise<HexString> {
    return await this.writeContractMethod(
      chainId,
      "mint",
      [
        {
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
        },
      ],
      value,
    );
  }

  /**
   * Increases liquidity for an existing position.
   *
   * @param tokenId - The ID of the NFT position to increase liquidity in
   * @param chainId - The chain ID of the EVM chain
   * @param amount0Desired - The desired amount of token0 to add
   * @param amount1Desired - The desired amount of token1 to add
   * @param amount0Min - The minimum amount of token0 to add (slippage protection)
   * @param amount1Min - The minimum amount of token1 to add (slippage protection)
   * @param deadline - The timestamp by which the transaction must be executed
   * @param value - Optional value to send with the transaction (needed for native token operations)
   * @returns Object containing transaction hash if successful, and the additional liquidity amount
   */
  async increaseLiquidity(
    tokenId: string,
    {
      chainId,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      deadline,
      value,
    }: IncreaseLiquidityParams,
  ): Promise<HexString> {
    return await this.writeContractMethod(
      chainId,
      "increaseLiquidity",
      [
        {
          tokenId: BigInt(tokenId),
          amount0Desired,
          amount1Desired,
          amount0Min,
          amount1Min,
          deadline,
        },
      ],
      value,
    );
  }

  public static getIncreaseLiquidityParams(
    tokenInput0: TokenInputState,
    tokenInput1: TokenInputState,
    slippageTolerance: number,
    chain: AstriaChain,
  ): IncreaseLiquidityParams {
    const token0Address = tokenInput0.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput0.token?.erc20ContractAddress;
    const token1Address = tokenInput1.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput1.token?.erc20ContractAddress;

    if (!token0Address || !token1Address) {
      throw new Error("Token addresses are missing");
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
      throw new Error("Must have both tokens set");
    }

    let value = 0n;
    const nativeTokenInput = [tokenInput0, tokenInput1].find(
      (tInput) => tInput.token?.isNative,
    );
    if (nativeTokenInput) {
      value =
        tokenInputStateToTokenAmount(
          nativeTokenInput,
          chain.chainId,
        )?.amountAsBigInt() ?? 0n;
    }

    return {
      chainId: chain.chainId,
      amount0Desired: tokens[0].amountAsBigInt(),
      amount1Desired: tokens[1].amountAsBigInt(),
      amount0Min: tokens[0]
        .withSlippage(slippageTolerance, true)
        .amountAsBigInt(),
      amount1Min: tokens[1]
        .withSlippage(slippageTolerance, true)
        .amountAsBigInt(),
      deadline: Math.floor(Date.now() / 1000) + 10 * 60,
      value,
    };
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
      throw new Error("Token addresses are missing");
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
      throw new Error("Must have both tokens set");
    }

    return {
      chainId: chain.chainId,
      liquidity,
      amount0Min: tokens[0]
        .withSlippage(slippageTolerance, true)
        .amountAsBigInt(),
      amount1Min: tokens[1]
        .withSlippage(slippageTolerance, true)
        .amountAsBigInt(),
      deadline: Math.floor(Date.now() / 1000) + 10 * 60,
    };
  }

  /**
   * Collect fees and tokens from a position with support for wrapped native tokens and multicall operations.
   * This method handles both wrapped native token collection and non-native token collection scenarios.
   *
   * @param params - Parameters for the collect fees operation
   * @returns Transaction hash if successful
   */
  async collectFees(params: CollectFeesParams): Promise<HexString> {
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
      const collectCall = this.encodeCollectCall(
        tokenId,
        recipient,
        MAX_UINT128,
        MAX_UINT128,
      );
      collectCalls.push(collectCall);
    } else {
      // Collects wrappedNativeToken and other token values to contract so we can unwrap the values after
      const collectCall = this.encodeCollectCall(
        tokenId,
        this.contractAddress, // Collect to the contract itself
        MAX_UINT128,
        MAX_UINT128,
      );
      collectCalls.push(collectCall);

      // Unwraps wrappedNativeToken to nativeToken and sends it to the recipient
      const unwrapCall = this.encodeUnwrapWETHCall(1n, recipient);
      collectCalls.push(unwrapCall);

      // Sweeps non-native tokens to the recipient
      if (!isToken0Native) {
        const sweepToken0Call = this.encodeSweepTokenCall(
          position.tokenAddress0,
          0n,
          recipient,
        );
        collectCalls.push(sweepToken0Call);
      }

      // Sweeps non-native tokens to the recipient
      if (!isToken1Native) {
        const sweepToken1Call = this.encodeSweepTokenCall(
          position.tokenAddress1,
          0n,
          recipient,
        );
        collectCalls.push(sweepToken1Call);
      }
    }

    const gasLimit = await this.estimateMulticallGasLimit(
      chainId,
      collectCalls,
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
      throw new Error("Token input is null");
    }

    const token0Address = tokenInput0.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput0.token?.erc20ContractAddress;
    const token1Address = tokenInput1.token?.isNative
      ? chain.contracts.wrappedNativeToken.address
      : tokenInput1.token?.erc20ContractAddress;

    if (!token0Address || !token1Address) {
      throw new Error("Token addresses are missing");
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
      throw new Error("Must have both tokens set");
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
   * Get the number of NFTs owned by an address
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address to check the balance of
   * @returns The number of NFTs owned by the address as a bigint
   */
  async balanceOf(chainId: number, owner: Address): Promise<bigint> {
    return await this.readContractMethod<bigint>(chainId, "balanceOf", [owner]);
  }

  /**
   * Get the token ID at a given index of the owner's token list
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address of the NFT owner
   * @param index - The index in the owner's token list
   * @returns The token ID at the specified index
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
   * Get all NFT positions owned by an address
   *
   * @param chainId - The chain ID of the EVM chain
   * @param owner - The address to get positions for
   * @returns An array of position data for all NFTs owned by the address
   */
  async getAllPositions(
    chainId: number,
    owner: Address,
  ): Promise<GetAllPoolPositionsResponse[]> {
    const nftCount = await this.balanceOf(chainId, owner);
    const positions: GetAllPoolPositionsResponse[] = [];

    for (let i = 0; i < Number(nftCount); i++) {
      const tokenId = await this.tokenOfOwnerByIndex(chainId, owner, i);
      const position = await this.positions(chainId, tokenId.toString());
      positions.push({ ...position, tokenId: tokenId.toString() });
    }

    return positions;
  }

  /**
   * Encodes a decreaseLiquidity function call to be used in a multicall transaction.
   * @private
   */
  private encodeDecreaseLiquidityCall(
    tokenId: string,
    liquidity: bigint,
    amount0Min: bigint,
    amount1Min: bigint,
    deadline: number,
  ): HexString {
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
   * @private
   */
  private encodeCollectCall(
    tokenId: string,
    recipient: Address,
    amount0Max: bigint,
    amount1Max: bigint,
  ): HexString {
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
   * Encodes an unwrapWETH9 function call to be used in a multicall transaction.
   * This method is used to unwrap WETH (wrapped native token) back to the native token (e.g., TIA)
   * @private
   */
  private encodeUnwrapWETHCall(
    amountMinimum: bigint,
    recipient: Address,
  ): HexString {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "unwrapWETH9",
      args: [amountMinimum, recipient],
    });
  }

  /**
   * Encodes a sweepToken function call to be used in a multicall transaction.
   * This method sweeps all of the specified token from the contract to the recipient.
   * @private
   */
  private encodeSweepTokenCall(
    token: Address,
    amountMinimum: bigint,
    recipient: Address,
  ): HexString {
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
  async decreaseLiquidityAndCollect(
    params: DecreaseLiquidityAndCollectParams,
  ): Promise<HexString> {
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
    const decreaseCall = this.encodeDecreaseLiquidityCall(
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
      throw new Error("Token input is null");
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

/**
 * Factory function to create a new NonfungiblePositionManagerService instance
 *
 * @param wagmiConfig - The wagmi configuration object
 * @param contractAddress - The address of the NonFungiblePositionManager contract
 * @returns A new NonfungiblePositionManagerService instance
 */
export function createNonfungiblePositionManagerService(
  wagmiConfig: Config,
  contractAddress: Address,
): NonfungiblePositionManagerService {
  return new NonfungiblePositionManagerService(wagmiConfig, contractAddress);
}
