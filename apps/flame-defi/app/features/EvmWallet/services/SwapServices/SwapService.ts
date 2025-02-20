import JSBI from "jsbi";
import { Chain, encodeFunctionData, PublicClient, WalletClient } from "viem";
import { GetQuoteResult, Token, TokenAmount, TRADE_TYPE } from "@repo/flame-types";
import SWAP_ROUTER_ABI from "./contracts/swaprouter02.json";
import {
  ExactInputParams,
  ExactInputSingleParams,
  ExactOutputParams,
  ExactOutputSingleParams,
  Pool,
  Route,
  SwapOptions,
  Trade,
} from "./types";

// 100% in basis points
const BASIS_POINTS_DIVISOR = JSBI.BigInt(10000);

/**
 * Converts a slippage tolerance percentage to basis points.
 * Ensures that the slippage tolerance is less than 99.99% and has no more than 2 decimal points of precision.
 * @param slippageTolerancePercent
 */
function convertSlippageToBasisPoints(slippageTolerancePercent: number): JSBI {
  if (parseFloat(slippageTolerancePercent.toString()) > 99.99) {
    throw new Error("Slippage tolerance must be less than 99.99 or less");
  }
  const parts = slippageTolerancePercent.toString().split(".");
  if (parts[1]?.length !== undefined && parts[1].length > 2) {
    throw new Error(
      "Slippage tolerance must not have more than 2 decimal points of precision.",
    );
  }
  return JSBI.BigInt(slippageTolerancePercent * 100);
}

export class SwapRouter {
  private readonly routerAddress: `0x${string}`;
  private readonly chainConfig: Chain;
  private readonly routerAbi: Array<{
    name: string;
    type: string;
    inputs: Array<{
      name: string;
      type: string;
      components?: Array<{ name: string; type: string }>;
    }>;
    outputs: Array<{ name: string; type: string }>;
    stateMutability: string;
  }>;

  constructor(routerAddress: string, chainConfig: Chain) {
    this.routerAddress = routerAddress as `0x${string}`;
    this.chainConfig = chainConfig;
    // minimal ABI for the swap functions.
    this.routerAbi = SWAP_ROUTER_ABI;
  }

  /**
   * Calculates the minimum amount out based on the slippage tolerance.
   * @param amount
   * @param slippageTolerancePercent
   * @private
   */
  private calculateMinimumOut(
    amount: TokenAmount,
    slippageTolerancePercent: number,
  ): JSBI {
    return this.calculateSlippage(
      amount.raw,
      slippageTolerancePercent,
      true,
    );
  }

  /**
   * Calculates the maximum amount in based on the slippage tolerance.
   * @param amount
   * @param slippageTolerancePercent
   * @private
   */
  private calculateMaximumIn(
    amount: TokenAmount,
    slippageTolerancePercent: number,
  ): JSBI {
    return this.calculateSlippage(
      amount.raw,
      slippageTolerancePercent,
      false,
    );
  }

  /**
   * Calculates the slippage based on the amount and tolerance.
   * @param amount
   * @param slippageTolerancePercent
   * @param isMinimum
   * @private
   */
  private calculateSlippage(
    amount: JSBI,
    slippageTolerancePercent: number,
    isMinimum: boolean,
  ): JSBI {
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
    return JSBI.divide(
      JSBI.multiply(amount, adjustedBasisPoints),
      BASIS_POINTS_DIVISOR,
    );
  }

  private getExactInputParams(
    trade: Trade,
    recipient: `0x${string}`,
    slippageTolerance: number,
    deadline: bigint,
    isNativeOut: boolean,
  ): {
    functionName: "exactInputSingle" | "exactInput";
    args: readonly [ExactInputSingleParams] | readonly [ExactInputParams];
  } {
    const isMultiHop = trade.route.pools.length > 1;

    if (isMultiHop) {
      return {
        functionName: "exactInput",
        args: [
          {
            path: this.encodePath(trade.route),
            recipient: isNativeOut ? this.routerAddress : recipient,
            amountIn: BigInt(trade.inputAmount.raw.toString()),
            amountOutMinimum: BigInt(
              this.calculateMinimumOut(
                trade.outputAmount,
                slippageTolerance,
              ).toString(),
            ),
            deadline,
          },
        ],
      };
    }

    const tokenIn = trade.route.path[0]?.address as `0x${string}`;
    const tokenOut = trade.route.path[1]?.address as `0x${string}`;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool");
    }

    return {
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient: isNativeOut ? this.routerAddress : recipient,
          amountIn: BigInt(trade.inputAmount.raw.toString()),
          amountOutMinimum: BigInt(
            this.calculateMinimumOut(
              trade.outputAmount,
              slippageTolerance,
            ).toString(),
          ),
          sqrtPriceLimitX96: 0n,
          deadline,
        },
      ],
    };
  }

  private getExactOutputParams(
    trade: Trade,
    recipient: `0x${string}`,
    slippageTolerance: number,
    deadline: bigint,
    isNativeOut: boolean,
  ): {
    functionName: "exactOutputSingle" | "exactOutput";
    args: readonly [ExactOutputSingleParams] | readonly [ExactOutputParams];
  } {
    const isMultiHop = trade.route.pools.length > 1;

    if (isMultiHop) {
      return {
        functionName: "exactOutput",
        args: [
          {
            path: this.encodePathReversed(trade.route),
            recipient: isNativeOut ? this.routerAddress : recipient,
            amountOut: BigInt(trade.outputAmount.raw.toString()),
            amountInMaximum: BigInt(
              this.calculateMaximumIn(
                trade.inputAmount,
                slippageTolerance,
              ).toString(),
            ),
            deadline,
          },
        ],
      };
    }

    const tokenIn = trade.route.path[0]?.address as `0x${string}`;
    const tokenOut = trade.route.path[1]?.address as `0x${string}`;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool");
    }

    return {
      functionName: "exactOutputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient: isNativeOut ? this.routerAddress : recipient,
          amountOut: BigInt(trade.outputAmount.raw.toString()),
          amountInMaximum: BigInt(
            this.calculateMaximumIn(
              trade.inputAmount,
              slippageTolerance,
            ).toString(),
          ),
          sqrtPriceLimitX96: 0n,
          deadline,
        },
      ],
    };
  }

  private encodePath(route: Route): `0x${string}` {
    const encoded = route.pools
      .map((pool, i) => {
        const tokenIn = route.path[i];
        const tokenOut = route.path[i + 1];
        const fee = pool.fee.toString(16).padStart(6, "0");

        if (i === route.pools.length - 1) {
          return `${tokenIn?.address.toLowerCase().slice(2)}${fee}${tokenOut?.address.toLowerCase().slice(2)}`;
        }
        return `${tokenIn?.address.toLowerCase().slice(2)}${fee}`;
      })
      .join("");

    return `0x${encoded}`;
  }

  private encodePathReversed(route: Route): `0x${string}` {
    const encoded = [...route.pools]
      .reverse()
      .map((pool, i, reversedPools) => {
        const pathLength = route.path.length;
        const tokenIn = route.path[pathLength - 1 - i];
        const tokenOut = route.path[pathLength - 2 - i];
        const fee = pool.fee.toString(16).padStart(6, "0");

        if (i === reversedPools.length - 1) {
          return `${tokenIn?.address.toLowerCase().slice(2)}${fee}${tokenOut?.address.toLowerCase().slice(2)}`;
        }
        return `${tokenIn?.address.toLowerCase().slice(2)}${fee}`;
      })
      .join("");

    return `0x${encoded}`;
  }

  /**
   * Executes a swap using the connected wallet (via viem).
   *
   * @param trade - The trade details.
   * @param options - Swap options such as recipient, slippage, and deadline.
   * @param walletClient - The connected wallet client (from wagmi/viem).
   * @param publicClient - The public client for reading blockchain data.
   * @returns The transaction hash if successful.
   */
  async executeSwap(
    trade: Trade,
    options: SwapOptions,
    walletClient: WalletClient,
    publicClient: PublicClient,
  ): Promise<`0x${string}` | undefined> {
    // A default gas limit in case estimation fails.
    const DEFAULT_GAS_LIMIT = 250000n;
    const signerAddress = walletClient?.account?.address as `0x${string}`;

    // get swap parameters based on trade type
    const swapParams =
      trade.type === TRADE_TYPE.EXACT_IN
        ? this.getExactInputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            options.isNativeOut,
          )
        : this.getExactOutputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            options.isNativeOut,
          );

    // for simple erc20 token swaps
    // FIXME - isNativeOut is incorrectly false when we want to get TIA out
    if (!options.isNativeIn && !options.isNativeOut) {
      let gasLimit: bigint;
      try {
        gasLimit = await publicClient.estimateContractGas({
          address: this.routerAddress,
          abi: this.routerAbi,
          functionName: swapParams.functionName,
          args: swapParams.args,
          account: signerAddress,
          value: BigInt(0),
        });
      } catch (err) {
        console.error("Gas estimation failed, using default limit", err);
        gasLimit = DEFAULT_GAS_LIMIT;
      }
      // FIXME - is this necessary?
      // Increase the estimated gas by 20%
      gasLimit = (gasLimit * 120n) / 100n;

      // Send the transaction via the connected wallet's writeContract method.
      return await walletClient.writeContract({
        address: this.routerAddress,
        abi: this.routerAbi,
        functionName: swapParams.functionName,
        args: swapParams.args,
        // NOTE - we don't need to send any TIA when we're doing an ERC20 swap
        value: BigInt(0),
        gas: gasLimit,
        chain: this.chainConfig,
        account: signerAddress,
      });
    }

    const calls: string[] = [];
    let value = 0n;

    if (options.isNativeIn) {
      // if isNativeIn then we need to send TIA to the contract, so set the value accordingly
      // NOTE - we don't need to explicitly wrap ETH, the router's callback will do it for us
      value = BigInt(trade.inputAmount.raw.toString());
    }

    // add swap
    calls.push(this.encodeSwapCall(swapParams.functionName, swapParams.args));

    // add unwrapWETH if needed
    if (options.isNativeOut) {
      const minimumAmount = this.calculateSlippage(
        trade.type === TRADE_TYPE.EXACT_IN
          ? trade.outputAmount.raw
          : trade.inputAmount.raw,
        options.slippageTolerance,
        true,
      ).toString();

      calls.push(this.encodeUnwrapWETHCall(minimumAmount));
    }

    return await walletClient.writeContract({
      address: this.routerAddress,
      abi: this.routerAbi,
      functionName: "multicall",
      args: [calls],
      value,
      // gas: DEFAULT_GAS_LIMIT,
      chain: this.chainConfig,
      account: signerAddress,
    });
  }

  private encodeUnwrapWETHCall(minimumAmount: string): string {
    return encodeFunctionData({
      abi: this.routerAbi,
      functionName: "unwrapWETH9",
      args: [BigInt(minimumAmount)],
    });
  }

  private encodeSwapCall(
    functionName:
      | "exactInputSingle"
      | "exactInput"
      | "exactOutputSingle"
      | "exactOutput",
    args:
      | readonly [ExactInputSingleParams]
      | readonly [ExactInputParams]
      | readonly [ExactOutputSingleParams]
      | readonly [ExactOutputParams],
  ): `0x${string}` {
    return encodeFunctionData({
      abi: this.routerAbi,
      functionName,
      args,
    });
  }
}

/**
 * Creates a Trade from a GetQuoteResult
 * @param quoteResult
 * @param type
 */
export function createTradeFromQuote(
  quoteResult: GetQuoteResult,
  type: "exactIn" | "exactOut",
): Trade {
  // Convert the first route from the quote.
  // TODO - find best route
  const routePools: Pool[] = (quoteResult.route[0] || []).map((poolRoute) => {
    return {
      token0: new Token(
        poolRoute.tokenIn.chainId,
        poolRoute.tokenIn.address,
        poolRoute.tokenIn.decimals,
        poolRoute.tokenIn.symbol,
      ),
      token1: new Token(
        poolRoute.tokenOut.chainId,
        poolRoute.tokenOut.address,
        poolRoute.tokenOut.decimals,
        poolRoute.tokenOut.symbol,
      ),
      fee: parseInt(poolRoute.fee),
      sqrtRatioX96: poolRoute.sqrtRatioX96,
      liquidity: poolRoute.liquidity,
      tickCurrent: parseInt(poolRoute.tickCurrent),
    };
  });

  // Determine input and output tokens from the route.
  const inputToken = routePools[0]?.token0;
  const outputToken = routePools[routePools.length - 1]?.token1;

  if (!inputToken || !outputToken) {
    throw new Error("Invalid route: missing input or output token");
  }

  const route = new Route(routePools, inputToken, outputToken);

  if (type === "exactIn") {
    const inputAmount = new TokenAmount(inputToken, quoteResult.amount);
    const outputAmount = new TokenAmount(outputToken, quoteResult.quote);

    return new Trade(route, inputAmount, outputAmount, TRADE_TYPE.EXACT_IN);
  } else {
    const inputAmount = new TokenAmount(inputToken, quoteResult.quote);
    const outputAmount = new TokenAmount(outputToken, quoteResult.amount);

    return new Trade(route, inputAmount, outputAmount, TRADE_TYPE.EXACT_OUT);
  }
}
